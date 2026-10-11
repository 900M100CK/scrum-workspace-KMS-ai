# User Flow: Knowledge Management (Docs & Versions)

**Artifact ID:** UX-FLOW-DOCS-02\
**Version/date:** 0.3 Draft · 11 October 2026\
**Status:** Draft correction; not policy approval.\
**Sources:** PRD-01 v0.4; UC-02 v0.2 (UC-06/UC-07); SAD-03 v0.5; Proposed ADR-0001 v0.2 and ADR-0006 v0.1; Knowledge/Workspace OpenAPI v0.1.0.\
**Trace:** BR-01, BR-04, BR-05, BR-07, BR-08, BR-10, BR-11, BR-12, BR-14; FR-04, FR-10–FR-15, FR-19, FR-31, FR-39, FR-45–FR-48, FR-50–FR-52, FR-55, FR-59, FR-61; SC-05, SC-06.

## 1. Creation and immutable revisions

An authorised author enters title, text/Markdown and an explicit `project-shared` or `restricted` classification. Missing classification rejects creation. Unsaved editor text is form state, not a persisted Draft. The initial version is **Current**; subsequent content revisions create distinct immutable **Drafts**. Saving again creates another version rather than overwriting an existing version or passage.

The server checks authenticated session, current project membership and operation-specific capability. Project-shared reads need membership; restricted reads also need an explicit current read grant. Direct Draft reads require membership and content-write authority under ADR-0001, with applicable project/document checks. Read, content-write, publish, lifecycle and manage-access authority are separate; author/PO/Admin titles do not replace these checks.

Creation coordinates Knowledge-owned content and Workspace-owned policy registration. A `202` response means registration is pending, not a completed accessible document. Only an authenticated internal service calls `POST /internal/document-registry/{document_id}/activate`; the browser never calls it. This activates the creation registry, not the search index. Partial registration fails closed until reconciliation.

## 2. Publication, readiness and retirement

| Situation | Behaviour and presentation |
| --- | --- |
| Save revision | Require content-write; persist a new immutable Draft. Label unpublished. Exclude from ordinary/historical retrieval and model input. |
| Publish | Require scoped publisher capability and confirmation. Send Document aggregate `expected_revision` and required idempotency key. Show “Publishing” while waiting; this is a UI operation state, not another lifecycle state. |
| Confirmed publication | Knowledge atomically makes replacement Current and previous Current Superseded. Update badges after confirmation. Independently display readiness: `pending` = “Indexing”, `ready` = “Search ready”, `failed` = “Indexing failed”. Current does not promise immediate searchability. |
| Concurrent publication / stale write | On `409`, retain unsaved text, refresh permitted aggregate/version state and require a fresh decision. Never overwrite a newer Current pointer silently. |
| Publish failure / unknown outcome | Show generic failure, reconcile authoritative state and avoid blind retries. An unknown remote lifecycle-write outcome blocks protected handoffs until reconciliation under ADR-0006. |
| Indexing failure | Retain confirmed lifecycle badge and show failed readiness. Background retry is idempotent and rejects obsolete/out-of-order work. No browser reindex endpoint is assumed. |
| History / citation | Deliberately select history, label Superseded/Archived, recheck access and preserve exact version/passage. Never substitute Current; show a Current link only if independently readable. |
| Archive / delete | Require lifecycle authority and confirmation. Archive excludes ordinary retrieval; deletion stops active access/new answer support. Retained history/identity depends on OD-04. Tombstones/current validation prevent stale jobs and caches from reviving evidence. |

Publication/archive/deletion use the Workspace gateway guard but commit only in Knowledge. Final version validation stays inside the protected handoff guard, following Proposed ADR-0006.

## 3. Access management and failures

A scoped document access manager may change classification or grant/revoke without automatically reading content. Provide an access-management entry independently of the content viewer. Grant only to current members. Record audit events for committed mutations.

After revocation/removal, subsequent protected reads, provider submissions, answer deliveries and citation opens recheck current authority. Membership removal invalidates restricted grants; rejoining restores project-shared access only. Revocation success follows the ADR-0006 guarded commit boundary; already transmitted data cannot be recalled.

Expired/missing sessions require sign-in (`401`). Inaccessible and unknown resources use identical generic `404` responses without title, owner, version, hidden count or excerpt. A known readable target with insufficient action capability may return `403`. Unknown/failed authority checks deny output with a generic service error (`503`), never unrestricted fallback. Specific “Citation unavailable” is only for readers entitled to surviving citation identity; retention rights and exact API representation remain open.

## 4. Contract mapping and diagrams

Paths are OpenAPI keys relative to server `/api`; revision/idempotency inputs follow each operation.

| Action | Method and path |
| --- | --- |
| Create | `POST /knowledge/documents` |
| Read | `GET /knowledge/documents/{document_id}` |
| Save revision | `POST /knowledge/documents/{document_id}/versions` |
| Exact version | `GET /knowledge/documents/{document_id}/versions/{version_id}` |
| Publish | `POST /knowledge/documents/{document_id}/versions/{version_id}/publish` |
| Readiness | `GET /knowledge/documents/{document_id}/versions/{version_id}/readiness` |
| Archive | `POST /knowledge/documents/{document_id}/versions/{version_id}/archive` |
| Delete | `DELETE /knowledge/documents/{document_id}` |
| Classification | `POST /documents/{document_id}/classification` |
| Grant | `POST /documents/{document_id}/read-grants` |
| Revoke one grant | `DELETE /documents/{document_id}/read-grants/{user_id}` |

DGM-FLOW-03: [Mermaid](../../sdlc/diagrams/flowchart/docs-flow.mmd) · [Draw.io](../../sdlc/diagrams/flowchart/docs-flow.drawio). Shared checks: [permission flow](../../sdlc/diagrams/flowchart/permission-read-flow.mmd).

**Assumptions/open decisions:** OD-02/OD-04 and ADRs remain Proposed. This flow derives policy from PRD/ADRs and cannot override them. Pending creation reconciliation and unavailable-citation response need Stage 5 detail; no polling/retry API is invented.

**Checklist/handoff:** Pass for documented lifecycle, capability, readiness and denial branches; Gap for rendered/usability, runtime/concurrency tests and owner acceptance. Ready for downstream correction/test design. v0.3 addresses D1–D6 including D4b; no upstream policy/contract change.
