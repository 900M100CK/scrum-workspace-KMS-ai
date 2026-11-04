import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {TaskController} from '../../apps/web/src/tasks.ts';
const actor=randomUUID(),project=randomUUID(),id=randomUUID(),other=randomUUID();
const original={task_id:id,project_id:project,type:'task',title:'Original',description:'Text',state:'todo',assignee_id:null,blocked:false,revision:1,work_location:{kind:'backlog',position:'1'},created_at:'2026-11-04T00:00:00.000Z'};
const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json'}});
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k),get size(){return data.size;}};};
const actions=(target,ops)=>({resource_kind:target?'task':'project',project_id:project,resource_id:target?id:null,document_id:null,version_id:null,allowed_operations:ops});
const event={event_id:randomUUID(),task_id:id,status:'open',description:'Plan',outcome:null,actor_id:actor,recorded_at:'2026-11-04T00:00:00.001Z',sequence:1};
function fixture(){let current={...original},ops=['getTask','editTask','setTaskState','setAssignee','recordBlocker','listBlockerEvents'],events=[],status=200,lost=false,failReads=false;const writes=[],saved=storage();
 const transport=async(url,init)=>{
  if(init.method!=='GET'){writes.push({url,key:init.headers['Idempotency-Key'],body:init.body,method:init.method});if(lost){lost=false;throw Error('lost acknowledgement');}return json(url.endsWith('/blockers')?event:original,status===200&&url.endsWith('/blockers')?201:status);}
  if(failReads)throw Error('outage');
  if(url.includes('allowed-actions'))return json(actions(url.includes('resource_kind=task'),url.includes('resource_kind=task')?ops:['listTasks','createTask']));
  if(url.includes('/members'))return json({items:[{project_id:project,user_id:actor,role:'viewer',revision:1}],next_cursor:null});
  if(url.endsWith('/blockers'))return json({items:events,next_cursor:null});
  if(url.includes('/tasks/'+id))return json(current);
  return json({items:[current],next_cursor:null,backlog_revision:'2'});
 };
 return {transport,writes,saved,set current(v){current=v;},set ops(v){ops=v;},set events(v){events=v;},set lost(v){lost=v;},set status(v){status=v;},set failReads(v){failReads=v;}};
}
test('each mutation uses exact target actions, persists original identity before sending and refreshes current state after historical receipt',async()=>{
 for(const [op,input]of [['editTask',{title:'Changed',expected_revision:1}],['setTaskState',{state:'done',expected_revision:1}],['setAssignee',{assignee_id:null,expected_revision:1}],['recordBlocker',{status:'open',description:'Plan',outcome:null,expected_revision:1}]]){
  const f=fixture(),c=new TaskController(actor,project,()=>{},f.transport,f.saved);await c.open(id);f.lost=true;await c.mutate(op,input);assert(c.getSnapshot().pending);assert.equal(c.getSnapshot().detail,null);assert.deepEqual(c.getSnapshot().blockers,[]);assert.equal(f.saved.size,1);
  await c.mutate(op,input);assert.equal(f.writes.length,1);
  const reload=new TaskController(actor,project,()=>{},f.transport,f.saved);assert(reload.getSnapshot().pending);f.current={...original,title:'Later current result',revision:8,state:'in_progress'};f.events=[event];await reload.retry();assert(!reload.getSnapshot().pending);assert.equal(f.saved.size,0);assert.equal(reload.getSnapshot().detail.title,'Later current result');assert.deepEqual(f.writes[0],f.writes[1]);assert.equal(f.writes[0].method,op==='editTask'?'PATCH':'POST');assert.equal(f.writes[0].body,JSON.stringify(input));
 }
});
test('conflicts refresh separately, never automatically issue a new key; denial/outage retain recovery and clear content',async()=>{
 for(const status of [400,409,401,403,404,503]){
  const f=fixture();let expired=0;const c=new TaskController(actor,project,()=>expired++,f.transport,f.saved);await c.open(id);f.status=status;await c.mutate('setTaskState',{state:'done',expected_revision:1});assert.equal(f.writes.length,1);
  if([400,409].includes(status)){assert(!c.getSnapshot().pending);assert.equal(c.getSnapshot().detail.revision,1);assert.match(c.getSnapshot().message,/rejected|conflict/);}else{assert(c.getSnapshot().pending);assert.equal(c.getSnapshot().detail,null);assert.deepEqual(c.getSnapshot().actions,[]);assert.equal(expired,status===401?1:0);}
 }
});
test('foreign actor, malformed stored input and missing exact action cannot issue mutations; logout clears recovery',async()=>{
 const f=fixture(),c=new TaskController(actor,project,()=>{},f.transport,f.saved);f.ops=['getTask','listBlockerEvents'];await c.open(id);await c.mutate('editTask',{title:'x',expected_revision:1});assert.equal(f.writes.length,0);
 f.ops=['getTask','editTask'];await c.open(id);await c.mutate('editTask',{title:' ',expected_revision:1});assert.equal(f.writes.length,0);
 f.lost=true;await c.mutate('editTask',{title:'Valid',expected_revision:1});assert(f.saved.size);const foreign=new TaskController(other,project,()=>{},f.transport,f.saved);assert(!foreign.getSnapshot().pending);await foreign.retry();assert.equal(f.writes.length,1);
 f.lost=true;await c.retry();TaskController.clearPending(f.saved);assert.equal(f.saved.size,0);
});
test('a confirmed write followed by unavailable current reads never presents its historical receipt as current',async()=>{
 const f=fixture(),c=new TaskController(actor,project,()=>{},f.transport,f.saved);await c.open(id);f.failReads=true;await c.mutate('setTaskState',{state:'done',expected_revision:1});assert(!c.getSnapshot().pending);assert.equal(c.getSnapshot().detail,null);assert.deepEqual(c.getSnapshot().blockers,[]);assert.deepEqual(c.getSnapshot().actions,[]);
});

test('history pagination validates ascending events, refreshes current scope and discards stale pages',async()=>{
 const f=fixture(),events=Array.from({length:51},(_,i)=>({...event,event_id:randomUUID(),sequence:i+1}));let stale=false,deny=false;
 const transport=async(url,init)=>{
  if(url.includes('/blockers')){if(deny)return new Response(null,{status:404});if(url.includes('cursor='))return stale?new Response(null,{status:409}):json({items:[events[50]],next_cursor:null});return json({items:events.slice(0,50),next_cursor:'opaque-synthetic'});}
  return f.transport(url,init);
 };
 const c=new TaskController(actor,project,()=>{},transport,f.saved);await c.open(id);assert.equal(c.getSnapshot().blockers.length,50);await c.moreBlockers();assert.equal(c.getSnapshot().blockers.length,51);assert.equal(c.getSnapshot().blockerCursor,null);
 await c.open(id);stale=true;await c.moreBlockers();assert.equal(c.getSnapshot().blockers.length,50);assert.equal(c.getSnapshot().detail.task_id,id);
 deny=true;await c.moreBlockers();assert.equal(c.getSnapshot().detail,null);assert.deepEqual(c.getSnapshot().blockers,[]);assert.deepEqual(c.getSnapshot().actions,[]);
});
