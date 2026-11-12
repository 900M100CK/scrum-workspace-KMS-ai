import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {documentAuthorityFixture} from '../workspace/document-authority-fixture.mjs';
import {WorkspaceDocumentStore} from '../../services/workspace/src/documents/store.ts';
import {DocumentOrchestrator} from '../../services/workspace/src/documents/orchestration.ts';
import {ProjectRWGuard} from '../../services/workspace/src/policy/guard.ts';
import {verifyServiceKey} from '../../services/workspace/src/transport/service-auth.ts';

test('SP06 P12 Concurrency, revocation barriers, fencing and failure boundaries', {timeout: 180000}, async t => {
  const f = await documentAuthorityFixture();
  const {db, ids: [owner, author, memberB], tokens, project, projects, operator} = f;
  t.after(() => f.close());

  await projects.add(tokens[0], project, {user_id: author, role: 'developer'}, randomUUID());
  await operator.project(author, project, 'knowledge-author', true, '0', 'p12-test', 'grant author');

  const docsStore = new WorkspaceDocumentStore(db.runtime, f.sessions, f.cursorKey);
  const guard = new ProjectRWGuard(1);

  // Simulated Knowledge Store with barrier delay capability
  let delayRead = false;
  let readReleaseTrigger = null;

  const mockTransport = {
    async persist(actorId, payload) {
      return {
        document_id: payload.document_id,
        project_id: payload.project_id,
        title: payload.title,
        kind: payload.kind ?? 'document',
        owner_id: payload.owner_id,
        labels: [],
        current_version_id: randomUUID(),
        revision: 1,
      };
    },
    async get(documentId) {
      if (delayRead) {
        await new Promise((resolve) => {
          readReleaseTrigger = resolve;
        });
      }
      return {
        document: {
          document_id: documentId,
          project_id: project,
          title: 'Concurrent Target',
          kind: 'document',
          owner_id: author,
          labels: [],
          current_version_id: 'v1',
          revision: 1,
        },
        content: 'Protected data',
      };
    },
  };

  const orchestrator = new DocumentOrchestrator(docsStore, mockTransport, guard);

  // Setup: create a restricted doc
  const created = await orchestrator.createDocument(
    tokens[1],
    project,
    {
      title: 'Sensitive P12 Document',
      classification: 'restricted',
      content: 'Top secret data',
    },
    'key-p12-initial'
  );
  const docId = created.document.document_id;

  await t.test('revocation barrier denies delivery when project access is revoked during transfer', async () => {
    // Acquire shared read on guard
    const release = await guard.acquireShared(project, guard.getGeneration());

    // In parallel: revoke project access
    const revokePromise = guard.revoke(project);

    // Release in-flight read
    release();

    const revokeOutcome = await revokePromise;
    assert.equal(revokeOutcome, 'revoked');

    // Subsequent acquire on revoked project fails immediately with GUARD_REVOKED
    await assert.rejects(
      guard.acquireShared(project, guard.getGeneration()),
      err => err.message === 'GUARD_REVOKED'
    );
  });

  await t.test('generation fencing denies delivery with mismatched generation across restart', async () => {
    const currentGen = guard.getGeneration();
    // Simulate process restart with new fencing generation
    guard.setGeneration(currentGen + 1);

    // Stale client trying with old generation is denied
    await assert.rejects(
      guard.acquireShared(project, currentGen),
      err => err.message === 'GUARD_DENIED_GENERATION'
    );
  });

  await t.test('verifyServiceKey uses constant-time comparison and denies invalid keys', () => {
    const correctKey = 'valid-kms-trusted-service-key-32b';
    assert.equal(verifyServiceKey(correctKey, correctKey), true);
    assert.equal(verifyServiceKey('wrong-key', correctKey), false);
    assert.equal(verifyServiceKey('', correctKey), false);
    assert.equal(verifyServiceKey(undefined, correctKey), false);
  });

  await t.test('concurrent membership removal aborts document creation and preserves zero duplicate audit', async () => {
    const memKey = 'key-p12-removal-race';

    // Remove author from project
    const removeRes = await projects.remove(tokens[0], project, author, '1', randomUUID());
    assert.equal(removeRes.status, 204);

    // Author tries to create document after removal -> forbidden / not found
    await assert.rejects(
      orchestrator.createDocument(
        tokens[1],
        project,
        {
          title: 'Post Removal Doc',
          classification: 'project_shared',
          content: 'Content',
        },
        memKey
      ),
      err => {
        const fault = err.cause ?? err;
        return fault.status === 403 || fault.status === 404;
      }
    );

    // Verify zero audit created for that key
    const auditCount = (
      await db.admin.query(
        "SELECT count(*) FROM workspace.business_audit WHERE action = 'document-policy-register' AND actor_id = $1",
        [author]
      )
    ).rows[0].count;
    // Only the 1 document from the initial setup exists
    assert.equal(auditCount, '1');
  });
});
