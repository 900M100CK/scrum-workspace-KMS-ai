import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {taskFixture,taskBarrier,pauseTaskQuery} from './task-fixture.mjs';
import {WorkspaceTaskStore} from '../../services/workspace/src/tasks/store.ts';
import {WorkspaceProjectOperator} from '../../services/workspace/src/projects/operator.ts';
import {WorkspaceProjectStore} from '../../services/workspace/src/projects/store.ts';
import {buildApp} from '../../services/workspace/src/app.ts';
import {WorkspaceSessionOperator} from '../../services/workspace/src/session/store.ts';

const settled=p=>p.then(value=>({value}),error=>({error}));
async function reached(gate,result){await Promise.race([gate.ready,result.then(()=>{throw Error('Task producer ended before controlled query barrier');})]);}
test('P07 observed SQL schedules on actual Task producers and current authority',{timeout:180000},async t=>{
 const f=await taskFixture(),{db,ids:[a,b],tokens,projects,operator}=f;t.after(()=>f.close());
 async function fresh(second=false){const p=(await projects.create(tokens[0],{name:'Synthetic Task concurrency'},randomUUID())).projectId;await operator.project(a,p,'backlog-author',true,'0','synthetic','author');if(second){await projects.add(tokens[0],p,{user_id:b,role:'viewer'},randomUUID());await operator.project(b,p,'membership-manage',true,'0','synthetic','second manager');}return p;}
 const create=(p,title,key=randomUUID(),token=tokens[0],app=f.app)=>app.inject({method:'POST',url:`/projects/${p}/tasks`,headers:{...f.headers(token),'idempotency-key':key},payload:{type:'task',title}});
 const state=async p=>({tasks:(await db.admin.query('SELECT task_id,backlog_position::text position FROM workspace.task WHERE project_id=$1 ORDER BY backlog_position,task_id',[p])).rows,generation:(await db.admin.query('SELECT backlog_revision::text n FROM workspace.project WHERE project_id=$1',[p])).rows[0].n,audits:(await db.admin.query("SELECT count(*) n FROM workspace.business_audit WHERE project_id=$1 AND action='backlog-item-create'",[p])).rows[0].n,outcomes:(await db.admin.query("SELECT count(*) n FROM workspace.idempotency_record WHERE operation='createTask' AND result_snapshot->>'project_id'=$1",[p])).rows[0].n});
 async function queuedTogether(work){const held=await db.admin.connect();await held.query('BEGIN');await held.query('SELECT singleton FROM workspace.auth_clock_state FOR UPDATE');const requests=work().map(settled);try{await taskBarrier(db.admin,'workspace_app','auth_clock_state',2);}finally{await held.query('ROLLBACK');held.release();}return Promise.all(requests);}
 await t.test('two authorized appends queued at a real barrier keep both exact numeric positions and two generation increments',async()=>{
  const p=await fresh(true);await operator.project(b,p,'backlog-author',true,'0','synthetic','second author');const seed=(await create(p,'Seed')).json();
  // Controlled position fixture only; no SP-04 reorder handler is being claimed.
  await db.admin.query("UPDATE workspace.task SET backlog_position=9007199254740993.125 WHERE task_id=$1",[seed.task_id]);const before=await state(p);
  const results=await queuedTogether(()=>[create(p,'First append',randomUUID(),tokens[0]),create(p,'Second append',randomUUID(),tokens[1])]);
  for(const r of results){assert.equal(r.error,undefined);assert.equal(r.value.statusCode,201,r.value.body);}
  const after=await state(p);assert.deepEqual(after.tasks.map(t=>t.position),['9007199254740993.125','9007199254740994.125','9007199254740995.125']);assert.equal(BigInt(after.generation),BigInt(before.generation)+2n);assert.equal(after.audits,'3');assert.equal(after.outcomes,'3');
 });
 await t.test('same actor/key queued together creates one outcome/task/audit; changed payload conflicts',async()=>{
  const p=await fresh(),before=await state(p),key=randomUUID(),results=await queuedTogether(()=>[create(p,'One identity',key),create(p,'One identity',key)]);
  for(const r of results)assert.equal(r.value.statusCode,201,r.value.body);assert.deepEqual(results[0].value.json(),results[1].value.json());
  const after=await state(p);assert.equal(after.tasks.length,1);assert.equal(after.audits,'1');assert.equal(after.outcomes,'1');assert.equal(BigInt(after.generation),BigInt(before.generation)+1n);assert.equal((await create(p,'Changed identity payload',key)).statusCode,409);
 });
 for(const action of ['revoke','remove'])await t.test('actual create decision first; queued '+action+' then blocks replay disclosure',async()=>{
  const p=await fresh(action==='remove'),gate=pauseTaskQuery(db.runtime,'INSERT INTO workspace.task'),tasks=new WorkspaceTaskStore(gate.pool,f.sessions,f.cursorKey),app=buildApp({store:f.sessions,projects,tasks,origin:'https://localhost'});await app.ready();
  try{const key=randomUUID(),creation=settled(create(p,'Create decision first',key,tokens[0],app));await reached(gate,creation);
   const change=settled(action==='revoke'?operator.project(a,p,'backlog-author',false,'1','synthetic','revoke after decision'):projects.remove(tokens[1],p,a,'1',randomUUID()));
   try{await taskBarrier(db.admin,action==='revoke'?'postgres':'workspace_app');}finally{gate.release();}
   assert.equal((await creation).value.statusCode,201);assert.equal((await change).error,undefined);assert.equal((await state(p)).tasks.length,1);
   const replay=await create(p,'Create decision first',key);assert.equal(replay.statusCode,action==='revoke'?403:404);assert(!replay.body.includes('Create decision first'));
  }finally{gate.release();await app.close();}
 });
 for(const action of ['revoke','remove'])await t.test('actual '+action+' decision first; queued create sees current denial and writes nothing',async()=>{
  const p=await fresh(action==='remove'),before=await state(p),gate=pauseTaskQuery(action==='revoke'?db.admin:db.runtime,action==='revoke'?'UPDATE workspace.capability_grant SET valid=false':'UPDATE workspace.membership SET active=false');
  const change=settled(action==='revoke'?new WorkspaceProjectOperator(gate.pool).project(a,p,'backlog-author',false,'1','synthetic','revoke first'):new WorkspaceProjectStore(gate.pool,f.sessions,f.cursorKey).remove(tokens[1],p,a,'1',randomUUID()));
  await reached(gate,change);const creation=settled(create(p,'Must not create'));
  try{await taskBarrier(db.admin,'workspace_app');}finally{gate.release();}
  assert.equal((await change).error,undefined);const result=(await creation).value;assert.equal(result.statusCode,action==='revoke'?403:404);assert.deepEqual(await state(p),before);
 });
 await t.test('a guarded page decision precedes queued append; next page rejects the old full-projection watermark',async()=>{
  const p=await fresh();await db.admin.query("INSERT INTO workspace.task(task_id,project_id,type,title,state,backlog_position,created_at) SELECT gen_random_uuid(),$1,'task','Synthetic page fixture','todo',n,'2026-11-02T00:00:00.123Z' FROM generate_series(1,51) n",[p]);const before=await state(p);
  const gate=pauseTaskQuery(db.runtime,'FROM workspace.task t WHERE t.project_id'),tasks=new WorkspaceTaskStore(gate.pool,f.sessions,f.cursorKey),app=buildApp({store:f.sessions,projects,tasks,origin:'https://localhost'});await app.ready();
  try{const page=settled(app.inject({url:`/projects/${p}/tasks?location=backlog`,headers:f.headers()}));await reached(gate,page);const append=settled(create(p,'Append after page'));
   try{await taskBarrier(db.admin,'workspace_app');}finally{gate.release();}
   const response=(await page).value;assert.equal(response.statusCode,200,response.body);assert.equal(response.json().items.length,50);assert.equal(response.json().backlog_revision,before.generation);assert.equal((await append).value.statusCode,201);
   const stale=await f.app.inject({url:`/projects/${p}/tasks?location=backlog&cursor=`+encodeURIComponent(response.json().next_cursor),headers:f.headers()});assert.equal(stale.statusCode,409);assert(!('items' in stale.json()));
  }finally{gate.release();await app.close();}
 });
 await t.test('one rollback producer alongside a successful append has no partial audit/outcome/generation; exact failed key can reconcile',async()=>{
  const p=await fresh(),before=await state(p),key=randomUUID();await db.admin.query("CREATE FUNCTION workspace.reject_concurrent_task() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='backlog-item-create' AND (SELECT title FROM workspace.task WHERE task_id=NEW.entity_id)='Rollback producer' THEN RAISE EXCEPTION 'synthetic-task-rollback'; END IF; RETURN NEW; END $$; CREATE TRIGGER reject_concurrent_task BEFORE INSERT ON workspace.business_audit FOR EACH ROW EXECUTE FUNCTION workspace.reject_concurrent_task()");
  try{const results=await queuedTogether(()=>[create(p,'Rollback producer',key),create(p,'Successful producer')]);assert.equal(results[0].value.statusCode,503);assert.equal(results[1].value.statusCode,201);const after=await state(p);assert.equal(after.tasks.length,1);assert.equal(after.tasks[0].position,'1');assert.equal(after.audits,'1');assert.equal(after.outcomes,'1');assert.equal(BigInt(after.generation),BigInt(before.generation)+1n);}finally{await db.admin.query('DROP TRIGGER reject_concurrent_task ON workspace.business_audit;DROP FUNCTION workspace.reject_concurrent_task()');}
  assert.equal((await create(p,'Rollback producer',key)).statusCode,201);assert.deepEqual((await state(p)).tasks.map(t=>t.position),['1','2']);
 });
 await t.test('actual account disable decision first; queued current session cannot create or replay its old result',async()=>{
  const p=await fresh(),c=f.ids[2],key=randomUUID();await projects.add(tokens[0],p,{user_id:c,role:'viewer'},randomUUID());await operator.project(c,p,'backlog-author',true,'0','synthetic','disabled-race author');assert.equal((await create(p,'Before account disable',key,tokens[2])).statusCode,201);const before=await state(p);
  const gate=pauseTaskQuery(db.admin,'UPDATE workspace.auth_account SET disabled=true'),disable=settled(new WorkspaceSessionOperator(gate.pool).disable(c,'synthetic-disable-first'));await reached(gate,disable);const pending=settled(create(p,'Must not create after disable',randomUUID(),tokens[2]));
  try{await taskBarrier(db.admin,'workspace_app');}finally{gate.release();}
  assert.equal((await disable).error,undefined);assert.equal((await pending).value.statusCode,401);const replay=await create(p,'Before account disable',key,tokens[2]);assert.equal(replay.statusCode,401);assert(!replay.body.includes('Before account disable'));assert.deepEqual(await state(p),before);
 });
 t.diagnostic('Decision boundary: actual owned PostgreSQL transaction/clock and Project guards. No source/socket exclusion, future SP-04/SP-06 handler or complete SC-06 claim.');
});
