SET LOCAL search_path = workspace, pg_catalog;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM project) THEN
  RAISE EXCEPTION 'Project creator/time requires explicit legacy reconciliation; records retained' USING ERRCODE='23514';
 END IF;
END $$;

ALTER TABLE project ADD COLUMN created_by uuid NOT NULL REFERENCES auth_account(user_id),
 ADD COLUMN created_at timestamptz NOT NULL;
ALTER TABLE project ADD CONSTRAINT project_safe_revision CHECK(revision<=9007199254740991);
ALTER TABLE membership ADD CONSTRAINT membership_safe_revision CHECK(revision<=9007199254740991);
ALTER TABLE task ADD CONSTRAINT task_safe_revision CHECK(revision<=9007199254740991);
CREATE FUNCTION protect_project_origin() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.created_by IS DISTINCT FROM OLD.created_by OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
  RAISE EXCEPTION 'Project origin is immutable' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER immutable_project_origin BEFORE UPDATE ON project FOR EACH ROW EXECUTE FUNCTION protect_project_origin();

CREATE TABLE global_project_authority (
 user_id uuid PRIMARY KEY REFERENCES auth_account,
 can_create boolean NOT NULL,
 revision bigint NOT NULL CHECK(revision>0)
);
CREATE TABLE authority_provisioning_audit (
 event_id uuid PRIMARY KEY,
 target_user_id uuid NOT NULL REFERENCES auth_account,
 project_id uuid REFERENCES project,
 action text NOT NULL CHECK(action IN ('create-project','membership-manage','project-administrator')),
 allowed boolean NOT NULL,
 previous_revision bigint NOT NULL CHECK(previous_revision>=0),
 revision bigint NOT NULL CHECK(revision>previous_revision),
 operator_ref text NOT NULL CHECK(octet_length(operator_ref) BETWEEN 1 AND 1024),
 reason text NOT NULL CHECK(octet_length(reason) BETWEEN 1 AND 1024),
 database_principal text NOT NULL DEFAULT session_user,
 recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK((action='create-project' AND project_id IS NULL) OR (action<>'create-project' AND project_id IS NOT NULL))
);
CREATE FUNCTION protect_authority_audit() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Authority audit is append-only' USING ERRCODE='23514'; END $$;
CREATE TRIGGER immutable_authority_audit BEFORE UPDATE OR DELETE ON authority_provisioning_audit FOR EACH ROW EXECUTE FUNCTION protect_authority_audit();
CREATE UNIQUE INDEX one_current_project_capability ON capability_grant(project_id,subject_id,action)
 WHERE valid AND resource_kind='project' AND resource_id=project_id AND action IN ('membership-manage','project-administrator');
GRANT SELECT ON global_project_authority TO workspace_app;
-- Private provisioning and its global audit stay owner-only. Existing service grants do not apply to new tables.
