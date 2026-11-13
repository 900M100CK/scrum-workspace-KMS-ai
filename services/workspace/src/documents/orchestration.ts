import {randomUUID} from 'node:crypto';
import type {WorkspaceDocumentStore} from './store.ts';
import type {ProjectRWGuard} from '../policy/guard.ts';
import {ProjectFault, invalid, missing, conflict, requestHash} from '../projects/outcomes.ts';
import {uuid, projectAccess} from '../projects/store.ts';
import {canMutateDocument, canReadDocument} from './authority.ts';
import type {DocumentClassification, DocumentKind, VersionList, KnowledgeVersion} from './types.ts';

export interface CreateDocumentInput {
  title: string;
  classification: DocumentClassification;
  content: string;
  kind?: DocumentKind;
  labels?: string[];
}

export interface ReviseDocumentInput {
  content: string;
  content_format?: 'text' | 'markdown';
  expected_revision: number;
}

export interface ArchiveVersionInput {
  expected_revision: number;
}

export interface DocumentMutationReceipt {
  document_id: string;
  operation: 'reviseDocument' | 'archiveVersion' | 'editDocumentMetadata';
  receipt_id: string;
  version_id: string | null;
}

export interface DocumentResponse {
  document_id: string;
  project_id: string;
  title: string;
  kind: DocumentKind;
  content_owner_id: string;
  classification: DocumentClassification;
  labels: string[];
  current_version_id: string;
  revision: number;
}

export interface KnowledgeTransport {
  discovery?<T>(identity: {actor: string; session: string}, action: 'create-link' | 'links' | 'keyword',
    body: object, key?: string, correlation?: string): Promise<T>;

  persist(
    actorId: string,
    payload: {
      document_id: string;
      project_id: string;
      owner_id: string;
      title: string;
      kind?: DocumentKind;
      labels?: string[];
      content: string;
    },
    key: string,
    correlationId?: string,
    sessionId?: string
  ): Promise<{
    document_id: string;
    project_id: string;
    title: string;
    kind: DocumentKind;
    owner_id: string;
    labels: string[];
    current_version_id: string;
    revision: number;
  }>;
  get(documentId: string, actorId?: string, sessionId?: string): Promise<{
    document: {
      document_id: string;
      project_id: string;
      title: string;
      kind: DocumentKind;
      owner_id: string;
      labels: string[];
      current_version_id: string;
      revision: number;
    };
    content: string;
  } | null>;
  revise?(
    actorId: string,
    payload: {
      project_id: string;
      document_id: string;
      content: string;
      content_format?: 'text' | 'markdown';
      expected_revision: number;
    },
    key: string,
    correlationId?: string,
    sessionId?: string
  ): Promise<{status: 200 | 201; receipt: DocumentMutationReceipt}>;
  archive?(
    actorId: string,
    payload: {
      project_id: string;
      document_id: string;
      version_id: string;
      expected_revision: number;
    },
    key: string,
    correlationId?: string,
    sessionId?: string
  ): Promise<{status: 200; receipt: DocumentMutationReceipt}>;
  delete?(
    actorId: string,
    payload: {
      project_id: string;
      document_id: string;
      expected_revision: number;
    },
    key: string,
    correlationId?: string,
    sessionId?: string
  ): Promise<{status: 204}>;
  listVersions?(
    projectId: string,
    documentId: string,
    cursor?: string | null,
    limit?: number,
    actorId?: string,
    sessionId?: string
  ): Promise<VersionList | null>;
  getVersion?(
    projectId: string,
    documentId: string,
    versionId: string,
    actorId?: string,
    sessionId?: string
  ): Promise<KnowledgeVersion | null>;
}

export class DocumentOrchestrator {
  readonly docsStore: WorkspaceDocumentStore;
  readonly transport: KnowledgeTransport;
  readonly guard: ProjectRWGuard;

  constructor(docsStore: WorkspaceDocumentStore, transport: KnowledgeTransport, guard: ProjectRWGuard) {
    this.docsStore = docsStore;
    this.transport = transport;
    this.guard = guard;
  }

  private async identity(token: string) {
    const auth = await this.docsStore.projects.sessions.inspect(token);
    if (auth.kind !== 'authenticated') {
      throw new ProjectFault(auth.kind === 'unauthenticated' ? 401 : 503,
        auth.kind === 'unauthenticated' ? 'authentication_required' : 'access_unavailable');
    }
    return auth.session;
  }

  async createDocument(
    token: string,
    projectId: string,
    input: CreateDocumentInput,
    key: string,
    correlationId: string = randomUUID()
  ): Promise<{status: 201 | 200; document: DocumentResponse}> {
    if (!input || typeof input !== 'object') throw invalid();
    if (typeof input.title !== 'string' || !input.title.trim()) throw invalid();
    if (typeof input.content !== 'string' || !input.content.trim()) throw invalid();
    if (!['project_shared', 'restricted'].includes(input.classification)) throw invalid();

    // 1. Workspace Policy Registration (allocates document_id, checks actor capability knowledge-author)
    const creationHash = requestHash([
      'createDocument',
      projectId,
      input.title.trim(),
      input.classification,
      input.content,
      input.kind ?? 'document',
      input.labels ?? [],
    ]);

    const policyOutcome = await this.docsStore.registerPolicy(
      token,
      projectId,
      {classification: input.classification, payload_hash: creationHash},
      key,
      correlationId
    );

    const docId = policyOutcome.policy.document_id;

    // Inspect token to get actor id
    const auth = await this.docsStore.projects.sessions.inspect(token);
    if (auth.kind !== 'authenticated') {
      throw new ProjectFault(401, 'authentication_required');
    }
    const actorId = auth.session.userId;

    // 2. Guarded Transport to Knowledge
    const release = await this.guard.acquireShared(projectId, this.guard.getGeneration());
    try {
      const persisted = await this.transport.persist(
        actorId,
        {
          document_id: docId,
          project_id: projectId,
          owner_id: actorId,
          title: input.title.trim(),
          kind: input.kind ?? 'document',
          labels: input.labels ?? [],
          content: input.content,
        },
        key,
        correlationId, auth.session.sessionId
      );

      return {
        status: policyOutcome.status,
        document: {
          document_id: persisted.document_id,
          project_id: projectId,
          title: persisted.title,
          kind: persisted.kind,
          content_owner_id: persisted.owner_id,
          classification: policyOutcome.policy.classification,
          labels: persisted.labels ?? [],
          current_version_id: persisted.current_version_id,
          revision: persisted.revision,
        },
      };
    } catch (err: any) {
      if (err instanceof ProjectFault) throw err;
      throw new ProjectFault(503, 'access_unavailable');
    } finally {
      release();
    }
  }

  async getDocument(
    token: string,
    projectId: string,
    documentId: string
  ): Promise<{document: DocumentResponse; content: string}> {
    const allowed = await this.docsStore.checkReadAccess(token, projectId, documentId);
    if (!allowed) {
      throw missing();
    }

    const policy = await this.docsStore.projects.transaction(token, async (c) => {
      return (
        await c.query(
          'SELECT classification, permission_revision::text rev FROM workspace.document_policy WHERE document_id = $1',
          [documentId]
        )
      ).rows[0];
    });

    if (await this.docsStore.commandPending(documentId)) throw new ProjectFault(503, 'access_unavailable');
    const identity = await this.identity(token);
    const result = await this.transport.get(documentId, identity.userId, identity.sessionId);
    if (!result) throw missing();
    if (!await this.docsStore.checkReadAccess(token, projectId, documentId)) throw missing();
    if (await this.docsStore.commandPending(documentId)) throw new ProjectFault(503, 'access_unavailable');

    return {
      document: {
        document_id: result.document.document_id,
        project_id: projectId,
        title: result.document.title,
        kind: result.document.kind,
        content_owner_id: result.document.owner_id,
        classification: policy.classification,
        labels: result.document.labels ?? [],
        current_version_id: result.document.current_version_id,
        revision: result.document.revision,
      },
      content: result.content,
    };
  }

  async listDocuments(token: string, projectId: string): Promise<DocumentResponse[]> {
    const readableIds = await this.docsStore.listReadableDocumentIds(token, projectId);
    if (readableIds.length === 0) return [];

    const policies = await this.docsStore.projects.transaction(token, async (c) => {
      return (
        await c.query(
          'SELECT document_id, classification FROM workspace.document_policy WHERE document_id = ANY($1::uuid[])',
          [readableIds]
        )
      ).rows;
    });
    const policyMap = new Map(policies.map((p) => [p.document_id, p.classification]));

    const items: DocumentResponse[] = [];
    const identity = await this.identity(token);
    for (const id of readableIds) {
      if (await this.docsStore.commandPending(id)) continue;
      const doc = await this.transport.get(id, identity.userId, identity.sessionId);
      if (doc) {
        items.push({
          document_id: doc.document.document_id,
          project_id: projectId,
          title: doc.document.title,
          kind: doc.document.kind,
          content_owner_id: doc.document.owner_id,
          classification: policyMap.get(id) ?? 'restricted',
          labels: doc.document.labels ?? [],
          current_version_id: doc.document.current_version_id,
          revision: doc.document.revision,
        });
      }
    }
    return items;
  }

  private async executeCommand<T>(
    token: string, projectId: string, documentId: string,
    operation: 'reviseDocument' | 'archiveVersion' | 'deleteDocument',
    payload: object, key: string, send: (actor: string, session: string) => Promise<T>
  ): Promise<T> {
    const hash = requestHash([operation, payload]);
    await this.docsStore.projects.transaction(token, async (client, actor, current) => {
      await projectAccess(client, actor, projectId);
      const action = operation === 'reviseDocument' ? 'content-write' : 'lifecycle-manage';
      if (!await canMutateDocument(client, actor, projectId, documentId, action)) {
        throw new ProjectFault(403, 'forbidden');
      }
      return await current() ? true : null;
    });
    return this.guard.change(projectId, async () => {
      const identity = await this.identity(token);
      const actor = await this.docsStore.beginCommand(token, projectId, documentId, operation, key, hash);
      let result: T;
      try {
        result = await this.docsStore.projects.transaction(token, async (client, currentActor, current) => {
          await projectAccess(client, currentActor, projectId);
          const action = operation === 'reviseDocument' ? 'content-write' : 'lifecycle-manage';
          if (currentActor !== actor || !await canMutateDocument(client, actor, projectId, documentId, action)) {
            throw new ProjectFault(403, 'forbidden');
          }
          if (!await current()) return null;
          // Keep the session/account and project authority stable across dispatch.
          // Wrap the remote rejection as a value so transaction handling preserves its classification.
          return send(actor, identity.sessionId).then(value => ({value}), error => ({error}));
        }).then(outcome => {
          if ('error' in outcome) throw outcome.error;
          return outcome.value;
        });
      } catch (error) {
        const status = (error as {status?: number})?.status;
        if (status !== undefined && [400, 403, 404, 409].includes(status)) {
          await this.docsStore.finishCommand(documentId, actor, operation, key, hash);
          if (status === 400) throw invalid();
          if (status === 404) throw missing();
          if (status === 409) throw conflict();
          throw new ProjectFault(403, 'forbidden');
        }
        throw error;
      }
      await this.docsStore.finishCommand(documentId, actor, operation, key, hash);
      return result;
    });
  }

  async reviseDocument(
    token: string,
    projectId: string,
    documentId: string,
    input: ReviseDocumentInput,
    key: string,
    correlationId: string = randomUUID()
  ): Promise<{status: 200 | 201; receipt: DocumentMutationReceipt}> {
    if (!uuid(projectId) || !uuid(documentId)) throw missing();
    projectId = projectId.toLowerCase();
    documentId = documentId.toLowerCase();
    if (!input || typeof input !== 'object') throw invalid();
    if (typeof input.content !== 'string' || !input.content.trim()) throw invalid();
    if (typeof input.expected_revision !== 'number' || input.expected_revision < 1 || !Number.isInteger(input.expected_revision)) {
      throw invalid();
    }
    if (typeof key !== 'string' || !key.trim()) throw invalid();

    if (!this.transport.revise) throw new ProjectFault(503, 'access_unavailable');
    const payload = {
      project_id: projectId, document_id: documentId, content: input.content,
      ...(input.content_format ? {content_format: input.content_format} : {}),
      expected_revision: input.expected_revision,
    };
    return this.executeCommand(token, projectId, documentId, 'reviseDocument', payload, key,
      (actor, session) => this.transport.revise!(actor, payload, key, correlationId, session));
  }

  async archiveVersion(
    token: string,
    projectId: string,
    documentId: string,
    versionId: string,
    input: ArchiveVersionInput,
    key: string,
    correlationId: string = randomUUID()
  ): Promise<{status: 200; receipt: DocumentMutationReceipt}> {
    if (!uuid(projectId) || !uuid(documentId) || !uuid(versionId)) throw missing();
    projectId = projectId.toLowerCase();
    documentId = documentId.toLowerCase();
    versionId = versionId.toLowerCase();
    if (!input || typeof input !== 'object') throw invalid();
    if (typeof input.expected_revision !== 'number' || input.expected_revision < 1 || !Number.isInteger(input.expected_revision)) {
      throw invalid();
    }
    if (typeof key !== 'string' || !key.trim()) throw invalid();

    if (!this.transport.archive) throw new ProjectFault(503, 'access_unavailable');
    const payload = {
      project_id: projectId, document_id: documentId, version_id: versionId, expected_revision: input.expected_revision,
    };
    return this.executeCommand(token, projectId, documentId, 'archiveVersion', payload, key,
      (actor, session) => this.transport.archive!(actor, payload, key, correlationId, session));
  }

  async deleteDocument(
    token: string,
    projectId: string,
    documentId: string,
    expectedRevision: number,
    key: string,
    correlationId: string = randomUUID()
  ): Promise<{status: 204}> {
    if (!uuid(projectId) || !uuid(documentId)) throw missing();
    projectId = projectId.toLowerCase();
    documentId = documentId.toLowerCase();
    if (typeof expectedRevision !== 'number' || expectedRevision < 1 || !Number.isInteger(expectedRevision)) {
      throw invalid();
    }
    if (typeof key !== 'string' || !key.trim()) throw invalid();

    if (!this.transport.delete) throw new ProjectFault(503, 'access_unavailable');
    const payload = {
      project_id: projectId, document_id: documentId, expected_revision: expectedRevision,
    };
    return this.executeCommand(token, projectId, documentId, 'deleteDocument', payload, key,
      (actor, session) => this.transport.delete!(actor, payload, key, correlationId, session));
  }

  async listVersions(
    token: string,
    projectId: string,
    documentId: string,
    cursor?: string | null,
    limit?: number
  ): Promise<VersionList> {
    if (!uuid(projectId) || !uuid(documentId)) throw missing();
    projectId = projectId.toLowerCase();
    documentId = documentId.toLowerCase();

    const pageSize = limit ?? 20;
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100 ||
        (cursor != null && typeof cursor !== 'string')) throw invalid();
    const access = await this.docsStore.projects.transaction(token, async (c, actor, current) => {
      const {member} = await projectAccess(c, actor, projectId);
      if (!await canReadDocument(c, actor, projectId, documentId)) throw missing();
      const policy = await c.query(
        'SELECT permission_revision::text FROM workspace.document_policy WHERE document_id = $1', [documentId]
      );
      if (!await current()) return null;
      return {actor, member, permission: policy.rows[0]?.permission_revision};
    });
    if (!this.transport.listVersions || await this.docsStore.commandPending(documentId)) {
      throw new ProjectFault(503, 'access_unavailable');
    }
    const identity = await this.identity(token);
    const readPage = (after?: string) =>
      this.transport.listVersions!(projectId, documentId, after, pageSize, identity.userId, identity.sessionId);
    const first = await readPage();
    if (!first) throw missing();
    const codec = this.docsStore.projects.cursor;
    if (!codec) throw new ProjectFault(503, 'access_unavailable');
    const scope = codec.fingerprint(['document-history', access.actor, projectId, documentId, pageSize]);
    const generation = codec.fingerprint([access.member, access.permission, first.document_revision]);
    const now = Date.now();
    const after = cursor == null ? undefined :
      codec.decode(cursor, scope, generation, now, value => /^[A-Za-z0-9_-]{1,256}$/.test(value));
    const list = after ? await readPage(after) : first;
    if (!list || list.document_revision !== first.document_revision) throw conflict();
    return {...list, next_cursor: list.next_cursor ? codec.encode(scope, generation, list.next_cursor, now) : null};
  }

  async getVersion(
    token: string,
    projectId: string,
    documentId: string,
    versionId: string
  ): Promise<KnowledgeVersion> {
    if (!uuid(projectId) || !uuid(documentId) || !uuid(versionId)) throw missing();
    projectId = projectId.toLowerCase();
    documentId = documentId.toLowerCase();
    versionId = versionId.toLowerCase();

    await this.docsStore.projects.transaction(token, async (c, actor, guard) => {
      await projectAccess(c, actor, projectId);
      const readable = await canReadDocument(c, actor, projectId, documentId);
      if (!readable) throw missing();
      if (!(await guard())) return null as any;
    });

    if (await this.docsStore.commandPending(documentId)) throw new ProjectFault(503, 'access_unavailable');
    if (!this.transport.getVersion) {
      throw new ProjectFault(503, 'access_unavailable');
    }
    const identity = await this.identity(token);
    const version = await this.transport.getVersion(projectId, documentId, versionId, identity.userId, identity.sessionId);
    if (!version) throw missing();
    if (!await this.docsStore.checkReadAccess(token, projectId, documentId)) throw missing();
    return version;
  }
}
