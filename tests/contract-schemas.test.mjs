import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContractSchemas, compileContractSchemas, loadOpenApiStructureValidator } from '../scripts/contract-schemas.mjs';

const knowledge = await loadContractSchemas('knowledge');
const workspace = await loadContractSchemas('workspace');
const openApiStructure = await loadOpenApiStructureValidator();
const token = 'pc_' + 'a'.repeat(43);
const timestamp = '2026-10-18T06:00:00Z';
const digest = 'a'.repeat(64);
const copy = value => structuredClone(value);
function expect(service, name, data, valid) {
  const validate = service.validators.get(name);
  const original = copy(data);
  assert.equal(validate(data), valid, name + ': ' + JSON.stringify(validate.errors));
  assert.deepEqual(data, original, 'Validation must not repair or mutate payloads');
}

test('both complete contract documents pass the pinned OpenAPI 3.1 structure check', () => {
  for (const {api} of [knowledge,workspace]) {
    const original=copy(api);
    assert.equal(openApiStructure(api),true,JSON.stringify(openApiStructure.errors?.slice(0,5)));
    assert.deepEqual(api,original);
  }
});

test('document structure validator calibrates valid schemas and rejects malformed API objects', () => {
  const api={openapi:'3.1.1',info:{title:'Synthetic',version:'0.1'},paths:{'/x':{get:{responses:{200:{description:'OK',content:{'application/json':{schema:{type:'string'}}}}}}}}};
  assert.equal(openApiStructure(api),true);
  for (const mutate of [value=>delete value.info.title, value=>delete value.paths['/x'].get.responses[200].description, value=>{value.paths['/x'].get.responses={wrong:{description:'invalid status'}};}, value=>{value.paths['/x'].get.parameters=[{name:'id',in:'path',required:false,schema:{type:'string'}}];}, value=>{value.paths['/x'].get.unrecognized=true;}]) {
    const changed=copy(api);mutate(changed);assert.equal(openApiStructure(changed),false,'Malformed document must fail');
  }
  // The plain structure schema intentionally treats Schema Objects as opaque.
  // Component compilation/example tests are separate; neither proves runtime behavior.
});

test('all named component schemas compile using JSON Schema 2020-12', () => {
  for (const service of [knowledge, workspace]) for (const [name, validate] of service.validators) assert.equal(typeof validate, 'function', name);
});

test('inline parameter, body and response schemas also compile without network resolution', () => {
  for (const service of [knowledge,workspace]) {
    assert(service.inlineValidators.size > 0);
    for (const [pointer,validate] of service.inlineValidators) assert.equal(typeof validate,'function',pointer);
  }
});

test('malformed inline schemas fail compilation while example data stays opaque', () => {
  const api=copy(workspace.api);
  api.paths['/projects'].get.parameters[0].schema.type='not-a-json-schema-type';
  assert.throws(()=>compileContractSchemas(api,'invalid-inline'), /schema is invalid/);
  const example=copy(workspace.api);
  example.paths['/projects'].get.responses['200'].content['application/json'].example={schema:{type:'arbitrary example data'}};
  const compiled=compileContractSchemas(example,'opaque-example');
  assert.equal(compiled.inlineValidators.size,workspace.inlineValidators.size);
});

test('metrics distinguish measured zero, unavailable and unexecuted without fabricated values', () => {
  for (const [name, field] of [['DurationMetric', 'value_ms'], ['TokenUsageMetric', 'value_tokens']]) {
    for (const value of [{state:'measured',[field]:0}, {state:'unavailable'}, {state:'not_performed'}]) expect(knowledge,name,value,true);
    for (const value of [{state:'measured'}, {state:'measured',[field]:-1}, {state:'measured',[field]:'0'}, {state:'unavailable',[field]:0}, {state:'not_performed',[field]:0}, {state:'unknown'}]) expect(knowledge,name,value,false);
  }
  expect(knowledge,'TokenUsageMetric',{state:'measured',value_tokens:0.5},false);
});

test('unexecuted inspection steps cannot carry queries, timing, usage or an error', () => {
  const step = {step_id:'step-1', display_order:1, stage:'semantic', status:'not_performed', query:{state:'not_performed'}, duration:{state:'not_performed'}, usage:{state:'not_performed'}, error_category:null};
  expect(knowledge,'InspectionStep',step,true);
  for (const patch of [{query:{state:'available',text:'synthetic'}}, {duration:{state:'measured',value_ms:0}}, {usage:{state:'unavailable'}}, {error_category:'timeout'}]) expect(knowledge,'InspectionStep',{...step,...patch},false);
  expect(knowledge,'InspectionStep',{...step,status:'failed',query:{state:'available',text:'synthetic'},duration:{state:'measured',value_ms:12},usage:{state:'unavailable'},error_category:'timeout'},true);
  expect(knowledge,'InspectionQuery',{state:'unavailable',text:'hidden'},false);
  expect(knowledge,'InspectionQuery',{state:'available',text:''},false);
});

test('inspection sources preserve exact document locators or operational observations', () => {
  const doc = {kind:'document',source_id:'src-1',step_id:'step-1',rank:1,project_id:'p',document_id:'d',version_id:'v',passage_id:'passage'};
  const operational = {kind:'operational',source_id:'src-2',step_id:'step-1',rank:2,project_id:'p',entity_kind:'task',entity_id:'t',entity_revision:'2',observation_revision:1,observed_at:timestamp};
  for (const value of [doc,operational]) {
    expect(knowledge,'InspectionSource',value,true);
    for (const key of Object.keys(value)) { const changed = copy(value); delete changed[key]; expect(knowledge,'InspectionSource',changed,false); }
    expect(knowledge,'InspectionSource',{...value,excerpt:'not in this projection'},false);
  }
  expect(knowledge,'InspectionSource',{...operational,observed_at:'yesterday'},false);
});

test('version action discovery requires the full parent locator and denies internal names', () => {
  const scope = {resource_kind:'version',project_id:'p',resource_id:null,document_id:'d',version_id:'v',allowed_operations:['getVersion']};
  expect(workspace,'AllowedActions',scope,true);
  for (const patch of [{project_id:null},{document_id:null},{version_id:null},{resource_id:'v'},{allowed_operations:['guardProviderInput']},{allowed_operations:['retireDocumentPolicy']},{allowed_operations:['nonexistent']},{allowed_operations:['getVersion','getVersion']}]) expect(workspace,'AllowedActions',{...scope,...patch},false);
  expect(workspace,'AllowedActions',{...scope,resource_kind:'document',resource_id:'d',document_id:null,version_id:null},true);
  expect(workspace,'AllowedActions',{...scope,resource_kind:'document'},false);
});

test('non-reading command preconditions are action-specific minimal projections', () => {
  const value = {document_id:'d',target_action:'reviseDocument',version_id:null,precondition_token:token};
  expect(knowledge,'DocumentCommandPrecondition',value,true);
  expect(knowledge,'DocumentCommandPrecondition',{...value,target_action:'archiveVersion',version_id:'v'},true);
  for (const patch of [{target_action:'archiveVersion'},{version_id:'v'},{precondition_token:'pc_short'},{current_revision:2},{content:'hidden'},{title:'hidden'},{target_action:'grantDocumentRead'}]) expect(knowledge,'DocumentCommandPrecondition',{...value,...patch},false);
});

test('document commands require exactly one valid concurrency selector', () => {
  for (const [name, base] of [['Revise',{content:'synthetic',content_format:'text'}], ['EditMetadata',{labels:['synthetic']}], ['DocumentCommandConcurrency',{}]]) {
    expect(knowledge,name,{...base,expected_revision:1},true);
    expect(knowledge,name,{...base,precondition_token:token},true);
    for (const patch of [{},{expected_revision:1,precondition_token:token},{expected_revision:'1'},{expected_revision:0},{precondition_token:'broken'},{precondition_token:token,role:'admin'}]) expect(knowledge,name,{...base,...patch},false);
  }
});

test('mutation receipts acknowledge only the command and applicable version identity', () => {
  const receipt = {document_id:'d',operation:'reviseDocument',receipt_id:'r',version_id:'new-v'};
  for (const operation of ['reviseDocument','archiveVersion']) expect(knowledge,'DocumentMutationReceipt',{...receipt,operation},true);
  expect(knowledge,'DocumentMutationReceipt',{...receipt,operation:'editDocumentMetadata',version_id:null},true);
  for (const patch of [{version_id:null},{operation:'editDocumentMetadata'},{operation:'deleteDocument'},{current_revision:2},{content:'hidden'},{title:'hidden'},{current_version_id:'hidden'}]) expect(knowledge,'DocumentMutationReceipt',{...receipt,...patch},false);
});

test('both transport purposes validate complete mixed-evidence manifest shape', () => {
  const document = {kind:'document',source_id:'src-1',project_id:'p',document_id:'d',version_id:'v',passage_id:'passage',permission_revision:'1',lifecycle_revision:'2',version_digest:digest,excerpt_digest:digest};
  const operational = {kind:'operational',source_id:'src-2',project_id:'p',entity_kind:'task',entity_id:'t',entity_revision:'3',observation_revision:1,observed_at:timestamp,entity_digest:digest};
  const manifest = {handoff_id:'h',run_id:'r',attempt_id:'a',purpose:'provider_input',actor_id:'synthetic',project_id:'p',access_context_ref:'ctx',session_generation:'1',project_permission_revision:'2',evidence_set:[document,operational],payload_digest:digest,payload_length:1,destination_ref:'configured-relay',prepared_at:timestamp,complete:true};
  for (const service of [knowledge,workspace]) {
    expect(service,'HandoffManifest',manifest,true);
    const stored = {manifest, manifest_bytes_base64:Buffer.from(JSON.stringify(manifest)).toString('base64'),manifest_digest:digest,durable_commit_ref:'synthetic-commit'};
    expect(service,'ProviderHandoff',stored,true);
    expect(service,'AnswerHandoff',stored,false);
    const answer = {...stored,manifest:{...manifest,purpose:'answer_delivery'}};
    expect(service,'AnswerHandoff',answer,true);
    expect(service,'ProviderHandoff',answer,false);
    for (const key of Object.keys(manifest)) { const changed=copy(manifest); delete changed[key]; expect(service,'HandoffManifest',changed,false); }
    for (const patch of [{complete:false},{payload_digest:'invalid'},{payload_length:-1},{prepared_at:'invalid'},{role:'admin'}]) expect(service,'HandoffManifest',{...manifest,...patch},false);
    for (const source of [document,operational]) for (const key of Object.keys(source)) {const changed=copy(source); delete changed[key]; expect(service,'HandoffManifest',{...manifest,evidence_set:[changed]},false);}
  }
  // These examples do not establish bytes/digest equality, full evidence capture,
  // durable persistence or an authoritative commit. Real adapters must do that.
});

test('work location alternatives stay separate and reorder revisions stay exact strings', () => {
  for (const value of [{kind:'backlog',position:'-0.5'},{kind:'sprint',sprint_id:'s'},{kind:'completed',sprint_id:'s'}]) expect(workspace,'WorkLocation',value,true);
  for (const value of [{kind:'backlog'},{kind:'backlog',position:1},{kind:'backlog',position:'1',sprint_id:'s'},{kind:'completed'}]) expect(workspace,'WorkLocation',value,false);
  expect(workspace,'Reorder',{task_ids:['t1','t2'],expected_revision:'9007199254740993'},true);
  for (const value of [{task_ids:['t','t'],expected_revision:'1'},{task_ids:['t'],expected_revision:1},{task_ids:['t'],expected_revision:'0'}]) expect(workspace,'Reorder',value,false);
  // A complete permutation and correct revision source require a real store/handler.
});
