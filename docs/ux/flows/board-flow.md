# User Flow: Scrum Board & Task Management

**Artifact ID:** UX-FLOW-BOARD-01\
**Version/date:** 0.4 Draft · 12 October 2026\
**Status:** Draft correction; not policy approval.\
**Sources:** PRD-01 v0.4; UC-02 v0.2 (UC-04/UC-05); SAD-03 v0.5; Workspace OpenAPI v0.1.0; Proposed ADR-0001 v0.2/ADR-0006 v0.1.\
**Trace:** BR-01–BR-03, BR-06, BR-10, BR-11, BR-13; FR-03, FR-08, FR-09, FR-17, FR-31, FR-33, FR-39, FR-42–FR-44, FR-59, FR-68; SC-01, SC-03, SC-04, SC-06, SC-08.

## 1. Main flow

Revalidate session and current project membership before loading board data. At most one Sprint is Active; zero Active Sprints is valid. If none exists, show “No active sprint”. A user with Sprint-management capability may navigate to Backlog/Sprint planning; do not imply Scrum Master title grants this capability.

Render Core columns **To Do, In Progress, Done**. Only users with the relevant current action capability can mutate tasks; Viewer/stakeholder is read-only by default. Drag or keyboard state selection performs an optimistic move, then sends `POST /tasks/{task_id}/state` with expected revision and required idempotency key. The server validates membership, action capability, revision and state rules again.

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
| Linked document | Use shared protected-read flow: project-shared does not need a grant; restricted does. Draft/version rules apply. Unknown/inaccessible target gives generic `404`. |
| AI unavailable | Board operations continue when Workspace dependencies remain healthy. |

DGM-FLOW-02: [Mermaid](../../sdlc/diagrams/flowchart/board-flow.mmd) · [Draw.io](../../sdlc/diagrams/flowchart/board-flow.drawio).

**Assumptions/open decisions:** Capability assignments remain OD-02; Sprint policy remains OD-03. UI controls do not establish server enforcement.

**v0.4 correction:** Restored existing quick filters omitted during v0.3 simplification; labelled AI outage as an event entry in DGM-FLOW-02 v0.3. No new product capability or workflow state.
**Checklist/handoff:** Pass for documented empty, blocker-resolution, server-validation and membership-loss branches; Gap for visual/accessibility, runtime and concurrency testing. Ready for downstream review/test design. v0.3 addresses B1–B4 and the local F-12 column mismatch.
