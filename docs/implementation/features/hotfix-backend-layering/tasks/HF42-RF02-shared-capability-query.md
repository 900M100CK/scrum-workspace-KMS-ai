# HF42-RF02 handoff draft — Share the existing project capability predicate

**Artifact ID:** HF42-RF02\
**Version/date:** 0.2 Executable brief · 4 November 2026\
**Kind:** Owner-authorised hotfix follow-up; sequential execution

Parent and sole execution/status authority: [hotfix plan](../plan.md#owner-authorised-rf01rf05-execution--4-november-2026), v0.6. The owner requested sequential execution on this hotfix branch. RF01 reconciles the existing committed SP-04 checkpoint as source/regression baseline without switching refs or overwriting dirty work. No adoption into the SP-04 plan is required; this instruction supersedes every draft SP-04-ownership statement below. Exact baseline/support/new code paths, real test commands/ceilings, recovery and exclusions are registered in the parent execution gate. Original draft wording remains planning provenance where not explicitly amended.

Trace: PLAN-01 Month1 / roadmap M-02–M-03 / SP-04.2–04.4, FR-09/40/43/44 and supporting FR-03/31/59/68; BR-01/02/10/11/14; applicable TC-07/08/14/16/18/19/22. A helper is an implementation reuse task, not a new permission policy. Current identity, Project/Task read scope, exact action, lock order, revision/replay, atomic audit/outcome and durable denial semantics remain binding. No Knowledge writes, new dependency/schema/operation, valuable-data migration, accepted ADR edit, automatic commit/push/merge or independent approval.

## Prerequisite and one outcome

RF01 reconciled and registered on this hotfix branch.

One outcome: a shared hasCapability lookup replaces only identical project-scoped SQL predicates. Use the existing PoolClient inside the caller transaction; preserve project_id, subject_id, resource_kind=project, resource_id=project_id, exact action, valid flag and LIMIT1 semantics. Keep current projectAccess/member checks and action-specific errors in their existing callers. Database failures propagate to existing generic503; do not catch errors as false/allow. Keep batch actions-discovery queries and private grant/provenance tooling unchanged; avoid N+1 lookups or a generic permission framework.

## Closed future scope

Allowed future code: new services/workspace/src/projects/capabilities.ts; only matching predicate calls/imports in services/workspace/src/projects/store.ts and services/workspace/src/tasks/store.ts. New tests/workspace/project-capabilities.test.mjs and owning hotfix evidence/status/runbook. No runner/cursor/discovery/HTTP schema/migration changes.

## Acceptance, verification and handoff

DoD: exact SQL and pre/post ordering retained; explicit grant/invalidated grant/wrong project/subject/action, role-only and create-only cases behave identically; current nonmember resource checks conceal existence before action checks; real DB failure is generic503 through actual handlers. Planned commands: Node24 --test --test-concurrency=1 tests/workspace/project-capabilities.test.mjs plus current Task authority/edit/state/assignment/blocker and project HTTP/authority regressions selected in RF01; npm run typecheck --workspace @sacw/workspace. New helper suite explicitly uses disposable010. Historical project008 and Task009 suites keep their original ceilings. Keep negatives with the helper producer. Handoff RF03 after affected checks pass; rollback only helper/caller changes against frozen sources.

All listed test commands are planned, not newly executed or credited by this breakdown. Estimate: one bounded reviewable outcome; no duration/capacity commitment is supplied before RF01 reconciliation. Recover only this task's scoped changes; never alter valuable data, frozen evidence or unrelated edits. Actual results/status belong only to the parent hotfix execution table; earlier draft adoption instructions are superseded.
