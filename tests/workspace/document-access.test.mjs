import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import Fastify from 'fastify';
import {documentAuthorityFixture} from './document-authority-fixture.mjs';
import {WorkspaceDocumentStore} from '../../services/workspace/src/documents/store.ts';
import {DocumentOrchestrator} from '../../services/workspace/src/documents/orchestration.ts';
import {registerDocumentHttp} from '../../services/workspace/src/documents/http.ts';
import {ProjectRWGuard} from '../../services/workspace/src/policy/guard.ts';
import {SESSION_COOKIE} from '../../services/workspace/src/session/http.ts';

test('SP06 P09 Document access management (classification, grant, revoke, nondisclosure)', {timeout: 180000}, async t => {
  const f = await documentAuthorityFixture();
  const {db, ids: [owner, managerAuthor, memberB, memberC], tokens, project, projects, operator} = f;
  t.after(() => f.close());

  // Setup project members
  await projects.add(tokens[0], project, {user_id: managerAuthor, role: 'developer'}, randomUUID());
  await projects.add(tokens[0], project, {user_id: memberB, role: 'developer'}, randomUUID());
  await operator.project(managerAuthor, project, 'knowledge-author', true, '0', 'p09-test', 'grant author');

  const docsStore = new WorkspaceDocumentStore(db.runtime, f.sessions, f.cursorKey);
  const guard = new ProjectRWGuard();

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
    async get() {
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

  const headers = (token) => ({
    cookie: `${SESSION_COOKIE}=${token}`,
    origin: 'https://localhost',
    'x-sacw-request': '1',
  });

  // Create initial restricted document
  const createRes = await app.inject({
    method: 'POST',
    url: `/projects/${project}/documents`,
    headers: {
      ...headers(tokens[1]), // managerAuthor
      'idempotency-key': 'key-p09-init-doc',
    },
    payload: {
      title: 'Restricted Doc P09',
      classification: 'restricted',
      content: 'Confidential content',
    },
  });
  assert.equal(createRes.statusCode, 201);
  const docId = createRes.json().document_id;

  await t.test('known-ID manager can read policy and initial grants list; ordinary reader without manage is forbidden', async () => {
    // Manager reads policy
    const policyRes = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/policy`,
      headers: headers(tokens[1]),
    });
    assert.equal(policyRes.statusCode, 200);
    const policy = policyRes.json();
    assert.equal(policy.document_id, docId);
    assert.equal(policy.classification, 'restricted');
    assert.equal(policy.permission_revision, 1);

    // Manager lists grants (managerAuthor has initial grant)
    const grantsRes = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/read-grants`,
      headers: headers(tokens[1]),
    });
    assert.equal(grantsRes.statusCode, 200);
    const grantsBody = grantsRes.json();
    assert.equal(grantsBody.document_id, docId);
    assert.equal(grantsBody.grants.length, 1);
    assert.equal(grantsBody.grants[0].user_id, managerAuthor);

    // Ordinary member without manage-access cannot inspect policy or grants
    const memberPolicyRes = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/policy`,
      headers: headers(tokens[2]), // memberB
    });
    assert.equal(memberPolicyRes.statusCode, 403);

    const memberGrantsRes = await app.inject({
      method: 'GET',
      url: `/projects/${project}/documents/${docId}/read-grants`,
      headers: headers(tokens[2]),
    });
    assert.equal(memberGrantsRes.statusCode, 403);
  });

  await t.test('grant read to current member succeeds with CAS; non-member target rejected', async () => {
    // Non-member target rejected
    const nonMemberRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/read-grants`,
      headers: {
        ...headers(tokens[1]),
        'idempotency-key': 'key-grant-nonmember',
      },
      payload: {
        user_id: randomUUID(),
        expected_revision: 1,
      },
    });
    assert.equal(nonMemberRes.statusCode, 400);

    // Grant read to memberB with CAS (expected_revision: 1 -> 2)
    const grantRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/read-grants`,
      headers: {
        ...headers(tokens[1]),
        'idempotency-key': 'key-grant-b-1',
      },
      payload: {
        user_id: memberB,
        expected_revision: 1,
      },
    });
    assert.equal(grantRes.statusCode, 200);
    assert.equal(grantRes.json().permission_revision, 2);

    // Verify memberB is now in grants list
    const updatedGrants = (
      await app.inject({
        method: 'GET',
        url: `/projects/${project}/documents/${docId}/read-grants`,
        headers: headers(tokens[1]),
      })
    ).json();
    assert.equal(updatedGrants.grants.length, 2);
    assert(updatedGrants.grants.some((g) => g.user_id === memberB));

    // Stale revision (still passing expected_revision: 1) conflicts (409)
    const staleGrantRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/read-grants`,
      headers: {
        ...headers(tokens[1]),
        'idempotency-key': 'key-grant-b-stale',
      },
      payload: {
        user_id: memberB,
        expected_revision: 1,
      },
    });
    assert.equal(staleGrantRes.statusCode, 409);
  });

  await t.test('classification transition shared -> restricted -> shared updates revision with CAS', async () => {
    // Change to project_shared (expected_revision: 2 -> 3)
    const setSharedRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/classification`,
      headers: {
        ...headers(tokens[1]),
        'idempotency-key': 'key-set-shared-1',
      },
      payload: {
        classification: 'project_shared',
        expected_revision: 2,
      },
    });
    assert.equal(setSharedRes.statusCode, 200);
    assert.equal(setSharedRes.json().classification, 'project_shared');
    assert.equal(setSharedRes.json().permission_revision, 3);

    // Change back to restricted (expected_revision: 3 -> 4)
    const setRestrictedRes = await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/classification`,
      headers: {
        ...headers(tokens[1]),
        'idempotency-key': 'key-set-restricted-1',
      },
      payload: {
        classification: 'restricted',
        expected_revision: 3,
      },
    });
    assert.equal(setRestrictedRes.statusCode, 200);
    assert.equal(setRestrictedRes.json().classification, 'restricted');
    assert.equal(setRestrictedRes.json().permission_revision, 4);
  });

  await t.test('self-revoke allows grantee to revoke their own grant without manage-access', async () => {
    // memberB revokes their OWN read grant (expected_revision: 4 -> 5)
    const selfRevokeRes = await app.inject({
      method: 'DELETE',
      url: `/projects/${project}/documents/${docId}/read-grants/${memberB}`,
      headers: {
        ...headers(tokens[2]), // memberB
        'idempotency-key': 'key-self-revoke-1',
      },
      payload: {
        expected_revision: 4,
      },
    });
    assert.equal(selfRevokeRes.statusCode, 200);
    assert.equal(selfRevokeRes.json().permission_revision, 5);

    // Verify memberB is no longer in grants list
    const grantsAfter = (
      await app.inject({
        method: 'GET',
        url: `/projects/${project}/documents/${docId}/read-grants`,
        headers: headers(tokens[1]),
      })
    ).json();
    assert.equal(grantsAfter.grants.length, 1);
    assert(!grantsAfter.grants.some((g) => g.user_id === memberB));
  });

  await t.test('membership removal invalidates grants and rejoin does not revive access', async () => {
    // First grant read back to memberB (expected_revision: 5 -> 6)
    await app.inject({
      method: 'POST',
      url: `/projects/${project}/documents/${docId}/read-grants`,
      headers: {
        ...headers(tokens[1]),
        'idempotency-key': 'key-regrant-b',
      },
      payload: {
        user_id: memberB,
        expected_revision: 5,
      },
    });

    // Remove memberB from project
    const removeRes = await projects.remove(tokens[0], project, memberB, '1', randomUUID());
    assert.equal(removeRes.status, 204);

    // Verify read_grant is invalidated in DB
    const grantInDb = (
      await db.admin.query(
        'SELECT valid FROM workspace.read_grant WHERE document_id = $1 AND user_id = $2',
        [docId, memberB]
      )
    ).rows[0];
    assert.equal(grantInDb.valid, false);

    // Re-add memberB to project
    await projects.add(tokens[0], project, {user_id: memberB, role: 'developer'}, randomUUID());

    // Verify read_grant does NOT revive
    const grantAfterRejoin = (
      await db.admin.query(
        'SELECT valid FROM workspace.read_grant WHERE document_id = $1 AND user_id = $2',
        [docId, memberB]
      )
    ).rows[0];
    assert.equal(grantAfterRejoin.valid, false);
  });
});
