SET LOCAL search_path = knowledge, pg_catalog;

CREATE FUNCTION handoff_keys(value jsonb, keys text[]) RETURNS boolean
LANGUAGE sql IMMUTABLE STRICT SET search_path = knowledge, pg_catalog AS $$
  SELECT jsonb_typeof(value) = 'object' AND value ?& keys AND value - keys = '{}'::jsonb
$$;

CREATE FUNCTION valid_handoff_manifest(value jsonb, bytes bytea, identity text, run uuid, actor uuid, project uuid)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE STRICT SET search_path = knowledge, pg_catalog AS $$
DECLARE
  raw text;
  entry jsonb;
  field text;
  ids text[] := '{}';
  keys text[] := ARRAY['handoff_id','run_id','attempt_id','purpose','actor_id','project_id',
    'access_context_ref','session_generation','project_permission_revision','evidence_set',
    'payload_digest','payload_length','destination_ref','prepared_at','complete'];
BEGIN
  raw := convert_from(bytes, 'UTF8');
  IF NOT (raw IS JSON OBJECT WITH UNIQUE KEYS) OR raw::jsonb <> value
     OR NOT handoff_keys(value, keys) THEN RETURN false; END IF;
  FOREACH field IN ARRAY keys LOOP
    IF field NOT IN ('evidence_set','payload_length','complete') AND
       (jsonb_typeof(value->field) <> 'string' OR length(value->>field) = 0) THEN RETURN false; END IF;
  END LOOP;
  IF value->>'handoff_id' <> identity OR value->>'run_id' <> run::text
     OR value->>'actor_id' <> actor::text OR value->>'project_id' <> project::text
     OR value->>'purpose' NOT IN ('provider_input','answer_delivery')
     OR value->'complete' <> 'true'::jsonb
     OR value->>'session_generation' !~ '^[1-9][0-9]*$'
     OR value->>'project_permission_revision' !~ '^[1-9][0-9]*$'
     OR value->>'payload_digest' !~ '^[a-f0-9]{64}$'
     OR jsonb_typeof(value->'payload_length') <> 'number'
     OR (value->>'payload_length')::numeric < 0
     OR (value->>'payload_length')::numeric <> trunc((value->>'payload_length')::numeric)
     OR jsonb_typeof(value->'evidence_set') <> 'array'
     OR value->>'prepared_at' !~ '^\d{4}-\d{2}-\d{2}T.*(Z|[+-]\d{2}:\d{2})$'
     OR NOT isfinite((value->>'prepared_at')::timestamptz) THEN RETURN false; END IF;
  FOR entry IN SELECT item FROM jsonb_array_elements(value->'evidence_set') AS items(item) LOOP
    IF entry->>'kind' = 'document' THEN
      keys := ARRAY['kind','source_id','project_id','document_id','version_id','passage_id',
        'permission_revision','lifecycle_revision','version_digest','excerpt_digest'];
    ELSIF entry->>'kind' = 'operational' THEN
      keys := ARRAY['kind','source_id','project_id','entity_kind','entity_id','entity_revision',
        'observation_revision','observed_at','entity_digest'];
    ELSE RETURN false; END IF;
    IF NOT handoff_keys(entry, keys) THEN RETURN false; END IF;
    FOREACH field IN ARRAY keys LOOP
      IF field <> 'observation_revision' AND
         (jsonb_typeof(entry->field) <> 'string' OR length(entry->>field) = 0) THEN RETURN false; END IF;
    END LOOP;
    IF entry->>'project_id' <> value->>'project_id' OR (entry->>'source_id') = ANY(ids) THEN RETURN false; END IF;
    ids := array_append(ids, entry->>'source_id');
    IF entry->>'kind' = 'document' THEN
      IF entry->>'permission_revision' !~ '^[1-9][0-9]*$'
         OR entry->>'lifecycle_revision' !~ '^[1-9][0-9]*$'
         OR entry->>'version_digest' !~ '^[a-f0-9]{64}$'
         OR entry->>'excerpt_digest' !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
    ELSE
      IF entry->>'entity_kind' NOT IN ('project','sprint','task')
         OR entry->>'entity_revision' !~ '^[1-9][0-9]*$'
         OR entry->>'entity_digest' !~ '^[a-f0-9]{64}$'
         OR jsonb_typeof(entry->'observation_revision') <> 'number'
         OR (entry->>'observation_revision')::numeric <= 0
         OR (entry->>'observation_revision')::numeric <> trunc((entry->>'observation_revision')::numeric)
         OR entry->>'observed_at' !~ '^\d{4}-\d{2}-\d{2}T.*(Z|[+-]\d{2}:\d{2})$'
         OR NOT isfinite((entry->>'observed_at')::timestamptz) THEN RETURN false; END IF;
    END IF;
  END LOOP;
  RETURN true;
EXCEPTION WHEN data_exception THEN RETURN false;
END $$;

ALTER TABLE execution ADD CONSTRAINT execution_handoff_owner UNIQUE (run_id, actor_id, project_id);
CREATE TABLE handoff_manifest (
  handoff_id text PRIMARY KEY CHECK (length(handoff_id) > 0),
  run_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  project_id uuid NOT NULL,
  manifest jsonb NOT NULL,
  manifest_bytes bytea NOT NULL CHECK (octet_length(manifest_bytes) > 0),
  manifest_digest text GENERATED ALWAYS AS (encode(sha256(manifest_bytes), 'hex')) STORED,
  durable_commit_ref uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  FOREIGN KEY (run_id, actor_id, project_id) REFERENCES execution(run_id, actor_id, project_id),
  CHECK (valid_handoff_manifest(manifest, manifest_bytes, handoff_id, run_id, actor_id, project_id))
);
CREATE INDEX handoff_run ON handoff_manifest(run_id, handoff_id);
CREATE TABLE handoff_outcome (
  outcome_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handoff_id text NOT NULL REFERENCES handoff_manifest,
  status text NOT NULL CHECK (status IN ('completed','aborted','unknown')),
  observed_at timestamptz NOT NULL DEFAULT clock_timestamp() CHECK (isfinite(observed_at)),
  enforcement_ref text NOT NULL CHECK (length(enforcement_ref) > 0)
);
CREATE INDEX handoff_outcome_history ON handoff_outcome(handoff_id, observed_at, outcome_id);
CREATE FUNCTION protect_handoff_record() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Handoff records are append-only' USING ERRCODE = '23514';
END $$;
CREATE TRIGGER immutable_manifest BEFORE UPDATE OR DELETE ON handoff_manifest
  FOR EACH ROW EXECUTE FUNCTION protect_handoff_record();
CREATE TRIGGER immutable_handoff_outcome BEFORE UPDATE OR DELETE ON handoff_outcome
  FOR EACH ROW EXECUTE FUNCTION protect_handoff_record();
REVOKE ALL ON FUNCTION handoff_keys(jsonb,text[]), valid_handoff_manifest(jsonb,bytea,text,uuid,uuid,uuid), protect_handoff_record() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION handoff_keys(jsonb,text[]), valid_handoff_manifest(jsonb,bytea,text,uuid,uuid,uuid) TO knowledge_app;
GRANT SELECT, INSERT ON handoff_manifest, handoff_outcome TO knowledge_app;
