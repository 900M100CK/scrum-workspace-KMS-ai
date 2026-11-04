# HF42-RF03 handoff draft — Specify and reproduce unexpected-null failure

**Artifact ID:** HF42-RF03\
**Version/date:** 0.2 Executable brief · 4 November 2026\
**Kind:** Owner-authorised hotfix follow-up; sequential execution

Parent and sole execution/status authority: [hotfix plan](../plan.md#owner-authorised-rf01rf05-execution--4-november-2026), v0.6. The owner requested sequential execution on this hotfix branch. RF01 reconciles the existing committed SP-04 checkpoint as source/regression baseline without switching refs or overwriting dirty work. No adoption into the SP-04 plan is required; this instruction supersedes every draft SP-04-ownership statement below. Exact baseline/support/new code paths, real test commands/ceilings, recovery and exclusions are registered in the parent execution gate. Original draft wording remains planning provenance where not explicitly amended.

Trace: PLAN-01 Month1 / roadmap M-02–M-03 / SP-04.2–04.4, FR-09/40/43/44 and supporting FR-03/31/59/68; BR-01/02/10/11/14; applicable TC-07/08/14/16/18/19/22. A helper is an implementation reuse task, not a new permission policy. Current identity, Project/Task read scope, exact action, lock order, revision/replay, atomic audit/outcome and durable denial semantics remain binding. No Knowledge writes, new dependency/schema/operation, valuable-data migration, accepted ADR edit, automatic commit/push/merge or independent approval.

## Prerequisite and one outcome

RF02 verified; current transaction and denial consumers mapped.

One outcome: a precise unexpected-null contract and a real PostgreSQL regression that exposes the extension risk before its correction. Proposed contract for the future implementation: a callback returning null without a recorded denial is an internal persistence failure, mapped through the existing generic503 access_unavailable response, and throws before COMMIT so its business/audit/outcome effects roll back. A recorded denial retains its existing normal-commit path for any actual clock-fault latch/authentication evidence, then raises the recorded401/503 outside the transaction. Not every expired/denied session produces a fault audit. This planning draft proposes that contract; no runtime behaviour or formal ADR adoption occurs here.

## Closed future scope

Allowed future writes: new tests/workspace/project-transaction-null.test.mjs; owning hotfix brief/evidence and, only within RF01 registered coordinated support, new Proposed ADR-0029 explanation/current source navigation. Do not edit implementation in this test/contract task. No new accepted ADR, wire schema, role policy or runner extraction.

## Acceptance, verification and handoff

DoD: real disposable010 assertions show (a) business effects attempted then unexpected null are rolled back under the intended contract; (b) valid success commits; (c) actual recorded denial/clock fault preserves its required evidence and withholds protected results; (d) thrown callback error rolls back; (e) no sensitive error detail. Run Node24 --test --test-concurrency=1 tests/workspace/project-transaction-null.test.mjs. Retain the expected red result on the uncorrected path as reproduced evidence; do not call it a pass or alter expectations to match a commit. Current source observations alone are not a production incident. Handoff RF04 with the exact failing assertion, selected contract and unchanged old error mapping. Estimate withheld until source reconciliation; this is a single bounded test/contract outcome.

All listed test commands are planned, not newly executed or credited by this breakdown. Estimate: one bounded reviewable outcome; no duration/capacity commitment is supplied before RF01 reconciliation. Recover only this task's scoped changes; never alter valuable data, frozen evidence or unrelated edits. Actual results/status belong only to the parent hotfix execution table; earlier draft adoption instructions are superseded.


RF03 current ADR support: write Proposed ADR0029 for the bounded null-result503/rollback/recorded-denial distinction; existingADR0028 remains byte-identical. Register ADR index/spec support/headers within the parent closed support scope before guard code. New PG test is actual failing reproduction first, not a passed implementation.
