# SP-01: Use an authenticated session whose expiry and sign-out end protected access.

**Artifact ID:** IMPL-SP-01\
**Version/date:** 0.6 Draft · 27 October 2026\
**Status:** SP-01.1 preparation In progress; application children Not started.\
**Inputs:** [Canonical SP-01](../../../specs/001-session.md) v0.4; SPEC-INDEX v0.4; PRD-01 v0.9; [TECH-STACK-01](../../tech-stack.md) v1.5; [source register](../register.md); [decisions](../decisions.md); Proposed ADR-0024/0025.\
**Trace:** FR-01, FR-36, FR-37, FR-68; BR-01, BR-10; SC-06.\
**Owner role:** Sequential implementer; no independent approval claimed.

## Contract and boundaries

- Canonical goal: Use an authenticated session whose expiry and sign-out end protected access.
- Dependencies: None (context/contract baseline and relevant decisions still apply). See [roadmap](../roadmap.md) for cross-cutting SP-11 capture and staged integration.
- Service ownership as declared by spec: workspace; cross-service orchestration does not transfer DB ownership.
- Release tiers (snapshot): Must: FR-01, FR-36, FR-37, FR-68. Optional work requires explicit inclusion; it is not a Must gate.
- Declared operation IDs: `signIn`, `signOut`, `getSession`. Read exact contracts from the [source register](../register.md); these lists do not replace all supporting contract dependencies or grant a second handler owner.
- Flow: [current interaction source](../../ux/sitemap.md).
- Decision gates: D-01a/D-02 before backend application scaffolding; D-01b before frontend dependency adoption; D-07 where session invalidation participates in protected handoffs.
- Allowed paths, copied from canonical spec: services/workspace/**, apps/web/**, tests/workspace/**. Re-read the current spec before edits. Shared contract/root-script/guard changes outside these paths need a recorded coordinated-spec scope update; this breakdown does not authorise them.

## Child steps

Execute through the saved [FEAT-SP01-01 work plan](../features/sp-01-session-foundation/plan.md) on `feature/sp-01-session-foundation`. Its linked SP01-P01–P12 task files and parent status table maps to these four children; next is SP01-P01. This registration does not mark any new runtime result or accept the Proposed decisions.

Select one child; copy its exact FR/AC assertions and prerequisites into the [brief](../handoff-template.md). A child can be preparation-only; no synthetic result closes runtime acceptance.

| Child ID | Goal | Initial status / evidence |
| --- | --- | --- |
| SP-01.1 | Prepare identity and stack decisions | In progress; [brief](../briefs/SP-01.1-session-foundation.md), [preparation result](../../sdlc/reports/SP-01.1-preparation-2026-10-27.md); HTTP/DB/session spike and owner decisions open |
| SP-01.2 | Establish authenticated context | Not started; no evidence |
| SP-01.3 | End sessions and connect the UI | Not started; no evidence |
| SP-01.4 | Verify session boundaries | Not started; no evidence |

### SP-01.1 — Prepare identity and stack decisions

Use the [contract-derived brief](../briefs/SP-01.1-session-foundation.md), Proposed [ADR-0024](../../adr/0024-backend-session-foundation.md) for D-01a and [ADR-0025](../../adr/0025-opaque-session-candidate.md) for D-02. D-01b frontend adoption is separate. Preserve exact `/session` routes and Login/Session schemas; do not copy illustrative routes or silently repair extra fields. The brief separates executable schema pre-evidence from HTTP, persistence and session checks; passing the former does not close this child.

Inspect the current session contract, pre-provisioned-account assumption, authentication mechanism, expiry, cookie/CSRF and logout requirements. Produce the D-01/D-02 decision batch and a narrow scaffold plan; do not infer stack adoption from preview dependencies.

Read [TECH-STACK-01](../../tech-stack.md) before proposing application dependencies. Compare its candidate inventory with the actual root/web package manifests, lockfile, existing UI assets and PostgreSQL configuration. Include selected-versus-Proposed status, exact versions to verify, compatibility checks, required command wiring and unresolved owner choices in the brief. Recheck dated upstream version recommendations before installation; do not upgrade the storage baseline or select every optional tool merely because it appears in the stack document.

Explicitly choose the application DB adapter/driver, service-owned bounded pool/configuration, same-client transaction ownership and exact bigint transport. Verify OpenAPI schema dialect and runtime validator/response serializer compatibility with meaningful contract negatives. A plain SQL/node-postgres candidate does not require an ORM; no driver is adopted by this brief. Reuse the algorithms/structures in stack section 7 only where the selected task needs them.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-01.2 — Establish authenticated context

Implement sign-in and server-side session validation with the selected mechanism, generic invalid credentials and expiry. A forged actor field cannot replace the authenticated actor. Add actual build/run/test entry points only when verified. Co-deliver SP-11.1 for required producing records.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-01.3 — End sessions and connect the UI

Implement sign-out/expired-session behaviour; renew current session on protected navigation and clear protected state when invalid. Preserve the preview visual system while making this slice use live responses.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

### SP-01.4 — Verify session boundaries

Exercise invalid credentials, actor forgery, missing/expired/logged-out session reuse and contract-specific repeated sign-out. Record real handler evidence, mandatory capture failure behaviour and UI integration; no project features are claimed from session-only tests.

**Exit:** Demonstrate the stated result with actual assertions and a linked handoff. For preparation, record unresolved decisions explicitly; for implementation, test required denial/revision/replay/rollback/transport boundaries applicable to this child. Do not report the whole spec Verified from this step alone.

## Acceptance and evidence

Canonical tests to read: TC-01, TC-02, TC-18, TC-22 in [TEST-08](../../sdlc/test-plan.md). This is a starting cross-reference, not a replacement for full FR/AC/UC-EX coverage.

Use [execution rules](../execution.md): real handlers/persisted state, relevant consumer/provider checks, controlled concurrency and UI reload/failure where applicable. Mutation audit failure must not leave committed state. Unknown outcome is reconciled with the original identity under operation-specific rules. Never fabricate runtime evidence from contracts or fixtures.

Record command/runtime, source revision or dirty-worktree digest, fixture/config identity, asserted boundary, results/failed attempts, unrun checks and open decisions in a dated [handoff](../handoff-template.md). Link it from the child status row and update the [catalogue](README.md) when pack state changes.

**Checklist/handoff:** Pass for bounded breakdown and canonical references; Gap for missing decisions and all application acceptance. Ready for preparation within these limits; no implementation, release completion or independent acceptance is claimed.
