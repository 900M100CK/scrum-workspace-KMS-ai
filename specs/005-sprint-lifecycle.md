# Plan, start and complete a basic Sprint

**Artifact ID:** SP-05  
**Version/date:** 0.7.2 Draft · 3 November 2026
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.10.1; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-05--plan-start-and-complete-a-basic-sprint); [contract pack](../contracts/README.md); PLAN-01 v0.4.\
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
3. Completion keeps Done work associated and returns unfinished work as To Do, with task revision and minimum audit in the same Workspace transaction. Optional removal of unfinished work has the same reset; test rollback and same-key replay.

Owner-confirmed optional release rows (ADR-0010): FR-66 Could, FR-67 Could. ADR-0010 records the exact Core-gate exceptions; all other release Must ACs remain required.

## Allowed paths and Done

Touch only: services/workspace/**, apps/web/**, tests/workspace/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses the applicable owner-confirmed directions through ADR-0017 and OWNER-Q-01. Additional delegation, physical retention, OD-09 identity and OD-12 framework details stay open. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: proceed under confirmed directions; resolve only remaining decisions relevant to implementation. No settled policy requires repeat approval.

## Multiple-selection clarification - 14 October 2026

ADR-0014 preserves multiple task selection and per-task results. The UI invokes allocateTask separately with a distinct stable key/payload per item and aggregates confirmed allocated/rejected outcomes. Unknown transport outcomes stay reconciling until the same-key outcome is resolved; never relabel a possible commit as failure or repeat the whole selection with fresh keys. Earlier successes remain committed. Recheck authority, lifecycle, expected revision and exclusive current allocation for each item; hide inaccessible task and competing-Sprint metadata. Test mixed valid/conflicting selection, lost response replay, permission change between items and reconnect. No batch endpoint or runtime evidence is claimed.

**17 October input reconciliation:** FR-06/07/08/41/42/66/67 and ADR-0014: per-task allocation outcomes, one Active Sprint and unfinished To Do return are retained. Reviewed against the current requirement rows and operation ownership. This is specification review, not implementation or full AC coverage evidence.

## Operational reconstruction correction — 18 October 2026

Use listSprintItems, listTasks and getSprint to reconstruct current allocation and retained completed/returned associations. Current task state is not historical completion state. SprintCompletion returns transactional retained/returned counts. Test fresh-client reconstruction after completion/reopening and discard mixed/stale pages on 409. See [ADR-0018](../docs/adr/0018-operational-read-projections.md). No application acceptance is claimed.

## Full-list reorder and location follow-up — 18 October 2026

Proposed ADR-0018 and DATA-04 define atomic current location, retained completed history and project.backlog_revision. Read every listTasks(location=backlog) page with the same backlog_revision and a terminal null cursor. Submit the complete permutation; expected_revision is that exact decimal-string value. Never reorder only a visible page/search result. Reject missing/foreign/non-Backlog or stale sets generically, duplicates as invalid input, and empty input unless Backlog is empty. Identical order is a no-op. Actual reorder writes positions 1..N, changed task revisions, audit and idempotent receipt together; successful same-key replay returns the original receipt after renewed authority. Refresh before another edit. Test concurrent allocation/return/reorder and unknown outcomes; no runtime handler is claimed.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.
