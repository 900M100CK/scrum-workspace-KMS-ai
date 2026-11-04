SET LOCAL search_path = workspace, pg_catalog;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM idempotency_record WHERE operation IN ('editTask','setTaskState','setAssignee','recordBlocker'))
  OR EXISTS(SELECT 1 FROM capability_grant WHERE action IN ('task-edit','task-state','task-assign','task-blocker'))
  OR EXISTS(SELECT 1 FROM authority_provisioning_audit WHERE action IN ('task-edit','task-state','task-assign','task-blocker'))
  OR EXISTS(SELECT 1 FROM blocker_event)
  OR EXISTS(SELECT 1 FROM business_audit WHERE action IN ('editTask','setTaskState','setAssignee','recordBlocker','backlog-item-edit','board-state-change','assignee-set','blocker-event-record')) THEN
  RAISE EXCEPTION 'Task mutation results, grants, audit or history data retained; use reviewed forward recovery' USING ERRCODE='23514';
 END IF;
END $$;
DROP TRIGGER private_task_action ON capability_grant;
DROP FUNCTION protect_task_action_provisioning();
DROP INDEX one_current_task_action;
ALTER TABLE capability_grant DROP CONSTRAINT task_action_scope;
ALTER TABLE blocker_event DROP CONSTRAINT blocker_event_safe_sequence, DROP CONSTRAINT blocker_event_finite_time;
ALTER TABLE authority_provisioning_audit DROP CONSTRAINT authority_provisioning_audit_action_check,
 ADD CONSTRAINT authority_provisioning_audit_action_check CHECK(action IN ('create-project','membership-manage','project-administrator','backlog-author'));
ALTER TABLE idempotency_record DROP CONSTRAINT project_outcome_shape;
ALTER TABLE idempotency_record ADD CONSTRAINT project_outcome_shape CHECK (((
operation='createTask' AND state='committed' AND expires_at='infinity'::timestamptz
 AND payload_hash ~ '^[a-f0-9]{64}$' AND length(idempotency_key)>0 AND result_ref IS NOT NULL
 AND result_status=201 AND valid_task_creation_snapshot(result_snapshot,result_ref)
) OR (operation<>'createTask' AND ((
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
) IS TRUE))) IS TRUE);
CREATE OR REPLACE FUNCTION protect_project_outcome() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.operation IN ('createProject','addMember','removeMember','createTask') OR (TG_OP='UPDATE' AND NEW.operation IN ('createProject','addMember','removeMember','createTask')) THEN
  RAISE EXCEPTION 'Committed project/task outcome identity is immutable' USING ERRCODE='23514';
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;

DROP FUNCTION valid_task_mutation_snapshot(jsonb,text);
DROP FUNCTION valid_blocker_mutation_snapshot(jsonb,text);
