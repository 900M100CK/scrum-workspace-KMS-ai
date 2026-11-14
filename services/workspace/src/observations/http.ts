import {timingSafeEqual} from 'node:crypto';
import type {FastifyInstance} from 'fastify';
import type {DocumentHttpOptions} from '../documents/http.ts';
import {deliverDocument} from '../documents/delivery.ts';
import {invalid, missing, ProjectFault} from '../projects/outcomes.ts';
import {uuid} from '../projects/store.ts';
import {ownedTransaction} from '../session/database.ts';
import {SESSION_COOKIE} from '../session/http.ts';
import {observe, type Kind} from './store.ts';

export function registerBlockedTasks(app: FastifyInstance, {docs,orchestrator}: DocumentHttpOptions) {
  app.get('/projects/:project_id/observations/blocked-tasks', async (request,reply) => {
    const {project_id} = request.params as {project_id:string};
    if (!uuid(project_id)) throw missing();
    const project = project_id.toLowerCase();
    const token = request.cookies[SESSION_COOKIE]!;
    await deliverDocument(orchestrator,token,project,reply,
      () => docs.projects.transaction(token,async (client,actor,current) => {
        const snapshot = await observe(client,actor,project,{kind:'task',blocked:true});
        return await current() ? snapshot : null;
      }),() => [],false,() => 200,
      ({entities,observed_at,observation_revision}) => ({entities,observed_at,observation_revision}),
      async (client,actor,original) => {
        const fresh = await observe(client,actor,project,{kind:'task',blocked:true});
        if (original.fingerprint !== fresh.fingerprint) throw new ProjectFault(503,'access_unavailable');
      });
  });
}

export function registerWorkObservations(app: FastifyInstance, {docs,observationServiceKey}: DocumentHttpOptions) {
  if (!observationServiceKey) return;
  const expected = Buffer.from(observationServiceKey);
  app.post('/internal/observations', {bodyLimit:8192}, async (request,reply) => {
    reply.header('Cache-Control','no-store');
    const key = Buffer.from(typeof request.headers['x-service-key'] === 'string' ? request.headers['x-service-key'] : '');
    const actor = request.headers['x-actor-user-id'];
    const session = request.headers['x-actor-session'];
    if (key.length !== expected.length || !timingSafeEqual(key,expected) ||
        typeof actor !== 'string' || !uuid(actor) || typeof session !== 'string' || !uuid(session)) {
      return reply.code(403).send({code:'forbidden',message:'Service authorization required',run_id:null});
    }
    const body = request.body as {project_id:string;entity_kind:Kind;entity_ids?:string[]};
    if (!body || Object.keys(body).some(k=>!['project_id','entity_kind','entity_ids'].includes(k)) ||
        typeof body.project_id !== 'string' || !uuid(body.project_id) || !['project','sprint','task'].includes(body.entity_kind) ||
        (body.entity_ids !== undefined && (!Array.isArray(body.entity_ids) || body.entity_ids.length > 128 ||
          body.entity_ids.some(id=>typeof id!=='string'||!uuid(id)) ||
          new Set(body.entity_ids.map(id=>id.toLowerCase())).size!==body.entity_ids.length))) {
      return reply.code(400).send({code:invalid().code,message:'Invalid selector',run_id:null});
    }
    const result = await ownedTransaction(docs.projects.pool,'runtime',async client => {
      const auth = await docs.projects.sessions.inspectServiceSession(client,session,actor);
      if (auth.kind !== 'authenticated') return auth;
      const {entities,observed_at,observation_revision} = await observe(client,actor,body.project_id.toLowerCase(),
        {kind:body.entity_kind,...(body.entity_ids ? {ids:body.entity_ids.map(id=>id.toLowerCase())} : {})});
      return {entities,observed_at,observation_revision};
    });
    if ('kind' in result) throw new ProjectFault(result.kind==='unauthenticated'?401:503,
      result.kind==='unauthenticated'?'authentication_required':'access_unavailable');
    return result;
  });
}
