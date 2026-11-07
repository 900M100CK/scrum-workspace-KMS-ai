import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';import {taskFixture} from './task-fixture.mjs';
test('SP05 Could012 repeat/empty down/up, private scope, typed immutable receipts and retained-evidence refusal',{timeout:180000},async t=>{
 const f=await taskFixture({through:'012'});t.after(()=>f.close());const c=f.db.admin;
 const up=await readFile('services/workspace/migrations/012-sprint-could.up.sql','utf8'),down=await readFile('services/workspace/migrations/012-sprint-could.down.sql','utf8');f.db.migrate();
 async function sql(s){await c.query('BEGIN');try{await c.query('SET LOCAL ROLE workspace_owner');await c.query(s);await c.query('COMMIT');}catch(e){await c.query('ROLLBACK');throw e;}}
 await sql(down);await sql(up);
 const s={sprint_id:randomUUID(),project_id:f.project,goal:'Synthetic receipt',start_date:'2026-11-01',end_date:'2026-11-15',state:'planned',revision:1,created_at:null,started_at:null,completed_at:null};
 for(const op of ['editSprint','removeAllocation']){
  assert.equal((await c.query('SELECT workspace.valid_sprint_receipt($1,$2,$3,200) ok',[s,s.sprint_id,op])).rows[0].ok,true);
  for(const v of [null,{}, {...s,extra:1},{...s,revision:null}])assert.equal((await c.query('SELECT workspace.valid_sprint_receipt($1,$2,$3,200) ok',[v,s.sprint_id,op])).rows[0].ok,false);
  await c.query("INSERT INTO workspace.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,result_ref,expires_at,result_status,result_snapshot) VALUES($1,$2,$3,$4,'committed',$5,'infinity',200,$6)",[f.ids[0],op,randomUUID(),'a'.repeat(64),s.sprint_id,s]);
  await assert.rejects(c.query('UPDATE workspace.idempotency_record SET result_snapshot=$1 WHERE operation=$2',[s,op]),e=>e.code==='23514');
  await assert.rejects(c.query('DELETE FROM workspace.idempotency_record WHERE operation=$1',[op]),e=>e.code==='23514');
 }
 await assert.rejects(sql(down),e=>e.code==='23514');
 for(const action of ['sprint-edit','sprint-deallocate'])await assert.rejects(f.db.runtime.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action) VALUES($1,$2,$3,'project',$3,$4)",[randomUUID(),f.ids[0],f.project,action]),e=>e.code==='42501');
 // Isolate each retained-data class in a transaction; rollback leaves original immutable evidence intact.
 for(const kind of ['grant','provisioning','audit']){
  const clean=await taskFixture({through:'012'});try{await clean.db.admin.query('BEGIN');await clean.db.admin.query('SET LOCAL ROLE workspace_owner');
   if(kind==='grant')await clean.db.admin.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action) VALUES($1,$2,$3,'project',$3,'sprint-edit')",[randomUUID(),clean.ids[0],clean.project]);
   if(kind==='provisioning')await clean.db.admin.query("INSERT INTO workspace.authority_provisioning_audit(event_id,target_user_id,project_id,action,allowed,previous_revision,revision,operator_ref,reason) VALUES($1,$2,$3,'sprint-edit',true,0,1,'synthetic','test refusal')",[randomUUID(),clean.ids[0],clean.project]);
   if(kind==='audit')await clean.db.admin.query("INSERT INTO workspace.business_audit(event_id,actor_id,project_id,action,entity_id,correlation_id) VALUES($1,$2,$3,'sprint-deallocate',$4,$5)",[randomUUID(),clean.ids[0],clean.project,randomUUID(),randomUUID()]);
   await assert.rejects(clean.db.admin.query(down),e=>e.code==='23514');await clean.db.admin.query('ROLLBACK');
  }finally{await clean.db.admin.query('ROLLBACK');await clean.close();}
 }
});
