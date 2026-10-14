# Specification consistency review

**Artifact ID:** SPEC-REVIEW-01

**Version/date:** 0.4 Draft · 11 October 2026

**Status:** Draft; Ready for downstream correction. Not product approval or independent review.

**Owning role:** Stage 9 — [Consistency Reviewer](../../agents/09-consistency-review.md)

**Workflow:** [SDLC workflow](../../agents/WORKFLOW.md), Review loop and Start and handoff contract.

## Scope and source versions

This is a focused corrective re-review of version 0.1, with a scoped 4+1 architecture follow-up in v0.3. It corrects language, source versions, evidence claims and two stale findings. It does not repeat a complete semantic audit of every artifact, accept proposed policies or demonstrate implemented behaviour. Findings F-01–F-12 retain their identifiers for downstream tracking.

| Input | Version / role |
| --- | --- |
| [BRD baseline](../baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md) | BRD v1.0; BR-01–BR-15 and SC-01–SC-08 |
| [PRD/SRS](PRD_SRS.md), [use cases](use-cases.md) | PRD-01 v0.4; UC-02 v0.2 |
| [Architecture](../architecture.md), [SAD entry](SAD.md) | SAD-03 v0.5 (4+1 View Model) is the design source; entry v0.4 points to it |
| [Data design](data-design.md), [logical model](../../contracts/data-model.json) | DATA-04 v0.1 and draft logical contract |
| [API design](api-design.md), [Workspace OpenAPI](../../contracts/openapi/workspace.openapi.json), [Knowledge OpenAPI](../../contracts/openapi/knowledge.openapi.json) | API-05 v0.1 and draft HTTP contracts |
| [Diagram index](diagrams/README.md), [diagram review](diagrams/review.md) | UML-07 v0.4; DGM-REVIEW-01 v0.2 |
| [Permission matrix](../ux/permission-matrix.md), [personas](../ux/personas.md), [sitemap](../ux/sitemap.md), [UX flows](../ux/flows/) | Existing Stage 6 supporting drafts; their existence does not complete its gate |
| [Test plan](test-plan.md), [evaluation cases](evaluation-cases.md) | TEST-08 v0.2; EVAL-CASES-ENTRY v0.2 reference entry, not measured results |
| [Artifact register](artifact-register.md) | REG-00 v0.11 |

Version 0.1 referred to older SAD-03 v0.2 and REG-00 v0.5 snapshots. Those references cannot establish the state of current artifacts. Updating this list alone does not revalidate all earlier findings.

## Findings and correction owners

### Scoped author correction addendum — 11 October 2026

The three UX flows are now v0.3, four Mermaid/Draw.io flowcharts v0.2, UML-07 v0.5 and REG-00 v0.12. The preceding v0.3 input table and findings below record the prior review snapshot. No independent closure is claimed by this editing pass.

| Review items | Current correction / residual work |
| --- | --- |
| D1–D4, D5–D6 / F-02–F-04 | Docs flow uses initial Current, two classifications, per-operation capability and scope checks, immutable revisions, exact API paths and conflict/retirement/revocation branches. Permission matrix and other UX sources still need separate reconciliation. |
| D4b | Lifecycle and indexing readiness are independent. Registry activation belongs to creation registration, not publication indexing. Publishing is an in-flight UI state; Current/search readiness reflect separate confirmed facts. |
| A1–A5, P1–P2 / F-01, F-11 | Generic insufficient evidence; four access checkpoints; whole original draft withheld; exact placeholders; guarded citation inspection; capability-aware create action and dependency-specific fallback. Terminal withheld and surviving-identity unavailable-citation wire mappings remain Stage 5 gaps. |
| B1–B4 / F-04, F-12 | Board diagram already contained resolve/no-Active branches; Markdown now matches them. Both blocker events use the contract endpoint, server validation is explicit, membership loss is handled, and columns match Core. Permission matrix still carries older state/role assumptions. |

Sources: PRD v0.4, UC v0.2, SAD v0.5, Proposed ADR-0001 v0.2/ADR-0006 v0.1, OpenAPI v0.1.0. This restores documented policy rather than making a new architecture decision. Proposed statuses and OD-02/OD-04 remain unchanged. Stage 8 should add/trace assertions for registration pending, Current with failed readiness, stale publication, revocation at all four boundaries, exact unavailable citations, non-disclosing messages, Knowledge outage versus AI outage, both blocker events and membership loss.

Flowcharts are UX/control-flow illustrations, not certified UML activity diagrams. Rendered usability, full workbook review, runtime permission/concurrency tests and provider evaluation remain unexecuted. Flat template paths were absent in this checkout; prompt text was read from the pinned template repository HEAD. Nested template changes were preserved. F-01–F-12 IDs/statuses below are historical until the affected surfaces are re-reviewed.

Severity records the original impact. Status distinguishes source-inspected resolutions from open or pending findings; it is not approval. Ten findings remain open or pending revalidation, including three Blocking findings. F-06 and F-09 are resolved by current source inspection only.

| ID | Severity / status | Source location and evidence | Affected trace | Correction owner and next action |
| --- | --- | --- | --- | --- |
| F-01 | Blocking — Open | [AI flow](diagrams/flowchart/ai-qa-flow.mmd), SendQueryAPI/StreamAnswer, and [AI UX](../ux/flows/ai-qa-flow.md) conflict with [architecture](../architecture.md), Process View (§3), and UC-09 in [use cases](use-cases.md): JWT/streaming sketches omit the full protected handoff and withholding flow. | BR-01, BR-08, BR-10, BR-14; SC-02, SC-06; FR-28, FR-29 | Stage 6 with Stage 3/5; reconcile opaque-session, context-submission and buffered-delivery states with draft contracts. Stage 7 synchronizes diagram formats. |
| F-02 | Blocking — Open | [Document flow](diagrams/flowchart/docs-flow.mmd), SaveDraftNew/LoadExistingDraft/AutoSave, and [document UX](../ux/flows/docs-flow.md) show initial Draft and saved Draft editing. [Data design](data-design.md), State and query rules, and UC-06/UC-07 specify initial Current and immutable revisions. | BR-04, BR-05, BR-14; SC-05; FR-10, FR-11 | Stage 6 with Stage 4/5; distinguish unsaved editor state from persisted immutable versions and align creation/publication. OD-04 remains Proposed. |
| F-03 | Blocking — Open | [Permission flow](diagrams/flowchart/permission-read-flow.mmd) and [permission matrix](../ux/permission-matrix.md) use Public/Internal/Restricted and role gates. [PRD](PRD_SRS.md), Actors, capabilities and terms, and [ADR-0001](../adr/0001-protected-resource-read-policy.md) use project_shared/restricted with authoritative scoped decisions. | BR-01, BR-10, BR-14; SC-06; FR-03, FR-04, FR-50 | Stage 6 with Stage 1/2/3; preserve project AND document checks and unknown/error denial. Role titles grant no blanket restricted-source access. |
| F-04 | Important — Open | [Flowcharts](diagrams/flowchart/) and [UX flows](../ux/flows/) use POST /api/v1/ai/query and PATCH /api/v1/tasks/:id/status. Draft [Knowledge](../../contracts/openapi/knowledge.openapi.json) and [Workspace](../../contracts/openapi/workspace.openapi.json) contracts use POST /knowledge/questions and POST /tasks/{task_id}/state. Publication also requires a version locator. | BR-02, BR-03, BR-05, BR-08; FR-09, FR-44, FR-45, FR-53 | Stage 5, then Stage 6/7; map exact operation IDs/paths and error branches. Path drift alone does not prove authoring order. |
| F-05 | Important — Pending revalidation | [Service composition](diagrams/architecture/service-composition.drawio), WD/diagram-title; prior [diagram review](diagrams/review.md) recorded an overlap and strict-validator warning. No new geometry validation or rendered inspection is claimed here. | BR-01–BR-14; architecture composition | Stage 7; inspect current geometry and record fresh validation/render evidence for the exact source version. |
| F-06 | Important — Resolved by source inspection | [Architecture](../architecture.md), header, is v0.5 and explicitly consumes UC-02 v0.2. The old v0.1 input citation is no longer present there. | Stage 2 to Stage 3 version trace | Stage 3; no further header correction needed for this finding. This does not validate every architectural flow. |
| F-07 | Important — Pending design revalidation | [Data design](data-design.md), Ownership and relationships / State and query rules, and [logical model](../../contracts/data-model.json), ReadGrant, need checking for how grant_generation, membership removal and rejoin prevent old-grant revival. A logical key lacking revoked_at alone does not prove a defect. | BR-10, BR-14; SC-06; FR-39, FR-52 | Stage 4; demonstrate the invalidation/query invariant and specify negative tests before prescribing a new field or storage policy. |
| F-08 | Important — Open | [Use cases](use-cases.md), UC-05/UC-09/UC-12 exception flows, need explicit mapping to [test-plan](test-plan.md) assertions. General TC groups do not prove coverage of each EX branch or SC journey. | NFR-02, NFR-03; SC-01–SC-08 | Stage 8; map each UC-qualified EX identifier to planned assertions or a named gap. A forced one-to-one test mapping is unnecessary. |
| F-09 | Minor — Resolved by source inspection | The path `docs/sdlc/diagrams/use-case-diagram.drawio` is absent; [the categorized source](diagrams/use-case/use-case-diagram.drawio) exists. The duplicate finding is stale for the current inventory. | Stage 7 folder-per-type convention | Stage 7; retain the categorized source as the indexed artifact. This corrective review performed no deletion and makes no rendered-quality claim. |
| F-10 | Minor — Pending environment revalidation | [Diagram review](diagrams/review.md), rendered-review/CLI limitation, records an earlier Electron AppContainer/ACL startup failure. This is historical environment evidence, not a fresh diagnosis. | Diagram export and visual verification | Workstation owner and Stage 7; rerun the renderer when available and inspect output. No ACL change, export or visual acceptance is claimed here. |
| F-11 | Minor — Open | [Personas](../ux/personas.md), journey satisfaction scores, and [AI UX examples](../ux/flows/ai-qa-flow.md) must distinguish design illustrations from observed research and actual source evidence. | BRD section 13.2; NFR-07, NFR-09; BR-08, BR-12; SC-02, SC-07 | Stage 6 with Stage 8; label assumptions/examples and record measured evaluation results separately. |
| F-12 | Minor — Open | [Board flow](diagrams/flowchart/board-flow.mmd) uses In Review; [PRD](PRD_SRS.md), FR-09/AC-09, [data design](data-design.md) and UC-04 use To Do, In Progress, Done. | BR-03; FR-09; AC-09 | Stage 6 with Stage 7; align with the Core state model without implying an approved custom-state extension. |

## Traceability and evidence limits

The intended chain is BR/SC → FR/AC/NFR → use case → architecture/data/API/UX/diagram → planned test and measured result. The previous blanket traceability Pass and claim that no orphan requirements exist are withdrawn: this focused correction has not established those conclusions end to end.

| Trace area | Conclusion and remaining verification |
| --- | --- |
| BR-01–BR-15 | PRD/UC contain trace structures; broad ranges do not establish coverage. Check each requirement/AC against business intent and downstream assertions. Keep BR-15 Should and original Core binding absent recorded OD-11 deferrals. |
| SC-01–SC-08 | Missing literal SC IDs in a downstream entry file alone does not establish missing coverage. Follow explicit FR/UC links to planned tests and name gaps. TEST-08 scenario mappings are planned trace, not executed success. |
| SC-04 | The former report named BlockerEvent history without a test assertion. Stage 8 must cover prior resolution history separately from SC-03 current operational state. |
| UC exception branches | EX identifiers repeat within separate UCs. Map UC-05/EX-*, UC-09/EX-* and UC-12/EX-* to assertions/preconditions; retain uncovered branches under F-08. |
| Permission/version/citation/fallback | Documented draft invariants and contracts do not prove enforcement. UX/diagram conflicts remain; runtime negative, concurrency, consumer/provider and failure tests are unexecuted. |

### Structural checks are not semantic or runtime evidence

The earlier session reported `context:lint`, `context:check` and `context:test` passing, including 9/9 harness unit tests. This is previously reported structural evidence, not a new execution in this review. The harness checks context/contract structure and its own negative cases; it does not establish complete BR/SC/EX coverage, document semantics, authorization enforcement, citation support, application correctness or measured AI performance. Fresh results belong in the current editing session's verification record.

This corrective review inspected current source paths and the architecture header for F-06/F-09. It did not run application tests, provider calls, retrieval/generation evaluation, rendering, a diagram validator or a clean-clone reproducibility test. Earlier validator/CLI observations remain attributed to their prior snapshot until rerun. Missing checklist material in another checkout must be recorded as a gap, not inferred to pass from this report.

## Scoped 4+1 architecture follow-up

[Architecture](../architecture.md) v0.5 and the [corrective analysis report](../analyst/architecture_4_plus_1_restructuring_report.md) v1.2 address documentation regressions in the 4+1 restructuring: both protected transport handoffs share the permission guard; lifecycle commits and final validity checks follow ADR-0006; unknown remote-write outcomes block handoffs pending reconciliation. Default retrieval uses Current sources, history is explicit and labelled, and SC-07 includes nonempty but insufficient evidence. Deployment remains a candidate with a same-origin browser/API path, including a development proxy where needed. These clarify documented intent; they are not runtime verification or acceptance of Proposed decisions.

The [canonical SAD trace matrix](../architecture.md#71-requirement-traceability-matrix) lists the 69 FRs individually using their PRD BR associations. This replaces broad grouped trace claims; row completeness does not establish semantic satisfaction of each FR/AC or executed SC/EX coverage. UML-07 v0.4 retains its historical SAD v0.4 source mapping. Its inventory classification does not prove diagram semantics match v0.5. F-01–F-05, F-07–F-08 and F-10–F-12 remain open or pending revalidation; F-06 remains resolved only for its header-version issue.

Local Node is v22.23.0, below the declared Node 24 minimum; any passing local harness run must disclose this mismatch. The root `.gitmodules` URL matches the local checklist origin, but `git submodule status` has a leading minus (uninitialized). Neither that mapping nor local files prove a successful clean clone. This follow-up performs no clean-clone, runtime or visual validation, and claims no independent approval.
## Assumptions, open decisions and handoff

- BRD/PRD scope and Proposed ADR policies remain unchanged. See the [register](artifact-register.md), owner decision log, for OD-01–OD-12; elapsed time or draft handoff does not accept them.
- SAD entry and architecture are an entry/source pair. Source-version references identify the design source separately from the entry revision.
- Optional user stories are not a mandatory gate. Their omission and the PRD/UC/AC trace alternative are recorded in the register/test plan; no new requirement is introduced here.
- Route findings to the earliest affected stage using the workflow review loop; refresh affected downstream versions and repeat the impacted review after corrections.

**Checklist result:** Pass for this report's English text, retained IDs, correction owners and evidence separation. Gap for full semantic BR/SC/EX trace verification, unresolved F-01–F-05/F-07–F-08/F-10–F-12 and unexecuted runtime/visual checks. This author self-check is not independent approval or a claim that the document set passes.

**Handoff:** Ready for downstream correction with the stated gaps. Blocking UX/diagram conflicts prevent treating those sources as an implementation baseline. Material business decisions remain with the owner; downstream drafting uses explicit assumptions.

**Change summary:** v0.3 adds the scoped 4+1 correction, refreshes SAD/entry/register sources and records Node/submodule limits while retaining open findings. v0.2 replaced Vietnamese/LaTeX with English Markdown, refreshes sources, resolves stale F-06/F-09 by source inspection, qualifies F-07 and historical tool observations, and removes unsupported comprehensive trace/runtime conclusions.
