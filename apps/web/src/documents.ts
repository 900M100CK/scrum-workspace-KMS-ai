export type DocumentClassification = 'project_shared' | 'restricted';
export type DocumentKind = 'document' | 'decision';

export interface DocumentItem {
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

export interface DocumentPolicy {
  document_id: string;
  project_id: string;
  classification: DocumentClassification;
  registry_state: 'active' | 'unavailable';
  permission_revision: number;
}

export interface DocumentReadGrant {
  user_id: string;
  grant_generation: number;
  membership_generation: number;
  revision: number;
}

export interface DocumentDetail {
  document: DocumentItem;
  content: string;
  policy?: DocumentPolicy | undefined;
  grants?: DocumentReadGrant[] | undefined;
}

export interface DocumentState {
  items: DocumentItem[];
  detail: DocumentDetail | null;
  busy: boolean;
  message: string;
}

type Transport = (url: string, init: RequestInit) => Promise<Response>;

const initial = (): DocumentState => ({
  items: [],
  detail: null,
  busy: false,
  message: '',
});

export class DocumentController {
  private readonly actor: string;
  private readonly projectId: string;
  private readonly expired: () => void;
  private readonly transport: Transport;
  private state = initial();
  private readonly listeners = new Set<() => void>();

  constructor(
    actor: string,
    projectId: string,
    expired: () => void,
    transport: Transport = (url, init) => fetch(url, init)
  ) {
    this.actor = actor;
    this.projectId = projectId;
    this.expired = expired;
    this.transport = transport;
  }

  getSnapshot = () => this.state;
  subscribe = (f: () => void) => {
    this.listeners.add(f);
    return () => {
      this.listeners.delete(f);
    };
  };

  private publish(update: Partial<DocumentState>) {
    this.state = {...this.state, ...update};
    for (const f of this.listeners) f();
  }

  cancel() {
    this.publish({detail: null});
  }

  async refresh() {
    this.publish({busy: true, message: ''});
    try {
      const res = await this.transport(`/projects/${this.projectId}/documents`, {
        headers: {'x-sacw-request': '1'},
      });
      if (res.status === 401) {
        this.expired();
        return;
      }
      if (!res.ok) {
        this.publish({busy: false, message: 'Could not load documents.'});
        return;
      }
      const data = await res.json();
      this.publish({items: data.items ?? [], detail: null, busy: false, message: ''});
    } catch {
      this.publish({busy: false, message: 'Documents service unavailable.'});
    }
  }

  async open(documentId: string) {
    this.publish({busy: true, message: ''});
    try {
      const res = await this.transport(`/projects/${this.projectId}/documents/${documentId}`, {
        headers: {'x-sacw-request': '1'},
      });
      if (res.status === 401) {
        this.expired();
        return;
      }
      if (res.status === 404) {
        this.publish({busy: false, detail: null, message: 'Document unavailable or read denied.'});
        return;
      }
      if (!res.ok) {
        this.publish({busy: false, message: 'Could not load document.'});
        return;
      }
      const detail: {document: DocumentItem; content: string} = await res.json();

      let policy: DocumentPolicy | undefined;
      let grants: DocumentReadGrant[] | undefined;

      try {
        const policyRes = await this.transport(`/projects/${this.projectId}/documents/${documentId}/policy`, {
          headers: {'x-sacw-request': '1'},
        });
        if (policyRes.ok) {
          policy = await policyRes.json();
          const grantsRes = await this.transport(`/projects/${this.projectId}/documents/${documentId}/read-grants`, {
            headers: {'x-sacw-request': '1'},
          });
          if (grantsRes.ok) {
            const grantsData = await grantsRes.json();
            grants = grantsData.grants ?? [];
          }
        }
      } catch {}

      this.publish({
        detail: {...detail, policy, grants},
        busy: false,
        message: '',
      });
    } catch {
      this.publish({busy: false, message: 'Could not load document detail.'});
    }
  }

  async create(title: string, classification: DocumentClassification, content: string) {
    this.publish({busy: true, message: ''});
    try {
      const res = await this.transport(`/projects/${this.projectId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sacw-request': '1',
          'idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify({title, classification, content}),
      });
      if (res.status === 401) {
        this.expired();
        return;
      }
      if (res.status === 403) {
        this.publish({busy: false, message: 'Creating documents is not permitted for your role.'});
        return;
      }
      if (!res.ok) {
        this.publish({busy: false, message: 'Document creation rejected.'});
        return;
      }
      const created = await res.json();
      await this.refresh();
      this.publish({message: `Document "${created.title}" created successfully.`});
    } catch {
      this.publish({busy: false, message: 'Creation failed; network error.'});
    }
  }

  async grantRead(documentId: string, userId: string, expectedRevision: number) {
    this.publish({busy: true, message: ''});
    try {
      const res = await this.transport(`/projects/${this.projectId}/documents/${documentId}/read-grants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sacw-request': '1',
          'idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify({user_id: userId, expected_revision: expectedRevision}),
      });
      if (!res.ok) {
        this.publish({busy: false, message: 'Grant read access failed.'});
        return;
      }
      await this.open(documentId);
    } catch {
      this.publish({busy: false, message: 'Network error granting access.'});
    }
  }

  async revokeRead(documentId: string, userId: string, expectedRevision: number) {
    this.publish({busy: true, message: ''});
    try {
      const res = await this.transport(`/projects/${this.projectId}/documents/${documentId}/read-grants/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-sacw-request': '1',
          'idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify({expected_revision: expectedRevision}),
      });
      if (!res.ok) {
        this.publish({busy: false, message: 'Revoking access failed.'});
        return;
      }
      await this.open(documentId);
    } catch {
      this.publish({busy: false, message: 'Network error revoking access.'});
    }
  }

  async setClassification(documentId: string, classification: DocumentClassification, expectedRevision: number) {
    this.publish({busy: true, message: ''});
    try {
      const res = await this.transport(`/projects/${this.projectId}/documents/${documentId}/classification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sacw-request': '1',
          'idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify({classification, expected_revision: expectedRevision}),
      });
      if (!res.ok) {
        this.publish({busy: false, message: 'Changing classification failed.'});
        return;
      }
      await this.open(documentId);
    } catch {
      this.publish({busy: false, message: 'Network error changing classification.'});
    }
  }
}
