# SP01-P04 — pg, transaction and pool compatibility spike

**Artifact ID:** SP01-P04\
**Version/date:** 0.1 Draft · 27 October 2026\
**Status:** Task brief only; execution state and result are authoritative in the parent plan.\
**Inputs:** [FEAT-SP01-01](../plan.md) v0.2; [canonical SP-01](../../../../../specs/001-session.md) v0.4; [canonical brief](../../../briefs/SP-01.1-session-foundation.md) v0.2; [runtime spike brief](../../../../../SP-01.1-spike-brief.md) v0.2; Proposed ADR-0024/0025.\
**Trace:** Parent SP-01.1; FR-01/36/37/68 and relevant ACs/TCs as mapped in the plan; BR-01/10; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer.

## Read first and scope

Read [parent plan and current state](../plan.md#tasks-and-acceptance), [execution rules](../../../execution.md), [root instructions](../../../../../AGENTS.md) and the exact contract/requirements linked by the parent. Do not start a gated task merely because this file exists.

- Phase: preparation; no application adoption.
- Prerequisites: SP01-P01/P02 and a verified disposable database target.
- Allowed write scope: Runtime SQL/src/test/results and isolated manifests; registered evidence documentation.
- Parent: PLAN-01 Month 1 / M-01; canonical pack child 01.1.
- Guardrails: retain service ownership, current server-derived authority and mandatory applicable audit; no accepted-ADR edits, commits, external real-data transfers or parallel agents by this task.

## Work steps

1. Apply disposable probe SQL to task-owned storage, inspect actual pg values and session digest persistence.
2. Inject deterministic insert/audit/rollback/query-cancellation/connection-loss failures using the same acquired transaction client.
3. Verify connection release versus discard, subsequent pool recovery and exact bigint transport before optional stress.

## Acceptance assertions

- SP01-P04-A1: Original application migrations are untouched; no cross-service writes or development reset.
- SP01-P04-A2: Applicable synthetic business+audit writes roll back together; a login-audit requirement is not invented from the probe table.
- SP01-P04-A3: Rollback failure/terminated client is discarded; cancellation followed by successful rollback may reuse a healthy client. Unknown COMMIT acknowledgement remains unknown.
- SP01-P04-A4: Values above Number.MAX_SAFE_INTEGER survive actual pg and JSON as decimal strings; raw tokens are absent from persisted/logged fields.

## Verification and evidence

Execute the runtime E-DB tests against real disposable PostgreSQL. Forward/reapply/cleanup follow the runbook and task-owned target checks. Record actual commands, image/version, settled client/backend state and failure evidence.

Use actual source/configuration/fixture identity, safe failure observations and per-assertion outcomes. Keep failed attempts. Tests of schema, SQL, laboratory handlers, actual application handlers and browser interactions are separately labelled; no inherited pass is created by copying this brief. No task-specific executable command is claimed before it exists.

## Result and next-agent handoff

E-DB assertions, pool recovery/discard and bigint observations; optional account-policy branches labelled, no application pass.

Save a dated result under docs/sdlc/reports/ using the [handoff template](../../../handoff-template.md); register it, then update this task's status/result cell in [plan.md](../plan.md). Keep mutable execution status in that one table, not a second checklist here. A task requiring a material new scope/policy decision pauses only the dependent work. The next ready task is selected by the parent dependency table; no automatic owner acceptance.

**Checklist:** Self-checked for task scope/assertions and parent links; runtime evidence Not run at authoring.
