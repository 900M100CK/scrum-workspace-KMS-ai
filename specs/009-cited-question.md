# Answer a question with exact accessible evidence

**Artifact ID:** SP-09  
**Version/date:** 0.2 Draft · 13 October 2026\
**Status:** Draft for owner review; ADR-0007–ADR-0011 direction is owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.5; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-09--answer-a-question-with-exact-accessible-evidence); [contract pack](../contracts/README.md); PLAN-01 v0.2.\
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 3.  
**Dependencies:** SP-07, SP-08, SP-11. SP-11 is the capture interface, not SP-13 inspection UI.  
**Trace:** FR-21, FR-22, FR-23, FR-24, FR-28, FR-29, FR-30, FR-46, FR-53, FR-54, FR-55, FR-60, FR-69; BR-08, BR-10, BR-12, BR-07, BR-13; SC-02, SC-06, SC-07, SC-08.

## Goal and contract

Answer an English question with exact citations or explicit insufficiency/conflict/failure.

Use knowledge service contract in contracts/openapi/. Operation IDs: askQuestion, openCitation, semanticSearch. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: valid session, operation-specific fields, expected revision and scoped idempotency key where required. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. Semantic paraphrase retrieval finds a permitted reference passage; generation never receives a restricted-to-user candidate.
2. Citation IDs come from retrieved records; invented IDs and wrong passage/version are rejected.
3. Pause before context submission or delivery, revoke, resume: no revoked context crosses the tested boundary and the entire original answer draft is withheld.
4. Prompt injection causes no write action; timeout/budget/provider failure returns no generated answer.

## Allowed paths and Done

Touch only: services/knowledge/**, services/workspace/gateway/**, services/workspace/policy/**, apps/web/**, tests/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses owner-confirmed ADR-0007–ADR-0011; remaining delegation/history, OD-09 identity and OD-12 framework details stay open. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: Needs owner decision for affected baselines; authorised context work can proceed.

## Owner clarification - 14 October 2026

Invented citation identities invalidate the original answer draft. A bounded replacement must recheck claim support, exact citation binding, current access and mandatory provenance before delivery; removing the invalid citation alone is insufficient. Failure to produce a validated replacement returns the generic AnswerWithheld response. Include a fixture where an invented citation accompanies an unsupported claim and assert that neither the original claim nor its fabricated locator is delivered.

ADR-0013 binds this slice: surviving unavailable citation identity requires current membership and retained document-read policy, with exact locator verification and no content substitution; revoked/audit-only/unknown readers get generic 404. Terminal answer withholding uses fixed HTTP 503 AnswerWithheld without evidence or detailed cause. These are required runtime assertions, not passes from schema checks.

ADR-0015 additionally requires partially_answered for supported cited components plus missing requested components. Test that the response has real support, no hidden-source hints and no salvaged invalid draft; all-missing remains insufficient_evidence.
