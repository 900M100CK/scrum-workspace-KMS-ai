import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {documentAuthorityFixture} from './document-authority-fixture.mjs';

test('SP06 P04 private document-author operator is audited, revisioned and membership-bound',{timeout:180000},async t=>{
 const f=await documentAuthorityFixture();
 const {db,ids:[owner,actor,disabled],tokens,project,projects,operator,authOperator}=f;
 t.after(()=>f.close());
 await projects.add(tokens[0],project,{user_id:actor,role:'developer'},randomUUID());
 const grants=p=>db.admin.query("SELECT grant_id,subject_id,valid,permission_revision::text revision FROM workspace.capability_grant WHERE project_id=$1 AND action='knowledge-author' ORDER BY permission_revision,grant_id",[p]);
 const audit=p=>db.admin.query("SELECT event_id,target_user_id,allowed,previous_revision::text previous_revision,revision::text revision,operator_ref,reason FROM workspace.authority_provisioning_audit WHERE project_id=$1 AND action='knowledge-author' ORDER BY recorded_at,event_id",[p]);
 const grant=(allowed,revision,p=project,reason='Synthetic document authority')=>operator.project(actor,p,'knowledge-author',allowed,revision,'synthetic-p04',reason);

 await t.test('explicit grant and revoke use CAS and exact audit provenance',async()=>{
  assert.deepEqual(await grants(project).then(r=>r.rows),[]);
  assert.deepEqual(await grant(true,'0'),{changed:true,revision:'1'});
  assert.deepEqual(await grant(true,'1'),{changed:false,revision:'1'});
  const current=(await grants(project)).rows;assert.equal(current.length,1);assert.equal(current[0].valid,true);
  const events=(await audit(project)).rows;assert.equal(events.length,1);assert.equal(events[0].event_id,current[0].grant_id);assert.equal(events[0].target_user_id,actor);assert.equal(events[0].previous_revision,'0');assert.equal(events[0].revision,'1');
  await assert.rejects(grant(false,'0'),error=>error.cause?.message==='Stale capability revision');
  assert.deepEqual(await grant(false,'1'),{changed:true,revision:'2'});
  assert.equal((await grants(project)).rows.some(row=>row.valid),false);
  assert.equal((await db.admin.query('SELECT workspace.has_document_create_authority($1,$2) allowed',[actor,project])).rows[0].allowed,false);
 });

 await t.test('unknown, disabled, non-member and cross-project targets are denied',async()=>{
  await authOperator.disable(disabled,'synthetic-p04-disabled');
  await assert.rejects(operator.project(disabled,project,'knowledge-author',true,'0','synthetic-p04','disabled'));
  await assert.rejects(operator.project(randomUUID(),project,'knowledge-author',true,'0','synthetic-p04','unknown'));
  const outside=(await projects.create(tokens[0],{name:'P04 outside'},randomUUID())).projectId;
  await assert.rejects(grant(true,'2',outside));
  await assert.rejects(operator.project(actor,project,'knowledge-author',true,'0','synthetic-p04','stale'));
 });

 await t.test('membership removal invalidates the grant and rejoin does not revive it',async()=>{
  await grant(true,'2');
  assert.equal((await db.admin.query('SELECT workspace.has_document_create_authority($1,$2) allowed',[actor,project])).rows[0].allowed,true);
  assert.equal((await projects.remove(tokens[0],project,actor,'1',randomUUID())).status,204);
  assert.equal((await grants(project)).rows.some(row=>row.valid),false);
  await projects.add(tokens[0],project,{user_id:actor,role:'developer'},randomUUID());
  assert.equal((await grants(project)).rows.some(row=>row.valid),false);
  assert.equal((await db.admin.query('SELECT workspace.has_document_create_authority($1,$2) allowed',[actor,project])).rows[0].allowed,false);
 });

 await t.test('audit failure rolls back the private grant',async()=>{
  await db.admin.query("CREATE FUNCTION workspace.reject_document_author() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='knowledge-author' THEN RAISE EXCEPTION 'synthetic-document-author-audit'; END IF; RETURN NEW; END $$; CREATE TRIGGER reject_document_author BEFORE INSERT ON workspace.authority_provisioning_audit FOR EACH ROW EXECUTE FUNCTION workspace.reject_document_author()");
  const before=(await grants(project)).rows;
  try{await assert.rejects(grant(true,'3'));assert.deepEqual((await grants(project)).rows,before);}
  finally{await db.admin.query('DROP TRIGGER reject_document_author ON workspace.authority_provisioning_audit; DROP FUNCTION workspace.reject_document_author()');}
 });

 await t.test('private CLI accepts knowledge-author without exposing database details',async()=>{
  const p=(await projects.create(tokens[0],{name:'P04 CLI'},randomUUID())).projectId;
  await projects.add(tokens[0],p,{user_id:actor,role:'developer'},randomUUID());
  const result=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,['services/workspace/src/projects/cli.ts','project'],{env:{...process.env,...db.operatorEnvironment},windowsHide:true});let out='',err='';child.stdout.on('data',b=>out+=b);child.stderr.on('data',b=>err+=b);child.on('error',reject);child.on('close',code=>resolve({code,out,err}));child.stdin.end(JSON.stringify({user_id:actor,project_id:p,action:'knowledge-author',allowed:true,expected_revision:'0',reason:'Synthetic P04 CLI provisioning'}));});
  assert.equal(result.code,0,result.err);assert.deepEqual(JSON.parse(result.out),{changed:true,revision:'1'});assert(!result.out.includes('postgresql'));
  const row=(await db.admin.query("SELECT event_id FROM workspace.authority_provisioning_audit WHERE project_id=$1 AND action='knowledge-author'",[p])).rows[0];assert(row);
  assert.equal((await grants(p)).rows[0].valid,true);assert.equal((await grants(p)).rows[0].grant_id,row.event_id);
 });
});
