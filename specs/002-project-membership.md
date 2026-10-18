# Create a project and manage membership

**Artifact ID:** SP-02  
**Version/date:** 0.3 Draft · 17 October 2026\
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.8; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-02--create-a-project-and-manage-membership); [contract pack](../contracts/README.md); PLAN-01 v0.3.\
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 1.  
**Dependencies:** SP-01.   
**Trace:** FR-02, FR-03, FR-38, FR-39, FR-64; BR-01, BR-10, BR-14; SC-06.

## Goal and contract

Set the authorised project scope and remove membership without grant revival.

Use workspace service contract in contracts/openapi/. Operation IDs: createProject, listProjects, addMember, removeMember, editProject. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. A nonmember and an unknown project receive indistinguishable protected read denial.
2. Removal denies project and document access; rejoining restores no restricted grant.
3. Only authorised membership changes create audit events.

Owner-confirmed optional release rows (ADR-0010): FR-64 Could. ADR-0010 records the exact Core-gate exceptions; all other release Must ACs remain required.

## Allowed paths and Done

Touch only: services/workspace/**, apps/web/**, tests/workspace/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses the applicable owner-confirmed directions through ADR-0017 and OWNER-Q-01. Additional delegation, physical retention, OD-09 identity and OD-12 framework details stay open. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: proceed under confirmed directions; resolve only remaining decisions relevant to implementation. No settled policy requires repeat approval.

ADR-0017 acceptance: remove a member with document/work/Sprint/audit/trace capabilities and assigned tasks; atomically invalidate all grants, unassign tasks with revision changes and durable audit, preserve history, and prove rejoin restores nothing. Race new grant/assignment and inject local audit failure; no partial removal is allowed.

ADR-0017 last-manager rule: reject removal of the final current member with effective membership-management authority until another current member has that authority. Check inside the serialized removal transaction, including concurrent removals/capability changes; no Admin/creator bypass or automatic successor. Rejection leaves all state unchanged.

**17 October input reconciliation:** FR-02/03/38/39/64 and ADR-0017: removal, capability invalidation, unassignment, rejoin and last-manager negatives remain mandatory. Reviewed against the current requirement rows and operation ownership. This is specification review, not implementation or full AC coverage evidence.
