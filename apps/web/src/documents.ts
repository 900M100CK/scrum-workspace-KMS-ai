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
  nextVersionCursor?: string | null;
  viewingVersion?: KnowledgeVersion | undefined;
}

export interface DocumentState {
  items: DocumentItem[];
  detail: DocumentDetail | null;
  busy: boolean;
  message: string;
  recoveryPending?: boolean;
}

const recoveryPrefix = 'sacw:document-command:';
type PendingCommand = {actor: string; project: string; document: string; version?: string | undefined; key: string; body: string};
type RecoveryStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

type Transport = (url: string, init: RequestInit) => Promise<Response>;

const initial = (): DocumentState => ({
  items: [],
  detail: null,
  busy: false,
  message: '',
});

export class DocumentController {
  private readonly actor: string;
  private readonly recoveryKey: string;
  private readonly projectId: string;
  private readonly expired: () => void;
  private readonly transport: Transport;
  private state = initial();
  private pending: PendingCommand | undefined;
  private storage?: RecoveryStorage;
  private readonly listeners = new Set<() => void>();

  constructor(
    actor: string,
    projectId: string,
    expired: () => void,
    transport: Transport = (url, init) => fetch(url, init),
    storage?: RecoveryStorage
  ) {
    this.actor = actor;
    this.recoveryKey = recoveryPrefix + actor + ':' + projectId;
    this.projectId = projectId;
    this.expired = expired;
    this.transport = transport;
    try {
      this.storage = storage ?? globalThis.sessionStorage;
      const raw = this.storage?.getItem(this.recoveryKey);
      if (raw) {
        const saved = JSON.parse(raw) as PendingCommand;
        const uuid = (value: unknown) => typeof value === 'string' &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
        if (saved.actor === actor && saved.project === projectId && uuid(saved.document) &&
            uuid(saved.key) && (saved.version === undefined || uuid(saved.version)) &&
            typeof saved.body === 'string') {
          const body = JSON.parse(saved.body);
          if (Number.isSafeInteger(body.expected_revision) && body.expected_revision > 0 &&
              (saved.version ? Object.keys(body).length === 1 :
                Object.keys(body).length === 2 && typeof body.content === 'string')) {
            this.pending = saved;
            this.state.recoveryPending = true;
          }
        }
      }
    } catch { /* Reads remain available if browser storage is unavailable. */ }
  }

  static clearPending() {
    try {
      const storage = globalThis.sessionStorage;
      if (!storage) return;
      for (let index = storage.length - 1; index >= 0; index--) {
        const key = storage.key(index);
        if (key?.startsWith(recoveryPrefix)) storage.removeItem(key);
      }
    } catch { /* The browser can disable storage. */ }
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
      let nextVersionCursor: string | null = null;

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
          nextVersionCursor = vData.next_cursor;
        }
      } catch {}

      this.publish({
        detail: {...detail, policy, grants, versions, nextVersionCursor},
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

  async loadMoreVersions() {
    const detail = this.state.detail;
    if (!detail?.nextVersionCursor || this.state.busy) return;
    const id = detail.document.document_id;
    this.publish({busy: true});
    try {
      const response = await this.transport(
        this.documentUrl(id) + '/versions?' + new URLSearchParams({cursor: detail.nextVersionCursor}),
        {headers: {'x-sacw-request': '1'}}
      );
      if (response.status === 401) { this.expired(); return; }
      if (response.status === 409) { await this.open(id); return; }
      if (!response.ok) {
        this.publish({detail: null, busy: false, message: 'Version history unavailable.'});
        return;
      }
      const page: VersionList = await response.json();
      if (this.state.detail !== detail) return;
      this.publish({busy: false, detail: {...detail, versions: [...(detail.versions ?? []), ...page.items],
        nextVersionCursor: page.next_cursor}});
    } catch {
      this.publish({busy: false, message: 'Could not load version history.'});
    }
  }

  private documentUrl(id: string) {
    return `/api/projects/${this.projectId}/documents/${encodeURIComponent(id)}`;
  }

  revise(document: string, content: string, expectedRevision: number) {
    return this.startCommand(document, {content, expected_revision: expectedRevision});
  }

  archiveVersion(document: string, version: string, expectedRevision: number) {
    return this.startCommand(document, {expected_revision: expectedRevision}, version);
  }

  private async startCommand(document: string, payload: object, version?: string) {
    if (this.state.busy) return;
    if (this.pending) {
      this.publish({message: 'Retry the pending version change first.'});
      return;
    }
    const command = {actor: this.actor, project: this.projectId, document, version,
      key: crypto.randomUUID(), body: JSON.stringify(payload)};
    try {
      if (!this.storage && typeof window !== 'undefined') throw new Error('Storage unavailable');
      this.storage?.setItem(this.recoveryKey, JSON.stringify(command));
      this.pending = command;
    } catch {
      this.publish({message: 'Could not save recovery for the version change.'});
      return;
    }
    await this.retryPending();
  }

  async retryPending() {
    const command = this.pending;
    if (!command || this.state.busy) return;
    this.publish({busy: true, recoveryPending: true, message: ''});
    const suffix = command.version ? '/versions/' + encodeURIComponent(command.version) + '/archive' : '/revisions';
    try {
      const response = await this.transport(this.documentUrl(command.document) + suffix, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'x-sacw-request': '1', 'idempotency-key': command.key},
        body: command.body,
      });
      if (response.status === 401) {
        this.publish({busy: false, detail: null});
        this.expired();
        return;
      }
      if (response.ok || [400, 403, 404, 409, 413, 415].includes(response.status)) {
        this.storage?.removeItem(this.recoveryKey);
        this.pending = undefined;
        this.publish({busy: false, recoveryPending: false});
        if (response.ok) {
          await this.open(command.document);
          this.publish({message: command.version ? 'Version archived successfully.' : 'New version published successfully.'});
        } else {
          this.publish({message: response.status === 409
            ? (command.version ? 'Archive conflict: version is already archived or document revision changed.'
              : 'Revision conflict: document was concurrently updated.')
            : response.status === 403 ? 'You do not have authority for this version change.'
              : 'Version change rejected.'});
        }
      } else {
        this.publish({busy: false, detail: null, message: 'Version change outcome unknown. Retry the pending request.'});
      }
    } catch {
      this.publish({busy: false, detail: null, message: 'Version change outcome unknown. Retry the pending request.'});
    }
  }
}
