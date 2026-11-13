SET LOCAL search_path=workspace,pg_catalog;

DO $$
BEGIN
 IF EXISTS (SELECT 1 FROM capability_grant WHERE action='link-create')
    OR EXISTS (SELECT 1 FROM authority_provisioning_audit WHERE action='link-create') THEN
  RAISE EXCEPTION 'Cannot remove retained link-create authority' USING ERRCODE='23514';
 END IF;
END $$;

DROP FUNCTION has_link_create_authority(uuid,uuid);
DROP INDEX one_current_link_create;
ALTER TABLE authority_provisioning_audit
 DROP CONSTRAINT authority_provisioning_audit_action_check,
 ADD CONSTRAINT authority_provisioning_audit_action_check CHECK(action IN (
  'create-project','membership-manage','project-administrator','backlog-author',
  'task-edit','task-state','task-assign','task-blocker',
  'sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order',
  'sprint-edit','sprint-deallocate','knowledge-author'
 ));

CREATE OR REPLACE FUNCTION protect_sprint_action() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 IF (NEW.action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order','sprint-edit','sprint-deallocate','knowledge-author')
     OR (TG_OP='UPDATE' AND OLD.action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order','sprint-edit','sprint-deallocate','knowledge-author'))
     ) AND current_user<>'workspace_owner' THEN
  IF TG_OP<>'UPDATE' THEN
   RAISE EXCEPTION 'Private authority provisioning required' USING ERRCODE='42501';
  END IF;
  IF NOT (
    OLD.action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order','sprint-edit','sprint-deallocate','knowledge-author')
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
