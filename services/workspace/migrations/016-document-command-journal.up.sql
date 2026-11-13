SET LOCAL search_path = workspace, pg_catalog;

CREATE TABLE document_command_journal (
  document_id uuid PRIMARY KEY REFERENCES document_policy(document_id),
  actor_id uuid NOT NULL,
  operation text NOT NULL CHECK (operation IN ('reviseDocument', 'archiveVersion', 'deleteDocument')),
  idempotency_key text NOT NULL,
  payload_hash text NOT NULL,
  pending boolean NOT NULL DEFAULT true
);
GRANT SELECT, INSERT, UPDATE ON document_command_journal TO workspace_app;
