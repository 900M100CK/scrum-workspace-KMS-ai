# Create a task in the project backlog

**Artifact ID:** SP-03  
**Version/date:** 0.2 Draft · 13 October 2026\
**Status:** Draft for owner review; ADR-0007–ADR-0011 direction is owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.5; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-03--create-a-task-in-the-project-backlog); [contract pack](../contracts/README.md); PLAN-01 v0.2.\
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 1.  
**Dependencies:** SP-02.   
**Trace:** FR-05; BR-02; SC-01.

## Goal and contract

Persist one Story/Task/Bug in the correct authorised project and basic board state.

Use workspace service contract in contracts/openapi/. Operation IDs: createTask, listTasks, getTask. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. Creation returns 201 with server ID, project and initial todo state.
2. Unsupported type fails validation and makes no item.
3. A cross-project attempt discloses no resource; a new read returns the committed item.

## Allowed paths and Done

Touch only: services/workspace/**, apps/web/**, tests/workspace/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses owner-confirmed ADR-0007–ADR-0011; remaining delegation/history, OD-09 identity and OD-12 framework details stay open. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: Needs owner decision for affected baselines; authorised context work can proceed.
