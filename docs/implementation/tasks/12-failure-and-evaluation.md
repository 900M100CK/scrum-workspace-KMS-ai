# SP-12: Produce measured retrieval, citation and fallback evidence.

**Artifact ID:** IMPL-SP-12\
**Version/date:** 0.2 Draft · 26 October 2026\
**Status:** Breakdown only; all child steps Not started.\
**Inputs:** [Canonical SP-12](../../../specs/012-failure-and-evaluation.md) v0.4; SPEC-INDEX v0.4; PRD-01 v0.9; [source register](../register.md); [decisions](../decisions.md).\
**Trace:** FR-33; BR-13; SC-08.\
**Owner role:** Sequential implementer; no independent approval claimed.

## Contract and boundaries

- Canonical goal: Produce measured retrieval, citation and fallback evidence.
- Dependencies: [SP-05](05-sprint-lifecycle.md), [SP-09](09-cited-question.md), [SP-10](10-current-work-question.md). See [roadmap](../roadmap.md) for cross-cutting SP-11 capture and staged integration.
- Service ownership as declared by spec: both; cross-service orchestration does not transfer DB ownership.
- Release tiers (snapshot): Must: FR-33. Optional work requires explicit inclusion; it is not a Must gate.
- Declared operation IDs: No additional operation; exercise existing producing handlers. Read exact contracts from the [source register](../register.md); these lists do not replace all supporting contract dependencies or grant a second handler owner.
- Flow: [current interaction source](../../ux/flows/ai-qa-flow.md).
- Decision gates: D-06 configuration and D-10 pilot/final criteria; all applicable producing packs supply actual runtime evidence.
- Allowed paths, copied from canonical spec: services/workspace/**, services/knowledge/**, apps/web/**, tests/**, eval/**. Re-read the current spec before edits. Shared contract/root-script/guard changes outside these paths need a recorded coordinated-spec scope update; this breakdown does not authorise them.

## Child steps

Select one child; copy its exact FR/AC assertions and prerequisites into the [brief](../handoff-template.md). A child can be preparation-only; no synthetic result closes runtime acceptance.

| Child ID | Goal | Initial status / evidence |
| --- | --- | --- |
| SP-12.1 | Implement runner and prepare separate evaluation/safety runs | Not started; no evidence |
| SP-12.2 | Exercise dependency-specific continuity | Not started; no evidence |
| SP-12.3 | Run pilot then frozen final evaluation | Not started; no evidence |
| SP-12.4 | Reconcile release evidence and limitations | Not started; no evidence |

### SP-12.1 — Implement runner and prepare separate evaluation/safety runs

Inspect existing RQ and EVAL definitions/configuration applicability and corpus/access references. Freeze questions/rubric before pilot; declare eligible top-five and multi-source denominators. Keep tuning/final sets separate where feasible.

Read [EVAL-01](../../../eval/README.md) v0.2, the [rubric](../../../eval/rubric.md) v0.2, [configuration draft](../../../eval/config/configurations.yaml) and [safety applicability matrix](../../../eval/safety-configuration-expectations.md). This child owns implementing/wiring the application adapters and executable runner, materialising and verifying each declared scenario snapshot, completing/validating configuration-aware machine-readable expectations against canonical definitions, and recording per-suite/scenario/case/configuration results and relevant transport observations. Do not invent provider/model results or alter expected answers/thresholds to pass. Preserve prior definitions/snapshots and freeze rules.

Before pilot, supply actual smoke/negative evidence for C0/C1/C2 source-category isolation on matched snapshots, scenario mutation/revision identity, missing mandatory evidence, honest metric states and repeatable result capture. Synthetic adapter smoke checks establish runner mechanics only; application/provider execution is separately labelled. Add an actual CLI/test command only when its entry point exists within the allowed paths; record any needed shared-script change through coordinated scope updates.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-12.2 — Exercise dependency-specific continuity

Independently fail generation, embedding, budget, Knowledge/storage and Workspace/authority. Verify explicit AI failure, healthy work/docs/keyword only where their own dependencies work, and denial on unknown authority. No blanket availability promise.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-12.3 — Run pilot then frozen final evaluation

Record provider/model/embedding/retrieval/corpus/runtime/load configuration and negative results. Freeze thresholds before final. Score claim support separately from locator validity and retrieval. Use matched keyword baseline for improvement and manual/searcher/helper baseline for time-saving claims.

Requires SP-12.1 runner/configuration-isolation evidence and the relevant runtime/decision prerequisites. A task-description correction or context/schema pass does not satisfy this run gate.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-12.4 — Reconcile release evidence and limitations

Link every Must AC/applicable SC to actual assertions, retain failed/unrun results and report unresolved defects. Do not tick runtime gates from shape/SQL tests or claim all Core from a demo. Optional omissions and unmeasured benefits stay explicit.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

## Acceptance and evidence

Canonical tests to read: TC-04, TC-06, TC-10, TC-12, TC-14, TC-22, TC-26 plus affected regression TCs in [TEST-08](../../sdlc/test-plan.md). This is a starting cross-reference, not a replacement for full FR/AC/UC-EX coverage.

Use [execution rules](../execution.md): real handlers/persisted state, relevant consumer/provider checks, controlled concurrency and UI reload/failure where applicable. Mutation audit failure must not leave committed state. Unknown outcome is reconciled with the original identity under operation-specific rules. Never fabricate runtime evidence from contracts or fixtures.

Record command/runtime, source revision or dirty-worktree digest, fixture/config identity, asserted boundary, results/failed attempts, unrun checks and open decisions in a dated [handoff](../handoff-template.md). Link it from the child status row and update the [catalogue](README.md) when pack state changes.

**Checklist/handoff:** Pass for bounded breakdown and canonical references; Gap for missing decisions and all application acceptance. Ready for preparation within these limits; no implementation, release completion or independent acceptance is claimed.
