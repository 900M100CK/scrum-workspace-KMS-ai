# Revise, publish and retire a knowledge version

**Artifact ID:** SP-07  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** PRD-01 v0.4; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-07--revise-publish-and-retire-a-knowledge-version); [contract pack](../contracts/README.md); PLAN-01 v0.1.  
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 2.  
**Dependencies:** SP-06.   
**Trace:** FR-11, FR-12, FR-13, FR-15, FR-19, FR-45, FR-47, FR-48, FR-61; BR-05, BR-14, BR-07, BR-12; SC-05, SC-06.

## Goal and contract

Keep immutable evidence and distinguish Draft, Current and historical sources.

Use knowledge service contract in contracts/openapi/. Operation IDs: reviseDocument, publishVersion, archiveVersion, deleteDocument, getVersion, getReadiness. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. Revision creates Draft; Draft is absent from keyword/semantic/history/context and readable only with content-write authority.
2. Publishing makes replacement Current and previous Current Superseded without changing old passages.
3. Archive/deletion and duplicate/out-of-order jobs cannot revive obsolete content; old citation never substitutes a version.

## Allowed paths and Done

Touch only: services/knowledge/**, apps/web/**, tests/knowledge/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses proposed OD-02–OD-04/OD-09/OD-12 and ADRs. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: Needs owner decision for affected baselines; authorised context work can proceed.
