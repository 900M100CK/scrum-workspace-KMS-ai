# Permission Matrix by Screen & Action

**Artifact ID:** UX-PERM-MATRIX-02\
**Version/date:** 0.11.3 Draft · 4 November 2026
**Status:** Owner-confirmed initial access/lifecycle/guard direction; additional delegation and retention rights remain open.\
**Source versions:** BRD English v1.0; PRD-01 v0.10.2; UC-02 v0.8.3; SAD-03 v0.19.1; ADR-0007–ADR-0011; Workspace OpenAPI v0.2.8 / Knowledge v0.2.9\; Proposed ADR-0019; Proposed ADR-0021; Proposed ADR-0022
**Trace:** BR-01, BR-05, BR-08, BR-10, BR-12, BR-14; FR-01–FR-04, FR-09–FR-14, FR-19–FR-21, FR-28–FR-29, FR-38–FR-39, FR-46–FR-48, FR-50–FR-52, FR-55–FR-59, FR-61, FR-68; SC-05, SC-06.\
**Scope:** UI visibility and action states derived from current server-authorised capabilities. Capability descriptions are design terms, not new API enums or an accepted role mapping.

## 1. Enforcement and disclosure principles

Workspace is the permission authority. Identity comes from the authenticated session; URLs and UI state do not grant authority. Every project operation needs current project access. Document checks apply in addition to project checks, before retrieval, at protected transport handoffs and at renewed source inspection.

The confirmed classifications are **project-shared** and **restricted**. Restricted reads require current membership and an explicit current document-read grant. Restricted creation gives the author a revocable read grant alongside scoped write/lifecycle/manage-access capabilities. Those capabilities never bypass read checks. A Scrum title, administrator title or log-inspection capability gives no blanket restricted-content access. Removal invalidates document-read grants; rejoining restores project-shared access only and requires fresh restricted grants (ADR-0007).

Unauthenticated requests require sign-in. Authenticated protected reads of unknown or inaccessible resources use the same generic 404 without title, count, version, owner or excerpt. Authority failure or unknown classification denies protected output and may show a generic service error. Hiding a control is presentation only; servers enforce every request.

## 2. Project, work and board actions

| Surface / operation | Current access basis | UI state without action authority | Trace |
| --- | --- | --- | --- |
| Project directory / project creation | Authenticated session; creation authority and membership rules from PRD | Sign-in required without session; list only accessible projects | FR-01–FR-03 |
| Membership / project settings | Current project access plus operation-specific membership-management/settings capability | Hide management controls; protected route uses generic 404 | FR-38–FR-39, FR-64 |
| Backlog / Sprint / task reads | Current project membership | Generic 404 after membership loss | FR-03, FR-05–FR-09 |
| Create, edit or order work items | Current membership plus operation-specific work capability | Read-only permitted items; no enabled mutation control | FR-05, FR-40–FR-41, FR-43 |
| Plan, start or complete Sprint | Current membership plus operation-specific Sprint capability | Hide lifecycle controls; no automatic Scrum Master approval | FR-06–FR-08, FR-42 |
| Move card / change task state | Membership plus state-change capability; server checks expected revision | Read-only card / status badge; conflict on stale mutation | FR-09; AC-09 |
| Flag / resolve blocker | Membership plus blocker capability | Disable mutation controls on readable tasks; blocker state derives from ordered events | FR-44; AC-44 |
| Board filters | Membership; filter authorised cards only | All / Blocked Only / My Tasks available on readable Board | AC-09; ASM-02 |
| Manual document links | Work action capability plus applicable source checks | Only permitted target metadata; unreadable target reveals no title | FR-16–FR-17, FR-59 |

Board uses **To Do, In Progress, Done**, allowing direct changes and reopening Done. Reopening work from a Completed Sprint returns it to Product Backlog as To Do while retaining Sprint completion history (ADR-0008 v0.3). Additional capability delegation remains open; this table does not grant permissions to Scrum titles.

## 3. Documents, lifecycle and access management

| Surface / operation | Current access basis | Denied / unavailable state | Trace |
| --- | --- | --- | --- |
| Document list / source read | Membership plus project-shared classification or restricted read grant | Omit inaccessible list entries and hidden counts; direct read uses generic 404 | FR-04, FR-10, FR-14, FR-59 |
| Create document | Membership plus document-create authority; explicit initial classification | Missing classification rejects creation; first version is Current | FR-10–FR-11 |
| Revise | Membership plus content-write; returned content needs separate read authority | Save becomes Current immediately; generic denial without protected metadata | FR-11 |
| Archive / delete | Membership plus operation-specific lifecycle authority and document checks | No enabled control without authority; explicit failure/conflict | FR-12–FR-15, FR-48 |
| Change classification / grant / revoke | Membership plus scoped manage-access capability | Hide controls without capability; management does not imply content-read | FR-50–FR-52 |
| Explicit version history | Current document read checks; historical rights/retention remain OD-04 | Label Superseded / Archived; never substitute Current; generic 404 when unreadable | FR-47, FR-59, FR-61 |
| Exact citation inspection | Revalidate session, membership, document access and exact version/passage availability inside protected-read guard | Generic 404 for unknown/inaccessible; specific Citation unavailable only with surviving-identity permission | FR-46, FR-55, FR-59, FR-61 |

Revision atomically creates a new immutable Current, makes the former Current Superseded and updates the pointer. There is no product Draft or publication step. Ordinary search uses eligible Current sources; explicit history labels Superseded/Archived. Exact old passages remain unchanged. ADR-0013 requires current membership and retained document-read policy for surviving unavailable identity; audit-only rights do not suffice. Physical retention remains open.

## 4. Search, AI and scoped inspection

| Boundary / operation | Required checks and behaviour | Trace |
| --- | --- | --- |
| 1. Retrieval | Filter project AND document scope before ranking/context; ordinary Current-only; no Draft; authority failure denies | FR-19–FR-21, FR-28 |
| 2. Provider input | Persist complete immutable manifest outside guard; then guarded current access, evidence/revisions and exact payload matching through transport completion/abort; mismatch aborts with zero bytes and retries outside guard | FR-28; ADR-0006 |
| Generation | Wait outside guard; buffer all output; bind server-issued citations to exact locators; assess claim support separately | FR-22–FR-26, FR-55 |
| 3. Answer delivery | Fresh complete manifest durable outside guard; guarded exact payload/evidence/revision matching, including uncited context, through response handoff; mismatch releases guard before bounded fresh preparation | FR-14, FR-29; ADR-0006 |
| Revoked evidence | Reject provider input or withhold whole original draft; never repair disclosure by stripping chips or sentences | FR-28–FR-29 |
| Optional regeneration | New bounded attempt with remaining permitted evidence only; repeat all checks; stop without original answer if budget/safe evidence absent | FR-29; ADR-0013 terminal mapping specified; runtime verification pending |
| 4. Citation opening | Re-enter source-read diagram with exact document/version/passage identity; never redirect to a newer version | FR-46, FR-55, FR-61 |
| Audit inspection | Current membership plus scoped audit-read permits in-scope actor/action/entity/time; redact protected title/content/before-after unless separately readable. IDs grant no source/citation/AI read | FR-56; ADR-0012 |
| Trace inspection | Scoped trace-read; separate source permission for protected details; does not inherit the audit identity entitlement; no private reasoning | FR-58; ADR-0012 |
| AI failure | Explicit failure; keyword/docs available only while Knowledge and authority healthy; Workspace work depends on its own services | FR-33–FR-34, FR-69 |

Revocation/removal commits share the protected handoff guard for source/citation reads and AI input/output. Internal authenticated/scoped policy/state reads do not reacquire it. Aborted/timed-out handoffs cannot resume after restart; unknown lifecycle-write outcomes block affected protected handoffs until reconciliation. Already sent data cannot be recalled. ADR-0011 confirms this direction; runtime guarantees remain unproven.

## 5. Diagram handoff and review

Source reads: [DGM-FLOW-04 Draw.io](../sdlc/diagrams/flowchart/permission-read-flow.drawio) / [Mermaid](../sdlc/diagrams/flowchart/permission-read-flow.mmd). AI checkpoints: [DGM-FLOW-05 Draw.io](../sdlc/diagrams/flowchart/permission-ai-checkpoints.drawio) / [Mermaid](../sdlc/diagrams/flowchart/permission-ai-checkpoints.mmd). Citation opening returns to DGM-FLOW-04; the connector grants no access.

**Assumptions/open decisions:** Additional capability delegation, physical retention and OD-09 sessions remain open. ADR-0013 and Knowledge OpenAPI v0.2.3 define unavailable-citation and terminal withheld-answer mappings; runtime verification remains pending. ADR-0007/0009/0011 supersede the corresponding old proposals. No runtime proof follows from diagram alignment.

**Checklist:** Pass for scoped capability descriptions, two classifications, immutable-version and four-checkpoint trace; Gap for complete UI/UX workbook review, accessibility/usability checks, owner policy acceptance and runtime/concurrency tests. UML activity conformance is N/A for these UX flowcharts. **Handoff:** Ready for scoped Stage 5/7/8/9 review; author correction is not independent approval.

**v0.3 correction:** Replaced role shortcuts, three-classification policy, citation stripping and four-column Board assumptions; aligned source/AI diagrams and denial/fallback with existing proposed PRD/ADRs.

ADR-0017 membership removal invalidates every individually granted project capability, not only read grants. Rejoin restores none from author/creator/role labels. Affected task assignees become Unassigned; audit preserves historical attribution without granting old users access.

ADR-0017 last-manager rule: reject removal of the final current member with effective membership-management authority until another current member has that authority. Check inside the serialized removal transaction, including concurrent removals/capability changes; no Admin/creator bypass or automatic successor. Rejection leaves all state unchanged.

## Priority 2 UI authority source

Use Workspace getAllowedActions for the current global/project/exact resource scope; only returned operation names can enable corresponding controls. Do not infer action authority from Member.role, content ownership or creator identity. The snapshot does not guarantee resource-state/revision or last-manager preconditions; handlers remain authoritative. Refresh on navigation, focus/reconnect, mutations and permission invalidation; clear denied/expired scope and never reuse cached allow after an authority failure.

listMembers supports minimal current-member selectors for project members; the management route remains membership-manage only. listDocuments/listVersions require document-read. getDocumentPolicy/listDocumentReadGrants require manage-access independently and expose no protected content metadata. Known-ID non-reading managers use the manage route, not a broadened explorer. All public reads go through the existing gateway; do not expose internal evaluateAccess. Proposed ADR-0019 supplies the response and pagination rules; additional non-read delegation is still open.

## Priority 2 recheck action bindings

Version controls call getAllowedActions with the complete project/document/version locator from the selected history row; do not use a bare version ID or resource_id. Require an exact echoed locator before using its advisory actions. Run controls independently use returned getRetrievalSummary and getTrace names: permitted answer readers do not need trace-read for FR-27, and summary authority never enables full trace. Optional summary is hidden when not implemented; FR-27 remains Should. Missing, stale or denied authority clears that control rather than borrowing another scope's rights. See Proposed ADR-0019 v0.2; runtime authority tests remain pending.

## NEXT-03 inspection disclosure and telemetry

Render query/step metadata, exact selected source locators and typed checks only from the renewed allowed projection. Source permission also governs query text and source-specific validation data; do not reconstruct hidden rows from ranks or old browser state. Trace and summary retain their independent run entitlements; audit-read grants no identity exception here. Display measured zero as a value; unavailable as “Not measured”; not_performed as “Not performed”. Never replace either state with zero or infer cause/hidden sources. Safe 503 is distinct from an empty permitted source list. See Proposed ADR-0021; UI/runtime tests are pending.

## NEXT-06 independent command preconditions and receipts

getDocumentCommandPrecondition is action-authorised, not document-read: current membership plus exact requested content-write/lifecycle command is required. Reader-only and manage-access-only do not suffice. It reveals only already-known selectors and an opaque token, never numeric revision/content/history/readiness. Revision/archive/optional metadata edit return only the operation-authorised minimal receipt; source reads are independent renewed checks. Token possession, descriptive role and receipt identity grant no access. Additional non-read delegation remains open; Proposed ADR-0022 and future TC-03/05/06/13/20 govern live verification.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.
