import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {taskFixture} from './task-fixture.mjs';
import {ownedTransaction} from '../../services/workspace/src/session/database.ts';
import {WorkspaceTaskStore} from '../../services/workspace/src/tasks/store.ts';
import {buildApp} from '../../services/workspace/src/app.ts';

const id=n=>'00000000-0000-0000-0000-'+n.toString(16).padStart(12,'0');
test('P05 real scoped Task reconstruction and actor/projection-bound numeric paging',{timeout:180000},async t=>{
 const f=await taskFixture(),{db,project,ids:[a,b,c],tokens,projects}=f;t.after(()=>f.close());
 await projects.add(tokens[0],project,{user_id:b,role:'viewer'},randomUUID());
 const get=(url,token=tokens[0],app=f.app)=>app.inject({url,headers:f.headers(token)}),base=`/projects/${project}/tasks`;
 const rows=[...Array.from({length:60},(_,i)=>({task_id:id(1000-i),position:'2'})),...Array.from({length:44},(_,i)=>({task_id:id(44-i),position:'10'})),{task_id:id(5000),position:'9007199254740993.125'}];
 await db.admin.query("INSERT INTO workspace.task(task_id,project_id,type,title,description,state,created_at,backlog_position,location_kind) SELECT x.task_id,$1,'task','Synthetic read task','',CASE WHEN x.task_id=$3 THEN 'done' ELSE 'todo' END,'2026-11-02T00:00:00.123Z',x.position,'backlog' FROM jsonb_to_recordset($2::jsonb) AS x(task_id uuid,position numeric)",[project,JSON.stringify(rows),rows[0].task_id]);
 const sprint=id(6000),completed=id(6001),sprintTask=id(6002),completedTask=id(6003);
 await ownedTransaction(db.admin,'operator',async sql=>{
  await sql.query('SELECT project_id FROM workspace.project WHERE project_id=$1 FOR UPDATE',[project]);
  for(const [s,task,state,allocation] of [[sprint,sprintTask,'planned','allocated'],[completed,completedTask,'completed','completed']]){
   await sql.query("INSERT INTO workspace.sprint(sprint_id,project_id,goal,start_date,end_date,state) VALUES($1,$2,'Synthetic read fixture','2026-11-01','2026-11-03',$3)",[s,project,state]);
   await sql.query("INSERT INTO workspace.task(task_id,project_id,type,title,state,created_at,location_kind,location_sprint_id) VALUES($1,$2,'task','Synthetic Sprint fixture',$3,'2026-11-02T00:00:00.123Z',$4,$5)",[task,project,state==='completed'?'done':'todo',state==='completed'?'completed':'sprint',s]);
   await sql.query('INSERT INTO workspace.sprint_allocation(project_id,sprint_id,task_id,allocation_state) VALUES($1,$2,$3,$4)',[project,s,task,allocation]);
  }
 });
 const blocked=rows[0].task_id;
 for(const [sequence,status] of [[20,'open'],[10,'resolved']])await db.admin.query("INSERT INTO workspace.blocker_event(event_id,task_id,status,description,actor_id,sequence) VALUES($1,$2,$3,'Synthetic blocker',$4,$5)",[randomUUID(),blocked,status,a,sequence]);
 const revision=async()=> (await db.admin.query('SELECT backlog_revision::text n FROM workspace.project WHERE project_id=$1',[project])).rows[0].n;
 async function pages(location,token=tokens[0]){let cursor,items=[],generation;do{const response=await get(base+'?location='+location+(cursor?'&cursor='+encodeURIComponent(cursor):''),token);assert.equal(response.statusCode,200,response.body);const body=response.json();assert(body.items.length<=50);if(generation!==undefined)assert.equal(body.backlog_revision,generation);generation=body.backlog_revision;items.push(...body.items);cursor=body.next_cursor;assert(items.length<=107);}while(cursor);return {items,generation};}
 await t.test('fresh detail exposes immutable creation time, current location and highest committed blocker sequence',async()=>{
  const r=await get('/tasks/'+blocked,tokens[1]);assert.equal(r.statusCode,200,r.body);const task=r.json();assert.equal(task.blocked,true);assert.equal(task.state,'done');assert.equal(task.created_at,'2026-11-02T00:00:00.123Z');assert.deepEqual(task.work_location,{kind:'backlog',position:'2'});assert.equal(r.headers['cache-control'],'no-store');assert(!('created_by' in task));
  assert.deepEqual((await get('/tasks/'+sprintTask)).json().work_location,{kind:'sprint',sprint_id:sprint});assert.deepEqual((await get('/tasks/'+completedTask)).json().work_location,{kind:'completed',sprint_id:completed});
 });
 await t.test('50-item pages preserve numeric position then UUID across descending IDs/equal positions, and all uses UUID order',async()=>{
  const backlog=await pages('backlog',tokens[1]),all=await pages('all');
  const expected=[...rows.slice(0,60).map(r=>r.task_id).sort(),...rows.slice(60,104).map(r=>r.task_id).sort(),rows[104].task_id];
  assert.deepEqual(backlog.items.map(t=>t.task_id),expected);assert.equal(new Set(expected).size,105);assert(backlog.items.some(t=>t.state==='done'));
  assert.equal(backlog.items.at(-1).work_location.position,'9007199254740993.125');assert.equal(backlog.generation,await revision());
  assert.deepEqual(all.items.map(t=>t.task_id),[...expected,sprintTask,completedTask].sort());assert.equal(all.items.length,107);
  const implicit=(await get(base)).json(),explicit=(await get(base+'?location=all')).json();
  assert.deepEqual(implicit.items,explicit.items);assert.equal(implicit.backlog_revision,explicit.backlog_revision);
  // Each cursor has its own issuance deadline; both selectors still bind to the same all-task scope.
  assert.equal((await get(base+'?location=all&cursor='+encodeURIComponent(implicit.next_cursor))).statusCode,200);
  const actions=(await get('/access/allowed-actions?resource_kind=project&project_id='+project,tokens[1])).json().allowed_operations;assert(actions.includes('listTasks'));assert(!actions.includes('createTask'));
 });
 await t.test('unknown/foreign/nonmember reads share generic 404 and invalid selectors cannot assert scope',async()=>{
  for(const url of ['/tasks/'+blocked,'/tasks/'+randomUUID(),'/tasks/not-uuid',base,'/projects/'+randomUUID()+'/tasks']){const r=await get(url,tokens[2]);assert.equal(r.statusCode,404);assert.deepEqual(r.json(),{code:'not_found',message:'Resource unavailable'});}
  for(const query of ['actor_id='+a,'limit=10','location=sprint','location=all&location=backlog','cursor=','cursor=x&cursor=y'])assert.equal((await get(base+'?'+query)).statusCode,400);
  assert.equal((await get('/tasks/'+blocked+'?project_id='+project)).statusCode,400);assert.equal((await get(base,'forged')).statusCode,401);
 });
 await t.test('cursor binds actor/filter and current projection while same-actor relogin remains valid',async()=>{
  const cursor=(await get(base+'?location=backlog')).json().next_cursor;
  const url=base+'?location=backlog&cursor='+encodeURIComponent(cursor);
  assert.equal((await get(url,tokens[1])).statusCode,400);assert.equal((await get(base+'?location=all&cursor='+encodeURIComponent(cursor))).statusCode,400);
  const newSession=await f.sessions.establish(a,'1');assert.equal((await get(url,newSession.token)).statusCode,200);
  assert.equal((await get(url+'x')).statusCode,400);
  const before=await revision();await db.admin.query("UPDATE workspace.task SET title='Changed current title',revision=revision+1 WHERE task_id=$1",[blocked]);
  const stale=await get(url);assert.equal(stale.statusCode,409);assert(!('items' in stale.json()));assert.equal(await revision(),before);assert.equal((await get('/tasks/'+blocked)).json().title,'Changed current title');
 });
 await t.test('highest blocker changes invalidate projection without advancing Backlog set/order generation',async()=>{
  const cursor=(await get(base)).json().next_cursor,before=await revision();
  await db.admin.query("INSERT INTO workspace.blocker_event(event_id,task_id,status,description,actor_id,sequence) VALUES($1,$2,'resolved','Synthetic resolution',$3,30)",[randomUUID(),blocked,a]);
  assert.equal((await get('/tasks/'+blocked)).json().blocked,false);assert.equal(await revision(),before);const stale=await get(base+'?cursor='+encodeURIComponent(cursor));assert.equal(stale.statusCode,409);assert(!('items' in stale.json()));
 });
 await t.test('verified expired or absent bookmark returns conflict without a partial page, never an implicit restart',async()=>{
  const cursor=(await get(base)).json().next_cursor,payload=JSON.parse(Buffer.from(cursor.split('.')[0],'base64url').toString()),codec=f.tasks.projects.cursor;
  for(const token of [codec.encode(payload[2],payload[3],payload[4],Date.now()-301000),codec.encode(payload[2],payload[3],randomUUID(),Date.now())]){const r=await get(base+'?cursor='+encodeURIComponent(token));assert.equal(r.statusCode,409);assert(!('items' in r.json()));}
 });
 await t.test('missing/rotated key or database faults fail closed; detail still needs no cursor key',async()=>{
  const cursor=(await get(base)).json().next_cursor;
  for(const key of [null,{kid:'rotated',key:Buffer.alloc(32,52)}]){
   const tasks=new WorkspaceTaskStore(db.runtime,f.sessions,key),app=buildApp({store:f.sessions,projects,tasks,origin:'https://localhost'});await app.ready();
   try{const r=await get(base+'?cursor='+encodeURIComponent(cursor),tokens[0],app);assert.equal(r.statusCode,key===null?503:400);assert(!('items' in r.json()));assert.equal((await get('/tasks/'+blocked,tokens[0],app)).statusCode,200);}finally{await app.close();}
  }
  const connect=db.runtime.connect.bind(db.runtime);db.runtime.connect=async()=>{throw Error('synthetic-private-DB-fault');};
  try{const r=await get(base);assert.equal(r.statusCode,503);assert(!r.body.includes('private'));assert(!('items' in r.json()));}finally{db.runtime.connect=connect;}
 });
 await t.test('removed membership denies old cursor; same-role rejoin invalidates its generation without author revival',async()=>{
  const cursor=(await get(base,tokens[1])).json().next_cursor,url=base+'?cursor='+encodeURIComponent(cursor);
  await projects.remove(tokens[0],project,b,'1',randomUUID());assert.equal((await get(url,tokens[1])).statusCode,404);assert.equal((await get('/tasks/'+blocked,tokens[1])).statusCode,404);
  await projects.add(tokens[0],project,{user_id:b,role:'viewer'},randomUUID());assert.equal((await get(url,tokens[1])).statusCode,409);assert.equal((await get(base,tokens[1])).statusCode,200);
 });
 for(const path of [base,'/tasks/'+blocked])await t.test('post-wait session expiry withholds protected '+(path===base?'page':'detail'),async()=>{
  const fresh=await f.sessions.establish(a,'1'),held=await db.admin.connect();await held.query('BEGIN');await held.query('SELECT project_id FROM workspace.project WHERE project_id=$1 FOR UPDATE',[project]);
  await db.admin.query("UPDATE workspace.session SET expires_at=clock_timestamp()+interval '250 milliseconds' WHERE session_id=$1",[fresh.session.sessionId]);const pending=get(path,fresh.token);
  try{let observed=false;const deadline=Date.now()+500;while(Date.now()<deadline){if((await db.admin.query("SELECT 1 FROM pg_stat_activity WHERE usename='workspace_app' AND wait_event_type='Lock' AND position('SELECT project_id,name' in query)>0")).rowCount){observed=true;break;}await new Promise(r=>setTimeout(r,5));}assert(observed);await new Promise(r=>setTimeout(r,270));}finally{await held.query('ROLLBACK');held.release();}
  const r=await pending;assert.equal(r.statusCode,401,r.body);assert(!('items' in r.json()));assert(!r.body.includes('Synthetic'));
 });
});
