# SP05-C02 — Add migration 012 for private actions and immutable receipts

**Artifact ID:** SP05-C02\
**Version/date:** 0.1 Draft · 5 November 2026

Parent [FEAT-SP05-01](../plan.md) owns the only mutable execution status. Source versions and owner choices: [Could decisions](../could-decisions.md). Parent roadmap: PLAN-01 Month 2 / M-03; canonical SP-05 / SP-05.1–05.4. Trace: FR-66/67/31; SC-03/04/06; BR-01/02/03/10/11/14; SC-03/04/06.

## Prerequisites and allowed paths

Dependencies: C01. Definition of ready: dependencies have their required evidence and source support is aligned before changing a producer. Allowed paths: services/workspace/migrations/012-* only; Workspace receipt adapters/types; tests/workspace storage fixtures and focused Could storage tests; Sprint runbook; owning evidence. No other service writes, applied migration edits, accepted ADR changes, dependency additions or unrelated cleanup.

## Deliverable and steps

Extend action/provisioning-audit/receipt constraints and immutability for editSprint/removeAllocation using existing typed Sprint outcomes. Supply matching down migration restoring the 011 definitions only when safe. Explicitly opt new fixtures into 012.

## Acceptance assertions

Disposable forward/repeat/empty reverse passes; retained Could grants, provisioning audit, mutation audit or receipts block rollback; original receipts cannot be altered/deleted; transactional failures leave no partial data. Applied 001–011 and historical fixture ceilings remain unchanged.

Producer tests ship with their producer; C09 consolidates races rather than postponing permission/revision/replay/rollback coverage.

## Verification and handoff

Planned checks: Focused real PostgreSQL 012 storage test; existing 011 storage regression; forward/repeat/reverse/refusal logs. Use explicit Node 24+, disposable PostgreSQL and existing local TLS/browser setup where required; never migrate valuable data. New fixtures explicitly select 012; keep historical 006/008/009/010/011 ceilings.

Record actual argv, versions, source identity, exit codes and raw logs under a fresh ../evidence/could-<run-id>/; report results through the parent plan and eventual Could handoff. These checks are planned, not executed by this brief. Never substitute structural checks or author execution for independent runtime verification.

Recovery: preserve user work and immutable evidence; revert only task-authored changes or use the tested empty disposable rollback. On a failing assertion, retain the failure and leave the task open. No commit/push/merge, reviewer dispatch or owner acceptance is granted by this brief. Effort: relative M, medium confidence; no calendar promise.
