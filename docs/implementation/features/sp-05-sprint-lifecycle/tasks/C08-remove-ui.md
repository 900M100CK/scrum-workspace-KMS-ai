# SP05-C08 — Expose single-item unfinished allocation removal

**Artifact ID:** SP05-C08\
**Version/date:** 0.1 Draft · 5 November 2026

Parent [FEAT-SP05-01](../plan.md) owns the only mutable execution status. Source versions and owner choices: [Could decisions](../could-decisions.md). Parent roadmap: PLAN-01 Month 2 / M-03; canonical SP-05 / SP-05.1–05.4. Trace: FR-67; AC-67; BR-01/02/03/10/11/14; SC-03/04/06.

## Prerequisites and allowed paths

Dependencies: C07. Definition of ready: dependencies have their required evidence and source support is aligned before changing a producer. Allowed paths: apps/web/src/SprintWorkspace.tsx and existing Sprint UI modules/styles only as necessary; tests/workspace real HTTPS DOM fixtures/tests; owning evidence. No other service writes, applied migration edits, accepted ADR changes, dependency additions or unrelated cleanup.

## Deliverable and steps

Add a labelled per-current-item remove control only for todo/in_progress in Planned/Active when removal discovery allows it. Explain return to Backlog/To Do. Present Done as unavailable with reason; do not add bulk removal. Refresh Sprint/items/Task/Backlog after confirmed mutation.

## Acceptance assertions

Returned association history stays distinct from current Task state/location; Done or Completed cannot be removed through UI. Server task_already_done is explained when state changes after display. Reload/unknown, revoked permission, conflict and fresh-client reads reflect actual state without automatic new-key retry.

Producer tests ship with their producer; C09 consolidates races rather than postponing permission/revision/replay/rollback coverage.

## Verification and handoff

Planned checks: Real PG012 HTTPS DOM permission/state/history and reload-recovery cases; existing allocation and reorder UI regression. Use explicit Node 24+, disposable PostgreSQL and existing local TLS/browser setup where required; never migrate valuable data. New fixtures explicitly select 012; keep historical 006/008/009/010/011 ceilings.

Record actual argv, versions, source identity, exit codes and raw logs under a fresh ../evidence/could-<run-id>/; report results through the parent plan and eventual Could handoff. These checks are planned, not executed by this brief. Never substitute structural checks or author execution for independent runtime verification.

Recovery: preserve user work and immutable evidence; revert only task-authored changes or use the tested empty disposable rollback. On a failing assertion, retain the failure and leave the task open. No commit/push/merge, reviewer dispatch or owner acceptance is granted by this brief. Effort: relative M, medium confidence; no calendar promise.
