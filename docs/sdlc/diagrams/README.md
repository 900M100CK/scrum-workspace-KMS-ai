# Central diagram index

**Artifact ID:** UML-07
**Version/date:** 0.7 Draft - 12 October 2026
**Status:** Draft; Ready for downstream inventory use; mapped to Kruchten's 4+1 Architectural View Model; semantic correction and visual review remain open.
**Source versions:** BRD English v1.0; PRD-01 v0.4; UC-02 v0.2; SAD-03 v0.5 (4+1 View Model); UX flow sources v0.3 (Board v0.4), sitemap v0.3, other UX sources v0.2; Proposed ADR-0001 v0.2 and ADR-0002–ADR-0006 v0.1; PLAN-01 v0.1.

## Organization

Each diagram type has a folder: architecture, flowchart, sitemap, use-case and user-journey. Product diagrams live here; origin documents link to them. Prompt/checklist examples remain in SDLC-Prompt-Checklist because they are templates.

The original seven extractions are historical. Four flowcharts now have v0.3 corrected Mermaid sources and matching editable native Draw.io cells; Board UX is v0.4 and Docs/AI UX remain v0.3. These consume PRD-01 v0.4, UC-02 v0.2, SAD-03 v0.5, Proposed ADR-0001 v0.2/ADR-0006 v0.1 and OpenAPI v0.1.0. Other diagrams retain their source snapshots below. Mermaid remains the structural source; update both formats together. The use-case diagram uses Draw.io as its source. Future exports belong beside sources in the matching type folder.

## Patch follow-up — 12 October 2026

Applied the owner's diagram-fixes patch content against commit `6854162`, with narrow follow-up corrections. AI withholding now has a terminal generic Unable branch and optional retry requires both budget and safe evidence. The pre-provider retry route also has an explicit stop; the permission diagram mirrors terminal withholding. These are UI/control-flow states, not new API response enums. The unresolved Stage 5 wire mapping remains open. Draft can return to Revise to create a new immutable version; Retire spells out both OpenAPI paths. Removal, Boundary and Board AI outage are explicitly labelled event entries.

Board retains the three columns required by PRD AC-09/ASM-02 and restores All / Blocked Only / My Tasks over authorised cards. Splitting permission-read-flow remains deferred; sitemap and architecture were updated in the reviewer follow-up below. Recommended next step: split the permission diagram while preserving checkpoint traceability. Browser navigation routes need not equal HTTP API paths; citation inspection must carry or resolve the exact document/version/passage identity without substitution.

**Checklist/handoff:** Author correction only; no policy or architecture decision changed. Existing Proposed ADR-0001/ADR-0006 remain the basis. Structural checks and test results are recorded in REG-00; rendered arrow routing, full Mermaid-parser verification and runtime/security tests remain separate from node-box checks. Historical findings below are not independently closed by this patch.

## Reviewer follow-up — 12 October 2026

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
| **Logical View** | DGM-SITE-01 | [Draw.io](sitemap/application-sitemap.drawio) / [Mermaid](sitemap/application-sitemap.mmd) | Client screen structure, navigation hierarchy, information layout | [docs/ux/sitemap.md](../../ux/sitemap.md) v0.3; SAD-03 §2.1 |
| **Process View** | DGM-FLOW-01 | [Draw.io](flowchart/ai-qa-flow.drawio) / [Mermaid](flowchart/ai-qa-flow.mmd) | Runtime AI Q&A flow, citation validation, guarded transport fallback | [docs/ux/flows/ai-qa-flow.md](../../ux/flows/ai-qa-flow.md) v0.3; SAD-03 §3.1, §3.2 (Flow 4) |
| **Process View** | DGM-FLOW-02 | [Draw.io](flowchart/board-flow.drawio) / [Mermaid](flowchart/board-flow.mmd) | Scrum board mutations, optimistic revisions, blocker events | [docs/ux/flows/board-flow.md](../../ux/flows/board-flow.md) v0.4; SAD-03 §3.2 (Flow 1) |
| **Process View** | DGM-FLOW-03 | [Draw.io](flowchart/docs-flow.drawio) / [Mermaid](flowchart/docs-flow.mmd) | Document authoring, immutable versioning, Draft exclusion | [docs/ux/flows/docs-flow.md](../../ux/flows/docs-flow.md) v0.3; SAD-03 §3.2 (Flow 2) |
| **Process View** | DGM-FLOW-04 | [Draw.io](flowchart/permission-read-flow.drawio) / [Mermaid](flowchart/permission-read-flow.mmd) | Authoritative scope resolution, access denial, generic 404 | [docs/ux/permission-matrix.md](../../ux/permission-matrix.md) v0.2; SAD-03 §3.1, §3.2 (Flow 3) |
| **Physical View** | DGM-ARCH-01 (Deployment aspect) | [Draw.io](architecture/service-composition.drawio) / [Mermaid](architecture/service-composition.mmd) | Host processes, PostgreSQL databases, network trust boundaries | [docs/architecture.md](../../architecture.md) §5 |
| **+1 Scenarios View** | UC-02 diagram | [Draw.io](use-case/use-case-diagram.drawio) | Actors and 13 system use cases driving architectural validation | [UC-02 v0.2](../use-cases.md); SAD-03 §6.1 |
| **+1 Scenarios View** | DGM-JOURNEY-01 | [Draw.io](user-journey/core-user-journeys.drawio) / [Mermaid](user-journey/core-user-journeys.mmd) | End-to-end user journeys validating cross-view behaviors | [docs/ux/personas.md](../../ux/personas.md) v0.2; SAD-03 §6.1 |

## Inventory and Trace

| ID | Sources | Purpose | Origin / Trace |
| --- | --- | --- | --- |
| DGM-ARCH-01 | [Draw.io](architecture/service-composition.drawio) / [Mermaid](architecture/service-composition.mmd) | Service communication and data ownership | [docs/architecture.md](../../architecture.md) v0.5; BR-01–BR-14; SC-01–SC-08; SAD-03 |
| DGM-FLOW-01 | [Draw.io](flowchart/ai-qa-flow.drawio) / [Mermaid](flowchart/ai-qa-flow.mmd) | AI Q&A, citation inspection and fallback | [docs/ux/flows/ai-qa-flow.md](../../ux/flows/ai-qa-flow.md) v0.3; BRD BR-06, BR-07, BR-08, BR-09, BR-10, BR-12, BR-13; PRD-01 (FR-16–FR-35, FR-50–FR-63, FR-69, SC-02, SC-07, SC-08); SAD-03; ADR-0001; ADR-0005 |
| DGM-FLOW-02 | [Draw.io](flowchart/board-flow.drawio) / [Mermaid](flowchart/board-flow.mmd) | Board actions, blockers and failure branches | [docs/ux/flows/board-flow.md](../../ux/flows/board-flow.md) v0.4; BRD BR-02, BR-03, BR-04; PRD-01 (FR-07–FR-09, FR-42–FR-44, SC-01, SC-03); SAD-03 |
| DGM-FLOW-03 | [Draw.io](flowchart/docs-flow.drawio) / [Mermaid](flowchart/docs-flow.mmd) | Document authoring, versions and access branches | [docs/ux/flows/docs-flow.md](../../ux/flows/docs-flow.md) v0.3; BRD BR-05, BR-08, BR-10, BR-14; PRD-01 (FR-10–FR-15, FR-45–FR-49, SC-05, SC-06); SAD-03; ADR-0001 |
| DGM-FLOW-04 | [Draw.io](flowchart/permission-read-flow.drawio) / [Mermaid](flowchart/permission-read-flow.mmd) | Resource visibility by access context | [docs/ux/permission-matrix.md](../../ux/permission-matrix.md) v0.2; BRD BR-01, BR-10, BR-14; PRD-01 (FR-01–FR-04, FR-38–FR-39, FR-48, FR-59, SC-06); ADR-0001; ADR-0006 |
| DGM-JOURNEY-01 | [Draw.io](user-journey/core-user-journeys.drawio) / [Mermaid](user-journey/core-user-journeys.mmd) | Three illustrative persona journeys | [docs/ux/personas.md](../../ux/personas.md) v0.2; BRD BR-01–BR-15; PRD-01 (FR-01–FR-69, SC-01–SC-08); SAD-03; ADR-0001; ADR-0006 |
| DGM-SITE-01 | [Draw.io](sitemap/application-sitemap.drawio) / [Mermaid](sitemap/application-sitemap.mmd) | Project screen/navigation hierarchy | [docs/ux/sitemap.md](../../ux/sitemap.md) v0.3; BRD BR-01–BR-15; PRD-01 (FR-01–FR-69, SC-01–SC-08); SAD-03; ADR-0001; ADR-0006 |
| UC-02 diagram | [Draw.io](use-case/use-case-diagram.drawio) | Actors and 13 use cases | [UC-02 v0.2](../use-cases.md); BR-01–BR-14; SC-01–SC-08 |

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

## Focused review update — v0.2

See [DGM-REVIEW-01](review.md) for prioritized findings RV-01–RV-08, exact source/cell locations, contract comparisons, historical structural evidence and CLI failure. Existing diagram content and manual geometry were preserved.

## Inventory correction - v0.3, 10 October 2026

Current filesystem inspection found eight Draw.io files in the five type folders. The canonical [use-case source](use-case/use-case-diagram.drawio) exists and `docs/sdlc/diagrams/use-case-diagram.drawio` is absent. RV-07 is resolved for the current inventory; no diagram was changed or removed during this correction. The nine-file scan above remains historical evidence, not a current validator result.

**Checklist result:** Pass for current inventory organization; Gap for the retained semantic, layout and rendering findings. RV-01 through RV-06 and RV-08 remain open. No validator, renderer, application/security/provider test or full semantic review was rerun for this correction.

**Change summary / handoff:** Updated inventory status and distinguished historical source versions and checks from current observations. Stage 9 may record RV-07 as resolved; Stage 6/5 and Stage 7 retain their other correction responsibilities. This is an author self-check, not approval.
