import {randomUUID} from 'node:crypto';
import type {WorkspaceDocumentStore} from './store.ts';
import type {ProjectRWGuard} from '../policy/guard.ts';
import {ProjectFault, invalid, missing, requestHash} from '../projects/outcomes.ts';
import type {DocumentClassification, DocumentKind} from './types.ts';

export interface CreateDocumentInput {
  title: string;
  classification: DocumentClassification;
  content: string;
  kind?: DocumentKind;
  labels?: string[];
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
}
