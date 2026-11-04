import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {taskMutationFixture} from './task-mutation-fixture.mjs';
import {pauseTaskQuery,taskBarrier} from './task-fixture.mjs';
import {WorkspaceTaskStore} from '../../services/workspace/src/tasks/store.ts';
import {WorkspaceProjectOperator} from '../../services/workspace/src/projects/operator.ts';
import {buildApp} from '../../services/workspace/src/app.ts';
const settled=p=>p.then(value=>({value}),error=>({error}));
async function reached(g,p){await Promise.race([g.ready,p.then(()=>{throw Error('Producer ended before barrier');})]);}
test('SP04 cross-producer original outcomes, concurrent writes and revocation schedules',{timeout:180000},async t=>{
 const f=await taskMutationFixture();t.after(()=>f.close());const {db,project,ids:[a],tokens,operator}=f;
 for(const action of ['backlog-author','task-edit','task-state','task-assign','task-blocker'])await operator.project(a,project,action,true,'0','synthetic-integration','explicit');
 const fresh=async()=>{const r=await f.create();assert.equal(r.statusCode,201,r.body);return r.json();};
 const specs=[['editTask','','PATCH',rev=>({title:'Changed',expected_revision:rev}),'task-edit'],['setTaskState','/state','POST',rev=>({state:'done',expected_revision:rev}),'task-state'],['setAssignee','/assignee','POST',rev=>({assignee_id:a,expected_revision:rev}),'task-assign'],['recordBlocker','/blockers','POST',rev=>({status:'open',description:'Plan',expected_revision:rev}),'task-blocker']];
 const post=(row,spec,key=randomUUID(),app=f.app)=>app.inject({method:spec[2],url:'/tasks/'+row.task_id+spec[1],headers:{...f.headers(),'idempotency-key':key},payload:spec[3](row.revision)});
 await t.test('four competing real changed writes share one revision; exactly one business change wins',async()=>{
  const row=await fresh(),rs=await Promise.all(specs.map(s=>post(row,s)));assert.equal(rs.filter(r=>[200,201].includes(r.statusCode)).length,1);assert.equal(rs.filter(r=>r.statusCode===409).length,3);assert.equal((await f.tasks.get(tokens[0],row.task_id)).revision,2);
  assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.business_audit WHERE entity_id=$1',[row.task_id])).rows[0].n,'2');
 });
 await t.test('lost actual COMMIT acknowledgement preserves business/audit/outcome; same key returns original once',async()=>{
  for(const spec of specs){
   const row=await fresh(),key=randomUUID();let lose=true;
   const pool={async connect(){const c=await db.runtime.connect();return new Proxy(c,{get(target,prop){if(prop==='query')return async(...args)=>{const result=await c.query(...args);if(args[0]==='COMMIT'&&lose){lose=false;throw Error('Synthetic lost COMMIT acknowledgement');}return result;};const v=Reflect.get(target,prop);return typeof v==='function'?v.bind(target):v;}});}};
   const tasks=new WorkspaceTaskStore(pool,f.sessions,f.cursorKey),app=buildApp({store:f.sessions,projects:f.projects,tasks,origin:'https://localhost'});await app.ready();
   try{const r=await post(row,spec,key,app);assert.equal(r.statusCode,503,r.body);const current=await f.tasks.get(tokens[0],row.task_id);assert.equal(current.revision,2);const replay=await post(row,spec,key);assert.equal(replay.statusCode,spec[0]==='recordBlocker'?201:200,replay.body);assert.equal((await f.tasks.get(tokens[0],row.task_id)).revision,2);assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.idempotency_record WHERE actor_id=$1 AND operation=$2 AND idempotency_key=$3',[a,spec[0],key])).rows[0].n,'1');assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.business_audit WHERE entity_id=$1',[row.task_id])).rows[0].n,'2');}finally{await app.close();}
  }
 });
 await t.test('actual revoke-first lock schedules deny waiting writes and retained replays for every action',async()=>{
  for(const spec of specs){
   const row=await fresh(),key=randomUUID();assert.equal((await post(row,spec,key)).statusCode,spec[0]==='recordBlocker'?201:200);
   const current=await f.tasks.get(tokens[0],row.task_id),gate=pauseTaskQuery(db.admin,'UPDATE workspace.capability_grant SET valid=false'),op=new WorkspaceProjectOperator(gate.pool),revocation=settled(op.project(a,project,spec[4],false,'1','synthetic-integration','revoke first'));await reached(gate,revocation);
   const waiting=[settled(post({...row,revision:current.revision},spec)),settled(post(row,spec,key))];try{await taskBarrier(db.admin,'workspace_app','auth_clock_state',2);}finally{gate.release();}assert(!(await revocation).error);for(const p of waiting)assert.equal((await p).value.statusCode,403);
   assert.deepEqual(await f.tasks.get(tokens[0],row.task_id),current);await operator.project(a,project,spec[4],true,'2','synthetic-integration','restore');
  }
 });
});
