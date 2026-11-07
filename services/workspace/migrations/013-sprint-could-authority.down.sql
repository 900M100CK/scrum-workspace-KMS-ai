SET LOCAL search_path=workspace,pg_catalog;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM workspace.idempotency_record WHERE operation IN ('editSprint','removeAllocation'))
 OR EXISTS(SELECT 1 FROM workspace.capability_grant WHERE action IN ('sprint-edit','sprint-deallocate'))
 OR EXISTS(SELECT 1 FROM workspace.authority_provisioning_audit WHERE action IN ('sprint-edit','sprint-deallocate'))
 OR EXISTS(SELECT 1 FROM workspace.business_audit WHERE action IN ('sprint-edit','sprint-deallocate'))
 THEN RAISE EXCEPTION 'Could Sprint evidence retained; forward recovery required' USING ERRCODE='23514'; END IF;
END $$;
DROP FUNCTION has_sprint_could_action(uuid,uuid,text);
