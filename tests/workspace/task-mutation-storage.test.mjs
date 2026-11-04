import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {taskMutationFixture} from './task-mutation-fixture.mjs';
import {migrate} from '../../scripts/database.mjs';
import {ownedTransaction} from '../../services/workspace/src/session/database.ts';
import {saveTaskOutcome,taskOutcome} from '../../services/workspace/src/tasks/outcomes.ts';
import {saveMutationOutcome,mutationOutcome} from '../../services/workspace/src/tasks/mutation-outcomes.ts';
import {requestHash,projectFailure,saveOutcome,outcome} from '../../services/workspace/src/projects/outcomes.ts';

test('SP04-P03B additive010 mutation storage, real roles and permanent originals',{timeout:180000},async t=>{
 const f=await taskMutationFixture({through:'009'});t.after(()=>f.close());const {db,ids,project,tokens}=f;
 t.diagnostic(JSON.stringify({fixture:db.name,volume:db.volume,image:db.image,postgres:(await db.admin.query("SELECT current_setting('server_version') version")).rows[0].version,ceiling:'explicit009 ->010'}));
 const owner=work=>ownedTransaction(db.admin,'operator',work),runtime=work=>ownedTransaction(db.runtime,'runtime',work);
 const upSQL=await readFile('services/workspace/migrations/010-task-mutations.up.sql','utf8');
 const downSQL=await readFile('services/workspace/migrations/010-task-mutations.down.sql','utf8');
 const up=()=>migrate(db.name,'workspace','up',{through:'010'});
 const checksums=async()=>(await db.admin.query("SELECT id,checksum FROM _migrations.applied WHERE id<'010' ORDER BY id")).rows;
 const definitions=async()=>(await db.admin.query("SELECT conrelid::regclass::text object,conname name,pg_get_constraintdef(oid) definition FROM pg_constraint WHERE conrelid IN ('workspace.idempotency_record'::regclass,'workspace.capability_grant'::regclass,'workspace.authority_provisioning_audit'::regclass,'workspace.blocker_event'::regclass) UNION ALL SELECT 'workspace.protect_project_outcome','function',pg_get_functiondef('workspace.protect_project_outcome()'::regprocedure) ORDER BY object,name")).rows;
 const taskId=randomUUID(),hash=requestHash(['synthetic-mutation']),key=()=>randomUUID();
 const task={task_id:taskId,project_id:project,type:'task',title:'Original text',description:'Retained original description',state:'todo',assignee_id:null,blocked:false,revision:1,work_location:{kind:'backlog',position:'1'},created_at:'2026-11-03T00:00:00.123Z'};
 const blocker={event_id:randomUUID(),task_id:taskId,status:'open',description:'Synthetic blocker',outcome:null,actor_id:ids[0],recorded_at:'2026-11-03T00:00:00.123456Z',sequence:1};
 let assignedSnapshot;
 await runtime(async c=>{
  await c.query("INSERT INTO workspace.task(task_id,project_id,type,title,description,state,backlog_position,created_at) VALUES($1,$2,'task',$3,$4,'todo',1,$5)",[taskId,project,task.title,task.description,task.created_at]);
  await saveTaskOutcome(c,ids[0],'existing-create',hash,task);
 });
 const oldHashes=await checksums(),oldDefinitions=await definitions();
 const insertReceipt=(c,op,body,patch={})=>{
  const row={actor:ids[0],key:key(),hash,state:'committed',ref:op==='recordBlocker'?blocker.event_id:taskId,expires:'infinity',status:op==='recordBlocker'?201:200,...patch};
  return c.query("INSERT INTO workspace.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,result_ref,expires_at,result_status,result_snapshot) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)",[row.actor,op,row.key,row.hash,row.state,row.ref,row.expires,row.status,body===undefined?null:JSON.stringify(body)]);
 };
 const grant=(c,action='task-edit',valid=true,subject=ids[0],id=randomUUID())=>c.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action,valid) VALUES($1,$2,$3,'project',$3,$4,$5)",[id,subject,project,action,valid]);
 const event=c=>c.query("INSERT INTO workspace.blocker_event(event_id,task_id,status,description,outcome,actor_id,sequence,recorded_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",[blocker.event_id,taskId,blocker.status,blocker.description,blocker.outcome,ids[0],1,blocker.recorded_at]);
 const audit=(c,action='board-state-change')=>c.query("INSERT INTO workspace.business_audit(event_id,actor_id,project_id,action,entity_id,before_ref,after_ref,correlation_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",[randomUUID(),ids[0],project,action,taskId,JSON.stringify({state:'todo',revision:1}),JSON.stringify({state:'done',revision:2}),randomUUID()]);
 const authorityAudit=c=>c.query("INSERT INTO workspace.authority_provisioning_audit(event_id,target_user_id,project_id,action,allowed,previous_revision,revision,operator_ref,reason) VALUES($1,$2,$3,'task-edit',true,0,1,'synthetic-P03B','fixture refusal')",[randomUUID(),ids[0],project]);
 const causeCode=code=>e=>e.code===code||e.cause?.code===code;
 const conflict=e=>projectFailure(e).status===409;

 await t.test('legacy keys, invalidated grants, history and both audits refuse before DDL and preserve seeded rows',async()=>{
  const cases=[
   [c=>c.query("INSERT INTO workspace.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,expires_at) VALUES($1,'setTaskState','legacy',$2,'pending',clock_timestamp())",[ids[0],hash]),"SELECT count(*) n FROM workspace.idempotency_record WHERE operation='setTaskState'"],
   [c=>grant(c,'task-state',false),"SELECT count(*) n FROM workspace.capability_grant WHERE action='task-state'"],
   [event,'SELECT count(*) n FROM workspace.blocker_event'],
   [audit,"SELECT count(*) n FROM workspace.business_audit WHERE action='board-state-change'"],
   [async c=>{await c.query('ALTER TABLE workspace.authority_provisioning_audit DROP CONSTRAINT authority_provisioning_audit_action_check');await authorityAudit(c);},"SELECT count(*) n FROM workspace.authority_provisioning_audit WHERE action='task-edit'"]
  ];
  for(const [seed,count]of cases)await owner(async c=>{
   await c.query('SAVEPOINT fixture_seed');await seed(c);await c.query('SAVEPOINT before_upgrade');
   await assert.rejects(c.query(upSQL),causeCode('23514'));await c.query('ROLLBACK TO before_upgrade');
   assert.equal((await c.query(count)).rows[0].n,'1');
   assert.equal((await c.query("SELECT to_regprocedure('workspace.valid_task_mutation_snapshot(jsonb,text)') fn")).rows[0].fn,null);
   await c.query('ROLLBACK TO fixture_seed'); // Revert only synthetic seeds, never delete retained audit.
  });
 });
 await t.test('upgrade/repeat/reverse/reapply preserve009 receipts, definitions and prior checksums',async()=>{
  up();up();assert.deepEqual(await checksums(),oldHashes);
  await owner(async c=>{await c.query(downSQL);await c.query("DELETE FROM _migrations.applied WHERE id='010-task-mutations'");});
  assert.deepEqual(await definitions(),oldDefinitions);assert.deepEqual(await checksums(),oldHashes);
  assert.equal((await db.admin.query("SELECT to_regclass('workspace.one_current_task_action') idx,to_regprocedure('workspace.valid_task_mutation_snapshot(jsonb,text)') fn")).rows[0].idx,null);
  assert.equal((await db.admin.query("SELECT to_regprocedure('workspace.valid_task_mutation_snapshot(jsonb,text)') fn")).rows[0].fn,null);up();
  assert.deepEqual(await runtime(c=>taskOutcome(c,ids[0],'existing-create',hash)),{status:201,body:task,projectId:project});
 });
 await t.test('each retained mutation receipt/grant/audit/event independently refuses destructive down',async()=>{
  const seeds=[...['editTask','setTaskState','setAssignee'].map(op=>c=>insertReceipt(c,op,task)),c=>insertReceipt(c,'recordBlocker',blocker),c=>grant(c,'task-edit',false),authorityAudit,event,audit];
  for(const seed of seeds)await owner(async c=>{
   await c.query('SAVEPOINT fixture_seed');await seed(c);await c.query('SAVEPOINT before_down');
   await assert.rejects(c.query(downSQL),causeCode('23514'));await c.query('ROLLBACK TO before_down');
   assert.equal((await c.query("SELECT to_regprocedure('workspace.valid_task_mutation_snapshot(jsonb,text)') IS NOT NULL present")).rows[0].present,true);
   await c.query('ROLLBACK TO fixture_seed');
  });
 });
 await t.test('total SQL validators reject NULL, every missing/extra/wrong field, unsafe values and malformed placement/time',async()=>{
  const badTask=[null,[],{},...Object.keys(task).map(k=>{const v=structuredClone(task);delete v[k];return v;}),...Object.keys(task).filter(k=>k!=='assignee_id').map(k=>({...task,[k]:null})),{...task,secret:'x'},{...task,task_id:'invalid'},{...task,project_id:'invalid'},{...task,type:'epic'},{...task,title:3},{...task,title:' '},{...task,description:7},{...task,state:'review'},{...task,assignee_id:'invalid'},{...task,blocked:'false'},...[0,-1,1.5,9007199254740992,'1'].map(revision=>({...task,revision})),...[
   {kind:'backlog',position:null},{kind:'backlog',position:1},{kind:'backlog',position:'NaN'},{kind:'backlog',position:'Infinity'},{kind:'backlog',position:'1e2'},
   {kind:'sprint',sprint_id:'invalid'},{kind:'sprint',sprint_id:project,position:'1'},{kind:'completed',sprint_id:project},{}
  ].map(work_location=>({...task,work_location})),...['2026-02-30T00:00:00.000Z','2026-11-03T00:00:00Z','2026-11-03T00:00:00.123456Z'].map(created_at=>({...task,created_at}))];
  const badBlocker=[null,[],{},...Object.keys(blocker).map(k=>{const v=structuredClone(blocker);delete v[k];return v;}),...Object.keys(blocker).filter(k=>k!=='outcome').map(k=>({...blocker,[k]:null})),{...blocker,secret:'x'},{...blocker,event_id:'invalid'},{...blocker,task_id:'invalid'},{...blocker,actor_id:'invalid'},{...blocker,status:'pending'},{...blocker,description:5},{...blocker,description:' '},{...blocker,outcome:9},...[0,-1,1.5,9007199254740992,'1'].map(sequence=>({...blocker,sequence})),...['infinity','2026-02-30T00:00:00Z','2026-11-03T00:00:00.1234567Z'].map(recorded_at=>({...blocker,recorded_at}))];
  for(const [fn,op,values,ref]of [['valid_task_mutation_snapshot','editTask',badTask,taskId],['valid_blocker_mutation_snapshot','recordBlocker',badBlocker,blocker.event_id]]){
   assert.equal((await db.admin.query(`SELECT workspace.${fn}(NULL,$1) valid`,[ref])).rows[0].valid,false);
   for(const value of values){assert.equal((await db.admin.query(`SELECT workspace.${fn}($1::jsonb,$2) valid`,[JSON.stringify(value),ref])).rows[0].valid,false);await assert.rejects(runtime(c=>insertReceipt(c,op,value)),causeCode('23514'));}
   await assert.rejects(runtime(c=>insertReceipt(c,op,undefined)),causeCode('23514'));
  }
 });
 await t.test('all valid Task locations/states and Blocker UTC precisions/nullable outcome retain exact wire snapshots',async()=>{
  const values=[...['todo','in_progress','done'].map(state=>({...task,state})),{...task,assignee_id:ids[1],blocked:true,revision:9007199254740991,work_location:{kind:'backlog',position:'-0.123456789012345678901'}},{...task,work_location:{kind:'sprint',sprint_id:randomUUID()}},{...task,state:'done',work_location:{kind:'completed',sprint_id:randomUUID()}}];
  for(const value of values)await runtime(c=>saveMutationOutcome(c,ids[0],'editTask',key(),hash,taskId,project,value));
  for(const recorded_at of ['2026-11-03T00:00:00Z','2026-11-03T00:00:00.1Z','2026-11-03T00:00:00.123Z',blocker.recorded_at])await runtime(c=>saveMutationOutcome(c,ids[0],'recordBlocker',key(),hash,taskId,project,{...blocker,recorded_at,outcome:'Retrospective',sequence:9007199254740991}));
 });
 await t.test('new-operation status/hash/key/state/expiry/ref constraints and OLD/NEW immutability are enforced',async()=>{
  for(const op of ['editTask','setTaskState','setAssignee','recordBlocker'])for(const patch of [{status:null},{status:204},{state:'pending'},{hash:'bad'},{key:''},{expires:'2026-11-03T00:00:00Z'},{ref:null},{ref:randomUUID()}])await assert.rejects(runtime(c=>insertReceipt(c,op,op==='recordBlocker'?blocker:task,patch)),causeCode('23514'));
  await runtime(c=>saveMutationOutcome(c,ids[0],'editTask','immutable',hash,taskId,project,task));
  for(const sql of ["UPDATE workspace.idempotency_record SET operation='other' WHERE idempotency_key='immutable'","UPDATE workspace.idempotency_record SET payload_hash=repeat('a',64) WHERE idempotency_key='immutable'","UPDATE workspace.idempotency_record SET result_snapshot='{}' WHERE idempotency_key='immutable'","UPDATE workspace.idempotency_record SET expires_at=clock_timestamp() WHERE idempotency_key='immutable'","DELETE FROM workspace.idempotency_record WHERE idempotency_key='immutable'"])await assert.rejects(db.admin.query(sql),causeCode('23514'));
  await db.admin.query("INSERT INTO workspace.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,expires_at) VALUES($1,'synthetic-other','generic',$2,'pending',clock_timestamp())",[ids[0],hash]);
  await assert.rejects(db.admin.query("UPDATE workspace.idempotency_record SET operation='setTaskState' WHERE idempotency_key='generic'"),causeCode('23514'));
  assert.equal((await db.admin.query("DELETE FROM workspace.idempotency_record WHERE idempotency_key='generic'")).rowCount,1);
  assert.equal((await db.admin.query("SELECT expires_at='infinity'::timestamptz permanent FROM workspace.idempotency_record WHERE idempotency_key='immutable'")).rows[0].permanent,true);
 });
 await t.test('actor/operation/key/hash/Task/project/event binding rejects cross-scope replay without current-state substitution',async()=>{
  for(const op of ['editTask','setTaskState','setAssignee','recordBlocker'])await runtime(c=>saveMutationOutcome(c,ids[0],op,'same-key',hash,taskId,project,op==='recordBlocker'?blocker:task));
  for(const op of ['editTask','setTaskState','setAssignee','recordBlocker']){
   const result=await runtime(c=>mutationOutcome(c,ids[0],op,'same-key',hash,taskId,project));assert.deepEqual(result,{status:op==='recordBlocker'?201:200,body:op==='recordBlocker'?blocker:task,projectId:project});
   assert.equal(await runtime(c=>mutationOutcome(c,ids[1],op,'same-key',hash,taskId,project)),null);
   for(const [h,id,p]of [[requestHash(['changed']),taskId,project],[hash,randomUUID(),project],[hash,taskId,randomUUID()]])await assert.rejects(runtime(c=>mutationOutcome(c,ids[0],op,'same-key',h,id,p)),conflict);
  }
  await assert.rejects(runtime(c=>saveMutationOutcome(c,ids[0],'recordBlocker',key(),hash,taskId,project,{...blocker,actor_id:ids[1]})),conflict);
  await assert.rejects(runtime(c=>saveMutationOutcome(c,ids[0],'editTask',key(),hash,taskId,randomUUID(),task)),conflict);
  await f.projects.add(tokens[0],project,{user_id:ids[1],role:'developer'},key());
  await db.admin.query("UPDATE workspace.task SET title='Later title',state='done',assignee_id=$2,revision=revision+1 WHERE task_id=$1",[taskId,ids[1]]);
  assignedSnapshot={...task,title:'Later title',state:'done',assignee_id:ids[1],revision:2};
  await runtime(c=>saveMutationOutcome(c,ids[0],'setAssignee','assignment-before-removal',hash,taskId,project,assignedSnapshot));
  assert.deepEqual((await runtime(c=>mutationOutcome(c,ids[0],'editTask','same-key',hash,taskId,project))).body,task);
 });
 await t.test('private action scope/uniqueness, runtime issue/revival/rewrite denial and real member removal/rejoin',async()=>{
  for(const action of ['task-edit','task-state','task-assign','task-blocker']){
   await assert.rejects(runtime(c=>grant(c,action)),causeCode('42501'));
   await assert.rejects(runtime(c=>grant(c,action,false)),causeCode('42501'));
   const id=randomUUID();await owner(c=>grant(c,action,true,ids[1],id));
   await assert.rejects(owner(c=>grant(c,action,true,ids[1])),causeCode('23505'));
   await assert.rejects(runtime(c=>c.query("UPDATE workspace.capability_grant SET subject_id=$2 WHERE grant_id=$1",[id,ids[0]])),causeCode('42501'));
   await assert.rejects(runtime(c=>c.query("UPDATE workspace.capability_grant SET action='synthetic-escape' WHERE grant_id=$1",[id])),causeCode('42501'));
   await runtime(c=>c.query('UPDATE workspace.capability_grant SET valid=false,permission_revision=permission_revision+1 WHERE grant_id=$1',[id]));
   await assert.rejects(runtime(c=>c.query('UPDATE workspace.capability_grant SET valid=true,permission_revision=permission_revision+1 WHERE grant_id=$1',[id])),causeCode('42501'));
   await owner(c=>grant(c,action,true,ids[1]));
  }
  await assert.rejects(owner(c=>c.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action) VALUES($1,$2,$3,'task',$4,'task-edit')",[randomUUID(),ids[0],project,taskId])),causeCode('23514'));
  await assert.rejects(owner(c=>c.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action,permission_revision) VALUES($1,$2,$3,'project',$3,'task-edit',9007199254740992)",[randomUUID(),ids[0],project])),causeCode('23514'));
  const revision=(await db.admin.query('SELECT revision::text FROM workspace.membership WHERE project_id=$1 AND user_id=$2',[project,ids[1]])).rows[0].revision;
  await f.projects.remove(tokens[0],project,ids[1],revision,key());
  assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.capability_grant WHERE subject_id=$1 AND action LIKE 'task-%' AND valid",[ids[1]])).rows[0].n,'0');
  assert.equal((await db.admin.query('SELECT assignee_id FROM workspace.task WHERE task_id=$1',[taskId])).rows[0].assignee_id,null);
  assert.deepEqual((await runtime(c=>mutationOutcome(c,ids[0],'setAssignee','assignment-before-removal',hash,taskId,project))).body,assignedSnapshot);
  await f.projects.add(tokens[0],project,{user_id:ids[1],role:'developer'},key());
  assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.capability_grant WHERE subject_id=$1 AND action LIKE 'task-%' AND valid",[ids[1]])).rows[0].n,'0');
  await assert.rejects(db.runtime.query('SELECT * FROM workspace.authority_provisioning_audit'),causeCode('42501'));
 });
 await t.test('physical blocker history rejects unsafe sequence and nonfinite time before any wire serialization',async()=>{
  for(const [sequence,time]of [['9007199254740992',blocker.recorded_at],['1','infinity']])await assert.rejects(runtime(c=>c.query("INSERT INTO workspace.blocker_event(event_id,task_id,status,description,actor_id,sequence,recorded_at) VALUES($1,$2,'open','Synthetic invalid history',$3,$4,$5)",[randomUUID(),taskId,ids[0],sequence,time])),causeCode('23514'));
  assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.blocker_event')).rows[0].n,'0');
 });
 await t.test('Task/event/audit/result writes roll back together on audit or outcome persistence failure',async()=>{
  const before=(await db.admin.query('SELECT title,revision::text FROM workspace.task WHERE task_id=$1',[taskId])).rows[0];
  for(const fail of ['audit','outcome']){
   await assert.rejects(runtime(async c=>{
    await c.query("UPDATE workspace.task SET title='Rollback candidate',revision=revision+1 WHERE task_id=$1",[taskId]);await event(c);
    if(fail==='audit')await c.query("INSERT INTO workspace.business_audit(event_id,actor_id,project_id,action,entity_id,correlation_id) VALUES($1,NULL,$2,'recordBlocker',$3,$4)",[randomUUID(),project,taskId,randomUUID()]);
    await audit(c);await saveMutationOutcome(c,ids[0],'setTaskState','rolled-back-'+fail,hash,taskId,project,task);
    await insertReceipt(c,'recordBlocker',{...blocker,sequence:null});
   }));
   assert.deepEqual((await db.admin.query('SELECT title,revision::text FROM workspace.task WHERE task_id=$1',[taskId])).rows[0],before);
   assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.blocker_event')).rows[0].n,'0');
   assert.equal(await runtime(c=>mutationOutcome(c,ids[0],'setTaskState','rolled-back-'+fail,hash,taskId,project)),null);
  }
  assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.business_audit WHERE action='board-state-change'")).rows[0].n,'0');
 });
 await t.test('lost real COMMIT acknowledgement is unknown, with one durable original and no current-state replacement',async()=>{
  const current=(await db.admin.query('SELECT revision::text,state,assignee_id FROM workspace.task WHERE task_id=$1',[taskId])).rows[0];
  const committed={...task,title:'Committed despite lost ACK',state:current.state,assignee_id:current.assignee_id,revision:Number(current.revision)+1};
  const ackPool={async connect(){const client=await db.runtime.connect();return new Proxy(client,{get(target,name){if(name==='query')return async(...args)=>{const result=await client.query(...args);if(args[0]==='COMMIT')throw Error('Synthetic acknowledgement loss after actual COMMIT');return result;};const value=Reflect.get(target,name);return typeof value==='function'?value.bind(target):value;}});}};
  await assert.rejects(ownedTransaction(ackPool,'runtime',async c=>{await c.query("UPDATE workspace.task SET title='Committed despite lost ACK',revision=revision+1 WHERE task_id=$1",[taskId]);await audit(c);await saveMutationOutcome(c,ids[0],'setTaskState','unknown-ack',hash,taskId,project,committed);}),e=>e.commitOutcome==='unknown');
  assert.equal((await db.admin.query('SELECT title FROM workspace.task WHERE task_id=$1',[taskId])).rows[0].title,'Committed despite lost ACK');
  await db.admin.query("UPDATE workspace.task SET title='Newer state after acknowledgement loss',revision=revision+1 WHERE task_id=$1",[taskId]);
  assert.deepEqual((await runtime(c=>mutationOutcome(c,ids[0],'setTaskState','unknown-ack',hash,taskId,project))).body,committed);
  assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.idempotency_record WHERE idempotency_key='unknown-ack'")).rows[0].n,'1');
 });
 await t.test('old project/member/createTask and protected-handoff branches still function and old SQL checksums match',async()=>{
  const member={project_id:project,user_id:ids[1],role:'viewer',revision:1};
  await runtime(c=>saveOutcome(c,ids[0],'addMember','old-member',hash,{status:201,projectId:project,body:member}));
  assert.deepEqual((await runtime(c=>outcome(c,ids[0],'addMember','old-member',hash))).body,member);
  await runtime(c=>saveOutcome(c,ids[0],'removeMember','old-remove',hash,{status:204,projectId:project,body:null}));
  assert.equal((await runtime(c=>outcome(c,ids[0],'removeMember','old-remove',hash))).status,204);
  assert((await db.runtime.query('SELECT workspace.claim_protected_handoff($1,$2,$3,$4) fence',[ids[0],'synthetic-mutation-protected',hash,randomUUID()])).rows[0].fence);
  assert.deepEqual((await runtime(c=>taskOutcome(c,ids[0],'existing-create',hash))).body,task);
  assert.deepEqual(await checksums(),oldHashes);await assert.rejects(owner(c=>c.query(downSQL)),causeCode('23514'));
 });
});
