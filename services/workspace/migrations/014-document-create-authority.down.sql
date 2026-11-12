SET LOCAL search_path=workspace,pg_catalog;

DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM capability_grant WHERE action='knowledge-author')
 OR EXISTS(SELECT 1 FROM authority_provisioning_audit WHERE action='knowledge-author')
 OR EXISTS(SELECT 1 FROM business_audit WHERE action='knowledge-author')
 THEN RAISE EXCEPTION 'Document-create authority evidence retained; forward recovery required' USING ERRCODE='23514'; END IF;
END $$;

DROP FUNCTION has_document_create_authority(uuid,uuid);
DROP INDEX one_current_document_create_author;

CREATE OR REPLACE FUNCTION protect_sprint_action() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 IF (NEW.action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order','sprint-edit','sprint-deallocate')
     OR (TG_OP='UPDATE' AND OLD.action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order','sprint-edit','sprint-deallocate'))
     ) AND current_user<>'workspace_owner' THEN
  IF TG_OP<>'UPDATE' THEN RAISE EXCEPTION 'Private Sprint provisioning required' USING ERRCODE='42501'; END IF;
  IF NOT (OLD.action IN ('sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order','sprint-edit','sprint-deallocate') AND OLD.valid AND NOT NEW.valid AND NEW.grant_id=OLD.grant_id AND NEW.subject_id=OLD.subject_id AND NEW.project_id=OLD.project_id AND NEW.resource_kind=OLD.resource_kind AND NEW.resource_id=OLD.resource_id AND NEW.action=OLD.action AND NEW.permission_revision=OLD.permission_revision+1) THEN RAISE EXCEPTION 'Runtime may only invalidate Sprint grants' USING ERRCODE='42501'; END IF;
 END IF; RETURN NEW;
END $$;

ALTER TABLE authority_provisioning_audit
 DROP CONSTRAINT authority_provisioning_audit_action_check,
 ADD CONSTRAINT authority_provisioning_audit_action_check CHECK(action IN (
  'create-project','membership-manage','project-administrator','backlog-author',
  'task-edit','task-state','task-assign','task-blocker',
  'sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order',
  'sprint-edit','sprint-deallocate'
 ));
