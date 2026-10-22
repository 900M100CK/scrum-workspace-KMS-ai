# Update work state and record blockers

**Artifact ID:** SP-04  
**Version/date:** 0.6 Draft · 18 October 2026
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.9; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-04--update-work-state-and-record-blockers); [contract pack](../contracts/README.md); PLAN-01 v0.3.\
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 1.  
**Dependencies:** SP-03.   
**Trace:** FR-09, FR-40, FR-43, FR-44; BR-03, BR-02, BR-06; SC-03, SC-04.

## Goal and contract

Update a task without stale overwrite and retain blocker resolution evidence.

Use workspace service contract in contracts/openapi/. Operation IDs: editTask, setTaskState, setAssignee, recordBlocker. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. Expected revision mismatch returns conflict and preserves the newer update.
2. A nonmember cannot become assignee.
3. Latest Open means blocked; latest Resolved means unblocked, with ordered history.
4. Any direct change between To Do, In Progress and Done is allowed for an authorised member with the expected revision, including reopening Done. Persist audit and expose the committed result on refresh; no automatic Scrum Master approval.
5. Reopen a Done task from a Completed Sprint: atomically set To Do and return it to Product Backlog (including a requested In Progress reopen target), preserve completed allocation history and keep the Sprint Completed. Race reopening against Sprint completion/allocation; no stale overwrite or two current allocations is allowed (ADR-0008 v0.3).

## Allowed paths and Done

Touch only: services/workspace/**, apps/web/**, tests/workspace/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses the applicable owner-confirmed directions through ADR-0017 and OWNER-Q-01. Additional delegation, physical retention, OD-09 identity and OD-12 framework details stay open. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: proceed under confirmed directions; resolve only remaining decisions relevant to implementation. No settled policy requires repeat approval.

ADR-0017: assignment checks current membership and serializes against removal. Member removal clears current assignee and increments task revision without changing state/allocation/history; rejoin never reassigns automatically.

**17 October input reconciliation:** FR-09/40/43/44, ADR-0008 and OWNER-Q-01: direct transitions and Completed-Sprint reopening to Backlog/To Do are retained. Reviewed against the current requirement rows and operation ownership. This is specification review, not implementation or full AC coverage evidence.

## Operational reconstruction correction — 18 October 2026

Use listBlockerEvents for member-facing history in ascending sequence. Test current membership on every page, empty history, foreign/stale cursor rejection and reconstruction after reconnect. No audit-read dependency. See [ADR-0018](../docs/adr/0018-operational-read-projections.md). No application acceptance is claimed.

## Reopen persistence follow-up — 18 October 2026

Proposed ADR-0018/migration 003 persist current placement separately. Test complete in A, reopen Backlog/To Do, mark Done in Backlog, then allocate to B while A's completed association remains unchanged. Placement changes bump task revision; crossing the Backlog boundary changes backlog_revision. Rejected/rolled-back writes preserve both. Current read authority/audit/handler evidence remains required.
