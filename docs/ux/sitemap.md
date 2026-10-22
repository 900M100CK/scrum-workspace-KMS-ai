# Information Architecture & Sitemap (SACW)

**Artifact ID:** UX-SITEMAP-03  
**Version/date:** 0.9 Draft · 18 October 2026
**Trace:** BRD BR-01–BR-15; PRD-01 (FR-01–FR-70; FR-45 withdrawn, SC-01–SC-08); SAD-03; ADR-0001; ADR-0006
**Scope:** Information Architecture, Navigation Hierarchy, Screen Inventory, and Global AI Placement.

---

## 1. Information Architecture Overview

The Scrum Workspace and AI Project KMS (SACW) operates under a dual hierarchy:
1. **Global App Scope:** Authentication, user profile, and Project Selection.
2. **Project Scoped Workspace:** Work Execution (Backlog, Sprint, Board), Knowledge Management (Docs, Versioning, Manual Links), Settings/Members, and Contextual AI Assistant.

See the centralized diagram: [editable Draw.io](../sdlc/diagrams/sitemap/application-sitemap.drawio) · [Mermaid source](../sdlc/diagrams/sitemap/application-sitemap.mmd).

Diagram ID: `DGM-SITE-01`. Source content is preserved; see the [diagram review and open gaps](../sdlc/diagrams/README.md).

---

## 2. Navigation Model & Layout Structure

The interface uses a 3-tier navigation layout:
- **Top Header Bar (Persistent Global):**
  - Project Switcher Dropdown (`[Project Name ▾]`).
  - Global Search & AI Trigger Bar (`[ 🔍 Ask AI or search project... (Ctrl + K) ]`).
  - Active Sprint Indicator badge (e.g., `Sprint 3: 4 days left`).
  - User Avatar & Profile menu (Session expiry indicator, Sign Out).
- **Left Sidebar (Project Scope Navigation):**
  - **Work Section:**
    - 📋 **Backlog** (`/p/:projectId/backlog`)
    - 📊 **Active Board** (`/p/:projectId/board`) — *Primary landing page if active sprint exists*
  - **Knowledge Base Section:**
    - 📚 **Documents** (`/p/:projectId/docs`)
    - 🔍 **Search** (`/p/:projectId/search`) — keyword search over permitted Current documents and tasks
    - 🏷️ **Labels & Classifications** (Quick filters: `Project-shared`, `Restricted`; restricted items appear only with a current read grant)
  - **Settings Section (Capability-dependent):**
    - 👥 **Members** (`/p/:projectId/settings/members`)
    - ⚙️ **Project Settings** (`/p/:projectId/settings/general`)
    - 🧾 **Audit** (`/p/:projectId/audit`) — only with audit-read or trace-read capability
  - **System Health Status Footer:**
    - AI Service Indicator (`● AI Ready` / `▲ AI Offline (Fallback Mode)`).
- **Main Content Area:**
  - Standard breadcrumb navigation (`Projects > Mobile App > Docs > Architecture Specs > v2.0`).
  - Dynamic content canvas (Board columns, Document editor, Backlog table).
- **Persistent Right Drawer / Split Pane:**
  - **AI Assistant Drawer:** Can be docked to the right (30% screen width) or floated as a modal (`Ctrl+K`).
  - **Citation Inspector:** Branch by citation kind: an exact document version/passage, or a historical operational observation locator alongside a separately refreshed current entity.

---

## 3. Screen Inventory & Route Registry

| Route Path | Screen Title | Primary Purpose | Access basis | Fallback / Error State |
|---|---|---|---|---|
| `/login` | Sign In | Authenticate user session (FR-36) | Unauthenticated | Form validation error |
| `/projects` | Project Directory | Select or create workspace projects (FR-02) | Authenticated user | Empty project list card |
| `/p/:projectId/board` | Active Scrum Board | Move tasks, filter, flag/resolve blockers (SC-01, SC-03) | Project member; actions by current capability, read-only otherwise | No active Sprint empty state; generic 404 on membership loss |
| `/p/:projectId/backlog` | Product Backlog | Manage backlog items, plan Sprints (FR-05, FR-06) | Project member; Sprint planning by capability | Empty backlog placeholder |
| `/p/:projectId/docs` | Document Explorer | Browse project-shared and granted restricted documents (FR-10, FR-14) | Project member; restricted only with a current read grant | Inaccessible documents omitted; no hidden metadata |
| `/p/:projectId/docs/:docId` | Document Viewer / Editor | View authorised version; save immediate Current revision with content-write; independent manage-access entry for access managers (FR-11, FR-47; UC-06, UC-07) | Current project membership plus document read checks; write/manage capabilities do not grant read | Generic 404 when unknown or inaccessible |
| `/p/:projectId/docs/:docId/history` | Version History | Explicit history with Superseded/Archived labels (SC-05) | Same as document read | Generic 404 |
| `/p/:projectId/search` | Keyword Search | AI-independent keyword search over permitted Current documents and tasks (UC-08; FR-18, FR-34) | Project member | Separate groups: document search unavailable when Knowledge is down; FR-70 Should task search remains available while Workspace is healthy |
| `/p/:projectId/settings/members` | Team Membership | Add/remove membership; initial descriptive role selection (UC-02) | Membership-management capability | Generic 404 for other members |
| `/p/:projectId/settings/general` | Project Settings | Project details | Settings capability | Generic 404 for other members |
| `/p/:projectId/audit` | Audit & Trace Inspector | Scoped audit events and execution traces (UC-13; FR-56, FR-58) | Audit-read or trace-read capability only | Generic 404 outside scope or without capability |
| `/p/:projectId/citations/:documentId/:versionId/:passageId` | Citation Passage Inspector | Exact excerpt and version with Current / Superseded / Archived label (UC-09) | Re-checked protected read | Generic 404; specific "Citation unavailable" only when the surviving identity is readable |
| `/p/:projectId/observations/:entityKind/:entityId` | Operational Citation Inspector | Cited entity/time/observation revision plus separately refreshed current state (UC-10) | Current member and exact entity scope; getProject/getSprint/getTask recheck | Generic 404 or dependency failure; missing original answer context shows observation unavailable, with any renewed current read labelled separately |
| `/p/:projectId/ai` (Drawer) | AI Q&A Assistant | Buffered answers with exact citations (SC-02, SC-07) | Project member; evidence filtered by current access | Insufficient evidence; AI failure with keyword fallback |
| `/p/:projectId/docs/:docId/manage` | Document Access | Known-ID policy and current grantees via getDocumentPolicy/listDocumentReadGrants | Membership plus manage-access, independent of content-read | Generic 404; no content metadata without read |
| `/p/:projectId/docs/:docId/actions` | Independent Document Actions | Known-ID scoped write/lifecycle discovery via getAllowedActions | Scoped action authority; no content prefill without read | Opaque action precondition/conflict handling; no protected prefill |
| any protected route | Generic Not Found | One response for unknown and inaccessible resources | Any | No title, count, version or excerpt |

---

## 4. Placement & Interaction of AI Assistant

### 4.1 Trigger Points
1. **Header Shortcut / Command Palette:** Pressing `Ctrl + K` (or `Cmd + K`) opens the AI Query interface from any screen.
2. **Contextual In-Line Action:**
   - In Task Modal: Button `[ 🤖 Ask AI about this task's specs ]`.
   - In Document View: Button `[ 🤖 Explain historical rationale of this section ]`.

### 4.2 Presentation Modes
- **Docked Split Mode (Recommended for Devs):** The right side of the screen opens the AI Assistant drawer alongside the Active Board or Document Editor, allowing side-by-side reading of citations without losing work context.
- **Floating Modal:** Quick query-and-dismiss for casual checks.

### 4.3 AI Service Status Awareness (FR-33, FR-69)
- If only the AI provider path fails (FR-69, FR-34):
  - Top header displays an amber status pill: `▲ KMS Fallback: Keyword Search Only`.
  - Keep the question editor and deliberate retry/new-question action reachable while session/scope permits; do not permanently disable it from the health badge. Show an explanatory note: *"AI service is temporarily unavailable. Keyword search and manual task board operations remain available while their own services are healthy; if Knowledge is unavailable, documents and document search are unavailable; healthy Workspace board operations and optional task keyword search continue."*


**v0.2 documentation change:** Moved the inline diagram to the Stage 7 diagram directory, retaining its labels and relationships. Added an editable Draw.io representation; no policy or product scope is changed. Diagram consistency gaps are recorded in the central index.

**v0.3 correction:** Replaced Public/Internal/Restricted and PO/SM/DEV/VIEWER shortcuts with project-shared/restricted and capability-based access; added keyword search, audit/trace inspection, generic 404 and the exact-identity citation route; corrected AI-versus-Knowledge outage wording. Route names are proposals; no policy, API or product scope is decided here (OD-02–OD-04/OD-09 remain open).

**Owner scope clarification - ADR-0016:** Task keyword search is explicitly added as FR-70 Should after 60 Must. Search presents separate Tasks and Documents result groups. Workspace task title/description search remains usable during Knowledge/AI outage when its own dependencies are healthy; document failure must not hide healthy task results. It does not imply a single cross-service query or merged relevance ranking.

## Independent document action entry — 17 October 2026

Proposed browser routes `/p/:projectId/docs/:docId/manage` and `/p/:projectId/docs/:docId/actions` accept a known identity and validate scoped manage-access or content-write/lifecycle authority independently of the readable explorer/viewer. They expose no content or hidden metadata without the relevant permission. Prefill/history/readiness still require content-read. These are UI routes, not new HTTP operations; ADR-0007 and UC-06/07 govern the existing operations. Sources: PRD-01 v0.9; UC-02 v0.6; SAD-03 v0.11; UX-PERM-MATRIX-02 v0.6.
