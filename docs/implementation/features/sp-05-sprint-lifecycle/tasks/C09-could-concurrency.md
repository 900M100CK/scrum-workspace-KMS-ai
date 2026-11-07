# SP05-C09 — Verify actual handler races and atomicity

**Artifact ID:** SP05-C09\
**Version/date:** 0.2 Draft · 6 November 2026

Parent [FEAT-SP05-01](../plan.md) owns the only mutable execution status. Source versions and owner choices: [Could decisions](../could-decisions.md). Parent roadmap: PLAN-01 Month 2 / M-03; canonical SP-05 / SP-05.1–05.4. Trace: FR-66/67/31 plus FR-07/08/41/42; SP04-P08 regression; BR-01/02/03/10/11/14; SC-03/04/06.

## Prerequisites and allowed paths

Dependencies: C08. Definition of ready: dependencies have their required evidence and source support is aligned before changing a producer. Allowed paths: tests/workspace Sprint/Task actual-handler concurrency/security tests and fixtures; owning evidence. Production fixes require a recorded task-specific amendment before changing producer paths. No other service writes, applied migration edits, accepted ADR changes, dependency additions or unrelated cleanup.

## Deliverable and steps

Use deterministic lock/barrier schedules, not sleeps, for edit/start, remove/complete, remove/Task-state, remove/reallocate and remove/reorder; exercise both meaningful commit orders. Recheck expiry/revocation after waits and exact lost COMMIT reconciliation.

## Acceptance assertions

Done-first rejects removal; remove-first returns todo and completion excludes the returned association. No double current allocation, changed Completed history, partial audit/receipt or stale Backlog reorder write. Reopen after completion and subsequent allocation preserve prior Sprint history.

Producer tests ship with their producer; C09 consolidates races rather than postponing permission/revision/replay/rollback coverage.

## Verification and handoff

Planned checks: Focused real PG012 concurrency/security suites with retained commands, source digests, failing logs and exit codes. Use explicit Node 24+, disposable PostgreSQL and existing local TLS/browser setup where required; never migrate valuable data. New fixtures explicitly select 012; keep historical 006/008/009/010/011 ceilings.

Record actual argv, versions, source identity, exit codes and raw logs under a fresh ../evidence/could-<run-id>/; report results through the parent plan and eventual Could handoff. These checks are planned, not executed by this brief. Never substitute structural checks or author execution for independent runtime verification.

Recovery: preserve user work and immutable evidence; revert only task-authored changes or use the tested empty disposable rollback. On a failing assertion, retain the failure and leave the task open. No commit/push/merge, reviewer dispatch or owner acceptance is granted by this brief. Effort: relative M, medium confidence; no calendar promise.


Coordinated C09 amendment: additive013 boolean provenance function and authority helper preserve private audit isolation after actual012 direct-read denial; explicit013 current Could fixtures and companion empty reverse/reapply/refusal tests. Parent plan records the automatic-review rejection of removing provenance and this safer correction before edits. Applied001–012 remain unchanged.
