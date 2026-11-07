# SP05-C05 — Return an unfinished current allocation to Backlog

**Artifact ID:** SP05-C05\
**Version/date:** 0.1 Draft · 5 November 2026

Parent [FEAT-SP05-01](../plan.md) owns the only mutable execution status. Source versions and owner choices: [Could decisions](../could-decisions.md). Parent roadmap: PLAN-01 Month 2 / M-03; canonical SP-05 / SP-05.1–05.4. Trace: FR-67/31; AC-67/31; UC-05 alternative 2; BR-01/02/03/10/11/14; SC-03/04/06.

## Prerequisites and allowed paths

Dependencies: C04. Definition of ready: dependencies have their required evidence and source support is aligned before changing a producer. Allowed paths: services/workspace/src/sprints; required current Task projection/discovery wiring; tests/workspace Sprint HTTP/storage/security tests; Sprint runbook and owning evidence. No other service writes, applied migration edits, accepted ADR changes, dependency additions or unrelated cleanup.

## Deliverable and steps

Implement bodyless DELETE with positive Sprint X-Expected-Revision. Lock Project then Sprint then Task/current association; validate current scope/location/revision and only todo/in_progress. Mark association Returned, reset Task to todo/Backlog, append numeric max+1, update revisions/generation and record audit/receipt atomically.

## Acceptance assertions

Done yields 409 task_already_done with no writes; Completed Sprint and noncurrent associations reject. Preserve assignee, blockers, unrelated fields and immutable Completed history. Audit records source Sprint, prior Task state/location, resulting Backlog position, actor/key/hash. Original replay is checked before current lifecycle/location rules but after current Task/project/action access; new key after removal conflicts.

Producer tests ship with their producer; C09 consolidates races rather than postponing permission/revision/replay/rollback coverage.

## Verification and handoff

Planned checks: Actual PG012 positive/negative HTTP/rollback/replay tests, numeric positions above JS safe integer, actor isolation and lost acknowledgement. Use explicit Node 24+, disposable PostgreSQL and existing local TLS/browser setup where required; never migrate valuable data. New fixtures explicitly select 012; keep historical 006/008/009/010/011 ceilings.

Record actual argv, versions, source identity, exit codes and raw logs under a fresh ../evidence/could-<run-id>/; report results through the parent plan and eventual Could handoff. These checks are planned, not executed by this brief. Never substitute structural checks or author execution for independent runtime verification.

Recovery: preserve user work and immutable evidence; revert only task-authored changes or use the tested empty disposable rollback. On a failing assertion, retain the failure and leave the task open. No commit/push/merge, reviewer dispatch or owner acceptance is granted by this brief. Effort: relative M, medium confidence; no calendar promise.
