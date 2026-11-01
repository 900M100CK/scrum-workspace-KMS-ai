import {randomUUID} from 'node:crypto';
import {sessionFixture} from './fixture.mjs';
import {WorkspaceSessionStore,WorkspaceSessionOperator} from '../../services/workspace/src/session/store.ts';
import {WorkspaceProjectOperator} from '../../services/workspace/src/projects/operator.ts';
import {WorkspaceProjectStore} from '../../services/workspace/src/projects/store.ts';
import {buildApp} from '../../services/workspace/src/app.ts';
import {SESSION_COOKIE} from '../../services/workspace/src/session/http.ts';
import {ScryptVerifier} from '../../services/workspace/src/session/kdf.ts';

export async function projectFixture(count=3){
 const db=await sessionFixture({through:'008'});let app;
 try{
  const authOperator=new WorkspaceSessionOperator(db.admin),operator=new WorkspaceProjectOperator(db.admin),ids=Array.from({length:count},()=>randomUUID());
  for(let i=0;i<count;i++)await authOperator.provision(ids[i],`synthetic-project-${i}`,new ScryptVerifier().dummyCredential,'synthetic-project-operator');
  const clock=await authOperator.state();await authOperator.recover({expectedGeneration:clock.generation,expectedLastObserved:clock.last_observed,attestedTime:new Date().toISOString(),maxSkewMs:5000,evidenceId:'synthetic-project-clock',operatorRef:'synthetic-project-operator'});
  const sessions=new WorkspaceSessionStore(db.runtime,{idleSeconds:1800,absoluteSeconds:28800}),tokens=[];
  for(const id of ids)tokens.push((await sessions.establish(id,'1')).token);
  await operator.global(ids[0],true,'0','synthetic','fixture create authority');
  const projects=new WorkspaceProjectStore(db.runtime,sessions,{kid:'synthetic',key:Buffer.alloc(32,29)}),created=await projects.create(tokens[0],{name:'Synthetic project'},'fixture-project');
  app=buildApp({projects,store:sessions,origin:'https://localhost'});await app.ready();
  const headers=(token=tokens[0])=>({cookie:`${SESSION_COOKIE}=${token}`,origin:'https://localhost','x-sacw-request':'1'}),project=created.projectId;
  const add=(user,role='viewer',key=randomUUID(),token=tokens[0])=>app.inject({method:'POST',url:`/projects/${project}/members`,headers:{...headers(token),'idempotency-key':key},payload:{user_id:user,role}});
  const remove=(user,revision,key=randomUUID(),token=tokens[0])=>app.inject({method:'DELETE',url:`/projects/${project}/members/${user}`,headers:{...headers(token),'idempotency-key':key,'x-expected-revision':String(revision)}});
  const get=(url,token=tokens[0])=>app.inject({url,headers:headers(token)});
  return {db,app,authOperator,operator,ids,tokens,sessions,projects,project,headers,add,remove,get,async close(){await app.close();await db.close();}};
 }catch(error){if(app)await app.close();await db.close();throw error;}
}
