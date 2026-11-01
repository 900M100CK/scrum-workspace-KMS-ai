# SP02-P03A — Isolate transaction-scoped session validation

**Artifact ID:** SP02-P03A\
**Version/date:** 0.3 Draft · 1 November 2026\
**Status:** Proposed task brief; execution status belongs only to the parent plan.\
**Inputs:** [FEAT-SP02-01](../plan.md) v0.6; [ADR-0026](../../../../adr/0026-project-membership-foundation.md) v0.2 Proposed; existing SP-01 session design/runtime and tests.\
**Trace:** SP-02.1/02.2 prerequisite; FR/AC-01/03/36/37/68, BR-01/10/14; session regression, not full SC-06.

## Scope and prerequisites

Requires owner disposition of the bounded refactor proposal; brainstorming alone is not adoption. Proposed order: P02 → P03A → P03. No new schema, public endpoint, provider, dependency, role bypass or clock policy. Allowed code paths: services/workspace/src/session/** and tests/workspace/**; update owning plan/result registration. Canonical SP-02 implementation paths remain unchanged; session ownership stays Workspace.

## Reviewable outcome

Extract a single-client transaction-scoped validation function from the existing session store. Existing public methods reuse it so SP-02 can later check current actor/session and mutate authorised project data in the same transaction. Do not copy session rules or accept a previous inspect result as current authority. Preserve account/session/clock lock order, decision-time SQL precision, latched clock fault, renewal/logout/disable semantics and unknown-COMMIT/discard behaviour. No project effects may commit with a failed auth/fault outcome.

## Acceptance and planned verification

- Existing session HTTP behaviour, cookie/secret boundaries, expiry and account-disable remain unchanged.
- A clock fault still persists while protected effects are denied; rollback does not accidentally clear the fault or retain partial business changes.
- One transaction-scoped caller uses the same pg client/locks; no nested transaction or independently committed inspect result supplies authority.
- Run npm run typecheck, test:foundation, test:session:storage, test:session:http, test:session:lifecycle and test:session:ui under Node 24+ using the existing disposable fixtures/local TLS prerequisites. Add targeted same-client/fault assertions only for the new boundary. Keep negatives and exact source/command evidence.

These commands are Planned for implementation, not run by this brief. No development database migration/reset is needed. On failed mandatory regression, stop dependent P03, correct the refactor or restore only its own edits; preserve unrelated work.

**Handoff:** Only after actual regression evidence, hand the shared validation port to P03. This task does not approve 007, implement project handlers or close protected source transport.
