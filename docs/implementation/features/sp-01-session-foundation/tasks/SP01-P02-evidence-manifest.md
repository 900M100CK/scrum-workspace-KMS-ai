# SP01-P02 — Manifest collector and assertion ledger

**Artifact ID:** SP01-P02\
**Version/date:** 0.8 Draft · 28 October 2026\
**Status:** Task brief only; execution state and result are authoritative in the parent plan.\
**Inputs:** [FEAT-SP01-01](../plan.md) v0.9; [canonical SP-01](../../../../../specs/001-session.md) v0.5; [canonical brief](../../../briefs/SP-01.1-session-foundation.md) v0.4; [runtime spike brief](../../../../../SP-01.1-spike-brief.md) v0.2; Proposed ADR-0024/0025.\
**Trace:** Parent SP-01.1; FR-01/36/37/68 and relevant ACs/TCs as mapped in the plan; BR-01/10; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer.

## Read first and scope

Read [parent plan and current state](../plan.md#tasks-and-acceptance), [execution rules](../../../execution.md), [root instructions](../../../../../AGENTS.md) and the exact contract/requirements linked by the parent. Do not start a gated task merely because this file exists.

- Phase: preparation; no application adoption.
- Prerequisites: SP01-P01 source/dependency layout.
- Allowed write scope: Runtime scripts/test/results; feature documentation and registered report.
- Parent: PLAN-01 Month 1 / M-01; canonical pack child 01.1.
- Guardrails: retain service ownership, current server-derived authority and mandatory applicable audit; no accepted-ADR edits, commits, external real-data transfers or parallel agents by this task.

## Work steps

1. Implement the runtime brief source manifest collector using explicit paths, including ignored/untracked probe inputs and the collector itself.
2. Create separate before/after captures under a unique run ID and an assertion ledger containing all 38 E-HTTP/E-DB/E-SESSION IDs.
3. Calibrate drift detection using a controlled input copy, and retain failed calibration results.

## Acceptance assertions

- SP01-P02-A1: Before capture is never overwritten; results/private TLS material/node_modules are excluded from input hashes.
- SP01-P02-A2: The same input-set bytes compare equal, while a deliberate relevant edit fails attribution; neither result embeds its own digest.
- SP01-P02-A3: HEAD, scoped diff identity, installed tuple and sanitised synthetic settings are recorded. No arbitrary unrelated files or secrets are published.

## Verification and evidence

Run the actual collector/calibration entry after creating it; record its command. Verify result/receipt references after outputs are closed. Existing docs/schema checks cannot substitute for collector calibration.

Use actual source/configuration/fixture identity, safe failure observations and per-assertion outcomes. Keep failed attempts. Tests of schema, SQL, laboratory handlers, actual application handlers and browser interactions are separately labelled; no inherited pass is created by copying this brief. No task-specific executable command is claimed before it exists.

## Result and next-agent handoff

Before/after manifest examples, calibration assertions and a fully Not run experiment ledger.

Save a dated result under docs/sdlc/reports/ using the [handoff template](../../../handoff-template.md); register it, then update this task's status/result cell in [plan.md](../plan.md). Keep mutable execution status in that one table, not a second checklist here. A task requiring a material new scope/policy decision pauses only the dependent work. The next ready task is selected by the parent dependency table; no automatic owner acceptance.

**Checklist:** Self-checked for task scope/assertions and parent links; runtime evidence Not run at authoring.
