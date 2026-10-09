# User Flow: Scrum Board & Task Management

**Artifact ID:** UX-FLOW-BOARD-01  
**Version/date:** 0.2 Draft · 9 October 2026  
**Trace:** BRD BR-02, BR-03, BR-04; PRD-01 (FR-07–FR-09, FR-42–FR-44, SC-01, SC-03); SAD-03  
**Scope:** Active Sprint Board interaction, task transitions, blocker flagging/resolution, and optimistic updates.

---

## 1. Flow Overview

The Board view allows team members to track progress during an Active Sprint. 
Key business rules enforced:
- Exactly 1 Active Sprint per project (FR-07, FR-42).
- Any member can drag tasks between columns (`Todo`, `In Progress`, `In Review`, `Done`).
- Blockers can be flagged at any time with a mandatory reason note.
- Optimistic UI updates with rollback on network/permission error.

---

## 2. Flow Diagram

See the centralized diagram: [editable Draw.io](../../sdlc/diagrams/flowchart/board-flow.drawio) · [Mermaid source](../../sdlc/diagrams/flowchart/board-flow.mmd).

Diagram ID: `DGM-FLOW-02`. Source content is preserved; see the [diagram review and open gaps](../../sdlc/diagrams/README.md).

---

## 3. Interaction & Edge Cases

| Scenario | System Behavior | UI Feedback |
|---|---|---|
| **Viewer drags card** | Drag action disabled; on click/hover shows lock icon | Tooltip: *"Stakeholders have read-only access."* |
| **Concurrent state update (Conflict 409)** | Server rejects outdated version | Card reverts to original column; Warning toast: *"Task status was changed by [User] just now. Refreshing latest state."* |
| **Offline / Network disconnect** | Task transition fails | Card reverts to previous column; Error toast: *"Could not reach server. Changes not saved."* |
| **Flagging blocker without reason** | Submission blocked client-side | Form validation error: *"Please provide a reason for the blocker."* |


**v0.2 documentation change:** Moved the inline diagram to the Stage 7 diagram directory, retaining its labels and relationships. Added an editable Draw.io representation; no policy or product scope is changed. Diagram consistency gaps are recorded in the central index.
