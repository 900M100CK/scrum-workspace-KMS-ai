import {readableDocumentPolicies} from './store.ts';
import {randomUUID} from 'node:crypto';
import type {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import type {PoolClient} from 'pg';
import {deliverDocument} from './delivery.ts';
import type {DocumentHttpOptions} from './http.ts';
import {SESSION_COOKIE} from '../session/http.ts';
import {conflict, invalid, missing, ProjectFault, requestHash} from '../projects/outcomes.ts';
import {projectAccess, uuid} from '../projects/store.ts';

type Kind = 'task' | 'sprint' | 'document' | 'decision';
type Link = {link_id: string; project_id: string; from_kind: Kind; from_id: string; to_kind: Kind; to_id: string; relation: string};
type Passage = {document_id: string; version_id: string; passage_id: string; title: string; excerpt: string; validity: string; rank: number};
type Scope = {member: object; policy: {document_id: string; permission_revision: string}[]; documents: string[]; tasks: string[]; sprints: string[]};
type Page<T> = {items: T[]; generation: string; more: boolean};
type Identity = {actor: string; session: string};
const kinds = ['task', 'sprint', 'document', 'decision'];

function identifier(value: unknown): string {
  if (typeof value !== 'string' || !uuid(value)) throw invalid();
  return value.toLowerCase();
}

function fields(value: unknown, allowed: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !allowed.includes(key))) {
    throw invalid();
  }
  return value as Record<string, unknown>;
}

async function scope(client: PoolClient, actor: string, project: string, work: boolean): Promise<Scope> {
  const {member} = await projectAccess(client, actor, project);
  const policies = await readableDocumentPolicies(client, actor, project, member.membership_generation);
  const pending = await client.query<{document_id: string}>(
    'SELECT document_id FROM workspace.document_command_journal WHERE pending AND document_id=ANY($1::uuid[])',
    [policies.map(row => row.document_id)]);
  const blocked = new Set(pending.rows.map(row => row.document_id));
  const documents = policies.filter(row => !blocked.has(row.document_id));
  const tasks = work ? await client.query<{task_id: string}>(
    'SELECT task_id FROM workspace.task WHERE project_id=$1 ORDER BY task_id', [project]) : null;
  const sprints = work ? await client.query<{sprint_id: string}>(
    'SELECT sprint_id FROM workspace.sprint WHERE project_id=$1 ORDER BY sprint_id', [project]) : null;
  return {member, policy: documents, documents: documents.map(row => row.document_id),
    tasks: tasks?.rows.map(row => row.task_id) ?? [], sprints: sprints?.rows.map(row => row.sprint_id) ?? []};
}

function contains(access: Scope, kind: Kind, id: string): boolean {
  return (kind === 'task' ? access.tasks : kind === 'sprint' ? access.sprints : access.documents).includes(id);
}

function documentIds(link: Link): string[] {
  const ids: string[] = [];
  if (link.from_kind === 'document' || link.from_kind === 'decision') ids.push(link.from_id);
  if (link.to_kind === 'document' || link.to_kind === 'decision') ids.push(link.to_id);
  return ids;
}

async function checkLinkAuthority(client: PoolClient, actor: string, project: string): Promise<void> {
  const result = await client.query('SELECT workspace.has_link_create_authority($1,$2) AS allowed', [actor, project]);
  if (!result.rows[0]?.allowed) throw new ProjectFault(403, 'forbidden');
}

export function registerProjectDiscovery(app: FastifyInstance, options: DocumentHttpOptions) {
  const {orchestrator, docs} = options;
  const projects = docs.projects;
  function projectId(request: FastifyRequest) {
    const id = (request.params as {project_id: string}).project_id;
    if (!uuid(id)) throw missing();
    return id.toLowerCase();
  }
  const sessionToken = (request: FastifyRequest) => request.cookies[SESSION_COOKIE]!;
  async function identity(token: string): Promise<Identity> {
    const auth = await projects.sessions.inspect(token);
    if (auth.kind !== 'authenticated') throw new ProjectFault(auth.kind === 'unauthenticated' ? 401 : 503,
      auth.kind === 'unauthenticated' ? 'authentication_required' : 'access_unavailable');
    return {actor: auth.session.userId, session: auth.session.sessionId};
  }
  function send<T>(who: Identity, action: 'create-link' | 'links' | 'keyword', body: object, key?: string, correlation?: string) {
    if (!orchestrator.transport.discovery) throw new ProjectFault(503, 'access_unavailable');
    return orchestrator.transport.discovery<T>(who, action, body, key, correlation);
  }

  async function page<T>(
    request: FastifyRequest, reply: FastifyReply, action: 'links' | 'keyword',
    filters: object, cursor: unknown, getDocuments: (item: T) => string[]
  ) {
    if (cursor != null && (typeof cursor !== 'string' || !cursor || cursor.length > 4096)) throw invalid();
    const project = projectId(request);
    const token = sessionToken(request);
    const work = action === 'links';
    const codec = projects.cursor;
    if (!codec) throw new ProjectFault(503, 'access_unavailable');
    await deliverDocument(orchestrator, token, project, reply, async () => {
      const who = await identity(token);
      const access = await projects.transaction(token, async (client, actor, current) => {
        const result = await scope(client, actor, project, work);
        return await current() ? result : null;
      });
      const read = (offset: number) => send<Page<T>>(who, action, {
        project_id: project, ...filters, documents: access.documents, tasks: access.tasks, sprints: access.sprints, offset,
      });
      const first = await read(0);
      const fingerprint = requestHash(access);
      const generation = codec.fingerprint([fingerprint, first.generation]);
      const selector = codec.fingerprint([who.actor, project, action, filters]);
      const now = Date.now();
      const offset = typeof cursor === 'string'
        ? Number(codec.decode(cursor, selector, generation, now, value => /^(0|[1-9][0-9]{0,8})$/.test(value))) : 0;
      const result = offset ? await read(offset) : first;
      if (result.generation !== first.generation) throw conflict();
      return {response: {items: result.items, next_cursor: result.more
        ? codec.encode(selector, generation, String(offset + result.items.length), now) : null}, fingerprint};
    }, result => [...new Set(result.response.items.flatMap(getDocuments))], false, () => 200,
    result => result.response, async (client, actor, result) => {
      if (requestHash(await scope(client, actor, project, work)) !== result.fingerprint) throw conflict();
    });
  }

  app.get('/projects/:project_id/links', async (request, reply) => {
    const input = fields(request.query, ['from_id', 'cursor']);
    const endpoint = input.from_id === undefined ? null : identifier(input.from_id);
    await page<Link>(request, reply, 'links', {endpoint}, input.cursor, documentIds);
  });

  app.post('/projects/:project_id/search/keyword', async (request, reply) => {
    const input = fields(request.body, ['query', 'scope', 'cursor']);
    const query = input.query;
    const mode = input.scope === undefined ? 'current' : input.scope;
    if (typeof query !== 'string' || !query.trim() || query.length > 300 ||
        query.includes(String.fromCharCode(0)) || (mode !== 'current' && mode !== 'historical')) throw invalid();
    await page<Passage>(request, reply, 'keyword', {query: query.trim(), scope: mode}, input.cursor,
      item => [item.document_id]);
  });

  app.get('/projects/:project_id/links/allowed-actions', async request => {
    const project = projectId(request);
    return projects.transaction(sessionToken(request), async (client, actor, current) => {
      await projectAccess(client, actor, project);
      const result = await client.query('SELECT workspace.has_link_create_authority($1,$2) AS allowed', [actor, project]);
      return await current() ? {actions: result.rows[0]?.allowed ? ['createLink'] : []} : null;
    });
  });

  app.post('/projects/:project_id/links', async (request, reply) => {
    const input = fields(request.body, ['from_kind', 'from_id', 'to_kind', 'to_id', 'relation']);
    const project = projectId(request);
    const from = identifier(input.from_id), to = identifier(input.to_id);
    const fromKind = input.from_kind as Kind, toKind = input.to_kind as Kind;
    const relation = input.relation;
    const key = request.headers['idempotency-key'];
    if (!kinds.includes(fromKind) || !kinds.includes(toKind) || (from === to && fromKind === toKind) ||
        typeof relation !== 'string' || !relation.trim() || relation.length > 120 ||
        relation.includes(String.fromCharCode(0)) || typeof key !== 'string' || !key.trim() || key.length > 128) throw invalid();
    const token = sessionToken(request);
    const who = await identity(token);
    const check = async (client: PoolClient, actor: string) => {
      const access = await scope(client, actor, project, true);
      if (!contains(access, fromKind, from) || !contains(access, toKind, to)) throw missing();
      await checkLinkAuthority(client, actor, project);
    };
    await projects.transaction(token, async (client, actor, current) => {
      await check(client, actor);
      return await current() ? true : null;
    });
    const link = await orchestrator.guard.change(project, () =>
      projects.transaction(token, async (client, actor, current) => {
        await check(client, actor);
        if (!await current()) return null;
        return send<Link>(who, 'create-link', {project_id: project, from_kind: fromKind, from_id: from,
          to_kind: toKind, to_id: to, relation: relation.trim()}, key, randomUUID());
      })
    );
    await deliverDocument(orchestrator, token, project, reply, async () => link, documentIds, false, () => 201,
      value => value, check);
  });
}
