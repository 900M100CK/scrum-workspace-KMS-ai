# SP-03 bounded implementation and regression handoff

**Artifact ID:** SP03-EXEC-01\
**Version/date:** 0.1.1 Draft · 3 November 2026\
**Status:** Bounded implementation, specified regressions and handoff verified locally. Independent/release acceptance remains open.\
**Historical inputs:** [FEAT-SP03-01](../../implementation/features/sp-03-create-task/plan.md) v0.5; canonical SP-03 v0.8; Workspace v0.2.12; logical model v0.12; Proposed ADR-0027 v0.2.\
**Trace:** FR-05/AC-05, supporting FR-03/31/59, BR-01/02/10/11/14; UC-03 main/EX-01/EX-02; SP-03.1–SP-03.4 / PLAN-01 Month 1 / M-02.

## Result and boundary

An enabled current project member with an explicit private audited backlog-author grant can create one Story/Task/Bug through the actual API/UI. Creation returns a server UUID, immutable server millisecond created_at, todo/null-assignee/unblocked/revision 1 and exact Backlog position. Task, UC-03 backlog-item-create audit and original createTask result commit atomically. Current list/detail reads reconstruct committed state; the UI reloads current data after confirmed original-key recovery.

Roles/creator text grant nothing. Session/member/author checks run in the owned Workspace transaction with clock/account/session/Project ordering and a final session/time guard after waits. Every replay rechecks current access. Database/audit/result faults roll back together; an unknown COMMIT remains unknown and reconciles only the original key. Original title/description/result is retained indefinitely under the owner's explicit choice. Task-specific source/socket exclusion is not claimed beyond the measured database decision boundary.

See [operations and setup](../../../services/workspace/TASKS.md), [UI evidence](SP-03-2026-11-02-ui.md), [command capture](../../implementation/features/sp-03-create-task/evidence/p09-checks.json), [immutable attempt logs](../../implementation/features/sp-03-create-task/evidence/p09-logs.zip), [current source hashes](../../implementation/features/sp-03-create-task/evidence/source-inputs.json) and [preservation audit](../../implementation/features/sp-03-create-task/evidence/p09-preservation.json).

## Actual final checks

| Command/boundary | Result |
| --- | --- |
| npm run typecheck / build | Passed with Node 24.21.0; current visual correction included |
| context:lint / context:check / context:test | Passed; 45/45 structural/harness tests, zero skips |
| docs:lint / docs:test | Passed in P09; 20/20 structural/diagram tests; final paper/link closure recorded below |
| contracts:test | 27/27, zero skips; shape/reference checks, separate from permission evidence |
| test:projects | 66/66, zero skips; current SP-02 SQL/HTTP/controller/DOM regression |
| test:session:storage / http / lifecycle / ui | 17/17 + 15/15 + 18/18 + 10/10 = 60/60, zero skips |
| test:foundation with existing TLS variables | Web 9/9, Workspace 7/7, Knowledge 3/3 = 19/19, zero skips; foundation evidence only |
| Explicit Task storage/authority/HTTP/reads/concurrency/controller/DOM command | 66/66, zero skips; includes actual 009 persistence/permission/failure boundaries |
| Separate actual Task Edge command | 1/1, zero skips; current extended 390px long-title and normal flow |

The exact commands, timestamps/durations and source identities are in the capture. The Task command lists task-storage, task-authority, task-http, task-reads, task-concurrency, task-ui-controller and task-ui explicitly with test concurrency 1. Browser runs separately with the installed runner and existing trusted local certificate. Each attempt has its own logs; later success never replaces an earlier failure.

Session fixtures retain schema 006, project fixtures 007/008 and new Task fixtures explicitly select 009 (008 only to prepare legacy-refusal tests). All databases/volumes are uniquely identified synthetic disposable fixtures. Existing installation was reused; no clean-install claim. The active branch is codex/sp-03-create-task at d6b8caf241603cdff4f9b7a2a491fc4e2e386453; the runtime changes remain uncommitted locally. The earlier GitHub planning publication is unchanged, not a publication of this new code.

## AC/use-case and child trace

| Required outcome | Actual proving assertions and producer |
| --- | --- |
| AC-05 supported content persists | P04 tests all three types, server IDs/time/project and initial board/location/revision; P08 actual create/reload/current details; P09 fresh complete Task command |
| AC-05 invalid type/content rejected without an item | P04 strict invalid/blank/type/extra identity/media/size cases compare Task/generation/audit/result state before/after |
| AC-05 unauthorised/foreign creation rejected | P03C role-identical explicit grants/private audit; P04 no creator/role bypass and forged-header audit actor; P07 actual grant revoke/removal/account-disable schedules |
| UC-03 main steps 3–5 | Immutable timestamp/storage result and matching backlog-item-create actor/entity/time audit; createTask is the distinct durable operation name; real list/detail/UI reload reconstructs persistence |
| Current read/location/cursor | P05 107-row numeric 2/10/tie/descending-UUID pages, large exact positions, Done Backlog/Sprint/completed, highest blocker sequence, current authority and stale/expired/foreign/missing bookmark/key/DB denial |
| Rollback/replay/unknown outcomes | P03B/P04/P07 malformed immutable result rejection, audit/result/store rollback, one Task per concurrent key, exact COMMIT-loss recovery, current access before replay |
| UI current-state/unknown/denied/reload | P06 controller 9 cases; P08 DOM 7 and real Edge 1; current content is fetched separately from the original receipt, and stale/denied/outage results clear panes |
| SP-03.1 | P01/P02 source/owner directions and P03A schema/spec support |
| SP-03.2 | P03B/P03C/P04 owned storage, private author and atomic API |
| SP-03.3 | P05/P06 current reads and connected create/list/detail UI |
| SP-03.4 | P07/P08/P09 measured integration, browser, regression and this handoff |

Supporting trace is registered in TEST-08 0.24, TEST-COVERAGE-01 0.11 and VERIFY-01 0.12. FR-50 is document classification, not a new Task creation requirement. UC-03 Alt-1/Alt-2/EX-03 editing/reorder remain later packs. This handoff does not close whole SC-01/SC-06, D-07, SP02-F01, provider/Knowledge, deployment/load or independent/release gates.

## Corrections and preserved negative results

P09 source audit aligned the business event with UC-03 backlog-item-create while preserving createTask idempotency identities. Draft 009 down refuses both canonical and previous draft audit aliases. Existing 001–008 are byte-identical; no development upgrade occurred. A stale foundation expectation for the newly registered Task route was replaced with stronger unavailable-body/no-store checks; unknown/internal 404 protection remains.

After the owner pause/continue, Docker was stopped, so one additional browser attempt failed before fixture initialization. Readiness was restored and checked. A real 512-character unbroken title then reproduced narrow overflow; only Task-detail heading wrapping was corrected. Current build/Edge includes the new assertion and passes without an artificial title limit, hidden overflow or redesign. Earlier backend/controller/session/project code is unchanged; their results were not relabelled as running the new visual probe.

Earlier P01–P08 captures retain their original source versions, counts, failures and images. P08 report 0.1 is retained as raw text before navigation revision 0.2. Final browser reruns use unique directories; partial failed screenshots remain evidence. The current results do not imply that old captures used later source revisions.

## Handoff and limits

Private explicit author setup and immutable-retention/forward-recovery cautions are in TASKS.md. No API operation, Task edit/Sprint/Knowledge/AI feature, provider, dependency, certificate trust installation, personal browser profile, template gitlink change, commit/push or master milestone completion was added. ADR-0018/0019/0026/0027 retain formal Proposed status where applicable; owner-selected bounded directions and actual verification are recorded separately.

Unrun: fresh dependency install/clean clone, additional browser engines and screen-reader certification, deployment/load/AI/retrieval/evaluation, and independent review. The integrated current Edge flow covers real session/project/Task login/cookie/reload/sign-out, but does not relabel separate historical session/project browser campaigns as newly rerun. The owner may review the local diff and operations report; publication is a separate explicit instruction.

Current actual browser environment: Edge 156.0.4314.58, installed Playwright 1.62.1, PostgreSQL 17.10 (Debian 17.10-1.pgdg12+1). [Summary](../../implementation/features/sp-03-create-task/evidence/ui-2026-11-02/runs/run-1793633811450-45d6178b/browser-summary.json), [desktop](../../implementation/features/sp-03-create-task/evidence/ui-2026-11-02/runs/run-1793633811450-45d6178b/task-desktop.png), [mobile](../../implementation/features/sp-03-create-task/evidence/ui-2026-11-02/runs/run-1793633811450-45d6178b/task-mobile.png), [long-title mobile](../../implementation/features/sp-03-create-task/evidence/ui-2026-11-02/runs/run-1793633811450-45d6178b/task-mobile-long-title.png).

## Final completion audit

[Task/requirement audit](../../implementation/features/sp-03-create-task/evidence/completion-audit.json) checks every registered task, required command and bounded AC/UC outcome against actual source and captured results. [Publication boundary](../../implementation/features/sp-03-create-task/evidence/p09-publication-boundary.json) verifies the unchanged earlier planning SHA/gitlink and empty index. Preservation reconstructs metadata-only deltas and confirms unchanged applied migrations/old evidence; 759 initial tracked files are byte-identical. The final local link/anchor/whitespace check is recorded with the audit. No remaining authorized SP-03 implementation task is deferred; broader release/independent/publication limits above remain explicit.
