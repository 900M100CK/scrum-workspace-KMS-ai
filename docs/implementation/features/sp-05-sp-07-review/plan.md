# SP-05–SP-07 review and regression

**Artifact ID:** REVIEW-SP05-SP07-01
**Version/date:** 0.1 Draft · 13 November 2026
**Status:** Review and regression executed. Runtime findings and an SP-06 assertion remain open.
**Planning mode:** Unavailable in this session. Written planning gate used.
**Work kind:** Test and code review.
**Owner role:** Sequential reviewer.
**Inputs:** [BRD v1.0](../../../BRD.md), [PRD](../../../sdlc/PRD_SRS.md) v0.10.3, [architecture](../../../architecture.md) v0.19.1, [contracts](../../../../contracts/README.md), ADR-0007/0008/0009/0013/0014 and Proposed ADR-0030–0033. Source commit 4e185cc.
**Trace:** SP-05 v0.7.6 FR/AC-06/07/08/41/42/66/67, BR-02, SC-03; SP-06 v0.6.4 FR/AC-04/10/14/50/51/52/59, BR-01/04/10/14, SC-06; SP-07 v0.6.3 FR/AC-11/12/13/15/19/47/48/61, BR-05/07/12/14, SC-05/06.

## Scope and registration

Review the integrated feature branch and rerun existing suites. Parent [PLAN-01 Month 2](../../../planning/five-month-plan.md) and [roadmap M-03–M-05](../../roadmap.md). Canonical [SP-05](../../../../specs/005-sprint-lifecycle.md), [SP-06](../../../../specs/006-document-access.md), [SP-07](../../../../specs/007-version-publication.md) and owning plans [SP-05.1–05.4 and selected Could](../sp-05-sprint-lifecycle/plan.md), [SP-06.1–06.4](../sp-06-document-access/plan.md), [SP-07 P01–P09](../sp-07-version-publication/plan.md). Registered in the [work plan index](../README.md), [artifact register](../../../sdlc/artifact-register.md) and [source register](../../register.md).

Workspace owns Sprint state and document policy. Knowledge owns immutable content and lifecycle. Trace authority, retry, audit and disclosure across both services and the web consumer. Product and test sources are read-only for this review. Writes are limited to this plan, its registrations, ignored build output and isolated fixture resources. Use synthetic data and disposable PostgreSQL. No development database migration, feature fix, Git publication or release approval. Capture run output outside tracked source and record counts and gaps here.

## Tasks

| ID | Outcome | Status |
| --- | --- | --- |
| [R01](tasks/R01-source-review.md) | Prioritised findings with source and user impact | Executed; six findings below |
| [R02](tasks/R02-test-execution.md) | Exact suite outcomes and failure triage | Executed; SP-06 assertion failed |

## Acceptance

SP-05 exercises lifecycle, authority, replay and concurrent allocation; SP-06 exercises project/document separation, guarded transport and revocation; SP-07 exercises atomic replacement, exact history, permission, lifecycle and replay. Record browser and runtime outcomes separately from structural checks. Report untested downstream retrieval/citation paths and classify failures by cause.

## Source review findings

1. **P1 — A restricted read can complete after revocation commits (SP-06/SP-07).** The [document read](../../../../services/workspace/src/documents/orchestration.ts#L226) checks authority before taking the shared guard. The [revocation route](../../../../services/workspace/src/documents/http.ts#L147) calls the database mutation directly. The read releases the guard before the HTTP reply. History and exact-version reads use the same sequence. A controlled Knowledge response confirmed that a real Workspace grant can be revoked while the read waits, after which protected content still returns. Hold the guarded delivery through response completion and coordinate permission mutations with the same guard and current authority check.
2. **P1 — A stale delete hides live content and blocks reconciliation (SP-07).** [Delete orchestration](../../../../services/workspace/src/documents/orchestration.ts#L444) commits Workspace unavailable before Knowledge checks the expected revision. The failed command leaves the policy unavailable and current write authority rejects the same-key retry before it reaches Knowledge. Reproduced against Workspace PostgreSQL with a controlled Knowledge 409. Record a fenced pending command separately from confirmed unavailability and preserve authorised same-key reconciliation.
3. **P1 — Standard service startup omits document routes (SP-06/SP-07).** The [Workspace server](../../../../services/workspace/src/server.ts#L10) supplies no document store/orchestrator, so its app skips document registration. The [Knowledge app](../../../../services/knowledge/src/app.ts#L2) only registers health. Tests inject stores or transport implementations into fixtures. Wire the guarded transport and both route groups into the normal startup path.
4. **P1 — Project author/admin can archive or delete another author's restricted document (SP-07).** [Write authority](../../../../services/workspace/src/documents/authority.ts#L98) accepts project-scoped create/admin rights for any active document. [Archive and delete](../../../../services/workspace/src/documents/orchestration.ts#L379) use that check. ADR-0007 and AC-13/48 require independent document lifecycle authority. Provision and check scoped content-write and lifecycle rights.
5. **P2 — History cursor survives version changes and is transferable (SP-07).** The [Knowledge store](../../../../services/knowledge/src/documents/store.ts#L512) accepts an unsigned timestamp/version pair. An authorised reader can reuse it for a different document or after revision/archive and receive a mixed-generation page. Bind cursors to caller, scope and projection revision and return the specified 400/409 outcomes.
6. **P2 — The web client discards the original command identity on a lost response (SP-07).** [Revise and archive](../../../../apps/web/src/documents.ts#L331) allocate a fresh key per call. If the first request commits and the response is lost, resubmission can conflict and cannot recover the original receipt. Retain the exact key and request until the outcome is reconciled.

## Verification results

Source 4e185cc on codex/sp-07-version-publication. Node 24.22.1, Docker 29.3.1, pinned pgvector/PostgreSQL 17.10, trusted localhost TLS. Logs are in the run evidence folder outside the source tree.

- SP-05 existing non-browser suite: 88 passed; Edge 2/2. Covers Workspace PostgreSQL, HTTP, authority, concurrency, rollback, controller and DOM.
- SP-06 existing non-browser suite: 49 passed; Edge 1/1; two failing Node entries (one assertion and its parent). In document-policy.test.mjs:96 the first request omits document_id and the same-key replay adds the returned ID. The implementation hashes the supplied ID, so the changed payload receives 409. Public create with the same original payload has a passing recovery test. Resolve the intended private policy-call contract before changing the test or implementation.
- SP-07 existing suite: 33 passed. Knowledge store/internal HTTP exercise disposable PostgreSQL. Workspace orchestration and version DOM suites use simulated Knowledge transport. No dedicated SP-07 Edge test exists in this checkout.
- The first SP-05 Edge run hit certificate trust at Playwright route.fetch. Both passed on retry with Playwright 1.61.1 and a Node process-local localhost CA preload. TLS verification remained enabled. The SP-06 browser and SP-07 DOM runners write fixed historical result filenames; fresh copies are in the run folder and the historical files were restored.
- Two diagnostic probes reproduced findings 1 and 2. Their green assertions confirm current faulty behavior. They are outside the product test suite.
- Typecheck, build, context lint/check, docs lint and metadata passed. Node reported context 45/45, docs 20/20, contracts 27/27 and foundation 29/29 with the opt-in HTTPS case.
- Keyword/semantic retrieval, exact citation delivery, and production startup through real cross-service transport remain outside the executed evidence.
