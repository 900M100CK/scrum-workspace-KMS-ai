import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {knowledgeFixture} from './knowledge-fixture.mjs';

test('SP07 P02 Knowledge versioning store lifecycle and concurrency', {timeout: 180000}, async t => {
  const f = await knowledgeFixture();
  t.after(() => f.close());

  const actor = randomUUID();
  const projectId = randomUUID();
  const docId = randomUUID();

  // 1. Initial persistence
  const initContent = 'Version 1 content\n\nParagraph 1\n\nParagraph 2';
  const initial = await f.store.persistDocument(
    actor,
    {
      document_id: docId,
      project_id: projectId,
      owner_id: actor,
      title: 'Lifecycle Document',
      content: initContent,
    },
    'key-init-1'
  );
  assert.equal(initial.status, 201);
  const v1Id = initial.document.current_version_id;
  assert(v1Id);
  assert.equal(initial.document.revision, 1);

  await t.test('reviseDocument atomically supersedes old Current, sets new Current, and advances revision', async () => {
    const v2Content = 'Version 2 content\n\nUpdated paragraph 1\n\nNew paragraph 3';
    const revRes = await f.store.reviseDocument(
      actor,
      projectId,
      docId,
      {
        content: v2Content,
        expected_revision: 1,
      },
      'key-rev-1'
    );

    assert.equal(revRes.status, 201);
    assert.equal(revRes.receipt.document_id, docId);
    assert.equal(revRes.receipt.operation, 'reviseDocument');
    assert(revRes.receipt.version_id);
    const v2Id = revRes.receipt.version_id;
    assert.notEqual(v2Id, v1Id);

    // Verify DB state
    const docRow = (await f.admin.query('SELECT * FROM knowledge.document WHERE document_id = $1', [docId])).rows[0];
    assert.equal(docRow.current_version_id, v2Id);
    assert.equal(Number(docRow.revision), 2);

    // V1 is now superseded
    const v1Row = (
      await f.admin.query('SELECT * FROM knowledge.document_version WHERE document_id = $1 AND version_id = $2', [
        docId,
        v1Id,
      ])
    ).rows[0];
    assert.equal(v1Row.state, 'superseded');
    assert.equal(Number(v1Row.revision), 2);
    assert.equal(v1Row.immutable_content, initContent);

    // V2 is current
    const v2Row = (
      await f.admin.query('SELECT * FROM knowledge.document_version WHERE document_id = $1 AND version_id = $2', [
        docId,
        v2Id,
      ])
    ).rows[0];
    assert.equal(v2Row.state, 'current');
    assert.equal(Number(v2Row.revision), 1);
    assert.equal(v2Row.immutable_content, v2Content);

    // V2 passages exist
    const v2Passages = (
      await f.admin.query('SELECT * FROM knowledge.passage WHERE document_id = $1 AND version_id = $2 ORDER BY locator', [
        docId,
        v2Id,
      ])
    ).rows;
    assert.equal(v2Passages.length, 3);
    assert.equal(v2Passages[0].immutable_excerpt, 'Version 2 content');

    // Audit recorded
    const audit = (
      await f.admin.query(
        "SELECT * FROM knowledge.business_audit WHERE entity_id = $1 AND action = 'document-revise'",
        [docId]
      )
    ).rows[0];
    assert(audit);
    assert.equal(audit.actor_id, actor);

    // Replay with same key and payload returns 200 with identical receipt
    const replay = await f.store.reviseDocument(
      actor,
      projectId,
      docId,
      {
        content: v2Content,
        expected_revision: 1,
      },
      'key-rev-1'
    );
    assert.equal(replay.status, 200);
    assert.equal(replay.receipt.receipt_id, revRes.receipt.receipt_id);
    assert.equal(replay.receipt.version_id, v2Id);

    // Replay with different payload conflicts
    await assert.rejects(
      f.store.reviseDocument(
        actor,
        projectId,
        docId,
        {
          content: 'Tampered content',
          expected_revision: 1,
        },
        'key-rev-1'
      ),
      err => err.status === 409 && err.code === 'state_conflict'
    );

    // Stale expected_revision conflicts (document is at revision 2 now)
    await assert.rejects(
      f.store.reviseDocument(
        actor,
        projectId,
        docId,
        {
          content: 'Version 3 content',
          expected_revision: 1, // Stale!
        },
        'key-rev-stale'
      ),
      err => err.status === 409 && err.code === 'state_conflict'
    );
  });

  await t.test('listVersions returns metadata list without content, correctly ordered and paginated', async () => {
    // Add V3 to have 3 versions
    const rev3 = await f.store.reviseDocument(
      actor,
      projectId,
      docId,
      {
        content: 'Version 3 content\n\nOnly one paragraph',
        expected_revision: 2,
      },
      'key-rev-3'
    );
    const v3Id = rev3.receipt.version_id;

    const list = await f.store.listVersions(projectId, docId);
    assert(list);
    assert.equal(list.document_id, docId);
    assert.equal(list.document_revision, 3);
    assert.equal(list.current_version_id, v3Id);
    assert.equal(list.items.length, 3);

    // Check states: newest is Current, older are Superseded
    assert.equal(list.items[0].version_id, v3Id);
    assert.equal(list.items[0].state, 'current');
    assert.equal(list.items[1].state, 'superseded');
    assert.equal(list.items[2].state, 'superseded');

    // No content in list items
    assert.equal(list.items[0].content, undefined);

    // Test pagination limit 2
    const page1 = await f.store.listVersions(projectId, docId, null, 2);
    assert(page1);
    assert.equal(page1.items.length, 2);
    assert(page1.next_cursor);

    const page2 = await f.store.listVersions(projectId, docId, page1.next_cursor, 2);
    assert(page2);
    assert.equal(page2.items.length, 1);
    assert.equal(page2.next_cursor, null);
  });

  await t.test('getVersion returns exact version details and content', async () => {
    const v1 = await f.store.getVersion(projectId, docId, v1Id);
    assert(v1);
    assert.equal(v1.document_id, docId);
    assert.equal(v1.version_id, v1Id);
    assert.equal(v1.state, 'superseded');
    assert.equal(v1.content, initContent);
    assert.equal(v1.revision, 3); // Document aggregate revision

    // Non-existent version returns null
    const notFound = await f.store.getVersion(projectId, docId, randomUUID());
    assert.equal(notFound, null);
  });

  await t.test('archiveVersion transitions version to archived and updates document pointer if Current', async () => {
    // Archive V1 (already superseded)
    const arcV1 = await f.store.archiveVersion(
      actor,
      projectId,
      docId,
      v1Id,
      {expected_revision: 3},
      'key-arc-v1'
    );
    assert.equal(arcV1.status, 200);
    assert.equal(arcV1.receipt.operation, 'archiveVersion');
    assert.equal(arcV1.receipt.version_id, v1Id);

    // Document revision is now 4; current_version_id remains unchanged (still V3)
    const docRow = (await f.admin.query('SELECT * FROM knowledge.document WHERE document_id = $1', [docId])).rows[0];
    assert.equal(Number(docRow.revision), 4);
    assert(docRow.current_version_id);

    // V1 state is archived
    const v1Ver = await f.store.getVersion(projectId, docId, v1Id);
    assert.equal(v1Ver.state, 'archived');

    // Archive V3 (which is the current version!)
    const arcV3 = await f.store.archiveVersion(
      actor,
      projectId,
      docId,
      docRow.current_version_id,
      {expected_revision: 4},
      'key-arc-v3'
    );
    assert.equal(arcV3.status, 200);

    // Document current_version_id is now NULL and revision is 5!
    const docRowAfter = (await f.admin.query('SELECT * FROM knowledge.document WHERE document_id = $1', [docId])).rows[0];
    assert.equal(docRowAfter.current_version_id, null);
    assert.equal(Number(docRowAfter.revision), 5);

    // Archiving an already archived version throws 409
    await assert.rejects(
      f.store.archiveVersion(
        actor,
        projectId,
        docId,
        v1Id,
        {expected_revision: 5},
        'key-arc-v1-again'
      ),
      err => err.status === 409 && err.code === 'state_conflict'
    );
  });

  await t.test('deleteDocument sets unavailable = true and prevents future operations', async () => {
    const delRes = await f.store.deleteDocument(actor, projectId, docId, 5, 'key-del-1');
    assert.equal(delRes.status, 204);

    // Document is unavailable
    const docRow = (await f.admin.query('SELECT * FROM knowledge.document WHERE document_id = $1', [docId])).rows[0];
    assert.equal(docRow.unavailable, true);
    assert.equal(Number(docRow.revision), 6);

    // Replay with same key and payload returns 204
    const delReplay = await f.store.deleteDocument(actor, projectId, docId, 5, 'key-del-1');
    assert.equal(delReplay.status, 204);

    // getDocument and listVersions return null
    assert.equal(await f.store.getDocument(docId), null);
    assert.equal(await f.store.listVersions(projectId, docId), null);
    assert.equal(await f.store.getVersion(projectId, docId, v1Id), null);

    // Future revisions fail
    await assert.rejects(
      f.store.reviseDocument(
        actor,
        projectId,
        docId,
        {
          content: 'Fail version',
          expected_revision: 6,
        },
        'key-rev-fail'
      ),
      err => err.status === 404 && err.code === 'not_found'
    );
  });
});
