# SP02-P02 — Prepare the owner decision batch and contract negatives

**Artifact ID:** SP02-P02\
**Version/date:** 0.6 Draft · 1 November 2026\
**Status:** Task brief; execution status belongs only to the parent plan.\
**Inputs:** [FEAT-SP02-01](../plan.md) v0.6; [SP-02](../../../../../specs/002-project-membership.md) v0.7; PRD-01 v0.9; Workspace v0.2.11; ADR-0007/0017 and Proposed ADR-0019.\
**Trace:** SP-02.1; FR-02/03/38/39; FR-64 only if selected; BR-01/10/14; SC-06 relevance without acceptance.

## Scope and prerequisites

Prerequisites: P01. Allowed code paths: services/workspace/**, apps/web/**, tests/workspace/**; registered task/result documentation. P01/P02 preparation creates no app mechanism, migration or dependency. Root commands/contracts/shared metadata require a coordinated plan update. No Knowledge writes, applied migration edits, external data, agents or implicit commit authority.

## Work and assertions

Prepare bounded D-03/D-04 and persistence/idempotency/cursor options; run existing-schema negative probes without adopting application mechanics.

31 October continuation: D-03 and the bounded D-04 information scope are selected. Prepare the concrete Proposed 007 design, including exact schema/privileges, legacy refusal/rollback, session lock integration, replay and cursor handling, and test assertions before requesting schema/implementation disposition. Preparation documentation paths and exact checks are recorded in the parent plan. Preserve the historical schema probes and their evidence; no new runtime suite is implied.

Assertions use actual CreateProject/AddMember/Member/Project schemas; response/request confusion and authority fields reject; decisions remain explicit.

## Verification and handoff

Use actual operation-specific assertions from the parent plan and contract. Existing context/docs/contracts commands are prerequisites, not permission evidence. New SP-02 runtime commands are Planned until implemented. Real PostgreSQL tests must cover state/audit rollback, role limits and exact interleavings; UI/browser are distinct. Save a dated result, register it, and update only the parent plan's execution table. A Proposed ADR or a passing schema probe is not owner disposition.
