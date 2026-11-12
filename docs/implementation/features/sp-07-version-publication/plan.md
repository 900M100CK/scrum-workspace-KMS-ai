# FEAT-SP07-01: Revise and retire a knowledge version

**Artifact ID:** FEAT-SP07-01  
**Version/date:** 0.1 Draft · 11 November 2026  
**Status:** Complete; all tasks P01–P09 verified  
**Inputs:** [SP-07 canonical spec](../../../specs/007-version-publication.md) v0.6.3; [PRD-01](../../sdlc/PRD_SRS.md) v0.10.3; [contracts/openapi](../../../contracts/openapi/knowledge.openapi.json); Proposed ADR-0009/0011/0013/0019/0022/0033.  
**Trace:** FR-11, FR-12, FR-13, FR-15, FR-19, FR-47, FR-48, FR-61; BR-05, BR-07, BR-12, BR-14; SC-05, SC-06.  
**Owner role:** Sequential implementer.  
**Planning mode:** Active Plan Mode (`/plan`).  
**Work kind:** Feature development.  

## Goal, scope and boundaries

Deliver atomic knowledge revisions (immediate Current), immutable historical version retention with explicit labels (`current`, `superseded`, `archived`), version archiving and document deletion, dual-layer authorization on version traversal, and client UI for revision authoring and history inspection.

### Non-goals
- Vector embeddings and AI retrieval (SP-08, SP-09).
- Product Draft or separate publishing workflow (FR-45 Withdrawn; immediate Current revision per ADR-0009).
- Direct cross-service database access.
- Unauthenticated version browsing.

---

## Tasks and Execution State

| Task ID | Reviewable outcome | Depends on | Status / Evidence |
|---|---|---|---|
| [SP07-P01](tasks/P01-source-readiness.md) | Source readiness, schema inspection and plan registration | None | Verified; P01 complete; P02 next |
| [SP07-P02](tasks/P02-knowledge-store.md) | Knowledge versioning store (`reviseDocument`, `archiveVersion`, `listVersions`, `getVersion`, `deleteDocument`) | P01 | Verified; [evidence](evidence/p02-20261111/results.json) (6/6 pass); P03 next |
| [SP07-P03](tasks/P03-internal-transport.md) | Internal service transport with constant-time `X-Service-Key` | P02 | Verified; [evidence](evidence/p03-20261111/results.json) (4/4 pass); P04 next |
| [SP07-P04](tasks/P04-workspace-orchestration.md) | Workspace authority check, exclusive `ProjectRWGuard`, and revision orchestration | P02, P03 | Verified; [evidence](evidence/p04-20261111/results.json) (6/6 pass); P05 next |
| [SP07-P05](tasks/P05-history-reads.md) | Version history explorer and historical version reads | P03, P04 | Verified; [evidence](evidence/p05-20261111/results.json) (5/5 pass); P06 next |
| [SP07-P06](tasks/P06-web-ui.md) | React Web UI: Version History panel, revision editor, archive control | P04, P05 | Verified; [evidence](evidence/p06-20261111/results.json) (9/9 pass); P07 next |
| [SP07-P07](tasks/P07-concurrency-failures.md) | Concurrency, CAS revision conflict (409) and permission revocation boundaries | P04, P05, P06 | Verified; [evidence](evidence/p07-20261111/results.json) (5/5 pass); P08 next |
| [SP07-P08](tasks/P08-runtime-verification.md) | Runtime DOM & end-to-end versioning journey verification | P06, P07 | Verified; [evidence](evidence/p08-20261111/results.json) (7/7 pass); P09 next |
| [SP07-P09](tasks/P09-preflight-pr.md) | Full pre-flight verification gate and GitHub Pull Request publication | P01–P08 | Verified; [evidence](evidence/p09-20261111/results.json) (all gates pass); Complete |

---

## Acceptance and Verification Strategy

1. **Atomic revision (FR-11, AC-11)**:
   - Revision atomically updates old Current version to `superseded` (`revision = revision + 1`).
   - Inserts new version with `state = 'current'`.
   - Bumps `document.revision` and updates `document.current_version_id`.
   - Enforces trigger `protect_version()`: immutable content cannot be altered in place.
   - Idempotency replay with same key returns cached result; differing payload returns 409 conflict.
2. **Explicit history (FR-12, FR-19, ADR-0019)**:
   - `listVersions` returns versions ordered by `created_at DESC, version_id ASC`.
   - Versions contain labels (`current`, `superseded`, `archived`) and revision numbers; NO content is returned in history listing.
   - Dual-layer access check: requires current project membership AND active document read grant. Denied targets return generic 404 nondisclosure.
3. **Archiving (FR-13)**:
   - Transitioning an active version to `archived` preserves immutable content.
   - If Current version is archived, `document.current_version_id` is set to `NULL`.
4. **Deletion (FR-15)**:
   - Deleting a document marks it deleted or clears it atomically, invalidating future reads.
5. **Concurrency & Bounds (ADR-0011, ADR-0033)**:
   - Competing revisions on the same document revision yield exactly one success and one 409 conflict.
   - Exclusive lock via `ProjectRWGuard` prevents concurrent reads during active mutation.
