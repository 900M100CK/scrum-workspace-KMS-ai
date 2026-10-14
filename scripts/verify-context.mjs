import { readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { validateResearchDefinitions } from './verify-research.mjs';
import { regressionFixture } from './verify-regression.mjs';

export function parseRequirements(markdown) {
  const rows = [...markdown.matchAll(/^\| FR-(\d{2}) \| (.*?) \| (.*?) \| (.*?) \|$/gm)];
  const result = new Map();
  for (const row of rows) {
    const id = 'FR-' + row[1];
    assert(!result.has(id), 'Duplicate requirement: ' + id);
    const withdrawn = row[2].startsWith('Withdrawn /');
    if (withdrawn) {
      assert(row[3].startsWith('Withdrawn by ADR-') && row[4].startsWith('AC-' + row[1] + ': Withdrawn;'), 'Withdrawal record mismatch: ' + id);
    } else {
      assert(row[4].startsWith('AC-' + row[1] + ': Given'), 'Acceptance ID mismatch: ' + id);
      assert(/\bwhen\b/i.test(row[4]) && /\bthen\b/i.test(row[4]), 'Missing GWT: ' + id);
      assert(/^P[012] \/ /.test(row[2]), 'Invalid delivery priority: ' + id);
    }
    result.set(id, { status: withdrawn ? 'withdrawn' : 'active', priority: row[2].match(/^P[012]/)?.[0], sources: row[2].match(/BR-\d{2}/g) || [] });
  }
  const reverse = new Map([...markdown.matchAll(/^\| BR-(\d{2}) (?:Must|Should) \| (.*?) \|$/gm)].map(m => ['BR-' + m[1], new Set(m[2].match(/FR-\d{2}/g) || [])]));
  for (const br of new Set([...result.values()].flatMap(r => r.sources))) {
    const forward = new Set([...result].filter(([,r]) => r.status === 'active' && r.sources.includes(br)).map(([id]) => id));
    assert(reverse.has(br), 'Missing reverse BR trace: ' + br);
    assert.deepEqual([...reverse.get(br)].sort(), [...forward].sort(), 'Reverse BR mismatch: ' + br);
  }
  assert(result.size > 0, 'No requirements');
  return result;
}

export function validateScope(scope, requirements) {
  assert.equal(scope.rows.length, requirements.size, 'Scope count mismatch');
  const seen = new Set();
  for (const row of scope.rows) {
    assert(requirements.has(row.id), 'Unknown scope requirement: ' + row.id);
    assert(!seen.has(row.id), 'Duplicate scope requirement: ' + row.id);
    seen.add(row.id);
    const requirement = requirements.get(row.id);
    assert.equal(row.status ?? 'active', requirement.status, 'Requirement status mismatch: ' + row.id);
    if (requirement.status === 'withdrawn') {
      assert.equal(row.releasePriority, null, 'Withdrawn requirement has active release priority');
      assert.equal(row.deliveryPriority, null, 'Withdrawn requirement has active delivery priority');
      assert(row.withdrawnBy && row.status === 'withdrawn', 'Missing withdrawal evidence');
    } else {
      assert(['Must', 'Should', 'Could', 'Wont'].includes(row.releasePriority), 'Invalid MoSCoW tier');
      assert.equal(row.deliveryPriority, requirement.priority, 'Delivery priority mismatch');
    }
    assert.deepEqual([...row.businessRequirements].sort(), [...requirements.get(row.id).sources].sort(), 'BR trace mismatch');
    if (requirement.status === 'active' && row.baselinePriority === 'Must/Core' && row.releasePriority !== 'Must') {
      const decision = scope.releaseGateExceptions;
      assert(decision?.status === 'owner-confirmed' && decision.decision === 'ADR-0010' && decision.requirements.includes(row.id), 'Unapproved deferral presented as final');
    }
  }
  const exceptions = scope.rows.filter(r => r.status !== 'withdrawn' && r.baselinePriority === 'Must/Core' && r.releasePriority !== 'Must').map(r => r.id).sort();
  assert.deepEqual([...(scope.releaseGateExceptions?.requirements ?? [])].sort(), exceptions, 'Release exception list mismatch');
}

export function validateApi(api, requirements) {
  assert.equal(api.openapi, '3.1.1', 'Contract dialect changed without review');
  const ids = new Set();
  const checkReferences = value => {
    if (!value || typeof value !== 'object') return;
    if (value.$ref) {
      assert(value.$ref.startsWith('#/'), 'External ref is not checked by this small harness');
      const target = value.$ref.slice(2).split('/').reduce((current, key) => current?.[key], api);
      assert(target, 'Unresolved ref: ' + value.$ref);
    }
    for (const child of Object.values(value)) checkReferences(child);
  };
  checkReferences(api);
  for (const [path, item] of Object.entries(api.paths)) {
    for (const [method, op] of Object.entries(item)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
      assert(op.operationId && !ids.has(op.operationId), 'Duplicate/missing operation ID');
      ids.add(op.operationId);
      assert(op['x-requirements']?.length, 'Missing requirement trace');
      for (const id of op['x-requirements']) {
        assert(requirements.has(id), 'Unknown API requirement: ' + id);
        assert.equal(requirements.get(id).status, 'active', 'Withdrawn API requirement: ' + id);
      }
      const names = new Set((op.parameters || []).filter(p => p.in === 'path' && p.required).map(p => p.name));
      for (const match of path.matchAll(/\{([^}]+)\}/g)) assert(names.has(match[1]), 'Missing path parameter');
      if (path.startsWith('/internal/')) assert(op.security?.some(s => 'serviceKey' in s && 'actorSession' in s), 'Internal route lacks service and actor context');
    }
  }
  const nf = api.components.schemas.NotFound;
  assert.deepEqual(Object.keys(nf.properties).sort(), ['code', 'message'], 'NotFound may reveal resource metadata');
  assert.equal(nf.additionalProperties, false, 'NotFound must reject extra metadata');
  assert.equal(nf.properties.code.const, 'not_found');
  for (const name of ['CreateTask', 'Question']) {
    const schema = api.components.schemas[name];
    if (schema) for (const field of ['actor_id', 'requester_id', 'role', 'permissions']) assert(!(field in schema.properties), 'Client identity/permission assertion in ' + name);
  }
  const passage = api.components.schemas.Passage;
  if (passage) assert(!passage.properties.validity.enum.includes('draft'), 'Draft exposed as retrieval result');
  const version = api.components.schemas.Version;
  if (version) assert.deepEqual(version.properties.state.enum, ['current', 'superseded', 'archived'], 'Product version lifecycle mismatch');
  const citation = api.components.schemas.DocumentCitation;
  if (citation) for (const field of ['document_id', 'version_id', 'passage_id']) assert(citation.required.includes(field), 'Citation locator incomplete');
  if (ids.has('openCitation')) {
    const partial = api.components.schemas.PartiallyAnswered;
    assert(partial?.properties.status.const === 'partially_answered', 'Partial answer status missing');
    for (const name of ['claims','citations','missing_components']) {
      assert(partial.required.includes(name) && partial.properties[name].minItems >= 1, 'Partial answer lacks supported or missing components');
    }
    assert(api.components.schemas.QuestionResult.oneOf.some(r => r.$ref === '#/components/schemas/PartiallyAnswered'), 'Partial answer not reachable');
    const unavailable = api.components.schemas.UnavailableCitation;
    const fields = ['state', 'document_id', 'version_id', 'passage_id', 'message'].sort();
    assert.deepEqual(Object.keys(unavailable.properties).sort(), fields, 'Unavailable citation may expose protected content');
    assert.deepEqual([...unavailable.required].sort(), fields, 'Unavailable citation locator incomplete');
    assert.equal(unavailable.additionalProperties, false, 'Unavailable citation must reject extra fields');
    assert.equal(unavailable.properties.state.const, 'unavailable');
    const withheld = api.components.schemas.AnswerWithheld;
    assert.deepEqual(Object.keys(withheld.properties).sort(), ['code', 'message'], 'Withheld answer may disclose evidence');
    assert.deepEqual([...withheld.required].sort(), ['code', 'message']);
    assert.equal(withheld.additionalProperties, false, 'Withheld answer must reject extra fields');
    assert.equal(withheld.properties.code.const, 'answer_withheld');
    assert.equal(withheld.properties.message.const, 'Unable to provide this answer', 'Withheld answer must conceal detailed cause');
    for (const path of ['/knowledge/questions', '/internal/questions']) {
      assert.equal(api.paths[path].post.responses['503'].$ref, '#/components/responses/QuestionUnavailable', 'Question withholding response missing');
    }
  }
  return ids;
}

export async function verifyContext(root = fileURLToPath(new URL('../', import.meta.url))) {
  const read = path => readFile(resolve(root, path), 'utf8');
  const json = async path => JSON.parse(await read(path));
  const markdown = await read('docs/sdlc/PRD_SRS.md');
  const requirements = parseRequirements(markdown);
  const scope = await json('docs/planning/release-scope.json');
  validateScope(scope, requirements);
  const apis = await Promise.all(['workspace', 'knowledge'].map(owner => json('contracts/openapi/' + owner + '.openapi.json')));
  const operationIds = new Set();
  for (const api of apis) for (const id of validateApi(api, requirements)) { assert(!operationIds.has(id), 'Operation ID reused across services'); operationIds.add(id); }
  const specIndex = await json('specs/index.json');
  const assigned = new Set();
  for (const spec of specIndex.slices) {
    await access(resolve(root, 'specs', spec.file));
    for (const id of spec.requirements) { assert(requirements.has(id), 'Unknown spec FR'); assert.equal(requirements.get(id).status, 'active', 'Withdrawn spec FR'); assert(!assigned.has(id), 'FR assigned to two specs'); assigned.add(id); }
    for (const id of spec.operationIds) assert(operationIds.has(id), 'Spec operation missing: ' + id);
  }
  for (const row of scope.rows) if (row.status !== 'withdrawn' && row.baselinePriority === 'Must/Core') assert(assigned.has(row.id), 'Core FR has no spec: ' + row.id);
  const corpus = await json('eval/fixtures/corpus.json');
  const cases = (await json('eval/reference-cases.json')).cases;
  const research = validateResearchDefinitions(await json('eval/research-cases.json'), await json('eval/fixtures/research-corpus.json'));
  assert(cases.length >= 20 && cases.length <= 30, 'Reference set outside initial range');
  const caseIds = new Set();
  for (const testCase of cases) {
    const fixture = regressionFixture(corpus, testCase);
    const locators = new Set(fixture.documents.flatMap(d => d.versions.flatMap(v => v.passages.map(p => [d.document_id, v.version_id, p.passage_id].join('/')))));
    assert(!caseIds.has(testCase.case_id), 'Duplicate evaluation case'); caseIds.add(testCase.case_id);
    assert(corpus.users.some(u => u.user_id === testCase.access.user_id), 'Unknown access fixture');
    for (const source of testCase.expected_sources) assert(locators.has([source.document_id, source.version_id, source.passage_id].join('/')), 'Unknown evidence locator');
    for (const id of testCase.requirements) {
      assert(requirements.has(id), 'Unknown evaluation FR');
      assert.equal(requirements.get(id).status, 'active', 'Withdrawn evaluation FR');
    }
  }
  const files = ['README.md', 'AGENTS.md', 'docs/architecture.md', 'docs/development-rules.md', 'docs/planning/five-month-plan.md', 'docs/planning/backlog.md', 'docs/sdlc/PRD_SRS.md', 'docs/sdlc/use-cases.md', 'docs/sdlc/data-design.md', 'docs/sdlc/api-design.md', 'docs/sdlc/test-plan.md', 'contracts/README.md', 'eval/README.md', 'specs/README.md', ...specIndex.slices.map(s => 'specs/' + s.file)];
  for (const file of files) {
    const text = await read(file);
    for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      if (/^https?:/.test(match[1])) continue;
      const [location, anchor] = match[1].split('#');
      const target = resolve(dirname(resolve(root, file)), location || file.split('/').at(-1));
      await access(target);
      if (anchor) {
        const targetText = await readFile(target, 'utf8');
        const slugs = [...targetText.matchAll(/^#{1,6}\s+(.+)$/gm)].map(m => m[1].toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu, '').replaceAll(' ', '-'));
        assert(slugs.includes(anchor), 'Missing Markdown anchor: ' + match[1]);
      }
    }
  }
  return { requirements: [...requirements.values()].filter(r => r.status === 'active').length, withdrawn: [...requirements].filter(([,r]) => r.status === 'withdrawn').map(([id]) => id), scope: scope.rows.filter(r => r.status !== 'withdrawn').reduce((a,r) => (a[r.releasePriority] = (a[r.releasePriority] || 0) + 1, a), {}), services: apis.length, operations: operationIds.size, specs: specIndex.slices.length, referenceCases: cases.length, research, runtimeEvidence: 'not run' };
}

if (typeof process !== 'undefined' && process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyContext(), null, 2));
}
