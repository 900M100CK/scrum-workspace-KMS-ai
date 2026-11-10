# SP-06: Store an owned English text/Markdown source with explicit, independently enforced document access.

**Artifact ID:** IMPL-SP-06\
**Version/date:** 0.2 Draft · 7 November 2026
**Status:** Bounded B01 source preparation recorded; runtime children remain unimplemented; state is in FEAT-SP06-01.\
**Inputs:** [Canonical SP-06](../../../specs/006-document-access.md) v0.6.4; SPEC-INDEX v0.8.7; PRD-01 v0.10.3; [source register](../register.md); [decisions](../decisions.md).\; Proposed ADR-0032 v0.1
**Trace:** FR-04, FR-10, FR-14, FR-50, FR-51, FR-52, FR-62, FR-65; BR-01, BR-10, BR-04, BR-14; SC-06.\
**Owner role:** Sequential implementer; no independent approval claimed.

## Contract and boundaries

- Canonical goal: Store an owned English text/Markdown source with explicit, independently enforced document access.
- Dependencies: [SP-02](02-project-membership.md), [SP-11](11-audit-and-source-inspection.md). See [roadmap](../roadmap.md) for cross-cutting SP-11 capture and staged integration.
- Service ownership as declared by spec: both; cross-service orchestration does not transfer DB ownership.
- Release tiers (snapshot): Must: FR-04, FR-10, FR-14, FR-50, FR-51, FR-52; Should: FR-62; Could: FR-65. Optional work requires explicit inclusion; it is not a Must gate.
- Declared operation IDs: `createDocument`, `getDocument`, `setClassification`, `grantDocumentRead`, `revokeDocumentRead`, `importDocument`, `editDocumentMetadata`, `registerDocumentPolicy`, `persistDocument`, `listDocuments`, `getDocumentPolicy`, `listDocumentReadGrants`, `getAllowedActions`, `listMembers`, `getDocumentCommandPrecondition`. Read exact contracts from the [source register](../register.md); these lists do not replace all supporting contract dependencies or grant a second handler owner.
- Flow: [current interaction source](../../ux/flows/docs-flow.md).
- Decision gates: D-03/D-04/D-05/D-07 as relevant to capability provisioning, discovery, independent commands and guarded source reads; D-09 before physical orphan cleanup.
- Allowed paths: original Knowledge/web/tests paths plus the exact B01-only Workspace document-authority adapter, existing project operator/CLI integration, additive014, DOCUMENTS.md and document-authority tests/fixture, and the exact B03-only guard and transport service-auth modules and tests listed in [canonical SP-06](../../../specs/006-document-access.md#allowed-paths-and-done). The policy/** placeholder is corrected to explicit src paths. Shared gateway/guard/HTTP/other schema paths remain pending later amendment; no blanket Workspace src allowance.

## Child steps

Select one child; copy its exact FR/AC assertions and prerequisites into the [brief](../handoff-template.md). A child can be preparation-only; no synthetic result closes runtime acceptance.

| Child ID | Goal | Initial status / evidence |
| --- | --- | --- |
| SP-06.1 | Resolve source-read and command dependencies | Not started; no evidence |
| SP-06.2 | Implement Workspace-first creation | Not started; no evidence |
| SP-06.3 | Implement independent rights and protected reads | Not started; no evidence |
| SP-06.4 | Verify revocation and partial creation | Not started; no evidence |

### SP-06.1 — Resolve source-read and command dependencies

Map Workspace policy registration and Knowledge persistence/read consumers, exact service/actor authentication and independent rights. Batch relevant Proposed decisions; coordinate owning specs for gateway/guard paths outside this spec. No provider choice is needed for text creation.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-06.2 — Implement Workspace-first creation

Bind scoped key/payload to stable document identity; commit policy/capabilities/revocable author grant and audit in Workspace before idempotent Knowledge Current persistence. Reconcile uncertain writes with the same identity; retain inaccessible policy-only orphans.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-06.3 — Implement independent rights and protected reads

Support classification/grant/revoke and read-filtered explorer/detail. Non-reading managers/writers use only operation-authorised metadata and accepted command-precondition mechanics; no title/content/readiness prefill bypass. Protected source response validation holds the accepted guard through transport completion/abort.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-06.4 — Verify revocation and partial creation

Pause protected reads and race revoke/removal; unknown authority denies. Crash between service commits, retry same key and prove exactly one source/grant identity. Verify author read revocation, initial classification, error equivalence and UI. Import/metadata editing are optional; no unsafe sweeper.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

## Acceptance and evidence

Canonical tests to read: TC-02, TC-03, TC-04, TC-13, TC-14, TC-15, TC-18, TC-20, TC-22 in [TEST-08](../../sdlc/test-plan.md). This is a starting cross-reference, not a replacement for full FR/AC/UC-EX coverage.

Use [execution rules](../execution.md): real handlers/persisted state, relevant consumer/provider checks, controlled concurrency and UI reload/failure where applicable. Mutation audit failure must not leave committed state. Unknown outcome is reconciled with the original identity under operation-specific rules. Never fabricate runtime evidence from contracts or fixtures.

Record command/runtime, source revision or dirty-worktree digest, fixture/config identity, asserted boundary, results/failed attempts, unrun checks and open decisions in a dated [handoff](../handoff-template.md). Link it from the child status row and update the [catalogue](README.md) when pack state changes.

**Checklist/handoff:** Pass for bounded breakdown and canonical references; Gap for missing decisions and all application acceptance. Ready for preparation within these limits; no implementation, release completion or independent acceptance is claimed.

## Selected B01 continuation — 7 November 2026

[FEAT-SP06-01 v0.3](../features/sp-06-document-access/plan.md) owns execution state. P02-A aligns selected private project knowledge-author provisioning; [Proposed ADR-0032](../../adr/0032-private-document-create-authority.md) bounds the014 predicate/trigger/private audit design. P03-A prepares only this authority prerequisite, then P04 implements the existing private operator integration. This order does not require B02/B03 or implement creation/policy/Knowledge storage. Minimum provisioning audit is co-committed, exact issued grants only, no runtime audit SELECT; no role/read implication or rejoin revival. Canonical tests TC-13/18/19/24 and their explicit B01 assertions remain Not run. Later transport/projection tasks retain B03/B02 respectively; no public API changes.

## Selected B03 continuation — 9 November 2026

[FEAT-SP06-01 v0.4](../features/sp-06-document-access/plan.md) owns execution state. P02-B aligns selected B03 transport direction; [Proposed ADR-0033](../../adr/0033-guarded-transport-boundary.md) bounds the project-scoped reader-writer guard with writer preference, active socket destruction w/ deadline, fencing generation, and constant-time X-Service-Key comparison over trusted TLS. P05 prepares the runtime implementation and concurrency tests under disposable environments. This does not require B02 or public API changes.
