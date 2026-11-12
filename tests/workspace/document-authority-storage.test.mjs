import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {documentAuthorityFixture} from './document-authority-fixture.mjs';

test('SP06 P03-A protects private document-create authority and exact provenance',{timeout:180000},async t=>{
 const f=await documentAuthorityFixture();t.after(()=>f.close());
 const up=await readFile('services/workspace/migrations/014-document-create-authority.up.sql','utf8');
 const down=await readFile('services/workspace/migrations/014-document-create-authority.down.sql','utf8');
 assert.match(up,/knowledge-author/);assert.match(up,/SECURITY DEFINER/);assert.match(up,/REVOKE ALL ON FUNCTION/);
 f.db.migrate();
 async function owner(sql,params=[]){
  await f.db.admin.query('BEGIN');
  try{await f.db.admin.query('SET LOCAL ROLE workspace_owner');const result=await f.db.admin.query(sql,params);await f.db.admin.query('COMMIT');return result;}
  catch(error){await f.db.admin.query('ROLLBACK');throw error;}
 }
 async function runtime(sql,params=[]){return f.db.runtime.query(sql,params);}
 const actor=f.ids[1],grant=randomUUID();
 assert.equal((await runtime('SELECT workspace.has_document_create_authority($1,$2) allowed',[actor,f.project])).rows[0].allowed,false);
 await owner("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action,permission_revision) VALUES($1,$2,$3,'project',$3,'knowledge-author',1)",[grant,actor,f.project]);
 await owner("INSERT INTO workspace.authority_provisioning_audit(event_id,target_user_id,project_id,action,allowed,previous_revision,revision,operator_ref,reason) VALUES($1,$2,$3,'knowledge-author',true,0,1,'test','explicit B01 grant')",[grant,actor,f.project]);
 assert.equal((await runtime('SELECT workspace.has_document_create_authority($1,$2) allowed',[actor,f.project])).rows[0].allowed,true);
 assert.equal((await runtime('SELECT workspace.has_document_create_authority($1,$2) allowed',[f.ids[0],f.project])).rows[0].allowed,false);
 assert.equal((await runtime('SELECT workspace.has_document_create_authority($1,$2) allowed',[actor,randomUUID()])).rows[0].allowed,false);
 await assert.rejects(runtime('SELECT * FROM workspace.authority_provisioning_audit'),e=>e.code==='42501');
 await assert.rejects(runtime("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action,permission_revision) VALUES($1,$2,$3,'project',$3,'knowledge-author',1)",[randomUUID(),actor,f.project]),e=>e.code==='42501');
 await assert.rejects(runtime('DELETE FROM workspace.capability_grant WHERE grant_id=$1',[grant]),e=>e.code==='42501');
 await runtime('UPDATE workspace.capability_grant SET valid=false,permission_revision=2 WHERE grant_id=$1',[grant]);
 assert.equal((await runtime('SELECT workspace.has_document_create_authority($1,$2) allowed',[actor,f.project])).rows[0].allowed,false);
 await assert.rejects(owner(down),e=>e.code==='23514');
 await owner('DELETE FROM workspace.capability_grant WHERE grant_id=$1',[grant]);
 // Disposable fixture cleanup: the production audit is append-only, so remove only this
 // synthetic row after temporarily disabling the trigger inside the owner transaction.
 await owner('DROP TRIGGER immutable_authority_audit ON workspace.authority_provisioning_audit');
 await owner('DELETE FROM workspace.authority_provisioning_audit WHERE event_id=$1',[grant]);
 await owner('CREATE TRIGGER immutable_authority_audit BEFORE UPDATE OR DELETE ON workspace.authority_provisioning_audit FOR EACH ROW EXECUTE FUNCTION workspace.protect_authority_audit()');
 await owner(down);await owner(up);
 const definition=(await f.db.admin.query("SELECT pg_get_functiondef('workspace.has_document_create_authority(uuid,uuid)'::regprocedure) value")).rows[0].value;
 assert.match(definition,/SECURITY DEFINER/);assert.match(definition,/search_path TO 'pg_catalog'/);
});
