import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import Fastify from 'fastify';
import {documentAuthorityFixture} from '../workspace/document-authority-fixture.mjs';
import {WorkspaceDocumentStore} from '../../services/workspace/src/documents/store.ts';
import {DocumentOrchestrator} from '../../services/workspace/src/documents/orchestration.ts';
import {registerDocumentHttp} from '../../services/workspace/src/documents/http.ts';
import {ProjectRWGuard} from '../../services/workspace/src/policy/guard.ts';
import {SESSION_COOKIE} from '../../services/workspace/src/session/http.ts';

test('SP06 P08 Workspace creation orchestration and same-key recovery', {timeout: 180000}, async t => {
  const f = await documentAuthorityFixture();
  const {db, ids: [owner, author, other], tokens, project, projects, operator} = f;
  t.after(() => f.close());

  // Setup roles
  await projects.add(tokens[0], project, {user_id: author, role: 'developer'}, randomUUID());
  await operator.project(author, project, 'knowledge-author', true, '0', 'p08-test', 'grant author');

  const docsStore = new WorkspaceDocumentStore(db.runtime, f.sessions, f.cursorKey);
  const guard = new ProjectRWGuard();

  // Mock Knowledge Transport
  const knowledgeData = new Map();
  let failKnowledge = false;

  const mockTransport = {
    async persist(actorId, payload, key, correlationId) {
      if (failKnowledge) {
        throw new Error('Synthetic Knowledge failure');
      }
      const existing = knowledgeData.get(key);
      if (existing) {
        if (existing.payload.content !== payload.content) {
          const err = new Error('conflict');
          err.status = 409;
          throw err;
        }
        return existing.result;
      }
      const result = {
        document_id: payload.document_id,
        project_id: payload.project_id,
        title: payload.title,
        kind: payload.kind ?? 'document',
        owner_id: payload.owner_id,
        labels: payload.labels ?? [],
        current_version_id: randomUUID(),
        revision: 1,
      };
      knowledgeData.set(key, {payload, result});
      return result;
    },
    async get(documentId) {
      for (const entry of knowledgeData.values()) {
        if (entry.result.document_id === documentId) {
          return {document: entry.result, content: entry.payload.content};
        }
      }
      return null;
    },
  };

  const orchestrator = new DocumentOrchestrator(docsStore, mockTransport, guard);

  const app = Fastify();
  await registerDocumentHttp(app, {
    docs: docsStore,
    orchestrator,
    origin: 'https://localhost',
  });
  await app.ready();
  t.after(() => app.close());

  const headers = (token = tokens[1]) => ({
    cookie: `${SESSION_COOKIE}=${token}`,
    origin: 'https://localhost',
    'x-sacw-request': '1',
  });

  let createdDocId;

  await t.test('createDocument orchestrates policy and content creation', async () => {
    const key = 'key-p08-create-1';
    const payload = {
      title: 'Sprint Planning Doc',
      classification: 'restricted',
      content: '# Sprint Goals\n\n1. Complete SP-06.\n2. Verify all gates.',
    };

    const res = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents`,
      headers: {
        ...headers(),
        'idempotency-key': key,
      },
      payload,
    });

    assert.equal(res.statusCode, 201);
    const body = res.json();
    assert(body.document_id);
    assert.equal(body.title, 'Sprint Planning Doc');
    assert.equal(body.classification, 'restricted');
    assert.equal(body.content_owner_id, author);
    assert.equal(body.revision, 1);
    assert(body.current_version_id);
    createdDocId = body.document_id;

    // Verify DB policy was registered in Workspace
    const policy = (
      await db.admin.query('SELECT * FROM workspace.document_policy WHERE document_id = $1', [createdDocId])
    ).rows[0];
    assert.equal(policy.classification, 'restricted');
    assert.equal(policy.registry_state, 'active');

    // Replay with same key and payload returns 200 with same identity
    const replayRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents`,
      headers: {
        ...headers(),
        'idempotency-key': key,
      },
      payload,
    });
    assert.equal(replayRes.statusCode, 200);
    const replayBody = replayRes.json();
    assert.equal(replayBody.document_id, createdDocId);
    assert.equal(replayBody.title, 'Sprint Planning Doc');

    // Replay with different payload conflicts (409)
    const conflictRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents`,
      headers: {
        ...headers(),
        'idempotency-key': key,
      },
      payload: {...payload, title: 'Changed Title'},
    });
    assert.equal(conflictRes.statusCode, 409);
  });

  await t.test('recovery when Knowledge fails on first attempt: same-key retry succeeds without duplicate ID', async () => {
    const key = 'key-p08-recovery-1';
    const payload = {
      title: 'Resilient Doc',
      classification: 'project_shared',
      content: 'Important content that survives partial outage.',
    };

    // Inject failure into Knowledge
    failKnowledge = true;

    const failRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents`,
      headers: {
        ...headers(),
        'idempotency-key': key,
      },
      payload,
    });
    assert.equal(failRes.statusCode, 503);

    // Workspace policy was registered
    const idempotencyRecord = (
      await db.admin.query(
        "SELECT result_ref FROM workspace.idempotency_record WHERE idempotency_key = $1",
        [key]
      )
    ).rows[0];
    assert(idempotencyRecord);
    const allocatedId = idempotencyRecord.result_ref;

    // Knowledge recovers
    failKnowledge = false;

    // Retry with SAME idempotency key and same payload
    const retryRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents`,
      headers: {
        ...headers(),
        'idempotency-key': key,
      },
      payload,
    });
    assert.equal(retryRes.statusCode, 200);
    const retryBody = retryRes.json();
    // It must reuse the allocatedId without generating a new document_id!
    assert.equal(retryBody.document_id, allocatedId);
    assert.equal(retryBody.title, 'Resilient Doc');
    assert.equal(retryBody.classification, 'project_shared');
  });

  await t.test('unauthorized actor cannot create document', async () => {
    // Add 'other' as member without knowledge-author
    await projects.add(tokens[0], project, {user_id: other, role: 'developer'}, randomUUID());

    const res = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents`,
      headers: {
        ...headers(tokens[2]), // token for 'other' who does not have knowledge-author
        'idempotency-key': 'key-p08-unauth',
      },
      payload: {
        title: 'Unauthorized Doc',
        classification: 'project_shared',
        content: 'Content',
      },
    });
    assert.equal(res.statusCode, 403);
  });
});
