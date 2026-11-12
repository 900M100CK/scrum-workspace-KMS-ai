# Create restricted knowledge and manage its access

**Artifact ID:** SP-06  
**Version/date:** 0.6.4 Draft · 7 November 2026
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.10.3; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-06--create-restricted-knowledge-and-manage-its-access); [contract pack](../contracts/README.md); PLAN-01 v0.4.\; Proposed ADR-0022; Proposed ADR-0032 v0.1; Proposed ADR-0033 v0.1
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

Touch only the recorded slice paths: services/knowledge/**, apps/web/** and tests/** remain the original document-slice allowance. The former services/workspace/policy/** placeholder is not an application directory. For selected B01 only, additionally allow services/workspace/src/policy/document-authority.ts; the minimal document-create allowlist/provenance integration in services/workspace/src/projects/operator.ts and cli.ts; services/workspace/migrations/014-document-create-authority.up.sql and .down.sql; services/workspace/DOCUMENTS.md; tests/workspace/document-authority*.test.mjs and document-authority-fixture.mjs, reusing existing fixture helpers without changing their historical schema ceilings. For selected B03 only, additionally allow services/workspace/src/policy/guard.ts; services/workspace/src/transport/service-auth.ts; and tests/workspace/transport-guard.test.mjs. Future command wiring may change only directly needed package.json scripts when the actual runner exists. These are future P03-A/P04/P05 implementation paths, not runtime changes made by P02-A or P02-B. Workspace gateway/app/session/guard wiring and additional document schema/HTTP/Knowledge paths need later recorded decision-specific amendments before editing. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

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

## Selected B01 private provisioning — 7 November 2026

The [owner receipt](../docs/implementation/features/sp-06-document-access/evidence/p01a-20261107/owner-selection.json) selects private explicit per-member document-create provisioning. Represent it as project-scoped knowledge-author, checked with enabled current membership and exact private issuance provenance, never descriptive roles or inferred document-read. Reuse existing private operator CAS/audit; no public operation or delegation UI. Grant/revoke audit failure rolls back the owning transaction; no silent unprovenanced grant adoption. Removal invalidates the grant and rejoin restores none. Initial document grants remain ADR-0007 creation-time defaults. [Proposed ADR-0032](../docs/adr/0032-private-document-create-authority.md) specifies the bounded014/private predicate design; P03-A/P04 require real persisted/runtime-role evidence. This is B01 source alignment, not an implemented handler or acceptance of B02/B03. FR-62/65 remain unselected in FEAT-SP06-01.

## Selected B03 guarded transport boundary — 9 November 2026

The [owner receipt](../docs/implementation/features/sp-06-document-access/evidence/p01b-20261109/owner-receipt.json) selects fixed Workspace gateway, Workspace-only authority, trusted TLS, rotated server-side X-Service-Key compared constant-time, forwarded X-Actor-Session, project-scoped reader-writer guard with writer preference, active socket destruction with bounded close deadline, startup fencing generation, deny-on-ambiguous restart, and no automatic failover. Delivery uses shared access; membership removal, revocation and authority changes use exclusive access. Revocation sets a revoked flag, actively destroys affected sockets and waits for confirmed closure; deadline expiry is unknown. New delivery re-checks the revoked flag before acquiring shared delivery. [Proposed ADR-0033](../docs/adr/0033-guarded-transport-boundary.md) specifies the bounded transport and guard design; P05 requires real concurrency and timeout test evidence under disposable environments. This is B03 source alignment, not an implemented handler or acceptance of B02.
