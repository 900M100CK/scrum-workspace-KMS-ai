import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.ts';
import { readPort } from '../src/config.ts';
test('workspace liveness is separate from protected functionality', async t => {
 const app = buildApp(); t.after(() => app.close());
 assert.deepEqual((await app.inject('/healthz')).json(), {status:'ok',service:'workspace'});
 for (const url of ['/session','/projects','/internal/permissions']) {
  const response = await app.inject(url); assert.equal(response.statusCode,404);
  assert.deepEqual(response.json(),{code:'not_found',message:'Resource unavailable'});
 }
 const invalidMethod = await app.inject({method:'POST',url:'/healthz',payload:{actor_id:'forged'}});
 assert.equal(invalidMethod.statusCode,404);
});
test('invalid port never silently changes the listening address', () => {
 assert.equal(readPort(undefined,3001),3001); assert.equal(readPort('12345',3001),12345);
 for(const value of ['','0','65536','-1','3001abc','1.5',' 3001 ']) assert.throws(() => readPort(value,3001));
});

test('real localhost HTTP serves liveness and conceals unknown routes', async t => {
 const app = buildApp(); t.after(() => app.close());
 await app.listen({host:'127.0.0.1',port:0});
 const address = app.server.address();
 assert(address && typeof address !== 'string');
 const base = `http://127.0.0.1:${address.port}`;
 const health = await fetch(base+'/healthz'); assert.equal(health.status,200);
 const denied = await fetch(base+'/session'); assert.equal(denied.status,404);
 assert.deepEqual(await denied.json(),{code:'not_found',message:'Resource unavailable'});
});