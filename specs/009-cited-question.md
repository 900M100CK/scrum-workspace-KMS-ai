# Answer a question with exact accessible evidence

**Artifact ID:** SP-09  
**Version/date:** 0.9.4 Draft · 13 November 2026
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.10.3; [architecture](../docs/architecture.md); [use case](../docs/sdlc/use-cases.md#uc-09--answer-a-question-with-exact-accessible-evidence); [contract pack](../contracts/README.md); PLAN-01 v0.4.\; Proposed ADR-0020; Proposed ADR-0023
**Author:** development agent acting sequentially; owner reviews business choices.

**Status:** Bounded implementation with fixture verification. **Target:** Month 3.\
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

Touch only: services/knowledge/**, services/workspace/src/{documents,policy,questions,session}/**, Workspace startup wiring, apps/web/**, tests/** and registered feature planning records. Shared contracts/rules are read dependencies; changing them requires a recorded change and dependent-spec update. No other-service database writes.

Current commands: npm run context:check and npm run context:test validate context/contracts only.

Done requires the matching PRD ACs exercised on real handlers/persisted state; relevant unit and consumer/provider contract checks; access/version/concurrency/failure negatives; visible UI result where appropriate; evidence in backlog and no known unauthorised access. Add real application build/test/lint commands only when those entry points exist. This draft is reviewable, not a finished runnable application task.

## Assumptions/checklist/handoff

Uses the applicable owner-confirmed directions through ADR-0017 and OWNER-Q-01. Additional delegation, physical retention, OD-09 identity and OD-12 framework details stay open. Pass for goal/trace/input-output/edges/paths/Done; Gap for accepted policy/contract/stack and runtime tests. Handoff: proceed under confirmed directions; resolve only remaining decisions relevant to implementation. No settled policy requires repeat approval.

## Owner clarification - 14 October 2026

Invented citation identities invalidate the original answer draft. A bounded replacement must recheck claim support, exact citation binding, current access and mandatory provenance before delivery; removing the invalid citation alone is insufficient. Failure to produce a validated replacement returns the generic AnswerWithheld response. Include a fixture where an invented citation accompanies an unsupported claim and assert that neither the original claim nor its fabricated locator is delivered.

ADR-0013 binds this slice: surviving unavailable citation identity requires current membership and retained document-read policy, with exact locator verification and no content substitution; revoked/audit-only/unknown readers get generic 404. Terminal answer withholding uses fixed HTTP 503 AnswerWithheld without evidence or detailed cause. These are required runtime assertions, not passes from schema checks.

ADR-0015 additionally requires partially_answered for supported cited components plus missing requested components. Test that the response has real support, no hidden-source hints and no salvaged invalid draft; all-missing remains insufficient_evidence.

ADR-0012 / OWNER-Q-01 handoff assertion (TC-26): persist a complete immutable per-handoff manifest outside the guard, await durable acknowledgement, acquire the guard and match the frozen payload, entire evidence set and recorded revisions. Any mismatch sends zero bytes and releases the guard before a bounded fresh manifest/attempt. Fail persistence and race revocation/version/observation changes; test consumed-identity replay and crash/restart without resuming an old send. Guard remains held through valid transport completion/abort. Schema/handler tests are Not run.

**17 October input reconciliation:** FR-21/22/23/24/28/29/30/46/53/54/55/60/69: partial answers, original-draft withholding and manifest-before-guard assertions remain binding. Reviewed against the current requirement rows and operation ownership. This is specification review, not implementation or full AC coverage evidence.

## SYS-01 transport acceptance additions

Consume Proposed ADR-0020 and both service contracts: ProviderInput binds a committed provider-purpose manifest and exact final bytes; InternalQuestionResult binds an independently prepared answer-purpose manifest and exact result bytes. Include every generation input, even uncited context. Validate exact document policy/lifecycle/version/excerpt binding, purpose/run/attempt/actor/project/destination, durable receipt and one-use claim. No raw manifest/receipt reaches the browser. A changed/invalid original answer is withheld whole under ADR-0013; replacement needs fresh validated generation and new immutable manifest. Final provider-wire adapter mapping is an implementation prerequisite; no provider is adopted. Execute TC-26 at real byte boundaries before allowing relay; contract negatives are not runtime evidence.

## NEXT-11 protocol reference prerequisite

[HANDOFF-REF-01](../docs/sdlc/references/handoff-byte-reference-2026-10-18.md) supplies executed synthetic byte-binding cases for this slice. They are reusable acceptance inputs, not real handler/guard/transport or durable persistence evidence. Actual source/capture/receipt authority, safe numeric serialization and provider-specific wire mapping still require implementation. This SP remains Unimplemented and its Done criteria are unchanged.

## NEXT-12 storage prerequisite evidence

Proposed ADR-0023 supplies Knowledge 003 / Workspace 004 and 26 isolated SQL results for preparation/outcomes, permanent claims, races, rollback, runtime-role immutability and failed legacy upgrade. This SP remains Unimplemented: no real producer/permission/lookup/guard/provider/answer handler is supplied. Durable acknowledgement, active process fencing and actual byte-boundary TC-26 still require application evidence. No development upgrade or send authority follows from these tests.

## NEXT-13 SQL projection prerequisite

HANDOFF-SQL-01 supplies an executed SQL-to-StoredHandoff reference projection and scope/encoding/transaction-visibility negatives. It is not the authenticated getHandoffManifest handler or a current authority decision. Derive every selector from validated server context; preserve exact stored bytes, known commit ordering and later guard/claim checks. This SP remains Unimplemented and live acceptance criteria are unchanged.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.

## Selected fixture execution

The [registered plan](../docs/implementation/features/sp-09-cited-question/plan.md) permits the bounded Workspace src gateway, document transport, session and guard integration, Knowledge runtime, web and targeted tests. This increment uses synthetic data and a loopback provider. The [fixture results](../docs/implementation/features/sp-09-cited-question/plan.md#fixture-verification) record runtime coverage and remaining transport and provider acceptance. The existing protected byte validator supplies reference cases. The fixture runtime enforces its compact JSON byte profile before each protected send.
