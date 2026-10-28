# SP01-P12 — Integrated SP-01 regression and evidence handoff

**Artifact ID:** SP01-P12\
**Version/date:** 0.8 Draft · 28 October 2026\
**Status:** Task brief only; execution state and result are authoritative in the parent plan.\
**Inputs:** [FEAT-SP01-01](../plan.md) v0.9; [canonical SP-01](../../../../../specs/001-session.md) v0.5; [canonical brief](../../../briefs/SP-01.1-session-foundation.md) v0.4; [runtime spike brief](../../../../../SP-01.1-spike-brief.md) v0.2; Proposed ADR-0024/0025.\
**Trace:** Parent SP-01.4; FR-01/36/37/68 and relevant ACs/TCs as mapped in the plan; BR-01/10; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer.

## Read first and scope

Read [parent plan and current state](../plan.md#tasks-and-acceptance), [execution rules](../../../execution.md), [root instructions](../../../../../AGENTS.md) and the exact contract/requirements linked by the parent. Do not start a gated task merely because this file exists.

- Phase: application implementation; prerequisite decisions must be recorded.
- Prerequisites: SP01-P07–P11 and applicable authority/capture/guard integration gates.
- Allowed write scope: Canonical service/web/test paths plus registered evidence documentation; wider regression paths require coordinated scope.
- Parent: PLAN-01 Month 1 / M-01; canonical pack child 01.4.
- Guardrails: retain service ownership, current server-derived authority and mandatory applicable audit; no accepted-ADR edits, commits, external real-data transfers or parallel agents by this task.

## Work steps

1. Map AC-01/36/37/68 to actual application assertions and required applicable TC-18/22 paths.
2. Run integrated negative, persistence, race, outage and user-visible reload/session flows with reproducible fixtures.
3. Reconcile per-task results with the parent plan/pack and canonical evidence tables; preserve known failures and final unrun checks.

## Acceptance assertions

- SP01-P12-A1: All applicable SP-01 Must ACs have real handler/persistence evidence and user-visible integration; structural pass counts cannot replace it.
- SP01-P12-A2: Secrets/hidden data do not leak in successful/error/log paths; logout/expiry failures cannot leave protected access.
- SP01-P12-A3: No whole SC-06/TC-02 or D-07 acceptance is inferred from session-only tests; missing evidence prevents the corresponding Verified claim.
- SP01-P12-A4: Parent plan/pack closure cites actual commands/source/config/result links and remains separate from independent review/owner acceptance.

## Verification and evidence

Run the actual selected application/UI/consumer-provider regression commands and relevant existing context/docs/contract checks. Commands are recorded when executable; tests may not be weakened to satisfy this task.

Use actual source/configuration/fixture identity, safe failure observations and per-assertion outcomes. Keep failed attempts. Tests of schema, SQL, laboratory handlers, actual application handlers and browser interactions are separately labelled; no inherited pass is created by copying this brief. No task-specific executable command is claimed before it exists.

## Result and next-agent handoff

Dated SP-01 application evidence handoff, open defects/unrun integrations and next canonical slice prerequisites.

Save a dated result under docs/sdlc/reports/ using the [handoff template](../../../handoff-template.md); register it, then update this task's status/result cell in [plan.md](../plan.md). Keep mutable execution status in that one table, not a second checklist here. A task requiring a material new scope/policy decision pauses only the dependent work. The next ready task is selected by the parent dependency table; no automatic owner acceptance.

**Checklist:** Self-checked for task scope/assertions and parent links; runtime evidence Not run at authoring.
