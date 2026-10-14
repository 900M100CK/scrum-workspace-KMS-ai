# Technology Stack Specification

**Artifact ID:** TECH-STACK-01\
**Version/Date:** 1.0 · 14 October 2026\
**Status:** Approved Architectural Baseline & Implementation Blueprint\
**Context:** Solo 5-Month Capstone Project · Minimal Microservices Architecture\
**Inputs:** [BRD](../docs/BRD.md) v1.0, [PRD-01](../docs/sdlc/PRD_SRS.md) v0.5, [SAD-03](../docs/architecture.md) v0.7, [ADR-0002](../docs/adr/0002-minimal-microservices.md), [ADR-0003](../docs/adr/0003-student-stack.md), [ADR-0004](../docs/adr/0004-knowledge-store.md), [ADR-0005](../docs/adr/0005-ai-provider-pilot.md), [ADR-0006](../docs/adr/0006-permission-handoff-guard.md)

---

## 1. Executive Summary & Architectural Drivers

This document defines the unified technology stack for the Scrum Workspace & AI Project Knowledge Management System (KMS). Designed for a single-engineer, five-month capstone delivery, the stack balances rapid iteration and low cognitive switching overhead against strict enterprise-grade security and data integrity invariants.

### 1.1 Core Architectural Drivers & Stack Responses

| Architectural Driver | Core Requirement | Technical Stack Response |
| :--- | :--- | :--- |
| **D-1: Authorization Integrity** | Centralized project and document-level permission enforcement at hard boundaries; zero data leaks. | **Fastify + Workspace Authority:** In-process Protected Handoff Guard (ADR-0006 Mutex), dual-scope SQL filtering (`project_id` AND `document_id`), opaque HttpOnly session cookies, generic 404 responses. |
| **D-2: Evidence Fidelity & Exact Citations** | Unambiguous attribution to immutable text passages; zero unverifiable claims; whole-answer withholding on revocation. | **PostgreSQL 17 + pgvector 0.8.2:** Immutable document versioning, composite primary keys `[document_id, version_id, passage_id]`, buffered response validation before transport. |
| **D-3: AI Outage Fallback** | Core work management and permitted document discovery remain 100% operational when LLM provider is down. | **Native Full-Text Search (tsvector/GIN):** Decoupled English keyword search running directly in PostgreSQL, completely independent of external LLM services or embedding availability. |
| **D-4: Bounded Resource Footprint** | Local execution on standard workstation (4 cores, 8–16 GB RAM); zero distributed ops overhead. | **Unified TypeScript Monorepo:** Single language runtime (Node.js 24+), shared PostgreSQL database engine hosting two isolated logical databases, no Kubernetes/Kafka/Consul dependencies. |

---

## 2. Technology Stack Matrix

| Tier / Domain | Technology | Version / Distribution | Implementation Status | Justification / Role |
| :--- | :--- | :--- | :--- | :--- |
| **Language Runtime** | **Node.js** | `>= 24.0.0 LTS` | **Implemented** (harness & storage) | Native ESM, built-in test runner (`node --test`), high I/O throughput. |
| **Programming Language** | **TypeScript** | `5.6+` (Strict Mode) | **Proposed** (ADR-0003) | End-to-end type safety across UI, Gateway, and Knowledge services; shared contract interfaces. |
| **Relational Database** | **PostgreSQL** | `17.10` (Docker Bookworm) | **Implemented** (ADR-0004 v0.2) | ACID compliance, transactional migrations, advisory locks, robust row-level relational integrity. |
| **Vector Storage Extension** | **pgvector** | `0.8.2` | **Implemented** (ADR-0004 v0.2) | Dense vector storage and exact L2/Cosine/IP search in `knowledge_db`; eliminates dedicated vector DB cluster. |
| **Keyword Search** | **PostgreSQL FTS** | Native `tsvector` + GIN index | **Implemented** (ADR-0004 v0.2) | Zero-dependency, provider-independent keyword baseline ensuring AI outage continuity (FR-34). |
| **Database Migrations** | **Custom Runner** | Native Node.js ESM script | **Implemented** (`scripts/database.mjs`) | Zero-dependency transactional migrations with advisory locking, checksum drift detection, and reversibility. |
| **Backend Web Framework** | **Fastify** | `5.x` | **Proposed** (ADR-0003) | High-performance, low-overhead HTTP framework with first-class TypeScript support and JSON Schema validation. |
| **Frontend UI Framework** | **React** | `19.x` | **Proposed** (ADR-0003) | Component-driven UI for Scrum boards, document browser, and AI Q&A modal. |
| **Frontend Build Tool** | **Vite** | `6.x` | **Proposed** | Instant HMR, native ES module dev server, optimized static asset production build. |
| **Styling & Components** | **Tailwind CSS** | `3.4+` / `4.x` | **Proposed** | Utility-first styling; responsive layout; accessible design primitives; zero CSS bloat. |
| **API Contract Schema** | **OpenAPI** | `3.1.1` | **Implemented** (`contracts/openapi/`) | Formalized request/response validation, error mapping, and security schemes for Workspace & Knowledge services. |
| **AI Provider Abstraction** | **Custom Interface** | In-house TypeScript adapter | **Proposed** (ADR-0005) | Strict isolation from concrete SDKs (OpenAI / Gemini / Ollama); zero heavyweight runtime agent frameworks. |
| **AI Pilot Candidate (Cloud)** | **OpenAI / Gemini API** | `gpt-4o-mini` / `gemini-1.5-flash` | **Proposed** (ADR-0005 / OD-06) | Low-cost, fast inference for bounded 25-case Q&A evaluation. |
| **AI Pilot Candidate (Local)** | **Ollama / LM Studio** | `llama-3.2-3b` / `nomic-embed` | **Proposed** (ADR-0005 / OD-06) | Local zero-cost fallback if network or data privacy mandates offline execution. |
| **Testing Harness** | **Node.js Test Runner** | Built-in `node --test` | **Implemented** (`tests/`) | Blazing fast, zero npm dependencies, native TAP output, used for storage and contract verification. |
| **Containerization** | **Docker & Compose** | Docker 26+, Compose v2 | **Implemented** (`infra/postgres/`) | Reproducible local PostgreSQL + pgvector development and isolated ephemeral test containers. |

---

## 3. Tier-by-Tier Architectural Breakdown

```
+---------------------------------------------------------------------------------------+
|                                    Client Tier (Web UI)                               |
|   React 19 (TypeScript) + Vite 6 + Tailwind CSS                                       |
|   - Backlog & Sprint Kanban Board   - Knowledge Markdown Viewer/Editor   - AI Q&A Modal|
+-------------------------------------------+-------------------------------------------+
                                            | HTTPS / Port 8000 (Same-Origin)
                                            | Opaque Session Cookie + CSRF Token
                                            v
+---------------------------------------------------------------------------------------+
|                          Workspace Service (Gateway & Work Domain)                    |
|   Node.js 24 LTS + TypeScript 5.6 + Fastify 5.x                                       |
|   - Session Auth & CSRF Guard             - Authoritative Project & Document ACLs     |
|   - Scrum Work Management (Sprints/Tasks) - Protected Handoff Guard (Mutex ADR-0006)  |
+---------------------+-------------------------------------+---------------------------+
                      |                                     | Internal HTTP / Port 8001
                      | TCP 55432                           | Service Key + Actor Header
                      v                                     v
+------------------------------------+  +-----------------------------------------------+
|      workspace_db (PostgreSQL 17)  |  |           Knowledge Service (KMS & AI)        |
| - Sessions, Users, Memberships     |  |   Node.js 24 LTS + TypeScript 5.6 + Fastify   |
| - Document Policies & Capabilities |  | - Immutable Docs, Versions & Passages         |
| - Sprints, Tasks, Blocker Events   |  | - Hybrid Search: pgvector 0.8.2 + English FTS |
| - Workspace Business Audit Log     |  | - Citation Engine & Claim Verification        |
+------------------------------------+  +-----------------------+-----------------------+
                                                                | TCP 55432
                                                                v
                                        +-----------------------------------------------+
                                        |         knowledge_db (PostgreSQL 17 + pgvec)  |
                                        | - documents, document_versions, passages      |
                                        | - vector_embeddings (unconstrained vector)    |
                                        | - keyword_index (tsvector / GIN)              |
                                        | - execution_runs, provenance_records          |
                                        +-----------------------------------------------+
```

### 3.1 Persistence & Data Storage Layer (Implemented)

The storage foundation is fully containerized, tested, and operational under **ADR-0004 v0.2**.

1. **Database-per-Service Topology:**
   - Single PostgreSQL 17.10 engine running on `127.0.0.1:55432` (`infra/postgres/docker-compose.yml`).
   - Two distinct logical databases:
     - `workspace_db`: Dedicated schema owner `workspace_owner`, runtime application user `workspace_app`.
     - `knowledge_db`: Dedicated schema owner `knowledge_owner`, runtime application user `knowledge_app`.
   - **Isolation Invariant:** `workspace_app` has no connection rights to `knowledge_db`; `knowledge_app` has no connection rights to `workspace_db`. Public schema permissions are revoked. Zero cross-database SQL queries or foreign keys.
2. **Knowledge & Vector Storage:**
   - Image pinned by digest: `pgvector/pgvector:0.8.2-pg17-bookworm` (`sha256:feb68f4f...`).
   - `pgvector` extension installed strictly inside `knowledge_db`.
   - Passages store dense embeddings in an unconstrained `vector` column associated with an immutable `embedding_configuration` (recording model name, dimensions, distance metric `cosine`, `l2`, or `inner_product`).
3. **Keyword Discovery Engine:**
   - PostgreSQL English full-text search (`to_tsvector('english', content)` with GIN index).
   - Operates synchronously during passage ingestion; provides instantaneous, reliable text retrieval when the AI provider is offline.
4. **Dual-Scope SQL Security Invariant:**
   - The stored procedures `exact_search` and `keyword_search` require Workspace-supplied parameters: `p_project_id` and `p_document_ids UUID[]`.
   - Passages are pre-filtered against authorized documents and current lifecycle status (`is_current = true`, `is_available = true`) before distance ranking is calculated.

### 3.2 Backend Service Layer (Proposed - Fastify + TypeScript)

The backend runs as two discrete microservices communicating over loopback HTTP, as mandated by the project owner (ADR-0002):

1. **Workspace Service (Public Gateway & Scrum Authority):**
   - **Port:** `8000` (HTTPS public entry point).
   - **Responsibilities:**
     - Cookie session verification, CSRF token validation, rate limiting.
     - Project membership and authoritative Document Access Control Lists (ACLs).
     - Scrum work item lifecycle (Backlog, Sprint planning, Task state machine, Blocker audit log).
     - **Protected Handoff Guard (ADR-0006):** In-process mutex ensuring permission revocations take immediate effect by blocking concurrent AI provider transmissions and withholding buffered responses if access was revoked during synthesis.
2. **Knowledge Service (Private Knowledge & Retrieval Engine):**
   - **Port:** `8001` (Internal loopback only; blocked from public network).
   - **Responsibilities:**
     - Document ingestion, Markdown parsing, deterministic passage chunking.
     - Embedding generation and pgvector search indexing.
     - Hybrid candidate ranking (Reciprocal Rank Fusion - RRF).
     - Citation resolution: Binding claims strictly to immutable `[document_id, version_id, passage_id]` locators.
     - Provenance and knowledge audit event logging.
   - **Inter-Service Security:** Requires both `x-service-key` (shared internal secret) and `x-actor-session` (authoritative context forwarded from Gateway). Requests lacking either header are rejected with 401/403.

### 3.3 Frontend Web Application (Proposed - React + Vite)

The user interface is an accessible, modern Single Page Application (SPA):

1. **Framework & Architecture:** React 19 with TypeScript, utilizing functional components and React hooks for local state management.
2. **Build Toolchain:** Vite 6 providing instant dev startup, hot module replacement (HMR), and tree-shaken static production bundles.
3. **Deployment Mode:** Static build served directly by Fastify static file handler on Workspace Service (port 8000), guaranteeing same-origin security without CORS complexities. (During development, Vite dev server on port 3000 proxies API calls to port 8000).
4. **Key Feature Modules:**
   - *Scrum Board:* Interactive Kanban view supporting task state transitions (`todo` $\rightarrow$ `in_progress` $\rightarrow$ `blocked` $\rightarrow$ `done`), blocker declaration, and Sprint review.
   - *Knowledge Center:* Tree navigation of project documentation, split-screen Markdown preview/editor, version diff viewer (`Current` vs `Superseded`).
   - *Verifiable AI Assistant:* Modal Q&A drawer featuring non-streaming buffered answers, interactive citation badges linking to passage modal inspector, and explicit warning banners on provider degradation.

### 3.4 AI Integration & Retrieval-Augmented Generation (RAG) Pipeline

In alignment with **ADR-0005** and **PRD-01 §7**, the AI pipeline avoids heavyweight frameworks (LangChain, LlamaIndex, AutoGPT) in favor of a slim, transparent, provider-independent adapter:

1. **Provider-Agnostic Abstraction:**
   ```typescript
   export interface EmbeddingProvider {
     generateEmbedding(text: string, config: EmbeddingConfig): Promise<number[]>;
   }

   export interface GenerationProvider {
     generateAnswer(prompt: GuardedPrompt, config: GenerationConfig): Promise<GeneratedAnswer>;
   }
   ```
2. **RAG Workflow & Safety Pipeline:**
   - **Scope Resolution:** Gateway determines caller's accessible `project_id` and document IDs.
   - **Scoped Retrieval:** Knowledge Service executes pgvector exact search + PostgreSQL keyword search restricted to authorized document IDs and `is_current = true`.
   - **Prompt Sanitization:** Retrieved passages are packaged with server-assigned tags (`[SRC-1]`, `[SRC-2]`). Untrusted user documents are stripped of system prompt injection vectors.
   - **Mutex Acquisition:** Workspace acquires the project handoff guard, verifies caller grant validity, and dispatches payload to LLM.
   - **Generation & Buffering:** Model generates answer citing only `[SRC-x]` tags. Responses are fully buffered; token streaming to UI is prohibited.
   - **Revalidation & Withholding:** Before returning answer to UI, the guard re-verifies that **all** sources entering the context remain permitted. If any document was revoked mid-flight, the entire draft answer is withheld (`answer_withheld`), preventing data disclosure.
3. **AI Pilot Evaluation:**
   - Configuration selected via bounded pilot using 25 synthetic benchmark questions (`eval/research-cases.json`).
   - Evaluated against quality, latency (median / p95), and budget constraints.

---

## 4. Development, Testing & Verification Tooling

### 4.1 Native Context & Quality Harness

The repository features a dependency-free, high-speed verification harness built directly on Node.js built-ins:

- `npm run context:lint`: Node syntax and static structure validation.
- `npm run context:check`: Validates traceability between PRD requirements (68 FRs), MoSCoW release scope (60 Musts), OpenAPI operation IDs (55 endpoints), and implementation specs (SP-01 to SP-13).
- `npm run context:test`: Executes 28 unit negative tests verifying contract boundaries, citation locator invariants, and withholding rules.
- `npm run docs:lint` & `npm run docs:test`: Parses and verifies 8 diagram pairs (Mermaid `.mmd` and Draw.io `.drawio`), checking 144 nodes and 166 edges for topological consistency.
- `npm run db:test`: Spawns an isolated ephemeral PostgreSQL container to verify forward/reverse migrations, credential boundary enforcement, and pgvector search behavior (10 test assertions).

### 4.2 Monorepo Project Layout

```
scrum-workspace-KMS-ai/
├── apps/
│   └── web/                     # React 19 SPA (Vite + Tailwind CSS)
├── services/
│   ├── workspace/               # Workspace Service (Fastify, Gateway, Auth, Scrum)
│   │   ├── migrations/          # workspace_db SQL migrations (001-store, 002-registered-policy)
│   │   └── src/                 # Auth, Policy, Scrum domain, Relay mutex
│   └── knowledge/               # Knowledge Service (Fastify, Search, Retrieval, Provenance)
│       ├── migrations/          # knowledge_db SQL migrations (001-store, 002-current-revisions)
│       └── src/                 # Documents, Retrieval, Synthesis, Citation engine
├── contracts/                   # API & Data Contracts
│   ├── openapi/                 # OpenAPI 3.1.1 JSON schemas (workspace, knowledge)
│   └── data-model.json          # Logical entity schemas
├── specs/                       # Bounded functional specs (SP-01 to SP-13)
├── eval/                        # 25 evaluation reference cases & research corpus
├── infra/
│   └── postgres/                # Docker Compose setup for PostgreSQL 17 + pgvector
├── scripts/                     # Database migration & documentation validation scripts
└── tests/                       # Automated test suites (context, storage, docs)
```

---

## 5. Security Invariants & Compliance Mapping

1. **No Client-Asserted Authority:** Clients submit only opaque session cookies. Role, permissions, and actor IDs in request bodies are ignored or rejected.
2. **Generic 404 Error Equivalence:** Denied resources and non-existent resources return identical 404 payloads (`{ "code": "not_found", "message": "Resource unavailable" }`) to prevent resource existence enumeration.
3. **Database Privilege Separation:** Non-login schema owners manage tables; application users (`workspace_app`, `knowledge_app`) operate with minimal DML privileges (`SELECT`, `INSERT`, `UPDATE`). Truncation, schema alteration, and cross-database access are blocked at the engine level.
4. **Decoupled Fallback:** The application architecture guarantees that a total failure, rate limit, or timeout of the AI provider leaves Scrum project tracking and document browsing fully functional without data loss.

---

## 6. Implementation Roadmap & Milestones

| Phase | Milestone | Primary Tech Deliverables | Target Timeline |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Storage & Walking Skeleton** | PostgreSQL 17 + pgvector containerized; Fastify Workspace Gateway & Auth scaffold; session management. | Month 1 (Weeks 1–4) |
| **Phase 2** | **Scrum & Knowledge Base** | React Kanban UI; Task/Sprint CRUD; Document versioning & Markdown editor; PostgreSQL keyword search fallback. | Month 2 (Weeks 5–8) |
| **Phase 3** | **AI Retrieval & Citations** | pgvector integration; Hybrid RRF ranking; Protected Handoff Guard; Citation resolution modal; Provider pilot test. | Month 3 (Weeks 9–12) |
| **Phase 4** | **Hardening & 25-Case Eval** | Execution of 25 reference Q&A evaluation benchmark; audit trail & provenance inspector; UI polish. | Month 4 (Weeks 13–16) |
| **Phase 5** | **Verification & Packaging** | Full regression pass; performance profiling on workstation; final demo recording and documentation freeze. | Month 5 (Weeks 17–20) |
