import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { docker, image, migrate, root, sql, waitReady } from '../../scripts/database.mjs';
import { loadContractSchemas } from '../../scripts/contract-schemas.mjs';
import { sha256, verifyHandoffBytes } from '../../scripts/contracts/verify-handoff-bytes.mjs';

const {validators}=await loadContractSchemas('knowledge');
const container='kms-receipt-test-'+randomUUID();
const passwords=Object.fromEntries(['POSTGRES_PASSWORD','WORKSPACE_DB_PASSWORD','KNOWLEDGE_DB_PASSWORD'].map(key=>[key,randomBytes(32).toString('hex')]));
const id=n=>`20000000-0000-4000-8000-${n.toString(16).padStart(12,'0')}`;
const literal=value=>value===null?'NULL':"'"+String(value).replaceAll("'","''")+"'";
const query=readFileSync(resolve(root,'services/knowledge/queries/get-handoff-manifest.sql'),'utf8');
const runtime=(service,input)=>sql(container,service,input,{runtime:true,password:passwords[service.toUpperCase()+'_DB_PASSWORD']}).stdout.trim();
const scope=handoff=>[handoff,id(2),id(3),id(1),'synthetic-session-context','1','2'];
const read=(selectors)=>runtime('knowledge',`PREPARE receipt_lookup(text,uuid,uuid,uuid,text,text,text) AS ${query}
  EXECUTE receipt_lookup(${selectors.map(literal).join(',')});`);
function fixture(handoff,purpose='answer_delivery') {
  const answer={status:'answered',run_id:id(1),claims:[{kind:'fact',text:'Synthetic café 😀 claim; binding only',source_ids:['doc-1']}],citations:[{kind:'document',source_id:'doc-1',document_id:id(10),version_id:id(11),passage_id:id(12)}]};
  const payload=Buffer.from(JSON.stringify(purpose==='answer_delivery'?answer:{synthetic_wire:'actual provider adapter still required'}));
  const evidence=[{kind:'document',source_id:'doc-1',project_id:id(3),document_id:id(10),version_id:id(11),passage_id:id(12),permission_revision:'1',lifecycle_revision:'2',version_digest:'a'.repeat(64),excerpt_digest:'b'.repeat(64)},
    {kind:'operational',source_id:'task-1',project_id:id(3),entity_kind:'task',entity_id:id(13),entity_revision:'3',observation_revision:1,observed_at:'2026-10-18T10:00:00Z',entity_digest:'c'.repeat(64)}];
  const manifest={handoff_id:handoff,run_id:id(1),attempt_id:'attempt-café-😀-'+handoff,purpose,actor_id:id(2),project_id:id(3),access_context_ref:'synthetic-session-context',session_generation:'1',project_permission_revision:'2',evidence_set:evidence,payload_digest:sha256(payload),payload_length:payload.length,destination_ref:'synthetic-immutable-destination',prepared_at:'2026-10-18T10:00:00Z',complete:true};
  return {manifest,payload,answer,bytes:Buffer.from(JSON.stringify(manifest,null,2)+'\n')};
}
function insert(record,raw=record.bytes) {
  const rawText=raw.toString('utf8');
  return `INSERT INTO knowledge.handoff_manifest(handoff_id,run_id,actor_id,project_id,manifest,manifest_bytes) VALUES
    (${literal(record.manifest.handoff_id)},'${id(1)}','${id(2)}','${id(3)}',${literal(rawText)}::jsonb,decode('${raw.toString('hex')}','hex'));`;
}
function check(record,receipt,suppliedOverride) {
  const keys=['handoff_id','run_id','attempt_id','purpose','actor_id','project_id','access_context_ref','session_generation','project_permission_revision','destination_ref'];
  const supplied={manifest:record.manifest,manifest_bytes_base64:record.bytes.toString('base64'),manifest_digest:sha256(record.bytes),durable_commit_ref:receipt.durable_commit_ref};
  return verifyHandoffBytes({receipt:suppliedOverride??supplied,authoritativeReceipt:receipt,expectedIdentity:Object.fromEntries(keys.map(key=>[key,record.manifest[key]])),capturedEvidence:record.manifest.evidence_set,payloadBytesBase64:record.payload.toString('base64'),typedAnswer:record.answer,validators,limits:{manifestBytes:20000,payloadBytes:20000}});
}
function startUncommittedWriter(input) {
  const application='receipt-visibility-'+randomUUID();
  const child=spawn('docker',['exec','-i','-e','PGPASSWORD','-e','PGAPPNAME',container,'psql','-X','-q','-A','-t','--set','ON_ERROR_STOP=1','-h','127.0.0.1','-U','knowledge_app','-d','knowledge_db'],{env:{...process.env,PGPASSWORD:passwords.KNOWLEDGE_DB_PASSWORD,PGAPPNAME:application},windowsHide:true,stdio:['pipe','ignore','pipe']});
  let error='';child.stderr.on('data',chunk=>{error+=chunk;});
  const result=new Promise(resolveResult=>{
    const timeout=setTimeout(()=>{child.kill();resolveResult({code:-2,error:'Writer timeout'});},15000);
    child.on('error',()=>{clearTimeout(timeout);resolveResult({code:-1,error:'Writer process failed'});});
    child.on('close',code=>{clearTimeout(timeout);resolveResult({code,error:error.replaceAll(passwords.KNOWLEDGE_DB_PASSWORD,'[redacted]')});});
  });
  child.stdin.end(`BEGIN; ${input} SELECT pg_advisory_xact_lock(782013); SELECT pg_sleep(30); COMMIT;`);
  return {application,child,result};
}

test('optional SQL-to-StoredHandoff byte reference integration',{timeout:180000},async t=>{
  let started=false;
  try {
    docker(['run','-d','--rm','--name',container,'-e','POSTGRES_PASSWORD','-e','WORKSPACE_DB_PASSWORD','-e','KNOWLEDGE_DB_PASSWORD','-e','POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256',
      '-v',`${resolve(root,'infra/postgres/bootstrap.sh')}:/docker-entrypoint-initdb.d/10-bootstrap.sh:ro`,'-v',`${resolve(root,'infra/postgres/bootstrap.sql')}:/bootstrap.sql:ro`,image],{env:passwords,timeout:180000});
    started=true;await waitReady(container);
    for(const service of ['knowledge','workspace'])migrate(container,service);
    runtime('knowledge',`INSERT INTO knowledge.execution(run_id,actor_id,project_id) VALUES ('${id(1)}','${id(2)}','${id(3)}');`);
    await t.test('both purposes project canonical base64 and preserve raw Unicode/whitespace bytes',()=>{
      for(const purpose of ['provider_input','answer_delivery']) {
        const record=fixture(purpose,purpose);runtime('knowledge',insert(record));
        const receipt=JSON.parse(read(scope(purpose)));
        assert.equal(validators.get('StoredHandoff')(receipt),true);
        assert(!/\s/.test(receipt.manifest_bytes_base64));
        assert.deepEqual(Buffer.from(receipt.manifest_bytes_base64,'base64'),record.bytes);
        assert.equal(receipt.manifest_digest,sha256(record.bytes));
        assert.notEqual(JSON.stringify(receipt.manifest),record.bytes.toString('utf8'));
        assert.equal(check(record,receipt).bindingOnly,true);
        assert.equal(check(record,receipt).providerWireMappingRequired,purpose==='provider_input');
      }
    });
    await t.test('every mismatched or missing trusted selector withholds the preparation row',()=>{
      for(let index=0;index<7;index++) {
        const mismatch=scope('answer_delivery');mismatch[index]=index>=1&&index<=3?id(99):'different';
        assert.equal(read(mismatch),'');
        const missing=scope('answer_delivery');missing[index]=null;assert.equal(read(missing),'');
      }
    });
    await t.test('native wrapped base64 and JSON reserialization cannot replace frozen receipt bytes',()=>{
      const record=fixture('answer_delivery'),receipt=JSON.parse(read(scope('answer_delivery')));
      const native=runtime('knowledge',"SELECT encode(manifest_bytes,'base64') FROM knowledge.handoff_manifest WHERE handoff_id='answer_delivery';");
      assert(native.includes('\n'),'Fixture must expose PostgreSQL base64 wrapping');
      const wrapped={...receipt,manifest_bytes_base64:native};
      assert.throws(()=>check(record,wrapped,wrapped),/canonical base64/);
      const normalized={...receipt,manifest_bytes_base64:Buffer.from(JSON.stringify(receipt.manifest)).toString('base64')};
      assert.throws(()=>check(record,normalized,normalized),/Manifest byte digest/);
    });
    await t.test('reading a consumed preparation is not a second send claim',()=>{
      const args=`'${id(2)}','answer_delivery','${'a'.repeat(64)}','${id(5)}'`;
      assert.match(runtime('workspace',`SELECT workspace.claim_protected_handoff(${args});`),/^[a-f0-9-]{36}$/);
      assert.equal(runtime('workspace',`SELECT workspace.claim_protected_handoff(${args});`),'');
      const receipt=JSON.parse(read(scope('answer_delivery')));assert.equal(check(fixture('answer_delivery'),receipt).bindingOnly,true);
    });
    await t.test('a separate lookup cannot observe preparation before commit or after cancelled rollback',async()=>{
      const record=fixture('uncommitted'),writer=startUncommittedWriter(insert(record));
      let pid='';
      try {
        const deadline=Date.now()+6000;
        while(Date.now()<deadline&&!pid) {
          pid=sql(container,'knowledge',`SELECT a.pid FROM pg_stat_activity a JOIN pg_locks l ON l.pid=a.pid WHERE a.application_name=${literal(writer.application)} AND l.locktype='advisory' AND l.granted LIMIT 1;`).stdout.trim();
          if(!pid)await new Promise(resolveWait=>setTimeout(resolveWait,100));
        }
        assert.match(pid,/^\d+$/,'Writer must hold the lock reached after insert');
        assert.equal(read(scope('uncommitted')),'');
        sql(container,'knowledge',`SELECT pg_cancel_backend(${pid});`);
        const result=await writer.result;assert.notEqual(result.code,0);assert.match(result.error,/canceling statement/);
        assert.equal(read(scope('uncommitted')),'');
      } finally {
        if(pid)sql(container,'knowledge',`SELECT pg_cancel_backend(${pid});`,{allowFailure:true});
        writer.child.kill();await writer.result;
      }
    });
    await t.test('exact SQL large integers cannot become accepted rounded JavaScript receipts',()=>{
      const record=fixture('unsafe-number');
      const raw=Buffer.from(record.bytes.toString('utf8').replace('"observation_revision": 1','"observation_revision": 9007199254740993'));
      runtime('knowledge',insert(record,raw));
      const receipt=JSON.parse(read(scope('unsafe-number')));
      const rounded={...record,manifest:JSON.parse(raw.toString('utf8')),bytes:raw};
      assert.throws(()=>check(rounded,receipt),/exact safe integer/);
    });
  } finally {if(started)docker(['stop','--time','2',container]);}
});
