SET LOCAL search_path = workspace, pg_catalog;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM workspace.session) THEN
  RAISE EXCEPTION 'Session migration requires explicit legacy reconciliation; records retained' USING ERRCODE='23514';
 END IF;
END $$;

CREATE TABLE auth_account (
 user_id uuid PRIMARY KEY,
 username text COLLATE "C" NOT NULL UNIQUE CHECK (octet_length(username) > 0),
 password_credential text NOT NULL CHECK (split_part(password_credential,'$',1)='scrypt' AND split_part(password_credential,'$',2)='v1' AND octet_length(password_credential)<=512),
 disabled boolean NOT NULL DEFAULT false,
 credential_revision bigint NOT NULL DEFAULT 1 CHECK (credential_revision > 0)
);
ALTER TABLE session ADD CONSTRAINT session_auth_account FOREIGN KEY(user_id) REFERENCES auth_account;
CREATE TABLE session_token (
 session_id uuid PRIMARY KEY REFERENCES session,
 token_digest text NOT NULL UNIQUE CHECK (token_digest ~ '^[0-9a-f]{64}$'),
 created_at timestamptz NOT NULL,
 absolute_expires_at timestamptz NOT NULL CHECK (absolute_expires_at > created_at)
);
CREATE TABLE auth_clock_state (
 singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
 last_observed timestamptz,
 healthy boolean NOT NULL DEFAULT false,
 recovery_generation bigint NOT NULL DEFAULT 0 CHECK (recovery_generation >= 0),
 CHECK (NOT healthy OR last_observed IS NOT NULL)
);
INSERT INTO auth_clock_state(singleton) VALUES(true);
CREATE TABLE authentication_audit (
 event_id uuid PRIMARY KEY,
 action text NOT NULL CHECK (action IN ('account_provisioned','account_disabled','session_created','clock_fault','clock_recovered')),
 actor_user_id uuid,
 entity_id uuid,
 operator_ref text,
 database_principal text NOT NULL DEFAULT session_user,
 observed_at timestamptz NOT NULL,
 recovery_generation bigint NOT NULL CHECK (recovery_generation >= 0),
 correlation_id uuid NOT NULL,
 evidence_ref text,
 CHECK (operator_ref IS NULL OR octet_length(operator_ref) BETWEEN 1 AND 1024),
 CHECK (evidence_ref IS NULL OR octet_length(evidence_ref) BETWEEN 1 AND 1024)
);

CREATE FUNCTION enforce_session_deadline() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target uuid;
BEGIN
 target := NEW.session_id;
 IF NOT EXISTS (SELECT 1 FROM workspace.session s JOIN workspace.session_token t USING(session_id)
                WHERE s.session_id=target AND s.expires_at<=t.absolute_expires_at AND s.expires_at>t.created_at) THEN
  RAISE EXCEPTION 'Missing or inconsistent session deadline' USING ERRCODE='23514';
 END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER session_deadline_check AFTER INSERT OR UPDATE ON session
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION enforce_session_deadline();
CREATE CONSTRAINT TRIGGER token_deadline_check AFTER INSERT OR UPDATE ON session_token
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION enforce_session_deadline();

CREATE FUNCTION protect_session_token() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Session token identity and absolute deadline are immutable' USING ERRCODE='23514'; END $$;
CREATE TRIGGER immutable_session_token BEFORE UPDATE OR DELETE ON session_token FOR EACH ROW EXECUTE FUNCTION protect_session_token();

CREATE FUNCTION protect_auth_clock() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT pg_has_role(current_user,'workspace_owner','USAGE') THEN
  IF (NOT OLD.healthy AND NEW.healthy) OR NEW.recovery_generation<>OLD.recovery_generation
     OR (OLD.last_observed IS NULL AND NEW.last_observed IS NOT NULL) THEN
   RAISE EXCEPTION 'Clock initialization/recovery requires operator role' USING ERRCODE='42501';
  END IF;
  IF OLD.last_observed IS NOT NULL AND (NEW.last_observed IS NULL OR NEW.last_observed<OLD.last_observed) THEN
   RAISE EXCEPTION 'Clock observation cannot move backwards' USING ERRCODE='23514';
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guarded_auth_clock BEFORE UPDATE ON auth_clock_state FOR EACH ROW EXECUTE FUNCTION protect_auth_clock();
CREATE FUNCTION protect_auth_audit() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Authentication audit is append-only' USING ERRCODE='23514'; END $$;
CREATE TRIGGER immutable_auth_audit BEFORE UPDATE OR DELETE ON authentication_audit FOR EACH ROW EXECUTE FUNCTION protect_auth_audit();

-- SELECT FOR UPDATE otherwise requires account UPDATE privilege. Expose only the required row lock/read.
CREATE FUNCTION lock_auth_account(target uuid) RETURNS TABLE(disabled boolean,revision text)
 LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,workspace AS $$
 SELECT a.disabled,a.credential_revision::text FROM workspace.auth_account a WHERE a.user_id=target FOR UPDATE;
$$;
REVOKE ALL ON FUNCTION lock_auth_account(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION lock_auth_account(uuid) TO workspace_app;

GRANT SELECT ON auth_account TO workspace_app;
GRANT SELECT,INSERT ON session_token,authentication_audit TO workspace_app;
GRANT SELECT,UPDATE ON auth_clock_state TO workspace_app;
-- No runtime credential/account writes, token rewrites, audit rewrites/deletes, fault reset or cross-service grants.
