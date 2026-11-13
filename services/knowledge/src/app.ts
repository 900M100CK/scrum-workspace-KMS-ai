import {registerDiscoveryHttp} from './documents/discovery-http.ts';
import type {ServerOptions} from 'node:https';
import {registerKnowledgeDocumentHttp} from './documents/http.ts';
import type {KnowledgeDocumentStore} from './documents/store.ts';
import Fastify from 'fastify';
export function buildApp(options?: {tls: ServerOptions; store: KnowledgeDocumentStore; expectedKey: string}) {
 const app = Fastify({ ...(options ? {https: options.tls} : {}), logger: false, ajv: { customOptions: { removeAdditional: false, coerceTypes: false, useDefaults: false } } });
 if (options) app.register(async scope => {
  scope.addHook('onRequest', async (request, reply) => {
   const session = request.headers['x-actor-session'];
   if (typeof session !== 'string' || !/^[0-9a-f-]{36}$/i.test(session)) {
    return reply.code(403).send({code: 'forbidden', message: 'Service authorization required'});
   }
  });
  registerKnowledgeDocumentHttp(scope, options);
  registerDiscoveryHttp(scope, options);
 });
 app.get('/healthz', async () => ({ status: 'ok', service: 'knowledge' }));
 app.setNotFoundHandler((_request, reply) => reply.code(404).send({ code: 'not_found', message: 'Resource unavailable' }));
 return app;
}
