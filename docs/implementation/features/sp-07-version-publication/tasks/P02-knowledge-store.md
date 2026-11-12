# Task Brief: SP07-P02 Knowledge Versioning Store

**Task ID:** SP07-P02  
**Parent plan:** [FEAT-SP07-01](../plan.md)  
**Deliverable:** Knowledge versioning backend store methods  
**Dependency:** P01  
**Allowed paths:** `services/knowledge/src/documents/**`, `tests/knowledge/**`  

## Objective & Scope
Implement backend store methods in `services/knowledge/src/documents/store.ts`:
- `reviseDocument(actorId, projectId, documentId, input, key, correlation)`: atomic supersession of current version, insertion of new Current version, passages, pointer update, audit, and idempotency.
- `archiveVersion(actorId, projectId, documentId, versionId, input, key, correlation)`: transitions version to `archived`; clears pointer if current.
- `listVersions(projectId, documentId, cursor, limit)`: returns version metadata list (no content), ordered `created_at DESC, version_id ASC`.
- `getVersion(projectId, documentId, versionId)`: returns exact version content and passages.
- `deleteDocument(actorId, projectId, documentId, key, correlation)`: atomic document deletion.

## Verification
- Unit test suite on disposable PG: `tests/knowledge/document-versioning.test.mjs`.
