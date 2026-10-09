# Permission Matrix by Screen & Action

**Artifact ID:** UX-PERM-MATRIX-02  
**Version/date:** 0.2 Draft · 9 October 2026  
**Trace:** BRD BR-01, BR-10, BR-14; PRD-01 (FR-01–FR-04, FR-38–FR-39, FR-48, FR-59, SC-06); ADR-0001; ADR-0006  
**Scope:** UI visibility, action enablement, and error-handling behavior per role across SACW screens.

---

## 1. Principles of Permission Enforcement in UI/UX

1. **Dual Boundary Enforcement (Project vs Document):**
   - Project membership grants access to the Scrum workspace and standard internal docs.
   - Restricted documents require explicit, non-inherited document-level grants.
2. **Metadata Protection & No-Disclosure Rule (FR-59, AC-03, AC-04):**
   - When a user without permission (or a non-member) attempts to access a protected item directly by URL or ID, the UI MUST display standard **404 Not Found** or an empty placeholder.
   - It MUST NOT display "403 Forbidden - Access Denied to Secret Document X" which reveals title or existence.
3. **Graceful Action Disabling vs Hiding:**
   - Primary management buttons (e.g. "Start Sprint", "Add Member", "Publish Version") are hidden for roles lacking authority to avoid clutter.
   - Secondary row actions (e.g. status drop-down) show disabled state with permission tooltip when the user is viewing a task they cannot modify.
4. **AI Q&A Permission Filtering:**
   - AI assistant queries only inspect chunks from documents the user is authorized to read.
   - Citation chips link only to accessible documents. If a citation belongs to a restricted document the user cannot access, the citation and corresponding passage are omitted or return "Source unavailable / 404".

---

## 2. Global Navigation & Project Management

| Screen / Feature | Element / Action | Product Owner (`PO`) | Scrum Master (`SM`) | Developer (`DEV`) | Stakeholder (`VIEWER`) | Non-Member / Unauthenticated |
|---|---|---|---|---|---|---|
| **Project Switcher** | View assigned projects list | ✅ View all assigned | ✅ View all assigned | ✅ View all assigned | ✅ View all assigned | ❌ Redirect to `/login` |
| **Project Settings** | Edit project name / description | ✅ Full edit | ❌ Hidden | ❌ Hidden | ❌ Hidden | ❌ 404 Not Found |
| **Members Page** | View member list | ✅ View | ✅ View | ✅ View | ✅ View | ❌ 404 Not Found |
| **Members Page** | Add member / assign project role | ✅ Enabled | ❌ Hidden | ❌ Hidden | ❌ Hidden | ❌ 404 Not Found |
| **Members Page** | Remove member | ✅ Enabled | ❌ Hidden | ❌ Hidden | ❌ Hidden | ❌ 404 Not Found |

---

## 3. Backlog & Sprint Management

| Screen / Feature | Element / Action | Product Owner (`PO`) | Scrum Master (`SM`) | Developer (`DEV`) | Stakeholder (`VIEWER`) |
|---|---|---|---|---|---|
| **Backlog View** | View backlog items (Stories/Tasks/Bugs) | ✅ Full view | ✅ Full view | ✅ Full view | ✅ Read-only view |
| **Backlog View** | Create new item (`Story`, `Task`, `Bug`) | ✅ Enabled | ❌ Hidden / Disabled | ❌ Hidden / Disabled | ❌ Hidden |
| **Backlog View** | Reorder / rank backlog items | ✅ Drag-drop enabled | ❌ Disabled | ❌ Disabled | ❌ Disabled |
| **Backlog View** | Edit Story points / description | ✅ Enabled | ❌ Disabled | ❌ Disabled | ❌ Disabled |
| **Sprint Management** | Create / Plan new Sprint | ✅ Enabled | ✅ Enabled | ❌ Hidden | ❌ Hidden |
| **Sprint Management** | Start Sprint (enforce 1 Active limit) | ❌ Hidden | ✅ Enabled | ❌ Hidden | ❌ Hidden |
| **Sprint Management** | Complete Sprint | ❌ Hidden | ✅ Enabled | ❌ Hidden | ❌ Hidden |

---

## 4. Scrum Board & Task Execution

| Screen / Feature | Element / Action | Product Owner (`PO`) | Scrum Master (`SM`) | Developer (`DEV`) | Stakeholder (`VIEWER`) |
|---|---|---|---|---|---|
| **Board View** | View board columns (`Todo`, `In Progress`, `In Review`, `Done`) | ✅ Full view | ✅ Full view | ✅ Full view | ✅ Read-only (static cards) |
| **Board View** | Drag task card across columns | ⚠️ Permitted | ✅ Permitted | ✅ Permitted | ❌ Drag disabled |
| **Board View** | Quick filter (My tasks, Blocked tasks) | ✅ Enabled | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| **Task Modal** | Update Status via dropdown | ✅ Enabled | ✅ Enabled | ✅ Enabled | ❌ Read-only text badge |
| **Task Modal** | Flag Blocker (`is_blocked = true`) & input reason | ✅ Enabled | ✅ Enabled | ✅ Enabled | ❌ Disabled |
| **Task Modal** | Unflag Blocker with resolution note | ✅ Enabled | ✅ Enabled | ✅ Enabled | ❌ Disabled |
| **Task Modal** | Link related Knowledge Document | ✅ Enabled | ✅ Enabled | ✅ Enabled | ❌ Read-only link list |

---

## 5. Knowledge Management (Documents & Versions)

| Screen / Feature | Element / Action | Product Owner (`PO`) | Scrum Master (`SM`) | Developer (`DEV`) | Stakeholder (`VIEWER`) |
|---|---|---|---|---|---|
| **Doc Explorer** | View Public / Internal doc list | ✅ View | ✅ View | ✅ View | ✅ View |
| **Doc Explorer** | View Restricted doc in list | ✅ View (if owner/grant) | 👁️ Only if granted | 👁️ Only if granted | ❌ Hidden completely |
| **Doc Editor** | Create new Document / Draft | ✅ Enabled | ✅ Enabled | ✅ Enabled | ❌ Hidden |
| **Doc Editor** | Edit unpublished `Draft` | ✅ Own / Granted | ✅ Own / Granted | ✅ Own / Granted | ❌ 404 if direct link |
| **Doc Editor** | Promote `Draft` to `Current` version | ✅ Enabled | ⚠️ If document owner | ⚠️ If document owner | ❌ Disabled |
| **Doc Classification**| Change classification (`Public`, `Internal`, `Restricted`) | ✅ Enabled | ❌ Disabled | ❌ Disabled | ❌ Disabled |
| **Doc Access Grants** | Grant/Revoke individual user access to Restricted doc | ✅ Enabled | ❌ Disabled | ❌ Disabled | ❌ Disabled |
| **Version History** | View list of historical versions (`Current`, `Superseded`, `Archived`) | ✅ Full history | ✅ Full history | ✅ Full history | ✅ Full history (Public/Internal) |
| **Version History** | Inspect diff between versions | ✅ Enabled | ✅ Enabled | ✅ Enabled | ✅ Enabled |

---

## 6. AI Q&A and Search Assistant

| Feature / UI Element | Product Owner (`PO`) | Scrum Master (`SM`) | Developer (`DEV`) | Stakeholder (`VIEWER`) |
|---|---|---|---|---|
| **Global AI Query Bar** | ✅ Accessible | ✅ Accessible | ✅ Accessible | ✅ Accessible (Read-only) |
| **Corpus Retrieval Scope** | All Project items + Restricted docs with grant | All Project items + Restricted docs with grant | All Project items + Restricted docs with grant | Only Public & Internal project items |
| **Operational State Queries** (e.g., "Which tasks are blocked?") | ✅ Returns operational status | ✅ Returns operational status | ✅ Returns operational status | ✅ Returns operational status |
| **Citation Chips in Answers** | Clickable chip -> Opens side panel with exact version/passage | Clickable chip -> Opens side panel with exact version/passage | Clickable chip -> Opens side panel with exact version/passage | Clickable chip (Restricted citations stripped entirely) |
| **Direct URL to Restricted Citation** | ✅ Opens document passage | 👁️ 404 if not granted | 👁️ 404 if not granted | ❌ 404 Not Found (no title/content leaked) |
| **AI Feedback Buttons** (Thumbs up/down) | ✅ Enabled | ✅ Enabled | ✅ Enabled | ✅ Enabled |

---

## 7. UI Error & State Handling Matrix by Role

See the centralized diagram: [editable Draw.io](../sdlc/diagrams/flowchart/permission-read-flow.drawio) · [Mermaid source](../sdlc/diagrams/flowchart/permission-read-flow.mmd).

Diagram ID: `DGM-FLOW-04`. Source content is preserved; see the [diagram review and open gaps](../sdlc/diagrams/README.md).


**v0.2 documentation change:** Moved the inline diagram to the Stage 7 diagram directory, retaining its labels and relationships. Added an editable Draw.io representation; no policy or product scope is changed. Diagram consistency gaps are recorded in the central index.
