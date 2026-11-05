import {WorkspaceSprintStore} from '../../services/workspace/src/sprints/store.ts';
import {SPRINT_ACTIONS} from '../../services/workspace/src/sprints/authority.ts';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createServer} from 'node:net';
import {request} from 'node:https';
import {randomUUID} from 'node:crypto';
import {taskFixture} from './task-fixture.mjs';
import {buildApp} from '../../services/workspace/src/app.ts';
import {ScryptVerifier} from '../../services/workspace/src/session/kdf.ts';
const requireWeb=createRequire(new URL('../../apps/web/package.json',import.meta.url));
export async function sprintUiFixture(){
 const f=await taskFixture({through:'011'});let backend,vite;
 try{
  await f.operator.project(f.ids[0],f.project,'backlog-author',true,'0','synthetic-task-ui','explicit fixture author');
  const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
  const origin=`https://localhost:${port}`,cert=await readFile('.tmp/local-https/localhost.crt'),key=await readFile('.tmp/local-https/localhost.key');
  const sprints=new WorkspaceSprintStore(f.db.runtime,f.sessions,f.cursorKey);backend=buildApp({store:f.sessions,projects:f.projects,tasks:f.tasks,sprints,origin});await backend.listen({host:'127.0.0.1',port:0});
  const {createServer:server}=await import(pathToFileURL(requireWeb.resolve('vite')).href);
  vite=await server({root:fileURLToPath(new URL('../../apps/web',import.meta.url)),server:{host:'127.0.0.1',port,strictPort:true,hmr:false,https:{cert,key},proxy:{'^/api(?:/|$)':{target:`http://127.0.0.1:${backend.server.address().port}`,rewrite:path=>path.replace(/^\/api(?=\/|$)/,'')||'/'}}}});await vite.listen();
  const browserUser=randomUUID(),username='synthetic-browser-task',password='synthetic-task-browser-only-password';
  await f.authOperator.provision(browserUser,username,await new ScryptVerifier().hash(password),'synthetic-task-ui');
  await f.projects.add(f.tokens[0],f.project,{user_id:browserUser,role:'viewer'},randomUUID());
  await f.operator.project(browserUser,f.project,'backlog-author',true,'0','synthetic-task-ui','explicit viewer author; no role inference');
  for(const user of [f.ids[0],browserUser])for(const action of [...Object.values(SPRINT_ACTIONS),'task-state'])await f.operator.project(user,f.project,action,true,'0','synthetic-sprint-ui','explicit selected right');
  let cookie=f.headers().cookie;
  const transport=(url,init)=>new Promise((resolve,reject)=>{
   const req=request({host:'127.0.0.1',port,path:url,method:init.method,ca:cert,headers:{...Object.fromEntries(new Headers(init.headers)),origin,cookie},signal:init.signal},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>{if(res.headers['set-cookie']?.[0])cookie=res.headers['set-cookie'][0].split(';')[0];resolve(new Response(res.statusCode===204?null:body,{status:res.statusCode,headers:{'content-type':res.headers['content-type']??''}}));});});req.on('error',reject);req.end(init.body);
  });
  return {...f,sprints,vite,origin,transport,browserUser,username,password,async close(){await vite.close();await backend.close();await f.close();}};
 }catch(error){if(vite)await vite.close();if(backend)await backend.close();await f.close();throw error;}
}
