SET LOCAL search_path = workspace, pg_catalog;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM document_policy WHERE registry_state = 'pending') THEN
    RAISE EXCEPTION 'ADR-0011 upgrade requires reconciliation of pending document registrations';
  END IF;
END $$;

ALTER TABLE document_policy DROP CONSTRAINT document_policy_registry_state_check;
ALTER TABLE document_policy ADD CONSTRAINT document_policy_registry_state_check
  CHECK (registry_state IN ('active', 'unavailable'));
ALTER TABLE document_policy ALTER COLUMN registry_state SET DEFAULT 'active';

-- Active now means policy registered, never proof that Knowledge has content.
-- Read handlers still require content availability plus current authorisation.
-- No activation mutation, inferred grant or orphan deletion is performed here.
