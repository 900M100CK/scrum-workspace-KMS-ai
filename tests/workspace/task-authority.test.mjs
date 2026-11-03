import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {taskFixture} from './task-fixture.mjs';
import {ownedTransaction} from '../../services/workspace/src/session/database.ts';
import {WorkspaceProjectOperator} from '../../services/workspace/src/projects/operator.ts';
import {WorkspaceProjectStore} from '../../services/workspace/src/projects/store.ts';

async function barrier(admin,role){
 const deadline=Date.now()+750;
 while(Date.now()<deadline){if((await admin.query("SELECT 1 FROM pg_stat_activity WHERE usename=$1 AND wait_event_type='Lock' AND position('auth_clock_state' in query)>0",[role])).rowCount)return;await new Promise(r=>setTimeout(r,5));}
 throw Error('Actual grant/removal PostgreSQL lock barrier not observed');
}
// Pause after the real producer query has completed while its transaction still owns the locks.
function pauseAfter(pool,fragment){
 let enter,release;const ready=new Promise(r=>enter=r),pause=new Promise(r=>release=r);let used=false;
 return {ready,release,pool:{async connect(){const c=await pool.connect();return new Proxy(c,{get(target,key){if(key==='query')return async(...args)=>{const result=await c.query(...args);if(!used&&typeof args[0]==='string'&&args[0].includes(fragment)){used=true;enter();await pause;}return result;};const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});}}};
}
const settled=p=>p.then(value=>({value}),error=>({error}));
async function reached(gate,result){await Promise.race([gate.ready,result.then(()=>{throw Error('Producer ended before controlled barrier');})]);}

test('P03C private audited backlog authors and controlled membership ordering',{timeout:180000},async t=>{
 const f=await taskFixture(),{db,ids:[a,b,c],tokens,project,projects,operator}=f;t.after(()=>f.close());
 const grant=(user,allowed,rev,p=project,reason='synthetic explicit author')=>operator.project(user,p,'backlog-author',allowed,rev,'synthetic-task-operator',reason);
 const authors=p=>db.admin.query("SELECT subject_id,valid,permission_revision::text revision FROM workspace.capability_grant WHERE project_id=$1 AND action='backlog-author' ORDER BY permission_revision",[p]);
 const audit=async()=> (await db.admin.query("SELECT * FROM workspace.authority_provisioning_audit WHERE action='backlog-author' ORDER BY recorded_at,event_id")).rows;
 await projects.add(tokens[0],project,{user_id:b,role:'viewer'},randomUUID());
 await t.test('creator and descriptive roles do not grant authors; explicit grant/revoke is private, revisioned and co-audited',async()=>{
  assert.equal((await authors(project)).rowCount,0);
  await projects.add(tokens[0],project,{user_id:c,role:'viewer'},randomUUID());
  assert.deepEqual(await grant(b,true,'0'),{changed:true,revision:'1'});assert.deepEqual(await grant(b,true,'1'),{changed:false,revision:'1'});
  assert.equal((await authors(project)).rows.filter(r=>r.valid).length,1);assert.equal((await authors(project)).rows[0].subject_id,b);
  const roles=(await db.admin.query('SELECT role FROM workspace.membership WHERE project_id=$1 AND user_id=ANY($2::uuid[]) ORDER BY user_id',[project,[b,c]])).rows;assert(roles.every(r=>r.role==='viewer'));
  const before=await audit();assert.equal(before.length,1);assert.equal(before[0].target_user_id,b);assert.equal(before[0].database_principal,'postgres');assert.equal(before[0].operator_ref,'synthetic-task-operator');
  await assert.rejects(grant(b,false,'0'));assert.deepEqual(await audit(),before);
  assert.deepEqual(await grant(b,false,'1'),{changed:true,revision:'2'});assert.equal((await authors(project)).rows.some(r=>r.valid),false);
  // Last-author revoke has no invented successor constraint; membership manager protection remains unchanged.
  await assert.rejects(operator.project(a,project,'membership-manage',false,'1','synthetic','last manager'));
 });
 await t.test('runtime cannot provision, revive or read private audit; unknown/nonmember/disabled/empty reason are denied',async()=>{
  await assert.rejects(new WorkspaceProjectOperator(db.runtime).project(b,project,'backlog-author',true,'2','synthetic','runtime'));
  await assert.rejects(db.runtime.query('SELECT * FROM workspace.authority_provisioning_audit'));
  await assert.rejects(db.runtime.query("UPDATE workspace.capability_grant SET valid=true WHERE project_id=$1 AND subject_id=$2 AND action='backlog-author'",[project,b]),e=>e.code==='42501');
  await assert.rejects(grant(randomUUID(),true,'0'));await assert.rejects(grant(b,true,'2',randomUUID()));await assert.rejects(grant(b,true,'2',project,''));
  await f.authOperator.disable(c,'synthetic-disabled');await assert.rejects(grant(c,true,'0'));
  const outside=(await projects.create(tokens[0],{name:'Outside scope'},randomUUID())).projectId;await assert.rejects(grant(b,true,'0',outside));
 });
 await t.test('private audit insert failure rolls back the author grant and keeps its old revision',async()=>{
  const before=await audit();await db.admin.query("CREATE FUNCTION workspace.reject_task_author() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='backlog-author' THEN RAISE EXCEPTION 'synthetic-author-audit'; END IF; RETURN NEW; END $$; CREATE TRIGGER reject_task_author BEFORE INSERT ON workspace.authority_provisioning_audit FOR EACH ROW EXECUTE FUNCTION workspace.reject_task_author()");
  try{await assert.rejects(grant(b,true,'2'));assert.equal((await authors(project)).rows.some(r=>r.valid),false);assert.deepEqual(await audit(),before);}finally{await db.admin.query('DROP TRIGGER reject_task_author ON workspace.authority_provisioning_audit;DROP FUNCTION workspace.reject_task_author()');}
  await grant(b,true,'2');
  await assert.rejects(ownedTransaction(db.admin,'operator',sql=>sql.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action) VALUES($1,$2,$3,'project',$3,'backlog-author')",[randomUUID(),b,project])),e=>e.cause?.code==='23505');
 });
 await t.test('real removal invalidates authors and same-role rejoin restores none; unsupported operations stay unadvertised',async()=>{
  assert.equal((await projects.remove(tokens[0],project,b,'1',randomUUID())).status,204);assert.equal((await authors(project)).rows.some(r=>r.valid),false);
  await assert.rejects(grant(b,true,(await authors(project)).rows.at(-1).revision));
  await projects.add(tokens[0],project,{user_id:b,role:'viewer'},randomUUID());assert.equal((await authors(project)).rows.some(r=>r.valid),false);
  const actions=await projects.actions(tokens[1],'project',project);assert(!actions.allowed_operations.includes('createTask'));assert(!actions.allowed_operations.includes('listTasks'));
 });
 await t.test('actual grant commits first behind a SQL barrier; waiting removal invalidates that grant',async()=>{
  const p=(await projects.create(tokens[0],{name:'Grant first'},randomUUID())).projectId;await projects.add(tokens[0],p,{user_id:b,role:'viewer'},randomUUID());
  const gate=pauseAfter(db.admin,'INSERT INTO workspace.capability_grant'),op=new WorkspaceProjectOperator(gate.pool),g=settled(op.project(b,p,'backlog-author',true,'0','synthetic','grant first'));
  await reached(gate,g);const removal=settled(projects.remove(tokens[0],p,b,'1',randomUUID()));
  try{await barrier(db.admin,'workspace_app');}finally{gate.release();}
  assert.equal((await g).error,undefined);assert.equal((await removal).value.status,204);assert.equal((await authors(p)).rows.some(r=>r.valid),false);
 });
 await t.test('actual removal commits first behind a SQL barrier; waiting grant rejects departed membership',async()=>{
  const p=(await projects.create(tokens[0],{name:'Removal first'},randomUUID())).projectId;await projects.add(tokens[0],p,{user_id:b,role:'viewer'},randomUUID());
  const gate=pauseAfter(db.runtime,'UPDATE workspace.membership SET active=false'),store=new WorkspaceProjectStore(gate.pool,f.sessions,f.cursorKey),removal=settled(store.remove(tokens[0],p,b,'1',randomUUID()));
  await reached(gate,removal);const g=settled(grant(b,true,'0',p));
  try{await barrier(db.admin,'postgres');}finally{gate.release();}
  assert.equal((await removal).value.status,204);assert((await g).error);assert.equal((await authors(p)).rowCount,0);
 });
 await t.test('private CLI accepts author grant/revoke with audited reason and emits no database configuration',async()=>{
  const p=(await projects.create(tokens[0],{name:'CLI author'},randomUUID())).projectId;
  async function cli(allowed,expected){return new Promise((resolve,reject)=>{const child=spawn(process.execPath,['services/workspace/src/projects/cli.ts','project'],{env:{...process.env,...db.operatorEnvironment},windowsHide:true});let out='',err='';child.stdout.on('data',b=>out+=b);child.stderr.on('data',b=>err+=b);child.on('error',reject);child.on('close',code=>resolve({code,out,err}));child.stdin.end(JSON.stringify({user_id:a,project_id:p,action:'backlog-author',allowed,expected_revision:expected,reason:'Synthetic CLI author provisioning'}));});}
  for(const [allowed,revision] of [[true,'0'],[false,'1']]){const r=await cli(allowed,revision);assert.equal(r.code,0,r.err);assert.equal(JSON.parse(r.out).changed,true);assert(!r.out.includes('postgresql'));}
  assert.equal((await authors(p)).rows.some(r=>r.valid),false);assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.authority_provisioning_audit WHERE project_id=$1 AND action='backlog-author'",[p])).rows[0].n,'2');
 });
});
