import test from 'node:test';
import assert from 'node:assert/strict';
import { localHttps } from '../dev/https.ts';

test('development TLS is opt-in and incomplete or missing key material fails explicitly', () => {
 assert.equal(localHttps({}),undefined);
 assert.throws(()=>localHttps({SACW_DEV_TLS_KEY:'missing'}),/Set both/);
 assert.throws(()=>localHttps({SACW_DEV_TLS_CERT:'missing'}),/Set both/);
 assert.throws(()=>localHttps({SACW_DEV_TLS_KEY:'missing',SACW_DEV_TLS_CERT:'missing'}));
});
