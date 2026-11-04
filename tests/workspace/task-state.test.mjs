import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {taskMutationFixture} from './task-mutation-fixture.mjs';
import {pauseTaskQuery} from './task-fixture.mjs';
import {WorkspaceTaskStore} from '../../services/workspace/src/tasks/store.ts';
import {buildApp} from '../../services/workspace/src/app.ts';

test('SP04 state handler and completed placement persistence',{timeout:180000},async t=>{
 const f=await taskMutationFixture();t.after(()=>f.close());const {db,project,ids:[a],tokens,operator}=f;
 await operator.project(a,project,'backlog-author',true,'0','synthetic-state','fixture');
 const fresh=async()=>{const r=await f.create();assert.equal(r.statusCode,201,r.body);return r.json();};
 const post=(id,input,key=randomUUID(),token=tokens[0],app=f.app)=>app.inject({method:'POST',url:`/tasks/${id}/state`,headers:{...f.headers(token),'idempotency-key':key},payload:input});
 const get=id=>f.tasks.get(tokens[0],id);
 const task=await fresh();
 await t.test('explicit authority, concealed foreign targets and strict request validation',async()=>{
  assert.equal((await post(task.task_id,{state:'done',expected_revision:1})).statusCode,403);
  const denied=await post(task.task_id,{state:'done',expected_revision:1},randomUUID(),tokens[2]);assert.equal(denied.statusCode,404);assert.deepEqual(denied.json(),{code:'not_found',message:'Resource unavailable'});
  assert.equal((await post(task.task_id,{state:'done',expected_revision:1},randomUUID(),'forged')).statusCode,401);
  await operator.project(a,project,'task-state',true,'0','synthetic-state','explicit state');
  for(const input of [{state:'review',expected_revision:1},{state:'done',expected_revision:0},{state:'done',expected_revision:9007199254740992},{state:'done',expected_revision:1,actor_id:a},{expected_revision:1},null])assert.equal((await post(task.task_id,input)).statusCode,400);
  assert.deepEqual(await get(task.task_id),task);
 });
 await t.test('all direct transitions and no-ops; stale and changed-input retries preserve state',async()=>{
  for(const from of ['todo','in_progress','done'])for(const to of ['todo','in_progress','done']){
   const freshTask=await fresh();let current=freshTask;if(from!=='todo')current=(await post(current.task_id,{state:from,expected_revision:1})).json();
   const key=randomUUID(),input={state:to,expected_revision:current.revision};const r=await post(current.task_id,input,key);assert.equal(r.statusCode,200,r.body);const body=r.json();assert.equal(body.state,to);assert.equal(body.revision,current.revision+(from===to?0:1));
   assert.deepEqual(await get(body.task_id),body);assert.deepEqual((await post(body.task_id,input,key)).json(),body);
   assert.equal((await post(body.task_id,{...input,state:to==='done'?'todo':'done'},key)).statusCode,409);
   const n=(await db.admin.query("SELECT count(*) n FROM workspace.business_audit WHERE entity_id=$1 AND action='board-state-change'",[body.task_id])).rows[0].n;assert.equal(Number(n),(from==='todo'?0:1)+(from===to?0:1));
   if(body.revision>1)assert.equal((await post(body.task_id,{state:'done',expected_revision:body.revision-1})).statusCode,409);
  }
 });
 await t.test('both completed reopen targets normalize atomically, append exact numeric position and preserve allocation',async()=>{
  // Physical committed fixture only: no SP-05 completeSprint/allocateTask handler is claimed.
  for(const target of ['todo','in_progress']){
   const row=await fresh(),sprint=randomUUID();await db.admin.query('BEGIN');
   try{await db.admin.query("INSERT INTO workspace.sprint(sprint_id,project_id,goal,start_date,end_date,state) VALUES($1,$2,'Synthetic completed','2026-01-01','2026-01-15','completed')",[sprint,project]);await db.admin.query("INSERT INTO workspace.sprint_allocation(project_id,sprint_id,task_id,allocation_state) VALUES($1,$2,$3,'completed')",[project,sprint,row.task_id]);await db.admin.query("UPDATE workspace.task SET state='done',location_kind='completed',location_sprint_id=$2 WHERE task_id=$1",[row.task_id,sprint]);await db.admin.query('COMMIT');}catch(e){await db.admin.query('ROLLBACK');throw e;}
   const history=(await db.admin.query('SELECT * FROM workspace.sprint_allocation WHERE task_id=$1',[row.task_id])).rows;
   const before=(await db.admin.query("SELECT (coalesce(max(backlog_position),0)+1)::text position,(SELECT backlog_revision::text FROM workspace.project WHERE project_id=$1) generation FROM workspace.task WHERE project_id=$1 AND location_kind='backlog'",[project])).rows[0];
   const k=randomUUID(),input={state:target,expected_revision:1},r=await post(row.task_id,input,k);assert.equal(r.statusCode,200,r.body);assert.equal(r.json().state,'todo');assert.deepEqual(r.json().work_location,{kind:'backlog',position:before.position});assert.equal(r.json().revision,2);
   assert.equal((await db.admin.query('SELECT backlog_revision::text n FROM workspace.project WHERE project_id=$1',[project])).rows[0].n,(BigInt(before.generation)+1n).toString());
   assert.deepEqual((await db.admin.query('SELECT * FROM workspace.sprint_allocation WHERE task_id=$1',[row.task_id])).rows,history);assert.equal((await db.admin.query('SELECT state FROM workspace.sprint WHERE sprint_id=$1',[sprint])).rows[0].state,'completed');
   assert.deepEqual((await post(row.task_id,input,k)).json(),r.json());
  }
 });
 await t.test('audit/outcome/update faults roll back and original-key retries recover; overflow rejects change',async()=>{
  for(const table of ['task','business_audit','idempotency_record']){
   const row=await fresh(),k=randomUUID(),input={state:'done',expected_revision:1};
   await db.admin.query(`CREATE FUNCTION workspace.reject_state() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic-private-state'; END $$; CREATE TRIGGER reject_state BEFORE ${table==='task'?'UPDATE':'INSERT'} ON workspace.${table} FOR EACH ROW EXECUTE FUNCTION workspace.reject_state()`);
   try{const r=await post(row.task_id,input,k);assert.equal(r.statusCode,503,r.body);assert(!r.body.includes('private'));assert.deepEqual(await get(row.task_id),row);}finally{await db.admin.query(`DROP TRIGGER reject_state ON workspace.${table}; DROP FUNCTION workspace.reject_state()`);}
   assert.equal((await post(row.task_id,input,k)).statusCode,200);
  }
  const row=await fresh();await db.admin.query('UPDATE workspace.task SET revision=9007199254740991 WHERE task_id=$1',[row.task_id]);assert.equal((await post(row.task_id,{state:'todo',expected_revision:9007199254740991})).statusCode,200);assert.equal((await post(row.task_id,{state:'done',expected_revision:9007199254740991})).statusCode,409);
 });
 await t.test('concurrent revision writes have one winner; duplicate requests commit once; revoked replay denies',async()=>{
  const row=await fresh(),responses=await Promise.all(['done','in_progress'].map(state=>post(row.task_id,{state,expected_revision:1})));assert.deepEqual(responses.map(r=>r.statusCode).sort(),[200,409]);
  const other=await fresh(),k=randomUUID(),input={state:'done',expected_revision:1};const rs=await Promise.all([post(other.task_id,input,k),post(other.task_id,input,k)]);assert.deepEqual(rs.map(r=>r.statusCode),[200,200]);assert.deepEqual(rs[0].json(),rs[1].json());
  await operator.project(a,project,'task-state',false,'1','synthetic-state','revoke');assert.equal((await post(other.task_id,input,k)).statusCode,403);await operator.project(a,project,'task-state',true,'2','synthetic-state','restore');
 });
 await t.test('session expiry after actual Task lock withholds mutation',async()=>{
  const row=await fresh(),gate=pauseTaskQuery(db.runtime,'FOR UPDATE OF t'),tasks=new WorkspaceTaskStore(gate.pool,f.sessions,f.cursorKey),app=buildApp({store:f.sessions,projects:f.projects,tasks,origin:'https://localhost'});await app.ready();
  await db.admin.query("UPDATE workspace.session SET expires_at=clock_timestamp()+interval '250 milliseconds' WHERE user_id=$1",[a]);const pending=post(row.task_id,{state:'done',expected_revision:1},randomUUID(),tokens[0],app);
  await gate.ready;await new Promise(r=>setTimeout(r,400));gate.release();try{assert.equal((await pending).statusCode,401);assert.equal((await db.admin.query('SELECT state FROM workspace.task WHERE task_id=$1',[row.task_id])).rows[0].state,'todo');}finally{await app.close();}
 });
});
