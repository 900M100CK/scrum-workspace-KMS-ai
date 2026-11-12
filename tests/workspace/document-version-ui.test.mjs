import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir, writeFile, readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createServer} from 'node:net';
import {request} from 'node:https';
import {randomUUID} from 'node:crypto';
import {JSDOM, VirtualConsole} from 'jsdom';

import {documentAuthorityFixture} from './document-authority-fixture.mjs';
import {WorkspaceDocumentStore} from '../../services/workspace/src/documents/store.ts';
import {DocumentOrchestrator} from '../../services/workspace/src/documents/orchestration.ts';
import {ProjectRWGuard} from '../../services/workspace/src/policy/guard.ts';
import {buildApp} from '../../services/workspace/src/app.ts';

const requireWeb = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const React = requireWeb('react');

test('SP07 P08 Runtime DOM and end-to-end version publication journey verification', {timeout: 180000}, async (t) => {
  const f = await documentAuthorityFixture();
  let backend, vite;

  const domErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => domErrors.push(error.message));

  const listener = createServer();
  await new Promise((r) => listener.listen(0, '127.0.0.1', r));
  const port = listener.address().port;
  await new Promise((r) => listener.close(r));

  const origin = `https://localhost:${port}`;
  const cert = await readFile('.tmp/local-https/localhost.crt');
  const key = await readFile('.tmp/local-https/localhost.key');

  const docs = new WorkspaceDocumentStore(f.db.runtime, f.sessions, f.cursorKey);
  const guard = new ProjectRWGuard();

  // In-memory knowledge store and transport for versioning
  const knowledgeVersions = new Map();
  const knowledgeDocs = new Map();
  const receipts = new Map();

  const mockTransport = {
    async persist(actorId, payload, ikey) {
      const vId = randomUUID();
      const doc = {
        document_id: payload.document_id,
        project_id: payload.project_id,
        title: payload.title,
        kind: payload.kind ?? 'document',
        owner_id: payload.owner_id,
        labels: payload.labels ?? [],
        current_version_id: vId,
        revision: 1,
      };
      knowledgeDocs.set(payload.document_id, doc);
      knowledgeVersions.set(payload.document_id, [
        {
          document_id: payload.document_id,
          version_id: vId,
          state: 'current',
          content: payload.content,
          created_at: new Date('2026-11-01T10:00:00Z').toISOString(),
          revision: 1,
        },
      ]);
      return doc;
    },

    async get(documentId) {
      const doc = knowledgeDocs.get(documentId);
      if (!doc || doc.unavailable) return null;
      const versions = knowledgeVersions.get(documentId) ?? [];
      const cur = versions.find((v) => v.version_id === doc.current_version_id);
      return {document: doc, content: cur ? cur.content : ''};
    },

    async revise(actorId, payload, ikey) {
      const existing = receipts.get(ikey);
      if (existing) return {status: 200, receipt: existing};

      const doc = knowledgeDocs.get(payload.document_id);
      if (!doc || doc.unavailable) {
        const err = new Error('not_found');
        err.status = 404;
        throw err;
      }
      if (doc.revision !== payload.expected_revision) {
        const err = new Error('precondition_failed: revision mismatch');
        err.status = 409;
        throw err;
      }

      const versions = knowledgeVersions.get(payload.document_id) ?? [];
      for (const v of versions) {
        if (v.state === 'current') v.state = 'superseded';
      }

      const newVId = randomUUID();
      versions.push({
        document_id: payload.document_id,
        version_id: newVId,
        state: 'current',
        content: payload.content,
        created_at: new Date('2026-11-02T10:00:00Z').toISOString(),
        revision: doc.revision + 1,
      });

      doc.current_version_id = newVId;
      doc.revision += 1;

      const receipt = {
        document_id: payload.document_id,
        operation: 'reviseDocument',
        receipt_id: randomUUID(),
        version_id: newVId,
      };
      receipts.set(ikey, receipt);
      return {status: 201, receipt};
    },

    async archive(actorId, payload, ikey) {
      const existing = receipts.get(ikey);
      if (existing) return {status: 200, receipt: existing};

      const doc = knowledgeDocs.get(payload.document_id);
      if (!doc || doc.unavailable) {
        const err = new Error('not_found');
        err.status = 404;
        throw err;
      }
      if (doc.revision !== payload.expected_revision) {
        const err = new Error('precondition_failed: revision mismatch');
        err.status = 409;
        throw err;
      }

      const versions = knowledgeVersions.get(payload.document_id) ?? [];
      const ver = versions.find((v) => v.version_id === payload.version_id);
      if (!ver) {
        const err = new Error('not_found');
        err.status = 404;
        throw err;
      }
      if (ver.state === 'archived') {
        const err = new Error('already_archived');
        err.status = 409;
        throw err;
      }

      ver.state = 'archived';
      if (doc.current_version_id === payload.version_id) {
        doc.current_version_id = null;
      }
      doc.revision += 1;

      const receipt = {
        document_id: payload.document_id,
        operation: 'archiveVersion',
        receipt_id: randomUUID(),
        version_id: payload.version_id,
      };
      receipts.set(ikey, receipt);
      return {status: 200, receipt};
    },

    async listVersions(projectId, documentId, cursor, limit) {
      const doc = knowledgeDocs.get(documentId);
      if (!doc || doc.unavailable || doc.project_id !== projectId) return null;
      const versions = (knowledgeVersions.get(documentId) ?? []).slice();
      versions.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

      return {
        items: versions.map((v) => ({
          document_id: documentId,
          version_id: v.version_id,
          state: v.state,
          created_at: v.created_at,
        })),
        next_cursor: null,
        document_id: documentId,
        document_revision: doc.revision,
        current_version_id: doc.current_version_id,
      };
    },

    async getVersion(projectId, documentId, versionId) {
      const doc = knowledgeDocs.get(documentId);
      if (!doc || doc.unavailable || doc.project_id !== projectId) return null;
      const versions = knowledgeVersions.get(documentId) ?? [];
      const ver = versions.find((v) => v.version_id === versionId);
      if (!ver) return null;

      return {
        document_id: documentId,
        version_id: ver.version_id,
        state: ver.state,
        content: ver.content,
        content_format: 'text',
        created_at: ver.created_at,
        revision: doc.revision,
      };
    },
  };

  const orchestrator = new DocumentOrchestrator(docs, mockTransport, guard);

  backend = buildApp({
    store: f.sessions,
    projects: f.projects,
    tasks: f.tasks,
    docs,
    orchestrator,
    origin,
  });
  await backend.listen({host: '127.0.0.1', port: 0});

  const {createServer: server} = await import(pathToFileURL(requireWeb.resolve('vite')).href);
  vite = await server({
    root: fileURLToPath(new URL('../../apps/web', import.meta.url)),
    server: {
      host: '127.0.0.1',
      port,
      strictPort: true,
      hmr: false,
      https: {cert, key},
      proxy: {
        '^/api(?:/|$)': {
          target: `http://127.0.0.1:${backend.server.address().port}`,
          rewrite: (path) => path.replace(/^\/api(?=\/|$)/, '') || '/',
        },
      },
    },
  });
  await vite.listen();

  // Provision knowledge-author capability to user 0
  await f.operator.project(f.ids[0], f.project, 'knowledge-author', true, '0', 'synthetic-doc-version-ui', 'fixture author');

  let cookie = f.headers().cookie;
  const transport = (url, init = {}) =>
    new Promise((resolve, reject) => {
      const req = request(
        {
          host: '127.0.0.1',
          port,
          path: url,
          method: init.method ?? 'GET',
          ca: cert,
          headers: {...Object.fromEntries(new Headers(init.headers)), origin, cookie},
          signal: init.signal,
        },
        (res) => {
          let resBody = '';
          res.on('data', (c) => (resBody += c));
          res.on('end', () => {
            if (res.headers['set-cookie']?.[0]) cookie = res.headers['set-cookie'][0].split(';')[0];
            resolve(
              new Response(res.statusCode === 204 ? null : resBody, {
                status: res.statusCode,
                headers: {'content-type': res.headers['content-type'] ?? ''},
              })
            );
          });
        }
      );
      req.on('error', reject);
      if (init.body) req.write(init.body);
      req.end();
    });

  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: origin,
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
  const {DocumentWorkspace} = await vite.ssrLoadModule('/src/DocumentWorkspace.tsx');
  const {DocumentController} = await vite.ssrLoadModule('/src/documents.ts');

  const controller = new DocumentController(f.ids[0], f.project, () => {}, transport);
  const root = createRoot(document.getElementById('root'));

  t.after(async () => {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [name, value] of saved) {
      if (value) Object.defineProperty(globalThis, name, value);
      else delete globalThis[name];
    }
    if (vite) await vite.close();
    if (backend) await backend.close();
    await f.close();
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

  // Render initial DocumentWorkspace
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

  let createdDocId = null;

  // Journey 1: Create initial document and verify detail view
  await t.test('Journey 1: Create initial document and inspect current version detail', async () => {
    const form = document.querySelector('.create-document-form');
    assert(form, 'create form should be visible');

    form.elements.namedItem('title').value = 'Architecture Blueprint';
    form.elements.namedItem('classification').value = 'restricted';
    form.elements.namedItem('content').value = '# Blueprint v1\nInitial architecture specification.';

    await React.act(async () =>
      form.dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}))
    );
    await settle();

    const snap = controller.getSnapshot();
    assert.equal(snap.items.length, 1);
    createdDocId = snap.items[0].document_id;
    assert(createdDocId);

    // Open detail
    await React.act(async () => controller.open(createdDocId));
    await settle();

    const detailSnap = controller.getSnapshot();
    assert(detailSnap.detail);
    assert.equal(detailSnap.detail.document.title, 'Architecture Blueprint');
    assert.equal(detailSnap.detail.document.revision, 1);
    assert.equal(detailSnap.detail.content, '# Blueprint v1\nInitial architecture specification.');

    // Check DOM elements
    const pre = document.querySelector('.document-content pre');
    assert(pre);
    assert.equal(pre.textContent, '# Blueprint v1\nInitial architecture specification.');

    // Check version list contains 1 version
    const versionItems = document.querySelectorAll('.version-list .version-item');
    assert.equal(versionItems.length, 1);
    const badge = versionItems[0].querySelector('.badge');
    assert.equal(badge.textContent, 'CURRENT');
  });

  // Journey 2: Publish revision and verify explicit version labels
  await t.test('Journey 2: Publish revision and verify CURRENT and SUPERSEDED labels', async () => {
    const reviseForm = document.querySelector('.revise-document-form');
    assert(reviseForm, 'revise form should be visible in detail view');

    const textarea = reviseForm.elements.namedItem('content');
    assert(textarea);
    textarea.value = '# Blueprint v2\nUpdated revision with caching layer.';

    await React.act(async () =>
      reviseForm.dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}))
    );
    await settle();

    const detailSnap = controller.getSnapshot();
    assert(detailSnap.detail);
    assert.equal(detailSnap.detail.document.revision, 2);
    assert.equal(detailSnap.detail.content, '# Blueprint v2\nUpdated revision with caching layer.');

    const pre = document.querySelector('.document-content pre');
    assert(pre);
    assert.equal(pre.textContent, '# Blueprint v2\nUpdated revision with caching layer.');

    // Version list should now have 2 versions
    const versionItems = document.querySelectorAll('.version-list .version-item');
    assert.equal(versionItems.length, 2);

    const states = Array.from(versionItems).map((item) => item.querySelector('.badge').textContent);
    assert(states.includes('CURRENT'));
    assert(states.includes('SUPERSEDED'));
  });

  // Journey 3: Inspect historical version with banner and immutable content
  await t.test('Journey 3: Open historical version and verify banner and immutable v1 content', async () => {
    const versionItems = document.querySelectorAll('.version-list .version-item');
    const supersededItem = Array.from(versionItems).find(
      (item) => item.querySelector('.badge').textContent === 'SUPERSEDED'
    );
    assert(supersededItem, 'superseded item must exist');

    const viewButton = supersededItem.querySelector('button');
    assert(viewButton);

    await React.act(async () =>
      viewButton.dispatchEvent(new dom.window.Event('click', {bubbles: true, cancelable: true}))
    );
    await settle();

    // Banner should appear
    const banner = document.querySelector('.viewing-version-banner');
    assert(banner, 'historical version banner must be displayed');
    assert(banner.textContent.includes('Viewing Historical Version'));
    assert(banner.textContent.includes('SUPERSEDED'));

    // Content should show v1
    const pre = document.querySelector('.document-content pre');
    assert.equal(pre.textContent, '# Blueprint v1\nInitial architecture specification.');

    // Revise form should NOT be visible while viewing historical version
    const reviseForm = document.querySelector('.revise-document-form');
    assert.equal(reviseForm, null, 'revise form should be hidden during historical inspection');
  });

  // Journey 4: Archive historical version
  await t.test('Journey 4: Archive historical version and verify ARCHIVED badge', async () => {
    const banner = document.querySelector('.viewing-version-banner');
    assert(banner);

    const archiveButton = Array.from(banner.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Archive this version')
    );
    assert(archiveButton, 'archive button must be in banner');

    await React.act(async () =>
      archiveButton.dispatchEvent(new dom.window.Event('click', {bubbles: true, cancelable: true}))
    );
    await settle();

    // Feedback should show success
    const feedback = document.querySelector('.feedback');
    assert(feedback.textContent.includes('Version archived successfully.'));

    // Version list should now have ARCHIVED badge for that version
    const versionItems = document.querySelectorAll('.version-list .version-item');
    const states = Array.from(versionItems).map((item) => item.querySelector('.badge').textContent);
    assert(states.includes('ARCHIVED'), 'historical version should now be ARCHIVED');
  });

  // Journey 5: Return to Current version
  await t.test('Journey 5: Return to Current version restores live revision content', async () => {
    // Open the historical version again to test Return to Current version button
    const versionItems = document.querySelectorAll('.version-list .version-item');
    const archivedItem = Array.from(versionItems).find(
      (item) => item.querySelector('.badge').textContent === 'ARCHIVED'
    );
    assert(archivedItem, 'archived version item must exist');

    const viewButton = archivedItem.querySelector('button');
    assert(viewButton);

    await React.act(async () =>
      viewButton.dispatchEvent(new dom.window.Event('click', {bubbles: true, cancelable: true}))
    );
    await settle();

    const banner = document.querySelector('.viewing-version-banner');
    assert(banner, 'banner must be displayed when viewing historical version');

    const returnButton = Array.from(banner.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Return to Current version')
    );
    assert(returnButton, 'return button must be present');

    await React.act(async () =>
      returnButton.dispatchEvent(new dom.window.Event('click', {bubbles: true, cancelable: true}))
    );
    await settle();

    // Banner should be gone
    assert.equal(document.querySelector('.viewing-version-banner'), null);

    // Content should be back to v2
    const pre = document.querySelector('.document-content pre');
    assert.equal(pre.textContent, '# Blueprint v2\nUpdated revision with caching layer.');

    // Revise form should be back
    assert(document.querySelector('.revise-document-form'));
  });

  // Journey 6: Precondition conflict (409) displays error feedback in DOM
  await t.test('Journey 6: Precondition conflict (409) displays error feedback in DOM', async () => {
    // Attempt revision with stale expected_revision = 1 when document revision is 3 (bumped by revise + archive)
    await React.act(async () => controller.revise(createdDocId, '# Blueprint v3 conflict', 1));
    await settle();

    const feedback = document.querySelector('.feedback');
    assert(feedback);
    assert(
      feedback.textContent.includes('Revision conflict: document was concurrently updated.'),
      `expected conflict message, got: ${feedback.textContent}`
    );
  });

  // Record evidence
  const directory = 'docs/implementation/features/sp-07-version-publication/evidence/p08-20261111';
  await mkdir(directory, {recursive: true});
  const summary = {
    date: '2026-11-12',
    node: process.version,
    database: (await f.db.admin.query('SHOW server_version')).rows[0].server_version,
    image: f.db.image,
    https: true,
    tlsBypass: false,
    checks: [
      'Journey 1: native document creation and initial CURRENT version detail display',
      'Journey 2: revision publication updating <pre> content and showing CURRENT and SUPERSEDED badges',
      'Journey 3: historical version inspection displaying viewing-version-banner and immutable v1 content',
      'Journey 4: historical version archiving updating state to ARCHIVED',
      'Journey 5: return to Current version restoring active content and publish form',
      'Journey 6: CAS revision conflict (409) gracefully displaying error feedback in p.feedback',
    ],
    domErrors,
  };
  await writeFile(`${directory}/results.json`, JSON.stringify(summary, null, 2) + '\n');
});
