# Inspect scoped audit and answer evidence

**Artifact ID:** SP-13  
**Version/date:** 0.6 Draft · 25 October 2026
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.9; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-13--inspect-scoped-audit-and-answer-evidence); [contract pack](../contracts/README.md); PLAN-01 v0.4.\; Proposed ADR-0021
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
2. After source revocation, no protected excerpt/title/payload is shown. An inspector retaining current project membership and scoped audit-read may still see in-scope actor/action/entity identity/time under ADR-0012; trace-read alone does not inherit this entitlement. The same actor must still fail direct source/citation/retrieval/AI access without a read grant. Revoke the audit capability and verify the event/identity also becomes inaccessible.
3. Bounded summary exposes actual query, permitted source/version/passage ranks and validation outcomes without private reasoning.

Owner-confirmed optional release rows (ADR-0010): FR-27 Should. ADR-0010 records the exact Core-gate exceptions; all other release Must ACs remain required.

## Allowed paths and Done

Touch only: services/workspace/**, services/knowledge/**, apps/web/**, tests/**, eval/**. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses the applicable owner-confirmed directions through ADR-0017 and OWNER-Q-01. Additional delegation, physical retention, OD-09 identity and OD-12 framework details stay open. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: proceed under confirmed directions; resolve only remaining decisions relevant to implementation. No settled policy requires repeat approval.

**17 October input reconciliation:** FR-27/56/58 and ADR-0012: scoped audit identity is distinct from content/citation and trace entitlement. Reviewed against the current requirement rows and operation ownership. This is specification review, not implementation or full AC coverage evidence.

## P2-R02 independent run discovery

Workspace getAllowedActions is also consumed by this slice. Run scope independently evaluates getRetrievalSummary for a current permitted answer reader (FR-27 Should, only when implemented) and getTrace for current scoped trace-read (FR-58 Must). Neither grant implies the other; audit-read grants neither. Return only allowed operation names, with generic 404 when neither entitlement exists. Each operation rechecks current project/source scope and its own disclosure rules; a cached discovery response grants nothing.

Future handler acceptance pairs: answer reader without trace-read sees summary only; scoped execution inspector without answer entitlement sees trace only; actor with both sees both; unrelated member or revoked reader with neither sees generic 404. Revoking only one entitlement removes its action while independently held other access survives. Source-revoked details must be omitted according to each operation. Authority failure yields no cached allow or content. Summary remains optional and no trace-read policy is broadened. Harness tests cover declaration distinction, not these access decisions.

## NEXT-03 inspection assertions

Use Trace and optional RetrievalSummary from Knowledge v0.2.7 under Proposed ADR-0021. Inspect actual query and recorded steps, exact document/version/passage or operational kind/ID/entity revision/observation revision/time, source-to-step rank binding and typed validation results. Trace carries permitted execution stages/configuration/run metrics; bounded summary only retrieval/citation stages and remains Should. Current permitted-answer-reader and trace-read entitlements remain independent.

Test two retrieval steps, repeated source participation, mixed document/operational evidence, measured zero versus unavailable timing/usage and truly not_performed stages. After source revocation, omit denied identities and dependent query/check data, preserve relative permitted order and renumber visible ranks without gaps or hidden counts. Unknown authority fails closed; missing mandatory records never become empty success. Exact source opening rechecks current access and never substitutes a new version; operational observations remain historical evidence. No private reasoning/raw provider or tool logs. These are future handler/consumer assertions; harness tests check declarations only.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.
