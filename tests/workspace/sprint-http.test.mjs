import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {sprintFixture,enableSprint,sprintActions} from './sprint-fixture.mjs';
const body=(r,status=200)=>{assert.equal(r.statusCode,status,r.body);return r.json();};
test('SP05 actual011 private authority, lifecycle, full reorder and original outcomes',{timeout:240000},async t=>{
 const f=await sprintFixture();t.after(()=>f.close());const {db,project,ids:[a,b,c],tokens,operator,projects,call}=f;
 const prefix='/projects/'+project,createPath=prefix+'/sprints';
 await projects.add(tokens[0],project,{user_id:b,role:'scrum_master'},randomUUID());
 const counts=async()=>({sprint:(await db.admin.query('SELECT * FROM workspace.sprint ORDER BY sprint_id')).rows,task:(await db.admin.query('SELECT * FROM workspace.task ORDER BY task_id')).rows,allocation:(await db.admin.query('SELECT * FROM workspace.sprint_allocation ORDER BY sprint_id,task_id')).rows,audit:(await db.admin.query('SELECT * FROM workspace.business_audit ORDER BY event_id')).rows,receipt:(await db.admin.query('SELECT * FROM workspace.idempotency_record ORDER BY actor_id,operation,idempotency_key')).rows});
 await t.test('creator/role labels grant none; private audit failure rolls back and runtime cannot grant',async()=>{
  assert.equal((await f.sprint()).statusCode,403);assert.equal((await call(createPath,{goal:'No implicit manager',start_date:'2026-11-01',end_date:'2026-11-15'},'POST',randomUUID(),tokens[1])).statusCode,403);
  await db.admin.query("CREATE FUNCTION workspace.reject_sprint_grant() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic-private-grant'; END $$; CREATE TRIGGER reject_sprint_grant BEFORE INSERT ON workspace.authority_provisioning_audit FOR EACH ROW EXECUTE FUNCTION workspace.reject_sprint_grant()");
  try{await assert.rejects(operator.project(a,project,'sprint-create',true,'0','synthetic','explicit'));assert.equal((await db.admin.query("SELECT count(*)::int n FROM workspace.capability_grant WHERE action='sprint-create'")).rows[0].n,0);}finally{await db.admin.query('DROP TRIGGER reject_sprint_grant ON workspace.authority_provisioning_audit; DROP FUNCTION workspace.reject_sprint_grant()');}
  for(const action of sprintActions)await assert.rejects(db.runtime.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action) VALUES($1,$2,$3,'project',$3,$4)",[randomUUID(),b,project,action]));
 });
 await enableSprint(f);
 await t.test('invalid date/goal/body/media/CSRF and foreign scopes leave no business state',async()=>{
  const before=await counts();for(const payload of [{goal:' ',start_date:'2026-11-01',end_date:'2026-11-15'},{goal:'X',start_date:'2026-02-30',end_date:'2026-11-15'},{goal:'X',start_date:'2026-11-15',end_date:'2026-11-01'},{goal:'X',start_date:'2026-11-01',end_date:'2026-11-15',actor_id:b},null,[]])assert.equal((await call(createPath,payload)).statusCode,400);
  assert.equal((await call(createPath,{goal:'x'.repeat(9000),start_date:'2026-11-01',end_date:'2026-11-15'})).statusCode,413);
  assert.equal((await f.app.inject({method:'POST',url:createPath,headers:{...f.headers(),'content-type':'text/plain'},payload:'not json'})).statusCode,415);
  assert.equal((await f.app.inject({method:'POST',url:createPath,headers:{...f.headers(),origin:'https://foreign.invalid'},payload:{}})).statusCode,403);
  const denied=await call(createPath,{goal:'Hidden',start_date:'2026-11-01',end_date:'2026-11-15'},'POST',randomUUID(),tokens[2]);assert.equal(denied.statusCode,404);assert.deepEqual(denied.json(),{code:'not_found',message:'Resource unavailable'});assert.deepEqual(await counts(),before);
 });
 let first,firstKey;
 await t.test('create/read keeps server timestamps; actor/key/hash, revoke and changed payload are enforced',async()=>{
  firstKey=randomUUID();first=body(await f.sprint('Exact goal',firstKey),201);assert.equal(first.state,'planned');assert(first.created_at);assert.equal(first.started_at,null);assert.equal(first.completed_at,null);
  assert.deepEqual(body(await f.sprint('Exact goal',firstKey),201),first);assert.equal((await f.sprint('Changed goal',firstKey)).statusCode,409);
  await operator.project(a,project,'sprint-create',false,'1','synthetic','revoke');assert.equal((await f.sprint('Exact goal',firstKey)).statusCode,403);await operator.project(a,project,'sprint-create',true,'2','synthetic','restore');
  assert.deepEqual(body(await call('/sprints/'+first.sprint_id,undefined,'GET')),first);
  const ops=body(await call('/access/allowed-actions?resource_kind=sprint&project_id='+project+'&resource_id='+first.sprint_id,undefined,'GET')).allowed_operations;assert(ops.includes('startSprint'));assert(!ops.includes('completeSprint'));assert(!ops.includes('editSprint'));
 });
 let done,unfinished,started,completed,completeKey;
 await t.test('single Task allocation changes location and Sprint revision, rejects competing allocation and stale request',async()=>{
  done=body(await f.create(),201);unfinished=body(await f.create(),201);
  const assigned=body(await call('/sprints/'+first.sprint_id+'/items',{task_id:done.task_id,expected_revision:1}));assert.equal(assigned.revision,2);first=assigned;
  first=body(await call('/sprints/'+first.sprint_id+'/items',{task_id:unfinished.task_id,expected_revision:2}));
  assert.equal((await call('/sprints/'+first.sprint_id+'/items',{task_id:done.task_id,expected_revision:3})).statusCode,409);
  const other=body(await f.sprint(),201);assert.equal((await call('/sprints/'+other.sprint_id+'/items',{task_id:done.task_id,expected_revision:1})).statusCode,409);
  assert.equal((await call('/sprints/'+other.sprint_id+'/items',{task_id:randomUUID(),expected_revision:1})).statusCode,404);
  const task=await f.tasks.get(tokens[0],done.task_id);assert.equal(task.work_location.kind,'sprint');assert.equal(task.revision,2);
 });
 await t.test('actual Planned start and mixed completion co-commit state/history/counts; replay does not recompute',async()=>{
  started=body(await call('/sprints/'+first.sprint_id+'/start',{expected_revision:first.revision}));assert.equal(started.state,'active');assert(started.started_at);
  const competing=body(await f.sprint(),201);assert.equal((await call('/sprints/'+competing.sprint_id+'/start',{expected_revision:1})).statusCode,409);
  let current=await f.tasks.get(tokens[0],done.task_id);body(await call('/tasks/'+done.task_id+'/state',{state:'done',expected_revision:current.revision}));current=await f.tasks.get(tokens[0],unfinished.task_id);body(await call('/tasks/'+unfinished.task_id+'/state',{state:'in_progress',expected_revision:current.revision}));
  completeKey=randomUUID();completed=body(await call('/sprints/'+first.sprint_id+'/complete',{expected_revision:started.revision},'POST',completeKey));assert.equal(completed.retained_done_count,1);assert.equal(completed.returned_unfinished_count,1);assert(completed.sprint.completed_at);
  assert.equal((await f.tasks.get(tokens[0],done.task_id)).work_location.kind,'completed');const returned=await f.tasks.get(tokens[0],unfinished.task_id);assert.equal(returned.state,'todo');assert.equal(returned.work_location.kind,'backlog');assert.equal(returned.revision,4);
  const history=body(await call('/sprints/'+first.sprint_id+'/items',undefined,'GET')).items;assert.deepEqual(history.map(x=>x.allocation_state).sort(),['completed','returned']);
  assert.deepEqual(body(await call('/sprints/'+first.sprint_id+'/complete',{expected_revision:started.revision},'POST',completeKey)),completed);
  assert.equal((await call('/sprints/'+first.sprint_id+'/start',{expected_revision:completed.sprint.revision})).statusCode,409);
 });
 await t.test('real completed reopen then real later allocation retains old association and completion counts',async()=>{
  const old=(await db.admin.query('SELECT * FROM workspace.sprint_allocation WHERE task_id=$1 AND sprint_id=$2',[done.task_id,first.sprint_id])).rows;
  const current=await f.tasks.get(tokens[0],done.task_id);const reopened=body(await call('/tasks/'+done.task_id+'/state',{state:'in_progress',expected_revision:current.revision}));assert.equal(reopened.state,'todo');assert.equal(reopened.work_location.kind,'backlog');
  const later=body(await f.sprint(),201);body(await call('/sprints/'+later.sprint_id+'/items',{task_id:done.task_id,expected_revision:1}));
  assert.deepEqual((await db.admin.query('SELECT * FROM workspace.sprint_allocation WHERE task_id=$1 AND sprint_id=$2',[done.task_id,first.sprint_id])).rows,old);assert.deepEqual(body(await call('/sprints/'+first.sprint_id+'/complete',{expected_revision:started.revision},'POST',completeKey)),completed);
  const historical=body(await call('/sprints/'+first.sprint_id+'/items',undefined,'GET')).items.find(x=>x.task.task_id===done.task_id);assert.equal(historical.allocation_state,'completed');assert.equal(historical.task.work_location.sprint_id,later.sprint_id);
 });
 await t.test('empty Sprint starts/completes with zero counts and typed originals cannot be changed/deleted',async()=>{
  const empty=body(await f.sprint(),201),active=body(await call('/sprints/'+empty.sprint_id+'/start',{expected_revision:1}));const end=body(await call('/sprints/'+empty.sprint_id+'/complete',{expected_revision:active.revision}));assert.equal(end.retained_done_count,0);assert.equal(end.returned_unfinished_count,0);
  await assert.rejects(db.runtime.query("DELETE FROM workspace.idempotency_record WHERE actor_id=$1 AND operation='completeSprint' AND idempotency_key=$2",[a,completeKey]));
  await db.admin.query('BEGIN');try{await db.admin.query('SET LOCAL ROLE workspace_owner');const {readFile}=await import('node:fs/promises');await assert.rejects(db.admin.query(await readFile('services/workspace/migrations/011-sprint-lifecycle.down.sql','utf8')),/retained|reconciliation/);}finally{await db.admin.query('ROLLBACK');}
 });
 await t.test('reorder is exact full permutation, no-op does not audit/revise, originals survive later changes',async()=>{
  for(let i=0;i<3;i++)body(await f.create({type:'task',title:'Order '+i}),201);
  await db.admin.query("UPDATE workspace.task SET backlog_position=(backlog_position::text||'.00')::numeric WHERE project_id=$1 AND location_kind='backlog'",[project]);
  const list=body(await call(prefix+'/tasks?location=backlog',undefined,'GET'));const ids=list.items.map(x=>x.task_id),input={task_ids:[ids[1],ids[0],...ids.slice(2)],expected_revision:list.backlog_revision},key=randomUUID();const before=await counts();
  assert.equal((await call(prefix+'/backlog-order',{...input,task_ids:ids.slice(1)})).statusCode,409);assert.equal((await call(prefix+'/backlog-order',{...input,task_ids:[ids[0],ids[0]]})).statusCode,400);assert.deepEqual(await counts(),before);
  const receipt=body(await call(prefix+'/backlog-order',input,'POST',key)),after=body(await call(prefix+'/tasks?location=backlog',undefined,'GET'));assert.deepEqual(after.items.map(x=>x.task_id),input.task_ids);for(const id of ids.slice(2))assert.equal(String(after.items.find(t=>t.task_id===id).revision),before.task.find(t=>t.task_id===id).revision,'unchanged numeric positions keep their revision');
  const snapshot=await counts();body(await call(prefix+'/backlog-order',{task_ids:input.task_ids,expected_revision:after.backlog_revision}));const noChange=await counts();assert.deepEqual(noChange.task,snapshot.task);assert.deepEqual(noChange.audit,snapshot.audit);
  body(await f.create(),201);assert.deepEqual(body(await call(prefix+'/backlog-order',input,'POST',key)),receipt);assert.equal((await call(prefix+'/backlog-order',{...input,task_ids:ids},'POST',key)).statusCode,409);
 });
 await t.test('Sprint pages invalidate on actual updates; foreign/tampered cursors and removed members disclose no items',async()=>{
  for(let i=0;i<51;i++)body(await f.sprint('Paged '+i),201);
  const page=body(await call(createPath,undefined,'GET'));assert.equal(page.items.length,50);assert(page.next_cursor);const path=createPath+'?cursor='+encodeURIComponent(page.next_cursor);assert.equal((await call(path,undefined,'GET')).statusCode,200);
  assert.equal((await call(path,undefined,'GET',randomUUID(),tokens[1])).statusCode,400);assert.equal((await call(createPath+'?cursor=bad',undefined,'GET')).statusCode,400);
  body(await f.sprint(),201);const stale=await call(path,undefined,'GET');assert.equal(stale.statusCode,409);assert(!('items' in stale.json()));
  await operator.project(b,project,'sprint-create',true,'0','synthetic','member grant');await projects.remove(tokens[0],project,b,'1',randomUUID());assert.equal((await call(createPath,undefined,'GET',randomUUID(),tokens[1])).statusCode,404);await projects.add(tokens[0],project,{user_id:b,role:'scrum_master'},randomUUID());assert.equal((await call(createPath,{goal:'No restored right',start_date:'2026-11-01',end_date:'2026-11-15'},'POST',randomUUID(),tokens[1])).statusCode,403);
 });
});
