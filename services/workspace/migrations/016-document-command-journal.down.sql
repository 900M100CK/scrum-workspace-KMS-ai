SET LOCAL search_path = workspace, pg_catalog;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM document_command_journal WHERE pending) THEN
    RAISE EXCEPTION 'Cannot discard unresolved document commands';
  END IF;
END $$;
DROP TABLE document_command_journal;
