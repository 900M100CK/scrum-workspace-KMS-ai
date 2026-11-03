import {randomUUID} from 'node:crypto';
import type {Pool} from 'pg';
import type {WorkspaceSessionStore} from '../session/store.ts';
import {WorkspaceProjectStore,projectAccess,uuid} from '../projects/store.ts';
import type {CursorKey} from '../projects/cursor.ts';
import {ProjectFault,invalid,missing,conflict,requestHash,wireRevision} from '../projects/outcomes.ts';
import {taskOutcome,saveTaskOutcome} from './outcomes.ts';
import type {TaskOutcome} from './outcomes.ts';
import type {CreateTask,Task,TaskList} from './types.ts';

const text=(s:unknown):s is string=>typeof s==='string'&&!s.includes('\0')&&Buffer.from(s).toString('utf8')===s;
const projection=`t.task_id,t.project_id,t.type,t.title,t.description,t.state,t.assignee_id,t.revision::text,t.location_kind,t.location_sprint_id,t.backlog_position::text,t.created_at,
 coalesce((SELECT b.status='open' FROM workspace.blocker_event b WHERE b.task_id=t.task_id ORDER BY b.sequence DESC LIMIT 1),false) blocked`;
function taskProjection(row:Record<string,any>):Task{
 if(!['backlog','sprint','completed'].includes(row.location_kind)||(row.location_kind!=='backlog'&&!row.location_sprint_id))throw Error('Invalid task location');
 return {task_id:row.task_id,project_id:row.project_id,type:row.type,title:row.title,description:row.description,state:row.state,assignee_id:row.assignee_id,blocked:row.blocked,revision:wireRevision(row.revision),work_location:row.location_kind==='backlog'?{kind:'backlog',position:row.backlog_position}:{kind:row.location_kind,sprint_id:row.location_sprint_id},created_at:row.created_at.toISOString()};
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
   if(!(await c.query("SELECT 1 FROM workspace.capability_grant WHERE project_id=$1 AND subject_id=$2 AND resource_kind='project' AND resource_id=$1 AND action='backlog-author' AND valid LIMIT 1",[projectId,actor])).rowCount)throw new ProjectFault(403,'forbidden');
   const saved=await taskOutcome(c,actor,key,hash);
   if(saved){if(saved.projectId!==projectId)throw conflict();if(!await guard())return null;return saved;}
   if(!await guard())return null;
   const row=(await c.query("INSERT INTO workspace.task(task_id,project_id,type,title,description,state,assignee_id,backlog_position,revision,location_kind,location_sprint_id,created_at) SELECT $1,$2,$3,$4,$5,'todo',NULL,coalesce(max(backlog_position),0)+1,1,'backlog',NULL,date_trunc('milliseconds',clock_timestamp()) FROM workspace.task WHERE project_id=$2 AND location_kind='backlog' RETURNING task_id,project_id,type,title,description,state,assignee_id,backlog_position::text,revision::text,created_at",[randomUUID(),projectId,input.type,input.title,description])).rows[0];
   const body:Task={task_id:row.task_id,project_id:row.project_id,type:row.type,title:row.title,description:row.description,state:row.state,assignee_id:row.assignee_id,blocked:false,revision:wireRevision(row.revision),work_location:{kind:'backlog',position:row.backlog_position},created_at:row.created_at.toISOString()};
   await c.query("INSERT INTO workspace.business_audit(event_id,actor_id,project_id,action,entity_id,time,before_ref,after_ref,correlation_id) VALUES($1,$2,$3,'backlog-item-create',$4,$5,NULL,'revision:1',$6)",[randomUUID(),actor,projectId,body.task_id,body.created_at,correlation]);
   await saveTaskOutcome(c,actor,key,hash,body);return {status:201,body,projectId};
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
