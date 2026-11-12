export type DocumentKind = 'document' | 'decision';
export type VersionState = 'current' | 'superseded' | 'archived';

export interface PersistDocumentInput {
  document_id: string;
  project_id: string;
  owner_id: string;
  title: string;
  kind?: DocumentKind;
  labels?: string[];
  content: string;
}

export interface KnowledgeDocument {
  document_id: string;
  project_id: string;
  kind: DocumentKind;
  title: string;
  owner_id: string;
  labels: string[];
  current_version_id: string | null;
  revision: number;
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
