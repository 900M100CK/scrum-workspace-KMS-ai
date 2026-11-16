# V01 — Verify retrieved injection and outage continuity

Version 0.2 Draft · 16 November 2026. [Owning plan](../plan.md) · [SP-09 v0.9.4](../../../../../specs/009-cited-question.md) · [SP-12](../../../../../specs/012-failure-and-evaluation.md) · [PLAN-01 Month 3](../../../../planning/five-month-plan.md) · [M-06](../../../roadmap.md) · [SP-09 task pack](../../../tasks/09-cited-question.md). Planned in Plan mode against baseline `94136ee`. The review findings are GAP-01 and GAP-02 in REPORT-SACW-REVIEW-01 v1.1.

Trace AC-30/BR-08/BR-10/SC-06 and AC-33/34/69/BR-07/BR-13. Workspace owns access and the HTTP boundary. Knowledge owns immutable sources and execution records. Use disposable databases, the standard service entry points and a loopback provider with synthetic data.

## V01.1 — Isolate the candidate

Bring forward only the targeted Workspace suite, the Knowledge synthetic excerpt allowlist addition and the SP-09 planning and handoff records. Preserve other working-tree and staged changes. Compare the isolated diff to `94136ee` before publication. Application interfaces, schema and permission policy are outside this task.

## V01.2 — Verify disposable HTTP and PostgreSQL

Depends on V01.1 and the [Node 24, PostgreSQL 17 and TLS setup](../README.md). Run syntax, context lint/check and typecheck separately from runtime. Run both Workspace suites together with Edge unset using the [handoff commands](../verification-handoff.md). Record the tested candidate identifier, environment, exit status, counts and failures.

- GAP-01 / AC-30. The exact malicious passage reaches the provider fixture. The restricted excerpt, title, document, version and passage identifiers stay out of the provider and HTTP responses. Task, document and version snapshots and business audit counts match before and after. The fixture request exposes no write interface. Real-model behaviour is outside this assertion.
- GAP-02 / AC-33/34/69. For a failed connection, timeout and budget refusal, Ask returns the expected failure without generated text, with a matching execution error. Task creation and state changes survive fresh reads. The permitted document opens and keyword search finds and opens the exact version. During timeout the provider remains held through the fallback checks. Sprint operations and broader mutation coverage remain SP-12.
- Retain negative results. Fix only test/setup errors within the allowed paths and rerun both suites. Record any reproduced application defect and its failing assertion.

## V01.3 — Verify Edge or hand off

Once the runner is ready, run the existing Edge regression for 1280 px and 390 px once. If browser setup needs further iteration, hand off the [commands and expected results](../verification-handoff.md) against the candidate head. Track Edge status separately from the GAP runtime assertions.

## V01.4 — Publish and hand back

Publish a scoped draft PR into main and record the head and CI status. Report missing runtime evidence as pending. Continue the static review against the baseline and cite candidate runtime evidence by its tested SHA. Keep GAP-03/GAP-04 and real-provider acceptance open.
