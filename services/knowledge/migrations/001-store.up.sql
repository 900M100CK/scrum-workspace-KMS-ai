CREATE SCHEMA knowledge AUTHORIZATION knowledge_owner;
SET LOCAL search_path = knowledge, public, pg_catalog;

CREATE TABLE document (
  document_id uuid PRIMARY KEY,
  project_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('document', 'decision')),
  title text NOT NULL,
  owner_id uuid NOT NULL,
  labels text[] NOT NULL DEFAULT '{}',
  current_version_id uuid,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  processing_generation bigint NOT NULL DEFAULT 1 CHECK (processing_generation > 0),
  unavailable boolean NOT NULL DEFAULT false
);
CREATE INDEX document_project ON document(project_id);
CREATE TABLE document_version (
  document_id uuid NOT NULL REFERENCES document,
  version_id uuid NOT NULL,
  state text NOT NULL CHECK (state IN ('draft', 'current', 'superseded', 'archived')),
  immutable_content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  PRIMARY KEY (document_id, version_id)
);
CREATE UNIQUE INDEX one_current_version ON document_version(document_id) WHERE state = 'current';
ALTER TABLE document ADD CONSTRAINT current_version_identity
  FOREIGN KEY (document_id, current_version_id) REFERENCES document_version(document_id, version_id)
  DEFERRABLE INITIALLY DEFERRED;
CREATE TABLE passage (
  document_id uuid NOT NULL,
  version_id uuid NOT NULL,
  passage_id uuid NOT NULL,
  locator text NOT NULL,
  immutable_excerpt text NOT NULL,
  PRIMARY KEY (document_id, version_id, passage_id),
  FOREIGN KEY (document_id, version_id) REFERENCES document_version(document_id, version_id)
);
CREATE INDEX passage_keywords ON passage USING gin(to_tsvector('english', immutable_excerpt));

CREATE FUNCTION protect_document() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.document_id <> OLD.document_id OR NEW.project_id <> OLD.project_id
     OR NEW.revision <> OLD.revision + 1
     OR NEW.processing_generation < OLD.processing_generation
     OR (OLD.unavailable AND NOT NEW.unavailable) THEN
    RAISE EXCEPTION 'Invalid document identity, revision or tombstone transition' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_document BEFORE UPDATE ON document
  FOR EACH ROW EXECUTE FUNCTION protect_document();

CREATE FUNCTION protect_version() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.document_id <> OLD.document_id OR NEW.version_id <> OLD.version_id
     OR NEW.immutable_content <> OLD.immutable_content OR NEW.created_at <> OLD.created_at
     OR NEW.revision <> OLD.revision + 1
     OR NOT ((OLD.state = 'draft' AND NEW.state = 'current')
          OR (OLD.state = 'current' AND NEW.state IN ('superseded', 'archived'))
          OR (OLD.state = 'superseded' AND NEW.state = 'archived')) THEN
    RAISE EXCEPTION 'Immutable evidence or invalid version transition' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_version BEFORE UPDATE ON document_version
  FOR EACH ROW EXECUTE FUNCTION protect_version();

-- Deferred: publication can supersede then promote and update the pointer atomically.
CREATE FUNCTION validate_current_version() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target uuid := COALESCE(NEW.document_id, OLD.document_id);
BEGIN
  IF EXISTS (
    SELECT 1 FROM document d WHERE d.document_id = target
      AND d.current_version_id IS DISTINCT FROM (
        SELECT v.version_id FROM document_version v
        WHERE v.document_id = target AND v.state = 'current'
      )
  ) THEN
    RAISE EXCEPTION 'Current version pointer does not match current evidence' USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER document_current_consistency AFTER INSERT OR UPDATE ON document
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION validate_current_version();
CREATE CONSTRAINT TRIGGER version_current_consistency AFTER INSERT OR UPDATE ON document_version
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION validate_current_version();

CREATE TABLE embedding_configuration (
  configuration_id uuid PRIMARY KEY,
  model text NOT NULL CHECK (length(btrim(model)) > 0),
  model_version text NOT NULL CHECK (length(btrim(model_version)) > 0),
  dimensions integer NOT NULL CHECK (dimensions BETWEEN 1 AND 16000),
  distance_metric text NOT NULL CHECK (distance_metric IN ('cosine', 'l2', 'inner_product')),
  UNIQUE (configuration_id, dimensions)
);
CREATE TABLE search_job (
  job_id uuid PRIMARY KEY,
  document_id uuid NOT NULL,
  version_id uuid NOT NULL,
  configuration_id uuid NOT NULL REFERENCES embedding_configuration,
  aggregate_revision bigint NOT NULL CHECK (aggregate_revision > 0),
  processing_generation bigint NOT NULL CHECK (processing_generation > 0),
  readiness text NOT NULL CHECK (readiness IN ('pending', 'ready', 'failed')),
  tombstone boolean NOT NULL DEFAULT false,
  FOREIGN KEY (document_id, version_id) REFERENCES document_version(document_id, version_id),
  UNIQUE (document_id, version_id, configuration_id, processing_generation),
  UNIQUE (job_id, document_id, version_id, configuration_id)
);
CREATE TABLE passage_embedding (
  document_id uuid NOT NULL,
  version_id uuid NOT NULL,
  passage_id uuid NOT NULL,
  configuration_id uuid NOT NULL,
  dimensions integer NOT NULL,
  job_id uuid NOT NULL,
  embedding public.vector NOT NULL,
  PRIMARY KEY (document_id, version_id, passage_id, configuration_id),
  FOREIGN KEY (document_id, version_id, passage_id) REFERENCES passage,
  FOREIGN KEY (configuration_id, dimensions) REFERENCES embedding_configuration(configuration_id, dimensions),
  FOREIGN KEY (job_id, document_id, version_id, configuration_id)
    REFERENCES search_job(job_id, document_id, version_id, configuration_id),
  CHECK (public.vector_dims(embedding) = dimensions),
  CHECK (public.vector_norm(embedding) > 0)
);

-- Lock the authoritative local row so an index write cannot race a local lifecycle commit.
CREATE FUNCTION guard_index_write() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE d document%ROWTYPE; j search_job%ROWTYPE;
BEGIN
  SELECT * INTO d FROM document WHERE document_id = NEW.document_id FOR UPDATE;
  IF TG_TABLE_NAME = 'search_job' THEN
    j := NEW;
    IF TG_OP = 'UPDATE' AND (OLD.tombstone AND NOT NEW.tombstone
       OR ROW(NEW.job_id, NEW.document_id, NEW.version_id, NEW.configuration_id,
              NEW.aggregate_revision, NEW.processing_generation)
          IS DISTINCT FROM ROW(OLD.job_id, OLD.document_id, OLD.version_id, OLD.configuration_id,
              OLD.aggregate_revision, OLD.processing_generation)) THEN
      RAISE EXCEPTION 'Index job identity is immutable' USING ERRCODE = '23514';
    END IF;
  ELSE
    SELECT * INTO j FROM search_job WHERE job_id = NEW.job_id;
  END IF;
  IF d.document_id IS NULL OR j.job_id IS NULL OR d.unavailable OR j.tombstone
     OR d.current_version_id IS DISTINCT FROM NEW.version_id
     OR d.revision <> j.aggregate_revision OR d.processing_generation <> j.processing_generation THEN
    RAISE EXCEPTION 'Stale or unavailable indexing source' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_job BEFORE INSERT OR UPDATE ON search_job
  FOR EACH ROW EXECUTE FUNCTION guard_index_write();
CREATE TRIGGER guard_embedding BEFORE INSERT OR UPDATE ON passage_embedding
  FOR EACH ROW EXECUTE FUNCTION guard_index_write();

-- Scope is produced by Workspace, never by client fields or a copied Knowledge ACL.
-- MATERIALIZED filters both scopes and current validity before computing distances.
CREATE FUNCTION exact_search(
  authorized_project uuid, authorized_documents uuid[], config uuid,
  query_embedding public.vector, result_limit integer
) RETURNS TABLE(document_id uuid, version_id uuid, passage_id uuid, distance double precision)
LANGUAGE plpgsql STABLE AS $$
DECLARE cfg embedding_configuration%ROWTYPE;
BEGIN
  IF authorized_project IS NULL OR authorized_documents IS NULL
     OR cardinality(authorized_documents) = 0 THEN RETURN; END IF;
  SELECT * INTO STRICT cfg FROM embedding_configuration WHERE configuration_id = config;
  IF result_limit IS NULL OR result_limit <= 0 OR query_embedding IS NULL
     OR public.vector_dims(query_embedding) <> cfg.dimensions OR public.vector_norm(query_embedding) = 0 THEN
    RAISE EXCEPTION 'Invalid search configuration or query' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY WITH eligible AS MATERIALIZED (
    SELECT e.* FROM passage_embedding e
    JOIN document d USING (document_id)
    JOIN document_version v USING (document_id, version_id)
    JOIN search_job j ON j.job_id = e.job_id
    WHERE d.project_id = authorized_project AND d.document_id = ANY(authorized_documents)
      AND NOT d.unavailable AND v.state = 'current' AND d.current_version_id = v.version_id
      AND e.configuration_id = config AND j.readiness = 'ready' AND NOT j.tombstone
      AND j.aggregate_revision = d.revision AND j.processing_generation = d.processing_generation
  ) SELECT e.document_id, e.version_id, e.passage_id,
      CASE cfg.distance_metric
        WHEN 'cosine' THEN e.embedding OPERATOR(public.<=>) query_embedding
        WHEN 'l2' THEN e.embedding OPERATOR(public.<->) query_embedding
        WHEN 'inner_product' THEN e.embedding OPERATOR(public.<#>) query_embedding END AS distance
    FROM eligible e ORDER BY distance, e.document_id, e.version_id, e.passage_id LIMIT result_limit;
END $$;

CREATE FUNCTION keyword_search(authorized_project uuid, authorized_documents uuid[], query_text text, result_limit integer)
RETURNS TABLE(document_id uuid, version_id uuid, passage_id uuid, rank real)
LANGUAGE sql STABLE AS $$
  SELECT p.document_id, p.version_id, p.passage_id,
    ts_rank(to_tsvector('english', p.immutable_excerpt), plainto_tsquery('english', query_text)) AS rank
  FROM passage p JOIN document d USING (document_id)
  JOIN document_version v USING (document_id, version_id)
  WHERE d.project_id = authorized_project AND d.document_id = ANY(authorized_documents)
    AND NOT d.unavailable AND v.state = 'current' AND d.current_version_id = v.version_id
    AND result_limit > 0
    AND to_tsvector('english', p.immutable_excerpt) @@ plainto_tsquery('english', query_text)
  ORDER BY rank DESC, p.document_id, p.version_id, p.passage_id
  LIMIT greatest(coalesce(result_limit, 0), 0)
$$;

CREATE TABLE link (
  link_id uuid PRIMARY KEY,
  project_id uuid NOT NULL,
  from_kind text NOT NULL CHECK (from_kind IN ('task', 'sprint', 'document', 'decision')),
  from_id uuid NOT NULL,
  to_kind text NOT NULL CHECK (to_kind IN ('task', 'sprint', 'document', 'decision')),
  to_id uuid NOT NULL,
  relation text NOT NULL,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0)
);
CREATE TABLE execution (
  run_id uuid PRIMARY KEY,
  actor_id uuid NOT NULL,
  project_id uuid NOT NULL,
  configuration_id uuid REFERENCES embedding_configuration,
  duration_ms bigint CHECK (duration_ms >= 0),
  usage jsonb NOT NULL DEFAULT '{}',
  errors text[] NOT NULL DEFAULT '{}',
  validation_outcomes jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE provenance (
  run_id uuid NOT NULL REFERENCES execution,
  source_id text NOT NULL,
  document_id uuid,
  version_id uuid,
  passage_id uuid,
  entity_id uuid,
  observation_revision bigint,
  observed_at timestamptz,
  PRIMARY KEY (run_id, source_id),
  FOREIGN KEY (document_id, version_id, passage_id) REFERENCES passage MATCH FULL,
  CHECK ((document_id IS NOT NULL AND version_id IS NOT NULL AND passage_id IS NOT NULL
          AND entity_id IS NULL AND observation_revision IS NULL AND observed_at IS NULL)
      OR (document_id IS NULL AND version_id IS NULL AND passage_id IS NULL
          AND entity_id IS NOT NULL AND observation_revision > 0 AND observation_revision IS NOT NULL AND observed_at IS NOT NULL))
);
CREATE TABLE business_audit (
  event_id uuid PRIMARY KEY,
  actor_id uuid NOT NULL,
  project_id uuid NOT NULL,
  action text NOT NULL,
  entity_id uuid NOT NULL,
  time timestamptz NOT NULL DEFAULT clock_timestamp(),
  before_ref text,
  after_ref text,
  correlation_id uuid NOT NULL
);
CREATE TABLE idempotency_record (
  actor_id uuid NOT NULL,
  operation text NOT NULL,
  idempotency_key text NOT NULL,
  payload_hash text NOT NULL,
  state text NOT NULL CHECK (state IN ('pending', 'committed', 'failed')),
  result_ref text,
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (actor_id, operation, idempotency_key)
);
GRANT USAGE ON SCHEMA knowledge TO knowledge_app;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA knowledge TO knowledge_app;
GRANT UPDATE ON document, search_job, passage_embedding, link, execution, idempotency_record TO knowledge_app;
GRANT UPDATE (state, revision) ON document_version TO knowledge_app;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA knowledge FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA knowledge TO knowledge_app;
-- Evidence, configurations, audit and provenance cannot be updated/deleted by the runtime role.
