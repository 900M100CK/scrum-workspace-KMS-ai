import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseRequirements, validateApi as validateApiContract, validateScope, validateSpecOwnership, verifyContext } from '../scripts/verify-context.mjs';
import { validateResearchDefinitions } from '../scripts/verify-research.mjs';
import { regressionFixture } from '../scripts/verify-regression.mjs';
import { validateApiRouting } from '../scripts/verify-api-routing.mjs';
const root = new URL('../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const prd = await readFile(new URL('docs/sdlc/PRD_SRS.md', root), 'utf8');
const requirements = parseRequirements(prd);
const peerKnowledge = await readJson('contracts/openapi/knowledge.openapi.json');
const peerWorkspace = await readJson('contracts/openapi/workspace.openapi.json');
const validateApi = (api, rules) => validateApiContract(api, rules, api.components.schemas.AllowedActions ? [api, peerKnowledge] : [peerWorkspace, api]);

test('every internal authentication alternative requires both service and actor context', () => {
  for (const current of [peerWorkspace,peerKnowledge]) {
    for (const [path,item] of Object.entries(current.paths).filter(([path])=>path.startsWith('/internal/'))) {
      for (const [method,operation] of Object.entries(item).filter(([,op])=>op.operationId)) {
        for (const alternative of [{},{serviceKey:[]},{actorSession:[]},{sessionCookie:[]}]) {
          const broken=structuredClone(current);
          broken.paths[path][method].security.push(alternative);
          assert.throws(()=>validateApi(broken,requirements),/Internal authentication alternative/);
        }
      }
    }
  }
});

test('protected public operations cannot opt out of session authentication or name unknown schemes', () => {
  for (const declaration of [[],[{}],[{serviceKey:[]}],[{sessionCookie:[]},{}]]) {
    const broken=structuredClone(peerWorkspace);
    broken.paths['/projects/{project_id}'].get.security=declaration;
    assert.throws(()=>validateApi(broken,requirements),/Public authentication alternative/);
  }
  const unknown=structuredClone(peerWorkspace);
  unknown.paths['/projects/{project_id}'].get.security=[{sessionCookie:[],nonexistent:[]}];
  assert.throws(()=>validateApi(unknown,requirements),/Unknown security scheme/);
  validateApi(peerWorkspace,requirements); // Explicitly unauthenticated signIn remains valid.
});

test('route templates reject extra, duplicate, missing and equivalent selectors', () => {
  for (const [mutate,error] of [
    [a=>a.paths['/projects/{project_id}'].get.parameters.push({name:'ghost',in:'path',required:true,schema:{type:'string'}}),/Extra path parameter/],
    [a=>a.paths['/projects/{project_id}'].get.parameters.push(structuredClone(a.paths['/projects/{project_id}'].get.parameters[0])),/Duplicate parameter/],
    [a=>a.paths['/projects/{project_id}'].get.parameters=[],/Missing path parameter/],
    [a=>a.paths['/projects/{project_id}'].get.parameters[0].required=false,/must be required/],
    [a=>a.paths['/projects/{other_id}']={},/Equivalent templated paths/],
  ]) {
    const broken=structuredClone(peerWorkspace);mutate(broken);
    assert.throws(()=>validateApi(broken,requirements),error);
  }
});

test('path parameters support inherited references and valid operation overrides', () => {
  const api=structuredClone(peerWorkspace);
  const item=api.paths['/projects/{project_id}'];
  const parameter=item.get.parameters.find(p=>p.name==='project_id');
  api.components.parameters={ProjectSelector:structuredClone(parameter)};
  item.parameters=[{$ref:'#/components/parameters/ProjectSelector'}];
  item.get.parameters=item.get.parameters.filter(p=>p.name!=='project_id');
  // Sibling operation-level copies are valid overrides, not duplicates.
  validateApi(api,requirements);
  api.components.parameters.ProjectSelector={$ref:'#/components/parameters/ProjectSelector'};
  assert.throws(()=>validateApiRouting(api),/Cyclic parameter reference/);
});

test('HEAD operations cannot bypass requirement trace validation', () => {
  const api=structuredClone(peerWorkspace);
  const head=structuredClone(api.paths['/projects/{project_id}'].get);
  head.operationId='headProject';delete head['x-requirements'];
  api.paths['/projects/{project_id}'].head=head;
  assert.throws(()=>validateApi(api,requirements),/Missing requirement trace/);
});

test('independent document commands expose opaque preconditions and minimal receipts only', () => {
  for (const [mutate, message] of [
    [a => { delete a.paths['/knowledge/projects/{project_id}/documents/{document_id}/command-precondition'].get; }, /precondition read missing/],
    [a => { a.components.schemas.DocumentCommandPrecondition.properties.revision = {type:'integer'}; }, /leaks content or revision/],
    [a => { a.components.schemas.DocumentMutationReceipt.properties.content = {type:'string'}; }, /leaks content or revision/],
    [a => { delete a.components.schemas.Revise.oneOf; }, /exactly one/],
    [a => { a.paths['/knowledge/documents/{document_id}/versions'].post.responses['201'].content['application/json'].schema = {$ref:'#/components/schemas/Version'}; }, /return protected content/],
    [a => { a.paths['/knowledge/documents/{document_id}'].delete.parameters = a.paths['/knowledge/documents/{document_id}'].delete.parameters.filter(p => p.name !== 'X-Document-Precondition'); }, /independent precondition/],
  ]) {
    const broken = structuredClone(peerKnowledge);
    mutate(broken);
    assert.throws(() => validateApi(broken, requirements), message);
  }
});

test('readiness declarations cannot conflate semantic processing with keyword availability', () => {
  for (const mutate of [
    a => { a.components.schemas.Readiness.required = ['document_id','version_id']; },
    a => { a.components.schemas.Readiness.properties.readiness = {enum:['ready']}; },
    a => { a.components.schemas.Readiness.properties.keyword_available = {type:'boolean'}; },
  ]) {
    const broken = structuredClone(peerKnowledge);
    mutate(broken);
    assert.throws(() => validateApi(broken, requirements), /semantic path|keyword availability/);
  }
});

test('inspection contracts preserve exact ranked evidence, actual steps and honest missing telemetry', () => {
  validateApi(peerKnowledge, requirements);
  for (const [mutate, message] of [
    [a => { a.components.schemas.Trace.required = a.components.schemas.Trace.required.filter(x => x !== 'query'); }, /Inspection evidence/],
    [a => { a.components.schemas.Trace.required = a.components.schemas.Trace.required.filter(x => x !== 'tool_steps'); }, /inspection steps/],
    [a => { a.components.schemas.DocumentInspectionSource.required = ['source_id']; }, /document inspection binding/],
    [a => { a.components.schemas.OperationalInspectionSource.required = ['source_id','entity_id']; }, /operational inspection binding/],
    [a => { a.components.schemas.Trace.properties.duration = {type:'number',minimum:0}; }, /timing lacks availability/],
    [a => { a.components.schemas.DurationMetric.oneOf[1].properties.value_ms = {const:0}; }, /must not contain a number/],
    [a => { delete a.components.schemas.InspectionStep.allOf; }, /Unexecuted inspection step/],
    [a => { a.components.schemas.InspectionQuery.oneOf[2].properties.text = {type:'string'}; }, /must not contain text/],
    [a => { a.components.schemas.TokenUsageMetric.oneOf = a.components.schemas.TokenUsageMetric.oneOf.slice(0,1); }, /availability distinction/],
    [a => { a.components.schemas.RetrievalSummary.properties.retrieval_steps.items.allOf[1].properties.stage.enum.push('generation'); }, /full execution stages/],
    [a => { a.paths['/knowledge/runs/{run_id}/summary'].get['x-release-priority'] = 'Must'; }, /stay Should/],
  ]) {
    const broken = structuredClone(peerKnowledge);
    mutate(broken);
    assert.throws(() => validateApi(broken, requirements), message);
  }
});

test('AI transport contracts require exact durable mixed-evidence handoff binding', async () => {
  for (const [original, peer] of [[peerWorkspace, peerKnowledge], [peerKnowledge, peerWorkspace]]) {
    for (const [mutate, message] of [
      [a => { a.components.schemas.HandoffManifest.required = a.components.schemas.HandoffManifest.required.filter(x => x !== 'attempt_id'); }, /binding missing/],
      [a => { a.components.schemas.HandoffManifest.properties.complete.const = false; }, /Incomplete manifest/],
      [a => { a.components.schemas.OperationalHandoffEvidence.required = ['entity_id']; }, /Operational evidence binding/],
      [a => { a.components.schemas.StoredHandoff.required = ['manifest']; }, /receipt missing/],
      [a => { const n = a.components.schemas.AllowedActions ? 'ProviderInput' : 'InternalQuestionResult'; a.components.schemas[n].required = a.components.schemas[n].required.filter(x => x !== 'handoff'); }, /mandatory manifest/],
      [a => { const n = a.components.schemas.AllowedActions ? 'ProviderHandoff' : 'AnswerHandoff'; a.components.schemas[n].allOf[1].properties.manifest.properties.purpose.const = 'wrong_purpose'; }, /Cross-purpose/],
    ]) {
      const broken = structuredClone(original);
      mutate(broken);
      assert.throws(() => validateApiContract(broken, requirements, [broken, peer]), message);
    }
  }
});

test('discovery contracts preserve minimal disclosure and read preconditions', async () => {
  const workspace = await readJson('contracts/openapi/workspace.openapi.json');
  const knowledge = await readJson('contracts/openapi/knowledge.openapi.json');
  for (const [original, mutate, message] of [
    [workspace, a => { delete a.paths['/documents/{document_id}/policy'].get; }, /Missing discovery read/],
    [workspace, a => { a.components.schemas.AllowedActions.properties.title = {type:'string'}; }, /protected metadata/],
    [workspace, a => { a.components.schemas.DocumentReadGrantList.required = ['items','next_cursor']; }, /policy precondition/],
    [workspace, a => { a.components.schemas.AllowedActions.properties.allowed_operations.items.enum.push('evaluateAccess'); }, /not a public operation/],
    [knowledge, a => { a.components.schemas.VersionSummary.properties.content = {type:'string'}; }, /expose content/],
    [knowledge, a => { delete a.paths['/knowledge/documents/{document_id}/versions'].get.responses['409']; }, /page must reject/],
    [knowledge, a => { a.components.schemas.VersionList.required = ['items']; }, /concurrency precondition/],
  ]) {
    const broken = structuredClone(original);
    mutate(broken);
    assert.throws(() => validateApi(broken, requirements), message);
  }
});

test('UI action catalogue derives public operation membership from both current contracts', async () => {
  const original = await readJson('contracts/openapi/workspace.openapi.json');
  const knowledge = await readJson('contracts/openapi/knowledge.openapi.json');
  validateApiContract(original, requirements, [original, knowledge]);
  assert(original.components.schemas.AllowedActions.properties.allowed_operations.items.enum.includes('getRetrievalSummary'));
  for (const id of ['guardProviderInput', 'retireDocumentPolicy', 'nonexistentOperation']) {
    const broken = structuredClone(original);
    broken.components.schemas.AllowedActions.properties.allowed_operations.items.enum.push(id);
    assert.throws(() => validateApiContract(broken, requirements, [broken, knowledge]), /not a public operation/);
  }
  // Follow the peer contract rather than a frozen list or name pattern.
  const renamed = structuredClone(knowledge);
  renamed.paths['/knowledge/runs/{run_id}/summary'].get.operationId = 'renamedSummary';
  assert.throws(() => validateApiContract(original, requirements, [original, renamed]), /not a public operation: getRetrievalSummary/);
  const narrower = structuredClone(original);
  narrower.components.schemas.AllowedActions.properties.allowed_operations.items.enum = ['getVersion'];
  validateApiContract(narrower, requirements, [narrower, knowledge]);
  assert.throws(() => validateApiContract(original, requirements), /both service contracts/);
});

test('action discovery retains exact version binding and independent summary authority', async () => {
  const original = await readJson('contracts/openapi/workspace.openapi.json');
  for (const [mutate, message] of [
    [a => { a.paths['/access/allowed-actions'].get.parameters = a.paths['/access/allowed-actions'].get.parameters.filter(p => p.name !== 'document_id'); }, /exact locator/],
    [a => { a.components.schemas.AllowedActions.allOf[0].then.properties.version_id.type = 'null'; }, /exact locator/],
    [a => { a.paths['/access/allowed-actions'].get['x-run-action-entitlements'].getRetrievalSummary = 'scoped_trace_read'; }, /conflates summary/],
  ]) {
    const broken = structuredClone(original);
    mutate(broken);
    assert.throws(() => validateApi(broken, requirements), message);
  }
});

test('fresh-client work contracts retain location, allocation history and blocker reads', async () => {
  const original = await readJson('contracts/openapi/workspace.openapi.json');
  validateApi(original, requirements);
  for (const [mutate, message] of [
    [api => { api.components.schemas.Task.required = api.components.schemas.Task.required.filter(x => x !== 'work_location'); }, /task location/],
    [api => { delete api.paths['/sprints/{sprint_id}/items'].get; }, /Sprint membership/],
    [api => { delete api.paths['/tasks/{task_id}/blockers'].get; }, /Blocker history/],
    [api => { api.components.schemas.SprintItem.required = ['task']; }, /allocation history/],
    [api => { delete api.paths['/projects/{project_id}/tasks'].get.responses['409']; }, /mix snapshots/],
    [api => { api.components.schemas.TaskList.required = api.components.schemas.TaskList.required.filter(x => x !== 'backlog_revision'); }, /public read source/],
    [api => { api.components.schemas.Reorder.properties.expected_revision = {type:'integer'}; }, /differs from public Backlog/],
  ]) {
    const broken = structuredClone(original);
    mutate(broken);
    assert.throws(() => validateApi(broken, requirements), message);
  }
});

test('spec owner cannot contradict the actual operation contract', async () => {
  const apis = { workspace: await readJson('contracts/openapi/workspace.openapi.json'), knowledge: await readJson('contracts/openapi/knowledge.openapi.json') };
  const { slices } = await readJson('specs/index.json');
  validateSpecOwnership(slices, apis);
  for (const id of ['SP-06', 'SP-10']) {
    const broken = structuredClone(slices);
    broken.find(s => s.id === id).service = 'knowledge';
    assert.throws(() => validateSpecOwnership(broken, apis), /ownership mismatch/);
  }
});

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
