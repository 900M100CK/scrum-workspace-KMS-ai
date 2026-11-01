import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {sessionFixture} from './fixture.mjs';
import {WorkspaceSessionStore,WorkspaceSessionOperator} from '../../services/workspace/src/session/store.ts';
import {WorkspaceProjectOperator} from '../../services/workspace/src/projects/operator.ts';
import {WorkspaceProjectStore} from '../../services/workspace/src/projects/store.ts';
import {buildApp} from '../../services/workspace/src/app.ts';
import {SESSION_COOKIE} from '../../services/workspace/src/session/http.ts';
import {ScryptVerifier} from '../../services/workspace/src/session/kdf.ts';

test('P05/P06 actual membership lifecycle and current action authority',{timeout:180000},async t=>{
 const db=await sessionFixture({through:'008'});t.after(()=>db.close());
 const authOperator=new WorkspaceSessionOperator(db.admin),operator=new WorkspaceProjectOperator(db.admin),ids=[randomUUID(),randomUUID(),randomUUID(),randomUUID()], [a,b,c,d]=ids;
 for(let i=0;i<ids.length;i++)await authOperator.provision(ids[i],'synthetic-member-'+i,new ScryptVerifier().dummyCredential,'synthetic');
 const clock=await authOperator.state();await authOperator.recover({expectedGeneration:clock.generation,expectedLastObserved:clock.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-members',operatorRef:'synthetic'});
 const sessions=new WorkspaceSessionStore(db.runtime,{idleSeconds:1800,absoluteSeconds:28800}),tokens=[];for(const id of ids)tokens.push((await sessions.establish(id,'1')).token);
 await operator.global(a,true,'0','synthetic','fixture permission');
 const projects=new WorkspaceProjectStore(db.runtime,sessions,{kid:'members',key:Buffer.alloc(32,11)}),created=await projects.create(tokens[0],{name:'Membership fixture'},'initial'),project=created.projectId;
 const app=buildApp({projects,store:sessions,origin:'https://localhost'});await app.ready();t.after(()=>app.close());
 const headers=(token=tokens[0])=>({origin:'https://localhost','x-sacw-request':'1',cookie:`${SESSION_COOKIE}=${token}`});
 const get=(url,token=tokens[0])=>app.inject({url,headers:headers(token)});
 const add=(id,role,key=role+'-'+id,token=tokens[0])=>app.inject({method:'POST',url:`/projects/${project}/members`,headers:{...headers(token),'idempotency-key':key},payload:{user_id:id,role}});
 await t.test('new memberships have exact revisions and role labels grant no capabilities',async()=>{
  let r=await add(b,'product_owner','add-b');assert.equal(r.statusCode,201,r.body);assert.equal(r.json().revision,1);
  r=await add(c,'developer','add-c');assert.equal(r.statusCode,201);assert.equal((await add(c,'developer','second-key')).statusCode,409);
  const actions=await get(`/access/allowed-actions?resource_kind=project&project_id=${project}`,tokens[1]);assert.equal(actions.statusCode,200);assert(!actions.json().allowed_operations.includes('addMember'));assert(!actions.json().allowed_operations.includes('editProject'));
  assert.equal((await add(d,'viewer','forbidden',tokens[1])).statusCode,403);
  assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.capability_grant WHERE subject_id=$1',[b])).rows[0].n,'0');
 });
 await t.test('minimal member paging supplies removal revision and no email/history/permission inventory',async()=>{
  const first=(await get(`/projects/${project}/members?limit=1`)).json();assert.equal(first.items.length,1);assert(first.next_cursor);assert.deepEqual(Object.keys(first.items[0]).sort(),['project_id','revision','role','user_id']);
  const second=await get(`/projects/${project}/members?limit=1&cursor=${first.next_cursor}`);assert.equal(second.statusCode,200);assert.notEqual(second.json().items[0].user_id,first.items[0].user_id);
  assert.equal((await get(`/projects/${project}/members?limit=2&cursor=${first.next_cursor}`)).statusCode,400);
  assert.equal((await get(`/projects/${project}/members?limit=1&cursor=${first.next_cursor}`,tokens[1])).statusCode,400);
  for(const limit of ['0','101','bad'])assert.equal((await get(`/projects/${project}/members?limit=${limit}`)).statusCode,400);
 });
 let restricted;
 await t.test('addMember owns rejoin: fresh generation/revision and no old read/capability/assignment revival',async()=>{
  const cursor=(await get(`/projects/${project}/members?limit=1`)).json().next_cursor;
  // Controlled persisted removal fixture isolates P05 add/rejoin; actual removal is exercised in P06.
  await db.admin.query('UPDATE workspace.membership SET active=false,revision=2,membership_generation=2 WHERE project_id=$1 AND user_id=$2',[project,c]);
  await db.admin.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action) VALUES($1,$2,$3,'project',$3,'audit-read')",[randomUUID(),c,project]);
  restricted=randomUUID();await db.admin.query("INSERT INTO workspace.document_policy VALUES($1,$2,'restricted','active',1)",[restricted,project]);
  await db.admin.query('INSERT INTO workspace.read_grant(project_id,document_id,user_id,grant_generation,membership_generation) VALUES($1,$2,$3,1,1)',[project,restricted,c]);
  const result=await add(c,'viewer','rejoin-c');assert.equal(result.statusCode,201,result.body);assert.equal(result.json().revision,3);
  const row=(await db.admin.query('SELECT membership_generation::text,active FROM workspace.membership WHERE project_id=$1 AND user_id=$2',[project,c])).rows[0];assert.deepEqual(row,{membership_generation:'3',active:true});
  assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.capability_grant WHERE subject_id=$1 AND valid',[c])).rows[0].n,'0');assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.read_grant WHERE user_id=$1 AND valid',[c])).rows[0].n,'0');
  assert.equal((await get(`/projects/${project}/members?limit=1&cursor=${cursor}`)).statusCode,409);
  const replay=await add(c,'developer','add-c');assert.equal(replay.statusCode,201);assert.equal(replay.json().role,'developer');assert.equal(replay.json().revision,1);
  assert.equal((await db.admin.query('SELECT revision::text revision FROM workspace.membership WHERE project_id=$1 AND user_id=$2',[project,c])).rows[0].revision,'3');
 });
 await t.test('unknown target and current scope failures disclose no account directory',async()=>{
  const r=await add(randomUUID(),'viewer','unknown');assert.equal(r.statusCode,404);assert.deepEqual(r.json(),{code:'not_found',message:'Resource unavailable'});
  const denied=await get(`/projects/${project}/members`,tokens[3]),unknown=await get(`/projects/${randomUUID()}/members`,tokens[3]);assert.equal(denied.statusCode,404);assert.equal(denied.body,unknown.body);
  assert.equal((await get('/access/allowed-actions?resource_kind=global&project_id='+project)).statusCode,400);
  assert.equal((await get(`/access/allowed-actions?resource_kind=document&project_id=${project}&resource_id=${restricted}`)).statusCode,404);
  const global=(await get('/access/allowed-actions?resource_kind=global')).json();assert(global.allowed_operations.includes('createProject'));assert(!global.allowed_operations.includes('createTask'));
 });
 await t.test('real DB CHECK rejection maps to controlled conflict and creates no membership/audit',async()=>{
  await db.admin.query("ALTER TABLE workspace.membership ADD CONSTRAINT synthetic_role_failure CHECK(role<>'scrum_master')");
  try{const r=await add(d,'scrum_master','constraint');assert.equal(r.statusCode,409,r.body);assert.equal(r.json().code,'state_conflict');assert(!r.body.includes('synthetic'));assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.membership WHERE project_id=$1 AND user_id=$2',[project,d])).rows[0].n,'0');}finally{await db.admin.query('ALTER TABLE workspace.membership DROP CONSTRAINT synthetic_role_failure');}
 });
});
