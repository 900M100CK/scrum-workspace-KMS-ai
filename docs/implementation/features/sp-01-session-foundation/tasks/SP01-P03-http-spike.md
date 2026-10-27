# SP01-P03 — HTTP and toolchain compatibility spike

**Artifact ID:** SP01-P03\
**Version/date:** 0.1 Draft · 27 October 2026\
**Status:** Task brief only; execution state and result are authoritative in the parent plan.\
**Inputs:** [FEAT-SP01-01](../plan.md) v0.2; [canonical SP-01](../../../../../specs/001-session.md) v0.4; [canonical brief](../../../briefs/SP-01.1-session-foundation.md) v0.2; [runtime spike brief](../../../../../SP-01.1-spike-brief.md) v0.2; Proposed ADR-0024/0025.\
**Trace:** Parent SP-01.1; FR-01/36/37/68 and relevant ACs/TCs as mapped in the plan; BR-01/10; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer.

## Read first and scope

Read [parent plan and current state](../plan.md#tasks-and-acceptance), [execution rules](../../../execution.md), [root instructions](../../../../../AGENTS.md) and the exact contract/requirements linked by the parent. Do not start a gated task merely because this file exists.

- Phase: preparation; no application adoption.
- Prerequisites: SP01-P01 and SP01-P02; synthetic fixture inputs only.
- Allowed write scope: Runtime src/test/results and isolated dependency manifests; registered evidence documentation.
- Parent: PLAN-01 Month 1 / M-01; canonical pack child 01.1.
- Guardrails: retain service ownership, current server-derived authority and mandatory applicable audit; no accepted-ADR edits, commits, external real-data transfers or parallel agents by this task.

## Work steps

1. Implement real Fastify candidate routes using exact POST/GET/DELETE /session contracts and a recorded validator/serializer mapping.
2. Run E-HTTP-03 baseline control before intended explicit body settings; distinguish missing username from extra fields alongside a valid username.
3. Exercise the E-HTTP table, including actual compiler/startup, separate object-before-serialization and wire-output assertions, HTTPS cookies, chosen CSRF and log canaries.

## Acceptance assertions

- SP01-P03-A1: Intended body validation rejects actor/type extras without silent mutation; negative control records observed default differences.
- SP01-P03-A2: Response-invalid fixtures do not become client 400 just to match request tests; output projection/error is recorded, token/hash fields absent on the wire.
- SP01-P03-A3: Exact tuple, schema refs/formats and serializer paths are tested; HTTPS header observations are not called browser cookie enforcement. Unmapped 413/415 shapes are contract findings.

## Verification and evidence

Implement and execute node:test adapter tests plus the chosen actual compiler/typecheck/startup and HTTPS client commands. Record names/commands after they exist; E-HTTP experiments remain lab evidence only.

Use actual source/configuration/fixture identity, safe failure observations and per-assertion outcomes. Keep failed attempts. Tests of schema, SQL, laboratory handlers, actual application handlers and browser interactions are separately labelled; no inherited pass is created by copying this brief. No task-specific executable command is claimed before it exists.

## Result and next-agent handoff

Per-assertion E-HTTP results, compatibility failures/config requirements and lab handler evidence separate from application evidence.

Save a dated result under docs/sdlc/reports/ using the [handoff template](../../../handoff-template.md); register it, then update this task's status/result cell in [plan.md](../plan.md). Keep mutable execution status in that one table, not a second checklist here. A task requiring a material new scope/policy decision pauses only the dependent work. The next ready task is selected by the parent dependency table; no automatic owner acceptance.

**Checklist:** Self-checked for task scope/assertions and parent links; runtime evidence Not run at authoring.
