SET LOCAL search_path = workspace, pg_catalog;
ALTER TABLE authentication_audit DROP CONSTRAINT authentication_audit_action_check;
ALTER TABLE authentication_audit ADD CONSTRAINT authentication_audit_action_check CHECK (action IN ('account_provisioned','account_disabled','session_created','clock_fault','clock_recovered','session_renewed','session_revoked'));
