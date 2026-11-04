import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {taskMutationFixture} from './task-mutation-fixture.mjs';
import {pauseTaskQuery,taskBarrier} from './task-fixture.mjs';
import {WorkspaceProjectOperator} from '../../services/workspace/src/projects/operator.ts';
import {WorkspaceProjectStore} from '../../services/workspace/src/projects/store.ts';
import {WorkspaceTaskStore} from '../../services/workspace/src/tasks/store.ts';
import {buildApp} from '../../services/workspace/src/app.ts';

const key=()=>randomUUID(),settled=p=>p.then(value=>({value}),error=>({error}));
async function reached(gate,result){await Promise.race([gate.ready,result.then(()=>{throw Error('Producer ended before observed barrier');})]);}

test('SP04-P03D1 actual Backlog edit, recovery, rollback and authority schedules',{timeout:180000},async t=>{
 const f=await taskMutationFixture(),{db,ids:[a,b,c],tokens,project,projects,operator}=f;t.after(()=>f.close());
 t.diagnostic(JSON.stringify({fixture:db.name,volume:db.volume,image:db.image,ceiling:'010'}));
 await operator.project(a,project,'backlog-author',true,'0','synthetic-P03D1','fixture creation');
 await projects.add(tokens[0],project,{user_id:b,role:'product_owner'},key());
 const create=async(title='Original')=>{const r=await f.create({type:'task',title,description:'Original description'});assert.equal(r.statusCode,201,r.body);return r.json();};
 const patch=(id,input,k=key(),token=tokens[0],app=f.app)=>app.inject({method:'PATCH',url:`/tasks/${id}`,headers:{...f.headers(token),'idempotency-key':k},payload:input});
 const get=id=>f.app.inject({url:`/tasks/${id}`,headers:f.headers()});
 const discover=(id,token=tokens[0])=>f.app.inject({url:`/access/allowed-actions?resource_kind=task&project_id=${project}&resource_id=${id}`,headers:f.headers(token)});
 const state=async id=>({task:(await get(id)).json(),audit:(await db.admin.query("SELECT actor_id,action,entity_id,before_ref,after_ref,correlation_id FROM workspace.business_audit WHERE entity_id=$1 ORDER BY event_id",[id])).rows,outcomes:(await db.admin.query("SELECT actor_id,idempotency_key,payload_hash,result_snapshot FROM workspace.idempotency_record WHERE operation='editTask' AND result_ref=$1 ORDER BY idempotency_key",[id])).rows,backlog:(await db.admin.query('SELECT backlog_revision::text value FROM workspace.project WHERE project_id=$1',[project])).rows[0].value});
 const task=await create();
 await t.test('explicit action only; cross-project/nonmember/missing identities conceal existence',async()=>{
  const before=await state(task.task_id);
  for(const token of tokens.slice(0,2))assert.equal((await patch(task.task_id,{title:'Denied',expected_revision:1},key(),token)).statusCode,403);
  for(const id of [task.task_id,randomUUID(),'invalid']){const r=await patch(id,{expected_revision:1},key(),tokens[2]);assert.equal(r.statusCode,404);assert.deepEqual(r.json(),{code:'not_found',message:'Resource unavailable'});}
  assert.equal((await patch(task.task_id,{expected_revision:1},key(),'forged')).statusCode,401);
  const anon=await f.app.inject({method:'PATCH',url:`/tasks/${task.task_id}`,payload:{expected_revision:1}});assert.equal(anon.statusCode,401);
  assert.deepEqual(await state(task.task_id),before);
 });
 await operator.project(a,project,'task-edit',true,'0','synthetic-P03D1','explicit edit');
 await t.test('strict shape/media/origin/header/text/body bounds make no change',async()=>{
  const before=await state(task.task_id);
  for(const body of [{},{expected_revision:0},{expected_revision:1.5},{expected_revision:9007199254740992},{expected_revision:'1'},{expected_revision:1,title:''},{expected_revision:1,title:'   '},{expected_revision:1,title:null},{expected_revision:1,title:'x\0'},{expected_revision:1,title:'x\ud800'},{expected_revision:1,description:null},{expected_revision:1,description:4},{expected_revision:1,actor_id:b},{expected_revision:1,state:'done'},null,[]])assert.equal((await patch(task.task_id,body)).statusCode,400,JSON.stringify(body));
  const req={method:'PATCH',url:`/tasks/${task.task_id}`,headers:{...f.headers(),'idempotency-key':key()},payload:{expected_revision:1,title:'Bad'}};
  assert.equal((await f.app.inject({...req,url:req.url+'?project_id='+project})).statusCode,400);
  assert.equal((await f.app.inject({...req,headers:{...req.headers,origin:'https://foreign.invalid'}})).statusCode,403);
  assert.equal((await f.app.inject({...req,headers:{...req.headers,'x-sacw-request':'0'}})).statusCode,403);
  assert.equal((await f.app.inject({...req,headers:{...req.headers,'idempotency-key':''}})).statusCode,400);
  assert.equal((await f.app.inject({...req,headers:{...req.headers,'content-type':'application/x-custom'},payload:'text'})).statusCode,415);
  assert.equal((await patch(task.task_id,{expected_revision:1,title:'x'.repeat(9000)})).statusCode,413);
  await assert.rejects(f.tasks.edit(tokens[0],task.task_id,{expected_revision:1,title:undefined},key()));
  assert.deepEqual(await state(task.task_id),before);
 });
 let original,k;
 await t.test('confirmed edit persists exact text, audit and original200; omission preserves description; changed hash conflicts',async()=>{
  const before=await state(task.task_id);k=key();const body={expected_revision:1,title:'  Edited exactly  '};
  const r=await patch(task.task_id.toUpperCase(),body,k);assert.equal(r.statusCode,200,r.body);original=r.json();
  assert.deepEqual(original,{...task,title:body.title,revision:2});assert.equal(r.headers['cache-control'],'no-store');assert.equal(r.headers['set-cookie'],undefined);
  assert.deepEqual((await get(task.task_id)).json(),original);
  const after=await state(task.task_id);assert.equal(after.backlog,before.backlog);assert.equal(after.outcomes.length,1);assert.equal(after.audit.length,before.audit.length+1);
  const audit=after.audit.find(v=>v.action==='backlog-item-edit');assert.equal(audit.actor_id,a);assert.equal(audit.before_ref,'revision:1');const reference=JSON.parse(audit.after_ref);assert.equal(reference.revision,2);assert.equal(reference.actor_id,a);assert.equal(reference.operation,'editTask');assert.equal(reference.key,k);assert.equal(reference.payload_hash,after.outcomes[0].payload_hash);assert(audit.correlation_id);
  assert.deepEqual((await patch(task.task_id,body,k)).json(),original);
  assert.equal((await patch(task.task_id,{...body,title:'Changed hash'},k)).statusCode,409);
  assert.equal((await patch(task.task_id,{expected_revision:1,title:'Stale'})).statusCode,409);
  assert.deepEqual(await state(task.task_id),after);
  const clear=await patch(task.task_id,{expected_revision:2,description:''});assert.equal(clear.statusCode,200);assert.equal(clear.json().description,'');assert.equal(clear.json().title,original.title);
  assert.deepEqual((await patch(task.task_id,body,k)).json(),original,'historical receipt stays original after later edit');
 });
 await t.test('empty and same-value no-ops retain their own200 without revision/audit; missing and empty fields hash differently',async()=>{
  const current=(await get(task.task_id)).json(),before=await state(task.task_id),noop=key();
  for(const [input,k] of [[{expected_revision:current.revision},noop],[{expected_revision:current.revision,title:current.title,description:''},key()]]){const r=await patch(task.task_id,input,k);assert.equal(r.statusCode,200,r.body);assert.deepEqual(r.json(),current);}
  const after=await state(task.task_id);assert.deepEqual(after.task,before.task);assert.deepEqual(after.audit,before.audit);assert.equal(after.outcomes.length,before.outcomes.length+2);
  assert.equal((await patch(task.task_id,{expected_revision:current.revision,description:''},noop)).statusCode,409);
 });
 await t.test('new edits reject non-Backlog placement; retained replay bypasses current placement and revision',async()=>{
  // Explicit internal projection double, not an implemented Sprint allocation handler.
  const fakePool={async connect(){const c=await db.runtime.connect();return new Proxy(c,{get(target,prop){if(prop==='query')return async(...args)=>{const out=await c.query(...args);if(typeof args[0]==='string'&&args[0].includes('FROM workspace.task t WHERE'))for(const row of out.rows){row.location_kind='sprint';row.location_sprint_id='11111111-1111-4111-8111-111111111111';}return out;};const v=Reflect.get(target,prop);return typeof v==='function'?v.bind(target):v;}});}};
  const tasks=new WorkspaceTaskStore(fakePool,f.sessions,f.cursorKey),app=buildApp({store:f.sessions,projects,tasks,origin:'https://localhost'});await app.ready();
  try{const before=await state(task.task_id);assert.deepEqual((await patch(task.task_id,{expected_revision:1,title:original.title},k,tokens[0],app)).json(),original);assert.equal((await patch(task.task_id,{expected_revision:before.task.revision,title:'Wrong placement'},key(),tokens[0],app)).statusCode,409);assert.deepEqual(await state(task.task_id),before);}finally{await app.close();}
 });
 await t.test('safe revision ceiling permits no-op but refuses increment',async()=>{
  const max=await create('Maximum');await db.admin.query('UPDATE workspace.task SET revision=9007199254740991 WHERE task_id=$1',[max.task_id]);
  assert.equal((await patch(max.task_id,{expected_revision:9007199254740991})).statusCode,200);
  assert.equal((await patch(max.task_id,{expected_revision:9007199254740991,title:'Overflow'})).statusCode,409);
  assert.equal((await get(max.task_id)).json().revision,9007199254740991);
 });
 await t.test('task UPDATE, audit and outcome faults roll back every business effect',async()=>{
  for(const [table,event]of [['task','UPDATE'],['business_audit','INSERT'],['idempotency_record','INSERT']]){
   const before=await state(task.task_id);await db.admin.query(`CREATE FUNCTION workspace.reject_edit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic-edit-private-canary'; END $$; CREATE TRIGGER reject_edit BEFORE ${event} ON workspace.${table} FOR EACH ROW EXECUTE FUNCTION workspace.reject_edit()`);
   const k=key(),input={expected_revision:before.task.revision,title:'Must rollback '+table};
   try{const r=await patch(task.task_id,input,k);assert.equal(r.statusCode,503,r.body);assert(!r.body.includes('canary'));assert.deepEqual(await state(task.task_id),before);}finally{await db.admin.query(`DROP TRIGGER reject_edit ON workspace.${table}; DROP FUNCTION workspace.reject_edit()`);}
   const recovered=await patch(task.task_id,input,k);assert.equal(recovered.statusCode,200,recovered.body);
  }
 });
 await t.test('same-revision competing edits have one winner; concurrent duplicate key writes once',async()=>{
  const fresh=await create('Concurrent'),before=await state(fresh.task_id);
  const responses=await Promise.all(['One','Two'].map(title=>patch(fresh.task_id,{expected_revision:1,title})));
  assert.deepEqual(responses.map(r=>r.statusCode).sort(),[200,409]);assert.equal((await state(fresh.task_id)).audit.length,before.audit.length+1);
  const next=await create('Duplicate'),k=key(),input={expected_revision:1,title:'Once'};
  const dup=await Promise.all([patch(next.task_id,input,k),patch(next.task_id,input,k)]);assert.deepEqual(dup.map(r=>r.statusCode),[200,200]);assert.deepEqual(dup[0].json(),dup[1].json());
  const end=await state(next.task_id);assert.equal(end.outcomes.length,1);assert.equal(end.audit.filter(v=>v.action==='backlog-item-edit').length,1);
 });
 await t.test('edit-first actual lock schedule commits once then current revoked authority denies replay',async()=>{
  const fresh=await create('Edit first'),gate=pauseTaskQuery(db.runtime,'UPDATE workspace.task SET title'),tasks=new WorkspaceTaskStore(gate.pool,f.sessions,f.cursorKey),app=buildApp({store:f.sessions,projects,tasks,origin:'https://localhost'});await app.ready();
  const k=key(),input={expected_revision:1,title:'Committed before revoke'},pending=settled(patch(fresh.task_id,input,k,tokens[0],app));await reached(gate,pending);
  const revoke=settled(operator.project(a,project,'task-edit',false,'1','synthetic-P03D1','race revoke'));
  try{await taskBarrier(db.admin,'postgres');}finally{gate.release();}
  try{assert.equal((await pending).value.statusCode,200);assert(!(await revoke).error);assert.equal((await patch(fresh.task_id,input,k)).statusCode,403);}finally{await app.close();}
 });
 await t.test('revoke-first actual producer denies waiting new edit and original replay',async()=>{
  await operator.project(a,project,'task-edit',true,'2','synthetic-P03D1','restore');
  const before=await state(task.task_id),gate=pauseTaskQuery(db.admin,'UPDATE workspace.capability_grant SET valid=false'),op=new WorkspaceProjectOperator(gate.pool);
  const revoke=settled(op.project(a,project,'task-edit',false,'3','synthetic-P03D1','revoke first'));await reached(gate,revoke);
  const edits=[settled(patch(task.task_id,{expected_revision:before.task.revision,title:'Denied after wait'})),settled(patch(task.task_id,{expected_revision:1,title:original.title},k))];
  try{await taskBarrier(db.admin,'workspace_app','auth_clock_state',2);}finally{gate.release();}
  assert(!(await revoke).error);for(const edit of edits)assert.equal((await edit).value.statusCode,403);assert.deepEqual(await state(task.task_id),before);
 });
 await t.test('actual removal before edit denies the former member and rejoin restores no edit grant',async()=>{
  await operator.project(b,project,'task-edit',true,'0','synthetic-P03D1','member edit');const fresh=await create('Removed member'),before=await state(fresh.task_id);
  const gate=pauseTaskQuery(db.runtime,'UPDATE workspace.membership SET active=false'),p=new WorkspaceProjectStore(gate.pool,f.sessions,f.cursorKey);
  const remove=settled(p.remove(tokens[0],project,b,'1',key()));await reached(gate,remove);
  const edit=settled(patch(fresh.task_id,{expected_revision:1,title:'No membership'},key(),tokens[1]));
  try{await taskBarrier(db.admin,'workspace_app');}finally{gate.release();}
  assert(!(await remove).error);assert.equal((await edit).value.statusCode,404);assert.deepEqual(await state(fresh.task_id),before);
  await projects.add(tokens[0],project,{user_id:b,role:'product_owner'},key());assert.equal((await patch(fresh.task_id,{expected_revision:1},key(),tokens[1])).statusCode,403);
 });
 await t.test('live discovery advertises only implemented edit with current authority and clears after revoke',async()=>{
  assert(!(await discover(task.task_id)).json().allowed_operations.includes('editTask'));
  await operator.project(a,project,'task-edit',true,'4','synthetic-P03D1','restore for discovery');
  const ops=(await discover(task.task_id)).json().allowed_operations;assert(ops.includes('editTask'));assert(!ops.includes('setTaskState'));assert(!ops.includes('recordBlocker'));assert(ops.includes('listBlockerEvents'));
 });
 await t.test('session expiry during a paused actual read withholds edit before business writes',async()=>{
  const fresh=await create('Expiry'),before=await state(fresh.task_id);await db.admin.query("UPDATE workspace.session SET expires_at=clock_timestamp()+interval '250 milliseconds' WHERE user_id=$1",[a]);
  const gate=pauseTaskQuery(db.runtime,'FOR UPDATE OF t'),tasks=new WorkspaceTaskStore(gate.pool,f.sessions,f.cursorKey),app=buildApp({store:f.sessions,projects,tasks,origin:'https://localhost'});await app.ready();
  const pending=settled(patch(fresh.task_id,{expected_revision:1,title:'Expired'},key(),tokens[0],app));await reached(gate,pending);
  try{await new Promise(r=>setTimeout(r,400));}finally{gate.release();}
  try{assert.equal((await pending).value.statusCode,401);const row=(await db.admin.query('SELECT title,revision FROM workspace.task WHERE task_id=$1',[fresh.task_id])).rows[0];assert.equal(row.title,before.task.title);assert.equal(Number(row.revision),before.task.revision);assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.idempotency_record WHERE operation='editTask' AND result_ref=$1",[fresh.task_id])).rows[0].n,'0');}finally{await app.close();}
 });
});
