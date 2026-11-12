# Task Brief: SP07-P06 Web UI in apps/web

**Task ID:** SP07-P06  
**Parent plan:** [FEAT-SP07-01](../plan.md)  
**Deliverable:** Version history list, revision editor, archive button in React web app  
**Dependency:** P04, P05  
**Allowed paths:** `apps/web/src/**`, `apps/web/test/**`  

## Objective & Scope
1. Update `apps/web/src/documents.ts`:
   - Add `revise(documentId, content, expectedRevision)`.
   - Add `listVersions(documentId)`.
   - Add `openVersion(documentId, versionId)`.
   - Add `archiveVersion(documentId, versionId, expectedRevision)`.
2. Update `apps/web/src/DocumentWorkspace.tsx`:
   - Version history list with badges (`Current`, `Superseded`, `Archived`).
   - Revision form for authors to publish a new Current version.
   - Archive version action button.
   - Clean view of historical version content.

## Verification
- Unit & SSR component tests: `apps/web/test/documents.test.ts`.
