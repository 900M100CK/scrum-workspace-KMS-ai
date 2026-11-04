# Update work state and record blockers

**Artifact ID:** SP-04  
**Version/date:** 0.7.4 Draft · 4 November 2026
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.10.1; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-04--update-work-state-and-record-blockers); [contract pack](../contracts/README.md) v0.25.1; PLAN-01 v0.4.\; Proposed ADR-0028 v0.1
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Task handlers and connected UI have bounded evidence; actual SP-05 integration remains open. **Target:** Month 1.
**Dependencies:** SP-03.   
**Trace:** FR-09, FR-40, FR-43, FR-44; BR-03, BR-02, BR-06; SC-03, SC-04.

## Goal and contract

Update a task without stale overwrite and retain blocker resolution evidence.

Use workspace service contract in contracts/openapi/. Operation IDs: editTask, setTaskState, setAssignee, recordBlocker. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. For new operations, expected revision mismatch returns generic409 state_conflict and preserves the newer update; client reads getTask under current authority, without an extra current_revision field. Committed original-key replay follows acceptance7.
2. A new non-null assignee must be an enabled current member of the same project; unknown, nonmember, foreign-project and disabled targets are rejected after caller Task/action checks without changing the prior assignee. Null unassign is allowed with current assignment authority.
3. Latest committed sequence Open means blocked; latest Resolved means unblocked, with ordered append-only history. Blocker201 acknowledges the event only; UI refreshes current Task/history for blocked/revision. Every distinct accepted event advances Task revision; same-key replay does not append again.
4. Any direct change between To Do, In Progress and Done is allowed for an authorised member with the expected revision, including reopening Done. Persist audit and expose the committed result on refresh; no automatic Scrum Master approval.
5. Reopen a Done task from a Completed Sprint: atomically set To Do and return it to Product Backlog (including a requested In Progress reopen target), preserve completed allocation history and keep the Sprint Completed. Race reopening against Sprint completion/allocation; no stale overwrite or two current allocations is allowed (ADR-0008 v0.3).

6. New Backlog content edits require separate edit authority; creator, create-only backlog-author and role labels grant none. Every new write and original-result replay requires current session, Task/project read scope and the exact requested action.
7. Retain original edit/state/assignment200 Task (including title/description) and blocker201 indefinitely with consumed actor/operation/key/hash. Committed same-input replay returns the historical original after current authority checks, without applying live write revision/old assignee eligibility/placement or mutating again; current UI state comes from fresh reads. Changed input conflicts. Known pre-commit failure rolls back business/audit/outcome together; lost acknowledgement remains unknown and reconciles only the original identity/body.

## Allowed paths and Done

Runtime implementation paths: services/workspace/**, apps/web/**, tests/workspace/**. Shared sources are read dependencies except for the explicitly registered coordinated support slices below. No other-service database writes.

**Coordinated SP-04 source support:** [FEAT-SP04-01](../docs/implementation/features/sp-04-update-task/plan.md) owns current small-task status. P03A transport declarations/metadata were reconciled by its coordinator; historical preregistration evidence limits remain in that disposition. P03A2 is explicitly owner-requested and registered before further source edits: docs/sdlc/PRD_SRS.md (existing AC rows), docs/sdlc/use-cases.md (UC-03 edit and UC-04), docs/sdlc/data-design.md, docs/sdlc/api-design.md, contracts/README.md, contracts/data-model.json (existing metadata/constraints only), this spec, docs/sdlc/test-plan.md, test-coverage.md, requirement-verification.md, new Proposed docs/adr/0028-task-mutation-authority-and-outcomes.md and docs/adr/README.md. The owning feature folder/registers, ADR index, manifest/generated metadata and required current input/version aliases with patch registrations are support scope as enumerated in [SP04-P03A2](../docs/implementation/features/sp-04-update-task/tasks/P03A2-policy-source-alignment.md). No existing ADR, BRD/baseline, OpenAPI schema, runtime, migration or test implementation changes belong to P03A2. Future P03B code/storage changes need their own exact brief and additive migration tests.

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

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.

## Transport contract support reconciliation — 3 November 2026

Workspace contract v0.2.13 declares bounded HTTP 413 and 415 error responses for editTask, setTaskState, setAssignee and recordBlocker. Handlers and database migrations remain unimplemented at this support checkpoint.

## P03A2 selected-policy source alignment — 3 November 2026

[SP04-OWNER-01](../docs/implementation/features/sp-04-update-task/owner-decisions.md) records actual decisions; [ADR-0028](../docs/adr/0028-task-mutation-authority-and-outcomes.md) remains Proposed mechanics. AC-09/40/43/44 and UC-03/04 are aligned without new IDs/priorities or wire schema changes. The [owning plan](../docs/implementation/features/sp-04-update-task/plan.md) controls current preparation and future producer briefs. Structural checks do not satisfy real-handler/persisted-state Done or actual SP-05 integration.


## SP-04 implementation checkpoint — 4 November 2026

The owner authorised remaining Task commands/history/UI and a checkpoint commit before hotfix switch, explicitly retaining the actual SP-05 integration gate. The owning plan v0.14 and continuation result identify real Task handlers/PG/HTTPS/DOM/browser results, failures and source limits. Completed Sprint seeding verifies reopen persistence only, not actual completeSprint/allocateTask races. No whole-feature/independent acceptance, Must deferral, Sprint handler, migration upgrade or wire change is inferred. This coordinated status correction and IMPL-SP-04 navigation are within the saved continuation support scope.
