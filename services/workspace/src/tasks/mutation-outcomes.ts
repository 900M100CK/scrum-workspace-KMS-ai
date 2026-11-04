import type {PoolClient} from 'pg';
import type {Blocker,Task,TaskMutationOperation,TaskMutationOutcome} from './types.ts';
import {conflict} from '../projects/outcomes.ts';

function mutationStatus(operation:TaskMutationOperation):200|201 {
 if(operation==='recordBlocker')return 201;
 if(operation==='editTask'||operation==='setTaskState'||operation==='setAssignee')return 200;
 throw conflict();
}

async function bindTask(c:PoolClient,taskId:string,projectId:string){
 const task=(await c.query('SELECT project_id::text FROM workspace.task WHERE task_id=$1',[taskId])).rows[0];
 if(!task||task.project_id!==projectId)throw conflict();
}

function bindBody(actor:string,operation:TaskMutationOperation,taskId:string,projectId:string,body:Task|Blocker,reference:string){
 if(!body||body.task_id!==taskId)throw conflict();
 if(operation==='recordBlocker'){
  if(!('event_id' in body)||body.event_id!==reference||body.actor_id!==actor)throw conflict();
 }else if(!('project_id' in body)||body.project_id!==projectId||body.task_id!==reference)throw conflict();
}

/** Internal 010 adapter, not an authority check. Caller owns the same-client lock protocol and
 * must verify current session, Task/project read scope and exact action before any replay disclosure. */
export async function mutationOutcome(c:PoolClient,actor:string,operation:TaskMutationOperation,key:string,hash:string,taskId:string,projectId:string):Promise<TaskMutationOutcome|null>{
 const status=mutationStatus(operation);
 const row=(await c.query('SELECT payload_hash,state,result_status,result_snapshot,result_ref FROM workspace.idempotency_record WHERE actor_id=$1 AND operation=$2 AND idempotency_key=$3',[actor,operation,key])).rows[0];
 if(!row)return null;
 if(row.payload_hash!==hash||row.state!=='committed'||row.result_status!==status)throw conflict();
 bindBody(actor,operation,taskId,projectId,row.result_snapshot,row.result_ref);
 await bindTask(c,taskId,projectId);
 // A retained original is historical: never compare its revision/state/assignee with the live row.
 return status===201
  ? {status:201,body:row.result_snapshot as Blocker,projectId}
  : {status:200,body:row.result_snapshot as Task,projectId};
}

export async function saveMutationOutcome(c:PoolClient,actor:string,operation:TaskMutationOperation,key:string,hash:string,taskId:string,projectId:string,body:Task|Blocker){
 const status=mutationStatus(operation);
 const reference=operation==='recordBlocker'&&'event_id' in body?body.event_id:body.task_id;
 bindBody(actor,operation,taskId,projectId,body,reference);
 await bindTask(c,taskId,projectId);
 await c.query("INSERT INTO workspace.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,result_ref,expires_at,result_status,result_snapshot) VALUES($1,$2,$3,$4,'committed',$5,'infinity',$6,$7::jsonb)",[actor,operation,key,hash,reference,status,JSON.stringify(body)]);
}
