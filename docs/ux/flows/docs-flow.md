# User Flow: Knowledge Management (Docs & Versions)

**Artifact ID:** UX-FLOW-DOCS-02  
**Version/date:** 0.2 Draft · 9 October 2026  
**Trace:** BRD BR-05, BR-08, BR-10, BR-14; PRD-01 (FR-10–FR-15, FR-45–FR-49, SC-05, SC-06); SAD-03; ADR-0001  
**Scope:** Document authoring, draft revision, promotion to Current version, version obsolescence, and Restricted access management.

---

## 1. Flow Overview

Documents have immutable versions. The lifecycle states are:
- `Draft`: Working revision, excluded from ordinary search & RAG (only visible to author and doc editors).
- `Current`: Active official version included in RAG retrieval and citation indexing.
- `Superseded`: Former current version replaced by a newer version (kept for historical audit & comparison).
- `Archived`: Retired document version.

Restricted documents are subject to strict authorization (FR-04, FR-59).

---

## 2. Flow Diagram

See the centralized diagram: [editable Draw.io](../../sdlc/diagrams/flowchart/docs-flow.drawio) · [Mermaid source](../../sdlc/diagrams/flowchart/docs-flow.mmd).

Diagram ID: `DGM-FLOW-03`. Source content is preserved; see the [diagram review and open gaps](../../sdlc/diagrams/README.md).

---

## 3. Key UX & Data Rules

1. **Draft Isolation:**
   - A draft never appears in search results or AI context until explicitly published.
   - Distinct amber badge: `Draft (v2-draft)`.
2. **Superseded Warning Banner:**
   - When inspecting an older version, a high-contrast warning banner is displayed at the top:
     > ⚠️ **You are viewing a Superseded version (v1.0)**. The current active version is [v2.0]. Do not use this version for active development decisions.
3. **Restricted Document Safeguard:**
   - If an unauthorized user receives a shared link (`/p/1/docs/secret-security-spec`), the page renders the universal `404 Not Found` component, exactly as if the URL pointed to a non-existent route.


**v0.2 documentation change:** Moved the inline diagram to the Stage 7 diagram directory, retaining its labels and relationships. Added an editable Draw.io representation; no policy or product scope is changed. Diagram consistency gaps are recorded in the central index.
