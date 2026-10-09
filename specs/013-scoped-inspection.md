# Inspect scoped audit and answer evidence

**Artifact ID:** SP-13  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** PRD-01 v0.4; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-13--inspect-scoped-audit-and-answer-evidence); [contract pack](../contracts/README.md); PLAN-01 v0.1.  
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 4.  
**Dependencies:** SP-11, SP-09.   
**Trace:** FR-27, FR-56, FR-58; BR-12, BR-10, BR-11; SC-02, SC-06.

## Goal and contract

Let permitted users inspect recorded changes/retrieval while enforcing current source and log scope.

Use both Workspace and Knowledge contracts in contracts/openapi/. Operation IDs: listAudit, getTrace, getRetrievalSummary. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. Audit/trace capability is scoped and gives no blanket document content access.
2. After source revocation, re-open inspection with no revoked excerpt/metadata.
3. Bounded summary exposes actual query, permitted source/version/passage ranks and validation outcomes without private reasoning.

Proposed optional five-month rows: FR-27 Should. Omission needs recorded OD-11 approval and altered Core gate.

## Allowed paths and Done

Touch only: services/workspace/**, services/knowledge/**, apps/web/**, tests/**, eval/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses proposed OD-02–OD-04/OD-09/OD-12 and ADRs. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: Needs owner decision for affected baselines; authorised context work can proceed.
