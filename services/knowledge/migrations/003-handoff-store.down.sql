SET LOCAL search_path = knowledge, pg_catalog;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM handoff_manifest) OR EXISTS (SELECT 1 FROM handoff_outcome) THEN
    RAISE EXCEPTION 'Nonempty handoff records require reviewed forward recovery' USING ERRCODE = '23514';
  END IF;
END $$;
DROP TABLE handoff_outcome, handoff_manifest;
DROP FUNCTION protect_handoff_record(), valid_handoff_manifest(jsonb,bytea,text,uuid,uuid,uuid), handoff_keys(jsonb,text[]);
ALTER TABLE execution DROP CONSTRAINT execution_handoff_owner;
