import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:https';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { buildApp } from '../../../services/workspace/src/app.ts';

test('opt-in trusted local HTTPS serves UI and proxies the actual Workspace without exposing keys', {skip:!process.env.SACW_DEV_TLS_KEY&&!process.env.SACW_DEV_TLS_CERT}, async t => {
 const certPath=process.env.SACW_DEV_TLS_CERT;
 assert(certPath);
 const ca=await readFile(certPath);
 const workspace=buildApp();t.after(()=>workspace.close());await workspace.listen({host:'127.0.0.1',port:0});
 const backend=workspace.server.address();assert(backend&&typeof backend!=='string');
 const server=await createServer({root:fileURLToPath(new URL('..',import.meta.url)),server:{host:'127.0.0.1',port:0,strictPort:false,hmr:false,proxy:{'^/api(?:/|$)':{target:`http://127.0.0.1:${backend.port}`}}}});
 t.after(()=>server.close());await server.listen();const address=server.httpServer?.address();assert(address&&typeof address!=='string');
 const get=(path:string)=>new Promise<{status:number,body:string}>((resolve,reject)=>{
  const req=request({host:'127.0.0.1',port:address.port,path,ca},res=>{let body='';res.on('data',chunk=>body+=chunk);res.on('end',()=>resolve({status:res.statusCode??0,body}));});req.on('error',reject);req.end();
 });
 const page=await get('/');assert.equal(page.status,200);assert.match(page.body,/\/src\/main.tsx/);
 const health=await get('/api/healthz');assert.equal(health.status,200);assert.deepEqual(JSON.parse(health.body),{status:'ok',service:'workspace'});
 const session=await get('/api/session');assert.equal(session.status,503);assert.deepEqual(JSON.parse(session.body),{code:'access_unavailable',message:'Session unavailable',run_id:null});
 const keyPath=resolve(process.env.SACW_DEV_TLS_KEY!);
 const secret=await get('/@fs/'+keyPath.replaceAll('\\','/'));assert(secret.status===403||secret.status===404);assert(!secret.body.includes('PRIVATE KEY'));
 const prefix=await get('/apievil/healthz');assert(!prefix.body.includes('"service":"workspace"'));
});
