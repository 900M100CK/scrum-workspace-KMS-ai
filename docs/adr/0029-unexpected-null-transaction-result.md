# Unexpected authenticated-transaction null result

**Artifact ID:** ADR-0029\
**Version/date:** 0.1 Proposed · 4 November 2026\
**Status:** Proposed bounded technical failure contract; reproduction precedes implementation. No formal or independent acceptance.\
**Inputs:** [HOTFIX-BACKEND-42-01](../implementation/features/hotfix-backend-layering/plan.md) v0.6; committed SP-04 e6f2337; current WorkspaceProjectStore.transaction, ownedTransaction and projectFailure; existing session clock/denial evidence.\
**Trace:** FR-03/31/59/68, supporting SP-04 FR-09/40/43/44; BR-01/10/11/14; PLAN-01 Month1 / M-02–M-03.

## Context

The authenticated wrapper permits a callback result T|null. Expected denial sets a recorded ProjectFault and returns null so the owning transaction may commit required authentication fault evidence before the wrapper raises that recorded fault. A callback returning null without any recorded denial currently passes through the generic T cast after COMMIT. This is an extension risk, not an observed production handler incident. A synthetic actual-PostgreSQL callback can reproduce the unsafe boundary without adding a public operation.

## Proposed bounded contract

Unexpected callback null with no recorded denial is an internal unavailable result. The intended correction throws before ownedTransaction sends COMMIT, so attempted business state, business audit and original outcome all roll back. Existing projectFailure/HTTP handling maps the nested failure to the existing generic503 access_unavailable envelope; no SQL, actor, source identity or custom exception detail is disclosed. The callback's valid204 outcome object with body:null is not itself a null result; other legitimate values retain their existing semantics.

Recorded denial is different: retain the existing commit-then-raise path for an actual authentication/clock fault latch and its required authentication audit. Initial denial must never run the callback. A failed final guard must return without business writes. Not every unauthenticated/expired session produces a fault audit; do not manufacture one. A failure after COMMIT was sent remains unknown, never relabelled as a known rollback, and reconciles under the original operation/key/body.

## Alternatives and consequences

Throwing after COMMIT would report an error while retaining business effects, so it cannot enforce this contract. Throwing every null inside the transaction would erase durable recorded-denial fault evidence. A runner extraction or new result framework is unnecessary for this bounded correction. Keep the guard inside the existing Project transaction wrapper; preserve client/actor/session context, lock ordering, timeout/role checks, durable outcome protocol and business/action authority.

## Verification and recovery

RF03 authors tests/workspace/project-transaction-null.test.mjs on an explicit disposable010 database, records red assertions for business/audit/outcome rollback and the protected generic503 path before the guard exists, and separately verifies success values, known thrown rollback, initial/final recorded clock faults, authentication denial and actual lost-COMMIT acknowledgement/replay. RF04 is a later task and must make those same assertions pass without weakening them. Historical006/008/009 fixtures remain unchanged. Do not apply migrations to valuable data or edit001–010.

Recovery reverses only the future minimal guard against its source snapshot, preserving recorded evidence and unrelated work. This proposal grants no permission, service, wire schema, runtime AI mutation, new dependency, automatic commit or independent acceptance. No implementation result is implied by this ADR.
