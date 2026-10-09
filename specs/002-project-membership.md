# Create a project and manage membership

**Artifact ID:** SP-02  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** PRD-01 v0.4; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-02--create-a-project-and-manage-membership); [contract pack](../contracts/README.md); PLAN-01 v0.1.  
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

Proposed optional five-month rows: FR-64 Could. Omission needs recorded OD-11 approval and altered Core gate.

## Allowed paths and Done

Touch only: services/workspace/**, apps/web/**, tests/workspace/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses proposed OD-02–OD-04/OD-09/OD-12 and ADRs. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: Needs owner decision for affected baselines; authorised context work can proceed.
