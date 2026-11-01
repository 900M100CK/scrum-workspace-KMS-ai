import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {ProjectController} from '../../apps/web/src/projects.ts';

const actor=randomUUID(),projectId=randomUUID();
const project={project_id:projectId,name:'Synthetic',description:'',revision:1};
const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json'}});
const storage=()=>{const data=new Map();return{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k),get length(){return data.size;}};};
function reads(url){return json(url.includes('allowed-actions')?{resource_kind:'global',project_id:null,resource_id:null,document_id:null,version_id:null,allowed_operations:['createProject','listProjects']}:{items:[project],next_cursor:null});}

test('unknown mutation survives reload with the exact original request; no automatic fresh key',async()=>{
 const saved=storage(),writes=[];let lost=true;
 const transport=async(url,init)=>{if(init.method==='GET')return reads(url);writes.push({url,...init});if(lost)throw new Error('synthetic lost acknowledgement');return json(project,201);};
 const first=new ProjectController(actor,()=>{},transport,saved);await first.refresh();await first.create('Synthetic','');
 assert(first.getSnapshot().pending);assert.equal(saved.length,1);await first.create('Do not submit','');assert.equal(writes.length,1);
 const reloaded=new ProjectController(actor,()=>{},transport,saved);assert(reloaded.getSnapshot().pending);lost=false;await reloaded.retry();
 assert.equal(writes.length,2);assert.equal(writes[0].body,writes[1].body);assert.deepEqual(writes[0].headers,writes[1].headers);assert.equal(saved.length,0);assert.equal(reloaded.getSnapshot().pending,false);
 assert.equal(writes[1].credentials,'same-origin');assert.equal(writes[1].redirect,'error');assert.equal(writes[1].headers['X-SACW-Request'],'1');
});
test('permission denial on reconciliation does not claim an earlier unknown operation rolled back',async()=>{
 const saved=storage();let status=503,expired=0;
 const transport=async(url,init)=>init.method==='GET'?reads(url):new Response(null,{status});
 const c=new ProjectController(actor,()=>expired++,transport,saved);await c.create('Synthetic','');status=403;await c.retry();assert(c.getSnapshot().pending);assert.equal(saved.length,1);assert.deepEqual(c.getSnapshot().projects,[]);
 status=401;await c.retry();assert.equal(expired,1);assert.equal(saved.length,1);
});
test('stale read completion cannot restore a removed project or advisory actions',async()=>{
 let release;const held=new Promise(r=>release=r);let pause=true;
 const c=new ProjectController(actor,()=>{},async(url)=>{if(pause){await held;return reads(url);}return new Response(null,{status:404});},storage());
 const first=c.refresh();pause=false;await c.refresh();release();await first;assert.deepEqual(c.getSnapshot().projects,[]);assert.deepEqual(c.getSnapshot().global,[]);assert.match(c.getSnapshot().message,/unavailable/);
});
test('malformed protected data is withheld and blocked storage sends no mutation',async()=>{
 let writes=0;
 const deniedStorage={getItem(){return null;},setItem(){throw new Error('disabled');},removeItem(){}};
 const c=new ProjectController(actor,()=>{},async(url,init)=>{if(init.method!=='GET')writes++;return url.includes('allowed-actions')?reads(url):json({items:[{...project,email:'do not disclose'}],next_cursor:null});},deniedStorage);
 await c.refresh();assert.deepEqual(c.getSnapshot().projects,[]);await c.create('Synthetic','');assert.equal(writes,0);assert.match(c.getSnapshot().message,/recovery key/);
});
test('a foreign actor cannot recover or display the saved operation payload',async()=>{
 const saved=storage();const c=new ProjectController(actor,()=>{},async()=>new Response(null,{status:503}),saved);await c.create('Synthetic private input','');
 const foreign=new ProjectController(randomUUID(),()=>{},async()=>{throw Error('must not run');},saved);assert.equal(foreign.getSnapshot().pending,false);assert.equal(saved.length,0);assert.equal(JSON.stringify(foreign.getSnapshot()).includes('private input'),false);
});
