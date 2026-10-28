# SP02-P10 — Verify bounded SP-02 and hand off to SP-03

**Artifact ID:** SP02-P10\
**Version/date:** 0.1 Draft · 28 October 2026\
**Status:** Task brief; execution status belongs only to the parent plan.\
**Inputs:** [FEAT-SP02-01](../plan.md) v0.1; [SP-02](../../../../../specs/002-project-membership.md) v0.5; PRD-01 v0.9; Workspace v0.2.10; ADR-0007/0017 and Proposed ADR-0019.\
**Trace:** SP-02.4; FR-02/03/38/39; FR-64 only if selected; BR-01/10/14; SC-06 relevance without acceptance.

## Scope and prerequisites

Prerequisites: P01–P08; P09 only if explicitly included. Allowed code paths: services/workspace/**, apps/web/**, tests/workspace/**; registered task/result documentation. P01/P02 preparation creates no app mechanism, migration or dependency. Root commands/contracts/shared metadata require a coordinated plan update. No Knowledge writes, applied migration edits, external data, agents or implicit commit authority.

## Work and assertions

Run actual service/DB/UI/browser regressions, map ACs, preserve failed attempts, capture authorised screenshots and record remaining upstream/transport/release gates.

No full SC-06/TC-02 or unimplemented Knowledge/D-07 acceptance inferred; matching source/results and parent links; no self-approval.

## Verification and handoff

Use actual operation-specific assertions from the parent plan and contract. Existing context/docs/contracts commands are prerequisites, not permission evidence. New SP-02 runtime commands are Planned until implemented. Real PostgreSQL tests must cover state/audit rollback, role limits and exact interleavings; UI/browser are distinct. Save a dated result, register it, and update only the parent plan's execution table. A Proposed ADR or a passing schema probe is not owner disposition.
