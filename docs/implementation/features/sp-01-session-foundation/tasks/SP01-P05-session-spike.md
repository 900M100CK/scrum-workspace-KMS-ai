# SP01-P05 — Session lifecycle and controlled race spike

**Artifact ID:** SP01-P05\
**Version/date:** 0.8 Draft · 28 October 2026\
**Status:** Task brief only; execution state and result are authoritative in the parent plan.\
**Inputs:** [FEAT-SP01-01](../plan.md) v0.9; [canonical SP-01](../../../../../specs/001-session.md) v0.5; [canonical brief](../../../briefs/SP-01.1-session-foundation.md) v0.4; [runtime spike brief](../../../../../SP-01.1-spike-brief.md) v0.2; Proposed ADR-0024/0025.\
**Trace:** Parent SP-01.1; FR-01/36/37/68 and relevant ACs/TCs as mapped in the plan; BR-01/10; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer.

## Read first and scope

Read [parent plan and current state](../plan.md#tasks-and-acceptance), [execution rules](../../../execution.md), [root instructions](../../../../../AGENTS.md) and the exact contract/requirements linked by the parent. Do not start a gated task merely because this file exists.

- Phase: preparation; no application adoption.
- Prerequisites: SP01-P03/P04; actual repository, candidate clock seam and manifests.
- Allowed write scope: Runtime src/test/results; registered evidence documentation.
- Parent: PLAN-01 Month 1 / M-01; canonical pack child 01.1.
- Guardrails: retain service ownership, current server-derived authority and mandatory applicable audit; no accepted-ADR edits, commits, external real-data transfers or parallel agents by this task.

## Work steps

1. Implement laboratory opaque session lifecycle with one explicit clock strategy, synthetic non-binding expiry/KDF settings and digest-only persistence.
2. Test strict idle/absolute boundaries using independent fixtures and a post-lock repository clock seam.
3. Force both logout-renew orders, delayed-expired renewal and out-of-order renewal using barriers at the real DB boundary; separately observe real DB clock and optional seeded stress.

## Acceptance assertions

- SP01-P05-A1: Expired/revoked state cannot renew; effective expiry cannot decrease or exceed absolute expiry.
- SP01-P05-A2: Logout-first yields rejected renewal; renewal-first may succeed before logout but the old token subsequently gets 401. Launch order/sleeps are not serialization proof.
- SP01-P05-A3: Skew/backward-clock/restart limitations are recorded as failures/gaps unless actually handled; no machine clock modification or production-default inference.
- SP01-P05-A4: Unknown-user and wrong-password public responses are uniform; no tight constant-latency claim or token material in output evidence.

## Verification and evidence

Execute actual E-SESSION node:test/repository/HTTP scenarios under bounded waits and cleanup. Record per-schedule lock/decision/commit evidence and injected-time versus real-clock runs separately.

Use actual source/configuration/fixture identity, safe failure observations and per-assertion outcomes. Keep failed attempts. Tests of schema, SQL, laboratory handlers, actual application handlers and browser interactions are separately labelled; no inherited pass is created by copying this brief. No task-specific executable command is claimed before it exists.

## Result and next-agent handoff

E-SESSION results with retained failures, chosen lab semantics and open production-policy questions.

Save a dated result under docs/sdlc/reports/ using the [handoff template](../../../handoff-template.md); register it, then update this task's status/result cell in [plan.md](../plan.md). Keep mutable execution status in that one table, not a second checklist here. A task requiring a material new scope/policy decision pauses only the dependent work. The next ready task is selected by the parent dependency table; no automatic owner acceptance.

**Checklist:** Self-checked for task scope/assertions and parent links; runtime evidence Not run at authoring.
