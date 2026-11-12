# Task Brief: SP07-P04 Workspace Revision Orchestration

**Task ID:** SP07-P04  
**Parent plan:** [FEAT-SP07-01](../plan.md)  
**Deliverable:** Workspace gateway routes, exclusive ProjectRWGuard, and revision orchestration  
**Dependency:** P02, P03  
**Allowed paths:** `services/workspace/src/documents/**`, `tests/integration/**`  

## Objective & Scope
1. Update `services/workspace/src/documents/authority.ts`: verify `hasDocumentWriteAuthority(memberRole, capabilities)`.
2. Update `services/workspace/src/documents/orchestration.ts`: implement `reviseDocument`, `archiveVersion`, `deleteDocument` using `ProjectRWGuard` with exclusive write locking.
3. Register routes in `services/workspace/src/documents/http.ts`:
   - `POST /projects/:project_id/documents/:document_id/revisions`
   - `POST /projects/:project_id/documents/:document_id/versions/:version_id/archive`
   - `DELETE /projects/:project_id/documents/:document_id`

## Verification
- Integration test suite: `tests/integration/document-revisions.test.mjs`.
