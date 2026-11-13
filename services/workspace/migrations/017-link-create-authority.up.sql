SET LOCAL search_path=workspace,pg_catalog;

ALTER TABLE authority_provisioning_audit
 DROP CONSTRAINT authority_provisioning_audit_action_check,
 ADD CONSTRAINT authority_provisioning_audit_action_check CHECK(action IN (
  'create-project','membership-manage','project-administrator','backlog-author',
  'task-edit','task-state','task-assign','task-blocker',
  'sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order',
  'sprint-edit','sprint-deallocate','knowledge-author','link-create'
 ));

CREATE OR REPLACE FUNCTION protect_sprint_action() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 IF (NEW.action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order','sprint-edit','sprint-deallocate','knowledge-author','link-create')
     OR (TG_OP='UPDATE' AND OLD.action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order','sprint-edit','sprint-deallocate','knowledge-author','link-create'))
     ) AND current_user<>'workspace_owner' THEN
  IF TG_OP<>'UPDATE' THEN
   RAISE EXCEPTION 'Private authority provisioning required' USING ERRCODE='42501';
  END IF;
  IF NOT (
    OLD.action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order','sprint-edit','sprint-deallocate','knowledge-author','link-create')
    AND OLD.valid AND NOT NEW.valid
    AND NEW.grant_id=OLD.grant_id AND NEW.subject_id=OLD.subject_id
    AND NEW.project_id=OLD.project_id AND NEW.resource_kind=OLD.resource_kind
    AND NEW.resource_id=OLD.resource_id AND NEW.action=OLD.action
    AND NEW.permission_revision=OLD.permission_revision+1
  ) THEN
   RAISE EXCEPTION 'Runtime may only invalidate private authority grants' USING ERRCODE='42501';
  END IF;
 END IF;
 RETURN NEW;
END $$;

CREATE UNIQUE INDEX one_current_link_create
 ON capability_grant(project_id,subject_id,action) WHERE valid AND action='link-create';

CREATE FUNCTION has_link_create_authority(actor uuid, project uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT EXISTS (
  SELECT 1 FROM workspace.capability_grant g
  JOIN workspace.authority_provisioning_audit a ON a.event_id=g.grant_id
   AND a.target_user_id=g.subject_id AND a.project_id=g.project_id
   AND a.action=g.action AND a.allowed AND a.revision=g.permission_revision
  WHERE g.subject_id=actor AND g.project_id=project AND g.resource_kind='project'
   AND g.resource_id=project AND g.action='link-create' AND g.valid
 );
$$;
REVOKE ALL ON FUNCTION has_link_create_authority(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION has_link_create_authority(uuid,uuid) TO workspace_app;
