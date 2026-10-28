import test from 'node:test';
import assert from 'node:assert/strict';
import { readSessionPolicy } from '../src/session/config.ts';

test('session starting values are configurable without silently accepting invalid duration units', () => {
 assert.deepEqual(readSessionPolicy({}), {idleSeconds:1800,absoluteSeconds:28800});
 assert.deepEqual(readSessionPolicy({SESSION_IDLE_SECONDS:'60',SESSION_ABSOLUTE_SECONDS:'300'}), {idleSeconds:60,absoluteSeconds:300});
 for (const value of ['','0','-1','1.5','1e3',' 60','Infinity','9007199254740992']) {
  assert.throws(() => readSessionPolicy({SESSION_IDLE_SECONDS:value}));
  assert.throws(() => readSessionPolicy({SESSION_ABSOLUTE_SECONDS:value}));
 }
 assert.throws(() => readSessionPolicy({SESSION_IDLE_SECONDS:'301',SESSION_ABSOLUTE_SECONDS:'300'}));
});
