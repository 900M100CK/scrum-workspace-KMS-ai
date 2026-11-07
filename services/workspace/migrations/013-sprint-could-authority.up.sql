SET LOCAL search_path=workspace,pg_catalog;
-- Expose only an exact grant predicate; private provisioning audit remains owner-only.
CREATE FUNCTION has_sprint_could_action(actor uuid,project uuid,requested_action text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT EXISTS(
  SELECT 1 FROM workspace.capability_grant g
  JOIN workspace.authority_provisioning_audit a ON a.event_id=g.grant_id
   AND a.target_user_id=g.subject_id AND a.project_id=g.project_id AND a.action=g.action
   AND a.allowed AND a.revision=g.permission_revision
  WHERE requested_action IN ('sprint-edit','sprint-deallocate')
   AND g.subject_id=actor AND g.project_id=project AND g.resource_kind='project'
   AND g.resource_id=project AND g.action=requested_action AND g.valid
 );
$$;
REVOKE ALL ON FUNCTION has_sprint_could_action(uuid,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION has_sprint_could_action(uuid,uuid,text) TO workspace_app;
