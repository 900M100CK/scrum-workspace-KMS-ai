# Dependency-based implementation roadmap

**Artifact ID:** IMPL-ROADMAP-01\
**Version/date:** 0.65 Draft · 14 November 2026
**Status:** Planning order, not completed work or scope acceptance.\
**Inputs:** PRD-01 v0.10.3; SPEC-INDEX v0.8.2; PLAN-01 v0.4; [decisions](decisions.md); [task catalogue](tasks/README.md).\
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
| M-01 / PLAN-01 Month 1 | [FEAT-SP01-01 v0.9](features/sp-01-session-foundation/plan.md) | Bounded P12 session evidence merged to main at 52a10dd after owner instruction; formal ADR/deployment/D-07 and release limits remain open |
| M-02/M-03 / PLAN-01 Month 1 | [FEAT-SP02-01 v0.6](features/sp-02-project-membership/plan.md) | P02 feedback reconciliation; proposed session refactor P03A, reduced authority 007/P03, replay/paging design at P04 before public mutations; bounded sequential implementation owner-authorised |

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


## M-02/M-03 documentation child — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.1](features/hotfix-backend-layering/plan.md) supports PLAN-01 Month 1 and the existing SP-03/SP-04 packs through a bounded backend layering clarification. No milestone order, acceptance, calendar or runtime scope change. Task results belong to that plan.

Backend layering bounded result: [HOTFIX-BACKEND-42-RESULT v0.1](features/hotfix-backend-layering/handoff.md) records implemented §4.2, preserved SP-04 checkout/source boundaries and five passing npm gates. Overall acceptance remains open for inherited local-source-link gap HF42-F01; no runtime evidence or automatic integration. Parent plan owns task status.


## HF42-F01 owner-authorised continuation — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.2](features/hotfix-backend-layering/plan.md) registers the explicitly requested Stage 6 profile source-link correction and bounded current metadata reconciliation. Same PLAN-01 Month 1 / M-02–M-03 support; no runtime or design change. Original gap evidence is retained; parent plan owns status/results.

HF42-F01 current result: [HOTFIX-BACKEND-42-01 v0.2](features/hotfix-backend-layering/plan.md) closes the explicitly authorised source-link correction with five passing npm gates, no missing local targets and preserved prior failures. Bounded documentation author verification only; no runtime, independent acceptance or integration. HOTFIX-BACKEND-42-RESULT is now v0.2.


## Backend layering publication authorisation — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.3](features/hotfix-backend-layering/plan.md) registers HF42-P01 for the owner-requested exact-scope commit and fast-forward integration/publication into main. Same PLAN-01 Month1 / M-02–M-03 parent; no code/design expansion, force push, branch deletion, runtime or independent acceptance. Actual final Git refs are reported after execution.


## HF42-C01 owner-selected documentation closure — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.4](features/hotfix-backend-layering/plan.md) registers HF42-C01 v0.1 to reconcile existing task/source/publication receipts and retain the documented Project-lock/in-memory-page limits. Same PLAN-01 Month1 / M-02–M-03 / FR-05/AC-05 support. Exact reference/projection checks and preservation gates precede execution. Runtime helpers/null changes require separate SP-04 scope; runner/discovery remain deferred. No automatic commit/publication or new runtime acceptance.


HF42-C01 actual result: [HOTFIX-BACKEND-42-01 v0.4](features/hotfix-backend-layering/plan.md) / result v0.3 reconciles original publication using live origin/main=dcd2d81 and retains the documented Project-lock/full-projection-page limits. Reference/projection context45/45, docs20/20 and metadata pass with original negatives retained;133 pre-existing outside files/index/refs remain preserved. Documentation author verification only; no new runtime refactor/commit/push/merge or independent acceptance. Deferred query/null work is separate SP-04 scope; runner/discovery awaits concrete demand.


## Backend follow-up task breakdown — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.5](features/hotfix-backend-layering/plan.md) / WBS v0.3 / entry v0.3 registers five planning-only handoff briefs HF42-RF01–RF05 v0.1: current SP-04 source/registration, shared capability query, unexpected-null contract/regression, small existing-transaction guard and combined regression/handoff. No runtime task is executed here; RF01 must adopt the drafts into existing FEAT-SP04-01 before code/testing. Same PLAN-01 Month1 / M-02–M-03 / proposed future SP-04.2–04.4 FR-09/40/43/44 and supporting FR-03/31/59/68. Original hotfix evidence/closure is unchanged; runner/discovery separation and automatic commits/publication are excluded.


## RF01–RF05 owner-authorised execution — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.6](features/hotfix-backend-layering/plan.md) owns actual RF01–RF05 runtime follow-up, superseding draft SP-04 adoption. Trace PLAN-01 Month1 / M-02–M-03 / SP-04.2–04.4 / FR-09/40/43/44 and supporting FR-03/31/59/68. Exact reversible committed-baseline reconciliation, allowed helper/null/ADR support and real006/008/009/010 verification are saved before edits. No automatic commit/merge/push, runner/discovery split or P08/independent acceptance.


RF01 baseline source: existing FEAT-SP04-01 v0.14 at e6f2337 is restored as committed source/evidence, retaining its P08 actual-SP05 gate. HOTFIX-BACKEND-42-01 v0.6 owns only the new RF01–RF05 changes. Baseline integration creates no Git merge/commit or new wire/schema policy.


RF03 owner-requested report boundary: [HF42-RF03-RESULT v0.1](features/hotfix-backend-layering/rf03-report.md) / HOTFIX-BACKEND-42-01 v0.6, entry/WBS0.4. RF01 source reconciliation is verified; RF02 helper6/6, affected regressions69/69 and typecheck pass. ProposedADR0029/RF03 actual010 reproduction intentionally retains one failing null child plus parent, with six other child cases passing. RF04 guard is unchanged/unimplemented; RF05 and P08 remain open. No full-hotfix acceptance, automatic commit/merge/push or independent approval. Original setup failures and false initial reproduction setup are retained and explained.


## RF04 bounded continuation — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.7](features/hotfix-backend-layering/plan.md) resumes the owner-requested RF04 existing-transaction null guard and unchanged real-PostgreSQL RF03 assertions, with session006/Project008/mutation010 regressions and Workspace typecheck/build. Planned [HF42-RF04-RESULT v0.1](features/hotfix-backend-layering/rf04-report.md) will record actual outcomes. RF05 remains pending; no automatic commit/merge/push, P08 or independent acceptance.


## RF05 combined verification registration — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.8](features/hotfix-backend-layering/plan.md) resumes RF05 after verified RF02/RF04: source-identified combined real006/008/009/010 regression, root build/typecheck, context/contracts/docs checks and preservation handoff. Planned [HF42-RF05-RESULT v0.1](features/hotfix-backend-layering/rf05-report.md) and WORKSPACE-TASKS-01 v0.6 bounded notes record actual outcomes. No code/test/schema/policy expansion, publication, P08/SP-05/D-07 closure or independent acceptance.


RF05 bounded result: HOTFIX-BACKEND-42-01 v0.8 / HF42-RF05-RESULT v0.1 verifies the combined helper/null change: real disposable006/008/009/010 PostgreSQL179/179; root typecheck/build; context45/45, contracts27/27, docs20/20 and lints. WORKSPACE-TASKS-01 v0.6 records current mechanics; original §4.2 baseline observations and old evidence remain unchanged. Test records include parents and overlap earlier runs. P08 actual SP-05 integration, D-07, deployment and formal/independent/release acceptance remain open; no new commit/merge/push.


## HF42-P01 publication status correction — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.9](features/hotfix-backend-layering/plan.md) / HF42-P01 v0.2 / entry0.6 reopen publication closure after owner correction. RF01–RF05 bounded verification remains valid; historical dcd2d81 documentation publication is preserved and does not prove publication of current dirty work. No new commit/merge/push/CI or whole-branch acceptance. Original documentation-only publication authority does not expand to runtime/SP-04.


## P01 final delivery registration — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.10](features/hotfix-backend-layering/plan.md) / HF42-P01 v0.3 registers owner-authorised final checks, exact current hotfix/SP-04 dependency commit/push, green-check main integration and safe merged-branch cleanup. SAD-03 v0.19 / entry0.18 align §4.2 with tested RF02/RF04. Actual outcomes follow execution; P08/SP-05/D-07 and independent/release/deployment gates remain open.


## P01 actual publication receipt — 4 November 2026

[HF42-P01-RESULT v0.2](features/hotfix-backend-layering/p01-report.md) / HOTFIX-BACKEND-42-01 v0.11 / P01v0.4 / entry0.8 record actual dde2933 hotfix push, exact-commit CI success and verified main fast-forward/publication. Earlier pending receipts remain historical observations. Final audit receipt/cleanup follow normal checked publication; parent SP05/P08/D07/independent/release gates remain open.

[FEAT-SP05-01 v0.1](features/sp-05-sprint-lifecycle/plan.md) / [entry0.1](features/sp-05-sprint-lifecycle/README.md) / [SP05-WBS-01v0.1](features/sp-05-sprint-lifecycle/breakdown.md) and SP05-P00–P15v0.1 register owner-approved Must implementation for SP-05.1–05.4 / PLAN-01 Month2/M-03, FR06/07/08/41/42 and co-delivered31. Separate five actions; FR66/67 excluded; SP04-P08 actual integration mandatory. Status belongs only to plan; no publication or independent acceptance.


## SP-05 bounded local delivery — 5 November 2026

[FEAT-SP05-01 v0.2](features/sp-05-sprint-lifecycle/plan.md) / entry v0.2 owns P00–P15 execution; [SP05-RESULT-01 v0.1](features/sp-05-sprint-lifecycle/handoff.md) maps Must AC/UC/TC to actual evidence; [SP05-PR-DRAFT-01 v0.1](features/sp-05-sprint-lifecycle/pull-request.md) prepares local review text. WORKSPACE-SPRINTS-01 v0.1, Proposed ADR0030 v0.1, SP-05 v0.7.4 and SP-04 v0.7.7, FEAT-SP04-01 v0.15 / SP04-P08 v0.3 record bounded actual-producer integration. Test-plan/coverage/verification current entries point to the owning result. These local observations supersede earlier pending SP05/P08 snapshots only; M03 other gates, CI, deployment and independent/release acceptance remain open. No commit/push/PR or valuable-data migration.


## SP05-AG01 written reviewer assignment — 5 November 2026

[FEAT-SP05-01 v0.3](features/sp-05-sprint-lifecycle/plan.md) / entry v0.3 / SP05-WBS-01 v0.2 registers [SP05-AG01 v0.1](features/sp-05-sprint-lifecycle/tasks/AG01-antigravity-tracking-testing.md), the owner-requested Antigravity P00–P15 tracking, source review and actual regression/browser verification brief for SP-05.1–05.4 / PLAN-01 Month2 / M-03 and coordinated SP04-P08. Reviewer inputs are frozen separately under evidence/antigravity-assignment/reviewer-inputs.json; old author evidence is immutable. Planned output SP05-AG01-RESULT v0.1 belongs to a new timestamped reviewer run. Preparation/manual delivery only: no dispatch, reviewer execution/result, source fix, commit or independent/release acceptance. The parent owns mutable assignment status.


## SP05-PUB01 Draft PR authority — 5 November 2026

[FEAT-SP05-01 v0.4](features/sp-05-sprint-lifecycle/plan.md) / entry v0.4 registers [SP05-PUB01 v0.1](features/sp-05-sprint-lifecycle/tasks/PUB01-draft-publication.md), owner-authorised agent commit, normal push and one Draft PR codex/sp-05 to main so Antigravity can later review. SP05-AG01 v0.2 supports the actual published head instead of requiring the historical base HEAD; original source/evidence snapshots remain unchanged. Planned SP05-PUBLICATION-01 v0.1 records actual publication only after execution. No merge, main update, reviewer result, valuable-data migration or independent/release acceptance. PLAN-01 Month2/M-03 and SP04-P08 trace unchanged.


## SP05-PUB01 actual Draft PR receipt — 5 November 2026

[FEAT-SP05-01 v0.5](features/sp-05-sprint-lifecycle/plan.md) / entry v0.5 / [SP05-PUBLICATION-01 v0.1](features/sp-05-sprint-lifecycle/publication.md) record normal feature commit0bb0f57 push and actual open [Draft PR #1](https://github.com/900M100CK/scrum-workspace-KMS-ai/pull/1), codex/sp-05 to main. SP05-PR-DRAFT-01 v0.3 links the actual PR. Runtime Git blob identities and fresh011 format-only storage proof are retained with old failures. First context CI was pending; final head/check state is verified after the documentation receipt push. No merge, reviewer execution or independent/release acceptance. Parent status remains canonical.


## SP05-V01 runtime verification continuation — 5 November 2026

[FEAT-SP05-01 v0.6](features/sp-05-sprint-lifecycle/plan.md) / entry v0.6 / WBS v0.3 registers [SP05-V01 v0.1](features/sp-05-sprint-lifecycle/tasks/V01-runtime-verification.md) and [SP05-RUNTIME-GUIDE-01 v0.1](features/sp-05-sprint-lifecycle/verification/README.md), with planned SP05-RUNTIME-RESULT-01 v0.1. Owner requested runtime follow-up after AG01 bounded static v0.2.1. Exact published source/tree, Node24/Docker/TLS/browser prerequisites, pure-controller separation and actual command/cleanup evidence govern execution. PLAN-01 Month2/M-03 and SP04-P08 trace unchanged. Codex runs are supplemental author evidence; no reviewer impersonation, acceptance, production edit, valuable-data migration or publication. Parent plan owns status.


SP05-V01 bounded result: [SP05-RUNTIME-RESULT-01 v0.1](features/sp-05-sprint-lifecycle/verification/runtime-report.md) records Codex supplemental execution on122 unchanged published inputs: Workspace347/347, isolated Edge1/1, structural92/92 and root build/typecheck/foundation/prototype success; pure controller7/7 also runs when Docker access is denied. Runner/guide v0.1 provides explicit-Node phased reproduction; no new resource leftovers or production changes. Antigravity runtime remains unexecuted/open; no independent/release acceptance or commit/push.


## AG01 v0.4 bounded runtime handback — 5 November 2026

[FEAT-SP05-01 v0.7](features/sp-05-sprint-lifecycle/plan.md) / entry v0.7 / [SP05-AG01-DISPOSITION-01 v0.1](features/sp-05-sprint-lifecycle/verification/antigravity-reconciliation.md) receive Antigravity report/tracking v0.4, manifest v0.3.1 and runtime record v1.0. Seven reported SP05 suites57/57;18 static and122 published blobs matched. SP05-RUNTIME-GUIDE-01 v0.2 links the later disposition. F-ENV-01 resolved within named runs; broader independent40-file regression not reported and not waived. Original raw inputs preserved; other-suite stdout granularity and browser capture origin noted. No production fix, commit/push or milestone/release acceptance. Parent owns current status.


## SP05-PUB02 final dossier publication — 5 November 2026

[FEAT-SP05-01 v0.8](features/sp-05-sprint-lifecycle/plan.md) / entry v0.8 / [SP05-PUB02 v0.1](features/sp-05-sprint-lifecycle/tasks/PUB02-verification-publication.md) register owner-authorised docs/runner/evidence commit/push and a Draft PR. [SP05-FINAL-HANDOFF-01 v0.1](features/sp-05-sprint-lifecycle/verification/final-handoff.md), SP05-AG01-DISPOSITION-01 v0.2, canonical SP05-AG01-RESULT/TRACKING v0.4.1 and immutable final input snapshots retain reviewer57 versus author347. F-REG-01 explicitly open/not waived; M03/release separate. No runtime/schema/test/package edit, production migration, force push or merge. PUB02-RESULT v0.1 is planned after actual publication.


## PUB02 actual verification dossier publication — 5 November 2026

[FEAT-SP05-01 v0.9](features/sp-05-sprint-lifecycle/plan.md) / entry v0.9 / [SP05-PUB02-RESULT-01 v0.1](features/sp-05-sprint-lifecycle/verification/publication-receipt.md) record normal commit6e3d662 push and actual open [Draft PR #2](https://github.com/900M100CK/scrum-workspace-KMS-ai/pull/2), codex/sp-05 to main. Final receipt head/check state is verified after its push. Runtime122 unchanged, final AG01 v0.4.1 preserved. F-REG-01 explicitly remains open/not waived; no merge, production change or M03/release acceptance.


## AG01 v0.5 full Workspace regression closure — 5 November 2026

[FEAT-SP05-01 v0.10](features/sp-05-sprint-lifecycle/plan.md) / entry v0.10 / [SP05-FREG-CLOSURE-01 v0.1](features/sp-05-sprint-lifecycle/verification/regression-closure.md) receive Antigravity report/tracking v0.5 and actual full40-file347/347 log/record.40 source markers and122 published inputs match; F-REG-01 resolved by execution, not waived. SP05-AG01-DISPOSITION-01 v0.3, SP05-FINAL-HANDOFF-01 v0.2 and SP05-RUNTIME-GUIDE-01 v0.3 reflect the newer boundary. [SP05-M03-READINESS-01 v0.1](features/sp-05-sprint-lifecycle/verification/m03-readiness.md) prepares owner review with actual roles/states/test names; no M03/release acceptance, product edit or new runtime rerun. Existing docs PR #2 publishes this continuation.

## SP-05 selected Could planning — 5 November 2026

[FEAT-SP05-01 v0.11](features/sp-05-sprint-lifecycle/plan.md), entry v0.11 and [SP05-WBS-01 v0.4](features/sp-05-sprint-lifecycle/breakdown.md) register SP05-C00–C11 v0.1 and [SP05-COULD-DECISIONS-01 v0.1](features/sp-05-sprint-lifecycle/could-decisions.md) under SP-05 / PLAN-01 Month 2 / M-03. Owner selected FR-66/67 Could implementation planning, two private actions sprint-edit/sprint-deallocate, Planned-only editing, and removal of unfinished Tasks only in Planned/Active. Done and Completed removal are excluded to protect completed-work attribution and Sprint metrics. Branch codex/sp-05-could starts at merged main cfe0dbe. Only the owning plan stores mutable task status. Planning/briefs only; C01 source alignment must precede producers,012 is planned not applied, Must evidence remains historical, and M03/release acceptance remains separate. No new runtime result, publication or reviewer dispatch.

## SP05 C01 source/contract continuation — 6 November 2026

[FEAT-SP05-01 v0.12](features/sp-05-sprint-lifecycle/plan.md) records owner-requested C01 under SP-05.1–05.4 / PLAN-01 Month 2 / M-03. PRD-01 v0.10.3, UC-02 v0.8.4, SP-05 v0.7.5, IMPL-SP-05 v0.3, Workspace0.2.15/logical0.15, CONTRACT-01 v0.25.4, DATA-04 v0.16.5, API-05 v0.23.5, TEST-08 v0.24.5, coverage0.11.4 and verification0.12.4 align independent sprint-edit/sprint-deallocate, Planned partial edits and unfinished-only current removal in Planned/Active. Done/Completed exclusion preserves completed-work attribution and future Sprint metrics. [Proposed ADR-0031](../adr/0031-sprint-could-edit-and-removal.md) records bounded mechanics; accepted ADRs/baseline and historical evidence remain unchanged. Existing two operations keep 200 Sprint and Could priority. Registration/source structure is not runtime permission evidence; C02–C11 remain separate. No runtime/schema/UI/dependency edit, commit/push or independent acceptance.

## Selected Could runtime registration — 6 November 2026

FEAT-SP05-01 v0.13 / entry v0.13 records C02–C11 selected FR/AC-66/67/31 under SP-05.1–05.4 / PLAN-01 Month 2 / M-03. Workspace0.2.16, CONTRACT-01 v0.25.5, API-05 v0.23.6, DATA-04 v0.16.6, Proposed ADR-0031 v0.2 / ADR index0.7, canonical SP-05 v0.7.6 / IMPL-SP-05 v0.4 and TEST-08 v0.24.6 / coverage0.11.5 / verification0.12.5 navigate actual selected Could runtime work.012 plus additive013 preserve independent private rights and provenance without direct runtime audit read. WORKSPACE-SPRINTS-01 v0.2 documents reproduction and rollback limits. SP05-C09 v0.2 records its bounded companion amendment. Current statuses/results belong only to the owning plan and source-bound SP05-COULD-RUNTIME-01 v0.1; prepared SP05-COULD-REVIEW-01 v0.1 is not independent execution. Existing200 Sprint/Could priorities and historical evidence remain unchanged; no commit/push, production upgrade, accepted ADR change or owner milestone/release acceptance.

[SP05-COULD-RUNTIME-01 v0.1](features/sp-05-sprint-lifecycle/verification/could-runtime-result.md) records final author379/379 Workspace,5/5 Edge,19/19 foundation,20/20 prototype and92/92 structural plus build/typecheck/metadata. Prepared SP05-COULD-REVIEW-01 v0.1 remains unexecuted; current status belongs only to FEAT-SP05-01.

## PUB03 selected Could acceptance/publication — 7 November 2026

FEAT-SP05-01/entry v0.14 registers SP05-PUB03 v0.1, SP05-COULD-REVIEW-DISPOSITION-01 v0.1 and current author result/review assignment v0.2 under SP-05 / PLAN-01 Month2/M-03. Owner explicitly accepted selected Could and requested PR then SP-06. Exact supplied reviewer text/checks are preserved, with independent PG/Edge blocked/unrun distinct from author379/5. Bounded runner resource-probe and immutable capture-destination corrections are verified separately. Publication authority includes necessary agent commit/normal push/one PR, not main merge, production migration, accepted ADR change, independent runtime fabrication or M03/release acceptance. Actual PR/head belongs to the owning plan/publication receipt after creation; SP-06 is separate.

## Selected Could publication result — 7 November 2026

FEAT-SP05-01/entry v0.15 and [SP05-PUB03-RESULT-01 v0.1](features/sp-05-sprint-lifecycle/verification/could-publication-receipt.md) record exact426-file commit8fa597c, normal push and ready PR #3 to main under owner acceptance. Only the owning plan stores task status. SP-05 / PLAN-01 Month2/M-03; original author/reviewer runtime limits preserved. SP-06 continuation is separate; no merge or M03/release acceptance.

## SP-06 planning registration — 7 November 2026

[FEAT-SP06-01 v0.1](features/sp-06-document-access/plan.md), [FEAT-SP06-ENTRY v0.1](features/sp-06-document-access/README.md), [SP06-WBS-01 v0.1](features/sp-06-document-access/breakdown.md), SP06-P00–P14 v0.1 and SP06-DECISION-BATCH-01 / SP06-SOURCE-MAP-01 v0.1 register the owner-requested planning-only continuation. Parent PLAN-01 Month2 / M-04 / SP-06.1–06.4 with SP-11.1 capture; FR/AC-04/10/14/50/51/52, supporting31/39/59/68, BR-01/04/10/11/14, SC-06. Mutable task state belongs only to the plan. D-03/D-04/D-07 bounded owner choices and coordinated canonical path amendment precede dependent code. Optional import/metadata, SP07 lifecycle and AI excluded; no runtime/ADR acceptance, SP06 publication or master-milestone closure. Local stacked branch starts at published SP05 PR #3 head8031503, not merged main.


## SP06 first-task B01 continuation — 7 November 2026

FEAT-SP06-01 / entry / SP06-WBS-01 / SP06-DECISION-BATCH-01 v0.2 and parent briefs P01/P02/P04 v0.2 register P01-A/B/C and P02-A v0.1. Owner explicitly selected B01 private internal project document-create provisioning, then authorised first ready task on codex/sp-06-document-access. P01-A receives that decision; B03 is discussed before guarded transport, B02 before document projections/access UI. P02-A aligns selected B01 sources independently. Exact owner receipt and SP06-P01A-RESULT-01 v0.1 belong to the owning feature; the plan alone owns mutable state. Parent SP-06.1 / PLAN-01 Month2 / M-04, FR/AC-10 and supporting04/31/39/59/68, BR-01/04/10/11/14, SC-06. No application/schema/contract/dependency change, whole-ADR adoption, runtime pass, publication or milestone acceptance.


## SP06 P02-A B01 source alignment — 7 November 2026

FEAT-SP06-01/entry/WBS/decision v0.3, P02-A v0.2, P03 parent v0.2, P04 v0.3 and new P03-A v0.1 register selected B01-only source alignment. Canonical SP-06 v0.6.4 / IMPL-SP-06 v0.2, IMPL-DEC-01 v0.15, Proposed ADR-0032 v0.1 / ADR index0.8, TEST-08 v0.24.7 / coverage0.11.6 / verification0.12.6 and spec/task indices0.8.7/0.8 identify exact private knowledge-author scope/014/operator/test paths and planned authority negatives. SP06-P02A-RESULT-01 v0.1 records actual source checks when executed; current state only in plan.md. Parent SP-06.1–06.2 / PLAN-01 Month2 / M-04, FR/AC-10 plus04/31/39/59/68, BR-01/04/10/11/14, SC-06. No public operation/contract/application/schema/dependency edit, accepted ADR change, B02/B03 adoption, runtime pass or publication. P03-A storage is separate from broader document creation storage.

P02-A input-only companion: EVAL-CASES-ENTRY v0.8.4 updates current TEST-08 alias after retained initial lint failure; no evaluation definition/result change.

## SP-05–SP-07 integrated review — 13 November 2026

[REVIEW-SP05-SP07-01 v0.1](features/sp-05-sp-07-review/plan.md) registers source review and disposable regression for PLAN-01 Month 2 / M-03–M-05. The linked plan owns task status and evidence.

## Document safety fix — 13 November 2026

[FIX-DOCUMENT-SAFETY-01 v0.1](features/document-safety-fix/plan.md) registers F01–F06 under M-04/M-05.

## SP-08 linked keyword search — 13 November 2026

[FEAT-SP08-01 v0.2](features/sp-08-linked-keyword-search/plan.md) links the [SP08-WBS-01 breakdown](features/sp-08-linked-keyword-search/breakdown.md) and [SP08-BACKTRACK-01 handoff](../sdlc/reports/SP-08-backtracking-handoff-2026-11-13.md) under PLAN-01 Month 2 / M-05.

## SP-09 fixture increment — 13 November 2026

[FEAT-SP09-01 v0.5](features/sp-09-cited-question/plan.md) links the [SP09-WBS-01 v0.2 breakdown](features/sp-09-cited-question/breakdown.md), the [SP09-FIXTURE-RESULT-01 handoff](../sdlc/reports/SP-09-fixture-handoff-2026-11-13.md) and [V01 targeted verification](features/sp-09-cited-question/tasks/V01-targeted-verification.md) for M-06.

## SP-10 current work questions

[FEAT-SP10-01 v0.1](features/sp-10-current-work-question/plan.md) and its [breakdown](features/sp-10-current-work-question/breakdown.md) register P00–P05 under M-06.

## Conventional Commits tooling — 14 November 2026

[DEV-COMMITS-01 v0.1](features/conventional-commits/plan.md), entry and CC-01/CC-02 v0.1 are registered for local repository tooling. AGENTS v1.17 and development rules v1.15 record the convention. IMPL-FEATURES-01 v0.73, IMPL-REG-01 v0.78 and IMPL-ROADMAP-01 v0.65 provide parent registration; DOC-REVIEW-REG-01 v0.79 syncs linked inputs only. The plan owns actual verification; no application acceptance.
