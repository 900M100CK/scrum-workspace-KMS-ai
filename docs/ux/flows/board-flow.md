# User Flow: Scrum Board & Task Management

**Artifact ID:** UX-FLOW-BOARD-01\
**Version/date:** 0.9 Draft · 18 October 2026
**Status:** Owner-confirmed policy direction; UI/diagram/runtime evidence pending.\
**Sources:** PRD-01 v0.9; UC-02 v0.7 (UC-04/UC-05); SAD-03 v0.15; Workspace OpenAPI v0.2.8; ADR-0007/0008 v0.3/0011; OWNER-Q-01.\
**Trace:** BR-01–BR-03, BR-06, BR-10, BR-11, BR-13; FR-03, FR-08, FR-09, FR-17, FR-31, FR-33, FR-39, FR-42–FR-44, FR-59, FR-68; SC-01, SC-03, SC-04, SC-06, SC-08.

## 1. Main flow

Revalidate session and current project membership before loading board data. At most one Sprint is Active; zero Active Sprints is valid. If none exists, show “No active sprint”. A user with Sprint-management capability may navigate to Backlog/Sprint planning; do not imply Scrum Master title grants this capability.

Render Core columns **To Do, In Progress, Done**. Only users with the relevant current action capability can mutate tasks; Viewer/stakeholder is read-only by default. Drag or keyboard state selection performs an optimistic move, then sends `POST /tasks/{task_id}/state` with expected revision and required idempotency key. The server validates membership, action capability, revision and state rules again.

Allow direct moves between any two columns, including To Do → Done and Done → To Do/In Progress. No intermediate move or Scrum Master approval is required. Reopening a Done task from a Completed Sprint returns it to Product Backlog as To Do for later allocation (normalising an In Progress reopen request) and preserves that Sprint's completed history; show the current location after confirmation and leave the Sprint Completed.

Keep the existing quick filters **All / Blocked Only / My Tasks** over the already authorised board cards. Blocked Only uses confirmed blocker state; My Tasks compares assignee with the authenticated requester. No match shows an empty filtered result with an option to clear filters. Filters do not add workflow states, expand permissions or replace server checks. AC-09 and ASM-02 retain the three Core columns; PRD v0.4 does not require removing these display filters.

## 2. Blocker events

An authorised user can flag or resolve a blocker from task detail. Both use `POST /tasks/{task_id}/blockers`: `status: open` or `status: resolved`, a nonempty description, expected revision and optional outcome as defined in RecordBlocker. A resolution records an outcome only when supplied; do not infer one from a plan. Confirmed events retain actor/time/sequence and resolution history (SC-04); update the badge from confirmed state.

Paths are OpenAPI keys relative to `/api`. Client validation helps entry; server validation enforces it. Mutations follow contract concurrency/idempotency requirements.

## 3. Edge cases

| Scenario | Behaviour and feedback |
| --- | --- |
| Viewer/stakeholder attempts mutation | Disable control: “Read-only view”. Server rejects unauthorised requests even if UI checks are bypassed. |
| Concurrent update (`409`) | Roll back optimistic display and fetch the latest permitted state. “Task was updated. Refreshing latest state.” Do not invent another actor's identity. |
| Offline / service failure | Revert optimistic state; show “Could not confirm the change. Refresh before retrying.” A lost response may follow a committed write; reconcile before retry. |
| Missing blocker description | Inline validation; server independently rejects invalid input for open and resolved events. |
| Member removed while board is open | Subsequent reads/mutations deny; cancel pending UI operations and clear protected board data when loss is detected. Generic `404`; no further updates. Already delivered data cannot be recalled. |
| Session expired | Clear protected display and require sign-in (`401`). |
| No Active Sprint | Empty state and capability-aware navigation; no invented Active Sprint. |
| Linked document | Use shared protected-read flow: project-shared needs current membership; restricted also needs an explicit grant. Exact version/history and guarded handoff rules apply. Unknown/inaccessible target gives generic `404`. |
| AI unavailable | Board operations continue when Workspace dependencies remain healthy. |

DGM-FLOW-02: [Mermaid](../../sdlc/diagrams/flowchart/board-flow.mmd) · [Draw.io](../../sdlc/diagrams/flowchart/board-flow.drawio).

**Assumptions/open decisions:** Initial authority and fixed Sprint/direct board transitions are confirmed in ADR-0007/0008. Additional capability delegation remains open. UI controls do not establish server enforcement. DGM-FLOW-02 v0.5 includes direct moves/reopening in its mutation and confirmation nodes; rendered review remains pending.

**v0.4 correction:** Restored existing quick filters omitted during v0.3 simplification; labelled AI outage as an event entry in DGM-FLOW-02 v0.3. No new product capability or workflow state.
**Checklist/handoff:** Pass for documented empty, blocker-resolution, server-validation and membership-loss branches; Gap for visual/accessibility, runtime and concurrency testing. Ready for downstream review/test design. v0.3 addresses B1–B4 and the local F-12 column mismatch.

## Multiple-selection clarification - 14 October 2026

ADR-0014 preserves multiple task selection and per-task results. The UI invokes allocateTask separately with a distinct stable key/payload per item and aggregates confirmed allocated/rejected outcomes. Unknown transport outcomes stay reconciling until the same-key outcome is resolved; never relabel a possible commit as failure or repeat the whole selection with fresh keys. Earlier successes remain committed. Recheck authority, lifecycle, expected revision and exclusive current allocation for each item; hide inaccessible task and competing-Sprint metadata. Test mixed valid/conflicting selection, lost response replay, permission change between items and reconnect. No batch endpoint or runtime evidence is claimed.

ADR-0017: after membership removal, refreshed tasks show Unassigned with new revision; task state, blocker and Sprint history stay intact. Rejoin does not restore previous assignment. Pending assignment requests cannot reassign a departed member.

Sprint completion returns unfinished tasks to Backlog as To Do and keeps Done tasks Done. Optional allocation removal also resets unfinished tasks to To Do. Show the confirmed state/location after success; stale or failed operations reconcile before retry (ADR-0008 / OWNER-Q-01).

## Refresh and reconstruction contract — 18 October 2026

Workspace v0.2.3 supplies listTasks (all/backlog), listSprintItems and listBlockerEvents under Proposed ADR-0018. Render current location from Task.work_location, not cached moves or historic associations. Sprint rows distinguish allocated/completed/returned; a historical row includes current task data, not a completion-time snapshot. Blocker history uses event sequence and needs ordinary current work read authority, not audit-read.

On first load/reconnect, obtain fresh authoritative pages. A 409 during pagination discards that list's accumulated pages and restarts; do not silently merge old and new pages. Membership loss clears the protected display. Independent lists are not a global atomic snapshot. Show completion counts only from confirmed SprintCompletion; an unknown mutation outcome still reconciles the original key. Test fresh-client reconstruction during AI outage, completion/reopening, reorder and access loss. These are specified UI behavior, not executed tests.

## Backlog reorder across pages — 18 October 2026

Workspace v0.2.4 requires a complete Backlog order. Before enabling reorder, load all location=backlog pages with one backlog_revision through next_cursor=null. A visible page or search result alone is insufficient. Drag/keyboard reorder changes the locally complete list; submit its full task_ids and the revision from those reads. A 409 discards stale pages and reloads; do not auto-reapply the old order or issue a new idempotency key for an unknown result. On confirmed receipt refresh current work; a replay receipt may describe an earlier commit. Empty Backlog has no items to reorder. Persisted current placement remains distinct from completed-history rows, including Done work reopened into Backlog.
