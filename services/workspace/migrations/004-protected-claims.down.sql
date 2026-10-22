SET LOCAL search_path = workspace, pg_catalog;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM idempotency_record WHERE operation = 'protected_handoff')
     OR EXISTS (SELECT 1 FROM protected_handoff_outcome) THEN
    RAISE EXCEPTION 'Consumed handoff claims require reviewed forward recovery' USING ERRCODE = '23514';
  END IF;
END $$;
DROP TABLE protected_handoff_outcome;
DROP TRIGGER immutable_protected_claim ON idempotency_record;
DROP FUNCTION protect_handoff_outcome(), claim_protected_handoff(uuid,text,text,uuid), protect_claim_record();
ALTER TABLE idempotency_record DROP CONSTRAINT protected_claim_identity, DROP CONSTRAINT protected_claim_shape;
ALTER TABLE idempotency_record DROP COLUMN process_ref, DROP COLUMN claim_fence;
