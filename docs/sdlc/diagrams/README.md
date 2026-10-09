# Central diagram index

**Artifact ID:** UML-07  
**Version/date:** 0.2 Draft · 9 October 2026  
**Status:** Draft; Ready for downstream inventory use; focused review recorded; semantic correction and visual review remain open.  
**Source versions:** BRD English v1.0; PRD-01 v0.4; UC-02 v0.2; SAD-03 v0.2; UX sources v0.2; Proposed ADR-0001 v0.2 and ADR-0002–ADR-0006 v0.1; PLAN-01 v0.1.

## Organization

Each diagram type has a folder: architecture, flowchart, sitemap, use-case and user-journey. Product diagrams live here; origin documents link to them. Prompt/checklist examples remain in SDLC-Prompt-Checklist because they are templates.

Seven Mermaid sources preserve original blocks verbatim. Paired Draw.io files contain editable native cells; IDs, labels and relationships are extracted, while geometry/styles are newly generated. Journey sections, actors, order and illustrative scores are retained. The existing use-case Draw.io is relocated without byte changes. Mermaid is the structural source for the seven extractions: update both formats together, then validate. No automatic synchronization exists. The use-case diagram uses Draw.io as its source. Future exports belong beside sources in the matching type folder.

## Inventory and trace

| ID | Sources | Purpose | Origin / trace |
| --- | --- | --- | --- |
| DGM-ARCH-01 | [Draw.io](architecture/service-composition.drawio) / [Mermaid](architecture/service-composition.mmd) | Service communication and data ownership | [docs/architecture.md](../../architecture.md) v0.2; BR-01–BR-14; SC-01–SC-08; SAD-03 |
| DGM-FLOW-01 | [Draw.io](flowchart/ai-qa-flow.drawio) / [Mermaid](flowchart/ai-qa-flow.mmd) | AI Q&A, citation inspection and fallback | [docs/ux/flows/ai-qa-flow.md](../../ux/flows/ai-qa-flow.md) v0.2; BRD BR-06, BR-07, BR-08, BR-09, BR-10, BR-12, BR-13; PRD-01 (FR-16–FR-35, FR-50–FR-63, FR-69, SC-02, SC-07, SC-08); SAD-03; ADR-0001; ADR-0005   |
| DGM-FLOW-02 | [Draw.io](flowchart/board-flow.drawio) / [Mermaid](flowchart/board-flow.mmd) | Board actions, blockers and failure branches | [docs/ux/flows/board-flow.md](../../ux/flows/board-flow.md) v0.2; BRD BR-02, BR-03, BR-04; PRD-01 (FR-07–FR-09, FR-42–FR-44, SC-01, SC-03); SAD-03   |
| DGM-FLOW-03 | [Draw.io](flowchart/docs-flow.drawio) / [Mermaid](flowchart/docs-flow.mmd) | Document authoring, versions and access branches | [docs/ux/flows/docs-flow.md](../../ux/flows/docs-flow.md) v0.2; BRD BR-05, BR-08, BR-10, BR-14; PRD-01 (FR-10–FR-15, FR-45–FR-49, SC-05, SC-06); SAD-03; ADR-0001   |
| DGM-FLOW-04 | [Draw.io](flowchart/permission-read-flow.drawio) / [Mermaid](flowchart/permission-read-flow.mmd) | Resource visibility by access context | [docs/ux/permission-matrix.md](../../ux/permission-matrix.md) v0.2; BRD BR-01, BR-10, BR-14; PRD-01 (FR-01–FR-04, FR-38–FR-39, FR-48, FR-59, SC-06); ADR-0001; ADR-0006   |
| DGM-JOURNEY-01 | [Draw.io](user-journey/core-user-journeys.drawio) / [Mermaid](user-journey/core-user-journeys.mmd) | Three illustrative persona journeys | [docs/ux/personas.md](../../ux/personas.md) v0.2; BRD BR-01–BR-15; PRD-01 (FR-01–FR-69, SC-01–SC-08); SAD-03; ADR-0001; ADR-0006   |
| DGM-SITE-01 | [Draw.io](sitemap/application-sitemap.drawio) / [Mermaid](sitemap/application-sitemap.mmd) | Project screen/navigation hierarchy | [docs/ux/sitemap.md](../../ux/sitemap.md) v0.2; BRD BR-01–BR-15; PRD-01 (FR-01–FR-69, SC-01–SC-08); SAD-03; ADR-0001; ADR-0006   |
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

## Checklist and verification — 9 October 2026

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Inventory / folder per type | Gap | Eight indexed sources across five folders plus one root use-case copy found at review time (RV-07). |
| Original content preservation | Pass | Mermaid text matches captured blocks. Relocated use-case SHA-256: 4ed19e495fa4096d55a28227053b943e35230decdcf1647af4dc924af112213b. |
| Editable graph correspondence | Pass | Native cell labels and directed edge endpoints/labels match extracted graphs; journey sections/order retained. |
| Draw.io structural validation | Gap | Latest run: 8/9 current files pass; architecture has W-OVERLAP between WD and title (RV-05). Earlier eight-file score-zero results are historical. |
| UML checklists | Gap / N/A | UC-02 retains Stage 2 checklist history; Stage 7 semantic review pending. These extracted architecture/flowchart/sitemap/journey views are not UML component/activity/class/sequence/deployment models; those matching UML checklist pairs are N/A. |
| Visual export / renderer DOM inspection | Gap | Draw.io 32.3.0 is installed; CLI startup fails with Windows installation ACL/AppContainer error (RV-06). No rendered inspection ran. |
| Semantic acceptance / runtime | Gap | DG-01–DG-06 open. No owner approval, independent complete-set review, app/security/provider tests claimed. |

**Assumptions/open decisions:** This change preserves diagram content rather than resolving policy differences. OD-02–OD-04 and OD-08–OD-10 remain open upstream. No new diagram types or scope inferred; no external service received content.

**Downstream handoff:** Ready for downstream inventory use. Stage 6 corrects UX gaps with architecture/data/API authors; Stage 7 applies relevant semantic checklists to corrected diagrams; Stage 9 independently reviews consistency. Stage 8 can locate flows here, but diagrams are not test or evaluation evidence. Author self-check is not independent approval.

**Change summary:** Extracted seven Mermaid diagrams and added editable counterparts, relocated the existing use-case file unchanged, and updated origin links and the register.

**Additional executed checks:** Node context check and syntax checks passed; context test suite passed 9/9. Local Markdown links in changed documents and diagram indexes resolved. Exact Mermaid/use-case preservation and native labels/edge correspondence passed. These are context and structural checks, not runtime evidence.

## Focused review update — v0.2

See [DGM-REVIEW-01](review.md) for prioritized findings RV-01–RV-08, exact source/cell locations, contract comparisons, current structural evidence and CLI failure. Existing diagram content and manual geometry were preserved.
