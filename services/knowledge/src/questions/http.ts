import {workInput} from './work.ts';
import type {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {verifyServiceKey} from '../documents/auth.ts';
import {invalid, isUuid, KnowledgeFault} from '../documents/store.ts';
import {QuestionStore, type Context, type RunContext} from './store.ts';

export function registerQuestionHttp(app: FastifyInstance, store: QuestionStore, key: string) {
  function identity(request: FastifyRequest) {
    const credential = request.headers['x-service-key'];
    const actor = request.headers['x-actor-user-id'];
    const session = request.headers['x-actor-session'];
    if (typeof credential !== 'string' || !verifyServiceKey(credential, key) ||
        typeof actor !== 'string' || !isUuid(actor) || typeof session !== 'string' || !isUuid(session)) {
      return null;
    }
    return {actor, session};
  }
  const denied = (reply: FastifyReply) => reply.code(403).send({code: 'forbidden', message: 'Service authorization required'});
  function fail(reply: FastifyReply, error: unknown) {
    const status = error instanceof KnowledgeFault ? error.status : 503;
    return reply.code(status).send({code: status === 404 ? 'not_found' : status === 400 ? 'validation_failed' : 'access_unavailable',
      message: status === 404 ? 'Resource unavailable' : 'Question service unavailable'});
  }
  app.get('/internal/handoffs/:handoff_id', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const who = identity(request);
    if (!who) return denied(reply);
    try {
      const {handoff_id} = request.params as {handoff_id: string};
      const body = request.query as RunContext;
      if (!isUuid(handoff_id) || !isUuid(body.project_id) || !isUuid(body.run_id) ||
          !/^[1-9][0-9]*$/.test(body.session_generation) || !/^[1-9][0-9]*$/.test(body.project_permission_revision)) throw invalid();
      return await store.receipt(who.actor, who.session, body, handoff_id);
    } catch (error) {
      return fail(reply, error);
    }
  });
  app.post('/internal/question-runtime/:action', {bodyLimit: 128 * 1024}, async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const who = identity(request);
    if (!who) return denied(reply);
    const {actor, session} = who;
    try {
      const {action} = request.params as {action: string};
      const body = request.body as RunContext & Record<string, any>;
      if (!body || !isUuid(body.project_id) ||
          !/^[1-9][0-9]*$/.test(body.session_generation) || !/^[1-9][0-9]*$/.test(body.project_permission_revision) ||
          !body.documents || Array.isArray(body.documents) || typeof body.documents !== 'object' ||
          Object.entries(body.documents).some(([id, revision]) => !isUuid(id) || !/^[1-9][0-9]*$/.test(revision))) throw invalid();
      if (action === 'citation') {
        const {document_id, version_id, passage_id} = body;
        if (![document_id, version_id, passage_id].every(isUuid) || !body.documents[document_id]) throw invalid();
        return await store.citation(body.project_id, {document_id, version_id, passage_id});
      }
      if (action === 'search' || action === 'start') {
        if (typeof body.question !== 'string' || !body.question.trim() || body.question.length > 1000 ||
            !['current', 'historical'].includes(body.scope)) throw invalid();
        const context: Context = body;
        return action === 'search' ? await store.search(context, body.question, body.scope) :
          await store.start(actor, context, body.question, body.scope, workInput(body.work));
      }
      if (!isUuid(body.run_id)) throw invalid();
      if (action === 'prepare') {
        if (!['provider_input', 'answer_delivery'].includes(body.purpose) || typeof body.destination !== 'string' ||
            typeof body.question !== 'string' || !Array.isArray(body.evidence)) throw invalid();
        return await store.prepare(actor, session, body, body.purpose, body.destination, body.question, body.draft, body.evidence, workInput(body.work));
      }
      if (action === 'recheck' && Array.isArray(body.evidence)) {
        await store.assertRun(actor, body);
        return await store.recheck(body, body.evidence);
      }
      if (action === 'record-handoff' && isUuid(body.handoff_id) && isUuid(body.enforcement_ref) &&
          ['completed', 'aborted', 'unknown'].includes(body.outcome)) {
        await store.recordHandoff(actor, body, body.handoff_id, body.outcome, body.enforcement_ref);
        return {recorded: true};
      }
      if (action === 'record') {
        await store.record(actor, body, body.result);
        return {recorded: true};
      }
      throw invalid();
    } catch (error) {
      return fail(reply, error);
    }
  });
}
