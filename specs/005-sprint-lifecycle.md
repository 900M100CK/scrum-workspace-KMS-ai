# Plan, start and complete a basic Sprint

**Artifact ID:** SP-05  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** PRD-01 v0.4; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-05--plan-start-and-complete-a-basic-sprint); [contract pack](../contracts/README.md); PLAN-01 v0.1.  
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 2.  
**Dependencies:** SP-04.   
**Trace:** FR-06, FR-07, FR-08, FR-41, FR-42, FR-66, FR-67; BR-02; SC-03.

## Goal and contract

Run the fixed Scrum lifecycle without introducing a workflow configuration engine.

Use workspace service contract in contracts/openapi/. Operation IDs: createSprint, allocateTask, startSprint, completeSprint, reorderBacklog, editSprint, removeAllocation. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. Two concurrent starts cannot create two Active Sprints in one project.
2. An item cannot belong to two Planned/Active Sprints.
3. Completion keeps completed work associated and returns unfinished work without marking it Done.

Proposed optional five-month rows: FR-66 Could, FR-67 Could. Omission needs recorded OD-11 approval and altered Core gate.

## Allowed paths and Done

Touch only: services/workspace/**, apps/web/**, tests/workspace/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses proposed OD-02–OD-04/OD-09/OD-12 and ADRs. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: Needs owner decision for affected baselines; authorised context work can proceed.
