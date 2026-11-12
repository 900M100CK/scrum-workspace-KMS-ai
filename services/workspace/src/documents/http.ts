import type {FastifyInstance} from 'fastify';
import cookie from '@fastify/cookie';
import {SESSION_COOKIE, sessionOrigin} from '../session/http.ts';
import {ProjectFault, projectFailure} from '../projects/outcomes.ts';
import type {WorkspaceDocumentStore} from './store.ts';
import type {
  DocumentOrchestrator,
  CreateDocumentInput,
  ReviseDocumentInput,
  ArchiveVersionInput,
} from './orchestration.ts';
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
    const headerRev = request.headers['x-expected-revision'];
    const body = (request.body as RevokeReadInput) ?? ({} as RevokeReadInput);
    if (body.expected_revision === undefined && typeof headerRev === 'string' && /^[1-9][0-9]*$/.test(headerRev)) {
      body.expected_revision = Number(headerRev);
    }
    const res = await options.docs.revokeRead(
      request.cookies[SESSION_COOKIE]!,
      project_id,
      document_id,
      user_id,
      body,
      key,
      extractCorrelation(request)
    );
    return reply.code(res.status).send({permission_revision: res.permission_revision});
  });

  // GET /projects/:project_id/documents (Explorer read)
  app.get('/projects/:project_id/documents', async (request, reply) => {
    const {project_id} = request.params as {project_id: string};
    const items = await options.orchestrator.listDocuments(request.cookies[SESSION_COOKIE]!, project_id);
    return reply.code(200).send({items, next_cursor: null});
  });

  // GET /projects/:project_id/documents/:document_id (Detail read)
  app.get('/projects/:project_id/documents/:document_id', async (request, reply) => {
    const {project_id, document_id} = request.params as {project_id: string; document_id: string};
    const detail = await options.orchestrator.getDocument(request.cookies[SESSION_COOKIE]!, project_id, document_id);
    return reply.code(200).send(detail);
  });

  // GET /projects/:project_id/documents/:document_id/versions (History list)
  app.get('/projects/:project_id/documents/:document_id/versions', async (request, reply) => {
    const {project_id, document_id} = request.params as {project_id: string; document_id: string};
    const query = (request.query ?? {}) as {cursor?: string; limit?: string};
    const limit = query.limit ? parseInt(query.limit, 10) : undefined;
    const list = await options.orchestrator.listVersions(
      request.cookies[SESSION_COOKIE]!,
      project_id,
      document_id,
      query.cursor,
      limit
    );
    return reply.code(200).send(list);
  });

  // GET /projects/:project_id/documents/:document_id/versions/:version_id (Exact version read)
  app.get('/projects/:project_id/documents/:document_id/versions/:version_id', async (request, reply) => {
    const {project_id, document_id, version_id} = request.params as {
      project_id: string;
      document_id: string;
      version_id: string;
    };
    const version = await options.orchestrator.getVersion(
      request.cookies[SESSION_COOKIE]!,
      project_id,
      document_id,
      version_id
    );
    return reply.code(200).send(version);
  });

  // POST /projects/:project_id/documents/:document_id/revisions
  app.post('/projects/:project_id/documents/:document_id/revisions', {bodyLimit: 65536}, async (request, reply) => {
    const key = request.headers['idempotency-key'];
    if (typeof key !== 'string' || !key) throw new ProjectFault(400, 'validation_failed');
    const {project_id, document_id} = request.params as {project_id: string; document_id: string};
    const result = await options.orchestrator.reviseDocument(
      request.cookies[SESSION_COOKIE]!,
      project_id,
      document_id,
      request.body as ReviseDocumentInput,
      key,
      extractCorrelation(request)
    );
    return reply.code(result.status).send(result.receipt);
  });

  // POST /projects/:project_id/documents/:document_id/versions/:version_id/archive
  app.post('/projects/:project_id/documents/:document_id/versions/:version_id/archive', async (request, reply) => {
    const key = request.headers['idempotency-key'];
    if (typeof key !== 'string' || !key) throw new ProjectFault(400, 'validation_failed');
    const {project_id, document_id, version_id} = request.params as {
      project_id: string;
      document_id: string;
      version_id: string;
    };
    const result = await options.orchestrator.archiveVersion(
      request.cookies[SESSION_COOKIE]!,
      project_id,
      document_id,
      version_id,
      request.body as ArchiveVersionInput,
      key,
      extractCorrelation(request)
    );
    return reply.code(result.status).send(result.receipt);
  });

  // DELETE /projects/:project_id/documents/:document_id
  app.delete('/projects/:project_id/documents/:document_id', async (request, reply) => {
    const key = request.headers['idempotency-key'];
    if (typeof key !== 'string' || !key) throw new ProjectFault(400, 'validation_failed');
    const {project_id, document_id} = request.params as {project_id: string; document_id: string};

    const headerRev = request.headers['x-expected-revision'];
    const body = (request.body as {expected_revision?: number} | undefined) ?? {};
    let expectedRev = body.expected_revision;
    if (expectedRev === undefined && typeof headerRev === 'string' && /^[1-9][0-9]*$/.test(headerRev)) {
      expectedRev = Number(headerRev);
    }
    if (typeof expectedRev !== 'number' || expectedRev < 1) {
      throw new ProjectFault(400, 'validation_failed');
    }

    await options.orchestrator.deleteDocument(
      request.cookies[SESSION_COOKIE]!,
      project_id,
      document_id,
      expectedRev,
      key,
      extractCorrelation(request)
    );
    return reply.code(204).send();
  });
}
