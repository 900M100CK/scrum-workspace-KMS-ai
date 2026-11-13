SET LOCAL search_path = workspace, pg_catalog;

WITH author_registration AS (
  SELECT project_id, entity_id AS document_id, min(actor_id::text)::uuid AS actor_id, min(time) AS registered_at
  FROM business_audit
  WHERE action = 'document-policy-register'
  GROUP BY project_id, entity_id
  HAVING count(*) = 1
)
INSERT INTO capability_grant(grant_id, subject_id, project_id, resource_kind, resource_id, action)
SELECT gen_random_uuid(), r.actor_id, r.project_id, 'document', r.document_id, action.name
FROM author_registration r
JOIN document_policy p USING (project_id, document_id)
JOIN membership m ON m.project_id = r.project_id AND m.user_id = r.actor_id AND m.active
JOIN capability_grant g ON g.project_id = r.project_id AND g.subject_id = r.actor_id
 AND g.resource_kind = 'document' AND g.resource_id = r.document_id
 AND g.action = 'document-manage-access' AND g.valid AND g.permission_revision = 1
CROSS JOIN (VALUES ('content-write'), ('lifecycle-manage')) AS action(name)
WHERE p.registry_state = 'active'
  AND (m.membership_generation = 1 OR EXISTS (
    SELECT 1 FROM business_audit a
    WHERE a.project_id = r.project_id AND a.entity_id = r.actor_id
      AND a.action = 'member_added' AND a.after_ref = 'generation:' || m.membership_generation::text
      AND a.time <= r.registered_at
  ))
ON CONFLICT DO NOTHING;
