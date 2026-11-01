# SP02-P05 — Add/list members and discover current applicable actions

**Artifact ID:** SP02-P05\
**Version/date:** 0.3 Draft · 1 November 2026\
**Status:** Task brief; execution status belongs only to the parent plan.\
**Inputs:** [FEAT-SP02-01](../plan.md) v0.6; [SP-02](../../../../../specs/002-project-membership.md) v0.7; PRD-01 v0.9; Workspace v0.2.11; ADR-0007/0017 and Proposed ADR-0019.\
**Trace:** SP-02.2; FR-02/03/38/39; FR-64 only if selected; BR-01/10/14; SC-06 relevance without acceptance.

## Scope and prerequisites

Prerequisites: P04; D-04 bounded discovery design. Allowed code paths: services/workspace/**, apps/web/**, tests/workspace/**; registered task/result documentation. P01/P02 preparation creates no app mechanism, migration or dependency. Root commands/contracts/shared metadata require a coordinated plan update. No Knowledge writes, applied migration edits, external data, agents or implicit commit authority.

## Work and assertions

Co-deliver addMember/listMembers and applicable getAllowedActions global/project scope, exact existing selectors/cursors and minimal outputs.

Known registered account only; descriptive role grants no authority; no emails/global directory; stale/foreign/malformed cursor and unknown scope deny; advisory projection never authorizes writes.

## Verification and handoff

Use actual operation-specific assertions from the parent plan and contract. Existing context/docs/contracts commands are prerequisites, not permission evidence. New SP-02 runtime commands are Planned until implemented. Real PostgreSQL tests must cover state/audit rollback, role limits and exact interleavings; UI/browser are distinct. Save a dated result, register it, and update only the parent plan's execution table. A Proposed ADR or a passing schema probe is not owner disposition.

## Corrected execution boundary

This task exclusively owns addMember for BOTH new membership and rejoin: new generation/revision, no stale capability/read grant/assignment restoration, exact historical Member snapshot on replay, no role-based grant. P06 owns removal only and end-to-end removal/rejoin regression. Test enabled known account, inactive/active/unknown target, forged selectors, action omission for unimplemented scopes and controlled revision overflow response (declared conflict, never 500). Command: Node 24 --test tests/workspace/membership-lifecycle.test.mjs.
