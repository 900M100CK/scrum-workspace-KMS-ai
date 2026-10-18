# Technology Stack Specification

**Artifact ID:** TECH-STACK-01\
**Version/Date:** 1.3 · 17 October 2026\
**Status:** Draft candidate stack; only the ADR-0004 storage foundation is implemented\
**Context:** Solo 5-Month Capstone Project · Minimal Microservices Architecture\
**Inputs:** [BRD](../docs/BRD.md) v1.0, [PRD-01](../docs/sdlc/PRD_SRS.md) v0.8, [SAD-03](../docs/architecture.md) v0.11, [ADR-0002](../docs/adr/0002-minimal-microservices.md), [ADR-0003](../docs/adr/0003-student-stack.md), [ADR-0004](../docs/adr/0004-knowledge-store.md), [ADR-0005](../docs/adr/0005-ai-provider-pilot.md), [ADR-0006](../docs/adr/0006-permission-handoff-guard.md)

---

## 1. Executive Summary & Architectural Drivers

This document defines the unified technology stack for the Scrum Workspace & AI Project Knowledge Management System (KMS). Designed for a single-engineer, five-month capstone delivery, the stack balances rapid iteration and low cognitive switching overhead against the project permission, evidence and data integrity requirements; application enforcement is not implemented.

### 1.1 Core Architectural Drivers & Stack Responses

| Architectural Driver | Core Requirement | Technical Stack Response |
| :--- | :--- | :--- |
| **D-1: Authorization Integrity** | Centralized project and document-level permission enforcement at hard boundaries; deny unknown access; verify disclosure boundaries with runtime tests. | **Fastify + Workspace Authority:** In-process Protected Handoff Guard (ADR-0006 Mutex), dual-scope SQL filtering (`project_id` AND `document_id`), opaque HttpOnly session cookies, generic 404 responses. |
| **D-2: Evidence Fidelity & Exact Citations** | Unambiguous attribution to immutable text passages; evaluate claim support separately from locator validation; whole-answer withholding on revocation. | **PostgreSQL 17 + pgvector 0.8.2:** Immutable document versioning, composite primary keys `[document_id, version_id, passage_id]`, buffered response validation before transport. |
| **D-3: AI Outage Fallback** | Core work management and permitted document discovery must remain usable during provider failure while their own dependencies are healthy. | **Native Full-Text Search (tsvector/GIN):** Decoupled English keyword search running directly in PostgreSQL, completely independent of external LLM services or embedding availability. |
| **D-4: Bounded Resource Footprint** | Local deployment candidate; hardware, load and operational capacity remain unmeasured (OD-06). | **Unified TypeScript Monorepo:** Single language runtime (Node.js 24+), shared PostgreSQL database engine hosting two isolated logical databases, no Kubernetes/Kafka/Consul dependencies. |

---

## 2. Technology Stack Matrix

### Verified update candidates — 17 October 2026

These are documentation recommendations for the next implementation slice, not installed application dependencies. The existing lockfile and storage image remain the reproducible implementation baseline. An official release being available does not establish compatibility with this project.

| Component | Official evidence checked today | Project recommendation and adoption gate |
| --- | --- | --- |
| Node.js | [Release schedule](https://github.com/nodejs/Release/blob/main/README.md) identifies the 24 LTS line. | Keep Node 24 LTS as the working baseline; portable 24.21.0 has local harness evidence. The `>=24` engine declaration is not a claim that every newer major is tested. |
| TypeScript | [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) documents the native compiler and missing programmatic compiler API in 7.0. | Evaluate 7.0 for CLI type checking. If lint/code-generation tools need the older compiler API, use the documented TypeScript 6 compatibility approach or retain 6 until the toolchain passes. Do not copy upstream speedup numbers into project claims. |
| React | [Official versions](https://react.dev/versions) lists 19.3 as the latest version at review time. | React 19.3 is the SPA candidate; pin matching React/React DOM and compatible types at scaffolding. No SSR/server-components scope is added. |
| Vite | [Supported releases](https://vite.dev/releases#supported-versions) lists 8.3 for regular patches, with older supported minors receiving different maintenance levels. [Getting started](https://vite.dev/guide/) documents Node and template requirements. | Evaluate Vite 8.3 on Node 24 with a compatible React plugin; pin exact patches and verify development startup, production build and preview before adoption. |
| Fastify | [LTS policy](https://fastify.dev/docs/latest/Reference/LTS/) lists v5 with no end date set; its table is not a project plugin compatibility matrix. | Keep supported Fastify 5 as the candidate. Verify exact framework/plugin versions on Node 24, including cookies/session, CSRF, static files and request/response validation. Do not claim a framework support guarantee from the old Node columns. |
| Tailwind CSS | [Compatibility documentation](https://tailwindcss.com/docs/compatibility) gives v4 browser minimums: Chrome 111, Safari 16.4, Firefox 128. | Prefer v4 only if OD-06's target browsers fit. Keyboard access, focus, contrast and screen-reader behavior require separate checks. |
| PostgreSQL | [Version policy](https://www.postgresql.org/support/versioning/) lists supported 17.11 and 18.6 at review time; it distinguishes minor maintenance from major migration. | The implemented baseline remains 17.10. Assess a 17.11 image/digest update first, in an isolated database with migration, privilege, immutable-evidence and search tests plus restore rehearsal. PostgreSQL 18 is an optional later major-upgrade assessment, not an assumed prerequisite. |
| pgvector | The repository's pinned 0.8.2 baseline is documented in [ADR-0004](adr/0004-knowledge-store.md). | Preserve that extension and exact scoped search while assessing a PostgreSQL patch update. Approximate indexes and fusion remain unselected; newer database binaries do not select an embedding model or a similarity threshold. |

AI configuration remains a separate pilot decision. Record the exact generation model/version and embedding artifact/digest, dimensions, distance metric, supported API/SDK versions, availability/deprecation check date, authorised data transfer, usage limit and fallback behavior. Changing embedding identity creates a new configuration and reindexing work; do not mix vectors across configurations. A retired model must produce explicit unavailability, not silent substitution. Local inference still needs hardware and quality measurements.

### Implementation and candidate inventory

| Tier / Domain | Technology | Version / Distribution | Implementation Status | Justification / Role |
| :--- | :--- | :--- | :--- | :--- |
| **Language Runtime** | **Node.js** | `>=24` (repository requirement) | **Implemented** (harness & storage) | Native ESM, built-in test runner (`node --test`), high I/O throughput. |
| **Programming Language** | **TypeScript** | 7.0 candidate; strict mode; verify compiler/tool compatibility | **Proposed** (ADR-0003) | End-to-end type safety across UI, Gateway, and Knowledge services; shared contract interfaces. |
| **Relational Database** | **PostgreSQL** | `17.10` (Docker Bookworm) | **Implemented** (ADR-0004 v0.2) | ACID compliance, transactional migrations, advisory locks, robust row-level relational integrity. |
| **Vector Storage Extension** | **pgvector** | `0.8.2` | **Implemented** (ADR-0004 v0.2) | Dense vector storage and exact L2/Cosine/IP search in `knowledge_db`; eliminates dedicated vector DB cluster. |
| **Keyword Search** | **PostgreSQL FTS** | Native `tsvector` + GIN index | **Implemented** (ADR-0004 v0.2) | Zero-dependency, provider-independent keyword baseline ensuring AI outage continuity (FR-34). |
| **Database Migrations** | **Custom Runner** | Native Node.js ESM script | **Implemented** (`scripts/database.mjs`) | Zero-dependency transactional migrations with advisory locking, checksum drift detection, and reversibility. |
| **Backend Web Framework** | **Fastify** | `5.x` | **Proposed** (ADR-0003) | High-performance, low-overhead HTTP framework with first-class TypeScript support and JSON Schema validation. |
| **Frontend UI Framework** | **React** | `19.3` candidate | **Proposed** (ADR-0003) | Component-driven UI for Scrum boards, document browser, and AI Q&A modal. |
| **Frontend Build Tool** | **Vite** | 8.3 candidate; pin exact tested patch | **Proposed** | Instant HMR, native ES module dev server, optimized static asset production build. |
| **Styling & Components** | **Tailwind CSS** | 4.x candidate; browser baseline must fit | **Proposed** | Utility-first styling; responsive layout; styling utilities; semantic controls, keyboard behavior and accessibility still require implementation/testing. |
| **API Contract Schema** | **OpenAPI** | `3.1.1` | **Draft specification** (`contracts/openapi/`); no handler conformance evidence | Formalized request/response validation, error mapping, and security schemes for Workspace & Knowledge services. |
| **AI Provider Abstraction** | **Custom Interface** | In-house TypeScript adapter | **Proposed** (ADR-0005) | Strict isolation from concrete SDKs (OpenAI / Gemini / Ollama); zero heavyweight runtime agent frameworks. |
| **AI Pilot Candidate (Cloud)** | **OpenAI / Gemini API** | Exact model/version unselected; check availability before pilot | **Proposed** (ADR-0005 / OD-06) | Measure quality, latency and cost on synthetic pilot cases; no model recommendation or entitlement is implied. |
| **AI Pilot Candidate (Local)** | **Ollama / LM Studio** | Model and embedding artifact/digest unselected | **Proposed** (ADR-0005 / OD-06) | Optional local candidate; measure hardware fit, quality and operating cost. Keyword search is the required AI-outage fallback. |
| **Testing Harness** | **Node.js Test Runner** | Built-in `node --test` | **Implemented** (`tests/`) | Blazing fast, zero npm dependencies, native TAP output, used for storage integration and context/contract structure checks; consumer-provider behavior remains untested. |
| **Containerization** | **Docker & Compose** | Docker with Linux containers and Compose v2; verify installed versions | **Implemented** (`infra/postgres/`) | Reproducible local PostgreSQL + pgvector development and isolated ephemeral test containers. |

---

## 3. Tier-by-Tier Architectural Breakdown

```
+---------------------------------------------------------------------------------------+
|                                    Client Tier (Web UI)                               |
|   React candidate + TypeScript + Vite candidate + Tailwind CSS                                       |
|   - Backlog & Sprint Kanban Board   - Knowledge Markdown Viewer/Editor   - AI Q&A Modal|
+-------------------------------------------+-------------------------------------------+
                                            | HTTPS / Port 8000 (Same-Origin)
                                            | Opaque Session Cookie + CSRF Token
                                            v
+---------------------------------------------------------------------------------------+
|                          Workspace Service (Gateway & Work Domain)                    |
|   Node.js 24 LTS + TypeScript candidate + Fastify 5.x                                       |
|   - Session Auth & CSRF Guard             - Authoritative Project & Document ACLs     |
|   - Scrum Work Management (Sprints/Tasks) - Protected Handoff Guard (Mutex ADR-0006)  |
+---------------------+-------------------------------------+---------------------------+
                      |                                     | Internal HTTP / Port 8001
                      | TCP 55432                           | Service Key + Actor Header
                      v                                     v
+------------------------------------+  +-----------------------------------------------+
|      workspace_db (PostgreSQL 17)  |  |           Knowledge Service (KMS & AI)        |
| - Sessions, Users, Memberships     |  |   Node.js 24 LTS + TypeScript candidate + Fastify   |
| - Document Policies & Capabilities |  | - Immutable Docs, Versions & Passages         |
| - Sprints, Tasks, Blocker Events   |  | - Separate English FTS and pgvector paths     |
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

The storage foundation has historical integration evidence under **ADR-0004 v0.2**. This document does not assert that a local container is currently running. The diagram above is a proposed deployment view, not an inventory of implemented handlers or exact SQL column names.

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
   - PostgreSQL English full-text search (GIN) — independent keyword path; separate from pgvector exact discovery for AI.
   - Uses committed permitted Current passages without an AI provider call. Availability depends on Knowledge, storage and authority; relevance and latency remain unmeasured.
4. **Dual-Scope SQL Security Invariant:**
   - The stored procedures `exact_search` and `keyword_search` require Workspace-supplied parameters: `p_project_id` and `p_document_ids UUID[]`.
   - Passages are pre-filtered against authorized documents and current lifecycle status (Current status, document availability, current-version pointer and indexing readiness) before distance ranking is calculated.

### 3.2 Backend Service Layer (Proposed - Fastify + TypeScript)

The backend runs as two discrete microservices communicating over loopback HTTP, as mandated by the project owner (ADR-0002):

1. **Workspace Service (Public Gateway & Scrum Authority):**
   - **Port:** `8000` (HTTPS public entry point).
   - **Responsibilities:**
     - Cookie session verification, CSRF token validation, rate limiting.
     - Project membership and authoritative Document Access Control Lists (ACLs).
     - Scrum work item lifecycle (Backlog, Sprint planning, Task state machine, Blocker audit log).
     - **Protected Handoff Guard (ADR-0006):** Proposed single-authority guard serialising final validation and protected transport with mutations. Revocation commits after prior handoffs finish or abort; already sent bytes cannot be recalled. Generation waiting is outside the guard. See ADR-0006 and OWNER-Q-01; runtime verification is pending.
2. **Knowledge Service (Private Knowledge & Retrieval Engine):**
   - **Port:** `8001` (Internal loopback only; blocked from public network).
   - **Responsibilities:**
     - Document ingestion, Markdown parsing, deterministic passage chunking.
     - Embedding generation and pgvector search indexing.
     - Independent scoped English full-text keyword and pgvector exact discovery paths. Fusion, including Reciprocal Rank Fusion (RRF), remains unselected and would require pilot evidence and a separate ADR.
     - Citation resolution: Binding claims strictly to immutable `[document_id, version_id, passage_id]` locators.
     - Provenance and knowledge audit event logging.
   - **Inter-Service Security:** Requires both `x-service-key` (shared internal secret) and `x-actor-session` (authoritative context forwarded from Gateway). Requests lacking either header are rejected with 401/403.

### 3.3 Frontend Web Application (Proposed - React + Vite)

The user interface is an accessible, modern Single Page Application (SPA):

1. **Framework & Architecture:** React 19.3 candidate with TypeScript, utilizing functional components and React hooks for local state management.
2. **Build Toolchain:** Vite candidate with a supported release pinned and tested during scaffolding; no application toolchain is installed.
3. **Deployment Mode:** Static build served directly by Fastify static file handler on Workspace Service (port 8000), supporting same-origin requests; session, CSRF and response authorization still require implementation and testing. (During development, Vite dev server on port 3000 proxies API calls to port 8000).
4. **Key Feature Modules:**
   - *Scrum Board:* Interactive Kanban view supporting task state transitions (To Do, In Progress, Done, including direct transitions and reopening under ADR-0008; Blocked derives from ordered blocker events and is not a fourth column), blocker declaration, and Sprint review.
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
   - **Scoped Retrieval:** Knowledge Service executes pgvector exact search + PostgreSQL keyword search restricted to authorized document IDs and the Current-version eligibility checks.
   - **Prompt Sanitization:** Retrieved passages are packaged with server-assigned tags (`[SRC-1]`, `[SRC-2]`). Retrieved text remains untrusted data. Delimit it, keep runtime AI read-only, enforce server-side permissions and validate outputs; sanitization does not guarantee removal of prompt injection.
   - **Immutable manifest and guarded handoff:** Persist the complete immutable per-handoff manifest outside the guard. Acquire the guard, revalidate session, full evidence access, lifecycle/observation revisions and exact payload/manifest binding, then hold it through transport completion or abort. A mismatch sends no bytes; release and prepare a fresh record for a bounded retry. Generation waiting is outside the guard (OWNER-Q-01 / ADR-0012).
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
- `npm run context:check`: Validates traceability between PRD requirements (69 active FRs plus withdrawn FR-45), MoSCoW release scope (60 Musts), OpenAPI operation IDs (56 operations), and implementation specs (SP-01 to SP-13).
- `npm run context:test`: Executes 31 context tests verifying contract boundaries, citation locator invariants, and withholding rules.
- `npm run docs:lint` & `npm run docs:test`: Parses and verifies 9 diagram pairs (Mermaid `.mmd` and Draw.io `.drawio`), checking 172 nodes and 207 relations for topological consistency.
- `npm run db:test`: Spawns an isolated ephemeral PostgreSQL container to verify forward/reverse migrations, credential boundary enforcement, and pgvector search behavior (historically nine scenarios and 10 Node results including the parent; not rerun in this documentation refresh).

Counts above describe the 17 October working-tree checks, not application results. Documentation checks require the lockfile dependencies; only context scripts are dependency-free.

### 4.2 Monorepo Project Layout

The tree combines existing folders with proposed service `src/` folders. No application server or UI has been implemented.

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
4. **Decoupled Fallback:** The design requires work, document and keyword paths to remain usable during provider failure while their own dependencies are healthy. Runtime outage tests remain unrun.

---

## 6. Implementation Roadmap & Milestones

| Phase | Milestone | Primary Tech Deliverables | Target Timeline |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Storage & Walking Skeleton** | PostgreSQL 17 + pgvector containerized; Fastify Workspace Gateway & Auth scaffold; session management. | Month 1 (Weeks 1–4) |
| **Phase 2** | **Scrum & Knowledge Base** | React Kanban UI; Task/Sprint CRUD; Document versioning & Markdown editor; PostgreSQL keyword search fallback. | Month 2 (Weeks 5–8) |
| **Phase 3** | **AI Retrieval & Citations** | pgvector exact discovery; PostgreSQL English full-text search (GIN) — independent keyword path; Protected Handoff Guard; Citation resolution modal; Provider pilot test. Fusion/RRF remains unselected. | Month 3 (Weeks 9–12) |
| **Phase 4** | **Hardening & 25-Case Eval** | Execution of 25 reference Q&A evaluation benchmark; audit trail & provenance inspector; UI polish. | Month 4 (Weeks 13–16) |
| **Phase 5** | **Verification & Packaging** | Full regression pass; performance profiling on workstation; final demo recording and documentation freeze. | Month 5 (Weeks 17–20) |

**v1.1 search-path correction — 16 October 2026:** The implemented storage baseline is PostgreSQL English full-text search (GIN) — independent keyword path — alongside separate pgvector exact discovery. Fusion/RRF remains unselected pending pilot evidence and a separate ADR. Application framework and provider choices remain candidate designs; this document does not confer approval or runtime evidence.


**v1.2 freshness review — 17 October 2026:** Corrected current harness counts, board states, handoff ordering and unsupported guarantees without selecting a framework or provider. Google records `gemini-1.5-flash` shutdown on 29 September 2025 in its [official changelog](https://ai.google.dev/gemini-api/docs/changelog#september-29-2025). The [Vite support policy](https://vite.dev/releases#supported-versions), checked 17 October 2026, distinguishes supported minor lines; a broad `6.x` candidate is not a current compatibility decision. Recheck model lifecycle, supported versions, Node compatibility and data terms at the actual pilot/scaffolding date. Checklist: Pass for these source corrections; Gap for framework selection, runtime/security evidence and pilot. Handoff: ADR-0003/0005 and OD-06/12 still govern selection.
