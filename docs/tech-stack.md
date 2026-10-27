# Technology Stack Specification

**Artifact ID:** TECH-STACK-01\
**Version/Date:** 1.5 · 26 October 2026\
**Status:** Draft application candidates; existing storage/harness and synthetic UI preview are distinct from unimplemented live application handlers\
**Context:** Solo 5-Month Capstone Project · Minimal Microservices Architecture\
**Inputs:** [BRD](../docs/BRD.md) v1.0, [PRD-01](../docs/sdlc/PRD_SRS.md) v0.9, [SAD-03](../docs/architecture.md) v0.16, [ADR-0002](adr/0002-minimal-microservices.md), [ADR-0003](adr/0003-student-stack.md), [ADR-0004](adr/0004-knowledge-store.md), [ADR-0005](adr/0005-ai-provider-pilot.md), [ADR-0006](adr/0006-permission-handoff-guard.md), [ADR-0008](adr/0008-fixed-sprint-lifecycle.md), [ADR-0012](adr/0012-audit-visibility-and-durable-evidence.md), [OWNER-Q-01](planning/owner-decisions-2026-10-16.md), Proposed ADR-0018–ADR-0023; current package/lockfiles and [preview guide](../apps/web/README.md)

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

### Official-source freshness check — 26 October 2026

Observed upstream versions are not installed versions or tested compatibility. The working-tree lockfile and pinned storage image stay unchanged. Recommendations below are engineering proposals for existing slices, not owner acceptance. Recheck exact patches, plugins, image digests and data terms at scaffolding or upgrade time.

| Component | Official observation on 26 October 2026 | Project action / adoption gate |
| --- | --- | --- |
| Node.js | [24.22.1 release](https://nodejs.org/en/blog/release/v24.22.1) is a security release; the [schedule](https://github.com/nodejs/Release) retains the 24 LTS line. | Keep supported Node 24 LTS and prefer its verified patched runtime. Record actual local runtime separately; do not change major solely because it is newer. |
| TypeScript | [7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) confirms the stable native CLI, no compiler API in 7.0 and a 6.0 compatibility path. The [official blog](https://devblogs.microsoft.com/typescript/) lists 7.1 Beta, not stable. | 7.0 remains a candidate; 6.0 is an alternative where tools need its API. Pick the simplest tested compiler/lint/codegen set; no beta or dual-compiler setup without demonstrated need. |
| React | [Official versions](https://react.dev/versions) lists 19.3.0. | Still a production SPA candidate. The current plain-JS preview is not React 19; preserve its design/behaviour. Root tooling dependencies do not select the application framework. |
| Vite | [Support policy](https://vite.dev/releases#supported-versions) lists 8.3 for regular fixes. The [guide](https://vite.dev/guide/) documents runtime/browser/tooling requirements. | Evaluate a pinned supported 8.3 patch with the selected React/plugin/compiler set. Verify dev startup, build and served output; the current preview needs no Vite installation. |
| Fastify | [LTS policy](https://fastify.dev/docs/latest/Reference/LTS/) retains v5 with end date TBD. | Keep v5 as a candidate. Test exact cookie/session/CSRF/static/schema plugins on the actual Node patch; upstream support is not project compatibility evidence. |
| Tailwind CSS | [Compatibility](https://tailwindcss.com/docs/compatibility) documents v4 modern-browser requirements. | Optional styling candidate; the existing CSS/token system already works. Decide target browsers before adoption; test focus, contrast and keyboard behaviour separately. |
| PostgreSQL | [Version policy](https://www.postgresql.org/support/versioning/) lists 17.11 as current minor on supported 17; 18.6 is another supported major. [Release notes](https://www.postgresql.org/about/news/postgresql-186-1711-1615-1519-1424-and-19-beta-3-released-3365/) include security fixes and extra upgrade considerations. | Baseline stays 17.10. Prioritise isolated patch-image assessment, backup/restore and migration/privilege/search checks. Do not silently change the pinned image or require a major migration. |
| pgvector | [Maintainer changelog](https://raw.githubusercontent.com/pgvector/pgvector/master/CHANGELOG.md) lists 0.8.7 (1 October 2026); 0.9.0 is unreleased. | Baseline stays 0.8.2. Assess a compatible 0.8.7 image/extension upgrade with PostgreSQL patch work. Index-build fixes do not prove this exact-search deployment is affected; an upgrade does not select ANN. |
| Application DB client | [node-postgres transactions](https://node-postgres.com/features/transactions) and [pooling](https://node-postgres.com/features/pooling) document explicit client ownership. | `pg` with explicit SQL is a small candidate, not installed/adopted. D-01 must choose driver, service-owned bounded pools, bigint handling, errors and transaction boundaries; an ORM is not required. |
| OpenAPI/runtime schema | [OAS 3.1.1](https://spec.openapis.org/oas/v3.1.1.html#schema-object) defines the existing contract dialect; [Fastify validation examples](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/) use Draft 7. | Keep repo OpenAPI 3.1.1. Prove validator/serializer dialect compatibility or explicit adaptation; generated TypeScript types alone do not enforce HTTP semantics. |

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
| **Testing Harness** | **Node.js Test Runner** | Built-in `node --test` | **Implemented** (`tests/`) | Built-in runner; context checks are dependency-free, while docs/contract/UI suites require installed dependencies. Storage/scaffold results do not prove consumer-provider handler behaviour. |
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
   - Single PostgreSQL 17.10 engine configured at `127.0.0.1:55432` ([infra/postgres/compose.yaml](../infra/postgres/compose.yaml); see the [storage runbook](../infra/postgres/README.md)). This is configuration, not a current running-container observation.
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

The implemented UI is the [plain-JS synthetic preview](../apps/web/README.md), served by its Node preview script. Its soft-green tokens, typography, amber blockers, separate terracotta error convention and interaction tests are existing work. It has no live authentication/API persistence. The proposed application SPA below is not installed or selected; adopting it must preserve the existing UI behaviour and visual direction:

1. **Framework & Architecture:** React 19.3 candidate with TypeScript, utilizing functional components and React hooks for local state management.
2. **Build Toolchain:** Vite candidate with a supported release pinned and tested during scaffolding; no application toolchain is installed.
3. **Deployment Mode:** Static build served directly by Fastify static file handler on Workspace Service (port 8000), supporting same-origin requests; session, CSRF and response authorization still require implementation and testing. (During development, Vite dev server on port 3000 proxies API calls to port 8000).
4. **Key Feature Modules:**
   - *Scrum Board:* Interactive Kanban view supporting task state transitions (To Do, In Progress, Done, including direct transitions and reopening under ADR-0008; Blocked derives from ordered blocker events and is not a fourth column), blocker declaration, and Sprint review.
   - *Knowledge Center:* Project documentation navigation, Markdown preview/editor and exact version/history inspection (`Current` vs `Superseded`, explicitly labelled). No advanced diff feature is implied.
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

### 4.1 Harness and evidence boundaries

Use current scripts in [package.json](../package.json). The context harness uses Node built-ins; documentation/contract/UI checks have dependency requirements. The following retained counts are a **historical 17 October snapshot**, not current results:

- `npm run context:lint`: Node syntax and static structure validation.
- `npm run context:check`: Validates traceability between PRD requirements (69 active FRs plus withdrawn FR-45), MoSCoW release scope (60 Musts), OpenAPI operation IDs (56 operations), and implementation specs (SP-01 to SP-13).
- `npm run context:test`: Executes 31 context tests verifying contract boundaries, citation locator invariants, and withholding rules.
- `npm run docs:lint` & `npm run docs:test`: Parses and verifies 9 diagram pairs (Mermaid `.mmd` and Draw.io `.drawio`), checking 172 nodes and 207 relations for topological consistency.
- `npm run db:test`: Spawns an isolated ephemeral PostgreSQL container to verify forward/reverse migrations, credential boundary enforcement, and pgvector search behavior (historically nine scenarios and 10 Node results including the parent; not rerun in this documentation refresh).

Counts above describe the 17 October working-tree checks, not application results. Documentation checks require the lockfile dependencies; only context scripts are dependency-free.

### 4.2 Monorepo Project Layout

The tree contains an implemented synthetic UI preview and storage foundation. Application service handlers and the production web toolchain remain unimplemented/Proposed. The descriptions below distinguish these states; they do not authorise framework installation.

```
scrum-workspace-KMS-ai/
├── apps/
│   └── web/                     # Existing plain-JS preview; React/Vite application Proposed
├── services/
│   ├── workspace/               # Owned storage; Fastify service handlers Proposed
│   │   ├── migrations/          # Owned SQL; runbook distinguishes applied/isolated evidence
│   │   └── src/                 # Auth, Policy, Scrum domain, Relay mutex
│   └── knowledge/               # Owned storage; application handlers Proposed
│       ├── migrations/          # Owned SQL; runbook distinguishes applied/isolated evidence
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

## Source metadata reconciliation — 25 October 2026

Version 1.4 refreshes PRD and architecture input labels after the bounded editorial corrections. This is not a technology lifecycle recheck, framework/provider selection or runtime compatibility result. Existing dated external-source observations remain historical; recheck them at selection time.

## 7. Algorithms and data structures for existing slices

These are implementation recommendations and descriptions of existing storage primitives, not new scope, schema changes or accepted architecture decisions. They unblock concrete work/spec briefs. Reuse owned SQL and contracts; measure before adding dependencies or indexes. Application implementations remain unverified.

| Need / trace | Structure and algorithm | Status and meaningful verification |
| --- | --- | --- |
| Complete Backlog reorder — SP-03/05, FR-05/41 | Ordered ID array plus Set-based duplicate/membership checks; validate a complete permutation against one Backlog generation, then persist positions in the owning transaction. Expected linear validation work/memory with ordinary hash sets. | Handler technique Proposed; persisted order/index foundation exists. Reject duplicate, omitted, foreign or stale IDs; test competing reorder and reload. No linked-list, CRDT or fractional-position schema is selected. |
| Sprint/task transitions — SP-04/05, FR-07/08/09/42 | Small transition table/state machine plus existing partial-unique constraints and serialized transaction. Keep direct task moves, special Completed-Sprint reopen and latest blocker-event sequence. | Business rules recorded; handlers pending. Enumerate permitted/forbidden transitions and controlled lifecycle races. [Partial unique indexes](https://www.postgresql.org/docs/17/indexes-partial.html) support subset invariants, not action authority. |
| Paged lists — SP-02/03/05/06/07 | Contract-defined cursor with stable sort tuple and identity tie-breaker; retain scope/generation binding and reject stale pages. Compare bigint revisions exactly, never via rounded Number. | Detailed read projections remain Proposed. [PostgreSQL LIMIT guidance](https://www.postgresql.org/docs/17/queries-limit.html) explains deterministic ordering and large-offset cost. Preserve cursor wire format; test changes between pages and scope loss. |
| English keyword retrieval — SP-08, FR-18/20/34/63 | Existing English tsvector/GIN inverted index, plainto_tsquery/ts_rank and deterministic locator tie-break. | Implemented SQL baseline; handler permissions pending. [Text-search index documentation](https://www.postgresql.org/docs/17/textsearch-indexes.html) explains GIN. Test exact terms, inflection, Current/history, empty and authority failure. FTS is not BM25 or fuzzy matching. |
| Semantic discovery — SP-09, FR-21/53 | Existing exact distance ranking over eligible vectors for one embedding configuration; immutable passage identity and stable tie-breaks. Distance work grows with eligible passages and dimensions; no universal latency claim. | Keep exact search as the recall reference; collect query plans, latency and eligible-source discovery. [pgvector](https://github.com/pgvector/pgvector#querying) documents exact/approximate options. SQL existence is not permission-aware handler evidence. |
| Evidence/citation binding — SP-09/10/11, FR-22/25/26/28/29/57/60 | Request-local Map from server source ID to typed evidence and Set for duplicate/conflicting locators. Retain the complete ordered evidence array, including uncited context, and existing exact-byte manifest/digest binding. | Proposed handler technique for retained guarantees. Test invented IDs, duplicate mapping, mixed evidence, changed observations and byte tampering. Lookup/digest success proves neither access nor claim support; no raw content in unrestricted logs. |
| Retry/index work — SP-06/07/11, FR-10/14/31/61 | Durable operation-identity record with payload binding; revision/generation-checked work items and bounded retry. An in-memory Set is not durable replay protection. | Storage/reference prerequisites exist; handlers pending. Audit/replay commit with business state; stale jobs cannot revive evidence. Protected one-use claims follow their non-replay rules, not general expiring request keys. |
| Exact text passages — SP-06/07/09, FR-11/12/19/46 | Proposed deterministic Markdown/block-aware splitting with immutable version/passage records and an explicit locator into stored source. Record splitter/configuration identity; preserve exact excerpts and Unicode boundaries. | Parser, chunk size/overlap and token budget remain implementation/pilot choices. Test headings, code fences, long blocks, non-ASCII bytes, old locators and replacement. No universal chunk size is selected. |
| Manual links — SP-08, FR-16/17 | Existing relational edge records and indexed endpoint lookups; query authorised neighbouring links. | Reuse the link schema and endpoint rights. Test denial on either endpoint and no hidden metadata. No graph database, BFS product feature or automatic link inference is required. |
| Evaluation — SP-12, NFR-07/08/09 | Scenario/configuration-keyed result records, frozen expected-source sets and claim-level rubric records. Keep suite/scenario/case/config identity; aggregate eligible denominators and actual measurements only. | Runner implementation precedes pilot. Test C0/C1/C2 isolation, scenario materialisation, missing metrics and repeatability. Retrieval ranks, locator validity and claim support are separate measurements. |

### 7.1 Optional experiments require evidence

HNSW/IVFFlat remain unselected approximate-index candidates only if scoped exact-search measurements miss an agreed target. Require recall against exact results on the same corpus/access scope, filter behaviour, build/update cost and revocation/lifecycle regression; inspect actual query plans. Upgrading pgvector does not adopt them.

Rank fusion (including RRF), reranking, MMR, trigram search and BM25 extensions remain unselected experiments, not Core additions. Consider a bounded experiment only after a documented failure of the existing retrieval paths, explicit decision/contract impact and frozen evaluation design. Do not alter C0/C1/C2 source categories or reference answers to manufacture improvement. Answer/permission caching, CRDT reorder, automatic graphs and extra services are not selected here.

### 7.2 First implementation decision brief

[SP-01.1](implementation/tasks/01-session.md) should record runtime/compiler/plugin/schema-dialect compatibility, the application DB client and service-owned transaction/pool boundary, exact bigint serialization, actual startup/test commands and failure cases. A node-postgres candidate uses one checked-out client for all transaction statements and releases it in finally; no DB transaction is held through LLM generation. Driver/ORM adoption and pool limits remain explicit choices. Work/document/keyword outage independence remains unchanged.

**v1.5 correction and research — 26 October 2026:** Corrected Compose/UI/current-state provenance, refreshed official-source observations and mapped algorithms/structures to existing slices. Earlier dated counts/source observations remain historical records. No package, image, migration, schema, contract, accepted ADR, provider or application handler changed. External observations are not compatibility/benchmark evidence; application choices remain Proposed.
