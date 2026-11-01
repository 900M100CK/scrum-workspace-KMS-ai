# SP02-P03 — Implement selected owned authority and private provisioning

**Artifact ID:** SP02-P03\
**Version/date:** 0.4 Draft · 1 November 2026\
**Status:** Task brief; execution status belongs only to the parent plan.\
**Inputs:** [FEAT-SP02-01](../plan.md) v0.6; [SP-02](../../../../../specs/002-project-membership.md) v0.7; PRD-01 v0.9; Workspace v0.2.11; ADR-0007/0017; ADR-0019 v0.4 Proposed; ADR-0026 v0.3 Proposed.\
**Trace:** SP-02.2; FR-02/03/38/39; FR-64 only if selected; BR-01/10/14; SC-06 relevance without acceptance.

## Scope and prerequisites

Prerequisites: P02 owner dispositions; approved additive schema design. Allowed code paths: services/workspace/**, apps/web/**, tests/workspace/**; registered task/result documentation. P01/P02 preparation creates no app mechanism, migration or dependency. Root commands/contracts/shared metadata require a coordinated plan update. No Knowledge writes, applied migration edits, external data, agents or implicit commit authority.

## Work and assertions

Implement selected explicit global/project capability persistence and private provisioning, atomic audit and account/session authority integration.

Revised proposal: P03A must first pass its session regression. Reduced migration 007 includes project creator/time, global create authority, private provisioning audit and numeric revision CHECK bounds only. Implement explicit first create-authority bootstrap through the private operator against a known enabled account, with audit/reason/expected revision; no automatic admin or public bootstrap. Project grants require current membership and project locking. Unknown operator outcome must be reconciled, not automatically retried. No public project/member write endpoint, replay extension or cursor table in P03. See Proposed ADR-0026 v0.3; adoption remains pending.

No role-name/creator permanent bypass; disabled/unknown/unavailable state denies; real role/forward/reverse/repeat/audit tests.

## Verification and handoff

Use actual operation-specific assertions from the parent plan and contract. Existing context/docs/contracts commands are prerequisites, not permission evidence. New SP-02 runtime commands are Planned until implemented. Real PostgreSQL tests must cover state/audit rollback, role limits and exact interleavings; UI/browser are distinct. Save a dated result, register it, and update only the parent plan's execution table. A Proposed ADR or a passing schema probe is not owner disposition.

## Corrected execution boundary

Prerequisite P03A passing regression. Explicit tests: 007 down rejects any authority/audit/project data; up refuses ambiguous legacy projects; 001–006 hashes remain; seed SP-01 clock fault then reverse/forward empty 007 and prove fault/audit unchanged; runtime cannot provision global authority or mutate provisioning audit; bootstrap/recovery uses private DB operator identity and never a disabled account; stale revisions/audit failure roll back. No 008 or public project endpoint here. Command: Node 24 --test tests/workspace/project-authority.test.mjs; result in SP-02 execution report.
