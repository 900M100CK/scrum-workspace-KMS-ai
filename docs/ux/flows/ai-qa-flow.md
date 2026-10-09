# User Flow: AI Q&A, Citations & Fallback

**Artifact ID:** UX-FLOW-AI-03  
**Version/date:** 0.2 Draft · 9 October 2026  
**Trace:** BRD BR-06, BR-07, BR-08, BR-09, BR-10, BR-12, BR-13; PRD-01 (FR-16–FR-35, FR-50–FR-63, FR-69, SC-02, SC-07, SC-08); SAD-03; ADR-0001; ADR-0005  
**Scope:** Natural language query, permission-scoped RAG retrieval, citation verification chips, source passage viewer, insufficient evidence handling, and AI outage graceful fallback.

---

## 1. Flow Overview

The AI Assistant is an evidence-backed knowledge synthesizer:
- **No Hallucination Rule (BR-07, SC-07):** Answers must cite authoritative documents. If the corpus lacks conclusive evidence, the AI explicitly states `Insufficient Evidence`.
- **Permission Boundary (FR-04, SC-06):** Queries only retrieve documents the requester is authorized to see.
- **Exact Citation Chips (BR-08, SC-02):** Every factual statement includes an interactive chip `[Doc Title vX #P]`.
- **System Outage Fallback (BR-13, FR-33, FR-69, SC-08):** If the AI service or embedding provider is offline, the user is provided with immediate manual search and uninterrupted work management capabilities.

---

## 2. Flow Diagram

See the centralized diagram: [editable Draw.io](../../sdlc/diagrams/flowchart/ai-qa-flow.drawio) · [Mermaid source](../../sdlc/diagrams/flowchart/ai-qa-flow.mmd).

Diagram ID: `DGM-FLOW-01`. Source content is preserved; see the [diagram review and open gaps](../../sdlc/diagrams/README.md).

---

## 3. UI Components & States for AI Interactions

### 3.1 Answer Card Layout
```text
+--------------------------------------------------------------------------+
|  🤖 AI Assistant                                            [Dock] [✖]  |
+--------------------------------------------------------------------------+
|  Question: Why did we choose JWT over session cookies?                   |
+--------------------------------------------------------------------------+
|  Answer:                                                                 |
|  JWT was selected because the system uses minimal microservices with     |
|  stateless verification between the Workspace Service and Knowledge     |
|  Service [ADR-0001 v1.0 #p2], eliminating cross-service session lookup   |
|  bottlenecks [Architecture Spec v2.1 #p7].                               |
|                                                                          |
|  Sources:                                                                |
|  [📄 ADR-0001 (Protected Read Policy) v1.0 • Passage 2]                  |
|  [📄 Architecture Spec v2.1 • Passage 7]                                 |
|                                                                          |
|  Was this helpful? [ 👍 Yes ]  [ 👎 No ]                                |
+--------------------------------------------------------------------------+
```

### 3.2 Citation Passage Inspector (Side Panel / Split View)
When clicking `[📄 ADR-0001 v1.0 #p2]`:
- Slides open from the right.
- Displays document metadata:
  - Document Title: `ADR-0001: Protected Resource Read Policy`
  - Version: `v1.0 (Current)`
  - Classification: `Internal`
  - Highlighted Passage Box with yellow border:
    > *"Token verification is performed via public key at the gateway and services, allowing stateless authorization without frequent database queries..."*
- Action: `[ Open Full Document in Editor ]`

### 3.3 Insufficient Evidence State Card
```text
+--------------------------------------------------------------------------+
|  ℹ️ Insufficient Evidence                                                |
+--------------------------------------------------------------------------+
|  No authoritative records in your accessible documents answer:          |
|  "What is our deployment budget for AWS?"                                |
|                                                                          |
|  Possible reasons:                                                       |
|  • The topic has not been documented yet.                                |
|  • Relevant documents may be in 'Draft' state (Drafts are excluded).     |
|  • You do not have access to restricted documents on this topic.         |
|                                                                          |
|  [ Search by Keywords ]          [ ➕ Create New Document ]              |
+--------------------------------------------------------------------------+
```

### 3.4 Fallback State (AI Service Outage)
```text
+--------------------------------------------------------------------------+
|  ⚠️ AI Assistant Offline (Graceful Fallback Mode)                        |
+--------------------------------------------------------------------------+
|  The AI synthesis service is temporarily unavailable. Work management,   |
|  sprint boards, and document editing remain 100% active.                 |
|                                                                          |
|  Fallback Search:                                                        |
|  [ 🔍 Type exact keywords to search documents...            ] [ Search ] |
+--------------------------------------------------------------------------+
```


**v0.2 documentation change:** Moved the inline diagram to the Stage 7 diagram directory, retaining its labels and relationships. Added an editable Draw.io representation; no policy or product scope is changed. Diagram consistency gaps are recorded in the central index.
