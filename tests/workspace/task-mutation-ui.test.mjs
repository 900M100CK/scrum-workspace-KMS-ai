import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
import {taskUiFixture} from './task-ui-fixture.mjs';
const requireWeb=createRequire(new URL('../../apps/web/package.json',import.meta.url)),React=requireWeb('react'),{createRoot}=requireWeb('react-dom/client');
test('SP04 real mutation DOM over HTTPS and disposable010',{timeout:180000},async t=>{
 const f=await taskUiFixture({through:'010'});t.after(()=>f.close());for(const action of ['task-edit','task-state','task-assign','task-blocker'])await f.operator.project(f.ids[0],f.project,action,true,'0','synthetic-mutation-ui','explicit');
 const original=(await f.create({type:'task',title:'Live editable task',description:'Initial'})).json();
 const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:f.origin,pretendToBeVisual:true}),saved=new Map();
 for(const [name,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,location:dom.window.location,FormData:dom.window.FormData,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true})){saved.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{value,configurable:true,writable:true});}
 const {TaskWorkspace}=await f.vite.ssrLoadModule('/src/TaskWorkspace.tsx'),{TaskController}=await f.vite.ssrLoadModule('/src/tasks.ts');let lose=false,unavailable=false,controller;const writes=[];
 const transport=async(url,init)=>{if(unavailable)throw Error('synthetic-outage');const r=await f.transport(url,init);if(init.method!=='GET'){writes.push({url,key:init.headers['Idempotency-Key'],body:init.body,status:r.status});if(lose){lose=false;throw Error('lost after commit');}}return r;};
 controller=new TaskController(f.ids[0],f.project,()=>{},transport,dom.window.sessionStorage);const root=createRoot(document.getElementById('root'));
 t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();for(const[name,descriptor]of saved){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}});
 async function settle(){await React.act(async()=>{const end=Date.now()+10000;while(controller.getSnapshot().busy){if(Date.now()>end)throw Error('UI did not settle');await new Promise(r=>setTimeout(r,15));}});}
 async function click(name){const b=[...document.querySelectorAll('button')].find(b=>b.textContent===name);assert(b,'Missing '+name);await React.act(async()=>b.click());await settle();}
 async function submit(field,values){const form=document.querySelector(field).form;for(const [name,value]of Object.entries(values))form.elements.namedItem(name).value=value;await React.act(async()=>form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));await settle();}
 await React.act(async()=>root.render(React.createElement(TaskWorkspace,{userId:f.ids[0],projectId:f.project,onSessionLost:()=>{},controller})));await settle();await click(original.title);
 await t.test('native labelled forms perform actual persisted edit/state/assignment/blocker updates',async()=>{
  for(const id of ['edit-task-title','edit-task-description','change-task-state','change-task-assignee','blocker-status','blocker-description','blocker-outcome'])assert(document.querySelector(`label[for="${id}"]`));
  await submit('#edit-task-title',{title:'Edited in live DOM',description:'Changed description'});assert.equal(controller.getSnapshot().detail.title,'Edited in live DOM');
  await submit('#change-task-state',{state:'done'});assert.equal(controller.getSnapshot().detail.state,'done');
  await submit('#change-task-assignee',{assignee_id:f.ids[0]});assert.equal(controller.getSnapshot().detail.assignee_id,f.ids[0]);
  await submit('#blocker-description',{status:'open',description:'Unresolved plan',outcome:''});assert(controller.getSnapshot().detail.blocked);assert.match(document.body.textContent,/Open — plan/);
  await submit('#blocker-description',{status:'resolved',description:'Resolved with evidence',outcome:'Confirmed result'});assert(!controller.getSnapshot().detail.blocked);assert.deepEqual(controller.getSnapshot().blockers.map(b=>b.sequence),[1,2]);assert.match(document.body.textContent,/Confirmed result/);
  assert.equal(document.activeElement.getAttribute('role'),'status');assert(writes.every(v=>[200,201].includes(v.status)));
 });
 await t.test('stale revision conflict refreshes current detail without overwriting a later actual producer',async()=>{
  const old=controller.getSnapshot().detail;await f.tasks.setState(f.tokens[0],old.task_id,{state:'in_progress',expected_revision:old.revision},randomUUID());await submit('#edit-task-title',{title:'Stale write',description:'Stale'});assert.match(controller.getSnapshot().message,/conflict/);assert.equal(controller.getSnapshot().detail.state,'in_progress');assert.equal(controller.getSnapshot().detail.title,'Edited in live DOM');assert(!controller.getSnapshot().pending);
 });
 await t.test('lost committed edit recovers same body/key and displays a fresh later state, not old receipt',async()=>{
  lose=true;await submit('#edit-task-title',{title:'Unknown committed edit',description:'Exact original input'});assert(controller.getSnapshot().pending);assert.equal(document.querySelector('.task-detail'),null);const request=writes.at(-1);
  const current=await f.tasks.get(f.tokens[0],original.task_id);await f.tasks.setState(f.tokens[0],current.task_id,{state:'done',expected_revision:current.revision},randomUUID());await click('Check original change');assert(!controller.getSnapshot().pending);assert.equal(controller.getSnapshot().detail.state,'done');assert.equal(controller.getSnapshot().detail.title,'Unknown committed edit');assert.deepEqual(writes.at(-1),request);
 });
 await t.test('denial and outage remove protected panes and forms; current authority refresh removes revoked controls',async()=>{
  await f.operator.project(f.ids[0],f.project,'task-edit',false,'1','synthetic-mutation-ui','revoke');await click('Refresh task');assert.equal(document.querySelector('#edit-task-title'),null);assert(document.querySelector('#change-task-state'));
  unavailable=true;await click('Refresh task');assert.equal(document.querySelector('.task-detail'),null);assert.equal(document.querySelector('#change-task-state'),null);assert.deepEqual(controller.getSnapshot().blockers,[]);
  unavailable=false;await React.act(async()=>controller.open(original.task_id));await settle();assert(document.querySelector('.task-detail'));
 });
});
