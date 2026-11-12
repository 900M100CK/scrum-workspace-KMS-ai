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

test('SP06 P10 Protected explorer and detail reads (read filtering, dual-layer checks, nondisclosure)', {timeout: 180000}, async t => {
  const f = await documentAuthorityFixture();
  const {db, ids: [owner, author, memberB, outsideUser], tokens, project, projects, operator} = f;
  t.after(() => f.close());

  // Setup memberships
  await projects.add(tokens[0], project, {user_id: author, role: 'developer'}, randomUUID());
  await projects.add(tokens[0], project, {user_id: memberB, role: 'developer'}, randomUUID());
  await operator.project(author, project, 'knowledge-author', true, '0', 'p10-test', 'grant author');

  const docsStore = new WorkspaceDocumentStore(db.runtime, f.sessions, f.cursorKey);
  const guard = new ProjectRWGuard();

  const mockKnowledgeStore = new Map();

  const mockTransport = {
    async persist(actorId, payload) {
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
      mockKnowledgeStore.set(payload.document_id, {document: result, content: payload.content});
      return result;
    },
    async get(documentId) {
      return mockKnowledgeStore.get(documentId) ?? null;
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

  const headers = (token) => ({
    cookie: `${SESSION_COOKIE}=${token}`,
    origin: 'https://localhost',
    'x-sacw-request': '1',
  });

  // 1. Author creates a shared document
  const sharedRes = await app.inject({
    method: 'POST',
    url: `/projects/${project}/documents`,
    headers: {
      ...headers(tokens[1]), // author
      'idempotency-key': 'key-p10-shared',
    },
    payload: {
      title: 'Shared Team Guidelines',
      classification: 'project_shared',
      content: 'Everyone in the project can read this.',
    },
  });
  assert.equal(sharedRes.statusCode, 201);
  const sharedDocId = sharedRes.json().document_id;

  // 2. Author creates a restricted document (author has read_grant initially)
  const restrictedRes = await app.inject({
    method: 'POST',
    url: `/projects/${project}/documents`,
    headers: {
      ...headers(tokens[1]), // author
      'idempotency-key': 'key-p10-restricted',
    },
    payload: {
      title: 'Confidential Salary Data',
      classification: 'restricted',
      content: 'Only authorized grantees can read this.',
    },
  });
  assert.equal(restrictedRes.statusCode, 201);
  const restrictedDocId = restrictedRes.json().document_id;

  await t.test('explorer lists only documents permitted for the specific actor', async () => {
    // Author sees BOTH documents (shared + restricted where author has grant)
    const authorListRes = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents`,
      headers: headers(tokens[1]),
    });
    assert.equal(authorListRes.statusCode, 200);
    const authorDocs = authorListRes.json().items;
    assert.equal(authorDocs.length, 2);
    assert(authorDocs.some((d) => d.document_id === sharedDocId));
    assert(authorDocs.some((d) => d.document_id === restrictedDocId));

    // MemberB only sees SHARED document (has no grant for restricted)
    const memberBListRes = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents`,
      headers: headers(tokens[2]),
    });
    assert.equal(memberBListRes.statusCode, 200);
    const memberBDocs = memberBListRes.json().items;
    assert.equal(memberBDocs.length, 1);
    assert.equal(memberBDocs[0].document_id, sharedDocId);
    assert(!memberBDocs.some((d) => d.document_id === restrictedDocId));
  });

  await t.test('detail read allows permitted reader and returns 404 nondisclosure for denied user', async () => {
    // Author can read restricted doc
    const authorDetailRes = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${restrictedDocId}`,
      headers: headers(tokens[1]),
    });
    assert.equal(authorDetailRes.statusCode, 200);
    const authorDetail = authorDetailRes.json();
    assert.equal(authorDetail.document.document_id, restrictedDocId);
    assert.equal(authorDetail.content, 'Only authorized grantees can read this.');

    // MemberB is denied access to restricted doc -> returns 404 (nondisclosure)
    const memberBDetailRes = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${restrictedDocId}`,
      headers: headers(tokens[2]),
    });
    assert.equal(memberBDetailRes.statusCode, 404);

    // Both can read shared doc
    const memberBSharedRes = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${sharedDocId}`,
      headers: headers(tokens[2]),
    });
    assert.equal(memberBSharedRes.statusCode, 200);
    assert.equal(memberBSharedRes.json().content, 'Everyone in the project can read this.');
  });

  await t.test('granting read makes restricted doc readable for memberB; revoking denies it immediately', async () => {
    // Grant read to memberB (permission_revision: 1 -> 2)
    const grantRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${restrictedDocId}/read-grants`,
      headers: {
        ...headers(tokens[1]),
        'idempotency-key': 'key-p10-grant-b',
      },
      payload: {
        user_id: memberB,
        expected_revision: 1,
      },
    });
    assert.equal(grantRes.statusCode, 200);

    // Now memberB can read restricted doc
    const readAfterGrant = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${restrictedDocId}`,
      headers: headers(tokens[2]),
    });
    assert.equal(readAfterGrant.statusCode, 200);
    assert.equal(readAfterGrant.json().content, 'Only authorized grantees can read this.');

    // Revoke read from memberB (permission_revision: 2 -> 3)
    const revokeRes = await app.inject({
      method: 'DELETE',
      url: `/projects/${project}/documents/${restrictedDocId}/read-grants/${memberB}`,
      headers: {
        ...headers(tokens[1]),
        'idempotency-key': 'key-p10-revoke-b',
      },
      payload: {
        expected_revision: 2,
      },
    });
    assert.equal(revokeRes.statusCode, 200);

    // Now memberB is denied again (returns 404)
    const readAfterRevoke = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${restrictedDocId}`,
      headers: headers(tokens[2]),
    });
    assert.equal(readAfterRevoke.statusCode, 404);
  });
});
