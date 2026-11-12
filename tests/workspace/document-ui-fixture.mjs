import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createServer} from 'node:net';
import {request} from 'node:https';
import {randomUUID} from 'node:crypto';
import {documentAuthorityFixture} from './document-authority-fixture.mjs';
import {WorkspaceDocumentStore} from '../../services/workspace/src/documents/store.ts';
import {DocumentOrchestrator} from '../../services/workspace/src/documents/orchestration.ts';
import {ProjectRWGuard} from '../../services/workspace/src/policy/guard.ts';
import {buildApp} from '../../services/workspace/src/app.ts';
import {ScryptVerifier} from '../../services/workspace/src/session/kdf.ts';

const requireWeb = createRequire(new URL('../../apps/web/package.json', import.meta.url));

export async function documentUiFixture() {
  const f = await documentAuthorityFixture();
  let backend, vite;

  try {
    const docs = new WorkspaceDocumentStore(f.db.runtime, f.sessions, f.cursorKey);
    const guard = new ProjectRWGuard();

    const mockKnowledgeStore = new Map();
    const mockTransport = {
      async persist(actorId, payload) {
        const result = {
          document_id: payload.document_id,
          project_id: payload.project_id,
          title: payload.title,
          kind: payload.kind ?? 'document',
          owner_id: payload.owner_id,
          labels: payload.labels ?? [],
          current_version_id: randomUUID(),
          revision: 1,
        };
        mockKnowledgeStore.set(payload.document_id, {document: result, content: payload.content});
        return result;
      },
      async get(documentId) {
        return mockKnowledgeStore.get(documentId) ?? null;
      },
    };

    const orchestrator = new DocumentOrchestrator(docs, mockTransport, guard);

    const listener = createServer();
    await new Promise((r) => listener.listen(0, '127.0.0.1', r));
    const port = listener.address().port;
    await new Promise((r) => listener.close(r));

    const origin = `https://localhost:${port}`;
    const cert = await readFile('.tmp/local-https/localhost.crt');
    const key = await readFile('.tmp/local-https/localhost.key');

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

    await f.operator.project(f.ids[0], f.project, 'knowledge-author', true, '0', 'synthetic-doc-ui', 'fixture author');
    await f.projects.add(f.tokens[0], f.project, {user_id: f.ids[1], role: 'developer'}, randomUUID());

    const browserUser = randomUUID();
    const username = 'synthetic-browser-doc-user';
    const password = 'synthetic-doc-browser-password';

    await f.authOperator.provision(browserUser, username, await new ScryptVerifier().hash(password), 'synthetic-doc-ui');
    await f.projects.add(f.tokens[0], f.project, {user_id: browserUser, role: 'developer'}, randomUUID());
    await f.operator.project(browserUser, f.project, 'knowledge-author', true, '0', 'synthetic-doc-ui', 'fixture author');

    let cookie = f.headers().cookie;
    const transport = (url, init) =>
      new Promise((resolve, reject) => {
        const req = request(
          {
            host: '127.0.0.1',
            port,
            path: url,
            method: init.method,
            ca: cert,
            headers: {...Object.fromEntries(new Headers(init.headers)), origin, cookie},
            signal: init.signal,
          },
          (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => {
              if (res.headers['set-cookie']?.[0]) cookie = res.headers['set-cookie'][0].split(';')[0];
              resolve(
                new Response(res.statusCode === 204 ? null : body, {
                  status: res.statusCode,
                  headers: {'content-type': res.headers['content-type'] ?? ''},
                })
              );
            });
          }
        );
        req.on('error', reject);
        req.end(init.body);
      });

    return {
      ...f,
      docs,
      orchestrator,
      vite,
      origin,
      transport,
      browserUser,
      username,
      password,
      async close() {
        if (vite) await vite.close();
        if (backend) await backend.close();
        await f.close();
      },
    };
  } catch (error) {
    if (vite) await vite.close();
    if (backend) await backend.close();
    await f.close();
    throw error;
  }
}
