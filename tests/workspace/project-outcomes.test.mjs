import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {sessionFixture} from './fixture.mjs';
import {migrate} from '../../scripts/database.mjs';
import {ownedTransaction} from '../../services/workspace/src/session/database.ts';
import {outcome,saveOutcome,requestHash,projectFailure} from '../../services/workspace/src/projects/outcomes.ts';

test('P04B separate 008 durable compact outcomes',{timeout:120000},async t=>{
 const db=await sessionFixture({through:'007'});t.after(()=>db.close());
 const up=()=>migrate(db.name,'workspace','up',{through:'008'}),owner=sql=>ownedTransaction(db.admin,'operator',c=>c.query(sql));
 const actor=randomUUID(),project=randomUUID(),user=randomUUID(),hash=requestHash(['addMember',project,user,'developer']);
 await t.test('legacy outcome refusal, empty reverse/forward/repeat, separate 007 identity',async()=>{
  await db.admin.query("INSERT INTO workspace.idempotency_record VALUES($1,'addMember','legacy',$2,'pending',NULL,clock_timestamp(),NULL,NULL)",[actor,hash]);
  assert.throws(up,/Legacy project outcomes/);assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.idempotency_record')).rows[0].n,'1');
  // Only this explicitly identified disposable synthetic legacy identity is removed.
  await db.admin.query("DELETE FROM workspace.idempotency_record WHERE idempotency_key='legacy'");up();
  const before=(await db.admin.query("SELECT checksum FROM _migrations.applied WHERE id='007-project-membership'")).rows[0].checksum;
  const down=await readFile('services/workspace/migrations/008-project-outcomes.down.sql','utf8');await owner(down+";DELETE FROM _migrations.applied WHERE id='008-project-outcomes'");up();up();
  assert.equal((await db.admin.query("SELECT checksum FROM _migrations.applied WHERE id='007-project-membership'")).rows[0].checksum,before);
 });
 const body={project_id:project,user_id:user,role:'developer',revision:1};
 await t.test('runtime saves original typed fields atomically and replays without reading current entities',async()=>{
  await ownedTransaction(db.runtime,'runtime',c=>saveOutcome(c,actor,'addMember','one-key',hash,{status:201,projectId:project,body}));
  assert.deepEqual(await ownedTransaction(db.runtime,'runtime',c=>outcome(c,actor,'addMember','one-key',hash)),{status:201,body,projectId:project});
  await assert.rejects(ownedTransaction(db.runtime,'runtime',c=>outcome(c,actor,'addMember','one-key',requestHash(['changed']))),e=>projectFailure(e).status===409);
  assert.equal(await ownedTransaction(db.runtime,'runtime',c=>outcome(c,randomUUID(),'addMember','one-key',hash)),null);
  assert.equal(await ownedTransaction(db.runtime,'runtime',c=>outcome(c,actor,'createProject','one-key',hash)),null);
 });
 await t.test('null/malformed/extra snapshot fields and unsafe revisions cannot pass SQL three-valued checks',async()=>{
  for(const b of [{...body,project_id:null},{...body,revision:null},{...body,secret:'private'}, {...body,revision:9007199254740992},{...body,role:'admin'},null]){
   await assert.rejects(ownedTransaction(db.runtime,'runtime',c=>saveOutcome(c,actor,'addMember',randomUUID(),hash,{status:201,projectId:project,body:b})));
  }
  await ownedTransaction(db.runtime,'runtime',c=>saveOutcome(c,actor,'removeMember','remove',hash,{status:204,projectId:project,body:null}));
  await assert.rejects(ownedTransaction(db.runtime,'runtime',c=>saveOutcome(c,actor,'removeMember','bad-remove',hash,{status:204,projectId:project,body})));
 });
 await t.test('committed identity/result cannot change or expire; failed transaction retains no receipt',async()=>{
  for(const sql of ["UPDATE workspace.idempotency_record SET result_snapshot='{}' WHERE idempotency_key='one-key'","UPDATE workspace.idempotency_record SET expires_at=clock_timestamp() WHERE idempotency_key='one-key'","DELETE FROM workspace.idempotency_record WHERE idempotency_key='one-key'"]){await assert.rejects(db.admin.query(sql));}
  await assert.rejects(ownedTransaction(db.runtime,'runtime',async c=>{await saveOutcome(c,actor,'addMember','rollback',hash,{status:201,projectId:project,body});throw new Error('synthetic-rollback');}));
  assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.idempotency_record WHERE idempotency_key='rollback'")).rows[0].n,'0');
  const down=await readFile('services/workspace/migrations/008-project-outcomes.down.sql','utf8');await assert.rejects(owner(down));
  assert.equal((await db.admin.query("SELECT expires_at='infinity'::timestamptz AS permanent FROM workspace.idempotency_record WHERE idempotency_key='one-key'")).rows[0].permanent,true);
 });
 await t.test('existing protected handoff claim keeps its original shape and no snapshot',async()=>{
  const row=(await db.runtime.query('SELECT workspace.claim_protected_handoff($1,$2,$3,$4) fence',[actor,'synthetic-protected',hash,randomUUID()])).rows[0];assert(row.fence);
  const claim=(await db.admin.query("SELECT result_status,result_snapshot,state FROM workspace.idempotency_record WHERE operation='protected_handoff'")).rows[0];assert.deepEqual(claim,{result_status:null,result_snapshot:null,state:'pending'});
 });
});
