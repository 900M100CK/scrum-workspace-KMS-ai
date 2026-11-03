# SP-03 deliverable breakdown and task dictionary

**Artifact ID:** SP03-WBS-01\
**Version/date:** 0.5 Draft · 2 November 2026\
**Status:** Deliverable/task structure; execution status belongs only to [plan](plan.md).\
**Inputs:** [FEAT-SP03-01](plan.md) v0.5; frozen canonical spec/pack/source identities in that plan.\
**Trace:** FR-05 / AC-05; supporting FR-03/31/59; FR-50 is contextual document classification only, BR-01/02/10/11/14; UC-03 main/EX-01/EX-02, SC-01 subset.

## Parent and decomposition

This WBS refines PLAN-01 Month 1 / M-02 and the existing SP-03.1–SP-03.4 pack, not the whole project schedule. Level 1 is the SP-03 deliverable; Level 2 groups documentation control, source/design, owned creation, operational UI/reads and evidence; leaves below each name an observable output. Each leaf has exactly one task brief. Task briefs provide its full dictionary (objective, scope, path ownership, prerequisites, assertions, checks, risk, estimate and rollback).

| Work package | Reviewable deliverable | Task dictionary | Canonical child | Dependencies | Rough estimate |
| --- | --- | --- | --- | --- | --- |
| SP03-WP01D | Registered plan and workflow adaptation | [SP03-D01](tasks/SP03-D01-plan-and-workflow.md) | Planning publication | None | 2–4 h |
| SP03-WP02D | Selected and verified GitHub planning branch | [SP03-D02](tasks/SP03-D02-verify-and-publish.md) | Planning publication | D01 (finish-to-start) | 1–2 h |
| SP03-WP01P | Source and AC/permission/test reconciliation | [SP03-P01](tasks/SP03-P01-source-reconciliation.md) | SP-03.1 | Published plan; SP-02 evidence (finish-to-start) | 1–2 h |
| SP03-WP02P | Bounded task authority, persistence and read design | [SP03-P02](tasks/SP03-P02-bounded-design.md) | SP-03.1 | P01 (finish-to-start); owner dispositions for material policy choices | 2–4 h |
| SP03-WP03P | Owned task foundation (aggregation parent, no duplicate execution) | [SP03-P03](tasks/SP03-P03-owned-persistence.md) | SP-03.2 | Selected child evidence | 4–8 h aggregate |
| SP03-WP03A | Task contract/data/spec support | [SP03-P03A](tasks/SP03-P03A-contract-support.md) | SP-03.2 | P02 draft, Q-02, next-task authorization | 1–2 h |
| SP03-WP03B | Additive 009 and typed original outcomes | [SP03-P03B](tasks/SP03-P03B-task-storage-outcomes.md) | SP-03.2 | P03A, Q-03 and selected timestamp branch | 2–4 h |
| SP03-WP03C | Private audited author provisioning | [SP03-P03C](tasks/SP03-P03C-author-provisioning.md) | SP-03.2 | P03B, owner-selected Q-01 | 1–2 h |
| SP03-WP04P | Authorized atomic createTask and exact reconciliation | [SP03-P04](tasks/SP03-P04-create-task.md) | SP-03.2 | P03; resolved G-04 (finish-to-start) | 2–4 h |
| SP03-WP05P | Current-scoped task list/detail projections | [SP03-P05](tasks/SP03-P05-task-reads.md) | SP-03.3 | P02/P03/P04 and G-03 (finish-to-start) | 2–4 h |
| SP03-WP06P | Server-backed create/list/detail UI and recovery | [SP03-P06](tasks/SP03-P06-task-ui.md) | SP-03.3 | P04/P05 and selected action discovery (finish-to-start) | 2–4 h |
| SP03-WP07P | Controlled task creation failure and race evidence | [SP03-P07](tasks/SP03-P07-permission-failure-races.md) | SP-03.4 | P03/P04/P05 (start-to-start; finish-to-finish before producer verification closes) | 2–4 h |
| SP03-WP08P | DOM and separate actual-browser task observations | [SP03-P08](tasks/SP03-P08-ui-browser-evidence.md) | SP-03.4 | P06 plus installed runner/TLS fixture (finish-to-start) | 2–4 h |
| SP03-WP09P | Integrated SP-03 acceptance trace and handoff | [SP03-P09](tasks/SP03-P09-regression-handoff.md) | SP-03.4 | P03–P08 and G-05 (finish-to-start) | 2–4 h |

## Dependency order and integration

Documentation control: D01 → D02. Future feature path: P01 → P02 → P03A → P03B → P03C → P04 → P05 → P06 → P08 → P09. P03 is a non-executable aggregation parent. P07 starts alongside P03–P05 and finishes before their verification closes; it is a cross-producer integration barrier, not an excuse to defer audit/permission/rollback negatives. G-01–G-05 in the parent are prerequisite decisions. Once ready, actual work is sequential; this graph grants no parallel-agent authority. No calendar critical-path duration is claimed while owner decisions/environment prerequisites remain unresolved.

Cross-cutting SP-11 capture is co-delivered in P03/P04 and verified by P07/P09. State/revision/Backlog generation, exact-key replay and no-disclosure checks stay with each producer. P06/P08 handle real reload/recovery/denied UI. No Sprint, task update/reorder, Knowledge or AI work is pulled into this feature. Existing full-scenario D-07/SC-06 and SP02-F01 limits remain open.

## Coverage and estimate reconciliation

The parent's acceptance table maps every applicable Must AC-05 positive/validation/denied/persistence/fresh-read assertion to a producer plus verification task. Type/field tests alone do not establish permission or atomicity. P03/P04 do not close without their real-state safety tests; P05 requires current-scope/paging failures; P06/P08 require fresh UI reconstruction. P09 integrates all producers and prior session/project regressions.

Original budget: P01 1–2 h and P02–P09 2–4 h each, 17–34 h. P02 now replaces P03 2–4 h with P03A 1–2 / P03B 2–4 / P03C 1–2 h, giving 19–38 h without double-counting the aggregate. D01/D02 publication control: 3–6 h separately. These are low-confidence engineering estimates except P01's medium confidence, based on existing patterns and known unimplemented mechanisms. They are not measurements or a changed master calendar. Re-estimate after P02; split any leaf with more than one reviewable deliverable or more than four estimated hours before starting it. Do not drop its Must assertions to meet an estimate. No staffing/budget/resource capacity is invented.

## Task contract and change control

Each brief is the WBS dictionary for one deliverable and includes the source-backed outcome, allowed existing/planned paths, FR/AC/BR/SC, dependency/gate, exact existing/planned commands, acceptance and DoR/DoD, estimate/confidence/basis, risk/rollback, guardrails and handoff. A readiness/status field redirects to the parent table instead of duplicating mutable state. Task IDs remain stable; splits keep the original parent and register new child IDs before execution. No in-scope card is silently removed; supersession needs a pointer.

Template adaptation: TaskBreakdown_ISO_21511_Prompt.md v2.0 supplies deliverable/WBS/card information. The owner-approved project layout replaces template examples: breakdown.md = WBS/dictionary, the authoritative plan table = task index, tasks/ = task cards. There is no second mutable INDEX. All cards are English, and proposed paths are marked planned. Standards/workbook certification and independent review are Not run; do not invent checklist scores, US IDs, people, dates or approvals.

Checklist author self-check: each leaf has one linked brief; parent mapping, dependencies, estimate roll-up, source trace and negative coverage are explicit. Actual navigation/template/source/check evidence is captured by D02 in the parent. Implementation Not started until the corresponding parent row is ready under actual authorization.

## P02 refinement and pending choices

Fourteen task briefs now exist, including the P03 aggregate and its three executable child leaves. Only the parent plan owns statuses. Decision-batch Q-01 is owner-selected; Q-02/Q-03 remain pending and no runtime child is executed. New briefs are v0.1, amended P03–P09 briefs v0.2. Shared support scopes and numeric bookmark traversal are frozen in Proposed ADR-0027/decision batch; earlier vague wildcard/provisional path examples yield to these concrete amendments. No requirement, Must coverage or historical evidence is removed.
