# Central diagram index

**Artifact ID:** UML-07
**Version/date:** 0.20 Draft · 25 October 2026
**Status:** Draft; Ready for downstream inventory use; C4 primary views with a 4+1 coverage crosswalk are recommended; see the 17 October report for corrections and remaining design/implementation gates.
**Source versions:** BRD English v1.0; PRD-01 v0.9; UC-02 v0.8; SAD-03 v0.16; UX Docs v0.9 / sitemap v0.10 / personas v0.5 / matrix v0.11 / Board v0.10 / AI v0.9; ADR-0004 v0.2; ADR-0007–ADR-0017; Proposed ADR-0018–ADR-0023; PLAN-01 v0.4.

## Historical Diagram-first design foundation — 17 October 2026

Start with the [design foundation and reading order](design-foundation-2026-10-17.md): eleven additional pairs cover C4 Context/Container, protected handoff and document creation sequences, lifecycle states, per-store physical ERDs, the logical evidence gap, local deployment and package ownership. The same set provides 4+1 coverage. Proposed application behavior is distinguished from implemented storage. Review and acceptance limits are recorded in that report.

## Historical owner decisions — 16 October 2026

[OWNER-Q-01](../../planning/owner-decisions-2026-10-16.md) confirms To Do on unfinished Backlog returns and manifest persistence before guard. DGM-FLOW-02 v0.7 labels Completed-Sprint reopening as Backlog / To Do; DGM-FLOW-01 v0.9 and DGM-FLOW-05 v0.4 show immutable manifests outside guard, then exact guarded validation through handoff. A stale attempt releases the guard before fresh preparation. All paired labels match; real transaction/transport enforcement remains unimplemented.

## Maintaining generated metadata

Edit `manifest.json` for registered IDs, versions, paths, origin/source IDs, ADR sets and operation references. Edit diagram meaning in its Mermaid/native pair, then run `npm run docs:sync-metadata` and `npm run docs:lint`. Sync preserves native geometry and diagram bodies while generating headers, titles, child READMEs and the marked inventory/version-table regions here and in the Register. Child indexes and generated regions have no separate handwritten version authority. Lint checks those outputs without writing and rejects any unregistered Mermaid or native source, including use cases.

Use-case associations, hollow-triangle generalization and dashed `«include»` relations have a dedicated adapter; they are not forced into directed-flowchart semantics. ADR-set lint expands shorthand/ranges and checks every literal body ADR in registered diagram Sources, in both formats. Unselected retrieval terms require “unselected” or “not adopted” in the same Markdown line or native label; migrations may not introduce them. The current [DGM-REVIEW-03](review-2026-10-17.md) records source corrections, C4/4+1 guidance and fresh export evidence. DGM-REVIEW-02 and DGM-REVIEW-01 remain historical snapshots.

## Historical search-path correction — 16 October 2026

DGM-ARCH-01 v0.9 separates PostgreSQL English full-text search (GIN) — independent keyword path — from pgvector exact AI discovery. DGM-FLOW-01 v0.9 labels the AI and fallback paths separately and makes search an explicit user choice after AI failure. Both editable formats were updated. Trigram/fusion remains unselected pending pilot evidence and a separate ADR. Both Draw.io diagrams exported successfully and their overviews were inspected: the architecture branches are readable; the AI flow remains wide with long return routes and needs print-scale review. No runtime behaviour follows from the diagram checks.

Latest diagnostic exports (untracked) use `.tmp/review-diagrams/metadata-DGM-*.png`: all nine registered diagrams exported and were inspected at overview scale. See DGM-REVIEW-02 for current results and open RV-09 routing/readability issues. Earlier OWNER-Q-01 exports use `qdecisions-*.png`; Board routing received targeted repairs in that earlier review.

## Historical policy correction — 14 October 2026

Follow-up: DGM-FLOW-01/03/04 v0.6 synchronize ADR-0013/15/16/17 in both formats: partial answers, verified unavailable citation identity, whole invalid-draft withholding, independent optional task search, and membership removal effects. Docs/read geometry is preserved pending rendered review. AI was exported and inspected; crossing edges prompted an ELK relayout. Its second render still has a wide layout and long return routes; practical readability remains open. Source comparisons and contract checks passed; this does not establish runtime behavior.

Docs flow now shows immediate Current revision and Workspace-first creation with an explicit author read grant. Source reads no longer have a Draft/content-write read bypass. Board labels include direct transitions and reopening from Completed Sprints without rewriting completion history. The illustrative journey saves a new Current instead of publishing. UC-07 and Content Author labels match UC-02 v0.5. AI/sitemap/architecture topology is retained with current source metadata. Both editable formats are updated; no rendered or independent acceptance is implied.

## Historical storage source reconciliation — 13 October 2026

DGM-ARCH-01 v0.4 refreshes its source/version metadata against SAD-03 v0.6 and ADR-0004 v0.2. Graph nodes, edges and layout are unchanged: owned database storage is implemented, while service HTTP/provider edges remain design. This source reconciliation is not rendered-layout acceptance or application evidence.

## Historical UX and diagram correction — 12 October 2026

Permission matrix/personas v0.3 use separate capabilities and project-shared/restricted classifications; journey v0.2 marks all actors/scores as synthetic. DGM-FLOW-04 v0.4 covers source/work reads; DGM-FLOW-05 v0.1 preserves four AI checkpoints, failure and bounded-retry exits. Citation opening returns to DGM-FLOW-04 and repeats all checks. Existing Proposed ADR-0001/ADR-0006 supply the rationale; no API or authority decision changes. Stage 5 wire mappings and owner policy decisions remain open.

The docs:lint command checks real Mermaid grammar, native XML, node labels and directed labelled edge multiplicity, journey sections/actors/scores/order, origin versions and current version tables. Unsupported diagram types fail explicitly. It does not establish claim support, policy enforcement, visual quality or independent approval. See REG-00 for execution evidence. Full UI/UX workbook review and runtime tests remain gaps; UML activity conformance is N/A for these UX flowcharts.

## Organization

Each diagram type has a folder: architecture, flowchart, sitemap, use-case and user-journey. Product diagrams live here; origin documents link to them. Prompt/checklist examples remain in SDLC-Prompt-Checklist because they are templates.

Current versions are listed below. The generated inventory lists all 20 diagram pairs. Mermaid remains the structural source except for the use-case pair; update both formats together. The use-case diagram uses Draw.io as its primary source with a paired Mermaid representation (`use-case-diagram.mmd`). Historical source/check snapshots remain labelled below; they are not fresh validation results. Future exports belong beside sources in the matching type folder.

## Historical: patch follow-up — 12 October 2026

Applied the owner's diagram-fixes patch content against commit `6854162`, with narrow follow-up corrections. AI withholding now has a terminal generic Unable branch and optional retry requires both budget and safe evidence. The pre-provider retry route also has an explicit stop; the permission diagram mirrors terminal withholding. These are UI/control-flow states, not new API response enums. The unresolved Stage 5 wire mapping remains open. Draft can return to Revise to create a new immutable version; Retire spells out both OpenAPI paths. Removal, Boundary and Board AI outage are explicitly labelled event entries.

Board retains the three columns required by PRD AC-09/ASM-02 and restores All / Blocked Only / My Tasks over authorised cards. Splitting permission-read-flow remains deferred; sitemap and architecture were updated in the reviewer follow-up below. Recommended next step: split the permission diagram while preserving checkpoint traceability. Browser navigation routes need not equal HTTP API paths; citation inspection must carry or resolve the exact document/version/passage identity without substitution.

**Checklist/handoff:** Author correction only; no policy or architecture decision changed. Existing Proposed ADR-0001/ADR-0006 remain the basis. Structural checks and test results are recorded in REG-00; rendered arrow routing, full Mermaid-parser verification and runtime/security tests remain separate from node-box checks. Historical findings below are not independently closed by this patch.

## Historical: reviewer follow-up — 12 October 2026

DGM-SITE-01 and DGM-ARCH-01 are v0.2 Draft. Sitemap: relaid out as a tree (geometry regenerated; labels and relationships of unchanged nodes retained); added keyword search, scoped audit/trace inspection, the generic 404 node and a manage-access panel under the document; the citation route now carries `documentId/versionId/passageId` to match the OpenAPI citation key; "Team & Grants" became "Team membership" because read grants are per document. Architecture: edges carry trust-boundary labels TB1–TB4 and an annotation lists their credentials, consistency and fail-closed behaviour from SAD-03 sections 3.3 and 5. These are documentation changes: no policy, API or scope decision is made, and route names remain proposals. Mermaid grammar parsing of all seven sources (mermaid 10.9.3) passed; rendered layout, arrow routing and the `Legend` annotation placement have not been inspected.

## Historical: scoped flow correction — 11 October 2026

At that date DGM-FLOW-01–DGM-FLOW-04 were v0.2 Draft; they are now v0.3 (see the patch follow-up above). The inventory below lists the current versions of the origin documents. Permission-matrix v0.2 remains an unreconciled source: its role shortcuts, three classifications and citation stripping must not override PRD/ADRs or the corrected permission diagram.

- Docs: initial Current, two classifications, separate capabilities, immutable revisions, registration pending versus indexing readiness, publication conflict/failure, retirement and revocation/rejoin.
- AI: four access checkpoints, guarded buffered delivery, whole-draft withholding, exact placeholder citations, non-disclosing insufficient evidence and dependency-specific fallback.
- Board: three Core columns, capability checks, server validation, both blocker events, empty Sprint and membership-loss states.
- Permission reads: project-shared versus explicit restricted grant, Draft content-write, exact citation read, guarded provider/answer handoffs and fail-closed errors.

These corrections address the selected surfaces of DG-01–DG-05 and F-01–F-04/F-11/F-12; they do not close findings across the permission matrix, personas, sitemap or other diagrams. Terminal answer-withheld and specific unavailable-citation API mappings remain Stage 5 gaps. No PRD/ADR/contract changes or new architecture decisions are introduced. The existing Proposed ADR-0001 and ADR-0006 supply the decision rationale and enforcement boundaries.

**Checklist/handoff:** Flowchart node/edge correspondence is checked separately from rendered routing and runtime enforcement. Native editable cells are retained; visual acceptance remains unverified. UML activity conformance is N/A for these labelled UX flowcharts. Ready for scoped Stage 5/8/9 follow-up; no independent approval.

## 4+1 Architectural View Model Mapping

The system diagram inventory aligns with Philippe Kruchten's 4+1 Architectural View Model as detailed in [SAD-03 §2–§6](../../architecture.md):

| 4+1 View | Diagram ID | Sources | Purpose & Design Focus | Origin / Trace |
| --- | --- | --- | --- | --- |
| **Logical View** | DGM-ARCH-01 | [Draw.io](architecture/service-composition.drawio) / [Mermaid](architecture/service-composition.mmd) | Service boundaries, component responsibilities, data ownership | [docs/architecture.md](../../architecture.md) §2; BR-01–BR-14; SC-01–SC-08 |
| **Logical View** | DGM-SITE-01 | [Draw.io](sitemap/application-sitemap.drawio) / [Mermaid](sitemap/application-sitemap.mmd) | Client screen structure, navigation hierarchy, information layout | [docs/ux/sitemap.md](../../ux/sitemap.md) v0.10; SAD-03 §2.1 |
| **Process View** | DGM-FLOW-01 | [Draw.io](flowchart/ai-qa-flow.drawio) / [Mermaid](flowchart/ai-qa-flow.mmd) | Runtime AI Q&A flow, citation validation, guarded transport fallback | [docs/ux/flows/ai-qa-flow.md](../../ux/flows/ai-qa-flow.md) v0.9; SAD-03 §3.1, §3.2 (Flow 4) |
| **Process View** | DGM-FLOW-02 | [Draw.io](flowchart/board-flow.drawio) / [Mermaid](flowchart/board-flow.mmd) | Scrum board mutations, optimistic revisions, blocker events | [docs/ux/flows/board-flow.md](../../ux/flows/board-flow.md) v0.10; SAD-03 §3.2 (Flow 1) |
| **Process View** | DGM-FLOW-03 | [Draw.io](flowchart/docs-flow.drawio) / [Mermaid](flowchart/docs-flow.mmd) | Document authoring, immutable versioning, Draft exclusion | [docs/ux/flows/docs-flow.md](../../ux/flows/docs-flow.md) v0.9; SAD-03 §3.2 (Flow 2) |
| **Process View** | DGM-FLOW-04 | [Draw.io](flowchart/permission-read-flow.drawio) / [Mermaid](flowchart/permission-read-flow.mmd) | Authoritative scope resolution, access denial, generic 404 | [docs/ux/permission-matrix.md](../../ux/permission-matrix.md) v0.11; SAD-03 §3.1, §3.2 (Flow 3) |
| **Process View** | DGM-FLOW-05 | [Draw.io](flowchart/permission-ai-checkpoints.drawio) / [Mermaid](flowchart/permission-ai-checkpoints.mmd) | Four AI permission checkpoints and citation return to DGM-FLOW-04 | [docs/ux/permission-matrix.md](../../ux/permission-matrix.md) v0.11; SAD-03 §3.1 |
| **Physical View** | DGM-ARCH-01 (Deployment aspect) | [Draw.io](architecture/service-composition.drawio) / [Mermaid](architecture/service-composition.mmd) | Host processes, PostgreSQL databases, network trust boundaries | [docs/architecture.md](../../architecture.md) §5 |
| **+1 Scenarios View** | UC-02 diagram | [Draw.io](use-case/use-case-diagram.drawio) / [Mermaid](use-case/use-case-diagram.mmd) | Actors and 13 system use cases driving architectural validation | [UC-02 v0.8](../use-cases.md); SAD-03 §6.1 |
| **+1 Scenarios View** | DGM-JOURNEY-01 | [Draw.io](user-journey/core-user-journeys.drawio) / [Mermaid](user-journey/core-user-journeys.mmd) | End-to-end user journeys validating cross-view behaviors | [docs/ux/personas.md](../../ux/personas.md) v0.5; SAD-03 §6.1 |

## Inventory and Trace

<!-- BEGIN GENERATED:diagram-inventory -->
| ID | Sources | Purpose | ADR inputs |
| --- | --- | --- | --- |
| DGM-ARCH-01 | [Draw.io](architecture/service-composition.drawio) / [Mermaid](architecture/service-composition.mmd) | Service composition and trust boundaries | ADR-0004, ADR-0006, ADR-0007, ADR-0009, ADR-0011, ADR-0012 |
| DGM-SITE-01 | [Draw.io](sitemap/application-sitemap.drawio) / [Mermaid](sitemap/application-sitemap.mmd) | Application sitemap and protected navigation | ADR-0007, ADR-0009, ADR-0011, ADR-0013, ADR-0016, ADR-0017 |
| DGM-FLOW-01 | [Draw.io](flowchart/ai-qa-flow.drawio) / [Mermaid](flowchart/ai-qa-flow.mmd) | AI answers, exact citations and fallback | ADR-0004, ADR-0006, ADR-0007, ADR-0009, ADR-0011, ADR-0012, ADR-0013, ADR-0015, ADR-0016, ADR-0017 |
| DGM-FLOW-02 | [Draw.io](flowchart/board-flow.drawio) / [Mermaid](flowchart/board-flow.mmd) | Board state, blockers and failure branches | ADR-0007, ADR-0008, ADR-0011, ADR-0017 |
| DGM-FLOW-03 | [Draw.io](flowchart/docs-flow.drawio) / [Mermaid](flowchart/docs-flow.mmd) | Immutable document revisions and access | ADR-0007, ADR-0009, ADR-0011, ADR-0012, ADR-0013, ADR-0017, ADR-0022 |
| DGM-FLOW-04 | [Draw.io](flowchart/permission-read-flow.drawio) / [Mermaid](flowchart/permission-read-flow.mmd) | Protected source and citation reads | ADR-0006, ADR-0007, ADR-0009, ADR-0011, ADR-0012, ADR-0013, ADR-0017 |
| DGM-FLOW-05 | [Draw.io](flowchart/permission-ai-checkpoints.drawio) / [Mermaid](flowchart/permission-ai-checkpoints.mmd) | AI permission and manifest checkpoints | ADR-0006, ADR-0007, ADR-0009, ADR-0011, ADR-0012, ADR-0013, ADR-0015, ADR-0017 |
| DGM-JOURNEY-01 | [Draw.io](user-journey/core-user-journeys.drawio) / [Mermaid](user-journey/core-user-journeys.mmd) | Illustrative core user journeys | ADR-0007, ADR-0009, ADR-0011 |
| DGM-UC-01 | [Draw.io](use-case/use-case-diagram.drawio) / [Mermaid](use-case/use-case-diagram.mmd) | Actors, system use cases and audit includes | ADR-0007, ADR-0008, ADR-0009, ADR-0010, ADR-0011, ADR-0012, ADR-0013, ADR-0014, ADR-0015, ADR-0016, ADR-0017 |
| DGM-C4-01 | [Draw.io](c4/system-context.drawio) / [Mermaid](c4/system-context.mmd) | C4 Level 1 â€” system context | ADR-0002, ADR-0005, ADR-0007, ADR-0011, ADR-0012 |
| DGM-C4-02 | [Draw.io](c4/containers.drawio) / [Mermaid](c4/containers.mmd) | C4 Level 2 â€” applications and owned stores | ADR-0002, ADR-0004, ADR-0006, ADR-0011, ADR-0012 |
| DGM-SEQ-01 | [Draw.io](sequence/protected-handoff.drawio) / [Mermaid](sequence/protected-handoff.mmd) | Protected handoff, one-use claim and revocation | ADR-0006, ADR-0011, ADR-0012, ADR-0013, ADR-0017, ADR-0020 |
| DGM-SEQ-02 | [Draw.io](sequence/document-creation.drawio) / [Mermaid](sequence/document-creation.mmd) | Workspace-first document creation and uncertain outcomes | ADR-0007, ADR-0009, ADR-0011, ADR-0012, ADR-0017 |
| DGM-STATE-01 | [Draw.io](state/document-and-readiness.drawio) / [Mermaid](state/document-and-readiness.mmd) | Version lifecycle and independent processing states | ADR-0007, ADR-0009, ADR-0011, ADR-0013 |
| DGM-STATE-02 | [Draw.io](state/sprint-task-allocation.drawio) / [Mermaid](state/sprint-task-allocation.mmd) | Sprint, task, allocation and blocker state projections | ADR-0008, ADR-0012, ADR-0014, ADR-0018 |
| DGM-DATA-01 | [Draw.io](data/workspace-erd.drawio) / [Mermaid](data/workspace-erd.mmd) | Workspace physical ERD â€” owned schema | ADR-0004, ADR-0007, ADR-0008, ADR-0011, ADR-0012, ADR-0017, ADR-0018, ADR-0023 |
| DGM-DATA-02 | [Draw.io](data/knowledge-erd.drawio) / [Mermaid](data/knowledge-erd.mmd) | Knowledge physical ERD â€” owned schema | ADR-0004, ADR-0009, ADR-0011, ADR-0012, ADR-0013, ADR-0023 |
| DGM-DATA-03 | [Draw.io](data/handoff-logical-model.drawio) / [Mermaid](data/handoff-logical-model.mmd) | Logical evidence and command additions â€” NOT applied schema | ADR-0011, ADR-0012, ADR-0013, ADR-0020, ADR-0021, ADR-0022, ADR-0023 |
| DGM-DEPLOY-01 | [Draw.io](deployment/local-development.drawio) / [Mermaid](deployment/local-development.mmd) | Local development deployment â€” configured and proposed | ADR-0002, ADR-0003, ADR-0004, ADR-0006, ADR-0011 |
| DGM-DEV-01 | [Draw.io](development/package-ownership.drawio) / [Mermaid](development/package-ownership.mmd) | Development view â€” package ownership and adapter boundaries | ADR-0002, ADR-0003, ADR-0004, ADR-0011, ADR-0012 |
<!-- END GENERATED:diagram-inventory -->

## Review findings and correction owners

Content is preserved for review; it is not an accepted implementation baseline.

| Finding / location | Gap | Correction owner |
| --- | --- | --- |
| DG-01 / AI: SendQueryAPI, StreamAnswer | JWT/streaming labels conflict with SAD opaque sessions and buffered guarded delivery (FR-28/FR-29; Proposed ADR-0006). API paths need current contract mapping. | Stage 6 UX with Stage 3/5 |
| DG-02 / Docs: SaveDraftNew, ShowSaved, AutoSave | Initial Draft conflicts with PRD FR-11/OD-04 and ADR-0001 initial Current. Autosave requires reconciliation with immutable version identity; Draft content-write checks are incomplete. | Stage 6 UX with Stage 4/5 |
| DG-03 / Board, Docs, permissions and journeys | PO/SM/DEV/Admin shortcuts and Public/Internal/Restricted labels need reconciliation with project AND document scope and operation-specific capabilities. Titles grant no blanket source access. | Stage 6 UX with Stage 1/2/3; OD-02/08/09 |
| DG-04 / UX API nodes and branches | Endpoint strings are inherited sketches; permission-error, unknown-access denial, indexing/pending and failure flows require current API-05/contracts review. | Stage 5 API and Stage 6 UX |
| DG-05 / Personas and AI document examples | Journey satisfaction scores and JWT/ADR citation examples are illustrative, not measured research, actual quotations or evaluation evidence. | Stage 6 UX and Stage 8 evaluator |
| DG-06 / All diagrams | Inherited broad/older FR traces need current UC/FR/AC mapping. Architecture is Proposed design, not deployed state; visual review remains pending. | Stage 7 author then Stage 9 reviewer |

## Historical checklist and verification - 9 October 2026

The following results describe the 9 October snapshot. They were not rerun for the 10 October inventory correction.

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Inventory / folder per type | Gap | Eight indexed sources across five folders plus one root use-case copy found at review time (RV-07). |
| Original content preservation | Pass | Mermaid text matches captured blocks. Relocated use-case SHA-256: 4ed19e495fa4096d55a28227053b943e35230decdcf1647af4dc924af112213b. |
| Editable graph correspondence | Pass | Native cell labels and directed edge endpoints/labels match extracted graphs; journey sections/order retained. |
| Draw.io structural validation | Gap | Recorded 9 October run: 8/9 files passed; architecture has W-OVERLAP between WD and title (RV-05). The scan included the root use-case copy. Earlier eight-file score-zero results describe an older snapshot. |
| UML checklists | Gap / N/A | UC-02 retains Stage 2 checklist history; Stage 7 semantic review pending. These extracted architecture/flowchart/sitemap/journey views are not UML component/activity/class/sequence/deployment models; those matching UML checklist pairs are N/A. |
| Visual export / renderer DOM inspection | Gap | Draw.io 32.3.0 is installed; CLI startup fails with Windows installation ACL/AppContainer error (RV-06). No rendered inspection ran. |
| Semantic acceptance / runtime | Gap | DG-01–DG-06 open. No owner approval, independent complete-set review, app/security/provider tests claimed. |

**Assumptions/open decisions:** This change preserves diagram content rather than resolving policy differences. OD-02–OD-04 and OD-08–OD-10 remain open upstream. No new diagram types or scope inferred; no external service received content.

**Downstream handoff:** Ready for downstream inventory use. Stage 6 corrects UX gaps with architecture/data/API authors; Stage 7 applies relevant semantic checklists to corrected diagrams; Stage 9 independently reviews consistency. Stage 8 can locate flows here, but diagrams are not test or evaluation evidence. Author self-check is not independent approval.

**Original extraction summary:** Extracted seven Mermaid diagrams and added editable counterparts, relocated the existing use-case file unchanged, and updated origin links and the register.

**Additional historical checks (9 October):** Node context check and syntax checks passed; context test suite passed 9/9. Local Markdown links in changed documents and diagram indexes resolved. Exact Mermaid/use-case preservation and native labels/edge correspondence passed. These are context and structural checks, not evidence of complete document consistency or runtime correctness.

## Historical focused review update — v0.2

See [DGM-REVIEW-01](review.md) for prioritized findings RV-01–RV-08, exact source/cell locations, contract comparisons, historical structural evidence and CLI failure. Existing diagram content and manual geometry were preserved.

## Historical inventory correction - v0.3, 10 October 2026

Current filesystem inspection found eight Draw.io files in the five type folders. The canonical [use-case source](use-case/use-case-diagram.drawio) exists and `docs/sdlc/diagrams/use-case-diagram.drawio` is absent. RV-07 is resolved for the current inventory; no diagram was changed or removed during this correction. The nine-file scan above remains historical evidence, not a current validator result.

**Checklist result:** Pass for current inventory organization; Gap for the retained semantic, layout and rendering findings. RV-01 through RV-06 and RV-08 remain open. No validator, renderer, application/security/provider test or full semantic review was rerun for this correction.

**Change summary / handoff:** Updated inventory status and distinguished historical source versions and checks from current observations. Stage 9 may record RV-07 as resolved; Stage 6/5 and Stage 7 retain their other correction responsibilities. This is an author self-check, not approval.

## Current artifact versions

<!-- BEGIN GENERATED:artifact-versions -->
| Artifact ID | Version | Canonical source |
| --- | --- | --- |
| UML-07 | v0.20 | [Source](README.md) |
| REG-00 | v0.70 | [Source](../artifact-register.md) |
| SAD-03 | v0.16 | [Source](../../architecture.md) |
| UX-PERM-MATRIX-02 | v0.11 | [Source](../../ux/permission-matrix.md) |
| UX-PERSONAS-01 | v0.5 | [Source](../../ux/personas.md) |
| UX-SITEMAP-03 | v0.10 | [Source](../../ux/sitemap.md) |
| UX-FLOW-AI-03 | v0.9 | [Source](../../ux/flows/ai-qa-flow.md) |
| UX-FLOW-BOARD-01 | v0.10 | [Source](../../ux/flows/board-flow.md) |
| UX-FLOW-DOCS-02 | v0.9 | [Source](../../ux/flows/docs-flow.md) |
| DGM-ARCH-01 | v0.9 | [Source](architecture/service-composition.mmd) |
| DGM-SITE-01 | v0.8 | [Source](sitemap/application-sitemap.mmd) |
| DGM-FLOW-01 | v0.13 | [Source](flowchart/ai-qa-flow.mmd) |
| DGM-FLOW-02 | v0.7 | [Source](flowchart/board-flow.mmd) |
| DGM-FLOW-03 | v0.9 | [Source](flowchart/docs-flow.mmd) |
| DGM-FLOW-04 | v0.9 | [Source](flowchart/permission-read-flow.mmd) |
| DGM-FLOW-05 | v0.4 | [Source](flowchart/permission-ai-checkpoints.mmd) |
| DGM-JOURNEY-01 | v0.4 | [Source](user-journey/core-user-journeys.mmd) |
| PRD-01 | v0.9 | [Source](../PRD_SRS.md) |
| UC-02 | v0.8 | [Source](../use-cases.md) |
| DGM-UC-01 | v0.5 | [Source](use-case/use-case-diagram.mmd) |
| DGM-REVIEW-02 | v0.1 | [Source](review-2026-10-16.md) |
| DGM-REVIEW-03 | v0.1 | [Source](review-2026-10-17.md) |
| DATA-04 | v0.12 | [Source](../data-design.md) |
| DGM-DESIGN-01 | v0.1 | [Source](design-foundation-2026-10-17.md) |
| DGM-C4-01 | v0.1 | [Source](c4/system-context.mmd) |
| DGM-C4-02 | v0.1 | [Source](c4/containers.mmd) |
| DGM-SEQ-01 | v0.2 | [Source](sequence/protected-handoff.mmd) |
| DGM-SEQ-02 | v0.1 | [Source](sequence/document-creation.mmd) |
| DGM-STATE-01 | v0.1 | [Source](state/document-and-readiness.mmd) |
| DGM-STATE-02 | v0.2 | [Source](state/sprint-task-allocation.mmd) |
| DGM-DATA-01 | v0.3 | [Source](data/workspace-erd.mmd) |
| DGM-DATA-02 | v0.2 | [Source](data/knowledge-erd.mmd) |
| DGM-DATA-03 | v0.5 | [Source](data/handoff-logical-model.mmd) |
| DGM-DEPLOY-01 | v0.1 | [Source](deployment/local-development.mmd) |
| DGM-DEV-01 | v0.1 | [Source](development/package-ownership.mmd) |
<!-- END GENERATED:artifact-versions -->

## Historical 17 October correction handoff

See [DGM-REVIEW-03](review-2026-10-17.md). Corrected flowcharts can be laid out with `node scripts/layout-reviewed-diagrams.mjs`; use cases with `node scripts/layout-use-case.mjs`. Both replace the targeted native geometry and require a fresh visual review after use. C4/sequence/state/ERD sources are now registered in the current inventory; their original 17 October foundation/review reports remain dated evidence. Code-level detail still awaits implemented handlers.

## Historical AI diagram reconciliation — 22 October 2026

DGM-FLOW-01 v0.13 restores the native Draw.io page to the existing Mermaid graph: 28 semantic vertices and 42 directed labelled edges. It adds the missing document/operational citation choice, fresh operational reads, missing original observation, deliberate new-question and unknown-browser-outcome branches. The obsolete direct Click-to-document-only edge is replaced by the citation-kind decision. Existing semantic vertex IDs, matching edge IDs and visual styles are retained; the expanded graph is reflowed by the installed ELK layout engine. No requirement, endpoint or runtime behavior changes.

Regenerate this page with `node scripts/sync-ai-diagram.mjs`, then run `npm run docs:sync-metadata` and the documentation checks. The script compares the complete node labels and directed labelled edge multiset before saving, so it cannot silently write a structurally incomplete conversion. Per-diagram dates in the manifest keep this correction from redating unrelated diagram sources.

Inputs remain UX-FLOW-AI-03 v0.8, PRD-01 v0.9, UC-02 v0.7, SAD-03 v0.15 and the existing cited ADRs. Trace: BR-07–BR-10, BR-12–BR-14; SC-02/03/05–08; SP-09/10/12 design support only, with work-before-AI implementation order retained. Author checklist: exact graph parity and source-backed branching supplied; offline geometry validation and native PNG export/inspection performed. The final layout has no overlapping vertices or through-vertex routes in the validator, but 32 edge-crossing warnings and dense return/error routes remain. Inspect at readable zoom; no print-scale, usability, runtime or independent-review acceptance is claimed. Handoff: Ready for downstream design use with those visual and implementation limits; other RV-09 findings stay open.

## Inventory metadata reconciliation — 25 October 2026

Version 0.20 refreshes the manual 4+1 source labels and the inventory count. Child inventory dates now use the UML inventory record date rather than the default date of unrelated diagrams. Paired source-version headers are synchronized; graph content and existing diagram dates remain unchanged. No fresh rendered, independent or runtime acceptance is claimed.
