# Establish and end a session

**Artifact ID:** SP-01  
**Version/date:** 0.4 Draft · 25 October 2026\
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.9; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-01--establish-and-end-a-session); [contract pack](../contracts/README.md); PLAN-01 v0.4.\
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Unimplemented. **Target:** Month 1.  
**Dependencies:** Context/contract baseline.   
**Trace:** FR-01, FR-36, FR-37, FR-68; BR-01, BR-10; SC-06.

## Goal and contract

Use an authenticated session whose expiry and sign-out end protected access.

Use workspace service contract in contracts/openapi/. Operation IDs: signIn, signOut, getSession. Server identity/permission is never asserted in client fields. SP-11 captures records inside every producing operation.

## Input/output and edges

Input: credentials for signIn; an authenticated session for protected session operations. Session-expiry/sign-out behavior follows the operation contract. Expected revision and scoped idempotency keys apply only where that operation requires them. Output: confirmed owned record/evidence with server identity/revision, or explicit validation/conflict/denial/pending/provider failure. Test invalid/unknown input, denied target, stale request, duplicate key, membership removal/rejoin, source replacement/deletion and service outage where relevant. No protected content in error/log output.

## Acceptance

1. Invalid authentication yields no session.
2. A forged requester ID cannot change the session actor.
3. Sign-out and expired-session reuse fail protected reads.

## Allowed paths and Done

Touch only: services/workspace/**, apps/web/**, tests/workspace/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses the applicable owner-confirmed directions through ADR-0017 and OWNER-Q-01. Additional delegation, physical retention, OD-09 identity and OD-12 framework details stay open. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: proceed under confirmed directions; resolve only remaining decisions relevant to implementation. No settled policy requires repeat approval.

**17 October input reconciliation:** FR-01/36/37/68: sign-in establishes a session; expiry and sign-out end access. Sign-in does not require an existing session. Reviewed against the current requirement rows and operation ownership. This is specification review, not implementation or full AC coverage evidence.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.
