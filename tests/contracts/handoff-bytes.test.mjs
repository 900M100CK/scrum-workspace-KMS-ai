import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContractSchemas } from '../../scripts/contract-schemas.mjs';
import { decodeCanonicalBase64, decodeManifestJson, sha256, verifyHandoffBytes } from '../../scripts/contracts/verify-handoff-bytes.mjs';

const {validators}=await loadContractSchemas('knowledge');
const base64=bytes=>Buffer.from(bytes).toString('base64');
// Synthetic test bounds only. No application/pilot request limit is selected.
const limits={manifestBytes:20000,payloadBytes:20000};
const copy=value=>structuredClone(value);
function fixture(purpose='answer_delivery') {
  const evidence=[
    {kind:'document',source_id:'doc-1',project_id:'p',document_id:'d',version_id:'v',passage_id:'passage',permission_revision:'1',lifecycle_revision:'2',version_digest:sha256(Buffer.from('Synthetic document')),excerpt_digest:sha256(Buffer.from('Synthetic excerpt'))},
    {kind:'operational',source_id:'task-1',project_id:'p',entity_kind:'task',entity_id:'t',entity_revision:'3',observation_revision:1,observed_at:'2026-10-18T08:00:00Z',entity_digest:sha256(Buffer.from('Synthetic task snapshot'))},
  ];
  const answer={status:'answered',run_id:'run-1',claims:[{kind:'fact',text:'Synthetic supported assertion for binding tests only',source_ids:['doc-1']}],citations:[{kind:'document',source_id:'doc-1',document_id:'d',version_id:'v',passage_id:'passage'}]};
  const payload=Buffer.from(JSON.stringify(purpose==='answer_delivery'?answer:{synthetic_wire:'adapter mapping is not tested'}));
  const manifest={handoff_id:'h-1',run_id:'run-1',attempt_id:'attempt-1',purpose,actor_id:'actor-1',project_id:'p',access_context_ref:'context-1',session_generation:'1',project_permission_revision:'2',evidence_set:copy(evidence),payload_digest:sha256(payload),payload_length:payload.length,destination_ref:purpose==='answer_delivery'?'response-channel-1':'configured-provider-1',prepared_at:'2026-10-18T08:00:00Z',complete:true};
  const bytes=Buffer.from(JSON.stringify(manifest));
  const receipt={manifest,manifest_bytes_base64:base64(bytes),manifest_digest:sha256(bytes),durable_commit_ref:'synthetic-committed-record'};
  const fields=['handoff_id','run_id','attempt_id','purpose','actor_id','project_id','access_context_ref','session_generation','project_permission_revision','destination_ref'];
  return {receipt,authoritativeReceipt:copy(receipt),expectedIdentity:Object.fromEntries(fields.map(key=>[key,manifest[key]])),capturedEvidence:evidence,payloadBytesBase64:base64(payload),typedAnswer:answer,validators,limits};
}
function refreshManifest(input,bytes=Buffer.from(JSON.stringify(input.receipt.manifest))) {
  input.receipt.manifest_bytes_base64=base64(bytes);
  input.receipt.manifest_digest=sha256(bytes);
  input.authoritativeReceipt=copy(input.receipt);
}
function refreshAnswer(input) {
  const payload=Buffer.from(JSON.stringify(input.typedAnswer));
  input.payloadBytesBase64=base64(payload);
  input.receipt.manifest.payload_length=payload.length;
  input.receipt.manifest.payload_digest=sha256(payload);
  refreshManifest(input);
}

test('strict base64 rejects permissive decoder inputs, nonzero padding bits and byte overrun',()=>{
  assert.deepEqual(decodeCanonicalBase64('AA==',1),Buffer.from([0]));
  for(const value of ['', 'AA', 'AA==\n', 'AB==', 'AA--', 'AAAA=', 'AAAA====', '!!!!']) assert.throws(()=>decodeCanonicalBase64(value,20));
  assert.throws(()=>decodeCanonicalBase64(base64('two'),2),/byte limit/);
  for(const max of [0,-1,Infinity,1.5,undefined]) assert.throws(()=>decodeCanonicalBase64('AA==',max),/byte limit/);
});

test('manifest JSON rejects duplicate decoded keys, malformed UTF-8 and trailing data',()=>{
  for(const text of ['{"x":1,"x":2}', '{"x":1,"\\u0078":2}', '{"nested":[{"x":1,"x":2}]}', '{}{}','{} trailing','{"x":}', '\ufeff{}','{"x":"\\ud800"}','{"\\udfff":1}']) assert.throws(()=>decodeManifestJson(base64(text),1000));
  assert.throws(()=>decodeManifestJson(base64(Buffer.from([0x7b,0x22,0x78,0x22,0x3a,0x22,0xc3,0x28,0x22,0x7d])),1000),/Invalid UTF-8/);
  const valid='{ "a":{"x":1}, "b":[{"x":2}], "emoji":"\\ud83d\\ude00" }\n';
  assert.deepEqual(decodeManifestJson(base64(valid),1000).value,{a:{x:1},b:[{x:2}],emoji:'😀'});
});

test('numeric revision/count parsing rejects rounding and accepts exact integer equivalents',()=>{
  for(const token of ['9007199254740992','9007199254740993','-9007199254740992','1.0000000000000001','0.1','1e99999','1e-99999']) assert.throws(()=>decodeManifestJson(base64('{"n":'+token+'}'),1000),/exact safe integer/);
  for(const token of ['0','-0','1.0','1e0','0.001e3','1000e-3','9007199254740991','-9007199254740991']) assert.equal(decodeManifestJson(base64('{"n":'+token+'}'),1000).value.n,JSON.parse(token));
});

test('native-serialized nested JSON survives the duplicate-key token walk unchanged',()=>{
  const values=[null,true,false,0,1,Number.MAX_SAFE_INTEGER,'braces { } [ ] , : and quotes " \\', '\u0000','café','😀',[],{}];
  for(let depth=0;depth<5;depth++) {
    const current=[...values];
    for(const value of current) {
      const nested={['key"\\:[]{},'+depth]:[value,{value}],other:{value}};
      const text=JSON.stringify(nested);
      assert.deepEqual(decodeManifestJson(base64(text),limits.manifestBytes).value,nested);
    }
    values.push({depth,items:[depth,'nested',{}]});
  }
});

test('both purposes bind exact bytes and full mixed evidence without granting send authority',()=>{
  for(const purpose of ['provider_input','answer_delivery']) {
    const result=verifyHandoffBytes(fixture(purpose));
    assert.equal(result.bindingOnly,true);assert.equal(result.evidenceCount,2);
    assert.equal(result.providerWireMappingRequired,purpose==='provider_input');
  }
});

test('authoritative receipt, identity and destination mismatches fail before any binding result',()=>{
  for(const field of Object.keys(fixture().expectedIdentity)) {
    const input=fixture();input.expectedIdentity[field]='different';
    assert.throws(()=>verifyHandoffBytes(input),/identity or destination/);
  }
  for(const field of ['durable_commit_ref','manifest_digest','manifest_bytes_base64']) {
    const input=fixture();input.authoritativeReceipt[field]='different';
    assert.throws(()=>verifyHandoffBytes(input),/shape|authoritative preparation/);
  }
  const missing=fixture();missing.authoritativeReceipt=undefined;
  assert.throws(()=>verifyHandoffBytes(missing),/StoredHandoff/);
});

test('manifest hashing preserves raw whitespace, order and Unicode bytes',()=>{
  const input=fixture();
  const pretty=Buffer.from(JSON.stringify(input.receipt.manifest,null,2)+'\n');
  input.receipt.manifest_bytes_base64=base64(pretty);input.authoritativeReceipt=copy(input.receipt);
  assert.throws(()=>verifyHandoffBytes(input),/Manifest byte digest/);
  refreshManifest(input,pretty);assert.equal(verifyHandoffBytes(input).bindingOnly,true);
  const reordered=Object.fromEntries(Object.entries(input.receipt.manifest).reverse());
  refreshManifest(input,Buffer.from(JSON.stringify(reordered)));assert.equal(verifyHandoffBytes(input).bindingOnly,true);
  const changed=Buffer.from(JSON.stringify({...input.receipt.manifest,attempt_id:'different'}));
  refreshManifest(input,changed);assert.throws(()=>verifyHandoffBytes(input),/typed manifest/);
  const unicode=fixture();unicode.receipt.manifest.attempt_id='café';unicode.expectedIdentity.attempt_id='café';refreshManifest(unicode);
  assert.equal(verifyHandoffBytes(unicode).bindingOnly,true);
  const decomposed=Buffer.from(JSON.stringify(unicode.receipt.manifest).replace('café','cafe\u0301'));
  refreshManifest(unicode,decomposed);assert.throws(()=>verifyHandoffBytes(unicode),/typed manifest/);
  const duplicate=fixture();
  const duplicateBytes=Buffer.from(JSON.stringify(duplicate.receipt.manifest).replace('"handoff_id":"h-1"','"handoff_id":"h-1","h\\u0061ndoff_id":"h-1"'));
  refreshManifest(duplicate,duplicateBytes);assert.throws(()=>verifyHandoffBytes(duplicate),/Duplicate decoded JSON/);
});

test('payload digest and byte count reject even semantically equivalent reserialization',()=>{
  for(const purpose of ['provider_input','answer_delivery']) {
    const input=fixture(purpose);
    input.payloadBytesBase64=base64(Buffer.concat([Buffer.from(input.payloadBytesBase64,'base64'),Buffer.from(' ')]));
    assert.throws(()=>verifyHandoffBytes(input),/Payload byte length or digest/);
    const wrongCount=fixture(purpose);wrongCount.receipt.manifest.payload_length++;refreshManifest(wrongCount);
    assert.throws(()=>verifyHandoffBytes(wrongCount),/Payload byte length or digest/);
  }
  const unicode=fixture();unicode.typedAnswer.claims[0].text='Synthetic 😀';refreshAnswer(unicode);
  unicode.receipt.manifest.payload_length=JSON.stringify(unicode.typedAnswer).length;refreshManifest(unicode);
  assert.throws(()=>verifyHandoffBytes(unicode),/Payload byte length or digest/);
});

test('uncited changed, omitted, duplicate and cross-project evidence cannot hide behind a valid document citation',()=>{
  for(const mutate of [
    input=>input.receipt.manifest.evidence_set.pop(),
    input=>input.receipt.manifest.evidence_set.push(copy(input.receipt.manifest.evidence_set[0])),
    input=>{input.capturedEvidence[1].entity_revision='4';},
    input=>{input.capturedEvidence[1].observed_at='2026-10-18T09:00:00Z';},
    input=>{input.capturedEvidence[1].entity_digest='b'.repeat(64);},
  ]){const input=fixture();mutate(input);refreshManifest(input);assert.throws(()=>verifyHandoffBytes(input),/evidence|Evidence/);}
  const cross=fixture();cross.receipt.manifest.evidence_set[1].project_id='other';cross.capturedEvidence=copy(cross.receipt.manifest.evidence_set);refreshManifest(cross);
  assert.throws(()=>verifyHandoffBytes(cross),/Cross-project/);
});

test('answer citations and claim references bind exact prepared source identities',()=>{
  for(const mutate of [
    input=>{input.typedAnswer.citations[0].version_id='other';},
    input=>{input.typedAnswer.citations[0].source_id='invented';},
    input=>input.typedAnswer.citations.push(copy(input.typedAnswer.citations[0])),
    input=>{input.typedAnswer.claims[0].source_ids=['task-1'];},
    input=>{input.typedAnswer.run_id='other';},
  ]){const input=fixture();mutate(input);refreshAnswer(input);assert.throws(()=>verifyHandoffBytes(input),/Citation|citation|typed result or run/);}
  const operational=fixture();operational.typedAnswer.citations=[{kind:'operational',source_id:'task-1',entity_kind:'task',entity_id:'t',observation_revision:1,observed_at:'2026-10-18T08:00:00Z'}];operational.typedAnswer.claims[0].source_ids=['task-1'];refreshAnswer(operational);
  assert.equal(verifyHandoffBytes(operational).bindingOnly,true);
  operational.typedAnswer.citations[0].observed_at='2026-10-18T09:00:00Z';refreshAnswer(operational);
  assert.throws(()=>verifyHandoffBytes(operational),/Citation locator/);
});

test('typed/byte disagreement and numeric precision loss are rejected despite valid schema shapes',()=>{
  const answer=fixture();answer.typedAnswer.claims[0].text='different typed result';
  assert.throws(()=>verifyHandoffBytes(answer),/typed result/);
  const unsafe=fixture();unsafe.receipt.manifest.evidence_set[1].observation_revision=9007199254740992;unsafe.capturedEvidence=copy(unsafe.receipt.manifest.evidence_set);refreshManifest(unsafe);
  assert.throws(()=>verifyHandoffBytes(unsafe),/exact safe integer/);
});

test('zero-evidence insufficiency retains exact no-answer state without fabricated sources',()=>{
  const input=fixture();input.typedAnswer={status:'insufficient_evidence',run_id:'run-1',message:'Insufficient evidence'};
  input.capturedEvidence=[];input.receipt.manifest.evidence_set=[];refreshAnswer(input);
  assert.equal(verifyHandoffBytes(input).evidenceCount,0);
});
