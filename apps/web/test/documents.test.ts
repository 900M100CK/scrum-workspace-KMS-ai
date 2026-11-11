import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {DocumentController} from '../src/documents.ts';

test('SP06 P11 DocumentController manages client state and document actions', async (t) => {
  const actor = '00000000-0000-0000-0000-000000000001';
  const project = '00000000-0000-0000-0000-000000000002';
  const docId = '00000000-0000-0000-0000-000000000003';

  let sessionExpired = false;
  const onExpired = () => {
    sessionExpired = true;
  };

  const requests: Array<{url: string; method?: string | undefined; body?: any}> = [];

  const fakeTransport = async (url: string, init: RequestInit = {}) => {
    requests.push({url, method: init.method, body: init.body ? JSON.parse(String(init.body)) : undefined});

    if (url === `/api/projects/${project}/documents` && (!init.method || init.method === 'GET')) {
      return new Response(
        JSON.stringify({
          items: [
            {
              document_id: docId,
              project_id: project,
              title: 'Test Guideline',
              kind: 'document',
              content_owner_id: actor,
              classification: 'restricted',
              labels: ['arch'],
              current_version_id: 'v-1',
              revision: 1,
            },
          ],
        }),
        {status: 200, headers: {'Content-Type': 'application/json'}}
      );
    }

    if (url === `/api/projects/${project}/documents` && init.method === 'POST') {
      return new Response(
        JSON.stringify({
          document_id: '00000000-0000-0000-0000-000000000004',
          project_id: project,
          title: 'Newly Created',
          kind: 'document',
          content_owner_id: actor,
          classification: 'project_shared',
          labels: [],
          current_version_id: 'v-2',
          revision: 1,
        }),
        {status: 201, headers: {'Content-Type': 'application/json'}}
      );
    }

    if (url === `/api/projects/${project}/documents/${docId}` && (!init.method || init.method === 'GET')) {
      return new Response(
        JSON.stringify({
          document: {
            document_id: docId,
            project_id: project,
            title: 'Test Guideline',
            kind: 'document',
            content_owner_id: actor,
            classification: 'restricted',
            labels: ['arch'],
            current_version_id: 'v-1',
            revision: 1,
          },
          content: 'Secret architecture content.',
        }),
        {status: 200, headers: {'Content-Type': 'application/json'}}
      );
    }

    if (url === `/api/projects/${project}/documents/${docId}/policy`) {
      return new Response(
        JSON.stringify({
          document_id: docId,
          project_id: project,
          classification: 'restricted',
          registry_state: 'active',
          permission_revision: 1,
        }),
        {status: 200, headers: {'Content-Type': 'application/json'}}
      );
    }

    if (url === `/api/projects/${project}/documents/${docId}/read-grants` && (!init.method || init.method === 'GET')) {
      return new Response(
        JSON.stringify({
          document_id: docId,
          project_id: project,
          permission_revision: 1,
          grants: [{user_id: actor, grant_generation: 1, membership_generation: 1, revision: 1}],
        }),
        {status: 200, headers: {'Content-Type': 'application/json'}}
      );
    }

    if (url === `/api/projects/${project}/documents/${docId}/read-grants` && init.method === 'POST') {
      return new Response(JSON.stringify({permission_revision: 2}), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      });
    }

    if (url.includes(`/read-grants/`) && init.method === 'DELETE') {
      return new Response(JSON.stringify({permission_revision: 3}), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      });
    }

    if (url === `/api/projects/${project}/documents/${docId}/classification` && init.method === 'POST') {
      return new Response(
        JSON.stringify({
          document_id: docId,
          project_id: project,
          classification: 'project_shared',
          registry_state: 'active',
          permission_revision: 4,
        }),
        {status: 200, headers: {'Content-Type': 'application/json'}}
      );
    }

    return new Response(JSON.stringify({code: 'not_found', message: 'Resource unavailable'}), {status: 404});
  };

  const controller = new DocumentController(actor, project, onExpired, fakeTransport);

  await t.test('refresh loads documents into snapshot', async () => {
    await controller.refresh();
    const snap = controller.getSnapshot();
    assert.equal(snap.items.length, 1);
    const item = snap.items[0];
    assert(item);
    assert.equal(item.title, 'Test Guideline');
    assert.equal(item.classification, 'restricted');
  });

  await t.test('open loads detail, content, policy and grants', async () => {
    await controller.open(docId);
    const snap = controller.getSnapshot();
    const detail = snap.detail;
    if (!detail || !detail.policy || !detail.grants) {
      throw new Error('Expected detail, policy and grants to be defined');
    }
    assert.equal(detail.document.document_id, docId);
    assert.equal(detail.content, 'Secret architecture content.');
    assert.equal(detail.policy.permission_revision, 1);
    assert.equal(detail.grants.length, 1);
  });

  await t.test('create sends request and refreshes explorer', async () => {
    await controller.create('Newly Created', 'project_shared', 'Hello world');
    const snap = controller.getSnapshot();
    assert(snap.message.includes('created successfully'));
  });

  await t.test('grantRead and revokeRead update detail', async () => {
    const grantee = '00000000-0000-0000-0000-000000000099';
    await controller.grantRead(docId, grantee, 1);
    assert(requests.some((r) => r.url.endsWith('/read-grants') && r.method === 'POST'));

    await controller.revokeRead(docId, grantee, 2);
    assert(requests.some((r) => r.url.includes(`/read-grants/${grantee}`) && r.method === 'DELETE'));
  });

  await t.test('setClassification sends classification update', async () => {
    await controller.setClassification(docId, 'project_shared', 3);
    assert(requests.some((r) => r.url.endsWith('/classification') && r.method === 'POST'));
  });

  await t.test('DocumentWorkspace renders static markup with accessibility markup', async () => {
    const server = await createServer({
      root: fileURLToPath(new URL('..', import.meta.url)),
      server: {middlewareMode: true, hmr: false},
      appType: 'custom',
    });
    try {
      const {DocumentWorkspace} = await server.ssrLoadModule('/src/DocumentWorkspace.tsx');
      const html = renderToStaticMarkup(
        createElement(DocumentWorkspace, {
          userId: actor,
          projectId: project,
          onSessionLost: onExpired,
          controller,
        })
      );

      assert.match(html, /<h4 id="documents-title">Documents<\/h4>/);
      assert.match(html, /role="status" aria-live="polite"/);
      assert.match(html, /Test Guideline/);
      assert.match(html, /Secret architecture content/);
      assert.match(html, /Manage Access/);
    } finally {
      await server.close();
    }
  });
});
