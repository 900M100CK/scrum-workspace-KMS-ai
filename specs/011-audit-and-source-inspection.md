# Capture business audit and answer provenance

**Artifact ID:** SP-11  
**Version/date:** 0.4 Draft · 17 October 2026\
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.8; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-11--capture-business-audit-and-answer-provenance); [contract pack](../contracts/README.md); PLAN-01 v0.3.\
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 1 mutation capture; Month 3 answer receipts.  
**Dependencies:** SP-01.   
**Trace:** FR-31, FR-32, FR-57; BR-11, BR-12; SC-02, SC-06.

## Goal and contract

Record trustworthy change/run receipts from the first operation, independently of inspection UI.

Use both Workspace and Knowledge contracts in contracts/openapi/. Operation IDs: producer handler → owned audit/execution/provenance records; no new public endpoint. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

ADR-0012 adds mandatory failure assertions: audit or durable pending delivery commits in the same owning transaction as each mutation; minimum-record persistence failure rolls back business state. Sink-only failure retains the committed result and replayable record. Persist run ID and exact evidence before provider/answer handoff; mandatory persistence failure sends no protected bytes, while unavailable optional metrics are marked rather than fabricated.

1. Each committed catalogue mutation records actor/action/entity/time and protected before/after references; failed writes are not committed events.
2. Success/failure answer attempts correlate by run ID to trace and exact evidence identity, without private reasoning.
3. Capture tests run at the producing handler boundary; no inspection screen is required to establish the stored event.

## Allowed paths and Done

Touch only: services/workspace/**, services/knowledge/**, apps/web/**, tests/**, eval/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses the applicable owner-confirmed directions through ADR-0017 and OWNER-Q-01. Additional delegation, physical retention, OD-09 identity and OD-12 framework details stay open. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: proceed under confirmed directions; resolve only remaining decisions relevant to implementation. No settled policy requires repeat approval.

ADR-0012 / OWNER-Q-01 handoff assertion (TC-26): persist a complete immutable per-handoff manifest outside the guard, await durable acknowledgement, acquire the guard and match the frozen payload, entire evidence set and recorded revisions. Any mismatch sends zero bytes and releases the guard before a bounded fresh manifest/attempt. Fail persistence and race revocation/version/observation changes; test consumed-identity replay and crash/restart without resuming an old send. Guard remains held through valid transport completion/abort. Schema/handler tests are Not run.

**17 October input reconciliation:** FR-31/32/57 and ADR-0012: atomic minimum audit and immutable pre-handoff evidence remain required. Reviewed against the current requirement rows and operation ownership. This is specification review, not implementation or full AC coverage evidence.
