# SP-03: Persist one Story/Task/Bug in the correct authorised project and basic board state.

**Artifact ID:** IMPL-SP-03\
**Version/date:** 0.2 Draft · 2 November 2026\
**Status:** Original child definitions retained; current execution state/evidence belongs to FEAT-SP03-01.\
**Inputs:** [Canonical SP-03](../../../specs/003-create-task.md) v0.8; SPEC-INDEX v0.4; PRD-01 v0.9; [source register](../register.md); [decisions](../decisions.md); ADR-0018 (see canonical status in decision register).\
**Trace:** FR-05; BR-02; SC-01.\
**Owner role:** Sequential implementer; no independent approval claimed.

## Contract and boundaries

- Canonical goal: Persist one Story/Task/Bug in the correct authorised project and basic board state.
- Dependencies: [SP-02](02-project-membership.md). See [roadmap](../roadmap.md) for cross-cutting SP-11 capture and staged integration.
- Service ownership as declared by spec: workspace; cross-service orchestration does not transfer DB ownership.
- Release tiers (snapshot): Must: FR-05. Optional work requires explicit inclusion; it is not a Must gate.
- Declared operation IDs: `createTask`, `listTasks`, `getTask`. Read exact contracts from the [source register](../register.md); these lists do not replace all supporting contract dependencies or grant a second handler owner.
- Flow: [current interaction source](../../ux/flows/board-flow.md).
- Decision gates: D-01/D-02 prerequisites; D-04 for persisted location/Backlog generation under Proposed ADR-0018.
- Allowed paths, copied from canonical spec: services/workspace/**, apps/web/**, tests/workspace/**. Re-read the current spec before edits. Shared contract/root-script/guard changes outside these paths need a recorded coordinated-spec scope update; this breakdown does not authorise them.

## Child steps

The initial status observations below are the historical 26 October breakdown; read the registered feature plan for current state.

Select one child; copy its exact FR/AC assertions and prerequisites into the [brief](../handoff-template.md). A child can be preparation-only; no synthetic result closes runtime acceptance.

| Child ID | Goal | Initial status / evidence |
| --- | --- | --- |
| SP-03.1 | Bind task creation to the contract | Not started; no evidence |
| SP-03.2 | Persist task creation atomically | Not started; no evidence |
| SP-03.3 | Connect create/list/detail and reload | Not started; no evidence |
| SP-03.4 | Verify creation outcomes | Not started; no evidence |

### SP-03.1 — Bind task creation to the contract

Inspect Story/Task/Bug validation, server identity, project capability, initial wire state and work_location. Confirm Proposed placement/read mechanics and reusable owned audit/replay support.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-03.2 — Persist task creation atomically

Append to the correct Backlog under the selected serialization; persist task, position/generation, audit and replay outcome together. No client-asserted actor or cross-service DB write.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-03.3 — Connect create/list/detail and reload

Use actual createTask/listTasks/getTask responses in the existing UI. Display server work_location; fresh navigation/reload must reconstruct the record rather than reuse synthetic memory truth.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-03.4 — Verify creation outcomes

Check invalid type, denied and unknown scope, same-key/changed-payload behaviour where contracted, storage/audit rollback and concurrent append ordering. Verify persisted state and generic error schema, not registration count.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

## Acceptance and evidence

Canonical tests to read: TC-02, TC-13, TC-18, TC-19, TC-22 in [TEST-08](../../sdlc/test-plan.md). This is a starting cross-reference, not a replacement for full FR/AC/UC-EX coverage.

Use [execution rules](../execution.md): real handlers/persisted state, relevant consumer/provider checks, controlled concurrency and UI reload/failure where applicable. Mutation audit failure must not leave committed state. Unknown outcome is reconciled with the original identity under operation-specific rules. Never fabricate runtime evidence from contracts or fixtures.

Record command/runtime, source revision or dirty-worktree digest, fixture/config identity, asserted boundary, results/failed attempts, unrun checks and open decisions in a dated [handoff](../handoff-template.md). Link it from the child status row and update the [catalogue](README.md) when pack state changes.

**Checklist/handoff:** Pass for bounded breakdown and canonical references; Gap for missing decisions and all application acceptance. Ready for preparation within these limits; no implementation, release completion or independent acceptance is claimed.

## Current SP-03 handoff navigation

[FEAT-SP03-01](../features/sp-03-create-task/plan.md) v0.5 is the only mutable status table. SP-03.1 maps to P01/P02/P03A source/contract preparation; SP-03.2 to P03B/P03C/P04 storage/author/atomic creation; SP-03.3 to P05/P06 current reads/UI; SP-03.4 to P07/P08/P09 controlled integration/browser/regression. [Actual execution report](../../sdlc/reports/SP-03-2026-11-02-execution.md) supplies assertion/source/command evidence. Initial all-Not-started observations above are not current status. Applied migrations and formal Proposed/release/independent boundaries are unchanged.
