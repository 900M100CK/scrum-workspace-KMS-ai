# SP05-C06 — Persist exact PATCH and DELETE recovery identities

**Artifact ID:** SP05-C06\
**Version/date:** 0.1 Draft · 5 November 2026

Parent [FEAT-SP05-01](../plan.md) owns the only mutable execution status. Source versions and owner choices: [Could decisions](../could-decisions.md). Parent roadmap: PLAN-01 Month 2 / M-03; canonical SP-05 / SP-05.1–05.4. Trace: FR-66/67; SC-03/04; BR-01/02/03/10/11/14; SC-03/04/06.

## Prerequisites and allowed paths

Dependencies: C05. Definition of ready: dependencies have their required evidence and source support is aligned before changing a producer. Allowed paths: apps/web/src/sprints.ts and shared Sprint transport/types only as needed; tests/workspace/sprint-controller.test.mjs; owning evidence. No other service writes, applied migration edits, accepted ADR changes, dependency additions or unrelated cleanup.

## Deliverable and steps

Extend known-operation transport to PATCH JSON and bodyless DELETE with the original revision header. Introduce versioned recovery v2 with validated operation-specific fields; migrate valid v1 records preserving exact existing keys/bodies/queued-allocation semantics. Persist before sending.

## Acceptance assertions

Reload retries original method/resource/key/body or DELETE header, never a new revision/key for unknown outcomes. Invalid/foreign recovery cannot send. Storage failure prevents mutation; access loss clears protected display; signout clears both versions. Existing allocation/reorder recovery still passes.

Producer tests ship with their producer; C09 consolidates races rather than postponing permission/revision/replay/rollback coverage.

## Verification and handoff

Planned checks: Pure Node controller tests: v1 migration, PATCH/DELETE unknown reload, tampering, storage failure, denial, conflict and original allocation/reorder regression. Use explicit Node 24+, disposable PostgreSQL and existing local TLS/browser setup where required; never migrate valuable data. New fixtures explicitly select 012; keep historical 006/008/009/010/011 ceilings.

Record actual argv, versions, source identity, exit codes and raw logs under a fresh ../evidence/could-<run-id>/; report results through the parent plan and eventual Could handoff. These checks are planned, not executed by this brief. Never substitute structural checks or author execution for independent runtime verification.

Recovery: preserve user work and immutable evidence; revert only task-authored changes or use the tested empty disposable rollback. On a failing assertion, retain the failure and leave the task open. No commit/push/merge, reviewer dispatch or owner acceptance is granted by this brief. Effort: relative M, medium confidence; no calendar promise.
