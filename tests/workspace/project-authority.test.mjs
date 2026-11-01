import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {sessionFixture} from './fixture.mjs';
import {migrate} from '../../scripts/database.mjs';
import {WorkspaceSessionStore,WorkspaceSessionOperator} from '../../services/workspace/src/session/store.ts';
import {WorkspaceProjectOperator} from '../../services/workspace/src/projects/operator.ts';
import {ownedTransaction} from '../../services/workspace/src/session/database.ts';
import {ScryptVerifier} from '../../services/workspace/src/session/kdf.ts';

test('P03 additive 007/private authority and bootstrap on disposable PostgreSQL',{timeout:180000},async t=>{
 const db=await sessionFixture();t.after(()=>db.close());const owner=sql=>ownedTransaction(db.admin,'operator',c=>c.query(sql));
 const baseline=(await db.admin.query('SELECT id,checksum FROM _migrations.applied ORDER BY id')).rows;
 const up=()=>migrate(db.name,'workspace','up',{through:'007'}),down=await readFile('services/workspace/migrations/007-project-membership.down.sql','utf8');
 const user=randomUUID(),other=randomUUID(),authOperator=new WorkspaceSessionOperator(db.admin),operator=new WorkspaceProjectOperator(db.admin),sessions=new WorkspaceSessionStore(db.runtime,{idleSeconds:1800,absoluteSeconds:28800});
 await t.test('007 refuses ambiguous legacy project and retains original data/checksums',async()=>{
  const legacy=randomUUID();await db.admin.query("INSERT INTO workspace.project(project_id,name) VALUES($1,'synthetic-legacy')",[legacy]);
  assert.throws(up,/legacy reconciliation/);assert.equal((await db.admin.query('SELECT name FROM workspace.project WHERE project_id=$1',[legacy])).rows[0].name,'synthetic-legacy');
  // This is the uniquely named disposable fixture's sole synthetic row, never development data.
  await db.admin.query('DELETE FROM workspace.project WHERE project_id=$1',[legacy]);up();up();
  assert.deepEqual((await db.admin.query("SELECT id,checksum FROM _migrations.applied WHERE id<>'007-project-membership' ORDER BY id")).rows,baseline);
 });
 await authOperator.provision(user,'synthetic-project-owner',new ScryptVerifier().dummyCredential,'synthetic-operator');
 await authOperator.provision(other,'synthetic-project-other',new ScryptVerifier().dummyCredential,'synthetic-operator');
 let clock=await authOperator.state();await authOperator.recover({expectedGeneration:clock.generation,expectedLastObserved:clock.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-authority-time',operatorRef:'synthetic-operator'});
 const issued=await sessions.establish(user,'1');assert.equal(issued.kind,'created');
 await t.test('empty 007 reverse/forward preserves SP-01 fault latch, audit and sessions',async()=>{
  await db.admin.query("UPDATE workspace.auth_clock_state SET last_observed=clock_timestamp()+interval '1 day'");
  assert.equal((await sessions.inspect(issued.token)).kind,'unavailable');
  const before=await authOperator.state(),audit=(await db.admin.query('SELECT * FROM workspace.authentication_audit ORDER BY event_id')).rows;
  await owner(down+";DELETE FROM _migrations.applied WHERE id='007-project-membership'");up();
  assert.deepEqual(await authOperator.state(),before);assert.deepEqual((await db.admin.query('SELECT * FROM workspace.authentication_audit ORDER BY event_id')).rows,audit);
  assert.equal((await sessions.inspect(issued.token)).kind,'unavailable');
  clock=await authOperator.state();await authOperator.recover({expectedGeneration:clock.generation,expectedLastObserved:clock.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-recovery',operatorRef:'synthetic-operator'});
 });
 await t.test('runtime cannot bootstrap, access global provisioning audit or rewrite immutable evidence',async()=>{
  for(const sql of ["INSERT INTO workspace.global_project_authority VALUES(gen_random_uuid(),true,1)","UPDATE workspace.global_project_authority SET can_create=true","SELECT * FROM workspace.authority_provisioning_audit","DELETE FROM workspace.authority_provisioning_audit"]){await assert.rejects(db.runtime.query(sql));}
  await assert.rejects(new WorkspaceProjectOperator(db.runtime).global(user,true,'0','synthetic','reason'));
 });
 await t.test('explicit bootstrap/revoke/recovery, same-state no-op and expected revision are audited',async()=>{
  assert.deepEqual(await operator.state(user),{can_create:false,revision:'0'});
  assert.deepEqual(await operator.global(user,true,'0','synthetic-operator','bootstrap'),{changed:true,revision:'1'});
  assert.deepEqual(await operator.global(user,true,'1','synthetic-operator','already granted'),{changed:false,revision:'1'});
  await assert.rejects(operator.global(user,false,'0','synthetic-operator','stale'));
  await operator.global(user,false,'1','synthetic-operator','revoke');await operator.global(other,true,'0','synthetic-operator','recovery to enabled account');
  assert.equal((await operator.state(user)).can_create,false);assert.equal((await operator.state(other)).can_create,true);
  await assert.rejects(operator.global(user,true,'2','','reason'));await assert.rejects(operator.global(randomUUID(),true,'0','synthetic','unknown'));
  const audit=(await db.admin.query('SELECT action,operator_ref,database_principal FROM workspace.authority_provisioning_audit')).rows;
  assert.equal(audit.length,3);assert(audit.every(r=>r.action==='create-project'&&r.operator_ref==='synthetic-operator'&&r.database_principal==='postgres'));
  await assert.rejects(owner("UPDATE workspace.authority_provisioning_audit SET reason='rewrite'"));
 });
 await t.test('private audit failure rolls back authority; disabled targets never bootstrap',async()=>{
  await owner("CREATE FUNCTION workspace.reject_provisioning() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic-audit-failure'; END $$;CREATE TRIGGER reject_provisioning BEFORE INSERT ON workspace.authority_provisioning_audit FOR EACH ROW EXECUTE FUNCTION workspace.reject_provisioning()");
  try{await assert.rejects(operator.global(user,true,'2','synthetic','failure'));assert.equal((await operator.state(user)).can_create,false);}finally{await owner('DROP TRIGGER reject_provisioning ON workspace.authority_provisioning_audit;DROP FUNCTION workspace.reject_provisioning()');}
  const disabled=randomUUID();await authOperator.provision(disabled,'synthetic-disabled',new ScryptVerifier().dummyCredential,'synthetic');await authOperator.disable(disabled,'synthetic');await assert.rejects(operator.global(disabled,true,'0','synthetic','disabled'));
 });
 const project=randomUUID();
 await t.test('project provisioning uses current membership and serialized last-manager rule',async()=>{
  await db.admin.query("INSERT INTO workspace.project(project_id,name,created_by,created_at) VALUES($1,'synthetic-owned',$2,clock_timestamp())",[project,user]);
  for(const u of [user,other])await db.admin.query("INSERT INTO workspace.membership(project_id,user_id,role,membership_generation) VALUES($1,$2,'viewer',1)",[project,u]);
  await operator.project(user,project,'membership-manage',true,'0','synthetic','initial fixture manager');
  await assert.rejects(operator.project(user,project,'membership-manage',false,'1','synthetic','last manager'));
  await operator.project(other,project,'membership-manage',true,'0','synthetic','second fixture manager');
  const results=await Promise.allSettled([operator.project(user,project,'membership-manage',false,'1','synthetic','concurrent A'),operator.project(other,project,'membership-manage',false,'1','synthetic','concurrent B')]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.capability_grant WHERE project_id=$1 AND action='membership-manage' AND valid",[project])).rows[0].n,'1');
 });
 await t.test('project origin and numeric revision bounds enforce DB constraints; unsafe down retains everything',async()=>{
  await assert.rejects(db.admin.query('UPDATE workspace.project SET created_by=$2 WHERE project_id=$1',[project,other]),e=>e.code==='23514');
  await assert.rejects(db.runtime.query('UPDATE workspace.membership SET revision=9007199254740992 WHERE project_id=$1',[project]),e=>e.code==='23514');
  const before=await authOperator.state();await assert.rejects(owner(down));assert.deepEqual(await authOperator.state(),before);
  assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.project')).rows[0].n,'1');
 });
 await t.test('private CLI reads scoped authority through operator configuration without dumping secrets',async()=>{
  const result=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,['services/workspace/src/projects/cli.ts','state'],{env:{...process.env,...db.operatorEnvironment},windowsHide:true});let out='',err='';child.stdout.on('data',b=>out+=b);child.stderr.on('data',b=>err+=b);child.on('error',reject);child.on('close',code=>resolve({code,out,err}));child.stdin.end(JSON.stringify({user_id:other}));});
  assert.equal(result.code,0);assert.equal(JSON.parse(result.out).can_create,true);assert.equal(result.out.includes('postgresql'),false);
 });
 t.diagnostic(JSON.stringify({schema:'007 only; no outcome/cursor table',image:db.image,oldMigrations:baseline.map(r=>r.id),sourceHash:createHash('sha256').update(await readFile('services/workspace/migrations/007-project-membership.up.sql')).digest('hex')}));
});
