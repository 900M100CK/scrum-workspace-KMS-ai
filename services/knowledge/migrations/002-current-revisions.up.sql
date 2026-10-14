SET LOCAL search_path = knowledge, public, pg_catalog;

-- Never publish or discard pre-existing unpublished evidence implicitly.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM document_version WHERE state = 'draft') THEN
    RAISE EXCEPTION 'ADR-0009 upgrade requires explicit reconciliation of existing Draft versions';
  END IF;
END $$;

ALTER TABLE document_version DROP CONSTRAINT document_version_state_check;
ALTER TABLE document_version ADD CONSTRAINT document_version_state_check
  CHECK (state IN ('current', 'superseded', 'archived'));

CREATE OR REPLACE FUNCTION protect_version() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.document_id <> OLD.document_id OR NEW.version_id <> OLD.version_id
     OR NEW.immutable_content <> OLD.immutable_content OR NEW.created_at <> OLD.created_at
     OR NEW.revision <> OLD.revision + 1
     OR NOT ((OLD.state = 'current' AND NEW.state IN ('superseded', 'archived'))
          OR (OLD.state = 'superseded' AND NEW.state = 'archived')) THEN
    RAISE EXCEPTION 'Immutable evidence or invalid version transition' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;

-- Existing deferred pointer checks and the unique Current index remain in force.
-- Revision supersedes the old Current, inserts the new Current, and updates the
-- document pointer/revision in one transaction. No evidence is rewritten here.
