export interface Session {
  user_id: string;
  expires_at: string;
}
export type SessionState =
  | { phase: 'checking' | 'signing-in' | 'signing-out' | 'signed-out' | 'expired' | 'unavailable'; session: null; message: string }
  | { phase: 'authenticated'; session: Session; message: string };

type Method = 'GET' | 'POST' | 'DELETE';
type Credentials = { username: string; password: string };
type Transport = (input: string, init: RequestInit) => Promise<Response>;
const messages = {
  signedOut: 'Sign in to your workspace.',
  expired: 'Your session has ended. Sign in again.',
  unavailable: 'Unable to confirm your session. Check your connection and try again.',
};

const requestStates = {
  GET: { phase: 'checking', message: 'Checking your session…' },
  POST: { phase: 'signing-in', message: 'Signing in…' },
  DELETE: { phase: 'signing-out', message: 'Signing out…' },
} as const;

const unavailableMessages: Record<Method, string> = {
  GET: messages.unavailable,
  POST: 'Sign-in could not be confirmed. Check your session before trying again.',
  DELETE: 'Sign-out could not be confirmed. Your workspace is hidden. Retry sign-out or check your session.',
};

function sessionBody(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false;
  const body = value as Record<string, unknown>;
  if (Object.keys(body).sort().join(',') !== 'expires_at,user_id') return false;
  const { user_id: userId, expires_at: expiresAt } = body;
  const validUser = typeof userId === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  const validExpiry = typeof expiresAt === 'string' &&
    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(expiresAt) &&
    Number.isFinite(Date.parse(expiresAt)) &&
    new Date(expiresAt).toISOString().slice(0, 19) === expiresAt.slice(0, 19);
  return validUser && validExpiry;
}

/** Only the server cookie authenticates. This memory state is a UI observation, never authority. */
export class SessionController {
  private state: SessionState = { ...requestStates.GET, session: null };
  private listeners = new Set<() => void>();
  private generation = 0;
  private request: AbortController | null = null;
  private transport: Transport;
  constructor(transport: Transport = (input, init) => fetch(input, init)) { this.transport = transport; }
  getSnapshot = (): SessionState => this.state;
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  private publish(state: SessionState): void {
    this.state = state;
    for (const listener of this.listeners) listener();
  }
  cancel = (): void => {
    this.generation++;
    this.request?.abort();
    this.request = null;
  };
  expire = (): void => {
    this.cancel();
    this.publish({ phase: 'expired', session: null, message: messages.expired });
  };
  check = (): Promise<void> => this.run('GET');
  signIn = (username: string, password: string): Promise<void> => this.run('POST', { username, password });
  signOut = (): Promise<void> => this.run('DELETE');

  private async run(method: Method, credentials?: Credentials): Promise<void> {
    const hadSession = this.state.session !== null || this.state.phase === 'expired';
    this.cancel();
    const generation = this.generation;
    const request = new AbortController();
    this.request = request;
    this.publish({ ...requestStates[method], session: null });
    const timeout = setTimeout(() => request.abort(), 10000);
    try {
      const response = await this.transport('/api/session', {
        method,
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        signal: request.signal,
        headers: { 'X-SACW-Request': '1', ...(credentials ? { 'Content-Type': 'application/json' } : {}) },
        ...(credentials ? { body: JSON.stringify(credentials) } : {}),
      });
      if (generation !== this.generation) return;
      if (method === 'DELETE') {
        if (response.status !== 204) throw new Error('Unconfirmed sign-out');
        this.publish({ phase: 'signed-out', session: null, message: 'You have signed out.' });
        return;
      }
      if (response.status === 401) {
        const phase = method === 'GET' && hadSession ? 'expired' : 'signed-out';
        const message = method === 'POST'
          ? 'Unable to sign in. Check your username and password.'
          : hadSession ? messages.expired : messages.signedOut;
        this.publish({ phase, session: null, message });
        return;
      }
      if (response.status !== 200 || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Unavailable session');
      const body: unknown = await response.json();
      if (generation !== this.generation) return;
      if (!sessionBody(body)) throw new Error('Invalid session');
      // A local clock can hide UI early; it never authorizes a server operation or renews a session.
      if (Date.parse(body.expires_at) <= Date.now()) {
        this.expire();
        return;
      }
      this.publish({ phase: 'authenticated', session: body, message: 'You are signed in.' });
    } catch {
      if (generation === this.generation) {
        this.publish({ phase: 'unavailable', session: null, message: unavailableMessages[method] });
      }
    } finally {
      clearTimeout(timeout);
      if (generation === this.generation) this.request = null;
    }
  }
}
