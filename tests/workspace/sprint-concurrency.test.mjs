import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {sprintFixture,enableSprint} from './sprint-fixture.mjs';import {pauseTaskQuery,taskBarrier} from './task-fixture.mjs';import {WorkspaceSprintStore} from '../../services/workspace/src/sprints/store.ts';import {buildApp} from '../../services/workspace/src/app.ts';
const value=(r,status=200)=>{assert.equal(r.statusCode,status,r.body);return r.json();};
async function appFor(f,pool){const app=buildApp({store:f.sessions,projects:f.projects,tasks:f.tasks,sprints:new WorkspaceSprintStore(pool,f.sessions,f.cursorKey),origin:'https://localhost'});await app.ready();return app;}
async function pending(gate,promise){await Promise.race([gate.ready,promise.then(()=>{throw Error('Producer did not reach SQL barrier');})]);}
async function waitThenRelease(f,gate){try{await taskBarrier(f.db.admin,'workspace_app');}finally{gate.release();}}
test('SP05 actual competing starts/allocations and SP04 complete/reopen integration',{timeout:240000},async t=>{
 const f=await sprintFixture();t.after(()=>f.close());await enableSprint(f);const {call,db,project}=f;
 const freshSprint=async()=>value(await f.sprint(),201),freshTask=async()=>value(await f.create(),201);
 const allocate=(s,task,app=f.app)=>call('/sprints/'+s.sprint_id+'/items',{task_id:task.task_id,expected_revision:s.revision},'POST',randomUUID(),f.tokens[0],app);
 const start=(s,app=f.app)=>call('/sprints/'+s.sprint_id+'/start',{expected_revision:s.revision},'POST',randomUUID(),f.tokens[0],app);
 const complete=(s,app=f.app)=>call('/sprints/'+s.sprint_id+'/complete',{expected_revision:s.revision},'POST',randomUUID(),f.tokens[0],app);
 const state=(task,state,app=f.app)=>call('/tasks/'+task.task_id+'/state',{state,expected_revision:task.revision},'POST',randomUUID(),f.tokens[0],app);
 const setup=async()=>{const task=await freshTask();let s=await freshSprint();s=value(await allocate(s,task));s=value(await start(s));value(await state(await f.tasks.get(f.tokens[0],task.task_id),'done'));return {s,task:await f.tasks.get(f.tokens[0],task.task_id)};};
 await t.test('two actual starts queued after first state write yield one Active Sprint',async()=>{
  const a=await freshSprint(),b=await freshSprint(),gate=pauseTaskQuery(db.runtime,"UPDATE workspace.sprint SET state='active'"),app=await appFor(f,gate.pool);const first=start(a,app);await pending(gate,first);const second=start(b);await waitThenRelease(f,gate);
  try{const active=value(await first);assert.equal((await second).statusCode,409);assert.equal((await db.admin.query("SELECT count(*)::int n FROM workspace.sprint WHERE project_id=$1 AND state='active'",[project])).rows[0].n,1);value(await complete(active));}finally{await app.close();}
 });
 await t.test('competing actual allocations cannot give one Task two live associations',async()=>{
  const a=await freshSprint(),b=await freshSprint(),task=await freshTask(),gate=pauseTaskQuery(db.runtime,'INSERT INTO workspace.sprint_allocation'),app=await appFor(f,gate.pool);const first=allocate(a,task,app);await pending(gate,first);const second=allocate(b,task);await waitThenRelease(f,gate);
  try{value(await first);assert.equal((await second).statusCode,409);assert.equal((await db.admin.query("SELECT count(*)::int n FROM workspace.sprint_allocation WHERE task_id=$1 AND allocation_state='allocated'",[task.task_id])).rows[0].n,1);}finally{await app.close();}
 });
 await t.test('actual completion-first rejects stale reopen, then explicit reopen and later allocation preserve A history',async()=>{
  const {s,task}=await setup(),gate=pauseTaskQuery(db.runtime,"UPDATE workspace.sprint SET state='completed'"),app=await appFor(f,gate.pool);const first=complete(s,app);await pending(gate,first);const stale=state(task,'todo');await waitThenRelease(f,gate);
  try{value(await first);assert.equal((await stale).statusCode,409);const old=(await db.admin.query('SELECT * FROM workspace.sprint_allocation WHERE sprint_id=$1 AND task_id=$2',[s.sprint_id,task.task_id])).rows;value(await state(await f.tasks.get(f.tokens[0],task.task_id),'in_progress'));const next=await freshSprint();value(await allocate(next,task));assert.deepEqual((await db.admin.query('SELECT * FROM workspace.sprint_allocation WHERE sprint_id=$1 AND task_id=$2',[s.sprint_id,task.task_id])).rows,old);assert.equal((await f.sprints.get(f.tokens[0],s.sprint_id)).state,'completed');}finally{await app.close();}
 });
 await t.test('reopen-first during Active work makes actual completion return unfinished To Do',async()=>{
  const {s,task}=await setup();const {WorkspaceTaskStore}=await import('../../services/workspace/src/tasks/store.ts');const gate=pauseTaskQuery(db.runtime,'UPDATE workspace.task SET state=$2'),app=buildApp({store:f.sessions,projects:f.projects,tasks:new WorkspaceTaskStore(gate.pool,f.sessions,f.cursorKey),sprints:f.sprints,origin:'https://localhost'});await app.ready();const first=state(task,'in_progress',app);await pending(gate,first);const second=complete(s);await waitThenRelease(f,gate);
  try{value(await first);const result=value(await second);assert.equal(result.retained_done_count,0);assert.equal(result.returned_unfinished_count,1);const current=await f.tasks.get(f.tokens[0],task.task_id);assert.equal(current.state,'todo');assert.equal(current.work_location.kind,'backlog');}finally{await app.close();}
 });
 for(const order of ['reopen-first','allocate-first'])await t.test('actual completed reopen versus later allocation: '+order,async()=>{
  const {s,task}=await setup();value(await complete(s));const completedTask=await f.tasks.get(f.tokens[0],task.task_id),next=await freshSprint(),old=(await db.admin.query('SELECT * FROM workspace.sprint_allocation WHERE sprint_id=$1 AND task_id=$2',[s.sprint_id,task.task_id])).rows;
  const gate=pauseTaskQuery(db.runtime,order==='reopen-first'?'UPDATE workspace.task SET state=$2':'SELECT task_id,revision::text,location_kind');let app;
  if(order==='reopen-first'){const {WorkspaceTaskStore}=await import('../../services/workspace/src/tasks/store.ts');app=buildApp({store:f.sessions,projects:f.projects,tasks:new WorkspaceTaskStore(gate.pool,f.sessions,f.cursorKey),sprints:f.sprints,origin:'https://localhost'});await app.ready();}else app=await appFor(f,gate.pool);
  const first=order==='reopen-first'?state(completedTask,'in_progress',app):allocate(next,completedTask,app);await pending(gate,first);const second=order==='reopen-first'?allocate(next,completedTask):state(completedTask,'in_progress');await waitThenRelease(f,gate);
  try{const firstResult=await first,secondResult=await second;assert.equal(firstResult.statusCode,order==='reopen-first'?200:409,firstResult.body);value(secondResult);const live=await f.tasks.get(f.tokens[0],task.task_id);assert.equal(live.work_location.kind,order==='reopen-first'?'sprint':'backlog');assert.equal(live.state,'todo');assert.deepEqual((await db.admin.query('SELECT * FROM workspace.sprint_allocation WHERE sprint_id=$1 AND task_id=$2',[s.sprint_id,task.task_id])).rows,old);assert.equal((await db.admin.query("SELECT count(*)::int n FROM workspace.sprint_allocation WHERE task_id=$1 AND allocation_state='allocated'",[task.task_id])).rows[0].n,order==='reopen-first'?1:0);}finally{await app.close();}
 });
 for(const producer of ['create','allocate','reopen'])await t.test('actual '+producer+' invalidates a queued full-Backlog reorder without partial writes',async()=>{
  let task,s;if(producer==='reopen'){({s,task}=await setup());value(await complete(s));task=await f.tasks.get(f.tokens[0],task.task_id);}else if(producer==='allocate'){task=await freshTask();s=await freshSprint();}
  const before=value(await call('/projects/'+project+'/tasks?location=backlog',undefined,'GET')),key=randomUUID();assert.equal(before.next_cursor,null);const audit=(await db.admin.query("SELECT count(*)::int n FROM workspace.business_audit WHERE project_id=$1 AND action='backlog-reorder'",[project])).rows[0].n;
  const fragment=producer==='create'?'INSERT INTO workspace.task(':producer==='allocate'?'INSERT INTO workspace.sprint_allocation':'UPDATE workspace.task SET state=$2',gate=pauseTaskQuery(db.runtime,fragment);let app;
  if(producer==='allocate')app=await appFor(f,gate.pool);else{const {WorkspaceTaskStore}=await import('../../services/workspace/src/tasks/store.ts');app=buildApp({store:f.sessions,projects:f.projects,tasks:new WorkspaceTaskStore(gate.pool,f.sessions,f.cursorKey),sprints:f.sprints,origin:'https://localhost'});await app.ready();}
  const first=producer==='create'?call('/projects/'+project+'/tasks',{type:'task',title:'Concurrent append'},'POST',randomUUID(),f.tokens[0],app):producer==='allocate'?allocate(s,task,app):state(task,'in_progress',app);await pending(gate,first);
  const second=call('/projects/'+project+'/backlog-order',{task_ids:before.items.map(t=>t.task_id).reverse(),expected_revision:before.backlog_revision},'POST',key);await waitThenRelease(f,gate);
  try{value(await first,producer==='create'?201:200);assert.equal((await second).statusCode,409);const after=value(await call('/projects/'+project+'/tasks?location=backlog',undefined,'GET'));assert.notEqual(after.backlog_revision,before.backlog_revision);for(const old of before.items){const current=after.items.find(t=>t.task_id===old.task_id);if(current){assert.equal(current.work_location.position,old.work_location.position);assert.equal(current.revision,old.revision);}}
   assert.equal((await db.admin.query("SELECT count(*)::int n FROM workspace.business_audit WHERE project_id=$1 AND action='backlog-reorder'",[project])).rows[0].n,audit);assert.equal((await db.admin.query("SELECT count(*)::int n FROM workspace.idempotency_record WHERE operation='reorderBacklog' AND idempotency_key=$1",[key])).rows[0].n,0);
  }finally{await app.close();}
 });
 await t.test('actual completion return invalidates a queued whole-Backlog reorder without partial positions',async()=>{
  const task=await freshTask();let s=await freshSprint();s=value(await allocate(s,task));s=value(await start(s));const old=value(await call('/projects/'+project+'/tasks?location=backlog',undefined,'GET'));
  const gate=pauseTaskQuery(db.runtime,"UPDATE workspace.sprint SET state='completed'"),app=await appFor(f,gate.pool);const first=complete(s,app);await pending(gate,first);const second=call('/projects/'+project+'/backlog-order',{task_ids:old.items.map(t=>t.task_id).reverse(),expected_revision:old.backlog_revision});await waitThenRelease(f,gate);
  try{value(await first);assert.equal((await second).statusCode,409);assert.equal((await f.tasks.get(f.tokens[0],task.task_id)).work_location.kind,'backlog');}finally{await app.close();}
 });
});

test('SP05 each mutation rolls back audit/receipt failures and lost real COMMIT replays once',{timeout:240000},async t=>{
 const f=await sprintFixture();t.after(()=>f.close());await enableSprint(f);
 const cases=[['createSprint','/projects/'+f.project+'/sprints',()=>({goal:'Fault candidate',start_date:'2026-11-01',end_date:'2026-11-15'})],['allocateTask',null,null],['startSprint',null,null],['completeSprint',null,null],['reorderBacklog','/projects/'+f.project+'/backlog-order',null]];
 for(const [op]of cases)await t.test(op,async()=>{
  const task=value(await f.create(),201);let s=value(await f.sprint(),201);if(op==='completeSprint'){s=value(await f.call('/sprints/'+s.sprint_id+'/items',{task_id:task.task_id,expected_revision:s.revision}));s=value(await f.call('/sprints/'+s.sprint_id+'/start',{expected_revision:s.revision}));}
  const list=value(await f.call('/projects/'+f.project+'/tasks?location=backlog',undefined,'GET'));
  const path=op==='createSprint'?'/projects/'+f.project+'/sprints':op==='reorderBacklog'?'/projects/'+f.project+'/backlog-order':'/sprints/'+s.sprint_id+(op==='allocateTask'?'/items':op==='startSprint'?'/start':'/complete');
  const input=op==='createSprint'?{goal:'Fault candidate',start_date:'2026-11-01',end_date:'2026-11-15'}:op==='reorderBacklog'?{task_ids:list.items.map(t=>t.task_id).reverse(),expected_revision:list.backlog_revision}:op==='allocateTask'?{task_id:task.task_id,expected_revision:s.revision}:{expected_revision:s.revision};
  const snapshot=async()=>{const r=[];for(const table of ['sprint','task','sprint_allocation','business_audit','idempotency_record'])r.push((await f.db.admin.query('SELECT row_to_json(t) value FROM workspace.'+table+' t ORDER BY row_to_json(t)::text')).rows);return r;};
  for(const table of ['business_audit','idempotency_record']){
   const before=await snapshot();await f.db.admin.query('CREATE FUNCTION workspace.reject_sprint_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION $err$synthetic-sprint-canary$err$; END $$; CREATE TRIGGER reject_sprint_write BEFORE INSERT ON workspace.'+table+' FOR EACH ROW EXECUTE FUNCTION workspace.reject_sprint_write()');
   try{const r=await f.call(path,input);assert.equal(r.statusCode,503,r.body);assert(!r.body.includes('canary'));assert.deepEqual(await snapshot(),before);}finally{await f.db.admin.query('DROP TRIGGER reject_sprint_write ON workspace.'+table+'; DROP FUNCTION workspace.reject_sprint_write()');}
  }
  let lost=true;const pool={async connect(){const c=await f.db.runtime.connect();return new Proxy(c,{get(target,prop){if(prop==='query')return async(...args)=>{const r=await c.query(...args);if(args[0]==='COMMIT'&&lost){lost=false;throw Error('Synthetic lost COMMIT acknowledgement');}return r;};const v=Reflect.get(target,prop);return typeof v==='function'?v.bind(target):v;}});}};
  const app=await appFor(f,pool),key=randomUUID();try{assert.equal((await f.call(path,input,'POST',key,f.tokens[0],app)).statusCode,503);const committed=await snapshot();value(await f.call(path,input,'POST',key),op==='createSprint'?201:200);assert.deepEqual(await snapshot(),committed);assert.equal((await f.call(path,{...input,expected_revision:op==='reorderBacklog'?'999':999},'POST',key)).statusCode,op==='createSprint'?400:409);}finally{await app.close();}
  if(op==='startSprint')value(await f.call('/sprints/'+s.sprint_id+'/complete',{expected_revision:s.revision+1}));
 });
});
