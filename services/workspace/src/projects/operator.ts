import {SPRINT_ACTIONS} from '../sprints/authority.ts';
import {randomUUID} from 'node:crypto';
import type {Pool,PoolClient} from 'pg';
import {ownedTransaction} from '../session/database.ts';
import {TASK_ACTIONS} from '../tasks/authority.ts';

export const PROJECT_CAPABILITIES=['membership-manage','project-administrator','backlog-author','knowledge-author',...Object.values(TASK_ACTIONS),...Object.values(SPRINT_ACTIONS)] as const;
export type ProjectCapability=typeof PROJECT_CAPABILITIES[number];
export const isProjectCapability=(value:unknown):value is ProjectCapability=>PROJECT_CAPABILITIES.some(action=>action===value);
const reference=(value:string)=>{if(typeof value!=='string'||!value.trim()||Buffer.byteLength(value)>1024)throw new Error('Operator reference/reason required');};
const revision=(value:string)=>{if(!/^(0|[1-9]\d{0,18})$/.test(value))throw new Error('Expected revision required');};
async function start(c:PoolClient,userId:string){
 const clock=(await c.query('SELECT singleton FROM workspace.auth_clock_state WHERE singleton=true FOR UPDATE')).rows[0];
 if(!clock)throw new Error('Clock state missing');
 const account=(await c.query('SELECT disabled FROM workspace.auth_account WHERE user_id=$1 FOR UPDATE',[userId])).rows[0];
 if(!account||account.disabled)throw new Error('Enabled known target required');
}
async function log(c:PoolClient,userId:string,projectId:string|null,action:string,allowed:boolean,before:string,after:string,operatorRef:string,reason:string,eventId=randomUUID()){
 await c.query('INSERT INTO workspace.authority_provisioning_audit(event_id,target_user_id,project_id,action,allowed,previous_revision,revision,operator_ref,reason) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[eventId,userId,projectId,action,allowed,before,after,operatorRef,reason]);
}
/** Uses the private DB operator identity, never a browser role or a public endpoint. */
export class WorkspaceProjectOperator {
 private readonly pool:Pool;
 constructor(pool:Pool){this.pool=pool;}
 async state(userId:string,projectId?:string){
  return ownedTransaction(this.pool,'operator',async c=>projectId===undefined
   ? (await c.query('SELECT can_create,revision::text FROM workspace.global_project_authority WHERE user_id=$1',[userId])).rows[0]??{can_create:false,revision:'0'}
   : (await c.query("SELECT grant_id,action,valid,permission_revision::text revision FROM workspace.capability_grant WHERE subject_id=$1 AND project_id=$2 AND resource_kind='project' AND resource_id=$2 ORDER BY permission_revision DESC,grant_id",[userId,projectId])).rows);
 }
 async global(userId:string,allowed:boolean,expected:string,operatorRef:string,reason:string){
  reference(operatorRef);reference(reason);revision(expected);if(typeof allowed!=='boolean')throw new Error('Explicit allow/revoke required');
  return ownedTransaction(this.pool,'operator',async c=>{
   await start(c,userId);
   const row=(await c.query('SELECT can_create,revision::text FROM workspace.global_project_authority WHERE user_id=$1 FOR UPDATE',[userId])).rows[0];
   const before=row?.revision??'0';if(before!==expected)throw new Error('Stale authority revision');
   if(row?.can_create===allowed)return {changed:false,revision:before};
   const after=(BigInt(before)+1n).toString();
   await c.query('INSERT INTO workspace.global_project_authority VALUES($1,$2,$3) ON CONFLICT(user_id) DO UPDATE SET can_create=EXCLUDED.can_create,revision=EXCLUDED.revision',[userId,allowed,after]);
   await log(c,userId,null,'create-project',allowed,before,after,operatorRef,reason);return {changed:true,revision:after};
  });
 }
 async project(userId:string,projectId:string,action:ProjectCapability,allowed:boolean,expected:string,operatorRef:string,reason:string){
  reference(operatorRef);reference(reason);revision(expected);if(!isProjectCapability(action)||typeof allowed!=='boolean')throw new Error('Explicit supported action required');
  return ownedTransaction(this.pool,'operator',async c=>{
   await start(c,userId);
   if(!(await c.query('SELECT project_id FROM workspace.project WHERE project_id=$1 FOR UPDATE',[projectId])).rowCount)throw new Error('Project unavailable');
   if(!(await c.query('SELECT user_id FROM workspace.membership WHERE project_id=$1 AND user_id=$2 AND active FOR UPDATE',[projectId,userId])).rowCount)throw new Error('Current membership required');
   const rows=(await c.query("SELECT g.grant_id,g.valid,g.permission_revision::text revision,EXISTS(SELECT 1 FROM workspace.authority_provisioning_audit a WHERE a.event_id=g.grant_id AND a.target_user_id=g.subject_id AND a.project_id=g.project_id AND a.action=g.action AND a.allowed AND a.revision=g.permission_revision-CASE WHEN g.valid THEN 0 ELSE 1 END) provenanced FROM workspace.capability_grant g WHERE g.project_id=$1 AND g.subject_id=$2 AND g.resource_kind='project' AND g.resource_id=$1 AND g.action=$3 ORDER BY g.permission_revision DESC,g.grant_id FOR UPDATE OF g",[projectId,userId,action])).rows;
   const taskAction=[...Object.values(TASK_ACTIONS),...Object.values(SPRINT_ACTIONS)].some(value=>value===action);
   const requiresProvenance=taskAction||action==='knowledge-author';
   if(requiresProvenance&&rows.some(row=>!row.provenanced))throw new Error('Authority provenance requires explicit reconciliation');
   const before=rows[0]?.revision??'0',current=rows.find(row=>row.valid);if(before!==expected)throw new Error('Stale capability revision');
   if(!!current===allowed)return {changed:false,revision:before};
   if(!allowed&&action==='membership-manage'){
    const others=await c.query("SELECT 1 FROM workspace.membership m JOIN workspace.auth_account a ON a.user_id=m.user_id JOIN workspace.capability_grant g ON g.subject_id=m.user_id AND g.project_id=m.project_id WHERE m.project_id=$1 AND m.user_id<>$2 AND m.active AND NOT a.disabled AND g.valid AND g.action='membership-manage' AND g.resource_kind='project' AND g.resource_id=$1 LIMIT 1",[projectId,userId]);
    if(!others.rowCount)throw new Error('Last effective membership manager');
   }
   const after=(BigInt(before)+1n).toString();
   const grantId=randomUUID();
   if(allowed)await c.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action,permission_revision) VALUES($1,$2,$3,'project',$3,$4,$5)",[grantId,userId,projectId,action,after]);
   else await c.query('UPDATE workspace.capability_grant SET valid=false,permission_revision=$2 WHERE grant_id=$1',[current!.grant_id,after]);
   await log(c,userId,projectId,action,allowed,before,after,operatorRef,reason,requiresProvenance&&allowed?grantId:undefined);return {changed:true,revision:after};
  });
 }
}
