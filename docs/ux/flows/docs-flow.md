# User Flow: Knowledge Management (Docs & Versions)

**Artifact ID:** UX-FLOW-DOCS-02\
**Version/date:** 0.9.2 Draft · 3 November 2026
**Status:** Owner-confirmed policy direction; UI, diagram and runtime verification pending.\
**Sources:** PRD-01 v0.10.1; UC-02 v0.8.2 (UC-06/UC-07); SAD-03 v0.16.2; ADR-0007/0009/0011/0013/0017; Workspace OpenAPI v0.2.8 / Knowledge v0.2.9\; Proposed ADR-0022
**Trace:** BR-01, BR-04, BR-05, BR-07, BR-08, BR-10, BR-11, BR-12, BR-14; FR-04, FR-10–FR-15, FR-19, FR-31, FR-39, FR-46–FR-48, FR-50–FR-52, FR-55, FR-59, FR-61; SC-05, SC-06. FR-45 is Withdrawn, with replacement/history assertions under AC-11.

## 1. Creation and immutable revisions

An authorised author enters title, text/Markdown and an explicit `project-shared` or `restricted` classification. Missing classification rejects creation. Unsaved editor text is local form state, not a product Draft. Initial creation and each successful revision produce a distinct immutable **Current** version. Explain beside Save that the new version becomes Current immediately; saving atomically makes the previous Current Superseded without changing its bytes or passage locators. There is no publish control or publisher capability.

The server checks authenticated session, current project membership and operation-specific capability. Project-shared reads need membership; restricted reads also need an explicit current read grant. Creation gives the restricted author an explicit revocable read grant. Read, content-write, lifecycle and manage-access authority remain separate; author/PO/Admin titles do not replace these checks. Revoking the author grant denies later protected reads even while write/manage capabilities remain.

Creation first registers a Workspace-allocated identity, policy, author capabilities and restricted read grant; Knowledge then persists content under that identity. These internal calls are gateway responsibilities, not browser steps. A `202` response means an uncertain/pending creation outcome, not an accessible document or completed indexing. Registered policy alone grants no content availability. There is no separate activation endpoint. Reconcile retries using the same scoped key; delayed persistence must be resolved before any orphan cleanup.

## 2. Immediate revision, readiness and retirement

| Situation | Behaviour and presentation |
| --- | --- |
| Save revision | Require content-write; send exactly one already-known expected aggregate revision or action-bound opaque token, plus scoped idempotency key. Show “Saving” while waiting; this is an operation state, not a version lifecycle. |
| Confirmed revision | Knowledge atomically creates replacement Current, makes previous Current Superseded and updates the pointer. The response is a minimal command receipt. Fetch protected display data only with separately renewed read authority, then update badges. Independently display semantic readiness: `pending` = “Semantic indexing”, `ready` = “Semantic search ready”, `failed` = “Semantic indexing failed”. Keyword availability depends on committed, permitted, current passages and survives embedding failure; Current alone promises neither path is ready. |
| Concurrent revision / stale write | On `409`, retain unsaved text, refresh only permitted state and require a fresh decision. Never overwrite a newer Current pointer silently. |
| Save failure / unknown outcome | Show explicit failure/pending, reconcile authoritative state and avoid blind retries. Reuse the original key for the same request. Unknown remote lifecycle-write outcomes block affected protected handoffs until reconciliation under ADR-0011. |
| Indexing failure | Retain confirmed lifecycle badge and show failed readiness. Background retry is idempotent and rejects obsolete/out-of-order work. No browser reindex endpoint is assumed. |
| History / citation | Deliberately select history, label Superseded/Archived, recheck access and preserve exact version/passage. Never substitute Current; show a Current link only if independently readable. |
| Archive / delete | Require lifecycle authority and confirmation. Archive excludes ordinary retrieval; deletion stops active access/new answer support. Retained history/identity depends on OD-04. Tombstones/current validation prevent stale jobs and caches from reviving evidence. |

Revision/archive/deletion use the Workspace gateway guard but commit only in Knowledge. Final permission/version validation and protected source/citation response handoff stay inside that guard, following ADR-0011. Internal scoped/authenticated policy/state reads do not reacquire it. Generation waits remain outside the guard.

## 3. Access management and failures

A scoped document access manager may change classification or grant/revoke without automatically reading content. Provide access-management, content-write and lifecycle entries by known document identity independently of the read-filtered explorer and content viewer. Check the requested capability before exposing action metadata; do not add a readable-document listing bypass. Revision accepts new text; prefill, history, readiness and content-bearing responses require separate read permission. Return only operation-authorised metadata otherwise. Grant only to current members. Record audit events for committed mutations.

After revocation/removal, subsequent protected reads, provider submissions, answer deliveries and citation opens recheck current authority. Membership removal invalidates restricted grants; rejoining restores project-shared access only. Revocation success follows the ADR-0006 guarded commit boundary; already transmitted data cannot be recalled.

Expired/missing sessions require sign-in (`401`). Inaccessible and unknown resources use identical generic `404` responses without title, owner, version, hidden count or excerpt. A known readable target with insufficient action capability may return `403`. Unknown/failed authority checks deny output with a generic service error (`503`), never unrestricted fallback. Specific “Citation unavailable” is only for readers entitled to surviving citation identity; ADR-0013 requires current membership and retained document-read policy; OpenAPI v0.2.1 returns the verified exact locator with unavailable state and no excerpt.

## 4. Contract mapping and diagrams

Paths are OpenAPI keys relative to server `/api`; revision/idempotency inputs follow each operation.

| Action | Method and path |
| --- | --- |
| Create | `POST /knowledge/documents` |
| Read | `GET /knowledge/documents/{document_id}` |
| Save revision | `POST /knowledge/documents/{document_id}/versions` |
| Exact version | `GET /knowledge/documents/{document_id}/versions/{version_id}` |
| Readiness | `GET /knowledge/documents/{document_id}/versions/{version_id}/readiness` |
| Archive | `POST /knowledge/documents/{document_id}/versions/{version_id}/archive` |
| Delete | `DELETE /knowledge/documents/{document_id}` |
| Classification | `POST /documents/{document_id}/classification` |
| Grant | `POST /documents/{document_id}/read-grants` |
| Revoke one grant | `DELETE /documents/{document_id}/read-grants/{user_id}` |

DGM-FLOW-03: [Mermaid](../../sdlc/diagrams/flowchart/docs-flow.mmd) · [Draw.io](../../sdlc/diagrams/flowchart/docs-flow.drawio). Shared checks: [permission flow](../../sdlc/diagrams/flowchart/permission-read-flow.mmd).

**Assumptions/open decisions:** Initial access/lifecycle direction is confirmed by ADR-0007/0009/0011. Additional capability delegation, physical retention and fenced orphan cleanup remain open. ADR-0013 resolves unavailable identity entitlement. This flow cannot resolve those policies implicitly; no polling endpoint is invented.

**Checklist/handoff:** Pass for documented immediate revision, explicit author grant, separate readiness/denial branches and matching diagram structure; Gap for rendered/usability and runtime/concurrency tests. v0.5 and DGM-FLOW-03 v0.8 clarify independent action entry and separate semantic readiness.

## Priority 2 read bindings

Explorer uses listDocuments (not an empty keyword query); explicit history uses listVersions, with exact getVersion on selection. Retained readable documents with no Current remain discoverable, and indexing pending/failed does not hide the source. Preserve explicit history labels. Each page is permission-filtered; stale cursor means discard accumulated pages/restart, denied means clear rows, dependency failure means an error rather than an empty list.

Known-ID manage access uses getAllowedActions(document), getDocumentPolicy and listDocumentReadGrants; use listMembers for current grantees. Show only policy classification and grantee IDs without content-read, no title/owner/version/readiness prefill. policy.permission_revision supplies classification/grant/revoke concurrency. Reload and reconsider after conflict. Returned action names guide controls but never grant authority. Non-reading write/lifecycle preconditions have a Proposed design in ADR-0022 using action-bound opaque tokens and minimal command receipts (see NEXT-06 below); implementation and verification remain open. See Proposed ADR-0019 for policy/grant reads; additional delegation UI remains excluded.

## NEXT-06 independent known-ID command interaction

Use getAllowedActions for controls, then getDocumentCommandPrecondition for the chosen implemented command. Non-reading authors enter replacement text or explicit metadata changes without prefill; non-reading lifecycle managers supply an already-known exact archive version or document for deletion. No current content/revision/history/lifecycle metadata is loaded. Submit the opaque token; numeric revisions already known to readable users remain supported. Confirmation is DocumentMutationReceipt (or deletion 204). Show only the committed command and created/supplied identity; no protected content is returned or cached through the mutation.

If still permitted to read, fetch document/version/history/readiness separately and label any fresh state. After 409 obtain a fresh token and require a fresh decision; never silently resubmit. A lost mutation response uses the original key/payload until reconciled, not a new token/key write. Proposed ADR-0022 resolves the design precondition gap; token storage/transactions/permission tests remain open.

**v0.8 correction — 23 October 2026:** Reconciled the Priority 2 precondition status with NEXT-06 and Proposed ADR-0022. Existing FR-04/11/13/48/59/65 and SC-05/06 remain unchanged; no implementation or verification acceptance is claimed.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.
