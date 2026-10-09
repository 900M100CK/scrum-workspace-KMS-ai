# Answer a current work-state question

**Artifact ID:** SP-10  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** PRD-01 v0.4; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-10--answer-a-current-work-state-question); [contract pack](../contracts/README.md); PLAN-01 v0.1.  
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 3.  
**Dependencies:** SP-04, SP-09.   
**Trace:** FR-25, FR-26; BR-09, BR-10; SC-03.

## Goal and contract

Report current blockers from operational observations rather than historical text.

Use knowledge service contract in contracts/openapi/. Operation IDs: observeBlockedTasks, observeWorkState. Project/Sprint/Task observations are typed operational records, not embedded text. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. A resolved operational item contradicting an old blocked document is reported resolved.
2. Every operational source records entity and observation time/revision.
3. Entities outside project access are absent; Workspace outage gives explicit failure, not an embedded guess.

## Allowed paths and Done

Touch only: services/knowledge/**, services/workspace/observations/**, apps/web/**, tests/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses proposed OD-02–OD-04/OD-09/OD-12 and ADRs. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: Needs owner decision for affected baselines; authorised context work can proceed.
