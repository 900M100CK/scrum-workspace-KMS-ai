import {sprintFixture,enableSprint} from './sprint-fixture.mjs';import {randomUUID} from 'node:crypto';
export const value=(r,status=200)=>{if(r.statusCode!==status)throw Error('Expected '+status+', got '+r.statusCode+': '+r.body);return r.json();};
export async function couldFixture(){const f=await sprintFixture({through:'013'});return {...f,
 edit:(s,input={},key=randomUUID(),token=f.tokens[0],app=f.app)=>f.call('/sprints/'+s.sprint_id,{expected_revision:s.revision,...input},'PATCH',key,token,app),
 remove:(s,task,key=randomUUID(),token=f.tokens[0],app=f.app)=>app.inject({method:'DELETE',url:'/sprints/'+s.sprint_id+'/items/'+task.task_id,headers:{...f.headers(token),'idempotency-key':key,'x-expected-revision':String(s.revision)}})};}
export async function enableCould(f){await enableSprint(f);for(const action of ['sprint-edit','sprint-deallocate'])await f.operator.project(f.ids[0],f.project,action,true,'0','synthetic-could','explicit separate right');}
