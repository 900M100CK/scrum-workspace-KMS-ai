# SP-05: Run the fixed Scrum lifecycle without introducing a workflow configuration engine.

**Artifact ID:** IMPL-SP-05\
**Version/date:** 0.1 Draft · 26 October 2026\
**Status:** Breakdown only; all child steps Not started.\
**Inputs:** [Canonical SP-05](../../../specs/005-sprint-lifecycle.md) v0.7; SPEC-INDEX v0.4; PRD-01 v0.9; [source register](../register.md); [decisions](../decisions.md).\
**Trace:** FR-06, FR-07, FR-08, FR-41, FR-42, FR-66, FR-67; BR-02; SC-03.\
**Owner role:** Sequential implementer; no independent approval claimed.

## Contract and boundaries

- Canonical goal: Run the fixed Scrum lifecycle without introducing a workflow configuration engine.
- Dependencies: [SP-04](04-update-task.md). See [roadmap](../roadmap.md) for cross-cutting SP-11 capture and staged integration.
- Service ownership as declared by spec: workspace; cross-service orchestration does not transfer DB ownership.
- Release tiers (snapshot): Must: FR-06, FR-07, FR-08, FR-41, FR-42; Could: FR-66, FR-67. Optional work requires explicit inclusion; it is not a Must gate.
- Declared operation IDs: `createSprint`, `allocateTask`, `startSprint`, `completeSprint`, `reorderBacklog`, `editSprint`, `removeAllocation`, `listSprintItems`, `listTasks`, `getSprint`. Read exact contracts from the [source register](../register.md); these lists do not replace all supporting contract dependencies or grant a second handler owner.
- Flow: [current interaction source](../../ux/flows/board-flow.md).
- Decision gates: D-03 for Sprint-management provisioning; D-04 for placement, paging and completion projections.
- Allowed paths, copied from canonical spec: services/workspace/**, apps/web/**, tests/workspace/**. Re-read the current spec before edits. Shared contract/root-script/guard changes outside these paths need a recorded coordinated-spec scope update; this breakdown does not authorise them.

## Child steps

Select one child; copy its exact FR/AC assertions and prerequisites into the [brief](../handoff-template.md). A child can be preparation-only; no synthetic result closes runtime acceptance.

| Child ID | Goal | Initial status / evidence |
| --- | --- | --- |
| SP-05.1 | Prepare lifecycle and complete-list bindings | Not started; no evidence |
| SP-05.2 | Implement plan, allocation and start | Not started; no evidence |
| SP-05.3 | Implement completion and reconstruction | Not started; no evidence |
| SP-05.4 | Verify competing lifecycle requests | Not started; no evidence |

### SP-05.1 — Prepare lifecycle and complete-list bindings

Map Sprint create/read/list/items and Backlog reads/reorder. Confirm Proposed projection design. Reorder needs every Backlog page with one backlog_revision; a filtered/page subset is insufficient.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-05.2 — Implement plan, allocation and start

Persist explicit goal/dates and owned audit/replay. Keep one Planned/Active allocation per task and at most one Active Sprint per project. Multi-select is independently keyed per-task allocation with confirmed/rejected/unknown outcomes.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-05.3 — Implement completion and reconstruction

Atomically retain Done history and return unfinished work as To Do with revised location/order/audit. Show confirmed completion counts; keep historical associations separate from current task data. Coordinate SP-04 reopen.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-05.4 — Verify competing lifecycle requests

Control concurrent start/allocation/completion/reopen/reorder interleavings; inspect constraints and rollback state. Exercise mixed allocation and same-key reconciliation; optional editSprint/removeAllocation are not promoted into Must.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

## Acceptance and evidence

Canonical tests to read: TC-07, TC-13, TC-14, TC-16, TC-18, TC-19, TC-21, TC-22 in [TEST-08](../../sdlc/test-plan.md). This is a starting cross-reference, not a replacement for full FR/AC/UC-EX coverage.

Use [execution rules](../execution.md): real handlers/persisted state, relevant consumer/provider checks, controlled concurrency and UI reload/failure where applicable. Mutation audit failure must not leave committed state. Unknown outcome is reconciled with the original identity under operation-specific rules. Never fabricate runtime evidence from contracts or fixtures.

Record command/runtime, source revision or dirty-worktree digest, fixture/config identity, asserted boundary, results/failed attempts, unrun checks and open decisions in a dated [handoff](../handoff-template.md). Link it from the child status row and update the [catalogue](README.md) when pack state changes.

**Checklist/handoff:** Pass for bounded breakdown and canonical references; Gap for missing decisions and all application acceptance. Ready for preparation within these limits; no implementation, release completion or independent acceptance is claimed.
