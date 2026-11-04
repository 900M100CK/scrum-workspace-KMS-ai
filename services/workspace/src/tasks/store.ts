import {randomUUID} from 'node:crypto';
import type {Pool} from 'pg';
import type {WorkspaceSessionStore} from '../session/store.ts';
import {WorkspaceProjectStore,projectAccess,uuid} from '../projects/store.ts';
import type {CursorKey} from '../projects/cursor.ts';
import {ProjectFault,invalid,missing,conflict,requestHash,wireRevision} from '../projects/outcomes.ts';
import {taskOutcome,saveTaskOutcome} from './outcomes.ts';
import {mutationOutcome,saveMutationOutcome} from './mutation-outcomes.ts';
import {hasCapability} from '../projects/capabilities.ts';
import type {TaskOutcome} from './outcomes.ts';
import type {CreateTask,EditTask,SetState,SetAssignee,RecordBlocker,Blocker,BlockerEventList,Task,TaskList} from './types.ts';

const text=(s:unknown):s is string=>typeof s==='string'&&!s.includes('\0')&&Buffer.from(s).toString('utf8')===s;
const projection=`t.task_id,t.project_id,t.type,t.title,t.description,t.state,t.assignee_id,t.revision::text,t.location_kind,t.location_sprint_id,t.backlog_position::text,t.created_at,
 coalesce((SELECT b.status='open' FROM workspace.blocker_event b WHERE b.task_id=t.task_id ORDER BY b.sequence DESC LIMIT 1),false) blocked`;
function taskProjection(row:Record<string,any>):Task{
 if(!['backlog','sprint','completed'].includes(row.location_kind)||(row.location_kind!=='backlog'&&!row.location_sprint_id))throw Error('Invalid task location');
 return {task_id:row.task_id,project_id:row.project_id,type:row.type,title:row.title,description:row.description,state:row.state,assignee_id:row.assignee_id,blocked:row.blocked,revision:wireRevision(row.revision),work_location:row.location_kind==='backlog'?{kind:'backlog',position:row.backlog_position}:{kind:row.location_kind,sprint_id:row.location_sprint_id},created_at:row.created_at.toISOString()};
}
function blockerProjection(row:Record<string,any>):Blocker{
 return {event_id:row.event_id,task_id:row.task_id,status:row.status,description:row.description,outcome:row.outcome,actor_id:row.actor_id,recorded_at:row.recorded_at.toISOString(),sequence:wireRevision(row.sequence)};
}
export class WorkspaceTaskStore {
 readonly projects:WorkspaceProjectStore;
 constructor(pool:Pool,sessions:WorkspaceSessionStore,key:CursorKey|null=null,ttlSeconds=300){this.projects=new WorkspaceProjectStore(pool,sessions,key,ttlSeconds);}
 async create(token:string,projectId:string,input:CreateTask,key:string,correlation:string=randomUUID()):Promise<TaskOutcome>{
  if(!uuid(projectId))throw missing();projectId=projectId.toLowerCase();
  if(typeof key!=='string'||!key||!input||Object.keys(input).some(k=>!['type','title','description'].includes(k))||!['story','task','bug'].includes(input.type)||!text(input.title)||!input.title.trim()||(input.description!==undefined&&!text(input.description)))throw invalid();
  const description=input.description??'',hash=requestHash(['createTask',projectId,input.type,input.title,description]);
  return this.projects.transaction(token,async(c,actor,guard)=>{
   await projectAccess(c,actor,projectId);
   if(!await hasCapability(c,actor,projectId,'backlog-author'))throw new ProjectFault(403,'forbidden');
   const saved=await taskOutcome(c,actor,key,hash);
   if(saved){if(saved.projectId!==projectId)throw conflict();if(!await guard())return null;return saved;}
   if(!await guard())return null;
   const row=(await c.query("INSERT INTO workspace.task(task_id,project_id,type,title,description,state,assignee_id,backlog_position,revision,location_kind,location_sprint_id,created_at) SELECT $1,$2,$3,$4,$5,'todo',NULL,coalesce(max(backlog_position),0)+1,1,'backlog',NULL,date_trunc('milliseconds',clock_timestamp()) FROM workspace.task WHERE project_id=$2 AND location_kind='backlog' RETURNING task_id,project_id,type,title,description,state,assignee_id,backlog_position::text,revision::text,created_at",[randomUUID(),projectId,input.type,input.title,description])).rows[0];
   const body:Task={task_id:row.task_id,project_id:row.project_id,type:row.type,title:row.title,description:row.description,state:row.state,assignee_id:row.assignee_id,blocked:false,revision:wireRevision(row.revision),work_location:{kind:'backlog',position:row.backlog_position},created_at:row.created_at.toISOString()};
   await c.query("INSERT INTO workspace.business_audit(event_id,actor_id,project_id,action,entity_id,time,before_ref,after_ref,correlation_id) VALUES($1,$2,$3,'backlog-item-create',$4,$5,NULL,'revision:1',$6)",[randomUUID(),actor,projectId,body.task_id,body.created_at,correlation]);
   await saveTaskOutcome(c,actor,key,hash,body);return {status:201,body,projectId};
  });
 }
 async edit(token:string,id:string,input:EditTask,key:string,correlation:string=randomUUID()):Promise<{status:200;body:Task;projectId:string}>{
  if(!uuid(id))throw missing();id=id.toLowerCase();
  if(typeof key!=='string'||!key||!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['title','description','expected_revision'].includes(k))||!Number.isSafeInteger(input.expected_revision)||input.expected_revision<1)throw invalid();
  const hasTitle=Object.hasOwn(input,'title'),hasDescription=Object.hasOwn(input,'description');
  if((hasTitle&&(!text(input.title)||!input.title.trim()))||(hasDescription&&!text(input.description)))throw invalid();
  const hash=requestHash(['editTask',id,input.expected_revision,hasTitle,hasTitle?input.title:null,hasDescription,hasDescription?input.description:null]);
  return this.projects.transaction(token,async(c,actor,guard)=>{
   const hint=(await c.query('SELECT project_id FROM workspace.task WHERE task_id=$1',[id])).rows[0];if(!hint)throw missing();
   const projectId:string=hint.project_id;
   await projectAccess(c,actor,projectId);
   if(!await hasCapability(c,actor,projectId,'task-edit'))throw new ProjectFault(403,'forbidden');
   const row=(await c.query(`SELECT ${projection} FROM workspace.task t WHERE t.task_id=$1 AND t.project_id=$2 FOR UPDATE OF t`,[id,projectId])).rows[0];if(!row)throw missing();
   const saved=await mutationOutcome(c,actor,'editTask',key,hash,id,projectId);
   if(saved){if(saved.status!==200)throw conflict();if(!await guard())return null;return saved;}
   if(!await guard())return null;
   const current=taskProjection(row);
   if(current.work_location.kind!=='backlog'||current.revision!==input.expected_revision)throw conflict();
   const title=hasTitle?input.title!:current.title,description=hasDescription?input.description!:current.description;
   const changed=title!==current.title||description!==current.description;
   const body:Task=changed?{...current,title,description,revision:wireRevision((BigInt(current.revision)+1n).toString())}:current;
   if(changed){
    await c.query('UPDATE workspace.task SET title=$2,description=$3,revision=$4 WHERE task_id=$1',[id,title,description,body.revision]);
    await c.query("INSERT INTO workspace.business_audit(event_id,actor_id,project_id,action,entity_id,correlation_id,before_ref,after_ref) VALUES($1,$2,$3,'backlog-item-edit',$4,$5,$6,$7)",[randomUUID(),actor,projectId,id,correlation,`revision:${current.revision}`,JSON.stringify({revision:body.revision,actor_id:actor,operation:'editTask',key,payload_hash:hash})]);
   }
   await saveMutationOutcome(c,actor,'editTask',key,hash,id,projectId,body);
   return {status:200,body,projectId};
  });
 }
 async setState(token:string,id:string,input:SetState,key:string,correlation:string=randomUUID()):Promise<{status:200;body:Task;projectId:string}>{
  if(!uuid(id))throw missing();id=id.toLowerCase();
  if(!key||typeof key!=='string'||!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['state','expected_revision'].includes(k))||!['todo','in_progress','done'].includes(input.state)||!Number.isSafeInteger(input.expected_revision)||input.expected_revision<1)throw invalid();
  const hash=requestHash(['setTaskState',id,input.state,input.expected_revision]);
  return this.projects.transaction(token,async(c,actor,guard)=>{
   const hint=(await c.query('SELECT project_id FROM workspace.task WHERE task_id=$1',[id])).rows[0];if(!hint)throw missing();
   const projectId:string=hint.project_id;await projectAccess(c,actor,projectId);
   if(!await hasCapability(c,actor,projectId,'task-state'))throw new ProjectFault(403,'forbidden');
   const row=(await c.query(`SELECT ${projection} FROM workspace.task t WHERE t.task_id=$1 AND t.project_id=$2 FOR UPDATE OF t`,[id,projectId])).rows[0];if(!row)throw missing();
   const saved=await mutationOutcome(c,actor,'setTaskState',key,hash,id,projectId);
   if(saved){if(saved.status!==200)throw conflict();if(!await guard())return null;return saved;}
   if(!await guard())return null;
   const current=taskProjection(row);if(current.revision!==input.expected_revision)throw conflict();
   const reopen=current.state==='done'&&current.work_location.kind==='completed'&&input.state!=='done';
   const state=reopen?'todo':input.state,changed=state!==current.state;
   let body:Task=current;
   if(changed){
    const revision=wireRevision((BigInt(current.revision)+1n).toString());
    const work_location:Task['work_location']=reopen?{kind:'backlog',position:(await c.query("SELECT (coalesce(max(backlog_position),0)+1)::text position FROM workspace.task WHERE project_id=$1 AND location_kind='backlog'",[projectId])).rows[0].position}:current.work_location;
    body={...current,state,revision,work_location};
   }
   if(!await guard())return null;
   if(changed){
    await c.query('UPDATE workspace.task SET state=$2,revision=$3,location_kind=$4,location_sprint_id=$5,backlog_position=$6 WHERE task_id=$1',[id,state,body.revision,body.work_location.kind,body.work_location.kind==='backlog'?null:body.work_location.sprint_id,body.work_location.kind==='backlog'?body.work_location.position:row.backlog_position]);
    await c.query("INSERT INTO workspace.business_audit(event_id,actor_id,project_id,action,entity_id,correlation_id,before_ref,after_ref) VALUES($1,$2,$3,'board-state-change',$4,$5,$6,$7)",[randomUUID(),actor,projectId,id,correlation,JSON.stringify({revision:current.revision,state:current.state,location:current.work_location}),JSON.stringify({revision:body.revision,state:body.state,location:body.work_location})]);
   }
   await saveMutationOutcome(c,actor,'setTaskState',key,hash,id,projectId,body);return {status:200,body,projectId};
  });
 }
 async assign(token:string,id:string,input:SetAssignee,key:string,correlation:string=randomUUID()):Promise<{status:200;body:Task;projectId:string}>{
  if(!uuid(id))throw missing();id=id.toLowerCase();
  if(!key||typeof key!=='string'||!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['assignee_id','expected_revision'].includes(k))||!Object.hasOwn(input,'assignee_id')||(input.assignee_id!==null&&(typeof input.assignee_id!=='string'||!uuid(input.assignee_id)))||!Number.isSafeInteger(input.expected_revision)||input.expected_revision<1)throw invalid();
  const target=input.assignee_id?.toLowerCase()??null,hash=requestHash(['setAssignee',id,target,input.expected_revision]);
  return this.projects.transaction(token,async(c,actor,guard)=>{
   const hint=(await c.query('SELECT project_id FROM workspace.task WHERE task_id=$1',[id])).rows[0];if(!hint)throw missing();
   // Replay skips old-target eligibility; absent receipts lock target before Project, like removeMember.
   const retained=(await c.query("SELECT 1 FROM workspace.idempotency_record WHERE actor_id=$1 AND operation='setAssignee' AND idempotency_key=$2",[actor,key])).rowCount;
   const account=!retained&&target?(await c.query('SELECT disabled FROM workspace.lock_auth_account($1)',[target])).rows[0]:null;
   const projectId:string=hint.project_id;await projectAccess(c,actor,projectId);
   if(!await hasCapability(c,actor,projectId,'task-assign'))throw new ProjectFault(403,'forbidden');
   const member=!retained&&target?(await c.query('SELECT 1 FROM workspace.membership WHERE project_id=$1 AND user_id=$2 AND active FOR UPDATE',[projectId,target])).rowCount:null;
   const row=(await c.query(`SELECT ${projection} FROM workspace.task t WHERE t.task_id=$1 AND t.project_id=$2 FOR UPDATE OF t`,[id,projectId])).rows[0];if(!row)throw missing();
   const saved=await mutationOutcome(c,actor,'setAssignee',key,hash,id,projectId);
   if(saved){if(saved.status!==200)throw conflict();if(!await guard())return null;return saved;}
   if(!await guard())return null;
   if(target&&(!account||account.disabled||!member))throw invalid();
   const current=taskProjection(row);if(current.revision!==input.expected_revision)throw conflict();
   const changed=current.assignee_id!==target,body:Task=changed?{...current,assignee_id:target,revision:wireRevision((BigInt(current.revision)+1n).toString())}:current;
   if(changed){
    await c.query('UPDATE workspace.task SET assignee_id=$2,revision=$3 WHERE task_id=$1',[id,target,body.revision]);
    await c.query("INSERT INTO workspace.business_audit(event_id,actor_id,project_id,action,entity_id,correlation_id,before_ref,after_ref) VALUES($1,$2,$3,'assignee-set',$4,$5,$6,$7)",[randomUUID(),actor,projectId,id,correlation,JSON.stringify({revision:current.revision,assignee_id:current.assignee_id}),JSON.stringify({revision:body.revision,assignee_id:target})]);
   }
   await saveMutationOutcome(c,actor,'setAssignee',key,hash,id,projectId,body);return {status:200,body,projectId};
  });
 }
 async recordBlocker(token:string,id:string,input:RecordBlocker,key:string,correlation:string=randomUUID()):Promise<{status:201;body:Blocker;projectId:string}>{
  if(!uuid(id))throw missing();id=id.toLowerCase();
  if(!key||typeof key!=='string'||!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['status','description','outcome','expected_revision'].includes(k))||!['open','resolved'].includes(input.status)||!text(input.description)||!input.description.length||(input.outcome!==undefined&&input.outcome!==null&&!text(input.outcome))||!Number.isSafeInteger(input.expected_revision)||input.expected_revision<1)throw invalid();
  const outcome=input.outcome??null,hash=requestHash(['recordBlocker',id,input.status,input.description,outcome,input.expected_revision]);
  return this.projects.transaction(token,async(c,actor,guard)=>{
   const hint=(await c.query('SELECT project_id FROM workspace.task WHERE task_id=$1',[id])).rows[0];if(!hint)throw missing();
   const projectId:string=hint.project_id;await projectAccess(c,actor,projectId);
   if(!await hasCapability(c,actor,projectId,'task-blocker'))throw new ProjectFault(403,'forbidden');
   const row=(await c.query('SELECT revision::text FROM workspace.task WHERE task_id=$1 AND project_id=$2 FOR UPDATE',[id,projectId])).rows[0];if(!row)throw missing();
   const saved=await mutationOutcome(c,actor,'recordBlocker',key,hash,id,projectId);
   if(saved){if(saved.status!==201)throw conflict();if(!await guard())return null;return saved;}
   if(!await guard())return null;
   const current=wireRevision(row.revision);if(current!==input.expected_revision)throw conflict();
   const revision=wireRevision((BigInt(row.revision)+1n).toString());
   const sequence=wireRevision((await c.query('SELECT (coalesce(max(sequence),0)+1)::text value FROM workspace.blocker_event WHERE task_id=$1',[id])).rows[0].value);
   if(!await guard())return null;
   const event=(await c.query("INSERT INTO workspace.blocker_event(event_id,task_id,status,description,outcome,actor_id,sequence,recorded_at) VALUES($1,$2,$3,$4,$5,$6,$7,date_trunc('milliseconds',clock_timestamp())) RETURNING *,sequence::text",[randomUUID(),id,input.status,input.description,outcome,actor,sequence])).rows[0],body=blockerProjection(event);
   await c.query('UPDATE workspace.task SET revision=$2 WHERE task_id=$1',[id,revision]);
   await c.query("INSERT INTO workspace.business_audit(event_id,actor_id,project_id,action,entity_id,correlation_id,before_ref,after_ref) VALUES($1,$2,$3,'blocker-event-record',$4,$5,$6,$7)",[randomUUID(),actor,projectId,id,correlation,JSON.stringify({revision:current}),JSON.stringify({revision,event_id:body.event_id,status:body.status,sequence})]);
   await saveMutationOutcome(c,actor,'recordBlocker',key,hash,id,projectId,body);return {status:201,body,projectId};
  });
 }
 async blockers(token:string,id:string,cursor?:string):Promise<BlockerEventList>{
  if(!uuid(id))throw missing();id=id.toLowerCase();if(cursor!==undefined&&(typeof cursor!=='string'||!cursor))throw invalid();
  return this.projects.transaction(token,async(c,actor,guard)=>{
   const hint=(await c.query('SELECT project_id FROM workspace.task WHERE task_id=$1',[id])).rows[0];if(!hint)throw missing();
   const projectId:string=hint.project_id,access=await projectAccess(c,actor,projectId),codec=this.projects.cursor;if(!codec)throw new ProjectFault(503,'access_unavailable');
   const rows=(await c.query('SELECT event_id,task_id,status,description,outcome,actor_id,sequence::text,recorded_at FROM workspace.blocker_event WHERE task_id=$1 ORDER BY workspace.blocker_event.sequence',[id])).rows,items=rows.map(blockerProjection);
   const scope=codec.fingerprint(['listBlockerEvents',actor,projectId,id,'sequence',50]),generation=codec.fingerprint([access.member.revision,access.member.membership_generation,items]);
   const now=Math.floor(Number((await c.query('SELECT extract(epoch FROM clock_timestamp())*1000 value')).rows[0].value));
   let start=0;if(cursor!==undefined){const after=codec.decode(cursor,scope,generation,now),index=items.findIndex(item=>item.event_id===after);if(index<0)throw conflict();start=index+1;}
   const selected=items.slice(start,start+50),next=start+selected.length<items.length?codec.encode(scope,generation,selected.at(-1)!.event_id,now):null;
   if(!await guard())return null;return {items:selected,next_cursor:next};
  });
 }
 async get(token:string,id:string):Promise<Task>{
  if(!uuid(id))throw missing();id=id.toLowerCase();
  return this.projects.transaction(token,async(c,actor,guard)=>{
   // Resolve only an internal scope hint before locking Project; never lock Task first.
   const hint=(await c.query('SELECT project_id FROM workspace.task WHERE task_id=$1',[id])).rows[0];if(!hint)throw missing();
   await projectAccess(c,actor,hint.project_id);
   const row=(await c.query(`SELECT ${projection} FROM workspace.task t WHERE t.task_id=$1 AND t.project_id=$2`,[id,hint.project_id])).rows[0];if(!row)throw missing();
   const body=taskProjection(row);if(!await guard())return null;return body;
  });
 }
 async list(token:string,projectId:string,location:'all'|'backlog'='all',cursor?:string):Promise<TaskList>{
  if(!uuid(projectId))throw missing();projectId=projectId.toLowerCase();
  if(!['all','backlog'].includes(location)||(cursor!==undefined&&(typeof cursor!=='string'||!cursor)))throw invalid();
  return this.projects.transaction(token,async(c,actor,guard)=>{
   const access=await projectAccess(c,actor,projectId),codec=this.projects.cursor;if(!codec)throw new ProjectFault(503,'access_unavailable');
   const order=location==='backlog'?'t.backlog_position,t.task_id':'t.task_id';
   const rows=(await c.query(`SELECT ${projection} FROM workspace.task t WHERE t.project_id=$1 AND ($2='all' OR t.location_kind='backlog') ORDER BY ${order}`,[projectId,location])).rows;
   const items=rows.map(taskProjection),revision=(await c.query('SELECT backlog_revision::text value FROM workspace.project WHERE project_id=$1',[projectId])).rows[0].value;
   const scope=codec.fingerprint(['task-list-v1',actor,projectId,location,order,50]);
   const generation=codec.fingerprint(['task-list-projection-v1',access.member.revision,access.member.membership_generation,revision,items]);
   const now=Math.floor(Number((await c.query('SELECT extract(epoch FROM clock_timestamp())*1000 value')).rows[0].value));
   let start=0;
   if(cursor!==undefined){const after=codec.decode(cursor,scope,generation,now),index=items.findIndex(item=>item.task_id===after);if(index<0)throw conflict();start=index+1;}
   const selected=items.slice(start,start+50),next=start+selected.length<items.length?codec.encode(scope,generation,selected.at(-1)!.task_id,now):null;
   if(!await guard())return null;return {items:selected,next_cursor:next,backlog_revision:revision};
  });
 }
}
