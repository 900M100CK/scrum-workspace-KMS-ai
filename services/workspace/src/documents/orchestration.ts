import {randomUUID} from 'node:crypto';
import type {WorkspaceDocumentStore} from './store.ts';
import type {ProjectRWGuard} from '../policy/guard.ts';
import {ProjectFault, invalid, missing, conflict, requestHash} from '../projects/outcomes.ts';
import {uuid, projectAccess} from '../projects/store.ts';
import {canWriteDocument, canReadDocument} from './authority.ts';
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
    correlationId?: string
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
  get(documentId: string): Promise<{
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
    correlationId?: string
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
    correlationId?: string
  ): Promise<{status: 200; receipt: DocumentMutationReceipt}>;
  delete?(
    actorId: string,
    payload: {
      project_id: string;
      document_id: string;
      expected_revision: number;
    },
    key: string,
    correlationId?: string
  ): Promise<{status: 204}>;
  listVersions?(
    projectId: string,
    documentId: string,
    cursor?: string | null,
    limit?: number
  ): Promise<VersionList | null>;
  getVersion?(
    projectId: string,
    documentId: string,
    versionId: string
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
        correlationId
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

    const release = await this.guard.acquireShared(projectId, this.guard.getGeneration());
    try {
      const result = await this.transport.get(documentId);
      if (!result) throw missing();

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
    } finally {
      release();
    }
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

    const release = await this.guard.acquireShared(projectId, this.guard.getGeneration());
    try {
      const items: DocumentResponse[] = [];
      for (const id of readableIds) {
        const doc = await this.transport.get(id);
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
    } finally {
      release();
    }
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

    const actorId = await this.docsStore.projects.transaction(token, async (c, actor, guard) => {
      await projectAccess(c, actor, projectId);
      if (!(await canWriteDocument(c, actor, projectId, documentId))) {
        throw new ProjectFault(403, 'forbidden');
      }
      if (!(await guard())) return null as any;
      return actor;
    });

    const release = await this.guard.acquireExclusive(projectId);
    try {
      if (!this.transport.revise) {
        throw new ProjectFault(503, 'access_unavailable');
      }
      return await this.transport.revise(
        actorId,
        {
          project_id: projectId,
          document_id: documentId,
          content: input.content,
          ...(input.content_format ? {content_format: input.content_format} : {}),
          expected_revision: input.expected_revision,
        },
        key,
        correlationId
      );
    } catch (err: any) {
      if (err instanceof ProjectFault) throw err;
      if (err?.status === 409 || err?.code === 'state_conflict') throw conflict();
      if (err?.status === 404 || err?.code === 'not_found') throw missing();
      if (err?.status === 400 || err?.code === 'validation_failed') throw invalid();
      if (err?.status === 403 || err?.code === 'forbidden') throw new ProjectFault(403, 'forbidden');
      throw err;
    } finally {
      release();
    }
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

    const actorId = await this.docsStore.projects.transaction(token, async (c, actor, guard) => {
      await projectAccess(c, actor, projectId);
      if (!(await canWriteDocument(c, actor, projectId, documentId))) {
        throw new ProjectFault(403, 'forbidden');
      }
      if (!(await guard())) return null as any;
      return actor;
    });

    const release = await this.guard.acquireExclusive(projectId);
    try {
      if (!this.transport.archive) {
        throw new ProjectFault(503, 'access_unavailable');
      }
      return await this.transport.archive(
        actorId,
        {
          project_id: projectId,
          document_id: documentId,
          version_id: versionId,
          expected_revision: input.expected_revision,
        },
        key,
        correlationId
      );
    } catch (err: any) {
      if (err instanceof ProjectFault) throw err;
      if (err?.status === 409 || err?.code === 'state_conflict') throw conflict();
      if (err?.status === 404 || err?.code === 'not_found') throw missing();
      if (err?.status === 400 || err?.code === 'validation_failed') throw invalid();
      if (err?.status === 403 || err?.code === 'forbidden') throw new ProjectFault(403, 'forbidden');
      throw err;
    } finally {
      release();
    }
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

    const actorId = await this.docsStore.projects.transaction(token, async (c, actor, guard) => {
      await projectAccess(c, actor, projectId);
      if (!(await canWriteDocument(c, actor, projectId, documentId))) {
        throw new ProjectFault(403, 'forbidden');
      }
      if (!(await guard())) return null as any;
      return actor;
    });

    const release = await this.guard.acquireExclusive(projectId);
    try {
      if (!this.transport.delete) {
        throw new ProjectFault(503, 'access_unavailable');
      }
      await this.docsStore.markUnavailable(token, projectId, documentId);

      return await this.transport.delete(
        actorId,
        {
          project_id: projectId,
          document_id: documentId,
          expected_revision: expectedRevision,
        },
        key,
        correlationId
      );
    } catch (err: any) {
      if (err instanceof ProjectFault) throw err;
      if (err?.status === 409 || err?.code === 'state_conflict') throw conflict();
      if (err?.status === 404 || err?.code === 'not_found') throw missing();
      if (err?.status === 400 || err?.code === 'validation_failed') throw invalid();
      if (err?.status === 403 || err?.code === 'forbidden') throw new ProjectFault(403, 'forbidden');
      throw err;
    } finally {
      release();
    }
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

    await this.docsStore.projects.transaction(token, async (c, actor, guard) => {
      await projectAccess(c, actor, projectId);
      const readable = await canReadDocument(c, actor, projectId, documentId);
      if (!readable) throw missing();
      if (!(await guard())) return null as any;
    });

    const release = await this.guard.acquireShared(projectId, this.guard.getGeneration());
    try {
      if (!this.transport.listVersions) {
        throw new ProjectFault(503, 'access_unavailable');
      }
      const list = await this.transport.listVersions(projectId, documentId, cursor, limit);
      if (!list) throw missing();
      return list;
    } finally {
      release();
    }
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

    const release = await this.guard.acquireShared(projectId, this.guard.getGeneration());
    try {
      if (!this.transport.getVersion) {
        throw new ProjectFault(503, 'access_unavailable');
      }
      const version = await this.transport.getVersion(projectId, documentId, versionId);
      if (!version) throw missing();
      return version;
    } finally {
      release();
    }
  }
}
