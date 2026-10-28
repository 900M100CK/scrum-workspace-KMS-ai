import test from 'node:test';
import assert from 'node:assert/strict';
import {sessionRuntime} from '../src/session/runtime.ts';
import {sessionOrigin} from '../src/session/http.ts';
test('runtime configuration cannot silently use an operator or another database',()=>{
 assert.equal(sessionRuntime({}),null);
 for(const env of [{SACW_SESSION_ORIGIN:'https://localhost:5173'},{SACW_WORKSPACE_DATABASE_URL:'invalid'},{SACW_WORKSPACE_DATABASE_URL:'postgresql://postgres:x@localhost/workspace_db',SACW_SESSION_ORIGIN:'https://localhost:5173'},{SACW_WORKSPACE_DATABASE_URL:'postgresql://workspace_app:x@localhost/knowledge_db',SACW_SESSION_ORIGIN:'https://localhost:5173'}])assert.throws(()=>sessionRuntime(env));
 for(const origin of ['http://localhost:5173','https://local.invalid/path','https://user:password@local.invalid','https://local.invalid/?query=x','invalid'])assert.throws(()=>sessionOrigin(origin));
 assert.equal(sessionOrigin('https://localhost:5173/'),'https://localhost:5173');
});
