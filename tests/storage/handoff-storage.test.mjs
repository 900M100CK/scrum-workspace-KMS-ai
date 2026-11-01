import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { docker, image, migrate as migrateOwned, root, sql, waitReady } from '../../scripts/database.mjs';

// Retain this suite's original 006 Workspace schema snapshot. SP-02 suites exercise 007/008.
const migrate=(container,service,direction='up')=>migrateOwned(container,service,direction,service==='workspace'?{through:'006'}:{});

const container='kms-handoff-test-'+randomUUID();
const passwords=Object.fromEntries(['POSTGRES_PASSWORD','WORKSPACE_DB_PASSWORD','KNOWLEDGE_DB_PASSWORD'].map(key=>[key,randomBytes(32).toString('hex')]));
const id=n=>`10000000-0000-4000-8000-${n.toString(16).padStart(12,'0')}`;
const literal=value=>"'"+String(value).replaceAll("'","''")+"'";
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const run=(service,input,allowFailure=false)=>sql(container,service,input,{runtime:true,password:passwords[service.toUpperCase()+'_DB_PASSWORD'],allowFailure});
const value=(service,input)=>run(service,input).stdout.trim();
const reject=(service,input,code)=>{const result=run(service,input,true);assert.notEqual(result.status,0);assert.match(result.stderr,new RegExp(code));};
const rawMigration=(service,name,direction='up')=>readFileSync(resolve(root,`services/${service}/migrations/${name}.${direction}.sql`),'utf8');
const claim=(key,digest='a'.repeat(64),process=id(5))=>`SELECT workspace.claim_protected_handoff('${id(2)}',${literal(key)},'${digest}','${process}');`;
function manifest(handoff='h-1',purpose='provider_input') {
  return {handoff_id:handoff,run_id:id(1),attempt_id:'attempt-'+handoff,purpose,actor_id:id(2),project_id:id(3),access_context_ref:'synthetic-context',session_generation:'1',project_permission_revision:'2',
    evidence_set:[{kind:'document',source_id:'doc-1',project_id:id(3),document_id:id(10),version_id:id(11),passage_id:id(12),permission_revision:'1',lifecycle_revision:'2',version_digest:'a'.repeat(64),excerpt_digest:'b'.repeat(64)},
      {kind:'operational',source_id:'task-1',project_id:id(3),entity_kind:'task',entity_id:id(13),entity_revision:'3',observation_revision:1,observed_at:'2026-10-18T09:00:00Z',entity_digest:'c'.repeat(64)}],
    payload_digest:'d'.repeat(64),payload_length:100,destination_ref:'immutable-destination',prepared_at:'2026-10-18T09:00:00Z',complete:true};
}
function insertManifest(record,bytes=Buffer.from(JSON.stringify(record)),overrides={}) {
  return `INSERT INTO knowledge.handoff_manifest(handoff_id,run_id,actor_id,project_id,manifest,manifest_bytes) VALUES
    (${literal(overrides.handoff??record.handoff_id)},'${overrides.run??id(1)}','${overrides.actor??id(2)}','${overrides.project??id(3)}',${literal(JSON.stringify(record))}::jsonb,decode('${bytes.toString('hex')}','hex'));`;
}
function concurrentSql(input) {
  return new Promise((resolveResult,rejectResult)=>{
    const child=spawn('docker',['exec','-i','-e','PGPASSWORD',container,'psql','-X','-q','-A','-t','--set','ON_ERROR_STOP=1','-h','127.0.0.1','-U','workspace_app','-d','workspace_db'],{env:{...process.env,PGPASSWORD:passwords.WORKSPACE_DB_PASSWORD},windowsHide:true});
    let output='',error='';
    const timeout=setTimeout(()=>{child.kill();rejectResult(new Error('Synthetic concurrent claim timed out'));},15000);
    child.stdout.on('data',data=>{output+=data;});child.stderr.on('data',data=>{error+=data;});
    child.on('error',reason=>{clearTimeout(timeout);rejectResult(reason);});
    child.on('close',code=>{clearTimeout(timeout);code===0?resolveResult(output.trim()):rejectResult(new Error(error.replaceAll(passwords.WORKSPACE_DB_PASSWORD,'[redacted]')));});
    child.stdin.end(input);
  });
}

test('isolated immutable handoff preparation and protected claim storage',{timeout:300000},async t=>{
  let started=false;
  try {
    docker(['run','-d','--rm','--name',container,'-e','POSTGRES_PASSWORD','-e','WORKSPACE_DB_PASSWORD','-e','KNOWLEDGE_DB_PASSWORD','-e','POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256',
      '-v',`${resolve(root,'infra/postgres/bootstrap.sh')}:/docker-entrypoint-initdb.d/10-bootstrap.sh:ro`,'-v',`${resolve(root,'infra/postgres/bootstrap.sql')}:/bootstrap.sql:ro`,image],{env:passwords,timeout:180000});
    started=true;await waitReady(container);
    await t.test('all owned migrations apply, repeat and reverse while protected stores are empty',()=>{
      for(const service of ['workspace','knowledge']) {
        migrate(container,service);migrate(container,service);
        assert.equal(sql(container,service,'SELECT count(*) FROM _migrations.applied;').stdout.trim(),service==='workspace'?'6':'3');
        migrate(container,service,'down');migrate(container,service);
      }
      run('knowledge',`INSERT INTO knowledge.execution(run_id,actor_id,project_id) VALUES ('${id(1)}','${id(2)}','${id(3)}');`);
    });
    await t.test('complete raw manifests persist immutable exact SHA-256 and receipt identity',()=>{
      const record=manifest(),bytes=Buffer.from(JSON.stringify(record,null,2)+'\n');
      run('knowledge',insertManifest(record,bytes));
      assert.equal(value('knowledge',"SELECT manifest_digest FROM knowledge.handoff_manifest WHERE handoff_id='h-1';"),hash(bytes));
      assert.equal(value('knowledge',"SELECT octet_length(manifest_bytes) FROM knowledge.handoff_manifest WHERE handoff_id='h-1';"),String(bytes.length));
      assert.match(value('knowledge',"SELECT durable_commit_ref FROM knowledge.handoff_manifest WHERE handoff_id='h-1';"),/^[a-f0-9-]{36}$/);
      reject('knowledge',insertManifest(record),'23505');
      reject('knowledge',`UPDATE knowledge.execution SET actor_id='${id(4)}' WHERE run_id='${id(1)}';`,'23503');
    });
    await t.test('missing, extra, null, malformed or conflicting evidence and typed bytes fail atomically',()=>{
      const changes=[r=>{delete r.access_context_ref;},r=>{r.content='hidden';},r=>{r.complete=false;},r=>{r.complete=null;},r=>{r.payload_length=0.5;},r=>{r.actor_id=id(4);},r=>{r.evidence_set[0].project_id=id(4);},r=>r.evidence_set.push({...r.evidence_set[0]}),r=>{r.evidence_set[1].entity_revision='0';},r=>{r.evidence_set[1].observation_revision=null;},r=>{r.evidence_set[0].excerpt='hidden';},r=>{r.evidence_set[1].observed_at='today';}];
      for(const change of changes){const record=manifest('invalid');change(record);reject('knowledge',insertManifest(record),'23514');}
      const record=manifest('invalid');
      reject('knowledge',insertManifest(record,Buffer.from(JSON.stringify({...record,attempt_id:'different'}))),'23514');
      const duplicate=Buffer.from(JSON.stringify(record).replace('"handoff_id":"invalid"','"handoff_id":"invalid","h\\u0061ndoff_id":"invalid"'));
      reject('knowledge',insertManifest(record,duplicate),'23514');
      reject('knowledge',insertManifest(record,Buffer.from([0xff,0xfe])),'23514');
      reject('knowledge',insertManifest(record,undefined,{run:id(99)}),'23514|23503');
      assert.equal(value('knowledge',"SELECT count(*) FROM knowledge.handoff_manifest WHERE handoff_id='invalid';"),'0');
    });
    await t.test('manifest and outcome rollback/append-only rights preserve committed preparation',()=>{
      run('knowledge',`BEGIN; ${insertManifest(manifest('rolled-back'))} ROLLBACK;`);
      assert.equal(value('knowledge',"SELECT count(*) FROM knowledge.handoff_manifest WHERE handoff_id='rolled-back';"),'0');
      for(const statement of ["UPDATE knowledge.handoff_manifest SET durable_commit_ref=gen_random_uuid();","DELETE FROM knowledge.handoff_manifest;","TRUNCATE knowledge.handoff_manifest CASCADE;"])reject('knowledge',statement,'42501');
      assert.throws(()=>sql(container,'knowledge',"SET ROLE knowledge_owner; UPDATE knowledge.handoff_manifest SET durable_commit_ref=gen_random_uuid();"),/append-only/);
      reject('knowledge',"INSERT INTO knowledge.handoff_outcome(handoff_id,status,enforcement_ref) VALUES ('missing','unknown','synthetic');",'23503');
      reject('knowledge',"INSERT INTO knowledge.handoff_outcome(handoff_id,status,enforcement_ref) VALUES ('h-1','prepared','synthetic');",'23514');
      run('knowledge',"INSERT INTO knowledge.handoff_outcome(handoff_id,status,enforcement_ref) VALUES ('h-1','unknown','synthetic'),('h-1','completed','reconciled');");
      reject('knowledge',"UPDATE knowledge.handoff_outcome SET status='aborted';",'42501');
      reject('knowledge',"DELETE FROM knowledge.handoff_outcome;",'42501');
    });
    await t.test('both purposes and empty-evidence preparation are stored without claiming transmission',()=>{
      const record=manifest('answer-1','answer_delivery');record.evidence_set=[];run('knowledge',insertManifest(record));
      assert.equal(value('knowledge',"SELECT manifest->>'purpose' FROM knowledge.handoff_manifest WHERE handoff_id='answer-1';"),'answer_delivery');
      assert.equal(value('knowledge',"SELECT count(*) FROM knowledge.handoff_outcome WHERE handoff_id='answer-1';"),'0');
    });
    await t.test('fresh protected claims persist permanent fences; duplicates return none and ordinary idempotency stays separate',()=>{
      const fence=value('workspace',claim('h-1'));assert.match(fence,/^[a-f0-9-]{36}$/);
      for(const query of [claim('h-1'),claim('h-1','b'.repeat(64)),claim('h-1','a'.repeat(64),id(6))])assert.equal(value('workspace',query),'');
      assert.equal(value('workspace',"SELECT expires_at::text || ':' || state FROM workspace.idempotency_record WHERE operation='protected_handoff' AND idempotency_key='h-1';"),'infinity:pending');
      for(const set of ["expires_at=clock_timestamp()","state='failed'","claim_fence=gen_random_uuid()","operation='ordinary'"])reject('workspace',`UPDATE workspace.idempotency_record SET ${set} WHERE operation='protected_handoff';`,'23514');
      reject('workspace',"DELETE FROM workspace.idempotency_record WHERE operation='protected_handoff';",'42501');
      run('workspace',`INSERT INTO workspace.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,expires_at) VALUES ('${id(2)}','ordinary','key','hash','pending',clock_timestamp()); UPDATE workspace.idempotency_record SET state='committed' WHERE operation='ordinary';`);
      assert.equal(value('workspace',"SELECT state FROM workspace.idempotency_record WHERE operation='ordinary';"),'committed');
      run('workspace',`BEGIN; ${claim('rolled-back')} ROLLBACK;`);
      assert.match(value('workspace',claim('rolled-back')),/^[a-f0-9-]{36}$/);
    });
    await t.test('concurrent duplicate claims produce exactly one newly committed fence',async()=>{
      const results=await Promise.all([concurrentSql(`BEGIN; ${claim('race')} SELECT pg_sleep(1); COMMIT;`),concurrentSql(claim('race'))]);
      const fences=results.flatMap(result=>result.split(/\r?\n/).filter(row=>/^[a-f0-9-]{36}$/.test(row)));
      assert.equal(fences.length,1);
      assert.equal(value('workspace',"SELECT count(*) FROM workspace.idempotency_record WHERE operation='protected_handoff' AND idempotency_key='race';"),'1');
    });
    await t.test('Workspace outcomes bind the exact consumed fence and never enable replay',()=>{
      const fence=value('workspace',"SELECT claim_fence FROM workspace.idempotency_record WHERE operation='protected_handoff' AND idempotency_key='h-1';");
      const insert=f=>`INSERT INTO workspace.protected_handoff_outcome(actor_id,handoff_id,claim_fence,status,enforcement_ref) VALUES ('${id(2)}','h-1','${f}','unknown','synthetic');`;
      reject('workspace',insert(id(99)),'23503');run('workspace',insert(fence));
      reject('workspace',"UPDATE workspace.protected_handoff_outcome SET status='completed';",'42501');
      reject('workspace',"DELETE FROM workspace.protected_handoff_outcome;",'42501');
      assert.equal(value('workspace',claim('h-1')),'');
    });
    await t.test('nonempty reverse migrations refuse to erase evidence or consumed claim identities',()=>{
      for(const [service,name,message]of [['knowledge','003-handoff-store',/Nonempty handoff/],['workspace','004-protected-claims',/Consumed handoff/]])assert.throws(()=>sql(container,service,`BEGIN; SET LOCAL ROLE ${service}_owner; ${rawMigration(service,name,'down')} COMMIT;`),message);
      assert.equal(value('knowledge',"SELECT count(*) FROM knowledge.handoff_manifest WHERE handoff_id='h-1';"),'1');
      assert.equal(value('workspace',claim('h-1')),'');
    });
    await t.test('legacy reserved idempotency upgrade fails without inventing a fence or deleting the row',()=>{
      // Only this test's uniquely named disposable database is rebuilt here.
      sql(container,'workspace',`BEGIN; SET LOCAL ROLE workspace_owner; DROP SCHEMA workspace CASCADE;
        ${rawMigration('workspace','001-store')} ${rawMigration('workspace','002-registered-policy')} ${rawMigration('workspace','003-work-location')}
        INSERT INTO workspace.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,expires_at) VALUES ('${id(2)}','protected_handoff','legacy','old-hash','pending','2026-10-01'); COMMIT;`);
      assert.throws(()=>sql(container,'workspace',`BEGIN; SET LOCAL ROLE workspace_owner; ${rawMigration('workspace','004-protected-claims')} COMMIT;`),/Legacy protected handoff/);
      assert.equal(value('workspace',"SELECT payload_hash FROM workspace.idempotency_record WHERE idempotency_key='legacy';"),'old-hash');
      assert.equal(value('workspace',"SELECT count(*) FROM information_schema.columns WHERE table_schema='workspace' AND table_name='idempotency_record' AND column_name='claim_fence';"),'0');
    });
  } finally {if(started)docker(['stop','--time','2',container]);}
});
