import {randomUUID} from 'node:crypto';
import type {Pool, PoolClient} from 'pg';
import type {WorkspaceSessionStore} from '../session/store.ts';
import {WorkspaceProjectStore, projectAccess, uuid} from '../projects/store.ts';
import type {CursorKey} from '../projects/cursor.ts';
import {ProjectFault, invalid, missing, conflict, requestHash, wireRevision} from '../projects/outcomes.ts';
import {canCreateDocument, canManageDocumentAccess, canReadDocument, canWriteDocument} from './authority.ts';
import type {
  RegisterDocumentPolicyInput,
  RegisterDocumentPolicyOutcome,
  DocumentPolicy,
  DocumentClassification,
  DocumentReadGrantsResponse,
  GrantReadInput,
  RevokeReadInput,
  SetClassificationInput,
} from './types.ts';

export class WorkspaceDocumentStore {
  readonly projects: WorkspaceProjectStore;

  constructor(pool: Pool, sessions: WorkspaceSessionStore, key: CursorKey | null = null, ttlSeconds = 300) {
    this.projects = new WorkspaceProjectStore(pool, sessions, key, ttlSeconds);
  }

  async registerPolicy(
    token: string,
    projectId: string,
    input: RegisterDocumentPolicyInput,
    key: string,
    correlation: string = randomUUID()
  ): Promise<RegisterDocumentPolicyOutcome> {
    if (!uuid(projectId)) throw missing();
    projectId = projectId.toLowerCase();
    if (typeof key !== 'string' || !key || !input || typeof input !== 'object') throw invalid();
    if (!['project_shared', 'restricted'].includes(input.classification)) throw invalid();
    if (input.document_id !== undefined && !uuid(input.document_id)) throw invalid();

    const clientProvidedDocId = input.document_id ? input.document_id.toLowerCase() : null;
    const hash =
      typeof input.payload_hash === 'string' && input.payload_hash.length === 64
        ? input.payload_hash
        : requestHash(['registerDocumentPolicy', projectId, clientProvidedDocId, input.classification]);

    return this.projects.transaction(token, async (c, actor, guard) => {
      await projectAccess(c, actor, projectId);
      if (!(await canCreateDocument(c, actor, projectId))) throw new ProjectFault(403, 'forbidden');

      const existing = (
        await c.query(
          `SELECT payload_hash, state, result_ref FROM workspace.idempotency_record
            WHERE actor_id = $1 AND operation = 'registerDocumentPolicy' AND idempotency_key = $2`,
          [actor, key]
        )
      ).rows[0];

      if (existing) {
        if (existing.payload_hash !== hash || existing.state !== 'committed') throw conflict();
        if (!(await guard())) return null as any;
        const row = (
          await c.query(
            `SELECT document_id, project_id, classification, registry_state, permission_revision::text revision
               FROM workspace.document_policy WHERE document_id = $1 AND project_id = $2`,
            [existing.result_ref, projectId]
          )
        ).rows[0];
        if (!row) throw conflict();
        return {
          status: 200,
          policy: {
            document_id: row.document_id,
            project_id: row.project_id,
            classification: row.classification,
            registry_state: row.registry_state,
            permission_revision: wireRevision(row.revision),
          },
          projectId,
        };
      }

      if (!(await guard())) return null as any;

      const docId = clientProvidedDocId ?? randomUUID();

      await c.query(
        `INSERT INTO workspace.document_policy(document_id, project_id, classification, registry_state, permission_revision)
          VALUES($1, $2, $3, 'active', 1)`,
        [docId, projectId, input.classification]
      );

      await c.query(
        `INSERT INTO workspace.capability_grant(grant_id, subject_id, project_id, resource_kind, resource_id, action, valid, permission_revision)
          VALUES($1, $2, $3, 'document', $4, 'document-manage-access', true, 1)`,
        [randomUUID(), actor, projectId, docId]
      );

      let authorGrantId: string | undefined;
      if (input.classification === 'restricted') {
        const memRow = (
          await c.query(
            `SELECT membership_generation FROM workspace.membership WHERE project_id = $1 AND user_id = $2 AND active`,
            [projectId, actor]
          )
        ).rows[0];
        if (!memRow) throw new ProjectFault(403, 'forbidden');
        await c.query(
          `INSERT INTO workspace.read_grant(project_id, document_id, user_id, grant_generation, membership_generation, valid, revision)
            VALUES($1, $2, $3, 1, $4, true, 1)`,
          [projectId, docId, actor, memRow.membership_generation]
        );
        authorGrantId = actor;
      }

      await c.query(
        `INSERT INTO workspace.business_audit(event_id, actor_id, project_id, action, entity_id, correlation_id, after_ref)
          VALUES($1, $2, $3, 'document-policy-register', $4, $5, $6)`,
        [
          randomUUID(),
          actor,
          projectId,
          docId,
          correlation,
          JSON.stringify({classification: input.classification, revision: 1}),
        ]
      );

      await c.query(
        `INSERT INTO workspace.idempotency_record(actor_id, operation, idempotency_key, payload_hash, state, result_ref, expires_at)
          VALUES($1, 'registerDocumentPolicy', $2, $3, 'committed', $4, 'infinity')`,
        [actor, key, hash, docId]
      );

      const body: DocumentPolicy = {
        document_id: docId,
        project_id: projectId,
        classification: input.classification,
        registry_state: 'active',
        permission_revision: 1,
      };

      return {status: 201, policy: body, projectId, authorReadGrantId: authorGrantId};
    });
  }

  async getPolicy(token: string, projectId: string, documentId: string): Promise<DocumentPolicy> {
    if (!uuid(projectId) || !uuid(documentId)) throw missing();
    projectId = projectId.toLowerCase();
    documentId = documentId.toLowerCase();

    return this.projects.transaction(token, async (c, actor, guard) => {
      await projectAccess(c, actor, projectId);
      if (!(await canManageDocumentAccess(c, actor, projectId, documentId))) {
        throw new ProjectFault(403, 'forbidden');
      }
      if (!(await guard())) return null as any;

      const row = (
        await c.query(
          `SELECT document_id, project_id, classification, registry_state, permission_revision::text revision
             FROM workspace.document_policy WHERE document_id = $1 AND project_id = $2`,
          [documentId, projectId]
        )
      ).rows[0];
      if (!row) throw missing();

      return {
        document_id: row.document_id,
        project_id: row.project_id,
        classification: row.classification,
        registry_state: row.registry_state,
        permission_revision: wireRevision(row.revision),
      };
    });
  }

  async listGrants(token: string, projectId: string, documentId: string): Promise<DocumentReadGrantsResponse> {
    if (!uuid(projectId) || !uuid(documentId)) throw missing();
    projectId = projectId.toLowerCase();
    documentId = documentId.toLowerCase();

    return this.projects.transaction(token, async (c, actor, guard) => {
      await projectAccess(c, actor, projectId);
      if (!(await canManageDocumentAccess(c, actor, projectId, documentId))) {
        throw new ProjectFault(403, 'forbidden');
      }
      if (!(await guard())) return null as any;

      const policyRow = (
        await c.query(
          `SELECT permission_revision::text revision FROM workspace.document_policy
            WHERE document_id = $1 AND project_id = $2`,
          [documentId, projectId]
        )
      ).rows[0];
      if (!policyRow) throw missing();

      const grants = (
        await c.query(
          `SELECT user_id, grant_generation::text g_gen, membership_generation::text m_gen, revision::text rev
             FROM workspace.read_grant
            WHERE document_id = $1 AND project_id = $2 AND valid
            ORDER BY user_id`,
          [documentId, projectId]
        )
      ).rows.map((r) => ({
        user_id: r.user_id,
        grant_generation: wireRevision(r.g_gen),
        membership_generation: wireRevision(r.m_gen),
        revision: wireRevision(r.rev),
      }));

      return {
        document_id: documentId,
        project_id: projectId,
        permission_revision: wireRevision(policyRow.revision),
        grants,
      };
    });
  }

  async setClassification(
    token: string,
    projectId: string,
    documentId: string,
    input: SetClassificationInput,
    key: string,
    correlation: string = randomUUID()
  ): Promise<{status: 200; policy: DocumentPolicy; projectId: string}> {
    if (!uuid(projectId) || !uuid(documentId)) throw missing();
    projectId = projectId.toLowerCase();
    documentId = documentId.toLowerCase();
    if (typeof key !== 'string' || !key || !input || typeof input !== 'object') throw invalid();
    if (!['project_shared', 'restricted'].includes(input.classification)) throw invalid();
    if (!Number.isSafeInteger(input.expected_revision) || input.expected_revision < 1) throw invalid();

    const hash = requestHash(['setClassification', projectId, documentId, input.classification, input.expected_revision]);

    return this.projects.transaction(token, async (c, actor, guard) => {
      await projectAccess(c, actor, projectId);
      if (!(await canManageDocumentAccess(c, actor, projectId, documentId))) {
        throw new ProjectFault(403, 'forbidden');
      }

      const existing = (
        await c.query(
          `SELECT payload_hash, state, result_ref FROM workspace.idempotency_record
            WHERE actor_id = $1 AND operation = 'setDocumentClassification' AND idempotency_key = $2`,
          [actor, key]
        )
      ).rows[0];

      if (existing) {
        if (existing.payload_hash !== hash || existing.state !== 'committed') throw conflict();
        if (!(await guard())) return null as any;
        const row = (
          await c.query(
            `SELECT document_id, project_id, classification, registry_state, permission_revision::text revision
               FROM workspace.document_policy WHERE document_id = $1 AND project_id = $2`,
            [documentId, projectId]
          )
        ).rows[0];
        if (!row) throw conflict();
        return {
          status: 200,
          policy: {
            document_id: row.document_id,
            project_id: row.project_id,
            classification: row.classification,
            registry_state: row.registry_state,
            permission_revision: wireRevision(row.revision),
          },
          projectId,
        };
      }

      if (!(await guard())) return null as any;

      const current = (
        await c.query(
          `SELECT classification, permission_revision::text revision FROM workspace.document_policy
            WHERE document_id = $1 AND project_id = $2 FOR UPDATE`,
          [documentId, projectId]
        )
      ).rows[0];
      if (!current) throw missing();
      const currentRev = wireRevision(current.revision);
      if (currentRev !== input.expected_revision) throw conflict();

      const nextRev = currentRev + 1;
      await c.query(
        `UPDATE workspace.document_policy
            SET classification = $1, permission_revision = $2
          WHERE document_id = $3 AND project_id = $4`,
        [input.classification, nextRev, documentId, projectId]
      );

      await c.query(
        `INSERT INTO workspace.business_audit(event_id, actor_id, project_id, action, entity_id, correlation_id, before_ref, after_ref)
          VALUES($1, $2, $3, 'document-classification-change', $4, $5, $6, $7)`,
        [
          randomUUID(),
          actor,
          projectId,
          documentId,
          correlation,
          `classification:${current.classification},revision:${currentRev}`,
          JSON.stringify({classification: input.classification, revision: nextRev}),
        ]
      );

      await c.query(
        `INSERT INTO workspace.idempotency_record(actor_id, operation, idempotency_key, payload_hash, state, result_ref, expires_at)
          VALUES($1, 'setDocumentClassification', $2, $3, 'committed', $4, 'infinity')`,
        [actor, key, hash, documentId]
      );

      return {
        status: 200,
        policy: {
          document_id: documentId,
          project_id: projectId,
          classification: input.classification,
          registry_state: 'active',
          permission_revision: nextRev,
        },
        projectId,
      };
    });
  }

  async grantRead(
    token: string,
    projectId: string,
    documentId: string,
    input: GrantReadInput,
    key: string,
    correlation: string = randomUUID()
  ): Promise<{status: 200; permission_revision: number; projectId: string}> {
    if (!uuid(projectId) || !uuid(documentId) || !uuid(input?.user_id)) throw missing();
    projectId = projectId.toLowerCase();
    documentId = documentId.toLowerCase();
    const targetUserId = input.user_id.toLowerCase();
    if (typeof key !== 'string' || !key || !Number.isSafeInteger(input.expected_revision) || input.expected_revision < 1) {
      throw invalid();
    }

    const hash = requestHash(['grantDocumentRead', projectId, documentId, targetUserId, input.expected_revision]);

    return this.projects.transaction(token, async (c, actor, guard) => {
      await projectAccess(c, actor, projectId);
      if (!(await canManageDocumentAccess(c, actor, projectId, documentId))) {
        throw new ProjectFault(403, 'forbidden');
      }

      const existing = (
        await c.query(
          `SELECT payload_hash, state, result_ref FROM workspace.idempotency_record
            WHERE actor_id = $1 AND operation = 'grantDocumentRead' AND idempotency_key = $2`,
          [actor, key]
        )
      ).rows[0];

      if (existing) {
        if (existing.payload_hash !== hash || existing.state !== 'committed') throw conflict();
        if (!(await guard())) return null as any;
        const pRow = (
          await c.query(
            `SELECT permission_revision::text revision FROM workspace.document_policy
              WHERE document_id = $1 AND project_id = $2`,
            [documentId, projectId]
          )
        ).rows[0];
        if (!pRow) throw conflict();
        return {status: 200, permission_revision: wireRevision(pRow.revision), projectId};
      }

      if (!(await guard())) return null as any;

      // Target must be active member of project
      const targetMember = (
        await c.query(
          `SELECT membership_generation FROM workspace.membership WHERE project_id = $1 AND user_id = $2 AND active`,
          [projectId, targetUserId]
        )
      ).rows[0];
      if (!targetMember) throw invalid();

      const policyRow = (
        await c.query(
          `SELECT permission_revision::text revision FROM workspace.document_policy
            WHERE document_id = $1 AND project_id = $2 FOR UPDATE`,
          [documentId, projectId]
        )
      ).rows[0];
      if (!policyRow) throw missing();
      const currentRev = wireRevision(policyRow.revision);
      if (currentRev !== input.expected_revision) throw conflict();

      const nextRev = currentRev + 1;
      await c.query(
        `UPDATE workspace.document_policy SET permission_revision = $1 WHERE document_id = $2 AND project_id = $3`,
        [nextRev, documentId, projectId]
      );

      // Check if existing read_grant exists
      const existingGrant = (
        await c.query(
          `SELECT grant_generation::text g_gen, revision::text rev FROM workspace.read_grant
            WHERE document_id = $1 AND project_id = $2 AND user_id = $3`,
          [documentId, projectId, targetUserId]
        )
      ).rows[0];

      if (existingGrant) {
        const nextGRev = wireRevision(existingGrant.rev) + 1;
        await c.query(
          `UPDATE workspace.read_grant
              SET valid = true, membership_generation = $1, revision = $2
            WHERE document_id = $3 AND project_id = $4 AND user_id = $5`,
          [targetMember.membership_generation, nextGRev, documentId, projectId, targetUserId]
        );
      } else {
        await c.query(
          `INSERT INTO workspace.read_grant(project_id, document_id, user_id, grant_generation, membership_generation, valid, revision)
            VALUES($1, $2, $3, 1, $4, true, 1)`,
          [projectId, documentId, targetUserId, targetMember.membership_generation]
        );
      }

      await c.query(
        `INSERT INTO workspace.business_audit(event_id, actor_id, project_id, action, entity_id, correlation_id, after_ref)
          VALUES($1, $2, $3, 'document-read-grant', $4, $5, $6)`,
        [
          randomUUID(),
          actor,
          projectId,
          documentId,
          correlation,
          JSON.stringify({target_user_id: targetUserId, revision: nextRev}),
        ]
      );

      await c.query(
        `INSERT INTO workspace.idempotency_record(actor_id, operation, idempotency_key, payload_hash, state, result_ref, expires_at)
          VALUES($1, 'grantDocumentRead', $2, $3, 'committed', $4, 'infinity')`,
        [actor, key, hash, documentId]
      );

      return {status: 200, permission_revision: nextRev, projectId};
    });
  }

  async revokeRead(
    token: string,
    projectId: string,
    documentId: string,
    targetUserId: string,
    input: RevokeReadInput,
    key: string,
    correlation: string = randomUUID()
  ): Promise<{status: 200; permission_revision: number; projectId: string}> {
    if (!uuid(projectId) || !uuid(documentId) || !uuid(targetUserId)) throw missing();
    projectId = projectId.toLowerCase();
    documentId = documentId.toLowerCase();
    targetUserId = targetUserId.toLowerCase();
    if (typeof key !== 'string' || !key || !Number.isSafeInteger(input?.expected_revision) || input.expected_revision < 1) {
      throw invalid();
    }

    const hash = requestHash(['revokeDocumentRead', projectId, documentId, targetUserId, input.expected_revision]);

    return this.projects.transaction(token, async (c, actor, guard) => {
      await projectAccess(c, actor, projectId);
      // Can revoke if manage access OR self-revoke
      const isSelf = actor === targetUserId;
      if (!isSelf && !(await canManageDocumentAccess(c, actor, projectId, documentId))) {
        throw new ProjectFault(403, 'forbidden');
      }

      const existing = (
        await c.query(
          `SELECT payload_hash, state, result_ref FROM workspace.idempotency_record
            WHERE actor_id = $1 AND operation = 'revokeDocumentRead' AND idempotency_key = $2`,
          [actor, key]
        )
      ).rows[0];

      if (existing) {
        if (existing.payload_hash !== hash || existing.state !== 'committed') throw conflict();
        if (!(await guard())) return null as any;
        const pRow = (
          await c.query(
            `SELECT permission_revision::text revision FROM workspace.document_policy
              WHERE document_id = $1 AND project_id = $2`,
            [documentId, projectId]
          )
        ).rows[0];
        if (!pRow) throw conflict();
        return {status: 200, permission_revision: wireRevision(pRow.revision), projectId};
      }

      if (!(await guard())) return null as any;

      const policyRow = (
        await c.query(
          `SELECT permission_revision::text revision FROM workspace.document_policy
            WHERE document_id = $1 AND project_id = $2 FOR UPDATE`,
          [documentId, projectId]
        )
      ).rows[0];
      if (!policyRow) throw missing();
      const currentRev = wireRevision(policyRow.revision);
      if (currentRev !== input.expected_revision) throw conflict();

      const nextRev = currentRev + 1;
      await c.query(
        `UPDATE workspace.document_policy SET permission_revision = $1 WHERE document_id = $2 AND project_id = $3`,
        [nextRev, documentId, projectId]
      );

      await c.query(
        `UPDATE workspace.read_grant
            SET valid = false, revision = revision + 1
          WHERE document_id = $1 AND project_id = $2 AND user_id = $3 AND valid`,
        [documentId, projectId, targetUserId]
      );

      await c.query(
        `INSERT INTO workspace.business_audit(event_id, actor_id, project_id, action, entity_id, correlation_id, after_ref)
          VALUES($1, $2, $3, 'document-read-revoke', $4, $5, $6)`,
        [
          randomUUID(),
          actor,
          projectId,
          documentId,
          correlation,
          JSON.stringify({target_user_id: targetUserId, revision: nextRev, is_self: isSelf}),
        ]
      );

      await c.query(
        `INSERT INTO workspace.idempotency_record(actor_id, operation, idempotency_key, payload_hash, state, result_ref, expires_at)
          VALUES($1, 'revokeDocumentRead', $2, $3, 'committed', $4, 'infinity')`,
        [actor, key, hash, documentId]
      );

      return {status: 200, permission_revision: nextRev, projectId};
    });
  }

  async listReadableDocumentIds(token: string, projectId: string): Promise<string[]> {
    if (!uuid(projectId)) throw missing();
    projectId = projectId.toLowerCase();

    return this.projects.transaction(token, async (c, actor, guard) => {
      const {member} = await projectAccess(c, actor, projectId);
      if (!(await guard())) return null as any;

      const memGen = member.membership_generation;
      const rows = (
        await c.query(
          `SELECT p.document_id
             FROM workspace.document_policy p
            WHERE p.project_id = $1
              AND p.registry_state = 'active'
              AND (
                p.classification = 'project_shared'
                OR EXISTS (
                  SELECT 1 FROM workspace.read_grant g
                   WHERE g.project_id = p.project_id
                     AND g.document_id = p.document_id
                     AND g.user_id = $2
                     AND g.valid
                     AND g.membership_generation = $3
                )
              )
            ORDER BY p.document_id`,
          [projectId, actor, memGen]
        )
      ).rows;

      return rows.map((r) => r.document_id);
    });
  }

  async checkReadAccess(token: string, projectId: string, documentId: string): Promise<boolean> {
    if (!uuid(projectId) || !uuid(documentId)) return false;
    projectId = projectId.toLowerCase();
    documentId = documentId.toLowerCase();

    return this.projects.transaction(token, async (c, actor, guard) => {
      try {
        await projectAccess(c, actor, projectId);
      } catch {
        return false;
      }
      if (!(await guard())) return false;
      return canReadDocument(c, actor, projectId, documentId);
    });
  }

  async markUnavailable(
    token: string,
    projectId: string,
    documentId: string
  ): Promise<void> {
    if (!uuid(projectId) || !uuid(documentId)) throw missing();
    projectId = projectId.toLowerCase();
    documentId = documentId.toLowerCase();

    return this.projects.transaction(token, async (c, actor, guard) => {
      await projectAccess(c, actor, projectId);
      if (!(await canWriteDocument(c, actor, projectId, documentId))) {
        throw new ProjectFault(403, 'forbidden');
      }
      if (!(await guard())) return null as any;

      await c.query(
        `UPDATE workspace.document_policy
            SET registry_state = 'unavailable', permission_revision = permission_revision + 1
          WHERE project_id = $1 AND document_id = $2`,
        [projectId, documentId]
      );
    });
  }
}
