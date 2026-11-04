export interface Task {
 task_id:string;project_id:string;type:'story'|'task'|'bug';title:string;description:string;
 state:'todo'|'in_progress'|'done';assignee_id:string|null;blocked:boolean;revision:number;
 work_location:{kind:'backlog';position:string}|{kind:'sprint'|'completed';sprint_id:string};created_at:string;
}
type Location='all'|'backlog';
type Transport=(url:string,init:RequestInit)=>Promise<Response>;
type RecoveryStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
type Mutation='editTask'|'setTaskState'|'setAssignee'|'recordBlocker';
interface Pending {actor:string;project_id:string;key:string;body:string;operation?:Mutation;task_id?:string}
export interface Blocker {event_id:string;task_id:string;status:'open'|'resolved';description:string;outcome:string|null;actor_id:string;recorded_at:string;sequence:number}
interface TaskState {members:{user_id:string;role:string}[];blockers:Blocker[];blockerCursor:string|null;items:Task[];detail:Task|null;actions:string[];cursor:string|null;backlogRevision:string|null;location:Location;busy:boolean;pending:boolean;message:string}
const storageKey='sacw.task.pending.v1',types=['story','task','bug'];
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const keys=(v:Record<string,unknown>,names:string)=>Object.keys(v).sort().join(',')===names;
const id=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v);
const text=(v:unknown):v is string=>typeof v==='string'&&!v.includes('\0')&&new TextDecoder().decode(new TextEncoder().encode(v))===v;
function validInput(v:unknown):v is {type:string;title:string;description:string}{return object(v)&&keys(v,'description,title,type')&&typeof v.type==='string'&&types.includes(v.type)&&text(v.title)&&!!v.title.trim()&&text(v.description);}
export function task(v:unknown):v is Task{
 if(!object(v)||!keys(v,'assignee_id,blocked,created_at,description,project_id,revision,state,task_id,title,type,work_location')||!id(v.task_id)||!id(v.project_id)||typeof v.type!=='string'||!types.includes(v.type)||!text(v.title)||!v.title.length||!text(v.description)||!['todo','in_progress','done'].includes(v.state as string)||(v.assignee_id!==null&&!id(v.assignee_id))||typeof v.blocked!=='boolean'||!Number.isSafeInteger(v.revision)||Number(v.revision)<1||typeof v.created_at!=='string'||!Number.isFinite(Date.parse(v.created_at))||new Date(v.created_at).toISOString()!==v.created_at||!object(v.work_location))return false;
 const w=v.work_location;return w.kind==='backlog'?keys(w,'kind,position')&&typeof w.position==='string'&&/^-?\d+(\.\d+)?$/.test(w.position):['sprint','completed'].includes(w.kind as string)&&keys(w,'kind,sprint_id')&&id(w.sprint_id);
}
function validMutation(operation:unknown,v:unknown):boolean{
 if(!object(v)||!Number.isSafeInteger(v.expected_revision)||Number(v.expected_revision)<1)return false;
 if(operation==='editTask')return Object.keys(v).every(k=>['title','description','expected_revision'].includes(k))&&(!Object.hasOwn(v,'title')||(text(v.title)&&!!v.title.trim()))&&(!Object.hasOwn(v,'description')||text(v.description));
 if(operation==='setTaskState')return keys(v,'expected_revision,state')&&['todo','in_progress','done'].includes(v.state as string);
 if(operation==='setAssignee')return keys(v,'assignee_id,expected_revision')&&(v.assignee_id===null||id(v.assignee_id));
 return operation==='recordBlocker'&&keys(v,'description,expected_revision,outcome,status')&&['open','resolved'].includes(v.status as string)&&text(v.description)&&!!v.description.length&&(v.outcome===null||text(v.outcome));
}
export function blocker(v:unknown):v is Blocker{
 return object(v)&&keys(v,'actor_id,description,event_id,outcome,recorded_at,sequence,status,task_id')&&id(v.event_id)&&id(v.task_id)&&id(v.actor_id)&&['open','resolved'].includes(v.status as string)&&text(v.description)&&!!v.description.length&&(v.outcome===null||text(v.outcome))&&typeof v.recorded_at==='string'&&Number.isFinite(Date.parse(v.recorded_at))&&Number.isSafeInteger(v.sequence)&&Number(v.sequence)>0;
}
const initial=(location:Location='all'):TaskState=>({members:[],blockers:[],blockerCursor:null,items:[],detail:null,actions:[],cursor:null,backlogRevision:null,location,busy:false,pending:false,message:''});
class Failure extends Error {readonly status:number;constructor(status:number){super('Task request failed');this.status=status;}}

export class TaskController {
 private readonly actor:string;private readonly projectId:string;private readonly expired:()=>void;private readonly transport:Transport;private storage:RecoveryStorage|undefined;
 private state=initial();private pending:Pending|null=null;private generation=0;private request:AbortController|undefined;private readonly listeners=new Set<()=>void>();
 constructor(actor:string,projectId:string,expired:()=>void,transport:Transport=(url,init)=>fetch(url,init),storage?:RecoveryStorage){
  this.actor=actor;this.projectId=projectId;this.expired=expired;this.transport=transport;
  try{this.storage=storage??window.sessionStorage;const raw=this.storage.getItem(storageKey);if(raw){const p:unknown=JSON.parse(raw);if(this.validPending(p)){this.pending=p;this.state={...initial(),pending:true,message:p.operation?'An earlier change needs confirmation. Check its original result before making another change.':'An earlier task creation needs confirmation. Check its original result before creating another task.'};}else this.storage.removeItem(storageKey);}}catch{ /* Reads remain usable when browser recovery storage is unavailable. */ }
 }
 static clearPending(storage?:RecoveryStorage){try{(storage??window.sessionStorage).removeItem(storageKey);}catch{ /* No recoverable operation to clear. */ }}
 private validPending(p:unknown):p is Pending{
  if(!object(p)||!(keys(p,'actor,body,key,project_id')||keys(p,'actor,body,key,operation,project_id,task_id'))||p.actor!==this.actor||!id(p.project_id)||!id(p.key)||typeof p.body!=='string'||new TextEncoder().encode(p.body).length>8192)return false;
  try{return p.operation!==undefined?id(p.task_id)&&validMutation(p.operation,JSON.parse(p.body)):validInput(JSON.parse(p.body));}catch{return false;}
 }
 getSnapshot=()=>this.state;
 subscribe=(f:()=>void)=>{this.listeners.add(f);return()=>{this.listeners.delete(f);};};
 private publish(update:Partial<TaskState>){this.state={...this.state,...update};for(const f of this.listeners)f();}
 cancel=()=>{this.generation++;this.request?.abort();};
 private async json(path:string,signal:AbortSignal){const r=await this.transport('/api'+path,{method:'GET',credentials:'same-origin',cache:'no-store',redirect:'error',signal});if(r.status!==200)throw new Failure(r.status);if(!r.headers.get('content-type')?.includes('application/json'))throw new Failure(503);return r.json() as Promise<unknown>;}
 private async allowed(signal:AbortSignal,taskId?:string){
  const v=await this.json('/access/allowed-actions?resource_kind='+(taskId?'task':'project')+'&project_id='+this.projectId+(taskId?'&resource_id='+taskId:''),signal);
  if(!object(v)||!keys(v,'allowed_operations,document_id,project_id,resource_id,resource_kind,version_id')||v.resource_kind!==(taskId?'task':'project')||v.project_id!==this.projectId||v.resource_id!==(taskId??null)||v.document_id!==null||v.version_id!==null||!Array.isArray(v.allowed_operations)||!v.allowed_operations.every(x=>typeof x==='string')||new Set(v.allowed_operations).size!==v.allowed_operations.length)throw new Failure(503);
  return v.allowed_operations as string[];
 }
 private async read(work:(signal:AbortSignal)=>Promise<Partial<TaskState>>,location:Location,restart?:()=>Promise<void>,message=''){
  this.cancel();const generation=this.generation,request=new AbortController();this.request=request;
  this.publish({...initial(location),pending:!!this.pending,busy:true,message:'Checking current task access…'});const timer=setTimeout(()=>request.abort(),10000);
  try{const update=await work(request.signal);if(generation===this.generation)this.publish({...update,busy:false,pending:!!this.pending,message:this.pending?.operation?'The earlier change is still unconfirmed. Check its original result before making another change.':this.pending?'The earlier creation is still unconfirmed. Check its original result before creating another task.':message||('detail' in update?'Current task details are loaded.':'Tasks are loaded.')});}
  catch(error){if(generation===this.generation){if(error instanceof Failure&&error.status===409&&restart){await restart();return;}this.publish({...initial(location),pending:!!this.pending,message:error instanceof Failure&&[403,404].includes(error.status)?'Tasks unavailable. Refresh tasks to check your current access.':error instanceof Failure&&error.status===409?'This list has changed. Refresh tasks to load its current version.':'Unable to confirm task access. Try refreshing tasks.'});if(error instanceof Failure&&error.status===401)this.expired();}}
  finally{clearTimeout(timer);}
 }
 refresh=(location:Location=this.state.location)=>this.list(location);
 private list(location:Location,cursor?:string,previous:Task[]=[],revision?:string,restarted=false):Promise<void>{return this.read(async signal=>{
  const [v,actions]=await Promise.all([this.json('/projects/'+this.projectId+'/tasks?location='+location+(cursor?'&cursor='+encodeURIComponent(cursor):''),signal),this.allowed(signal)]);
  if(!object(v)||!keys(v,'backlog_revision,items,next_cursor')||!Array.isArray(v.items)||v.items.length>50||!v.items.every(x=>task(x)&&x.project_id===this.projectId)||(v.next_cursor!==null&&(typeof v.next_cursor!=='string'||!v.next_cursor||v.next_cursor.length>4096))||typeof v.backlog_revision!=='string'||! /^[1-9]\d*$/.test(v.backlog_revision)||!actions.includes('listTasks'))throw new Failure(503);
  if(revision!==undefined&&revision!==v.backlog_revision)throw new Failure(409);
  const items=[...previous,...v.items] as Task[];if(new Set(items.map(t=>t.task_id)).size!==items.length)throw new Failure(503);
  return {items,actions,cursor:v.next_cursor as string|null,backlogRevision:v.backlog_revision};
 },location,cursor?()=>this.list(location,undefined,[],undefined,true):undefined,restarted?'The list changed. Its current first page is loaded.':'');}
 more=()=>this.state.cursor?this.list(this.state.location,this.state.cursor,this.state.items,this.state.backlogRevision??undefined):Promise.resolve();
 open=(taskId:string,confirmed=false)=>this.read(async signal=>{
  if(!id(taskId))throw new Failure(404);const [v,projectActions,taskActions]=await Promise.all([this.json('/tasks/'+taskId,signal),this.allowed(signal),this.allowed(signal,taskId)]);
  if(!task(v)||v.task_id!==taskId||v.project_id!==this.projectId||!taskActions.includes('getTask'))throw new Failure(503);
  const [history,members]=await Promise.all([taskActions.includes('listBlockerEvents')?this.history(taskId,signal):Promise.resolve({items:[],next_cursor:null}),taskActions.includes('setAssignee')?this.members(signal):Promise.resolve([])]);
  return {detail:v,members,actions:[...new Set([...projectActions,...taskActions])],blockers:history.items,blockerCursor:history.next_cursor};
 },this.state.location,undefined,confirmed?'Operation confirmed. Current task details are loaded.':'');
 private async members(signal:AbortSignal){
  const items:{user_id:string;role:string}[]=[],seen=new Set<string>();let cursor:string|null=null;
  do{
   const v=await this.json('/projects/'+this.projectId+'/members?limit=100'+(cursor?'&cursor='+encodeURIComponent(cursor):''),signal);
   if(!object(v)||!keys(v,'items,next_cursor')||!Array.isArray(v.items)||v.items.length>100||(v.next_cursor!==null&&(typeof v.next_cursor!=='string'||!v.next_cursor||seen.has(v.next_cursor))))throw new Failure(503);
   for(const m of v.items){if(!object(m)||!keys(m,'project_id,revision,role,user_id')||m.project_id!==this.projectId||!id(m.user_id)||typeof m.role!=='string'||!Number.isSafeInteger(m.revision)||Number(m.revision)<1||items.some(x=>x.user_id===m.user_id))throw new Failure(503);items.push({user_id:m.user_id,role:m.role});}
   cursor=v.next_cursor as string|null;if(cursor)seen.add(cursor);
  }while(cursor);return items;
 }
 private async history(taskId:string,signal:AbortSignal,cursor?:string){
  const v=await this.json('/tasks/'+taskId+'/blockers'+(cursor?'?cursor='+encodeURIComponent(cursor):''),signal);
  if(!object(v)||!keys(v,'items,next_cursor')||!Array.isArray(v.items)||v.items.length>50||!v.items.every(b=>blocker(b)&&b.task_id===taskId)||(v.next_cursor!==null&&(typeof v.next_cursor!=='string'||!v.next_cursor||v.next_cursor.length>4096)))throw new Failure(503);
  const items=v.items as Blocker[];if(items.some((b,i)=>i>0&&b.sequence<=items[i-1]!.sequence))throw new Failure(503);return {items,next_cursor:v.next_cursor as string|null};
 }
 moreBlockers=()=>{
  const detail=this.state.detail,cursor=this.state.blockerCursor,previous=this.state.blockers,actions=this.state.actions,members=this.state.members;
  if(!detail||!cursor)return Promise.resolve();
  return this.read(async signal=>{
   const [current,currentActions,page]=await Promise.all([this.json('/tasks/'+detail.task_id,signal),this.allowed(signal,detail.task_id),this.history(detail.task_id,signal,cursor)]);
   if(!task(current)||current.task_id!==detail.task_id||current.project_id!==this.projectId||!currentActions.includes('listBlockerEvents'))throw new Failure(503);
   const items=[...previous,...page.items];if(new Set(items.map(b=>b.event_id)).size!==items.length||items.some((b,i)=>i>0&&b.sequence<=items[i-1]!.sequence))throw new Failure(503);
   return {detail:current,members,actions:actions.filter(a=>a==='createTask'||a==='listTasks'||currentActions.includes(a)),blockers:items,blockerCursor:page.next_cursor};
  },this.state.location,()=>this.open(detail.task_id));
 };
 mutate=async(operation:Mutation,input:unknown)=>{
  const detail=this.state.detail;if(this.pending||this.state.busy||!detail)return;
  if(!this.state.actions.includes(operation)){this.publish({message:'Current access does not allow this change. Refresh the task to check access.'});return;}
  const body=JSON.stringify(input);if(!validMutation(operation,input)||new TextEncoder().encode(body).length>8192){this.publish({message:'Check the fields and shorten the text if needed.'});return;}
  const p:Pending={actor:this.actor,project_id:this.projectId,key:crypto.randomUUID(),body,operation,task_id:detail.task_id};
  try{if(!this.storage)throw Error('Storage unavailable');const raw=JSON.stringify(p);this.storage.setItem(storageKey,raw);if(this.storage.getItem(storageKey)!==raw)throw Error('Recovery not saved');this.pending=p;}catch{this.publish({message:'This browser cannot save recovery information. Allow site storage before changing a task.'});return;}
  await this.retry();
 };
 private async retryMutation(p:Pending){
  this.cancel();const generation=this.generation,request=new AbortController();this.request=request;
  this.publish({...initial(this.state.location),busy:true,pending:true,message:'Checking the original task change…'});const timer=setTimeout(()=>request.abort(),10000);
  try{
   const operation=p.operation!,suffix={editTask:'',setTaskState:'/state',setAssignee:'/assignee',recordBlocker:'/blockers'}[operation];
   const r=await this.transport('/api/tasks/'+p.task_id+suffix,{method:operation==='editTask'?'PATCH':'POST',body:p.body,credentials:'same-origin',cache:'no-store',redirect:'error',signal:request.signal,headers:{'Content-Type':'application/json','X-SACW-Request':'1','Idempotency-Key':p.key}});if(generation!==this.generation)return;
   if(r.status===(operation==='recordBlocker'?201:200)){
    if(!r.headers.get('content-type')?.includes('application/json'))throw new Failure(503);const v:unknown=await r.json();
    if(operation==='recordBlocker'?(!blocker(v)||v.task_id!==p.task_id||v.actor_id!==this.actor):(!task(v)||v.task_id!==p.task_id||v.project_id!==p.project_id))throw new Failure(503);
    if(generation!==this.generation)return;this.storage!.removeItem(storageKey);this.pending=null;this.publish({busy:false,pending:false});
    if(p.project_id===this.projectId)await this.open(p.task_id!,true);else await this.refresh();
   }else if([400,409,413,415].includes(r.status)){
    this.storage!.removeItem(storageKey);this.pending=null;this.publish({busy:false,pending:false});
    await this.open(p.task_id!);if(generation+1===this.generation)this.publish({message:r.status===409?'The change conflicts with current state. Current details were refreshed; review them before submitting again.':'The change was rejected. Check the current details and fields before submitting again.'});
   }else{
    this.publish({...initial(this.state.location),pending:true,message:'The change is unconfirmed. Restore current access and check its original result before making another change.'});if(r.status===401)this.expired();
   }
  }catch{if(generation===this.generation)this.publish({...initial(this.state.location),pending:true,message:'The change is unconfirmed. Check its original result before making another change.'});}
  finally{clearTimeout(timer);}
 }
 create=async(type:string,title:string,description:string)=>{
  if(this.pending||this.state.busy)return;
  if(!this.state.actions.includes('createTask')){this.publish({message:'Current access does not allow task creation. Refresh tasks to check your access.'});return;}
  const input={type,title,description},body=JSON.stringify(input);if(!validInput(input)||new TextEncoder().encode(body).length>8192){this.publish({message:'Choose Story, Task or Bug and enter a title. Shorten the title or description if needed.'});return;}
  const p:Pending={actor:this.actor,project_id:this.projectId,key:crypto.randomUUID(),body};
  try{if(!this.storage)throw Error('Storage unavailable');const raw=JSON.stringify(p);this.storage.setItem(storageKey,raw);if(this.storage.getItem(storageKey)!==raw)throw Error('Recovery not saved');this.pending=p;}catch{this.publish({message:'This browser cannot save recovery information. Allow site storage before creating a task.'});return;}
  await this.retry();
 };
 retry=async()=>{
  const p=this.pending;if(!p||this.state.busy)return;if(p.operation)return this.retryMutation(p);this.cancel();const generation=this.generation,request=new AbortController();this.request=request;
  this.publish({...initial(this.state.location),busy:true,pending:true,message:'Checking the original task creation…'});const timer=setTimeout(()=>request.abort(),10000);
  try{
   const r=await this.transport('/api/projects/'+p.project_id+'/tasks',{method:'POST',body:p.body,credentials:'same-origin',cache:'no-store',redirect:'error',signal:request.signal,headers:{'Content-Type':'application/json','X-SACW-Request':'1','Idempotency-Key':p.key}});if(generation!==this.generation)return;
   if(r.status===201){
    if(!r.headers.get('content-type')?.includes('application/json'))throw new Failure(503);
    const v:unknown=await r.json(),input=JSON.parse(p.body) as {type:string;title:string;description:string};
    if(!task(v)||v.project_id!==p.project_id||v.type!==input.type||v.title!==input.title||v.description!==input.description||v.state!=='todo'||v.assignee_id!==null||v.blocked||v.revision!==1||v.work_location.kind!=='backlog')throw new Failure(503);
    if(generation!==this.generation)return;this.storage!.removeItem(storageKey);this.pending=null;this.publish({busy:false,pending:false});
    if(p.project_id===this.projectId)await this.open(v.task_id,true);else await this.refresh();
   }else{
    this.publish({...initial(this.state.location),pending:true,message:[401,403,404].includes(r.status)?'Current access was denied. The earlier creation remains unconfirmed; restore access before checking its original result.':r.status===409?'The original creation conflicts with current state. Its result remains unconfirmed; do not create another task.':'The result is not confirmed. Check the original creation before creating another task.'});if(r.status===401)this.expired();
   }
  }catch{if(generation===this.generation)this.publish({...initial(this.state.location),pending:true,message:'The result is not confirmed. Check the original creation before creating another task.'});}
  finally{clearTimeout(timer);}
 };
}
