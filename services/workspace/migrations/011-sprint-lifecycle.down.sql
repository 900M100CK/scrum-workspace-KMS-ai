SET LOCAL search_path=workspace,pg_catalog;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM idempotency_record WHERE operation IN ('createSprint','allocateTask','startSprint','completeSprint','reorderBacklog')) OR EXISTS(SELECT 1 FROM capability_grant WHERE action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order')) OR EXISTS(SELECT 1 FROM authority_provisioning_audit WHERE action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order')) OR EXISTS(SELECT 1 FROM business_audit WHERE action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-reorder')) THEN RAISE EXCEPTION 'Sprint evidence requires explicit reconciliation; retained' USING ERRCODE='23514'; END IF;
END $$;
DO $$ BEGIN IF EXISTS(SELECT 1 FROM sprint WHERE created_at IS NOT NULL OR started_at IS NOT NULL OR completed_at IS NOT NULL) THEN RAISE EXCEPTION 'Sprint timestamps retained; forward recovery required' USING ERRCODE='23514'; END IF; END $$;
ALTER TABLE idempotency_record DROP CONSTRAINT project_outcome_shape;
ALTER TABLE idempotency_record ADD CONSTRAINT project_outcome_shape CHECK ((
 (operation IN ('editTask','setTaskState','setAssignee','recordBlocker') AND state='committed' AND expires_at='infinity'::timestamptz
  AND payload_hash ~ '^[a-f0-9]{64}$' AND length(idempotency_key)>0 AND result_ref IS NOT NULL
  AND ((operation IN ('editTask','setTaskState','setAssignee') AND result_status=200 AND valid_task_mutation_snapshot(result_snapshot,result_ref))
   OR (operation='recordBlocker' AND result_status=201 AND valid_blocker_mutation_snapshot(result_snapshot,result_ref))))
 OR (operation NOT IN ('editTask','setTaskState','setAssignee','recordBlocker') AND (((
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
) IS TRUE))) IS TRUE))
) IS TRUE);
CREATE OR REPLACE FUNCTION protect_project_outcome() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.operation IN ('createProject','addMember','removeMember','createTask','editTask','setTaskState','setAssignee','recordBlocker') OR (TG_OP='UPDATE' AND NEW.operation IN ('createProject','addMember','removeMember','createTask','editTask','setTaskState','setAssignee','recordBlocker')) THEN
  RAISE EXCEPTION 'Committed project/task outcome identity is immutable' USING ERRCODE='23514';
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;


DROP FUNCTION valid_sprint_receipt(jsonb,text,text,integer);
DROP FUNCTION valid_sprint_snapshot(jsonb,text);
DROP TRIGGER private_sprint_action ON capability_grant;
DROP FUNCTION protect_sprint_action();
DROP INDEX one_current_sprint_action;
ALTER TABLE capability_grant DROP CONSTRAINT sprint_action_scope;
ALTER TABLE authority_provisioning_audit DROP CONSTRAINT authority_provisioning_audit_action_check, ADD CONSTRAINT authority_provisioning_audit_action_check CHECK(action IN ('create-project','membership-manage','project-administrator','backlog-author','task-edit','task-state','task-assign','task-blocker'));
ALTER TABLE sprint DROP CONSTRAINT finite_sprint_times, DROP COLUMN created_at, DROP COLUMN started_at, DROP COLUMN completed_at;
