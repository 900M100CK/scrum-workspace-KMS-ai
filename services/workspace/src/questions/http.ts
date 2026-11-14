import type {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {performance} from 'node:perf_hooks';
import {deliverDocument} from '../documents/delivery.ts';
import type {DocumentHttpOptions} from '../documents/http.ts';
import {SESSION_COOKIE} from '../session/http.ts';
import {invalid, missing, ProjectFault} from '../projects/outcomes.ts';
import {uuid} from '../projects/store.ts';
import {currentContext, Handoff, unavailable, type Evidence, type KnowledgeCall, type SendResult} from './handoff.ts';
import {FixtureProviderFailure, fixtureModel, relay} from './fixture-provider.ts';

type Source = {document_id: string; version_id: string; passage_id: string; source_id: string; excerpt: string};
type SearchResult = {items: Source[]; next_cursor: null};
type Started = {run_id: string; evidence: Evidence[]; sources: Source[]};

function questionInput(request: FastifyRequest, field: 'query' | 'question') {
  const body = request.body as Record<string, unknown> | undefined;
  if (!body || Object.keys(body).some(key => ![field, 'scope', 'project_id', ...(field === 'query' ? ['cursor'] : [])].includes(key)) ||
      typeof body[field] !== 'string' || !body[field].trim() || body[field].length > 1000 ||
      body[field].includes(String.fromCharCode(0)) || (body.scope !== 'current' && body.scope !== 'historical') ||
      body.cursor != null) throw invalid();
  return {text: body[field].trim(), scope: body.scope};
}

function sendBrowser(reply: FastifyReply, bytes: Buffer, signal: AbortSignal): Promise<SendResult<true>> {
  const response = reply.raw;
  if (response.destroyed || signal.aborted) return Promise.resolve({outcome: 'aborted'});
  return new Promise(resolve => {
    const abort = () => response.destroy();
    const deadline = setTimeout(abort, 350);
    const cleanup = () => {
      clearTimeout(deadline);
      signal.removeEventListener('abort', abort);
      response.off('close', closed);
      response.off('finish', finished);
    };
    const closed = () => { cleanup(); resolve({outcome: 'unknown'}); };
    const finished = () => { cleanup(); resolve({outcome: 'completed', value: true}); };
    signal.addEventListener('abort', abort, {once: true});
    response.once('close', closed);
    response.once('finish', finished);
    reply.type('application/json').send(bytes);
  });
}

export function registerProjectQuestions(app: FastifyInstance, options: DocumentHttpOptions) {
  const {orchestrator, docs, questionProvider} = options;
  const projects = docs.projects;
  const handoff = new Handoff(orchestrator);

  async function context(request: FastifyRequest, project: string) {
    const token = request.cookies[SESSION_COOKIE]!;
    const auth = await projects.sessions.inspect(token);
    if (auth.kind !== 'authenticated') {
      if (auth.kind === 'unauthenticated') throw new ProjectFault(401, 'authentication_required');
      throw unavailable();
    }
    const who = {actor: auth.session.userId, session: auth.session.sessionId};
    const transport = orchestrator.transport.question;
    if (!transport) throw unavailable();
    const call: KnowledgeCall = (action, body) => transport(who, action, body);
    const access = await projects.transaction(token, async (client, actor, current) => {
      if (actor !== who.actor) throw unavailable();
      const now = await currentContext(client, who, project);
      return await current() ? now : null;
    });
    return {who, token, call, access};
  }

  function projectId(request: FastifyRequest) {
    const {project_id} = request.params as {project_id: string};
    if (!uuid(project_id)) throw missing();
    const project = project_id.toLowerCase();
    const selector = (request.body as {project_id?: unknown} | undefined)?.project_id;
    if (selector !== undefined && (typeof selector !== 'string' || selector.toLowerCase() !== project)) throw invalid();
    return project;
  }

  app.post('/projects/:project_id/search/semantic', {bodyLimit: 8192}, async (request, reply) => {
    const project = projectId(request);
    const {text, scope} = questionInput(request, 'query');
    await deliverDocument(orchestrator, request.cookies[SESSION_COOKIE]!, project, reply, async () => {
      const {call, access} = await context(request, project);
      return call<SearchResult>('search', {...access, question: text, scope});
    }, value => value.items.map(item => item.document_id));
  });

  app.get('/projects/:project_id/citations/:document_id/:version_id/:passage_id', async (request, reply) => {
    const project = projectId(request);
    const {document_id, version_id, passage_id} = request.params as Record<string, string>;
    if (!document_id || !version_id || !passage_id || ![document_id, version_id, passage_id].every(uuid)) throw missing();
    await deliverDocument(orchestrator, request.cookies[SESSION_COOKIE]!, project, reply, async () => {
      const {call, access} = await context(request, project);
      if (!access.documents[document_id]) throw missing();
      return call('citation', {...access, document_id, version_id, passage_id});
    }, () => [document_id]);
  });

  app.post('/projects/:project_id/questions', {bodyLimit: 8192}, async (request, reply) => {
    const project = projectId(request);
    const {text: question, scope} = questionInput(request, 'question');
    const {who, token, call, access} = await context(request, project);
    if (!questionProvider) throw unavailable();
    const controller = new AbortController();
    const close = () => controller.abort();
    reply.raw.once('close', close);
    const startedAt = performance.now();
    const duration = () => Math.round(performance.now() - startedAt);
    let bytes = 0;
    let run: (typeof access & {run_id: string}) | undefined;
    let status = 'provider_unavailable';
    try {
      const started = await call<Started>('start', {...access, question, scope});
      run = {...access, run_id: started.run_id};
      const common = {who, token, call, run, question, evidence: started.evidence, signal: controller.signal};
      const outbound = await handoff.send({
        ...common, purpose: 'provider_input', destination: questionProvider.href,
        expectedPayload: {model: fixtureModel, run_id: run.run_id, question, sources: started.sources.map(
          ({source_id, document_id, version_id, passage_id, excerpt}) => ({source_id, document_id, version_id, passage_id, excerpt}))},
        transmit: (payload, signal) => {
          bytes = payload.length;
          return relay(questionProvider, payload, signal);
        },
      });
      // The transport's request write finished inside the guard. Generation can
      // finish after a revocation, so its draft still needs a second handoff.
      const draft = await outbound.response;
      status = 'answer_withheld';
      await handoff.send({
        ...common, purpose: 'answer_delivery', destination: 'workspace-browser-answer:' + request.id,
        draft, expectedPayload: draft, transmit: (payload, signal) => sendBrowser(reply, payload, signal),
      });
      status = 'completed';
    } catch (error) {
      if (error instanceof FixtureProviderFailure) status = error.category;
      if (!reply.sent && !reply.raw.destroyed) {
        return status === 'answer_withheld'
          ? reply.code(503).send({code: 'answer_withheld', message: 'Unable to provide this answer'})
          : reply.code(503).send({code: status === 'provider_budget_exhausted' ? 'budget_exhausted' : status,
            run_id: run?.run_id ?? null,
            message: status === 'provider_timeout' ? 'Question provider timed out' :
              status === 'provider_budget_exhausted' ? 'Question provider budget exhausted' : 'Question service unavailable'});
      }
    } finally {
      reply.raw.off('close', close);
      if (run) await call('record', {...run, result: {status, duration: duration(), bytes}}).catch(() => {});
    }
  });
}
