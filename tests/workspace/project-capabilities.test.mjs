import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {taskMutationFixture} from './task-mutation-fixture.mjs';
import {hasCapability} from '../../services/workspace/src/projects/capabilities.ts';
import {projectAccess} from '../../services/workspace/src/projects/store.ts';

test('HF42-RF02 shared grant predicate with actual010 handler authority',{timeout:180000},async t=>{
 const f=await taskMutationFixture();t.after(()=>f.close());const {db,project,ids:[a,b,c],tokens,projects,operator}=f;
 await operator.project(a,project,'backlog-author',true,'0','synthetic-hf42','fixture author');await projects.add(tokens[0],project,{user_id:b,role:'product_owner'},randomUUID());
 const created=await f.create({type:'task',title:'Synthetic helper task'});assert.equal(created.statusCode,201,created.body);const task=created.json();
 const lookup=(actor,p,action)=>projects.transaction(tokens[0],async sql=>hasCapability(sql,actor,p,action));
 const edit=(token=tokens[0],app=f.app)=>app.inject({method:'PATCH',url:'/tasks/'+task.task_id,headers:{...f.headers(token),'idempotency-key':randomUUID()},payload:{title:'Changed by explicit edit',expected_revision:1}});
 await t.test('same-client helper returns exact valid project/actor/action grant predicates',async()=>{
  assert.equal(await lookup(a,project,'membership-manage'),true);assert.equal(await lookup(a,project,'backlog-author'),true);
  for(const [actor,p,action]of [[a,project,'task-edit'],[b,project,'membership-manage'],[c,project,'backlog-author'],[a,randomUUID(),'backlog-author'],[a,project,"backlog-author' OR '1'='1"]])assert.equal(await lookup(actor,p,action),false);
 });
 await t.test('role/create authority does not imply edit or membership-management; resource scope remains in callers',async()=>{
  for(const token of tokens.slice(0,2))assert.equal((await edit(token)).statusCode,403);
  const denied=await edit(tokens[2]);assert.equal(denied.statusCode,404);assert.deepEqual(denied.json(),{code:'not_found',message:'Resource unavailable'});
  await assert.rejects(projects.transaction(tokens[1],async(sql,actor)=>projectAccess(sql,actor,project,true)));
  assert.deepEqual(await f.tasks.get(tokens[0],task.task_id),task);
 });
 await t.test('explicit issue/revoke/regrant changes lookup without altering query scope or business state',async()=>{
  await operator.project(a,project,'task-edit',true,'0','synthetic-hf42','explicit editor');assert.equal(await lookup(a,project,'task-edit'),true);
  await operator.project(a,project,'task-edit',false,'1','synthetic-hf42','revoke');assert.equal(await lookup(a,project,'task-edit'),false);assert.equal((await edit()).statusCode,403);
  await operator.project(a,project,'task-edit',true,'2','synthetic-hf42','restore');assert.equal(await lookup(a,project,'task-edit'),true);
 });
 await t.test('a real runtime database privilege failure propagates to generic503, never false or allow',async()=>{
  await db.admin.query('REVOKE SELECT ON workspace.capability_grant FROM workspace_app');
  try{
   await assert.rejects(lookup(a,project,'task-edit'));
   const r=await edit();assert.equal(r.statusCode,503,r.body);assert.deepEqual(r.json(),{code:'access_unavailable',message:'Access unavailable',run_id:null});assert(!r.body.includes('capability_grant'));assert.deepEqual(await f.tasks.get(tokens[0],task.task_id),task);
  }finally{await db.admin.query('GRANT SELECT ON workspace.capability_grant TO workspace_app');}
 });
 await t.test('actual edit succeeds after dependency recovery and current grant check; batch discovery still advertises live operations',async()=>{
  const r=await edit();assert.equal(r.statusCode,200,r.body);assert.equal(r.json().revision,2);assert.equal(r.json().title,'Changed by explicit edit');
  const q=await f.app.inject({url:'/access/allowed-actions?resource_kind=task&project_id='+project+'&resource_id='+task.task_id,headers:f.headers()});assert.equal(q.statusCode,200,q.body);assert(q.json().allowed_operations.includes('editTask'));assert(!q.json().allowed_operations.includes('setTaskState'));
 });
});
