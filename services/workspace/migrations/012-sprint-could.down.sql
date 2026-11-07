SET LOCAL search_path=workspace,pg_catalog;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM workspace.idempotency_record WHERE operation IN ('editSprint','removeAllocation'))
 OR EXISTS(SELECT 1 FROM workspace.capability_grant WHERE action IN ('sprint-edit','sprint-deallocate'))
 OR EXISTS(SELECT 1 FROM workspace.authority_provisioning_audit WHERE action IN ('sprint-edit','sprint-deallocate'))
 OR EXISTS(SELECT 1 FROM workspace.business_audit WHERE action IN ('sprint-edit','sprint-deallocate'))
 THEN RAISE EXCEPTION 'Could Sprint evidence retained; forward recovery required' USING ERRCODE='23514'; END IF;
END $$;
DROP INDEX one_current_sprint_action;
ALTER TABLE capability_grant DROP CONSTRAINT sprint_action_scope;
ALTER TABLE authority_provisioning_audit DROP CONSTRAINT authority_provisioning_audit_action_check, ADD CONSTRAINT authority_provisioning_audit_action_check CHECK(action IN ('create-project','membership-manage','project-administrator','backlog-author','task-edit','task-state','task-assign','task-blocker','sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order'));
ALTER TABLE capability_grant ADD CONSTRAINT sprint_action_scope CHECK(action NOT IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order') OR (resource_kind='project' AND resource_id=project_id AND permission_revision<=9007199254740991));
CREATE UNIQUE INDEX one_current_sprint_action ON capability_grant(project_id,subject_id,action) WHERE valid AND action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order');
CREATE OR REPLACE FUNCTION protect_sprint_action() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 IF (NEW.action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order') OR (TG_OP='UPDATE' AND OLD.action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order'))) AND current_user<>'workspace_owner' THEN
  IF TG_OP<>'UPDATE' THEN RAISE EXCEPTION 'Private Sprint provisioning required' USING ERRCODE='42501'; END IF;
  IF NOT (OLD.action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order') AND OLD.valid AND NOT NEW.valid AND NEW.grant_id=OLD.grant_id AND NEW.subject_id=OLD.subject_id AND NEW.project_id=OLD.project_id AND NEW.resource_kind=OLD.resource_kind AND NEW.resource_id=OLD.resource_id AND NEW.action=OLD.action AND NEW.permission_revision=OLD.permission_revision+1) THEN RAISE EXCEPTION 'Runtime may only invalidate Sprint grants' USING ERRCODE='42501'; END IF;
 END IF; RETURN NEW; END $$;

CREATE OR REPLACE FUNCTION valid_sprint_receipt(v jsonb,reference text,op text,status integer) RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog AS $$ BEGIN
 IF op='reorderBacklog' THEN RETURN (status=200 AND jsonb_typeof(v)='object' AND v ?& ARRAY['project_id','backlog_revision'] AND v-ARRAY['project_id','backlog_revision']='{}'::jsonb AND v->>'project_id'=reference AND (v->>'project_id')::uuid IS NOT NULL AND jsonb_typeof(v->'backlog_revision')='string' AND v->>'backlog_revision' ~ '^[1-9][0-9]*$' AND (v->>'backlog_revision')::bigint>0) IS TRUE; END IF;
 IF op='completeSprint' THEN RETURN (status=200 AND jsonb_typeof(v)='object' AND v ?& ARRAY['sprint','retained_done_count','returned_unfinished_count'] AND v-ARRAY['sprint','retained_done_count','returned_unfinished_count']='{}'::jsonb AND workspace.valid_sprint_snapshot(v->'sprint',reference) AND jsonb_typeof(v->'retained_done_count')='number' AND v->>'retained_done_count' ~ '^(0|[1-9][0-9]*)$' AND (v->>'retained_done_count')::numeric<=9007199254740991 AND jsonb_typeof(v->'returned_unfinished_count')='number' AND v->>'returned_unfinished_count' ~ '^(0|[1-9][0-9]*)$' AND (v->>'returned_unfinished_count')::numeric<=9007199254740991) IS TRUE; END IF;
 RETURN (op IN ('createSprint','allocateTask','startSprint') AND status=CASE WHEN op='createSprint' THEN 201 ELSE 200 END AND workspace.valid_sprint_snapshot(v,reference)) IS TRUE;
EXCEPTION WHEN OTHERS THEN RETURN false; END $$;
ALTER TABLE idempotency_record DROP CONSTRAINT project_outcome_shape;
ALTER TABLE idempotency_record ADD CONSTRAINT project_outcome_shape CHECK (((operation IN ('createSprint','allocateTask','startSprint','completeSprint','reorderBacklog') AND state='committed' AND expires_at='infinity'::timestamptz AND payload_hash ~ '^[a-f0-9]{64}$' AND length(idempotency_key)>0 AND result_ref IS NOT NULL AND valid_sprint_receipt(result_snapshot,result_ref,operation,result_status)) OR (operation NOT IN ('createSprint','allocateTask','startSprint','completeSprint','reorderBacklog') AND ((
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
) IS TRUE))) IS TRUE);
CREATE OR REPLACE FUNCTION protect_project_outcome() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.operation IN ('createProject','addMember','removeMember','createTask','editTask','setTaskState','setAssignee','recordBlocker','createSprint','allocateTask','startSprint','completeSprint','reorderBacklog') OR (TG_OP='UPDATE' AND NEW.operation IN ('createProject','addMember','removeMember','createTask','editTask','setTaskState','setAssignee','recordBlocker','createSprint','allocateTask','startSprint','completeSprint','reorderBacklog')) THEN
  RAISE EXCEPTION 'Committed project/task outcome identity is immutable' USING ERRCODE='23514';
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;
