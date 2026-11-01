import test from 'node:test';
import assert from 'node:assert/strict';
import {ProjectCursor,cursorKey} from '../../services/workspace/src/projects/cursor.ts';

test('P04 actor/scope/generation/expiry cursor binding is stateless and rejects forgery',()=>{
 const key=cursorKey(JSON.stringify({kid:'one',key:Buffer.alloc(32,7).toString('base64')})),codec=new ProjectCursor(key),scope=codec.fingerprint(['actor','route','project',50]),generation=codec.fingerprint(['rows',1]);
 const token=codec.encode(scope,generation,'11111111-1111-1111-1111-111111111111',1000);
 assert.equal(codec.decode(token,scope,generation,1001),'11111111-1111-1111-1111-111111111111');
 for(const other of ['other-actor','other-route','other-project','other-limit'])assert.throws(()=>codec.decode(token,codec.fingerprint([other]),generation,1001),e=>e.status===400);
 assert.throws(()=>codec.decode(token,scope,codec.fingerprint(['rows',2]),1001),e=>e.status===409);
 assert.throws(()=>codec.decode(token,scope,generation,301000),e=>e.status===409);
 assert.throws(()=>codec.decode(token.slice(0,-1)+(token.endsWith('A')?'B':'A'),scope,generation,1001),e=>e.status===400);
 assert.throws(()=>new ProjectCursor({kid:'two',key:Buffer.alloc(32,8)}).decode(token,scope,generation,1001),e=>e.status===400);
 const readable=Buffer.from(token.split('.')[0],'base64url').toString('utf8');assert(!readable.includes('actor'));assert(!readable.includes('session'));
 assert.equal(cursorKey(undefined),null);for(const value of ['bad','{}',JSON.stringify({kid:'one',key:'short'})])assert.throws(()=>cursorKey(value),e=>e.status===503);
});
