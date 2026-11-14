# SP-08 linked knowledge and keyword search

**Artifact ID:** FEAT-SP08-01
**Version/date:** 0.2 Draft · 13 November 2026
**Status:** Registered for sequential execution.
**Planning mode:** Planned interactively before execution.
**Inputs:** [SP-08](../../../../specs/008-linked-keyword-search.md), [PRD](../../../sdlc/PRD_SRS.md), [architecture](../../../architecture.md), [contracts](../../../../contracts/README.md), ADR-0004/0006/0007/0011/0017 and Proposed ADR-0033/0034.
**Trace:** FR/AC-16/17/18/19/20/31/34/47/59/63; BR-01/05/06/07/10/11/13; SC-01/04/05/06/08.

Parent [PLAN-01 Month 2](../../../planning/five-month-plan.md), [M-05](../../roadmap.md) and [SP-08.1–08.3](../../tasks/08-linked-keyword-search.md). SP-03, SP-06 and SP-07 provide work and document prerequisites. Base 0ab2854 includes the merged PR #5.

## Decisions and boundaries

- Owner selected Must first, scoped prototype UI and private project link-create plus current read on both endpoints. FR-49 and FR-70 remain backlog. FR-49 needs link lifecycle permission, removal from both views, retained endpoints and audit. FR-70 needs Workspace-scoped Task reads and independent outage behavior.
- Workspace owns scope and operation authority. Knowledge owns link/audit/receipt and scoped keyword SQL. Use the existing TLS transport and project guard with final permission and lifecycle checks. Scope signed cursors to actor/project/query or endpoint and complete eligible projection. [Proposed ADR-0035](../../../adr/0035-sp08-guarded-discovery.md) records bounded D-04/D-07 mechanics for SP-08.
- Runtime edits follow the SP-08 allowed paths. Coordinated contract changes cover cursor errors and the Workspace project-scoped facade mapping. See the [runtime runbook](../../../../services/workspace/DISCOVERY.md). Guard failures deny disclosure. Current-only is default; explicit history is labelled. No semantic producer or board redesign in this slice.

| Task | Outcome | State |
| --- | --- | --- |
| [P00](tasks/P00.md) | Source registration | Registered |
| [P01](tasks/P01.md) | Authority and transport | Implemented and verified in disposable PostgreSQL/TLS |
| [P02](tasks/P02.md) | Manual links | Implemented and verified in runtime regression |
| [P03](tasks/P03.md) | Keyword search | Implemented and verified in runtime regression |
| [P04](tasks/P04.md) | Live web | Implemented; browser verification recorded in handoff |
| [P05](tasks/P05.md) | Verification and publication | Regression passed; publication tracked on GitHub |

## Verification

Use Node 24, disposable PostgreSQL and standard Workspace/Knowledge entry points over trusted TLS. Exercise link rollback/replay, access/withdrawal/rejoin, valid and invalid cursor scope, Current and History, archival and deletion, and independent dependency failures. Run targeted HTTP and browser verification, SP-05–07 regressions, typecheck/build/context/docs/contracts. Keep run logs and synthetic corpus separate from historical evidence.

## Local handoff

SP-05 88/88, SP-06 51/51 and SP-07 33/33 in the disposable suites. Existing Sprint/Document Edge regression 3/3. Typecheck, build, foundation, prototype, context, docs and contract checks passed. SP-08 runtime and Edge acceptance passed 3/3, including link creation from the browser. The fixture covers both entrypoints, link/audit transaction and replay, scoped Current/History, grant/revoke/rejoin, stale and foreign cursors, guarded handoff, and unavailable Knowledge with working Task reads. The browser path uses synthetic records and produces fresh desktop/mobile evidence. Keyword was tested without provider or embedding configuration.

The [runbook](../../../../services/workspace/DISCOVERY.md) contains the repeatable corpus and startup. Semantic readiness and full AI citation delivery remain outside this evidence. The prior 5173 daemon uses its own source and bootstrap; use the standard entrypoints from this branch for an SP-08 demo.

Use the [task breakdown](breakdown.md) and [backtracking handoff](../../../sdlc/reports/SP-08-backtracking-handoff-2026-11-13.md) to isolate regressions by task and test.
