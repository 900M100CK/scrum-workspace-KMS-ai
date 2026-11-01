import {createHash} from 'node:crypto';
import type {PoolClient} from 'pg';

export class ProjectFault extends Error {
 readonly status:number;readonly code:string;
 constructor(status:number,code:string){super(code);this.status=status;this.code=code;}
}
export const missing=()=>new ProjectFault(404,'not_found');
export const conflict=()=>new ProjectFault(409,'state_conflict');
export const invalid=()=>new ProjectFault(400,'validation_failed');
export function wireRevision(value:string):number{
 if(!/^[1-9]\d*$/.test(value)||BigInt(value)>9007199254740991n)throw conflict();return Number(value);
}
export const requestHash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export interface Outcome {status:number;body:unknown;projectId:string}
export async function outcome(c:PoolClient,actor:string,operation:string,key:string,hash:string):Promise<Outcome|null>{
 const row=(await c.query('SELECT payload_hash,result_status,result_snapshot,result_ref,state FROM workspace.idempotency_record WHERE actor_id=$1 AND operation=$2 AND idempotency_key=$3',[actor,operation,key])).rows[0];
 if(!row)return null;if(row.payload_hash!==hash||row.state!=='committed'||![201,204].includes(row.result_status))throw conflict();
 return {status:row.result_status,body:row.result_snapshot,projectId:row.result_ref};
}
export async function saveOutcome(c:PoolClient,actor:string,operation:string,key:string,hash:string,value:Outcome){
 await c.query("INSERT INTO workspace.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,result_ref,expires_at,result_status,result_snapshot) VALUES($1,$2,$3,$4,'committed',$5,'infinity',$6,$7::jsonb)",[actor,operation,key,hash,value.projectId,value.status,value.body===null?null:JSON.stringify(value.body)]);
}
export function projectFailure(error:unknown):ProjectFault{
 let current:unknown=error;
 for(let i=0;i<5&&current&&typeof current==='object';i++){
  if(current instanceof ProjectFault)return current;
  if('code' in current&&['23514','22003','23505'].includes(String(current.code)))return conflict();
  current='cause' in current?current.cause:null;
 }
 return new ProjectFault(503,'access_unavailable');
}
