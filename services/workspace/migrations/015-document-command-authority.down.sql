SET LOCAL search_path = workspace, pg_catalog;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM capability_grant
    WHERE resource_kind = 'document' AND action IN ('content-write', 'lifecycle-manage')) THEN
    RAISE EXCEPTION 'Cannot remove retained document command authority';
  END IF;
END $$;
