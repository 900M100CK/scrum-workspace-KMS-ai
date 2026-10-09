# Personas & User Roles (SACW)

**Artifact ID:** UX-PERSONAS-01  
**Version/date:** 0.2 Draft · 9 October 2026  
**Trace:** BRD BR-01–BR-15; PRD-01 (FR-01–FR-69, SC-01–SC-08); SAD-03; ADR-0001; ADR-0006  
**Scope:** Scrum Workspace and AI Project KMS (Core MVP)

---

## 1. Persona Overview & Role Mapping

The system enforces strict distinction between **Project Membership** and **Document-Level Permissions** (ADR-0001, FR-03, FR-04). Roles are defined at both Project Scope and Document Classification Scope.

| Persona / Role | System Role Name | Project Scope Authority | Document Authority | AI Q&A Capability Scope |
|---|---|---|---|---|
| **P1: Product Owner (PO)** | `PROJECT_ADMIN` / `PO` | Backlog CRUD, Sprint creation, Member management | Full CRUD on Docs, Classification manager (Public / Internal / Restricted) | Full project corpus including Restricted docs owned |
| **P2: Scrum Master (SM)** | `SCRUM_MASTER` | Sprint lifecycle (Plan/Start/Complete), Board column & Blocker tracking | Read/Write Docs (Standard), Read Restricted (if granted) | Project corpus, Operational Sprint/Task state query |
| **P3: Developer / Core Contributor** | `DEVELOPER` | Task status transitions, Work logging, Blocker flag | Read Docs, Create/Edit Technical Specs / Notes, Restricted (opt-in grant only) | Granted corpus + Active Sprint context with exact citations |
| **P4: Stakeholder / External Auditor** | `STAKEHOLDER_VIEWER` | Read-only Board, Backlog view (no edits, no drag-drop) | Read Public & Internal Docs only (Restricted strictly withheld) | Read-only Q&A over authorized corpus; Restricted passages hidden with 404/no-disclosure |

---

## 2. Detailed Persona Profiles

### Persona 1: Sarah — The Pragmatic Product Owner (PO)
- **Archetype / Role:** Product Owner & Project Administrator (`PO` / `PROJECT_ADMIN`).
- **Background:** Manages business priorities, feature roadmaps, and stakeholder alignment across multiple microservice components.
- **Goals:**
  - Maintain a groomed, prioritized backlog with clear acceptance criteria and linked technical docs.
  - Ensure sensitive architectural or business decisions (e.g. vendor pricing, security audits) remain Restricted to authorized eyes only.
  - Quick recall of historical trade-offs ("Why did we choose JWT over session cookies in Sprint 2?").
- **Pain Points:**
  - Context loss across Sprints when tasks reference decisions made months ago.
  - Fear of accidental data leakage when team members or stakeholders ask AI questions.
- **Key Tasks in SACW:**
  - Create & groom Backlog items (Stories, Tasks, Bugs).
  - Author and designate Document versions (`Draft` -> `Current` -> `Superseded`).
  - Manage Project members and document access grants.
  - Query AI for historical rationale with verified citations.

---

### Persona 2: Alex — The Agile Scrum Master (SM)
- **Archetype / Role:** Scrum Master (`SCRUM_MASTER`).
- **Background:** Facilitates Scrum ceremonies (Daily Standup, Planning, Review, Retrospective) and shields the team from blockers.
- **Goals:**
  - Monitor Sprint health, identify blocked tasks (`is_blocked == true`), and track resolution blockers.
  - Ensure only 1 Active Sprint runs at a time per project (PRD FR-07, FR-42).
  - Search past retrospectives and blocker patterns to resolve team impediments.
- **Pain Points:**
  - Standups get bogged down trying to remember how previous blockers were unblocked.
  - Tool friction when updating task states during quick team check-ins.
  - System outages breaking team workflow.
- **Key Tasks in SACW:**
  - Start / Complete Sprints.
  - Filter board by blockers and inspect blocker rationale.
  - Use operational queries in AI ("What tasks are currently blocked and what were their flagged reasons?").
  - Seamless fallback to manual Board view when AI or indexing service is unavailable (FR-33, FR-69).

---

### Persona 3: David — The Focused Developer (Dev)
- **Archetype / Role:** Core Developer / Software Engineer (`DEVELOPER`).
- **Background:** Implements user stories, writes code, reviews PRs, and authors technical documentation / ADR drafts.
- **Goals:**
  - Understand requirements and acceptance criteria quickly without switching across multiple disjointed tools.
  - Drag tasks across board columns (`Todo` -> `In Progress` -> `In Review` -> `Done`) with optimistic UI feedback.
  - Inspect exact citations in AI answers to verify architectural requirements directly at source passages.
- **Pain Points:**
  - AI "hallucinations" or vague answers that cost hours of debugging wrong assumptions.
  - Being locked out of regular task workflows when AI services fail.
  - Unclear whether a technical document is an active spec or an outdated draft.
- **Key Tasks in SACW:**
  - Move tasks on the Scrum Board; flag/unflag blockers with reason text.
  - Create Markdown docs (e.g., technical drafts, meeting notes).
  - Ask AI technical questions (e.g., "What is the token payload structure?") and click citation chips to open the exact version/passage in split-view.

---

### Persona 4: Maya — The Executive Stakeholder / Auditor
- **Archetype / Role:** Stakeholder / Read-only Auditor (`STAKEHOLDER_VIEWER`).
- **Background:** High-level project observer, sponsor, or client representative requiring visibility into progress and compliance without editing rights.
- **Goals:**
  - View Sprint progress and release scope at a glance.
  - Query the project knowledge base for high-level status and publicly documented decisions.
- **Pain Points:**
  - Overwhelmed by complex editing interfaces or accidentally editing board tickets.
  - Accessing confidential internal notes or draft items that were not meant for client exposure.
- **Key Tasks in SACW:**
  - View read-only Scrum Board and Sprint backlog.
  - Search documentation and ask AI general project questions.
  - Receive safe responses where restricted documents return indistinguishable 404 / no metadata (FR-59, SC-06).

---

## 3. High-Level User Journeys (Core Scenarios Trace)

See the centralized diagram: [editable Draw.io](../sdlc/diagrams/user-journey/core-user-journeys.drawio) · [Mermaid source](../sdlc/diagrams/user-journey/core-user-journeys.mmd).

Diagram ID: `DGM-JOURNEY-01`. Source content is preserved; see the [diagram review and open gaps](../sdlc/diagrams/README.md).

---

## 4. UI/UX Implications & Design Principles

1. **Permission-Aware UI Visibility:**
   - Controls that a persona cannot use (e.g., "Start Sprint" for Dev/Stakeholder, "Edit Classification" for Dev) must either be hidden or disabled with clear permission tooltips.
   - For restricted entities, the UI must display indistinguishable "Not Found" rather than "Access Denied" to prevent metadata leakage (FR-59).
2. **Citation-First AI UI:**
   - AI answers must never be plain chat bubbles. Every claim displays an interactive **Citation Chip** `[DocName vX #P]`.
   - Clicking a chip opens the source viewer pinned to the exact version and passage.
   - If AI cannot locate verified sources, it displays an **Insufficient Evidence** card rather than speculative text.
3. **Resilient Fallback (Human Work Continuity):**
   - Work management (Backlog, Board, Docs) is decoupled from the AI assistant. If the AI pipeline errors or is pending indexing, the UI shows a non-blocking toast/banner and work continues seamlessly.


**v0.2 documentation change:** Moved the inline diagram to the Stage 7 diagram directory, retaining its labels and relationships. Added an editable Draw.io representation; no policy or product scope is changed. Diagram consistency gaps are recorded in the central index.
