import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {projectFixture} from './project-fixture.mjs';
import {ownedTransaction} from '../../services/workspace/src/session/database.ts';

test('P06 actual atomic removal, retained history and no-revival replay',{timeout:150000},async t=>{
 const f=await projectFixture();t.after(()=>f.close());const{db,ids:[a,b,c],project,operator,add,remove,get}=f;
 await add(b);await add(c,'developer');
 const auditCount=async()=>(await db.admin.query('SELECT count(*) n FROM workspace.business_audit WHERE project_id=$1',[project])).rows[0].n;
 await t.test('last manager rejection leaves membership, grants, tasks and business audit unchanged',async()=>{
  const before=await auditCount(),r=await remove(a,1);assert.equal(r.statusCode,409,r.body);assert.equal(await auditCount(),before);
  assert.equal((await db.admin.query('SELECT active FROM workspace.membership WHERE project_id=$1 AND user_id=$2',[project,a])).rows[0].active,true);
 });
 const task=randomUUID(),completed=randomUUID(),sprint=randomUUID(),document=randomUUID(),foreign=randomUUID(),foreignTask=randomUUID();
 await ownedTransaction(db.admin,'operator',async sql=>{
  await sql.query("INSERT INTO workspace.document_policy VALUES($1,$2,'restricted','active',1)",[document,project]);
  await sql.query('INSERT INTO workspace.read_grant(project_id,document_id,user_id,grant_generation,membership_generation) VALUES($1,$2,$3,1,1)',[project,document,c]);
  for(const action of ['content-write','manage-access','lifecycle-manage','sprint-manage','audit-read','trace-read'])await sql.query("INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action) VALUES($1,$2,$3,'document',$4,$5)",[randomUUID(),c,project,document,action]);
  await sql.query("INSERT INTO workspace.task(task_id,project_id,type,title,state,assignee_id,backlog_position) VALUES($1,$2,'task','Synthetic current','todo',$3,7)",[task,project,c]);
  await sql.query("INSERT INTO workspace.sprint VALUES($1,$2,'Synthetic completed','2026-01-01','2026-01-15','completed',1)",[sprint,project]);
  await sql.query("INSERT INTO workspace.task(task_id,project_id,type,title,state,assignee_id,location_kind,location_sprint_id) VALUES($1,$2,'task','Synthetic completed task','done',$3,'completed',$4)",[completed,project,c,sprint]);
  await sql.query("INSERT INTO workspace.sprint_allocation VALUES($1,$2,$3,'completed',1)",[project,sprint,completed]);
  await sql.query("INSERT INTO workspace.project(project_id,name,created_by,created_at) VALUES($1,'Synthetic other project',$2,clock_timestamp())",[foreign,c]);
  await sql.query("INSERT INTO workspace.membership(project_id,user_id,role,membership_generation) VALUES($1,$2,'viewer',1)",[foreign,c]);
  await sql.query("INSERT INTO workspace.task(task_id,project_id,type,title,state,assignee_id) VALUES($1,$2,'task','Synthetic unrelated','todo',$3)",[foreignTask,foreign,c]);
 });
 const allocation=(await db.admin.query('SELECT * FROM workspace.sprint_allocation WHERE task_id=$1',[completed])).rows[0];
 await t.test('removal co-commits all grant invalidation, task revision/unassignment and audit; history/other project stay',async()=>{
  const r=await remove(c,1,'remove-c');assert.equal(r.statusCode,204,r.body);assert.equal(r.body,'');
  assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.capability_grant WHERE project_id=$1 AND subject_id=$2 AND valid',[project,c])).rows[0].n,'0');
  assert.equal((await db.admin.query('SELECT valid FROM workspace.read_grant WHERE document_id=$1',[document])).rows[0].valid,false);
  const tasks=(await db.admin.query('SELECT task_id,assignee_id,revision::text,state,location_kind,backlog_position::text FROM workspace.task WHERE project_id=$1 ORDER BY task_id',[project])).rows;
  assert.equal(tasks.length,2);for(const row of tasks){assert.equal(row.assignee_id,null);assert.equal(row.revision,'2');}
  assert.equal(tasks.find(row=>row.task_id===task).backlog_position,'7');assert.equal(tasks.find(row=>row.task_id===completed).state,'done');assert.equal(tasks.find(row=>row.task_id===completed).location_kind,'completed');
  assert.deepEqual((await db.admin.query('SELECT * FROM workspace.sprint_allocation WHERE task_id=$1',[completed])).rows[0],allocation);
  assert.equal((await db.admin.query('SELECT assignee_id FROM workspace.task WHERE task_id=$1',[foreignTask])).rows[0].assignee_id,c);
  assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.business_audit WHERE project_id=$1 AND action='task_unassigned'",[project])).rows[0].n,'2');
  const denied=await get('/projects/'+project,f.tokens[2]),missing=await get('/projects/'+randomUUID(),f.tokens[2]);assert.equal(denied.statusCode,404);assert.equal(denied.body,missing.body);
 });
 await t.test('old removal replay never removes rejoined membership; stale new-key removal conflicts',async()=>{
  const before=await auditCount();assert.equal((await remove(c,1,'remove-c')).statusCode,204);assert.equal(await auditCount(),before);
  const r=await add(c,'viewer','rejoin');assert.equal(r.statusCode,201);assert.equal(r.json().revision,3);
  assert.equal((await remove(c,1,'remove-c')).statusCode,204);assert.equal((await remove(c,1,'stale-fresh')).statusCode,409);
  const member=(await db.admin.query('SELECT active,revision::text,membership_generation::text FROM workspace.membership WHERE project_id=$1 AND user_id=$2',[project,c])).rows[0];assert.deepEqual(member,{active:true,revision:'3',membership_generation:'3'});
  assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.read_grant WHERE user_id=$1 AND valid',[c])).rows[0].n,'0');
  assert.equal((await db.admin.query('SELECT count(*) n FROM workspace.task WHERE project_id=$1 AND assignee_id=$2',[project,c])).rows[0].n,'0');
 });
 await t.test('audit and saved-outcome failures roll back removal completely',async()=>{
  for(const table of ['business_audit','idempotency_record']){
   const before=await auditCount();await db.admin.query(`CREATE FUNCTION workspace.reject_remove() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic-remove-canary'; END $$;CREATE TRIGGER reject_remove BEFORE INSERT ON workspace.${table} FOR EACH ROW EXECUTE FUNCTION workspace.reject_remove()`);
   try{const r=await remove(b,1,'failure-'+table);assert.equal(r.statusCode,503);assert(!r.body.includes('canary'));assert.equal(await auditCount(),before);assert.equal((await db.admin.query('SELECT active,revision::text FROM workspace.membership WHERE project_id=$1 AND user_id=$2',[project,b])).rows[0].active,true);}finally{await db.admin.query(`DROP TRIGGER reject_remove ON workspace.${table};DROP FUNCTION workspace.reject_remove()`);}
  }
 });
 await t.test('task revision overflow rejects before any membership or grant changes',async()=>{
  await db.admin.query('UPDATE workspace.task SET assignee_id=$2,revision=9007199254740991 WHERE task_id=$1',[task,c]);
  const before=await auditCount();const r=await remove(c,3,'overflow');assert.equal(r.statusCode,409);assert.equal(await auditCount(),before);
  assert.equal((await db.admin.query('SELECT active FROM workspace.membership WHERE project_id=$1 AND user_id=$2',[project,c])).rows[0].active,true);
  await db.admin.query('UPDATE workspace.task SET assignee_id=NULL,revision=2 WHERE task_id=$1',[task]);
 });
 await t.test('two manager removal requests serialize and cannot leave zero managers',async()=>{
  await operator.project(b,project,'membership-manage',true,'0','synthetic','second manager');
  const results=await Promise.all([remove(b,1,'race-b',f.tokens[0]),remove(a,1,'race-a',f.tokens[1])]);assert.equal(results.filter(r=>r.statusCode===204).length,1);
  assert.equal((await db.admin.query("SELECT count(*) n FROM workspace.membership m JOIN workspace.auth_account a USING(user_id) JOIN workspace.capability_grant g ON g.project_id=m.project_id AND g.subject_id=m.user_id WHERE m.project_id=$1 AND m.active AND NOT a.disabled AND g.action='membership-manage' AND g.valid AND g.resource_kind='project' AND g.resource_id=$1",[project])).rows[0].n,'1');
 });
});
