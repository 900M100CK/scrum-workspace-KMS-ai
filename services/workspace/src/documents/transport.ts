import {request} from 'node:https';
import type {KnowledgeTransport} from './orchestration.ts';
import {buildInternalServiceHeaders} from '../transport/service-auth.ts';
import {ProjectFault} from '../projects/outcomes.ts';
import {uuid} from '../projects/store.ts';

export function knowledgeTransport(base: URL, serviceKey: string, ca?: Buffer): KnowledgeTransport {
  async function call<T>(
    identity: {actor: string; session: string}, path: string, method = 'GET',
    body?: object, key?: string, correlation?: string, allowMissing = false,
    operation?: 'reviseDocument' | 'archiveVersion' | 'deleteDocument'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const payload = body === undefined ? undefined : JSON.stringify(body);
      const req = request(new URL(path, base), {
        method, ca,
        signal: AbortSignal.timeout(2500),
        headers: {
          ...buildInternalServiceHeaders(serviceKey, identity.session),
          'x-actor-user-id': identity.actor,
          ...(key ? {'idempotency-key': key} : {}),
          ...(correlation ? {'x-correlation-id': correlation} : {}),
          ...(payload ? {'content-type': 'application/json', 'content-length': Buffer.byteLength(payload)} : {}),
        },
      }, res => {
        const status = res.statusCode ?? 503;
        const chunks: Buffer[] = [];
        let size = 0;
        res.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > 1024 * 1024) res.destroy(new Error('Knowledge response too large'));
          else chunks.push(chunk);
        });
        res.on('error', reject);
        res.on('end', () => {
          if (allowMissing && status === 404) return resolve(null as T);
          if (![200, 201, 204].includes(status)) {
            // A 403 at this boundary indicates service authentication/configuration failure.
            return reject(new ProjectFault([400, 404, 409].includes(status) ? status : 503, 'access_unavailable'));
          }
          try {
            const value = status === 204 ? {status} : JSON.parse(Buffer.concat(chunks).toString('utf8'));
            if (operation === 'deleteDocument') {
              if (status !== 204) throw new Error('Invalid Knowledge deletion receipt');
            } else if (operation) {
              const target = body as {document_id: string; version_id?: string};
              if (!value || (status !== 200 && !(status === 201 && operation === 'reviseDocument')) ||
                  value.operation !== operation || value.document_id !== target.document_id ||
                  typeof value.receipt_id !== 'string' || !uuid(value.receipt_id) ||
                  typeof value.version_id !== 'string' || !uuid(value.version_id) ||
                  (operation === 'archiveVersion' && value.version_id !== target.version_id)) {
                throw new Error('Invalid Knowledge lifecycle receipt');
              }
            }
            resolve((operation && operation !== 'deleteDocument' ? {status, receipt: value} : value) as T);
          } catch (error) {
            reject(error);
          }
        });
      });
      req.on('error', reject);
      req.end(payload);
    });
  }

  const identity = (actor: string, session?: string) => {
    if (!session) throw new ProjectFault(503, 'access_unavailable');
    return {actor, session};
  };
  const document = (id: string) => '/internal/documents/' + encodeURIComponent(id);
  const withProject = (path: string, project: string, extra: Record<string, string> = {}) =>
    path + '?' + new URLSearchParams({project_id: project, ...extra});
  return {
    persist: (actor, payload, key, correlation, session) =>
      call(identity(actor, session), '/internal/documents', 'POST', payload, key, correlation),
    get: (id, actor, session) =>
      call(identity(actor!, session), document(id), 'GET', undefined, undefined, undefined, true),
    revise: (actor, payload, key, correlation, session) =>
      call(identity(actor, session), document(payload.document_id) + '/revisions',
        'POST', payload, key, correlation, false, 'reviseDocument'),
    archive: (actor, payload, key, correlation, session) =>
      call(identity(actor, session), document(payload.document_id) + '/versions/' + encodeURIComponent(payload.version_id) + '/archive',
        'POST', payload, key, correlation, false, 'archiveVersion'),
    delete: (actor, payload, key, correlation, session) =>
      call(identity(actor, session), document(payload.document_id), 'DELETE', payload, key, correlation, false, 'deleteDocument'),
    listVersions: (project, id, cursor, limit, actor, session) =>
      call(identity(actor!, session), withProject(document(id) + '/versions', project,
        {...(cursor ? {cursor} : {}), ...(limit ? {limit: String(limit)} : {})}),
        'GET', undefined, undefined, undefined, true),
    getVersion: (project, id, version, actor, session) =>
      call(identity(actor!, session), withProject(document(id) + '/versions/' + encodeURIComponent(version), project),
        'GET', undefined, undefined, undefined, true),
  };
}
