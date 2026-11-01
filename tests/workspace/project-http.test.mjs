import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {request} from 'node:https';
import {sessionFixture} from './fixture.mjs';
import {WorkspaceSessionStore,WorkspaceSessionOperator} from '../../services/workspace/src/session/store.ts';
import {WorkspaceProjectOperator} from '../../services/workspace/src/projects/operator.ts';
import {WorkspaceProjectStore} from '../../services/workspace/src/projects/store.ts';
import {ownedTransaction} from '../../services/workspace/src/session/database.ts';
import {buildApp} from '../../services/workspace/src/app.ts';
import {SESSION_COOKIE} from '../../services/workspace/src/session/http.ts';
import {ScryptVerifier} from '../../services/workspace/src/session/kdf.ts';

test('P04C real project create, exact replay and failure boundaries',{timeout:150000},async t=>{
 const db=await sessionFixture({through:'008'});t.after(()=>db.close());const authOperator=new WorkspaceSessionOperator(db.admin),operator=new WorkspaceProjectOperator(db.admin);
 const user=randomUUID(),other=randomUUID(),sessions=new WorkspaceSessionStore(db.runtime,{idleSeconds:1800,absoluteSeconds:28800}),projects=new WorkspaceProjectStore(db.runtime,sessions),origin='https://localhost';
 for(const[id,name]of [[user,'synthetic-project-a'],[other,'synthetic-project-b']])await authOperator.provision(id,name,new ScryptVerifier().dummyCredential,'synthetic-operator');
 const clock=await authOperator.state();await authOperator.recover({expectedGeneration:clock.generation,expectedLastObserved:clock.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-project-time',operatorRef:'synthetic-operator'});
 const a=await sessions.establish(user,'1'),b=await sessions.establish(other,'1');assert.equal(a.kind,'created');assert.equal(b.kind,'created');
 const app=buildApp({store:sessions,projects,origin});await app.ready();t.after(()=>app.close());
 const headers=token=>({origin,'x-sacw-request':'1',cookie:`${SESSION_COOKIE}=${token}`,'idempotency-key':'create-one'});
 const create=(payload={name:'First project'},key='create-one',token=a.token,extra={})=>app.inject({method:'POST',url:'/projects',headers:{...headers(token),'idempotency-key':key,...extra},payload});
 const count=async()=>(await db.admin.query('SELECT count(*) n FROM workspace.project')).rows[0].n;
 let first;
 await t.test('denied, unauthenticated, forged/extra/blank inputs create no project',async()=>{
  assert.equal((await create()).statusCode,403);assert.equal((await create({name:'Forged'},'k','forged')).statusCode,401);
  for(const input of [{name:'Valid',actor_id:other},{name:'   '},{name:'Valid',role:'admin'}])assert.equal((await create(input)).statusCode,400);
  assert.equal((await create({name:'Valid'},'k',a.token,{origin:'https://foreign.invalid'})).statusCode,403);
  assert.equal(await count(),'0');
 });
 await operator.global(user,true,'0','synthetic-operator','fixture create authority');
 await t.test('atomic creation persists server actor/time and only explicit initial capability',async()=>{
  const result=await create();assert.equal(result.statusCode,201,result.body);first=result.json();assert.deepEqual(Object.keys(first).sort(),['description','name','project_id','revision']);assert.equal(first.revision,1);
  const stored=(await db.admin.query('SELECT created_by,created_at FROM workspace.project WHERE project_id=$1',[first.project_id])).rows[0];assert.equal(stored.created_by,user);assert(stored.created_at instanceof Date);
  const grants=(await db.admin.query('SELECT action,subject_id FROM workspace.capability_grant WHERE project_id=$1 AND valid',[first.project_id])).rows;assert.deepEqual(grants,[{action:'membership-manage',subject_id:user}]);
  assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.read_grant')).rows[0].n,'0');
 });
 await t.test('same/concurrent keys return original project once; changed payload conflicts',async()=>{
  for(const r of await Promise.all([create(),create()])){assert.equal(r.statusCode,201);assert.deepEqual(r.json(),first);}
  assert.equal(await count(),'1');assert.equal((await create({name:'Different'})).statusCode,409);
  assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.business_audit WHERE action='project_created'")).rows[0].n,'1');
 });
 await t.test('audit and outcome failures roll back the entire business transaction',async()=>{
  for(const table of ['business_audit','idempotency_record']){
   await ownedTransaction(db.admin,'operator',c=>c.query(`CREATE FUNCTION workspace.reject_project_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic-private-canary'; END $$;CREATE TRIGGER reject_project_test BEFORE INSERT ON workspace.${table} FOR EACH ROW EXECUTE FUNCTION workspace.reject_project_test()`));
   try{const result=await create({name:'Must rollback'},`fail-${table}`);assert.equal(result.statusCode,503);assert(!result.body.includes('canary'));assert.equal(await count(),'1');}finally{await db.admin.query(`DROP TRIGGER reject_project_test ON workspace.${table};DROP FUNCTION workspace.reject_project_test()`);}
  }
 });
 await t.test('lost COMMIT acknowledgement is unknown and same-key retry reconciles without a second create',async()=>{
  const connect=db.runtime.connect.bind(db.runtime);let injected=false;
  db.runtime.connect=async()=>{const client=await connect(),query=client.query.bind(client);client.query=async(...args)=>{const result=await query(...args);if(args[0]==='COMMIT'&&!injected){injected=true;throw new Error('synthetic-lost-commit');}return result;};return client;};
  try{assert.equal((await create({name:'Unknown outcome'},'lost')).statusCode,503);}finally{db.runtime.connect=connect;}
  assert.equal(await count(),'2');const replay=await create({name:'Unknown outcome'},'lost');assert.equal(replay.statusCode,201);assert.equal(await count(),'2');
 });
 await t.test('current authority and membership are rechecked before old result disclosure',async()=>{
  await operator.global(user,false,'1','synthetic','revoke creator authority');assert.equal((await create()).statusCode,403);
  await operator.global(user,true,'2','synthetic','restore explicit authority');
  await db.admin.query('UPDATE workspace.membership SET active=false,membership_generation=2,revision=2 WHERE project_id=$1',[first.project_id]);
  const denial=await create();assert.equal(denial.statusCode,404);assert.deepEqual(denial.json(),{code:'not_found',message:'Resource unavailable'});
 });
 await t.test('declared body bounds and final serializer reject untrusted/error shapes',async()=>{
  assert.equal((await create({name:'x'.repeat(9000)},'oversize')).statusCode,413);
  assert.equal((await app.inject({method:'POST',url:'/projects',headers:{...headers(a.token),'content-type':'application/x-custom'},payload:'x'})).statusCode,415);
  const corrupt=buildApp({projects,store:sessions,origin});corrupt.addHook('preSerialization',async(_q,r,value)=>r.statusCode===201?{...value,secret:'synthetic-leak'}:value);await corrupt.ready();
  try{const response=await corrupt.inject({method:'POST',url:'/projects',headers:{...headers(a.token),'idempotency-key':'corrupt'},payload:{name:'Corrupt response'}});assert.equal(response.statusCode,503);assert(!response.body.includes('synthetic-leak'));}finally{await corrupt.close();}
 });
 await t.test('actual trusted HTTPS transports a project response with no session cookie rewrite',async()=>{
  const cert=await readFile('.tmp/local-https/localhost.crt'),key=await readFile('.tmp/local-https/localhost.key'),tls=buildApp({projects,store:sessions,origin,tls:{cert,key}});await tls.listen({host:'127.0.0.1',port:0});
  try{const response=await new Promise((resolve,reject)=>{const req=request({host:'127.0.0.1',port:tls.server.address().port,path:'/projects',method:'POST',ca:cert,headers:{...headers(a.token),'idempotency-key':'tls','content-type':'application/json'}},res=>{let body='';res.on('data',b=>body+=b);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));});req.on('error',reject);req.end(JSON.stringify({name:'TLS project'}));});assert.equal(response.status,201,response.body);assert.equal(response.headers['cache-control'],'no-store');assert.equal(response.headers['set-cookie'],undefined);}finally{await tls.close();}
 });
});
