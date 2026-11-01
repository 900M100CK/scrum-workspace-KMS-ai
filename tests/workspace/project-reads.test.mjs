import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {sessionFixture} from './fixture.mjs';
import {WorkspaceSessionStore,WorkspaceSessionOperator} from '../../services/workspace/src/session/store.ts';
import {WorkspaceProjectStore} from '../../services/workspace/src/projects/store.ts';
import {buildApp} from '../../services/workspace/src/app.ts';
import {SESSION_COOKIE} from '../../services/workspace/src/session/http.ts';
import {ScryptVerifier} from '../../services/workspace/src/session/kdf.ts';

test('P04 current project reads and full-projection watermarks',{timeout:150000},async t=>{
 const db=await sessionFixture({through:'008'});t.after(()=>db.close());const operator=new WorkspaceSessionOperator(db.admin),user=randomUUID(),other=randomUUID();
 for(const[id,name]of [[user,'synthetic-read-a'],[other,'synthetic-read-b']])await operator.provision(id,name,new ScryptVerifier().dummyCredential,'synthetic');
 const clock=await operator.state();await operator.recover({expectedGeneration:clock.generation,expectedLastObserved:clock.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-read-time',operatorRef:'synthetic'});
 const sessions=new WorkspaceSessionStore(db.runtime,{idleSeconds:1800,absoluteSeconds:28800}),a=await sessions.establish(user,'1'),b=await sessions.establish(other,'1');
 const key={kid:'synthetic-v1',key:Buffer.alloc(32,19)},projects=new WorkspaceProjectStore(db.runtime,sessions,key),app=buildApp({projects,store:sessions,origin:'https://localhost'});await app.ready();t.after(()=>app.close());
 const rows=(await db.admin.query("INSERT INTO workspace.project(project_id,name,created_by,created_at) SELECT gen_random_uuid(),'Synthetic '||i,$1,clock_timestamp() FROM generate_series(1,51) i RETURNING project_id",[user])).rows;
 for(const row of rows)await db.admin.query("INSERT INTO workspace.membership(project_id,user_id,role,membership_generation) VALUES($1,$2,'viewer',1)",[row.project_id,user]);
 const foreign=randomUUID();await db.admin.query("INSERT INTO workspace.project(project_id,name,created_by,created_at) VALUES($1,'synthetic foreign',$2,clock_timestamp())",[foreign,other]);await db.admin.query("INSERT INTO workspace.membership(project_id,user_id,role,membership_generation) VALUES($1,$2,'viewer',1)",[foreign,other]);
 const get=(url,token=a.token)=>app.inject({url,headers:{cookie:`${SESSION_COOKIE}=${token}`}});
 await t.test('fixed 50-item pages expose only current memberships in stable order',async()=>{
  const first=await get('/projects');assert.equal(first.statusCode,200,first.body);const page=first.json();assert.equal(page.items.length,50);assert(page.next_cursor);
  const second=await get('/projects?cursor='+page.next_cursor);assert.equal(second.statusCode,200);assert.equal(second.json().items.length,1);assert.equal(second.json().next_cursor,null);
  const ids=[...page.items,...second.json().items].map(r=>r.project_id);assert.deepEqual(ids,[...ids].sort());assert.equal(new Set(ids).size,51);assert(!ids.includes(foreign));assert.equal(first.headers['cache-control'],'no-store');
  assert.equal((await get('/projects?limit=10')).statusCode,400);
 });
 await t.test('unknown and foreign direct reads are indistinguishable; body actor claims do not apply',async()=>{
  const denied=await get('/projects/'+foreign),missing=await get('/projects/'+randomUUID());assert.equal(denied.statusCode,404);assert.equal(denied.body,missing.body);assert.deepEqual(denied.json(),{code:'not_found',message:'Resource unavailable'});
  assert.equal((await get('/projects/not-a-uuid')).statusCode,404);const readable=await get('/projects/'+rows[0].project_id);assert.equal(readable.statusCode,200);assert.equal(readable.json().name,'Synthetic 1');
 });
 await t.test('foreign actor/tampered cursor rejected; same actor relogin alone keeps a cursor valid',async()=>{
  const cursor=(await get('/projects')).json().next_cursor;
  assert.equal((await get('/projects?cursor='+cursor,b.token)).statusCode,400);
  assert.equal((await get('/projects?cursor='+cursor.slice(0,-1)+(cursor.endsWith('A')?'B':'A'))).statusCode,400);
  const fresh=await sessions.establish(user,'1');assert.equal((await get('/projects?cursor='+cursor,fresh.token)).statusCode,200);
 });
 await t.test('name changes and remove/rejoin generations invalidate complete projection watermark',async()=>{
  let cursor=(await get('/projects')).json().next_cursor;await db.admin.query("UPDATE workspace.project SET name='Synthetic changed',revision=revision+1 WHERE project_id=$1",[rows[0].project_id]);
  let result=await get('/projects?cursor='+cursor);assert.equal(result.statusCode,409);assert.equal(result.json().items,undefined);
  cursor=(await get('/projects')).json().next_cursor;await db.admin.query('UPDATE workspace.membership SET membership_generation=membership_generation+2,revision=revision+2 WHERE project_id=$1 AND user_id=$2',[rows[0].project_id,user]);
  result=await get('/projects?cursor='+cursor);assert.equal(result.statusCode,409);assert(!result.body.includes('Synthetic'));
 });
 await t.test('missing or rotated server key fails closed without a cursor table',async()=>{
  const cursor=(await get('/projects')).json().next_cursor;
  const rotated=buildApp({projects:new WorkspaceProjectStore(db.runtime,sessions,{kid:'rotated',key:Buffer.alloc(32,20)}),origin:'https://localhost'});
  try{assert.equal((await rotated.inject({url:'/projects?cursor='+cursor,headers:{cookie:`${SESSION_COOKIE}=${a.token}`}})).statusCode,400);}finally{await rotated.close();}
  const missingKey=buildApp({projects:new WorkspaceProjectStore(db.runtime,sessions),origin:'https://localhost'});
  try{assert.equal((await missingKey.inject({url:'/projects',headers:{cookie:`${SESSION_COOKIE}=${a.token}`}})).statusCode,503);}finally{await missingKey.close();}
  assert.equal((await db.admin.query("SELECT tablename FROM pg_tables WHERE schemaname='workspace' AND tablename LIKE '%cursor%'")).rowCount,0);
 });
 await t.test('DB dependency failure is not empty success',async()=>{
  await db.admin.query('REVOKE SELECT ON workspace.membership FROM workspace_app');
  try{const r=await get('/projects');assert.equal(r.statusCode,503);assert.equal(r.json().items,undefined);}finally{await db.admin.query('GRANT SELECT ON workspace.membership TO workspace_app');}
 });
 await t.test('session expiry during actual project lock wait is checked before output',async()=>{
  const fresh=await sessions.establish(user,'1'),held=await db.admin.connect();
  await held.query('BEGIN');await held.query('SELECT project_id FROM workspace.project WHERE project_id=$1 FOR UPDATE',[rows[0].project_id]);
  await db.admin.query("UPDATE workspace.session SET expires_at=clock_timestamp()+interval '250 milliseconds' WHERE session_id=$1",[fresh.session.sessionId]);
  const pending=get('/projects/'+rows[0].project_id,fresh.token);
  try{
   let reached=false;const end=Date.now()+500;
   while(Date.now()<end){if((await db.admin.query("SELECT 1 FROM pg_stat_activity WHERE usename='workspace_app' AND wait_event_type='Lock' AND position('SELECT project_id,name' in query)>0")).rowCount){reached=true;break;}await new Promise(r=>setTimeout(r,5));}
   assert(reached,'actual PostgreSQL project lock barrier absent');await new Promise(r=>setTimeout(r,270));
  }finally{await held.query('ROLLBACK');held.release();}
  const response=await pending;assert.equal(response.statusCode,401);assert(!response.body.includes('Synthetic'));
 });
});
