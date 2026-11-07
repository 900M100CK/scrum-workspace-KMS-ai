import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {couldFixture,enableCould,value} from './sprint-could-fixture.mjs';import {WorkspaceSprintStore} from '../../services/workspace/src/sprints/store.ts';import {buildApp} from '../../services/workspace/src/app.ts';
test('SP05 Could producer atomic audit/receipt failure and lost real COMMIT recovery',{timeout:180000},async t=>{
 const f=await couldFixture();t.after(()=>f.close());await enableCould(f);
 const snapshot=async()=>{const values=[];for(const table of ['sprint','task','sprint_allocation','business_audit','idempotency_record'])values.push((await f.db.admin.query('SELECT row_to_json(t) value FROM workspace.'+table+' t ORDER BY row_to_json(t)::text')).rows);return values;};
 for(const op of ['editSprint','removeAllocation'])await t.test(op,async()=>{
  let s=value(await f.sprint(),201);const task=value(await f.create(),201);if(op==='removeAllocation')s=value(await f.call('/sprints/'+s.sprint_id+'/items',{task_id:task.task_id,expected_revision:s.revision}));const input={goal:'Fault edit'},invoke=(key,app=f.app)=>op==='editSprint'?f.edit(s,input,key,f.tokens[0],app):f.remove(s,task,key,f.tokens[0],app);
  for(const table of ['business_audit','idempotency_record']){
   const before=await snapshot();await f.db.admin.query("CREATE FUNCTION workspace.reject_could_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic-private-canary'; END $$; CREATE TRIGGER reject_could_write BEFORE INSERT ON workspace."+table+' FOR EACH ROW EXECUTE FUNCTION workspace.reject_could_write()');
   try{const r=await invoke(randomUUID());assert.equal(r.statusCode,503,r.body);assert(!r.body.includes('canary'));assert.deepEqual(await snapshot(),before);}finally{await f.db.admin.query('DROP TRIGGER reject_could_write ON workspace.'+table+'; DROP FUNCTION workspace.reject_could_write()');}
  }
  let lost=true;const pool={async connect(){const c=await f.db.runtime.connect();return new Proxy(c,{get(target,p){if(p==='query')return async(...args)=>{const r=await c.query(...args);if(args[0]==='COMMIT'&&lost){lost=false;throw Error('Synthetic lost COMMIT acknowledgement');}return r;};const v=Reflect.get(target,p);return typeof v==='function'?v.bind(target):v;}});}};
  const app=buildApp({store:f.sessions,projects:f.projects,tasks:f.tasks,sprints:new WorkspaceSprintStore(pool,f.sessions,f.cursorKey),origin:'https://localhost'});await app.ready();const key=randomUUID();try{assert.equal((await invoke(key,app)).statusCode,503);const committed=await snapshot();value(await invoke(key));assert.deepEqual(await snapshot(),committed);}finally{await app.close();}
 });
});
