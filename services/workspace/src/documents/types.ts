export type DocumentClassification = 'project_shared' | 'restricted';
export type DocumentKind = 'document' | 'decision';
export type RegistryState = 'active' | 'unavailable';

export interface RegisterDocumentPolicyInput {
  document_id?: string;
  classification: DocumentClassification;
  payload_hash?: string;
}

export interface DocumentPolicy {
  document_id: string;
  project_id: string;
  classification: DocumentClassification;
  registry_state: RegistryState;
  permission_revision: number;
}

export interface ReadGrant {
  project_id: string;
  document_id: string;
  user_id: string;
  grant_generation: number;
  membership_generation: number;
  valid: boolean;
  revision: number;
}

export interface RegisterDocumentPolicyOutcome {
  status: 200 | 201;
  policy: DocumentPolicy;
  projectId: string;
  authorReadGrantId?: string;
}

export interface GrantReadInput {
  user_id: string;
  expected_revision: number;
}

export interface RevokeReadInput {
  expected_revision: number;
}

export interface SetClassificationInput {
  classification: DocumentClassification;
  expected_revision: number;
}

export interface DocumentReadGrantsResponse {
  document_id: string;
  project_id: string;
  permission_revision: number;
  grants: Array<{
    user_id: string;
    grant_generation: number;
    membership_generation: number;
    revision: number;
  }>;
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
