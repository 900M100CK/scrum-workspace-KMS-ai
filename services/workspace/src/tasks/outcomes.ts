import type {PoolClient} from 'pg';
import type {Task} from './types.ts';
import {conflict} from '../projects/outcomes.ts';

export interface TaskOutcome {status:201;body:Task;projectId:string}
/** Internal storage adapter; callers must check current session, membership and create authority before replay. */
export async function taskOutcome(c:PoolClient,actor:string,key:string,hash:string):Promise<TaskOutcome|null>{
 const row=(await c.query("SELECT payload_hash,result_status,result_snapshot,result_ref,state FROM workspace.idempotency_record WHERE actor_id=$1 AND operation='createTask' AND idempotency_key=$2",[actor,key])).rows[0];
 if(!row)return null;
 if(row.payload_hash!==hash||row.state!=='committed'||row.result_status!==201||!row.result_snapshot||row.result_snapshot.task_id!==row.result_ref)throw conflict();
 return {status:201,body:row.result_snapshot,projectId:row.result_snapshot.project_id};
}
export async function saveTaskOutcome(c:PoolClient,actor:string,key:string,hash:string,body:Task){
 await c.query("INSERT INTO workspace.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,result_ref,expires_at,result_status,result_snapshot) VALUES($1,'createTask',$2,$3,'committed',$4,'infinity',201,$5::jsonb)",[actor,key,hash,body.task_id,JSON.stringify(body)]);
}
