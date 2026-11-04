import {randomUUID} from 'node:crypto';
import type {Pool,PoolClient} from 'pg';
import {ownedTransaction} from '../session/database.ts';
import type {WorkspaceSessionStore} from '../session/store.ts';
import {ProjectFault,conflict,invalid,missing,outcome,saveOutcome,requestHash,wireRevision} from './outcomes.ts';
import type {Outcome} from './outcomes.ts';
import {ProjectCursor} from './cursor.ts';
import type {CursorKey} from './cursor.ts';
import {discoverTaskOperations} from '../tasks/authority.ts';
import type {TaskOperation} from '../tasks/authority.ts';

export const uuid=(s:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
export async function businessAudit(c:PoolClient,actor:string,project:string,action:string,entity:string,correlation:string,before:string|null=null,after:string|null=null){
 await c.query('INSERT INTO workspace.business_audit(event_id,actor_id,project_id,action,entity_id,correlation_id,before_ref,after_ref) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),actor,project,action,entity,correlation,before,after]);
}
export async function projectAccess(c:PoolClient,actor:string,id:string,manage=false){
 if(!uuid(id))throw missing();
 const project=(await c.query('SELECT project_id,name,description,revision::text FROM workspace.project WHERE project_id=$1 FOR UPDATE',[id])).rows[0];
 const member=(await c.query('SELECT revision::text,membership_generation::text,role FROM workspace.membership WHERE project_id=$1 AND user_id=$2 AND active',[id,actor])).rows[0];
 if(!project||!member)throw missing();
 if(manage&&!(await c.query("SELECT 1 FROM workspace.capability_grant WHERE project_id=$1 AND subject_id=$2 AND resource_kind='project' AND resource_id=$1 AND action='membership-manage' AND valid LIMIT 1",[id,actor])).rowCount)throw new ProjectFault(403,'forbidden');
 return {project,member};
}
type Guard=()=>Promise<boolean>;
export class WorkspaceProjectStore {
 readonly pool:Pool;readonly sessions:WorkspaceSessionStore;
 readonly cursor:ProjectCursor|null;
 constructor(pool:Pool,sessions:WorkspaceSessionStore,key:CursorKey|null=null,ttlSeconds=300){this.pool=pool;this.sessions=sessions;this.cursor=key?new ProjectCursor(key,ttlSeconds):null;}
 async transaction<T>(token:string,work:(c:PoolClient,actor:string,guard:Guard)=>Promise<T|null>):Promise<T>{
  let denied:ProjectFault|null=null;
  const result=await ownedTransaction(this.pool,'runtime',async c=>{
   const auth=await this.sessions.inspectInTransaction(c,token);
   if(auth.kind!=='authenticated'){denied=new ProjectFault(auth.kind==='unauthenticated'?401:503,auth.kind==='unauthenticated'?'authentication_required':'access_unavailable');return null;}
   const guard:Guard=async()=>{
    const current=await this.sessions.inspectInTransaction(c,token);
    if(current.kind==='authenticated')return true;
    denied=new ProjectFault(current.kind==='unauthenticated'?401:503,current.kind==='unauthenticated'?'authentication_required':'access_unavailable');return false;
   };
   // Call guard after relevant lock waits and before the first business write/response.
   return work(c,auth.session.userId,guard);
  });
  if(denied)throw denied;return result as T;
 }
 async create(token:string,input:{name:string;description?:string},key:string,correlation:string=randomUUID()):Promise<Outcome>{
  if(!key||typeof input.name!=='string'||!input.name.trim()||(input.description!==undefined&&typeof input.description!=='string'))throw invalid();
  const description=input.description??'',hash=requestHash(['createProject',input.name,description]);
  return this.transaction(token,async(c,actor,guard)=>{
   const authority=(await c.query('SELECT can_create FROM workspace.global_project_authority WHERE user_id=$1',[actor])).rows[0];
   if(!authority?.can_create)throw new ProjectFault(403,'forbidden');
   const saved=await outcome(c,actor,'createProject',key,hash);
   if(saved){await projectAccess(c,actor,saved.projectId);if(!await guard())return null;return saved;}
   if(!await guard())return null;
   const id=randomUUID();
   const row=(await c.query('INSERT INTO workspace.project(project_id,name,description,created_by,created_at) VALUES($1,$2,$3,$4,clock_timestamp()) RETURNING project_id,name,description,revision::text',[id,input.name,description,actor])).rows[0];
   await c.query("INSERT INTO workspace.membership(project_id,user_id,role,membership_generation) VALUES($1,$2,'product_owner',1)",[id,actor]);
   await c.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action) VALUES($1,$2,$3,'project',$3,'membership-manage')",[randomUUID(),actor,id]);
   const body={...row,revision:wireRevision(row.revision)},value={status:201,body,projectId:id};
   await businessAudit(c,actor,id,'project_created',id,correlation,null,'revision:1');
   await saveOutcome(c,actor,'createProject',key,hash,value);return value;
  });
 }
 async get(token:string,id:string){
  return this.transaction(token,async(c,actor,guard)=>{
   const {project}=await projectAccess(c,actor,id);if(!await guard())return null;
   return {...project,revision:wireRevision(project.revision)};
  });
 }
 async list(token:string,tokenCursor?:string){
  return this.transaction(token,async(c,actor,guard)=>{
   const rows=(await c.query("SELECT p.project_id,p.name,p.description,p.revision::text,m.revision::text membership_revision,m.membership_generation::text,coalesce((SELECT jsonb_agg(jsonb_build_array(g.grant_id,g.action,g.valid,g.permission_revision::text) ORDER BY g.grant_id) FROM workspace.capability_grant g WHERE g.project_id=p.project_id AND g.subject_id=m.user_id AND g.resource_kind='project' AND g.resource_id=p.project_id),'[]'::jsonb) capabilities FROM workspace.membership m JOIN workspace.project p ON p.project_id=m.project_id WHERE m.user_id=$1 AND m.active ORDER BY p.project_id",[actor])).rows;
   if(!await guard())return null;
   return this.page(c,actor,'listProjects',null,rows,50,tokenCursor,row=>({project_id:row.project_id,name:row.name,description:row.description,revision:wireRevision(row.revision)}),'project_id');
  });
 }
 async add(token:string,projectId:string,input:{user_id:string;role:string},key:string,correlation:string=randomUUID()):Promise<Outcome>{
  if(!key||!['product_owner','scrum_master','developer','viewer'].includes(input.role))throw invalid();
  if(!uuid(projectId)||!uuid(input.user_id))throw missing();projectId=projectId.toLowerCase();const target=input.user_id.toLowerCase();
  const hash=requestHash(['addMember',projectId,target,input.role]);
  return this.transaction(token,async(c,actor,guard)=>{
   // The clock guard serializes cooperating account/session/project writers; target lock precedes project.
   const account=(await c.query('SELECT disabled FROM workspace.lock_auth_account($1)',[target])).rows[0];
   await projectAccess(c,actor,projectId,true);
   const saved=await outcome(c,actor,'addMember',key,hash);if(saved){if(!await guard())return null;return saved;}
   if(!account||account.disabled)throw missing();
   const old=(await c.query('SELECT active,revision::text,membership_generation::text FROM workspace.membership WHERE project_id=$1 AND user_id=$2 FOR UPDATE',[projectId,target])).rows[0];
   if(old?.active)throw conflict();
   const revision=old?wireRevision((BigInt(old.revision)+1n).toString()):1,generation=old?(BigInt(old.membership_generation)+1n).toString():'1';
   if(!await guard())return null;
   await c.query('INSERT INTO workspace.membership(project_id,user_id,role,membership_generation,revision) VALUES($1,$2,$3,$4,$5) ON CONFLICT(project_id,user_id) DO UPDATE SET role=EXCLUDED.role,membership_generation=EXCLUDED.membership_generation,revision=EXCLUDED.revision,active=true',[projectId,target,input.role,generation,revision]);
   await c.query('UPDATE workspace.capability_grant SET valid=false,permission_revision=permission_revision+1 WHERE project_id=$1 AND subject_id=$2 AND valid',[projectId,target]);
   await c.query('UPDATE workspace.read_grant SET valid=false,revision=revision+1 WHERE project_id=$1 AND user_id=$2 AND valid',[projectId,target]);
   const body={project_id:projectId,user_id:target,role:input.role,revision},result={status:201,body,projectId};
   await businessAudit(c,actor,projectId,'member_added',target,correlation,old?`generation:${old.membership_generation}`:null,`generation:${generation}`);
   await saveOutcome(c,actor,'addMember',key,hash,result);return result;
  });
 }
 async members(token:string,id:string,limit=50,cursor?:string){
  if(!Number.isInteger(limit)||limit<1||limit>100)throw invalid();
  return this.transaction(token,async(c,actor,guard)=>{
   const access=await projectAccess(c,actor,id);
   const rows=(await c.query('SELECT project_id,user_id,role,revision::text,membership_generation::text FROM workspace.membership WHERE project_id=$1 AND active ORDER BY user_id',[id])).rows;
   const capabilities=(await c.query("SELECT grant_id,action,valid,permission_revision::text FROM workspace.capability_grant WHERE project_id=$1 AND subject_id=$2 AND resource_kind='project' AND resource_id=$1 ORDER BY grant_id",[id,actor])).rows;
   if(!await guard())return null;
   return this.page(c,actor,'listMembers',access.project.project_id,rows,limit,cursor,row=>({project_id:row.project_id,user_id:row.user_id,role:row.role,revision:wireRevision(row.revision)}),'user_id',[access.member,capabilities]);
  });
 }
 async remove(token:string,projectId:string,target:string,expected:string,key:string,correlation:string=randomUUID()):Promise<Outcome>{
  if(!key||!/^[1-9]\d{0,15}$/.test(expected))throw invalid();wireRevision(expected);
  if(!uuid(projectId)||!uuid(target))throw missing();projectId=projectId.toLowerCase();target=target.toLowerCase();
  const hash=requestHash(['removeMember',projectId,target,expected]);
  return this.transaction(token,async(c,actor,guard)=>{
   await c.query('SELECT disabled FROM workspace.lock_auth_account($1)',[target]);
   await projectAccess(c,actor,projectId,true);
   const saved=await outcome(c,actor,'removeMember',key,hash);if(saved){if(!await guard())return null;return saved;}
   const member=(await c.query('SELECT active,revision::text,membership_generation::text FROM workspace.membership WHERE project_id=$1 AND user_id=$2 FOR UPDATE',[projectId,target])).rows[0];
   if(!member?.active)throw missing();if(member.revision!==expected)throw conflict();
   const remaining=(await c.query("SELECT 1 FROM workspace.membership m JOIN workspace.auth_account a ON a.user_id=m.user_id JOIN workspace.capability_grant g ON g.subject_id=m.user_id AND g.project_id=m.project_id WHERE m.project_id=$1 AND m.user_id<>$2 AND m.active AND NOT a.disabled AND g.valid AND g.resource_kind='project' AND g.resource_id=$1 AND g.action='membership-manage' LIMIT 1",[projectId,target])).rowCount;
   if(!remaining)throw conflict();
   const tasks=(await c.query('SELECT task_id,revision::text FROM workspace.task WHERE project_id=$1 AND assignee_id=$2 ORDER BY task_id FOR UPDATE',[projectId,target])).rows;
   const nextRevision=wireRevision((BigInt(member.revision)+1n).toString());for(const task of tasks)wireRevision((BigInt(task.revision)+1n).toString());
   if(!await guard())return null;
   await c.query('UPDATE workspace.membership SET active=false,membership_generation=membership_generation+1,revision=$3 WHERE project_id=$1 AND user_id=$2',[projectId,target,nextRevision]);
   await c.query('UPDATE workspace.capability_grant SET valid=false,permission_revision=permission_revision+1 WHERE project_id=$1 AND subject_id=$2 AND valid',[projectId,target]);
   await c.query('UPDATE workspace.read_grant SET valid=false,revision=revision+1 WHERE project_id=$1 AND user_id=$2 AND valid',[projectId,target]);
   for(const task of tasks){
    await c.query('UPDATE workspace.task SET assignee_id=NULL,revision=revision+1 WHERE task_id=$1',[task.task_id]);
    await businessAudit(c,actor,projectId,'task_unassigned',task.task_id,correlation,`assignee:${target};revision:${task.revision}`,`assignee:null;revision:${BigInt(task.revision)+1n}`);
   }
   await businessAudit(c,actor,projectId,'member_removed',target,correlation,`generation:${member.membership_generation}`,`generation:${BigInt(member.membership_generation)+1n}`);
   const result={status:204,body:null,projectId};await saveOutcome(c,actor,'removeMember',key,hash,result);return result;
  });
 }
 async actions(token:string,kind:string,id?:string,taskOperations:ReadonlySet<TaskOperation>=new Set(),resourceId?:string){
  return this.transaction(token,async(c,actor,guard)=>{
   let operations:string[];
   if(kind==='global'){
    operations=['getAllowedActions','getSession','listProjects','signOut'];
    if((await c.query('SELECT can_create FROM workspace.global_project_authority WHERE user_id=$1',[actor])).rows[0]?.can_create)operations.push('createProject');
   }else if(kind==='project'){
    const access=await projectAccess(c,actor,id!);id=access.project.project_id;
    operations=['getAllowedActions','getProject','listMembers'];
    if((await c.query("SELECT 1 FROM workspace.capability_grant WHERE project_id=$1 AND subject_id=$2 AND resource_kind='project' AND resource_id=$1 AND action='membership-manage' AND valid LIMIT 1",[id,actor])).rowCount)operations.push('addMember','removeMember');
    if(taskOperations.has('listTasks'))operations.push('listTasks');
    if(taskOperations.has('createTask')&&(await c.query("SELECT 1 FROM workspace.capability_grant WHERE project_id=$1 AND subject_id=$2 AND resource_kind='project' AND resource_id=$1 AND action='backlog-author' AND valid LIMIT 1",[id,actor])).rowCount)operations.push('createTask');
   }else if(kind==='task'){
    if(!id||!uuid(id)||!resourceId||!uuid(resourceId))throw invalid();
    const access=await projectAccess(c,actor,id),projectId:string=access.project.project_id;id=projectId;resourceId=resourceId.toLowerCase();
    const task=(await c.query('SELECT location_kind FROM workspace.task WHERE task_id=$1 AND project_id=$2',[resourceId,projectId])).rows[0];
    if(!task)throw missing();
    operations=await discoverTaskOperations(c,actor,projectId,task.location_kind,taskOperations);
   }else throw missing();
   if(!await guard())return null;
   return {resource_kind:kind,project_id:kind==='global'?null:id,resource_id:kind==='task'?resourceId:null,document_id:null,version_id:null,allowed_operations:operations.sort()};
  });
 }
 async page(c:PoolClient,actor:string,route:string,project:string|null,rows:Record<string,any>[],limit:number,token:string|undefined,shape:(row:Record<string,any>)=>unknown,idField:string,authority:unknown=null){
  if(!this.cursor)throw new ProjectFault(503,'access_unavailable');
  const scope=this.cursor.fingerprint(['scope',actor,route,project,limit]);
  const generation=this.cursor.fingerprint(['projection',authority,rows]);
  const now=Math.floor(Number((await c.query('SELECT extract(epoch FROM clock_timestamp())*1000 AS now')).rows[0].now));
  const after=token===undefined?null:this.cursor.decode(token,scope,generation,now);
  const eligible=after===null?rows:rows.filter(row=>row[idField]>after);
  const selected=eligible.slice(0,limit);
  return {items:selected.map(shape),next_cursor:eligible.length>limit?this.cursor.encode(scope,generation,String(selected.at(-1)![idField]),now):null};
 }
}
