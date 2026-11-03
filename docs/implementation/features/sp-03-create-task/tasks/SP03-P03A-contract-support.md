# SP03-P03A — Task contract, data and coordinated spec support

**Artifact ID:** SP03-P03A\
**Version/date:** 0.2 Draft · 2 November 2026\
**Work package:** SP03-WP03A (single executable leaf under SP03-WP03P).\
**Execution status:** Read the [parent plan](../plan.md#authoritative-task-and-execution-table); no independent mutable status.\
**Inputs:** [FEAT-SP03-01](../plan.md) v0.4; [decision batch](../decision-batch.md) v0.2; Proposed [ADR-0027](../../../../adr/0027-task-creation-foundation.md) v0.2; current source identities in P01.\
**Trace:** Child of SP03-P03 / canonical SP-03.2; FR-05/AC-05 and supporting FR-03/31/59, BR-01/02/10/11/14; TC-02/13/18/19 as applicable; PLAN-01 Month 1 / M-02. FR-50 is contextual document-access scope only.

## Objective

Deliver task contract, data and coordinated spec support as one reviewable producer slice of the P03 work package.

## Context

P01 identified missing supported author provisioning, project-only outcome shapes and the Task timestamp mismatch. P02 supplies the bounded proposal and exact owner dispositions. [Source: decision-batch sections 1–5; ADR-0027; unchanged canonical SP-03.] Task splitting preserves the owning feature/WBS and all Must/negative coverage; it adds no product requirement.

## Scope

- Apply the owner-selected creation-time/source disposition; recommended branch requires read-only date-time Task.created_at and the corresponding logical field, without adding created_by.
- Declare createTask 413/415 and getTask 400 before handlers emit them; preserve all operations, authority and generic denial shapes.
- Coordinate affected consumers and positive/negative Task/invalid-client-input schema tests. Do not claim a strict-client compatibility pass without evidence.

Out of scope: task edit/reorder/assignment/state/Sprint work, Knowledge/provider/AI, unrelated cleanup and any unchecked owner-choice branch. This P02 turn authors the brief only; no task implementation is claimed.

## Inputs and readiness

Read AGENTS, development-rules, pre-flight, workflow, parent plan, this brief, P01 source identities, decision batch, Proposed ADR-0027, existing code/tests and the relevant contract/migration runbook before editing. Dependencies: P02 draft and owner Q-02 disposition; next task explicitly requested. Source versions, allowed paths, fixture commands and safe recovery must be current. Pending owner choices are not defaults; formal Proposed status alone is not evidence of an implementation pass.

## Files and components touched

- Existing contracts/openapi/workspace.openapi.json, contracts/data-model.json and contracts/README.md
- Existing docs/sdlc/api-design.md and data-design.md; specs/003-create-task.md (record the precise support scope before other shared edits)
- Existing tests/contracts/contract-schemas.test.mjs, tests/context/context.test.mjs and scripts/verify-context.mjs only for meaningful new declared-contract assertions
- Owning feature/task/source/register/version metadata only

Paths marked planned do not exist yet. Closed exceptions to canonical code scope are exactly the support paths above and must be recorded in SP-03 before implementation. Runtime ownership stays Workspace; applied migrations/other-service stores remain read-only. No generic root-command/dependency change is authorized.

## Implementation guidance

No runtime code, migration execution, accepted ADR/BRD/PRD edits, package/lock change, new operation or Task mutation feature. If Q-02 selects a different branch, reconcile the ADR/data/API design first rather than implementing the recommended branch automatically.

Follow the exact protocol in ADR-0027: current same-client auth/project/capability; project-before-task ordering; immutable evidence and safe numbers; audit/outcome transaction atomicity; typed guard denial preserves clock-fault latching; unknown COMMIT never becomes rollback certainty or a fresh-key retry. Reuse only small helpers with matching semantics. No new universal transaction/cursor/permission framework.

## Acceptance criteria

1. Every contract/source edit is preceded by the canonical SP-03 coordinated-path record and source version registration.
2. UC-03 timestamp requirement is preserved by the selected branch or explicitly reconciled under an owner-selected alternative; no silent omission.
3. No new operation, dependency, database mutation, handler or weakened current assertion; context/docs/contracts checks pass.

## Verification

Node 24+; exact version/source/fixture identities and failed attempts recorded. Planned test files below become runnable only after authoring. Read storage/TLS/browser guides before any fixture; missing setup is not a passing skip.

- npm run context:check
- npm run context:test
- npm run docs:lint
- npm run docs:test
- npm run contracts:test

Producer permission/audit/rollback/migration checks are mandatory here, not deferred to P07. P07 supplies controlled cross-producer schedules and must close before aggregate verification. Context/schema/SQL evidence is labelled separately from HTTP/UI/browser enforcement. No application test is executed by drafting this card.

## Definition of Done

All acceptance assertions have actual evidence; exact defined checks pass or the gate remains failed with preserved diagnostics. Source/path/version and relevant trace/diagram metadata are reconciled without changing old results. Update only the parent task table and registered dated evidence. Independent review is unassigned unless actually obtained; this author does not self-approve.

## Estimate, risks and mitigation

Rough 1–2 engineer-hours, low confidence, derived from the existing foundation plus this split deliverable; not a deadline or measured capacity. Re-estimate after decisions/first evidence and split before execution if a leaf exceeds one reviewable result or four estimated hours. Risk: acting on pending policy or legacy data assumptions. Mitigate through exact owner disposition, preflight refusal, synthetic fixtures and explicit failure boundaries; no deletion to obtain a pass.

## Rollback

Documentation/source-only correction restores only the scoped new delta. For future 009, use the selected empty-compatible down path on disposable data only; retained rows require forward recovery, not a destructive rollback. Private provisioning changes use a new expected-revision audited revoke, never editing an old audit/outcome. No automatic commit/force push or valuable DB reset.

## Dependencies and ordering

P02 draft and owner Q-02 disposition; next task explicitly requested. The P03 parent aggregates children and is not a second execution of their work. P04/P05 depend on the complete selected persistence/provisioning support; public operation discovery stays coupled to actual handlers. All work remains sequential; no parallel-agent authority.

## Execution guardrails

One authorized task, closed paths, existing packages and synthetic fixtures. No accepted ADR/baseline edit, provider transfer, cross-service write, role bypass, old migration edit, ignored failure or automatic commit/push. Reopen the plan before continuing. Stop only dependent work for a missing material choice or failed required gate; independent authorised preparation may continue.

## Open questions and handoff

Decision batch Q-01/Q-02/Q-03 records actual owner answers. Owner/deadline is the project owner before the affected child starts; no invented calendar date. If an answer changes the proposal, reconcile task paths/assertions first. Result destination: parent evidence and the producer's registered dated report. Handoff states what was actually implemented/measured, which gates remain and the next ready child; no duplicate status table.
