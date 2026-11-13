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

test('SP07 P07 Document revision concurrency, CAS race conditions, and revocation boundaries', {timeout: 180000}, async t => {
  const f = await documentAuthorityFixture();
  const {db, ids: [owner, author, memberB], tokens, project, projects, operator} = f;
  t.after(() => f.close());

  // Setup roles: author has knowledge-author; memberB is developer
  await projects.add(tokens[0], project, {user_id: author, role: 'developer'}, randomUUID());
  await projects.add(tokens[0], project, {user_id: memberB, role: 'developer'}, randomUUID());
  await operator.project(author, project, 'knowledge-author', true, '0', 'p07-test', 'grant author');

  const docsStore = new WorkspaceDocumentStore(db.runtime, f.sessions, f.cursorKey);
  const guard = new ProjectRWGuard();

  // Knowledge Transport state
  const knowledgeVersions = new Map();
  const knowledgeDocs = new Map();
  const receipts = new Map();

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
        created_at: new Date('2026-11-01T10:00:00Z').toISOString(),
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
      if (existing) return {status: 200, receipt: existing};

      // Simulate asynchronous IO processing
      await new Promise(r => setTimeout(r, 15));

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
        created_at: new Date().toISOString(),
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

      await new Promise(r => setTimeout(r, 15));

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

    async listVersions(projectId, documentId, cursor, limit) {
      const doc = knowledgeDocs.get(documentId);
      if (!doc || doc.unavailable || doc.project_id !== projectId) return null;
      const versions = (knowledgeVersions.get(documentId) ?? []).slice();
      versions.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

      return {
        items: versions.map(v => ({
          document_id: documentId,
          version_id: v.version_id,
          state: v.state,
          created_at: v.created_at,
        })),
        next_cursor: null,
        document_id: documentId,
        document_revision: doc.revision,
        current_version_id: doc.current_version_id,
      };
    },

    async getVersion(projectId, documentId, versionId) {
      const doc = knowledgeDocs.get(documentId);
      if (!doc || doc.unavailable || doc.project_id !== projectId) return null;
      const versions = knowledgeVersions.get(documentId) ?? [];
      const ver = versions.find(v => v.version_id === versionId);
      if (!ver) return null;

      return {
        document_id: documentId,
        version_id: ver.version_id,
        state: ver.state,
        content: ver.content,
        content_format: 'text',
        created_at: ver.created_at,
        revision: doc.revision,
      };
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

  // Create initial document at revision 1
  const createRes = await app.inject({
    method: 'POST',
    url: `/projects/${project}/documents`,
    headers: {
      ...authHeaders(tokens[1]), // author
      'idempotency-key': 'p07-init-doc',
    },
    payload: {
      title: 'Concurrency Benchmark Target',
      classification: 'restricted',
      content: 'Initial text rev 1',
    },
  });
  assert.equal(createRes.statusCode, 201);
  const docId = createRes.json().document_id;
  const initialVId = createRes.json().current_version_id;

  await t.test('competing parallel revisions on same expected_revision: exactly one succeeds, other fails 409', async () => {
    const p1 = app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/revisions`,
      headers: {
        ...authHeaders(tokens[1]),
        'idempotency-key': 'p07-rev-race-A',
      },
      payload: {
        content: 'Concurrent update A',
        expected_revision: 1,
      },
    });

    const p2 = app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/revisions`,
      headers: {
        ...authHeaders(tokens[1]),
        'idempotency-key': 'p07-rev-race-B',
      },
      payload: {
        content: 'Concurrent update B',
        expected_revision: 1,
      },
    });

    const [res1, res2] = await Promise.all([p1, p2]);
    const codes = [res1.statusCode, res2.statusCode].sort();

    // Exactly one 201 Created and one 409 Conflict
    assert.deepEqual(codes, [201, 409]);

    // Aggregate revision is strictly 2
    const doc = knowledgeDocs.get(docId);
    assert.equal(doc.revision, 2);
  });

  await t.test('competing parallel revise and archive on same expected_revision: exactly one succeeds', async () => {
    // Current document revision is 2
    const curDoc = knowledgeDocs.get(docId);
    assert.equal(curDoc.revision, 2);
    const vIdToArchive = initialVId; // Superseded version

    const pRevise = app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/revisions`,
      headers: {
        ...authHeaders(tokens[1]),
        'idempotency-key': 'p07-compete-rev',
      },
      payload: {
        content: 'Revision competing with archive',
        expected_revision: 2,
      },
    });

    const pArchive = app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/versions/${vIdToArchive}/archive`,
      headers: {
        ...authHeaders(tokens[1]),
        'idempotency-key': 'p07-compete-arc',
      },
      payload: {
        expected_revision: 2,
      },
    });

    const [resRevise, resArchive] = await Promise.all([pRevise, pArchive]);
    const statuses = [resRevise.statusCode, resArchive.statusCode];

    assert(statuses.includes(409), 'One of the competing requests must be rejected with 409 conflict');
    assert(statuses.includes(200) || statuses.includes(201), 'One of the competing requests must succeed');

    // Aggregate revision advances by exactly 1 to 3
    assert.equal(knowledgeDocs.get(docId).revision, 3);
  });

  await t.test('revocation of document content-write capability immediately blocks subsequent revisions with 403', async () => {
    // Current revision is 3
    const curRev = knowledgeDocs.get(docId).revision;

    // Invalidate knowledge-author capability (advancing revision from 0 to 1)
    await f.db.admin.query("UPDATE workspace.capability_grant SET valid = false WHERE project_id = $1 AND subject_id = $2 AND resource_id = $3 AND action = 'content-write'", [project, author, docId]);

    // Revision attempt by author must now be rejected with 403 Forbidden
    const res = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/revisions`,
      headers: {
        ...authHeaders(tokens[1]),
        'idempotency-key': 'p07-rev-after-revocation',
      },
      payload: {
        content: 'Should be denied',
        expected_revision: curRev,
      },
    });
    assert.equal(res.statusCode, 403);
    assert.equal(res.json().code, 'forbidden');
  });

  await t.test('revocation of read grant immediately restores 404 nondisclosure on version history reads', async () => {
    // 1. Grant read to memberB
    const policyRow = (
      await f.db.runtime.query('SELECT permission_revision FROM workspace.document_policy WHERE document_id = $1', [docId])
    ).rows[0];
    const permRev = Number(policyRow.permission_revision);

    await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/read-grants`,
      headers: {
        ...authHeaders(tokens[0]), // Owner manages grants
        'idempotency-key': 'p07-grant-read-b',
      },
      payload: {
        user_id: memberB,
        expected_revision: permRev,
      },
    });

    // 2. memberB can read version history
    const listBeforeRevoke = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/versions`,
      headers: authHeaders(tokens[2]),
    });
    assert.equal(listBeforeRevoke.statusCode, 200);

    // 3. Revoke read grant from memberB
    const revokeRes = await app.inject({
      method: 'DELETE',
      url: `/projects/${project}/documents/${docId}/read-grants/${memberB}`,
      headers: {
        ...authHeaders(tokens[0]),
        'idempotency-key': 'p07-revoke-read-b',
        'x-expected-revision': String(permRev + 1),
      },
    });
    assert.equal(revokeRes.statusCode, 200);

    // 4. memberB immediately gets 404 Not Found on version listing and getVersion
    const listAfterRevoke = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/versions`,
      headers: authHeaders(tokens[2]),
    });
    assert.equal(listAfterRevoke.statusCode, 404);
    assert.equal(listAfterRevoke.json().code, 'not_found');

    const getVerAfterRevoke = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/versions/${initialVId}`,
      headers: authHeaders(tokens[2]),
    });
    assert.equal(getVerAfterRevoke.statusCode, 404);
  });
});
