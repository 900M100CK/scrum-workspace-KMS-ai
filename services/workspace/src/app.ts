import Fastify from 'fastify';
export function buildApp() {
 const app = Fastify({ logger: false, ajv: { customOptions: { removeAdditional: false, coerceTypes: false, useDefaults: false } } });
 app.get('/healthz', async () => ({ status: 'ok', service: 'workspace' }));
 app.setNotFoundHandler((_request, reply) => reply.code(404).send({ code: 'not_found', message: 'Resource unavailable' }));
 return app;
}
