SET LOCAL search_path = workspace, pg_catalog;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM idempotency_record WHERE operation IN ('createProject','addMember','removeMember')) THEN
  RAISE EXCEPTION 'Project outcomes retained; use reviewed forward recovery' USING ERRCODE='23514';
 END IF;
END $$;
DROP TRIGGER immutable_project_outcome ON idempotency_record;
DROP FUNCTION protect_project_outcome();
ALTER TABLE idempotency_record DROP CONSTRAINT project_outcome_shape, DROP COLUMN result_status, DROP COLUMN result_snapshot;
