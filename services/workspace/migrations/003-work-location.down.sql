SET LOCAL search_path = workspace, pg_catalog;
LOCK TABLE project, task, sprint, sprint_allocation IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM task) THEN
    RAISE EXCEPTION 'Work location rollback refused: existing tasks would lose authoritative location; use reviewed forward recovery';
  END IF;
END $$;
DROP TRIGGER completed_allocation_immutable ON sprint_allocation;
DROP TRIGGER task_backlog_revision ON task;
DROP TRIGGER task_location_consistency ON task;
DROP TRIGGER allocation_location_consistency ON sprint_allocation;
DROP TRIGGER sprint_location_consistency ON sprint;
DROP FUNCTION preserve_completed_allocation();
DROP FUNCTION advance_backlog_revision();
DROP FUNCTION check_work_location();
DROP FUNCTION assert_work_location(uuid);
DROP INDEX task_backlog_order;
ALTER TABLE task DROP CONSTRAINT task_location_allocation_fk;
ALTER TABLE task DROP CONSTRAINT task_location_sprint_project_fk;
ALTER TABLE task DROP CONSTRAINT task_location_shape;
ALTER TABLE task DROP COLUMN location_sprint_id;
ALTER TABLE task DROP COLUMN location_kind;
ALTER TABLE project DROP COLUMN backlog_revision;
-- Keep owner-only reconciliation evidence; never delete it as rollback cleanup.
