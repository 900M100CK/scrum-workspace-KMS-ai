import {randomUUID} from 'node:crypto';
import {taskFixture} from './task-fixture.mjs';
import {WorkspaceSprintStore} from '../../services/workspace/src/sprints/store.ts';
import {buildApp} from '../../services/workspace/src/app.ts';
export async function sprintFixture({through='011'}={}){const f=await taskFixture({through});let app;try{
 const sprints=new WorkspaceSprintStore(f.db.runtime,f.sessions,f.cursorKey);app=buildApp({store:f.sessions,projects:f.projects,tasks:f.tasks,sprints,origin:'https://localhost'});await app.ready();
 const call=(url,payload,method='POST',key=randomUUID(),token=f.tokens[0],target=app)=>target.inject({method,url,headers:{...f.headers(token),'idempotency-key':key,...(payload===undefined?{}:{'content-type':'application/json'})},...(payload===undefined?{}:{payload})});
 const create=(input={type:'task',title:'Synthetic task'},key=randomUUID())=>call('/projects/'+f.project+'/tasks',input,'POST',key);
 const sprint=(goal='Synthetic Sprint',key=randomUUID())=>call('/projects/'+f.project+'/sprints',{goal,start_date:'2026-11-01',end_date:'2026-11-15'},'POST',key);
 return {...f,app,sprints,call,create,sprint,async close(){await app.close();await f.close();}};
 }catch(e){if(app)await app.close();await f.close();throw e;}}
export const sprintActions=['sprint-create','sprint-allocate','sprint-start','sprint-complete','backlog-order'];
export async function enableSprint(f,actor=f.ids[0]){for(const action of [...sprintActions,'backlog-author','task-state','task-edit'])await f.operator.project(actor,f.project,action,true,'0','synthetic-sp05','explicit selected right');}
