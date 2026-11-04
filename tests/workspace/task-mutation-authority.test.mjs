import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {taskMutationFixture} from './task-mutation-fixture.mjs';
import {pauseTaskQuery,taskBarrier} from './task-fixture.mjs';
import {WorkspaceProjectOperator} from '../../services/workspace/src/projects/operator.ts';
import {WorkspaceProjectStore} from '../../services/workspace/src/projects/store.ts';
import {ownedTransaction} from '../../services/workspace/src/session/database.ts';
import {buildApp} from '../../services/workspace/src/app.ts';
import {TASK_ACTIONS} from '../../services/workspace/src/tasks/authority.ts';

const key=()=>randomUUID(),settled=p=>p.then(value=>({value}),error=>({error}));
async function reached(gate,result){await Promise.race([gate.ready,result.then(()=>{throw Error('Producer ended before actual lock barrier');})]);}
const syntheticFutureRegistry=new Set(['getTask','listBlockerEvents',...Object.keys(TASK_ACTIONS)]);

test('SP04-P03C private Task action grants and exact Task discovery',{timeout:180000},async t=>{
 const f=await taskMutationFixture(),{db,project,projects,operator,tokens,ids:[a,b,c],app}=f;t.after(()=>f.close());
 t.diagnostic(JSON.stringify({fixture:db.name,volume:db.volume,image:db.image,postgres:(await db.admin.query("SELECT current_setting('server_version') version")).rows[0].version,ceiling:'010'}));
 await projects.add(tokens[0],project,{user_id:b,role:'viewer'},key());
 await operator.project(a,project,'backlog-author',true,'0','synthetic-P03C','create fixture Task only');
 const created=await f.create({type:'task',title:'Synthetic hidden title'});assert.equal(created.statusCode,201);const task=created.json();
 const grant=(user,action,allow,revision,p=project)=>operator.project(user,p,action,allow,revision,'synthetic-P03C','explicit Task action');
 const rows=(p=project,user=b)=>db.admin.query("SELECT grant_id,action,valid,permission_revision::text revision FROM workspace.capability_grant WHERE project_id=$1 AND subject_id=$2 AND action=ANY($3::text[]) ORDER BY permission_revision,grant_id",[p,user,Object.values(TASK_ACTIONS)]);
 const audit=p=>db.admin.query("SELECT * FROM workspace.authority_provisioning_audit WHERE project_id=$1 AND action=ANY($2::text[]) ORDER BY recorded_at,event_id",[p,Object.values(TASK_ACTIONS)]);
 const discover=(p=project,id=task.task_id,token=tokens[1],extra='')=>app.inject({method:'GET',url:`/access/allowed-actions?resource_kind=task&project_id=${p}&resource_id=${id}${extra}`,headers:f.headers(token)});

 await t.test('create/creator/member roles imply no mutation action; live HTTP returns exact read target and registered handlers only',async()=>{
  assert.deepEqual((await projects.actions(tokens[0],'task',project,syntheticFutureRegistry,task.task_id)).allowed_operations,['getAllowedActions','getTask','listBlockerEvents']);
  for(const token of [tokens[0],tokens[1]]){
   const r=await discover(project,task.task_id,token);assert.equal(r.statusCode,200,r.body);assert.equal(r.headers['cache-control'],'no-store');
   assert.deepEqual(r.json(),{resource_kind:'task',project_id:project,resource_id:task.task_id,document_id:null,version_id:null,allowed_operations:['getAllowedActions','getTask','listBlockerEvents']});
   assert(!r.body.includes(task.title));assert(!r.body.includes('grant_id'));
  }
 });
 await t.test('four independent private grants have issue-ID provenance, revisioned revoke/regrant, and audited no-op/stale semantics',async()=>{
  for(const action of Object.values(TASK_ACTIONS)){
   assert.deepEqual(await grant(b,action,true,'0'),{changed:true,revision:'1'});
   const before=await audit(project);assert.deepEqual(await grant(b,action,true,'1'),{changed:false,revision:'1'});assert.deepEqual(await audit(project),before);
   await assert.rejects(grant(b,action,false,'0'));assert.deepEqual(await audit(project),before);
   const row=(await rows()).rows.find(r=>r.action===action&&r.valid);const issue=before.rows.find(r=>r.event_id===row.grant_id);
   assert(issue?.allowed);assert.equal(issue.target_user_id,b);assert.equal(issue.database_principal,'postgres');assert.equal(issue.operator_ref,'synthetic-P03C');
   assert.deepEqual(await grant(b,action,false,'1'),{changed:true,revision:'2'});
   assert.deepEqual(await grant(b,action,true,'2'),{changed:true,revision:'3'});
  }
  assert.equal((await rows()).rows.filter(r=>r.valid).length,4);
  assert.deepEqual((await discover()).json().allowed_operations.filter(op=>Object.keys(TASK_ACTIONS).includes(op)),['editTask','recordBlocker','setAssignee','setTaskState']);
 });
 await t.test('future registry projection checks independent rights and Backlog edit context without claiming those handlers exist',async()=>{
  const projection=()=>projects.actions(tokens[1],'task',project,syntheticFutureRegistry,task.task_id);
  assert.deepEqual((await projection()).allowed_operations,['editTask','getAllowedActions','getTask','listBlockerEvents','recordBlocker','setAssignee','setTaskState']);
  await grant(b,'task-state',false,'3');assert(!(await projection()).allowed_operations.includes('setTaskState'));
  // Exercise the shared context projection directly; no fake Sprint handler/state or public registration.
  const {discoverTaskOperations}=await import('../../services/workspace/src/tasks/authority.ts');
  const sprintOps=await ownedTransaction(db.runtime,'runtime',client=>discoverTaskOperations(client,b,project,'sprint',syntheticFutureRegistry));
  assert(!sprintOps.includes('editTask'));assert(sprintOps.includes('setAssignee'));
  await grant(b,'task-state',true,'4');
 });
 await t.test('missing/foreign/nonmember targets conceal identity and malformed or asserted selectors fail bounded validation',async()=>{
  const outside=(await projects.create(tokens[0],{name:'Other project'},key())).projectId;
  for(const r of [await discover(project,key()),await discover(outside,task.task_id,tokens[0]),await discover(project,task.task_id,tokens[2])]){
   assert.equal(r.statusCode,404,r.body);assert.deepEqual(r.json(),{code:'not_found',message:'Resource unavailable'});assert(!r.body.includes(task.title));
  }
  for(const r of [await discover(project,'invalid'),await discover('invalid'),await discover(project,task.task_id,tokens[1],'&actor_id='+a),await discover(project,task.task_id,tokens[1],'&document_id='+key())])assert.equal(r.statusCode,400,r.body);
 });
 await t.test('disabled/nonmember/unknown targets, unsupported actions and ordinary runtime cannot provision or inspect private audit',async()=>{
  for(const user of [c,key()])await assert.rejects(grant(user,'task-edit',true,'0'));
  await projects.add(tokens[0],project,{user_id:c,role:'viewer'},key());await f.authOperator.disable(c,'synthetic disabled target');await assert.rejects(grant(c,'task-edit',true,'0'));
  await assert.rejects(operator.project(b,project,'task-mutate',true,'0','synthetic','unsupported'));
  await assert.rejects(operator.project(b,project,'task-edit',true,'3','synthetic',''));
  await assert.rejects(new WorkspaceProjectOperator(db.runtime).project(b,project,'task-edit',false,'3','synthetic','runtime'));
  await assert.rejects(db.runtime.query('SELECT * FROM workspace.authority_provisioning_audit'));
 });
 await t.test('unprovenanced selected rows are retained and rejected even for an apparent no-op',async()=>{
  const p=(await projects.create(tokens[0],{name:'Unprovenanced fixture'},key())).projectId;
  await ownedTransaction(db.admin,'operator',client=>client.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action) VALUES($1,$2,$3,'project',$3,'task-edit')",[key(),a,p]));
  await assert.rejects(grant(a,'task-edit',true,'1',p));await assert.rejects(grant(a,'task-edit',false,'1',p));
  assert.equal((await rows(p,a)).rows.length,1);assert.equal((await audit(p)).rowCount,0);
 });
 await t.test('failed private audit persistence rolls back grant issuance',async()=>{
  const p=(await projects.create(tokens[0],{name:'Atomic private audit'},key())).projectId;
  const failPool={async connect(){const client=await db.admin.connect();return new Proxy(client,{get(target,name){if(name==='query')return(...args)=>{if(typeof args[0]==='string'&&args[0].startsWith('INSERT INTO workspace.authority_provisioning_audit'))throw Error('Synthetic audit persistence failure');return client.query(...args);};const value=Reflect.get(target,name);return typeof value==='function'?value.bind(target):value;}});}};
  await assert.rejects(new WorkspaceProjectOperator(failPool).project(a,p,'task-edit',true,'0','synthetic','atomic issue'));
  assert.equal((await rows(p,a)).rowCount,0);assert.equal((await audit(p)).rowCount,0);
 });
 await t.test('actual removal invalidates all four actions; rejoin restores none and explicit regrant keeps provenance',async()=>{
  await projects.remove(tokens[0],project,b,'1',key());assert.equal((await rows()).rows.some(r=>r.valid),false);
  assert.equal((await discover()).statusCode,404);await assert.rejects(grant(b,'task-edit',true,'4'));
  await projects.add(tokens[0],project,{user_id:b,role:'viewer'},key());assert.equal((await rows()).rows.some(r=>r.valid),false);
  assert.deepEqual((await discover()).json().allowed_operations,['getAllowedActions','getTask','listBlockerEvents']);
  const rev=(await operator.state(b,project)).filter(r=>r.action==='task-edit').map(r=>BigInt(r.revision)).reduce((x,y)=>x>y?x:y,0n).toString();
  assert.equal((await grant(b,'task-edit',true,rev)).changed,true);
 });
 await t.test('both actual grant/removal lock orderings preserve revocation without deadlock or grant resurrection',async()=>{
  for(const first of ['grant','removal']){
   const p=(await projects.create(tokens[0],{name:'Task grant race '+first},key())).projectId;await projects.add(tokens[0],p,{user_id:b,role:'viewer'},key());
   const gate=pauseTaskQuery(first==='grant'?db.admin:db.runtime,first==='grant'?'INSERT INTO workspace.capability_grant':'UPDATE workspace.membership SET active=false');
   const op=new WorkspaceProjectOperator(gate.pool),store=new WorkspaceProjectStore(gate.pool,f.sessions,f.cursorKey);
   const leading=settled(first==='grant'?op.project(b,p,'task-assign',true,'0','synthetic','grant first'):store.remove(tokens[0],p,b,'1',key()));
   await reached(gate,leading);let following;
   try{following=settled(first==='grant'?projects.remove(tokens[0],p,b,'1',key()):grant(b,'task-assign',true,'0',p));await taskBarrier(db.admin,first==='grant'?'workspace_app':'postgres');}finally{gate.release();}
   const lead=await leading,follow=await following;assert.equal(lead.error,undefined);
   if(first==='grant')assert.equal(follow.value.status,204);else assert(follow.error);
   assert.equal((await rows(p)).rows.some(r=>r.valid),false);
  }
 });
 await t.test('private CLI supports selected grant/revoke/state and generic failure without configuration disclosure',async()=>{
  const p=(await projects.create(tokens[0],{name:'Task action CLI'},key())).projectId;
  async function cli(command,input){return new Promise((resolve,reject)=>{const child=spawn(process.execPath,['services/workspace/src/projects/cli.ts',command],{env:{...process.env,...db.operatorEnvironment},windowsHide:true});let out='',err='';child.stdout.on('data',b=>out+=b);child.stderr.on('data',b=>err+=b);child.on('error',reject);child.on('close',code=>resolve({code,out,err}));child.stdin.end(JSON.stringify(input));});}
  for(const [allowed,expected_revision]of [[true,'0'],[false,'1']]){const r=await cli('project',{user_id:a,project_id:p,action:'task-blocker',allowed,expected_revision,reason:'Synthetic CLI Task action'});assert.equal(r.code,0,r.err);assert.equal(JSON.parse(r.out).changed,true);assert(!r.out.includes('postgresql'));}
  assert.equal((await cli('state',{user_id:a,project_id:p})).code,0);
  const failed=await cli('project',{user_id:a,project_id:p,action:'task-blocker',allowed:true,expected_revision:'0',reason:'stale'});assert.equal(failed.code,1);assert.equal(failed.out,'');assert(!failed.err.includes('postgresql'));assert.equal((await audit(p)).rowCount,2);
 });
 await t.test('required authority failure withholds discovery; app without Task handlers advertises no Task endpoint',async()=>{
  const failedPool={async connect(){const client=await db.runtime.connect();return new Proxy(client,{get(target,name){if(name==='query')return(...args)=>{if(typeof args[0]==='string'&&args[0].startsWith('SELECT action FROM workspace.capability_grant'))throw Error('synthetic-private-fault');return client.query(...args);};const value=Reflect.get(target,name);return typeof value==='function'?value.bind(target):value;}});}};
  const broken=buildApp({store:f.sessions,projects:new WorkspaceProjectStore(failedPool,f.sessions),tasks:f.tasks,origin:'https://localhost'});await broken.ready();
  try{const r=await broken.inject({method:'GET',url:`/access/allowed-actions?resource_kind=task&project_id=${project}&resource_id=${task.task_id}`,headers:f.headers()});assert.equal(r.statusCode,503);assert(!r.body.includes('synthetic-private-fault'));assert(!r.body.includes('allowed_operations'));}finally{await broken.close();}
  const noTask=buildApp({store:f.sessions,projects,origin:'https://localhost'});await noTask.ready();
  try{const r=await noTask.inject({method:'GET',url:`/access/allowed-actions?resource_kind=task&project_id=${project}&resource_id=${task.task_id}`,headers:f.headers()});assert.equal(r.statusCode,200,r.body);assert.deepEqual(r.json().allowed_operations,['getAllowedActions']);}finally{await noTask.close();}
 });
 await t.test('session expiry during an observed Project lock wait withholds allowed operations',async()=>{
  const fresh=await f.sessions.establish(a,'1'),held=await db.admin.connect();await held.query('BEGIN');await held.query('SELECT project_id FROM workspace.project WHERE project_id=$1 FOR UPDATE',[project]);
  await db.admin.query("UPDATE workspace.session SET expires_at=clock_timestamp()+interval '250 milliseconds' WHERE session_id=$1",[fresh.session.sessionId]);
  const pending=discover(project,task.task_id,fresh.token);
  try{await taskBarrier(db.admin,'workspace_app','SELECT project_id,name');await new Promise(r=>setTimeout(r,270));}finally{await held.query('ROLLBACK');held.release();}
  const r=await pending;assert.equal(r.statusCode,401,r.body);assert(!r.body.includes('allowed_operations'));
 });
});
