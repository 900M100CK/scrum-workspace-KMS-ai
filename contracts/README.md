# Contract-first interface pack

**Artifact ID:** CONTRACT-01  
**Version/date:** 0.18 Draft · 18 October 2026
**Status:** Draft for owner review; ADR-0007–ADR-0011 direction is owner-confirmed; remaining protocol/policy gaps and handler evidence are pending.\
**Inputs:** PRD-01 v0.9; [architecture](../docs/architecture.md); [data design](../docs/sdlc/data-design.md); PLAN-01 v0.3.\; Proposed ADR-0020; Proposed ADR-0021; Proposed ADR-0022; Proposed ADR-0023
**Author:** development agent acting sequentially; owner reviews business choices.

## Status and ownership

These are draft HTTP/JSON contracts for review before application code. The owner explicitly requested contracts; API-profile acceptance remains pending the named protocol/policy decisions. Workspace owns workspace.openapi.json; Knowledge owns knowledge.openapi.json. Their public facades are served by the Workspace gateway; Knowledge's actual internal transport additionally requires service credential and validated actor session. Internal paths must never be exposed by a generic public proxy.

[Workspace OpenAPI](openapi/workspace.openapi.json), [Knowledge OpenAPI](openapi/knowledge.openapi.json), [change event schema](events/domain-change.schema.json) and [logical DB model](data-model.json) are the sources for each feature spec. OpenAPI 3.1.1 and JSON Schema 2020-12 shape conventions follow [official OpenAPI](https://spec.openapis.org/oas/v3.1.1.html) and [JSON Schema](https://json-schema.org/draft/2020-12/json-schema-validation) documentation. No schema validation establishes permission, factual support or source authority.

## Required semantics beyond shape

- Identity is server-derived. Project IDs/doc IDs are selectors, not access claims. Membership role field is project-scoped and cannot promote an account to global Workspace Admin.
- Inaccessible/unknown resource reads share the same NotFound body and HTTP 404. Known readable resource/action denial may be 403; never use that distinction to reveal a hidden target. Generic permission infrastructure failure denies output.
- Mutations use scoped idempotency keys and expected revision, including X-Expected-Revision for deletion/removal. Replay rechecks current access; mismatch does not overwrite or revive a grant.
- Keyword/semantic retrieval filter current project AND document scope. No product Draft state exists; revisions become Current atomically. Semantic retrieval can return restricted documents when explicitly permitted.
- Internal generation returns the **full evidence set**, not only cited sources, to the gateway. Guarded delivery validates all of it; any revoked source withholds the original draft. Evidence excerpts are transient provider input and must not be logged as a store copy.
- Workspace allocates ID and commits policy/initial grants, then calls persistDocument in Knowledge; no activation step. 202 describes an uncertain creation outcome requiring same-key reconciliation, never content/search readiness. An ACL without content remains unreadable.
- Events carry IDs/revisions, no content/grants. Authenticate producer and handle duplicates/out-of-order state; events are invalidation hints, never the permission authority. No broker is required; transport is an implementation choice.
- Question result states answered/partially_answered/insufficient_evidence/conflict are separate from dependency failures. Error response names failure category and has no generated answer. No model endpoint or provider config is a caller-controlled URL.
- OWNER-Q-01 / ADR-0008: returned unfinished work and Completed-Sprint reopening become To Do atomically with allocation, task revision and minimum audit; preserve completed history. ADR-0012: complete immutable manifests and one-use Workspace relay claims are durable before guard acquisition; guarded evidence/revision/payload matching precedes any bytes. A mismatch aborts and releases the guard before a bounded fresh preparation. An unknown transport outcome never authorises automatic resend.

Context checks validate references, operation/spec trace and expected non-disclosure schemas. Real consumer/provider tests must later exercise session expiry, current access, revocation, stale state and provider failures on real handlers. No generated API or runtime feature has been implemented.

Checklist: Pass for draft owner/shape/error/trace baseline; Gap for accepted auth/protocol policies, full OpenAPI meta-schema validation and real consumer/provider tests. Handoff: Needs owner decision; do not call this accepted wire compatibility.

**v0.2 change:** See [contract changelog](CHANGELOG.md). Internal persistence carries a Workspace-allocated path ID and authenticated actor/service context; public creation accepts no caller-selected identity. Initial author grants remain revocable.

**v0.4 change:** OWNER-Q-01 directions appear in Workspace OpenAPI v0.2.2 / Knowledge v0.2.3 operation descriptions. Logical model v0.3 specifies immutable HandoffManifest/HandoffOutcome and operational entity_kind; physical manifest storage and handlers are not implemented.

## Operational reconstruction correction — 18 October 2026

Workspace v0.2.3 supplies operational read projections under Proposed ADR-0018; Knowledge remains v0.2.3. The pack now has 58 operations. Scope and business permissions are unchanged. Snapshot/cursor and reconstruction acceptance remain unimplemented. See [ADR-0018](../docs/adr/0018-operational-read-projections.md). No application acceptance is claimed.

## SYS-02 follow-up — 18 October 2026

Workspace v0.2.4 and logical model v0.4 define dedicated persisted location/Backlog generation and full-list reorder; Knowledge remains v0.2.3, 58 total operations. Reorder uses a decimal-string expected_revision obtained from TaskList.backlog_revision, never from task/project metadata or a cursor. This draft contract change has no deployed consumer. See Proposed ADR-0018 and DATA-04; runtime API acceptance remains open.

## Priority 2 read projections

Workspace v0.2.5 / Knowledge v0.2.4 contain six additional public reads (64 operations total), under [Proposed ADR-0019](../docs/adr/0019-scoped-ui-discovery.md). Lists support minimal members, readable documents, exact version history and scoped explicit grants; policy reads provide mutation concurrency. getAllowedActions returns existing operation names for the authenticated actor's exact scope, never delegable authority. All protected reads recheck current authority. No application implementation or new capability provisioning is implied.

## Priority 2 recheck correction

Workspace v0.2.6 binds version action discovery to project_id + document_id + version_id; resource_id is omitted for version requests and null in their responses. Knowledge v0.2.5 clarifies independent FR-27 answer-reader summary and FR-58 scoped trace entitlements. Both remain existing operations (64 total); FR-27 remains Should. The context validator derives public operation membership from both supplied contracts and rejects internal/unknown action names, while permitting an intentionally narrower catalogue. No runtime access or migration evidence is implied.

## SYS-01 manifest-bound transport

Workspace v0.2.7 / Knowledge v0.2.6 add a shared complete StoredHandoff binding for provider requests and buffered answers, plus authenticated internal getHandoffManifest (65 operations total). The public UI-action catalogue excludes this lookup. Proposed ADR-0020 defines exact byte digests, full document/operational evidence, purpose/destination binding and the local one-use claim. Logical model v0.5 is not additive storage or relay implementation; SYS-01 runtime gate remains open.

## NEXT-03 inspection projection

Knowledge v0.2.7 replaces bare inspection source IDs with exact per-step ranked document/operational locators, actual query and step records, typed citation checks and exclusive measured/unavailable/not_performed timing/usage. Trace remains scoped trace-read; bounded summary remains FR-27 Should for permitted answer readers. Proposed ADR-0021 defines source/query disclosure and rank semantics. Workspace stays v0.2.7; 65 operations are unchanged. Logical model v0.6 is design only; no capture or permission handler exists.

## NEXT-04 semantic readiness and citation consumers

Knowledge v0.2.8 replaces ambiguous Readiness.readiness with semantic_readiness and clarifies independent keyword availability. Document and operational citation consumers follow their distinct existing locator shapes. Deliberate new questions recheck scope; lost outcomes never trigger automatic handoff replay. Workspace remains v0.2.7 and operation count stays 65; application verification is pending.

## NEXT-06 independent document commands

Workspace v0.2.8 / Knowledge v0.2.9 add action-scoped getDocumentCommandPrecondition (66 operations). Opaque tokens bind the private current revision without exposing it to a non-reader. Revise/archive/optional metadata edit return minimal DocumentMutationReceipt, never Version/Document content; delete stays 204. Numeric known revisions remain an alternative. Proposed ADR-0022 / logical model v0.7 define token binding/consumption, receipt replay and unresolved-outcome constraints; handlers/storage are unimplemented.

## Executable schema examples — 18 October 2026

After `npm ci`, `npm run contracts:test` uses pinned development-only Ajv 8.20.0 and ajv-formats 3.0.1 to compile every named component under JSON Schema 2020-12 and evaluate synthetic positive/negative examples. It does not alter the dependency-free `context:*` commands or select an application framework. Coercion, defaults and property removal are disabled. OpenAPI annotation keywords are tolerated (`strict: false`); this is component constraint evaluation, not full OpenAPI meta-schema validation. Formats such as date-time are checked. The tests cover missing metrics, exact inspection locators, version action scope, command precondition exclusivity/minimal receipts, mixed handoff evidence/purpose and work-location/revision shapes. Cross-field bytes/digest equality, complete evidence capture, exact reorder membership, current authority, persistence and runtime behavior require real handlers/adapters.

## Supplemental document structure check

The contract test command now also checks both whole OpenAPI documents against a pinned official 3.1.x document-structure snapshot, using a calibrated local specialization for Ajv dynamic references. Named and inline HTTP Schema Objects are separately meta-validated and compiled under JSON Schema 2020-12. The [fixture provenance and limits](../tests/fixtures/openapi31/README.md) identify the source, hash, license and adapter. Document-level format assertions and external dialect overrides are not certified. This does not claim full OpenAPI semantic conformance or close any runtime gate.

## Bounded routing and authentication declaration checks

The dependency-free context harness now checks effective inherited/overridden path parameters, local parameter references, duplicate/extra/missing selectors, equivalent templated paths, every OpenAPI HTTP method and declared security-scheme names. Project authentication checks require session context on every protected public alternative and service plus actor context on every internal alternative; signIn at POST /session remains explicitly unauthenticated. This closes a verifier gap that previously accepted an additional empty authentication alternative. It does not change the draft API authentication model, choose session mechanics or prove runtime enforcement. Routing rules follow the [OpenAPI 3.1.1 Path/Operation/Parameter definitions](https://spec.openapis.org/oas/v3.1.1.html#path-templating); full semantic conformance remains unclaimed.

## Byte-binding protocol reference

The contract test command also executes [HANDOFF-REF-01](../docs/sdlc/references/handoff-byte-reference-2026-10-18.md): exact frozen bytes, strict record decoding, full mixed evidence and answer citation mappings are tested with synthetic independent inputs. This is an executable reference, not a handler, real provider adapter, durable receipt lookup or permission/send authority. Provider bytes remain opaque and explicitly require later wire mapping. No application request limit or public numeric representation is selected.

## Additive handoff storage evidence

Logical model v0.8 and Proposed ADR-0023 now map exact Knowledge preparation/outcomes and Workspace permanent idempotency claims/outcomes to additive SQL. This changes no HTTP operation or provider/session choice. Isolated SQL results do not replace getHandoffManifest/guard/relay/current-authority handlers or adapter acceptance. Migration/runbook cautions remain binding.

## Optional stored-receipt integration

After npm ci, Node 24+ and Docker, npm run contracts:storage:test verifies the parameterized Knowledge preparation query and exact StoredHandoff projection against the byte reference. Base64 line wrapping is removed without changing decoded bytes; JSONB is not reserialized as the original manifest. This command is separate from dependency-free db/context checks and Docker-free contracts:test. Seven SQL-to-reference results passed; authenticated HTTP scope/guard/provider behavior remains unimplemented.
