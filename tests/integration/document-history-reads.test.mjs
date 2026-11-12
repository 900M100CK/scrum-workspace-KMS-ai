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

test('SP07 P05 Document version history explorer, exact version reads, and dual-layer nondisclosure', {timeout: 180000}, async t => {
  const f = await documentAuthorityFixture();
  const {db, ids: [owner, memberA, memberB], tokens, project, projects, operator} = f;
  t.after(() => f.close());

  // Setup roles
  await projects.add(tokens[0], project, {user_id: memberA, role: 'developer'}, randomUUID());
  await projects.add(tokens[0], project, {user_id: memberB, role: 'developer'}, randomUUID());
  await operator.project(memberA, project, 'knowledge-author', true, '0', 'p05-test', 'grant author');

  const docsStore = new WorkspaceDocumentStore(db.runtime, f.sessions, f.cursorKey);
  const guard = new ProjectRWGuard();

  // Knowledge Transport state
  const knowledgeVersions = new Map(); // docId -> Array of versions
  const knowledgeDocs = new Map(); // docId -> doc state
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

      const doc = knowledgeDocs.get(payload.document_id);
      if (!doc || doc.unavailable) {
        const err = new Error('not_found');
        err.status = 404;
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
        created_at: new Date('2026-11-02T10:00:00Z').toISOString(),
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

  // 1. Create Restricted Document with 2 versions
  const v1Content = 'Restricted V1 initial text';
  const v2Content = 'Restricted V2 revised text';

  const createRes = await app.inject({
    method: 'POST',
    url: `/projects/${project}/documents`,
    headers: {
      ...authHeaders(tokens[1]), // memberA
      'idempotency-key': 'p05-create-1',
    },
    payload: {
      title: 'Confidential Strategy',
      classification: 'restricted',
      content: v1Content,
    },
  });
  assert.equal(createRes.statusCode, 201);
  const docId = createRes.json().document_id;
  const v1Id = createRes.json().current_version_id;

  const revRes = await app.inject({
    method: 'POST',
    url: `/projects/${project}/documents/${docId}/revisions`,
    headers: {
      ...authHeaders(tokens[1]),
      'idempotency-key': 'p05-rev-1',
    },
    payload: {
      content: v2Content,
      expected_revision: 1,
    },
  });
  assert.equal(revRes.statusCode, 201);
  const v2Id = revRes.json().version_id;

  await t.test('permitted reader (memberA) can list versions without content and read exact historical version', async () => {
    // List versions
    const listRes = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/versions`,
      headers: authHeaders(tokens[1]),
    });
    assert.equal(listRes.statusCode, 200);
    const list = listRes.json();
    assert.equal(list.document_id, docId);
    assert.equal(list.document_revision, 2);
    assert.equal(list.current_version_id, v2Id);
    assert.equal(list.items.length, 2);

    // Order: newest first
    assert.equal(list.items[0].version_id, v2Id);
    assert.equal(list.items[0].state, 'current');
    assert.equal(list.items[1].version_id, v1Id);
    assert.equal(list.items[1].state, 'superseded');

    // Content is NEVER disclosed in version list
    assert.equal(list.items[0].content, undefined);
    assert.equal(list.items[1].content, undefined);

    // Read V1 (superseded)
    const v1Res = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/versions/${v1Id}`,
      headers: authHeaders(tokens[1]),
    });
    assert.equal(v1Res.statusCode, 200);
    const v1Data = v1Res.json();
    assert.equal(v1Data.version_id, v1Id);
    assert.equal(v1Data.state, 'superseded');
    assert.equal(v1Data.content, v1Content);
    assert.equal(v1Data.revision, 2); // Aggregate revision

    // Read V2 (current)
    const v2Res = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/versions/${v2Id}`,
      headers: authHeaders(tokens[1]),
    });
    assert.equal(v2Res.statusCode, 200);
    const v2Data = v2Res.json();
    assert.equal(v2Data.version_id, v2Id);
    assert.equal(v2Data.state, 'current');
    assert.equal(v2Data.content, v2Content);
  });

  await t.test('unauthorized reader (memberB) receives 404 nondisclosure on version listing and reading', async () => {
    // memberB is in the project, but doc is restricted and memberB has no read grant
    const listRes = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/versions`,
      headers: authHeaders(tokens[2]), // memberB
    });
    assert.equal(listRes.statusCode, 404);
    assert.equal(listRes.json().code, 'not_found');

    const v1Res = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/versions/${v1Id}`,
      headers: authHeaders(tokens[2]),
    });
    assert.equal(v1Res.statusCode, 404);
  });

  await t.test('granting read immediately permits memberB; revoking read immediately restores 404 nondisclosure', async () => {
    // 1. Grant read to memberB
    const grantRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/read-grants`,
      headers: {
        ...authHeaders(tokens[1]), // memberA manages grants
        'idempotency-key': 'p05-grant-b',
      },
      payload: {
        user_id: memberB,
        expected_revision: 1, // Document policy revision
      },
    });
    assert.equal(grantRes.statusCode, 200);

    // 2. memberB can now list and read
    const listResAfterGrant = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/versions`,
      headers: authHeaders(tokens[2]),
    });
    assert.equal(listResAfterGrant.statusCode, 200);
    assert.equal(listResAfterGrant.json().items.length, 2);

    const v1ResAfterGrant = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/versions/${v1Id}`,
      headers: authHeaders(tokens[2]),
    });
    assert.equal(v1ResAfterGrant.statusCode, 200);
    assert.equal(v1ResAfterGrant.json().content, v1Content);

    // 3. Revoke read from memberB
    const revokeRes = await app.inject({
      method: 'DELETE',
      url: `/projects/${project}/documents/${docId}/read-grants/${memberB}`,
      headers: {
        ...authHeaders(tokens[1]),
        'idempotency-key': 'p05-revoke-b',
        'x-expected-revision': '2',
      },
    });
    assert.equal(revokeRes.statusCode, 200);

    // 4. memberB immediately receives 404 again
    const listResAfterRevoke = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/versions`,
      headers: authHeaders(tokens[2]),
    });
    assert.equal(listResAfterRevoke.statusCode, 404);

    const v1ResAfterRevoke = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/versions/${v1Id}`,
      headers: authHeaders(tokens[2]),
    });
    assert.equal(v1ResAfterRevoke.statusCode, 404);
  });

  await t.test('project_shared document allows all active project members to read version history', async () => {
    // Create shared document
    const sharedRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents`,
      headers: {
        ...authHeaders(tokens[1]),
        'idempotency-key': 'p05-create-shared',
      },
      payload: {
        title: 'Public Architecture Guide',
        classification: 'project_shared',
        content: 'Shared V1 text',
      },
    });
    assert.equal(sharedRes.statusCode, 201);
    const sharedDocId = sharedRes.json().document_id;

    // Both memberA and memberB can list and read
    const listA = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${sharedDocId}/versions`,
      headers: authHeaders(tokens[1]),
    });
    assert.equal(listA.statusCode, 200);

    const listB = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${sharedDocId}/versions`,
      headers: authHeaders(tokens[2]),
    });
    assert.equal(listB.statusCode, 200);
    assert.equal(listB.json().document_id, sharedDocId);
  });
});
