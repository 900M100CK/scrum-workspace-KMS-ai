# SP01-P01 — Candidate and environment inventory

**Artifact ID:** SP01-P01\
**Version/date:** 0.1 Draft · 27 October 2026\
**Status:** Task brief only; execution state and result are authoritative in the parent plan.\
**Inputs:** [FEAT-SP01-01](../plan.md) v0.2; [canonical SP-01](../../../../../specs/001-session.md) v0.4; [canonical brief](../../../briefs/SP-01.1-session-foundation.md) v0.2; [runtime spike brief](../../../../../SP-01.1-spike-brief.md) v0.2; Proposed ADR-0024/0025.\
**Trace:** Parent SP-01.1; FR-01/36/37/68 and relevant ACs/TCs as mapped in the plan; BR-01/10; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer.

## Read first and scope

Read [parent plan and current state](../plan.md#tasks-and-acceptance), [execution rules](../../../execution.md), [root instructions](../../../../../AGENTS.md) and the exact contract/requirements linked by the parent. Do not start a gated task merely because this file exists.

- Phase: preparation; no application adoption.
- Prerequisites: None; read current sources and preserve dirty work.
- Allowed write scope: Task-specific runtime directory; this feature plan/task documentation; dated preparation report.
- Parent: PLAN-01 Month 1 / M-01; canonical pack child 01.1.
- Guardrails: retain service ownership, current server-derived authority and mandatory applicable audit; no accepted-ADR edits, commits, external real-data transfers or parallel agents by this task.

## Work steps

1. Reconcile Node/compiler/Fastify/pg/Ajv/plugin candidates with actual manifests, lockfiles and existing preview; distinguish proposed, installed and observed versions.
2. Inspect local Node and disposable DB tooling availability without resetting storage. Select exact candidate versions for the isolated spike, checking their official support/compatibility sources before installation.
3. Record the isolated source/dependency layout, usable commands, disposable target and environment gaps for P02–P05.

## Acceptance assertions

- SP01-P01-A1: No root/web dependency or image is adopted or upgraded. Exact installed versions are read from the installed packages, not inferred from a declared range.
- SP01-P01-A2: Disposable DB/container identity and boundaries are explicit; absent engine/network/compiler is recorded without claiming a runtime pass.
- SP01-P01-A3: Candidate inventory records launch/typecheck strategy and conflicts; it does not accept D-01a/D-02.

## Verification and evidence

Inspect actual package.json and local runtime/tool versions. Installation probes, if needed, stay in the isolated runtime directory with their own lockfile; record the exact command/result. No application npm command exists yet.

Use actual source/configuration/fixture identity, safe failure observations and per-assertion outcomes. Keep failed attempts. Tests of schema, SQL, laboratory handlers, actual application handlers and browser interactions are separately labelled; no inherited pass is created by copying this brief. No task-specific executable command is claimed before it exists.

## Result and next-agent handoff

Candidate/environment report with source identity and next usable task; partial readiness is explicit.

Save a dated result under docs/sdlc/reports/ using the [handoff template](../../../handoff-template.md); register it, then update this task's status/result cell in [plan.md](../plan.md). Keep mutable execution status in that one table, not a second checklist here. A task requiring a material new scope/policy decision pauses only the dependent work. The next ready task is selected by the parent dependency table; no automatic owner acceptance.

**Checklist:** Self-checked for task scope/assertions and parent links; runtime evidence Not run at authoring.
