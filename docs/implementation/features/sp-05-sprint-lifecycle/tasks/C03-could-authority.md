# SP05-C03 — Provision two independent capabilities and gate discovery

**Artifact ID:** SP05-C03\
**Version/date:** 0.1 Draft · 5 November 2026

Parent [FEAT-SP05-01](../plan.md) owns the only mutable execution status. Source versions and owner choices: [Could decisions](../could-decisions.md). Parent roadmap: PLAN-01 Month 2 / M-03; canonical SP-05 / SP-05.1–05.4. Trace: FR-66/67/31; BR-02; SC-03; BR-01/02/03/10/11/14; SC-03/04/06.

## Prerequisites and allowed paths

Dependencies: C02. Definition of ready: dependencies have their required evidence and source support is aligned before changing a producer. Allowed paths: services/workspace/src/projects and sprints authority/operator/discovery modules; Workspace private provisioning guide; tests/workspace authority/security tests; owning evidence. No other service writes, applied migration edits, accepted ADR changes, dependency additions or unrelated cleanup.

## Deliverable and steps

Add sprint-edit and sprint-deallocate to private audited provisioning. Gate action discovery on registered handlers and lifecycle; edit Planned only, removal Planned/Active. A Sprint-level removal action never promises that a specific Task is removable.

## Acceptance assertions

Each capability works independently; role/create/allocate grants imply neither new right; revoke, membership removal and rejoin deny correctly. Unimplemented routes are never advertised; hidden resources retain generic denial.

Producer tests ship with their producer; C09 consolidates races rather than postponing permission/revision/replay/rollback coverage.

## Verification and handoff

Planned checks: Focused actual operator/DB/handler authority tests including unavailable authority and revoked grants; discovery assertions. Use explicit Node 24+, disposable PostgreSQL and existing local TLS/browser setup where required; never migrate valuable data. New fixtures explicitly select 012; keep historical 006/008/009/010/011 ceilings.

Record actual argv, versions, source identity, exit codes and raw logs under a fresh ../evidence/could-<run-id>/; report results through the parent plan and eventual Could handoff. These checks are planned, not executed by this brief. Never substitute structural checks or author execution for independent runtime verification.

Recovery: preserve user work and immutable evidence; revert only task-authored changes or use the tested empty disposable rollback. On a failing assertion, retain the failure and leave the task open. No commit/push/merge, reviewer dispatch or owner acceptance is granted by this brief. Effort: relative M, medium confidence; no calendar promise.
