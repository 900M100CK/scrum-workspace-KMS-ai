# SP-08: Address scattered context with explicit links and an AI-independent keyword path.

**Artifact ID:** IMPL-SP-08\
**Version/date:** 0.1 Draft · 26 October 2026\
**Status:** Breakdown only; all child steps Not started.\
**Inputs:** [Canonical SP-08](../../../specs/008-linked-keyword-search.md) v0.4; SPEC-INDEX v0.4; PRD-01 v0.9; [source register](../register.md); [decisions](../decisions.md).\
**Trace:** FR-16, FR-17, FR-18, FR-20, FR-34, FR-49, FR-59, FR-63, FR-70; BR-06, BR-10, BR-07, BR-13, BR-01; SC-01, SC-04, SC-08.\
**Owner role:** Sequential implementer; no independent approval claimed.

## Contract and boundaries

- Canonical goal: Address scattered context with explicit links and an AI-independent keyword path.
- Dependencies: [SP-06](06-document-access.md), [SP-03](03-create-task.md). See [roadmap](../roadmap.md) for cross-cutting SP-11 capture and staged integration.
- Service ownership as declared by spec: knowledge + workspace; cross-service orchestration does not transfer DB ownership.
- Release tiers (snapshot): Must: FR-16, FR-17, FR-18, FR-20, FR-34, FR-59, FR-63; Should: FR-49, FR-70. Optional work requires explicit inclusion; it is not a Must gate.
- Declared operation IDs: `createLink`, `listLinks`, `removeLink`, `keywordSearch`, `searchTasks`. Read exact contracts from the [source register](../register.md); these lists do not replace all supporting contract dependencies or grant a second handler owner.
- Flow: [current interaction source](../../ux/flows/docs-flow.md).
- Decision gates: D-04 for discovery/paging; D-07 for protected search/link response handoffs; D-06 is not needed for keyword fallback.
- Allowed paths, copied from canonical spec: services/knowledge/**, services/workspace/**, apps/web/**, tests/knowledge/**, tests/workspace/**. Re-read the current spec before edits. Shared contract/root-script/guard changes outside these paths need a recorded coordinated-spec scope update; this breakdown does not authorise them.

## Child steps

Select one child; copy its exact FR/AC assertions and prerequisites into the [brief](../handoff-template.md). A child can be preparation-only; no synthetic result closes runtime acceptance.

| Child ID | Goal | Initial status / evidence |
| --- | --- | --- |
| SP-08.1 | Map authorised links and search | Not started; no evidence |
| SP-08.2 | Implement manual links and navigation | Not started; no evidence |
| SP-08.3 | Implement independent keyword path and UI | Not started; no evidence |
| SP-08.4 | Verify source discovery and fallback | Not started; no evidence |

### SP-08.1 — Map authorised links and search

Read both relationship endpoint entitlements, keyword contract fields, Current/history rules and search metadata. Record missing source-read guard/dependency decisions rather than inventing a public listing bypass.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-08.2 — Implement manual links and navigation

Create/list links only across permitted endpoints; retain exact evidence/version identity where contracted. Hide inaccessible target metadata and counts. No automatic graph or AI-created relationship.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-08.3 — Implement independent keyword path and UI

Use the existing PostgreSQL English full-text baseline with current project AND document scope. Distinguish empty from dependency/authority failure; current retrieval cannot expose superseded sources as current. Keep provider dependency outside this path.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-08.4 — Verify source discovery and fallback

Check exact-term/paraphrase applicability, grant/revoke and denied endpoint navigation, cursor conflict and AI outage. Test removeLink/task search only if explicitly included; optional task search remains Workspace-owned and independent of Knowledge.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

## Acceptance and evidence

Canonical tests to read: TC-02, TC-10, TC-13, TC-17, TC-22, TC-23; TC-25 only if FR-70 delivered in [TEST-08](../../sdlc/test-plan.md). This is a starting cross-reference, not a replacement for full FR/AC/UC-EX coverage.

Use [execution rules](../execution.md): real handlers/persisted state, relevant consumer/provider checks, controlled concurrency and UI reload/failure where applicable. Mutation audit failure must not leave committed state. Unknown outcome is reconciled with the original identity under operation-specific rules. Never fabricate runtime evidence from contracts or fixtures.

Record command/runtime, source revision or dirty-worktree digest, fixture/config identity, asserted boundary, results/failed attempts, unrun checks and open decisions in a dated [handoff](../handoff-template.md). Link it from the child status row and update the [catalogue](README.md) when pack state changes.

**Checklist/handoff:** Pass for bounded breakdown and canonical references; Gap for missing decisions and all application acceptance. Ready for preparation within these limits; no implementation, release completion or independent acceptance is claimed.
