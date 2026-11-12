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

export type VersionState = 'current' | 'superseded' | 'archived';

export interface VersionSummary {
  document_id: string;
  version_id: string;
  state: VersionState;
  created_at: string;
}

export interface VersionList {
  items: VersionSummary[];
  next_cursor: string | null;
  document_id: string;
  document_revision: number;
  current_version_id: string | null;
}

export interface KnowledgeVersion {
  document_id: string;
  version_id: string;
  state: VersionState;
  content: string;
  content_format: 'text' | 'markdown';
  created_at: string;
  revision: number;
}

export interface DocumentDetail {
  document: DocumentItem;
  content: string;
  policy?: DocumentPolicy | undefined;
  grants?: DocumentReadGrant[] | undefined;
  versions?: VersionSummary[] | undefined;
  viewingVersion?: KnowledgeVersion | undefined;
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
      const res = await this.transport(`/api/projects/${this.projectId}/documents`, {
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
      const res = await this.transport(`/api/projects/${this.projectId}/documents/${documentId}`, {
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
      let versions: VersionSummary[] | undefined;

      try {
        const policyRes = await this.transport(`/api/projects/${this.projectId}/documents/${documentId}/policy`, {
          headers: {'x-sacw-request': '1'},
        });
        if (policyRes.ok) {
          policy = await policyRes.json();
          const grantsRes = await this.transport(`/api/projects/${this.projectId}/documents/${documentId}/read-grants`, {
            headers: {'x-sacw-request': '1'},
          });
          if (grantsRes.ok) {
            const grantsData = await grantsRes.json();
            grants = grantsData.grants ?? [];
          }
        }
      } catch {}

      try {
        const versionsRes = await this.transport(`/api/projects/${this.projectId}/documents/${documentId}/versions`, {
          headers: {'x-sacw-request': '1'},
        });
        if (versionsRes.ok) {
          const vData: VersionList = await versionsRes.json();
          versions = vData.items;
        }
      } catch {}

      this.publish({
        detail: {...detail, policy, grants, versions},
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
      const res = await this.transport(`/api/projects/${this.projectId}/documents`, {
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
      const res = await this.transport(`/api/projects/${this.projectId}/documents/${documentId}/read-grants`, {
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
      const res = await this.transport(`/api/projects/${this.projectId}/documents/${documentId}/read-grants/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-sacw-request': '1',
          'x-expected-revision': String(expectedRevision),
          'idempotency-key': crypto.randomUUID(),
        },
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
      const res = await this.transport(`/api/projects/${this.projectId}/documents/${documentId}/classification`, {
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

  closeVersionView() {
    if (this.state.detail) {
      this.publish({
        detail: {...this.state.detail, viewingVersion: undefined},
      });
    }
  }

  async openVersion(documentId: string, versionId: string) {
    this.publish({busy: true, message: ''});
    try {
      const res = await this.transport(`/api/projects/${this.projectId}/documents/${documentId}/versions/${versionId}`, {
        headers: {'x-sacw-request': '1'},
      });
      if (!res.ok) {
        this.publish({busy: false, message: 'Could not load version details.'});
        return;
      }
      const version: KnowledgeVersion = await res.json();
      if (this.state.detail) {
        this.publish({
          detail: {...this.state.detail, viewingVersion: version},
          busy: false,
          message: '',
        });
      } else {
        this.publish({busy: false});
      }
    } catch {
      this.publish({busy: false, message: 'Network error loading version.'});
    }
  }

  async revise(documentId: string, content: string, expectedRevision: number) {
    this.publish({busy: true, message: ''});
    try {
      const res = await this.transport(`/api/projects/${this.projectId}/documents/${documentId}/revisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sacw-request': '1',
          'idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify({content, expected_revision: expectedRevision}),
      });
      if (res.status === 401) {
        this.expired();
        return;
      }
      if (res.status === 403) {
        this.publish({busy: false, message: 'You do not have write authority to revise this document.'});
        return;
      }
      if (res.status === 409) {
        this.publish({busy: false, message: 'Revision conflict: document was concurrently updated.'});
        return;
      }
      if (!res.ok) {
        this.publish({busy: false, message: 'Document revision failed.'});
        return;
      }
      await this.open(documentId);
      this.publish({message: 'New version published successfully.'});
    } catch {
      this.publish({busy: false, message: 'Network error publishing revision.'});
    }
  }

  async archiveVersion(documentId: string, versionId: string, expectedRevision: number) {
    this.publish({busy: true, message: ''});
    try {
      const res = await this.transport(`/api/projects/${this.projectId}/documents/${documentId}/versions/${versionId}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sacw-request': '1',
          'idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify({expected_revision: expectedRevision}),
      });
      if (res.status === 401) {
        this.expired();
        return;
      }
      if (res.status === 403) {
        this.publish({busy: false, message: 'You do not have authority to archive this version.'});
        return;
      }
      if (res.status === 409) {
        this.publish({busy: false, message: 'Archive conflict: version is already archived or document revision changed.'});
        return;
      }
      if (!res.ok) {
        this.publish({busy: false, message: 'Archiving version failed.'});
        return;
      }
      await this.open(documentId);
      this.publish({message: 'Version archived successfully.'});
    } catch {
      this.publish({busy: false, message: 'Network error archiving version.'});
    }
  }
}
