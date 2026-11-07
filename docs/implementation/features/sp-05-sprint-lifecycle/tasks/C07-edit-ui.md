# SP05-C07 — Expose accessible Planned Sprint editing

**Artifact ID:** SP05-C07\
**Version/date:** 0.1 Draft · 5 November 2026

Parent [FEAT-SP05-01](../plan.md) owns the only mutable execution status. Source versions and owner choices: [Could decisions](../could-decisions.md). Parent roadmap: PLAN-01 Month 2 / M-03; canonical SP-05 / SP-05.1–05.4. Trace: FR-66; AC-66; BR-01/02/03/10/11/14; SC-03/04/06.

## Prerequisites and allowed paths

Dependencies: C06. Definition of ready: dependencies have their required evidence and source support is aligned before changing a producer. Allowed paths: apps/web/src/SprintWorkspace.tsx and existing Sprint UI modules/styles only as necessary; tests/workspace real HTTPS DOM fixtures/tests; owning evidence. No other service writes, applied migration edits, accepted ADR changes, dependency additions or unrelated cleanup.

## Deliverable and steps

Reuse current form design and labels, prefill selected Planned goal/dates, offer save/cancel, and respect discovered edit permission. Lock writes during pending outcomes. Reload current data after success or conflict; receipt is historical confirmation only.

## Acceptance assertions

Keyboard/focus and invalid-date handling work; Active/Completed cannot be edited. Denial/outage withholds protected content; unknown result is visible and reconciled exactly; 409 never automatically resubmits with a new key. Existing lifecycle UI remains operational.

Producer tests ship with their producer; C09 consolidates races rather than postponing permission/revision/replay/rollback coverage.

## Verification and handoff

Planned checks: Real PG012 + HTTPS DOM edit cases and focused controller regression; browser acceptance follows C10. Use explicit Node 24+, disposable PostgreSQL and existing local TLS/browser setup where required; never migrate valuable data. New fixtures explicitly select 012; keep historical 006/008/009/010/011 ceilings.

Record actual argv, versions, source identity, exit codes and raw logs under a fresh ../evidence/could-<run-id>/; report results through the parent plan and eventual Could handoff. These checks are planned, not executed by this brief. Never substitute structural checks or author execution for independent runtime verification.

Recovery: preserve user work and immutable evidence; revert only task-authored changes or use the tested empty disposable rollback. On a failing assertion, retain the failure and leave the task open. No commit/push/merge, reviewer dispatch or owner acceptance is granted by this brief. Effort: relative M, medium confidence; no calendar promise.
