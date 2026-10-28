SET LOCAL search_path = workspace, pg_catalog;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM auth_account) OR EXISTS(SELECT 1 FROM session_token)
    OR EXISTS(SELECT 1 FROM authentication_audit)
    OR EXISTS(SELECT 1 FROM auth_clock_state WHERE last_observed IS NOT NULL OR recovery_generation<>0) THEN
  RAISE EXCEPTION 'Session foundation contains retained identities/evidence; use forward recovery' USING ERRCODE='23514';
 END IF;
END $$;
DROP TRIGGER session_deadline_check ON session;
ALTER TABLE session DROP CONSTRAINT session_auth_account;
DROP FUNCTION lock_auth_account(uuid);
DROP TABLE session_token,authentication_audit,auth_clock_state,auth_account;
DROP FUNCTION enforce_session_deadline(),protect_session_token(),protect_auth_clock(),protect_auth_audit();
