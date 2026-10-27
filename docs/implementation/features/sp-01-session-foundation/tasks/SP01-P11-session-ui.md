# SP01-P11 — Session UI connected to real API

**Artifact ID:** SP01-P11\
**Version/date:** 0.1 Draft · 27 October 2026\
**Status:** Task brief only; execution state and result are authoritative in the parent plan.\
**Inputs:** [FEAT-SP01-01](../plan.md) v0.2; [canonical SP-01](../../../../../specs/001-session.md) v0.4; [canonical brief](../../../briefs/SP-01.1-session-foundation.md) v0.2; [runtime spike brief](../../../../../SP-01.1-spike-brief.md) v0.2; Proposed ADR-0024/0025.\
**Trace:** Parent SP-01.3; FR-01/36/37/68 and relevant ACs/TCs as mapped in the plan; BR-01/10; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer.

## Read first and scope

Read [parent plan and current state](../plan.md#tasks-and-acceptance), [execution rules](../../../execution.md), [root instructions](../../../../../AGENTS.md) and the exact contract/requirements linked by the parent. Do not start a gated task merely because this file exists.

- Phase: application implementation; prerequisite decisions must be recorded.
- Prerequisites: SP01-P09/P10; D-01b before any new frontend-tooling adoption.
- Allowed write scope: apps/web/**, tests/workspace/**; registered task/results documentation.
- Parent: PLAN-01 Month 1 / M-01; canonical pack child 01.3.
- Guardrails: retain service ownership, current server-derived authority and mandatory applicable audit; no accepted-ADR edits, commits, external real-data transfers or parallel agents by this task.

## Work steps

1. Read the canonical UI skill workflow and preserve the soft-green preview visual system.
2. Replace session fixtures with real sign-in/current-session/logout responses, preserving other explicitly synthetic screens.
3. Implement protected-navigation expiry prompting, state clearing and reload/error/keyboard interactions; test actual browser flows where available.

## Acceptance assertions

- SP01-P11-A1: Real sign-in/refresh/logout flow uses server context rather than local identity claims.
- SP01-P11-A2: Expired/logged-out state clears protected UI data and asks for sign-in; bypassed controls do not bypass server checks.
- SP01-P11-A3: Loading, generic auth failure and dependency-failure states are honest; no redesign or invented project feature.
- SP01-P11-A4: DOM, actual browser and live server evidence are distinguished; absent browser coverage remains Not run.

## Verification and evidence

Run actual UI checks according to the existing UI guide and new live-session integration tests. Verify framework adoption gate before changing manifests; preserve meaningful reload/keyboard evidence.

Use actual source/configuration/fixture identity, safe failure observations and per-assertion outcomes. Keep failed attempts. Tests of schema, SQL, laboratory handlers, actual application handlers and browser interactions are separately labelled; no inherited pass is created by copying this brief. No task-specific executable command is claimed before it exists.

## Result and next-agent handoff

Real session UI evidence and explicit synthetic/unrun surfaces, linked to TC-22 applicability.

Save a dated result under docs/sdlc/reports/ using the [handoff template](../../../handoff-template.md); register it, then update this task's status/result cell in [plan.md](../plan.md). Keep mutable execution status in that one table, not a second checklist here. A task requiring a material new scope/policy decision pauses only the dependent work. The next ready task is selected by the parent dependency table; no automatic owner acceptance.

**Checklist:** Self-checked for task scope/assertions and parent links; runtime evidence Not run at authoring.
