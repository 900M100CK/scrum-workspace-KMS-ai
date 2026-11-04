# HF42-RF04 handoff draft — Reject unexpected null in the existing transaction

**Artifact ID:** HF42-RF04\
**Version/date:** 0.2 Executable brief · 4 November 2026\
**Kind:** Owner-authorised hotfix follow-up; sequential execution

Parent and sole execution/status authority: [hotfix plan](../plan.md#owner-authorised-rf01rf05-execution--4-november-2026), v0.6. The owner requested sequential execution on this hotfix branch. RF01 reconciles the existing committed SP-04 checkpoint as source/regression baseline without switching refs or overwriting dirty work. No adoption into the SP-04 plan is required; this instruction supersedes every draft SP-04-ownership statement below. Exact baseline/support/new code paths, real test commands/ceilings, recovery and exclusions are registered in the parent execution gate. Original draft wording remains planning provenance where not explicitly amended.

Trace: PLAN-01 Month1 / roadmap M-02–M-03 / SP-04.2–04.4, FR-09/40/43/44 and supporting FR-03/31/59/68; BR-01/02/10/11/14; applicable TC-07/08/14/16/18/19/22. A helper is an implementation reuse task, not a new permission policy. Current identity, Project/Task read scope, exact action, lock order, revision/replay, atomic audit/outcome and durable denial semantics remain binding. No Knowledge writes, new dependency/schema/operation, valuable-data migration, accepted ADR edit, automatic commit/push/merge or independent approval.

## Prerequisite and one outcome

RF03 contract recorded and real regression reproduced.

One outcome: the smallest correction inside the existing authenticated transaction: await the callback and reject unexpected null before ownedTransaction sends COMMIT. Preserve recorded-denial commit semantics, initial and final session checks, actor/client context, role validation, timeouts, lock order, unknown COMMIT classification and post-commit denial mapping. Legitimate204 outcome objects whose body is null remain valid; the callback result itself is the guard target. No extraction of transaction runner, cursor logic or permission policy.

## Closed future scope

Allowed future code: services/workspace/src/projects/store.ts authenticated transaction method only; RF03 regression assertions/additional bounded integration in tests/workspace/project-transaction-null.test.mjs; owning hotfix evidence/status/runbook. No services/workspace/src/session/database.ts rewrite, migration/schema/UI/discovery change or generic transaction framework.

## Acceptance, verification and handoff

DoD: RF03 real PostgreSQL suite goes green without weakening its assertions; unexpected null cannot commit attempted business/audit/outcome effects and returns generic503; actual durable clock-fault denial evidence remains committed where produced; valid success/known callback rollback/unknown COMMIT outcomes retain their classification. Run the new suite, current session persistence/lifecycle and affected Project/Task denial/concurrency suites, plus Workspace typecheck/build. Register exact commands first in RF01/RF03. Preserve006 session,008 project,009 creation and010 mutation fixture ceilings; all databases are uniquely named disposable fixtures. Handoff RF05 only after producer-specific negatives pass. Rollback only this guard delta against its before-image.

All listed test commands are planned, not newly executed or credited by this breakdown. Estimate: one bounded reviewable outcome; no duration/capacity commitment is supplied before RF01 reconciliation. Recover only this task's scoped changes; never alter valuable data, frozen evidence or unrelated edits. Actual results/status belong only to the parent hotfix execution table; earlier draft adoption instructions are superseded.
