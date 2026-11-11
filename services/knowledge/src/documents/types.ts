export type DocumentKind = 'document' | 'decision';

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
  current_version_id: string;
  revision: number;
}
