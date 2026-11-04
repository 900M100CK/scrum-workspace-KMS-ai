# Core wireframes — Excalidraw

**Artifact ID:** UX-WF-EX-01  
**Version/date:** 0.5.2 Draft · 3 November 2026
**Status:** Editable visual author draft with synthetic data; no owner approval, independent review or application acceptance.  
**Inputs:** BRD v1.0 through [stable entry](../../BRD.md); PRD-01 v0.10.1; UC-02 v0.8.2; SAD-03 v0.16.2; UX-06 v0.13.2; [UX-BLUEPRINT-01 v1.7.2](../../sdlc/ui-ux-blueprint.md); [UX-PLAN-01 v0.4.2](../wireframe-workplan.md); UX-SITEMAP-03 v0.10.1; SP-03 v0.8.1; Workspace v0.2.8 / Knowledge v0.2.9 contracts; ADR-0007–ADR-0017 and Proposed ADR-0018–ADR-0023 as referenced by those design inputs.\
**Trace:** BR-01–BR-14; SC-01–SC-08 through the UC/TC mappings below. No new FR/AC, framework, service or permission policy.  
**Author:** Sequential UX author.

## Open and edit

Open [scrum-kms-core.excalidraw](scrum-kms-core.excalidraw) with Excalidraw's **Open** command, or drag the file into an Excalidraw canvas. Use **Zoom to fit**, then zoom into a named frame. The scene contains 12 named native frames and editable text/rectangle elements; it is not a flattened screenshot. Selected buttons include local links to other scene frames. These links are design navigation, not implemented product operations.

[Overview PNG](overview.png) and [scalable SVG](overview.svg) are previews derived from the same element geometry. Their Arial rendering approximates the scene; native Excalidraw import/rendering has not been exercised. No publication, account connection or real project-data transfer was performed.

## Frame inventory

| Frame / individual preview | Work-plan mapping | Requirement and verification trace | Operations represented |
| --- | --- | --- | --- |
| [01 Sign in](01.png) | WF-01 | UC-01; BR-01/10; TC-01/24 | getSession; sign-in presentation only, identity mechanism remains open |
| [02 Projects and members](02.png) | WF-01 | UC-02; BR-01/10; TC-03/24 | listProjects/getProject/listMembers/getAllowedActions; scoped project/member commands |
| [03 Backlog and Sprint planning](03.png) | WF-02 | UC-03/05; BR-02/03; TC-07/19/21 | listTasks/listSprints/listSprintItems/getSprint; reorderBacklog/allocateTask |
| [04 Board and task context](04.png) | WF-03 | UC-04/05; BR-02/03/06; TC-08/16/22; SC-01/03/04 | getTask/listBlockerEvents; separately authorised task/Sprint commands |
| [05 Documents and exact versions](05.png) | WF-04 | UC-06/07/08; BR-04/05/14; TC-05/06/20; SC-05/06 | listDocuments/getDocument/listVersions/getVersion/getReadiness |
| [06 Content and access](06.png) | WF-05 | UC-06/07; BR-01/05/10; TC-03/15/20 | getDocumentPolicy/listDocumentReadGrants/getAllowedActions; separately authorised document commands |
| [07 Search and manual links](07.png) | WF-06 | UC-08; BR-06/07/10/13; TC-17/23; SC-01/04/08 | keywordSearch/listLinks; task search FR-70 remains Should |
| [08 AI and evidence](08.png) | WF-07 | UC-09/10/12; BR-08/09/10/12; TC-04/09/10; SC-02/03/05/07 | askQuestion/openCitation/getVersion; renewed getTask; optional getRetrievalSummary |
| [09 Audit and trace](09.png) | WF-08 | UC-13; BR-10/11/12; TC-11/18; SC-06 | listAudit/getTrace; separate entitlements |
| [10 Work state variants](10.png) | WF-01–03/09 | UC-01–05; BR-01/02/03/13 | Loading, empty, no Active Sprint, partial pages, conflict, unknown outcome, session/access/service failure |
| [11 Document state variants](11.png) | WF-04–06/09 | UC-06–08; BR-04/05/10/14 | Readiness, exact history, independent commands, conflict/unknown outcome, retirement confirmation, loading/empty/failure |
| [12 AI and inspector variants](12.png) | WF-07–09 | UC-09/10/12/13; BR-08–13 | Buffered loading, answer/partial/insufficient/conflict, withheld, dependency failure, unknown outcome, unavailable/denied source, missing observation |

## Interaction and disclosure notes

Sign-in has no protected project navigation or data. After authentication, controls in the populated layouts assume the exact action is currently allowed; side navigation and controls must be omitted or disabled when the corresponding authority is absent. A role label grants nothing. Global header search/AI are project scoped. Sign out and session-expiry clearing remain specified in UX-06; the account-menu expansion is not drawn here.

Board states are To Do / In Progress / Done. A state selector is the keyboard alternative to drag. Backlog reordering requires the complete consistent list and current allowed action. Sprint completion retains Done items; unfinished work and reopened Completed-Sprint work return to Backlog as To Do. Allocation results are per task. Uncertain mutation results are not failure or rollback: preserve original operation context and reconcile it, never blindly resubmit with a new identity. No new polling/status endpoint is implied.

Document versions are Current / Superseded / Archived; semantic readiness is independent. Content revision is immediately Current, with no product Draft/publish. The independent management panel deliberately has no hidden title/content. Independent writing without read starts blank. Archive uses an already-known exact version; successful commands do not grant content access. Proposed ADR-0022's command-precondition protocol remains a design dependency; token issuance and all DC-01–10 substeps are not individually drawn.

The assistant is read-only. Answer preparation is buffered. Facts, synthesis and uncertainty are visibly separated. Both citation kinds are drawn: exact document/version/passage and operational revision/observation time with a separate current-state refresh. Example source names, locators, text, people, dates and metrics are fictional, not retrieval evidence. Unavailable citations disclose retained identity only when current policy permits; denied/unknown reads use the generic message. Authority/service failures are not successful empty results. AI failure preserves healthy Board, document and keyword paths; Knowledge failure can still affect documents/search.

Audit-read, trace-read and optional answer-local summary are independent. Restricted audit content stays redacted even when actor/action/entity/time are permitted. Optional task search and summary remain Should. No saved chat, automated assignment, reporting dashboard, publish/restore flow or new role editor is added.

## Visual assumptions and checks

Proposed desktop artboards are 1280 × 900, arranged in reading order. Arial, light neutral panels and restrained blue selection are wireframe choices, not an adopted design system or device-support commitment. Status is expressed as text as well as colour. Focus order follows header, navigation, main content and inspector. Implementation must add visible focus, labelled controls, keyboard movement, contained dialog focus, close/return focus and appropriate announcements. Static scene links do not prove these behaviours.

Author checks: scene JSON parses; IDs are unique; 12 frames contain their elements; local link targets exist; element bounds stay within the assigned artboard. PNG overview, Board and AI detail were visually inspected for layout/readability. Repository context and documentation checks are recorded in the register after execution. These checks prove no handler, permission, persistence, source support or usability behaviour.

Checklist: Pass for an editable initial desktop scene, screen/trace inventory and explicit state families. Gap for native Excalidraw import verification, exhaustive individual BL/DC frame variants, mobile layouts, expanded account controls, interactive keyboard/focus, contrast measurement, touch targets, user study, independent visual review and runtime verification. Existing WF-01–09 work-plan checkboxes remain unchecked because this initial draft does not close their full acceptance criteria.

Handoff: review the visual structure and density, then refine individual task/permission/lifecycle flows against the current contracts. Keep Proposed mechanics labelled Proposed. No owner decision or application implementation is established by this scene.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.

## P10 input metadata — 28 October 2026

Only dependent input-version metadata changed. Existing frame/design assertions and images are unchanged; no visual review, browser or runtime evidence is inferred.

## P12 dependent metadata — 28 October 2026

Only input-version metadata follows the bounded SP-01 status/evidence reconciliation. Existing scope, visual sources and acceptance assertions are unchanged; no new design review or acceptance is implied.

1 November metadata-only input reconciliation: blueprint/workplan source pointers updated; editable frame sources, previews and existing visual acceptance gaps remain unchanged.
