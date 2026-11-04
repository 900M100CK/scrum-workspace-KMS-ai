# SP-04: Update a task without stale overwrite and retain blocker resolution evidence.

**Artifact ID:** IMPL-SP-04\
**Version/date:** 0.3 Draft · 4 November 2026\
**Status:** Current Task commands/history/UI checkpoint; whole-feature integration remains open. Actual status and evidence belong to FEAT-SP04-01.\
**Inputs:** [Canonical SP-04](../../../specs/004-update-task.md) v0.7.5; SPEC-INDEX v0.8.2; PRD-01 v0.10.1; [source register](../register.md); [decisions](../decisions.md).\
**Trace:** FR-09, FR-40, FR-43, FR-44; BR-03, BR-02, BR-06; SC-03, SC-04.\
**Owner role:** Sequential implementer; no independent approval claimed.

## Contract and boundaries

- Canonical goal: Update a task without stale overwrite and retain blocker resolution evidence.
- Dependencies: [SP-03](03-create-task.md). See [roadmap](../roadmap.md) for cross-cutting SP-11 capture and staged integration.
- Service ownership as declared by spec: workspace; cross-service orchestration does not transfer DB ownership.
- Release tiers (snapshot): Must: FR-09, FR-40, FR-43, FR-44. Optional work requires explicit inclusion; it is not a Must gate.
- Declared operation IDs: `editTask`, `setTaskState`, `setAssignee`, `recordBlocker`, `listBlockerEvents`. Read exact contracts from the [source register](../register.md); these lists do not replace all supporting contract dependencies or grant a second handler owner.
- Flow: [current interaction source](../../ux/flows/board-flow.md).
- Decision gates: D-03 where capability assignment is unresolved; D-04 for blocker/location projections. SP-05 is co-required for completed-Sprint reopening acceptance.
- Allowed paths, copied from canonical spec: services/workspace/**, apps/web/**, tests/workspace/**. Re-read the current spec before edits. Shared contract/root-script/guard changes outside these paths need a recorded coordinated-spec scope update; this breakdown does not authorise them.

## Child steps

Select one child; copy its exact FR/AC assertions and prerequisites into the [brief](../handoff-template.md). A child can be preparation-only; no synthetic result closes runtime acceptance.

| Child ID | Goal | Initial status / evidence |
| --- | --- | --- |
| SP-04.1 | Map state, assignment and blocker invariants | Not started; no evidence |
| SP-04.2 | Implement edits and state/assignment commands | Not started; no evidence |
| SP-04.3 | Append blocker history and bind UI | Not started; no evidence |
| SP-04.4 | Verify refresh, conflicts and history | Not started; no evidence |

### SP-04.1 — Map state, assignment and blocker invariants

Read direct three-state transitions, current-member assignee checks, event sequencing and Completed-Sprint reopen semantics. Identify the SP-05 coordinated transaction and allowed-path needs before editing.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-04.2 — Implement edits and state/assignment commands

Enforce current capabilities and expected revisions; persist mandatory audit/replay with state. Membership removal and assignment cannot race into a departed assignee. Completed-Sprint reopen returns Backlog To Do while preserving history.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-04.3 — Append blocker history and bind UI

Record Open/Resolved with nonempty description and optional supplied outcome; repeated distinct events retain history while replay creates no duplicate. Latest committed sequence determines Blocked. Keep amber blocker and separate operation error styles.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-04.4 — Verify refresh, conflicts and history

Use controlled stale-edit, sequence and removal/assignment tests; inject storage/audit failure and unknown response. Verify direct transitions and reopen against SP-05, keyboard UI action and fresh-client history reconstruction.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

## Acceptance and evidence

Canonical tests to read: TC-07, TC-08, TC-14, TC-16, TC-18, TC-19, TC-22 in [TEST-08](../../sdlc/test-plan.md). This is a starting cross-reference, not a replacement for full FR/AC/UC-EX coverage.

Use [execution rules](../execution.md): real handlers/persisted state, relevant consumer/provider checks, controlled concurrency and UI reload/failure where applicable. Mutation audit failure must not leave committed state. Unknown outcome is reconciled with the original identity under operation-specific rules. Never fabricate runtime evidence from contracts or fixtures.

Record command/runtime, source revision or dirty-worktree digest, fixture/config identity, asserted boundary, results/failed attempts, unrun checks and open decisions in a dated [handoff](../handoff-template.md). Link it from the child status row and update the [catalogue](README.md) when pack state changes.

**Checklist/handoff:** Pass for bounded breakdown and canonical references; Gap for missing decisions and all application acceptance. Ready for preparation within these limits; no implementation, release completion or independent acceptance is claimed.


## Current execution navigation

[Owning plan](../features/sp-04-update-task/plan.md) v0.14 supersedes the initial Not started snapshot above. SP-04.1 source/design and bounded SP-04.2/03 Task handlers/UI have actual producer evidence; SP-04.4 still requires P08 actual SP-05 completion/allocation versus reopen integration. The owner requested a checkpoint commit and hotfix switch with that gate open. See the continuation report for exact checks and limitations; this is not full acceptance or an OD-11 deferral.


HF42-RF03 coordinated source: canonical SP-04 v0.7.5 links the separate hotfix-owned Proposed ADR0029 contract/reproduction. Existing Task checkpoint acceptance and P08 status remain unchanged; no null guard is implemented by the source registration.
