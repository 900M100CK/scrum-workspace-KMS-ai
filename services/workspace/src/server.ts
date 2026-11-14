import {fixtureProvider} from './questions/fixture-provider.ts';
import {readFileSync} from 'node:fs';
import {WorkspaceDocumentStore} from './documents/store.ts';
import {DocumentOrchestrator} from './documents/orchestration.ts';
import {knowledgeTransport} from './documents/transport.ts';
import {ProjectRWGuard} from './policy/guard.ts';
import {WorkspaceSprintStore} from './sprints/store.ts';
import { buildApp } from './app.ts';
import { readPort } from './config.ts';
import {sessionRuntime} from './session/runtime.ts';
import {WorkspaceProjectStore} from './projects/store.ts';
import {cursorKey} from './projects/cursor.ts';
import {WorkspaceTaskStore} from './tasks/store.ts';
const session=sessionRuntime(process.env);
const key=session?cursorKey(process.env.SACW_PROJECT_CURSOR_KEY):null;
const {SACW_KNOWLEDGE_HTTPS_URL: knowledgeUrl, SACW_DOCUMENT_SERVICE_KEY: serviceKey,
 SACW_KNOWLEDGE_TLS_CA: caPath} = process.env;
const questionProvider = fixtureProvider(process.env.SACW_SP09_FIXTURE_PROVIDER_URL);
if (questionProvider && !knowledgeUrl) throw new Error('SP-09 fixture provider requires the Knowledge service');
let documentOptions = {};
if ([knowledgeUrl, serviceKey, caPath].some(value => value !== undefined)) {
 if (!session || !key || !knowledgeUrl || !serviceKey || Buffer.byteLength(serviceKey) < 32) {
  throw new Error('Complete Workspace document session, cursor, Knowledge HTTPS URL and service key configuration is required');
 }
 let url: URL;
 try { url = new URL(knowledgeUrl); } catch { throw new Error('Invalid Knowledge HTTPS URL'); }
 if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
  throw new Error('Invalid Knowledge HTTPS origin');
 }
 const docs = new WorkspaceDocumentStore(session.pool, session.store, key);
 documentOptions = {docs, questionProvider, observationServiceKey:serviceKey, orchestrator: new DocumentOrchestrator(docs,
  knowledgeTransport(url, serviceKey, caPath ? readFileSync(caPath) : undefined), new ProjectRWGuard())};
}
const app = buildApp(session?{...documentOptions,store:session.store,origin:session.origin,projects:new WorkspaceProjectStore(session.pool,session.store,key),tasks:new WorkspaceTaskStore(session.pool,session.store,key),sprints:new WorkspaceSprintStore(session.pool,session.store,key)}:{});
app.addHook('onClose',async()=>{if(session)await session.pool.end();});
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void app.close().catch(() => { process.exitCode = 1; }); });
try {
 await app.listen({ host: '127.0.0.1', port: readPort(process.env.PORT, 3001) });
} catch (error) {
 await app.close();
 throw error;
}
