import type {PoolClient} from 'pg';
import type {TaskMutationOperation} from './types.ts';

export const TASK_ACTIONS={editTask:'task-edit',setTaskState:'task-state',setAssignee:'task-assign',recordBlocker:'task-blocker'} as const satisfies Record<TaskMutationOperation,string>;
export type TaskCapability=typeof TASK_ACTIONS[TaskMutationOperation];
export type TaskOperation='createTask'|'listTasks'|'getTask'|'listBlockerEvents'|TaskMutationOperation;

/** Workspace-owned authority projection. Callers must already resolve current Task/project read scope;
 * discovery is advisory, so each future mutation/replay must independently recheck current authority. */
export async function discoverTaskOperations(c:PoolClient,actor:string,projectId:string,location:string,registered:ReadonlySet<TaskOperation>){
 const rows=(await c.query("SELECT action FROM workspace.capability_grant WHERE project_id=$1 AND subject_id=$2 AND resource_kind='project' AND resource_id=$1 AND valid AND action=ANY($3::text[])",[projectId,actor,Object.values(TASK_ACTIONS)])).rows;
 const actions=new Set(rows.map(row=>row.action));
 const operations:string[]=['getAllowedActions'];
 for(const operation of ['getTask','listBlockerEvents'] as const)if(registered.has(operation))operations.push(operation);
 for(const operation of Object.keys(TASK_ACTIONS) as TaskMutationOperation[]){
  if(registered.has(operation)&&actions.has(TASK_ACTIONS[operation])&&(operation!=='editTask'||location==='backlog'))operations.push(operation);
 }
 return operations;
}
