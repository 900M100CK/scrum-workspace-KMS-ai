# Ask and Task reliability corrections

**Artifact ID:** FIX-ASK-TASK-01
**Version/date:** 0.2 Draft · 18 November 2026
**Status:** Implemented; bounded author verification recorded.
**Planning mode:** Unavailable; written planning gate used.
**Work kind:** Fix
**Inputs:** Working tree on 94136ee (with existing changes); [SP-09 v0.9.4](../../../../specs/009-cited-question.md), [SP-10 v0.5.4](../../../../specs/010-current-work-question.md), [SP-03 v0.8.2](../../../../specs/003-create-task.md), [SP-04 v0.7.7](../../../../specs/004-update-task.md); existing HTTP contracts and proposed ADR-0020/0028.
**Trace:** [PLAN-01](../../../planning/five-month-plan.md) / [M-02 and M-06](../../roadmap.md); FR/AC-05/09/22/23/24/25/26/46; BR-02/08/09/10/12/13, SC-02/03/06/07/08.

The owner supplied static findings: an empty 401 skips session expiry; malformed replies can crash Ask; loading all options delays selection and can cycle; failed final execution recording is silent; create/update duplicate the recovery write gate. Correct these four behaviours within the existing feature boundaries. No schema, contract, provider, permission or durable handoff changes.

Parent packs: [SP-03](../../tasks/03-create-task.md) and [SP-04](../../tasks/04-update-task.md) for mutation recovery; [SP-09](../../tasks/09-cited-question.md) and [SP-10](../../tasks/10-current-work-question.md) for answer inspection, final execution recording and scope selection. Allowed paths: web Ask and Task controllers/views, Workspace question HTTP, focused tests and plan registration. Knowledge remains the execution store owner. Only the fixed warning code and server-generated request ID may leave Workspace in the diagnostic.

| Task | Dependency | Status |
| --- | --- | --- |
| [F01 Ask responses](tasks/F01-ask-responses.md) | Existing SP-09/10 | DOM passed: empty 401, malformed 200 and valid partial answer with citation open. |
| [F02 Resource paging](tasks/F02-resource-paging.md) | Existing SP-10 list endpoints | DOM passed: submit from page one, cursor cycle, selection retention, canceled old scope, denied page clears options. |
| [F03 Execution warning](tasks/F03-execution-warning.md) | Existing SP-09 record action | Runtime passed: dropped record call leaves final duration unset, preserves answer and emits only code and request ID. |
| [F04 Task recovery](tasks/F04-task-recovery.md) | Existing SP-03/04 recovery | Existing controller suites passed; common helper preserves write-readback-before-send and exact replay. |

Verification on Windows with Node 24.22.3:

- `node --test tests/workspace/ask-ui.test.mjs`: all three DOM scenarios passed (four reported results including the parent). Synthetic HTTP responses exercise the Vite-transformed React view; no browser cookie or layout evidence.
- `node --test tests/workspace/task-ui-controller.test.mjs tests/workspace/task-mutation-ui-controller.test.mjs`: 14 passed.
- `node --test --test-concurrency=1 tests/workspace/sp09-runtime.test.mjs tests/workspace/sp10-runtime.test.mjs` with the local test certificate in `NODE_EXTRA_CA_CERTS`: seven passed, two opt-in Edge cases skipped. Standard service entry points, disposable PostgreSQL and a synthetic provider. Initial attempts stopped at missing Docker and untrusted HTTPS readiness; the final run used Docker and explicit local CA trust.
- `npm run test:foundation`: 29 passed, one opt-in HTTPS test skipped. First attempt hit sandbox loopback denial; the approved local run passed.
- Build, typecheck, context lint/check/test, docs lint/test, contract tests and diff whitespace checks passed. Author pre-flight and scoped diff review found no new scope, authority or data-format change.

Handoff: keep the warning on Workspace stderr; correlate it with the server-generated request ID. It signals missing or unconfirmed final metrics and is separate from handoff manifests and business audit. Roll back only these scoped changes if needed; no migration or stored recovery format changed. Browser, external provider and release acceptance are outside this evidence.
