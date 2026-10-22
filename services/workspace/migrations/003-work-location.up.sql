SET LOCAL search_path = workspace, pg_catalog;

-- Owner-only reconciliation input. The runner creates _migrations before this file.
-- Operators may populate this exact table before retrying an ambiguous upgrade.
CREATE TABLE IF NOT EXISTS _migrations.task_location_reconciliation (
  task_id uuid PRIMARY KEY,
  expected_task_revision bigint NOT NULL,
  location_kind text NOT NULL CHECK (location_kind IN ('backlog', 'sprint', 'completed')),
  location_sprint_id uuid
);

LOCK TABLE project, task, sprint, sprint_allocation IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM _migrations.task_location_reconciliation r
    LEFT JOIN task t USING (task_id)
    WHERE t.task_id IS NULL OR t.revision <> r.expected_task_revision
  ) THEN
    RAISE EXCEPTION 'Stale or unknown task location reconciliation input';
  END IF;
  IF EXISTS (
    SELECT 1 FROM task t
    WHERE NOT EXISTS (SELECT 1 FROM sprint_allocation a WHERE a.task_id=t.task_id AND a.allocation_state='allocated')
      AND EXISTS (SELECT 1 FROM sprint_allocation a WHERE a.task_id=t.task_id AND a.allocation_state='completed')
      AND NOT EXISTS (SELECT 1 FROM _migrations.task_location_reconciliation r WHERE r.task_id=t.task_id)
  ) THEN
    RAISE EXCEPTION 'Explicit task location reconciliation required for completed history; no inference from Done state';
  END IF;
END $$;

ALTER TABLE project ADD COLUMN backlog_revision bigint NOT NULL DEFAULT 1 CHECK (backlog_revision > 0);
ALTER TABLE task ADD COLUMN location_kind text NOT NULL DEFAULT 'backlog';
ALTER TABLE task ADD COLUMN location_sprint_id uuid;

UPDATE task t SET location_kind='sprint', location_sprint_id=a.sprint_id
FROM sprint_allocation a WHERE a.task_id=t.task_id AND a.allocation_state='allocated';
UPDATE task t SET location_kind=r.location_kind, location_sprint_id=r.location_sprint_id
FROM _migrations.task_location_reconciliation r WHERE r.task_id=t.task_id;

ALTER TABLE task ADD CONSTRAINT task_location_shape CHECK (
  (location_kind='backlog' AND location_sprint_id IS NULL) OR
  (location_kind='sprint' AND location_sprint_id IS NOT NULL) OR
  (location_kind='completed' AND location_sprint_id IS NOT NULL AND state='done')
);
ALTER TABLE task ADD CONSTRAINT task_location_sprint_project_fk
  FOREIGN KEY (project_id, location_sprint_id) REFERENCES sprint(project_id, sprint_id)
  DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE task ADD CONSTRAINT task_location_allocation_fk
  FOREIGN KEY (location_sprint_id, task_id) REFERENCES sprint_allocation(sprint_id, task_id)
  DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX task_backlog_order ON task(project_id, backlog_position, task_id) WHERE location_kind='backlog';

-- Validate final transaction state; temporary intermediate updates are allowed.
CREATE FUNCTION assert_work_location(p_project uuid) RETURNS void
LANGUAGE plpgsql SET search_path = workspace, pg_catalog AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM task t
    LEFT JOIN sprint s ON s.sprint_id=t.location_sprint_id
    LEFT JOIN sprint_allocation a ON a.sprint_id=t.location_sprint_id AND a.task_id=t.task_id
    WHERE t.project_id=p_project AND (
      (t.location_kind='backlog' AND EXISTS (SELECT 1 FROM sprint_allocation live WHERE live.task_id=t.task_id AND live.allocation_state='allocated')) OR
      (t.location_kind='sprint' AND (a.allocation_state IS DISTINCT FROM 'allocated' OR s.state NOT IN ('planned','active'))) OR
      (t.location_kind='completed' AND (a.allocation_state IS DISTINCT FROM 'completed' OR s.state IS DISTINCT FROM 'completed'))
    )
  ) OR EXISTS (
    SELECT 1 FROM sprint_allocation a JOIN task t USING(task_id)
    WHERE a.project_id=p_project AND a.allocation_state='allocated'
      AND (t.location_kind <> 'sprint' OR t.location_sprint_id IS DISTINCT FROM a.sprint_id)
  ) THEN
    RAISE EXCEPTION 'Inconsistent current work location' USING ERRCODE='23514';
  END IF;
END $$;

CREATE FUNCTION check_work_location() RETURNS trigger
LANGUAGE plpgsql SET search_path = workspace, pg_catalog AS $$
BEGIN
  IF TG_OP <> 'DELETE' THEN PERFORM assert_work_location(NEW.project_id); END IF;
  IF TG_OP <> 'INSERT' THEN PERFORM assert_work_location(OLD.project_id); END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER task_location_consistency AFTER INSERT OR UPDATE OR DELETE ON task
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_work_location();
CREATE CONSTRAINT TRIGGER allocation_location_consistency AFTER INSERT OR UPDATE OR DELETE ON sprint_allocation
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_work_location();
CREATE CONSTRAINT TRIGGER sprint_location_consistency AFTER INSERT OR UPDATE OR DELETE ON sprint
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_work_location();

CREATE FUNCTION advance_backlog_revision() RETURNS trigger
LANGUAGE plpgsql SET search_path = workspace, pg_catalog AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    IF NEW.location_kind='backlog' THEN UPDATE project SET backlog_revision=backlog_revision+1 WHERE project_id=NEW.project_id; END IF;
  ELSIF TG_OP='DELETE' THEN
    IF OLD.location_kind='backlog' THEN UPDATE project SET backlog_revision=backlog_revision+1 WHERE project_id=OLD.project_id; END IF;
  ELSE
    IF NEW.project_id IS DISTINCT FROM OLD.project_id OR NEW.task_id IS DISTINCT FROM OLD.task_id THEN
      RAISE EXCEPTION 'Task identity/project is immutable' USING ERRCODE='23514';
    END IF;
    IF (NEW.location_kind='backlog') IS DISTINCT FROM (OLD.location_kind='backlog')
      OR (NEW.location_kind='backlog' AND NEW.backlog_position IS DISTINCT FROM OLD.backlog_position) THEN
      UPDATE project SET backlog_revision=backlog_revision+1 WHERE project_id=NEW.project_id;
    END IF;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER task_backlog_revision AFTER INSERT OR UPDATE OR DELETE ON task
  FOR EACH ROW EXECUTE FUNCTION advance_backlog_revision();

CREATE FUNCTION preserve_completed_allocation() RETURNS trigger
LANGUAGE plpgsql SET search_path = workspace, pg_catalog AS $$
BEGIN
  IF OLD.allocation_state='completed' AND (TG_OP='DELETE' OR NEW IS DISTINCT FROM OLD) THEN
    RAISE EXCEPTION 'Completed allocation history is immutable' USING ERRCODE='23514';
  END IF;
  RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
END $$;
CREATE TRIGGER completed_allocation_immutable BEFORE UPDATE OR DELETE ON sprint_allocation
  FOR EACH ROW EXECUTE FUNCTION preserve_completed_allocation();

DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT project_id FROM project LOOP PERFORM assert_work_location(p.project_id); END LOOP;
END $$;

REVOKE ALL ON FUNCTION assert_work_location(uuid), check_work_location(), advance_backlog_revision(), preserve_completed_allocation() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION assert_work_location(uuid), check_work_location(), advance_backlog_revision(), preserve_completed_allocation() TO workspace_app;
-- These functions validate trusted service writes; they do not authorize end users.
-- Handlers must lock project before work rows, bump task revisions, and audit atomically.
