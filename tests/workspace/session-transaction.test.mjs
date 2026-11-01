import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {sessionFixture} from './fixture.mjs';
import {WorkspaceSessionStore,WorkspaceSessionOperator} from '../../services/workspace/src/session/store.ts';
import {ownedTransaction} from '../../services/workspace/src/session/database.ts';
import {ScryptVerifier} from '../../services/workspace/src/session/kdf.ts';

test('P03A session validation uses caller transaction and preserves fault/rollback boundaries',{timeout:150000},async t=>{
 const db=await sessionFixture();t.after(()=>db.close());
 const user=randomUUID(),operator=new WorkspaceSessionOperator(db.admin),store=new WorkspaceSessionStore(db.runtime,{idleSeconds:1800,absoluteSeconds:28800});
 await operator.provision(user,'synthetic-p03a',new ScryptVerifier().dummyCredential,'synthetic-p03a-operator');
 const state=await operator.state();await operator.recover({expectedGeneration:state.generation,expectedLastObserved:state.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-p03a-time',operatorRef:'synthetic-p03a-operator'});
 const issued=await store.establish(user,'1');assert.equal(issued.kind,'created');
 await t.test('caller rollback rolls back its own writes; token is not independently reissued',async()=>{
  await assert.rejects(ownedTransaction(db.runtime,'runtime',async c=>{
   const before=(await c.query('select pg_backend_pid() pid')).rows[0].pid;
   const result=await store.inspectInTransaction(c,issued.token);assert.equal(result.kind,'authenticated');
   assert.equal((await c.query('select pg_backend_pid() pid')).rows[0].pid,before);
   await c.query('UPDATE workspace.session SET revision=revision+1 WHERE session_id=$1',[issued.session.sessionId]);
   throw new Error('synthetic-business-rollback');
  }));
  assert.equal((await db.admin.query('SELECT revision::text revision FROM workspace.session WHERE session_id=$1',[issued.session.sessionId])).rows[0].revision,'1');
  assert.equal((await store.inspect(issued.token)).kind,'authenticated');
 });
 await t.test('fault outcome commits latch and audit without entering the protected write branch',async()=>{
  await db.admin.query("UPDATE workspace.auth_clock_state SET last_observed=clock_timestamp()+interval '1 day'");
  let writes=0;
  const result=await ownedTransaction(db.runtime,'runtime',async c=>{
   const auth=await store.inspectInTransaction(c,issued.token);
   if(auth.kind!=='authenticated')return auth;
   writes++;await c.query('UPDATE workspace.session SET revision=revision+1 WHERE session_id=$1',[issued.session.sessionId]);return auth;
  });
  assert.equal(result.kind,'unavailable');assert.equal(writes,0);
  assert.equal((await operator.state()).healthy,false);
  assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.authentication_audit WHERE action='clock_fault'")).rows[0].n,'1');
  assert.equal((await db.admin.query('SELECT revision::text revision FROM workspace.session WHERE session_id=$1',[issued.session.sessionId])).rows[0].revision,'1');
 });
});
