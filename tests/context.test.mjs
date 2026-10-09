import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseRequirements, validateApi, validateScope, verifyContext } from '../scripts/verify-context.mjs';
const root = new URL('../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const prd = await readFile(new URL('docs/sdlc/PRD_SRS.md', root), 'utf8');
const requirements = parseRequirements(prd);

test('context links and contracts are coherent', async () => { const result = await verifyContext(); assert.equal(result.services, 2); });
test('duplicate FR IDs are rejected', () => { const row = prd.match(/^\| FR-01 \|.*$/m)[0]; assert.throws(() => parseRequirements(prd + '\n' + row), /Duplicate/); });
test('unknown release requirement is rejected', async () => { const scope = await readJson('docs/planning/release-scope.json'); scope.rows[0].id = 'FR-99'; assert.throws(() => validateScope(scope, requirements), /Unknown/); });
test('unresolved contract references are rejected', async () => { const api = await readJson('contracts/openapi/workspace.openapi.json'); api.components.schemas.Task = { $ref: '#/components/schemas/Unknown' }; assert.throws(() => validateApi(api, requirements), /Unresolved/); });
test('not-found response cannot add a source title', async () => { const api = await readJson('contracts/openapi/workspace.openapi.json'); api.components.schemas.NotFound.properties.title = { type: 'string' }; assert.throws(() => validateApi(api, requirements), /metadata/); });
test('client task creation cannot assert permissions', async () => { const api = await readJson('contracts/openapi/workspace.openapi.json'); api.components.schemas.CreateTask.properties.permissions = { type: 'array' }; assert.throws(() => validateApi(api, requirements), /Client/); });
test('retrieval response cannot expose Draft as validity', async () => { const api = await readJson('contracts/openapi/knowledge.openapi.json'); api.components.schemas.Passage.properties.validity.enum.push('draft'); assert.throws(() => validateApi(api, requirements), /Draft/); });
test('document citation requires exact version identity', async () => { const api = await readJson('contracts/openapi/knowledge.openapi.json'); api.components.schemas.DocumentCitation.required = ['document_id', 'passage_id']; assert.throws(() => validateApi(api, requirements), /locator/); });
test('internal request must require service plus actor context', async () => { const api = await readJson('contracts/openapi/workspace.openapi.json'); api.paths['/internal/access/evaluate'].post.security = [{ sessionCookie: [] }]; assert.throws(() => validateApi(api, requirements), /Internal/); });
