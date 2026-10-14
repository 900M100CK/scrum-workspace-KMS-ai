SET LOCAL search_path = workspace, pg_catalog;

ALTER TABLE document_policy ALTER COLUMN registry_state DROP DEFAULT;
ALTER TABLE document_policy DROP CONSTRAINT document_policy_registry_state_check;
ALTER TABLE document_policy ADD CONSTRAINT document_policy_registry_state_check
  CHECK (registry_state IN ('pending', 'active', 'unavailable'));

-- Preserve policy rows and revisions when restoring the old allowed state set.
