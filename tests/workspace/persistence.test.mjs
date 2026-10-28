import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {spawn} from 'node:child_process';
import {sessionFixture} from './fixture.mjs';
import {WorkspaceSessionStore,WorkspaceSessionOperator,tokenDigest} from '../../services/workspace/src/session/store.ts';
import {ownedTransaction,SessionStoreUnavailable} from '../../services/workspace/src/session/database.ts';
import {ScryptVerifier} from '../../services/workspace/src/session/kdf.ts';

const policy={idleSeconds:1800,absoluteSeconds:28800};
const denied=error=>error instanceof SessionStoreUnavailable;
test('P08 real PostgreSQL owned persistence and operator boundary',{timeout:240000},async t=>{
 const oldHashes={};for(const name of ['001-store','002-registered-policy','003-work-location','004-protected-claims'])for(const direction of ['up','down']){const file=`services/workspace/migrations/${name}.${direction}.sql`;oldHashes[file]=createHash('sha256').update(await readFile(file)).digest('hex');}
 const db=await sessionFixture();t.after(()=>db.close());let store=new WorkspaceSessionStore(db.runtime,policy),operator=new WorkspaceSessionOperator(db.admin);
 const kdf=new ScryptVerifier(),password='synthetic-p08-integration-only';const encoded=await kdf.hash(password);
 const alice=randomUUID(),bob=randomUUID();
 const owner=sql=>ownedTransaction(db.admin,'operator',c=>c.query(sql));
 async function waiting(user,fragment){
  const end=performance.now()+750;
  while(performance.now()<end){const rows=(await db.admin.query("SELECT pid FROM pg_stat_activity WHERE usename=$1 AND wait_event_type='Lock' AND position($2 in query)>0",[user,fragment])).rows;if(rows.length)return;await new Promise(r=>setTimeout(r,10));}
  throw new Error('Expected operation did not reach its actual PostgreSQL lock boundary');
 }
 const injectedAudit=error=>denied(error)&&error.cause?.code==='P0001';
 async function recover(evidence='synthetic-p08-attestation'){
  const state=await operator.state();await operator.recover({expectedGeneration:state.generation,expectedLastObserved:state.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:evidence,operatorRef:'synthetic-test-operator'});
 }
 async function auditFailure(action){
  await owner(`CREATE FUNCTION workspace.test_reject_auth_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='${action}' THEN RAISE EXCEPTION 'injected audit rejection'; END IF; RETURN NEW; END $$;CREATE TRIGGER test_reject_auth_audit BEFORE INSERT ON workspace.authentication_audit FOR EACH ROW EXECUTE FUNCTION workspace.test_reject_auth_audit()`);
  return ()=>owner('DROP TRIGGER test_reject_auth_audit ON workspace.authentication_audit;DROP FUNCTION workspace.test_reject_auth_audit()');
 }
 await t.test('005 forward/reapply/empty reverse/forward; nonempty legacy is refused without deletion',async()=>{
  db.migrate();assert.equal((await db.admin.query('select count(*) from workspace.auth_clock_state')).rows[0].count,'1');
  const lifecycleDown=await readFile('services/workspace/migrations/006-session-lifecycle.down.sql','utf8');
  await owner(`${lifecycleDown};DELETE FROM _migrations.applied WHERE id='006-session-lifecycle'`);
  const down=await readFile('services/workspace/migrations/005-session-foundation.down.sql','utf8');
  await owner(`${down};DELETE FROM _migrations.applied WHERE id='005-session-foundation'`);
  const legacy=randomUUID();await db.admin.query("INSERT INTO workspace.session(session_id,user_id,expires_at) VALUES($1,$2,clock_timestamp()+interval '1 hour')",[legacy,randomUUID()]);
  assert.throws(()=>db.migrate(),/legacy reconciliation/);assert.equal((await db.admin.query('select count(*) from workspace.session')).rows[0].count,'1');
  // Only this identified disposable fixture is cleared to test the empty upgrade path.
  await db.admin.query('DELETE FROM workspace.session');db.migrate();db.migrate();
 });
 await t.test('runtime cannot provision/disable accounts, rewrite audit, reset clock or reach Knowledge',async()=>{
  for(const sql of ["INSERT INTO workspace.auth_account(user_id,username,password_credential) VALUES(gen_random_uuid(),'forged','scrypt$v1$bad')","UPDATE workspace.auth_account SET disabled=false","UPDATE workspace.authentication_audit SET action='clock_fault'","DELETE FROM workspace.authentication_audit","TRUNCATE workspace.auth_clock_state","UPDATE workspace.auth_clock_state SET healthy=true,last_observed=clock_timestamp(),recovery_generation=1"]){await assert.rejects(db.runtime.query(sql));}
  await assert.rejects(db.extraPool('knowledge_db').query('select 1'));
  await assert.rejects(new WorkspaceSessionOperator(db.runtime).state(),denied);
 });
 await t.test('initial clock unready withholds session; operator provisions and explicitly initializes',async()=>{
  await operator.provision(alice,'synthetic-alice',encoded,'synthetic-test-operator');await operator.provision(bob,'synthetic-bob',encoded,'synthetic-test-operator');
  assert.equal((await store.establish(alice,'1')).kind,'unavailable');assert.equal((await db.admin.query('select count(*) from workspace.session')).rows[0].count,'0');await recover();
 });
 let oldToken;
 await t.test('issue only binds current credential revision; digest-only storage and exact private credential lookup',async()=>{
  assert.equal((await store.establish(alice,'0')).kind,'unauthenticated');
  const account=await store.credential('synthetic-alice');assert.equal(account.userId,alice);assert.equal(account.revision,'1');assert.equal(await kdf.verify(password,account.credential),true);assert.equal(await store.credential('SYNTHETIC-ALICE'),null);
  const issued=await store.establish(alice,'1');assert.equal(issued.kind,'created');oldToken=issued.token;
  assert.equal(Buffer.from(oldToken,'base64url').length,32);assert.equal((await store.inspect(oldToken)).kind,'authenticated');
  const persisted=JSON.stringify((await db.admin.query('SELECT row_to_json(s) session,row_to_json(t) token FROM workspace.session s JOIN workspace.session_token t USING(session_id)')).rows);
  assert.equal(persisted.includes(oldToken),false);assert.equal(persisted.includes(password),false);assert(persisted.includes(tokenDigest(oldToken)));
  const audit=JSON.stringify((await db.admin.query('SELECT * FROM workspace.authentication_audit')).rows);for(const secret of [password,oldToken,encoded,tokenDigest(oldToken)])assert.equal(audit.includes(secret),false,'secret persisted in audit');
 });
 await t.test('required session audit failure rolls back every owned row and never returns token',async st=>{
  const cleanup=await auditFailure('session_created');st.after(cleanup);const before=(await db.admin.query('SELECT count(*) FROM workspace.session')).rows[0].count;
  await assert.rejects(store.establish(alice,'1'),injectedAudit);assert.equal((await db.admin.query('SELECT count(*) FROM workspace.session')).rows[0].count,before);
 });
 await t.test('immutable absolute deadline, missing token and expired/revoked state fail closed',async()=>{
  await assert.rejects(db.admin.query("UPDATE workspace.session_token SET absolute_expires_at=absolute_expires_at+interval '1 hour'"));
  const issued=await store.establish(alice,'1');assert.equal(issued.kind,'created');
  await db.admin.query("UPDATE workspace.session SET expires_at=(SELECT created_at+interval '1 microsecond' FROM workspace.session_token WHERE session_id=$1) WHERE session_id=$1",[issued.session.sessionId]);
  assert.equal((await store.inspect(issued.token)).kind,'unauthenticated');assert.equal((await store.inspect('forged')).kind,'unauthenticated');
  await db.admin.query('UPDATE workspace.session SET revoked=true WHERE session_id=$1',[issued.session.sessionId]);assert.equal((await store.inspect(issued.token)).kind,'unauthenticated');
 });
 await t.test('manual disable rolls back with audit failure, then denies login and all existing sessions',async()=>{
  const issued=await store.establish(bob,'1');assert.equal(issued.kind,'created');const cleanup=await auditFailure('account_disabled');
  try{await assert.rejects(operator.disable(bob,'synthetic-test-operator'),injectedAudit);assert.equal((await store.inspect(issued.token)).kind,'authenticated');}finally{await cleanup();}
  await operator.disable(bob,'synthetic-test-operator');assert.equal((await store.establish(bob,'1')).kind,'unauthenticated');assert.equal((await store.inspect(issued.token)).kind,'unauthenticated');assert.equal((await store.credential('synthetic-bob')).disabled,true);await operator.disable(bob,'synthetic-test-operator');
 });
 await t.test('actual observed clock backstep latches fault and survives real PostgreSQL restart',async()=>{
  await db.admin.query("UPDATE workspace.auth_clock_state SET last_observed=clock_timestamp()+interval '1 day'");
  assert.equal((await store.inspect(oldToken)).kind,'unavailable');assert.equal((await operator.state()).healthy,false);
  await db.restart();store=new WorkspaceSessionStore(db.runtime,policy);operator=new WorkspaceSessionOperator(db.admin);
  assert.equal((await store.inspect(oldToken)).kind,'unavailable');assert.equal((await store.establish(alice,'1')).kind,'unavailable');
 });
 await t.test('recovery rejects stale/mismatched attestation; audit rollback preserves fault; all old tokens remain revoked',async()=>{
  const state=await operator.state(),input={expectedGeneration:state.generation,expectedLastObserved:state.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-recovery',operatorRef:'synthetic-test-operator'};
  await assert.rejects(operator.recover({...input,expectedGeneration:'999'}),denied);await assert.rejects(operator.recover({...input,attestedTime:'2000-01-01T00:00:00Z'}),denied);
  const cleanup=await auditFailure('clock_recovered');try{await assert.rejects(operator.recover(input),injectedAudit);assert.equal((await operator.state()).healthy,false);}finally{await cleanup();}
  await recover('synthetic-recovery');assert.equal((await store.inspect(oldToken)).kind,'unauthenticated');const fresh=await store.establish(alice,'1');assert.equal(fresh.kind,'created');assert.equal((await store.inspect(fresh.token)).kind,'authenticated');
  await db.restart();store=new WorkspaceSessionStore(db.runtime,policy);operator=new WorkspaceSessionOperator(db.admin);assert.equal((await store.inspect(oldToken)).kind,'unauthenticated');
 });
 await t.test('missing clock row and read error do not authorize access',async()=>{
  const issued=await store.establish(alice,'1');assert.equal(issued.kind,'created');const row=(await db.admin.query('SELECT * FROM workspace.auth_clock_state')).rows[0];
  await db.admin.query('DELETE FROM workspace.auth_clock_state');assert.equal((await store.inspect(issued.token)).kind,'unavailable');assert.equal((await store.establish(alice,'1')).kind,'unavailable');
  await db.admin.query('INSERT INTO workspace.auth_clock_state VALUES(true,$1,$2,$3)',[row.last_observed,row.healthy,row.recovery_generation]);
  await db.admin.query('REVOKE SELECT ON workspace.auth_clock_state FROM workspace_app');try{await assert.rejects(store.inspect(issued.token),denied);}finally{await db.admin.query('GRANT SELECT ON workspace.auth_clock_state TO workspace_app');}
 });
 await t.test('real cancellation, failed rollback discard and bounded later pool health',async()=>{
  await assert.rejects(ownedTransaction(db.runtime,'runtime',async c=>{await c.query("SET LOCAL statement_timeout='20ms'");await c.query('select pg_sleep(2)');}),denied);
  await assert.rejects(ownedTransaction(db.runtime,'runtime',async c=>{const pid=(await c.query('select pg_backend_pid() pid')).rows[0].pid;await db.admin.query('select pg_terminate_backend($1)',[pid]);await c.query('select 1');}),denied);
  assert.equal((await db.runtime.query('select 1 n')).rows[0].n,1);assert.equal(db.runtime.waitingCount,0);assert.equal(db.runtime.totalCount,db.runtime.idleCount);
 });
 await t.test('singleton contention is bounded and later requests recover; no throughput SLA',async st=>{
  const issued=await store.establish(alice,'1');assert.equal(issued.kind,'created');const held=await db.admin.connect();await held.query('BEGIN');await held.query('SELECT * FROM workspace.auth_clock_state FOR UPDATE');
  const start=performance.now();try{await assert.rejects(store.inspect(issued.token),denied);}finally{await held.query('ROLLBACK');held.release();}
  assert.equal((await store.inspect(issued.token)).kind,'authenticated');st.diagnostic(JSON.stringify({lockTimeoutObservationMs:performance.now()-start,configuredLockTimeoutMs:1000,poolWaiting:db.runtime.waitingCount}));
 });
 await t.test('disable-first and issue-first schedules observe SQL waits and cannot revive disabled access',async()=>{
  for(const order of ['disable-first','issue-first']){
   const user=randomUUID();await operator.provision(user,'synthetic-race-'+order,encoded,'synthetic-test-operator');
   const held=await db.admin.connect();await held.query('BEGIN');await held.query('SELECT * FROM workspace.auth_account WHERE user_id=$1 FOR UPDATE',[user]);
   let issue,disable;
   try{
    if(order==='disable-first'){
     disable=operator.disable(user,'synthetic-test-operator').catch(error=>({error}));await waiting('postgres','SELECT disabled FROM workspace.auth_account');
     issue=store.establish(user,'1').catch(error=>({error}));await waiting('workspace_app','auth_clock_state');
    }else{
     issue=store.establish(user,'1').catch(error=>({error}));await waiting('workspace_app','lock_auth_account');
     disable=operator.disable(user,'synthetic-test-operator').catch(error=>({error}));await waiting('postgres','auth_clock_state');
    }
   }finally{await held.query('ROLLBACK');held.release();}
   const result=await issue,disabled=await disable;assert.equal(disabled,undefined);assert.equal(result.kind,order==='disable-first'?'unauthenticated':'created');
   if(result.kind==='created')assert.equal((await store.inspect(result.token)).kind,'unauthenticated');
   assert.equal((await store.establish(user,'1')).kind,'unauthenticated');
  }
 });
 await t.test('injected receipt loss after actual COMMIT stays unknown, discards and never retries',async()=>{
  const before=(await db.admin.query('SELECT count(*) FROM workspace.session')).rows[0].count;
  const connect=db.runtime.connect.bind(db.runtime);
  db.runtime.connect=async()=>{const client=await connect();const query=client.query.bind(client);client.query=async(...args)=>{const result=await query(...args);if(args[0]==='COMMIT'){client.query=query;throw new Error('Injected receipt loss after actual COMMIT');}return result;};return client;};
  try{await assert.rejects(store.establish(alice,'1'),error=>denied(error)&&error.commitOutcome==='unknown');}finally{db.runtime.connect=connect;}
  assert.equal(BigInt((await db.admin.query('SELECT count(*) FROM workspace.session')).rows[0].count),BigInt(before)+1n);assert.equal((await db.runtime.query('SELECT 1 n')).rows[0].n,1);assert.equal(db.runtime.waitingCount,0);
 });
 await t.test('actual private operator CLI provisions via stdin and reports state without secrets',async()=>{
  async function cli(command,data){return new Promise((resolve,reject)=>{const child=spawn(process.execPath,['services/workspace/src/session/operator.ts',command],{env:{...process.env,...db.operatorEnvironment},stdio:['pipe','pipe','pipe'],windowsHide:true});let stdout='',stderr='';const timer=setTimeout(()=>{child.kill();reject(new Error('Operator CLI timeout'));},10000);child.stdout.on('data',chunk=>stdout+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);child.on('error',reject);child.on('close',code=>{clearTimeout(timer);resolve({code,stdout,stderr});});child.stdin.end(data?JSON.stringify(data):'');});}
  const created=await cli('provision',{username:'synthetic-cli-user',password});assert.equal(created.code,0);assert.equal(JSON.parse(created.stdout).status,'provisioned');for(const secret of [password,encoded,db.operatorEnvironment.SACW_OPERATOR_DATABASE_URL])assert.equal((created.stdout+created.stderr).includes(secret),false,'operator output exposed secret');
  const state=await cli('state');assert.equal(state.code,0);assert.equal(JSON.parse(state.stdout).healthy,true);
 });
 await t.test('nonempty rollback refused, original migration bytes unchanged and bigint generation exact',async()=>{
  const down=await readFile('services/workspace/migrations/005-session-foundation.down.sql','utf8');await assert.rejects(owner(down));
  for(const [file,hash] of Object.entries(oldHashes))assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'),hash);
  await db.admin.query('UPDATE workspace.auth_clock_state SET recovery_generation=9007199254740993');assert.equal((await operator.state()).generation,'9007199254740993');
 });
 t.diagnostic(JSON.stringify({container:db.name,volume:db.volume,image:db.image,postgres:(await db.admin.query('select version() v')).rows[0].v,scope:'P08 adapters/operator/owned SQL only; no HTTP handlers',role:'workspace_app for runtime; workspace_owner for operator'}));
});
