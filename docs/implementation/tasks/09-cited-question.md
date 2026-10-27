# SP-09: Answer an English question with exact citations or explicit insufficiency/conflict/failure.

**Artifact ID:** IMPL-SP-09\
**Version/date:** 0.1 Draft · 26 October 2026\
**Status:** Breakdown only; all child steps Not started.\
**Inputs:** [Canonical SP-09](../../../specs/009-cited-question.md) v0.9; SPEC-INDEX v0.4; PRD-01 v0.9; [source register](../register.md); [decisions](../decisions.md); ADR-0011 (see canonical status in decision register).\
**Trace:** FR-21, FR-22, FR-23, FR-24, FR-28, FR-29, FR-30, FR-46, FR-53, FR-54, FR-55, FR-60, FR-69; BR-08, BR-10, BR-12, BR-07, BR-13; SC-02, SC-06, SC-07, SC-08.\
**Owner role:** Sequential implementer; no independent approval claimed.

## Contract and boundaries

- Canonical goal: Answer an English question with exact citations or explicit insufficiency/conflict/failure.
- Dependencies: [SP-07](07-version-publication.md), [SP-08](08-linked-keyword-search.md), [SP-11](11-audit-and-source-inspection.md). See [roadmap](../roadmap.md) for cross-cutting SP-11 capture and staged integration.
- Service ownership as declared by spec: knowledge; cross-service orchestration does not transfer DB ownership.
- Release tiers (snapshot): Must: FR-21, FR-22, FR-23, FR-24, FR-28, FR-29, FR-30, FR-46, FR-53, FR-54, FR-55, FR-60, FR-69. Optional work requires explicit inclusion; it is not a Must gate.
- Declared operation IDs: `askQuestion`, `openCitation`, `semanticSearch`. Read exact contracts from the [source register](../register.md); these lists do not replace all supporting contract dependencies or grant a second handler owner.
- Flow: [current interaction source](../../ux/flows/ai-qa-flow.md).
- Decision gates: D-06/D-07 before live relay; D-08 for additional inspection capture. Work/doc prerequisites and applicable SP-11 evidence capture must be verified.
- Allowed paths, copied from canonical spec: services/knowledge/**, services/workspace/gateway/**, services/workspace/policy/**, apps/web/**, tests/**. Re-read the current spec before edits. Shared contract/root-script/guard changes outside these paths need a recorded coordinated-spec scope update; this breakdown does not authorise them.

## Child steps

Select one child; copy its exact FR/AC assertions and prerequisites into the [brief](../handoff-template.md). A child can be preparation-only; no synthetic result closes runtime acceptance.

| Child ID | Goal | Initial status / evidence |
| --- | --- | --- |
| SP-09.1 | Prepare provider and evidence acceptance | Not started; no evidence |
| SP-09.2 | Implement scoped retrieval and guarded submission | Not started; no evidence |
| SP-09.3 | Implement validated buffered answer delivery | Not started; no evidence |
| SP-09.4 | Verify actual rejection/send boundaries | Not started; no evidence |

### SP-09.1 — Prepare provider and evidence acceptance

Select/record embedding and generation config, allowed transfers, final-wire mapping and budget through the decision process. Map typed evidence and current scopes; local synthetic doubles are preparation only. Resolve detailed Proposed transport mechanics without weakening ADR-0011/0012.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-09.2 — Implement scoped retrieval and guarded submission

Authorise Current/explicit history candidates before context, assign evidence IDs on the server and persist required run/exact manifest outside guard. Revalidate full evidence including uncited input, current authority/lifecycle/observations and exact payload within guard through provider transport completion/abort.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-09.3 — Implement validated buffered answer delivery

Wait for generation outside guard. Validate exact citations and support; distinguish answered/partial/insufficient/conflict from infrastructure failure. Persist fresh answer-attempt manifest outside guard then revalidate/guard delivery. Invalid or revoked context withholds the entire old draft; no citation-only stripping or token streaming.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-09.4 — Verify actual rejection/send boundaries

Use barriers and captured bytes for both handoff purposes: persistence failure/unknown ack, stale evidence, altered bytes, replay, crash/restart and unknown transport. Check source opens under renewed scope and healthy fallback. Schema/SQL/reference checks cannot close TC-26.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

## Acceptance and evidence

Canonical tests to read: TC-02, TC-03, TC-04, TC-09, TC-10, TC-14, TC-18, TC-22, TC-23, TC-26 in [TEST-08](../../sdlc/test-plan.md). This is a starting cross-reference, not a replacement for full FR/AC/UC-EX coverage.

Use [execution rules](../execution.md): real handlers/persisted state, relevant consumer/provider checks, controlled concurrency and UI reload/failure where applicable. Mutation audit failure must not leave committed state. Unknown outcome is reconciled with the original identity under operation-specific rules. Never fabricate runtime evidence from contracts or fixtures.

Record command/runtime, source revision or dirty-worktree digest, fixture/config identity, asserted boundary, results/failed attempts, unrun checks and open decisions in a dated [handoff](../handoff-template.md). Link it from the child status row and update the [catalogue](README.md) when pack state changes.

**Checklist/handoff:** Pass for bounded breakdown and canonical references; Gap for missing decisions and all application acceptance. Ready for preparation within these limits; no implementation, release completion or independent acceptance is claimed.
