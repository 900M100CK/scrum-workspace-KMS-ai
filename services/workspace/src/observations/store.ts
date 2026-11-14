import type {PoolClient} from 'pg';
import {invalid, missing, ProjectFault, requestHash, wireRevision} from '../projects/outcomes.ts';
import {projectAccess, uuid} from '../projects/store.ts';
import {latestBlockerStatusSql, taskProjection, taskProjectionSql} from '../tasks/store.ts';
import {sprintProjection, sprintProjectionSql} from '../sprints/store.ts';

export type Kind = 'project' | 'sprint' | 'task';
export type WorkScope = {kind: Kind; id?: string; include_documents: boolean};
export type Entity = {kind: Kind; id: string; revision: string; state: string};
export type WorkSnapshot = {
  entities: Entity[]; observed_at: string; observation_revision: number;
  fingerprint: string; include_documents: boolean; list: boolean;
};

export function workScope(value: unknown): WorkScope {
  const body = value as Record<string, unknown>;
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some(key => !['kind','id','include_documents'].includes(key)) ||
      typeof body.include_documents !== 'boolean') throw invalid();
  if (body.kind === 'project' && body.id === undefined) return {kind:'project',include_documents:body.include_documents};
  if ((body.kind === 'task' || body.kind === 'sprint') && typeof body.id === 'string' && uuid(body.id)) {
    return {kind:body.kind,id:body.id.toLowerCase(),include_documents:body.include_documents};
  }
  throw invalid();
}

export async function observe(client: PoolClient, actor: string, projectId: string, options: {
  kind: Kind; ids?: string[]; blocked?: boolean; sprint?: string; operational?: boolean;
}) {
  const {project} = await projectAccess(client, actor, projectId);
  const {kind,ids,blocked,sprint,operational} = options;
  const blockerStates = new Map<string,string>();
  const sprintRow = sprint ? (await client.query('SELECT '+sprintProjectionSql+
    ' FROM workspace.sprint WHERE project_id=$1 AND sprint_id=$2',[projectId,sprint])).rows[0] : undefined;
  if (sprint && !sprintRow) throw missing();
  let entities;
  if (kind === 'project') {
    entities = !ids || ids.includes(projectId) ? [{...project,revision:wireRevision(project.revision)}] : [];
  } else if (kind === 'sprint') {
    const rows = (await client.query('SELECT '+sprintProjectionSql+
      ' FROM workspace.sprint WHERE project_id=$1 AND ($2::uuid[] IS NULL OR sprint_id=ANY($2)) ORDER BY sprint_id',
    [projectId,ids ?? null])).rows;
    entities = rows.map(sprintProjection);
  } else {
    const rows = (await client.query(`SELECT * FROM (
      SELECT ${taskProjectionSql}, ${latestBlockerStatusSql} AS blocker_status FROM workspace.task t WHERE t.project_id=$1
      AND ($2::uuid[] IS NULL OR t.task_id=ANY($2))
      AND ($3::uuid IS NULL OR t.location_sprint_id=$3 AND t.location_kind IN ('sprint','completed'))
    ) AS scoped WHERE NOT $4::boolean OR blocked ORDER BY task_id`,
    [projectId,ids ?? null,sprint ?? null,blocked ?? false])).rows;
    entities = rows.map(taskProjection);
    if (operational) for (const row of rows) blockerStates.set(row.task_id,row.blocker_status);
  }
  if (ids && entities.length !== ids.length) throw missing();
  const fingerprint = requestHash([projectId,kind,ids,blocked,sprintRow ? sprintProjection(sprintRow) : null,entities,[...blockerStates]]);
  const observation_revision = Number.parseInt(fingerprint.slice(0,13),16) + 1;
  const observed_at = (await client.query<{now: Date}>('SELECT clock_timestamp() AS now')).rows[0]!.now.toISOString();
  return {entities,observed_at,observation_revision,fingerprint,blockerStates};
}

export async function captureWork(client: PoolClient, actor: string, project: string, scope: WorkScope): Promise<WorkSnapshot> {
  // Keep the entire selected projection or fail explicitly within fixture payload limits.
  const selection = scope.kind === 'task' ? {kind:'task' as const, ids:[scope.id!]} :
    {kind:'task' as const, ...(scope.kind === 'sprint' ? {sprint:scope.id!} : {})};
  const captured = await observe(client,actor,project,{...selection,operational:true});
  if (captured.entities.length > 32) throw new ProjectFault(503,'access_unavailable');
  const {blockerStates, ...snapshot} = captured;
  const entities = snapshot.entities.map(entity => {
    if (!('task_id' in entity)) throw new Error('Expected Task projection');
    // The fixture wire carries only the status, exact locator and revision.
    return {kind:'task' as const,id:entity.task_id,revision:String(entity.revision),state:entity.blocked?'Blocked':blockerStates.get(entity.task_id)==='resolved'?'Resolved':'Not blocked'};
  });
  return {...snapshot,entities,include_documents:scope.include_documents,list:scope.kind!=='task'};
}
