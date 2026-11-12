import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {knowledgeFixture} from './knowledge-fixture.mjs';

test('SP07 P03 Knowledge internal HTTP versioning transport', {timeout: 180000}, async t => {
  const f = await knowledgeFixture();
  t.after(() => f.close());

  const actor = randomUUID();
  const projectId = randomUUID();
  const docId = randomUUID();

  await t.test('internal routes reject unauthorized requests with 403', async () => {
    // Missing service key
    const res1 = await f.app.inject({
      method: 'POST',
      url: `/internal/documents/${docId}/revisions`,
      payload: {project_id: projectId, content: 'test', expected_revision: 1},
    });
    assert.equal(res1.statusCode, 403);

    // Invalid service key
    const res2 = await f.app.inject({
      method: 'GET',
      url: `/internal/documents/${docId}/versions?project_id=${projectId}`,
      headers: {'x-service-key': 'tampered-key'},
    });
    assert.equal(res2.statusCode, 403);
  });

  await t.test('revision endpoint validates actor and idempotency headers', async () => {
    // Missing actor header
    const res1 = await f.app.inject({
      method: 'POST',
      url: `/internal/documents/${docId}/revisions`,
      headers: {
        'x-service-key': f.serviceKey,
        'idempotency-key': 'key-rev-test',
      },
      payload: {project_id: projectId, content: 'test', expected_revision: 1},
    });
    assert.equal(res1.statusCode, 400);

    // Missing idempotency key
    const res2 = await f.app.inject({
      method: 'POST',
      url: `/internal/documents/${docId}/revisions`,
      headers: {
        'x-service-key': f.serviceKey,
        'x-actor-user-id': actor,
      },
      payload: {project_id: projectId, content: 'test', expected_revision: 1},
    });
    assert.equal(res2.statusCode, 400);
  });

  await t.test('full versioning lifecycle over internal HTTP transport', async () => {
    // 1. Initial document creation
    const initRes = await f.app.inject({
      method: 'POST',
      url: '/internal/documents',
      headers: {
        'x-service-key': f.serviceKey,
        'x-actor-user-id': actor,
        'idempotency-key': 'key-http-init-1',
      },
      payload: {
        document_id: docId,
        project_id: projectId,
        owner_id: actor,
        title: 'HTTP Transport Doc',
        content: 'Version 1 HTTP Content\n\nParagraph 1\n\nParagraph 2',
      },
    });
    assert.equal(initRes.statusCode, 201);
    const initDoc = initRes.json();
    assert.equal(initDoc.document_id, docId);
    assert.equal(initDoc.revision, 1);
    const v1Id = initDoc.current_version_id;
    assert(v1Id);

    // 2. Revise document via internal HTTP
    const revRes = await f.app.inject({
      method: 'POST',
      url: `/internal/documents/${docId}/revisions`,
      headers: {
        'x-service-key': f.serviceKey,
        'x-actor-user-id': actor,
        'idempotency-key': 'key-http-rev-1',
      },
      payload: {
        project_id: projectId,
        content: 'Version 2 HTTP Content\n\nUpdated paragraph 1\n\nNew paragraph 3',
        expected_revision: 1,
      },
    });
    assert.equal(revRes.statusCode, 201);
    const revReceipt = revRes.json();
    assert.equal(revReceipt.document_id, docId);
    assert.equal(revReceipt.operation, 'reviseDocument');
    assert(revReceipt.receipt_id);
    assert(revReceipt.version_id);
    const v2Id = revReceipt.version_id;
    assert.notEqual(v2Id, v1Id);

    // 3. Replay revision with same key & payload returns 200 with identical receipt
    const replayRes = await f.app.inject({
      method: 'POST',
      url: `/internal/documents/${docId}/revisions`,
      headers: {
        'x-service-key': f.serviceKey,
        'x-actor-user-id': actor,
        'idempotency-key': 'key-http-rev-1',
      },
      payload: {
        project_id: projectId,
        content: 'Version 2 HTTP Content\n\nUpdated paragraph 1\n\nNew paragraph 3',
        expected_revision: 1,
      },
    });
    assert.equal(replayRes.statusCode, 200);
    assert.equal(replayRes.json().receipt_id, revReceipt.receipt_id);

    // 4. Stale expected_revision yields 409 state_conflict
    const staleRes = await f.app.inject({
      method: 'POST',
      url: `/internal/documents/${docId}/revisions`,
      headers: {
        'x-service-key': f.serviceKey,
        'x-actor-user-id': actor,
        'idempotency-key': 'key-http-rev-stale',
      },
      payload: {
        project_id: projectId,
        content: 'Stale version content',
        expected_revision: 1, // Current is 2!
      },
    });
    assert.equal(staleRes.statusCode, 409);
    assert.equal(staleRes.json().code, 'state_conflict');

    // 5. List versions
    const listRes = await f.app.inject({
      method: 'GET',
      url: `/internal/documents/${docId}/versions?project_id=${projectId}`,
      headers: {'x-service-key': f.serviceKey},
    });
    assert.equal(listRes.statusCode, 200);
    const listBody = listRes.json();
    assert.equal(listBody.document_id, docId);
    assert.equal(listBody.document_revision, 2);
    assert.equal(listBody.current_version_id, v2Id);
    assert.equal(listBody.items.length, 2);
    assert.equal(listBody.items[0].version_id, v2Id);
    assert.equal(listBody.items[0].state, 'current');
    assert.equal(listBody.items[1].version_id, v1Id);
    assert.equal(listBody.items[1].state, 'superseded');
    assert.equal(listBody.items[0].content, undefined);

    // 6. Get single version
    const getV1Res = await f.app.inject({
      method: 'GET',
      url: `/internal/documents/${docId}/versions/${v1Id}?project_id=${projectId}`,
      headers: {'x-service-key': f.serviceKey},
    });
    assert.equal(getV1Res.statusCode, 200);
    const v1Data = getV1Res.json();
    assert.equal(v1Data.version_id, v1Id);
    assert.equal(v1Data.state, 'superseded');
    assert(v1Data.content.includes('Version 1 HTTP Content'));

    // 7. Archive version
    const arcRes = await f.app.inject({
      method: 'POST',
      url: `/internal/documents/${docId}/versions/${v1Id}/archive`,
      headers: {
        'x-service-key': f.serviceKey,
        'x-actor-user-id': actor,
        'idempotency-key': 'key-http-arc-1',
      },
      payload: {
        project_id: projectId,
        expected_revision: 2,
      },
    });
    assert.equal(arcRes.statusCode, 200);
    const arcReceipt = arcRes.json();
    assert.equal(arcReceipt.operation, 'archiveVersion');
    assert.equal(arcReceipt.version_id, v1Id);

    // 8. Delete document
    const delRes = await f.app.inject({
      method: 'DELETE',
      url: `/internal/documents/${docId}?project_id=${projectId}&expected_revision=3`,
      headers: {
        'x-service-key': f.serviceKey,
        'x-actor-user-id': actor,
        'idempotency-key': 'key-http-del-1',
      },
    });
    assert.equal(delRes.statusCode, 204);

    // 9. Subsequent reads return 404
    const getDeleted = await f.app.inject({
      method: 'GET',
      url: `/internal/documents/${docId}`,
      headers: {'x-service-key': f.serviceKey},
    });
    assert.equal(getDeleted.statusCode, 404);

    const listDeleted = await f.app.inject({
      method: 'GET',
      url: `/internal/documents/${docId}/versions?project_id=${projectId}`,
      headers: {'x-service-key': f.serviceKey},
    });
    assert.equal(listDeleted.statusCode, 404);
  });
});
