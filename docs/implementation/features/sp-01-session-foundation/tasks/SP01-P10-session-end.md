# SP01-P10 — Real expiry, renewal and sign-out

**Artifact ID:** SP01-P10\
**Version/date:** 0.1 Draft · 27 October 2026\
**Status:** Task brief only; execution state and result are authoritative in the parent plan.\
**Inputs:** [FEAT-SP01-01](../plan.md) v0.2; [canonical SP-01](../../../../../specs/001-session.md) v0.4; [canonical brief](../../../briefs/SP-01.1-session-foundation.md) v0.2; [runtime spike brief](../../../../../SP-01.1-spike-brief.md) v0.2; Proposed ADR-0024/0025.\
**Trace:** Parent SP-01.3; FR-01/36/37/68 and relevant ACs/TCs as mapped in the plan; BR-01/10; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer.

## Read first and scope

Read [parent plan and current state](../plan.md#tasks-and-acceptance), [execution rules](../../../execution.md), [root instructions](../../../../../AGENTS.md) and the exact contract/requirements linked by the parent. Do not start a gated task merely because this file exists.

- Phase: application implementation; prerequisite decisions must be recorded.
- Prerequisites: SP01-P09; selected clock/expiry/renewal policy; D-07 where guarded invalidation is affected.
- Allowed write scope: services/workspace/**, apps/web/**, tests/workspace/**; registered task/results documentation.
- Parent: PLAN-01 Month 1 / M-01; canonical pack child 01.3.
- Guardrails: retain service ownership, current server-derived authority and mandatory applicable audit; no accepted-ADR edits, commits, external real-data transfers or parallel agents by this task.

## Work steps

1. Implement configured idle/absolute validation and permitted renewal triggers in the actual application repository.
2. Implement DELETE /session with cookie clearing and idempotent success for expired/invalidated tokens.
3. Repeat controlled logout-renew and expiry-boundary tests on application handlers/DB, including mandatory capture failures and outage paths.

## Acceptance assertions

- SP01-P10-A1: AC-37: after logout succeeds, old token cannot obtain protected access; repeated/expired logout returns declared 204 without body.
- SP01-P10-A2: AC-68: configured expiry is strict, renewal cannot revive or regress deadlines, and absolute cap does not slide.
- SP01-P10-A3: Actual interleavings, persistence and required audit atomicity are verified; laboratory results are not reused as application passes.
- SP01-P10-A4: Missing guard/transport integration is a named gate; session logout alone does not prove source revocation safety.

## Verification and evidence

Run real application lifecycle/race/regression tests with exact production-candidate settings and test-only deterministic clock cases separated. Record unrun D-07 integration.

Use actual source/configuration/fixture identity, safe failure observations and per-assertion outcomes. Keep failed attempts. Tests of schema, SQL, laboratory handlers, actual application handlers and browser interactions are separately labelled; no inherited pass is created by copying this brief. No task-specific executable command is claimed before it exists.

## Result and next-agent handoff

Session-ending behaviour evidence and remaining UI/guard limitations; no broader source-protection claim.

Save a dated result under docs/sdlc/reports/ using the [handoff template](../../../handoff-template.md); register it, then update this task's status/result cell in [plan.md](../plan.md). Keep mutable execution status in that one table, not a second checklist here. A task requiring a material new scope/policy decision pauses only the dependent work. The next ready task is selected by the parent dependency table; no automatic owner acceptance.

**Checklist:** Self-checked for task scope/assertions and parent links; runtime evidence Not run at authoring.
