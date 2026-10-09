# Find linked knowledge without AI

**Artifact ID:** SP-08  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** PRD-01 v0.4; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-08--find-linked-knowledge-without-ai); [contract pack](../contracts/README.md); PLAN-01 v0.1.  
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 2.  
**Dependencies:** SP-06, SP-03.   
**Trace:** FR-16, FR-17, FR-18, FR-20, FR-34, FR-49, FR-59, FR-63; BR-06, BR-10, BR-07, BR-13, BR-01; SC-01, SC-04, SC-08.

## Goal and contract

Address scattered context with explicit links and an AI-independent keyword path.

Use knowledge service contract in contracts/openapi/. Operation IDs: createLink, listLinks, removeLink, keywordSearch. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. Link views conceal inaccessible target metadata and hidden counts.
2. Keyword search filters project AND document scope before returning results.
3. Unknown and inaccessible reads use the same not-found-equivalent response; model/embedding outage leaves keyword search usable.

Proposed optional five-month rows: FR-49 Should. Omission needs recorded OD-11 approval and altered Core gate.

## Allowed paths and Done

Touch only: services/knowledge/**, apps/web/**, tests/knowledge/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses proposed OD-02–OD-04/OD-09/OD-12 and ADRs. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: Needs owner decision for affected baselines; authorised context work can proceed.
