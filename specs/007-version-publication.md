# Revise and retire a knowledge version

**Artifact ID:** SP-07  
**Version/date:** 0.6.3 Draft · 4 November 2026
**Status:** Owner-confirmed lifecycle direction; handlers and full acceptance unimplemented.\
**Inputs:** PRD-01 v0.10.3; ADR-0009/0011; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-07--revise-and-retire-a-knowledge-version); [contract pack](../contracts/README.md); PLAN-01.; Proposed ADR-0022
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 2.  
**Dependencies:** SP-06.   
**Trace:** FR-11, FR-12, FR-13, FR-15, FR-19, FR-47, FR-48, FR-61; BR-05, BR-14, BR-07, BR-12; SC-05, SC-06. FR-45 is Withdrawn; its replacement/immutable-history assertions are now AC-11. The filename is retained for link continuity, not a publication feature.

## Goal and contract

Keep immutable evidence, make authorised revisions Current immediately, and distinguish labelled historical sources.

Use knowledge service contract in contracts/openapi/. Operation IDs: reviseDocument, archiveVersion, deleteDocument, getVersion, getReadiness. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation. Immediate revision is a guarded lifecycle mutation; a remote timeout with unknown outcome blocks affected protected handoffs pending reconciliation (ADR-0011).

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. Authorised revision atomically creates new Current, supersedes previous Current and updates the document pointer; a stale request or failed transaction cannot partially replace evidence.
2. Revise twice and open the first exact citation: its immutable passage is unchanged and labelled Superseded. Ordinary retrieval returns only the newest eligible Current. No separate publish operation or product Draft is accepted.
3. Archive/deletion and duplicate/out-of-order jobs cannot revive obsolete content; old citation never substitutes a version.

## Allowed paths and Done

Touch only: services/knowledge/**, apps/web/**, tests/knowledge/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses owner-confirmed ADR-0007–ADR-0011 and remaining OD-04/OD-09/OD-12 details. Migration 002 storage tests pass, but do not implement handlers or prove transport permission enforcement. Pass for lifecycle/trace/input-output/paths; Gap for full contract integration, retention/identity entitlement and runtime tests. Handoff: implement the reconciled slice; do not mark it Done from SQL tests.

## Owner clarification - 14 October 2026

ADR-0013 binds this slice: surviving unavailable citation identity requires current membership and retained document-read policy, with exact locator verification and no content substitution; revoked/audit-only/unknown readers get generic 404. Terminal answer withholding uses fixed HTTP 503 AnswerWithheld without evidence or detailed cause. These are required runtime assertions, not passes from schema checks.

**17 October input reconciliation:** FR-11/12/13/15/19/47/48/61 and ADR-0009/0013: immediate Current revisions and exact unavailable citation entitlement are retained. Reviewed against the current requirement rows and operation ownership. This is specification review, not implementation or full AC coverage evidence.

## Priority 2 explicit history — 18 October 2026

Additional operations: Knowledge listVersions and Workspace getAllowedActions; this slice now consumes both contract owners. History pages provide exact version IDs, Current/Superseded/Archived labels, current_version_id and document_revision for aggregate concurrency. They contain no content. listVersions requires current document-read; content-write/lifecycle/manage-access alone cannot list history. Open the selected exact getVersion locator with renewed authority and no Current substitution. See Proposed ADR-0019.

Acceptance additions: fresh-client revision/history traversal, archived-only document with null Current, same-time version tie ordering, concurrent revision/archive/deletion invalidating cursors, grant revocation between pages and unavailable authority. Retention policy is not expanded. Proposed ADR-0022 supplies an independent opaque command precondition; action discovery itself remains advisory and grants no revision bypass.

## P2-R01 exact action locator

Call getAllowedActions with resource_kind=version, project_id, document_id and version_id from the same selected listVersions row. Omit resource_id. Check that the response echoes the same pair and project, with resource_id=null, before using its advisory actions. Invalid combinations return 400; unknown/mismatched exact project/document/version pairs return generic 404. Future handler acceptance must seed documents A and B with the same version_id and different read/action grants: A's response cannot authorize B; non-reading scoped lifecycle/write authority remains independent of content-read. Include wrong-parent, wrong-project, unknown version and revoke-before-action cases. These are unrun runtime assertions, not evidence supplied by the shape validator.

## NEXT-06 non-reading revision/lifecycle commands

Additional Knowledge getDocumentCommandPrecondition requires the selected current action (reviseDocument/archiveVersion/deleteDocument) and known project/document, plus exact already-known version for archive. It returns only opaque token and selector echoes. Bodies/headers accept one token or already-known numeric revision. Revise/archive return DocumentMutationReceipt; delete remains 204. Only the newly created or supplied version identity is acknowledged, with no content/title/lifecycle/current pointer/numeric revision. Readers fetch protected display data separately after renewed read checks. No history-list bypass for non-readers.

Test revoked read with retained write/lifecycle, rejected read/manage-only caller, cross-actor/session/action/parent/version tokens, concurrent revision/revocation, rollback of state/audit/token, safe same-key receipt replay and unknown-outcome reconciliation. A fresh token is no proof of rollback. Proposed ADR-0022 supplies this design; physical token storage/guard/handler behavior remains unimplemented.
