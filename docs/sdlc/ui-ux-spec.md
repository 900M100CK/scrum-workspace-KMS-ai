# User experience specification and source inventory

**Artifact ID:** UX-06
**Version/date:** 0.13 Draft · 25 October 2026
**Status:** Consolidated design requirements; no rendered application, usability study or accessibility certification.
**Inputs:** PRD-01 v0.9; UC-02 v0.8; SAD-03 v0.16; Workspace/Knowledge contract drafts; ADR-0007 through ADR-0017; Stage 6 profile and local UI/UX and Blueprint checklists; Proposed ADR-0019; Proposed ADR-0021; Proposed ADR-0022
**Trace:** BR-01 through BR-14; SC-01 through SC-08. Enhanced reports and Future Work remain outside these journeys.

## Sources and authority

This is the Stage 6 entry and inventory. Detailed flows remain in [personas](../ux/personas.md) v0.4, [sitemap](../ux/sitemap.md) v0.9, [permission matrix](../ux/permission-matrix.md) v0.10, [board](../ux/flows/board-flow.md) v0.9, [documents](../ux/flows/docs-flow.md) v0.7 and [AI](../ux/flows/ai-qa-flow.md) v0.8, including OWNER-Q-01's To Do return and manifest-before-guard directions. [Diagrams](diagrams/README.md) are editable design sources; structural checks are not visual verification.

Personas are illustrative, not interviewed users. Roles express responsibilities; current scoped capabilities determine actions. Workspace owns identity, project membership, work and permission decisions; Knowledge owns immutable sources and AI evidence. Neither client controls nor a known URL grant authority. No account provisioning, saved conversation, AI write, report or additional service is added by this entry.

## Screens, journeys and evidence

| Surface | Required interaction and states | Trace and verification |
| --- | --- | --- |
| Sign-in and project directory | Valid session; generic invalid credentials; expired/sign-out state clears protected view. Show permitted projects and capability-gated create. Empty list is distinct from failed load. | UC-01/02; TC-01/24 |
| Project membership/settings | Add/remove existing member; restricted grants do not revive on rejoin. Optional descriptive edit preserves identity/membership. Hidden management routes do not imply a read bypass. | UC-02; TC-03/13/24 |
| Backlog and Sprint planning | Create/edit/order work; dates/goal; fixed Sprint lifecycle. Multi-select allocation shows per-item confirmed or unknown outcomes under ADR-0014. Successful items stay committed after another item fails. | UC-03/05; TC-07/19/21 |
| Board and task detail | Three states and direct moves; keyboard state selection as alternative to drag. Assignee and ordered blocker events. No Active Sprint and empty filtered results have separate guidance. Reopening completed-Sprint work shows its new Backlog location without reopening Sprint. | UC-04/05; SC-01/03/04; TC-08/16/22 |
| Document list/create/editor | Explicit classification, owner/labels; first save and revision immediately Current. Show save pending/confirmed/unknown distinctly. Author read grant is revocable; content-write/manage-access alone cannot display content. | UC-06/07; SC-05/06; TC-03/05/15/20 |
| History/readiness/retirement | Exact immutable version with Current/Superseded/Archived label; readiness pending/ready/failed is independent. Archive excludes ordinary retrieval; deletion blocks content. Surface archive/delete effects before submission; no implied restore or undo feature. | UC-07/08; TC-05/06/20 |
| Search and relationships | Separate document and task result types, current project scope, empty versus failure, cursor navigation. Documents use read grants/validity. Owner-added task keyword search is Should after 60 Must; it uses Workspace title/description and membership, not AI. Explicit links expose only permitted endpoints. | UC-08; SC-01/04/08; TC-17/23; ADR-0016 |
| AI drawer | Buffered loading; answered, partially_answered, insufficient_evidence, conflict, withheld and dependency failure. Label fact/synthesis/uncertainty; partial answers show supported citations and missing requested components without hidden-source hints. | UC-09/10/12; SC-02/03/07/08; TC-04/09/10 |
| Citation inspector | Renew current authority; exact passage/version only. Verified unavailable identity follows retained read policy; no excerpt or substitution. Unknown/denied is generic, authority failure separate. Operational citations show entity/revision/observation time rather than fabricated document passages. | UC-09/10; SC-05/06; TC-04/06/08 |
| Audit and trace inspection | Separate audit-read and trace-read controls/queries even if sharing a screen. Scoped audit actor/action/entity/time may show without source-read; protected payload stays redacted. Trace does not inherit that identity exception. | UC-13; SC-06; TC-11/18 |

Read the [requirement verification matrix](requirement-verification.md) and [exception matrix](test-coverage.md) for per-AC and branch assertions. The inventory does not claim all controls or handlers exist.

## Common interaction rules

Loading must not show cached protected content before renewed checks. Successful empty results differ from unavailable dependencies; never use an empty result to disguise failed authority. Unknown and denied protected resources have the same generic message and no hidden counts. Session expiry requires sign-in; detected membership loss clears protected view and cancels further protected requests. Already delivered information cannot be recalled.

Distinguish validation, confirmed rejection, committed success and unknown commit outcome. Keep user input when safe, but do not repopulate revoked source content from a browser cache. A lost mutation response is reconciled with the same key/payload before a new submission; optimistic display is never evidence of commit. Show the latest permitted state after conflict and let the user reconsider the intended edit. No automatic overwrite or blanket fresh-key retry.

AI outage leaves healthy work, documents and keyword paths usable. Knowledge outage also affects document search/reads; it does not imply Workspace task search or Board is unavailable. Show dependency-specific feedback. Do not permanently disable question retry from an obsolete global health badge; actual request outcomes remain authoritative.

Use native labelled controls, logical focus order, visible focus, text as well as color for status, inline errors associated with fields and keyboard alternatives to drag. On opening an inspector/dialog, place focus meaningfully and return it to the trigger when closing; avoid focus traps. Announce confirmed updates and errors without exposing hidden metadata. These are interaction design requirements to test, not a WCAG conformance claim. Device/browser targets and visual tokens remain design inputs, not invented fixed metrics.

## Local checklist disposition

The two workbook templates were read directly. Their examples, numeric targets and mandatory-looking Figma instructions do not create project scope. This review groups each named item below; `Specified` means text exists, `Gap` means the required design/evidence is absent, and `N/A` gives the scope reason. No workbook was edited or marked approved.

| UI/UX workbook items | Disposition and evidence |
| --- | --- |
| User Personas & Scenarios; Information Architecture; Task Flows | Specified in linked sources and screen matrix; interview evidence and three-click navigation target are not established. |
| Grid System; Breakpoints; Visual Hierarchy | Gap: rendered layouts, device targets and visual measurement absent. |
| Design System / Components; Color Palette; Typography; Iconography | Gap: implemented component/token/asset system absent; do not invent design-system adoption. |
| Contrast Ratios; Touch Targets | Gap: no measured rendered UI or confirmed target-device standard. No compliance claim. |
| Keyboard Navigation; Error Prevention & Recovery | Interaction rules specified; actual keyboard, focus and destructive-action feedback tests pending. |
| System Status Visibility; Empty States; Micro-interactions | Required semantic states specified; timing, hover/active rendering and responsiveness unverified. |
| Chart Clarity | N/A for this Core entry: Enhanced reports/telemetry charts are not introduced. |
| Data Density | Gap: audit/trace table layout must be reviewed with representative scoped data; no density toggle required by baseline. |
| Asset Export; Redlining & Specs | N/A for this textual BA entry; pixel design/Figma export not requested. Visual implementation remains a later design gap. |
| State Documentation | Semantic states specified; full component-state visuals remain Gap. |

| Blueprint workbook items | Disposition and evidence |
| --- | --- |
| Design Subject Scope; Context View; Stakeholder Identification; Design Concerns | Specified by this entry, personas and canonical SAD; no new stakeholder interviews claimed. |
| Composition View; Logical View; Dependency View; Interaction View | Canonical SAD/contracts and linked flows supply design sources; runtime and full visual verification remain Gap. |
| Information View; Interface View; State Dynamics View | Data design/OpenAPI and explicit lifecycle/response states exist; implementation fit and rendered state transitions remain Gap. |
| Algorithm View; Element Attributes | Domain flow and source ownership specified; retrieval ranking, provider adapters and runtime checks remain incomplete. |
| Resource Allocation | Gap: no measured application/provider resource budget; template GPU/cluster examples are not adopted. |
| Decision Documentation; Alternatives Considered; Assumptions & Constraints | ADRs and owner clarifications record choices/alternatives; remaining provider/session/delegation decisions stay open. |
| Requirements Traceability | Screen/UC/TC mapping plus VERIFY-01 present; semantic and runtime evidence must still be attached. |
| Completeness Check | Gap: this is a reviewed draft, not a complete application design or standards sign-off. |

The [item-by-item checklist review](reviews/ui-ux-checklist-review-2026-10-18.md) records all 22 UI/UX and 19 Blueprint rows against byte-verified pinned inputs, plus eight scenario walkthroughs. Grouped dispositions above remain a summary; they are not visual/runtime acceptance.

## Handoff

Ready for detailed UI implementation planning with explicit gaps. Verify each listed state through real flows and inspect the rendered diagrams; structural lint alone cannot check legibility, route geometry or accessibility. Browser/device targets, delegated non-read capabilities and visual design choices require clarification when implementing affected flows. Optional task keyword search follows the separately owner-confirmed Should extension, not an automatic Must increase. No Figma publication, external transfer or generated user-research result occurred.

## Priority 2 screen-to-operation handoff — 18 October 2026

| Screen/control | Draft source | Required failure handling |
| --- | --- | --- |
| Membership management and assignment/owner/grantee selectors | listMembers; selected Member.revision for removal; known registered ID for adding a nonmember | Distinguish empty/error, restart stale pages, clear membership loss; manage controls require action authority |
| Explorer | listDocuments with permitted metadata and nullable Current pointer | Omit unreadable documents, include archived-only/readiness-failed sources; no hidden counts |
| Explicit history | listVersions; exact getVersion; document_revision | Label historical state; no substitution; restart changed pages |
| Known-ID manage route | getDocumentPolicy + listDocumentReadGrants; permission_revision | Permit independently scoped managers without content prefill; reload on stale policy |
| Scoped controls | getAllowedActions at global/project/exact resource scope | Missing action means disabled/hidden; authority failure clears old allows; actual mutation rechecks authority and business preconditions |

These projections address UX-R01/R02 drafting gaps under Proposed ADR-0019. Runtime acceptance and additional delegation remain open. Proposed ADR-0022 now supplies non-reading command preconditions; handler/token verification remains pending. No role editor, global user directory or new business capability is implied.

## Priority 2 recheck consumer correction

Version action discovery supplies project_id + document_id + version_id from the exact history row and verifies the echoed pair; resource_id is unused for that scope. Summary and trace controls use independent allowed operations for the same run: answer-reader entitlement enables optional FR-27 summary without trace-read, while FR-58 requires trace-read and does not inherit summary rights. No role or sibling document can fill a missing authority result. Proposed ADR-0019 v0.2 and SP-07/SP-13 carry the paired scenarios; UI/runtime acceptance is unrun.

## NEXT-03 trace/summary rendering contract

Inspection uses Knowledge v0.2.7 Trace/RetrievalSummary. Show actual permitted queries and recorded stage/status, exact document/operational identity and source-to-step ranks; operational observation time/revision is labelled historical. Trace has separately permitted configuration/duration/usage; optional summary contains only retrieval/citation stages. Do not invent a source-ID resolver or display hidden totals/gaps. Query state unavailable has no source-specific explanation. Validation locator success is distinct from claim-support evaluation.

Metric states render independently: measured zero is “0 ms” or “0 tokens”; unavailable is “Not measured”; not_performed is “Not performed”. Failed execution may still have measured timing. Scope/dependency failure clears protected output and uses generic failure, not zero metrics or empty success. Source opening rechecks exact current access. Proposed ADR-0021 and TC-11/18 define future tests; no rendered UI or runtime evidence is supplied here.

## NEXT-04 citation, retry and readiness bindings

Citation chips branch by kind. Document chips use exact openCitation/getVersion locators; operational chips show their recorded observation time/revision and separately refresh getProject/getSprint/getTask, never invent a document locator or historical snapshot. Current entity reads remain renewed permission checks.

After terminal AI failure/withholding, deliberate retry starts a fresh user request while preserving whole-draft withholding. Lost responses are labelled unknown and never replay automatically; an explicit new-question action does not override transport quarantine. A stale health badge cannot permanently lock the prompt. Readiness.semantic_readiness is semantic processing only; actual keyword availability is independent. TC-08/10/20/22 carry the unrun UI/runtime assertions.

## NEXT-05 current source and route inventory

The Sources and authority paragraph now identifies the current source editions. The sitemap main route table includes independent known-ID manage/actions routes and the operational observation inspector; document and operational inspectors use distinct existing HTTP reads. Descriptive member roles do not supply action authority. UI sources remain drafts; current version reconciliation is not a fresh usability/permission test. Proposed ADR-0022 supplies the non-reading concurrency/acknowledgement design; application evidence remains open.

## NEXT-06 command route handoff

The independent /docs/:docId/actions route now has a complete draft precondition/acknowledgement source: getDocumentCommandPrecondition for the selected action, opaque token submission and DocumentMutationReceipt (delete 204). It does not require content prefill or disclose a private current revision/state. Archive requires an already-known exact version; no history is inferred. A reader can fetch protected display state separately; no read grant follows from command success. Conflict requires reconsideration and unknown outcomes preserve the original operation identity. Proposed ADR-0022 resolves the design gap; all application evidence remains pending.

## NEXT-09 operational inspector recovery

The observation route has only current entity selectors. A reload/direct visit without the delivered citation context shows original observation unavailable; any renewed permitted current read is labelled separately. No timestamp, observation revision or historical value is inferred from current data, URL arguments or persistent browser state. No saved answer/history endpoint or extra entitlement is added. TC-08 specifies the future browser/revocation checks. The companion checklist report records this design omission and its bounded correction.

## Next wireframe work plan

[UX-PLAN-01](../ux/wireframe-workplan.md) orders the next Core design slices and supplies ten Backlog-reorder and ten independent-document-command state variants, plus AI/inspection distinctions. It selects no visual framework, design tool, device budget or new product feature. All rendered WF tasks remain unchecked; it is a textual handoff alongside the canonical sources, not evidence that UI has been implemented or validated.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.
