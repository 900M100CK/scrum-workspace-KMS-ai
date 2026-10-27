# SP-07: Revise immutable evidence directly to Current and preserve labelled history and exact citations.

**Artifact ID:** IMPL-SP-07\
**Version/date:** 0.1 Draft · 26 October 2026\
**Status:** Breakdown only; all child steps Not started.\
**Inputs:** [Canonical SP-07](../../../specs/007-version-publication.md) v0.6; SPEC-INDEX v0.4; PRD-01 v0.9; [source register](../register.md); [decisions](../decisions.md).\
**Trace:** FR-11, FR-12, FR-13, FR-15, FR-19, FR-47, FR-48, FR-61; BR-05, BR-14, BR-07, BR-12; SC-05, SC-06. FR-45 is Withdrawn; its replacement/immutable-history assertions are now AC-11. The filename is retained for link continuity, not a publication feature.\
**Owner role:** Sequential implementer; no independent approval claimed.

## Contract and boundaries

- Canonical goal: Revise immutable evidence directly to Current and preserve labelled history and exact citations.
- Dependencies: [SP-06](06-document-access.md). See [roadmap](../roadmap.md) for cross-cutting SP-11 capture and staged integration.
- Service ownership as declared by spec: both; cross-service orchestration does not transfer DB ownership.
- Release tiers (snapshot): Must: FR-11, FR-12, FR-13, FR-15, FR-19, FR-47, FR-48, FR-61. Optional work requires explicit inclusion; it is not a Must gate.
- Declared operation IDs: `reviseDocument`, `archiveVersion`, `deleteDocument`, `getVersion`, `getReadiness`, `listVersions`, `getAllowedActions`, `getDocumentCommandPrecondition`. Read exact contracts from the [source register](../register.md); these lists do not replace all supporting contract dependencies or grant a second handler owner.
- Flow: [current interaction source](../../ux/flows/docs-flow.md).
- Decision gates: D-05 for non-reading lifecycle/revision commands; D-07 for lifecycle/guard coordination; D-09 for physical retention/purge.
- Allowed paths, copied from canonical spec: services/knowledge/**, apps/web/**, tests/knowledge/**. Re-read the current spec before edits. Shared contract/root-script/guard changes outside these paths need a recorded coordinated-spec scope update; this breakdown does not authorise them.

## Child steps

Select one child; copy its exact FR/AC assertions and prerequisites into the [brief](../handoff-template.md). A child can be preparation-only; no synthetic result closes runtime acceptance.

| Child ID | Goal | Initial status / evidence |
| --- | --- | --- |
| SP-07.1 | Bind immutable lifecycle commands | Not started; no evidence |
| SP-07.2 | Persist revision and history atomically | Not started; no evidence |
| SP-07.3 | Implement archive/delete and readiness | Not started; no evidence |
| SP-07.4 | Verify lifecycle and recovery | Not started; no evidence |

### SP-07.1 — Bind immutable lifecycle commands

Read exact-version/readiness/history contracts and independent lifecycle/write rights. The legacy spec filename does not introduce publish or Draft. Resolve affected Proposed command/guard designs and cross-spec path coordination.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-07.2 — Persist revision and history atomically

Insert new immutable Current and supersede old Current in the same Knowledge transaction, including pointer/audit/replay as required. Preserve original bytes and exact passage identities; conflict cannot partially swap state.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-07.3 — Implement archive/delete and readiness

Enforce logical unavailability/current retrieval rules, exact history labels and pending/ready/failed indexing distinct from validity. Out-of-order work cannot revive old/deleted content. Missing citation evidence never redirects to another version; retained identity needs current read entitlement.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-07.4 — Verify lifecycle and recovery

Race revisions, lifecycle writes and protected handoffs; inject indexing/storage/audit faults and lost responses. Verify exact historical reads, stale jobs and non-reading lifecycle safety. Physical purge remains gated; FR-45 stays withdrawn.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

## Acceptance and evidence

Canonical tests to read: TC-04, TC-05, TC-06, TC-14, TC-18, TC-20, TC-22, TC-23 in [TEST-08](../../sdlc/test-plan.md). This is a starting cross-reference, not a replacement for full FR/AC/UC-EX coverage.

Use [execution rules](../execution.md): real handlers/persisted state, relevant consumer/provider checks, controlled concurrency and UI reload/failure where applicable. Mutation audit failure must not leave committed state. Unknown outcome is reconciled with the original identity under operation-specific rules. Never fabricate runtime evidence from contracts or fixtures.

Record command/runtime, source revision or dirty-worktree digest, fixture/config identity, asserted boundary, results/failed attempts, unrun checks and open decisions in a dated [handoff](../handoff-template.md). Link it from the child status row and update the [catalogue](README.md) when pack state changes.

**Checklist/handoff:** Pass for bounded breakdown and canonical references; Gap for missing decisions and all application acceptance. Ready for preparation within these limits; no implementation, release completion or independent acceptance is claimed.
