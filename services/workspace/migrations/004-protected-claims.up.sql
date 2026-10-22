SET LOCAL search_path = workspace, pg_catalog;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM idempotency_record WHERE operation = 'protected_handoff') THEN
    RAISE EXCEPTION 'Legacy protected handoff claims require explicit reconciliation' USING ERRCODE = '23514';
  END IF;
END $$;
ALTER TABLE idempotency_record ADD COLUMN claim_fence uuid, ADD COLUMN process_ref uuid;
ALTER TABLE idempotency_record ADD CONSTRAINT protected_claim_shape CHECK (
  (operation = 'protected_handoff' AND claim_fence IS NOT NULL AND process_ref IS NOT NULL
    AND state = 'pending' AND result_ref IS NULL AND expires_at = 'infinity'::timestamptz
    AND length(idempotency_key) > 0 AND payload_hash ~ '^[a-f0-9]{64}$')
  OR (operation <> 'protected_handoff' AND claim_fence IS NULL AND process_ref IS NULL)
);
ALTER TABLE idempotency_record ADD CONSTRAINT protected_claim_identity
  UNIQUE (actor_id, operation, idempotency_key, claim_fence);
CREATE FUNCTION protect_claim_record() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.operation = 'protected_handoff' OR (TG_OP = 'UPDATE' AND NEW.operation = 'protected_handoff') THEN
    RAISE EXCEPTION 'Protected handoff claim is permanently consumed' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER immutable_protected_claim BEFORE UPDATE OR DELETE ON idempotency_record
  FOR EACH ROW EXECUTE FUNCTION protect_claim_record();

CREATE FUNCTION claim_protected_handoff(actor uuid, identity text, digest text, process uuid)
RETURNS uuid LANGUAGE plpgsql STRICT SET search_path = workspace, pg_catalog AS $$
DECLARE fence uuid;
BEGIN
  INSERT INTO workspace.idempotency_record(actor_id, operation, idempotency_key, payload_hash,
    state, expires_at, claim_fence, process_ref)
  VALUES (actor, 'protected_handoff', identity, digest, 'pending', 'infinity', gen_random_uuid(), process)
  ON CONFLICT (actor_id, operation, idempotency_key) DO NOTHING
  RETURNING claim_fence INTO fence;
  -- NULL includes a duplicate with changed digest/process. Never return an old fence.
  RETURN fence;
END $$;

CREATE TABLE protected_handoff_outcome (
  outcome_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  operation text NOT NULL DEFAULT 'protected_handoff' CHECK (operation = 'protected_handoff'),
  handoff_id text NOT NULL,
  claim_fence uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('completed','aborted','unknown')),
  observed_at timestamptz NOT NULL DEFAULT clock_timestamp() CHECK (isfinite(observed_at)),
  enforcement_ref text NOT NULL CHECK (length(enforcement_ref) > 0),
  FOREIGN KEY (actor_id, operation, handoff_id, claim_fence)
    REFERENCES idempotency_record(actor_id, operation, idempotency_key, claim_fence)
);
CREATE INDEX protected_outcome_history ON protected_handoff_outcome(actor_id, handoff_id, observed_at, outcome_id);
CREATE FUNCTION protect_handoff_outcome() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Protected handoff outcomes are append-only' USING ERRCODE = '23514';
END $$;
CREATE TRIGGER immutable_protected_outcome BEFORE UPDATE OR DELETE ON protected_handoff_outcome
  FOR EACH ROW EXECUTE FUNCTION protect_handoff_outcome();
REVOKE ALL ON FUNCTION protect_claim_record(), claim_protected_handoff(uuid,text,text,uuid), protect_handoff_outcome() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim_protected_handoff(uuid,text,text,uuid) TO workspace_app;
GRANT SELECT, INSERT ON protected_handoff_outcome TO workspace_app;
