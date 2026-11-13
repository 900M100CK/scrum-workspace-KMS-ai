import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
import {createServer} from 'node:net';
import {resolve} from 'node:path';
import {mkdir, readFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {taskFixture} from './task-fixture.mjs';
import {buildApp} from '../../services/workspace/src/app.ts';
import {WorkspaceDocumentStore} from '../../services/workspace/src/documents/store.ts';
import {DocumentOrchestrator} from '../../services/workspace/src/documents/orchestration.ts';
import {ProjectRWGuard} from '../../services/workspace/src/policy/guard.ts';
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
    if (response?.ok) return {base, stop: async () => {child.kill(); await exited;}};
    await new Promise(done => setTimeout(done, 40));
  }
  assert.fail(name + ' startup failed: ' + diagnostics.split('\n').slice(0, 12).join('\n'));
}


test('SP-08 real TLS links, replay, current/history search, revocation and dependency isolation', {timeout: 120000}, async t => {
  const workspace = await taskFixture({through:'017'});
  t.after(() => workspace.close());
  const knowledge = await knowledgeFixture();
  t.after(() => knowledge.close());
  const [author, reader, outsider] = workspace.ids;
  const {project, operator, tokens} = workspace;
  await workspace.projects.add(tokens[0], project, {user_id: reader, role: 'developer'}, randomUUID());
  for (const action of ['knowledge-author','link-create','backlog-author','sprint-create']) {
    await operator.project(author, project, action, true, '0', 'sp08-fixture', 'synthetic test rights');
  }
  await assert.rejects(workspace.db.runtime.query(
    "INSERT INTO workspace.capability_grant(grant_id,subject_id,project_id,resource_kind,resource_id,action) VALUES($1,$2,$3,'project',$3,'link-create')",
    [randomUUID(), reader, project]), {code:'42501'});
  const certificate = resolve('.tmp/local-https/localhost.crt');
  const secret = randomUUID() + randomUUID();
  const knowledgeServer = await service(t, 'knowledge', {
    SACW_KNOWLEDGE_DATABASE_URL: knowledge.runtimeUrl, SACW_DOCUMENT_SERVICE_KEY: secret,
    SACW_KNOWLEDGE_TLS_CERT: certificate, SACW_KNOWLEDGE_TLS_KEY: resolve('.tmp/local-https/localhost.key'),
  });
  const webPort = await freePort();
  const webOrigin = 'https://localhost:' + webPort;
  const {base} = await service(t, 'workspace', {
    ...workspace.db.runtimeEnvironment, SACW_SESSION_ORIGIN:webOrigin,
    SACW_PROJECT_CURSOR_KEY:JSON.stringify({kid:'sp08',key:Buffer.alloc(32,19).toString('base64')}),
    SACW_DOCUMENT_SERVICE_KEY:secret, SACW_KNOWLEDGE_HTTPS_URL:knowledgeServer.base, SACW_KNOWLEDGE_TLS_CA:certificate,
  });
  async function request(path, status, {method = 'GET', body, actor = 0, key = randomUUID(), headers = {}} = {}) {
    const response = await fetch(base + path, {
      method, headers:{...workspace.headers(tokens[actor]), origin:webOrigin, 'idempotency-key':key,
        ...(body ? {'content-type':'application/json'} : {}), ...headers},
      ...(body ? {body:JSON.stringify(body)} : {}),
    });
    const text = await response.text();
    assert.equal(response.status, status, method + ' ' + path + ' ' + text);
    return text ? JSON.parse(text) : undefined;
  }
  const root = '/projects/' + project;
  const post = (path, status, body, actor = 0, key) => request(root + path, status, {method:'POST',body,actor,key});
  const search = (query, scope, actor = 0, status = 200, cursor) =>
    post('/search/keyword', status, {query,scope,...(cursor ? {cursor} : {})}, actor);
  const links = (id, actor = 0, status = 200) => request(root+'/links?from_id='+id, status, {actor});
  const task = await post('/tasks', 201, {type:'task',title:'Synthetic deployment task'});
  const sprint = await post('/sprints', 201, {goal:'Synthetic deployment Sprint',start_date:'2026-11-13',end_date:'2026-11-20'});
  const doc = await post('/documents', 201, {title:'Synthetic permission source',classification:'restricted',
    kind:'decision', content:Array.from({length:23},(_,i)=>'quartz legacy evidence '+i).join('\n\n')});
  const shared = await post('/documents', 201, {title:'Synthetic shared source',classification:'project_shared',
    content:Array.from({length:23},(_,i)=>'quartz public evidence '+i).join('\n\n')});
  await operator.global(outsider,true,'0','sp08-fixture','synthetic other project');
  const otherProject = (await workspace.projects.create(tokens[2],{name:'Synthetic other project'},randomUUID())).projectId;
  await operator.project(outsider,otherProject,'backlog-author',true,'0','sp08-fixture','synthetic other task');
  const other = await request('/projects/'+otherProject+'/tasks',201,{
    method:'POST',actor:2,body:{type:'task',title:'Synthetic other task'},
  });
  const target = '/documents/' + doc.document_id;
  const linkInput = {from_kind:'task',from_id:task.task_id,to_kind:'decision',to_id:doc.document_id,relation:'explains'};
  const key = randomUUID();
  const link = await post('/links',201,linkInput,0,key);
  assert.deepEqual(await post('/links',201,linkInput,0,key),link);
  await post('/links',409,{...linkInput,relation:'differs'},0,key);
  await post('/links',404,{...linkInput,to_kind:'document'});
  await post('/links',404,{...linkInput,from_id:other.task_id});
  assert.deepEqual((await links(task.task_id)).items,[link]);
  assert.deepEqual((await links(doc.document_id)).items,[link]);
  assert.deepEqual((await links(task.task_id,1)).items,[]);
  assert.deepEqual(await links(doc.document_id,1,404),await links(randomUUID(),1,404));
  assert.equal((await knowledge.admin.query("SELECT count(*)::int AS count FROM knowledge.business_audit WHERE action='relationship-create'")).rows[0].count,1);

  await knowledge.admin.query("ALTER TABLE knowledge.business_audit ADD CONSTRAINT fixture_deny_link_audit CHECK (action <> 'relationship-create') NOT VALID");
  try {
    await post('/links',503,{...linkInput,from_kind:'sprint',from_id:sprint.sprint_id});
    assert.equal((await knowledge.admin.query('SELECT count(*)::int AS count FROM knowledge.link')).rows[0].count,1);
  } finally {
    await knowledge.admin.query('ALTER TABLE knowledge.business_audit DROP CONSTRAINT fixture_deny_link_audit');
  }
  const sprintLink = await post('/links',201,{...linkInput,from_kind:'sprint',from_id:sprint.sprint_id});
  assert.deepEqual((await links(sprint.sprint_id)).items,[sprintLink]);

  const publicPage = await search('quartz','current',1);
  assert.ok(publicPage.next_cursor);
  assert.ok(publicPage.items.every(item => item.document_id === shared.document_id));
  assert.equal((await search('quartz','current',1,200,publicPage.next_cursor)).items.length,3);
  await search('quartz','current',0,400,publicPage.next_cursor);
  const denied = await search('quartz','current',2,404);
  assert.deepEqual(denied,{code:'not_found',message:'Resource unavailable'});

  const grant = await post(target+'/read-grants',200,{user_id:reader,expected_revision:1});
  await post('/links',403,linkInput,1);
  await operator.project(reader, project, 'link-create', true, '0', 'sp08-fixture', 'synthetic rejoin test');
  assert.deepEqual(await request(root+'/links/allowed-actions',200,{actor:1}),{actions:['createLink']});
  assert.equal((await links(task.task_id,1)).items[0].link_id,link.link_id);
  await search('quartz','current',1,409,publicPage.next_cursor);
  const accessible = await search('legacy','current',1);
  assert.equal(accessible.items[0].document_id,doc.document_id);
  await post(target+'/revisions',201,{expected_revision:1,content:'zircon replacement evidence'});
  assert.deepEqual((await search('legacy','current',1)).items,[]);
  const historic = await search('legacy','historical',1);
  assert.ok(historic.items.every(item => item.validity === 'superseded' && item.version_id === doc.current_version_id));
  assert.match((await request(root+target+'/versions/'+doc.current_version_id,200,{actor:1})).content,/quartz legacy/);
  assert.equal((await search('zircon','current',1)).items[0].validity,'current');
  await post(target+'/versions/'+doc.current_version_id+'/archive',200,{expected_revision:2});
  assert.equal((await search('legacy','historical',1)).items[0].validity,'archived');
  await request(root+target+'/read-grants/'+reader,200,{method:'DELETE',headers:{'x-expected-revision':String(grant.permission_revision)}});
  assert.deepEqual((await search('zircon','current',1)).items,[]);
  assert.deepEqual((await links(task.task_id,1)).items,[]);
  await t.test('Edge shows Search and the exact source on desktop and mobile', {
    skip: !process.env.SACW_PLAYWRIGHT_MODULE,
  }, async browserTest => {
    const {chromium} = await import(process.env.SACW_PLAYWRIGHT_MODULE);
    const cert = await readFile(certificate);
    const requireWeb = createRequire(new URL('../../apps/web/package.json', import.meta.url));
    const {createServer: createVite} = await import(pathToFileURL(requireWeb.resolve('vite')).href);
    const vite = await createVite({
      configFile: false,
      root: fileURLToPath(new URL('../../apps/web', import.meta.url)),
      server: {host:'127.0.0.1',port:webPort,strictPort:true,hmr:false,
        https:{cert,key:await readFile('.tmp/local-https/localhost.key')},
        proxy:{'/api':{target:base,rewrite:path=>path.replace(/^\/api/,'')}}},
    });
    browserTest.after(() => vite.close());
    await vite.listen();
    const origin = webOrigin;
    const browser = await chromium.launch({channel:'msedge',headless:true});
    browserTest.after(() => browser.close());
    const context = await browser.newContext({viewport:{width:1280,height:900}});
    const cookie = workspace.headers(tokens[0]).cookie;
    const separator = cookie.indexOf('=');
    await context.addCookies([{name:cookie.slice(0,separator),value:cookie.slice(separator+1),
      url:origin,secure:true,httpOnly:true,sameSite:'Strict'}]);
    const page = await context.newPage();
    await page.goto(origin + '/#workspace');
    await page.getByRole('button',{name:'Synthetic task project'}).click();
    await page.getByRole('button',{name:'Synthetic deployment task'}).click();
    await page.getByRole('button',{name:'Load related resources'}).click();
    await page.getByRole('button',{name:'Choose a resource to link'}).click();
    await page.waitForFunction(() => document.querySelector('select[name=target]') ||
      document.querySelector('.related-resources [role=status]')?.textContent?.includes('unavailable'));
    assert.equal(await page.locator('select[name=target]').count(),1,
      await page.locator('.related-resources [role=status]').textContent());
    await page.getByLabel('Resource',{exact:true}).selectOption('document:' + shared.document_id);
    await page.getByLabel('Relationship',{exact:true}).fill('browser verification');
    await page.getByRole('button',{name:'Create link',exact:true}).click();
    await page.getByRole('button',{name:'Open document · browser verification'}).waitFor();
    await page.getByRole('button',{name:'Open decision · explains'}).click();
    await page.getByText(/Synthetic permission source.*zircon replacement evidence/s).waitFor();
    await page.getByRole('button',{name:'Search',exact:true}).click();
    await page.getByRole('searchbox',{name:'Keyword'}).fill('zircon');
    await page.getByRole('searchbox',{name:'Keyword'}).press('Enter');
    await page.getByRole('button',{name:'Synthetic permission source'}).click();
    await page.getByRole('complementary',{name:'Source detail'}).getByText('zircon replacement evidence').waitFor();
    const snapshot = await page.locator('.knowledge-results').evaluate(element => getComputedStyle(element).gridTemplateColumns);
    assert.equal(snapshot.split(' ').length,2);
    if (process.env.SACW_TEST_EVIDENCE_DIR) {
      await mkdir(process.env.SACW_TEST_EVIDENCE_DIR,{recursive:true});
      await page.screenshot({path:resolve(process.env.SACW_TEST_EVIDENCE_DIR,'sp08-search-desktop.png'),fullPage:true});
    }
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
    assert.equal((await page.locator('.knowledge-results').evaluate(element => getComputedStyle(element).gridTemplateColumns)).split(' ').length,1);
    if (process.env.SACW_TEST_EVIDENCE_DIR) {
      await page.screenshot({path:resolve(process.env.SACW_TEST_EVIDENCE_DIR,'sp08-search-mobile.png'),fullPage:true});
    }
  });

  await request(root+target,204,{method:'DELETE',headers:{'x-expected-revision':'3'}});
  assert.deepEqual((await search('legacy','historical')).items,[]);
  assert.ok((await links(task.task_id)).items.every(item => item.to_id === shared.document_id));

  await workspace.projects.remove(tokens[0], project, reader, '1', randomUUID());
  await search('quartz','current',1,404);
  await workspace.projects.add(tokens[0], project, {user_id:reader,role:'developer'}, randomUUID());
  assert.deepEqual(await request(root+'/links/allowed-actions',200,{actor:1}),{actions:[]});
  assert.ok((await links(task.task_id,1)).items.every(item => item.to_id === shared.document_id));

  await knowledgeServer.stop();
  await search('quartz','current',0,503);
  assert.equal((await request('/tasks/'+task.task_id,200)).title,task.title);
});

test('SP-08 guarded handoff drops an in-flight result after revoke', {timeout: 60000}, async t => {
  const f = await taskFixture({through:'017'});
  t.after(() => f.close());
  const [author, reader] = f.ids;
  await f.projects.add(f.tokens[0], f.project, {user_id:reader,role:'developer'}, randomUUID());
  await f.operator.project(author,f.project,'knowledge-author',true,'0','sp08-fixture','synthetic author');
  const docs = new WorkspaceDocumentStore(f.db.runtime,f.sessions,f.cursorKey);
  const {policy} = await docs.registerPolicy(f.tokens[0],f.project,{classification:'restricted'},randomUUID());
  const id = policy.document_id;
  await docs.grantRead(f.tokens[0],f.project,id,{user_id:reader,expected_revision:1},randomUUID());
  let unblock, entered;
  const wait = new Promise(resolve => {unblock = resolve;});
  const ready = new Promise(resolve => {entered = resolve;});
  const transport = {async discovery() {
    entered();
    await wait;
    return {generation:'fixture',more:false,items:[{document_id:id,version_id:randomUUID(),passage_id:randomUUID(),
      title:'Synthetic protected result',excerpt:'Synthetic protected passage',validity:'current',rank:1}]};
  }};
  const orchestrator = new DocumentOrchestrator(docs,transport,new ProjectRWGuard());
  const app = buildApp({docs,orchestrator,origin:'https://localhost'});
  t.after(() => app.close());
  const prefix = '/projects/' + f.project;
  const pending = app.inject({method:'POST',url:prefix+'/search/keyword',headers:f.headers(f.tokens[1]),
    payload:{query:'synthetic'}});
  await ready;
  try {
    const revoked = await app.inject({method:'DELETE',url:prefix+'/documents/'+id+'/read-grants/'+reader,
      headers:{...f.headers(), 'idempotency-key':randomUUID(),'x-expected-revision':'2'}});
    assert.equal(revoked.statusCode,200);
  } finally { unblock(); }
  const result = await pending;
  assert.equal(result.statusCode,404);
  assert.deepEqual(result.json(),{code:'not_found',message:'Resource unavailable'});
  let sent = false;
  transport.discovery = async () => {sent = true; throw new Error('Unexpected transport');};
  await f.db.admin.query('REVOKE SELECT ON workspace.document_policy FROM workspace_app');
  const unavailable = await app.inject({method:'POST',url:prefix+'/search/keyword',headers:f.headers(f.tokens[1]),
    payload:{query:'synthetic'}});
  assert.equal(unavailable.statusCode,503);
  assert.equal('items' in unavailable.json(),false);
  assert.equal(sent,false);
});
