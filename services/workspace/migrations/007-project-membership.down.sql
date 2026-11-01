SET LOCAL search_path = workspace, pg_catalog;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM global_project_authority) OR EXISTS(SELECT 1 FROM authority_provisioning_audit) OR EXISTS(SELECT 1 FROM project) THEN
  RAISE EXCEPTION 'Project authority/origin/audit retained; use reviewed forward recovery' USING ERRCODE='23514';
 END IF;
END $$;
DROP INDEX one_current_project_capability;
DROP TABLE authority_provisioning_audit;
DROP FUNCTION protect_authority_audit();
DROP TABLE global_project_authority;
DROP TRIGGER immutable_project_origin ON project;
DROP FUNCTION protect_project_origin();
ALTER TABLE project DROP CONSTRAINT project_safe_revision, DROP COLUMN created_by, DROP COLUMN created_at;
ALTER TABLE membership DROP CONSTRAINT membership_safe_revision;
ALTER TABLE task DROP CONSTRAINT task_safe_revision;
-- This migration never modifies SP-01 accounts, session tables, clock state or authentication audit.
