# Create a task in the project backlog

**Artifact ID:** SP-03  
**Version/date:** 0.8 Draft · 2 November 2026
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; bounded local implementation/evidence exists; independent/release acceptance remains open.\
**Inputs:** Proposed ADR-0027 v0.2; PRD-01 v0.9; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-03--create-a-task-in-the-project-backlog); [contract pack](../contracts/README.md); PLAN-01 v0.4.\
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Implemented locally; final regression/handoff verification is recorded in FEAT-SP03-01. **Target:** Month 1.
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

Context commands remain structural only. Actual Task storage/HTTP/read/controller/DOM/browser commands and setup are in services/workspace/TASKS.md; FEAT-SP03-01 owns current results.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This source links bounded runnable implementation; whole-application and independent acceptance remain separate.

## Assumptions/checklist/handoff

Uses the applicable owner-confirmed directions through ADR-0017 and OWNER-Q-01. Additional delegation, physical retention, OD-09 identity and OD-12 framework details stay open. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: proceed under confirmed directions; resolve only remaining decisions relevant to implementation. No settled policy requires repeat approval.

**17 October input reconciliation:** FR-05: initial To Do, server identity, explicit type validation and project scope remain unchanged. Reviewed against the current requirement rows and operation ownership. This is specification review, not implementation or full AC coverage evidence.

## Operational reconstruction correction — 18 October 2026

listTasks now defines all versus Backlog scope, authoritative current work_location and numeric position ordering. Reload with a fresh client; do not retain allocation truth only in memory. See [ADR-0018](../docs/adr/0018-operational-read-projections.md). No application acceptance is claimed.

## Placement persistence follow-up — 18 October 2026

Use migration 003 / Proposed ADR-0018: create with Backlog marker and null Sprint reference; append after maximum Backlog position under project lock. Persist task, Backlog generation, audit and idempotent result atomically. Return work_location and provide TaskList.backlog_revision from the same read transaction. No runtime handler is claimed.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.

## SP-03 coordinated support scope — 2 November 2026

Owner objective: complete the registered SP-03 tasks. Owner selected project-scoped private audited backlog-author (no role/creator auto-grants), server-created immutable Task.created_at, and indefinite original Task 201 retention including title/description with current authority rechecked on replay. See [registered plan](../docs/implementation/features/sp-03-create-task/plan.md) and Proposed [ADR-0027](../docs/adr/0027-task-creation-foundation.md). This records direction and bounded paths, not runtime acceptance or formal ADR acceptance. UC-03 creation-time semantics remain binding.

P03A may edit contracts/openapi/workspace.openapi.json, contracts/data-model.json, contracts/README.md, docs/sdlc/api-design.md, docs/sdlc/data-design.md, tests/contracts/contract-schemas.test.mjs, tests/context/context.test.mjs and scripts/verify-context.mjs for Task.created_at and declared createTask 413/415/getTask 400 only. Coordinate source/version/register/generated metadata for these changes. P03B may synchronize the Workspace ERD Mermaid/Draw.io pair and manifest with actual additive 009 DDL. The registered feature plan/briefs/evidence and existing work/source/central/roadmap/review registers are allowed for scoped traceability. No other shared-rule, requirement, accepted ADR or unrelated diagram-body edit is included.

Required Task.created_at is a coordinated strict-consumer schema change; older additionalProperties=false consumers may reject it. Schema support precedes handlers and cannot prove consumer-provider/runtime compatibility. Applied migrations 001–008 remain unchanged; only disposable databases may exercise new migration 009. No production upgrade, API operation, dependency, task editing/Sprint/Knowledge/AI work or commit is authorized by this scope record.

P03B reproducibility support: docs/sdlc/diagrams/design-models.json may change only the DGM-DATA-01 task origin field, scope and ADR source entry to reproduce the selected Workspace ERD pair. Existing generator code/other design models remain unchanged; this exact support path is recorded before model edits.

P08 coordinated evidence paths (planned, registered before writing): docs/sdlc/reports/SP-03-2026-11-02-ui.md and docs/implementation/features/sp-03-create-task/evidence/ui-2026-11-02/ plus p08 captures/logs. These synthetic UI/browser outputs supplement the registered task without new product requirements or deployment authority. Existing P06 UI paths may receive bounded corrections exposed by P08 checks; no redesign/dependency is added.

P09 coordinated handoff paths (planned before writing): docs/sdlc/reports/SP-03-2026-11-02-execution.md; services/workspace/TASKS.md; owning feature evidence p09/source-inputs/completion-audit and unique UI rerun subdirectories. Update actual bounded trace/status in docs/sdlc/test-coverage.md, requirement-verification.md, test-plan.md and owning source/register metadata. Root README.md, AGENTS.md, docs/development-rules.md, services/workspace/README.md and apps/web/README.md may receive execution-status/command/runbook links only; no authority, permission, scope or planning-rule change. Preserve accepted ADRs/BRD, historical evidence and unrelated changes.

P09 also coordinates docs/implementation/tasks/03-create-task.md and tasks/README.md for the existing SP-03.1–SP-03.4 pack/catalogue backlink and evidence mapping only. Current task status remains exclusively in the feature plan; initial child definitions/status observations are historical. No master milestone/other pack completion is implied.

P09 foundation consumer support: services/workspace/test/app.test.ts may distinguish registered unconfigured Task 503/no-store from still-unknown/internal generic 404. This expectation follows the implemented routes; it does not weaken current-scope/permission tests or make liveness handler evidence.
