import cookie from '@fastify/cookie';
import type { FastifyInstance, FastifyReply, FastifyRequest, FastifySerializerCompiler } from 'fastify';
import type { WorkspaceSessionStore, StoredSession } from './store.ts';
import { ScryptVerifier } from './kdf.ts';
import type { PasswordVerifier } from './ports.ts';
import { sessionSchemas, sessionValidators } from './schemas.ts';

export const SESSION_COOKIE = '__Host-sacw-session';
type LoginBody = { username: string; password: string };
type Store = Pick<WorkspaceSessionStore, 'credential' | 'establish' | 'renew' | 'revoke'>;
type Verifier = PasswordVerifier & { readonly dummyCredential: string };
export interface SessionHttpOptions { store?: Store; verifier?: Verifier; origin?: string }
export interface SessionRequest extends FastifyRequest { sessionContext: StoredSession | null }
const errorBody = (code: string, message: string) => ({ code, message, run_id: null });
const unavailable = () => errorBody('access_unavailable', 'Session unavailable');
const unauthenticated = () => errorBody('authentication_required', 'Authentication required');

export function sessionOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Session origin must be an HTTPS origin');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Session origin must be an HTTPS origin');
  return url.origin;
}
function bearer(request: FastifyRequest): string | null {
  const fields = (request.headers.cookie ?? '').split(';').map(field => field.trim().split('=')[0]);
  if (fields.filter(name => name === SESSION_COOKIE).length !== 1) return null;
  return request.cookies[SESSION_COOKIE] ?? null;
}
const cookieScope = { httpOnly: true, secure: true, sameSite: 'strict', path: '/' } as const;

function respondWithSession(request: FastifyRequest, reply: FastifyReply, token: string, session: StoredSession) {
  reply.setCookie(SESSION_COOKIE, token, { ...cookieScope, expires: new Date(session.expiresAt) });
  (request as SessionRequest).sessionContext = session;
  return { user_id: session.userId, expires_at: session.expiresAt };
}

// Validate the final object after preSerialization hooks, without silent field projection.
const serializerCompiler: FastifySerializerCompiler<unknown> = ({ httpStatus }) => payload => {
  const validator = String(httpStatus) === '200' ? sessionValidators.Session : sessionValidators.Error;
  if (!validator!(payload)) throw new Error('Invalid session output');
  return JSON.stringify(payload);
};
const loginResponses = {
  200: sessionSchemas.Session,
  400: sessionSchemas.Error,
  401: sessionSchemas.Error,
  403: sessionSchemas.Error,
  413: sessionSchemas.Error,
  415: sessionSchemas.Error,
  503: sessionSchemas.Error,
};

export async function registerSessionHttp(app: FastifyInstance, options: SessionHttpOptions): Promise<void> {
  const origin = options.origin === undefined ? null : sessionOrigin(options.origin);
  const verifier = options.verifier ?? new ScryptVerifier();
  await app.register(cookie);
  // Cookie plugin flushes its queue in onSend; suppress it after unsuccessful session responses.
  app.addHook('onSend', async (request, reply, payload) => {
    if (request.routeOptions.url === '/session' && reply.statusCode !== (request.method === 'DELETE' ? 204 : 200)) reply.removeHeader('set-cookie');
    return payload;
  });
  app.decorateRequest('sessionContext', null);
  async function checkMutationRequest(request: FastifyRequest, reply: FastifyReply) {
    reply.header('Cache-Control', 'no-store');
    if (!origin || !options.store) return reply.code(503).send(unavailable());
    if (request.headers.origin !== origin || request.headers['x-sacw-request'] !== '1') {
      return reply.code(403).send(errorBody('forbidden', 'Request denied'));
    }
  }

  // Explicit compiler applies only to this route body; future routes keep their own contract policy.
  app.post<{ Body: LoginBody }>('/session', {
    bodyLimit: 8192,
    onRequest: checkMutationRequest,
    schema: { body: sessionSchemas.Login, response: loginResponses },
    validatorCompiler: () => sessionValidators.Login!,
    serializerCompiler,
  }, async (request, reply) => {
    try {
      const { username, password } = request.body;
      // PostgreSQL text cannot represent NUL; this remains an unknown identity, not a normalization rule.
      const account = username.includes('\0') ? null : await options.store!.credential(username);
      const verified = await verifier.verify(password, account?.credential ?? verifier.dummyCredential);
      if (!account || !verified || account.disabled) return reply.code(401).send(unauthenticated());
      const issued = await options.store!.establish(account.userId, account.revision, request.id);
      if (issued.kind === 'unauthenticated') return reply.code(401).send(unauthenticated());
      if (issued.kind !== 'created') return reply.code(503).send(unavailable());
      return respondWithSession(request, reply, issued.token, issued.session);
    } catch {
      reply.removeHeader('set-cookie');
      return reply.code(503).send(unavailable());
    }
  });

  app.get('/session', {
    schema: { response: { 200: sessionSchemas.Session, 401: sessionSchemas.Error, 503: sessionSchemas.Error } },
    serializerCompiler,
    onRequest: async (_request, reply) => { reply.header('Cache-Control', 'no-store'); },
  }, async (request, reply) => {
    if (!options.store || !origin) return reply.code(503).send(unavailable());
    const token = bearer(request);
    if (!token) return reply.code(401).send(unauthenticated());
    try {
      const result = await options.store.renew(token, request.id);
      if (result.kind === 'unauthenticated') return reply.code(401).send(unauthenticated());
      if (result.kind !== 'authenticated') return reply.code(503).send(unavailable());
      return respondWithSession(request, reply, token, result.session);
    } catch {
      return reply.code(503).send(unavailable());
    }
  });

  app.delete('/session', {
    bodyLimit: 8192,
    schema: { response: { 204: { type: 'null' }, 400: sessionSchemas.Error, 403: sessionSchemas.Error, 413: sessionSchemas.Error, 415: sessionSchemas.Error, 503: sessionSchemas.Error } },
    serializerCompiler,
    onRequest: checkMutationRequest,
    preValidation: async (request, reply) => {
      if (request.body !== undefined) return reply.code(400).send(errorBody('validation_failed', 'Invalid request'));
    },
  }, async (request, reply) => {
    try {
      const token = bearer(request);
      if (token && (await options.store!.revoke(token, request.id)).kind !== 'signed_out') return reply.code(503).send(unavailable());
      reply.clearCookie(SESSION_COOKIE, cookieScope);
      return reply.code(204).send();
    } catch {
      return reply.code(503).send(unavailable());
    }
  });
}
