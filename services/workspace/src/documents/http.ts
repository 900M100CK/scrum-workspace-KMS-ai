import type {FastifyInstance} from 'fastify';
import cookie from '@fastify/cookie';
import {SESSION_COOKIE, sessionOrigin} from '../session/http.ts';
import {ProjectFault, projectFailure} from '../projects/outcomes.ts';
import type {WorkspaceDocumentStore} from './store.ts';
import type {DocumentOrchestrator, CreateDocumentInput} from './orchestration.ts';
import type {SetClassificationInput, GrantReadInput, RevokeReadInput} from './types.ts';

import {uuid} from '../projects/store.ts';

export interface DocumentHttpOptions {
  docs: WorkspaceDocumentStore;
  orchestrator: DocumentOrchestrator;
  origin?: string;
}

export async function registerDocumentHttp(app: FastifyInstance, options: DocumentHttpOptions) {
  await app.register(cookie);
  const origin = options.origin ? sessionOrigin(options.origin) : null;

  const extractCorrelation = (request: any): string | undefined => {
    const header = request.headers['x-correlation-id'];
    if (typeof header === 'string' && uuid(header)) return header;
    if (typeof request.id === 'string' && uuid(request.id)) return request.id;
    return undefined;
  };

  app.addHook('onRequest', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    if (!options.docs || !options.orchestrator || !origin) {
      throw new ProjectFault(503, 'access_unavailable');
    }
    const fields = (request.headers.cookie ?? '').split(';').filter((v) => v.trim().split('=')[0] === SESSION_COOKIE);
    if (fields.length !== 1 || !request.cookies[SESSION_COOKIE]) {
      throw new ProjectFault(401, 'authentication_required');
    }
    if (
      !['GET', 'HEAD'].includes(request.method) &&
      (request.headers.origin !== origin || request.headers['x-sacw-request'] !== '1')
    ) {
      throw new ProjectFault(403, 'forbidden');
    }
  });

  app.setErrorHandler((error, _request, reply) => {
    const native = error && typeof error === 'object' && 'statusCode' in error ? Number(error.statusCode) : 0;
    const fault = [400, 413, 415].includes(native) ? new ProjectFault(native, 'validation_failed') : projectFailure(error);
    return reply.code(fault.status).send(
      fault.status === 404
        ? {code: 'not_found', message: 'Resource unavailable'}
        : {
            code: fault.code,
            message:
              fault.status === 401
                ? 'Authentication required'
                : fault.status === 503
                ? 'Access unavailable'
                : fault.status === 409
                ? 'State conflict'
                : 'Request denied',
            run_id: null,
          }
    );
  });

  // POST /projects/:project_id/documents
  app.post('/projects/:project_id/documents', {bodyLimit: 65536}, async (request, reply) => {
    const key = request.headers['idempotency-key'];
    if (typeof key !== 'string' || !key) throw new ProjectFault(400, 'validation_failed');
    const {project_id} = request.params as {project_id: string};
    const result = await options.orchestrator.createDocument(
      request.cookies[SESSION_COOKIE]!,
      project_id,
      request.body as CreateDocumentInput,
      key,
      extractCorrelation(request)
    );
    return reply.code(result.status).send(result.document);
  });

  // GET /documents/:document_id/policy
  app.get('/projects/:project_id/documents/:document_id/policy', async (request, reply) => {
    const {project_id, document_id} = request.params as {project_id: string; document_id: string};
    const policy = await options.docs.getPolicy(request.cookies[SESSION_COOKIE]!, project_id, document_id);
    return reply.code(200).send(policy);
  });

  // GET /documents/:document_id/read-grants
  app.get('/projects/:project_id/documents/:document_id/read-grants', async (request, reply) => {
    const {project_id, document_id} = request.params as {project_id: string; document_id: string};
    const grants = await options.docs.listGrants(request.cookies[SESSION_COOKIE]!, project_id, document_id);
    return reply.code(200).send(grants);
  });

  // POST /documents/:document_id/classification
  app.post('/projects/:project_id/documents/:document_id/classification', async (request, reply) => {
    const key = request.headers['idempotency-key'];
    if (typeof key !== 'string' || !key) throw new ProjectFault(400, 'validation_failed');
    const {project_id, document_id} = request.params as {project_id: string; document_id: string};
    const res = await options.docs.setClassification(
      request.cookies[SESSION_COOKIE]!,
      project_id,
      document_id,
      request.body as SetClassificationInput,
      key,
      extractCorrelation(request)
    );
    return reply.code(res.status).send(res.policy);
  });

  // POST /documents/:document_id/read-grants
  app.post('/projects/:project_id/documents/:document_id/read-grants', async (request, reply) => {
    const key = request.headers['idempotency-key'];
    if (typeof key !== 'string' || !key) throw new ProjectFault(400, 'validation_failed');
    const {project_id, document_id} = request.params as {project_id: string; document_id: string};
    const res = await options.docs.grantRead(
      request.cookies[SESSION_COOKIE]!,
      project_id,
      document_id,
      request.body as GrantReadInput,
      key,
      extractCorrelation(request)
    );
    return reply.code(res.status).send({permission_revision: res.permission_revision});
  });

  // DELETE /documents/:document_id/read-grants/:user_id
  app.delete('/projects/:project_id/documents/:document_id/read-grants/:user_id', async (request, reply) => {
    const key = request.headers['idempotency-key'];
    if (typeof key !== 'string' || !key) throw new ProjectFault(400, 'validation_failed');
    const {project_id, document_id, user_id} = request.params as {
      project_id: string;
      document_id: string;
      user_id: string;
    };
    const res = await options.docs.revokeRead(
      request.cookies[SESSION_COOKIE]!,
      project_id,
      document_id,
      user_id,
      request.body as RevokeReadInput,
      key,
      extractCorrelation(request)
    );
    return reply.code(res.status).send({permission_revision: res.permission_revision});
  });
}
