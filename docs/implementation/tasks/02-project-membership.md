# SP-02: Set the authorised project scope and remove membership without grant revival.

**Artifact ID:** IMPL-SP-02\
**Version/date:** 0.3 Draft · 1 November 2026\
**Status:** Owner-authorised bounded implementation; current status and measured evidence belong to FEAT-SP02-01.\
**Inputs:** [Canonical SP-02](../../../specs/002-project-membership.md) v0.7; SPEC-INDEX v0.8; PRD-01 v0.9; [source register](../register.md); [decisions](../decisions.md).\
**Trace:** FR-02, FR-03, FR-38, FR-39, FR-64; BR-01, BR-10, BR-14; SC-06.\
**Owner role:** Sequential implementer; no independent approval claimed.

## Contract and boundaries

- Canonical goal: Set the authorised project scope and remove membership without grant revival.
- Dependencies: [SP-01](01-session.md). See [roadmap](../roadmap.md) for cross-cutting SP-11 capture and staged integration.
- Service ownership as declared by spec: workspace; cross-service orchestration does not transfer DB ownership.
- Release tiers (snapshot): Must: FR-02, FR-03, FR-38, FR-39; Could: FR-64. Optional work requires explicit inclusion; it is not a Must gate.
- Declared operation IDs: `createProject`, `listProjects`, `addMember`, `removeMember`, `editProject`, `listMembers`, `getAllowedActions`. Read exact contracts from the [source register](../register.md); these lists do not replace all supporting contract dependencies or grant a second handler owner.
- Flow: [current interaction source](../../ux/sitemap.md).
- Decision gates: D-03 for non-read capability provisioning; D-04 for Proposed list/action discovery; D-07 for affected protected handoff/session boundaries.
- Allowed paths, copied from canonical spec: services/workspace/**, apps/web/**, tests/workspace/**. Re-read the current spec before edits. Shared contract/root-script/guard changes outside these paths need a recorded coordinated-spec scope update; this breakdown does not authorise them.

## Child steps

Select one child; copy its exact FR/AC assertions and prerequisites into the [brief](../handoff-template.md). A child can be preparation-only; no synthetic result closes runtime acceptance.

| Child ID | Goal | Bounded evidence pointer |
| --- | --- | --- |
| SP-02.1 | Resolve authority and read dependencies | See FEAT-SP02-01 and SP02-EXECUTION-RESULT; no whole-release acceptance |
| SP-02.2 | Create and reconstruct projects/membership | See FEAT-SP02-01 and SP02-EXECUTION-RESULT; no whole-release acceptance |
| SP-02.3 | Remove membership atomically | See FEAT-SP02-01 and SP02-EXECUTION-RESULT; no whole-release acceptance |
| SP-02.4 | Verify scope, rollback and races | See FEAT-SP02-01 and SP02-EXECUTION-RESULT; no whole-release acceptance |

### SP-02.1 — Resolve authority and read dependencies

Map project creation, membership management and scoped discovery to the existing contracts. Record D-03/D-04 dependencies and explicit synthetic grant provisioning; creator/role labels are not blanket authority.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-02.2 — Create and reconstruct projects/membership

Implement authorised create/list/project read and add/list member operations needed by the live UI, with owned audit/replay and pagination as contracted. Rejoin creates fresh membership without reviving individual grants or task assignment.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-02.3 — Remove membership atomically

Invalidate membership and all individual capability/read grants, clear current assignees, increment affected task revisions and persist mandatory audit in one Workspace transaction. Serialize with grant/assignment/rejoin and protect the last effective membership manager. Coordinate SP-04 for task impacts.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-02.4 — Verify scope, rollback and races

Test cross-project/unknown equivalence, creation authority, rejoin, last-manager races, audit/storage failure and lost responses. Reconstruct through a fresh client; optional project metadata editing remains explicitly optional.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

## Acceptance and evidence

Canonical tests to read: TC-02, TC-03, TC-13, TC-14, TC-18, TC-24 in [TEST-08](../../sdlc/test-plan.md). This is a starting cross-reference, not a replacement for full FR/AC/UC-EX coverage.

Use [execution rules](../execution.md): real handlers/persisted state, relevant consumer/provider checks, controlled concurrency and UI reload/failure where applicable. Mutation audit failure must not leave committed state. Unknown outcome is reconciled with the original identity under operation-specific rules. Never fabricate runtime evidence from contracts or fixtures.

Record command/runtime, source revision or dirty-worktree digest, fixture/config identity, asserted boundary, results/failed attempts, unrun checks and open decisions in a dated [handoff](../handoff-template.md). Link it from the child status row and update the [catalogue](README.md) when pack state changes.

**Checklist/handoff:** Pass for bounded breakdown and canonical references; Gap for missing decisions and all application acceptance. Ready for preparation within these limits; no implementation, release completion or independent acceptance is claimed.

## Historical registered execution — 28 October 2026

[FEAT-SP02-01](../features/sp-02-project-membership/plan.md) v0.1 and its ten task briefs own current detailed statuses. SP02-P01 records source/contract gaps; P02 may prepare exact-schema negatives and owner choices without adoption. D-03 capability provisioning, D-04 discovery and the additive persistence/transaction design are material gates. Existing last-manager/removal/rejoin/initial-creator defaults are retained rather than reopened. No new dependency, migration, application handler or Accepted ADR is implied.

## Current bounded handoff — 1 November 2026

[FEAT-SP02-01 v0.6](../features/sp-02-project-membership/plan.md) owns the P03A–P08/P10 verified bounded results. The [execution report](../../sdlc/reports/SP-02-execution-2026-10-31.md) maps actual AC-02/03/38/39 observations, native/browser failures and successful reruns. SP-03 is the next feature dependency. Optional FR-64, future actual SP02-F01 races, Knowledge/D-07 and formal/independent acceptance remain open.
