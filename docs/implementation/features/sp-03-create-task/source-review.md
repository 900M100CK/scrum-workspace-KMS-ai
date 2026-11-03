# SP03-P01 — Source, authority and acceptance reconciliation

**Artifact ID:** SP03-P01-SOURCE-REVIEW\
**Version/date:** 0.1 Draft · 2 November 2026\
**Status:** Bounded source inspection for P02; not independent approval or task-handler acceptance. Execution status belongs to the parent plan.\
**Inputs:** [FEAT-SP03-01](plan.md) v0.2; observed local sources and committed snapshots enumerated below, including Proposed ADR-0018 v0.2, ADR-0019 v0.4 and ADR-0026 v0.4.\
**Trace:** SP-03.1; FR-05/AC-05; supporting FR-03/31/59, BR-01/02/10/11/14; FR-50 is contextual document-access scope only; UC-03 main/EX-01/EX-02; TC-02/13/18/19/22; SC-01 subset, not whole-scenario acceptance.\
**Author:** Sequential development agent; project owner retains material decisions.

## Boundary and source identity

The owner requested the first SP-03 task. D01/D02 publication is already verified; this is P01 source reconciliation only. No P02 design selection, source/contract correction, application/test implementation, migration, dependency, provider, template/gitlink, commit or push is performed. Keep the [parent plan](plan.md#authoritative-task-and-execution-table) as the only mutable status table.

Inspection starts at branch codex/sp-03-create-task, HEAD d6b8caf241603cdff4f9b7a2a491fc4e2e386453. The working tree also contains earlier uncommitted source-link/input-version patches and unrelated user work. [Inspected source identities](evidence/p01-source-inputs.json) freeze raw committed and observed local SHA-256 values for 49 sources; CRLF-normalized equality is reported separately so line endings do not masquerade as semantic changes. This is a static read/body-comparison observation, not a run of those application handlers.

| Source | Committed snapshot at inspection HEAD | Observed local version | Reconciliation |
| --- | --- | --- | --- |
| [BRD entry](../../../BRD.md) and linked English baseline | Entry points to English v1.0 | Same baseline; no structured Version/date header in the full edition | Read BR-02/10/11 and SC-01; preserve original scope and priorities. |
| [PRD/SRS](../../../sdlc/PRD_SRS.md) | PRD-01 v0.9 | v0.10 | Local change is template-source-link metadata/note. Requirement body compared equal. |
| [Use cases](../../../sdlc/use-cases.md) | UC-02 v0.8 | v0.8.1 | Header/input metadata only; UC-03 body compared equal. |
| [Canonical architecture](../../../architecture.md) | SAD-03 v0.16 | v0.16.1 | Header/input metadata only; design body compared equal. |
| [Data design](../../../sdlc/data-design.md) | DATA-04 v0.14 | v0.14.1 | Header/input metadata only; body compared equal. |
| [API design](../../../sdlc/api-design.md) | API-05 v0.20 | v0.20.1 | Header/input metadata only; body compared equal. |
| [UX spec](../../../sdlc/ui-ux-spec.md) / [blueprint](../../../sdlc/ui-ux-blueprint.md) | v0.13 / v1.7 | v0.13.1 / v1.7.1 | Input metadata patches; this task selects no new visual design. |
| [Test plan](../../../sdlc/test-plan.md) | TEST-08 v0.23 | v0.23.1 | Header/input metadata only; specified assertions compared equal. |
| [Coverage](../../../sdlc/test-coverage.md) / [verification](../../../sdlc/requirement-verification.md) | v0.10 / v0.11 | v0.10.1 / v0.11.1 | FR-05 remains Defined/Specified; no new SP-03 runtime evidence appears. |
| [Canonical SP-03](../../../../specs/003-create-task.md) | v0.6 | v0.6.1 | Header/input metadata only; acceptance/placement body compared equal. |
| [SP-03 pack](../../tasks/03-create-task.md) / [master plan](../../../planning/five-month-plan.md) | IMPL-SP-03 v0.1 / PLAN-01 v0.4 | Same versions | SP-03.1 source/contract preparation, Month 1 / M-02; no calendar or dependency rewrite. |
| [Workspace OpenAPI](../../../../contracts/openapi/workspace.openapi.json) / [logical model](../../../../contracts/data-model.json) | Workspace v0.2.11 / logical model v0.10 | Same content after CRLF normalization | Contract shapes are declarations, not proof of a registered task handler. |
| [Decision register](../../decisions.md) and ADRs below | D-04 and detailed mechanisms remain open | Same source text | Read later owner-authorised framework/session/SP-02 amendments alongside older preparation prose; do not request a repeated framework selection. |

Eight requirement/design source bodies were compared after excluding only version/input metadata; the PRD comparison also excludes its explicitly link-only correction note. These comparisons are listed in the JSON capture. Code/migration sources are recorded individually; no environment values, credentials or real account data were read or copied. The earlier local cursor-test additions are a separate uncommitted test patch, not a P01 runtime run.

## Requirements and current contract

[PRD FR-05/AC-05](../../../sdlc/PRD_SRS.md), line 101, requires authorised Story/Task/Bug creation and rejection of unsupported/unauthorised input. [UC-03](../../../sdlc/use-cases.md#uc-03--create-a-task-in-the-project-backlog), lines 112–147, supplies the main and EX-01/EX-02 flows. FR-03/59 control current project scope and indistinguishable missing/denied reads; FR-31 requires durable audit. FR-50 is specifically document classification/manage-access, not a task-create acceptance requirement; the parent/brief generic supporting trace must not be interpreted as adding classification work to SP-03. Backlog creation authority comes from FR-05/UC-03/BR-02 and the scoped-capability rules. BR-02 is a responsibility/capability requirement, not permission to infer authorization from a membership role string.

The unchanged Workspace contract declares:

| Operation | Route / input | Success and declared failures |
| --- | --- | --- |
| createTask | POST /projects/{project_id}/tasks; Idempotency-Key; type/title required, description optional | 201 Task; 400/401/403/404/409/503 |
| listTasks | GET /projects/{project_id}/tasks; optional cursor and location=all/backlog; no public limit parameter declared | 200 TaskList; 400/401/404/409/503 |
| getTask | GET /tasks/{task_id}; task identity is a selector, not permission | 200 Task; 401/404/503 |

CreateTask has additionalProperties=false and types story/task/bug. It accepts no actor, project override, role, state, assignee, blocked, revision or work_location fields. Title has minLength=1; trimming/whitespace and finite body/field bounds need a concrete P02 contract/domain disposition rather than copying project limits as an unrecorded API change.

Task requires task_id/project_id/type/title/description/state/assignee_id/blocked/revision/work_location, with no created_by/created_at property and no extra fields. A newly created item must have todo, null assignee and unblocked state in the initial Backlog. WorkLocation uses an exact decimal-string position for Backlog, or an explicit Sprint/completed reference; TaskList supplies items, next_cursor and exact decimal-string backlog_revision. These fields are not a new response design proposed here.

## Existing implementation and absence inventory

| Inspection source | What exists | Reuse boundary / remaining work |
| --- | --- | --- |
| [app.ts](../../../../services/workspace/src/app.ts), imports/registration | Session and project HTTP scopes only; no task HTTP registration or task option in buildApp | Static evidence of absent handlers, not an executed HTTP status test. P04/P05 must wire only the existing declared routes. |
| [session/store.ts](../../../../services/workspace/src/session/store.ts), inspectInTransaction lines 71–88 | Same-client clock/account/session locks, disabled/revoked/expiry checks and controlled unavailable state | P02 specifies task lock ordering and calls the guard after relevant waits; no second pool transaction inside the business transaction. |
| [session/database.ts](../../../../services/workspace/src/session/database.ts), ownedTransaction | Owned-role transaction, lock/statement timeouts, rollback and uncertain COMMIT discard handling | Reuse only with the exact task transaction/failure semantics; unknown acknowledgement is not rollback. |
| [projects/store.ts](../../../../services/workspace/src/projects/store.ts), projectAccess/transaction lines 14–40 | Current project/membership check, same-client session and post-wait guard; optional manage=true checks membership-manage specifically | manage=true is not a task-create check. Never substitute membership management or a descriptive role for the selected Backlog-author capability. |
| [projects/operator.ts](../../../../services/workspace/src/projects/operator.ts), lines 5/38–54; [CLI](../../../../services/workspace/src/projects/cli.ts) | Private audited grant/revoke supports membership-manage/project-administrator; global operation supports create-project | No supported Backlog-author provision/recovery path yet. Generic capability_grant storage alone is not an audited supported grant mechanism. |
| [projects/store.ts](../../../../services/workspace/src/projects/store.ts), create/actions | Creation inserts membership-manage only; advisory actions currently expose project/member operations, not createTask | P02 must decide the exact explicit action/provisioning and action-discovery extension. Creator/Admin/PO labels do not supply a missing grant. |
| [projects/outcomes.ts](../../../../services/workspace/src/projects/outcomes.ts) and [008](../../../../services/workspace/migrations/008-project-outcomes.up.sql) | Existing request hash/result helper and permanent original project/member snapshots | Current non-project-operation CHECK requires null status/snapshot. The existing 201 Task snapshot cannot be passed through saveOutcome unchanged under createTask; P02/P03 must define a bounded extension. A pointer-only record does not establish immutable Task replay semantics. |
| [projects/cursor.ts](../../../../services/workspace/src/projects/cursor.ts) / projects/store.ts page, lines 146–155 | HMAC actor/scope/generation/expiry codec; helper traverses UUID IDs with row[idField] > after | Reuse has an ordering boundary: Backlog traversal is numeric position + task_id, not task_id alone. Codec marker validation also assumes a UUID. P02 must select a marker/projection strategy that preserves exact ordering and freshness. |
| [ProjectWorkspace](../../../../apps/web/src/ProjectWorkspace.tsx), [App](../../../../apps/web/src/App.tsx), [project controller](../../../../apps/web/src/projects.ts) | Session/project/member UI and actor-bound unknown-outcome recovery | No task controller/form/list/detail is implemented. Reuse cancellation/recovery only where task semantics match; preserve design and UI skill workflow. |
| [Existing task definitions](tasks/SP03-P03-owned-persistence.md), [create brief](tasks/SP03-P04-create-task.md), [read brief](tasks/SP03-P05-task-reads.md) | Planned source/test paths only | services/workspace/src/tasks/, apps/web/src/tasks.ts/TaskWorkspace.tsx and the named task suites do not exist at inspection. No task runtime correctness result can be claimed. |

The ID-only paging helper is correct for its current ID-ordered use; it must not be copied blindly for Backlog. For example, positions 1 then 2 may have descending task IDs: filtering the next page by task ID alone can skip the second position. Numeric strings also cannot be sorted lexically (10 versus 2). This is a static reuse constraint, not a detected SP-02 paging defect or an executed SP-03 regression.

## Applied storage and producer constraints

| Source | Existing persisted fact | P02/P03 obligation |
| --- | --- | --- |
| [001 task](../../../../services/workspace/migrations/001-store.up.sql), lines 37–49 | Type/title/description/state/assignee, numeric backlog_position and bigint revision; type/state constraints and same-project assignee FK. No task created_by/created_at or blocked column. Task state has no todo default in this DDL. | Assign server task identity and initial todo/Backlog fields explicitly. Reconcile creator/time requirements and derive blocked from committed blocker history; do not invent a column/wire field without design. |
| [001 capability/audit/idempotency](../../../../services/workspace/migrations/001-store.up.sql), lines 92–124 | Generic action text, append-only runtime audit with actor/entity/time/correlation, actor/operation/key idempotency identity | Generic SQL capacity does not choose capability policy or result retention. Co-commit the required task/audit/replay effects; keep exact original identity on unknown outcome. |
| [003 location](../../../../services/workspace/migrations/003-work-location.up.sql), lines 31–51/82–108 | Backlog/Sprint/completed location, deferred consistency and index; project.backlog_revision. AFTER INSERT/UPDATE/DELETE trigger already advances Backlog generation on entry/exit/reposition | Appending a Backlog item already increments generation in the insert transaction. Avoid a second manual increment; content/state-only changes do not define set/order generation. Reads return the generation from the same committed page transaction. |
| [007 safety/provisioning](../../../../services/workspace/migrations/007-project-membership.up.sql), lines 8–12/27–45 | Immutable origin fields are added to Project, not Task. Task/Project/Membership revisions are bounded to the safe JS integer maximum. Private provisioning audit action CHECK/partial uniqueness cover only current project capabilities. | Preserve existing safe-revision behaviour and immutable 001–008 files. Assess whether a new audited Backlog-author action needs additive audit/uniqueness/tooling support. Do not bypass private audit by direct public grant writes. |
| [008 replay](../../../../services/workspace/migrations/008-project-outcomes.up.sql), lines 8–37 | Typed immutable project/member outcomes; non-project status/snapshot must remain null; project-trigger immutability is scoped to the listed operations | Define task outcome integrity/current-authority/rollback/legacy and reversal safety explicitly, using minimal owned storage. No second generic receipt store or full-HTTP-body archive is automatically justified. |
| [Logical Task model](../../../../contracts/data-model.json), Task entity and invariants | Model omits Task creation timestamp; blocked derives from the highest committed blocker sequence; Backlog revision is separate from Task revision | Empty blocker history means an initially unblocked item. Exact bigint/decimal serialization and current location need real producer checks. |

These are source-level facts and constraints. No migration was executed, no DB was queried and no performance/concurrency/rollback behaviour was measured by P01. Existing session fixtures default to historical ceilings; SP-02 fixtures explicitly use 008. Future SP-03 fixture ceilings must be opt-in and preserve historical 006/008 evidence.

## Acceptance to evidence and producer map

All SP-03 runtime evidence below is Specified/Planned, not Passed. Existing tests in the last column are reusable patterns or historical bounded evidence, never substitutes for future task-handler assertions.

| Required scenario | Source trace | Planned producer and concrete assertion | Existing reference / evidence boundary |
| --- | --- | --- | --- |
| Supported Story, Task and Bug | AC-05; UC-03 main; TC-13/19 | P03/P04 task-storage/task-http: 201 correct project/type/todo/Backlog, null assignee, unblocked, safe server revision; independent new get/list returns persisted record via P05 | project-http create persistence tests demonstrate the project pattern only. |
| Invalid type/title/extra actor fields | AC-05; UC-03 EX-01; CreateTask schema; TC-13 | P04 task-http rejects invalid input with declared validation response and no task, Backlog generation, success audit or outcome effect | project-http forged/extra/blank-input and final serializer tests; schema validation alone is not permission evidence. |
| Readable member without author capability; PO label alone | AC-05; UC-03 EX-02; BR-02; TC-13 | P03 audited provisioning and P04 task-http: role-identical actors with different explicit grants differ correctly; readable insufficient authority is 403 without creation | project-authority/membership-lifecycle demonstrate explicit grants and descriptive roles, not task-create authority. |
| Anonymous/expired/disabled, foreign/nonmember/unknown scope | FR-03/59; AC-03; TC-02/13 | P04/P05 task-http/task-reads: current auth denies; paired unknown/nonmember protected reads have exact generic 404 without metadata; relevant lock-wait expiry/removal cannot authorize later output | session suites/project-reads and membership tests are existing boundaries; P01 does not rerun them. |
| Minimum audit, result or storage failure | FR-31/AC-31; BR-11; TC-18 | P03/P04/P07 verify entire task/position/generation/audit/replay rollback; no false success or partial persisted item | project-http audit/outcome trigger failures and project-outcomes transaction tests. |
| Same key/body, changed payload, lost acknowledgement, revoked replay | Existing createTask Idempotency-Key contract; BR-01/10/11 | P04/P07 one committed task for identical operation; different payload 409; exact original key reconciles unknown outcome; current access checked before original result disclosure | project-http exact/concurrent keys/lost COMMIT/current authority; UI-controller unknown recovery. |
| Controlled concurrent append and expiry/revocation waits | SP-03 placement amendment; NFR-02; TC-19 | P03/P04/P07 barrier-controlled real-handler schedules, preserved two tasks and unique numeric order, trigger generation once per append and atomic effects | project-concurrency lock barriers are a pattern. Future SP-04/SP-06 writers remain SP02-F01 and are not implemented here. |
| all versus Backlog reads, exact location/order/generation/cursor | SP-03 reconstruction amendment; Proposed ADR-0018; Workspace listTasks | P05 task-reads, plus unit tests only for genuinely new pure logic: correct decimal tuple order, current location, same-page backlog_revision; malformed/foreign 400, verified stale/expired 409 without items | project-reads/current projection and cursor unit tests do not prove task ordering. |
| Actual UI reload/unknown/denied/empty/outage and keyboard feedback | TC-22; current UX flow | P06 controller tests and P08 actual DOM/HTTPS/browser tests; no late protected-pane restoration; same-key recovery after reload | project-ui-controller/project-ui/browser are existing patterns; DOM and browser evidence stay separate. |

Planned test filenames are those frozen in P03–P09 briefs and are not present/runnable until implemented. P02 confirms commands/names before P03; P09 runs integrated assertions and relevant session/project regressions. UC-03 Alt-1/Alt-2 edit/reorder and EX-03 stale edit belong to later work. SC-01 also includes permitted linked specifications/decisions; task creation alone cannot close it. Knowledge/document/citation/AI tests remain outside this P01 result.

## SP-02 prerequisite evidence and limits

The [SP-02 testing report](../../../sdlc/reports/SP-02-testing-audit-2026-11-01.md) and [execution result](../../../sdlc/reports/SP-02-execution-2026-10-31.md) retain observations from 1 November: 64/64 bounded project tests, one isolated Edge run, and 89/89 session/storage regression results. Those counts include harness/SQL/parent cases and are not numbers of distinct permission behaviours. The report records Node 24.21.0 and disposable PostgreSQL 17.10/pgvector 0.8.2; the original source manifest/archive identify the measured inputs.

This is historical supporting evidence, not a new P01 run or whole SP-02/SC-06 approval. The local report edits clarify old input snapshots; source digest capture distinguishes them from the committed report. Future actual SP-04 setAssignee / SP-06 document-grant races, D-07 socket/source handoff, formal deployment/KDF calibration and independent review remain open. Selected framework/session foundations already exist; stale preparation prose in old source/pack headers does not erase their bounded measured implementation or require repeated owner selection.

## P02 questions and handoff

| Item | Concrete unresolved choice or discrepancy | Source / next owner / required before |
| --- | --- | --- |
| G-01 | Exact Backlog-author action/scope and supported private provision/revoke/recovery. Current generic grant rows are not a sufficient supported audit/tooling path; no creator/PO/Admin default may be inferred. | UC-03/BR-02, ADR-0007 scoped-default rule, operator/CLI/007. P02 drafts; owner resolves material policy before P03/P04/P06. |
| G-02 | Task-specific immutable replay result/reference and audit event mapping, retention/legacy/reversal constraints. Current project saveOutcome/008 shape cannot simply carry a Task snapshot. Closed source finding: P04 emits backlog-item-create per UC-03 (createTask stays the operation identity) and 009 down retains both draft and canonical audit labels. | 001/008/outcomes.ts. P02 design, then P03/P04 safety evidence; P09 audited the label mapping. |
| G-03 | Backlog append serialization, exact finite decimal/wire strategy, trigger generation, page size and cursor marker/order/projection/expiry/current-auth recheck. Reusing ID-only project page traversal does not satisfy Backlog order. | 003/listTasks/WorkLocation, Proposed ADR-0018/0019 and D-04. P02 prepares bounded disposition; dependent implementation waits. |
| G-04a | UC-03 persists and returns creation timestamp; current Task physical/logical/wire models omit it, while business audit has actor/time. A timestamp or creator response field would fail additionalProperties=false today. | UC-03 steps 3/5 versus 001/Task schema. P02 resolves source/presentation contract path; owner if product/API scope changes, before P03/P04/P06. No requirement silently removed. |
| G-04b | Title whitespace/body bounds, 413/415 transport behaviour and task action discovery are not settled by existing task wire descriptions. Project HTTP has stricter bounded media/body handling; app can emit 413/415, but createTask does not declare those statuses yet. | Workspace createTask vs project HTTP/app/actions. P02 records necessary coordinated contract/spec changes before edits; do not invent a public limit parameter. |
| G-04c | The earlier broad supporting trace lists FR-50, but its actual requirement is document classification. Treat it only as a contextual access safeguard, not a task-create feature/AC; final P02 trace should preserve this distinction. | PRD FR-50 versus FR-05/UC-03. P02 trace reconciliation; no requirement or product scope is removed. |
| G-05 | Exact future synthetic account/grant/session setup, disposable migration ceiling, task test entry points, real lock barriers and installed/trusted TLS/browser prerequisites. | Existing fixture/runbooks. Producer prepares before its runtime checks; P01 runs documentation checks only. |

P01 is usable for P02 design preparation with these gaps. It neither chooses a new permission/retention policy nor accepts Proposed ADR-0018/D-04. Material questions are assigned to the project owner via P02 before dependent implementation; no calendar dates, approvals, unsupported feature IDs or test passes are fabricated. This first-task request does not authorize continuing into P02 in the same turn.

## Verification and author checklist

Run only the P01 registered documentation checks under Node 24+: context:lint, context:check, context:test, docs:lint, docs:test, metadata synchronization for REG-00, new source/plan local link/anchor inspection and scoped whitespace. Actual commands/results/failures and unrun checks are recorded in the parent continuation; a command listed here is Planned until that result exists.

Author checklist: acceptance-source map supplied; implementation/absence inventory inspected; explicit capability versus role and private-provisioning constraints distinguished; 003/007/008 and creator/time/cursor gaps sourced; source/version/line-ending identity captured; historical versus newly observed evidence separated; P02 correction owners and prerequisite gates explicit. Independent review/standards certification and runtime checks are Not run. No source requirement, accepted ADR, API/schema, code/test, database or prior measured evidence is changed.

Actual bounded check result: context lint/check/test passed (45/45 context cases, zero skips); docs lint/test passed (20/20 documentation cases, zero skips), under Node 24.21.0. The [command record](evidence/p01-checks.json), [logs](evidence/p01-logs.zip) and parent continuation record scope, unrun runtime checks and preservation evidence. These results verify documentation/context only, not any SP-03 handler or decision acceptance.
