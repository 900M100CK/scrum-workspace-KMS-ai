import {readFileSync} from 'node:fs';
import pg from 'pg';
import {KnowledgeDocumentStore} from './documents/store.ts';
import { buildApp } from './app.ts';
import { readPort } from './config.ts';
const {SACW_KNOWLEDGE_DATABASE_URL: database, SACW_DOCUMENT_SERVICE_KEY: serviceKey,
 SACW_KNOWLEDGE_TLS_CERT: certificate, SACW_KNOWLEDGE_TLS_KEY: privateKey} = process.env;
const configured = [database, serviceKey, certificate, privateKey].some(value => value !== undefined);
let pool: pg.Pool | undefined;
let runtime: Parameters<typeof buildApp>[0];
if (configured) {
 if (!database || !serviceKey || Buffer.byteLength(serviceKey) < 32 || !certificate || !privateKey) {
  throw new Error('Complete Knowledge document database, service key and TLS configuration is required');
 }
 let url: URL;
 try { url = new URL(database); } catch { throw new Error('Invalid Knowledge database configuration'); }
 if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.username !== 'knowledge_app' || url.pathname !== '/knowledge_db') {
  throw new Error('Use the Knowledge runtime database identity');
 }
 const tls = {cert: readFileSync(certificate), key: readFileSync(privateKey)};
 pool = new pg.Pool({connectionString: database, max: 4, connectionTimeoutMillis: 1200});
 pool.on('error', () => {});
 runtime = {tls, store: new KnowledgeDocumentStore(pool), expectedKey: serviceKey};
}
const app = buildApp(runtime);
app.addHook('onClose', async () => { await pool?.end(); });
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void app.close().catch(() => { process.exitCode = 1; }); });
try {
 await app.listen({ host: '127.0.0.1', port: readPort(process.env.PORT, 3002) });
} catch (error) {
 await app.close();
 throw error;
}
