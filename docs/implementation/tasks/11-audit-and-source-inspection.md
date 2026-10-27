# SP-11: Record trustworthy change/run receipts from the first operation, independently of inspection UI.

**Artifact ID:** IMPL-SP-11\
**Version/date:** 0.2 Draft · 26 October 2026\
**Status:** Breakdown only; all child steps Not started.\
**Inputs:** [Canonical SP-11](../../../specs/011-audit-and-source-inspection.md) v0.10; SPEC-INDEX v0.4; PRD-01 v0.9; [source register](../register.md); [decisions](../decisions.md); ADR-0012 (see canonical status in decision register).\
**Trace:** FR-31, FR-32, FR-57; BR-11, BR-12; SC-02, SC-06.\
**Owner role:** Sequential implementer; no independent approval claimed.

## Contract and boundaries

- Canonical goal: Record trustworthy change/run receipts from the first operation, independently of inspection UI.
- Dependencies: [SP-01](01-session.md). See [roadmap](../roadmap.md) for cross-cutting SP-11 capture and staged integration.
- Service ownership as declared by spec: both; cross-service orchestration does not transfer DB ownership.
- Release tiers (snapshot): Must: FR-31, FR-32, FR-57. Optional work requires explicit inclusion; it is not a Must gate.
- Declared operation IDs: `getHandoffManifest`. Read exact contracts from the [source register](../register.md); these lists do not replace all supporting contract dependencies or grant a second handler owner.
- Flow: [current interaction source](../../ux/flows/ai-qa-flow.md).
- Decision gates: D-07 for detailed manifest/claim/transport implementation; D-08 for added capture projections; D-09 for retention. Mutation capture follows confirmed ADR-0012 and accompanies each first producer.
- Allowed paths, copied from canonical spec: services/workspace/**, services/knowledge/**, apps/web/**, tests/**, eval/**. Re-read the current spec before edits. Shared contract/root-script/guard changes outside these paths need a recorded coordinated-spec scope update; this breakdown does not authorise them.

## Child steps

Select one child; copy its exact FR/AC assertions and prerequisites into the [brief](../handoff-template.md). A child can be preparation-only; no synthetic result closes runtime acceptance.

| Child ID | Goal | Initial status / evidence |
| --- | --- | --- |
| SP-11.1 | Co-deliver owned mutation audit capture | Not started; no evidence |
| SP-11.2 | Implement durable AI preparation and lookup | Not started; no evidence |
| SP-11.3 | Integrate one-use transport and honest capture | Not started; no evidence |
| SP-11.4 | Verify mandatory evidence ordering | Not started; no evidence |

### SP-11.1 — Co-deliver owned mutation audit capture

With each first producing handler, persist mandatory actor/action/entity/time and protected before/after references or durable pending audit in the same owning transaction. Minimum-record failure rolls back; sink-only outage retains the committed outcome and replayable delivery. No cross-service audit DB write.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-11.2 — Implement durable AI preparation and lookup

After work/document prerequisites and relevant decisions, persist run identity and complete immutable per-attempt evidence before provider/answer handoff. Implement authenticated getHandoffManifest using exact stored bytes, server-derived scope and known commit acknowledgement; reuse storage prerequisites without treating them as send authority.

Required existing inputs: [HANDOFF-REF-01](../../sdlc/references/handoff-byte-reference-2026-10-18.md) v0.3, [HANDOFF-SQL-01](../../sdlc/references/handoff-sql-projection-2026-10-18.md) v0.2 and the [prepared-record query](../../../services/knowledge/queries/get-handoff-manifest.sql). Read the [data-policy fit follow-ups](../../sdlc/data-policy-fit-review.md) before declaring a prerequisite missing. Synthetic/SQL evidence is not a live scoped HTTP read, current permission check, guard or transport test.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-11.3 — Integrate one-use transport and honest capture

Coordinate SP-09 Workspace claim/guard/fence and append-only outcomes, exact full evidence including operational observations, purpose/destination and immutable payload binding. Unknown transport cannot auto-replay or automatically resend under a fresh ID. Required capture failure blocks handoff; optional metrics are measured/unavailable/not_performed.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-11.4 — Verify mandatory evidence ordering

Inject capture, commit, lookup, optional sink and process failures; control concurrent persistence/revocation/handoff ordering. Record actual bytes and final DB/audit/claim state. Existing isolated SQL/reference tests remain prerequisites, not live handler acceptance.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

## Acceptance and evidence

Canonical tests to read: TC-11, TC-14, TC-18, TC-26 in [TEST-08](../../sdlc/test-plan.md). This is a starting cross-reference, not a replacement for full FR/AC/UC-EX coverage.

Use [execution rules](../execution.md): real handlers/persisted state, relevant consumer/provider checks, controlled concurrency and UI reload/failure where applicable. Mutation audit failure must not leave committed state. Unknown outcome is reconciled with the original identity under operation-specific rules. Never fabricate runtime evidence from contracts or fixtures.

Record command/runtime, source revision or dirty-worktree digest, fixture/config identity, asserted boundary, results/failed attempts, unrun checks and open decisions in a dated [handoff](../handoff-template.md). Link it from the child status row and update the [catalogue](README.md) when pack state changes.

**Checklist/handoff:** Pass for bounded breakdown and canonical references; Gap for missing decisions and all application acceptance. Ready for preparation within these limits; no implementation, release completion or independent acceptance is claimed.
