# Core wireframe work plan and semantic state brief

**Artifact ID:** UX-PLAN-01  
**Version/date:** 0.1 Draft · 18 October 2026  
**Status:** Planning/textual interaction brief only; no rendered wireframes, design-tool publication, application UI or usability approval.  
**Inputs:** PRD-01 v0.9; UC-02 v0.7; SAD-03 v0.15; API-05 v0.16; UX-06 v0.12; UX-CHECK-01 v0.1; UX-HANDOFF-01 v0.8; current sitemap/permission/flow drafts.  
**Trace:** BR-01–BR-14; SC-01–SC-08; NFR-01–NFR-04; U03–U18/U20–U23 and B19 in the detailed checklist review.

## Scope and order

This brief turns the reviewed contract/flow gaps into bounded wireframe tasks. Checkboxes below track **future design outputs**, not application readiness. The correction queue separately tracks the delivery of this plan. Each task must include readable, loading, empty, denied, dependency-failure, conflict and unknown-outcome variants where applicable; omit a state only with its reason. Use synthetic content and exact operation bindings, without implying tested users or implemented APIs.

| Future task | Frames / purpose | Contract sources and acceptance for the design draft |
| --- | --- | --- |
| [ ] WF-01 | Sign-in, project directory, current-member selectors and management entry | getSession/listProjects/getProject/listMembers/getAllowedActions; show empty versus failed lists, session expiry and read-only action variants. Management is capability-scoped; no global user directory or role-permission editor. |
| [ ] WF-02 | Backlog, Sprint selector/planning and multi-select allocation | listTasks/listSprints/listSprintItems/getSprint; show complete-versus-partial Backlog, task location independent of history, per-task confirmed/rejected/unknown allocation results and fixed Sprint lifecycle. |
| [ ] WF-03 | Three-column Board, task detail, assignee and ordered blocker history | getTask/listBlockerEvents plus mutation-specific allowed operations; keyboard state-change alternative, direct transitions, filtered-empty versus no-Active-Sprint, completion/reopen location and race/conflict feedback. |
| [ ] WF-04 | Read-filtered Docs explorer, exact version, history and semantic readiness | listDocuments/getDocument/listVersions/getVersion/getReadiness; Current/Superseded/Archived and semantic status are separate. No product Draft/publish/restore or blanket restricted-content access. |
| [ ] WF-05 | Known-ID access manager and independent non-reading commands | getDocumentPolicy/listDocumentReadGrants/getAllowedActions/getDocumentCommandPrecondition; show read/write/lifecycle/manage separation, action-bound concurrency and minimal acknowledgements. No hidden title/history/current pointer prefill. |
| [ ] WF-06 | Keyword search and explicit task/document relationships | keywordSearch/listLinks/openCitation as appropriate; separate document/task types, permitted endpoints and pagination errors. Task search is FR-70 Should and appears only if implemented/allowed; no hidden relationship counts. |
| [ ] WF-07 | Buffered AI, both citation kinds and deliberate recovery | askQuestion/openCitation/getVersion/getProject/getSprint/getTask; all answer/error states, exact historical/current labels and missing original observation context. No streamed unvalidated draft, saved-answer/status API or automatic resend. |
| [ ] WF-08 | Scoped audit, trace and optional retrieval summary | listAudit/getTrace/getRetrievalSummary; independent entitlements, permitted rows/query/steps/exact sources, honest missing metrics and separate generic dependency/authority errors. FR-27 summary remains Should. |
| [ ] WF-09 | Shared visual/components and interaction validation | Define proposed grid/tokens/type/icons and target viewports explicitly; then inspect contrast, touch/keyboard/focus, wrapping, overflow, destructive confirmations, loading/error/disabled states and task navigation on actual rendered drafts. No numeric/template target is accepted by this plan. |

Draft work and document frames before AI frames so fallback is a real journey. WF-09 starts with the first rendered drafts and continues across them; it is not a final cosmetic step. Record visual/device assumptions and unresolved owner inputs; do not claim inaccessible work is blocked only by a missing colour palette. No calendar estimate or completion-time target is supplied without a measured basis.

## Backlog reorder component — required frame variants

| State ID | Trigger and visible state | Action/next state |
| --- | --- | --- |
| BL-01 | Initial list loading; no confirmed data | Show loading and no cached protected rows before renewed scope. |
| BL-02 | Permitted page(s), more pages remain | Readable rows may show; reorder controls remain disabled. A page/search subset cannot be submitted as the complete Backlog. |
| BL-03 | All pages loaded through next_cursor=null with one backlog_revision | Enable reorder only with current returned reorderBacklog action. Preserve revision as an exact string from these reads. |
| BL-04 | Complete permitted empty Backlog | Show empty guidance with capability-gated create/planning entries; no empty drag interaction. |
| BL-05 | Locally reordered complete list | Provide keyboard and pointer alternatives; submit the full permutation and its captured Backlog revision. No task/project revision substitution. |
| BL-06 | Mutation in flight | Show pending; avoid duplicate submission. Closing/cancelling the view does not prove rollback of server work. |
| BL-07 | Confirmed receipt | Refresh permitted current work; a replay receipt can describe an earlier commit. Do not treat a receipt as a current global snapshot. |
| BL-08 | 409 while paging or submitting | Discard the affected accumulated list, reload and require reconsideration. Do not merge generations or silently reapply an old order. |
| BL-09 | Lost mutation response | Show outcome unknown; reconcile the same original operation identity/payload when available. No fresh-key retry or inferred rollback. If that context is unavailable, keep the uncertainty explicit rather than inventing a request-status read. |
| BL-10 | Session/access/authority/dependency failure | Clear protected data on expiry/denial/unknown authority. Distinguish generic failure from an empty successful list. Healthy non-AI work is not disabled by an AI badge. |

The frames specify interaction; actual full-list membership, revision, capability and transaction checks remain server responsibilities. Multiple independent lists are not one atomic snapshot.

## Independent document action component — required frame variants

| State ID | Trigger and visible state | Action/next state |
| --- | --- | --- |
| DC-01 | Known document ID, action discovery loading | No title/content/history/owner prefill unless independently readable. A known ID is not authority. |
| DC-02 | Exact scope permits a content/lifecycle action | Show only the corresponding control; manage-access alone does not enable it. The server still checks current authority at execution. |
| DC-03 | Revise without content-read | Accept new user-entered text; do not fetch or reconstruct protected old text. Explain immediate Current revision and absence of a publish step. |
| DC-04 | Archive selected | Require an already-known exact document/version target. Do not offer an implicit “archive current” lookup of a hidden version. |
| DC-05 | Obtaining command precondition | Request the selected action's opaque token. Token issuance shows no numeric revision/current pointer/lifecycle/content. |
| DC-06 | Ready to submit | Use exactly one already-known numeric expected revision or matching opaque token, plus original scoped idempotency identity. Token possession is not read/action authority. |
| DC-07 | Confirmed revise/archive/metadata receipt or delete 204 | Acknowledge only the command/new-or-supplied identity. Stay on the independent action surface; open protected display data only after separate renewed read checks. Do not infer a read grant from success. |
| DC-08 | Conflict/rejected precondition | Explain the need to reconsider; refresh only permitted state/preconditions. Never overwrite or silently replay the original edit. |
| DC-09 | Unknown result | Preserve original identity/payload when available; a newly issued token is not proof the previous command rolled back. No blind resubmit/new-key retry, invented polling endpoint or promise of automatic recovery after lost context. |
| DC-10 | Scope removed/unknown or service failure | Clear stale allowed actions/tokens/protected display. Use the existing generic denial/failure rules without hidden-content or revocation-cause hints. |

Visual layouts must distinguish membership management, document access management, content-read, content-write and lifecycle authority. Initial descriptive Member.role does not provision those capabilities. Additional delegation and account provisioning remain owner decisions.

## AI and inspector distinctions to retain in every frame

1. Loading/validation, answered, partially_answered, insufficient_evidence, conflict, terminal withheld and dependency failure are visibly distinct. Partial answers list supported citations and request-visible missing components; failures contain no generated answer or hidden-source hints.
2. A stale health badge does not permanently disable the editor. After a terminal failure, retry is deliberate new user intent with renewed scope; a lost response remains unknown and is never transparently resent. Server quarantine can still reject a new request.
3. Document inspection uses the exact document/version/passage and renewed access. Verified surviving unavailable identity differs from generic unknown/inaccessible; no excerpt or newer-version substitution.
4. Operational inspection separates the delivered observation locator/time from renewed current entity state. Reload/direct navigation without the original answer context shows original observation unavailable; URL/current values/browser storage cannot recreate authoritative history.
5. Measured zero displays as zero; unavailable as Not measured; unexecuted as Not performed. Summary, trace and audit are separate entitlements even when frames share a layout.
6. Provider outage, Knowledge outage and authority failure have different surviving paths. Work/docs/keyword usability follows their own healthy dependencies; no unrestricted cached fallback.

## Design handoff and evidence still required

For each WF task, supply the named frame variants, source operations, requirement/UC/TC links, assumptions and observed problems. Test keyboard/focus and synthetic user tasks on rendered output before claiming accessibility/usability. Use native labelled controls, visible focus and text for status; a modal must contain focus without stranding the user and restore it meaningfully on close. Measurements, browser/device choices, actual source support and owner policy require their own evidence.

No frame or UI feature is completed by this plan. Server handlers/current-authority, token storage, active process fence/guard/provider/transport, full API semantics and real UI/application acceptance remain open. This is a bounded next-work brief under the existing Core scope, not a UI framework/design-tool choice, new role policy, runtime AI write capability, external publication or scope deferral.

Checklist: Pass for ordered tasks, concrete Backlog/document command state variants and preserved Core distinctions; Gap for every unchecked rendered-design task and runtime gate. Handoff: use WF-01/WF-02 as the first design slices while retaining the documented assumptions and original 60 Must requirements.
