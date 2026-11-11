import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {knowledgeFixture} from './knowledge-fixture.mjs';

test('SP06 P07 Knowledge persistence enforces immutable Current and deterministic passages', {timeout: 180000}, async t => {
  const f = await knowledgeFixture();
  t.after(() => f.close());

  const actor = randomUUID();
  const projectId = randomUUID();
  const docId = randomUUID();

  await t.test('persistDocument stores document, current version, passages and audit atomically', async () => {
    const key = 'key-know-1';
    const content = `# Title 1\n\nFirst paragraph of text.\n\nSecond paragraph of details.`;
    const res = await f.store.persistDocument(
      actor,
      {
        document_id: docId,
        project_id: projectId,
        owner_id: actor,
        title: 'Architecture Overview',
        content,
      },
      key
    );

    assert.equal(res.status, 201);
    assert.equal(res.document.document_id, docId);
    assert.equal(res.document.title, 'Architecture Overview');
    assert.equal(res.document.revision, 1);
    assert(res.document.current_version_id);

    // Verify DB state directly
    const docRow = (await f.admin.query('SELECT * FROM knowledge.document WHERE document_id = $1', [docId])).rows[0];
    assert.equal(docRow.title, 'Architecture Overview');
    assert.equal(docRow.current_version_id, res.document.current_version_id);

    const versionRow = (
      await f.admin.query('SELECT * FROM knowledge.document_version WHERE document_id = $1', [docId])
    ).rows[0];
    assert.equal(versionRow.state, 'current');
    assert.equal(versionRow.immutable_content, content);

    const passages = (
      await f.admin.query('SELECT * FROM knowledge.passage WHERE document_id = $1 ORDER BY locator', [docId])
    ).rows;
    assert.equal(passages.length, 3);
    assert.equal(passages[0].immutable_excerpt, '# Title 1');
    assert.equal(passages[1].immutable_excerpt, 'First paragraph of text.');
    assert.equal(passages[2].immutable_excerpt, 'Second paragraph of details.');

    // Verify audit
    const auditRow = (
      await f.admin.query("SELECT * FROM knowledge.business_audit WHERE entity_id = $1 AND action = 'document-create'", [
        docId,
      ])
    ).rows[0];
    assert(auditRow);
    assert.equal(auditRow.actor_id, actor);

    // Replay with exact same key and payload returns 200
    const replay = await f.store.persistDocument(
      actor,
      {
        document_id: docId,
        project_id: projectId,
        owner_id: actor,
        title: 'Architecture Overview',
        content,
      },
      key
    );
    assert.equal(replay.status, 200);
    assert.equal(replay.document.document_id, docId);

    // Replay with same key but changed title conflicts
    await assert.rejects(
      f.store.persistDocument(
        actor,
        {
          document_id: docId,
          project_id: projectId,
          owner_id: actor,
          title: 'Changed Title',
          content,
        },
        key
      ),
      err => err.status === 409 && err.code === 'state_conflict'
    );
  });

  await t.test('protect_version trigger rejects direct mutation of immutable_content', async () => {
    await assert.rejects(
      f.admin.query("UPDATE knowledge.document_version SET immutable_content = 'tampered' WHERE document_id = $1", [
        docId,
      ]),
      err => err.code === '23514'
    );
  });

  await t.test('internal HTTP endpoint requires valid X-Service-Key and persists over transport', async () => {
    const httpDocId = randomUUID();
    const httpContent = 'HTTP internal persisted content.';

    // Missing or invalid key -> 403
    const forbiddenRes = await f.app.inject({
      method: 'POST',
      url: '/internal/documents',
      headers: {
        'x-service-key': 'wrong-key',
        'x-actor-user-id': actor,
        'idempotency-key': 'key-http-1',
      },
      payload: {
        document_id: httpDocId,
        project_id: projectId,
        owner_id: actor,
        title: 'HTTP Doc',
        content: httpContent,
      },
    });
    assert.equal(forbiddenRes.statusCode, 403);

    // Valid key -> 201
    const successRes = await f.app.inject({
      method: 'POST',
      url: '/internal/documents',
      headers: {
        'x-service-key': f.serviceKey,
        'x-actor-user-id': actor,
        'idempotency-key': 'key-http-1',
      },
      payload: {
        document_id: httpDocId,
        project_id: projectId,
        owner_id: actor,
        title: 'HTTP Doc',
        content: httpContent,
      },
    });
    assert.equal(successRes.statusCode, 201);
    const body = successRes.json();
    assert.equal(body.document_id, httpDocId);

    // Read back via internal GET
    const readRes = await f.app.inject({
      method: 'GET',
      url: `/internal/documents/${httpDocId}`,
      headers: {
        'x-service-key': f.serviceKey,
      },
    });
    assert.equal(readRes.statusCode, 200);
    const readBody = readRes.json();
    assert.equal(readBody.document.document_id, httpDocId);
    assert.equal(readBody.content, httpContent);

    // Non-existent doc -> 404
    const notFoundRes = await f.app.inject({
      method: 'GET',
      url: `/internal/documents/${randomUUID()}`,
      headers: {
        'x-service-key': f.serviceKey,
      },
    });
    assert.equal(notFoundRes.statusCode, 404);
  });
});
