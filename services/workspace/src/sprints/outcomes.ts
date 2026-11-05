import type {PoolClient} from 'pg';
import {conflict} from '../projects/outcomes.ts';
import type {SprintOperation,SprintBody,SprintOutcome} from './types.ts';
function binding(operation:SprintOperation,body:SprintBody,reference:string,projectId:string){
 const value='sprint' in body?body.sprint:body;
 if(value.project_id!==projectId||(operation==='reorderBacklog'?value.project_id!==reference:!('sprint_id' in value)||value.sprint_id!==reference))throw conflict();
}
export async function sprintOutcome(c:PoolClient,actor:string,operation:SprintOperation,key:string,hash:string,projectId:string,reference?:string):Promise<SprintOutcome|null>{
 const r=(await c.query('SELECT state,payload_hash,result_status,result_ref,result_snapshot FROM workspace.idempotency_record WHERE actor_id=$1 AND operation=$2 AND idempotency_key=$3',[actor,operation,key])).rows[0];
 if(!r)return null;
 if(r.state!=='committed'||r.payload_hash!==hash||r.result_status!==(operation==='createSprint'?201:200)||(reference!==undefined&&r.result_ref!==reference))throw conflict();
 binding(operation,r.result_snapshot,r.result_ref,projectId);
 return {status:r.result_status,body:r.result_snapshot,projectId};
}
export async function saveSprintOutcome(c:PoolClient,actor:string,operation:SprintOperation,key:string,hash:string,reference:string,value:SprintOutcome){
 binding(operation,value.body,reference,value.projectId);
 await c.query("INSERT INTO workspace.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,result_ref,expires_at,result_status,result_snapshot) VALUES($1,$2,$3,$4,'committed',$5,'infinity',$6,$7::jsonb)",[actor,operation,key,hash,reference,value.status,JSON.stringify(value.body)]);
}
