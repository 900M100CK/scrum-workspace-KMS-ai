import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {Writable} from 'node:stream';
import {request} from 'node:https';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {sessionFixture} from './fixture.mjs';
import {buildApp} from '../../services/workspace/src/app.ts';
import {WorkspaceSessionStore,WorkspaceSessionOperator} from '../../services/workspace/src/session/store.ts';
import {ScryptVerifier,KdfBusy} from '../../services/workspace/src/session/kdf.ts';
import {SESSION_COOKIE} from '../../services/workspace/src/session/http.ts';
import {loadContractSchemas} from '../../scripts/contract-schemas.mjs';

const origin='https://localhost:5173',headers={origin,'x-sacw-request':'1'};
test('P09 actual signIn/getSession handlers with owned PostgreSQL',{timeout:180000},async t=>{
 const db=await sessionFixture();t.after(()=>db.close());const store=new WorkspaceSessionStore(db.runtime,{idleSeconds:1800,absoluteSeconds:28800}),operator=new WorkspaceSessionOperator(db.admin),kdf=new ScryptVerifier();
 const alice=randomUUID(),bob=randomUUID(),password='synthetic-P09-login-password';
 await operator.provision(alice,'synthetic-alice',await kdf.hash(password),'synthetic-p09-operator');await operator.provision(bob,'synthetic-bob',await kdf.hash(password),'synthetic-p09-operator');
 const state=await operator.state();await operator.recover({expectedGeneration:state.generation,expectedLastObserved:state.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-p09-time',operatorRef:'synthetic-p09-operator'});
 let logs='',work=0;const stream=new Writable({write(chunk,_encoding,done){logs+=chunk;done();}});
 const verifier={dummyCredential:kdf.dummyCredential,verify(...args){work++;return kdf.verify(...args);}};
 const app=buildApp({store,verifier,origin,logStream:stream});t.after(()=>app.close());const contexts=[];const bodies=new Map();
 app.addHook('preValidation',async req=>{bodies.set(req.id,JSON.stringify(req.body));});
 app.addHook('onResponse',async req=>{if(bodies.has(req.id))assert.equal(JSON.stringify(req.body)===bodies.get(req.id),true,'parsed request mutated');contexts.push({id:req.id,context:req.sessionContext});});
 await app.ready();const contract=await loadContractSchemas('workspace');
 const post=(payload={username:'synthetic-alice',password},extra={})=>app.inject({method:'POST',url:'/session',headers:{...headers,...extra},payload});
 const get=cookie=>app.inject({url:'/session',...(cookie?{headers:{cookie}}:{})});
 const schema=(response,name)=>{assert.equal(contract.validators.get(name)(response.json()),true,'response violates actual contract');};
 const count=async()=>BigInt((await db.admin.query('SELECT count(*) FROM workspace.session')).rows[0].count);
 let cookie,token;
 await t.test('invalid/excess/poisoned credential bodies reject before KDF or session writes without mutation',async()=>{
  const start=await count(),beforeWork=work;
  for(const payload of [{username:'synthetic-alice'},{username:'',password},{email:'synthetic@example.invalid',password},{username:'synthetic-alice',password,actor_id:bob},{username:['synthetic-alice'],password},{username:'synthetic-alice',password:{bad:true}}]){const r=await post(payload);assert.equal(r.statusCode,400);schema(r,'Error');assert.equal(r.headers['set-cookie']===undefined,true,'unexpected cookie header');}
  for(const key of ['__proto__','constructor']){const r=await app.inject({method:'POST',url:'/session',headers:{...headers,'content-type':'application/json'},payload:`{"username":"synthetic-alice","password":"${password}","${key}":{"polluted":true}}`});assert.equal(r.statusCode,400);schema(r,'Error');}
  assert.equal({}.polluted,undefined);assert.equal(work,beforeWork);assert.equal(await count(),start);
 });
 await t.test('Origin/custom-header negatives do not reach credentials; configured transport errors have Error shape',async()=>{
  const start=work;for(const h of [{},{origin},{origin:'https://outside.invalid','x-sacw-request':'1'}]){const r=await app.inject({method:'POST',url:'/session',headers:h,payload:{username:'synthetic-alice',password}});assert.equal(r.statusCode,403);schema(r,'Error');assert.equal(r.headers['cache-control'],'no-store');}
  const large=await post({username:'synthetic-alice',password:'x'.repeat(9000)});assert.equal(large.statusCode,413);schema(large,'Error');
  const media=await app.inject({method:'POST',url:'/session',headers:{...headers,'content-type':'application/octet-stream'},payload:'synthetic'});assert.equal(media.statusCode,415);schema(media,'Error');assert.equal(work,start);
 });
 await t.test('known wrong and unknown credentials run KDF and have identical generic failures with no session',async()=>{
  const start=await count(),before=work;
  const a=await post({username:'synthetic-alice',password:'synthetic-wrong-canary'}),b=await post({username:'synthetic-unknown',password:'synthetic-wrong-canary'});
  assert.equal(a.statusCode,401);assert.equal(b.statusCode,401);assert.equal(a.body,b.body);schema(a,'Error');assert.equal(work-before,2);assert.equal(await count(),start);
  const nul=await post({username:'\0',password});assert.equal(nul.statusCode,401);
 });
 await t.test('valid login commits session/audit, issues fresh secure host-only cookie and server request correlation',async()=>{
  const r=await post(undefined,{cookie:`${SESSION_COOKIE}=synthetic-fixed-value`,'request-id':'forged-request-id'});assert.equal(r.statusCode,200);schema(r,'Session');
  assert.deepEqual(Object.keys(r.json()).sort(),['expires_at','user_id']);assert.equal(r.json().user_id,alice);assert.equal(r.headers['cache-control'],'no-store');
  const set=r.headers['set-cookie'];for(const flag of ['HttpOnly','Secure','SameSite=Strict','Path=/','Expires='])assert(set.includes(flag));assert.equal(set.includes('Domain='),false);
  token=r.cookies[0].value;cookie=set.split(';')[0];assert.equal(token==='synthetic-fixed-value',false);assert.equal(r.body.includes(token),false);
  const last=contexts.at(-1);assert.equal(last.context.userId,alice);assert.notEqual(last.id,'forged-request-id');assert.equal((await db.admin.query("SELECT actor_user_id,correlation_id FROM workspace.authentication_audit WHERE action='session_created' ORDER BY observed_at DESC LIMIT 1")).rows[0].correlation_id,last.id);
 });
 await t.test('GET actor comes only from cookie; forged headers/query/old cookie name do not grant identity',async()=>{
  const r=await app.inject({url:'/session?actor_id='+bob+'&token=synthetic-url-log-canary',headers:{cookie,'x-actor-id':bob,'x-actor-session':'forged','authorization':'Bearer forged'}});assert.equal(r.statusCode,200);schema(r,'Session');assert.equal(r.json().user_id,alice);assert.equal(contexts.at(-1).context.userId,alice);
  for(const h of [{},{cookie:'session='+token},{cookie:`${SESSION_COOKIE}=forged`},{cookie:`${cookie}; ${cookie}`},{'x-actor-session':token}]){const bad=await app.inject({url:'/session',headers:h});assert.equal(bad.statusCode,401);schema(bad,'Error');assert.equal(contexts.at(-1).context,null);}
 });
 await t.test('manual disable rejects current token and credentials with the same public failure',async()=>{
  const b=await post({username:'synthetic-bob',password});assert.equal(b.statusCode,200);const old=b.headers['set-cookie'].split(';')[0];await operator.disable(bob,'synthetic-p09-operator');assert.equal((await get(old)).statusCode,401);
  const before=work,disabled=await post({username:'synthetic-bob',password}),unknown=await post({username:'unknown',password});assert.equal(disabled.statusCode,401);assert.equal(disabled.body,unknown.body);assert.equal(work-before,2);
 });
 await t.test('real expired and revoked sessions deny GET with declared shape',async()=>{
  const r=await post();const session=(await db.admin.query('SELECT session_id FROM workspace.session WHERE user_id=$1 ORDER BY expires_at DESC LIMIT 1',[alice])).rows[0];
  await db.admin.query("UPDATE workspace.session SET expires_at=(SELECT created_at+interval '1 microsecond' FROM workspace.session_token WHERE session_id=$1) WHERE session_id=$1",[session.session_id]);const bad=await get(r.headers['set-cookie'].split(';')[0]);assert.equal(bad.statusCode,401);schema(bad,'Error');
  await db.admin.query('UPDATE workspace.session SET revoked=true WHERE user_id=$1',[alice]);assert.equal((await get(cookie)).statusCode,401);
 });
 await t.test('real session audit failure rolls back and never sends a success cookie',async()=>{
  await db.admin.query("CREATE FUNCTION workspace.p09_reject_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='session_created' THEN RAISE EXCEPTION 'synthetic sensitive DB detail'; END IF; RETURN NEW; END $$; CREATE TRIGGER p09_reject_audit BEFORE INSERT ON workspace.authentication_audit FOR EACH ROW EXECUTE FUNCTION workspace.p09_reject_audit()");
  const start=await count();try{const r=await post();assert.equal(r.statusCode,503);schema(r,'Error');assert.equal(r.headers['set-cookie']===undefined,true,'unexpected cookie header');assert.equal(await count(),start);assert.equal(r.body.includes('sensitive'),false);}finally{await db.admin.query('DROP TRIGGER p09_reject_audit ON workspace.authentication_audit;DROP FUNCTION workspace.p09_reject_audit()');}
 });
 await t.test('DB read failures and unready clock return unavailable, never unrestricted success',async()=>{
  await db.admin.query('REVOKE SELECT ON workspace.auth_account FROM workspace_app');try{const r=await post();assert.equal(r.statusCode,503);schema(r,'Error');assert.equal(r.headers['set-cookie']===undefined,true,'unexpected cookie header');}finally{await db.admin.query('GRANT SELECT ON workspace.auth_account TO workspace_app');}
  const r=await post();const fresh=r.headers['set-cookie'].split(';')[0];await db.admin.query("UPDATE workspace.auth_clock_state SET last_observed=clock_timestamp()+interval '1 day'");const denied=await get(fresh);assert.equal(denied.statusCode,503);schema(denied,'Error');assert.equal((await post()).statusCode,503);
 });
 await t.test('KDF saturation maps to declared 503 without creating a session',async()=>{
  const busy=buildApp({store,origin,verifier:{dummyCredential:kdf.dummyCredential,async verify(){throw new KdfBusy();}}});try{const r=await busy.inject({method:'POST',url:'/session',headers,payload:{username:'synthetic-alice',password}});assert.equal(r.statusCode,503);schema(r,'Error');assert.equal(r.headers['set-cookie']===undefined,true,'unexpected cookie header');}finally{await busy.close();}
 });
 await t.test('actual captured normal/error logs omit password, cookie, URL and internal error canaries',async()=>{
  await new Promise(resolve=>setImmediate(resolve));assert(logs.length>0);for(const secret of [password,token,'synthetic-wrong-canary','synthetic-url-log-canary','synthetic sensitive DB detail'])assert.equal(logs.includes(secret),false,'secret appeared in captured log');
 });
 await t.test('actual trusted HTTPS verifies success wire shape and cookie expiry',async()=>{
  const state=await operator.state();await operator.recover({expectedGeneration:state.generation,expectedLastObserved:state.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-p09-https-recovery',operatorRef:'synthetic-p09-operator'});
  const cert=await readFile(process.env.SACW_DEV_TLS_CERT??'.tmp/local-https/localhost.crt'),key=await readFile(process.env.SACW_DEV_TLS_KEY??'.tmp/local-https/localhost.key');
  const https=buildApp({store,origin,tls:{cert,key}});try{await https.listen({host:'127.0.0.1',port:0});const port=https.server.address().port;
   const r=await new Promise((resolve,reject)=>{const req=request({host:'127.0.0.1',port,path:'/session',method:'POST',ca:cert,headers:{...headers,'content-type':'application/json'}},res=>{let body='';res.on('data',chunk=>body+=chunk);res.on('end',()=>resolve({status:res.statusCode,body,headers:res.headers}));});req.on('error',reject);req.end(JSON.stringify({username:'synthetic-alice',password}));});
   assert.equal(r.status,200);assert.equal(contract.validators.get('Session')(JSON.parse(r.body)),true);const set=r.headers['set-cookie'][0];assert(set.includes('Secure'));assert(set.includes('HttpOnly'));assert(set.includes('SameSite=Strict'));assert(!set.includes('Domain='));
   const expiry=/Expires=([^;]+)/.exec(set)[1];assert.equal(Date.parse(expiry),Math.floor(Date.parse(JSON.parse(r.body).expires_at)/1000)*1000);
  }finally{await https.close();}
 });
 await t.test('invalid internal output is withheld before projection and drops already-prepared cookie',async()=>{
  const checked=buildApp({store,origin});checked.addHook('preSerialization',async(_req,reply,payload)=>{if(reply.statusCode===200)return {...payload,token:'synthetic-output-canary'};return payload;});
  try{const r=await checked.inject({method:'POST',url:'/session',headers,payload:{username:'synthetic-alice',password}});assert.equal(r.statusCode,503);schema(r,'Error');assert.equal(r.headers['set-cookie']===undefined,true,'unexpected cookie header');assert.equal(r.body.includes('synthetic-output-canary'),false);}finally{await checked.close();}
 });
 await t.test('compiled server actually wires runtime credentials/origin and session routes',async()=>{
  const probe=createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
  const child=spawn(process.execPath,['services/workspace/dist/server.js'],{env:{...process.env,...db.runtimeEnvironment,SACW_SESSION_ORIGIN:origin,PORT:String(port)},stdio:['ignore','pipe','pipe'],windowsHide:true});let output='';child.stdout.on('data',chunk=>output+=chunk);child.stderr.on('data',chunk=>output+=chunk);
  try{const deadline=Date.now()+8000;while(true){try{const r=await fetch(`http://127.0.0.1:${port}/healthz`,{signal:AbortSignal.timeout(500)});if(r.status===200)break;}catch{}if(child.exitCode!==null||Date.now()>deadline)throw new Error('Compiled server failed readiness smoke');await new Promise(resolve=>setTimeout(resolve,20));}
   const r=await fetch(`http://127.0.0.1:${port}/session`,{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify({username:'synthetic-alice',password})});assert.equal(r.status,200);assert.equal(contract.validators.get('Session')(await r.json()),true);assert.equal(Boolean(r.headers.get('set-cookie')?.includes('Secure')),true);assert.equal(output.includes(password)||output.includes(db.runtimeEnvironment.SACW_WORKSPACE_DATABASE_URL),false);
  }finally{if(child.exitCode===null){const exited=new Promise(resolve=>child.once('exit',resolve));child.kill();await exited;}}
 });
 t.diagnostic(JSON.stringify({container:db.name,image:db.image,scope:'Actual P09 POST/GET plus real PostgreSQL; no logout/renewal/browser/D-07 acceptance'}));
});
