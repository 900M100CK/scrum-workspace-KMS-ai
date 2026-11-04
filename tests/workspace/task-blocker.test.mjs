import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {taskMutationFixture} from './task-mutation-fixture.mjs';
import {pauseTaskQuery} from './task-fixture.mjs';
import {WorkspaceTaskStore} from '../../services/workspace/src/tasks/store.ts';
import {projectFailure} from '../../services/workspace/src/projects/outcomes.ts';
import {buildApp} from '../../services/workspace/src/app.ts';

test('SP04 append-only blocker commands and scoped history pages',{timeout:180000},async t=>{
 const f=await taskMutationFixture();t.after(()=>f.close());const {db,project,ids:[a,b],tokens,operator,projects}=f;
 await operator.project(a,project,'backlog-author',true,'0','synthetic-blocker','fixture');await projects.add(tokens[0],project,{user_id:b,role:'viewer'},randomUUID());
 const fresh=async()=>{const r=await f.create();assert.equal(r.statusCode,201,r.body);return r.json();};
 const post=(id,input,k=randomUUID(),token=tokens[0],app=f.app)=>app.inject({method:'POST',url:`/tasks/${id}/blockers`,headers:{...f.headers(token),'idempotency-key':k},payload:input});
 const history=(id,cursor,token=tokens[0],app=f.app)=>app.inject({url:`/tasks/${id}/blockers`+(cursor?'?cursor='+encodeURIComponent(cursor):''),headers:f.headers(token)});
 const row=await fresh();
 await t.test('history needs membership not audit/action; commands require exact authority; strict validation',async()=>{
  assert.deepEqual((await history(row.task_id,undefined,tokens[1])).json(),{items:[],next_cursor:null});
  assert.equal((await post(row.task_id,{status:'open',description:'Plan',expected_revision:1})).statusCode,403);
  const denied=await history(row.task_id,undefined,tokens[2]);assert.equal(denied.statusCode,404);assert.deepEqual(denied.json(),{code:'not_found',message:'Resource unavailable'});
  await operator.project(a,project,'task-blocker',true,'0','synthetic-blocker','explicit');
  for(const input of [{status:'planned',description:'x',expected_revision:1},{status:'open',description:'',expected_revision:1},{status:'open',description:null,expected_revision:1},{status:'open',description:'x',outcome:3,expected_revision:1},{status:'open',description:'x',expected_revision:9007199254740992},{status:'open',description:'x',expected_revision:1,actor_id:a}])assert.equal((await post(row.task_id,input)).statusCode,400);
 });
 let first,key;
 await t.test('retrospective resolution, repeated Open and later Resolved append every distinct event; sequence is truth',async()=>{
  let revision=1;
  for(const status of ['resolved','open','open','resolved']){
   const k=randomUUID(),body={status,description:'Exact event '+revision,outcome:status==='resolved'?'Recorded result':null,expected_revision:revision};const r=await post(row.task_id,body,k);assert.equal(r.statusCode,201,r.body);const event=r.json();assert.equal(event.sequence,revision);assert.equal(event.actor_id,a);assert.equal(event.description,body.description);assert(Number.isFinite(Date.parse(event.recorded_at)));
   if(revision===1){first=event;key=k;}
   assert.deepEqual((await post(row.task_id,body,k)).json(),event);assert.equal((await f.tasks.get(tokens[0],row.task_id)).blocked,status==='open');revision++;
  }
  assert.equal((await f.tasks.get(tokens[0],row.task_id)).revision,5);const items=(await history(row.task_id)).json().items;assert.deepEqual(items.map(v=>v.sequence),[1,2,3,4]);assert.deepEqual(items[0],first);
  assert.deepEqual((await post(row.task_id,{status:'resolved',description:'Exact event 1',outcome:'Recorded result',expected_revision:1},key)).json(),first);
  assert.equal((await post(row.task_id,{status:'open',description:'Changed input',expected_revision:1},key)).statusCode,409);
  assert.equal((await post(row.task_id,{status:'open',description:'Stale',expected_revision:1})).statusCode,409);
  await assert.rejects(db.runtime.query('UPDATE workspace.blocker_event SET description=$1 WHERE event_id=$2',['Changed',first.event_id]));
 });
 await t.test('event/task/audit/outcome faults roll back entire append and retry uses original identity',async()=>{
  for(const table of ['blocker_event','task','business_audit','idempotency_record']){
   const row=await fresh(),k=randomUUID(),body={status:'open',description:'Synthetic fault',expected_revision:1};
   await db.admin.query(`CREATE FUNCTION workspace.reject_blocker() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic-private'; END $$; CREATE TRIGGER reject_blocker BEFORE ${table==='task'?'UPDATE':'INSERT'} ON workspace.${table} FOR EACH ROW EXECUTE FUNCTION workspace.reject_blocker()`);
   try{const r=await post(row.task_id,body,k);assert.equal(r.statusCode,503,r.body);assert(!r.body.includes('private'));assert.deepEqual(await f.tasks.get(tokens[0],row.task_id),row);assert.deepEqual((await history(row.task_id)).json().items,[]);}finally{await db.admin.query(`DROP TRIGGER reject_blocker ON workspace.${table}; DROP FUNCTION workspace.reject_blocker()`);}
   assert.equal((await post(row.task_id,body,k)).statusCode,201);
  }
 });
 await t.test('concurrent writes conflict; duplicate keys append once; default outcome canonicalizes null',async()=>{
  const row=await fresh(),body={status:'open',description:'Once',expected_revision:1},k=randomUUID();const rs=await Promise.all([post(row.task_id,body,k),post(row.task_id,body,k)]);assert.deepEqual(rs.map(r=>r.statusCode),[201,201]);assert.deepEqual(rs[0].json(),rs[1].json());assert.equal((await history(row.task_id)).json().items.length,1);assert.deepEqual((await post(row.task_id,{...body,outcome:null},k)).json(),rs[0].json());
  const races=await Promise.all(['open','resolved'].map(status=>post(row.task_id,{status,description:'Racing',expected_revision:2})));assert.deepEqual(races.map(r=>r.statusCode).sort(),[201,409]);
 });
 let paged,cursor;
 await t.test('ascending pages bind actor/task/full dataset; current login survives but stale/foreign/malformed fails',async()=>{
  paged=await fresh();for(let i=1;i<=52;i++){const r=await post(paged.task_id,{status:'open',description:'History '+i,expected_revision:i});assert.equal(r.statusCode,201,r.body);}
  const page=(await history(paged.task_id)).json();assert.equal(page.items.length,50);assert.deepEqual(page.items.map(v=>v.sequence),Array.from({length:50},(_,i)=>i+1));cursor=page.next_cursor;assert(cursor);
  const end=await history(paged.task_id,cursor);assert.equal(end.statusCode,200,end.body);assert.deepEqual(end.json().items.map(v=>v.sequence),[51,52]);assert.equal(end.json().next_cursor,null);
  const again=(await f.sessions.establish(a,'1')).token;assert.equal((await history(paged.task_id,cursor,again)).statusCode,200);
  assert.equal((await history(paged.task_id,cursor,tokens[1])).statusCode,400);assert.equal((await history(row.task_id,cursor)).statusCode,400);assert.equal((await history(paged.task_id,'malformed')).statusCode,400);
  assert.equal((await post(paged.task_id,{status:'resolved',description:'New projection',expected_revision:53})).statusCode,201);const stale=await history(paged.task_id,cursor);assert.equal(stale.statusCode,409);assert(!('items' in stale.json()));
 });
 await t.test('expired signed cursors, missing signing key and removal/rejoin deny or invalidate history',async()=>{
  const now=Date.now(),codec=f.tasks.projects.cursor,access=(await db.admin.query('SELECT revision::text,membership_generation::text FROM workspace.membership WHERE project_id=$1 AND user_id=$2',[project,a])).rows[0];
  const items=[...(await f.tasks.blockers(tokens[0],paged.task_id)).items,...(await f.tasks.blockers(tokens[0],paged.task_id,(await f.tasks.blockers(tokens[0],paged.task_id)).next_cursor)).items];
  const scope=codec.fingerprint(['listBlockerEvents',a,project,paged.task_id,'sequence',50]),generation=codec.fingerprint([access.revision,access.membership_generation,items]);
  const expired=codec.encode(scope,generation,items[49].event_id,now-301000);assert.equal((await history(paged.task_id,expired)).statusCode,409);
  const missing=codec.encode(scope,generation,randomUUID(),now);assert.equal((await history(paged.task_id,missing)).statusCode,409);
  await assert.rejects(new WorkspaceTaskStore(db.runtime,f.sessions).blockers(tokens[0],paged.task_id),e=>projectFailure(e).status===503);
  const old=(await history(paged.task_id,undefined,tokens[1])).json().next_cursor;await projects.remove(tokens[0],project,b,'1',randomUUID());assert.equal((await history(paged.task_id,old,tokens[1])).statusCode,404);await projects.add(tokens[0],project,{user_id:b,role:'viewer'},randomUUID());assert.equal((await history(paged.task_id,old,tokens[1])).statusCode,409);
 });
 await t.test('revision and sequence upper bounds reject writes; revoked replay denies',async()=>{
  const row=await fresh();await db.admin.query('UPDATE workspace.task SET revision=9007199254740991 WHERE task_id=$1',[row.task_id]);assert.equal((await post(row.task_id,{status:'open',description:'Overflow',expected_revision:9007199254740991})).statusCode,409);
  const seq=await fresh();await db.admin.query("INSERT INTO workspace.blocker_event(event_id,task_id,status,description,actor_id,sequence) VALUES($1,$2,'open','Maximum',$3,9007199254740991)",[randomUUID(),seq.task_id,a]);assert.equal((await post(seq.task_id,{status:'resolved',description:'Overflow',expected_revision:1})).statusCode,409);
  await operator.project(a,project,'task-blocker',false,'1','synthetic-blocker','revoke');assert.equal((await post(first.task_id,{status:'resolved',description:'Exact event 1',outcome:'Recorded result',expected_revision:1},key)).statusCode,403);
 });
 await t.test('actual history read wait rechecks session before returning any page',async()=>{
  const gate=pauseTaskQuery(db.runtime,'FROM workspace.blocker_event WHERE task_id=$1 ORDER BY workspace.blocker_event.sequence'),tasks=new WorkspaceTaskStore(gate.pool,f.sessions,f.cursorKey),app=buildApp({store:f.sessions,projects,tasks,origin:'https://localhost'});await app.ready();
  await db.admin.query("UPDATE workspace.session SET expires_at=clock_timestamp()+interval '250 milliseconds' WHERE user_id=$1",[a]);const pending=history(paged.task_id,undefined,tokens[0],app);await gate.ready;await new Promise(r=>setTimeout(r,400));gate.release();try{const r=await pending;assert.equal(r.statusCode,401);assert(!('items' in r.json()));}finally{await app.close();}
 });
});
