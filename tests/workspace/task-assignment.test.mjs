import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {taskMutationFixture} from './task-mutation-fixture.mjs';
import {pauseTaskQuery,taskBarrier} from './task-fixture.mjs';
import {WorkspaceTaskStore} from '../../services/workspace/src/tasks/store.ts';
import {WorkspaceProjectStore} from '../../services/workspace/src/projects/store.ts';
import {buildApp} from '../../services/workspace/src/app.ts';
const settled=p=>p.then(value=>({value}),error=>({error}));
async function reached(g,p){await Promise.race([g.ready,p.then(()=>{throw Error('Producer ended before barrier');})]);}

test('SP04 actual assignment, current eligibility and removal races',{timeout:180000},async t=>{
 const f=await taskMutationFixture();t.after(()=>f.close());const {db,project,ids:[a,b,c],tokens,operator,projects}=f;
 await operator.project(a,project,'backlog-author',true,'0','synthetic-assign','fixture');
 await projects.add(tokens[0],project,{user_id:b,role:'viewer'},randomUUID());
 const fresh=async()=>{const r=await f.create();assert.equal(r.statusCode,201,r.body);return r.json();};
 const post=(id,input,k=randomUUID(),token=tokens[0],app=f.app)=>app.inject({method:'POST',url:`/tasks/${id}/assignee`,headers:{...f.headers(token),'idempotency-key':k},payload:input});
 const get=id=>f.tasks.get(tokens[0],id);
 const row=await fresh();
 await t.test('scope/action before target eligibility and strict shape',async()=>{
  assert.equal((await post(row.task_id,{assignee_id:randomUUID(),expected_revision:1})).statusCode,403);
  assert.equal((await post(row.task_id,{assignee_id:b,expected_revision:1},randomUUID(),tokens[2])).statusCode,404);
  await operator.project(a,project,'task-assign',true,'0','synthetic-assign','explicit');
  for(const body of [{expected_revision:1},{assignee_id:3,expected_revision:1},{assignee_id:'invalid',expected_revision:1},{assignee_id:null,expected_revision:0},{assignee_id:null,expected_revision:9007199254740992},{assignee_id:null,expected_revision:1,project_id:project}])assert.equal((await post(row.task_id,body)).statusCode,400);
  for(const target of [randomUUID(),c])assert.equal((await post(row.task_id,{assignee_id:target,expected_revision:1})).statusCode,400);
  await db.admin.query('UPDATE workspace.auth_account SET disabled=true WHERE user_id=$1',[b]);try{assert.equal((await post(row.task_id,{assignee_id:b,expected_revision:1})).statusCode,400);}finally{await db.admin.query('UPDATE workspace.auth_account SET disabled=false WHERE user_id=$1',[b]);}
  assert.deepEqual(await get(row.task_id),row);
 });
 let original,k;
 await t.test('enabled member/null assignment, no-op, exact historical replay and stale conflict',async()=>{
  k=randomUUID();const input={assignee_id:b,expected_revision:1},r=await post(row.task_id,input,k);assert.equal(r.statusCode,200,r.body);original=r.json();assert.equal(original.assignee_id,b);assert.equal(original.revision,2);
  assert.deepEqual((await post(row.task_id,{assignee_id:b,expected_revision:2})).json(),original);
  assert.equal((await post(row.task_id,{assignee_id:null,expected_revision:1})).statusCode,409);
  assert.equal((await post(row.task_id,{assignee_id:null,expected_revision:1},k)).statusCode,409);
  const unassign=await post(row.task_id,{assignee_id:null,expected_revision:2});assert.equal(unassign.statusCode,200);assert.equal(unassign.json().revision,3);assert.equal(unassign.json().assignee_id,null);
  assert.deepEqual((await post(row.task_id,input,k)).json(),original);
  const audits=(await db.admin.query("SELECT before_ref,after_ref FROM workspace.business_audit WHERE entity_id=$1 AND action='assignee-set' ORDER BY time",[row.task_id])).rows;assert.equal(audits.length,2);assert.equal(JSON.parse(audits[0].after_ref).assignee_id,b);
 });
 await t.test('update/audit/outcome failure rolls back with recoverable same key',async()=>{
  for(const table of ['task','business_audit','idempotency_record']){
   const row=await fresh(),k=randomUUID(),body={assignee_id:b,expected_revision:1};await db.admin.query(`CREATE FUNCTION workspace.reject_assign() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic-private'; END $$; CREATE TRIGGER reject_assign BEFORE ${table==='task'?'UPDATE':'INSERT'} ON workspace.${table} FOR EACH ROW EXECUTE FUNCTION workspace.reject_assign()`);
   try{const r=await post(row.task_id,body,k);assert.equal(r.statusCode,503,r.body);assert(!r.body.includes('private'));assert.deepEqual(await get(row.task_id),row);}finally{await db.admin.query(`DROP TRIGGER reject_assign ON workspace.${table}; DROP FUNCTION workspace.reject_assign()`);}
   assert.equal((await post(row.task_id,body,k)).statusCode,200);
  }
 });
 await t.test('assign-first actual SQL schedule then removal clears assignment and replay never restores it',async()=>{
  const row=await fresh(),gate=pauseTaskQuery(db.runtime,'UPDATE workspace.task SET assignee_id=$2'),tasks=new WorkspaceTaskStore(gate.pool,f.sessions,f.cursorKey),app=buildApp({store:f.sessions,projects,tasks,origin:'https://localhost'});await app.ready();
  const k=randomUUID(),body={assignee_id:b,expected_revision:1},pending=settled(post(row.task_id,body,k,tokens[0],app));await reached(gate,pending);const removal=settled(projects.remove(tokens[0],project,b,'1',randomUUID()));
  try{await taskBarrier(db.admin,'workspace_app');}finally{gate.release();}
  try{assert.equal((await pending).value.statusCode,200);assert(!(await removal).error);const current=await get(row.task_id);assert.equal(current.assignee_id,null);assert.equal(current.revision,3);const replay=await post(row.task_id,body,k);assert.equal(replay.statusCode,200,replay.body);assert.equal(replay.json().assignee_id,b);assert.deepEqual(await get(row.task_id),current);}finally{await app.close();}
  assert.deepEqual((await post(original.task_id,{assignee_id:b,expected_revision:1},k)).statusCode,409);
 });
 await t.test('remove-first actual producer blocks assignment; rejoin restores no current assignment',async()=>{
  await projects.add(tokens[0],project,{user_id:b,role:'viewer'},randomUUID());const member=(await db.admin.query('SELECT revision::text r FROM workspace.membership WHERE project_id=$1 AND user_id=$2',[project,b])).rows[0];
  const row=await fresh(),gate=pauseTaskQuery(db.runtime,'UPDATE workspace.membership SET active=false'),p=new WorkspaceProjectStore(gate.pool,f.sessions,f.cursorKey),removal=settled(p.remove(tokens[0],project,b,member.r,randomUUID()));await reached(gate,removal);
  const assignment=settled(post(row.task_id,{assignee_id:b,expected_revision:1}));try{await taskBarrier(db.admin,'workspace_app');}finally{gate.release();}assert(!(await removal).error);assert.equal((await assignment).value.statusCode,400);assert.deepEqual(await get(row.task_id),row);
  await projects.add(tokens[0],project,{user_id:b,role:'viewer'},randomUUID());assert.equal((await get(row.task_id)).assignee_id,null);
 });
 await t.test('concurrent assignments and duplicate keys; overflow and authority revocation',async()=>{
  const row=await fresh(),k=randomUUID(),input={assignee_id:b,expected_revision:1};const responses=await Promise.all([post(row.task_id,input,k),post(row.task_id,input,k)]);assert.deepEqual(responses.map(r=>r.statusCode),[200,200]);assert.deepEqual(responses[0].json(),responses[1].json());
  const r=await fresh();const competing=await Promise.all([post(r.task_id,{assignee_id:a,expected_revision:1}),post(r.task_id,{assignee_id:b,expected_revision:1})]);assert.deepEqual(competing.map(r=>r.statusCode).sort(),[200,409]);
  await db.admin.query('UPDATE workspace.task SET revision=9007199254740991 WHERE task_id=$1',[r.task_id]);assert.equal((await post(r.task_id,{assignee_id:null,expected_revision:9007199254740991})).statusCode,409);
  await operator.project(a,project,'task-assign',false,'1','synthetic-assign','revoke');assert.equal((await post(row.task_id,input,k)).statusCode,403);await operator.project(a,project,'task-assign',true,'2','synthetic-assign','restore');
 });
 await t.test('post-lock session expiry rejects new assignment',async()=>{
  const row=await fresh(),gate=pauseTaskQuery(db.runtime,'FOR UPDATE OF t'),tasks=new WorkspaceTaskStore(gate.pool,f.sessions,f.cursorKey),app=buildApp({store:f.sessions,projects,tasks,origin:'https://localhost'});await app.ready();
  await db.admin.query("UPDATE workspace.session SET expires_at=clock_timestamp()+interval '250 milliseconds' WHERE user_id=$1",[a]);const pending=post(row.task_id,{assignee_id:b,expected_revision:1},randomUUID(),tokens[0],app);await gate.ready;await new Promise(r=>setTimeout(r,400));gate.release();try{assert.equal((await pending).statusCode,401);assert.equal((await db.admin.query('SELECT assignee_id FROM workspace.task WHERE task_id=$1',[row.task_id])).rows[0].assignee_id,null);}finally{await app.close();}
 });
});
