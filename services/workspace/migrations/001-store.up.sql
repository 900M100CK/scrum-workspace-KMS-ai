CREATE SCHEMA workspace AUTHORIZATION workspace_owner;
SET LOCAL search_path = workspace, pg_catalog;

CREATE TABLE project (
  project_id uuid PRIMARY KEY,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  description text NOT NULL DEFAULT '',
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0)
);
CREATE TABLE membership (
  project_id uuid NOT NULL REFERENCES project,
  user_id uuid NOT NULL,
  role text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  membership_generation bigint NOT NULL CHECK (membership_generation > 0),
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  PRIMARY KEY (project_id, user_id)
);
CREATE TABLE session (
  session_id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked boolean NOT NULL DEFAULT false,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0)
);
CREATE TABLE sprint (
  sprint_id uuid PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES project,
  goal text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL CHECK (end_date > start_date),
  state text NOT NULL CHECK (state IN ('planned', 'active', 'completed')),
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  UNIQUE (project_id, sprint_id)
);
CREATE UNIQUE INDEX one_active_sprint ON sprint(project_id) WHERE state = 'active';
CREATE TABLE task (
  task_id uuid PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES project,
  type text NOT NULL CHECK (type IN ('story', 'task', 'bug')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  state text NOT NULL CHECK (state IN ('todo', 'in_progress', 'done')),
  assignee_id uuid,
  backlog_position numeric NOT NULL DEFAULT 0,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  UNIQUE (project_id, task_id),
  FOREIGN KEY (project_id, assignee_id) REFERENCES membership(project_id, user_id)
);
CREATE TABLE sprint_allocation (
  project_id uuid NOT NULL,
  sprint_id uuid NOT NULL,
  task_id uuid NOT NULL,
  allocation_state text NOT NULL CHECK (allocation_state IN ('allocated', 'completed', 'returned')),
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  PRIMARY KEY (sprint_id, task_id),
  FOREIGN KEY (project_id, sprint_id) REFERENCES sprint(project_id, sprint_id),
  FOREIGN KEY (project_id, task_id) REFERENCES task(project_id, task_id)
);
CREATE UNIQUE INDEX one_live_allocation ON sprint_allocation(task_id) WHERE allocation_state = 'allocated';
CREATE TABLE blocker_event (
  event_id uuid PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES task,
  status text NOT NULL CHECK (status IN ('open', 'resolved')),
  description text NOT NULL,
  outcome text,
  actor_id uuid NOT NULL,
  sequence bigint NOT NULL CHECK (sequence > 0),
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (task_id, sequence)
);
CREATE TABLE document_policy (
  document_id uuid PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES project,
  classification text NOT NULL CHECK (classification IN ('project_shared', 'restricted')),
  registry_state text NOT NULL CHECK (registry_state IN ('pending', 'active', 'unavailable')),
  permission_revision bigint NOT NULL DEFAULT 1 CHECK (permission_revision > 0),
  UNIQUE (project_id, document_id)
);
CREATE TABLE read_grant (
  project_id uuid NOT NULL,
  document_id uuid NOT NULL,
  user_id uuid NOT NULL,
  grant_generation bigint NOT NULL CHECK (grant_generation > 0),
  membership_generation bigint NOT NULL CHECK (membership_generation > 0),
  valid boolean NOT NULL DEFAULT true,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  PRIMARY KEY (document_id, user_id, grant_generation),
  FOREIGN KEY (project_id, document_id) REFERENCES document_policy(project_id, document_id),
  FOREIGN KEY (project_id, user_id) REFERENCES membership(project_id, user_id)
);
CREATE TABLE capability_grant (
  grant_id uuid PRIMARY KEY,
  subject_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES project,
  resource_kind text NOT NULL,
  resource_id uuid NOT NULL,
  action text NOT NULL,
  valid boolean NOT NULL DEFAULT true,
  permission_revision bigint NOT NULL DEFAULT 1 CHECK (permission_revision > 0)
);
CREATE INDEX policy_project ON document_policy(project_id);
CREATE INDEX grants_subject ON read_grant(project_id, user_id) WHERE valid;
CREATE INDEX capabilities_subject ON capability_grant(project_id, subject_id) WHERE valid;
CREATE TABLE business_audit (
  event_id uuid PRIMARY KEY,
  actor_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES project,
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

GRANT USAGE ON SCHEMA workspace TO workspace_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA workspace TO workspace_app;
REVOKE UPDATE ON business_audit, blocker_event FROM workspace_app;
-- No schema ownership, DDL, TRUNCATE, hard deletion, or cross-database rights.
