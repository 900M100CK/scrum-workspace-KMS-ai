import type {FastifyInstance} from 'fastify';
import {verifyServiceKey} from './auth.ts';
import {KnowledgeDiscovery, kinds, validIds, type LinkInput} from './discovery.ts';
import {isUuid, KnowledgeFault, invalid, type KnowledgeDocumentStore} from './store.ts';

export function registerDiscoveryHttp(app: FastifyInstance, options: {store: KnowledgeDocumentStore; expectedKey: string}) {
  const discovery = new KnowledgeDiscovery(options.store.pool);
  app.post('/internal/discovery/:action', {bodyLimit: 1048576}, async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const serviceKey = request.headers['x-service-key'];
    const actor = request.headers['x-actor-user-id'];
    if (typeof serviceKey !== 'string' || !verifyServiceKey(serviceKey, options.expectedKey) ||
        typeof actor !== 'string' || !isUuid(actor)) {
      return reply.code(403).send({code: 'forbidden', message: 'Service authorization required'});
    }
    try {
      const {action} = request.params as {action: string};
      const body = request.body as Record<string, unknown>;
      if (!body || typeof body !== 'object' || !isUuid(body.project_id as string)) throw invalid();
      const project = body.project_id as string;
      if (action === 'create-link') {
        const input = body as LinkInput;
        const key = request.headers['idempotency-key'];
        const correlation = request.headers['x-correlation-id'];
        if (!kinds.includes(input.from_kind) || !kinds.includes(input.to_kind) ||
            !isUuid(input.from_id) || !isUuid(input.to_id) || typeof input.relation !== 'string' ||
            !input.relation.trim() || input.relation.length > 120 || input.relation.includes(String.fromCharCode(0)) ||
            typeof key !== 'string' || !key.trim() || key.length > 128 || typeof correlation !== 'string' || !isUuid(correlation)) {
          throw invalid();
        }
        const {project_id, from_kind, from_id, to_kind, to_id, relation} = input;
        return reply.code(201).send(await discovery.create(actor, {project_id, from_kind, from_id, to_kind, to_id, relation}, key, correlation));
      }
      const {documents, offset} = body;
      if (!validIds(documents) || typeof offset !== 'number' || !Number.isSafeInteger(offset) || offset < 0) throw invalid();
      if (action === 'links') {
        const {endpoint, tasks, sprints} = body;
        if ((endpoint !== null && !isUuid(endpoint as string)) || !validIds(tasks) || !validIds(sprints)) throw invalid();
        return await discovery.links(project, endpoint as string | null, tasks, sprints, documents, offset);
      }
      if (action === 'keyword') {
        const {query, scope} = body;
        if (typeof query !== 'string' || !query.trim() || query.length > 300 ||
            query.includes(String.fromCharCode(0)) || (scope !== 'current' && scope !== 'historical')) throw invalid();
        return await discovery.keyword(project, documents, query, scope, offset);
      }
      return reply.code(404).send({code: 'not_found', message: 'Resource unavailable'});
    } catch (error) {
      const status = error instanceof KnowledgeFault ? error.status : 503;
      const code = error instanceof KnowledgeFault ? error.code : 'access_unavailable';
      return reply.code(status).send({code, message: status === 404 ? 'Resource unavailable' : 'Discovery unavailable'});
    }
  });
}
