SET LOCAL search_path = workspace, pg_catalog;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM task) OR EXISTS(SELECT 1 FROM idempotency_record WHERE operation='createTask')
  OR EXISTS(SELECT 1 FROM capability_grant WHERE action='backlog-author')
  OR EXISTS(SELECT 1 FROM authority_provisioning_audit WHERE action='backlog-author') THEN
  RAISE EXCEPTION 'Legacy task origins, outcomes or authors require explicit reconciliation; records retained' USING ERRCODE='23514';
 END IF;
END $$;
ALTER TABLE task ADD COLUMN created_at timestamptz NOT NULL,
 ADD CONSTRAINT task_creation_time CHECK(isfinite(created_at) AND created_at=date_trunc('milliseconds',created_at));
CREATE FUNCTION protect_task_origin() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
  RAISE EXCEPTION 'Task creation time is immutable' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER immutable_task_origin BEFORE UPDATE ON task FOR EACH ROW EXECUTE FUNCTION protect_task_origin();
ALTER TABLE authority_provisioning_audit DROP CONSTRAINT authority_provisioning_audit_action_check,
 ADD CONSTRAINT authority_provisioning_audit_action_check CHECK(action IN ('create-project','membership-manage','project-administrator','backlog-author'));
CREATE UNIQUE INDEX one_current_backlog_author ON capability_grant(project_id,subject_id)
 WHERE valid AND resource_kind='project' AND resource_id=project_id AND action='backlog-author';
CREATE FUNCTION protect_backlog_author_provisioning() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.action='backlog-author' AND NEW.valid AND current_user<>'workspace_owner' THEN
  RAISE EXCEPTION 'Backlog author provisioning requires private operator role' USING ERRCODE='42501';
 END IF;
 RETURN NEW;
END $$;
-- Ordinary runtime removal can invalidate grants; it cannot issue or revive authors.
CREATE TRIGGER private_backlog_author BEFORE INSERT OR UPDATE ON capability_grant FOR EACH ROW EXECUTE FUNCTION protect_backlog_author_provisioning();

-- Total validation: malformed JSON/casts reject rather than exploiting SQL NULL truth values.
CREATE FUNCTION valid_task_creation_snapshot(value jsonb, reference text) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog AS $$
BEGIN
 RETURN (
  jsonb_typeof(value)='object'
  AND value ?& ARRAY['task_id','project_id','type','title','description','state','assignee_id','blocked','revision','work_location','created_at']
  AND value-ARRAY['task_id','project_id','type','title','description','state','assignee_id','blocked','revision','work_location','created_at']='{}'::jsonb
  AND jsonb_typeof(value->'task_id')='string' AND value->>'task_id'=reference
  AND (value->>'task_id')::uuid IS NOT NULL
  AND jsonb_typeof(value->'project_id')='string' AND (value->>'project_id')::uuid IS NOT NULL
  AND value->>'type' IN ('story','task','bug')
  AND jsonb_typeof(value->'title')='string' AND length(btrim(value->>'title'))>0
  AND jsonb_typeof(value->'description')='string'
  AND value->>'state'='todo' AND value->'assignee_id'='null'::jsonb
  AND value->'blocked'='false'::jsonb AND value->'revision'='1'::jsonb
  AND jsonb_typeof(value->'work_location')='object'
  AND value->'work_location' ?& ARRAY['kind','position']
  AND (value->'work_location')-ARRAY['kind','position']='{}'::jsonb
  AND value->'work_location'->>'kind'='backlog'
  AND jsonb_typeof(value->'work_location'->'position')='string'
  AND value->'work_location'->>'position' ~ '^-?[0-9]+(\.[0-9]+)?$'
  AND (value->'work_location'->>'position')::numeric IS NOT NULL
  AND jsonb_typeof(value->'created_at')='string'
  AND value->>'created_at' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$'
  AND to_char((value->>'created_at')::timestamptz AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')=value->>'created_at'
 ) IS TRUE;
EXCEPTION WHEN OTHERS THEN RETURN false;
END $$;
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
