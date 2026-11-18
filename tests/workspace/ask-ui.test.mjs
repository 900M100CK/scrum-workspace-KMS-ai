import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import test from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {JSDOM} from 'jsdom';

const requireWeb = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const React = requireWeb('react');
const {createRoot} = requireWeb('react-dom/client');

test('Ask handles session loss, validates replies and pages through readable work', async t => {
  const {createServer} = await import(pathToFileURL(requireWeb.resolve('vite')).href);
  const vite = await createServer({configFile: false, server: {middlewareMode: true, hmr: false},
    root: fileURLToPath(new URL('../../apps/web', import.meta.url))});
  t.after(() => vite.close());
  const {AskWorkspace} = await vite.ssrLoadModule('/src/AskWorkspace.tsx');
  const dom = new JSDOM('<div id="root"></div>');
  const globals = {window: dom.window, document: dom.window.document, FormData: dom.window.FormData, IS_REACT_ACT_ENVIRONMENT: true};
  const original = Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  Object.assign(globalThis, globals);
  const root = createRoot(document.querySelector('#root'));
  t.after(async () => {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of original) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });

  const project = randomUUID();
  let lost = 0;
  const fetchMock = t.mock.method(globalThis, 'fetch');
  await React.act(async () => root.render(React.createElement(AskWorkspace, {projectId: project, onSessionLost: () => lost++})));
  const form = document.querySelector('form');
  form.elements.question.value = 'When is the observatory open?';
  const submit = () => React.act(async () => form.dispatchEvent(new window.Event('submit', {bubbles: true, cancelable: true})));
  const choose = (label, value) => React.act(async () => {
    const select = [...form.querySelectorAll('label')].find(item => item.textContent.startsWith(label)).querySelector('select');
    select.value = value;
    select.dispatchEvent(new window.Event('change', {bubbles: true}));
  });
  const more = () => [...form.querySelectorAll('button')].find(button => button.textContent === 'Load more resources');
  const task = (task_id, title) => ({task_id, title});
  const sprint = (sprint_id, goal) => ({sprint_id, goal});
  const [first, second, third] = [randomUUID(), randomUUID(), randomUUID()];
  const options = () => [...form.elements.resource.options].map(option => option.textContent);

  await t.test('empty 401 expires the session and malformed success never renders a claim', async () => {
    fetchMock.mock.mockImplementation(async () => new Response(null, {status: 401}));
    await submit();
    assert.equal(lost, 1);
    fetchMock.mock.mockImplementation(async () => Response.json({status: 'answered', citations: []}));
    await submit();
    assert.match(document.body.textContent, /invalid response.*use Search/);
    const locator = {document_id: randomUUID(), version_id: randomUUID(), passage_id: randomUUID()};
    fetchMock.mock.mockImplementation(async url => url.endsWith('/questions') ? Response.json({
      status: 'partially_answered', citations: [{kind: 'document', source_id: 'D1', ...locator}],
      claims: [{kind: 'fact', text: 'The observatory opens at 8.', source_ids: ['D1']}],
      missing_components: ['ticket prices'],
    }) : Response.json({title:'Opening hours', excerpt:'From 8 a.m.', validity:'current', ...locator}));
    await submit();
    assert.match(document.body.textContent, /The observatory opens at 8/);
    assert.match(document.body.textContent, /ticket prices/);
    const open = [...document.querySelectorAll('button')].find(button => button.textContent === 'Open source D1');
    await React.act(async () => open.click());
    assert.equal(document.querySelector('blockquote').textContent, 'From 8 a.m.');
  });

  await t.test('first Task page can be selected immediately; a cursor cycle stops further requests', async () => {
    const paths = [];
    fetchMock.mock.mockImplementation(async (url, init) => {
      if (url.endsWith('/questions')) {
        assert.deepEqual(JSON.parse(init.body).current_work, {kind:'task', id:first, include_documents:false});
        return Response.json({status:'insufficient_evidence', message:'Insufficient evidence'});
      }
      paths.push(url);
      if (url.endsWith('/tasks')) return Response.json({items: [task(first, 'First task')], next_cursor: 'page/2'});
      if (url.endsWith('cursor=page%2F2')) return Response.json({items: [task(second, 'Second task')], next_cursor: 'page/3'});
      return Response.json({items: [task(third, 'Third task'), task(first, 'First task')], next_cursor: 'page/2'});
    });
    await choose('Ask mode', 'work');
    await choose('Work scope', 'task');
    assert.equal(paths.length, 1);
    assert.deepEqual(options(), ['Select a resource', 'First task']);
    form.elements.resource.value = first;
    await submit();
    assert.match(document.body.textContent, /Insufficient evidence/);
    await React.act(async () => more().click());
    assert.equal(form.elements.resource.value, first);
    await React.act(async () => more().click());
    assert.equal(paths.length, 3);
    assert.deepEqual(options(), ['Select a resource', 'First task', 'Second task', 'Third task']);
    assert.equal(more(), undefined);
    assert.match(document.body.textContent, /No more resources could be loaded/);
  });

  await t.test('switching scope ignores the old page and a denied page clears readable options', async () => {
    const pending = Promise.withResolvers();
    let oldSignal;
    fetchMock.mock.mockImplementation(async (url, {signal}) => {
      if (url.endsWith('/sprints')) return Response.json({items: [sprint(first, 'First sprint')], next_cursor: 'second'});
      if (url.endsWith('cursor=second')) { oldSignal = signal; return pending.promise; }
      return Response.json({items: [task(second, 'Current task')], next_cursor: 'denied'});
    });
    await choose('Work scope', 'sprint');
    assert.deepEqual(options(), ['Select a resource', 'First sprint']);
    await React.act(async () => more().click());
    await choose('Work scope', 'task');
    assert.equal(oldSignal.aborted, true);
    await React.act(async () => pending.resolve(Response.json({items: [sprint(third, 'Stale sprint')], next_cursor: null})));
    assert.deepEqual(options(), ['Select a resource', 'Current task']);
    fetchMock.mock.mockImplementation(async () => new Response(null, {status: 404}));
    await React.act(async () => more().click());
    assert.deepEqual(options(), ['Select a resource']);
    assert.match(document.body.textContent, /Scope unavailable/);
  });
});
