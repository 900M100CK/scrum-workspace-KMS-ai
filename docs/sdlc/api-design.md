# API design — contract entry

**Artifact ID:** API-05  
**Version/date:** 0.17 Draft · 25 October 2026
**Status:** ADR-0007–ADR-0013 directions are owner-confirmed; transport implementation and independent review remain pending.
**Inputs:** PRD-01 v0.9; UC-02 v0.8; SAD-03 v0.16; DATA-04 v0.12; [contract pack](../../contracts/README.md) v0.19; ADR-0007–ADR-0017; Proposed ADR-0018.\; Proposed ADR-0019; Proposed ADR-0020; Proposed ADR-0021; Proposed ADR-0022
**Author:** development agent acting sequentially; owner reviews business choices.

The canonical payload/routes are the two OpenAPI files linked by the contract pack. Public consumers are the web UI; internal consumers are Workspace/Knowledge. Every operation has x-requirements, authenticated scope, resource parameters, explicit responses and mutation concurrency semantics. Context validation checks shape/trace only.

SAD defines one public Workspace gateway; it routes accepted Knowledge facade operations and never generic-proxies /internal/**. Internal service requests use credentials plus an authoritative session reference, not client/model user IDs. Document policy and operational state remain Workspace-owned. Token/cookie/CSRF and timeout implementation require approved policy and tested framework versions.

Read current records by stable identity; keyword/semantic queries use cursor/scope; citations pin version/passage. 404 body equivalence, whole-evidence-set revocation, Workspace-first registration, no activation, and idempotency replay rules are mandatory test cases. OpenAPI format alone proves none of these behaviors.

Under [ADR-0012](../adr/0012-audit-visibility-and-durable-evidence.md), a mutation success response requires the business state and minimum audit event or durable pending audit record to commit in the same owning-service transaction. A failure to persist that record rolls back the mutation. Failure of later audit sink delivery does not change the committed result; delivery is retried idempotently. A transport timeout is an unknown outcome to reconcile using the same operation identity, not proof of rollback or permission to repeat the mutation with a new key.

Before protected provider input or answer delivery, the owning AI operation must persist its run ID and a complete immutable per-handoff manifest outside the guard. After durable acknowledgement, acquire the guard and match full evidence, recorded revisions and frozen payload. Mismatch aborts without bytes; release the guard before a bounded new manifest/attempt. No remote manifest write occurs under the guard. Persistence failure withholds that handoff and returns an explicit failure, without generated content, source details or invented evidence. Optional metric loss is labelled incomplete and does not substitute for mandatory provenance. These rules require producing-handler and persistence-failure tests; OpenAPI schema checks cannot prove them. Knowledge OpenAPI v0.2.3 and ADR-0013 specify HTTP 503 AnswerWithheld and the authorised exact UnavailableCitation result. These mappings remain untested at a live handler.

Checklist: Pass for recorded consumers, ownership, interfaces and requirement trace; Gap for live consumer/provider tests and retained-policy/tombstone implementation. Handoff: Ready for downstream drafting with these explicit gaps; unresolved business choices must be clarified before dependent implementation.

**v0.2 change:** API v0.2.0 removes publish/activate and product Draft. Workspace owns allocation and initial grants; persistDocument is internal authenticated transport. Protected response guards include citations and source reads; internal evaluateAccess/observeWorkState do not reacquire the guard. Remaining unavailable-citation/terminal-withholding response details and real handler tests stay open.

**v0.3 change:** Correct source versions and owner-decision status; carry ADR-0012 atomic audit and pre-handoff provenance requirements into the API handoff. OpenAPI remains v0.2.0; no handler or new response schema is claimed.

**v0.4 change:** ADR-0013 resolves unavailable identity entitlement and nondisclosing terminal withholding, including an invalid-citation draft without a validated replacement. Knowledge OpenAPI v0.2.1 adds UnavailableCitation and AnswerWithheld; Workspace remains v0.2.0. Retained-policy identity inspection, tombstone persistence and runtime checks remain implementation gaps.

**ADR-0015 amendment:** Knowledge OpenAPI v0.2.2 adds partially_answered for supported cited components and explicit missing request components. It does not permit truncating a revoked/invalid original draft. Consumer/UI and runtime evidence remain pending.

**ADR-0016 amendment:** Workspace OpenAPI v0.2.1 adds optional searchTasks under FR-70 Should, after 60 Must. TaskList is operational output, not document passage evidence. Knowledge remains v0.2.2; 56 operations total.

## Operational reconstruction correction — 18 October 2026

Workspace OpenAPI v0.2.3 adds listSprintItems/listBlockerEvents, task work_location, explicit Backlog ordering and SprintCompletion counts under Proposed ADR-0018. Knowledge remains v0.2.3. Total: 58 operations. SYS-02 contract gaps are addressed in draft; real handlers, cursor integrity/current authority, transaction and fresh-client reconstruction remain untested. See [ADR-0018](../adr/0018-operational-read-projections.md). No application acceptance is claimed.

## SYS-02 preconditions — 18 October 2026

Workspace v0.2.4 maps Reorder.expected_revision to TaskList.backlog_revision (positive decimal string); it is not Project.revision, Task.revision or a cursor. Use all pages of location=backlog, require a complete permutation, reject stale/missing/foreign IDs without writes and use the original idempotent receipt on replay. ReorderResult carries project_id and the committed backlog_revision only; reload for current work. Two new reads from v0.2.3 remain; total operation count stays 58. DATA-04 and Proposed ADR-0018 define persistence and mutation invalidation. Knowledge remains v0.2.3.

## Priority 2 discovery — 18 October 2026

Workspace v0.2.5 adds listMembers, getDocumentPolicy, listDocumentReadGrants and getAllowedActions. Knowledge v0.2.4 adds listDocuments/listVersions: 64 operations total. [Proposed ADR-0019](../adr/0019-scoped-ui-discovery.md) defines access predicates, stable paging, exact action scope, policy/member/document revision sources and response minimisation. Browser calls use the existing gateway; internal evaluateAccess remains private. No additional delegation policy, migration or handler is introduced. Read-only management metadata is distinct from document-content access. Non-reading write/lifecycle concurrency and handler integration remain explicit gaps.

Checklist: applicable API workbook pagination, authorization, errors and versioning rows reviewed; structural validation is not full meta-schema validation or permission evidence. Handoff: SP-02/06/07 and Stage 6 may use these proposed projections; Stage 8 must exercise denial/revocation/pagination on actual handlers.

## Priority 2 recheck correction — 18 October 2026

Workspace v0.2.6 adds explicit document_id/version_id query selectors and response binding for version scope; version requests forbid resource_id, other scopes forbid those two locator fields. Unknown/mismatched parent/project locators use generic 404; malformed selector combinations use 400. Run discovery separately evaluates FR-27 permitted-answer-reader and FR-58 scoped trace-read, returning only independently allowed operations. Knowledge v0.2.5 aligns both inspection descriptions without promoting optional FR-27. Proposed ADR-0019 v0.2 gives paired consumer examples. Harness validation now requires both current contracts and checks catalogue membership against their public paths, excluding internal/service-only operations; handler scope authorization remains unverified.

## SYS-01 exact transport binding — 18 October 2026

Workspace v0.2.7 ProviderInput carries a purpose-specific StoredHandoff, typed semantic ProviderPayload and frozen final provider bytes; the provider-specific adapter must validate the complete mapping before any send. Knowledge v0.2.6 InternalQuestionResult carries result, AnswerHandoff and frozen result bytes, replacing bare operational IDs/single source_revision. Shared mixed evidence binds each document and operational identity/revision/time/digest. Internal authenticated getHandoffManifest verifies durable preparation outside guard; Workspace claims handoff_id once before current guarded validation. Total operations: 65. Proposed ADR-0020 specifies byte/receipt/claim failures and unknown outcomes; it changes no public answer body or accepted policy. Storage/adapters/provider-wire validation and live TC-26 remain prerequisites.

## NEXT-03 / SYS-03 and SYS-04 — 18 October 2026

Knowledge v0.2.7 getTrace/getRetrievalSummary expose actual safely disclosable query, recorded steps, typed ranked_sources and typed validation outcomes. Exact document tuples and operational entity/revision/observation-time bind through source_id and step_id, with dense visible ranks preserving recorded order. DurationMetric/TokenUsageMetric distinguish measured zero, unavailable and not_performed; numeric-only duration_ms is removed. No additional endpoint is introduced (65 operations). Query/evidence capture is mandatory; metric loss cannot excuse it. Authority/dependency failure returns 503, while source-specific protected fields are filtered under current scope. Proposed ADR-0021 governs these draft projections; capture/storage/permission/live metric tests remain unimplemented.

## NEXT-04 read semantics — 18 October 2026

Knowledge v0.2.8 Readiness names semantic_readiness explicitly; getReadiness describes exact-version scope and independence from keyword/Current validity. AI question description distinguishes deliberate new requests from replay after unknown outcomes. Operational citation inspection uses existing Workspace entity reads, preserving cited observation labels and separate current revisions; no document locator or historical-snapshot operation is added. Workspace remains v0.2.7, 65 operations total. No handler or permission evidence is implied.

## NEXT-06 opaque concurrency and minimal acknowledgement

Knowledge v0.2.9 getDocumentCommandPrecondition requires current membership and the exact existing requested command capability, independently of read, and returns only selector echoes plus a private-revision-bound opaque token. Revise/EditMetadata accept exactly one expected_revision/precondition_token; archive uses DocumentCommandConcurrency; delete accepts exactly one X-Expected-Revision/X-Document-Precondition. Success returns minimal operation-authorised receipts (delete 204), not content-bearing objects. Same-key receipt replay after renewed authority precedes consumed-token checks. Conflict reveals no current revision/state; unknown outcome remains the original operation to reconcile. Workspace v0.2.8 lists the new public operation only where command authority applies. 66 operations total; Proposed ADR-0022, additive token storage and all live tests remain pending.

## NEXT-10 declaration guard correction

API-V10-01 identified a harness gap, not a demonstrated live API exposure. In-memory changes adding an empty internal authentication alternative, removing public authentication, adding a non-template path selector or duplicating a selector were all accepted before correction. verify-api-routing now checks every effective authentication alternative and parameter binding, allows legitimate path-level references/operation overrides, rejects equivalent templated paths and includes all OpenAPI HTTP methods. Full validateApi regressions exercise the actual contracts. Existing Workspace v0.2.8 / Knowledge v0.2.9 declarations and business policy are unchanged; no application router/permission evidence is supplied.

## NEXT-13 stored preparation projection

The Knowledge query get-handoff-manifest.sql now projects the existing StoredHandoff DTO from exact committed bytes using seven bound trusted-context selectors. HANDOFF-SQL-01 records canonical-base64 and SQL/reference integration evidence. It adds no endpoint/query parameter to the draft HTTP contract and implements no service authentication, current permission authority or getHandoffManifest handler. Callers must derive context independently, deny unknown authority and repeat final guarded checks. A readable preparation or binding-only result does not enable a consumed claim to send again.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.
