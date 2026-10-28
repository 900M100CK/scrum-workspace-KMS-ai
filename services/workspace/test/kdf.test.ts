import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { ScryptVerifier,KdfBusy,InvalidCredential,KDF_PARAMETERS } from '../src/session/kdf.ts';

test('strong scrypt has explicit memory, unique salts and real correct/wrong/dummy work',async()=>{
 const kdf=new ScryptVerifier(),password='synthetic-P08-only-password';
 assert.equal(KDF_PARAMETERS.maxmem,192*1024*1024);
 const encoded=await kdf.hash(password),other=await kdf.hash(password);
 assert.notEqual(encoded,other);assert.equal(encoded.includes(password),false);
 assert.equal(await kdf.verify(password,encoded),true);
 assert.equal(await kdf.verify('wrong',encoded),false);
 assert.equal(await kdf.verify('unknown',kdf.dummyCredential),false);
 for(const invalid of [encoded.replace('131072','1073741824'),encoded+'$',encoded.replace('$v1$','$v9$'),'plaintext',encoded+'=', 'x'.repeat(1000)])await assert.rejects(kdf.verify(password,invalid),InvalidCredential);
 await assert.rejects(kdf.hash('x'.repeat(8193)),RangeError);
});
test('KDF admits exactly two jobs without an unbounded queue and later recovers',async t=>{
 const kdf=new ScryptVerifier();let completed=0;const start=performance.now();
 const one=kdf.hash('synthetic-one').then(result=>{completed++;return result;});
 const two=kdf.hash('synthetic-two').then(result=>{completed++;return result;});
 const fsStart=performance.now();const fs=readFile(new URL('../src/session/ports.ts',import.meta.url)).then(()=>performance.now()-fsStart);
 await assert.rejects(new ScryptVerifier().hash('synthetic-over-capacity'),KdfBusy);assert.equal(completed,0);
 await Promise.all([one,two]);assert.equal(completed,2);
 assert(await kdf.hash('synthetic-later'));
 t.diagnostic(JSON.stringify({kind:'local synthetic resource observation; not deployment calibration',twoJobsAndLaterMilliseconds:performance.now()-start,fsReadDuringJobsMilliseconds:await fs,uvThreadpool:process.env.UV_THREADPOOL_SIZE??'Node default (4)',maxResidentKiB:process.resourceUsage().maxRSS}));
});
