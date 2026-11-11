import type {FastifyInstance} from 'fastify';
import {KnowledgeDocumentStore, isUuid, KnowledgeFault} from './store.ts';
import type {PersistDocumentInput} from './types.ts';
import {verifyServiceKey} from './auth.ts';

export function registerKnowledgeDocumentHttp(
  app: FastifyInstance,
  options: {store: KnowledgeDocumentStore; expectedKey: string}
) {
  app.post('/internal/documents', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const serviceKey = request.headers['x-service-key'];
    if (typeof serviceKey !== 'string' || !verifyServiceKey(serviceKey, options.expectedKey)) {
      return reply.code(403).send({code: 'forbidden', message: 'Service authorization required'});
    }

    const actor = request.headers['x-actor-user-id'];
    if (typeof actor !== 'string' || !isUuid(actor)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Actor identity required'});
    }

    const key = request.headers['idempotency-key'];
    if (typeof key !== 'string' || !key) {
      return reply.code(400).send({code: 'validation_failed', message: 'Idempotency-Key required'});
    }

    const correlation = typeof request.headers['x-correlation-id'] === 'string' && isUuid(request.headers['x-correlation-id'])
      ? request.headers['x-correlation-id']
      : typeof request.id === 'string' && isUuid(request.id)
      ? request.id
      : undefined;

    try {
      const result = await options.store.persistDocument(
        actor,
        request.body as PersistDocumentInput,
        key,
        correlation
      );
      return reply.code(result.status).send(result.document);
    } catch (err: any) {
      if (err instanceof KnowledgeFault) {
        return reply.code(err.status).send({code: err.code, message: err.message});
      }
      return reply.code(503).send({code: 'access_unavailable', message: 'Knowledge store unavailable'});
    }
  });

  app.get('/internal/documents/:document_id', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const serviceKey = request.headers['x-service-key'];
    if (typeof serviceKey !== 'string' || !verifyServiceKey(serviceKey, options.expectedKey)) {
      return reply.code(403).send({code: 'forbidden', message: 'Service authorization required'});
    }

    const {document_id} = request.params as {document_id: string};
    const found = await options.store.getDocument(document_id);
    if (!found) {
      return reply.code(404).send({code: 'not_found', message: 'Resource unavailable'});
    }
    return reply.code(200).send(found);
  });
}
