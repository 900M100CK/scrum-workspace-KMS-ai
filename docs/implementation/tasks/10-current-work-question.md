# SP-10: Report current blockers from operational observations rather than historical text.

**Artifact ID:** IMPL-SP-10\
**Version/date:** 0.1 Draft · 26 October 2026\
**Status:** Breakdown only; all child steps Not started.\
**Inputs:** [Canonical SP-10](../../../specs/010-current-work-question.md) v0.5; SPEC-INDEX v0.4; PRD-01 v0.9; [source register](../register.md); [decisions](../decisions.md).\
**Trace:** FR-25, FR-26; BR-09, BR-10; SC-03.\
**Owner role:** Sequential implementer; no independent approval claimed.

## Contract and boundaries

- Canonical goal: Report current blockers from operational observations rather than historical text.
- Dependencies: [SP-04](04-update-task.md), [SP-09](09-cited-question.md). See [roadmap](../roadmap.md) for cross-cutting SP-11 capture and staged integration.
- Service ownership as declared by spec: workspace; cross-service orchestration does not transfer DB ownership.
- Release tiers (snapshot): Must: FR-25, FR-26. Optional work requires explicit inclusion; it is not a Must gate.
- Declared operation IDs: `observeBlockedTasks`, `observeWorkState`. Read exact contracts from the [source register](../register.md); these lists do not replace all supporting contract dependencies or grant a second handler owner.
- Flow: [current interaction source](../../ux/flows/ai-qa-flow.md).
- Decision gates: D-04 for operational projection; D-07 for complete mixed-evidence handoff. SP-09 must supply the protected question pipeline.
- Allowed paths, copied from canonical spec: services/knowledge/**, services/workspace/observations/**, apps/web/**, tests/**. Re-read the current spec before edits. Shared contract/root-script/guard changes outside these paths need a recorded coordinated-spec scope update; this breakdown does not authorise them.

## Child steps

Select one child; copy its exact FR/AC assertions and prerequisites into the [brief](../handoff-template.md). A child can be preparation-only; no synthetic result closes runtime acceptance.

| Child ID | Goal | Initial status / evidence |
| --- | --- | --- |
| SP-10.1 | Map current operational observations | Not started; no evidence |
| SP-10.2 | Implement scoped operational observations | Not started; no evidence |
| SP-10.3 | Integrate mixed questions and inspector | Not started; no evidence |
| SP-10.4 | Verify stale and uncited operational evidence | Not started; no evidence |

### SP-10.1 — Map current operational observations

Read Workspace observeBlockedTasks/observeWorkState contracts, server session/project selectors, entity/observation revisions and observed_at. No document tuple or client-forged historical locator.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-10.2 — Implement scoped operational observations

Read committed current task/Sprint/project records, derive blockers from latest committed events and attach exact per-entity observation identity/time. Internal scoped reads do not recursively acquire a held project guard.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-10.3 — Integrate mixed questions and inspector

Knowledge consumes Workspace observations through the existing contract. Old text cannot override current work. Preserve delivered cited observation separately from a renewed current entity read; direct route/reload without original observation shows it unavailable instead of reconstructing history.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-10.4 — Verify stale and uncited operational evidence

Change an uncited task in a mixed document+work evidence set before delivery and prove rejection/new attempt. Check denial, observation failure, cross-project selectors, latest blocker outcome and reload without original citation context.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

## Acceptance and evidence

Canonical tests to read: TC-02, TC-04, TC-08, TC-09, TC-14, TC-22, TC-26 in [TEST-08](../../sdlc/test-plan.md). This is a starting cross-reference, not a replacement for full FR/AC/UC-EX coverage.

Use [execution rules](../execution.md): real handlers/persisted state, relevant consumer/provider checks, controlled concurrency and UI reload/failure where applicable. Mutation audit failure must not leave committed state. Unknown outcome is reconciled with the original identity under operation-specific rules. Never fabricate runtime evidence from contracts or fixtures.

Record command/runtime, source revision or dirty-worktree digest, fixture/config identity, asserted boundary, results/failed attempts, unrun checks and open decisions in a dated [handoff](../handoff-template.md). Link it from the child status row and update the [catalogue](README.md) when pack state changes.

**Checklist/handoff:** Pass for bounded breakdown and canonical references; Gap for missing decisions and all application acceptance. Ready for preparation within these limits; no implementation, release completion or independent acceptance is claimed.
