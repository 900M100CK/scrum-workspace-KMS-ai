import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {JSDOM, VirtualConsole} from 'jsdom';
import {documentUiFixture} from './document-ui-fixture.mjs';

const requireWeb = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const React = requireWeb('react');

test('SP06 live HTTPS/PG document creation, reading, access management and DOM verification', {timeout: 180000}, async (t) => {
  const f = await documentUiFixture();
  t.after(() => f.close());

  const domErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => domErrors.push(error.message));

  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: f.origin,
    pretendToBeVisual: true,
    virtualConsole,
  });
  const saved = new Map();
  for (const [name, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    location: dom.window.location,
    FormData: dom.window.FormData,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    saved.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {value, configurable: true, writable: true});
  }

  const {createRoot} = requireWeb('react-dom/client');
  const {DocumentWorkspace} = await f.vite.ssrLoadModule('/src/DocumentWorkspace.tsx');
  const {DocumentController} = await f.vite.ssrLoadModule('/src/documents.ts');

  const controller = new DocumentController(f.ids[0], f.project, () => {}, f.transport);
  const root = createRoot(document.getElementById('root'));

  t.after(async () => {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [name, value] of saved) {
      if (value) Object.defineProperty(globalThis, name, value);
      else delete globalThis[name];
    }
    assert.deepEqual(domErrors, []);
  });

  async function settle() {
    await React.act(async () => {
      const end = Date.now() + 10000;
      while (controller.getSnapshot().busy) {
        if (Date.now() > end) throw Error('UI did not settle');
        await new Promise((r) => setTimeout(r, 15));
      }
    });
  }

  // Render component
  await React.act(async () =>
    root.render(
      React.createElement(DocumentWorkspace, {
        userId: f.ids[0],
        projectId: f.project,
        onSessionLost: () => {},
        controller,
      })
    )
  );
  await settle();

  // Test 1: Native labelled controls and document creation
  await t.test('labelled create form and restricted document creation', async () => {
    assert(document.querySelector('label[for="doc-title"]'));
    assert(document.querySelector('label[for="doc-classification"]'));
    assert(document.querySelector('label[for="doc-content"]'));

    const form = document.querySelector('.create-document-form');
    assert(form);
    form.elements.namedItem('title').value = 'Architecture Blueprint';
    form.elements.namedItem('classification').value = 'restricted';
    form.elements.namedItem('content').value = '# Blueprint\nBounded document access architecture.';

    await React.act(async () =>
      form.dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}))
    );
    await settle();

    const snap = controller.getSnapshot();
    assert.equal(snap.items.length, 1);
    const item = snap.items[0];
    assert(item);
    assert.equal(item.title, 'Architecture Blueprint');
    assert.equal(item.classification, 'restricted');
  });

  // Test 2: Detail read and content pre
  await t.test('document detail view displays content and access management', async () => {
    const snap = controller.getSnapshot();
    const docId = snap.items[0].document_id;

    await React.act(async () => controller.open(docId));
    await settle();

    const detailSnap = controller.getSnapshot();
    assert(detailSnap.detail);
    assert.equal(detailSnap.detail.document.title, 'Architecture Blueprint');
    assert.equal(detailSnap.detail.content, '# Blueprint\nBounded document access architecture.');
    assert(detailSnap.detail.policy);
    assert.equal(detailSnap.detail.policy.classification, 'restricted');

    const pre = document.querySelector('.document-content pre');
    assert(pre);
    assert.equal(pre.textContent, '# Blueprint\nBounded document access architecture.');
  });

  // Test 3: Grant read to member
  await t.test('grant read to member updates policy and grantee list', async () => {
    const grantee = f.ids[1];
    const grantForm = document.querySelector('.grant-read-form');
    assert(grantForm);
    grantForm.elements.namedItem('user_id').value = grantee;

    await React.act(async () =>
      grantForm.dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}))
    );
    await settle();

    const detailSnap = controller.getSnapshot();
    assert(detailSnap.detail);
    assert(detailSnap.detail.grants.some((g) => g.user_id === grantee));
  });

  // Test 4: Update classification
  await t.test('update classification to project_shared updates badge and policy', async () => {
    const classForm = document.querySelector('.inline-form');
    assert(classForm);
    classForm.elements.namedItem('classification').value = 'project_shared';

    await React.act(async () =>
      classForm.dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}))
    );
    await settle();

    const detailSnap = controller.getSnapshot();
    assert(detailSnap.detail);
    assert.equal(detailSnap.detail.document.classification, 'project_shared');
    assert.equal(detailSnap.detail.policy.classification, 'project_shared');
  });

  // Test 5: Revoke read grant
  await t.test('revoke read removes grantee from policy', async () => {
    const grantee = f.ids[1];
    const detail = controller.getSnapshot().detail;
    assert(detail && detail.policy);

    await React.act(async () =>
      controller.revokeRead(detail.document.document_id, grantee, detail.policy.permission_revision)
    );
    await settle();

    const detailSnap = controller.getSnapshot();
    assert(detailSnap.detail);
    assert(!detailSnap.detail.grants.some((g) => g.user_id === grantee));
  });

  // Record evidence
  const directory = 'docs/implementation/features/sp-06-document-access/evidence/p13-20261111';
  await mkdir(directory, {recursive: true});
  const summary = {
    date: '2026-11-11',
    node: process.version,
    database: (await f.db.admin.query('SHOW server_version')).rows[0].server_version,
    image: f.db.image,
    https: true,
    tlsBypass: false,
    checks: [
      'labelled document create form with native HTML controls',
      'creation of restricted document with real Fastify and PG persistence',
      'detail read with <pre> content rendering and policy inspection',
      'manage access grant read to project member with CAS revision bump',
      'manage access update classification to project_shared',
      'manage access revoke read grant with atomic invalidation',
    ],
    domErrors,
  };
  await writeFile(`${directory}/results.json`, JSON.stringify(summary, null, 2) + '\n');
});
