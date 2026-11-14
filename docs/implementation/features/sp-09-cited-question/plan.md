# SP-09 cited question fixture increment

**Artifact ID:** FEAT-SP09-01
**Version/date:** 0.3 Draft · 14 November 2026
**Planning mode:** The owner supplied the execution plan. Plan mode was unavailable for the documentation correction in Default mode. The original implementation began before the task briefs were complete.
**Inputs:** [SP-09](../../../../specs/009-cited-question.md), [SP-11](../../../../specs/011-audit-and-source-inspection.md), [PRD](../../../sdlc/PRD_SRS.md), [ADR-0012](../../../adr/0012-audit-visibility-and-durable-evidence.md), [Proposed ADR-0020](../../../adr/0020-manifest-bound-ai-transport.md), [Proposed ADR-0023](../../../adr/0023-immutable-handoff-storage.md).
**Trace:** FR/AC-21/22/23/24/28/29/30/32/46/53/54/55/57/60/69; SC-02/06/07/08.

Parent [PLAN-01](../../../planning/five-month-plan.md) Month 3 / [M-06](../../roadmap.md). [SP-09.1–09.4](../../tasks/09-cited-question.md) and [SP-11.2/3](../../tasks/11-audit-and-source-inspection.md). Base 723e443 includes SP-08.

## Selected fixture scope

D-06 selects synthetic fixtures first. One fixed cosine configuration and a loopback-only mock exercise retrieval and generation. A real provider, model quality and SP-12 pilot thresholds require separate evidence. D-07 uses two separately prepared and permanently claimed handoffs under existing project/session enforcement. Knowledge owns immutable manifests, run evidence and exact source validation; Workspace owns authority, relay and protected HTTP handoff. Unknown commits or sends fail closed. SP-11 captures run, provenance and observed transport outcomes. Optional inspection, operational answers and real provider activation remain separate.

| Task | Scope and acceptance | Status |
| --- | --- | --- |
| [P00](tasks/P00.md) | Register scope and dependencies | Registered |
| [P01](tasks/P01.md) | Existing pgvector eligibility, fixed vectors, cross-project and restricted negative | Implemented |
| [P02](tasks/P02.md) | Exact durable provider manifest and one-use guarded handoff | Implemented |
| [P03](tasks/P03.md) | Validated answer, separate guarded delivery, exact passage | Implemented |
| [P04](tasks/P04.md) | Ask UI, evidence panel and independent keyword fallback | Implemented |
| [P05](tasks/P05.md) | Disposable PostgreSQL/TLS, TC-26 byte boundaries, Edge, regression and structural gates | Bounded fixture verification recorded |

Use the [task breakdown](breakdown.md) for dependencies and the [dated handoff](../../../sdlc/reports/SP-09-fixture-handoff-2026-11-13.md) for observed results, review steps and follow-up.

## Fixture verification

The [runbook](README.md) starts the standard service processes on a disposable test environment with Node 24.21.0, PostgreSQL 17 and trusted local TLS. Run logs and Edge screenshots are stored separately from historical evidence.

| Acceptance area | Runtime observation |
| --- | --- |
| Retrieval | A paraphrase without the document keywords found the intended source. A closer restricted candidate was excluded before provider input. The run persisted cited and uncited provenance. |
| Answer and locator | Answered, partial, insufficient and conflict results were exercised. Fabricated locators and unsupported text withheld the draft. The exact old passage was retrieved after supersede. Deletion returned verified unavailable identity to a reader with retained access. Denied and unknown locators returned the same generic response. |
| Handoff | Both purposes rejected lost preparation acknowledgements, deferred claim commit failures, payload and manifest mutations, revocation and version changes. The fixture counted provider requests and the browser HTTP tests checked the exact public failure body. Killing Workspace with a claim held before transmission left an unresolved record that blocked new sends after restart. A duplicate claim yielded no fence. |
| Failure isolation | Prompt injection caused no document write. Provider error, timeout and budget exhaustion produced empty answer payloads. Task and keyword endpoints remained available during provider failure. |
| Browser | Edge exercised Ask, the source panel and keyword fallback at 1280 and 390 px using the live React app. |

Application regression for SP-06–08 passed 82 checks. The fixture uses a single Workspace gateway, fixed synthetic vector data and an independently checked expected fixture answer. Transport completion is observed at Node's request/response finish event. The suite uses receive-side bytes for refusal scenarios, with separate coverage still needed for backpressured sockets during an in-progress write and actual network loss of the Workspace claim commit acknowledgement. Operator evidence is required to reconcile a real unknown send. Provider/model selection, broader semantic quality and the SP-12 thresholds remain separate.

## Git publication and checkout cleanup

The owner approved this sequence in Plan mode on 14 November 2026. Publication covers the fixture implementation, tests, SP-09 handoff, and SP-08 backtracking documentation. Review uses a draft PR to main. The fixture acceptance gaps above remain open.

| Task | Depends on | Acceptance | Status |
| --- | --- | --- | --- |
| [PUB01](tasks/PUB01-publication.md) | P05 | Scoped commit, pushed draft PR and exact-head CI result | Ready |
| [PUB02](tasks/PUB02-main-and-cleanup.md) | PUB01 publication | Fast-forward local main, verify SP-08 backup and safely remove checkout and branch | Ready |
| [PUB03](tasks/PUB03-handoff.md) | PUB01 and PUB02 results | Publish the receipt and report any items still retained | Ready |
