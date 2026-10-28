import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {request} from 'node:https';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createServer} from 'node:net';
import {JSDOM} from 'jsdom';
import {sessionFixture} from './fixture.mjs';
import {buildApp} from '../../services/workspace/src/app.ts';
import {WorkspaceSessionStore,WorkspaceSessionOperator} from '../../services/workspace/src/session/store.ts';
import {ScryptVerifier} from '../../services/workspace/src/session/kdf.ts';
import {SessionController} from '../../apps/web/src/session.ts';

const requireWeb=createRequire(new URL('../../apps/web/package.json',import.meta.url)),React=requireWeb('react'),{createRoot}=requireWeb('react-dom/client');
const {createServer:viteServer,preview}=await import(pathToFileURL(requireWeb.resolve('vite')).href);
async function freePort(){const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const port=s.address().port;await new Promise(r=>s.close(r));return port;}
test('P11 actual React DOM with Workspace/PostgreSQL through same-origin HTTPS',{timeout:180000},async t=>{
 const db=await sessionFixture();t.after(()=>db.close());const operator=new WorkspaceSessionOperator(db.admin),kdf=new ScryptVerifier(),user=randomUUID(),password='synthetic-P11-only-password';
 await operator.provision(user,'synthetic-p11',await kdf.hash(password),'synthetic-p11-operator');const state=await operator.state();await operator.recover({expectedGeneration:state.generation,expectedLastObserved:state.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-p11-time',operatorRef:'synthetic-p11-operator'});
 const webPort=await freePort(),origin=`https://localhost:${webPort}`,store=new WorkspaceSessionStore(db.runtime,{idleSeconds:1800,absoluteSeconds:28800}),backend=buildApp({store,origin});t.after(()=>backend.close());await backend.listen({host:'127.0.0.1',port:0});
 const cert=await readFile('.tmp/local-https/localhost.crt'),key=await readFile('.tmp/local-https/localhost.key');
 const vite=await viteServer({root:fileURLToPath(new URL('../../apps/web',import.meta.url)),server:{host:'127.0.0.1',port:webPort,strictPort:true,hmr:false,https:{cert,key},proxy:{'^/api(?:/|$)':{target:`http://127.0.0.1:${backend.server.address().port}`}}}});t.after(()=>vite.close());await vite.listen();
 let cookie='',wire=[],forcedFailure=false;const pending=[];
 const transport=(url,init)=>new Promise((resolve,reject)=>{
  if(forcedFailure){reject(new Error('synthetic private failure'));return;}
  const req=request({host:'127.0.0.1',port:webPort,path:url,method:init.method,ca:cert,headers:{...Object.fromEntries(new Headers(init.headers)),origin,...(cookie?{cookie}:{})},signal:init.signal},res=>{let body='';res.on('data',chunk=>body+=chunk);res.on('end',()=>{
   const set=res.headers['set-cookie']?.[0];if(set)cookie=set.split(';')[0];wire.push({method:init.method,status:res.statusCode,secure:!!set?.includes('Secure'),httpOnly:!!set?.includes('HttpOnly'),strict:!!set?.includes('SameSite=Strict'),hostOnly:!!set&&!set.includes('Domain=')});
   resolve(new Response(res.statusCode===204?null:body,{status:res.statusCode,headers:res.headers['content-type']?{'content-type':res.headers['content-type']}:{}}));
  });});req.on('error',reject);req.end(init.body);
 });
 const controller=new SessionController((...args)=>{const p=transport(...args);pending.push(p.catch(()=>{}));return p;});
 const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:origin,pretendToBeVisual:true});
 const saved=new Map();for(const [name,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,location:dom.window.location,FormData:dom.window.FormData,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true})){saved.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{value,configurable:true,writable:true});}
 const {App}=await vite.ssrLoadModule('/src/App.tsx'),root=createRoot(document.getElementById('root'));
 t.after(async()=>{await React.act(async()=>root.unmount());dom.window.close();for(const [name,descriptor] of saved){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}});
 async function settle(){await React.act(async()=>{
  const deadline=Date.now()+5000;
  do{await new Promise(resolve=>setTimeout(resolve,10));while(pending.length)await Promise.all(pending.splice(0));await new Promise(resolve=>setTimeout(resolve,10));if(!pending.length&&!['checking','signing-in','signing-out'].includes(controller.getSnapshot().phase))return;}while(Date.now()<deadline);
  throw new Error('React/transport did not settle after the actual navigation event');
 });}
 async function click(text){const button=[...document.querySelectorAll('button')].find(b=>b.textContent===text);assert(button,'expected action absent');await React.act(async()=>button.click());await settle();}
 async function login(pass=password){document.querySelector('#username').value='synthetic-p11';const field=document.querySelector('#password');field.value=pass;await React.act(async()=>document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));assert.equal(field.value,'');await settle();}
 await t.test('initial reload checks server before showing sign-in; labels and autocomplete are explicit',async()=>{
  await React.act(async()=>root.render(React.createElement(App,{controller})));await settle();assert.equal(controller.getSnapshot().phase,'signed-out');assert(document.querySelector('label[for="username"]'));assert.equal(document.querySelector('#password').autocomplete,'current-password');assert.equal(document.querySelector('nav'),null);
 });
 await t.test('wrong credentials show generic inline feedback and move focus without secret persistence',async()=>{
  await login('synthetic-wrong-secret');assert.equal(controller.getSnapshot().phase,'signed-out');assert.match(document.querySelector('[role="status"]').textContent,/Check your username and password/);assert.equal(document.activeElement,document.querySelector('[role="status"]'));assert.equal(document.body.textContent.includes('synthetic-wrong-secret'),false);assert.equal(dom.window.localStorage.length,0);assert.equal(dom.window.sessionStorage.length,0);
 });
 await t.test('actual sign-in renders server-confirmed state through secure proxy and clears password',async()=>{
  await login();assert.equal(controller.getSnapshot().session.user_id,user);assert(document.querySelector('nav'));assert.equal(document.querySelector('form'),null);assert.equal(wire.some(r=>r.method==='POST'&&r.status===200&&r.secure&&r.httpOnly&&r.strict&&r.hostOnly),true);assert.equal(document.activeElement.id,'session-title');
 });
 await t.test('workspace navigation and reload-style controller recheck use real server state',async()=>{
  await React.act(async()=>{dom.window.location.hash='#workspace';});await settle();assert.equal(controller.getSnapshot().phase,'authenticated');assert.match(document.body.textContent,/Projects, tasks and knowledge are being prepared/);
  const reloaded=new SessionController(transport);await reloaded.check();assert.equal(reloaded.getSnapshot().session.user_id,user);assert.equal(document.querySelectorAll('nav a[aria-current="page"]').length,1);
 });
 await t.test('dependency outage hides authenticated subtree immediately; recovery revalidates explicitly',async()=>{
  forcedFailure=true;await click('Check session');assert.equal(controller.getSnapshot().phase,'unavailable');assert.equal(document.querySelector('nav'),null);assert.equal(document.querySelector('#workspace-title'),null);assert.match(document.body.textContent,/Check your connection/);forcedFailure=false;await click('Check session');assert.equal(controller.getSnapshot().phase,'authenticated');
 });
 await t.test('actual expired DB session is denied on focus, clears workspace and requests sign-in',async()=>{
  const sessionId=(await db.admin.query('SELECT session_id FROM workspace.session WHERE user_id=$1 ORDER BY expires_at DESC LIMIT 1',[user])).rows[0].session_id;
  await db.admin.query("UPDATE workspace.session SET expires_at=(SELECT created_at+interval '1 microsecond' FROM workspace.session_token WHERE session_id=$1) WHERE session_id=$1",[sessionId]);
  await React.act(async()=>window.dispatchEvent(new dom.window.Event('focus')));await settle();assert.equal(controller.getSnapshot().phase,'expired');assert.equal(document.querySelector('#workspace-title'),null);assert(document.querySelector('form'));assert.match(document.body.textContent,/Sign in again/);
 });
 await t.test('confirmed logout hides state, clears cookie and rejects old session after reload',async()=>{
  await login();await click('Sign out');assert.equal(controller.getSnapshot().phase,'signed-out');assert.equal(document.querySelector('nav'),null);assert.equal(cookie,'__Host-sacw-session=');assert(wire.some(r=>r.method==='DELETE'&&r.status===204));const reloaded=new SessionController(transport);await reloaded.check();assert.equal(reloaded.getSnapshot().phase,'signed-out');
 });
 await t.test('built HTTPS preview serves its icon and bundled entry without a development WebSocket client',async()=>{
  const port=await freePort(),api=buildApp({store,origin:`https://localhost:${port}`});await api.listen({host:'127.0.0.1',port:0});
  const built=await preview({root:fileURLToPath(new URL('../../apps/web',import.meta.url)),preview:{host:'127.0.0.1',port,strictPort:true,https:{cert,key},proxy:{'^/api(?:/|$)':{target:`http://127.0.0.1:${api.server.address().port}`,rewrite:path=>path.replace(/^\/api(?=\/|$)/,'')||'/'}}}});
  const read=path=>new Promise((resolve,reject)=>{request({host:'127.0.0.1',port,path,ca:cert},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>resolve({status:res.statusCode,body,contentType:res.headers['content-type']}));}).on('error',reject).end();});
  try{const page=await read('/');assert.equal(page.status,200);assert.equal(page.body.includes('/@vite/client'),false);assert.match(page.body,/href="\/favicon.svg"/);const icon=await read('/favicon.svg');assert.equal(icon.status,200);assert.match(icon.contentType,/image\/svg\+xml/);const entry=/src="(\/assets\/[^\"]+\.js)"/.exec(page.body);assert(entry);const script=await read(entry[1]);assert.equal(script.status,200);assert.equal(script.body.includes('vite-hmr'),false);assert.equal((await read('/api/session')).status,401);}finally{await built.close();await api.close();}
 });
 await t.test('controlled local expiry timer hides UI without making a renewal request',async()=>{
  let calls=0;const timerController=new SessionController(async()=>{calls++;return new Response(JSON.stringify({user_id:user,expires_at:new Date(Date.now()+150).toISOString()}),{headers:{'content-type':'application/json'}});});
  await React.act(async()=>root.render(React.createElement(App,{controller:timerController,key:'timer'})));await settle();assert.equal(timerController.getSnapshot().phase,'authenticated');await React.act(async()=>new Promise(resolve=>setTimeout(resolve,180)));assert.equal(timerController.getSnapshot().phase,'expired');assert.equal(calls,1);assert.equal(document.querySelector('nav'),null);
 });
 t.diagnostic(JSON.stringify({image:db.image,scope:'Actual React DOM + real Workspace/PostgreSQL through trusted-client HTTPS proxy; explicit simulated cookie jar, not browser cookie evidence; final timer case uses controlled transport'}));
});
