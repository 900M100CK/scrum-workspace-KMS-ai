import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {couldFixture,enableCould,value} from './sprint-could-fixture.mjs';
test('SP05 Could PATCH strict partial merge, no-op, original replay and current independent authority',{timeout:180000},async t=>{
 const f=await couldFixture();t.after(()=>f.close());await enableCould(f);let s=value(await f.sprint(),201);const path='/sprints/'+s.sprint_id;
 await f.projects.add(f.tokens[0],f.project,{user_id:f.ids[1],role:'scrum_master'},randomUUID());assert.equal((await f.edit(s,{goal:'Denied'},randomUUID(),f.tokens[1])).statusCode,403);
 const key=randomUUID(),original=value(await f.edit(s,{goal:'Edited Planned'},key));assert.equal(original.goal,'Edited Planned');assert.equal(original.start_date,s.start_date);assert.equal(original.revision,2);
 assert.equal((await f.edit(s,{goal:'Different'},key)).statusCode,409);assert.deepEqual(value(await f.edit(s,{goal:'Edited Planned'},key)),original);s=original;
 const audit=async()=>Number((await f.db.admin.query("SELECT count(*)::int n FROM workspace.business_audit WHERE action='sprint-edit'")).rows[0].n),before=await audit();
 for(const fields of [{},{goal:s.goal},{start_date:s.start_date,end_date:s.end_date}])assert.deepEqual(value(await f.edit(s,fields)),s);assert.equal(await audit(),before);
 for(const fields of [{goal:'   '},{goal:null},{goal:'bad\0goal'},{start_date:'2026-02-30'},{start_date:'0000-01-01'},{start_date:'2026-11-15'},{end_date:'2026-11-01'},{expected_revision:0},{extra:1}])assert.equal((await f.edit(s,fields)).statusCode,400,JSON.stringify(fields));
 assert.equal((await f.edit({...s,revision:1},{goal:'Stale'})).statusCode,409);
 assert.equal((await f.call(path+'?extra=1',{expected_revision:s.revision},'PATCH')).statusCode,400);
 assert.equal((await f.edit(s,{goal:'x'.repeat(9000)})).statusCode,413);
 assert.equal((await f.app.inject({method:'PATCH',url:path,headers:{...f.headers(),'idempotency-key':randomUUID(),'content-type':'text/plain'},payload:'text'})).statusCode,415);
 s=value(await f.edit(s,{end_date:'2026-11-20'}));assert.equal(s.end_date,'2026-11-20');s=value(await f.call(path+'/start',{expected_revision:s.revision}));assert.equal((await f.edit(s,{goal:'Active denied'})).statusCode,409);assert.deepEqual(value(await f.edit({...s,revision:1},{goal:'Edited Planned'},key)),original);
 s=value(await f.call(path+'/complete',{expected_revision:s.revision})).sprint;assert.equal((await f.edit(s,{})).statusCode,409);assert.deepEqual(value(await f.edit({...s,revision:1},{goal:'Edited Planned'},key)),original);
 await f.operator.project(f.ids[0],f.project,'sprint-edit',false,'1','synthetic','revoke');assert.equal((await f.edit({...s,revision:1},{goal:'Edited Planned'},key)).statusCode,403);
 const other=value(await f.edit({...s,revision:1},{goal:'Edited Planned'},key,f.tokens[2]),404);assert.deepEqual(other,{code:'not_found',message:'Resource unavailable'});
});

test('SP05 Could DELETE unfinished Planned/Active returns, Done/location denial, numeric append and immutable replay',{timeout:180000},async t=>{
 const f=await couldFixture();t.after(()=>f.close());await enableCould(f);
 const snapshot=async()=>{const out=[];for(const table of ['sprint','task','sprint_allocation','business_audit','idempotency_record'])out.push((await f.db.admin.query('SELECT row_to_json(t) value FROM workspace.'+table+' t ORDER BY row_to_json(t)::text')).rows);return out;};
 const seed=value(await f.create({type:'task',title:'Numeric append seed'}),201);await f.db.admin.query("UPDATE workspace.task SET backlog_position=9007199254740993.25 WHERE task_id=$1",[seed.task_id]);
 for(const state of ['todo','in_progress']){
  let s=value(await f.sprint('Remove '+state),201),task=value(await f.create({type:'task',title:'Remove '+state}),201);s=value(await f.call('/sprints/'+s.sprint_id+'/items',{task_id:task.task_id,expected_revision:s.revision}));
  if(state==='in_progress'){s=value(await f.call('/sprints/'+s.sprint_id+'/start',{expected_revision:s.revision}));task=await f.tasks.get(f.tokens[0],task.task_id);await f.tasks.setState(f.tokens[0],task.task_id,{state,expected_revision:task.revision},randomUUID());}
  const current=await f.tasks.get(f.tokens[0],task.task_id),key=randomUUID(),generation=(await f.db.admin.query('SELECT backlog_revision::text value FROM workspace.project WHERE project_id=$1',[f.project])).rows[0].value;
  await f.db.admin.query('UPDATE workspace.task SET assignee_id=$2 WHERE task_id=$1',[task.task_id,f.ids[0]]);
  const expected=(await f.db.admin.query("SELECT (max(backlog_position)+1)::text value FROM workspace.task WHERE project_id=$1 AND location_kind='backlog'",[f.project])).rows[0].value;
  const result=value(await f.remove(s,task,key));assert.equal(result.revision,s.revision+1);const live=await f.tasks.get(f.tokens[0],task.task_id);assert.equal(live.state,'todo');assert.equal(live.work_location.kind,'backlog');assert.equal(live.work_location.position,expected);assert.equal(live.assignee_id,f.ids[0]);assert.equal(live.revision,current.revision+1);assert.notEqual((await f.db.admin.query('SELECT backlog_revision::text value FROM workspace.project WHERE project_id=$1',[f.project])).rows[0].value,generation);
  const audit=(await f.db.admin.query("SELECT before_ref,after_ref FROM workspace.business_audit WHERE action='sprint-deallocate' AND entity_id=$1",[task.task_id])).rows[0];assert.equal(JSON.parse(audit.before_ref).state,state);assert.equal(JSON.parse(audit.after_ref).position,expected);assert.equal(JSON.parse(audit.after_ref).key,key);
  const before=await snapshot();assert.deepEqual(value(await f.remove(s,task,key)),result);assert.deepEqual(await snapshot(),before);assert.equal((await f.remove(result,task)).statusCode,409);assert.equal((await f.remove(result,task,key)).statusCode,409);
  if(state==='in_progress'){const completed=value(await f.call('/sprints/'+s.sprint_id+'/complete',{expected_revision:result.revision}));assert.equal(completed.returned_unfinished_count,0);assert.deepEqual(value(await f.remove(s,task,key)),result);}
 }
 let s=value(await f.sprint('Done denial'),201),task=value(await f.create(),201);s=value(await f.call('/sprints/'+s.sprint_id+'/items',{task_id:task.task_id,expected_revision:s.revision}));task=await f.tasks.get(f.tokens[0],task.task_id);await f.tasks.setState(f.tokens[0],task.task_id,{state:'done',expected_revision:task.revision},randomUUID());
 let before=await snapshot();const done=await f.remove(s,task);assert.equal(done.statusCode,409);assert.equal(done.json().code,'task_already_done');assert.deepEqual(await snapshot(),before);
 assert.equal((await f.remove({...s,revision:1},task)).json().code,'state_conflict');assert.deepEqual(value(await f.remove(s,task,randomUUID(),f.tokens[2]),404),{code:'not_found',message:'Resource unavailable'});
 s=value(await f.call('/sprints/'+s.sprint_id+'/start',{expected_revision:s.revision}));s=value(await f.call('/sprints/'+s.sprint_id+'/complete',{expected_revision:s.revision})).sprint;before=await snapshot();assert.equal((await f.remove(s,task)).json().code,'state_conflict');assert.deepEqual(await snapshot(),before);
 const url='/sprints/'+s.sprint_id+'/items/'+task.task_id;
 for(const header of [undefined,'0','01','1.5','9007199254740992'])assert.equal((await f.app.inject({method:'DELETE',url,headers:{...f.headers(),'idempotency-key':randomUUID(),...(header?{'x-expected-revision':header}:{})}})).statusCode,400);
 for(const extra of [{url:url+'?extra=1'},{payload:{}},{payload:{large:'x'.repeat(9000)}}]){const r=await f.app.inject({method:'DELETE',url,headers:{...f.headers(),'idempotency-key':randomUUID(),'x-expected-revision':String(s.revision)},...extra});assert.equal(r.statusCode,extra.payload?.large?413:400,r.body);}
 const foreign=await f.projects.create(f.tokens[0],{name:'Foreign removal'},randomUUID());const unknown=await f.app.inject({method:'DELETE',url:'/sprints/'+s.sprint_id+'/items/'+randomUUID(),headers:{...f.headers(),'idempotency-key':randomUUID(),'x-expected-revision':String(s.revision)}});assert.equal(unknown.statusCode,404);assert(!unknown.body.includes('Done'));
});
