# SP05-C01 — Align business sources and existing API contracts

**Artifact ID:** SP05-C01\
**Version/date:** 0.1 Draft · 5 November 2026

Parent [FEAT-SP05-01](../plan.md) owns the only mutable execution status. Source versions and owner choices: [Could decisions](../could-decisions.md). Parent roadmap: PLAN-01 Month 2 / M-03; canonical SP-05 / SP-05.1–05.4. Trace: FR-66/67/31; AC-66/67/31; UC-05 alternatives 2/3; BR-01/02/03/10/11/14; SC-03/04/06.

## Prerequisites and allowed paths

Dependencies: C00. Definition of ready: dependencies have their required evidence and source support is aligned before changing a producer. Allowed paths: Canonical SP-05 spec and task pack; PRD FR/AC-66/67, UC-05, relevant test-plan/coverage/verification and API/data-design sections; contracts OpenAPI/logical data and catalogue; a new bounded Proposed ADR and ADR index only if required by development rules; feature/registration metadata. No other service writes, applied migration edits, accepted ADR changes, dependency additions or unrelated cleanup.

## Deliverable and steps

Apply the recorded owner limitation to current requirement/AC/use-case rows before producer work. Specify two independent actions, Sprint revision, no-op/replay/error/audit semantics and transport limits. Keep accepted ADRs and baseline unchanged.

## Acceptance assertions

Sources explicitly allow removal only for todo/in_progress in Planned/Active; explain preservation of completed-work attribution/Sprint metrics. Existing PATCH/DELETE remain 200 Sprint; task_already_done is documented as 409 after current access/revision/location checks. No new operation or release-priority promotion.

Producer tests ship with their producer; C09 consolidates races rather than postponing permission/revision/replay/rollback coverage.

## Verification and handoff

Planned checks: Context/docs/contracts/metadata checks; inspect downstream consumers and trace table. Use explicit Node 24+, disposable PostgreSQL and existing local TLS/browser setup where required; never migrate valuable data. New fixtures explicitly select 012; keep historical 006/008/009/010/011 ceilings.

Record actual argv, versions, source identity, exit codes and raw logs under a fresh ../evidence/could-<run-id>/; report results through the parent plan and eventual Could handoff. These checks are planned, not executed by this brief. Never substitute structural checks or author execution for independent runtime verification.

Recovery: preserve user work and immutable evidence; revert only task-authored changes or use the tested empty disposable rollback. On a failing assertion, retain the failure and leave the task open. No commit/push/merge, reviewer dispatch or owner acceptance is granted by this brief. Effort: relative M, medium confidence; no calendar promise.
