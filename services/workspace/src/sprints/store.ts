import {randomUUID} from 'node:crypto';
import type {Pool,PoolClient} from 'pg';
import type {WorkspaceSessionStore} from '../session/store.ts';
import {WorkspaceProjectStore,projectAccess,uuid,businessAudit} from '../projects/store.ts';
import {hasCapability} from '../projects/capabilities.ts';
import {ProjectFault,conflict,invalid,missing,requestHash,wireRevision} from '../projects/outcomes.ts';
import type {CursorKey} from '../projects/cursor.ts';
import {taskProjection,taskProjectionSql} from '../tasks/store.ts';
import {SPRINT_ACTIONS} from './authority.ts';
import {sprintOutcome,saveSprintOutcome} from './outcomes.ts';
import type {Sprint,SprintOperation,SprintBody,SprintOutcome,CreateSprint,Allocation,ExpectedRevision,Reorder} from './types.ts';
const columns='sprint_id,project_id,goal,start_date::text,end_date::text,state,revision::text,created_at,started_at,completed_at';
const text=(v:unknown):v is string=>typeof v==='string'&&!v.includes('\0')&&Buffer.from(v).toString('utf8')===v;
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const date=(v:unknown):v is string=>typeof v==='string'&&/^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
export function sprintProjection(r:Record<string,any>):Sprint{return {sprint_id:r.sprint_id,project_id:r.project_id,goal:r.goal,start_date:r.start_date,end_date:r.end_date,state:r.state,revision:wireRevision(r.revision),created_at:r.created_at?.toISOString()??null,started_at:r.started_at?.toISOString()??null,completed_at:r.completed_at?.toISOString()??null};}
export class WorkspaceSprintStore {
 readonly projects:WorkspaceProjectStore;
 constructor(pool:Pool,sessions:WorkspaceSessionStore,key:CursorKey|null=null){this.projects=new WorkspaceProjectStore(pool,sessions,key);}
 private async scoped(c:PoolClient,actor:string,id:string){
  const hint=(await c.query('SELECT project_id FROM workspace.sprint WHERE sprint_id=$1',[id])).rows[0];if(!hint)throw missing();
  const access=await projectAccess(c,actor,hint.project_id);
  const row=(await c.query('SELECT '+columns+' FROM workspace.sprint WHERE sprint_id=$1 AND project_id=$2 FOR UPDATE',[id,hint.project_id])).rows[0];if(!row)throw missing();
  return {row,access,projectId:String(hint.project_id)};
 }
 async get(token:string,id:string):Promise<Sprint>{
  if(!uuid(id))throw missing();id=id.toLowerCase();
  return this.projects.transaction(token,async(c,actor,guard)=>{const {row}=await this.scoped(c,actor,id);if(!await guard())return null;return sprintProjection(row);});
 }
 async list(token:string,projectId:string,cursor?:string){
  if(!uuid(projectId))throw missing();projectId=projectId.toLowerCase();
  return this.projects.transaction(token,async(c,actor,guard)=>{const {member}=await projectAccess(c,actor,projectId);
   const rows=(await c.query('SELECT '+columns+' FROM workspace.sprint WHERE project_id=$1 ORDER BY sprint_id',[projectId])).rows;
   const result=await this.projects.page(c,actor,'listSprints',projectId,rows,50,cursor,sprintProjection,'sprint_id',member);if(!await guard())return null;return result;
  });
 }
 async items(token:string,id:string,cursor?:string){
  if(!uuid(id))throw missing();id=id.toLowerCase();
  return this.projects.transaction(token,async(c,actor,guard)=>{const {projectId,access}=await this.scoped(c,actor,id);
   const rows=(await c.query('SELECT '+taskProjectionSql+',a.allocation_state FROM workspace.task t JOIN workspace.sprint_allocation a ON a.task_id=t.task_id AND a.project_id=t.project_id WHERE a.sprint_id=$1 AND a.project_id=$2 ORDER BY t.task_id',[id,projectId])).rows;
   const result=await this.projects.page(c,actor,'listSprintItems:'+id,projectId,rows,50,cursor,r=>({task:taskProjection(r),allocation_state:r.allocation_state}),'task_id',access.member);if(!await guard())return null;return result;
  });
 }
 async execute(token:string,operation:SprintOperation,id:string,input:CreateSprint|Allocation|ExpectedRevision|Reorder,key:string,correlation:string=randomUUID()):Promise<SprintOutcome>{
  if(!uuid(id))throw missing();id=id.toLowerCase();
  if(!Object.hasOwn(SPRINT_ACTIONS,operation)||typeof key!=='string'||!key||!object(input))throw invalid();
  const fields:Record<SprintOperation,string[]>={createSprint:['goal','start_date','end_date'],allocateTask:['task_id','expected_revision'],startSprint:['expected_revision'],completeSprint:['expected_revision'],reorderBacklog:['task_ids','expected_revision']};
  if(Object.keys(input).sort().join(',')!==fields[operation].sort().join(','))throw invalid();
  let normalized:Record<string,any>;
  if(operation==='createSprint'){const v=input as CreateSprint;if(!text(v.goal)||!v.goal.trim()||!date(v.start_date)||!date(v.end_date)||v.start_date>=v.end_date)throw invalid();normalized={goal:v.goal,start_date:v.start_date,end_date:v.end_date};}
  else if(operation==='reorderBacklog'){const v=input as Reorder;if(!Array.isArray(v.task_ids)||!v.task_ids.every(x=>typeof x==='string'&&uuid(x))||typeof v.expected_revision!=='string'||! /^[1-9][0-9]*$/.test(v.expected_revision))throw invalid();const ids=v.task_ids.map(x=>x.toLowerCase());if(new Set(ids).size!==ids.length)throw invalid();normalized={task_ids:ids,expected_revision:v.expected_revision};}
  else{const v=input as ExpectedRevision;if(!Number.isSafeInteger(v.expected_revision)||v.expected_revision<1)throw invalid();normalized={expected_revision:v.expected_revision};if(operation==='allocateTask'){const taskId=(input as Allocation).task_id;if(typeof taskId!=='string'||!uuid(taskId))throw invalid();normalized.task_id=taskId.toLowerCase();}}
  const hash=requestHash([operation,id,normalized]);
  return this.projects.transaction(token,async(c,actor,guard)=>{
   const projectOperation=operation==='createSprint'||operation==='reorderBacklog';
   const scope=projectOperation?{projectId:id,row:null}:await this.scoped(c,actor,id);
   const projectId=scope.projectId;if(projectOperation)await projectAccess(c,actor,projectId);
   if(!await hasCapability(c,actor,projectId,SPRINT_ACTIONS[operation]))throw new ProjectFault(403,'forbidden');
   if(operation==='allocateTask'){
    const task=(await c.query('SELECT project_id FROM workspace.task WHERE task_id=$1',[normalized.task_id])).rows[0];if(!task||task.project_id!==projectId)throw missing();
   }
   const saved=await sprintOutcome(c,actor,operation,key,hash,projectId,operation==='createSprint'?undefined:id);
   if(saved){if(!await guard())return null;return saved;}
   if(!await guard())return null;
   let body:SprintBody,reference=id;
   if(operation==='createSprint'){
    reference=randomUUID();const row=(await c.query("INSERT INTO workspace.sprint(sprint_id,project_id,goal,start_date,end_date,state,created_at) VALUES($1,$2,$3,$4,$5,'planned',date_trunc('milliseconds',clock_timestamp())) RETURNING "+columns,[reference,projectId,normalized.goal,normalized.start_date,normalized.end_date])).rows[0];body=sprintProjection(row);
    await businessAudit(c,actor,projectId,'sprint-create',reference,correlation,null,JSON.stringify({revision:1,operation,key,payload_hash:hash}));
   }else if(operation==='reorderBacklog'){
    const generation=(await c.query('SELECT backlog_revision::text value FROM workspace.project WHERE project_id=$1',[projectId])).rows[0].value;
    const rows=(await c.query("SELECT task_id,trim_scale(backlog_position)::text backlog_position,revision::text FROM workspace.task WHERE project_id=$1 AND location_kind='backlog' ORDER BY task_id FOR UPDATE",[projectId])).rows;
    const positions=new Map<string,string>((normalized.task_ids as string[]).map((taskId,index)=>[taskId,String(index+1)] as const));
    if(generation!==normalized.expected_revision||rows.length!==normalized.task_ids.length||rows.some(r=>!positions.has(r.task_id)))throw conflict();
    // PostgreSQL numeric is authoritative; never order its decimal positions through JS Number.
    if(!await guard())return null;
    const ordered=(await c.query("SELECT task_id FROM workspace.task WHERE project_id=$1 AND location_kind='backlog' ORDER BY backlog_position,task_id",[projectId])).rows.map(r=>r.task_id);
    if(ordered.some((taskId,i)=>taskId!==normalized.task_ids[i])){
     for(const row of rows){const pos=positions.get(row.task_id)!;if(row.backlog_position!==pos)await c.query('UPDATE workspace.task SET backlog_position=$2,revision=$3 WHERE task_id=$1',[row.task_id,pos,wireRevision((BigInt(row.revision)+1n).toString())]);}
     await businessAudit(c,actor,projectId,'backlog-reorder',projectId,correlation,JSON.stringify({backlog_revision:generation}),JSON.stringify({operation,key,payload_hash:hash}));
    }
    body={project_id:projectId,backlog_revision:(await c.query('SELECT backlog_revision::text value FROM workspace.project WHERE project_id=$1',[projectId])).rows[0].value};
   }else{
    const row=scope.row!;const current=sprintProjection(row);if(current.revision!==normalized.expected_revision)throw conflict();
    const revision=wireRevision((BigInt(current.revision)+1n).toString());
    if(operation==='allocateTask'){
     if(!['planned','active'].includes(current.state))throw conflict();
     const task=(await c.query('SELECT task_id,revision::text,location_kind FROM workspace.task WHERE project_id=$1 AND task_id=$2 FOR UPDATE',[projectId,normalized.task_id])).rows[0];if(!task)throw missing();if(task.location_kind!=='backlog')throw conflict();if(!await guard())return null;
     const retained=(await c.query('SELECT allocation_state,revision::text FROM workspace.sprint_allocation WHERE sprint_id=$1 AND task_id=$2',[id,task.task_id])).rows[0];if(retained?.allocation_state==='completed')throw conflict();
     await c.query("INSERT INTO workspace.sprint_allocation(project_id,sprint_id,task_id,allocation_state) VALUES($1,$2,$3,'allocated') ON CONFLICT(sprint_id,task_id) DO UPDATE SET allocation_state='allocated',revision=workspace.sprint_allocation.revision+1",[projectId,id,task.task_id]);
     await c.query("UPDATE workspace.task SET location_kind='sprint',location_sprint_id=$2,revision=$3 WHERE task_id=$1",[task.task_id,id,wireRevision((BigInt(task.revision)+1n).toString())]);
     await c.query('UPDATE workspace.sprint SET revision=$2 WHERE sprint_id=$1',[id,revision]);
     await businessAudit(c,actor,projectId,'sprint-allocate',task.task_id,correlation,JSON.stringify({revision:task.revision,location_kind:'backlog'}),JSON.stringify({sprint_id:id,revision:revision,operation,key,payload_hash:hash}));
    }else if(operation==='startSprint'){
     if(current.state!=='planned'||(await c.query("SELECT 1 FROM workspace.sprint WHERE project_id=$1 AND state='active'",[projectId])).rowCount)throw conflict();
     await c.query("UPDATE workspace.sprint SET state='active',revision=$2,started_at=date_trunc('milliseconds',clock_timestamp()) WHERE sprint_id=$1",[id,revision]);
     await businessAudit(c,actor,projectId,'sprint-start',id,correlation,JSON.stringify({revision:current.revision,state:current.state}),JSON.stringify({revision,operation,key,payload_hash:hash}));
    }else{
     if(current.state!=='active')throw conflict();
     const tasks=(await c.query("SELECT t.task_id,t.state,t.revision::text,a.revision::text allocation_revision FROM workspace.task t JOIN workspace.sprint_allocation a ON a.task_id=t.task_id AND a.project_id=t.project_id WHERE a.sprint_id=$1 AND a.allocation_state='allocated' ORDER BY t.task_id FOR UPDATE OF t,a",[id])).rows;
     if(!await guard())return null;
     let position=(await c.query("SELECT (coalesce(max(backlog_position),0)+1)::text value FROM workspace.task WHERE project_id=$1 AND location_kind='backlog'",[projectId])).rows[0].value;
     for(const task of tasks){const done=task.state==='done';await c.query('UPDATE workspace.sprint_allocation SET allocation_state=$3,revision=$4 WHERE sprint_id=$1 AND task_id=$2',[id,task.task_id,done?'completed':'returned',wireRevision((BigInt(task.allocation_revision)+1n).toString())]);
      if(done)await c.query("UPDATE workspace.task SET location_kind='completed',revision=$2 WHERE task_id=$1",[task.task_id,wireRevision((BigInt(task.revision)+1n).toString())]);
      else{await c.query("UPDATE workspace.task SET state='todo',location_kind='backlog',location_sprint_id=NULL,backlog_position=$2,revision=$3 WHERE task_id=$1",[task.task_id,position,wireRevision((BigInt(task.revision)+1n).toString())]);position=(await c.query('SELECT ($1::numeric+1)::text value',[position])).rows[0].value;}
      await businessAudit(c,actor,projectId,'sprint-item-complete',task.task_id,correlation,JSON.stringify({revision:task.revision,state:task.state,sprint_id:id}),JSON.stringify({allocation_state:done?'completed':'returned',operation,key,payload_hash:hash}));
     }
     await c.query("UPDATE workspace.sprint SET state='completed',revision=$2,completed_at=date_trunc('milliseconds',clock_timestamp()) WHERE sprint_id=$1",[id,revision]);
     const sprint=sprintProjection((await c.query('SELECT '+columns+' FROM workspace.sprint WHERE sprint_id=$1',[id])).rows[0]);
     const counts={retained_done_count:tasks.filter(t=>t.state==='done').length,returned_unfinished_count:tasks.filter(t=>t.state!=='done').length};body={sprint,...counts};
     await businessAudit(c,actor,projectId,'sprint-complete',id,correlation,JSON.stringify({revision:current.revision,state:current.state}),JSON.stringify({...counts,revision,operation,key,payload_hash:hash}));
    }
    if(operation!=='completeSprint')body=sprintProjection((await c.query('SELECT '+columns+' FROM workspace.sprint WHERE sprint_id=$1',[id])).rows[0]);
   }
   const value:SprintOutcome={status:operation==='createSprint'?201:200,body:body!,projectId};await saveSprintOutcome(c,actor,operation,key,hash,reference,value);return value;
  });
 }
}
