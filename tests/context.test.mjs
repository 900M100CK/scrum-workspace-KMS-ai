import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseRequirements, validateApi, validateScope, verifyContext } from '../scripts/verify-context.mjs';
import { validateResearchDefinitions } from '../scripts/verify-research.mjs';
import { regressionFixture } from '../scripts/verify-regression.mjs';
const root = new URL('../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const prd = await readFile(new URL('docs/sdlc/PRD_SRS.md', root), 'utf8');
const requirements = parseRequirements(prd);

test('partial answer must contain cited supported content and missing components', async () => {
  const api = await readJson('contracts/openapi/knowledge.openapi.json');
  api.components.schemas.PartiallyAnswered.properties.citations.minItems = 0;
  assert.throws(() => validateApi(api, requirements), /Partial answer lacks/);
});
test('document-only answer cannot use a task selected by unavailable operational state', async () => {
  const set = await readJson('eval/research-cases.json');
  const c = set.cases.find(c => c.case_id === 'RQ-22');
  c.configuration_expectations.C0.required_supported_claims = [c.required_claims[0].claim_id];
  assert.throws(() => validateResearchDefinitions(set, corpusResearch), /Disabled source/);
});
test('partial supported answer is not an empty insufficiency response', async () => {
  const set = await readJson('eval/research-cases.json');
  set.cases.find(c => c.case_id === 'RQ-17').configuration_expectations.C0.expected_status = 'insufficient_evidence';
  assert.throws(() => validateResearchDefinitions(set, corpusResearch), /Unavailable source/);
});

test('unavailable citation cannot return an excerpt', async () => {
  const api = await readJson('contracts/openapi/knowledge.openapi.json');
  api.components.schemas.UnavailableCitation.properties.excerpt = { type: 'string' };
  assert.throws(() => validateApi(api, requirements), /protected content/);
});
test('unavailable citation must retain its exact passage identity', async () => {
  const api = await readJson('contracts/openapi/knowledge.openapi.json');
  api.components.schemas.UnavailableCitation.required = ['state', 'document_id', 'version_id', 'message'];
  assert.throws(() => validateApi(api, requirements), /locator incomplete/);
});
test('withheld answer cannot disclose an access-change reason', async () => {
  const api = await readJson('contracts/openapi/knowledge.openapi.json');
  api.components.schemas.AnswerWithheld.properties.message = { type: 'string' };
  assert.throws(() => validateApi(api, requirements), /conceal detailed cause/);
});
test('withheld answer cannot include source identities', async () => {
  const api = await readJson('contracts/openapi/knowledge.openapi.json');
  api.components.schemas.AnswerWithheld.properties.source_ids = { type: 'array' };
  assert.throws(() => validateApi(api, requirements), /disclose evidence/);
});

test('context links and contracts are coherent', async () => { const result = await verifyContext(); assert.equal(result.services, 2); });
test('duplicate FR IDs are rejected', () => { const row = prd.match(/^\| FR-01 \|.*$/m)[0]; assert.throws(() => parseRequirements(prd + '\n' + row), /Duplicate/); });
test('unknown release requirement is rejected', async () => { const scope = await readJson('docs/planning/release-scope.json'); scope.rows[0].id = 'FR-99'; assert.throws(() => validateScope(scope, requirements), /Unknown/); });
test('unresolved contract references are rejected', async () => { const api = await readJson('contracts/openapi/workspace.openapi.json'); api.components.schemas.Task = { $ref: '#/components/schemas/Unknown' }; assert.throws(() => validateApi(api, requirements), /Unresolved/); });
test('not-found response cannot add a source title', async () => { const api = await readJson('contracts/openapi/workspace.openapi.json'); api.components.schemas.NotFound.properties.title = { type: 'string' }; assert.throws(() => validateApi(api, requirements), /metadata/); });
test('client task creation cannot assert permissions', async () => { const api = await readJson('contracts/openapi/workspace.openapi.json'); api.components.schemas.CreateTask.properties.permissions = { type: 'array' }; assert.throws(() => validateApi(api, requirements), /Client/); });
test('retrieval response cannot expose Draft as validity', async () => { const api = await readJson('contracts/openapi/knowledge.openapi.json'); api.components.schemas.Passage.properties.validity.enum.push('draft'); assert.throws(() => validateApi(api, requirements), /Draft/); });
test('document citation requires exact version identity', async () => { const api = await readJson('contracts/openapi/knowledge.openapi.json'); api.components.schemas.DocumentCitation.required = ['document_id', 'passage_id']; assert.throws(() => validateApi(api, requirements), /locator/); });
test('internal request must require service plus actor context', async () => { const api = await readJson('contracts/openapi/workspace.openapi.json'); api.paths['/internal/access/evaluate'].post.security = [{ sessionCookie: [] }]; assert.throws(() => validateApi(api, requirements), /Internal/); });

test('withdrawn IDs cannot return through an API trace', async () => {
  const api = await readJson('contracts/openapi/knowledge.openapi.json');
  api.paths['/knowledge/documents/{document_id}/versions'].post['x-requirements'].push('FR-45');
  assert.throws(() => validateApi(api, requirements), /Withdrawn API/);
});
test('withdrawn requirements cannot count as release Must', async () => {
  const scope = await readJson('docs/planning/release-scope.json');
  scope.rows.find(r => r.id === 'FR-45').releasePriority = 'Must';
  assert.throws(() => validateScope(scope, requirements), /Withdrawn requirement/);
});
test('new Core deferral requires an explicit matching decision', async () => {
  const scope = await readJson('docs/planning/release-scope.json');
  scope.rows.find(r => r.id === 'FR-28').releasePriority = 'Could';
  assert.throws(() => validateScope(scope, requirements), /Unapproved deferral/);
});
test('missing withdrawal record cannot silently shrink the scope', async () => {
  const scope = await readJson('docs/planning/release-scope.json');
  scope.rows = scope.rows.filter(r => r.id !== 'FR-45');
  assert.throws(() => validateScope(scope, requirements), /Scope count/);
});
test('document lifecycle rejects reintroducing Draft outside retrieval', async () => {
  const api = await readJson('contracts/openapi/knowledge.openapi.json');
  api.components.schemas.Version.properties.state.enum.push('draft');
  assert.throws(() => validateApi(api, requirements), /lifecycle mismatch/);
});

test('research references reject restricted evidence without an explicit grant', async () => {
  const set = await readJson('eval/research-cases.json');
  set.cases.find(c=>c.case_id==='RQ-05').access.user_id='admin-a';
  assert.throws(()=>validateResearchDefinitions(set,corpusResearch),/leaks restricted/);
});
const corpusResearch = await readJson('eval/fixtures/research-corpus.json');
test('document-only configuration cannot receive current-state credit', async () => {
  const set=await readJson('eval/research-cases.json'); const c=set.cases.find(c=>c.group==='both');
  c.configuration_expectations.C0.required_supported_claims=c.required_claims.map(x=>x.claim_id);
  assert.throws(()=>validateResearchDefinitions(set,corpusResearch),/Disabled source/);
});
test('operational citation must match the frozen revision and observation time', async () => {
  const set=await readJson('eval/research-cases.json');
  set.cases.find(c=>c.group==='state').required_claims[0].evidence[0].revision+=1;
  assert.throws(()=>validateResearchDefinitions(set,corpusResearch),/revision mismatch/);
});
test('fixture blocked flag cannot disagree with ordered evidence', async () => {
  const corpus=structuredClone(corpusResearch); corpus.operational.tasks.find(t=>t.task_id==='t-auth').blocked=true;
  assert.throws(()=>validateResearchDefinitions(awaitedResearch,corpus),/latest event/);
});
const awaitedResearch=await readJson('eval/research-cases.json');
test('regression fixture cannot reintroduce the removed Draft lifecycle', async () => {
  const corpus=await readJson('eval/fixtures/corpus.json');
  corpus.documents[0].versions[0].state='draft';
  assert.throws(()=>regressionFixture(corpus,{access:{project_id:'p-alpha'}}),/invalid product lifecycle/);
});
test('revision scenario cannot overwrite an existing cited identity', async () => {
  const corpus=await readJson('eval/fixtures/corpus.json');
  const set=await readJson('eval/reference-cases.json');
  const scenario=set.cases.find(c=>c.case_id==='EVAL-21');
  scenario.fixture_mutations[0].new_version.version_id='v1';
  assert.throws(()=>regressionFixture(corpus,scenario),/reuses immutable version identity/);
});
test('unsaved editor scenario must stay outside ingested evidence', async () => {
  const corpus=await readJson('eval/fixtures/corpus.json');
  const set=await readJson('eval/reference-cases.json');
  const scenario=set.cases.find(c=>c.case_id==='EVAL-05');
  scenario.unsaved_editor_fixture.ingest=true;
  assert.throws(()=>regressionFixture(corpus,scenario),/cannot be ingested/);
});
test('matching observation revision cannot hide a different value', () => {
  const corpus=structuredClone(corpusResearch);
  corpus.observations.find(o=>o.entity_id==='t-auth').value.assignee_id='member-b';
  assert.throws(()=>validateResearchDefinitions(awaitedResearch,corpus),/Observation value disagrees/);
});
test('source-task fixture links cannot cross projects', () => {
  const corpus=structuredClone(corpusResearch);
  corpus.links[0].task_id='t-beta';
  assert.throws(()=>validateResearchDefinitions(awaitedResearch,corpus),/Source-task link crosses project/);
});
test('observations without source rows cannot be used as operational evidence', () => {
  const corpus=structuredClone(corpusResearch);
  corpus.observations.push({...corpus.observations[0],entity_id:'invented-task'});
  assert.throws(()=>validateResearchDefinitions(awaitedResearch,corpus),/no operational source row/);
});
