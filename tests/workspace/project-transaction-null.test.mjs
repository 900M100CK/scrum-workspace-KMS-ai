import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {taskMutationFixture} from './task-mutation-fixture.mjs';
import {WorkspaceProjectStore,projectAccess,businessAudit} from '../../services/workspace/src/projects/store.ts';
import {WorkspaceTaskStore} from '../../services/workspace/src/tasks/store.ts';
import {WorkspaceSessionStore} from '../../services/workspace/src/session/store.ts';
import {projectFailure,requestHash} from '../../services/workspace/src/projects/outcomes.ts';
import {saveMutationOutcome} from '../../services/workspace/src/tasks/mutation-outcomes.ts';
import {buildApp} from '../../services/workspace/src/app.ts';

test('HF42-RF03 actual010 unexpected-null rollback contract and recorded-denial distinctions',{timeout:180000},async t=>{
 const f=await taskMutationFixture();t.after(()=>f.close());const {db,project,ids:[a],tokens,projects,operator}=f;
 t.diagnostic(JSON.stringify({fixture:db.name,image:db.image,ceiling:'010',scope:'Controlled callbacks on actual PostgreSQL; not a production incident or new public mutation'}));
 for(const action of ['backlog-author','task-edit'])await operator.project(a,project,action,true,'0','synthetic-hf42-null','explicit test authority');
 const fresh=async()=>{const r=await f.create({type:'task',title:'Synthetic transaction original'});assert.equal(r.statusCode,201,r.body);return r.json();};
 const snapshot=async id=>({task:(await db.admin.query('SELECT title,description,revision::text FROM workspace.task WHERE task_id=$1',[id])).rows[0],audits:(await db.admin.query('SELECT count(*) n FROM workspace.business_audit WHERE entity_id=$1',[id])).rows[0].n,outcomes:(await db.admin.query('SELECT count(*) n FROM workspace.idempotency_record WHERE result_ref=$1',[id])).rows[0].n});
 async function recover(){const clock=await f.authOperator.state();await f.authOperator.recover({expectedGeneration:clock.generation,expectedLastObserved:clock.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-hf42-null-clock',operatorRef:'synthetic-hf42-null'});for(let i=0;i<f.ids.length;i++)tokens[i]=(await f.sessions.establish(f.ids[i],'1')).token;}
 await t.test('legitimate false/zero and204 outcome objects with null body retain normal commit semantics',async()=>{
  for(const value of [false,0,{status:204,body:null}]){
   const row=await fresh();const result=await projects.transaction(tokens[0],async(sql,actor,guard)=>{await projectAccess(sql,actor,project);if(!await guard())return null;await sql.query('UPDATE workspace.task SET title=$2,revision=revision+1 WHERE task_id=$1',[row.task_id,'Committed valid result']);return value;});
   assert.deepEqual(result,value);const after=await snapshot(row.task_id);assert.equal(after.task.title,'Committed valid result');assert.equal(after.task.revision,'2');
  }
 });
 await t.test('known thrown callback failure rolls back actual attempted business effects before COMMIT',async()=>{
  const row=await fresh(),before=await snapshot(row.task_id);let error;
  try{await projects.transaction(tokens[0],async(sql,actor,guard)=>{await projectAccess(sql,actor,project);if(!await guard())return null;await sql.query('UPDATE workspace.task SET title=$2,revision=revision+1 WHERE task_id=$1',[row.task_id,'Must rollback']);throw Error('synthetic-private-callback-failure');});}catch(e){error=e;}
  assert(error);assert.equal(error.commitOutcome,'not-committed');assert.equal(projectFailure(error).status,503);assert.deepEqual(await snapshot(row.task_id),before);
 });
 await t.test('unexpected null with no recorded denial must roll back Task, audit and immutable original outcome',async()=>{
  const row=await fresh(),before=await snapshot(row.task_id),key=randomUUID(),body={...row,title:'Must not commit unexpected null',revision:2};let error,value,reachedNull=false;
  try{value=await projects.transaction(tokens[0],async(sql,actor,guard)=>{
   await projectAccess(sql,actor,project);if(!await guard())return null;
   await sql.query('UPDATE workspace.task SET title=$2,revision=$3 WHERE task_id=$1',[row.task_id,body.title,body.revision]);
   await businessAudit(sql,actor,project,'backlog-item-edit',row.task_id,randomUUID(),'revision:1','revision:2');
   await saveMutationOutcome(sql,actor,'editTask',key,requestHash(['synthetic-null-contract',row.task_id]),row.task_id,project,body);
   reachedNull=true;return null;
  });}catch(e){error=e;}
  const after=await snapshot(row.task_id);t.diagnostic(JSON.stringify({case:'unexpected-null',reachedNull,returnedNull:value===null,failureStatus:error?projectFailure(error).status:null,before,after}));
  assert(reachedNull,'Test must reach the actual null return instead of failing earlier SQL');assert(error,'Unexpected callback null without recorded denial must fail closed before COMMIT');assert.equal(error.commitOutcome,'not-committed');assert.equal(projectFailure(error).status,503);assert.deepEqual(after,before);
 });
 await t.test('protected HTTP null fault returns the existing generic503 envelope without internal detail',async()=>{
  // Test-only callback fault injection; production getProject is not a mutating operation.
  const faulty=new WorkspaceProjectStore(db.runtime,f.sessions,f.cursorKey);faulty.get=(token,id)=>faulty.transaction(token,async(sql,actor,guard)=>{await projectAccess(sql,actor,id);if(!await guard())return null;return null;});
  const app=buildApp({store:f.sessions,projects:faulty,tasks:f.tasks,origin:'https://localhost'});await app.ready();
  try{const r=await app.inject({url:'/projects/'+project,headers:f.headers()});assert.equal(r.statusCode,503,r.body);assert.deepEqual(r.json(),{code:'access_unavailable',message:'Access unavailable',run_id:null});assert.equal(r.headers['cache-control'],'no-store');assert(!r.body.includes('callback'));assert(!r.body.includes(project));}finally{await app.close();}
 });
 await t.test('ordinary authentication denial never runs callback or invents clock-fault audit',async()=>{
  let called=false;const before=(await db.admin.query("SELECT count(*) n FROM workspace.authentication_audit WHERE action='clock_fault'")).rows[0].n;let error;
  try{await projects.transaction('forged',async()=>{called=true;return null;});}catch(e){error=e;}
  assert(error);assert.equal(projectFailure(error).status,401);assert.equal(called,false);assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.authentication_audit WHERE action='clock_fault'")).rows[0].n,before);assert.equal((await db.admin.query('SELECT healthy FROM workspace.auth_clock_state')).rows[0].healthy,true);
 });
 await t.test('actual initial/final clock faults retain their durable latch/audit while withholding business effects',async()=>{
  for(const when of ['initial','guard']){
   const row=await fresh(),before=await snapshot(row.task_id),faults=(await db.admin.query("SELECT count(*) n FROM workspace.authentication_audit WHERE action='clock_fault'")).rows[0].n;let samples=0,called=false,error;
   const sessions=new WorkspaceSessionStore(db.runtime,{idleSeconds:1800,absoluteSeconds:28800},async sql=>{samples++;if(when==='initial'||samples>1)return '2000-01-01T00:00:00Z';return (await sql.query('SELECT clock_timestamp()::text observed')).rows[0].observed;});
   const scoped=new WorkspaceProjectStore(db.runtime,sessions,f.cursorKey);
   try{await scoped.transaction(tokens[0],async(sql,actor,guard)=>{called=true;await projectAccess(sql,actor,project);if(!await guard())return null;await sql.query('UPDATE workspace.task SET title=$2,revision=revision+1 WHERE task_id=$1',[row.task_id,'Must never execute after denial']);return {ok:true};});}catch(e){error=e;}
   try{assert(error);assert.equal(projectFailure(error).status,503);assert.equal(called,when==='guard');assert.equal((await db.admin.query('SELECT healthy FROM workspace.auth_clock_state')).rows[0].healthy,false);assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.authentication_audit WHERE action='clock_fault'")).rows[0].n,(BigInt(faults)+1n).toString());assert.deepEqual(await snapshot(row.task_id),before);}finally{await recover();}
  }
 });
 await t.test('actual lost COMMIT acknowledgement remains unknown and original-key replay does not mutate twice',async()=>{
  const row=await fresh(),key=randomUUID(),input={title:'Committed with lost acknowledgement',expected_revision:1};let lose=true;
  const pool={async connect(){const client=await db.runtime.connect();return new Proxy(client,{get(target,prop){if(prop==='query')return async(...args)=>{const value=await client.query(...args);if(args[0]==='COMMIT'&&lose){lose=false;throw Error('synthetic-lost-commit-ack');}return value;};const value=Reflect.get(target,prop);return typeof value==='function'?value.bind(target):value;}});}};
  const tasks=new WorkspaceTaskStore(pool,f.sessions,f.cursorKey);let error;
  try{await tasks.edit(tokens[0],row.task_id,input,key);}catch(e){error=e;}
  assert(error);assert.equal(error.commitOutcome,'unknown');const committed=await snapshot(row.task_id);assert.equal(committed.task.title,input.title);assert.equal(committed.task.revision,'2');
  const replay=await f.tasks.edit(tokens[0],row.task_id,input,key);assert.equal(replay.status,200);assert.equal(replay.body.title,input.title);assert.deepEqual(await snapshot(row.task_id),committed);
 });
});
