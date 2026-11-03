# SP03-P03C — Private audited backlog-author provisioning

**Artifact ID:** SP03-P03C\
**Version/date:** 0.2 Draft · 2 November 2026\
**Work package:** SP03-WP03C (single executable leaf under SP03-WP03P).\
**Execution status:** Read the [parent plan](../plan.md#authoritative-task-and-execution-table); no independent mutable status.\
**Inputs:** [FEAT-SP03-01](../plan.md) v0.4; [decision batch](../decision-batch.md) v0.2; Proposed [ADR-0027](../../../../adr/0027-task-creation-foundation.md) v0.2; current source identities in P01.\
**Trace:** Child of SP03-P03 / canonical SP-03.2; FR-05/AC-05 and supporting FR-03/31/59, BR-01/02/10/11/14; TC-02/13/18/19 as applicable; PLAN-01 Month 1 / M-02. FR-50 is contextual document-access scope only.

## Objective

Deliver private audited backlog-author provisioning as one reviewable producer slice of the P03 work package.

## Context

P01 identified missing supported author provisioning, project-only outcome shapes and the Task timestamp mismatch. P02 supplies the bounded proposal and exact owner dispositions. [Source: decision-batch sections 1–5; ADR-0027; unchanged canonical SP-03.] Task splitting preserves the owning feature/WBS and all Must/negative coverage; it adds no product requirement.

## Scope

- Use project-scoped backlog-author, expected revision, current enabled account/membership, reason/operator identity and private audit in one owned transaction.
- Use existing clock → target account → project → membership/grant order; extend no public provisioning API or browser permission editor.
- Retain membership removal/rejoin invalidation and last-manager protection only for membership-manage; no role/creator auto-grant or last-author successor rule.

Out of scope: task edit/reorder/assignment/state/Sprint work, Knowledge/provider/AI, unrelated cleanup and any unchecked owner-choice branch. This P02 turn authors the brief only; no task implementation is claimed.

## Inputs and readiness

Read AGENTS, development-rules, pre-flight, workflow, parent plan, this brief, P01 source identities, decision batch, Proposed ADR-0027, existing code/tests and the relevant contract/migration runbook before editing. Dependencies: P03B; owner-selected Q-01 direction; next-task authorization. Source versions, allowed paths, fixture commands and safe recovery must be current. Pending owner choices are not defaults; formal Proposed status alone is not evidence of an implementation pass.

## Files and components touched

- Existing services/workspace/src/projects/operator.ts and cli.ts; only backlog-author type/whitelist and the existing grant/revoke/audit path
- Planned tests/workspace/task-authority.test.mjs
- Existing planned task-fixture.mjs (after P03B); synthetic grants/account/membership/barrier helpers only

Paths marked planned do not exist yet. Closed exceptions to canonical code scope are exactly the support paths above and must be recorded in SP-03 before implementation. Runtime ownership stays Workspace; applied migrations/other-service stores remain read-only. No generic root-command/dependency change is authorized.

## Implementation guidance

Do not change creator defaults, public roles, delegation policy/UI, task data or HTTP handlers. Runtime cannot provision or read private audit. Unknown operator acknowledgement remains unconfirmed and is inspected by the same target/revision/audit before retry.

Follow the exact protocol in ADR-0027: current same-client auth/project/capability; project-before-task ordering; immutable evidence and safe numbers; audit/outcome transaction atomicity; typed guard denial preserves clock-fault latching; unknown COMMIT never becomes rollback certainty or a fresh-key retry. Reuse only small helpers with matching semantics. No new universal transaction/cursor/permission framework.

## Acceptance criteria

1. Correct explicit grant/revoke is co-audited and private; stale revision/disabled/nonmember/audit failure leaves no unauthorised new authority.
2. Role-identical actors differ by real grants; removal clears author capability and rejoin restores none; last author may be revoked without an automatic replacement.
3. Controlled grant/removal races preserve the selected serialized outcome; no future handler/socket proof is inferred.
4. Do not advertise createTask/listTasks before their handlers exist; public advisory discovery belongs to P04/P05 actual operation wiring.

## Verification

Node 24+; exact version/source/fixture identities and failed attempts recorded. Planned test files below become runnable only after authoring. Read storage/TLS/browser guides before any fixture; missing setup is not a passing skip.

- npm run typecheck
- node --test --test-concurrency=1 tests/workspace/task-authority.test.mjs (planned test file)
- npm run test:projects

Producer permission/audit/rollback/migration checks are mandatory here, not deferred to P07. P07 supplies controlled cross-producer schedules and must close before aggregate verification. Context/schema/SQL evidence is labelled separately from HTTP/UI/browser enforcement. No application test is executed by drafting this card.

## Definition of Done

All acceptance assertions have actual evidence; exact defined checks pass or the gate remains failed with preserved diagnostics. Source/path/version and relevant trace/diagram metadata are reconciled without changing old results. Update only the parent task table and registered dated evidence. Independent review is unassigned unless actually obtained; this author does not self-approve.

## Estimate, risks and mitigation

Rough 1–2 engineer-hours, low confidence, derived from the existing foundation plus this split deliverable; not a deadline or measured capacity. Re-estimate after decisions/first evidence and split before execution if a leaf exceeds one reviewable result or four estimated hours. Risk: acting on pending policy or legacy data assumptions. Mitigate through exact owner disposition, preflight refusal, synthetic fixtures and explicit failure boundaries; no deletion to obtain a pass.

## Rollback

Documentation/source-only correction restores only the scoped new delta. For future 009, use the selected empty-compatible down path on disposable data only; retained rows require forward recovery, not a destructive rollback. Private provisioning changes use a new expected-revision audited revoke, never editing an old audit/outcome. No automatic commit/force push or valuable DB reset.

## Dependencies and ordering

P03B; owner-selected Q-01 direction; next-task authorization. The P03 parent aggregates children and is not a second execution of their work. P04/P05 depend on the complete selected persistence/provisioning support; public operation discovery stays coupled to actual handlers. All work remains sequential; no parallel-agent authority.

## Execution guardrails

One authorized task, closed paths, existing packages and synthetic fixtures. No accepted ADR/baseline edit, provider transfer, cross-service write, role bypass, old migration edit, ignored failure or automatic commit/push. Reopen the plan before continuing. Stop only dependent work for a missing material choice or failed required gate; independent authorised preparation may continue.

## Open questions and handoff

Decision batch Q-01/Q-02/Q-03 records actual owner answers. Owner/deadline is the project owner before the affected child starts; no invented calendar date. If an answer changes the proposal, reconcile task paths/assertions first. Result destination: parent evidence and the producer's registered dated report. Handoff states what was actually implemented/measured, which gates remain and the next ready child; no duplicate status table.

## Actual execution disposition

The owner requested completion of all SP-03 tasks; all material directions are selected and P03B prerequisite evidence is in the parent. Earlier P02-only drafting statements above are historical task definition. Current status/results remain solely in the parent plan and its linked actual capture.
