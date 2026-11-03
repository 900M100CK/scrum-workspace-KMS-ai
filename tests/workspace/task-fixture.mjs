import {randomUUID} from 'node:crypto';
import {sessionFixture} from './fixture.mjs';
import {WorkspaceSessionStore,WorkspaceSessionOperator} from '../../services/workspace/src/session/store.ts';
import {WorkspaceProjectOperator} from '../../services/workspace/src/projects/operator.ts';
import {WorkspaceProjectStore} from '../../services/workspace/src/projects/store.ts';
import {ScryptVerifier} from '../../services/workspace/src/session/kdf.ts';
import {WorkspaceTaskStore} from '../../services/workspace/src/tasks/store.ts';
import {buildApp} from '../../services/workspace/src/app.ts';
import {SESSION_COOKIE} from '../../services/workspace/src/session/http.ts';

export async function taskFixture({through='009',count=3}={}){
 const db=await sessionFixture({through});let app;
 try{
  const authOperator=new WorkspaceSessionOperator(db.admin),operator=new WorkspaceProjectOperator(db.admin),ids=Array.from({length:count},()=>randomUUID());
  for(let i=0;i<count;i++)await authOperator.provision(ids[i],`synthetic-task-${i}`,new ScryptVerifier().dummyCredential,'synthetic-task-operator');
  const clock=await authOperator.state();await authOperator.recover({expectedGeneration:clock.generation,expectedLastObserved:clock.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-task-clock',operatorRef:'synthetic-task-operator'});
  const sessions=new WorkspaceSessionStore(db.runtime,{idleSeconds:1800,absoluteSeconds:28800}),tokens=[];
  for(const id of ids)tokens.push((await sessions.establish(id,'1')).token);
  await operator.global(ids[0],true,'0','synthetic-task','explicit fixture creator');
  const cursorKey={kid:'synthetic-task',key:Buffer.alloc(32,37)},projects=new WorkspaceProjectStore(db.runtime,sessions,cursorKey);
  const project=(await projects.create(tokens[0],{name:'Synthetic task project'},'fixture-task-project')).projectId;
  const tasks=new WorkspaceTaskStore(db.runtime,sessions,cursorKey);
  app=buildApp({store:sessions,projects,tasks,origin:'https://localhost'});await app.ready();
  const headers=(token=tokens[0])=>({cookie:`${SESSION_COOKIE}=${token}`,origin:'https://localhost','x-sacw-request':'1'});
  const create=(input={type:'task',title:'Synthetic task'},key=randomUUID(),token=tokens[0],p=project)=>app.inject({method:'POST',url:`/projects/${p}/tasks`,headers:{...headers(token),'idempotency-key':key},payload:input});
  return {db,ids,tokens,sessions,projects,project,operator,authOperator,cursorKey,tasks,app,headers,create,async close(){await app.close();await db.close();}};
 }catch(error){if(app)await app.close();await db.close();throw error;}
}

export async function taskBarrier(admin,role,fragment='auth_clock_state',count=1){
 const end=Date.now()+750;
 while(Date.now()<end){if((await admin.query("SELECT count(*)::int n FROM pg_stat_activity WHERE usename=$1 AND wait_event_type='Lock' AND position($2 in query)>0",[role,fragment])).rows[0].n>=count)return;await new Promise(r=>setTimeout(r,5));}
 throw Error('Actual Task producer PostgreSQL lock barrier absent');
}
export function pauseTaskQuery(pool,fragment){
 let enter,release;const ready=new Promise(r=>enter=r),pause=new Promise(r=>release=r);let used=false;
 return {ready,release,pool:{async connect(){const c=await pool.connect();return new Proxy(c,{get(target,key){if(key==='query')return async(...args)=>{const result=await c.query(...args);if(!used&&typeof args[0]==='string'&&args[0].includes(fragment)){used=true;enter();await pause;}return result;};const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});}}};
}
