# Answer a current work-state question

**Artifact ID:** SP-10  
**Version/date:** 0.5.4 Draft · 14 November 2026
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.10.3; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-10--answer-a-current-work-state-question); [contract pack](../contracts/README.md); PLAN-01 v0.4.\; Proposed ADR-0020
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Implemented and verified within the synthetic fixture scope. **Target:** Month 3.\
**Dependencies:** SP-04, SP-09.   
**Trace:** FR-25, FR-26; BR-09, BR-10; SC-03.

## Goal and contract

Report current blockers from operational observations rather than historical text.

Use the Workspace contract in contracts/openapi/ for observeBlockedTasks and observeWorkState; Knowledge consumes the authenticated scoped observations for answers. Project/Sprint/Task observations are typed operational records, not embedded text. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. A resolved operational item contradicting an old blocked document is reported resolved.
2. Every operational source records entity and observation time/revision.
3. Entities outside project access are absent; Workspace outage gives explicit failure, not an embedded guess.

## Allowed paths and Done

Touch only: services/knowledge/**, Workspace observation, question, startup and shared operational projection paths under services/workspace/src/**, apps/web/**, tests/**. The coordinated Ask selector changes in contracts/openapi/** are in scope. Other shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses the applicable owner-confirmed directions through ADR-0017 and OWNER-Q-01. Additional delegation, physical retention, OD-09 identity and OD-12 framework details stay open. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: proceed under confirmed directions; resolve only remaining decisions relevant to implementation. No settled policy requires repeat approval.

**17 October input reconciliation:** FR-25/26: Workspace owns current operational observations; Knowledge consumes them without inferring state from documents. Reviewed against the current requirement rows and operation ownership. This is specification review, not implementation or full AC coverage evidence.

## SYS-01 complete operational handoff evidence

Proposed ADR-0020 requires every current operational entity used in context, including uncited observations, to bind project/source/entity kind/ID/entity revision/observation revision/time and entity snapshot digest. The transport uses a complete mixed manifest; bare entity IDs or one source_revision cannot replace per-source bindings. Test a document-plus-task answer with distinct observed entities and an uncited task changing between preparation and final validation: reject the whole stale draft before protected bytes, release guard and reprepare safely. Workspace outage cannot use embedded history as current truth. These are future live TC-26 assertions; no observation or relay handler is implemented.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.

## Fixture scope

The [registered plan](../docs/implementation/features/sp-10-current-work-question/plan.md) records explicit Current work scope. Existing guard and storage ADRs retain their status.
