# Contract-first interface pack

**Artifact ID:** CONTRACT-01  
**Version/date:** 0.25.5 Draft · 6 November 2026
**Status:** Draft for owner review; ADR-0007–ADR-0011 direction is owner-confirmed; remaining protocol/policy gaps and handler evidence are pending.\
**Inputs:** Proposed ADR-0027 v0.2; PRD-01 v0.10.3; [architecture](../docs/architecture.md); [data design](../docs/sdlc/data-design.md); PLAN-01 v0.4.\; Proposed ADR-0020; Proposed ADR-0021; Proposed ADR-0022; Proposed ADR-0023; Proposed ADR-0028 v0.1; Proposed ADR-0031 v0.1
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

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.

## P09 bounded session transport — 28 October 2026

Workspace v0.2.9 synchronizes the selected __Host-sacw-session cookie name and declares POST /session Error responses for 413 (8192-byte JSON bound) and 415 (unsupported media). POST uses exact configured HTTPS Origin/custom header; POST/GET use no-store and exact Session/Error objects. Actual P09 handlers and owned PostgreSQL tests exist; DELETE/renewal/UI and D-07 acceptance remain later work. No operation count, FR, project/document scope or Knowledge wire behavior changes. See [P09 result](../docs/sdlc/reports/SP-01-P09-http-2026-10-28.md).

## P10 session lifecycle — 28 October 2026

Workspace v0.2.10 describes authenticated GET renewal/cookie refresh and idempotent empty DELETE 204 with Origin/header protection, no body and mandatory audit before cookie clearing. DELETE explicitly declares bounded 413/415 transport errors. Strict idle/absolute comparisons and no revival/regression are implemented in P10; unknown commit is 503 without a success cookie. No new operation, FR, Knowledge behavior or D-07 claim. See [P10 result](../docs/sdlc/reports/SP-01-P10-lifecycle-2026-10-28.md).

## SP-02 bounded implementation — 1 November 2026

Workspace OpenAPI v0.2.11 declares listProjects 400/409 cursor outcomes, strict getProject query validation and project-mutation 413/415 bounds. No operation or Project/Member schema was added. The live UI uses same-origin Workspace only; allowed actions are advisory. Actual project/member handlers, permanent compact replay and scoped HMAC paging have disposable PostgreSQL/HTTP evidence in [SP02 execution](../docs/sdlc/reports/SP-02-execution-2026-10-31.md). Missing cursor key/authority dependency fails closed. Optional editProject and all later business slices remain unimplemented. This does not establish D-07 guarded transport.

## SP-03 selected contract support — 2 November 2026

Workspace v0.2.12 and logical model v0.11 add required read-only Task.created_at, preserving UC-03 server creation-time output without accepting client origin fields. Owner selected immutable server time and permanent consumed key/hash plus original Task 201 snapshot (including original title/description), with current access checked before replay. Existing project/member receipts are unchanged. Proposed ADR-0027 and FEAT-SP03-01 define the bounded mechanics; additive 009 and task handlers remain unimplemented at this support checkpoint.

createTask declares 413/415 for bounded JSON/media rejection; getTask declares 400 for invalid query shape. No operation or permission is added. Task consumers must move together: strict older schemas may reject the required new field. Contract tests prove schema boundaries, not migration or HTTP authority. No legacy timestamp is inferred, no applied migration is edited and no development database upgrade is performed.

## SP-03 current local handoff — 2 November 2026

The registered SP-03 now implements createTask/listTasks/getTask and the existing-design Task UI against Workspace 0.2.12, logical model 0.12 and additive draft 009. See [execution evidence](../docs/sdlc/reports/SP-03-2026-11-02-execution.md) for final actual command results/source identity and limits. Prior support/checkpoint paragraphs above are historical stages; they do not mean these handlers are still absent. Business audit uses UC-03 backlog-item-create; durable replay operation remains createTask. Current access precedes original snapshot disclosure; creation time is immutable server time. No Task edit/reorder/Sprint/Knowledge/AI handler is added. Formal Proposed ADR/release/independent gates remain open; no development upgrade or new Git publication.

## Task mutation transport contract support — 3 November 2026

Workspace v0.2.13 declares bounded transport error responses HTTP 413 (Payload Too Large) and HTTP 415 (Unsupported Media Type) under editTask, setTaskState, setAssignee and recordBlocker, describing intended future media/body rejection; no Fastify handler behaviour is established by these declarations. Operation inventory remains 66; Knowledge remains v0.2.9. These four Task mutation handlers, their additive storage support and runtime tests remain unimplemented at this support checkpoint.

## SP-04 selected command semantics — 3 November 2026

[Owner-selected directions](../docs/implementation/features/sp-04-update-task/owner-decisions.md) and [Proposed ADR-0028](../docs/adr/0028-task-mutation-authority-and-outcomes.md) refine existing Task operations without changing the OpenAPI bytes, schemas, headers or inventory. Current Task/project read scope and the specific requested action are required for new writes and replay; edit is separately provisioned from create and new content edits are Backlog-only. New non-null assignees must be enabled current same-project members; null unassign remains available. After caller authorisation, unknown/nonmember/foreign/disabled targets share bounded400 validation_failed; required authority/storage failure stays503. No user directory or implicit role grant is introduced.

Keep original edit/state/assignment200 Task (including title/description) and blocker201 indefinitely with consumed actor/operation/key/hash. Committed same-input replay checks current read/action, then returns the original historical result without applying live write revision/placement/old-assignee checks or mutating again. Changed input conflicts. UI reads current state separately. New same-value/empty edits, same-state or same-assignee requests are proposed business no-ops after all new-write checks: retain original200 without revision/change audit; distinct blocker keys append and advance revision. Omitted blocker outcome normalizes to null, edit omission leaves unchanged and explicit null remains invalid for nonnullable fields.

C01: generic409 state_conflict contains no current_revision field; client performs fresh authorised getTask before a new user-approved write. C02: recordBlocker201 contains only Blocker, so fresh Task/history supplies current blocked/revision. C03: known rollback is atomic; uncertain COMMIT/HTTP acknowledgement remains unknown and recovers only the same original actor/operation/key/body. Do not introduce a pending wire schema or automatically retry under a fresh key. Existing413/415 declarations are not runtime evidence.

SP-05 registered support: FEAT-SP05-01v0.1 / SP-05v0.7.4 / Workspace0.2.14 / Proposed ADR0030v0.1 align separate actions, Sprint revision preconditions, nullable server lifecycle times, scoped Sprint pages and explicit transport errors before011/producers. Original directions and historical results are preserved; FR66/67 excluded, P08 actual SP04 integration remains mandatory. No runtime acceptance.

## Selected Sprint Could contract — 6 November 2026

The owner-selected [Could decisions](../docs/implementation/features/sp-05-sprint-lifecycle/could-decisions.md) refine FR/AC-66/67/31; release priority stays Could. C01 aligns sources only; producers and runtime assertions remain unimplemented. Current authority is required for writes and original-result disclosure. Independent sprint-edit and sprint-deallocate are privately audited grants; no role/create/allocate inference. Unknown/hidden resource access remains generic 404, readable but insufficient action is 403, unavailable authority/storage is 503.

editSprint accepts partial goal/dates plus expected_revision = Sprint.revision, only in Planned. Merge against locked current values, validate nonblank goal and strict dates/start_date < end_date. Identical values (including revision alone) acknowledge without change audit/revision. removeAllocation accepts no body/query; X-Expected-Revision is Sprint.revision, never Task.revision. Only current todo/in_progress allocations in Planned/Active return as To Do to Backlog. Done returns 409 task_already_done after current access/revision/location checks; other lifecycle/stale/idempotency conflicts use state_conflict. Completed rejects; preserving Done attribution protects future Sprint metrics.

Project → Sprint → Task locks and post-wait session guards apply. Current action/read (including Task read for removal replay) precedes immutable actor/operation/key/payload-hash original-result lookup; lookup precedes live lifecycle/revision/location restrictions. Changed payload conflicts. Removal marks Returned, clears current Sprint, appends using PostgreSQL numeric MAX(position), advances allocation/Task/Sprint revisions and Backlog generation, preserves assignee/blockers/history, and records source Sprint, prior Task state/location and resulting Backlog position linked to the operation. State, minimum audit and typed original 200 Sprint commit together; audit/receipt failure rolls back. Unknown commit/transport outcome reconciles the same exact key/body/header, never a fresh automatic key. Original receipts are historical; refresh current state separately.

PATCH has the existing 8192-byte JSON limit and explicit 400/401/403/404/409/413/415/503. DELETE rejects unexpected body/query (400), with transport 413 for oversized unexpected bodies and 415 for unsupported unexpected media; no Content-Type is required on an empty DELETE. Both keep existing 200 Sprint and operation IDs. Planned migration 012 extends private grant/provisioning-audit/typed receipt constraints and immutability; down refuses retained Could grants, provisioning/mutation audit or receipts. Applied 001–011 and historical fixture ceilings are unchanged. No runtime AI mutation, new service or new operation.

## Selected Could runtime correction and handoff — 6 November 2026

Workspace0.2.16 adds task_already_done to the existing Error.code enum; C01 had described the reason but omitted the enum member, so real serializer verification initially withheld the409 as503. Actual producer/HTTP tests now enforce the enum and Done409. Existing66 operation inventory, 200 Sprint shapes, Could priorities and Knowledge contract remain unchanged. Both Could handlers, private action discovery, exact method/header recovery v2 and existing-design UI are implemented; see [author runtime result](../docs/implementation/features/sp-05-sprint-lifecycle/verification/could-runtime-result.md). Schema012 receipts/actions plus013 boolean provenance preserve owner-only provisioning audit; runtime has no direct audit read. Earlier C01 source-only observations remain historical and do not constitute runtime evidence for the final code.
