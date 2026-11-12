# Work Breakdown Structure: SP-07 Version Publication

**Artifact ID:** SP07-WBS-01  
**Version/date:** 0.1 Draft · 11 November 2026  
**Status:** In progress; task planning  
**Parent plan:** [FEAT-SP07-01](plan.md)  
**Parent spec:** [SP-07](../../../specs/007-version-publication.md)  

## WBS Dictionary & Task Map

| WBS Code | Task ID | Deliverable | Dependency | Target Paths |
|---|---|---|---|---|
| **SP07-1** | [SP07-P01](tasks/P01-source-readiness.md) | Source readiness, schema inspection and plan registration | None | `docs/implementation/features/sp-07-version-publication/**`, `docs/sdlc/artifact-register.md` |
| **SP07-2** | [SP07-P02](tasks/P02-knowledge-store.md) | Knowledge versioning store (`reviseDocument`, `archiveVersion`, `listVersions`, `getVersion`, `deleteDocument`) | P01 | `services/knowledge/src/documents/store.ts`, `services/knowledge/src/documents/types.ts` |
| **SP07-3** | [SP07-P03](tasks/P03-internal-transport.md) | Internal service transport with constant-time `X-Service-Key` | P02 | `services/knowledge/src/documents/http.ts`, `services/knowledge/src/documents/auth.ts` |
| **SP07-4** | [SP07-P04](tasks/P04-workspace-orchestration.md) | Workspace authority check, exclusive `ProjectRWGuard`, and revision orchestration | P02, P03 | `services/workspace/src/documents/authority.ts`, `services/workspace/src/documents/orchestration.ts`, `services/workspace/src/documents/http.ts` |
| **SP07-5** | [SP07-P05](tasks/P05-history-reads.md) | Version history explorer and historical version reads | P03, P04 | `services/workspace/src/documents/store.ts`, `services/workspace/src/documents/orchestration.ts`, `services/workspace/src/documents/http.ts` |
| **SP07-6** | [SP07-P06](tasks/P06-web-ui.md) | React Web UI: Version History panel, revision editor, archive control | P04, P05 | `apps/web/src/documents.ts`, `apps/web/src/DocumentWorkspace.tsx` |
| **SP07-7** | [SP07-P07](tasks/P07-concurrency-failures.md) | Concurrency, CAS revision conflict (409) and permission revocation boundaries | P04, P05, P06 | `tests/integration/document-revision-concurrency.test.mjs` |
| **SP07-8** | [SP07-P08](tasks/P08-runtime-verification.md) | Runtime DOM & end-to-end versioning journey verification | P06, P07 | `tests/workspace/document-version-ui.test.mjs` |
| **SP07-9** | [SP07-P09](tasks/P09-preflight-pr.md) | Full pre-flight verification gate and GitHub Pull Request publication | P01–P08 | `docs/implementation/features/sp-07-version-publication/plan.md` |
