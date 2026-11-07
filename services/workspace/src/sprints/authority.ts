export const SPRINT_ACTIONS={createSprint:'sprint-create',allocateTask:'sprint-allocate',startSprint:'sprint-start',completeSprint:'sprint-complete',reorderBacklog:'backlog-order',editSprint:'sprint-edit',removeAllocation:'sprint-deallocate'} as const;
export type SprintAction=typeof SPRINT_ACTIONS[keyof typeof SPRINT_ACTIONS];

import type {PoolClient} from 'pg';
import {hasCapability} from '../projects/capabilities.ts';
// Older fixture schemas deliberately lack private Could provisioning. Never trust those action names there.
export async function hasSprintCapability(c:PoolClient,actor:string,projectId:string,action:string){
 if(!await hasCapability(c,actor,projectId,action))return false;
 if(action!=='sprint-edit'&&action!=='sprint-deallocate')return true;
 return (await c.query('SELECT workspace.has_sprint_could_action($1::uuid,$2::uuid,$3::text) allowed',[actor,projectId,action])).rows[0].allowed===true;
}
