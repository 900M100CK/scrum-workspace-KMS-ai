import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {sprintFixture,enableSprint} from './sprint-fixture.mjs';import {pauseTaskQuery,taskBarrier} from './task-fixture.mjs';import {WorkspaceSprintStore} from '../../services/workspace/src/sprints/store.ts';import {WorkspaceProjectOperator} from '../../services/workspace/src/projects/operator.ts';import {buildApp} from '../../services/workspace/src/app.ts';
const value=(r,status=200)=>{assert.equal(r.statusCode,status,r.body);return r.json();};
async function candidate(f,op){const task=value(await f.create(),201);let s=value(await f.sprint(),201);if(op==='completeSprint'){s=value(await f.call('/sprints/'+s.sprint_id+'/items',{task_id:task.task_id,expected_revision:s.revision}));s=value(await f.call('/sprints/'+s.sprint_id+'/start',{expected_revision:s.revision}));}const list=value(await f.call('/projects/'+f.project+'/tasks?location=backlog',undefined,'GET'));
 return {s,task,path:op==='createSprint'?'/projects/'+f.project+'/sprints':op==='reorderBacklog'?'/projects/'+f.project+'/backlog-order':'/sprints/'+s.sprint_id+(op==='allocateTask'?'/items':op==='startSprint'?'/start':'/complete'),input:op==='createSprint'?{goal:'Secured original',start_date:'2026-11-01',end_date:'2026-11-15'}:op==='reorderBacklog'?{task_ids:list.items.map(t=>t.task_id).reverse(),expected_revision:list.backlog_revision}:op==='allocateTask'?{task_id:task.task_id,expected_revision:s.revision}:{expected_revision:s.revision}};
}
async function snapshot(f){const r=[];for(const table of ['sprint','task','sprint_allocation','business_audit','idempotency_record'])r.push((await f.db.admin.query('SELECT row_to_json(t) FROM workspace.'+table+' t ORDER BY row_to_json(t)::text')).rows);return r;}
test('SP05 actual revoke-first schedules withhold every saved original and changed-payload request',{timeout:240000},async t=>{
 const f=await sprintFixture();t.after(()=>f.close());await enableSprint(f);
 for(const [op,action]of [['createSprint','sprint-create'],['allocateTask','sprint-allocate'],['startSprint','sprint-start'],['completeSprint','sprint-complete'],['reorderBacklog','backlog-order']])await t.test(op,async()=>{
  const item=await candidate(f,op),key=randomUUID(),original=value(await f.call(item.path,item.input,'POST',key),op==='createSprint'?201:200),before=await snapshot(f);
  const revision=(await f.operator.state(f.ids[0],f.project)).find(r=>r.action===action&&r.valid).revision;
  const gate=pauseTaskQuery(f.db.admin,'UPDATE workspace.capability_grant SET valid=false'),operator=new WorkspaceProjectOperator(gate.pool),revoke=operator.project(f.ids[0],f.project,action,false,revision,'synthetic-sec','revoke first');await gate.ready;
  const old=f.call(item.path,item.input,'POST',key),changed=f.call(item.path,{...item.input,...(op==='createSprint'?{goal:'Changed original'}:op==='reorderBacklog'?{expected_revision:'999'}:{expected_revision:999})},'POST',key);
  try{await taskBarrier(f.db.admin,'workspace_app','auth_clock_state',2);}finally{gate.release();}await revoke;
  for(const response of [await old,await changed]){assert.equal(response.statusCode,403,response.body);assert(!response.body.includes('Secured original'));}
  assert.deepEqual(await snapshot(f),before);await f.operator.project(f.ids[0],f.project,action,true,(BigInt(revision)+1n).toString(),'synthetic-sec','explicit restore');assert.deepEqual(value(await f.call(item.path,item.input,'POST',key),op==='createSprint'?201:200),original);
  if(op==='startSprint')value(await f.call('/sprints/'+item.s.sprint_id+'/complete',{expected_revision:original.revision}));
 });
});

test('SP05 post-wait expiry withholds every write/read and leaves business evidence unchanged',{timeout:300000},async t=>{
 for(const op of ['createSprint','allocateTask','startSprint','completeSprint','reorderBacklog','getSprint','listSprints','listSprintItems'])await t.test(op,async()=>{
  const f=await sprintFixture();try{await enableSprint(f);value(await f.create(),201);const item=await candidate(f,['getSprint','listSprints','listSprintItems'].includes(op)?'startSprint':op);
   const fragments={createSprint:'SELECT project_id,name,description,revision::text',allocateTask:'SELECT task_id,revision::text,location_kind',startSprint:' FROM workspace.sprint WHERE sprint_id=$1 AND project_id=$2 FOR UPDATE',completeSprint:'FOR UPDATE OF t,a',reorderBacklog:'SELECT task_id,trim_scale(backlog_position)::text',getSprint:' FROM workspace.sprint WHERE sprint_id=$1 AND project_id=$2 FOR UPDATE',listSprints:' FROM workspace.sprint WHERE project_id=$1 ORDER BY sprint_id',listSprintItems:'a.allocation_state FROM workspace.task'};
   const gate=pauseTaskQuery(f.db.runtime,fragments[op]),app=buildApp({store:f.sessions,projects:f.projects,tasks:f.tasks,sprints:new WorkspaceSprintStore(gate.pool,f.sessions,f.cursorKey),origin:'https://localhost'});await app.ready();
   const before=await snapshot(f);await f.db.admin.query("UPDATE workspace.session SET expires_at=clock_timestamp()+interval '250 milliseconds' WHERE user_id=$1",[f.ids[0]]);
   const read=['getSprint','listSprints','listSprintItems'].includes(op),path=op==='getSprint'?'/sprints/'+item.s.sprint_id:op==='listSprints'?'/projects/'+f.project+'/sprints':op==='listSprintItems'?'/sprints/'+item.s.sprint_id+'/items':item.path;
   const call=f.call(path,read?undefined:item.input,read?'GET':'POST',randomUUID(),f.tokens[0],app);await Promise.race([gate.ready,call.then(()=>{throw Error('Expiry barrier not reached');})]);await new Promise(r=>setTimeout(r,400));gate.release();
   try{const result=await call;assert.equal(result.statusCode,401,result.body);assert(!('items' in result.json()));assert.deepEqual(await snapshot(f),before);}finally{await app.close();}
  }finally{await f.close();}
 });
});
