import test from 'node:test';
import assert from 'node:assert/strict';
import {SessionController} from '../src/session.ts';
const session={user_id:'10000000-0000-4000-8000-000000000001',expires_at:new Date(Date.now()+60000).toISOString()};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
test('session client uses only fixed same-origin cookie transport and exact credential fields',async()=>{
 const calls:Array<{url:string;init:RequestInit}>=[];const c=new SessionController(async(url,init)=>{calls.push({url,init});return json(session);});
 await c.signIn('synthetic-user','synthetic-password');assert.equal(c.getSnapshot().session?.user_id,session.user_id);
 const {url,init}=calls[0]!;assert.equal(url,'/api/session');assert.equal(init.credentials,'same-origin');assert.equal(init.cache,'no-store');assert.equal(init.redirect,'error');assert.deepEqual(JSON.parse(init.body as string),{username:'synthetic-user',password:'synthetic-password'});assert.equal(new Headers(init.headers).get('X-SACW-Request'),'1');assert.equal(new Headers(init.headers).get('Authorization'),null);
});
test('401 is generic, unavailable bodies never reach UI, and malformed success fails closed',async()=>{
 for(const response of [json({...session,token:'secret-canary'}),json({user_id:'forged',expires_at:session.expires_at}),json({...session,expires_at:'2030-02-31T00:00:00Z'}),json(session,503),new Response('internal-secret-canary',{status:200})]){
  const c=new SessionController(async()=>response);await c.check();assert.equal(c.getSnapshot().phase,'unavailable');assert.equal(c.getSnapshot().session,null);assert.equal(JSON.stringify(c.getSnapshot()).includes('canary'),false);
 }
 const c=new SessionController(async()=>json({message:'private-account-canary'},401));await c.signIn('u','p');assert.equal(c.getSnapshot().phase,'signed-out');assert.equal(c.getSnapshot().message,'Unable to sign in. Check your username and password.');
});
test('late GET and response-body completion cannot restore identity after logout',async()=>{
 let finish!:(value:Response)=>void;const c=new SessionController(async(_url,init)=>init.method==='DELETE'?new Response(null,{status:204}):new Promise(resolve=>{finish=resolve;}));
 const checking=c.check();await c.signOut();finish(json(session));await checking;assert.equal(c.getSnapshot().phase,'signed-out');
 let body!:(value:unknown)=>void;const d=new SessionController(async(_url,init)=>init.method==='DELETE'?new Response(null,{status:204}):({status:200,headers:new Headers({'content-type':'application/json'}),json:()=>new Promise(resolve=>{body=resolve;})} as Response));
 const pending=d.check();await new Promise(resolve=>setImmediate(resolve));await d.signOut();body(session);await pending;assert.equal(d.getSnapshot().session,null);
});
test('uncertain mutation hides current state without retrying or claiming logout success',async()=>{
 let calls=0;const c=new SessionController(async()=>{calls++;if(calls===1)return json(session);throw new Error('private-network-canary');});
 await c.check();const ending=c.signOut();assert.equal(c.getSnapshot().session,null);await ending;assert.equal(calls,2);assert.equal(c.getSnapshot().phase,'unavailable');assert.match(c.getSnapshot().message,/could not be confirmed/);assert.equal(c.getSnapshot().message.includes('canary'),false);
});
test('expiry or canceled observations cannot restore protected state',async()=>{
 let finish!:(value:Response)=>void;const c=new SessionController(async()=>new Promise(resolve=>{finish=resolve;}));const pending=c.check();c.expire();finish(json(session));await pending;assert.equal(c.getSnapshot().phase,'expired');assert.equal(c.getSnapshot().session,null);
 const expired=new SessionController(async()=>json({...session,expires_at:'2020-01-01T00:00:00.000Z'}));await expired.check();assert.equal(expired.getSnapshot().phase,'expired');
});
test('a stalled request is aborted at the fixed timeout and leaves unavailable state',async()=>{
 let calls=0;const c=new SessionController(async(_url,init)=>{calls++;return new Promise((_resolve,reject)=>init.signal!.addEventListener('abort',()=>reject(new Error('Abort')),{once:true}));});
 await c.check();assert.equal(calls,1);assert.equal(c.getSnapshot().phase,'unavailable');assert.equal(c.getSnapshot().session,null);
});
