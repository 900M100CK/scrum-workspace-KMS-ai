# Task Brief: SP07-P05 Version History Explorer & Reads

**Task ID:** SP07-P05  
**Parent plan:** [FEAT-SP07-01](../plan.md)  
**Deliverable:** Gateway routes for version listing and exact locator reads  
**Dependency:** P03, P04  
**Allowed paths:** `services/workspace/src/documents/**`, `tests/integration/**`  

## Objective & Scope
1. Implement `listVersions` and `getVersion` in `services/workspace/src/documents/orchestration.ts` and `http.ts`:
   - `GET /projects/:project_id/documents/:document_id/versions`
   - `GET /projects/:project_id/documents/:document_id/versions/:version_id`
2. Enforce dual-layer authorization: check current project membership AND document read grant (`read_grant` or `project_shared`).
3. Return generic 404 nondisclosure on denied/unreadable targets.

## Verification
- Integration test suite: `tests/integration/document-history-reads.test.mjs`.
