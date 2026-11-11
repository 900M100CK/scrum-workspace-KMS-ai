import type {PoolClient} from 'pg';

export async function canCreateDocument(c: PoolClient, actor: string, projectId: string): Promise<boolean> {
  const res = await c.query(
    'SELECT workspace.has_document_create_authority($1, $2) AS allowed',
    [actor, projectId]
  );
  return Boolean(res.rows[0]?.allowed);
}

export async function canManageDocumentAccess(
  c: PoolClient,
  actor: string,
  projectId: string,
  documentId: string
): Promise<boolean> {
  // Check document-specific manage-access grant OR project-level membership-manage
  const res = await c.query(
    `SELECT 1 FROM workspace.capability_grant
      WHERE project_id = $1
        AND subject_id = $2
        AND valid
        AND (
          (resource_kind = 'document' AND resource_id = $3 AND action = 'document-manage-access')
          OR (resource_kind = 'project' AND resource_id = $1 AND action IN ('membership-manage', 'project-administrator'))
        )
      LIMIT 1`,
    [projectId, actor, documentId]
  );
  return Boolean(res.rowCount && res.rowCount > 0);
}

export async function canReadDocument(
  c: PoolClient,
  actor: string,
  projectId: string,
  documentId: string
): Promise<boolean> {
  // 1. Must be active member of project
  const memberRes = await c.query(
    `SELECT membership_generation FROM workspace.membership
      WHERE project_id = $1 AND user_id = $2 AND active`,
    [projectId, actor]
  );
  if (!memberRes.rowCount || memberRes.rowCount === 0) return false;
  const membershipGen = memberRes.rows[0].membership_generation;

  // 2. Fetch document policy
  const policyRes = await c.query(
    `SELECT classification, registry_state FROM workspace.document_policy
      WHERE project_id = $1 AND document_id = $2`,
    [projectId, documentId]
  );
  if (!policyRes.rowCount || policyRes.rowCount === 0) return false;
  const policy = policyRes.rows[0];
  if (policy.registry_state !== 'active') return false;

  // 3. If project_shared, any active member can read
  if (policy.classification === 'project_shared') return true;

  // 4. If restricted, must have valid read_grant bound to current membership_generation
  const grantRes = await c.query(
    `SELECT 1 FROM workspace.read_grant
      WHERE project_id = $1
        AND document_id = $2
        AND user_id = $3
        AND valid
        AND membership_generation = $4
      LIMIT 1`,
    [projectId, documentId, actor, membershipGen]
  );
  return Boolean(grantRes.rowCount && grantRes.rowCount > 0);
}
