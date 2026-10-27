# SP-13: Let permitted users inspect recorded changes/retrieval while enforcing current source and log scope.

**Artifact ID:** IMPL-SP-13\
**Version/date:** 0.1 Draft · 26 October 2026\
**Status:** Breakdown only; all child steps Not started.\
**Inputs:** [Canonical SP-13](../../../specs/013-scoped-inspection.md) v0.6; SPEC-INDEX v0.4; PRD-01 v0.9; [source register](../register.md); [decisions](../decisions.md); ADR-0012 (see canonical status in decision register).\
**Trace:** FR-27, FR-56, FR-58; BR-12, BR-10, BR-11; SC-02, SC-06.\
**Owner role:** Sequential implementer; no independent approval claimed.

## Contract and boundaries

- Canonical goal: Let permitted users inspect recorded changes/retrieval while enforcing current source and log scope.
- Dependencies: [SP-11](11-audit-and-source-inspection.md), [SP-09](09-cited-question.md). See [roadmap](../roadmap.md) for cross-cutting SP-11 capture and staged integration.
- Service ownership as declared by spec: both; cross-service orchestration does not transfer DB ownership.
- Release tiers (snapshot): Should: FR-27; Must: FR-56, FR-58. Optional work requires explicit inclusion; it is not a Must gate.
- Declared operation IDs: `listAudit`, `getTrace`, `getRetrievalSummary`, `getAllowedActions`. Read exact contracts from the [source register](../register.md); these lists do not replace all supporting contract dependencies or grant a second handler owner.
- Flow: [current interaction source](../../sdlc/ui-ux-blueprint.md).
- Decision gates: D-03 for audit/trace delegation; D-04/D-08 for scoped action/trace projections; D-09 for retention. Producing capture must exist first.
- Allowed paths, copied from canonical spec: services/workspace/**, services/knowledge/**, apps/web/**, tests/**, eval/**. Re-read the current spec before edits. Shared contract/root-script/guard changes outside these paths need a recorded coordinated-spec scope update; this breakdown does not authorise them.

## Child steps

Select one child; copy its exact FR/AC assertions and prerequisites into the [brief](../handoff-template.md). A child can be preparation-only; no synthetic result closes runtime acceptance.

| Child ID | Goal | Initial status / evidence |
| --- | --- | --- |
| SP-13.1 | Map independent inspection entitlements | Not started; no evidence |
| SP-13.2 | Implement scoped audit inspection | Not started; no evidence |
| SP-13.3 | Implement trace/source UI | Not started; no evidence |
| SP-13.4 | Verify inspector revocation and redaction | Not started; no evidence |

### SP-13.1 — Map independent inspection entitlements

Read scoped listAudit/getTrace and optional getRetrievalSummary contracts. Resolve capability provisioning and Proposed discovery/capture mechanics. Audit-read, trace-read and permitted-answer summary access remain distinct; no role or source-read inference.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-13.2 — Implement scoped audit inspection

Return allowed actor/action/entity/time under ADR-0012 scoped identity exception while redacting protected titles/content/before-after payload. Unknown/out-of-scope access uses contracted generic failure without granting direct document/citation access.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-13.3 — Implement trace/source UI

Show permitted necessary steps/evidence and honest missing metrics; source details recheck current source permissions. If optional summary is included, open it inline from the answer under its own run entitlement instead of gating it through Audit. No saved-answer feature is invented.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-13.4 — Verify inspector revocation and redaction

Test inspector capability revocation, cross-project run selectors, scoped identity versus denied source content, trace/summary independence and missing mandatory/optional capture distinctions. Clear protected UI on loss and verify keyboard/focus states.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

## Acceptance and evidence

Canonical tests to read: TC-02, TC-03, TC-11, TC-18, TC-22 in [TEST-08](../../sdlc/test-plan.md). This is a starting cross-reference, not a replacement for full FR/AC/UC-EX coverage.

Use [execution rules](../execution.md): real handlers/persisted state, relevant consumer/provider checks, controlled concurrency and UI reload/failure where applicable. Mutation audit failure must not leave committed state. Unknown outcome is reconciled with the original identity under operation-specific rules. Never fabricate runtime evidence from contracts or fixtures.

Record command/runtime, source revision or dirty-worktree digest, fixture/config identity, asserted boundary, results/failed attempts, unrun checks and open decisions in a dated [handoff](../handoff-template.md). Link it from the child status row and update the [catalogue](README.md) when pack state changes.

**Checklist/handoff:** Pass for bounded breakdown and canonical references; Gap for missing decisions and all application acceptance. Ready for preparation within these limits; no implementation, release completion or independent acceptance is claimed.
