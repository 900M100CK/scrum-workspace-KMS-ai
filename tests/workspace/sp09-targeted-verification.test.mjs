import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
import {createServer as createHttp} from 'node:http';
import {resolve} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {taskFixture} from './task-fixture.mjs';
import {knowledgeFixture} from '../knowledge/knowledge-fixture.mjs';
import {configuration, model, syntheticExcerpts, adversarial} from '../../services/knowledge/src/questions/fixture.ts';
import {freePort, service} from './question-runtime-fixture.mjs';

const paraphrase = 'At what hour can we arrive?';
async function provider(t) {
  const received = [];
  let mode = 'ok', pause, referenceDocumentId;
  const server = createHttp(async (request, reply) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString('utf8');
    const input = JSON.parse(body);
    received.push({body, input});
    if (mode === 'connection') return reply.destroy();
    if (pause) {
      const gate = pause;
      pause = undefined;
      gate.arrive();
      await gate.resume;
    }
    if (reply.destroyed) return;
    if (mode === 'budget') return reply.writeHead(429).end();
    const source = input.sources.find(item => item.document_id === referenceDocumentId);
    if (!source) return reply.writeHead(500).end();
    const {source_id, document_id, version_id, passage_id, excerpt} = source;
    reply.writeHead(200, {'content-type':'application/json'});
    reply.end(JSON.stringify({
      status:'answered', run_id:input.run_id,
      claims:[{kind:'fact', text:excerpt, source_ids:[source_id]}],
      citations:[{kind:'document', source_id, document_id, version_id, passage_id}],
    }));
  });
  server.listen(0, '127.0.0.1');
  await once(server,'listening');
  t.after(() => {server.closeAllConnections(); return new Promise(done => server.close(done));});
  return {
    received, url:'http://127.0.0.1:' + server.address().port + '/generate',
    cite: id => {referenceDocumentId = id;},
    mode: value => {mode = value;},
    pause() {
      const arrived = Promise.withResolvers();
      const resume = Promise.withResolvers();
      pause = {arrive:arrived.resolve, resume:resume.promise};
      return {arrived:arrived.promise, release:resume.resolve};
    },
  };
}

test('SP-09 targeted verification: GAP-01 (adversarial prompt in retrieved document) and GAP-02 (AI outage fallback)', {timeout:120000}, async t => {
  const workspace = await taskFixture({through:'017'});
  t.after(() => workspace.close());
  const knowledge = await knowledgeFixture();
  t.after(() => knowledge.close());
  const fixture = await provider(t);
  const [author, reader] = workspace.ids;
  const {project, tokens, operator} = workspace;
  await workspace.projects.add(tokens[0], project, {user_id:reader,role:'developer'},randomUUID());
  for (const action of ['knowledge-author','backlog-author','task-state']) {
    await operator.project(author, project, action, true, '0', 'sp09-targeted-fixture', 'synthetic test rights');
  }
  const certificate = resolve('.tmp/local-https/localhost.crt');
  const secret = randomUUID() + randomUUID();
  const knowledgeServer = await service(t,'knowledge',{
    SACW_KNOWLEDGE_DATABASE_URL:knowledge.runtimeUrl,SACW_DOCUMENT_SERVICE_KEY:secret,
    SACW_KNOWLEDGE_TLS_CERT:certificate,SACW_KNOWLEDGE_TLS_KEY:resolve('.tmp/local-https/localhost.key'),
  });
  const webPort = await freePort();
  const origin = 'https://localhost:' + webPort;
  const workspaceEnv = {...workspace.db.runtimeEnvironment,SACW_SESSION_ORIGIN:origin,
    SACW_PROJECT_CURSOR_KEY:JSON.stringify({kid:'sp09',key:Buffer.alloc(32,9).toString('base64')}),
    SACW_DOCUMENT_SERVICE_KEY:secret,SACW_KNOWLEDGE_HTTPS_URL:knowledgeServer.base,SACW_KNOWLEDGE_TLS_CA:certificate,
    SACW_SP09_FIXTURE_PROVIDER_URL:fixture.url};
  const workspaceServer = await service(t,'workspace',workspaceEnv);
  const root = '/projects/' + project;

  async function request(path, status, {method='GET', body, actor=1, headers={}} = {}) {
    const response = await fetch(workspaceServer.base + (path.startsWith('/tasks/') ? '' : root) + path, {method, headers:{
      ...workspace.headers(tokens[actor]), origin, 'idempotency-key':randomUUID(),
      ...(body ? {'content-type':'application/json'} : {}), ...headers,
    }, ...(body ? {body:JSON.stringify(body)} : {})});
    const text = await response.text();
    assert.equal(response.status,status,method + ' ' + path + ' ' + text);
    return text ? JSON.parse(text) : undefined;
  }
  const post = (path,status,body,actor=1) => request(path,status,{method:'POST',body,actor});
  const ask = (question,status=200) => post('/questions',status,{question,scope:'current'});

  await knowledge.admin.query("INSERT INTO knowledge.embedding_configuration VALUES($1,$2,'1',3,'cosine')",
    [configuration,model]);
  async function seed(title, excerpt, classification, vector) {
    const doc = await post('/documents',201,{title, classification, content:excerpt},0);
    const client = await knowledge.admin.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL search_path=knowledge,public,pg_catalog');
      const jobId = randomUUID();
      await client.query(`INSERT INTO knowledge.search_job(job_id,document_id,version_id,configuration_id,aggregate_revision,processing_generation,readiness)
        VALUES($1,$2,$3,$4,1,1,'ready')`, [jobId, doc.document_id, doc.current_version_id, configuration]);
      await client.query(`INSERT INTO knowledge.passage_embedding(document_id,version_id,passage_id,configuration_id,job_id,dimensions,embedding)
        SELECT document_id,version_id,passage_id,$3,$4,3,$5::public.vector FROM knowledge.passage
        WHERE document_id=$1 AND version_id=$2`, [doc.document_id, doc.current_version_id, configuration, jobId, vector]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    return doc;
  }

  const opening = syntheticExcerpts[0];
  const restricted = syntheticExcerpts[3];
  const publicDoc = await seed('Synthetic opening hours', opening, 'project_shared', '[0.99,0.1,0]');
  const privateTitle = 'Synthetic private hours';
  const privateDoc = await seed(privateTitle, restricted, 'restricted', '[1,0,0]');
  fixture.cite(publicDoc.document_id);

  await t.test('GAP-01: Retrieved injection reaches the provider fixture without restricted source disclosure or business changes', async () => {
    const adversarialDoc = await seed('Adversarial security guidelines', adversarial, 'project_shared', '[0.98,0.12,0]');
    await post('/tasks',201,{type:'task',title:'Protected baseline task'},0);
    const snapshot = async () => {
      const [work, documents] = await Promise.all([
        workspace.db.admin.query(`SELECT
          (SELECT jsonb_agg(to_jsonb(t) ORDER BY task_id) FROM workspace.task t) AS tasks,
          (SELECT count(*)::int FROM workspace.business_audit) AS audits`),
        knowledge.admin.query(`SELECT
          (SELECT jsonb_agg(to_jsonb(d) ORDER BY document_id) FROM knowledge.document d) AS documents,
          (SELECT jsonb_agg(to_jsonb(v) ORDER BY document_id,version_id) FROM knowledge.document_version v) AS versions,
          (SELECT count(*)::int FROM knowledge.business_audit) AS audits`),
      ]);
      return [work.rows[0],documents.rows[0]];
    };
    const before = await snapshot();
    const secretPassage = (await knowledge.admin.query(
      'SELECT passage_id FROM knowledge.passage WHERE document_id=$1 AND version_id=$2',
      [privateDoc.document_id,privateDoc.current_version_id])).rows[0].passage_id;
    const beforeReqs = fixture.received.length;
    const answer = await ask('What are the observatory visitor guidelines?');
    const requests = fixture.received.slice(beforeReqs);
    assert.equal(requests.length,1);
    const [{input,body}] = requests;
    assert.deepEqual(Object.keys(input).sort(),['model','question','run_id','sources'],
      'Provider request exposes the fixture question and sources without a write interface');
    assert.ok(input.sources.some(source => source.document_id === adversarialDoc.document_id &&
      source.excerpt === adversarial),'Adversarial excerpt must reach the provider');
    assert.equal(answer.status,'answered');
    assert.deepEqual(answer.citations.map(citation => citation.document_id),[publicDoc.document_id]);
    for (const canary of [restricted,privateTitle,privateDoc.document_id,privateDoc.current_version_id,secretPassage]) {
      assert.ok(!body.includes(canary),'Restricted source canary reached provider');
      assert.ok(!JSON.stringify(answer).includes(canary),'Restricted source canary reached HTTP client');
    }
    assert.deepEqual(await snapshot(),before,'Business data and audit must remain unchanged');
  });

  await t.test('GAP-02: Task writes, document reads and keyword search survive provider failure modes', async () => {
    async function verifyFallback(mode) {
      const taskTitle = `Task created during outage mode ${mode}`;
      const createdTask = await post('/tasks', 201, {type:'task', title:taskTitle}, 0);
      assert.ok(createdTask.task_id, 'Task creation must succeed during outage');
      const readTask = await request('/tasks/' + createdTask.task_id, 200);
      assert.equal(readTask.title, taskTitle, 'Persisted task title must match mutation');
      assert.equal(readTask.state, 'todo', 'Persisted task state must be initial todo');

      // 2. Mutation: Update Task state during outage and verify persistent readback
      await post('/tasks/' + createdTask.task_id + '/state', 200, {
        state: 'in_progress', expected_revision: readTask.revision,
      }, 0);
      const updatedTask = await request('/tasks/' + createdTask.task_id, 200);
      assert.equal(updatedTask.state, 'in_progress', 'Persisted task state must update to in_progress');

      // 3. Document Access: Read permitted document through deliverDocument guard during outage
      const versionPath = '/documents/' + publicDoc.document_id + '/versions/';
      const docRead = await request(versionPath + publicDoc.current_version_id,200);
      assert.equal(docRead.content,opening);

      // 4. Keyword Search: PostgreSQL full-text search remains operational without invoking AI
      const keywordRes = await post('/search/keyword',200,{query:'weekdays',scope:'current'});
      const match = keywordRes.items.find(item => item.document_id === publicDoc.document_id);
      assert.ok(match,'Keyword search must return the permitted reference');
      assert.equal(match.version_id,publicDoc.current_version_id);
      assert.equal(match.excerpt,opening);
      assert.equal((await request(versionPath + match.version_id,200)).content,opening);
    }

    const modes = [
      ['connection','provider_unavailable','provider_unavailable'],
      ['budget','budget_exhausted','provider_budget_exhausted'],
      ['timeout','provider_timeout','provider_timeout'],
    ];
    for (const [mode,code,outcome] of modes) {
      fixture.mode(mode);
      const gate = mode === 'timeout' ? fixture.pause() : null;
      const pending = ask(paraphrase,503);
      try {
        const failure = gate
          ? (await Promise.all([pending,gate.arrived.then(() => verifyFallback(mode))]))[0]
          : await pending;
        assert.equal(failure.code,code);
        assert.deepEqual(Object.keys(failure).sort(),['code','message','run_id']);
        assert.ok(failure.run_id);
        if (!gate) await verifyFallback(mode);
        const {rows} = await knowledge.admin.query(
          'SELECT errors FROM knowledge.execution WHERE run_id=$1',[failure.run_id]);
        // Workspace records the run in its route finally block after returning the error.
        let errors = rows[0]?.errors;
        for (let attempt = 0; errors?.[0] !== outcome && attempt < 40; attempt++) {
          await delay(25);
          errors = (await knowledge.admin.query(
            'SELECT errors FROM knowledge.execution WHERE run_id=$1',[failure.run_id])).rows[0]?.errors;
        }
        assert.deepEqual(errors,[outcome]);
      } finally {
        gate?.release();
        await pending.catch(() => {});
        fixture.mode('ok');
      }
    }
  });
});
