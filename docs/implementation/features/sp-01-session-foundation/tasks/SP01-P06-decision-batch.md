# SP01-P06 — Evidence-backed owner decision batch

**Artifact ID:** SP01-P06\
**Version/date:** 0.1 Draft · 27 October 2026\
**Status:** Task brief only; execution state and result are authoritative in the parent plan.\
**Inputs:** [FEAT-SP01-01](../plan.md) v0.2; [canonical SP-01](../../../../../specs/001-session.md) v0.4; [canonical brief](../../../briefs/SP-01.1-session-foundation.md) v0.2; [runtime spike brief](../../../../../SP-01.1-spike-brief.md) v0.2; Proposed ADR-0024/0025.\
**Trace:** Parent SP-01.1; FR-01/36/37/68 and relevant ACs/TCs as mapped in the plan; BR-01/10; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer.

## Read first and scope

Read [parent plan and current state](../plan.md#tasks-and-acceptance), [execution rules](../../../execution.md), [root instructions](../../../../../AGENTS.md) and the exact contract/requirements linked by the parent. Do not start a gated task merely because this file exists.

- Phase: preparation; no application adoption.
- Prerequisites: SP01-P03–P05 actual results, or explicitly incomplete environment/compatibility gaps.
- Allowed write scope: Feature plan/task and dated report; Proposed decision documents with registration. Accepted ADRs are read-only without owner authority.
- Parent: PLAN-01 Month 1 / M-01; canonical pack child 01.1.
- Guardrails: retain service ownership, current server-derived authority and mandatory applicable audit; no accepted-ADR edits, commits, external real-data transfers or parallel agents by this task.

## Work steps

1. Consolidate exact candidate tuple, alternative/configuration findings, risks and unrun assertions.
2. Prepare concrete choices for D-01a/D-02: provisioning, KDF, cookie/origin/CSRF, clock, idle/absolute policy and renewal triggers; keep D-01b separate.
3. Present the reviewable batch to the owner and record only an actual response in the canonical decision process.

## Acceptance assertions

- SP01-P06-A1: No omitted/failed HTTP/DB/session test is relabelled Passed. A partial spike is a partial recommendation.
- SP01-P06-A2: Owner acceptance is separate from author self-check and reviewer findings; all adoption prerequisites are explicit.
- SP01-P06-A3: Production parameters are not copied from synthetic config, and app-path/root-script changes needed by P07 are identified for coordinated scope update.

## Verification and evidence

Review source/manifest links and rerun only checks required by changed documents. This task does not implement application behaviour or accept Proposed ADRs on its own.

Use actual source/configuration/fixture identity, safe failure observations and per-assertion outcomes. Keep failed attempts. Tests of schema, SQL, laboratory handlers, actual application handlers and browser interactions are separately labelled; no inherited pass is created by copying this brief. No task-specific executable command is claimed before it exists.

## Result and next-agent handoff

Concrete decision record and unresolved choices; P07 stays gated until actual disposition and scope are recorded.

Save a dated result under docs/sdlc/reports/ using the [handoff template](../../../handoff-template.md); register it, then update this task's status/result cell in [plan.md](../plan.md). Keep mutable execution status in that one table, not a second checklist here. A task requiring a material new scope/policy decision pauses only the dependent work. The next ready task is selected by the parent dependency table; no automatic owner acceptance.

**Checklist:** Self-checked for task scope/assertions and parent links; runtime evidence Not run at authoring.
