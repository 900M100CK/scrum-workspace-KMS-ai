import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
import {projectUiFixture} from './project-ui-fixture.mjs';
const requireWeb=createRequire(new URL('../../apps/web/package.json',import.meta.url)),React=requireWeb('react'),{createRoot}=requireWeb('react-dom/client');

test('P08 actual React DOM + same-origin HTTPS + current 008 PostgreSQL',{timeout:180000},async t=>{
 const f=await projectUiFixture();t.after(()=>f.close());
 const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:f.origin,pretendToBeVisual:true}),saved=new Map();
 for(const [name,value]of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,location:dom.window.location,FormData:dom.window.FormData,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true})){saved.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{value,configurable:true,writable:true});}
 const {ProjectWorkspace}=await f.vite.ssrLoadModule('/src/ProjectWorkspace.tsx'),{ProjectController}=await f.vite.ssrLoadModule('/src/projects.ts');
 let unavailable=false,lost=false;const writes=[];
 const transport=async(url,init)=>{if(unavailable)throw Error('synthetic outage');const response=await f.transport(url,init);if(init.method!=='GET'){writes.push({url,init,status:response.status});if(lost){lost=false;throw Error('synthetic response lost after real server commit');}}return response;};
 const controller=new ProjectController(f.ids[0],()=>{},transport,dom.window.sessionStorage),root=createRoot(document.getElementById('root'));
 t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();for(const[name,d]of saved){if(d)Object.defineProperty(globalThis,name,d);else delete globalThis[name];}});
 async function settle(){await React.act(async()=>{const deadline=Date.now()+10000;while(controller.getSnapshot().busy){if(Date.now()>deadline)throw Error('UI did not settle');await new Promise(r=>setTimeout(r,15));}});}
 async function click(text){const button=[...document.querySelectorAll('button')].find(x=>x.textContent===text);assert(button,`Missing ${text}`);await React.act(async()=>button.click());await settle();}
 async function submit(form){await React.act(async()=>form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));await settle();}
 await t.test('fresh directory/create/member views use real current IDs/revisions and explicit labels',async()=>{
  await React.act(async()=>root.render(React.createElement(ProjectWorkspace,{userId:f.ids[0],onSessionLost:()=>{},controller})));await settle();assert.match(document.body.textContent,/Synthetic project/);assert(document.querySelector('label[for="project-name"]'));
  document.querySelector('#project-name').value='Created from UI';document.querySelector('#project-description').value='Synthetic UI content';await submit(document.querySelector('form'));
  assert.match(document.body.textContent,/Created from UI/);await click('Synthetic project');assert.match(document.body.textContent,/Project revision 1/);assert.match(document.body.textContent,/product owner/);assert.equal(document.body.textContent.includes('@'),false);assert(document.querySelector('label[for="member-user-id"]'));
 });
 await t.test('add/remove are explicit; removal sends the displayed revision and preserves an effective manager',async()=>{
  document.querySelector('#member-user-id').value=f.ids[1];document.querySelector('#member-role').value='developer';await submit(document.querySelector('form'));await click('Synthetic project');assert.match(document.body.textContent,/developer/);
  const remove=document.querySelector(`[aria-label="Remove member ${f.ids[1]}"]`);await React.act(async()=>{remove.focus();remove.click();});assert.equal(document.activeElement,remove);assert(document.querySelector('[aria-label="Confirm member removal"]'));assert.equal(writes.filter(x=>x.init.method==='DELETE').length,0);
  await click('Confirm removal');assert.equal(writes.at(-1).init.headers['X-Expected-Revision'],'1');await click('Synthetic project');assert.equal(document.body.textContent.includes(f.ids[1]),false);
 });
 await t.test('real committed response loss keeps original identity across component reload and never duplicates',async()=>{
  document.querySelector('#member-user-id').value=f.ids[1];document.querySelector('#member-role').value='viewer';lost=true;await submit(document.querySelector('form'));assert(controller.getSnapshot().pending);assert.match(document.body.textContent,/not confirmed/);
  const original=writes.at(-1);const recovered=new ProjectController(f.ids[0],()=>{},transport,dom.window.sessionStorage);assert(recovered.getSnapshot().pending);await React.act(async()=>recovered.retry());assert.equal(writes.at(-1).init.headers['Idempotency-Key'],original.init.headers['Idempotency-Key']);assert.equal(writes.at(-1).init.body,original.init.body);assert.equal(dom.window.sessionStorage.length,0);
  assert.equal((await f.db.admin.query('SELECT revision::text FROM workspace.membership WHERE project_id=$1 AND user_id=$2',[f.project,f.ids[1]])).rows[0].revision,'3');
  await React.act(async()=>controller.retry());await settle();assert.equal(controller.getSnapshot().pending,false);
 });
 await t.test('outage and actual membership removal hide records/actions; no stale protected pane survives',async()=>{
  await click('Synthetic project');unavailable=true;await click('Refresh projects');assert.equal(document.querySelector('#selected-project-title'),null);assert.equal(document.querySelector('#member-user-id'),null);assert.match(document.body.textContent,/Unable to confirm/);unavailable=false;
  await f.operator.project(f.ids[1],f.project,'membership-manage',true,'0','synthetic-ui','second manager');assert.equal((await f.remove(f.ids[0],1,undefined,f.tokens[1])).statusCode,204);
  await React.act(async()=>controller.select(f.project));await settle();assert.equal(document.querySelector('#selected-project-title'),null);assert.equal(document.querySelector('#member-user-id'),null);assert.match(document.body.textContent,/Project unavailable/);assert.equal(document.activeElement.getAttribute('role'),'status');
 });
 t.diagnostic('Real HTTPS transport with explicit synthetic cookie jar; DOM checks do not claim browser cookie enforcement. Browser gate is separate.');
});
