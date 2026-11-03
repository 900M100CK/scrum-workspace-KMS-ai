SET LOCAL search_path = workspace, pg_catalog;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM task) OR EXISTS(SELECT 1 FROM sprint_allocation)
  OR EXISTS(SELECT 1 FROM blocker_event) OR EXISTS(SELECT 1 FROM idempotency_record WHERE operation='createTask')
  OR EXISTS(SELECT 1 FROM capability_grant WHERE action='backlog-author')
  OR EXISTS(SELECT 1 FROM authority_provisioning_audit WHERE action='backlog-author')
  OR EXISTS(SELECT 1 FROM business_audit WHERE action IN ('backlog-item-create','createTask')) THEN
  RAISE EXCEPTION 'Task origins, outcomes, author or history data retained; use reviewed forward recovery' USING ERRCODE='23514';
 END IF;
END $$;
DROP TRIGGER private_backlog_author ON capability_grant;
DROP FUNCTION protect_backlog_author_provisioning();
DROP INDEX one_current_backlog_author;
ALTER TABLE authority_provisioning_audit DROP CONSTRAINT authority_provisioning_audit_action_check,
 ADD CONSTRAINT authority_provisioning_audit_action_check CHECK(action IN ('create-project','membership-manage','project-administrator'));
DROP TRIGGER immutable_task_origin ON task;
DROP FUNCTION protect_task_origin();
ALTER TABLE task DROP CONSTRAINT task_creation_time, DROP COLUMN created_at;
ALTER TABLE idempotency_record DROP CONSTRAINT project_outcome_shape;
ALTER TABLE idempotency_record ADD CONSTRAINT project_outcome_shape CHECK ((
 (operation NOT IN ('createProject','addMember','removeMember') AND result_status IS NULL AND result_snapshot IS NULL)
 OR (operation IN ('createProject','addMember','removeMember') AND state='committed' AND expires_at='infinity'::timestamptz
  AND payload_hash ~ '^[a-f0-9]{64}$' AND length(idempotency_key)>0 AND result_ref IS NOT NULL
  AND result_status IS NOT NULL AND (
   (operation='removeMember' AND result_status=204 AND result_snapshot IS NULL)
   OR (operation IN ('createProject','addMember') AND result_status=201 AND result_snapshot IS NOT NULL
    AND jsonb_typeof(result_snapshot)='object' AND result_snapshot->>'project_id'=result_ref
    AND result_snapshot ? 'revision' AND jsonb_typeof(result_snapshot->'revision')='number'
    AND result_snapshot->>'revision' ~ '^[1-9][0-9]*$' AND (result_snapshot->>'revision')::numeric<=9007199254740991
    AND (
     (operation='createProject' AND result_snapshot ?& ARRAY['project_id','name','description','revision']
      AND result_snapshot-ARRAY['project_id','name','description','revision']='{}'::jsonb
      AND jsonb_typeof(result_snapshot->'name')='string' AND jsonb_typeof(result_snapshot->'description')='string')
     OR (operation='addMember' AND result_snapshot ?& ARRAY['project_id','user_id','role','revision']
      AND result_snapshot-ARRAY['project_id','user_id','role','revision']='{}'::jsonb
      AND jsonb_typeof(result_snapshot->'user_id')='string'
      AND result_snapshot->>'role' IN ('product_owner','scrum_master','developer','viewer'))
    ))
  ))
) IS TRUE);
CREATE OR REPLACE FUNCTION protect_project_outcome() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.operation IN ('createProject','addMember','removeMember') OR (TG_OP='UPDATE' AND NEW.operation IN ('createProject','addMember','removeMember')) THEN
  RAISE EXCEPTION 'Committed project outcome identity is immutable' USING ERRCODE='23514';
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;
DROP FUNCTION valid_task_creation_snapshot(jsonb,text);
