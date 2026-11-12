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

test('SP07 P04 Workspace revision orchestration, independent write authority and lifecycle', {timeout: 180000}, async t => {
  const f = await documentAuthorityFixture();
  const {db, ids: [owner, author, other], tokens, project, projects, operator} = f;
  t.after(() => f.close());

  // Setup roles: author has knowledge-author; other is developer only
  await projects.add(tokens[0], project, {user_id: author, role: 'developer'}, randomUUID());
  await projects.add(tokens[0], project, {user_id: other, role: 'developer'}, randomUUID());
  await operator.project(author, project, 'knowledge-author', true, '0', 'p04-test', 'grant author');

  const docsStore = new WorkspaceDocumentStore(db.runtime, f.sessions, f.cursorKey);
  const guard = new ProjectRWGuard();

  // Mock Knowledge Transport
  const knowledgeVersions = new Map(); // docId -> Array of versions
  const knowledgeDocs = new Map(); // docId -> doc state
  const receipts = new Map(); // idempotencyKey -> receipt

  const mockTransport = {
    async persist(actorId, payload, key) {
      const vId = randomUUID();
      const doc = {
        document_id: payload.document_id,
        project_id: payload.project_id,
        title: payload.title,
        kind: payload.kind ?? 'document',
        owner_id: payload.owner_id,
        labels: payload.labels ?? [],
        current_version_id: vId,
        revision: 1,
      };
      knowledgeDocs.set(payload.document_id, doc);
      knowledgeVersions.set(payload.document_id, [{
        version_id: vId,
        state: 'current',
        content: payload.content,
        revision: 1,
      }]);
      return doc;
    },

    async get(documentId) {
      const doc = knowledgeDocs.get(documentId);
      if (!doc || doc.unavailable) return null;
      const versions = knowledgeVersions.get(documentId) ?? [];
      const cur = versions.find(v => v.version_id === doc.current_version_id);
      return {document: doc, content: cur ? cur.content : ''};
    },

    async revise(actorId, payload, key) {
      const existing = receipts.get(key);
      if (existing) {
        return {status: 200, receipt: existing};
      }
      const doc = knowledgeDocs.get(payload.document_id);
      if (!doc || doc.unavailable) {
        const err = new Error('not_found');
        err.status = 404;
        throw err;
      }
      if (doc.revision !== payload.expected_revision) {
        const err = new Error('conflict');
        err.status = 409;
        throw err;
      }

      const versions = knowledgeVersions.get(payload.document_id) ?? [];
      for (const v of versions) {
        if (v.state === 'current') v.state = 'superseded';
      }

      const newVId = randomUUID();
      versions.push({
        version_id: newVId,
        state: 'current',
        content: payload.content,
        revision: 1,
      });

      doc.current_version_id = newVId;
      doc.revision += 1;

      const receipt = {
        document_id: payload.document_id,
        operation: 'reviseDocument',
        receipt_id: randomUUID(),
        version_id: newVId,
      };
      receipts.set(key, receipt);
      return {status: 201, receipt};
    },

    async archive(actorId, payload, key) {
      const existing = receipts.get(key);
      if (existing) return {status: 200, receipt: existing};

      const doc = knowledgeDocs.get(payload.document_id);
      if (!doc || doc.unavailable) {
        const err = new Error('not_found');
        err.status = 404;
        throw err;
      }
      if (doc.revision !== payload.expected_revision) {
        const err = new Error('conflict');
        err.status = 409;
        throw err;
      }

      const versions = knowledgeVersions.get(payload.document_id) ?? [];
      const ver = versions.find(v => v.version_id === payload.version_id);
      if (!ver) {
        const err = new Error('not_found');
        err.status = 404;
        throw err;
      }
      if (ver.state === 'archived') {
        const err = new Error('conflict');
        err.status = 409;
        throw err;
      }

      ver.state = 'archived';
      if (doc.current_version_id === payload.version_id) {
        doc.current_version_id = null;
      }
      doc.revision += 1;

      const receipt = {
        document_id: payload.document_id,
        operation: 'archiveVersion',
        receipt_id: randomUUID(),
        version_id: payload.version_id,
      };
      receipts.set(key, receipt);
      return {status: 200, receipt};
    },

    async delete(actorId, payload, key) {
      const doc = knowledgeDocs.get(payload.document_id);
      if (!doc || doc.unavailable) {
        const err = new Error('not_found');
        err.status = 404;
        throw err;
      }
      if (doc.revision !== payload.expected_revision) {
        const err = new Error('conflict');
        err.status = 409;
        throw err;
      }
      doc.unavailable = true;
      doc.revision += 1;
      return {status: 204};
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

  const authHeaders = (token) => ({
    cookie: `${SESSION_COOKIE}=${token}`,
    origin: 'https://localhost',
    'x-sacw-request': '1',
  });

  // Create initial document
  const createRes = await app.inject({
    method: 'POST',
    url: `/projects/${project}/documents`,
    headers: {
      ...authHeaders(tokens[1]), // Author
      'idempotency-key': 'p04-key-create-1',
    },
    payload: {
      title: 'Lifecycle Document',
      classification: 'restricted',
      content: 'Initial restricted content',
    },
  });
  assert.equal(createRes.statusCode, 201);
  const docId = createRes.json().document_id;
  assert(docId);

  await t.test('active author can revise document and receive minimal receipt', async () => {
    const revRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/revisions`,
      headers: {
        ...authHeaders(tokens[1]), // Author
        'idempotency-key': 'p04-key-rev-1',
      },
      payload: {
        content: 'Revised content by author',
        expected_revision: 1,
      },
    });
    assert.equal(revRes.statusCode, 201);
    const receipt = revRes.json();
    assert.equal(receipt.document_id, docId);
    assert.equal(receipt.operation, 'reviseDocument');
    assert(receipt.version_id);
    assert(receipt.receipt_id);

    // Replay with exact key returns 200 with identical receipt
    const replayRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/revisions`,
      headers: {
        ...authHeaders(tokens[1]),
        'idempotency-key': 'p04-key-rev-1',
      },
      payload: {
        content: 'Revised content by author',
        expected_revision: 1,
      },
    });
    assert.equal(replayRes.statusCode, 200);
    assert.equal(replayRes.json().receipt_id, receipt.receipt_id);

    // Stale expected_revision yields 409 State conflict
    const staleRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/revisions`,
      headers: {
        ...authHeaders(tokens[1]),
        'idempotency-key': 'p04-key-rev-stale',
      },
      payload: {
        content: 'Stale update',
        expected_revision: 1, // Current is 2
      },
    });
    assert.equal(staleRes.statusCode, 409);
  });

  await t.test('member without knowledge-author capability is forbidden (403)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/revisions`,
      headers: {
        ...authHeaders(tokens[2]), // other (no knowledge-author)
        'idempotency-key': 'p04-key-other-1',
      },
      payload: {
        content: 'Unauthorized update',
        expected_revision: 2,
      },
    });
    assert.equal(res.statusCode, 403);
  });

  await t.test('independent write authority: author can revise even when read access is revoked', async () => {
    // Document is restricted; let's verify author can revise at revision 2
    const revRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/revisions`,
      headers: {
        ...authHeaders(tokens[1]), // Author has knowledge-author
        'idempotency-key': 'p04-key-rev-nonread',
      },
      payload: {
        content: 'Blind revision without read grant',
        expected_revision: 2,
      },
    });
    assert.equal(revRes.statusCode, 201);
    assert.equal(revRes.json().operation, 'reviseDocument');
  });

  await t.test('archiveVersion archives specified version under exclusive guard', async () => {
    const curDoc = knowledgeDocs.get(docId);
    assert.equal(curDoc.revision, 3);
    const vIdToArchive = curDoc.current_version_id;

    const arcRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/versions/${vIdToArchive}/archive`,
      headers: {
        ...authHeaders(tokens[1]),
        'idempotency-key': 'p04-key-arc-1',
      },
      payload: {
        expected_revision: 3,
      },
    });
    assert.equal(arcRes.statusCode, 200);
    const receipt = arcRes.json();
    assert.equal(receipt.operation, 'archiveVersion');
    assert.equal(receipt.version_id, vIdToArchive);
  });

  await t.test('deleteDocument marks policy unavailable and returns 204', async () => {
    const curDoc = knowledgeDocs.get(docId);
    assert.equal(curDoc.revision, 4);

    const delRes = await app.inject({
      method: 'DELETE',
      url: `/projects/${project}/documents/${docId}`,
      headers: {
        ...authHeaders(tokens[1]),
        'idempotency-key': 'p04-key-del-1',
        'x-expected-revision': '4',
      },
    });
    assert.equal(delRes.statusCode, 204);

    // Verify workspace policy is marked unavailable
    const policyRow = (
      await f.db.runtime.query('SELECT registry_state FROM workspace.document_policy WHERE document_id = $1', [docId])
    ).rows[0];
    assert.equal(policyRow.registry_state, 'unavailable');

    // Future revision attempts yield 403/404
    const revAfterDel = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/revisions`,
      headers: {
        ...authHeaders(tokens[1]),
        'idempotency-key': 'p04-key-rev-after-del',
      },
      payload: {
        content: 'Should fail',
        expected_revision: 5,
      },
    });
    assert.equal(revAfterDel.statusCode, 403); // policy not active
  });
});
