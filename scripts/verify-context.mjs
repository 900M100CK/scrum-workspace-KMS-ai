import { readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { validateResearchDefinitions } from './verify-research.mjs';
import { regressionFixture } from './verify-regression.mjs';
import { HTTP_METHODS, validateApiRouting } from './verify-api-routing.mjs';

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

export function validateApi(api, requirements, contracts) {
  assert.equal(api.openapi, '3.1.1', 'Contract dialect changed without review');
  validateApiRouting(api);
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
      if (!HTTP_METHODS.includes(method)) continue;
      assert(op.operationId && !ids.has(op.operationId), 'Duplicate/missing operation ID');
      ids.add(op.operationId);
      assert(op['x-requirements']?.length, 'Missing requirement trace');
      for (const id of op['x-requirements']) {
        assert(requirements.has(id), 'Unknown API requirement: ' + id);
        assert.equal(requirements.get(id).status, 'active', 'Withdrawn API requirement: ' + id);
      }
    }
  }
  const nf = api.components.schemas.NotFound;
  if (ids.has('listTasks')) validateWorkReads(api);
  if (ids.has('listTasks') || ids.has('getDocument')) validateDiscoveryReads(api);
  if (api.components.schemas.AllowedActions) validatePublicActionCatalogue(api, contracts);
  if (ids.has('guardProviderInput') || ids.has('generateInternalQuestion')) validateHandoffContracts(api, contracts);
  if (ids.has('getTrace')) validateInspectionContracts(api);
  if (ids.has('getReadiness')) {
    const readiness = api.components.schemas.Readiness;
    assert(readiness.required.includes('semantic_readiness') && !('readiness' in readiness.properties), 'Readiness must identify the semantic path explicitly');
    assert.deepEqual(readiness.properties.semantic_readiness.enum, ['pending','ready','failed'], 'Semantic processing states missing');
    assert(!('keyword_available' in readiness.properties), 'Semantic processing must not imply keyword availability');
  }
  if (ids.has('reviseDocument')) validateDocumentCommandContracts(api);
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

export function validateWorkReads(api) {
  const schemas = api.components.schemas;
  assert(schemas.TaskList.required.includes('backlog_revision'), 'Reorder precondition lacks public read source');
  assert.equal(schemas.TaskList.properties.backlog_revision.type, 'string', 'Backlog revision must preserve bigint precision');
  assert.deepEqual(schemas.Reorder.properties.expected_revision, schemas.TaskList.properties.backlog_revision, 'Reorder revision differs from public Backlog generation');
  assert.equal(api.paths['/projects/{project_id}/backlog-order'].post.responses['200'].content['application/json'].schema.$ref, '#/components/schemas/ReorderResult', 'Reorder needs a committed receipt');
  assert(schemas.Task.required.includes('work_location'), 'Reload cannot determine task location');
  const locations = schemas.WorkLocation?.oneOf;
  assert.deepEqual(locations?.map(x => x.properties.kind.const), ['backlog', 'sprint', 'completed'], 'Work location must distinguish retained completion from Backlog');
  assert.equal(locations[0].properties.position.type, 'string', 'Backlog numeric precision must survive transport');
  for (const variant of locations.slice(1)) assert(variant.required.includes('sprint_id'), 'Sprint location lacks identity');
  const items = api.paths['/sprints/{sprint_id}/items'].get;
  const events = api.paths['/tasks/{task_id}/blockers'].get;
  assert.equal(items?.operationId, 'listSprintItems', 'Sprint membership cannot be reconstructed');
  assert.equal(events?.operationId, 'listBlockerEvents', 'Blocker history cannot be reconstructed');
  assert(schemas.SprintItem.required.includes('allocation_state'), 'Current task cannot substitute for allocation history');
  assert.deepEqual(schemas.SprintItem.properties.allocation_state.enum, ['allocated', 'completed', 'returned']);
  for (const op of [items, events, api.paths['/projects/{project_id}/tasks'].get]) {
    assert(op.responses['409'], 'Changed page must reject rather than mix snapshots');
    assert(op.responses['404'] && op.responses['503'], 'Protected page needs denial and unavailable responses');
  }
  assert.equal(api.paths['/sprints/{sprint_id}/complete'].post.responses['200'].content['application/json'].schema.$ref, '#/components/schemas/SprintCompletion', 'Completion counts missing');
}

export function validateDiscoveryReads(api) {
  const s = api.components.schemas;
  const workspace = Boolean(api.paths['/projects/{project_id}/tasks']);
  const routes = workspace ? [
    ['/projects/{project_id}/members', 'listMembers'],
    ['/documents/{document_id}/policy', 'getDocumentPolicy'],
    ['/documents/{document_id}/read-grants', 'listDocumentReadGrants'],
    ['/access/allowed-actions', 'getAllowedActions'],
  ] : [
    ['/knowledge/projects/{project_id}/documents', 'listDocuments'],
    ['/knowledge/documents/{document_id}/versions', 'listVersions'],
  ];
  for (const [path, id] of routes) {
    const op = api.paths[path]?.get;
    assert.equal(op?.operationId, id, 'Missing discovery read: ' + id);
    for (const code of ['400', '401', '404', '503']) assert(op.responses[code], 'Discovery failure response missing');
    assert.equal(op.responses['200'].headers?.['Cache-Control']?.schema.const, 'no-store', 'Discovery must not cache protected projections');
    if (id.startsWith('list')) {
      assert(op.responses['409'], 'Changed discovery page must reject');
      assert(op.parameters.some(p => p.name === 'cursor'), 'Discovery pagination missing');
    }
  }
  if (workspace) {
    for (const [name, fields] of [
      ['AllowedActions', ['resource_kind', 'project_id', 'resource_id', 'document_id', 'version_id', 'allowed_operations']],
      ['DocumentReadGrant', ['user_id']],
      ['Policy', ['document_id', 'project_id', 'classification', 'permission_revision', 'registry_state']],
    ]) {
      assert.equal(s[name].additionalProperties, false, 'Discovery disclosure envelope is open');
      assert.deepEqual(Object.keys(s[name].properties).sort(), fields.sort(), 'Discovery may disclose protected metadata');
      assert.deepEqual([...s[name].required].sort(), fields.sort(), 'Discovery binding is incomplete');
    }
    assert(s.DocumentReadGrantList.required.includes('permission_revision'), 'Grant list lacks policy precondition');
    const actionRead = api.paths['/access/allowed-actions'].get;
    for (const name of ['document_id', 'version_id']) assert(actionRead.parameters.some(p => p.name === name && p.in === 'query'), 'Version action scope lacks exact locator');
    assert.deepEqual(actionRead['x-version-locator'], ['project_id', 'document_id', 'version_id'], 'Version action scope lacks exact locator');
    const binding = s.AllowedActions.allOf?.[0];
    assert.equal(binding?.if?.properties.resource_kind.const, 'version', 'Version response locator condition missing');
    assert.equal(binding?.then?.properties.resource_id.type, 'null', 'Version response must not use an ambiguous resource ID');
    for (const name of ['document_id', 'version_id']) {
      assert.equal(binding?.then?.properties[name].type, 'string', 'Version response lacks exact locator');
      assert.equal(binding?.then?.properties[name].minLength, 1, 'Version response locator cannot be empty');
      assert.equal(binding?.else?.properties[name].type, 'null', 'Non-version scope must not carry version selectors');
    }
    assert.deepEqual(actionRead['x-run-action-entitlements'], {getRetrievalSummary:'permitted_answer_reader', getTrace:'scoped_trace_read'}, 'Run action discovery conflates summary and trace authority');
  } else {
    assert(s.DocumentSummary.required.includes('current_version_id'), 'Explorer cannot represent archived-only documents');
    assert(s.VersionList.required.includes('document_revision'), 'History lacks document concurrency precondition');
    assert.deepEqual(Object.keys(s.VersionSummary.properties).sort(), ['document_id', 'version_id', 'state', 'created_at'].sort(), 'History list may expose content');
    assert.equal(s.VersionSummary.additionalProperties, false, 'History disclosure envelope is open');
  }
}

export function validatePublicActionCatalogue(api, contracts) {
  assert(Array.isArray(contracts) && contracts.length >= 2 && contracts.includes(api), 'UI action validation requires the current contract and both service contracts');
  const publicIds = new Set();
  const internalIds = new Set();
  for (const contract of contracts) for (const [path, item] of Object.entries(contract.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = item[method];
      if (!operation?.operationId) continue;
      const serviceOnly = operation.security?.some(security => 'serviceKey' in security);
      (path.startsWith('/internal/') || serviceOnly ? internalIds : publicIds).add(operation.operationId);
    }
  }
  const actions = api.components.schemas.AllowedActions.properties.allowed_operations.items.enum;
  assert(Array.isArray(actions) && new Set(actions).size === actions.length, 'UI action catalogue must contain unique operation IDs');
  for (const id of actions) assert(publicIds.has(id) && !internalIds.has(id), 'UI action is not a public operation: ' + id);
}

export function validateHandoffContracts(api, contracts) {
  const s = api.components.schemas;
  const manifest = s.HandoffManifest;
  for (const field of ['handoff_id','run_id','attempt_id','purpose','actor_id','project_id','access_context_ref','session_generation','project_permission_revision','evidence_set','payload_digest','payload_length','destination_ref','prepared_at','complete']) {
    assert(manifest?.required.includes(field), 'Handoff manifest binding missing: ' + field);
  }
  assert.equal(manifest.additionalProperties, false, 'Manifest must reject unknown fields');
  assert.equal(manifest.properties.complete.const, true, 'Incomplete manifest cannot authorize handoff');
  assert.deepEqual(s.HandoffEvidence.oneOf.map(x => x.$ref), ['#/components/schemas/DocumentHandoffEvidence','#/components/schemas/OperationalHandoffEvidence'], 'Full mixed evidence kinds required');
  for (const field of ['entity_kind','entity_id','entity_revision','observation_revision','observed_at','entity_digest','project_id']) assert(s.OperationalHandoffEvidence.required.includes(field), 'Operational evidence binding missing: ' + field);
  for (const field of ['document_id','version_id','passage_id','permission_revision','lifecycle_revision','version_digest','excerpt_digest']) assert(s.DocumentHandoffEvidence.required.includes(field), 'Document evidence binding missing: ' + field);
  for (const field of ['manifest','manifest_bytes_base64','manifest_digest','durable_commit_ref']) assert(s.StoredHandoff.required.includes(field), 'Durable preparation receipt missing: ' + field);
  const provider = Boolean(api.paths['/internal/guards/provider-input']);
  const envelope = provider ? s.ProviderInput : s.InternalQuestionResult;
  assert(envelope.required.includes('handoff') && envelope.required.includes('payload_bytes_base64'), 'Frozen transport lacks mandatory manifest binding');
  const purpose = provider ? 'provider_input' : 'answer_delivery';
  const wrapper = provider ? 'ProviderHandoff' : 'AnswerHandoff';
  assert.equal(envelope.properties.handoff.$ref, '#/components/schemas/' + wrapper, 'Wrong purpose wrapper');
  assert.equal(s[wrapper].allOf[1].properties.manifest.properties.purpose.const, purpose, 'Cross-purpose handoff must reject');
  assert.equal(envelope.additionalProperties, false, 'Legacy or unknown handoff fields must reject');
  if (!provider) {
    for (const name of ['operational_entity_ids','source_revision']) assert(!(name in envelope.properties), 'Bare evidence cannot substitute for full manifest');
    assert.equal(api.paths['/internal/handoffs/{handoff_id}']?.get.operationId, 'getHandoffManifest', 'Authoritative manifest lookup missing');
  }
  assert(Array.isArray(contracts) && contracts.length >= 2, 'Handoff validation needs both contracts');
  for (const other of contracts.filter(x => x !== api)) for (const name of ['HandoffManifest','StoredHandoff','HandoffEvidence','DocumentHandoffEvidence','OperationalHandoffEvidence']) assert.deepEqual(s[name], other.components.schemas[name], 'Handoff schema drift between services: ' + name);
}

export function validateInspectionContracts(api) {
  const s = api.components.schemas;
  for (const name of ['Trace', 'RetrievalSummary']) {
    for (const field of ['query', 'retrieval_mode', 'ranked_sources', 'validation_outcomes']) assert(s[name].required.includes(field), 'Inspection evidence missing: ' + name + '.' + field);
    assert(!('source_ids' in s[name].properties), 'Bare source IDs cannot substitute for exact inspection locators');
  }
  assert(s.Trace.required.includes('tool_steps') && s.RetrievalSummary.required.includes('retrieval_steps'), 'Recorded inspection steps missing');
  assert(!('duration_ms' in s.Trace.properties), 'Legacy numeric-only duration cannot express missing telemetry');
  for (const [name, value, type] of [['DurationMetric', 'value_ms', 'number'], ['TokenUsageMetric', 'value_tokens', 'integer']]) {
    const variants = s[name]?.oneOf;
    assert.deepEqual(variants?.map(v => v.properties.state.const), ['measured', 'unavailable', 'not_performed'], 'Metric availability distinction missing');
    assert.equal(variants[0].properties[value]?.type, type, 'Measured metric value missing');
    assert.equal(variants[0].properties[value]?.minimum, 0, 'Measured metric cannot be negative');
    assert(variants[0].required.includes(value), 'Measured metric must supply its value');
    for (const v of variants) assert.equal(v.additionalProperties, false, 'Metric variants must reject fabricated extra values');
    for (const v of variants.slice(1)) assert.deepEqual(Object.keys(v.properties), ['state'], 'Unavailable metric must not contain a number');
  }
  assert.equal(s.Trace.properties.duration.$ref, '#/components/schemas/DurationMetric', 'Trace timing lacks availability');
  assert.equal(s.Trace.properties.usage.$ref, '#/components/schemas/TokenUsageMetric', 'Trace usage lacks availability');
  assert(s.Trace.required.includes('duration') && s.Trace.required.includes('usage'), 'Trace must explicitly label metric availability');
  assert.deepEqual(s.InspectionSource.oneOf.map(x => x.$ref), ['#/components/schemas/DocumentInspectionSource', '#/components/schemas/OperationalInspectionSource'], 'Inspection must bind both evidence kinds');
  for (const field of ['source_id','step_id','rank','document_id','version_id','passage_id']) assert(s.DocumentInspectionSource.required.includes(field), 'Exact document inspection binding missing: ' + field);
  for (const field of ['source_id','step_id','rank','entity_kind','entity_id','entity_revision','observation_revision','observed_at']) assert(s.OperationalInspectionSource.required.includes(field), 'Exact operational inspection binding missing: ' + field);
  assert.deepEqual(s.InspectionQuery.oneOf.map(v => v.properties.state.const), ['available','not_performed','unavailable'], 'Actual query disclosure state missing');
  assert.equal(s.InspectionQuery.oneOf[0].properties.text.type, 'string', 'Actual query text missing');
  for (const v of s.InspectionQuery.oneOf) assert.equal(v.additionalProperties, false, 'Query disclosure variants must reject extra text');
  for (const v of s.InspectionQuery.oneOf.slice(1)) assert.deepEqual(Object.keys(v.properties), ['state'], 'Undisclosed or unexecuted query must not contain text');
  const skipped = s.InspectionStep.allOf?.[0];
  assert.equal(skipped?.if?.properties.status.const, 'not_performed', 'Unexecuted inspection step constraints missing');
  for (const name of ['query','duration','usage']) assert.equal(skipped?.then?.properties[name].properties.state.const, 'not_performed', 'Unexecuted step cannot report query or measurements');
  assert(s.InspectionValidation.required.includes('check') && s.InspectionValidation.required.includes('status') && s.InspectionValidation.required.includes('source_id'), 'Validation outcome lacks source/check binding');
  assert.deepEqual(s.RetrievalSummary.properties.retrieval_steps.items.allOf[1].properties.stage.enum, ['keyword','semantic','operational','citation_validation'], 'Bounded summary includes full execution stages');
  assert.equal(api.paths['/knowledge/runs/{run_id}/summary'].get['x-release-priority'], 'Should', 'Optional summary must stay Should');
}

export function validateDocumentCommandContracts(api) {
  const s = api.components.schemas;
  const read = api.paths['/knowledge/projects/{project_id}/documents/{document_id}/command-precondition']?.get;
  assert.equal(read?.operationId, 'getDocumentCommandPrecondition', 'Independent command precondition read missing');
  for (const [name, fields] of [
    ['DocumentCommandPrecondition', ['document_id','target_action','version_id','precondition_token']],
    ['DocumentMutationReceipt', ['document_id','operation','receipt_id','version_id']],
  ]) {
    assert.equal(s[name]?.additionalProperties, false, 'Command projection must reject extra disclosure');
    assert.deepEqual(Object.keys(s[name].properties).sort(), fields.sort(), 'Command projection leaks content or revision metadata');
    assert.deepEqual([...s[name].required].sort(), fields.sort(), 'Command projection binding missing');
  }
  for (const name of ['Revise','EditMetadata']) {
    assert(s[name].properties.precondition_token, 'Independent writer lacks opaque precondition');
    assert.deepEqual(s[name].oneOf, [{required:['expected_revision'],not:{required:['precondition_token']}},{required:['precondition_token'],not:{required:['expected_revision']}}], 'Command must require exactly one concurrency precondition');
  }
  for (const [path, method, status] of [
    ['/knowledge/documents/{document_id}/versions','post','201'],
    ['/knowledge/documents/{document_id}/versions/{version_id}/archive','post','200'],
    ['/knowledge/documents/{document_id}/metadata','patch','200'],
  ]) assert.equal(api.paths[path][method].responses[status].content['application/json'].schema.$ref, '#/components/schemas/DocumentMutationReceipt', 'Independent command must not return protected content');
  const del = api.paths['/knowledge/documents/{document_id}'].delete;
  assert(del.parameters.some(p => p.name === 'X-Document-Precondition' && !p.required), 'Delete lacks independent precondition header');
  assert(!del.responses['204'].content, 'Deletion receipt must remain content-free');
  assert.equal(api.paths['/knowledge/documents/{document_id}/metadata'].patch['x-release-priority'], 'Could', 'Optional metadata edit must stay Could');
}

export function validateSpecOwnership(slices, apisByOwner) {
  const owners = new Map();
  for (const [owner, api] of Object.entries(apisByOwner)) {
    for (const item of Object.values(api.paths)) for (const operation of Object.values(item)) {
      if (operation?.operationId) owners.set(operation.operationId, owner);
    }
  }
  for (const spec of slices) {
    const declared = ['both', 'knowledge + workspace'].includes(spec.service)
      ? ['knowledge', 'workspace'] : [spec.service];
    assert(declared.every(owner => owner in apisByOwner), 'Unknown spec service: ' + spec.id);
    for (const id of spec.operationIds) {
      assert(owners.has(id), 'Spec operation missing: ' + id);
      assert(declared.includes(owners.get(id)), `Spec operation ownership mismatch: ${spec.id} ${id} belongs to ${owners.get(id)}`);
    }
  }
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
  for (const api of apis) for (const id of validateApi(api, requirements, apis)) { assert(!operationIds.has(id), 'Operation ID reused across services'); operationIds.add(id); }
  const specIndex = await json('specs/index.json');
  validateSpecOwnership(specIndex.slices, { workspace: apis[0], knowledge: apis[1] });
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
