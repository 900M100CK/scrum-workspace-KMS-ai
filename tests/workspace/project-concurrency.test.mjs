import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {projectFixture} from './project-fixture.mjs';
import {ownedTransaction} from '../../services/workspace/src/session/database.ts';

async function barrier(admin,role,fragment,count=1){
 const end=Date.now()+750;
 while(Date.now()<end){const r=await admin.query("SELECT count(*)::int n FROM pg_stat_activity WHERE usename=$1 AND wait_event_type='Lock' AND position($2 in query)>0",[role,fragment]);if(r.rows[0].n>=count)return;await new Promise(resolve=>setTimeout(resolve,5));}
 throw new Error('Expected actual PostgreSQL lock barrier absent');
}
test('P07 measured SQL barriers for actual handlers and labelled future-writer doubles',{timeout:180000},async t=>{
 const f=await projectFixture(),{db,ids:[a,b,c],tokens,projects,operator}=f;t.after(()=>f.close());
 const headers=()=>({...f.headers(tokens[0]),'idempotency-key':randomUUID()});
 const remove=(project,target,rev,key=randomUUID(),token=tokens[0])=>f.app.inject({method:'DELETE',url:`/projects/${project}/members/${target}`,headers:{...f.headers(token),'idempotency-key':key,'x-expected-revision':String(rev)}});
 async function fresh(){const p=(await projects.create(tokens[0],{name:'Synthetic race'},randomUUID())).projectId;await projects.add(tokens[0],p,{user_id:c,role:'viewer'},randomUUID());return p;}
 await t.test('two actual manager-removal requests wait on the real shared lock, then leave one effective manager',async()=>{
  await f.add(b);await operator.project(b,f.project,'membership-manage',true,'0','synthetic','second manager');
  const held=await db.admin.connect();await held.query('BEGIN');await held.query('SELECT * FROM workspace.auth_clock_state FOR UPDATE');
  const first=f.remove(b,1,'remove-b',tokens[0]),second=f.remove(a,1,'remove-a',tokens[1]);
  try{await barrier(db.admin,'workspace_app','auth_clock_state',2);}finally{await held.query('ROLLBACK');held.release();}
  const results=await Promise.all([first,second]);assert.equal(results.filter(r=>r.statusCode===204).length,1);
  assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.membership m JOIN workspace.auth_account ac USING(user_id) JOIN workspace.capability_grant g ON g.project_id=m.project_id AND g.subject_id=m.user_id WHERE m.project_id=$1 AND m.active AND NOT ac.disabled AND g.valid AND g.action='membership-manage' AND g.resource_kind='project' AND g.resource_id=$1",[f.project])).rows[0].n,'1');
 });
 for(const kind of ['assignment','read-grant'])await t.test(`controlled ${kind} SQL writer commits first; actual removal invalidates its result`,async()=>{
  const project=await fresh(),entity=randomUUID();
  if(kind==='assignment')await db.admin.query("INSERT INTO workspace.task(task_id,project_id,type,title,state) VALUES($1,$2,'task','Synthetic race task','todo')",[entity,project]);
  else await db.admin.query("INSERT INTO workspace.document_policy VALUES($1,$2,'restricted','active',1)",[entity,project]);
  let release,entered;const pause=new Promise(r=>release=r),ready=new Promise(r=>entered=r);
  const writer=ownedTransaction(db.runtime,'runtime',async sql=>{
   await sql.query('SELECT * FROM workspace.auth_clock_state FOR UPDATE');await sql.query('SELECT project_id FROM workspace.project WHERE project_id=$1 FOR UPDATE',[project]);
   const member=(await sql.query('SELECT active,membership_generation::text FROM workspace.membership WHERE project_id=$1 AND user_id=$2',[project,c])).rows[0];assert(member.active);entered();await pause;
   if(kind==='assignment')await sql.query('UPDATE workspace.task SET assignee_id=$2,revision=revision+1 WHERE task_id=$1',[entity,c]);
   else await sql.query('INSERT INTO workspace.read_grant(project_id,document_id,user_id,grant_generation,membership_generation) VALUES($1,$2,$3,1,$4)',[project,entity,c,member.membership_generation]);
  });
  await ready;const pending=remove(project,c,1);
  try{await barrier(db.admin,'workspace_app','auth_clock_state');}finally{release();}
  await writer;assert.equal((await pending).statusCode,204);
  if(kind==='assignment')assert.equal((await db.admin.query('SELECT assignee_id FROM workspace.task WHERE task_id=$1',[entity])).rows[0].assignee_id,null);
  else assert.equal((await db.admin.query('SELECT valid FROM workspace.read_grant WHERE document_id=$1',[entity])).rows[0].valid,false);
 });
 for(const kind of ['assignment','read-grant'])await t.test(`actual removal first makes controlled ${kind} SQL writer reject departed membership`,async()=>{
  const project=await fresh();assert.equal((await remove(project,c,1)).statusCode,204);
  const allowed=await ownedTransaction(db.runtime,'runtime',async sql=>{
   await sql.query('SELECT * FROM workspace.auth_clock_state FOR UPDATE');await sql.query('SELECT project_id FROM workspace.project WHERE project_id=$1 FOR UPDATE',[project]);
   return (await sql.query('SELECT 1 FROM workspace.membership WHERE project_id=$1 AND user_id=$2 AND active',[project,c])).rowCount>0;
  });assert.equal(allowed,false);
 });
 await t.test('actual private grant queued before removal is invalidated, and a later grant cannot revive it',async()=>{
  const project=await fresh(),held=await db.admin.connect();await held.query('BEGIN');await held.query('SELECT * FROM workspace.auth_clock_state FOR UPDATE');
  const grant=operator.project(c,project,'project-administrator',true,'0','synthetic','race explicit grant');
  await barrier(db.admin,'postgres','auth_clock_state');const pending=remove(project,c,1);
  try{await barrier(db.admin,'workspace_app','auth_clock_state');}finally{await held.query('ROLLBACK');held.release();}
  await grant;assert.equal((await pending).statusCode,204);
  assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.capability_grant WHERE project_id=$1 AND subject_id=$2 AND valid',[project,c])).rows[0].n,'0');
  await assert.rejects(operator.project(c,project,'project-administrator',true,'2','synthetic','cannot revive departed member'));
 });
 await t.test('lost actual removal COMMIT acknowledgement reconciles old key without repeating mutation',async()=>{
  const project=await fresh(),connect=db.runtime.connect.bind(db.runtime);let lost=false;
  db.runtime.connect=async()=>{const client=await connect(),query=client.query.bind(client);client.query=async(...args)=>{const value=await query(...args);if(args[0]==='COMMIT'&&!lost){lost=true;throw new Error('synthetic-lost-removal-ack');}return value;};return client;};
  try{assert.equal((await remove(project,c,1,'lost-remove')).statusCode,503);}finally{db.runtime.connect=connect;}
  assert.equal((await remove(project,c,1,'lost-remove')).statusCode,204);
  assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.business_audit WHERE project_id=$1 AND action='member_removed'",[project])).rows[0].n,'1');
  assert.equal(db.runtime.waitingCount,0);assert.equal(db.runtime.totalCount,db.runtime.idleCount);
 });
 t.diagnostic('Assignment/read-grant writers above are controlled Workspace SQL protocol doubles. Actual SP-04/SP-06 handlers and D-07 protected transport remain follow-up SP02-F01; not measured here.');
});
