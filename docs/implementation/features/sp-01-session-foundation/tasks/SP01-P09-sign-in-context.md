# SP01-P09 — Real sign-in and authenticated session context

**Artifact ID:** SP01-P09\
**Version/date:** 0.8 Draft · 28 October 2026\
**Status:** Task brief only; execution state and result are authoritative in the parent plan.\
**Inputs:** [FEAT-SP01-01](../plan.md) v0.9; [canonical SP-01](../../../../../specs/001-session.md) v0.5; [canonical brief](../../../briefs/SP-01.1-session-foundation.md) v0.4; [runtime spike brief](../../../../../SP-01.1-spike-brief.md) v0.2; Proposed ADR-0024/0025.\
**Trace:** Parent SP-01.2; FR-01/36/37/68 and relevant ACs/TCs as mapped in the plan; BR-01/10; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer.

## Read first and scope

Read [parent plan and current state](../plan.md#tasks-and-acceptance), [execution rules](../../../execution.md), [root instructions](../../../../../AGENTS.md) and the exact contract/requirements linked by the parent. Do not start a gated task merely because this file exists.

- Phase: application implementation; prerequisite decisions must be recorded.
- Prerequisites: SP01-P08; recorded validator, cookie/CSRF, KDF and identity choices.
- Allowed write scope: services/workspace/**, apps/web/**, tests/workspace/**; registered task/results documentation.
- Parent: PLAN-01 Month 1 / M-01; canonical pack child 01.2.
- Guardrails: retain service ownership, current server-derived authority and mandatory applicable audit; no accepted-ADR edits, commits, external real-data transfers or parallel agents by this task.

## Work steps

1. Implement POST /session and GET /session using selected adapters and real owned persistence.
2. Derive actor from the authenticated session, validate unknown fields under recorded policy, and make invalid credentials generic.
3. Exercise success, missing/invalid/expired token, forged actor, store failure and redacted-error paths through actual handlers.

## Acceptance assertions

- SP01-P09-A1: AC-01: forged requester fields cannot change effective actor; client/model values grant no identity.
- SP01-P09-A2: AC-36: only valid authentication creates a usable session; invalid/unknown auth creates none.
- SP01-P09-A3: Exact declared Session/Error shapes/statuses and chosen cookie semantics hold; no token/hash/password body or log leakage.
- SP01-P09-A4: Unknown/erroring session authority returns no protected result; handler+DB evidence is separate from schema checks.

## Verification and evidence

Execute actual real-handler and PostgreSQL integration/consumer tests, plus relevant contract tests. Map every assertion to AC-01/36 and the exact route.

Use actual source/configuration/fixture identity, safe failure observations and per-assertion outcomes. Keep failed attempts. Tests of schema, SQL, laboratory handlers, actual application handlers and browser interactions are separately labelled; no inherited pass is created by copying this brief. No task-specific executable command is claimed before it exists.

## Result and next-agent handoff

Real signIn/getSession evidence; logout/renewal still requires P10 and browser flow P11.

Save a dated result under docs/sdlc/reports/ using the [handoff template](../../../handoff-template.md); register it, then update this task's status/result cell in [plan.md](../plan.md). Keep mutable execution status in that one table, not a second checklist here. A task requiring a material new scope/policy decision pauses only the dependent work. The next ready task is selected by the parent dependency table; no automatic owner acceptance.

**Checklist:** Self-checked for task scope/assertions and parent links; runtime evidence Not run at authoring.
