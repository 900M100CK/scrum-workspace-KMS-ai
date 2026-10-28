SET LOCAL search_path = workspace, pg_catalog;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM authentication_audit WHERE action IN ('session_renewed','session_revoked')) THEN
  RAISE EXCEPTION 'Lifecycle audit retained; explicit reconciliation required' USING ERRCODE='23514';
 END IF;
END $$;
ALTER TABLE authentication_audit DROP CONSTRAINT authentication_audit_action_check;
ALTER TABLE authentication_audit ADD CONSTRAINT authentication_audit_action_check CHECK (action IN ('account_provisioned','account_disabled','session_created','clock_fault','clock_recovered'));
