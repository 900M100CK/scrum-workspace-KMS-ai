# Information Architecture & Sitemap (SACW)

**Artifact ID:** UX-SITEMAP-03  
**Version/date:** 0.2 Draft · 9 October 2026  
**Trace:** BRD BR-01–BR-15; PRD-01 (FR-01–FR-69, SC-01–SC-08); SAD-03; ADR-0001; ADR-0006  
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
    - 🏷️ **Labels & Classifications** (Quick filters: `Public`, `Internal`, `Restricted`)
  - **Settings Section (Role-dependent):**
    - 👥 **Members & Access** (`/p/:projectId/settings/members`)
    - ⚙️ **Project Settings** (`/p/:projectId/settings/general`)
  - **System Health Status Footer:**
    - AI Service Indicator (`● AI Ready` / `▲ AI Offline (Fallback Mode)`).
- **Main Content Area:**
  - Standard breadcrumb navigation (`Projects > Mobile App > Docs > Architecture Specs > v2.0`).
  - Dynamic content canvas (Board columns, Document editor, Backlog table).
- **Persistent Right Drawer / Split Pane:**
  - **AI Assistant Drawer:** Can be docked to the right (30% screen width) or floated as a modal (`Ctrl+K`).
  - **Citation Passage Inspector:** When a citation chip is clicked anywhere in the UI, this panel slides in to show the exact version and highlighted passage.

---

## 3. Screen Inventory & Route Registry

| Route Path | Screen Title | Primary Purpose | Authorized Roles | Fallback / Error State |
|---|---|---|---|---|
| `/login` | Sign In | Authenticate user session (FR-36) | Public / Unauth | Form validation error |
| `/projects` | Project Directory | Select or create workspace projects (FR-02) | Authenticated Users | Empty project list card |
| `/p/:projectId/board` | Active Scrum Board | Drag tasks, inspect columns, flag blockers (SC-01, SC-03) | `PO`, `SM`, `DEV`, `VIEWER` (read-only) | No Active Sprint empty state |
| `/p/:projectId/backlog`| Product Backlog | Manage backlog items, plan Sprints (FR-05, FR-06) | `PO`, `SM`, `DEV`, `VIEWER` (read-only) | Empty backlog placeholder |
| `/p/:projectId/docs` | Knowledge Explorer | Browse docs by category & classification (FR-10, FR-14) | `PO`, `SM`, `DEV`, `VIEWER` | Restricted docs hidden (404) |
| `/p/:projectId/docs/:docId` | Document Viewer/Editor | View current version, edit unpublished drafts (FR-11, FR-47) | `PO`, `SM`, `DEV` (Restricted if granted) | 404 Not Found if unauthorized |
| `/p/:projectId/docs/:docId/history` | Version History | Inspect historical superseded versions & diffs (SC-05) | `PO`, `SM`, `DEV`, `VIEWER` | Version superseded disclaimer |
| `/p/:projectId/settings/members` | Member & Grants | Manage team roles and restricted doc access (FR-38, FR-39) | `PO` (Project Admin) | 404 Not Found for other roles |
| `/p/:projectId/ai` (Drawer) | AI Q&A Assistant | Natural language query with exact citations (SC-02, SC-07) | All members (filtered by grant) | Insufficient Evidence / Outage Fallback |

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
- If the Knowledge/AI service is disconnected or degraded:
  - Top header displays an amber status pill: `▲ KMS Fallback: Keyword Search Only`.
  - The AI prompt box is disabled with an explanatory note: *"AI service is temporarily unavailable. Standard document search and manual task board operations remain fully functional."*


**v0.2 documentation change:** Moved the inline diagram to the Stage 7 diagram directory, retaining its labels and relationships. Added an editable Draw.io representation; no policy or product scope is changed. Diagram consistency gaps are recorded in the central index.
