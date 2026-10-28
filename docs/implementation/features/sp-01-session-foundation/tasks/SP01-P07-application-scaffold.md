# SP01-P07 — Selected application scaffold and commands

**Artifact ID:** SP01-P07\
**Version/date:** 0.8 Draft · 28 October 2026\
**Status:** Task brief only; execution state and result are authoritative in the parent plan.\
**Inputs:** [FEAT-SP01-01](../plan.md) v0.9; [canonical SP-01](../../../../../specs/001-session.md) v0.5; [canonical brief](../../../briefs/SP-01.1-session-foundation.md) v0.4; [runtime spike brief](../../../../../SP-01.1-spike-brief.md) v0.2; Proposed ADR-0024/0025.\
**Trace:** Parent SP-01.2; FR-01/36/37/68 and relevant ACs/TCs as mapped in the plan; BR-01/10; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer.

## Read first and scope

Read [parent plan and current state](../plan.md#tasks-and-acceptance), [execution rules](../../../execution.md), [root instructions](../../../../../AGENTS.md) and the exact contract/requirements linked by the parent. Do not start a gated task merely because this file exists.

- Phase: application implementation; prerequisite decisions must be recorded.
- Prerequisites: SP01-P06 bounded owner disposition recorded in the parent plan. Scaffold/interfaces/local HTTPS may proceed; KDF/time/persistence adoption remains gated separately.
- Allowed write scope: services/workspace/**, apps/web/**, tests/workspace/**. Root scripts/package/lockfile or other shared paths only after an explicit coordinated scope update.
- Parent: PLAN-01 Month 1 / M-01; canonical pack child 01.2.
- Guardrails: retain service ownership, current server-derived authority and mandatory applicable audit; no accepted-ADR edits, commits, external real-data transfers or parallel agents by this task.

## Work steps

1. Reuse the selected shared framework foundation. Add clock/password-verifier interfaces and validated configurable starting idle/absolute values; implement no concrete KDF or time algorithm.
2. Add opt-in local HTTPS and a same-origin /api proxy to Workspace. Keep keys ignored, target loopback only, and test the actual transport before P11.
3. Run existing launch/typecheck/build/foundation commands. Database pools/persistence and selected algorithms remain later gated work; no scaffold test claims session correctness.

## Acceptance assertions

- SP01-P07-A1: No scratch secret or synthetic policy import and no unapproved application dependency.
- SP01-P07-A2: Commands point to real files and execute on the selected runtime; scaffold checks do not count as session acceptance.
- SP01-P07-A3: No third service, Knowledge DB client or provider/framework expansion is introduced.

## Verification and evidence

Run the actual newly wired application commands and existing relevant context/contract checks. Record exact command names after implementation; root script changes are gated by scope.

Use actual source/configuration/fixture identity, safe failure observations and per-assertion outcomes. Keep failed attempts. Tests of schema, SQL, laboratory handlers, actual application handlers and browser interactions are separately labelled; no inherited pass is created by copying this brief. No task-specific executable command is claimed before it exists.

## Result and next-agent handoff

Runnable selected scaffold and documented environment, commands and remaining application tests.

Save a dated result under docs/sdlc/reports/ using the [handoff template](../../../handoff-template.md); register it, then update this task's status/result cell in [plan.md](../plan.md). Keep mutable execution status in that one table, not a second checklist here. A task requiring a material new scope/policy decision pauses only the dependent work. The next ready task is selected by the parent dependency table; no automatic owner acceptance.

**Checklist:** Self-checked for task scope/assertions and parent links; runtime evidence Not run at authoring.
