import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {request} from 'node:https';
import {taskFixture} from './task-fixture.mjs';
import {buildApp} from '../../services/workspace/src/app.ts';
import {taskValidators} from '../../services/workspace/src/tasks/http.ts';

test('P04 real task HTTP, explicit authority and atomic exact-key recovery',{timeout:180000},async t=>{
 const f=await taskFixture(),{db,ids:[a,b,c],tokens,project,operator,projects,create,headers}=f;t.after(()=>f.close());
 const input={type:'story',title:'  Original story  '};let first;
 const state=async()=>({tasks:(await db.admin.query('SELECT count(*) n FROM workspace.task')).rows[0].n,audit:(await db.admin.query("SELECT count(*) n FROM workspace.business_audit WHERE action='backlog-item-create'")).rows[0].n,outcomes:(await db.admin.query("SELECT count(*) n FROM workspace.idempotency_record WHERE operation='createTask'")).rows[0].n,backlog:(await db.admin.query('SELECT backlog_revision::text n FROM workspace.project WHERE project_id=$1',[project])).rows[0].n});
 await t.test('creator/manager/role labels alone deny; malformed/foreign/unknown targets and unauthenticated requests disclose no data',async()=>{
  const before=await state();assert.equal((await create()).statusCode,403);assert.equal((await create(input,'x','forged')).statusCode,401);
  const anon=await f.app.inject({method:'POST',url:`/projects/${project}/tasks`,payload:input});assert.equal(anon.statusCode,401);
  for(const p of [project,randomUUID(),'not-uuid']){const response=await create(input,randomUUID(),tokens[1],p);assert.equal(response.statusCode,404);assert.deepEqual(response.json(),{code:'not_found',message:'Resource unavailable'});}
  await projects.add(tokens[0],project,{user_id:b,role:'product_owner'},randomUUID());assert.equal((await create(input,'po',tokens[1])).statusCode,403);assert.deepEqual(await state(),before);
 });
 await operator.project(a,project,'backlog-author',true,'0','synthetic','explicit task author');
 await t.test('strict input, same-origin, bounded JSON/media and empty keys reject without a task or successful evidence',async()=>{
  const before=await state();
  for(const payload of [{type:'epic',title:'x'},{type:'task',title:''},{type:'task',title:' \t\n '},{type:'task',title:9},{type:'task',title:'x',description:null},{type:'task',title:'x',actor_id:b},{type:'task',title:'x',permissions:['backlog-author']},{type:'task',title:'x',created_at:'2026-11-02T00:00:00Z'},{type:'task',title:'x',created_by:a},{type:'task',title:'x',state:'done'},{type:'task',title:'x\0'},{type:'task',title:'x',description:'\0'},[],null])assert.equal((await create(payload)).statusCode,400,JSON.stringify(payload));
  const req={method:'POST',url:`/projects/${project}/tasks`,headers:{...headers(),'idempotency-key':'invalid'},payload:input};
  assert.equal((await f.app.inject({...req,url:req.url+'?actor_id='+a})).statusCode,400);
  assert.equal((await f.app.inject({...req,headers:{...req.headers,origin:'https://foreign.invalid'}})).statusCode,403);
  assert.equal((await f.app.inject({...req,headers:{...req.headers,'x-sacw-request':'0'}})).statusCode,403);
  assert.equal((await create(input,'')).statusCode,400);
  assert.equal((await create({type:'task',title:'x'.repeat(9000)})).statusCode,413);
  assert.equal((await f.app.inject({...req,headers:{...req.headers,'content-type':'application/x-custom'},payload:'x'})).statusCode,415);
  assert.equal((await f.app.inject({...req,headers:{...req.headers,cookie:headers().cookie+'; '+headers().cookie}})).statusCode,401);
  assert.deepEqual(await state(),before);
 });
 await t.test('story/task/bug persist exact initial projection, server time and audit with one Backlog increment',async()=>{
  const before=await state();
  for(const type of ['story','task','bug']){
   const response=await create({...input,type},'type-'+type);assert.equal(response.statusCode,201,response.body);assert.equal(response.headers['cache-control'],'no-store');assert.equal(response.headers['set-cookie'],undefined);
   const body=response.json();assert(taskValidators.Task(body));assert.match(body.task_id,/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/);assert.equal(body.project_id,project);assert.equal(body.title,input.title);assert.equal(body.description,'');assert.equal(body.state,'todo');assert.equal(body.assignee_id,null);assert.equal(body.blocked,false);assert.equal(body.revision,1);assert.equal(body.work_location.kind,'backlog');assert(!('created_by' in body));assert.match(body.created_at,/\.\d{3}Z$/);
   const row=(await db.admin.query("SELECT t.created_at,t.location_sprint_id,a.actor_id,a.time,a.correlation_id FROM workspace.task t JOIN workspace.business_audit a ON a.entity_id=t.task_id AND a.action='backlog-item-create' WHERE t.task_id=$1",[body.task_id])).rows[0];assert.equal(row.created_at.toISOString(),body.created_at);assert.equal(row.time.toISOString(),body.created_at);assert.equal(row.actor_id,a);assert.equal(row.location_sprint_id,null);assert(row.correlation_id);
   if(type==='story')first=body;
  }
  const after=await state();assert.equal(BigInt(after.backlog),BigInt(before.backlog)+3n);assert.equal(BigInt(after.tasks),BigInt(before.tasks)+3n);assert.equal(after.tasks,after.audit);assert.equal(after.tasks,after.outcomes);
 });
 await t.test('forged actor/project headers cannot replace authenticated actor or target scope in persisted audit',async()=>{
  const r=await f.app.inject({method:'POST',url:`/projects/${project}/tasks`,headers:{...headers(),'idempotency-key':'forged-headers','x-actor-id':b,'x-user-id':b,'x-project-id':randomUUID(),'x-request-id':randomUUID()},payload:{type:'task',title:'Authenticated actor only'}});assert.equal(r.statusCode,201,r.body);
  const body=r.json(),audit=(await db.admin.query('SELECT actor_id,project_id,action FROM workspace.business_audit WHERE entity_id=$1',[body.task_id])).rows[0];assert.deepEqual(audit,{actor_id:a,project_id:project,action:'backlog-item-create'});
 });
 await t.test('same concurrent key returns original once, normalizes omitted description and project UUID case; changed request conflicts',async()=>{
  const before=await state();const responses=await Promise.all([create(input,'type-story'),create({...input,description:''},'type-story',tokens[0],project.toUpperCase()),create(input,'type-story')]);
  for(const r of responses){assert.equal(r.statusCode,201,r.body);assert.deepEqual(r.json(),first);}assert.deepEqual(await state(),before);
  for(const patch of [{title:'Different'},{description:'Different'},{type:'bug'}])assert.equal((await create({...input,...patch},'type-story')).statusCode,409);
  await db.admin.query("UPDATE workspace.task SET title='Later current title',revision=2 WHERE task_id=$1",[first.task_id]);assert.deepEqual((await create(input,'type-story')).json(),first);
 });
 await t.test('task/storage/audit/outcome faults roll back task, Backlog generation and evidence with generic errors',async()=>{
  for(const table of ['task','business_audit','idempotency_record']){
   const before=await state();await db.admin.query(`CREATE FUNCTION workspace.reject_task_http() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic-task-private-canary'; END $$; CREATE TRIGGER reject_task_http BEFORE INSERT ON workspace.${table} FOR EACH ROW EXECUTE FUNCTION workspace.reject_task_http()`);
   try{const r=await create({type:'task',title:'Must rollback'},'failure-'+table);assert.equal(r.statusCode,503,r.body);assert(!r.body.includes('canary'));assert.deepEqual(await state(),before);}finally{await db.admin.query(`DROP TRIGGER reject_task_http ON workspace.${table};DROP FUNCTION workspace.reject_task_http()`);}
  }
 });
 await t.test('lost COMMIT acknowledgement is unknown, then original-key recovery creates no second task',async()=>{
  const connect=db.runtime.connect.bind(db.runtime);let injected=false;
  db.runtime.connect=async()=>{const client=await connect(),query=client.query.bind(client);client.query=async(...args)=>{const result=await query(...args);if(args[0]==='COMMIT'&&!injected){injected=true;throw Error('synthetic-lost-task-commit');}return result;};return client;};
  const before=await state();try{assert.equal((await create({type:'bug',title:'Unknown'},'lost-task')).statusCode,503);}finally{db.runtime.connect=connect;}
  assert(injected);const committed=await state();assert.equal(BigInt(committed.tasks),BigInt(before.tasks)+1n);
  assert.equal((await create({type:'bug',title:'Unknown'},'lost-task')).statusCode,201);assert.deepEqual(await state(),committed);
 });
 await t.test('current authority blocks replay; removal/rejoin restores no grant and only a new explicit grant permits old result',async()=>{
  await operator.project(a,project,'backlog-author',false,'1','synthetic','revoke');const denied=await create(input,'type-story');assert.equal(denied.statusCode,403);assert(!denied.body.includes(input.title));
  await operator.project(a,project,'backlog-author',true,'2','synthetic','restore');
  await operator.project(b,project,'membership-manage',true,'0','synthetic','second manager');
  await projects.remove(tokens[1],project,a,'1',randomUUID());assert.equal((await create(input,'type-story')).statusCode,404);
  await projects.add(tokens[1],project,{user_id:a,role:'product_owner'},randomUUID());assert.equal((await create(input,'type-story')).statusCode,403);
  const revision=(await operator.state(a,project)).find(r=>r.action==='backlog-author').revision;await operator.project(a,project,'backlog-author',true,revision,'synthetic','explicit rejoin grant');
  assert.deepEqual((await create(input,'type-story')).json(),first);
 });
 await t.test('only registered operations are advertised to actual authors; final serializer rejects malformed date-time or extra output',async()=>{
  const q='/access/allowed-actions?resource_kind=project&project_id='+project;
  const actions=(await f.app.inject({url:q,headers:headers()})).json().allowed_operations;assert(actions.includes('createTask'));assert(actions.includes('listTasks'));
  for(const patch of [{created_at:'yesterday'},{secret:'synthetic-leak'}]){
   const app=buildApp({store:f.sessions,projects,tasks:f.tasks,origin:'https://localhost'});app.addHook('preSerialization',async(_q,r,value)=>r.statusCode===201?{...value,...patch}:value);await app.ready();
   try{const response=await app.inject({method:'POST',url:`/projects/${project}/tasks`,headers:{...headers(),'idempotency-key':randomUUID()},payload:input});assert.equal(response.statusCode,503);assert(!response.body.includes('synthetic-leak'));assert(!response.body.includes('yesterday'));}finally{await app.close();}
  }
 });
 await t.test('session expires during the actual Project lock wait and is rechecked before first Task write',async()=>{
  const before=await state(),fresh=await f.sessions.establish(a,'1'),held=await db.admin.connect();
  await held.query('BEGIN');await held.query('SELECT project_id FROM workspace.project WHERE project_id=$1 FOR UPDATE',[project]);
  await db.admin.query("UPDATE workspace.session SET expires_at=clock_timestamp()+interval '250 milliseconds' WHERE session_id=$1",[fresh.session.sessionId]);
  const pending=create(input,'post-wait-expiry',fresh.token);
  try{
   let observed=false;const deadline=Date.now()+500;
   while(Date.now()<deadline){if((await db.admin.query("SELECT 1 FROM pg_stat_activity WHERE usename='workspace_app' AND wait_event_type='Lock' AND position('SELECT project_id,name' in query)>0")).rowCount){observed=true;break;}await new Promise(r=>setTimeout(r,5));}
   assert(observed,'Actual Project lock wait not reached');await new Promise(r=>setTimeout(r,270));
  }finally{await held.query('ROLLBACK');held.release();}
  const r=await pending;assert.equal(r.statusCode,401,r.body);assert.deepEqual(await state(),before);
 });
 await t.test('expired and disabled sessions and a faulted clock withhold success without partial task writes',async()=>{
  const before=await state(),fresh=await f.sessions.establish(a,'1');await db.admin.query("UPDATE workspace.session SET expires_at=clock_timestamp()+interval '50 milliseconds' WHERE session_id=$1",[fresh.session.sessionId]);await new Promise(r=>setTimeout(r,60));assert.equal((await create(input,'expired',fresh.token)).statusCode,401);
  await projects.add(tokens[1],project,{user_id:c,role:'viewer'},randomUUID());await operator.project(c,project,'backlog-author',true,'0','synthetic','disabled fixture');await f.authOperator.disable(c,'synthetic');assert.equal((await create(input,'disabled',tokens[2])).statusCode,401);
  await db.admin.query("UPDATE workspace.auth_clock_state SET last_observed=clock_timestamp()+interval '1 day'");
  try{assert.equal((await create(input,'clock-fault')).statusCode,503);assert.equal((await f.authOperator.state()).healthy,false);assert.deepEqual(await state(),before);}
  finally{const clock=await f.authOperator.state();await f.authOperator.recover({expectedGeneration:clock.generation,expectedLastObserved:clock.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-task-recover',operatorRef:'synthetic'});}
 });
 await t.test('trusted HTTPS transports the actual Task response without replacing its secure session cookie',async()=>{
  // Explicit clock recovery invalidates old sessions; transport uses a new current session.
  const fresh=await f.sessions.establish(a,'1');
  const cert=await readFile('.tmp/local-https/localhost.crt'),key=await readFile('.tmp/local-https/localhost.key'),app=buildApp({store:f.sessions,projects,tasks:f.tasks,origin:'https://localhost',tls:{cert,key}});await app.listen({host:'127.0.0.1',port:0});
  try{const response=await new Promise((resolve,reject)=>{const req=request({host:'127.0.0.1',port:app.server.address().port,path:`/projects/${project}/tasks`,method:'POST',ca:cert,headers:{...headers(fresh.token),'idempotency-key':'task-tls','content-type':'application/json'}},res=>{let body='';res.on('data',b=>body+=b);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));});req.on('error',reject);req.end(JSON.stringify({type:'task',title:'TLS task'}));});assert.equal(response.status,201,response.body);assert.equal(response.headers['cache-control'],'no-store');assert.equal(response.headers['set-cookie'],undefined);assert(taskValidators.Task(JSON.parse(response.body)));}finally{await app.close();}
 });
});
