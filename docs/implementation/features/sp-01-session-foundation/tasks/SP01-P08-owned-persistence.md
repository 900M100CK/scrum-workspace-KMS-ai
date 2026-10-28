# SP01-P08 — Credential/session persistence and applicable capture

**Artifact ID:** SP01-P08\
**Version/date:** 0.8 Draft · 28 October 2026\
**Status:** Task brief only; execution state and result are authoritative in the parent plan.\
**Inputs:** [FEAT-SP01-01](../plan.md) v0.9; [canonical SP-01](../../../../../specs/001-session.md) v0.5; [canonical brief](../../../briefs/SP-01.1-session-foundation.md) v0.4; [runtime spike brief](../../../../../SP-01.1-spike-brief.md) v0.2; Proposed ADR-0024/0025.\
**Trace:** Parent SP-01.2 and applicable SP-11.1; FR-01/36/37/68 and relevant ACs/TCs as mapped in the plan; BR-01/10; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer.

## Read first and scope

Read [parent plan and current state](../plan.md#tasks-and-acceptance), [execution rules](../../../execution.md), [root instructions](../../../../../AGENTS.md) and the exact contract/requirements linked by the parent. Do not start a gated task merely because this file exists.

- Phase: application implementation; prerequisite decisions must be recorded.
- Prerequisites: SP01-P07 and selected schema/provisioning/retention boundaries.
- Allowed write scope: services/workspace/**, tests/workspace/**; this plan/task and dated evidence registration.
- Parent: PLAN-01 Month 1 / M-01; canonical pack child 01.2 + applicable SP-11.1.
- Guardrails: retain service ownership, current server-derived authority and mandatory applicable audit; no accepted-ADR edits, commits, external real-data transfers or parallel agents by this task.

## Work steps

1. Inspect existing Workspace migrations before adding a new reversible migration if required; never edit applied 001–004.
2. Implement selected credential KDF and session digest storage with owning transaction boundaries, constraints and exact ID handling.
3. Co-deliver catalogue-required minimum audit/pending capture with producing operations and real failure injection.

## Acceptance assertions

- SP01-P08-A1: Real forward/reverse/repeat tests pass on disposable storage, preserving immutable applied migrations.
- SP01-P08-A2: No raw password/token in DB/log/audit/body; configured credentials/provisioning follow the selected policy.
- SP01-P08-A3: Required state+audit commit atomically; failures roll back, suspect clients are discarded and no cross-service DB write occurs.
- SP01-P08-A4: Retention/cleanup is not invented or inferred from expiry.

## Verification and evidence

Use the storage runbook and actual service integration tests against real PostgreSQL. Distinguish storage constraints from handler authority; capture exact migration/configuration/source identities.

Use actual source/configuration/fixture identity, safe failure observations and per-assertion outcomes. Keep failed attempts. Tests of schema, SQL, laboratory handlers, actual application handlers and browser interactions are separately labelled; no inherited pass is created by copying this brief. No task-specific executable command is claimed before it exists.

## Result and next-agent handoff

Owned persisted foundation with migration/rollback and required capture evidence; handler work continues in P09.

Save a dated result under docs/sdlc/reports/ using the [handoff template](../../../handoff-template.md); register it, then update this task's status/result cell in [plan.md](../plan.md). Keep mutable execution status in that one table, not a second checklist here. A task requiring a material new scope/policy decision pauses only the dependent work. The next ready task is selected by the parent dependency table; no automatic owner acceptance.

**Checklist:** Self-checked for task scope/assertions and parent links; runtime evidence Not run at authoring.
