export interface Project {project_id:string;name:string;description:string;revision:number}
export interface Member {project_id:string;user_id:string;role:string;revision:number}
type Page<T>={items:T[];next_cursor:string|null};
type Transport=(url:string,init:RequestInit)=>Promise<Response>;
type Pending={actor:string;path:string;method:'POST'|'DELETE';body?:string;key:string;revision?:string};
export interface ProjectState {busy:boolean;message:string;projects:Project[];project:Project|null;members:Member[];global:string[];actions:string[];projectCursor:string|null;memberCursor:string|null;pending:boolean}
const initial=():ProjectState=>({busy:false,message:'',projects:[],project:null,members:[],global:[],actions:[],projectCursor:null,memberCursor:null,pending:false});
const storageKey='threadwork.pending-project-operation';
const roles=['product_owner','scrum_master','developer','viewer'];
const object=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const keys=(v:Record<string,unknown>,expected:string)=>Object.keys(v).sort().join(',')===expected;
const id=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v);
const revision=(v:unknown)=>Number.isSafeInteger(v)&&Number(v)>0;
function project(v:unknown):v is Project{return object(v)&&keys(v,'description,name,project_id,revision')&&id(v.project_id)&&typeof v.name==='string'&&v.name.length>0&&typeof v.description==='string'&&revision(v.revision);}
function member(v:unknown):v is Member{return object(v)&&keys(v,'project_id,revision,role,user_id')&&id(v.project_id)&&id(v.user_id)&&typeof v.role==='string'&&roles.includes(v.role)&&revision(v.revision);}
function page<T>(v:unknown,valid:(v:unknown)=>v is T):v is Page<T>{return object(v)&&keys(v,'items,next_cursor')&&Array.isArray(v.items)&&v.items.every(valid)&&(v.next_cursor===null||typeof v.next_cursor==='string'&&v.next_cursor.length>0);}
class Failure extends Error {readonly status:number;constructor(status:number){super('Workspace request unavailable');this.status=status;}}

/** Observations only. Cookies and current server checks remain the authority. */
export class ProjectController {
 private state=initial();private listeners=new Set<()=>void>();private generation=0;private request:AbortController|null=null;private pending:Pending|null=null;
 private actor:string;private expired:()=>void;private transport:Transport;private storage:Storage|null=null;
 constructor(actor:string,expired:()=>void,transport:Transport=(url,init)=>fetch(url,init),storage?:Storage){
  this.actor=actor;this.expired=expired;this.transport=transport;
  try{this.storage=storage??window.sessionStorage;}catch{ /* Storage may be disabled by browser policy. */ }
  try{const raw=this.storage?.getItem(storageKey);if(raw){const p:unknown=JSON.parse(raw);if(this.validPending(p)){this.pending=p;this.state={...this.state,pending:true,message:'An earlier operation needs confirmation. Check its original result before making another change.'};}else this.storage?.removeItem(storageKey);}}catch{ /* Reads remain usable when browser storage is unavailable. */ }
 }
 static clearPending(){try{window.sessionStorage.removeItem(storageKey);}catch{ /* No stored operation to recover. */ }}
 private validPending(p:unknown):p is Pending{
  if(!object(p)||p.actor!==this.actor||typeof p.key!=='string'||!id(p.key)||typeof p.path!=='string'||Object.keys(p).some(k=>!['actor','path','method','body','key','revision'].includes(k)))return false;
  if(p.method==='DELETE')return /^\/projects\/[0-9a-f-]{36}\/members\/[0-9a-f-]{36}$/i.test(p.path)&&typeof p.revision==='string'&&/^[1-9]\d*$/.test(p.revision)&&revision(Number(p.revision))&&p.body===undefined;
  if(p.method!=='POST'||typeof p.body!=='string'||p.body.length>8192||p.revision!==undefined)return false;
  try{const b:unknown=JSON.parse(p.body);return object(b)&&(p.path==='/projects'?keys(b,'description,name')&&typeof b.name==='string'&&typeof b.description==='string':/^\/projects\/[0-9a-f-]{36}\/members$/i.test(p.path)&&keys(b,'role,user_id')&&id(b.user_id)&&typeof b.role==='string'&&roles.includes(b.role));}catch{return false;}
 }
 getSnapshot=()=>this.state;
 subscribe=(f:()=>void)=>{this.listeners.add(f);return()=>{this.listeners.delete(f);};};
 private publish(update:Partial<ProjectState>){this.state={...this.state,...update};for(const f of this.listeners)f();}
 cancel=()=>{this.generation++;this.request?.abort();};
 private async json(path:string,signal:AbortSignal){
  const response=await this.transport('/api'+path,{method:'GET',credentials:'same-origin',cache:'no-store',redirect:'error',signal});
  if(response.status!==200)throw new Failure(response.status);
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Failure(503);
  return response.json() as Promise<unknown>;
 }
 private async allowed(path:string,scope:string,projectId:string|null,signal:AbortSignal){
  const v=await this.json(path,signal);
  if(!object(v)||!keys(v,'allowed_operations,document_id,project_id,resource_id,resource_kind,version_id')||v.resource_kind!==scope||v.project_id!==projectId||v.resource_id!==null||v.document_id!==null||v.version_id!==null||!Array.isArray(v.allowed_operations)||!v.allowed_operations.every(x=>typeof x==='string'))throw new Failure(503);
  return v.allowed_operations as string[];
 }
 private async read(work:(signal:AbortSignal)=>Promise<Partial<ProjectState>>){
  this.cancel();const generation=this.generation,request=new AbortController();this.request=request;
  // Hide all previous authority observations while revalidating, including during pagination.
  this.publish({...initial(),busy:true,pending:!!this.pending,message:'Checking current project access…'});
  const timer=setTimeout(()=>request.abort(),10000);
  try{const update=await work(request.signal);if(generation===this.generation)this.publish({...update,busy:false,pending:!!this.pending,message:this.pending?'Check the original operation before making another change.':''});}
  catch(error){if(generation===this.generation){this.publish({...initial(),pending:!!this.pending,message:error instanceof Failure&&error.status===409?'This list has changed. Refresh projects to load its current version.':error instanceof Failure&&[403,404].includes(error.status)?'Project unavailable. Refresh projects to check your current access.':'Unable to confirm project access. Try refreshing projects.'});if(error instanceof Failure&&error.status===401)this.expired();}}
  finally{clearTimeout(timer);}
 }
 refresh=()=>this.directory();
 private directory(cursor?:string,previous:Project[]=[]){return this.read(async signal=>{
  const [v,global]=await Promise.all([this.json('/projects'+(cursor?'?cursor='+encodeURIComponent(cursor):''),signal),this.allowed('/access/allowed-actions?resource_kind=global','global',null,signal)]);
  if(!page(v,project))throw new Failure(503);return{projects:[...previous,...v.items],projectCursor:v.next_cursor,global};
 });}
 moreProjects=()=>this.state.projectCursor?this.directory(this.state.projectCursor,this.state.projects):Promise.resolve();
 select=(projectId:string,cursor?:string,previous:Member[]=[])=>this.read(async signal=>{
  if(!id(projectId))throw new Failure(404);
  const path='/projects/'+projectId;
  const [p,m,actions]=await Promise.all([this.json(path,signal),this.json(path+'/members'+(cursor?'?cursor='+encodeURIComponent(cursor):''),signal),this.allowed('/access/allowed-actions?resource_kind=project&project_id='+projectId,'project',projectId,signal)]);
  if(!project(p)||p.project_id!==projectId||!page(m,member)||m.items.some(x=>x.project_id!==projectId))throw new Failure(503);
  return{project:p,members:[...previous,...m.items],memberCursor:m.next_cursor,actions};
 });
 moreMembers=()=>this.state.project&&this.state.memberCursor?this.select(this.state.project.project_id,this.state.memberCursor,this.state.members):Promise.resolve();
 create=(name:string,description:string)=>this.mutate('/projects','POST',JSON.stringify({name,description}));
 add=(userId:string,role:string)=>this.state.project?this.mutate('/projects/'+this.state.project.project_id+'/members','POST',JSON.stringify({user_id:userId,role})):Promise.resolve();
 remove=(m:Member)=>this.mutate('/projects/'+m.project_id+'/members/'+m.user_id,'DELETE',undefined,String(m.revision));
 private async mutate(path:string,method:'POST'|'DELETE',body?:string,expected?:string){
  if(this.pending||this.state.busy)return;
  const p:Pending={actor:this.actor,path,method,key:crypto.randomUUID(),...(body===undefined?{}:{body}),...(expected===undefined?{}:{revision:expected})};
  try{if(!this.storage)throw new Error('Storage unavailable');this.storage.setItem(storageKey,JSON.stringify(p));this.pending=p;}catch{this.publish({message:'This browser cannot retain a recovery key. Enable session storage before making changes.'});return;}
  await this.retry();
 }
 retry=async()=>{
  const p=this.pending;if(!p||this.state.busy)return;
  this.cancel();const generation=this.generation,request=new AbortController();this.request=request;
  this.publish({...initial(),busy:true,pending:true,message:'Confirming the operation…'});const timer=setTimeout(()=>request.abort(),10000);
  try{
   const response=await this.transport('/api'+p.path,{method:p.method,...(p.body===undefined?{}:{body:p.body}),credentials:'same-origin',cache:'no-store',redirect:'error',signal:request.signal,headers:{'X-SACW-Request':'1','Idempotency-Key':p.key,...(p.body?{'Content-Type':'application/json'}:{}),...(p.revision?{'X-Expected-Revision':p.revision}:{})}});
   if(generation!==this.generation)return;
   if(response.status===(p.method==='DELETE'?204:201)){
    if(p.method==='POST'){const v:unknown=await response.json();if(!(p.path==='/projects'?project(v):member(v)))throw new Failure(503);}
    if(generation!==this.generation)return;
    this.storage?.removeItem(storageKey);this.pending=null;this.publish({busy:false,pending:false});await this.refresh();
   }else if([401,403,404].includes(response.status)){
    this.publish({...initial(),pending:true,message:'Current access was denied. The earlier result is still unconfirmed; restore access before checking the original operation.'});if(response.status===401)this.expired();
   }else if([400,409,413,415].includes(response.status)){
    this.storage?.removeItem(storageKey);this.pending=null;
    this.publish({...initial(),message:response.status===409?'The operation conflicts with current state. Refresh projects before deciding what to do next.':'The operation was denied. Refresh projects to check your access.'});if(response.status===401)this.expired();
   }else throw new Failure(503);
  }catch{if(generation===this.generation)this.publish({...initial(),pending:true,message:'The result is not confirmed. Check the original operation; do not submit a new one.'});}
  finally{clearTimeout(timer);}
 };
}
