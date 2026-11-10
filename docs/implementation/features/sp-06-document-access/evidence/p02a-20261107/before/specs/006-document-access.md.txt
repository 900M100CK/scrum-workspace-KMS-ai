# Create restricted knowledge and manage its access

**Artifact ID:** SP-06  
**Version/date:** 0.6.3 Draft · 4 November 2026
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.10.3; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-06--create-restricted-knowledge-and-manage-its-access); [contract pack](../contracts/README.md); PLAN-01 v0.4.\; Proposed ADR-0022
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 2.  
**Dependencies:** SP-02, SP-11. SP-11 is the capture interface, not SP-13 inspection UI.  
**Trace:** FR-04, FR-10, FR-14, FR-50, FR-51, FR-52, FR-62, FR-65; BR-01, BR-10, BR-04, BR-14; SC-06.

## Goal and contract

Store an owned English text/Markdown source with explicit, independently enforced document access.

Use both service contracts in contracts/openapi/: Workspace owns policy registration, classification and grants; Knowledge owns document creation/persistence/reads/import/metadata. Operation IDs: registerDocumentPolicy, persistDocument, createDocument, getDocument, setClassification, grantDocumentRead, revokeDocumentRead, importDocument, editDocumentMetadata. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. Omitting classification rejects creation. Workspace allocates identity and commits policy/initial scoped capabilities plus a revocable restricted-author read grant before Knowledge creates initial Current. Same-key replay creates no duplicate identity/version/grant. No activation step; orphan policy reveals no content.
2. Grant, search/read, revoke and repeat reads end-to-end; Admin status alone grants no source read.
3. Access-authority failure denies protected content; unsupported import is rejected.

Owner-confirmed optional release rows (ADR-0010): FR-62 Should, FR-65 Could. ADR-0010 records the exact Core-gate exceptions; all other release Must ACs remain required.

## Allowed paths and Done

Touch only: services/knowledge/**, services/workspace/policy/**, apps/web/**, tests/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses the applicable owner-confirmed directions through ADR-0017 and OWNER-Q-01. Additional delegation, physical retention, OD-09 identity and OD-12 framework details stay open. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: proceed under confirmed directions; resolve only remaining decisions relevant to implementation. No settled policy requires repeat approval.

**17 October input reconciliation:** FR-04/10/14/50/51/52/62/65: Workspace owns policy and grants; Knowledge owns content; creator read remains revocable. Reviewed against the current requirement rows and operation ownership. This is specification review, not implementation or full AC coverage evidence.

## Priority 2 explorer and access-management reads — 18 October 2026

Additional operations: Knowledge listDocuments; Workspace getDocumentPolicy, listDocumentReadGrants, listMembers and getAllowedActions. Explorer includes only currently readable nondeleted metadata, including documents with null Current or failed/pending indexing. Scope/classification filters never bypass grants. A known-ID manage route can read minimal policy and explicit current grantees without content-read; no title/content/owner/version/readiness is disclosed there. Classification/grant/revoke preconditions come from policy.permission_revision, including the same revision on each grant page. See Proposed ADR-0019.

Acceptance additions: revoked author read with retained manage-access must produce no explorer/content entry yet permit policy/grant administration; ordinary reader without manage-access cannot inspect policy/grantee lists. Traverse multiple pages, change classification/grants/membership between pages, reject stale cursors/preconditions and test authority/Knowledge outage without partial output. Different endpoints are not a shared snapshot. UI reloads on conflict and clears denied data. Known-ID add-member interaction does not add account discovery. Handlers and permission tests remain unimplemented.

## NEXT-06 non-reading metadata command

Additional Knowledge operation getDocumentCommandPrecondition supplies an opaque token for an existing exact command capability, without current revision/content/metadata disclosure. Optional editDocumentMetadata stays FR-65 Could; an implemented author can submit explicit new labels/owner with exactly one known expected_revision or precondition_token and receive DocumentMutationReceipt with null version_id. No prefill/list/read grant is added. Test read revocation with retained action, manage-only/read-only denial, wrong command/session/project and minimal same-key receipt replay. See Proposed ADR-0022; no handler/token-storage tests have run.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.
