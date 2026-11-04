# Dependency-based implementation roadmap

**Artifact ID:** IMPL-ROADMAP-01\
**Version/date:** 0.36 Draft · 4 November 2026\
**Status:** Planning order, not completed work or scope acceptance.\
**Inputs:** PRD-01 v0.10.1; SPEC-INDEX v0.7; PLAN-01 v0.4; [decisions](decisions.md); [task catalogue](tasks/README.md).\
**Trace:** BR-01–BR-14; SC-01–SC-08.\
**Owner role:** Sequential development coordinator.

Dependencies are gates, not dates. Keep all release Must ACs. Optional requirements remain optional, with explicit inclusion decisions; do not treat every declared operation as an equal-size unit of delivery.

| Milestone | Packs / sequence | Observable exit evidence |
| --- | --- | --- |
| M-01 authenticated foundation | SP-01 + SP-11.1 capture; relevant D-01/02 decisions first | Real sign-in/out/expiry and actor integrity; owned audit capture where required; executable application checks actually wired |
| M-02 smallest work flow | SP-02 project/membership foundation → SP-03 → SP-04, capture in every producer | Two synthetic accounts; create project/task; update state/blocker; fresh client reconstructs persisted authorised work; membership loss denies and clears protected UI |
| M-03 complete Scrum behaviour | Finish SP-02 removal/last-manager tests and SP-05 | Fixed lifecycle, complete Backlog reorder, exclusive allocation, mixed per-task outcomes, complete/reopen with history preservation; controlled concurrency/failure tests |
| M-04 knowledge access | SP-06 with SP-11.1; SP-07 | Workspace-first creation, independent rights, guarded protected reads, revoke/rejoin, immutable Current replacement and exact labelled history; same-key unknown-outcome reconciliation |
| M-05 useful context without AI | SP-08 plus relevant SP-07 readiness/history | Task links and permission-filtered English keyword search; no hidden target metadata; work and healthy document/keyword paths survive provider failure |
| M-06 evidence-backed AI | SP-11.2/3 and SP-09 after work/doc prerequisites; SP-10 | Selected permitted provider configuration; scoped retrieval, durable manifests, guarded input/answer transport, exact citation and full evidence checks; operational state overrides old text |
| M-07 scoped inspection | SP-13 after producing evidence exists; capture is already mandatory | Audit identity exception/redaction; scoped trace and sources; optional summary entitlement independent of audit/trace; honest missing metrics |
| M-08 release verification | SP-12 with regressions from every pack | Must AC/SC coverage, reproducible evaluation, matched keyword baseline for improvement claims, known failures/limitations and dependency-specific fallback |

## Capture and dependency interpretation

### Registered work plans

The [work plan register](features/README.md) links feature, fix, hotfix and test plans to their PLAN-01 sections, canonical spec/pack children and milestones above. Keep each plan's detailed task statuses in its own task table. Registration adds no Must deferral, dependency reorder, decision acceptance or calendar change.

| Milestone / parent | Child work plan | Scope / next task |
| --- | --- | --- |
| M-02/M-03 supporting handoff / PLAN-01 Month 1 | [AGENT-ALIGN-01 v0.2](features/agents-sdlc-alignment/plan.md) | A03 source-link repair verified in current checkout; original agent alignment evidence retained; no milestone acceptance |
| M-01 / PLAN-01 Month 1 | [FEAT-SP01-01 v0.9](features/sp-01-session-foundation/plan.md) | Bounded P12 session evidence merged to main at 52a10dd after owner instruction; formal ADR/deployment/D-07 and release limits remain open |
| M-02/M-03 / PLAN-01 Month 1 | [FEAT-SP02-01 v0.7](features/sp-02-project-membership/plan.md) | Existing bounded implementation evidence retained; SP02-T01 cursor boundary follow-up registered under the same parent; future SP02-F01/D-07 remain open |

SP-11 is cross-cutting: its mutation-capture child accompanies every first mutation. Its AI evidence children are later, after work and knowledge prerequisites. SP-06's SP-11 dependency means applicable capture readiness, not completion of the entire AI manifest/inspection pipeline. SP-01 and SP-11 capture are co-delivered where session-producing operations require records; do not create a circular wait or defer audit.

The task catalogue retains canonical spec dependencies. Within a spec, foundational children may be integrated early, but the whole pack is not Verified until its mandatory children and dependencies pass. For example, initial project membership can support SP-03 while full member-removal regression continues; final SP-02 acceptance still includes it.

## Stop and recovery rules

- Stop the affected step on unknown authority, unresolved material policy or failing required tests. Continue independent authorised preparation; do not bypass the gate.
- A timeout is unknown outcome, not rollback. Reconcile the original scoped identity/payload. A protected AI transport follows its one-use/unknown-transport rules, not generic mutation replay.
- Do not simplify by removing guards, content permissions, durable evidence, history or tests. Revisit unnecessary mechanism complexity through the decision process.
- Later milestone preparation may use local synthetic doubles. It does not authorise live AI relay before the work/document gates.
- No additional Must deferral, automatic graph, meeting AI, reports expansion or runtime multi-agent feature is introduced.

Checklist: Pass for explicit sequence, capture interpretation and observable exits; Gap for all application milestone evidence. Handoff: select SP-01.1 from [tasks](tasks/README.md), following [execution](execution.md).

## Shared framework prerequisite

M-01 includes [INIT-FRAMEWORK-01](features/framework-foundation/plan.md): owner-directed frontend/two-service scaffolding on main and preservation of the synthetic UI under design/prototype. This bounded shared setup precedes protected SP-01 implementation; it does not close session or permission acceptance.

## SP-02 bounded handoff — 1 November 2026

FEAT-SP02-01 v0.6 records implemented and locally verified project/member handlers and UI. M-02 continues with SP-03/SP-04; M-03 still needs SP-05 plus future actual producer race reruns SP02-F01. No complete work flow/milestone or release acceptance is inferred from the SP-02 subset.

## SP-01/SP-02 test and audit publication — 1 November 2026

[PUB-SP01-SP02-01](features/sp-01-sp-02-test-audit-publication/plan.md) consolidates the two testing/audit reports and publishes the owner-authorised current branch. It does not add a milestone pass, implement SP-03 or merge to main.

## SP-03 child plan — M-02 / PLAN-01 Month 1

[FEAT-SP03-01 v0.5](features/sp-03-create-task/plan.md) maps SP-03.1–03.4 to the registered implementation and measured evidence. All three material owner choices are recorded; current results belong only to the parent plan and actual handoff. No master milestone, calendar, Must deferral, independent acceptance or new Git publication is implied.

### Historical SP-03 selected support continuation — 2 November 2026

FEAT-SP03-01/entry/WBS v0.4 resumes all SP-03 tasks under the owner objective. SP03-DECISION-BATCH v0.2 and Proposed ADR-0027 v0.2 record all three actual owner choices; P02 preparation is complete. P03A v0.2 coordinates canonical SP-03 v0.7, Workspace v0.2.12, CONTRACT-01 v0.23, logical JSON v0.11, DATA-04 v0.15 and API-05 v0.21. Parent plan owns actual test/status evidence. No migration/handler or Git publication has occurred at this support checkpoint. Earlier source tables/results are dated snapshots, not relabelled runtime evidence.

### Historical SP-03 foundation execution evidence — 2 November 2026

FEAT-SP03-01 v0.4 now links actual P03A/P03B/P03C evidence and v0.2 child briefs. P03B adds only draft migration 009, internal task types/outcome adapter, explicit 009 fixture and storage tests; DGM-DATA-01 v0.6/model entry reflects Task.created_at. P03C extends the private operator/CLI and tests author grant/removal ordering. Parent plan is the only mutable task-status table; migration/contract/source versions and old captures are retained as dated identities. No task HTTP/UI/browser or whole-feature completion, development upgrade, Git publication or independent approval is claimed.

### SP-03 final handoff source registration — 2 November 2026

Current local reading sources: FEAT-SP03-01/entry/WBS 0.5, canonical SP-03 0.8, IMPL-SP-03 0.2 / IMPL-TASKS-01 0.6, Workspace 0.2.12, logical JSON 0.12, CONTRACT-01 0.24, API-05 0.22, DATA-04 0.16, TEST-08 0.24, TEST-COVERAGE-01 0.11 and VERIFY-01 0.12. SP03-UI-01 0.2 preserves its original 0.1 report snapshot and actual captures; SP03-EXEC-01/WORKSPACE-TASKS-01 are 0.1. Source status updates in AGENTS 1.15/rules 1.14 change no planning/permission authority. P09 final regression/audit results belong to the parent/report; do not infer acceptance from this registration. Older source/result sections remain historical observations and are not relabelled.

## Historical SP-03 publication follow-up — 3 November 2026

[PUB-SP03-01 v0.1](features/sp-03-publication/plan.md) registers bounded review/verification, selective publication, merge into main and deletion of the merged SP-03 branch under the owner instruction. Parent FEAT-SP03-01 / SP-03.1–03.4 / FR-05/AC-05 / PLAN-01 Month 1 / M-02. PUB03-T01/T02 v0.1 and PUB-SP03-ENTRY-01 v0.1 define the ready work; the publication plan owns actual results. Planned report SP03-PUB-REPORT-01 v0.1: docs/sdlc/reports/SP-03-publication-2026-11-03.md. No product scope, independent approval or deployment is implied.

## SP-03 publication completion — 3 November 2026

[PUB-SP03-01 v0.2](features/sp-03-publication/plan.md) and [SP03-PUB-REPORT-01 v0.2](../sdlc/reports/SP-03-publication-2026-11-03.md) record actual verification, source commit a8b3192, successful GitHub CI, confirmed fast-forward into main and deletion of both SP-03 source branches. Parent FR-05/AC-05 / SP-03.1–03.4 / PLAN-01 Month 1 / M-02 is unchanged. Unrelated working files and the template gitlink are preserved. No deployment, complete master milestone or independent approval.

## Historical SP-04 preparation registration — M-02/M-03 / PLAN-01 Month 1

[FEAT-SP04-01 v0.2](features/sp-04-update-task/plan.md) / [entry](features/sp-04-update-task/README.md) registers the current main-based SP-04.1–04.4 continuation. SP04-P01 is source/invariant preparation; later producers remain planned. Actual SP-05 completion/allocation versus reopening remains a required coordinated gate. Audit-data inspection does not implement optional charts; after SP-08 the owner will consider charts/load balancing without changing formal MVP scope. No milestone pass, prior-worktree adoption or runtime change is implied.

## Historical SP-04 coordination registration — M-02/M-03 / PLAN-01 Month 1

[FEAT-SP04-01 v0.3](features/sp-04-update-task/plan.md) and [SP04-COORD-01 v0.1](features/sp-04-update-task/COORDINATION.md) assign AG01 source cross-check to Antigravity and keep plan/map/check/integration ownership with Codex. Delivery and review remain unconfirmed until actual return. No milestone pass, new producer, chart or load-balancing scope; P01 historic evidence and SP-05 integration gates remain unchanged.

## Historical SP-04 review reconciliation registration — M-02/M-03 / PLAN-01 Month 1

[FEAT-SP04-01 v0.4](features/sp-04-update-task/plan.md) records actual AG01 receipt and evidence-correction requirement; [AG02](features/sp-04-update-task/tasks/AG02-evidence-correction.md) is the written follow-up. P01 author results remain bounded structural evidence; no whole-SP-04/milestone acceptance or implementation follows from this review. Actual SP-05 producer integration remains required.

## Historical SP-04 source cross-check closure — M-02/M-03 / PLAN-01 Month 1

[FEAT-SP04-01 v0.5](features/sp-04-update-task/plan.md) reconciles returned AG01/AG02 reports using corrected source hashes and [explicit coordinator errata](features/sp-04-update-task/reviews/ag02-codex-final-disposition.md). P01 preparation and bounded source cross-check are complete; P02 remains next/unexecuted. No master milestone, runtime acceptance or actual SP-05 producer gate is closed.

## Historical SP-04 P02 correction gate — M-02/M-03 / PLAN-01 Month 1

[FEAT-SP04-01 v0.6](features/sp-04-update-task/plan.md) receives a P02 proposal with [blocking design findings](features/sp-04-update-task/reviews/p02-codex-disposition.md). [AG03](features/sp-04-update-task/tasks/AG03-p02-design-correction.md) corrects two design documents only; P03A/P03B are not activated. P01/AG01/AG02 source-check evidence and actual SP-05 integration gate remain unchanged. No milestone completion, runtime fix or scope/priority change.

## Historical SP-04 P02 owner dispositions — M-02/M-03 / PLAN-01 Month 1

[FEAT-SP04-01 v0.7](features/sp-04-update-task/plan.md) and [decision batch v0.3](features/sp-04-update-task/decision-batch.md) record coordinator corrections following AG03. Technical obligations are source-reconciled; D-01 edit/action rights, D-02 disabled assignee and D-03 new-operation result retention need owner selection. No AG04 review loop or active external task. P03A/P03B remain unexecuted; whole-feature and actual SP-05 integration gates stay open.

## Historical SP-04 recorded owner choices and P03A assignment — 3 November 2026

[FEAT-SP04-01 v0.8](features/sp-04-update-task/plan.md), FEAT-SP04-ENTRY v0.8, SP04-COORD-01 v0.6, SP04-P02 v0.6, [SP04-DECISION-BATCH v0.4](features/sp-04-update-task/decision-batch.md) and [SP04-OWNER-01 v0.1](features/sp-04-update-task/owner-decisions.md) record actual D-01/D-02/D-03 replies: edit authority is separate from create, new assignees must be enabled current project members, and original mutation outcomes are retained indefinitely with current authority checks. P02 design preparation is complete; detailed mechanics remain Proposed and unimplemented. Parent SP-04.1–04.2 / FR-09/40/43/44, supporting FR-03/31/59/68 / PLAN-01 Month 1 / M-02–M-03 remain the trace.

[SP04-P03A v0.1](features/sp-04-update-task/tasks/P03A-contract-support.md) is the written Antigravity assignment for eight 413/415 response declarations across four future mutation operations and coordinated metadata only; manual delivery/execution is unconfirmed. [SP04-P03A2 v0.1](features/sp-04-update-task/tasks/P03A2-policy-source-alignment.md) is planned policy-source alignment before P03B, not dispatched. Current navigation: IMPL-FEATURES-01 v0.37, IMPL-REG-01 v0.42, IMPL-ROADMAP-01 v0.30, DOC-REVIEW-REG-01 v0.51, REG-00 v0.110. No runtime, migration, test-result acceptance, new FR, priority change or whole-feature completion.

## Historical SP-04 P03A receipt reconciliation — 3 November 2026

[FEAT-SP04-01 v0.9](features/sp-04-update-task/plan.md) registers [SP04-P03A-R v0.1](features/sp-04-update-task/tasks/P03A-R-return-reconciliation.md) for the owner's returned [SP04-P03A-RESULT v0.1](features/sp-04-update-task/reviews/p03a-contract-support.md). Trace SP-04.2 / FR-09/40/43/44 and supporting FR-03/31/59/68 / PLAN-01 Month 1 / M-02–M-03. Inputs: SP-04 v0.7.2, CONTRACT-01 v0.25, API-05 v0.23, Workspace v0.2.13. Preserve actual receipt, verify exact API delta and source hashes, record evidence limits and update parent status. No runtime or applied migration changes, independent approval or next-producer dispatch. P03A2 remains the planned source-alignment prerequisite before P03B.

P03A receipt result: [SP04-P03A-DISPOSITION v0.1](features/sp-04-update-task/reviews/p03a-codex-disposition.md) verifies the exact eight-entry delta, 42 Workspace / 24 Knowledge operations and 172/174 unchanged preserved paths (contract/README are expected changes). Source/report/failure-log/preregistration limits remain explicit; original return is preserved. FEAT-SP04-ENTRY v0.9 and SP04-COORD-01 v0.7 close the shared-write lease. No external task is active; P03A2 refinement/registration is next before dispatch/P03B, without another material policy-selection round. Structural checks are not runtime acceptance.

## Historical SP-04 P03A2 registered source alignment — 3 November 2026

[FEAT-SP04-01 v0.10](features/sp-04-update-task/plan.md) and [SP04-P03A2 v0.2](features/sp-04-update-task/tasks/P03A2-policy-source-alignment.md) register owner-requested sequential source alignment before storage/permission producers. Trace SP-04.1–04.2 / FR-09/40/43/44, supporting FR-03/31/59/68 / PLAN-01 Month 1 / M-02–M-03. Exact primary/support/metadata paths, initial versions, planned checks and preservation assertions are in the brief; source before-images are captured. Canonical support amendment precedes further primary edits. New ADR-0028 will remain Proposed; existing ADRs/baseline/OpenAPI/runtime/migrations/tests and requirement priorities stay unchanged. No independent/runtime acceptance or automatic P03B execution.

P03A2 actual result: [SP04-P03A2-RESULT v0.1](features/sp-04-update-task/reviews/p03a2-source-alignment.md) and evidence/p03a2/checks.json close canonical source alignment under FEAT-SP04-01 v0.10 / SP04-P03A2 v0.2; entry v0.10 and coordination v0.8. Current sources: PRD-01 v0.10.1, UC-02 v0.8.2, DATA-04 v0.16.1, logical model v0.13, API-05 v0.23.1, CONTRACT-01 v0.25.1, SP-04 v0.7.3, TEST-08 v0.24.1, TEST-COVERAGE-01 v0.11.1 and VERIFY-01 v0.12.1. [ADR-0028 v0.1 Proposed](../adr/0028-task-mutation-authority-and-outcomes.md) is new bounded mechanics with explicit owner-policy provenance, not formal acceptance. Actual context45/45, contracts27/27, docs20/20 remain structural checks; protected runtime/wire/old ADR/baseline sources and graph content are preserved. Exact metadata-only propagation/frozen report envelope limits and failed attempts are recorded. Next P03B requires its own exact brief; no runtime, migration, new requirement/priority, independent approval or external dispatch.

## Historical SP-04 P03B registered storage producer — 3 November 2026

[FEAT-SP04-01 v0.11](features/sp-04-update-task/plan.md) and [SP04-P03B v0.1](features/sp-04-update-task/tasks/P03B-mutation-storage.md) register the owner's requested bounded additive010/types/storage-test producer after P03A2. Parent SP-04.2 / FR-09/40/43/44 and supporting FR-03/31/59/68 / PLAN-01 Month1 / M-02–M-03. Exact paths, selected design inputs, real disposable verification and refusal/preservation gates precede implementation. No Task handler/operator/UI change, applied migration edit, valuable-data upgrade, broad ADR adoption, external assignment or Git publication.

P03B actual result — 4 November 2026: [SP04-P03B-RESULT v0.1](features/sp-04-update-task/reviews/p03b-storage-result.md) verifies additive010/internal typed mutation outcomes/private grant guard under FEAT-SP04-01 v0.11 / SP04-P03B v0.1; entry v0.11, coordination v0.9, WORKSPACE-TASKS-01 v0.2. Actual disposable new storage13/13 and historical009 regression8/8, Workspace typecheck and context45/45/contracts27/27/docs20/20 pass with original failures preserved. Parent SP-04.2 / M-02–M-03 is unchanged; old applied SQL/create adapter/handlers/UI/wire/ADR/baseline remain preserved. No valuable-data upgrade or runtime end-user mutation/permission/HTTP acceptance. Next separately briefed P03C; actual SP-05 integration and whole-SP-04 gates remain open.

## SP-04 P03C private authority/discovery producer — 4 November 2026

[FEAT-SP04-01 v0.12](features/sp-04-update-task/plan.md) and [SP04-P03C v0.1](features/sp-04-update-task/tasks/P03C-task-authority-discovery.md) register owner-requested private selected Task actions and exact target discovery under SP-04.2 / M-02–M-03. Exact code/test/provenance/registered-operation scope and disposable verification precede edits. No001–010/wire/ADR/baseline/UI/root/dependency change or new mutation handler. Prior results remain bounded; no formal ADR/runtime end-user mutation acceptance.

P03C actual result: [SP04-P03C-RESULT v0.1](features/sp-04-update-task/reviews/p03c-authority-result.md) and evidence/p03c/checks.json verify private selected Task actions/provenance and exact registered-operation Task discovery under FEAT-SP04-01 v0.12; entry v0.12, coordination v0.10, WORKSPACE-TASKS-01 v0.3. New13/13 and combined43/43 real disposable authority/projectHTTP/storage regressions, Workspace typecheck and context45/45/contracts27/27/docs20/20 pass. Prior001–010/wire/model/ADR/baseline/old tests/UI remain preserved. Production exposes current getTask/read discovery only; no synthetic future registry is credited as a handler. Next separately briefed P03D1; whole-SP-04/SP-05/D-07/independent gates remain open.


## SP-04 P03D1 Backlog edit registration — 4 November 2026

[SP04-P03D1 v0.1](features/sp-04-update-task/tasks/P03D1-backlog-edit.md) / FEAT-SP04-01 v0.13 registers the owner-requested next bounded existing editTask handler and real disposable verification, PLAN-01 Month1 / M-02–M-03 / FR-40/AC-40. Exact paths/commands/pre-images precede edits. No new operation/schema, later mutation/UI, broad ADR adoption or Git publication. Parent plan owns actual outcome.

P03D1 bounded result: [SP04-P03D1-RESULT v0.1](features/sp-04-update-task/reviews/p03d1-edit-result.md) under FEAT-SP04-01 v0.13 verifies Backlog editTask only; new14/14 and combined61/61 actual disposable Task assertions, Workspace typecheck, context45/45/contracts27/27/docs20/20. Prior failures/source limits preserved; no schema/wire/ADR adoption, edit UI, full-SP04/SP05/independent acceptance or Git publication. Next separately briefed state-change producer.


## SP-04 owner-requested remaining implementation — 4 November 2026

FEAT-SP04-01 v0.14 registers sequential P03D2/P03D3/P04–P07 remaining implementation and bounded commit before hotfix switch under the owning plan. Trace SP-04.2–04.4 / FR-09/40/43/44 / PLAN-01 Month1 / M-02–M-03. Exact paths/assertions and commands are saved before execution. Actual SP-05 P08 remains prerequisite, no Must deferral or complete-feature acceptance. No unrelated changes, push, deployment, new dependency or accepted ADR edit.

## Database status inspection — 4 November 2026

[DB-CHECK-01 v0.1](features/database-status-check/plan.md) registers a bounded read-only operational check under PLAN-01 v0.4 Month 1 / M-01 / SP-01.1. Entry and DB01 task are v0.1. No startup, migration, data changes or application acceptance. See the plan for authoritative results.


SP-04 bounded checkpoint outcome: [SP04-CONTINUATION-RESULT v0.1](features/sp-04-update-task/reviews/continuation-result.md) / FEAT-SP04-01 v0.14 records actual commands/history/live UI, producer negatives, retained regression failures/focused corrections and final source identity. Canonical SP-04 v0.7.4 / IMPL-SP-04 v0.2 retain P08 actual SP-05 integration open under explicit owner direction. Same FR/AC/PLAN-01/M-02–M-03 trace; no whole-feature, Must deferral, independent approval or deployment. Local commit/switch is authorised; actual Git result is resolved from history, not predicted.
