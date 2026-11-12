import type {FastifyInstance} from 'fastify';
import {KnowledgeDocumentStore, isUuid, KnowledgeFault} from './store.ts';
import type {PersistDocumentInput} from './types.ts';
import {verifyServiceKey} from './auth.ts';

export function registerKnowledgeDocumentHttp(
  app: FastifyInstance,
  options: {store: KnowledgeDocumentStore; expectedKey: string}
) {
  // 1. Create Document
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

  // 2. Read Document
  app.get('/internal/documents/:document_id', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const serviceKey = request.headers['x-service-key'];
    if (typeof serviceKey !== 'string' || !verifyServiceKey(serviceKey, options.expectedKey)) {
      return reply.code(403).send({code: 'forbidden', message: 'Service authorization required'});
    }

    const {document_id} = request.params as {document_id: string};
    if (!isUuid(document_id)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Invalid document ID'});
    }
    const found = await options.store.getDocument(document_id);
    if (!found) {
      return reply.code(404).send({code: 'not_found', message: 'Resource unavailable'});
    }
    return reply.code(200).send(found);
  });

  // 3. Revise Document
  app.post('/internal/documents/:document_id/revisions', async (request, reply) => {
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

    const {document_id} = request.params as {document_id: string};
    if (!isUuid(document_id)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Invalid document ID'});
    }

    const body = (request.body ?? {}) as {
      project_id?: string;
      content?: string;
      content_format?: 'text' | 'markdown';
      expected_revision?: number;
    };

    if (!body.project_id || !isUuid(body.project_id)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Valid project_id required'});
    }
    if (typeof body.content !== 'string' || !body.content.trim()) {
      return reply.code(400).send({code: 'validation_failed', message: 'Content required'});
    }
    if (typeof body.expected_revision !== 'number' || body.expected_revision < 1 || !Number.isInteger(body.expected_revision)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Positive integer expected_revision required'});
    }

    const correlation = typeof request.headers['x-correlation-id'] === 'string' && isUuid(request.headers['x-correlation-id'])
      ? request.headers['x-correlation-id']
      : typeof request.id === 'string' && isUuid(request.id)
      ? request.id
      : undefined;

    try {
      const reviseInput = {
        content: body.content,
        expected_revision: body.expected_revision,
        ...(body.content_format ? {content_format: body.content_format} : {}),
      };
      const result = await options.store.reviseDocument(
        actor,
        body.project_id,
        document_id,
        reviseInput,
        key,
        correlation
      );
      return reply.code(result.status).send(result.receipt);
    } catch (err: any) {
      if (err instanceof KnowledgeFault) {
        return reply.code(err.status).send({code: err.code, message: err.message});
      }
      return reply.code(503).send({code: 'access_unavailable', message: 'Knowledge store unavailable'});
    }
  });

  // 4. List Versions
  app.get('/internal/documents/:document_id/versions', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const serviceKey = request.headers['x-service-key'];
    if (typeof serviceKey !== 'string' || !verifyServiceKey(serviceKey, options.expectedKey)) {
      return reply.code(403).send({code: 'forbidden', message: 'Service authorization required'});
    }

    const {document_id} = request.params as {document_id: string};
    if (!isUuid(document_id)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Invalid document ID'});
    }

    const query = (request.query ?? {}) as {
      project_id?: string;
      cursor?: string;
      limit?: string;
    };

    if (!query.project_id || !isUuid(query.project_id)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Valid project_id required'});
    }

    const limit = query.limit ? parseInt(query.limit, 10) : 20;

    const list = await options.store.listVersions(query.project_id, document_id, query.cursor, limit);
    if (!list) {
      return reply.code(404).send({code: 'not_found', message: 'Resource unavailable'});
    }
    return reply.code(200).send(list);
  });

  // 5. Get Single Version
  app.get('/internal/documents/:document_id/versions/:version_id', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const serviceKey = request.headers['x-service-key'];
    if (typeof serviceKey !== 'string' || !verifyServiceKey(serviceKey, options.expectedKey)) {
      return reply.code(403).send({code: 'forbidden', message: 'Service authorization required'});
    }

    const {document_id, version_id} = request.params as {document_id: string; version_id: string};
    if (!isUuid(document_id) || !isUuid(version_id)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Invalid document or version ID'});
    }

    const query = (request.query ?? {}) as {project_id?: string};
    if (!query.project_id || !isUuid(query.project_id)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Valid project_id required'});
    }

    const version = await options.store.getVersion(query.project_id, document_id, version_id);
    if (!version) {
      return reply.code(404).send({code: 'not_found', message: 'Resource unavailable'});
    }
    return reply.code(200).send(version);
  });

  // 6. Archive Version
  app.post('/internal/documents/:document_id/versions/:version_id/archive', async (request, reply) => {
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

    const {document_id, version_id} = request.params as {document_id: string; version_id: string};
    if (!isUuid(document_id) || !isUuid(version_id)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Invalid document or version ID'});
    }

    const body = (request.body ?? {}) as {project_id?: string; expected_revision?: number};
    if (!body.project_id || !isUuid(body.project_id)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Valid project_id required'});
    }
    if (typeof body.expected_revision !== 'number' || body.expected_revision < 1 || !Number.isInteger(body.expected_revision)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Positive integer expected_revision required'});
    }

    const correlation = typeof request.headers['x-correlation-id'] === 'string' && isUuid(request.headers['x-correlation-id'])
      ? request.headers['x-correlation-id']
      : typeof request.id === 'string' && isUuid(request.id)
      ? request.id
      : undefined;

    try {
      const result = await options.store.archiveVersion(
        actor,
        body.project_id,
        document_id,
        version_id,
        {expected_revision: body.expected_revision},
        key,
        correlation
      );
      return reply.code(result.status).send(result.receipt);
    } catch (err: any) {
      if (err instanceof KnowledgeFault) {
        return reply.code(err.status).send({code: err.code, message: err.message});
      }
      return reply.code(503).send({code: 'access_unavailable', message: 'Knowledge store unavailable'});
    }
  });

  // 7. Delete Document
  app.delete('/internal/documents/:document_id', async (request, reply) => {
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

    const {document_id} = request.params as {document_id: string};
    if (!isUuid(document_id)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Invalid document ID'});
    }

    const headerRev = request.headers['x-expected-revision'];
    const query = (request.query ?? {}) as {project_id?: string; expected_revision?: string};
    const body = (request.body ?? {}) as {project_id?: string; expected_revision?: number};

    const projectId = (typeof request.headers['x-project-id'] === 'string' ? request.headers['x-project-id'] : undefined)
      ?? query.project_id
      ?? body.project_id;

    if (!projectId || !isUuid(projectId)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Valid project_id required'});
    }

    const rawRevision = headerRev ?? query.expected_revision ?? body.expected_revision;
    const expectedRevision = typeof rawRevision === 'number' ? rawRevision : parseInt(String(rawRevision), 10);
    if (!expectedRevision || expectedRevision < 1 || !Number.isInteger(expectedRevision)) {
      return reply.code(400).send({code: 'validation_failed', message: 'Positive integer expected_revision required'});
    }

    const correlation = typeof request.headers['x-correlation-id'] === 'string' && isUuid(request.headers['x-correlation-id'])
      ? request.headers['x-correlation-id']
      : typeof request.id === 'string' && isUuid(request.id)
      ? request.id
      : undefined;

    try {
      const result = await options.store.deleteDocument(
        actor,
        projectId,
        document_id,
        expectedRevision,
        key,
        correlation
      );
      return reply.code(result.status).send();
    } catch (err: any) {
      if (err instanceof KnowledgeFault) {
        return reply.code(err.status).send({code: err.code, message: err.message});
      }
      return reply.code(503).send({code: 'access_unavailable', message: 'Knowledge store unavailable'});
    }
  });
}
