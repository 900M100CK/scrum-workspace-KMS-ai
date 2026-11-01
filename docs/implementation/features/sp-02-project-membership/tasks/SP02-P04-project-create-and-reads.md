# SP02-P04 — Create projects and read only current memberships

**Artifact ID:** SP02-P04\
**Version/date:** 0.5 Draft · 1 November 2026\
**Status:** Task brief; execution status belongs only to the parent plan.\
**Inputs:** [FEAT-SP02-01](../plan.md) v0.6; [SP-02](../../../../../specs/002-project-membership.md) v0.7; PRD-01 v0.9; Workspace v0.2.11; ADR-0007/0017; ADR-0019 v0.4 Proposed; ADR-0026 v0.3 Proposed.\
**Trace:** SP-02.2; FR-02/03/38/39; FR-64 only if selected; BR-01/10/14; SC-06 relevance without acceptance.

## Scope and prerequisites

Prerequisites: P03; relevant D-04 disposition. Allowed code paths: services/workspace/**, apps/web/**, tests/workspace/**; registered task/result documentation. P01/P02 preparation creates no app mechanism, migration or dependency. Root commands/contracts/shared metadata require a coordinated plan update. No Knowledge writes, applied migration edits, external data, agents or implicit commit authority.

## Work and assertions

Co-deliver createProject/listProjects/getProject with current authority, server metadata, initial creator membership/capability grants, atomic audit and operation-scoped idempotency.

Revised prerequisite: finalize and verify the compact durable outcome extension before enabling createProject; reuse it for later add/remove. Reuse idempotency_record instead of adding a generic HTTP-response receipt table; original Project/Member schema values require immutable minimal snapshots, not current-state reconstruction from status/ID alone. Coordinate the additive migration and contract/API/spec metadata before execution. No write endpoint may precede its co-committed replay protection.

Paging proposal: no cursor table. Finalize versioned signed cursors with current actor/membership/permission/scope/projection binding without login-session identity and explicit key configuration/rotation, rejection and payload nondisclosure tests. Preserve existing listMembers paging assertions; do not use a raw last-ID cursor or omit paging because an unmeasured dataset is expected to be small. Coordinate listProjects 400/409 responses before implementation. These mechanics remain Proposed under ADR-0026 v0.3.

AC-02/03: permitted creation; forbidden creation creates nothing; current member reads; unknown/nonmember same denial; replay rechecks authority and binds payload.

## Verification and handoff

Use actual operation-specific assertions from the parent plan and contract. Existing context/docs/contracts commands are prerequisites, not permission evidence. New SP-02 runtime commands are Planned until implemented. Real PostgreSQL tests must cover state/audit rollback, role limits and exact interleavings; UI/browser are distinct. Save a dated result, register it, and update only the parent plan's execution table. A Proposed ADR or a passing schema probe is not owner disposition.

Before P04/createProject, select an explicit watermark/digest and invalidation/read-consistency rules for each of listProjects and listMembers; the signed token alone is not a watermark. Preserve route/filter/order/page-size/expiry checks. A valid same-actor relogin does not itself invalidate a current cursor; unauthenticated or wrong-actor requests still reject. No session ID/token belongs in cursor payload or MAC context. Separately decide key/rotation/error behaviour before implementation.

## Corrected execution boundary

P04A owns design, P04B owns separate 008, P04C owns createProject. This task now only implements listProjects/getProject and reusable paging after P04C. Explicit tests: actor/scope/dataset/filter/expiry/tamper; valid same-actor relogin; missing/rotated-key behaviour; changed projections without items; revoked/missing identical 404; current permission recheck and no-store. Command: Node 24 --test tests/workspace/project-http.test.mjs.
