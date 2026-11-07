# Verify fallback and evaluate the evidence pipeline

**Artifact ID:** SP-12  
**Version/date:** 0.4.3 Draft · 4 November 2026\
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.10.3; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-12--continue-work-during-ai-failure); [contract pack](../contracts/README.md); PLAN-01 v0.4.\
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 4.  
**Dependencies:** SP-05, SP-09, SP-10.   
**Trace:** FR-33; BR-13; SC-08.

## Goal and contract

Produce measured retrieval, citation and fallback evidence before the final month.

Use both Workspace and Knowledge contracts in contracts/openapi/. Operation IDs: no new endpoint; invoke approved operational/AI interfaces. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. In every AC-33 failure mode, independent work/document operations succeed under healthy own dependencies.
2. Maintain the separate 25-case research (8 document / 8 state / 9 combined) and 25-case safety suites, with source/version/access and claim rubrics; separate retrieval and generation.
3. Freeze post-pilot criteria before final run and keep negative results; no speed/quality improvement claim without matched baseline.

## Allowed paths and Done

Touch only: services/workspace/**, services/knowledge/**, apps/web/**, tests/**, eval/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses the applicable owner-confirmed directions through ADR-0017 and OWNER-Q-01. Additional delegation, physical retention, OD-09 identity and OD-12 framework details stay open. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: proceed under confirmed directions; resolve only remaining decisions relevant to implementation. No settled policy requires repeat approval.

**17 October input reconciliation:** FR-33 and the evaluation definitions: retain separate 25-case research and 25-case safety suites with unrun results. Reviewed against the current requirement rows and operation ownership. This is specification review, not implementation or full AC coverage evidence.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.
