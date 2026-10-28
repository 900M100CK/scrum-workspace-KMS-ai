import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {request} from 'node:https';
import {sessionFixture} from './fixture.mjs';
import {buildApp} from '../../services/workspace/src/app.ts';
import {WorkspaceSessionStore,WorkspaceSessionOperator} from '../../services/workspace/src/session/store.ts';
import {ownedTransaction} from '../../services/workspace/src/session/database.ts';
import {ScryptVerifier} from '../../services/workspace/src/session/kdf.ts';
import {SESSION_COOKIE} from '../../services/workspace/src/session/http.ts';

const policy={idleSeconds:1800,absoluteSeconds:28800},origin='https://localhost:5173',headers={origin,'x-sacw-request':'1'};
test('P10 actual lifecycle handlers and PostgreSQL serialization',{timeout:180000},async t=>{
 const db=await sessionFixture();t.after(()=>db.close());
 const operator=new WorkspaceSessionOperator(db.admin),user=randomUUID();
 const owner=sql=>ownedTransaction(db.admin,'operator',c=>c.query(sql));
 await t.test('006 empty reverse/forward/repeat preserves previous migration identity',async()=>{
  const before=(await db.admin.query("SELECT id,checksum FROM _migrations.applied WHERE id<>'006-session-lifecycle' ORDER BY id")).rows;
  const down=await readFile('services/workspace/migrations/006-session-lifecycle.down.sql','utf8');
  await owner(`${down};DELETE FROM _migrations.applied WHERE id='006-session-lifecycle'`);db.migrate();db.migrate();
  assert.deepEqual((await db.admin.query("SELECT id,checksum FROM _migrations.applied WHERE id<>'006-session-lifecycle' ORDER BY id")).rows,before);
 });
 await operator.provision(user,'synthetic-p10-user',new ScryptVerifier().dummyCredential,'synthetic-p10-operator');
 const state=await operator.state();await operator.recover({expectedGeneration:state.generation,expectedLastObserved:state.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-p10-attestation',operatorRef:'synthetic-p10-operator'});
 // Deterministic future timestamps are confined to this repository constructor, never runtime configuration.
 let now='2035-01-01T00:00:00.000000Z',day=0;
 const store=new WorkspaceSessionStore(db.runtime,policy,async()=>now);
 const app=buildApp({store,origin});t.after(()=>app.close());await app.ready();
 const get=token=>app.inject({url:'/session',headers:{cookie:`${SESSION_COOKIE}=${token}`}});
 const logout=(token,extra={})=>app.inject({method:'DELETE',url:'/session',headers:{...headers,...(token?{cookie:`${SESSION_COOKIE}=${token}`}:{})},...extra});
 const snapshot=async id=>(await db.admin.query('SELECT s.revoked,s.revision::text,s.expires_at::text,t.absolute_expires_at::text FROM workspace.session s JOIN workspace.session_token t USING(session_id) WHERE session_id=$1',[id])).rows[0];
 const events=async(id,action)=>(await db.admin.query('SELECT count(*)::int n FROM workspace.authentication_audit WHERE entity_id=$1 AND action=$2',[id,action])).rows[0].n;
 async function fresh(){day++;now=`2035-01-${String(day).padStart(2,'0')}T00:00:00.000000Z`;const r=await store.establish(user,'1');assert.equal(r.kind,'created');return r;}
 async function waiting(fragment){
  const end=performance.now()+800;while(performance.now()<end){if((await db.admin.query("SELECT 1 FROM pg_stat_activity WHERE usename='workspace_app' AND wait_event_type='Lock' AND position($1 in query)>0",[fragment])).rowCount)return;await new Promise(r=>setTimeout(r,5));}
  throw new Error('Actual PostgreSQL barrier was not reached');
 }
 async function rejectAudit(action,work){
  await owner(`CREATE FUNCTION workspace.p10_reject_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='${action}' THEN RAISE EXCEPTION 'synthetic-p10-audit-canary'; END IF; RETURN NEW; END $$;CREATE TRIGGER p10_reject_audit BEFORE INSERT ON workspace.authentication_audit FOR EACH ROW EXECUTE FUNCTION workspace.p10_reject_audit()`);
  try{await work();}finally{await owner('DROP TRIGGER p10_reject_audit ON workspace.authentication_audit;DROP FUNCTION workspace.p10_reject_audit()');}
 }
 function unavailable(r){assert.equal(r.statusCode,503);assert.equal(r.json().code,'access_unavailable');assert.equal(r.headers['set-cookie'],undefined);assert.equal(r.body.includes('canary'),false);}
 await t.test('GET renews from DB deadline, preserves token, captures audit and refreshes secure cookie',async()=>{
  const r=await fresh(),before=await snapshot(r.session.sessionId);now=now.replace('00:00:00','00:10:00');
  const response=await get(r.token);assert.equal(response.statusCode,200);assert.equal(response.json().expires_at,now.replace('00:10:00','00:40:00'));assert.equal(response.cookies[0].value,r.token);
  const set=response.headers['set-cookie'];for(const flag of ['Secure','HttpOnly','SameSite=Strict','Path=/','Expires='])assert(set.includes(flag));assert(!set.includes('Domain='));assert(!set.includes('Max-Age='));
  const after=await snapshot(r.session.sessionId);assert.equal(after.absolute_expires_at,before.absolute_expires_at);assert.equal(BigInt(after.revision),BigInt(before.revision)+1n);assert.equal(await events(r.session.sessionId,'session_renewed'),1);
 });
 await t.test('idle boundary is strict at microsecond precision; expired GET cannot revive it',async()=>{
  const r=await fresh();now=now.replace('00:00:00.000000','00:29:59.999999');assert.equal((await store.inspect(r.token)).kind,'authenticated');
  const before=await snapshot(r.session.sessionId);now=now.replace('00:29:59.999999','00:30:00.000000');assert.equal((await get(r.token)).statusCode,401);assert.deepEqual(await snapshot(r.session.sessionId),before);assert.equal(await events(r.session.sessionId,'session_renewed'),0);
 });
 await t.test('absolute cap never slides; equal/repeated/parallel renewal at cap writes no false mutation',async()=>{
  const r=await fresh();await db.admin.query("UPDATE workspace.session s SET expires_at=t.absolute_expires_at-interval '1 second' FROM workspace.session_token t WHERE s.session_id=t.session_id AND s.session_id=$1",[r.session.sessionId]);
  now=now.replace('00:00:00.000000','07:59:58.999999');assert.equal((await get(r.token)).statusCode,200);
  const before=await snapshot(r.session.sessionId);assert.equal(before.expires_at,before.absolute_expires_at);assert.equal(await events(r.session.sessionId,'session_renewed'),1);
  now=now.replace('07:59:58.999999','07:59:59.999999');
  for(const result of await Promise.all([get(r.token),get(r.token)]))assert.equal(result.statusCode,200);
  assert.deepEqual(await snapshot(r.session.sessionId),before);assert.equal(await events(r.session.sessionId,'session_renewed'),1);
  now=now.replace('07:59:59.999999','08:00:00.000000');assert.equal((await get(r.token)).statusCode,401);
 });
 await t.test('parallel renewals produce one extension and one audit, with an immutable absolute deadline',async()=>{
  const r=await fresh(),before=await snapshot(r.session.sessionId);now=now.replace('00:00:00','00:15:00');
  const results=await Promise.all([get(r.token),get(r.token),get(r.token)]);for(const response of results)assert.equal(response.statusCode,200);
  assert.equal(new Set(results.map(r=>r.json().expires_at)).size,1);assert.equal(await events(r.session.sessionId,'session_renewed'),1);assert.equal(BigInt((await snapshot(r.session.sessionId)).revision),BigInt(before.revision)+1n);
 });
 await t.test('DELETE checks Origin/header and absent body, including bounded transport errors',async()=>{
  const r=await fresh();for(const h of [{},{origin},{origin:'https://outside.invalid','x-sacw-request':'1'}]){const denied=await logout(r.token,{headers:{...h,cookie:`${SESSION_COOKIE}=${r.token}`}});assert.equal(denied.statusCode,403);assert.equal(denied.headers['set-cookie'],undefined);}
  assert.equal((await logout(r.token,{payload:{actor_id:user}})).statusCode,400);
  assert.equal((await logout(r.token,{payload:{large:'x'.repeat(9000)}})).statusCode,413);
  assert.equal((await logout(r.token,{headers:{...headers,'content-type':'application/octet-stream'},payload:'synthetic'})).statusCode,415);
  assert.equal((await snapshot(r.session.sessionId)).revoked,false);
 });
 await t.test('logout commits before empty 204, clears host cookie, denies old token and preserves independent session',async()=>{
  const r=await fresh(),other=await store.establish(user,'1');const response=await logout(r.token);
  assert.equal(response.statusCode,204);assert.equal(response.body,'');assert.equal(response.headers['cache-control'],'no-store');assert.equal(response.cookies[0].value,'');for(const flag of ['Secure','HttpOnly','SameSite=Strict','Path=/'])assert(response.headers['set-cookie'].includes(flag));assert(!response.headers['set-cookie'].includes('Domain='));assert(Date.parse(response.cookies[0].expires)<Date.now());
  assert.equal((await get(r.token)).statusCode,401);assert.equal((await get(other.token)).statusCode,200);
  const before=await snapshot(r.session.sessionId);for(const token of [r.token,'forged',undefined,Buffer.alloc(32,1).toString('base64url')]){const repeated=await logout(token);assert.equal(repeated.statusCode,204);assert.equal(repeated.body,'');}
  assert.deepEqual(await snapshot(r.session.sessionId),before);assert.equal(await events(r.session.sessionId,'session_revoked'),1);
 });
 await t.test('expired logout is idempotent 204 and still durably revokes the known session',async()=>{
  const r=await fresh();now=now.replace('00:00:00','00:30:00');assert.equal((await logout(r.token)).statusCode,204);assert.equal((await snapshot(r.session.sessionId)).revoked,true);assert.equal((await get(r.token)).statusCode,401);
 });
 await t.test('renew and revoke audit failures roll back state and suppress success cookies',async()=>{
  const r=await fresh();now=now.replace('00:00:00','00:10:00');const before=await snapshot(r.session.sessionId);
  for(const [action,operation] of [['session_renewed',()=>get(r.token)],['session_revoked',()=>logout(r.token)]])await rejectAudit(action,async()=>{unavailable(await operation());assert.deepEqual(await snapshot(r.session.sessionId),before);assert.equal(await events(r.session.sessionId,action),0);});
  assert.equal((await get(r.token)).statusCode,200);assert.equal(db.runtime.waitingCount,0);
 });
 await t.test('logout-first and renewal-first reach actual SQL lock barriers; confirmed logout always wins future reads',async()=>{
  for(const first of ['logout','renew']){
   const r=await fresh();now=now.replace('00:00:00','00:10:00');const blocker=await db.admin.connect();let a,b;
   try{
    await blocker.query('BEGIN');await blocker.query('SELECT user_id FROM workspace.auth_account WHERE user_id=$1 FOR UPDATE',[user]);
    a=first==='logout'?store.revoke(r.token):store.renew(r.token);await waiting('lock_auth_account');
    b=first==='logout'?store.renew(r.token):store.revoke(r.token);await waiting('auth_clock_state');await blocker.query('COMMIT');
    const [one,two]=await Promise.all([a,b]);assert.equal(one.kind,first==='logout'?'signed_out':'authenticated');assert.equal(two.kind,first==='logout'?'unauthenticated':'signed_out');assert.equal((await get(r.token)).statusCode,401);assert.equal(await events(r.session.sessionId,'session_revoked'),1);
   }finally{await blocker.query('ROLLBACK');blocker.release();await Promise.allSettled([a,b]);}
  }
 });
 await t.test('renewal queued before expiry samples after its lock wait and cannot resurrect expired state',async()=>{
  const r=await fresh(),blocker=await db.admin.connect();let pending;
  try{await blocker.query('BEGIN');await blocker.query('SELECT singleton FROM workspace.auth_clock_state FOR UPDATE');pending=store.renew(r.token);await waiting('auth_clock_state');now=now.replace('00:00:00','00:30:00');await blocker.query('COMMIT');assert.equal((await pending).kind,'unauthenticated');assert.equal(await events(r.session.sessionId,'session_renewed'),0);}finally{await blocker.query('ROLLBACK');blocker.release();await Promise.allSettled([pending]);}
 });
 await t.test('receipt loss after actual COMMIT returns 503 without cookie; no automatic retry or false logout confirmation',async()=>{
  for(const action of ['renew','logout']){
   const r=await fresh();now=now.replace('00:00:00','00:10:00');const connect=db.runtime.connect.bind(db.runtime);
   db.runtime.connect=async()=>{const c=await connect(),query=c.query.bind(c);c.query=async(...args)=>{const result=await query(...args);if(args[0]==='COMMIT'){c.query=query;throw new Error('synthetic receipt loss');}return result;};return c;};
   try{unavailable(await(action==='renew'?get(r.token):logout(r.token)));}finally{db.runtime.connect=connect;}
   assert.equal(await events(r.session.sessionId,action==='renew'?'session_renewed':'session_revoked'),1);assert.equal(db.runtime.waitingCount,0);
  }
 });
 await t.test('response corruption suppresses GET cookie rather than projecting leaked fields',async()=>{
  const r=await fresh(),checked=buildApp({store,origin});checked.addHook('preSerialization',async(_req,reply,payload)=>reply.statusCode===200?{...payload,token:'synthetic-canary'}:payload);
  try{unavailable(await checked.inject({url:'/session',headers:{cookie:`${SESSION_COOKIE}=${r.token}`}}));}finally{await checked.close();}
 });
 await t.test('real trusted HTTPS DELETE transmits an empty 204 and expiring Secure host cookie',async()=>{
  const r=await fresh(),cert=await readFile('.tmp/local-https/localhost.crt'),key=await readFile('.tmp/local-https/localhost.key'),https=buildApp({store,origin,tls:{cert,key}});
  try{await https.listen({host:'127.0.0.1',port:0});const response=await new Promise((resolve,reject)=>{const req=request({host:'127.0.0.1',port:https.server.address().port,path:'/session',method:'DELETE',ca:cert,headers:{...headers,cookie:`${SESSION_COOKIE}=${r.token}`}},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));});req.on('error',reject);req.end();});assert.equal(response.status,204);assert.equal(response.body,'');assert(response.headers['set-cookie'][0].includes('Secure'));assert.equal((await get(r.token)).statusCode,401);}finally{await https.close();}
 });
 await t.test('observed backward time latches renewal denial after catch-up; audited logout remains possible',async()=>{
  const r=await fresh();now=now.replace('00:00:00','00:10:00');assert.equal((await get(r.token)).statusCode,200);
  const before=await snapshot(r.session.sessionId);now=now.replace('00:10:00','00:09:59');unavailable(await get(r.token));assert.equal((await operator.state()).healthy,false);assert.deepEqual(await snapshot(r.session.sessionId),before);
  now=now.replace('00:09:59','00:11:00');unavailable(await get(r.token));assert.equal((await logout(r.token)).statusCode,204);
  const state=await operator.state();await operator.recover({expectedGeneration:state.generation,expectedLastObserved:state.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-p10-recovery',operatorRef:'synthetic-p10-operator'});
 });
 await t.test('missing clock denies known logout; failed clock denies renewal but still permits audited revocation',async()=>{
  const r=await fresh();await db.admin.query('DELETE FROM workspace.auth_clock_state');unavailable(await get(r.token));unavailable(await logout(r.token));assert.equal((await snapshot(r.session.sessionId)).revoked,false);
  await db.admin.query('INSERT INTO workspace.auth_clock_state(singleton,last_observed,healthy) VALUES(true,$1,false)',[now]);unavailable(await get(r.token));assert.equal((await logout(r.token)).statusCode,204);assert.equal((await operator.state()).healthy,false);
 });
 await t.test('DB privilege failure refuses logout; retained audit refuses destructive lifecycle rollback',async()=>{
  await db.admin.query('REVOKE SELECT ON workspace.session_token FROM workspace_app');try{unavailable(await logout(Buffer.alloc(32,1).toString('base64url')));}finally{await db.admin.query('GRANT SELECT ON workspace.session_token TO workspace_app');}
  await assert.rejects(owner(await readFile('services/workspace/migrations/006-session-lifecycle.down.sql','utf8')),error=>error.cause?.code==='23514');
  assert.equal((await db.admin.query("SELECT count(*)::int n FROM _migrations.applied WHERE id='006-session-lifecycle'")).rows[0].n,1);
 });
 t.diagnostic(JSON.stringify({container:db.name,image:db.image,scope:'Actual P10 GET/DELETE, owned PostgreSQL and HTTPS; injected time separated from real DB time; browser/D-07 not verified'}));
});
