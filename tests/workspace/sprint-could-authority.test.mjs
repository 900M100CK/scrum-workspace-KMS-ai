import {projectFailure} from '../../services/workspace/src/projects/outcomes.ts';import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {couldFixture,value} from './sprint-could-fixture.mjs';import {enableSprint} from './sprint-fixture.mjs';import {SPRINT_OPERATIONS} from '../../services/workspace/src/sprints/http.ts';
test('SP05 Could private independent actions, registration-gated discovery, revoke/remove/rejoin and audited rollback',{timeout:180000},async t=>{
 const f=await couldFixture();t.after(()=>f.close());await enableSprint(f);const s=value(await f.sprint(),201),actor=f.ids[1];await f.projects.add(f.tokens[0],f.project,{user_id:actor,role:'scrum_master'},randomUUID());
 const discover=()=>f.projects.actions(f.tokens[1],'sprint',f.project,new Set(),s.sprint_id,new Set(['editSprint','removeAllocation']));
 assert.deepEqual((await discover()).allowed_operations,['getAllowedActions']);
 for(const [action,op] of [['sprint-edit','editSprint'],['sprint-deallocate','removeAllocation']]){
  await f.operator.project(actor,f.project,action,true,'0','synthetic-could','independent action');assert((await discover()).allowed_operations.includes(op));
  assert.deepEqual((await f.projects.actions(f.tokens[1],'sprint',f.project,new Set(),s.sprint_id,new Set())).allowed_operations,['getAllowedActions']);
 }
 const live=value(await f.call('/access/allowed-actions?resource_kind=sprint&project_id='+f.project+'&resource_id='+s.sprint_id,undefined,'GET',randomUUID(),f.tokens[1]));
 for(const op of ['editSprint','removeAllocation'])assert.equal(live.allowed_operations.includes(op),SPRINT_OPERATIONS.has(op));
 await f.operator.project(actor,f.project,'sprint-edit',false,'1','synthetic-could','revoke edit only');assert(!(await discover()).allowed_operations.includes('editSprint'));assert((await discover()).allowed_operations.includes('removeAllocation'));
 await f.projects.remove(f.tokens[0],f.project,actor,'1',randomUUID());await assert.rejects(discover(),e=>projectFailure(e).status===404);await f.projects.add(f.tokens[0],f.project,{user_id:actor,role:'viewer'},randomUUID());assert.deepEqual((await discover()).allowed_operations,['getAllowedActions']);
 await f.db.admin.query("CREATE FUNCTION workspace.fail_could_authority() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic authority audit failure'; END $$; CREATE TRIGGER fail_could_authority BEFORE INSERT ON workspace.authority_provisioning_audit FOR EACH ROW EXECUTE FUNCTION workspace.fail_could_authority()");
 try{await assert.rejects(f.operator.project(actor,f.project,'sprint-edit',true,'2','synthetic','atomic grant'));assert.equal((await f.db.admin.query("SELECT count(*)::int n FROM workspace.capability_grant WHERE subject_id=$1 AND action='sprint-edit' AND valid",[actor])).rows[0].n,0);}finally{await f.db.admin.query('DROP TRIGGER fail_could_authority ON workspace.authority_provisioning_audit; DROP FUNCTION workspace.fail_could_authority()');}
});
