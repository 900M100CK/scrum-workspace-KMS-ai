import {task,type Task} from './tasks.ts';
export interface Sprint {sprint_id:string;project_id:string;goal:string;start_date:string;end_date:string;state:'planned'|'active'|'completed';revision:number;created_at:string|null;started_at:string|null;completed_at:string|null}
export interface SprintItem {task:Task;allocation_state:'allocated'|'completed'|'returned'}
type Operation='createSprint'|'allocateTask'|'startSprint'|'completeSprint'|'reorderBacklog'|'editSprint'|'removeAllocation';
type Transport=(url:string,init:RequestInit)=>Promise<Response>;
type Saved=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
interface Request {method:'POST'|'PATCH'|'DELETE';expected_revision:string|null;operation:Operation;resource_id:string;task_id:string|null;key:string;body:string|null;status:'queued'|'unknown'|'confirmed'|'rejected'}
interface Recovery {version:2;actor:string;project_id:string;requests:Request[]}
interface State {sprints:Sprint[];backlog:Task[];backlogRevision:string|null;selected:Sprint|null;items:SprintItem[];actions:string[];projectActions:string[];busy:boolean;pending:boolean;results:{task_id:string|null;status:string}[];message:string}
const legacyKey='sacw.sprint.pending.v1',storageKey='sacw.sprint.pending.v2',legacyOperations=['createSprint','allocateTask','startSprint','completeSprint','reorderBacklog'],operations=[...legacyOperations,'editSprint','removeAllocation'];
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const exact=(v:Record<string,unknown>,keys:string)=>Object.keys(v).sort().join(',')===keys;
const id=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v);
const revision=(v:unknown)=>Number.isSafeInteger(v)&&Number(v)>0;
const stamp=(v:unknown)=>v===null||typeof v==='string'&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString()===v;
export function sprint(v:unknown):v is Sprint{return object(v)&&exact(v,'completed_at,created_at,end_date,goal,project_id,revision,sprint_id,start_date,started_at,state')&&id(v.sprint_id)&&id(v.project_id)&&typeof v.goal==='string'&&!!v.goal.trim()&&typeof v.start_date==='string'&&typeof v.end_date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v.start_date)&&/^\d{4}-\d{2}-\d{2}$/.test(v.end_date)&&v.start_date<v.end_date&&revision(v.revision)&&['planned','active','completed'].includes(v.state as string)&&stamp(v.created_at)&&stamp(v.started_at)&&stamp(v.completed_at);}
function input(operation:Operation,v:unknown){if(!object(v))return false;
 if(operation==='createSprint')return exact(v,'end_date,goal,start_date')&&typeof v.goal==='string'&&!!v.goal.trim()&&!v.goal.includes('\0')&&new TextDecoder().decode(new TextEncoder().encode(v.goal))===v.goal&&typeof v.start_date==='string'&&typeof v.end_date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v.start_date)&&/^\d{4}-\d{2}-\d{2}$/.test(v.end_date)&&v.start_date<v.end_date;
 if(operation==='reorderBacklog')return exact(v,'expected_revision,task_ids')&&Array.isArray(v.task_ids)&&v.task_ids.every(id)&&new Set(v.task_ids).size===v.task_ids.length&&typeof v.expected_revision==='string'&&/^[1-9][0-9]*$/.test(v.expected_revision);
 if(operation==='editSprint')return revision(v.expected_revision)&&Object.keys(v).every(k=>['goal','start_date','end_date','expected_revision'].includes(k))&&(!Object.hasOwn(v,'goal')||typeof v.goal==='string'&&!!v.goal.trim()&&!v.goal.includes('\0')&&new TextDecoder().decode(new TextEncoder().encode(v.goal))===v.goal)&&['start_date','end_date'].every(k=>!Object.hasOwn(v,k)||typeof v[k]==='string'&&/^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(v[k] as string)&&Number.isFinite(Date.parse(v[k]+'T00:00:00Z'))&&new Date(v[k]+'T00:00:00Z').toISOString().slice(0,10)===v[k]);
 return revision(v.expected_revision)&&(operation==='allocateTask'?exact(v,'expected_revision,task_id')&&id(v.task_id):exact(v,'expected_revision'));}
const initial=(pending=false):State=>({sprints:[],backlog:[],backlogRevision:null,selected:null,items:[],actions:[],projectActions:[],busy:false,pending,results:[],message:''});
class Failure extends Error {readonly status:number;constructor(status:number){super('Sprint operation unavailable');this.status=status;}}
export class SprintController {
 private state=initial();private pending:Recovery|null=null;private storage:Saved|undefined;private generation=0;private request:AbortController|undefined;private selectedId:string|null=null;private listeners=new Set<()=>void>();
 private actor:string;private projectId:string;private expired:()=>void;private transport:Transport;private changed:()=>void;private withheld:()=>void;
 constructor(actor:string,projectId:string,expired:()=>void,transport:Transport=(url,init)=>fetch(url,init),storage?:Saved,changed:()=>void=()=>{},withheld:()=>void=()=>{}){this.withheld=withheld;this.changed=changed;this.actor=actor;this.projectId=projectId;this.expired=expired;this.transport=transport;
  try{this.storage=storage??window.sessionStorage;const raw=this.storage.getItem(storageKey),legacy=raw?null:this.storage.getItem(legacyKey);if(raw){const value:unknown=JSON.parse(raw);if(this.validRecovery(value))this.pending=value;else this.storage.removeItem(storageKey);}else if(legacy){const value=this.migrateRecovery(JSON.parse(legacy));if(value){this.pending=value;this.save();this.storage.removeItem(legacyKey);}else this.storage.removeItem(legacyKey);}}catch{ /* Reads remain available; persist-before-wire still blocks unsafe mutations. */ }
  this.state={...initial(!!this.pending),results:this.pending?this.pending.requests.map(r=>({task_id:null,status:r.status})):[],message:this.pending?'An earlier Sprint operation needs confirmation. Check its original result.':''};
 }
 static clearPending(storage?:Saved){try{const target=storage??window.sessionStorage;target.removeItem(storageKey);target.removeItem(legacyKey);}catch{ /* Storage may be unavailable. */ }}
 private migrateRecovery(v:unknown):Recovery|null{
  if(!object(v)||!exact(v,'actor,project_id,requests')||!Array.isArray(v.requests)||!v.requests.every(r=>object(r)&&exact(r,'body,key,operation,resource_id,status,task_id')&&legacyOperations.includes(r.operation as string)))return null;
  const candidate={...v,version:2,requests:v.requests.map(r=>({...r,method:'POST',expected_revision:null}))};return this.validRecovery(candidate)?candidate:null;
 }
 private validRecovery(v:unknown):v is Recovery {
  if(!object(v)||!exact(v,'actor,project_id,requests,version')||v.version!==2||v.actor!==this.actor||!id(v.project_id)||!Array.isArray(v.requests)||!v.requests.length)return false;
  const keys=new Set();return v.requests.every(r=>{
   if(!object(r)||!exact(r,'body,expected_revision,key,method,operation,resource_id,status,task_id')||!operations.includes(r.operation as string)||!id(r.resource_id)||!id(r.key)||keys.has(r.key)||!['queued','unknown','confirmed','rejected'].includes(r.status as string))return false;
   keys.add(r.key);const op=r.operation as Operation;
   if(r.method!==(op==='editSprint'?'PATCH':op==='removeAllocation'?'DELETE':'POST')||(['allocateTask','removeAllocation'].includes(op)?!id(r.task_id):r.task_id!==null))return false;
   if(['createSprint','reorderBacklog'].includes(op)&&r.resource_id!==v.project_id)return false;
   if(op==='removeAllocation')return r.body===null&&typeof r.expected_revision==='string'&&/^[1-9][0-9]*$/.test(r.expected_revision)&&revision(Number(r.expected_revision))&&r.status!=='queued';
   if(r.expected_revision!==null||r.status==='queued'&&op!=='allocateTask')return false;
   if(r.body===null)return op==='allocateTask'&&r.status==='queued';
   try{if(typeof r.body!=='string'||new TextEncoder().encode(r.body).length>(op==='reorderBacklog'?1048576:8192))return false;const body=JSON.parse(r.body);return input(op,body)&&(op!=='allocateTask'||body.task_id===r.task_id);}catch{return false;}
  });
 }
 getSnapshot=()=>this.state;
 subscribe=(f:()=>void)=>{this.listeners.add(f);return()=>{this.listeners.delete(f);};};
 private publish(value:Partial<State>){this.state={...this.state,...value};for(const f of this.listeners)f();}
 cancel=()=>{this.generation++;this.request?.abort();};
 private begin(){this.cancel();const request=new AbortController();this.request=request;return {request,generation:this.generation,timer:setTimeout(()=>request.abort(),10000)};}
 private async json(path:string,signal:AbortSignal){const r=await this.transport('/api'+path,{method:'GET',credentials:'same-origin',cache:'no-store',redirect:'error',signal});if(r.status!==200)throw new Failure(r.status);if(!r.headers.get('content-type')?.includes('application/json'))throw new Failure(503);return r.json() as Promise<unknown>;}
 private async actions(resource:string|null,signal:AbortSignal){const v=await this.json('/access/allowed-actions?resource_kind='+(resource?'sprint':'project')+'&project_id='+this.projectId+(resource?'&resource_id='+resource:''),signal);
  if(!object(v)||!exact(v,'allowed_operations,document_id,project_id,resource_id,resource_kind,version_id')||v.resource_kind!==(resource?'sprint':'project')||v.project_id!==this.projectId||v.resource_id!==resource||v.document_id!==null||v.version_id!==null||!Array.isArray(v.allowed_operations)||!v.allowed_operations.every(x=>typeof x==='string')||new Set(v.allowed_operations).size!==v.allowed_operations.length)throw new Failure(503);return v.allowed_operations as string[];
 }
 private async pages(path:string,signal:AbortSignal,valid:(v:unknown)=>boolean,backlog=false){const items:unknown[]=[],seen=new Set<string>();let cursor:string|null=null,generation:string|null=null;
  do{const v=await this.json(path+(cursor?(path.includes('?')?'&':'?')+'cursor='+encodeURIComponent(cursor):''),signal);if(!object(v)||!exact(v,backlog?'backlog_revision,items,next_cursor':'items,next_cursor')||!Array.isArray(v.items)||v.items.length>50||!v.items.every(valid)||(v.next_cursor!==null&&(typeof v.next_cursor!=='string'||!v.next_cursor||seen.has(v.next_cursor))))throw new Failure(503);
   if(backlog){if(typeof v.backlog_revision!=='string'||!/^[1-9][0-9]*$/.test(v.backlog_revision)||generation!==null&&v.backlog_revision!==generation)throw new Failure(409);generation=v.backlog_revision;}
   items.push(...v.items);cursor=v.next_cursor as string|null;if(cursor)seen.add(cursor);
  }while(cursor);return {items,generation};
 }
 refresh=async(restarted=false,notice='')=>{const {request,generation,timer}=this.begin();this.publish({...initial(!!this.pending),busy:true,message:'Checking current Sprint access and work…'});
  try{const [projectActions,list,backlog]=await Promise.all([this.actions(null,request.signal),this.pages('/projects/'+this.projectId+'/sprints',request.signal,v=>sprint(v)&&v.project_id===this.projectId),this.pages('/projects/'+this.projectId+'/tasks?location=backlog',request.signal,v=>task(v)&&v.project_id===this.projectId&&v.work_location.kind==='backlog',true)]);
   const sprints=list.items as Sprint[],tasks=backlog.items as Task[];if(new Set(sprints.map(s=>s.sprint_id)).size!==sprints.length||new Set(tasks.map(t=>t.task_id)).size!==tasks.length)throw new Failure(503);
   let selected:Sprint|null=null,items:SprintItem[]=[],actions:string[]=[];
   if(this.selectedId){const selectedId=this.selectedId;const [v,a,list]=await Promise.all([this.json('/sprints/'+selectedId,request.signal),this.actions(selectedId,request.signal),this.pages('/sprints/'+selectedId+'/items',request.signal,v=>object(v)&&exact(v,'allocation_state,task')&&task(v.task)&&v.task.project_id===this.projectId&&['allocated','completed','returned'].includes(v.allocation_state as string))]);if(!sprint(v)||v.sprint_id!==selectedId||v.project_id!==this.projectId||!a.includes('getSprint'))throw new Failure(503);selected=v;items=list.items as SprintItem[];if(new Set(items.map(i=>i.task.task_id)).size!==items.length)throw new Failure(503);actions=a;}
   if(generation===this.generation)this.publish({sprints,backlog:tasks,backlogRevision:backlog.generation,selected,items,actions,projectActions,results:this.pending?this.pending.requests.map(r=>({task_id:null,status:r.status})):[],busy:false,message:notice||(this.pending?'An earlier operation remains unconfirmed. Check its original result.':restarted?'The list changed. Fresh current data was loaded.':'Current Sprint data loaded.')});
  }catch(e){if(generation===this.generation){if(e instanceof Failure&&e.status===409&&!restarted){await this.refresh(true,notice);return;}this.publish({...initial(!!this.pending),message:'Sprint data unavailable. Refresh to check current access.'});this.withheld();if(e instanceof Failure&&e.status===401)this.expired();}}finally{clearTimeout(timer);}
 };
 select=async(id:string)=>{if(!this.state.busy){this.selectedId=id;await this.refresh();}};
 move=(taskId:string,delta:number)=>{if(this.state.busy||this.pending)return;const rows=[...this.state.backlog],from=rows.findIndex(t=>t.task_id===taskId),to=from+delta;if(from<0||to<0||to>=rows.length)return;[rows[from],rows[to]]=[rows[to]!,rows[from]!];this.publish({backlog:rows});};
 private save(){if(!this.storage)throw Error('Storage unavailable');const raw=JSON.stringify(this.pending);this.storage.setItem(storageKey,raw);if(this.storage.getItem(storageKey)!==raw)throw Error('Recovery not saved');}
 private async start(requests:Request[]){try{this.pending={version:2,actor:this.actor,project_id:this.projectId,requests};this.save();}catch{this.pending=null;this.publish({message:'Allow site storage before changing Sprint work so interrupted results can be recovered.'});return;}await this.retry();}
 mutate=async(operation:Exclude<Operation,'allocateTask'|'removeAllocation'>,fields:Record<string,unknown>)=>{
  if(this.state.busy||this.pending)return;const projectOperation=operation==='createSprint'||operation==='reorderBacklog',actions=projectOperation?this.state.projectActions:this.state.actions,resource=projectOperation?this.projectId:this.state.selected?.sprint_id;
  if(!resource||!actions.includes(operation))return;const body=JSON.stringify(fields);if(!input(operation,fields)||new TextEncoder().encode(body).length>(operation==='reorderBacklog'?1048576:8192)){this.publish({message:'Check the fields and shorten input if needed.'});return;}
  await this.start([{operation,method:operation==='editSprint'?'PATCH':'POST',expected_revision:null,resource_id:resource,task_id:null,key:crypto.randomUUID(),body,status:'unknown'}]);
 };
 reorder=()=>this.state.backlogRevision?this.mutate('reorderBacklog',{task_ids:this.state.backlog.map(t=>t.task_id),expected_revision:this.state.backlogRevision}):Promise.resolve();
 allocate=async(ids:string[])=>{if(this.pending||this.state.busy||!this.state.selected||!this.state.actions.includes('allocateTask')||!ids.length||new Set(ids).size!==ids.length||ids.some(id=>!this.state.backlog.some(t=>t.task_id===id)))return;await this.start(ids.map(task_id=>({operation:'allocateTask',method:'POST',expected_revision:null,resource_id:this.state.selected!.sprint_id,task_id,key:crypto.randomUUID(),body:null,status:'queued'})));};
 remove=async(taskId:string)=>{const selected=this.state.selected,item=this.state.items.find(i=>i.task.task_id===taskId);if(this.pending||this.state.busy||!selected||selected.state==='completed'||!this.state.actions.includes('removeAllocation')||!item||item.allocation_state!=='allocated'||item.task.work_location.kind!=='sprint'||item.task.work_location.sprint_id!==selected.sprint_id||!['todo','in_progress'].includes(item.task.state))return;await this.start([{operation:'removeAllocation',method:'DELETE',expected_revision:String(selected.revision),resource_id:selected.sprint_id,task_id:taskId,key:crypto.randomUUID(),body:null,status:'unknown'}]);};
 retry=async()=>{const pending=this.pending;if(!pending||this.state.busy)return;const {request,generation,timer}=this.begin();this.publish({...initial(true),busy:true,message:'Checking original Sprint operations…'});const results:{task_id:string|null;status:string}[]=[];let doneDenied=false;
  try{for(const item of pending.requests){if(['confirmed','rejected'].includes(item.status)){results.push({task_id:item.task_id,status:item.status});continue;}
    if(item.operation==='allocateTask'&&item.body===null){const current=await this.json('/sprints/'+item.resource_id,request.signal);if(!sprint(current)||current.project_id!==pending.project_id)throw new Failure(503);if(current.state==='completed'){item.status='rejected';item.body=JSON.stringify({task_id:item.task_id,expected_revision:current.revision});this.save();results.push({task_id:item.task_id,status:item.status});continue;}item.body=JSON.stringify({task_id:item.task_id,expected_revision:current.revision});}
    item.status='unknown';this.save();const operation=item.operation,path=operation==='createSprint'?'/projects/'+item.resource_id+'/sprints':operation==='reorderBacklog'?'/projects/'+item.resource_id+'/backlog-order':'/sprints/'+item.resource_id+(operation==='allocateTask'?'/items':operation==='removeAllocation'?'/items/'+item.task_id:operation==='editSprint'?'':operation==='startSprint'?'/start':'/complete');
    const r=await this.transport('/api'+path,{method:item.method,...(item.method==='DELETE'?{}:{body:item.body}),credentials:'same-origin',cache:'no-store',redirect:'error',signal:request.signal,headers:{...(item.method==='DELETE'?{'X-Expected-Revision':item.expected_revision!}:{'Content-Type':'application/json'}),'X-SACW-Request':'1','Idempotency-Key':item.key}});if(generation!==this.generation)return;
    if(!r.headers.get('content-type')?.includes('application/json'))throw new Failure(503);const v:unknown=await r.json();
    if(r.status===(operation==='createSprint'?201:200)){
     if(operation==='reorderBacklog'){if(!object(v)||!exact(v,'backlog_revision,project_id')||v.project_id!==pending.project_id||typeof v.backlog_revision!=='string'||!/^[1-9][0-9]*$/.test(v.backlog_revision))throw new Failure(503);}
     else{const s=operation==='completeSprint'&&object(v)?v.sprint:v;if(!sprint(s)||s.project_id!==pending.project_id||operation!=='createSprint'&&s.sprint_id!==item.resource_id)throw new Failure(503);if(operation==='completeSprint'&&(!object(v)||!exact(v,'retained_done_count,returned_unfinished_count,sprint')||!Number.isSafeInteger(v.retained_done_count)||Number(v.retained_done_count)<0||!Number.isSafeInteger(v.returned_unfinished_count)||Number(v.returned_unfinished_count)<0))throw new Failure(503);if(operation==='createSprint'&&pending.project_id===this.projectId)this.selectedId=s.sprint_id;}
     item.status='confirmed';
    }else if([400,409,413,415].includes(r.status)&&object(v)&&exact(v,'code,message,run_id')&&(r.status===409?(v.code==='state_conflict'||operation==='removeAllocation'&&v.code==='task_already_done'):v.code==='validation_failed')&&v.run_id===null){item.status='rejected';if(v.code==='task_already_done')doneDenied=true;}
    else{if(r.status===401)this.expired();throw new Failure(r.status);}
    this.save();results.push({task_id:item.task_id,status:item.status});
   }
   this.storage!.removeItem(storageKey);this.pending=null;this.changed();await this.refresh(false,'Original operations checked. Confirmed: '+results.filter(r=>r.status==='confirmed').length+'; rejected: '+results.filter(r=>r.status==='rejected').length+'. Current work refreshed.'+(doneDenied?' Done tasks cannot be removed; completed-work attribution is preserved.':''));if(this.state.projectActions.length)this.publish({results});
  }catch{if(generation===this.generation){this.publish({...initial(true),results:pending.requests.map(r=>({task_id:null,status:r.status})),message:'The result is unconfirmed. Confirmed: '+pending.requests.filter(r=>r.status==='confirmed').length+'; rejected: '+pending.requests.filter(r=>r.status==='rejected').length+'. Restore access and check the original operation before another change.'});this.withheld();}}finally{clearTimeout(timer);}
 };
}
