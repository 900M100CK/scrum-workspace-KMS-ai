# Document access and lifecycle safety

**Artifact ID:** FIX-DOCUMENT-SAFETY-01
**Version/date:** 0.1 Draft · 13 November 2026
**Status:** Local implementation and targeted regression verified. Publication and CI tracked separately.
**Work kind:** Fix.
**Planning mode:** Planned interactively and authorised for execution.
**Inputs:** [Review and reproduced failures](../sp-05-sp-07-review/plan.md), [SP-06](../../../../specs/006-document-access.md), [SP-07](../../../../specs/007-version-publication.md), [ADR](../../../adr/0034-document-safety-recovery.md).
**Trace:** FR/AC-04/10/11/12/13/14/39/47/48/50/51/52/59; BR-01/04/05/10/11/14; SC-05/06. SP-05 regression for shared Workspace behavior.

## Scope

[PLAN-01 Month 2](../../../planning/five-month-plan.md) and [M-04/M-05](../../roadmap.md). Parent work [FEAT-SP06-01](../sp-06-document-access/plan.md) and [FEAT-SP07-01](../sp-07-version-publication/plan.md). Repair six review findings and the replay fixture. Keep numeric expected revisions. Scope includes Workspace authority, sessions, project membership, guarded HTTP, runtime and additive migrations; Knowledge documents and runtime; web document UI/recovery; targeted test fixtures and planning/ADR/spec records. Use disposable PostgreSQL and trusted TLS. Preserve evidence and check rollback refusal for retained work.

| Task | Verification | Status |
| --- | --- | --- |
| [F01](tasks/F01.md) | Scoped grants, old data and exact replay | Verified in policy and migration suites |
| [F02](tasks/F02.md) | Revocation and response handoff | Verified in paused-read regression and guard suite |
| [F03](tasks/F03.md) | Durable same-key reconciliation and stale delete | Verified in runtime and restart regression |
| [F04](tasks/F04.md) | Standard startup and trusted TLS integration | Verified through both service entrypoints |
| [F05](tasks/F05.md) | Cursor binding and web recovery | Verified in runtime and web tests |
| [F06](tasks/F06.md) | Regression, publication and CI | Local regression passed; PR and CI pending |

Run SP-05/06/07 PostgreSQL, HTTP, DOM and Edge suites, typecheck/build/foundation/context/docs/contracts, and diff check. Save raw output in a fresh evidence destination. Publish one PR to main after the target gates pass.

## Local verification

Node 24.21.0, PostgreSQL 17.10 in disposable Docker fixtures, trusted localhost TLS and isolated Edge. SP-05 88/88, SP-06 51/51, SP-07 33/33, Edge 3/3 and focused runtime/migration regressions 3/3. Web recovery test passed with the exact body and key after reload. Typecheck, build, foundation, prototype, context, documentation and contract checks passed. Existing historical receipts were preserved. The runtime suite covers document content/history; downstream retrieval, semantic readiness and citation delivery require separate verification.

Operational setup and legacy unavailable-policy reconciliation are in the [runtime runbook](../../../../services/workspace/DOCUMENT-SAFETY.md).
