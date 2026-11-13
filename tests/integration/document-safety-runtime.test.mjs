import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
import {createServer} from 'node:net';
import {resolve} from 'node:path';
import {readFile} from 'node:fs/promises';
import {migrate} from '../../scripts/database.mjs';
import {taskFixture} from '../workspace/task-fixture.mjs';
import {documentAuthorityFixture} from '../workspace/document-authority-fixture.mjs';
import {WorkspaceDocumentStore} from '../../services/workspace/src/documents/store.ts';
import {DocumentOrchestrator} from '../../services/workspace/src/documents/orchestration.ts';
import {ProjectRWGuard} from '../../services/workspace/src/policy/guard.ts';
import {buildApp} from '../../services/workspace/src/app.ts';
import {knowledgeFixture} from '../knowledge/knowledge-fixture.mjs';

async function freePort() {
  const listener = createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const {port} = listener.address();
  await new Promise((done, reject) => listener.close(error => error ? reject(error) : done()));
  return port;
}

async function service(t, name, environment) {
  const port = await freePort();
  const child = spawn(process.execPath, ['services/' + name + '/src/server.ts'], {
    env: {...process.env, ...environment, PORT: String(port)},
    stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true,
  });
  const exited = once(child, 'exit');
  let diagnostics = '';
  child.stderr.on('data', chunk => { diagnostics += chunk; });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill();
    await exited;
  });
  const protocol = name === 'knowledge' ? 'https' : 'http';
  const base = protocol + '://localhost:' + port;
  const deadline = Date.now() + 6000;
  while (Date.now() < deadline && child.exitCode === null) {
    const response = await fetch(base + '/healthz').catch(() => null);
    if (response?.ok) return base;
    await new Promise(done => setTimeout(done, 40));
  }
  assert.fail(name + ' startup failed: ' + diagnostics.split('\n').slice(0, 4).join('\n'));
}

test('standard Workspace and Knowledge entry points enforce scoped document lifecycle over TLS', {timeout: 90000}, async t => {
  const workspace = await documentAuthorityFixture();
  t.after(() => workspace.close());
  const knowledge = await knowledgeFixture();
  t.after(() => knowledge.close());
  const [author, reader] = workspace.ids;
  const {project, operator, tokens} = workspace;
  await workspace.projects.add(tokens[0], project, {user_id: reader, role: 'developer'}, randomUUID());
  await operator.project(author, project, 'knowledge-author', true, '0', 'synthetic-runtime', 'create author');
  await operator.project(reader, project, 'knowledge-author', true, '0', 'synthetic-runtime', 'second author');

  const certificate = resolve('.tmp/local-https/localhost.crt');
  const key = resolve('.tmp/local-https/localhost.key');
  const secret = randomUUID() + randomUUID();
  const origin = 'https://localhost';
  const knowledgeUrl = await service(t, 'knowledge', {
    SACW_KNOWLEDGE_DATABASE_URL: knowledge.runtimeUrl,
    SACW_DOCUMENT_SERVICE_KEY: secret,
    SACW_KNOWLEDGE_TLS_CERT: certificate,
    SACW_KNOWLEDGE_TLS_KEY: key,
  });
  const base = await service(t, 'workspace', {
    ...workspace.db.runtimeEnvironment,
    SACW_SESSION_ORIGIN: origin,
    SACW_PROJECT_CURSOR_KEY: JSON.stringify({kid: 'runtime', key: Buffer.alloc(32, 19).toString('base64')}),
    SACW_DOCUMENT_SERVICE_KEY: secret,
    SACW_KNOWLEDGE_HTTPS_URL: knowledgeUrl,
    SACW_KNOWLEDGE_TLS_CA: certificate,
  });
  const docs = base + '/projects/' + project + '/documents';
  async function send(path, status, {method = 'GET', body, token = tokens[0], headers = {}} = {}) {
    const response = await fetch(docs + path, {
      method,
      headers: {...workspace.headers(token), 'idempotency-key': randomUUID(),
        ...(body ? {'content-type': 'application/json'} : {}), ...headers},
      ...(body ? {body: JSON.stringify(body)} : {}),
    });
    const text = await response.text();
    assert.equal(response.status, status, method + ' expected ' + status + ': ' + text);
    return text ? JSON.parse(text) : undefined;
  }

  const original = await send('', 201, {method: 'POST', body: {
    title: 'Synthetic lifecycle', classification: 'restricted', content: 'original',
  }});
  const path = '/' + original.document_id;
  assert.equal((await send(path, 200)).content, 'original');
  await send(path, 404, {token: tokens[1], headers: {
    'x-service-key': secret, 'x-actor-user-id': author, 'x-actor-session': randomUUID(),
  }});
  await send(path + '/revisions', 403, {method: 'POST', token: tokens[1], body: {
    expected_revision: 1, content: 'not authorised',
  }});
  await send(path + '/versions/' + original.current_version_id + '/archive', 403, {
    method: 'POST', token: tokens[1], body: {expected_revision: 1},
  });
  await send(path, 403, {method: 'DELETE', token: tokens[1], headers: {'x-expected-revision': '1'}});
  assert.equal((await fetch(knowledgeUrl + '/internal/documents' + path, {
    headers: {'x-service-key': 'wrong-key', 'x-actor-session': randomUUID()},
  })).status, 403);

  const granted = await send(path + '/read-grants', 200, {method: 'POST', body: {
    user_id: reader, expected_revision: 1,
  }});
  const revisionKey = randomUUID();
  const mutation = {method: 'POST', body: {expected_revision: 1, content: 'replacement'},
    headers: {'idempotency-key': revisionKey}};
  const revision = await send(path + '/revisions', 201, mutation);
  assert.deepEqual(await send(path + '/revisions', 200, mutation), revision);
  const previousPath = path + '/versions/' + original.current_version_id;
  const previous = await send(previousPath, 200, {token: tokens[1]});
  assert.equal(previous.content, 'original');
  assert.equal(previous.state, 'superseded');

  const history = await send(path + '/versions?limit=1', 200);
  assert.ok(history.next_cursor);
  const next = path + '/versions?limit=1&cursor=' + encodeURIComponent(history.next_cursor);
  await send(next, 400, {token: tokens[1]});
  assert.equal((await send(next, 200)).items[0].version_id, original.current_version_id);
  await send(previousPath + '/archive', 200, {method: 'POST', body: {expected_revision: 2}});
  await send(next, 409);
  assert.equal((await send(previousPath, 200)).state, 'archived');

  await send(path + '/read-grants/' + reader, 200, {
    method: 'DELETE', headers: {'x-expected-revision': String(granted.permission_revision)},
  });
  await send(previousPath, 404, {token: tokens[1]});
  await send(path, 409, {method: 'DELETE', headers: {'x-expected-revision': '2'}});
  assert.equal((await send(path, 200)).content, 'replacement');
  const deletionHeaders = {'idempotency-key': randomUUID(), 'x-expected-revision': '3'};
  await send(path, 204, {method: 'DELETE', headers: deletionHeaders});
  await send(path, 204, {method: 'DELETE', headers: deletionHeaders});
  await send(path, 404);
  await send(previousPath, 404);
});

test('revocation during read preparation withholds content and unknown commands survive restart', {timeout: 90000}, async t => {
  const f = await documentAuthorityFixture();
  t.after(() => f.close());
  const [author, reader] = f.ids;
  await f.projects.add(f.tokens[0], f.project, {user_id: reader, role: 'developer'}, randomUUID());
  await f.operator.project(author, f.project, 'knowledge-author', true, '0', 'test', 'author');
  const store = new WorkspaceDocumentStore(f.db.runtime, f.sessions, f.cursorKey);
  const guard = new ProjectRWGuard();
  const original = await store.registerPolicy(f.tokens[0], f.project, {classification: 'restricted'}, randomUUID());
  const id = original.policy.document_id;
  const version = randomUUID();
  let release;
  let entered;
  const ready = new Promise(done => { entered = done; });
  const wait = new Promise(done => { release = done; });
  const document = {document_id: id, project_id: f.project, title: 'Synthetic', owner_id: author,
    current_version_id: version, revision: 1, kind: 'document', labels: []};
  let attempts = 0;
  const receipt = {document_id: id, version_id: randomUUID(), operation: 'reviseDocument', receipt_id: randomUUID()};
  const transport = {
    async get() { entered(); await wait; return {document, content: 'withheld'}; },
    async revise() {
      attempts++;
      if (attempts === 1) throw new Error('Synthetic lost acknowledgement');
      return {status: 200, receipt};
    },
  };
  const orchestrator = new DocumentOrchestrator(store, transport, guard);
  const app = buildApp({docs: store, orchestrator, origin: 'https://localhost'});
  t.after(() => app.close());
  const path = '/projects/' + f.project + '/documents/' + id;
  await store.grantRead(f.tokens[0], f.project, id, {user_id: reader, expected_revision: 1}, randomUUID());
  const pendingRead = app.inject({method: 'GET', url: path, headers: f.headers(f.tokens[1])});
  await ready;
  try {
    const revoked = await app.inject({method: 'DELETE', url: path + '/read-grants/' + reader,
      headers: {...f.headers(), 'x-expected-revision': '2', 'idempotency-key': randomUUID()}});
    assert.equal(revoked.statusCode, 200);
  } finally {
    release();
  }
  assert.equal((await pendingRead).statusCode, 404);
  const key = randomUUID();
  const payload = {expected_revision: 1, content: 'new content'};
  await assert.rejects(orchestrator.reviseDocument(f.tokens[0], f.project, id, payload, key),
    /Synthetic lost acknowledgement/);
  const restartedStore = new WorkspaceDocumentStore(f.db.runtime, f.sessions, f.cursorKey);
  const restarted = new DocumentOrchestrator(restartedStore, transport, new ProjectRWGuard());
  assert.equal(await restartedStore.commandPending(id), true);
  await assert.rejects(restarted.getDocument(f.tokens[0], f.project, id), {status: 503});
  await assert.rejects(restarted.reviseDocument(f.tokens[0], f.project, id, {...payload, content: 'changed'}, key),
    error => (error.cause ?? error).status === 503);
  assert.deepEqual((await restarted.reviseDocument(f.tokens[0], f.project, id, payload, key)).receipt, receipt);
  assert.equal(await restartedStore.commandPending(id), false);
});

test('migration preserves author grants only with current evidence and refuses unsafe rollback', {timeout: 90000}, async t => {
  const f = await taskFixture({through: '014'});
  t.after(() => f.close());
  const [author, former] = f.ids;
  await f.projects.add(f.tokens[0], f.project, {user_id: former, role: 'developer'}, randomUUID());
  const ids = [randomUUID(), randomUUID(), randomUUID()];
  for (const [index, id] of ids.entries()) {
    const actor = index === 1 ? former : author;
    await f.db.admin.query(
      "INSERT INTO workspace.document_policy(document_id, project_id, classification) VALUES ($1, $2, 'restricted')",
      [id, f.project]);
    await f.db.admin.query(
      "INSERT INTO workspace.capability_grant(grant_id, subject_id, project_id, resource_kind, resource_id, action) VALUES ($1, $2, $3, 'document', $4, 'document-manage-access')",
      [randomUUID(), actor, f.project, id]);
    if (index !== 2) {
      await f.db.admin.query(
        "INSERT INTO workspace.business_audit(event_id, actor_id, project_id, action, entity_id, correlation_id) VALUES ($1, $2, $3, 'document-policy-register', $4, $5)",
        [randomUUID(), actor, f.project, id, randomUUID()]);
    }
  }
  await f.projects.remove(f.tokens[0], f.project, former, '1', randomUUID());
  await f.projects.add(f.tokens[0], f.project, {user_id: former, role: 'developer'}, randomUUID());
  migrate(f.db.name, 'workspace', 'up', {through: '016'});
  migrate(f.db.name, 'workspace', 'up', {through: '016'});
  const result = await f.db.admin.query(
    "SELECT resource_id, action FROM workspace.capability_grant WHERE action IN ('content-write', 'lifecycle-manage') ORDER BY action");
  assert.deepEqual(result.rows, [
    {resource_id: ids[0], action: 'content-write'},
    {resource_id: ids[0], action: 'lifecycle-manage'},
  ]);
  const store = new WorkspaceDocumentStore(f.db.runtime, f.sessions, f.cursorKey);
  await store.beginCommand(f.tokens[0], f.project, ids[0], 'deleteDocument', 'pending-upgrade', 'synthetic-hash');
  for (const [file, message] of [
    ['016-document-command-journal.down.sql', /unresolved document commands/],
    ['015-document-command-authority.down.sql', /retained document command authority/],
  ]) {
    const sql = await readFile(resolve('services/workspace/migrations', file), 'utf8');
    const client = await f.db.admin.connect();
    try {
      await client.query('BEGIN');
      await assert.rejects(client.query(sql), message);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  }
});
