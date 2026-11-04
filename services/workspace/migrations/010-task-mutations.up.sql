SET LOCAL search_path = workspace, pg_catalog;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM idempotency_record WHERE operation IN ('editTask','setTaskState','setAssignee','recordBlocker'))
  OR EXISTS(SELECT 1 FROM capability_grant WHERE action IN ('task-edit','task-state','task-assign','task-blocker'))
  OR EXISTS(SELECT 1 FROM authority_provisioning_audit WHERE action IN ('task-edit','task-state','task-assign','task-blocker'))
  OR EXISTS(SELECT 1 FROM blocker_event)
  OR EXISTS(SELECT 1 FROM business_audit WHERE action IN ('editTask','setTaskState','setAssignee','recordBlocker','backlog-item-edit','board-state-change','assignee-set','blocker-event-record')) THEN
  RAISE EXCEPTION 'Legacy Task mutation data requires explicit reconciliation; records retained' USING ERRCODE='23514';
 END IF;
END $$;
ALTER TABLE authority_provisioning_audit DROP CONSTRAINT authority_provisioning_audit_action_check,
 ADD CONSTRAINT authority_provisioning_audit_action_check CHECK(action IN ('create-project','membership-manage','project-administrator','backlog-author','task-edit','task-state','task-assign','task-blocker'));
ALTER TABLE capability_grant ADD CONSTRAINT task_action_scope CHECK(action NOT IN ('task-edit','task-state','task-assign','task-blocker') OR
 (resource_kind='project' AND resource_id=project_id AND permission_revision<=9007199254740991));
ALTER TABLE blocker_event ADD CONSTRAINT blocker_event_safe_sequence CHECK(sequence<=9007199254740991),
 ADD CONSTRAINT blocker_event_finite_time CHECK(isfinite(recorded_at));
CREATE UNIQUE INDEX one_current_task_action ON capability_grant(project_id,subject_id,action)
 WHERE valid AND action IN ('task-edit','task-state','task-assign','task-blocker');
CREATE FUNCTION protect_task_action_provisioning() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 IF (NEW.action IN ('task-edit','task-state','task-assign','task-blocker') OR (TG_OP='UPDATE' AND OLD.action IN ('task-edit','task-state','task-assign','task-blocker'))) AND current_user<>'workspace_owner' THEN
  IF TG_OP<>'UPDATE' THEN
   RAISE EXCEPTION 'Task action provisioning requires private operator role' USING ERRCODE='42501';
  END IF;
  IF NOT (OLD.action IN ('task-edit','task-state','task-assign','task-blocker') AND OLD.valid AND NOT NEW.valid
   AND NEW.grant_id=OLD.grant_id AND NEW.subject_id=OLD.subject_id AND NEW.project_id=OLD.project_id
   AND NEW.resource_kind=OLD.resource_kind AND NEW.resource_id=OLD.resource_id AND NEW.action=OLD.action
   AND NEW.permission_revision=OLD.permission_revision+1) THEN
   RAISE EXCEPTION 'Runtime may only invalidate existing Task action grants' USING ERRCODE='42501';
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER private_task_action BEFORE INSERT OR UPDATE ON capability_grant FOR EACH ROW EXECUTE FUNCTION protect_task_action_provisioning();

-- These validators are total and describe retained wire snapshots, not mutable live rows.
CREATE FUNCTION valid_task_mutation_snapshot(value jsonb, reference text) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog AS $$
BEGIN
 RETURN (
  jsonb_typeof(value)='object'
  AND value ?& ARRAY['task_id','project_id','type','title','description','state','assignee_id','blocked','revision','work_location','created_at']
  AND value-ARRAY['task_id','project_id','type','title','description','state','assignee_id','blocked','revision','work_location','created_at']='{}'::jsonb
  AND jsonb_typeof(value->'task_id')='string' AND value->>'task_id'=reference AND (value->>'task_id')::uuid IS NOT NULL
  AND jsonb_typeof(value->'project_id')='string' AND (value->>'project_id')::uuid IS NOT NULL
  AND jsonb_typeof(value->'type')='string' AND value->>'type' IN ('story','task','bug')
  AND jsonb_typeof(value->'title')='string' AND length(btrim(value->>'title'))>0
  AND jsonb_typeof(value->'description')='string'
  AND jsonb_typeof(value->'state')='string' AND value->>'state' IN ('todo','in_progress','done')
  AND (value->'assignee_id'='null'::jsonb OR (jsonb_typeof(value->'assignee_id')='string' AND (value->>'assignee_id')::uuid IS NOT NULL))
  AND jsonb_typeof(value->'blocked')='boolean'
  AND jsonb_typeof(value->'revision')='number' AND value->>'revision' ~ '^[1-9][0-9]*$'
  AND (value->>'revision')::numeric<=9007199254740991
  AND jsonb_typeof(value->'work_location')='object'
  AND (
   (value->'work_location' ?& ARRAY['kind','position']
    AND (value->'work_location')-ARRAY['kind','position']='{}'::jsonb
    AND value->'work_location'->>'kind'='backlog'
    AND jsonb_typeof(value->'work_location'->'position')='string'
    AND value->'work_location'->>'position' ~ '^-?[0-9]+(\.[0-9]+)?$'
    AND (value->'work_location'->>'position')::numeric IS NOT NULL)
   OR (value->'work_location' ?& ARRAY['kind','sprint_id']
    AND (value->'work_location')-ARRAY['kind','sprint_id']='{}'::jsonb
    AND value->'work_location'->>'kind' IN ('sprint','completed')
    AND jsonb_typeof(value->'work_location'->'sprint_id')='string'
    AND (value->'work_location'->>'sprint_id')::uuid IS NOT NULL
    AND (value->'work_location'->>'kind'<>'completed' OR value->>'state'='done'))
  )
  AND jsonb_typeof(value->'created_at')='string'
  AND value->>'created_at' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$'
  AND isfinite((value->>'created_at')::timestamptz)
  AND to_char((value->>'created_at')::timestamptz AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')=value->>'created_at'
 ) IS TRUE;
EXCEPTION WHEN OTHERS THEN RETURN false;
END $$;

CREATE FUNCTION valid_blocker_mutation_snapshot(value jsonb, reference text) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog AS $$
DECLARE stamp text; fractional text;
BEGIN
 stamp:=value->>'recorded_at';
 fractional:=split_part(split_part(stamp,'.',2),'Z',1);
 IF position('.' in stamp)=0 THEN fractional:=''; END IF;
 RETURN (
  jsonb_typeof(value)='object'
  AND value ?& ARRAY['event_id','task_id','status','description','outcome','actor_id','recorded_at','sequence']
  AND value-ARRAY['event_id','task_id','status','description','outcome','actor_id','recorded_at','sequence']='{}'::jsonb
  AND jsonb_typeof(value->'event_id')='string' AND value->>'event_id'=reference AND (value->>'event_id')::uuid IS NOT NULL
  AND jsonb_typeof(value->'task_id')='string' AND (value->>'task_id')::uuid IS NOT NULL
  AND jsonb_typeof(value->'actor_id')='string' AND (value->>'actor_id')::uuid IS NOT NULL
  AND jsonb_typeof(value->'status')='string' AND value->>'status' IN ('open','resolved')
  AND jsonb_typeof(value->'description')='string' AND length(btrim(value->>'description'))>0
  AND (value->'outcome'='null'::jsonb OR jsonb_typeof(value->'outcome')='string')
  AND jsonb_typeof(value->'sequence')='number' AND value->>'sequence' ~ '^[1-9][0-9]*$'
  AND (value->>'sequence')::numeric<=9007199254740991
  AND jsonb_typeof(value->'recorded_at')='string'
  AND stamp ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,6})?Z$'
  AND isfinite(stamp::timestamptz)
  AND to_char(stamp::timestamptz AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
   =left(stamp,19)||'.'||rpad(fractional,6,'0')||'Z'
 ) IS TRUE;
EXCEPTION WHEN OTHERS THEN RETURN false;
END $$;

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

