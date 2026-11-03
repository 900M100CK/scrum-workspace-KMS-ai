import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {taskFixture} from './task-fixture.mjs';
import {migrate} from '../../scripts/database.mjs';
import {ownedTransaction} from '../../services/workspace/src/session/database.ts';
import {saveTaskOutcome,taskOutcome} from '../../services/workspace/src/tasks/outcomes.ts';
import {requestHash,saveOutcome,outcome,projectFailure} from '../../services/workspace/src/projects/outcomes.ts';

test('P03B additive 009 task origins, permanent typed results and safe refusal',{timeout:180000},async t=>{
 const f=await taskFixture({through:'008'});t.after(()=>f.close());const {db,ids,project}=f;
 const owner=work=>ownedTransaction(db.admin,'operator',work),runtime=work=>ownedTransaction(db.runtime,'runtime',work);
 const up=()=>migrate(db.name,'workspace','up',{through:'009'}),down=await readFile('services/workspace/migrations/009-task-creation.down.sql','utf8');
 const hashes=async()=> (await db.admin.query("SELECT id,checksum FROM _migrations.applied WHERE id<'009' ORDER BY id")).rows;
 const before=await hashes(),id=randomUUID(),hash=requestHash(['createTask',project,'story','Original','']);
 const body={task_id:id,project_id:project,type:'story',title:'Original',description:'',state:'todo',assignee_id:null,blocked:false,revision:1,work_location:{kind:'backlog',position:'1'},created_at:'2026-11-02T00:00:00.123Z'};
 const insertTask=(c,taskId=id)=>c.query("INSERT INTO workspace.task(task_id,project_id,type,title,state,backlog_position,location_kind,location_sprint_id,created_at) VALUES($1,$2,'story','Original','todo',1,'backlog',NULL,$3)",[taskId,project,body.created_at]);
 await t.test('legacy task, key and any author grant each refuse before DDL without removing rows',async()=>{
  const cases=[
   {insert:()=>db.admin.query("INSERT INTO workspace.task(task_id,project_id,type,title,state) VALUES($1,$2,'task','Legacy','todo')",[id,project]),remove:()=>db.admin.query('DELETE FROM workspace.task WHERE task_id=$1',[id]),count:"SELECT count(*) n FROM workspace.task"},
   {insert:()=>db.admin.query("INSERT INTO workspace.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,expires_at) VALUES($1,'createTask','legacy',$2,'pending',clock_timestamp())",[ids[0],hash]),remove:()=>db.admin.query("DELETE FROM workspace.idempotency_record WHERE operation='createTask' AND idempotency_key='legacy'"),count:"SELECT count(*) n FROM workspace.idempotency_record WHERE operation='createTask'"},
   {insert:()=>db.admin.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action,valid) VALUES($1,$2,$3,'project',$3,'backlog-author',false)",[randomUUID(),ids[0],project]),remove:()=>db.admin.query("DELETE FROM workspace.capability_grant WHERE action='backlog-author'"),count:"SELECT count(*) n FROM workspace.capability_grant WHERE action='backlog-author'"}
  ];
  for(const c of cases){await c.insert();assert.throws(up,/explicit reconciliation/);assert.equal((await db.admin.query(c.count)).rows[0].n,'1');assert.equal((await db.admin.query("SELECT 1 FROM information_schema.columns WHERE table_schema='workspace' AND table_name='task' AND column_name='created_at'")).rowCount,0);await c.remove();}
  // Cleanup above identifies only this disposable fixture's deliberately inserted unreconciled records.
 });
 await t.test('forward, repeated upgrade and empty-compatible reverse preserve old migrations and project receipts',async()=>{
  up();up();assert.deepEqual(await hashes(),before);
  await owner(async c=>{await c.query(down);await c.query("DELETE FROM _migrations.applied WHERE id='009-task-creation'");});up();
  assert.deepEqual(await hashes(),before);
  assert.equal((await db.admin.query("SELECT result_snapshot->>'project_id' id FROM workspace.idempotency_record WHERE operation='createProject'")).rows[0].id,project);
 });
 await t.test('each retained result, author grant, author audit or task business audit independently blocks down',async()=>{
  const cases=[
   c=>insertTask(c),
   c=>saveTaskOutcome(c,ids[0],'down-result',hash,body),
   c=>c.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action,valid) VALUES($1,$2,$3,'project',$3,'backlog-author',false)",[randomUUID(),ids[0],project]),
   c=>c.query("INSERT INTO workspace.authority_provisioning_audit(event_id,target_user_id,project_id,action,allowed,previous_revision,revision,operator_ref,reason) VALUES($1,$2,$3,'backlog-author',true,0,1,'synthetic','down refusal')",[randomUUID(),ids[0],project]),
   c=>c.query("INSERT INTO workspace.business_audit(event_id,actor_id,project_id,action,entity_id,correlation_id) VALUES($1,$2,$3,'backlog-item-create',$4,$5)",[randomUUID(),ids[0],project,id,randomUUID()]),
   c=>c.query("INSERT INTO workspace.business_audit(event_id,actor_id,project_id,action,entity_id,correlation_id) VALUES($1,$2,$3,'createTask',$4,$5)",[randomUUID(),ids[0],project,id,randomUUID()])
  ];
  for(const seed of cases)await assert.rejects(owner(async c=>{await seed(c);await c.query(down);}),e=>/data retained/.test(String(e.cause)));
  assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.idempotency_record WHERE operation='createTask'")).rows[0].n,'0');
 });
 await t.test('typed original Task outcome binds task identity and project snapshot, with immutable indefinite retention',async()=>{
  await runtime(c=>saveTaskOutcome(c,ids[0],'one-key',hash,body));
  assert.deepEqual(await runtime(c=>taskOutcome(c,ids[0],'one-key',hash)),{status:201,body,projectId:project});
  assert.equal(await runtime(c=>taskOutcome(c,ids[1],'one-key',hash)),null);
  await assert.rejects(runtime(c=>taskOutcome(c,ids[0],'one-key',requestHash(['changed']))),e=>projectFailure(e).status===409);
  for(const sql of ["UPDATE workspace.idempotency_record SET result_snapshot='{}' WHERE idempotency_key='one-key'","UPDATE workspace.idempotency_record SET expires_at=clock_timestamp() WHERE idempotency_key='one-key'","UPDATE workspace.idempotency_record SET operation='other' WHERE idempotency_key='one-key'","DELETE FROM workspace.idempotency_record WHERE idempotency_key='one-key'"])await assert.rejects(db.admin.query(sql));
  assert.equal((await db.admin.query("SELECT expires_at='infinity'::timestamptz permanent FROM workspace.idempotency_record WHERE idempotency_key='one-key'")).rows[0].permanent,true);
 });
 await t.test('total SQL validation rejects missing/null/extra/type/origin/location/revision errors',async()=>{
  const values=[null,[],{},...Object.keys(body).map(k=>{const b=structuredClone(body);delete b[k];return b;}),...Object.keys(body).filter(k=>k!=='assignee_id').map(k=>({...body,[k]:null})),{...body,secret:'private'},{...body,task_id:'invalid'},{...body,project_id:'invalid'},{...body,title:'  '},{...body,title:7},{...body,description:8},{...body,type:'epic'},{...body,state:'done'},{...body,assignee_id:ids[0]},{...body,blocked:true},{...body,revision:9007199254740992},{...body,revision:2},{...body,work_location:{kind:'sprint',sprint_id:randomUUID()}},{...body,work_location:{kind:'backlog',position:'NaN'}},{...body,work_location:{kind:'backlog',position:'1',secret:'x'}},{...body,created_at:'2026-02-30T00:00:00.000Z'},{...body,created_at:'2026-11-02T00:00:00Z'}];
  for(const value of values)await assert.rejects(runtime(c=>c.query("INSERT INTO workspace.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,result_ref,expires_at,result_status,result_snapshot) VALUES($1,'createTask',$2,$3,'committed',$4,'infinity',201,$5::jsonb)",[ids[0],randomUUID(),hash,id,JSON.stringify(value)])));
  for(const patch of [{ref:randomUUID()},{status:204},{state:'pending'},{hash:'bad'},{key:''},{expires:'2026-11-02T00:00:00Z'},{status:null},{ref:null}]){
   const row={ref:id,status:201,state:'committed',hash,key:randomUUID(),expires:'infinity',...patch};
   await assert.rejects(runtime(c=>c.query("INSERT INTO workspace.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,result_ref,expires_at,result_status,result_snapshot) VALUES($1,'createTask',$2,$3,$4,$5,$6,$7,$8::jsonb)",[ids[0],row.key,row.hash,row.state,row.ref,row.expires,row.status,JSON.stringify(body)])));
  }
 });
 await t.test('immutable server origin and complete rollback preserve generation/task/audit/result atomicity',async()=>{
  const generation=async()=> (await db.admin.query('SELECT backlog_revision::text n FROM workspace.project WHERE project_id=$1',[project])).rows[0].n;
  const previous=await generation();
  await assert.rejects(runtime(async c=>{await insertTask(c);await saveTaskOutcome(c,ids[0],'rolled-back',hash,body);await c.query("INSERT INTO workspace.business_audit(event_id,actor_id,project_id,action,entity_id,correlation_id) VALUES($1,$2,$3,'backlog-item-create',$4,$5)",[randomUUID(),ids[0],project,id,randomUUID()]);throw Error('synthetic failure');}));
  assert.equal(await generation(),previous);assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.task')).rows[0].n,'0');
  assert.equal(await runtime(c=>taskOutcome(c,ids[0],'rolled-back',hash)),null);
  await runtime(c=>insertTask(c));assert.equal(BigInt(await generation()),BigInt(previous)+1n);
  await assert.rejects(db.admin.query("UPDATE workspace.task SET created_at=created_at+interval '1 millisecond' WHERE task_id=$1",[id]));
  for(const created_at of ['infinity','2026-11-02T00:00:00.123456Z'])await assert.rejects(runtime(c=>c.query("INSERT INTO workspace.task(task_id,project_id,type,title,state,created_at) VALUES($1,$2,'task','Invalid origin','todo',$3)",[randomUUID(),project,created_at])));
  await db.admin.query("UPDATE workspace.task SET title='Later edited title' WHERE task_id=$1",[id]);assert.equal((await runtime(c=>taskOutcome(c,ids[0],'one-key',hash))).body.title,'Original');
  await assert.rejects(owner(c=>c.query(down)));assert.equal((await db.admin.query('SELECT created_at FROM workspace.task WHERE task_id=$1',[id])).rows[0].created_at.toISOString(),body.created_at);
 });
 await t.test('existing project/member/protected result shapes and owner-only author audit stay intact',async()=>{
  const member={project_id:project,user_id:ids[1],role:'viewer',revision:1};await runtime(c=>saveOutcome(c,ids[0],'addMember','member',hash,{status:201,projectId:project,body:member}));
  assert.deepEqual((await runtime(c=>outcome(c,ids[0],'addMember','member',hash))).body,member);
  await assert.rejects(runtime(c=>saveOutcome(c,ids[0],'addMember','bad-member',hash,{status:201,projectId:project,body:{...member,secret:'x'}})));
  await runtime(c=>saveOutcome(c,ids[0],'removeMember','remove',hash,{status:204,projectId:project,body:null}));
  const claim=(await db.runtime.query('SELECT workspace.claim_protected_handoff($1,$2,$3,$4) fence',[ids[0],'synthetic-task-protected',hash,randomUUID()])).rows[0];assert(claim.fence);
  await assert.rejects(db.runtime.query('SELECT * FROM workspace.authority_provisioning_audit'));
  await assert.rejects(runtime(c=>c.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action) VALUES($1,$2,$3,'project',$3,'backlog-author')",[randomUUID(),ids[0],project])),e=>e.cause?.code==='42501');
  assert.deepEqual(await hashes(),before);
 });
});
