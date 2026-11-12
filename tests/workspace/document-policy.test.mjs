import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {documentAuthorityFixture} from './document-authority-fixture.mjs';
import {WorkspaceDocumentStore} from '../../services/workspace/src/documents/store.ts';

test('SP06 P06 registerDocumentPolicy binds identity, policy, initial grants and audit atomically', {timeout: 180000}, async t => {
  const f = await documentAuthorityFixture();
  const {db, ids: [owner, author, other], tokens, project, projects, operator} = f;
  t.after(() => f.close());

  // Add author as developer to project
  await projects.add(tokens[0], project, {user_id: author, role: 'developer'}, randomUUID());
  await projects.add(tokens[0], project, {user_id: other, role: 'developer'}, randomUUID());

  const docs = new WorkspaceDocumentStore(db.runtime, f.sessions, f.cursorKey);

  await t.test('actor without knowledge-author capability is forbidden', async () => {
    await assert.rejects(
      docs.registerPolicy(tokens[1], project, {classification: 'restricted'}, 'key-no-auth'),
      error => {
        const fault = error.cause ?? error;
        return fault.status === 403 && fault.code === 'forbidden';
      }
    );
  });

  // Provision knowledge-author to author
  await operator.project(author, project, 'knowledge-author', true, '0', 'p06-test', 'grant author');

  await t.test('missing or invalid classification is rejected', async () => {
    await assert.rejects(
      docs.registerPolicy(tokens[1], project, {}, 'key-invalid-1'),
      error => error.status === 400 && error.code === 'validation_failed'
    );
    await assert.rejects(
      docs.registerPolicy(tokens[1], project, {classification: 'invalid_scope'}, 'key-invalid-2'),
      error => error.status === 400 && error.code === 'validation_failed'
    );
  });

  let createdRestrictedDocId;

  await t.test('restricted registration commits policy, manage capability, author read grant and audit', async () => {
    const key = 'key-p06-restricted-1';
    const res = await docs.registerPolicy(tokens[1], project, {classification: 'restricted'}, key);

    assert.equal(res.status, 201);
    assert.equal(res.policy.classification, 'restricted');
    assert.equal(res.policy.registry_state, 'active');
    assert.equal(res.policy.permission_revision, 1);
    assert.equal(res.authorReadGrantId, author);
    createdRestrictedDocId = res.policy.document_id;

    // Verify DB state
    const policyRow = (
      await db.admin.query('SELECT * FROM workspace.document_policy WHERE document_id = $1', [createdRestrictedDocId])
    ).rows[0];
    assert.equal(policyRow.classification, 'restricted');
    assert.equal(policyRow.registry_state, 'active');
    assert.equal(policyRow.permission_revision, '1');

    // Verify manage-access capability grant for author
    const manageGrant = (
      await db.admin.query(
        "SELECT * FROM workspace.capability_grant WHERE subject_id = $1 AND resource_kind = 'document' AND resource_id = $2 AND action = 'document-manage-access'",
        [author, createdRestrictedDocId]
      )
    ).rows[0];
    assert(manageGrant);
    assert.equal(manageGrant.valid, true);

    // Verify author read grant
    const readGrant = (
      await db.admin.query(
        'SELECT * FROM workspace.read_grant WHERE document_id = $1 AND user_id = $2',
        [createdRestrictedDocId, author]
      )
    ).rows[0];
    assert(readGrant);
    assert.equal(readGrant.valid, true);
    assert.equal(readGrant.grant_generation, '1');

    // Verify business audit
    const auditRow = (
      await db.admin.query(
        "SELECT * FROM workspace.business_audit WHERE entity_id = $1 AND action = 'document-policy-register'",
        [createdRestrictedDocId]
      )
    ).rows[0];
    assert(auditRow);
    assert.equal(auditRow.actor_id, author);
    assert.equal(auditRow.project_id, project);

    // Same-key replay returns exact same outcome
    const replay = await docs.registerPolicy(tokens[1], project, {classification: 'restricted', document_id: createdRestrictedDocId}, key);
    assert.equal(replay.status, 200);
    assert.equal(replay.policy.document_id, createdRestrictedDocId);
    assert.equal(replay.policy.classification, 'restricted');

    // Replay with different payload conflicts
    await assert.rejects(
      docs.registerPolicy(tokens[1], project, {classification: 'project_shared'}, key),
      error => {
        const fault = error.cause ?? error;
        return fault.status === 409 && fault.code === 'state_conflict';
      }
    );
  });

  await t.test('project_shared registration commits policy and manage capability without requiring explicit read grant', async () => {
    const key = 'key-p06-shared-1';
    const res = await docs.registerPolicy(tokens[1], project, {classification: 'project_shared'}, key);

    assert.equal(res.status, 201);
    assert.equal(res.policy.classification, 'project_shared');
    assert.equal(res.policy.registry_state, 'active');

    // Read grant is not needed for project_shared (shared to all members)
    const readGrant = (
      await db.admin.query(
        'SELECT * FROM workspace.read_grant WHERE document_id = $1',
        [res.policy.document_id]
      )
    ).rows[0];
    assert(!readGrant);
  });

  await t.test('audit failure rolls back the entire registration', async () => {
    await db.admin.query(`
      CREATE FUNCTION workspace.reject_doc_policy_audit() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.action = 'document-policy-register' THEN
          RAISE EXCEPTION 'synthetic-policy-audit-failure';
        END IF;
        RETURN NEW;
      END $$;
      CREATE TRIGGER reject_doc_policy_audit BEFORE INSERT ON workspace.business_audit
        FOR EACH ROW EXECUTE FUNCTION workspace.reject_doc_policy_audit();
    `);

    const failDocId = randomUUID();
    try {
      await assert.rejects(
        docs.registerPolicy(tokens[1], project, {classification: 'restricted', document_id: failDocId}, 'key-audit-fail')
      );
      // Verify nothing committed
      const policyCheck = (
        await db.admin.query('SELECT 1 FROM workspace.document_policy WHERE document_id = $1', [failDocId])
      ).rowCount;
      assert.equal(policyCheck, 0);
    } finally {
      await db.admin.query(`
        DROP TRIGGER reject_doc_policy_audit ON workspace.business_audit;
        DROP FUNCTION workspace.reject_doc_policy_audit();
      `);
    }
  });
});
