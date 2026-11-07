# SP05-C10 — Verify live HTTPS UI and installed Edge flows

**Artifact ID:** SP05-C10\
**Version/date:** 0.1 Draft · 5 November 2026

Parent [FEAT-SP05-01](../plan.md) owns the only mutable execution status. Source versions and owner choices: [Could decisions](../could-decisions.md). Parent roadmap: PLAN-01 Month 2 / M-03; canonical SP-05 / SP-05.1–05.4. Trace: AC-66/67 plus existing SP-05 Must UI regression; BR-01/02/03/10/11/14; SC-03/04/06.

## Prerequisites and allowed paths

Dependencies: C09. Definition of ready: dependencies have their required evidence and source support is aligned before changing a producer. Allowed paths: tests/workspace browser/HTTPS DOM suites and fixtures; owning evidence/reviewer reproduction guide only. No other service writes, applied migration edits, accepted ADR changes, dependency additions or unrelated cleanup.

## Deliverable and steps

Run the new edit/remove flows through the actual HTTPS Workspace and web app with disposable PG012. Verify keyboard/focus, fresh client, current denial, conflict and pending reload using the installed browser. Record exact runtime/browser/TLS setup without secrets.

## Acceptance assertions

Successful planned edit and unfinished active removal are observable after refresh; Done denial and historical Returned display are correct; recovery preserves key/header/body. Existing create/allocate/start/complete/reorder flows remain usable.

Producer tests ship with their producer; C09 consolidates races rather than postponing permission/revision/replay/rollback coverage.

## Verification and handoff

Planned checks: Real HTTPS DOM suite and isolated installed Edge browser suite; retain source-bound logs and captures. Use explicit Node 24+, disposable PostgreSQL and existing local TLS/browser setup where required; never migrate valuable data. New fixtures explicitly select 012; keep historical 006/008/009/010/011 ceilings.

Record actual argv, versions, source identity, exit codes and raw logs under a fresh ../evidence/could-<run-id>/; report results through the parent plan and eventual Could handoff. These checks are planned, not executed by this brief. Never substitute structural checks or author execution for independent runtime verification.

Recovery: preserve user work and immutable evidence; revert only task-authored changes or use the tested empty disposable rollback. On a failing assertion, retain the failure and leave the task open. No commit/push/merge, reviewer dispatch or owner acceptance is granted by this brief. Effort: relative M, medium confidence; no calendar promise.
