import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
import {taskUiFixture} from './task-ui-fixture.mjs';
const requireWeb=createRequire(new URL('../../apps/web/package.json',import.meta.url)),React=requireWeb('react'),{createRoot}=requireWeb('react-dom/client');
test('P08 real Task React DOM with HTTPS and disposable 009 PostgreSQL',{timeout:180000},async t=>{
 const f=await taskUiFixture();t.after(()=>f.close());const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:f.origin,pretendToBeVisual:true}),saved=new Map();
 for(const [name,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,location:dom.window.location,FormData:dom.window.FormData,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true})){saved.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{value,configurable:true,writable:true});}
 const {TaskWorkspace}=await f.vite.ssrLoadModule('/src/TaskWorkspace.tsx'),{TaskController}=await f.vite.ssrLoadModule('/src/tasks.ts');
 let unavailable=false,lost=false,expired=0,instance=0;const writes=[];
 const transport=async(url,init)=>{if(unavailable)throw Error('synthetic task outage');const r=await f.transport(url,init);if(init.method!=='GET'){writes.push({url,init,status:r.status});if(lost){lost=false;throw Error('synthetic task response loss after actual commit');}}return r;};
 let controller=new TaskController(f.ids[0],f.project,()=>expired++,transport,dom.window.sessionStorage);const root=createRoot(document.getElementById('root'));
 t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();for(const[name,descriptor]of saved){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}});
 async function settle(){await React.act(async()=>{const deadline=Date.now()+10000;while(controller.getSnapshot().busy){if(Date.now()>deadline)throw Error('Task UI did not settle');await new Promise(r=>setTimeout(r,15));}});}
 async function mount(){await React.act(async()=>root.render(React.createElement(TaskWorkspace,{key:++instance,userId:f.ids[0],projectId:f.project,onSessionLost:()=>expired++,controller})));await settle();}
 async function click(text){const button=[...document.querySelectorAll('button')].find(b=>b.textContent===text);assert(button,'Missing '+text);await React.act(async()=>button.click());await settle();}
 async function create(title,type='task'){const form=document.querySelector('form');assert(form);document.querySelector('#task-title').value=title;document.querySelector('#task-type').value=type;document.querySelector('#task-description').value='Synthetic task context';await React.act(async()=>form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));await settle();}
 await t.test('empty/create/detail uses real server IDs/time/location and accessible native fields/feedback',async()=>{
  await mount();assert.match(document.body.textContent,/No tasks in this view/);for(const name of ['type','title','description'])assert(document.querySelector(`label[for="task-${name}"]`));
  await create('DOM Story','story');assert.equal(document.querySelector('#task-detail-title').textContent,'DOM Story');assert.match(document.body.textContent,/Backlog · position 1/);assert(document.querySelector('time[datetime]'));assert.equal(document.activeElement.getAttribute('role'),'status');
  const row=(await f.db.admin.query('SELECT task_id,type,title FROM workspace.task WHERE project_id=$1',[f.project])).rows[0];assert.equal(row.type,'story');assert(document.body.textContent.includes(row.task_id));
 });
 await t.test('fresh component reload and current detail reconstruct persisted state rather than an earlier receipt',async()=>{
  controller=new TaskController(f.ids[0],f.project,()=>expired++,transport,dom.window.sessionStorage);await mount();await click('DOM Story');
  const task=controller.getSnapshot().detail;await f.db.admin.query("UPDATE workspace.task SET title='Current DOM Story',state='in_progress',revision=revision+1 WHERE task_id=$1",[task.task_id]);await click('Refresh tasks');await click('Current DOM Story');assert.match(document.body.textContent,/in progress/);assert.equal(controller.getSnapshot().detail.revision,2);
 });
 await t.test('real changed cursor discards accumulated pages and reconstructs the current first page',async()=>{
  await f.db.admin.query("INSERT INTO workspace.task(task_id,project_id,type,title,state,backlog_position,created_at) SELECT gen_random_uuid(),$1,'task','Synthetic DOM page fixture','todo',n+10,'2026-11-02T00:00:00.123Z' FROM generate_series(1,51) n",[f.project]);await click('Refresh tasks');assert(document.querySelector('.task-list'));assert(controller.getSnapshot().cursor);
  assert.equal((await f.create({type:'bug',title:'Concurrent DOM append'})).statusCode,201);await click('More tasks');assert.equal(controller.getSnapshot().items.length,50);assert.match(document.body.textContent,/current first page/);
 });
 await t.test('real committed response loss survives component reload with exact original request and one stored Task',async()=>{
  lost=true;await create('DOM unknown creation','bug');assert(controller.getSnapshot().pending);assert.equal(document.querySelector('#task-detail-title'),null);const original=writes.at(-1);
  controller=new TaskController(f.ids[0],f.project,()=>expired++,transport,dom.window.sessionStorage);await mount();assert(controller.getSnapshot().pending);assert(document.querySelector('#task-title').disabled);await click('Check original creation');
  assert.equal(writes.at(-1).init.headers['Idempotency-Key'],original.init.headers['Idempotency-Key']);assert.equal(writes.at(-1).init.body,original.init.body);assert.equal(dom.window.sessionStorage.length,0);assert.equal((await f.db.admin.query("SELECT count(*) n FROM workspace.task WHERE project_id=$1 AND title='DOM unknown creation'",[f.project])).rows[0].n,'1');assert.equal(document.querySelector('#task-detail-title').textContent,'DOM unknown creation');
 });
 await t.test('outage and actual author revoke clear protected panes and keep an earlier result uncertain',async()=>{
  unavailable=true;await click('Refresh tasks');assert.equal(document.querySelector('.task-list'),null);assert.equal(document.querySelector('#task-detail-title'),null);assert.equal(document.querySelector('#task-title'),null);assert.match(document.body.textContent,/Unable to confirm task access/);
  unavailable=false;await click('Refresh tasks');lost=true;await create('DOM denied reconciliation');await f.operator.project(f.ids[0],f.project,'backlog-author',false,'1','synthetic','deny pending replay');await click('Check original creation');assert(controller.getSnapshot().pending);assert.equal(document.querySelector('#task-detail-title'),null);assert.match(document.body.textContent,/earlier creation remains unconfirmed/);
  await f.operator.project(f.ids[0],f.project,'backlog-author',true,'2','synthetic','restore current explicit author');await click('Check original creation');assert(!controller.getSnapshot().pending);
 });
 await t.test('actual membership removal and disabled session withhold task UI and notify session loss',async()=>{
  await f.projects.add(f.tokens[0],f.project,{user_id:f.ids[1],role:'viewer'},randomUUID());await f.operator.project(f.ids[1],f.project,'membership-manage',true,'0','synthetic','manager for fixture removal');await f.projects.remove(f.tokens[1],f.project,f.ids[0],'1',randomUUID());await click('Refresh tasks');assert.equal(document.querySelector('#task-detail-title'),null);assert.equal(document.querySelector('#task-title'),null);assert.match(document.body.textContent,/Tasks unavailable/);
  await f.authOperator.disable(f.ids[0],'synthetic-disable-ui');await click('Refresh tasks');assert.equal(expired,1);assert.equal(document.querySelector('.task-list'),null);
 });
 t.diagnostic('Actual HTTPS/API/PG with a synthetic cookie jar and React DOM. Browser cookie/TLS/profile enforcement is a separate gate. Direct state/Sprint data setup is a fixture, not an update API claim.');
});
