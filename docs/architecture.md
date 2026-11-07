# Architecture for the five-month capstone

**Artifact ID:** SAD-03
**Version/date:** 0.19.1 Draft · 4 November 2026
**Status:** Draft for owner review; organized into 4+1 views; ADR-0007–ADR-0017 directions are owner-confirmed; implementation and remaining policy details are unverified.\
**Inputs:** [BRD](BRD.md) v1.0; [PRD](sdlc/PRD_SRS.md) v0.10.3; [use cases](sdlc/use-cases.md) v0.8.4; [delivery plan](planning/five-month-plan.md) v0.4; [ADR-0004](adr/0004-knowledge-store.md) v0.2; ADR-0007–ADR-0017; AGENTS rules; owner confirmation to retain minimal microservices. Input-number reconciliation does not establish full semantic or runtime acceptance.; Proposed ADR-0018–ADR-0023
**Author:** development agent acting sequentially; owner reviews business choices.

---

The [canonical diagram foundation](sdlc/diagrams/design-foundation-2026-10-17.md) provides C4 Context/Container as the structural entry, with sequence, state, data, development and deployment views mapped to this 4+1 narrative. Application topology below remains proposed; the deployment diagram identifies the actual local PostgreSQL configuration separately.

## 1. Context, Drivers and Decisions

### 1.1 Context and Scope
This architecture specifies a web application combining Scrum work management with permission-aware project knowledge retrieval and citation-backed AI synthesis. The project is delivered by a single student engineer over a five-month capstone timeline. The owner has explicitly directed a minimal microservices architecture rather than a modular monolith or fine-grained services.

The system is decomposed into **two business services**:
1. **Workspace Service:** Owns identity sessions, Scrum operational entities, and authoritative project and document permission policies.
2. **Knowledge Service:** Owns immutable document content, text passages, keyword/vector indices, evidence retrieval, citation resolution, and provenance.

The web client is a presentation UI, not an independent business domain. The AI provider integration is a guarded relay within Workspace, not an autonomous agent or independent service.

### 1.2 Architectural Drivers
The design prioritizes four non-negotiable architectural drivers:

| Driver | Description | Architectural Response |
| --- | --- | --- |
| **D-1: Authorization Integrity** | Enforce project AND document access at named, testable boundaries. | Centralized permission authority; dual-scope filtering; guarded handoff; not-found-equivalent denied reads. No absolute security claim. |
| **D-2: Evidence Fidelity & Exact Citations** | Cite exact immutable passages and report insufficient evidence; evaluate claim support separately from locator validity. | Stable evidence manifests; citation ID validation; whole-draft withholding upon revocation. No zero-hallucination guarantee. |
| **D-3: Continuity during AI Outage** | Core work and permitted reads remain usable when AI fails and their own dependencies are healthy. | Explicit question failure and independent keyword search. No transparent automatic redirection is required. |
| **D-4: Bounded Resource Footprint** | Keep deployment proportionate to one student's workstation and five-month plan. | Two proposed service processes and implemented separate owned databases; application stack/provider remain Proposed. Local storage does not imply local generation. |

### 1.3 Architectural Decisions Summary
All architectural decisions are tracked via Architecture Decision Records (ADRs):

| Decision | Status / Source | Rationale |
| --- | --- | --- |
| Microservices Architecture | Mandate / Owner Direction | Enforces strict domain separation and distinct security boundaries between operational work and AI retrieval. |
| Workspace & Knowledge Boundary | Proposed [ADR-0002](adr/0002-minimal-microservices.md) | Isolates high-frequency operational mutations from compute-heavy knowledge retrieval and indexing workloads. |
| Student Tech Stack | Proposed [ADR-0003](adr/0003-student-stack.md) | Single language (Node.js/TypeScript candidate), shared conventions, dependency-free context harness, local execution. |
| Relational Storage & pgvector | Owner-authorised storage foundation; [ADR-0004](adr/0004-knowledge-store.md) v0.2 | PostgreSQL 17.10 hosting separate owned databases; pgvector 0.8.2 exact discovery; real storage integration tests. Application enforcement remains unimplemented. |
| Bounded AI Provider Pilot | Proposed [ADR-0005](adr/0005-ai-provider-pilot.md) | Single provider configuration, strict pilot budget (20–30 reference cases), synthetic fixtures, provider-independent abstraction. |
| Protected Handoff Guard | Proposed [ADR-0006](adr/0006-permission-handoff-guard.md) | Serialize permission/lifecycle commits with final validation and protected handoffs at named server boundaries; correctness requires concurrency tests. |
| Document access model | Owner-confirmed [ADR-0007](adr/0007-document-access-model.md) | Explicit, revocable document-read grants; authorship does not imply read. |
| Fixed Sprint and board lifecycle | Owner-confirmed [ADR-0008](adr/0008-fixed-sprint-lifecycle.md) | Planned/Active/Completed Sprints; three direct board states and completed-history preservation. |
| Immediate immutable versions | Owner-confirmed [ADR-0009](adr/0009-versions-without-draft.md) | Revision creates Current and supersedes prior Current atomically. |
| Release exceptions | Owner-confirmed [ADR-0010](adr/0010-release-scope-and-capacity.md) | Seven original Core exceptions; 60 Must retained. |
| Creation and guard scope | Owner-confirmed [ADR-0011](adr/0011-document-creation-and-guard-scope.md) | Workspace-first identity/policy and protected source/citation/answer handoffs. |
| Audit visibility and durable evidence | Owner-confirmed [ADR-0012](adr/0012-audit-visibility-and-durable-evidence.md) | Scoped audit identity exception; durable audit and evidence records before handoff. |
| Unavailable citations and withholding | Owner-confirmed [ADR-0013](adr/0013-unavailable-citations-and-withheld-answers.md) | Current retained-read entitlement and terminal `AnswerWithheld`. |
| Per-task Sprint allocation | Owner-confirmed [ADR-0014](adr/0014-multiple-sprint-allocation.md) | Independently keyed allocations with per-task outcomes. |
| Partial evidence answers | Owner-confirmed [ADR-0015](adr/0015-partial-evidence-answers.md) | Cited supported components and explicit missing components. |
| Optional Workspace task search | Owner-confirmed [ADR-0016](adr/0016-optional-task-keyword-search.md) | FR-70 Should; Workspace substring search independent of Knowledge. |
| Membership removal | Owner-confirmed [ADR-0017](adr/0017-membership-removal-capabilities-and-assignees.md) | Atomic individual-capability invalidation, unassignment and last-manager protection. |
| Operational read projections | Proposed [ADR-0018](adr/0018-operational-read-projections.md) | Current location and Backlog generation; migration 003 storage prerequisites tested, application behavior pending. |
| Scoped UI discovery | Proposed [ADR-0019](adr/0019-scoped-ui-discovery.md) | Minimal lists, independent policy/grants and advisory exact-scope action discovery. |
| Manifest-bound transport | Proposed [ADR-0020](adr/0020-manifest-bound-ai-transport.md) | Complete immutable receipts and one-use guarded byte binding; additive storage/adapters remain pending. |
| Inspection and optional metrics | Proposed [ADR-0021](adr/0021-scoped-inspection-and-missing-metrics.md) | Exact per-step evidence and explicit missing measurements; capture/runtime tests pending. |
| Handoff storage mapping | Proposed [ADR-0023](adr/0023-immutable-handoff-storage.md) | Knowledge 003 / Workspace 004 have isolated SQL evidence; no development upgrade, active-process fence, handler/guard or relay acceptance. |
| Non-reading document commands | Proposed [ADR-0022](adr/0022-opaque-document-command-preconditions.md) | Action-bound opaque concurrency and minimal receipts; token storage, authority and command handlers remain unimplemented. |

ADR-0007–ADR-0011 now record owner-confirmed access, Sprint, lifecycle, release and guard directions. Remaining delegation, retention/identity, provider and deployment details require validation. The owner's 13 October request to implement ADR-0004 selects OD-12's storage portion only; application frameworks, providers and product policies are not accepted by this change.

Storage implementation status: [runbook](../infra/postgres/README.md), owned service migrations, exact vector/English full-text SQL queries and database integration tests now exist. The remaining views describe proposed application behavior. PostgreSQL English full-text search (GIN) — independent keyword path — is the storage baseline. Trigram/fusion retrieval remains unselected; HTTP permission checks and ADR-0006 transport guards are not implemented by the SQL foundation.

---

## 2. Logical View

The Logical View describes the functional decomposition, service boundaries, domain models, and boundary contracts.

### 2.1 Service Decomposition and Responsibilities

```
+-------------------------------------------------------------------------------+
|                                    Web UI                                     |
|  - Backlog/Sprint Board Views   - Knowledge Browser & Editor   - AI Q&A Modal |
+---------------------------------------+---------------------------------------+
                                        | (HTTPS / Same-Origin / Opaque Session)
                                        v
+-------------------------------------------------------------------------------+
|                              Workspace Service                                |
|  +--------------------------------+  +-------------------------------------+  |
|  |       Gateway & Auth           |  |       Authoritative Policy          |  |
|  | - Session Validation & CSRF    |  | - Project Scope & Document ACLs     |  |
|  | - Request Routing & Rate Limit |  | - Member Invalidation & Revocation  |  |
|  +--------------------------------+  +-------------------------------------+  |
|  +--------------------------------+  +-------------------------------------+  |
|  |      Scrum Work Domain         |  |      Guarded Provider Relay         |  |
|  | - Backlog, Sprint, Task States |  | - Protected Transport Mutex         |  |
|  | - Blocker & Event Auditing     |  | - Evidence Manifest Validation      |  |
|  +--------------------------------+  +-------------------------------------+  |
+-------------------+-----------------------------------+-----------------------+
                    |                                   | (Internal HTTP /
                    | (Own DB Writes)                   |  Service Key + Actor)
                    v                                   v
+-------------------------------+   +-------------------------------------------+
|      Workspace Database       |   |             Knowledge Service             |
| - sessions, users, members    |   |  +-------------------------------------+  |
| - projects, document_acls     |   |  |      Document & Passage Store       |  |
| - sprints, tasks, blockers    |   |  | - Documents & Immutable Versions    |  |
| - workspace_audit_events      |   |  | - Passages & Lifecycle States       |  |
+-------------------------------+   |  +-------------------------------------+  |
                                    |  +-------------------------------------+  |
                                    |  |     Independent Search Paths        |  |
                                    |  | - English full-text (GIN) keyword   |  |
                                    |  | - pgvector exact AI discovery       |  |
                                    |  | - Authorized Scope Pre-Filtering    |  |
                                    |  +-------------------------------------+  |
                                    |  +-------------------------------------+  |
                                    |  |     Evidence & Citation Engine      |  |
                                    |  | - Claim Support & Citation Check    |  |
                                    |  | - Knowledge Audit & Provenance      |  |
                                    |  +-------------------------------------+  |
                                    +---------------------+---------------------+
                                                          | (Own DB Writes)
                                                          v
                                    +-------------------------------------------+
                                    |            Knowledge Database             |
                                    | - documents, versions, passages           |
                                    | - vector_embeddings, keyword_index        |
                                    | - knowledge_audit_events, provenance      |
                                    +-------------------------------------------+
```

| Element | Owns | Does NOT Own |
| --- | --- | --- |
| **Workspace Service** | User sessions, Project membership, Backlog/Sprint/Task/Blocker states, authoritative project and document permission policies, Workspace audit log, Same-origin API Gateway, Protected transport guard. | Knowledge raw text, embeddings, passage parsing, AI retrieval/synthesis rules. |
| **Knowledge Service** | Documents, immutable versions, passages, source lifecycle states, manual links, keyword/vector indices, evidence retrieval, synthesis claim validation, citation resolution, Knowledge provenance audit. | User identity, password verification, independent ACL rules, Workspace operational state. |
| **Web UI** | Client view rendering, user interaction, form validation, client routing, display of citations and failure banners. | Authorization decisions, database access, model communication. |
| **AI Provider Relay** | Narrow Workspace transport adapter; dispatch under Workspace's authoritative guard and final access checks. | Independent permission rules, source identity assignment, synthesis decisions. |

Centralized Architecture Diagram: [editable Draw.io](sdlc/diagrams/architecture/service-composition.drawio) · [Mermaid source](sdlc/diagrams/architecture/service-composition.mmd) (ID: `DGM-ARCH-01`).

### 2.2 Data Ownership and Storage Isolation
- **Database-per-Service Principle:** Workspace and Knowledge each maintain their own independent logical database.
- **Zero Cross-Database Writes:** Workspace never writes to `knowledge_db`; Knowledge never writes to `workspace_db`.
- **Zero Runtime Joins:** Cross-service data is never joined at SQL runtime. Workspace accesses Knowledge data exclusively via Knowledge HTTP APIs; Knowledge accesses Workspace policy/operational state exclusively via authenticated Workspace internal endpoints.
- **Authoritative vs. Linked State:**
  - Workspace stores document policy records (`document_id`, `project_id`, `classification`, `permission_revision`).
  - Knowledge stores document content (`document_id`, versions, passages).
  - Knowledge stores manual links to operational entities (`task_id`, `sprint_id`) as foreign references, querying current operational state via Workspace APIs when needed.

### 2.3 Boundary Contracts and Schemas
System contracts are formalized using OpenAPI 3.1.1:
- [Workspace OpenAPI Contract](../contracts/openapi/workspace.openapi.json)
- [Knowledge OpenAPI Contract](../contracts/openapi/knowledge.openapi.json)
- [Logical Data Model](../contracts/data-model.json)

**Security Invariants in Contracts:**
1. **Opaque Identity:** Authenticated caller identity and authority come strictly from server-verified sessions/current scope, never client `actor_id`, `permissions` or a caller-role claim. `AddMember.role` is the descriptive Scrum role selected for the target member, not a claim about the caller and not a capability grant. The server separately authorizes membership management; no role-update or non-read delegation interface is implied.
2. **Generic Not-Found Response:** Denied or nonexistent resources return identical 404 responses `{ "code": "not_found", "message": "Resource unavailable" }` with `additionalProperties: false` to prevent metadata leakage.
3. **Exact Citation Schema:** Document citations require `[document_id, version_id, passage_id]`. Operational citations instead bind entity kind/ID, observation revision and observation time; they never fabricate a document tuple. Both use server-assigned source IDs and current scope checks. Operational observation revisions are distinct from a freshly read entity revision.
4. **Version lifecycle:** Product states are `current`, `superseded`, `archived`; ordinary retrieval returns eligible Current only. Revisions become Current atomically; no separate publish endpoint exists (ADR-0009).

---

## 3. Process View

The Process View addresses concurrency, dynamic runtime interactions, synchronization mechanisms, boundary timeouts, and failure modes.

### 3.1 Concurrency Model and Permission Handoff Guard (ADR-0006)
In the initial single-node deployment, Workspace runs as a single process. Concurrency issues arise when permissions are revoked while an AI Q&A request is concurrently in-flight.

```
Authorized access manager               Workspace Handoff Guard                 Knowledge Service / Provider
      |                                             |                                          |
      |-- 1. Revoke Member Document Access -------->|                                          |
      |                                             |-- Acquire Project Mutex                  |
      |                                             |-- Commit Revocation to DB                |
      |                                             |-- Invalidate Active Session Scopes       |
      |                                             |-- Later protected handoffs recheck ----> | (Withhold revoked evidence)
      |                                             |-- Release Project Mutex                  |
      |<- 2. Revocation Confirmed -------------------|                                          |
```

- **Protected Mutex:** One active Workspace authority process owns project/session guards. Permission mutation commits use the same guard as protected provider-input and response transport handoffs. Role names do not grant mutation authority.
- **Hold Duration:** For each provider submission and each protected response delivery, hold the guard from final session/access/version validation through transport handoff completion or abort. Release after that boundary; a check followed by an unguarded send is insufficient.
- **Internal callback reads:** `evaluateAccess` (`POST /internal/access/evaluate`) and `observeWorkState` (`POST /internal/observations`) read committed authorised state without reacquiring the project guard. Authentication and scope still apply. Final Workspace policy validation inside a held guard is in-process. Source/citation responses still use the protected handoff guard (ADR-0011).
- **Generation Wait:** The network wait for LLM completion occurs *outside* the guard lock to prevent blocking other workspace operations.
- **Buffered Delivery:** Responses from the model must be fully received and buffered. Streaming partial tokens directly to the browser is strictly prohibited.
- **Final Validation & Withholding:** Before returning the synthesized answer to the client, the guard re-verifies that **every source in the answer's evidence set** — including uncited sources that entered the model context — remains currently accessible to the requester. If any source in the evidence set has been revoked, the entire original draft answer is withheld (FR-29, ADR-0006). Uncited context can influence model output; checking only cited sources is insufficient. The answer may be regenerated only from the remaining permitted evidence as a new bounded attempt.
- **Lifecycle and uncertain writes:** Immediate revision, archive and deletion use the gateway project guard but commit only in Knowledge. Knowledge validates final version/availability inside that guard. An unknown remote-write outcome blocks protected handoffs until reconciliation; a timeout does not prove that the write was cancelled.
- **Abort and restart:** Revocation success means its commit follows prior handoffs that have completed or aborted. Aborted/timed-out handoffs cannot resume or replay after restart. Membership rejoin cannot revive invalidated grants. Data already sent cannot be recalled; the boundary is server handoff, not browser rendering or provider receipt. These are requirements from Proposed ADR-0006, not executed guarantees.

### 3.2 Core Dynamic Workflows

#### Flow 1: Scrum Operational Work Management
1. **Client Request:** Authenticated browser sends mutation (e.g., `POST /tasks/{task_id}/state`) with idempotency key.
2. **Session & Policy Check:** Workspace validates session cookie, CSRF token, project membership and operation-specific authority; membership alone does not authorize mutations.
3. **Optimistic Revision Check:** Workspace verifies expected entity version; rejects stale writes with 409 Conflict.
4. **Local Transaction & Audit:** Workspace updates task status, inserts `BlockerEvent` or `TaskHistory`, and persists minimum audit atomically. Sprint completion returns unfinished tasks as To Do; Completed-Sprint reopening also returns To Do while preserving completed history (ADR-0008).
5. **Authoritative Response:** Returns updated task representation.

#### Flow 2: Knowledge Ingestion and Lifecycle Transitions
1. **Allocate and register:** Workspace checks session, project and creation capability; allocates document_id and atomically commits policy, initial capabilities, restricted-author read grant and idempotency receipt. The key binds actor/operation/payload to this identity; retry cannot allocate a second ID.
2. **Persist:** Gateway uses authenticated PUT /internal/documents/{document_id} (persistDocument) to persist initial Current content, passages and the owned audit/receipt in Knowledge. No cross-service DB write and no later activation.
3. **Availability:** Registered policy without content reveals nothing. Public reads require current permission AND available Knowledge content; otherwise the same generic missing/denied response applies. A 202 on the public facade means uncertain creation requiring reconciliation, not source readiness.
4. **Retry/cleanup:** Reconcile or retry with the same key and payload; changed payload conflicts. Never sweep an orphan merely because one content check returned absent: a delayed write may still commit. Fenced cleanup is an open ADR-0011 design requirement; no arbitrary age or destructive job is selected.
5. **Lifecycle:** Creation → Current. Revision atomically supersedes previous Current, inserts new immutable Current and advances the document pointer under the lifecycle guard. Archive permits Current/Superseded → Archived. Deletion stops active reads/new support at the protected boundary; tombstones and retryable purge prevent stale jobs from reviving content. Physical retention remains open.

#### Flow 3: Permission-Aware Independent Retrieval Paths
1. **Scope Assertion:** Requester queries Knowledge via Gateway. Workspace resolves actor's currently authorized project IDs and accessible document IDs.
2. **Shared pre-query and lifecycle filtering:** Both paths require authorized project AND document scope and eligible `Current` versions before ranking. Exclude `Superseded`, `Archived` and deleted/tombstoned sources. Historical retrieval requires explicit selection and labels permitted noncurrent results (FR-47); index state does not replace current authoritative availability/version validation.
3. **Keyword path (FR-18/FR-34):** PostgreSQL English full-text search (GIN) — independent keyword path. It uses the scoped `keyword_search` query without embedding or generation, including during AI dependency failure while Knowledge and authority remain healthy. This path is the C0 evaluation baseline.
4. **Semantic AI path (FR-21):** Scoped pgvector exact discovery supplies candidate passages for the guarded answer flow. Embedding or generation failure returns an explicit AI failure; it does not disable the independent keyword path. Candidate passages are checked against current Workspace policy before becoming answer evidence.
5. **Not selected / future option:** Trigram and fusion, including Reciprocal Rank Fusion (RRF), are unselected pending pilot evidence and a separate ADR. No combined ranking path is part of the current design or C0 baseline.

#### Flow 4: Guarded Evidence Handoff and AI Synthesis
1. **Evidence Packaging:** Knowledge assigns server-controlled reference IDs (`[SRC-1]`, `[SRC-2]`) stable within the run and bound to exact document/version/passage locators OR operational entity kind/ID/observation revision/time. If no eligible evidence exists, return Insufficient evidence without a model call. Nonempty retrieval is not sufficient support: related documents may omit the requested decision or rationale.
2. **Operational Context Injection:** Knowledge queries Workspace for current operational status of linked tasks/sprints.
3. **Durable input manifest:** Persist the run ID and exact evidence manifest before protected provider input; persistence failure withholds handoff (ADR-0012). **Guard Acquisition:** Only after durable acknowledgement, Workspace acquires the applicable guard and matches the frozen payload/manifest, recorded revisions, session/access and Knowledge version/availability checks, and holds it through provider-input handoff completion or abort (§3.1).
4. **Model Execution:** Model generates response citing only provided `[SRC-x]` tags.
5. **Synthesis Verification:** Bind citations only to retrieved locators and buffer the answer. An invented locator withholds the original draft; only a new bounded attempt passing support, exact binding, access and provenance can deliver, else terminal `AnswerWithheld` (ADR-0013). Unsupported requested claims must receive Insufficient evidence even when related passages were retrieved; do not invent rationale. Distinguish fact, synthesis, uncertainty and detected conflicts. With some supported components, deliver `partially_answered` with citations and explicit `missing_components`; with none, return `insufficient_evidence` (ADR-0015). Locator validation alone does not establish support: PRD §7's manual claim/passage rubric and nonempty-but-insufficient fixtures are required; no automatic factual-verification guarantee is made.
6. **Delivery Re-Check:** Persist a complete immutable per-handoff manifest outside the guard, then acquire the guard for final full evidence-set access, recorded revision and frozen payload/manifest matching through response handoff completion or abort (§3.1). Any mismatch sends zero bytes: release the guard, prepare a fresh manifest outside it and repeat checks as a bounded new attempt. Never write a remote manifest or modify a payload inside the guard (ADR-0012). Withhold the entire original draft if any source is revoked (FR-29). Optional regeneration uses only remaining permitted evidence as a new bounded attempt.

#### Flow 5: Citation Resolution and Inspection
1. **Inspection Request:** Branch on the server citation kind: document tuple or operational observation locator.
2. **Authorization Gate:** Workspace re-verifies actor's current permission for the target document.
3. **Exact Resolution:** For document citations, under the protected-read guard Knowledge returns the exact immutable passage and labelled version; history never redirects to Current. For operational citations, preserve the cited observation identity/time/revision and separately fetch the exact current Project/Sprint/Task under renewed authority. Label current state separately; no historical operational-snapshot endpoint or document locator is invented.
4. **Denial/unavailability:** Unauthorized or unknown identities use FR-59's generic response. An authorized citation whose evidence is unavailable reports Unavailable without substituting a newer version (FR-61).

### 3.3 Boundary Timeouts, Retries and Failures

All timeouts are finite startup-required configuration. The values below are **candidate defaults for pilot calibration**, not accepted specifications. Acceptance limits are selected during pilot evaluation, not universal PRD promises. Actual calibration requires installed stack versions and measured workload; ADR-0003 remains Proposed, while ADR-0004's tested storage foundation supplies no application latency calibration.

| Boundary | Auth Credential | Consistency | Timeout Config | Retry & Failure Policy |
| --- | --- | --- | --- | --- |
| **UI $\rightarrow$ Gateway** | Opaque session cookie + CSRF token | Committed local records; optimistic revision | `operational_request_timeout_ms` (candidate: 5000ms) | Idempotent retry with actor key. 409 on conflict. 404 on denied/unknown. |
| **Gateway $\rightarrow$ Knowledge** | Internal service key + validated actor context | Knowledge local transaction | `knowledge_timeout_ms` (candidate: 8000ms) | No blind retries on mutation. Returns explicit `pending` or `unavailable`. |
| **Knowledge $\rightarrow$ Policy** | Internal service key + actor session reference | Authoritative current ACL revision | `policy_timeout_ms` (candidate: 2000ms) | Timeout/failure defaults to Deny. Never assumes access. |
| **Workspace $\rightarrow$ Provider** | Server-configured API key / local socket | Stateless generation | `provider_timeout_ms` (candidate: 15000ms) | Bounded single attempt. On timeout/error, returns explicit failure state (FR-69). |
| **Knowledge Jobs $\rightarrow$ Index** | Internal worker identity | Eventual consistency; tombstone-guarded | `index_job_timeout_ms` (candidate: 30000ms) | Idempotent version processing. Stale work discarded. |

### 3.4 AI Outage Behavior (FR-69 / FR-34 / BR-13)
When the AI provider experiences outages, timeouts, or rate limits:
1. **Explicit failure response (FR-69):** The AI question returns an explicit failure state naming the failure category, containing no generated answer. The run is recorded with the error details for audit.
2. **UI error indication:** System displays a visible, non-blocking UI alert banner indicating AI degradation.
3. **Keyword search independence (FR-34):** PostgreSQL English full-text search (GIN) — independent keyword path — remains available without the failed AI dependency while Knowledge and authority are healthy. It returns only permitted Current matches under English FTS semantics; it does not promise the same matches as semantic discovery.
4. **Operational continuity:** Core work operations and permitted document reading remain usable when identity/work/document dependencies are healthy (AC-33); their own failures remain explicit.

Automatic redirection from AI failure to keyword search is **not adopted** under ADR-0011. The current specification requires that AI failures return explicit failure responses (FR-69) and that keyword search remains independently usable (FR-34), but does not mandate transparent automatic redirection.

### 3.5 Provider data, untrusted content and provenance

Embedding receives authorized passage text and only necessary identifiers; generation receives the question, permitted evidence excerpts and current operational observations. A provider change requires the owner-authorized data-transfer policy. Use synthetic or explicitly authorized fixtures; local vector storage does not imply local provider execution. Retrieved instructions cannot grant tools, mutate work or override the runtime assistant's read-only authority (FR-30).

Business audit events, execution traces and source provenance are separate records correlated by run/entity IDs. Record model/configuration, timing, usage, failures and exact evidence identities; exclude secrets, private reasoning and unrestricted content copies. Source snippets and audit/trace inspection require their own current access checks. Capture starts with mutations/answer attempts even if the inspection UI is delivered later. Claim-support scoring follows the PRD rubric rather than citation-schema validity.

ADR-0012 clarifies two owner-confirmed boundaries. Scoped audit-read plus current project membership permits in-scope actor/action/entity identity/time without document-read; protected title/content/before-after payload still needs separate read authority. This audit-only entitlement does not apply to trace-read, retrieval, citations or provider input. Knowing an ID does not grant content access.

Persist each mutation's audit event or durable pending audit delivery in the same owning-service transaction as business state. Failure to store that minimum prevents commit; later sink failure leaves a replayable record and does not undo confirmed business state. Persist AI run identity and exact evidence manifest before protected provider input and for each protected answer handoff; failure withholds that handoff. Optional metrics may be unavailable and labelled, but mandatory provenance/access decisions are not optional telemetry. Adapters and transport failure tests remain unimplemented.

No cached permission or answer results are selected for the MVP in DATA-04. Any later cache needs scope/version/deletion-aware keys and invalidation, plus final current checks; cached results cannot bypass the protected handoff. Index jobs are idempotent by source/version/processing generation and cannot revive an older publication or tombstone.

---

## 4. Development View

The Development View describes the repository layout, module layering, dependency rules, technology standards, and testing harnesses.

### 4.1 Codebase Organization
The following is the proposed implementation layout, not a claim that handlers or all `src/` directories exist. The current repository contains a context/contract scaffold; domain boundaries require implementation and tests:

```
scrum-workspace-KMS-ai/
├── apps/
│   └── web/                     # User-facing web frontend (UI views, forms, state)
├── services/
│   ├── workspace/               # Gateway, Auth, Scrum domain, Permission authority
│   │   ├── src/
│   │   │   ├── auth/            # Session management, cookie validation
│   │   │   ├── scrum/           # Backlog, Sprint, Task, Blocker services
│   │   │   ├── policy/          # Authoritative project & document ACL registry
│   │   │   └── relay/           # Guarded provider transport & mutex
│   │   └── README.md
│   └── knowledge/               # Knowledge, Retrieval, AI, Provenance
│       ├── src/
│       │   ├── documents/       # Document versions, passages, lifecycle
│       │   ├── retrieval/       # Independent English full-text and pgvector exact paths
│       │   ├── synthesis/       # Evidence validation & prompt synthesis
│       │   └── audit/           # Provenance & knowledge audit logger
│       └── README.md
├── contracts/                   # Shared interface definitions
│   ├── openapi/                 # OpenAPI 3.1.1 JSON schemas (workspace, knowledge)
│   └── data-model.json          # Logical data model schemas
├── specs/                       # Bounded implementation slices (SP-01 to SP-13)
├── eval/                        # Evaluation fixtures & 25 reference questions
├── scripts/                     # Context validation & verification scripts
└── tests/                       # Automated test suites & contract assertions
```

### 4.2 Module Layering and Implementation Conventions

**Organisation and current structure.** Workspace code is organised by feature, including session, projects and tasks. In the inspected Project and Task paths, Fastify HTTP adapters call transaction-script-style application services with embedded SQL. Read queries, cursor fingerprinting and pagination also reside in these stores. “Store” remains the implementation name; this structure does not establish conformance to Clean Architecture, Hexagonal Architecture, DDD or CQRS. This is a source-structure description, not new runtime acceptance.

**Transaction responsibilities.** The database runner `ownedTransaction` manages connection acquisition, transaction boundaries, local timeouts, database-role validation and uncertain commit outcomes. `WorkspaceProjectStore.transaction` supplies authenticated actor context and a session-revalidation guard. Each operation callback explicitly sequences its required locks, authority checks, idempotency handling and business effects.

For Task creation within an existing Project, the callback acquires Project access through `projectAccess`, checks creation authority, looks up the original outcome, and revalidates the session before replay disclosure or the first business write. Task state, business audit and the immutable original outcome commit atomically. A database trigger advances `backlog_revision` within that transaction. Project creation and membership mutations have operation-specific sequences; this Task sequence is not a universal mutation template. The callback calls `projectAccess` explicitly; the transaction wrapper does not automatically acquire a Project lock.

**Denial semantics.** A recorded session denial returns without business writes, allowing required authentication-state changes, such as a clock-fault latch, to commit before the wrapper raises the recorded fault. The wrapper awaits the callback and rejects an unexpected `null` without a recorded denial before COMMIT, rolling back attempted business state, audit and original outcome. Existing error handling returns generic503 access_unavailable. Valid204 outcome objects with null bodies remain valid. Recorded denial retains its commit-then-raise path. RF03 reproduced the extension risk on a synthetic disposable database; RF04 verified the correction, without claiming an observed production incident. A thrown callback error takes the rollback path; a failure after COMMIT is sent is classified as an uncertain outcome.

**Known limits.** Project-scoped reads using `projectAccess` acquire a Project `FOR UPDATE` lock and may serialize competing requests. Task lists load and fingerprint the full eligible ordered projection before returning pages of 50 items. These mechanisms have bounded verification; no scalability claim is made.

**Dependency and ownership rules.** The original layering invariants remain binding:

1. **Domain Independence:** Business domain logic inside `services/workspace/` and `services/knowledge/` must have no dependency on UI frameworks or concrete LLM provider SDKs.
2. **No Shared Code Writing to Databases:** No shared library may execute database writes. Database access code is strictly private to each service; no service writes another service’s database.
3. **One-Way Dependency Flow:** UI depends on Gateway contracts; Gateway depends on Service contracts; Services depend on domain models. Knowledge never imports Workspace internal modules or duplicates its permission policy.

**Evolution.** No immediate structural refactor is required. The hotfix RF02 follow-up introduced a shared hasCapability grant predicate at six Project/Task call sites, retaining caller-owned current membership/read scope, action, client and lock ordering. Database errors propagate; batch discovery and private provisioning remain unchanged. Actions-discovery separation and transaction-runner extraction remain possible future changes. Knowledge workflows require their own design for remote calls, durable evidence and guarded handoffs; they must not be forced into one transaction spanning services.

**Source anchors.** Original documentation used base commit `6b837fd`; current RF02/RF04 source and synthetic execution are identified in the [hotfix plan](implementation/features/hotfix-backend-layering/plan.md) and [RF05 handoff](implementation/features/hotfix-backend-layering/rf05-report.md). See [Task HTTP registration](../services/workspace/src/tasks/http.ts) (`registerTaskHttp`), [Task store](../services/workspace/src/tasks/store.ts) (`WorkspaceTaskStore.create/get/list`), [Project store](../services/workspace/src/projects/store.ts) (`transaction`, `projectAccess`), [database runner](../services/workspace/src/session/database.ts) (`ownedTransaction`), [session inspection](../services/workspace/src/session/store.ts) (`inspectInTransaction`), [immutable Task outcomes](../services/workspace/src/tasks/outcomes.ts) (`taskOutcome`, `saveTaskOutcome`), [Backlog trigger](../services/workspace/migrations/003-work-location.up.sql) (`advance_backlog_revision`) and [Task verification limits](../services/workspace/TASKS.md). The original documentation clarification ran structural checks only; RF05 separately records bounded real PostgreSQL/HTTP regression. Provider, load, deployment and independent acceptance remain unverified.

### 4.3 Build, Lint and Verification Standards
- **Runtime:** Node.js 24+ LTS.
- **Harness Scripts:**
  - `npm run context:lint`: Node syntax checks on harness scripts and tests.
  - `npm run context:check`: Validates PRD requirements, MoSCoW scope, OpenAPI operation IDs, spec coverage, and markdown anchor links.
  - `npm run context:test`: Executes harness unit negatives against contract/context shape; it is not consumer/provider or runtime security testing.

The validator checks selected files listed in `scripts/verify-context.mjs`, not all documentation or full semantic trace. Record the actual Node version separately from the declared Node 24+ requirement.

---

## 5. Physical / Deployment View

The Physical View details the physical infrastructure, node allocation, network topology, and trust boundaries.

### 5.1 Deployment Topology

```
+-------------------------------------------------------------------------------+
|                       Host Environment: Developer Workstation                 |
|                                                                               |
|  +---------------------------+         +-----------------------------------+  |
|  |     Web Browser (UI)      |         |       External AI Provider        |  |
|  |   https://localhost:8000   |         |   (Cloud LLM or Local Ollama/LM)  |  |
|  +-------------+-------------+         +-----------------+-----------------+  |
|                |                                         ^                    |
|                | [Trust Boundary 1]                      | [Trust Boundary 4] |
|                | HTTPS / Same-Origin                     | HTTPS / Guarded    |
|                v                                         |                    |
|  +-------------------------------------------------------+-----------------+  |
|  |                  Workspace Service Process (Port 8000)                  |  |
|  |          - API Gateway & Static Server      - Scrum Domain              |  |
|  |          - Authoritative Permission Policy  - Provider Guarded Relay    |  |
|  +---------------------+---------------------------------+-----------------+  |
|                        |                                 |                    |
|     [Trust Boundary 3] |              [Trust Boundary 2] | Internal HTTP      |
|     Local TCP / Socket |              Local Loopback     | Service Key +      |
|     (workspace_db)     |              (Port 8001)        | Actor Session      |
|                        v                                 v                    |
|  +-----------------------------+       +-----------------------------------+  |
|  |    PostgreSQL Instance      |       | Knowledge Service Process (8001)  |  |
|  |  (storage: PostgreSQL 17)   |       | - Document Store & Chunking       |  |
|  |  +-----------------------+  |       | - English FTS (GIN) + pgvector    |  |
|  |  | workspace_db (DB)     |  |       | - Evidence & Citation Resolution  |  |
|  |  +-----------------------+  |       +-----------------+-----------------+  |
|  |  | knowledge_db (DB)     |  |                         |                    |
|  |  +-----------------------+  |                         | [Trust Boundary 3] |
|  +-----------------------------+                         | Local TCP / Socket |
|                ^                                         | (knowledge_db)     |
|                +-----------------------------------------+                    |
+-------------------------------------------------------------------------------+
```

### 5.2 Trust Boundaries and Network Security

The candidate diagram serves UI and gateway from the same HTTPS origin on port 8000; local TLS setup is unimplemented. If a UI development server is used on port 3000, its same-origin API proxy to Workspace must be configured and tested; direct browser calls from port 3000 to port 8000 are cross-origin. Test cookie/CSRF behavior in the selected topology. Ports are candidate configuration, not deployment evidence.

1. **Trust Boundary 1 (Browser $\rightarrow$ Workspace Gateway):**
   - Protocol: HTTPS over candidate port 8000 for the topology shown (same-origin).
   - Authentication: HttpOnly, Secure, SameSite=Strict opaque session cookies.
   - Defense: Double-submit or header-based CSRF tokens on mutating verbs (`POST`, `PUT`, `PATCH`, `DELETE`).
2. **Trust Boundary 2 (Workspace Gateway $\rightarrow$ Knowledge Service):**
   - Protocol: Internal HTTP over loopback port 8001 (not exposed publicly).
   - Authentication: Shared secret service key (`x-service-key`) + serialized actor session header (`x-actor-session`).
   - Invariant: Knowledge rejects any request lacking both credentials.
3. **Trust Boundary 3 (Services $\rightarrow$ PostgreSQL Database):**
   - Protocol: Local UNIX domain socket or loopback TCP port 5432.
   - Authentication: Dedicated database users (`workspace_user`, `knowledge_user`) with restricted grants ensuring neither can access the other's database.
4. **Trust Boundary 4 (Workspace Relay $\rightarrow$ AI Provider):**
   - Protocol: Outbound HTTPS to configured model API (or loopback to local inference engine).
   - Guard: Enforces handoff timeout, isolates outbound traffic from board operations, sanitizes payload to exclude unpermitted metadata.

### 5.3 Physical Resource Sizing & Constraints
- **Hardware sizing is an unmeasured candidate estimate:** Initial development assumes execution on a single standard developer workstation (candidate baseline: 4 CPU cores, 8 GB RAM, 20 GB disk). Exact memory, CPU, and storage requirements are currently unknown and must be measured and profiled during the pilot evaluation (ADR-0003 remains Proposed; ADR-0004 storage is implemented, but does not establish hardware capacity).
- **Architectural constraints:** No distributed cluster managers (Kubernetes), enterprise service discovery tools (Consul), or distributed message brokers (Kafka) are required or permitted for this capstone deployment.

---

## 6. Scenarios View (+1 View)

The Scenarios View (+1 View) synthesizes and validates the Logical, Process, Development, and Physical views through the critical Core architectural scenarios (SC-01 through SC-08).

```
                      +-----------------------+
                      |      Logical View     |
                      +-----------+-----------+
                                  |
                                  v
+-----------------------+    +----+----+    +-----------------------+
|    Development View   |--->|  +1 View |<---|      Process View     |
|                       |    |Scenarios|    |                       |
+-----------------------+    +----+----+    +-----------------------+
                                  ^
                                  |
                      +-----------+-----------+
                      |     Physical View     |
                      +-----------------------+
```

### 6.1 Scenario Walkthroughs

| Scenario ID | Name & Description (per PRD §3) | Cross-View Verification & Trace |
| --- | --- | --- |
| **SC-01** | **Task-linked document access:** Open a task and follow permitted specifications/decisions; restricted links reveal no target metadata. | - **Logical:** Workspace Scrum entities link to Knowledge documents; permission policy enforces document scope.<br>- **Process:** Authorized task/relationship reads use target scope checks; exact passage inspection uses Flow 5; 404 on restricted targets.<br>- **Development:** `services/workspace/src/scrum` + `services/knowledge/src/documents`; SP-08, SP-06.<br>- **Physical:** Trust Boundaries 1 → 2; both `workspace_db` and `knowledge_db` queried.<br>- **FRs:** FR-16, FR-17, FR-46, FR-59. |
| **SC-02** | **Cited decision rationale:** Ask why JWT was chosen; inspect recorded rationale and exact version. | - **Logical:** Knowledge semantic discovery + evidence citation engine; independent keyword baseline.<br>- **Process:** Flow 3 (scoped semantic path) → Flow 4 (guarded synthesis) → Flow 5 (citation inspection).<br>- **Development:** `services/knowledge/src/retrieval`, `services/knowledge/src/synthesis`; SP-09.<br>- **Physical:** Trust Boundaries 1 → 2 → 4 → 3; pgvector exact discovery for AI, separately evaluated against English full-text keyword search.<br>- **FRs:** FR-21–FR-24, FR-46, FR-53, FR-60. |
| **SC-03** | **Current operational state query:** Ask for blocked tasks using operational state and permitted task links. | - **Logical:** Workspace operational data (`Task`, `Blocker` current state); Knowledge queries Workspace for live status.<br>- **Process:** Flow 4 step 2 injects authorised current operational observations, independently of document search.<br>- **Development:** `services/workspace/src/scrum`; SP-04, SP-10.<br>- **Physical:** Knowledge queries Workspace internal API (Trust Boundary 2) for current task state.<br>- **FRs:** FR-25, FR-26, FR-44. |
| **SC-04** | **Historical blocker resolution:** Find prior blocker handling; distinguish a plan from a recorded outcome. | - **Logical:** `BlockerEvent` append-only history; Knowledge distinguishes operational records from knowledge documents.<br>- **Process:** Authorised Workspace history supplies confirmed events; Flow 4 synthesis must not equate plan documents with recorded outcomes. Flow 3 document search remains a separate path.<br>- **Development:** `services/workspace/src/scrum`; SP-04, SP-11.<br>- **Physical:** Historical events in `workspace_db` audit tables; documents in `knowledge_db`.<br>- **FRs:** FR-18, FR-24, FR-44, FR-53, FR-63. |
| **SC-05** | **Document version replacement:** Replace an API version; current retrieval uses the replacement and history labels the old version. | - **Logical:** `Document`, `DocumentVersion` state machine (Current → Superseded); passage indexing update.<br>- **Process:** Flow 2 (immediate revision transitions former Current to Superseded); retrieval index reflects new Current.<br>- **Development:** `services/knowledge/src/documents`; SP-06, SP-07.<br>- **Physical:** Stored in `knowledge_db`; Workspace checks existing policy and serialises the lifecycle handoff, without copying content or rewriting ACL on each revision.<br>- **FRs:** FR-11, FR-12, FR-19, FR-47. |
| **SC-06** | **Access revocation and non-disclosure:** Classify, grant, revoke/remove membership, then repeat retrieval, answer delivery and citation reads without disclosure. | - **Logical:** Authoritative policy module; handoff guard; generic 404 security invariant.<br>- **Process:** §3.1 handoff guard mutex; permission mutation commits serialized with protected transport; evidence-set validation withholds draft on revocation.<br>- **Development:** `services/workspace/src/relay`, `services/workspace/src/policy`; ADR-0006.<br>- **Physical:** Re-validation across Trust Boundaries 1 & 2 before answer bytes leave server.<br>- **FRs:** FR-03, FR-04, FR-14, FR-28, FR-29, FR-39, FR-50–FR-52, FR-55, FR-59. |
| **SC-07** | **Insufficient evidence:** An unrecorded decision receives Insufficient evidence, including when related documents exist but omit its rationale. | **Logical:** Evidence identity and claim support are distinct. **Process:** Flow 4 short-circuits empty eligible retrieval without a model call; nonempty retrieval may invoke the provider but must still report unsupported requested claims without invented rationale. **Development:** SP-09 and the PRD claim/passage rubric; Stage 8 needs both empty and nonempty-but-insufficient fixtures. **Physical:** Provider traffic depends on the branch, not on the scenario ID. **FRs:** FR-23. |
| **SC-08** | **AI failure with operational continuity:** AI failure leaves work operations, document reading and keyword search usable; questions return an explicit failure state. | - **Logical:** Read-only AI design; independent keyword search engine; Scrum domain unaffected.<br>- **Process:** §3.4; provider relay returns explicit failure state (FR-69); keyword search remains independently available (FR-34); error recorded.<br>- **Development:** `services/knowledge/src/retrieval`; SP-08, SP-12.<br>- **Physical:** PostgreSQL English full-text search (GIN) — independent keyword path; no outbound provider calls; Scrum on `workspace_db` unaffected.<br>- **FRs:** FR-33, FR-34, FR-69. |

---

## 7. Traceability and Review

### 7.1 Requirement Traceability Matrix

Each row retains the exact BR sources and requirement wording from PRD-01 v0.9 and identifies its bounded implementation spec. Section references identify design responsibility, not a claim that every acceptance criterion is fully designed or tested. Specs remain Draft/Unimplemented; read their ACs and planned tests before implementation. BR-15 remains Should/Enhanced, not an added Core commitment.

| FR | BR sources from PRD | Requirement | Architecture responsibility / implementation spec |
| --- | --- | --- | --- |
| FR-01 | BR-01, BR-10 | The system shall derive the effective requester from an authenticated session. | 2.3; 5.2 (identity/session); [SP-01](../specs/001-session.md) |
| FR-02 | BR-01 | An authorised project administrator shall be able to create a project. | 2.1; 3.1; 5.2 (project/membership); [SP-02](../specs/002-project-membership.md) |
| FR-03 | BR-01, BR-10 | The system shall authorise project operations against current project access. | 2.1; 3.1; 5.2 (project/membership); [SP-02](../specs/002-project-membership.md) |
| FR-04 | BR-01, BR-10 | Document reads shall be authorised separately from project access. | 2.2; 2.3; 3.1; 3.2 Flows 2/5 (source access); [SP-06](../specs/006-document-access.md) |
| FR-05 | BR-02 | An authorised PO shall be able to create a Story, Task or Bug Backlog item. | 2.1; 3.2 Flow 1 (Backlog creation); [SP-03](../specs/003-create-task.md) |
| FR-06 | BR-02 | An authorised Sprint manager shall be able to create a planned Sprint with dates and goal. | 2.1; 3.2 Flow 1 (Sprint lifecycle); [SP-05](../specs/005-sprint-lifecycle.md) |
| FR-07 | BR-02 | An authorised Sprint manager shall be able to add an item to a Sprint Backlog. | 2.1; 3.2 Flow 1 (Sprint lifecycle); [SP-05](../specs/005-sprint-lifecycle.md) |
| FR-08 | BR-02 | An authorised Sprint manager shall be able to start a planned Sprint under the fixed Core lifecycle. | 2.1; 3.2 Flow 1 (Sprint lifecycle); [SP-05](../specs/005-sprint-lifecycle.md) |
| FR-09 | BR-03 | An authorised member shall be able to change a work item directly between To Do, In Progress and Done, including reopening Done. | 3.2 Flow 1; 6.1 SC-03/SC-04 (work updates); [SP-04](../specs/004-update-task.md) |
| FR-10 | BR-04 | An authorised author shall be able to create a text/Markdown document or recorded decision. | 2.2; 2.3; 3.1; 3.2 Flows 2/5 (source access); [SP-06](../specs/006-document-access.md) |
| FR-11 | BR-05 | A content revision shall create a distinct immutable document version designated Current and mark the previous Current Superseded in the same operation. | 3.1; 3.2 Flows 2/3/5 (version/lifecycle); [SP-07](../specs/007-version-publication.md) |
| FR-12 | BR-05 | Viewed sources shall display version identity and validity status. | 3.1; 3.2 Flows 2/3/5 (version/lifecycle); [SP-07](../specs/007-version-publication.md) |
| FR-13 | BR-14 | An authorised lifecycle manager shall be able to archive a document/version. | 3.1; 3.2 Flows 2/3/5 (version/lifecycle); [SP-07](../specs/007-version-publication.md) |
| FR-14 | BR-10, BR-14 | Revoked/deleted sources shall not be exposed by subsequent protected reads or answer delivery. | 2.2; 2.3; 3.1; 3.2 Flows 2/5 (source access); [SP-06](../specs/006-document-access.md) |
| FR-15 | BR-05, BR-14 | The system shall display search readiness for a new/revised version. | 3.1; 3.2 Flows 2/3/5 (version/lifecycle); [SP-07](../specs/007-version-publication.md) |
| FR-16 | BR-06 | An authorised member shall be able to create an explicit relationship among tasks, Sprints, documents and decisions. | 2.2; 3.2 Flows 3/5; 3.4 (links/search); [SP-08](../specs/008-linked-keyword-search.md) |
| FR-17 | BR-06, BR-10 | Related-resource navigation shall enforce current target access. | 2.2; 3.2 Flows 3/5; 3.4 (links/search); [SP-08](../specs/008-linked-keyword-search.md) |
| FR-18 | BR-07 | The system shall provide keyword retrieval over permitted current English knowledge. | 2.2; 3.2 Flows 3/5; 3.4 (links/search); [SP-08](../specs/008-linked-keyword-search.md) |
| FR-19 | BR-05, BR-07 | Ordinary retrieval shall exclude Superseded and Archived versions from current results. | 3.1; 3.2 Flows 2/3/5 (version/lifecycle); [SP-07](../specs/007-version-publication.md) |
| FR-20 | BR-07, BR-10 | Retrieval shall deny when required access checks are unknown or fail. | 2.2; 3.2 Flows 3/5; 3.4 (links/search); [SP-08](../specs/008-linked-keyword-search.md) |
| FR-21 | BR-08, BR-10 | The assistant shall use only authorised evidence as answer context. | 3.1; 3.2 Flow 4; 3.4 (cited questions); [SP-09](../specs/009-cited-question.md) |
| FR-22 | BR-08 | Answer citations shall be assigned from retrieved evidence records. | 3.1; 3.2 Flow 4; 3.4 (cited questions); [SP-09](../specs/009-cited-question.md) |
| FR-23 | BR-08 | The assistant shall report insufficient evidence for an unsupported requested claim. | 3.1; 3.2 Flow 4; 3.4 (cited questions); [SP-09](../specs/009-cited-question.md) |
| FR-24 | BR-08 | Answer presentation shall distinguish recorded fact, synthesis and uncertainty. | 3.1; 3.2 Flow 4; 3.4 (cited questions); [SP-09](../specs/009-cited-question.md) |
| FR-25 | BR-09 | Current work-state answers shall use operational observations. | 3.2 Flow 4; 6.1 SC-03 (operational answers); [SP-10](../specs/010-current-work-question.md) |
| FR-26 | BR-09, BR-10 | Operational answer links shall include only readable entities. | 3.2 Flow 4; 6.1 SC-03 (operational answers); [SP-10](../specs/010-current-work-question.md) |
| FR-27 | BR-12 | A permitted answer reader shall be able to inspect a bounded retrieval summary. | 2.1; 2.3 (scoped audit/trace inspection); [SP-13](../specs/013-scoped-inspection.md) |
| FR-28 | BR-08, BR-10 | Current document access shall be validated before answer context is sent to the model. | 3.1; 3.2 Flow 4; 3.4 (cited questions); [SP-09](../specs/009-cited-question.md) |
| FR-29 | BR-10 | Answer delivery and source endpoint reads shall enforce current access. | 3.1; 3.2 Flow 4; 3.4 (cited questions); [SP-09](../specs/009-cited-question.md) |
| FR-30 | BR-08, BR-10 | Retrieved text shall not change the assistant's read-only authority. | 3.1; 3.2 Flow 4; 3.4 (cited questions); [SP-09](../specs/009-cited-question.md) |
| FR-31 | BR-11 | Each significant committed change shall durably record its business audit event or pending audit delivery in the same owning-service transaction. | 2.1; 3.2 Flows 1/4 (audit/provenance capture); [SP-11](../specs/011-audit-and-source-inspection.md) |
| FR-32 | BR-12 | Each answer attempt shall correlate with execution trace and source provenance. | 2.1; 3.2 Flows 1/4 (audit/provenance capture); [SP-11](../specs/011-audit-and-source-inspection.md) |
| FR-33 | BR-13 | Core work operations and permitted document reading shall remain available during AI failure. | 3.4; 4.3 (fallback/evaluation); [SP-12](../specs/012-failure-and-evaluation.md) |
| FR-34 | BR-07, BR-13 | Keyword retrieval shall remain available when generation or semantic retrieval fails. | 2.2; 3.2 Flows 3/5; 3.4 (links/search); [SP-08](../specs/008-linked-keyword-search.md) |
| FR-35 | BR-15 (Should) | The team should be able to view a basic Sprint report derived from work records. | 2.1 Workspace work records; Enhanced report definition/design remains open; no Core implementation slice |
| FR-36 | BR-01 | The system shall establish an application session after successful sign-in through the selected identity mechanism. | 2.3; 5.2 (identity/session); [SP-01](../specs/001-session.md) |
| FR-37 | BR-01, BR-10 | Sign-out shall end the current application session. | 2.3; 5.2 (identity/session); [SP-01](../specs/001-session.md) |
| FR-38 | BR-01 | An authorised membership manager shall be able to add an existing user to a project. | 2.1; 3.1; 5.2 (project/membership); [SP-02](../specs/002-project-membership.md) |
| FR-39 | BR-01, BR-10, BR-14 | An authorised membership manager shall be able to remove a project member. | 2.1; 3.1; 5.2 (project/membership); [SP-02](../specs/002-project-membership.md) |
| FR-40 | BR-02 | An authorised PO shall be able to edit Backlog item content. | 3.2 Flow 1; 6.1 SC-03/SC-04 (work updates); [SP-04](../specs/004-update-task.md) |
| FR-41 | BR-02 | An authorised PO shall be able to reorder the Product Backlog. | 2.1; 3.2 Flow 1 (Sprint lifecycle); [SP-05](../specs/005-sprint-lifecycle.md) |
| FR-42 | BR-02 | An authorised Sprint manager shall be able to complete an active Sprint under the fixed Core policy. | 2.1; 3.2 Flow 1 (Sprint lifecycle); [SP-05](../specs/005-sprint-lifecycle.md) |
| FR-43 | BR-03 | An authorised member shall be able to set a work item's assignee. | 3.2 Flow 1; 6.1 SC-03/SC-04 (work updates); [SP-04](../specs/004-update-task.md) |
| FR-44 | BR-03, BR-06 | An authorised member shall be able to record a blocker event on a work item. | 3.2 Flow 1; 6.1 SC-03/SC-04 (work updates); [SP-04](../specs/004-update-task.md) |
| FR-45 | BR-05 | Withdrawn by ADR-0009 (13 October 2026). ID retained for continuity; not reused. | Atomic replacement continues under FR-11; no publication operation. |
| FR-46 | BR-08, BR-12 | A permitted user shall be able to open the exact cited passage. | 3.1; 3.2 Flow 4; 3.4 (cited questions); [SP-09](../specs/009-cited-question.md) |
| FR-47 | BR-05, BR-07 | The system shall provide deliberately selected historical retrieval with version labels. | 3.1; 3.2 Flows 2/3/5 (version/lifecycle); [SP-07](../specs/007-version-publication.md) |
| FR-48 | BR-14 | An authorised lifecycle manager shall be able to delete a document from active access. | 3.1; 3.2 Flows 2/3/5 (version/lifecycle); [SP-07](../specs/007-version-publication.md) |
| FR-49 | BR-06 | An authorised member shall be able to remove an explicit relationship. | 2.2; 3.2 Flows 3/5; 3.4 (links/search); [SP-08](../specs/008-linked-keyword-search.md) |
| FR-50 | BR-01, BR-10 | A document access manager shall be able to set its access classification. | 2.2; 2.3; 3.1; 3.2 Flows 2/5 (source access); [SP-06](../specs/006-document-access.md) |
| FR-51 | BR-01, BR-10 | A document access manager shall be able to grant document-read access to a current member. | 2.2; 2.3; 3.1; 3.2 Flows 2/5 (source access); [SP-06](../specs/006-document-access.md) |
| FR-52 | BR-01, BR-10, BR-14 | A document access manager shall be able to revoke a document-read grant. | 2.2; 2.3; 3.1; 3.2 Flows 2/5 (source access); [SP-06](../specs/006-document-access.md) |
| FR-53 | BR-07, BR-08 | The system shall provide semantic passage retrieval for English natural-language questions over permitted current knowledge. | 3.1; 3.2 Flow 4; 3.4 (cited questions); [SP-09](../specs/009-cited-question.md) |
| FR-54 | BR-08 | The assistant shall surface detected unresolved evidence conflicts. | 3.1; 3.2 Flow 4; 3.4 (cited questions); [SP-09](../specs/009-cited-question.md) |
| FR-55 | BR-10, BR-12 | Citation opening shall validate current source access. | 3.1; 3.2 Flow 4; 3.4 (cited questions); [SP-09](../specs/009-cited-question.md) |
| FR-56 | BR-10, BR-11 | An audit inspector shall be able to read audit events within granted scope. | 2.1; 2.3 (scoped audit/trace inspection); [SP-13](../specs/013-scoped-inspection.md) |
| FR-57 | BR-12 | Each answer attempt shall have an execution record with durable minimum provenance before protected provider/answer handoff. | 2.1; 3.2 Flows 1/4 (audit/provenance capture); [SP-11](../specs/011-audit-and-source-inspection.md) |
| FR-58 | BR-10, BR-12 | An execution inspector shall be able to read execution records within granted scope. | 2.1; 2.3 (scoped audit/trace inspection); [SP-13](../specs/013-scoped-inspection.md) |
| FR-59 | BR-01, BR-10 | Protected read surfaces shall conceal resource existence from unauthorised requesters. Where the interface is HTTP, the response is 404. | 2.2; 3.2 Flows 3/5; 3.4 (links/search); [SP-08](../specs/008-linked-keyword-search.md) |
| FR-60 | BR-08, BR-12 | Document citation identity shall be validated before release. | 3.1; 3.2 Flow 4; 3.4 (cited questions); [SP-09](../specs/009-cited-question.md) |
| FR-61 | BR-05, BR-12, BR-14 | An unavailable cited version shall be reported without substitution. | 3.1; 3.2 Flows 2/3/5 (version/lifecycle); [SP-07](../specs/007-version-publication.md) |
| FR-62 | BR-04 | An authorised author shall be able to import text/Markdown content as a document. | 2.2; 2.3; 3.1; 3.2 Flows 2/5 (source access); [SP-06](../specs/006-document-access.md) |
| FR-63 | BR-07 | Displayed retrieval results shall identify their permitted source, version and validity. | 2.2; 3.2 Flows 3/5; 3.4 (links/search); [SP-08](../specs/008-linked-keyword-search.md) |
| FR-64 | BR-01 | An authorised project administrator shall be able to edit project descriptive metadata. | 2.1; 3.1; 5.2 (project/membership); [SP-02](../specs/002-project-membership.md) |
| FR-65 | BR-04 | An authorised author shall be able to update document organisational metadata. | 2.2; 2.3; 3.1; 3.2 Flows 2/5 (source access); [SP-06](../specs/006-document-access.md) |
| FR-66 | BR-02 | An authorised Sprint manager shall be able to edit planned Sprint details. | 2.1; 3.2 Flow 1 (Sprint lifecycle); [SP-05](../specs/005-sprint-lifecycle.md) |
| FR-67 | BR-02 | An authorised Sprint manager shall be able to remove an item from a Sprint Backlog. | 2.1; 3.2 Flow 1 (Sprint lifecycle); [SP-05](../specs/005-sprint-lifecycle.md) |
| FR-68 | BR-01, BR-10 | Expired sessions shall be rejected for protected operations. | 2.3; 5.2 (identity/session); [SP-01](../specs/001-session.md) |
| FR-69 | BR-13 | An AI question shall return an explicit failure state, not generated content, when the AI dependency fails. | 3.1; 3.2 Flow 4; 3.4 (cited questions); [SP-09](../specs/009-cited-question.md) |
| FR-70 | BR-01, BR-07, BR-13 | A current project member should be able to search task titles and descriptions by keyword without AI. | 2.1 Workspace task search; 3.4 independent outage path; [SP-08](../specs/008-linked-keyword-search.md); ADR-0016 |

Inventory: 69 active FR rows plus the retained Withdrawn FR-45 row; FR-35 is separately Enhanced. This is an explicit responsibility/source mapping, not verified end-to-end BR/SC/EX test coverage. Stage 8 must complete scenario/exception assertions; open UX/diagram findings remain tracked in the consistency review.

### 7.2 Architectural Quality Evaluation (Design Conformance)

The following is an author check of design topics and remaining gaps. It is not a standards-conformance assessment, independent approval, complete semantic coverage or runtime evidence.

| View / Aspect | Quality Criteria | Design Status | Evaluation Evidence & Remaining Gaps |
| --- | --- | --- | --- |
| **Logical View** | Modularity, separation of concerns, data ownership | **Draft / Gap** | Owned migrations and cross-database credential negatives executed under ADR-0004. Runtime application boundaries remain unimplemented. |
| **Process View** | Concurrency safety, race-condition mitigation, timeouts | **Draft / Gap** | ADR-0006 handoff guard; buffered delivery; whole-draft withholding; explicit candidate timeouts. Requires concurrency tests under paused requests. |
| **Development View** | Codebase maintainability, layer independence | **Draft / Gap** | Monorepo layout; domain isolated from adapters; context harness exists; execution evidence is recorded separately. Application handlers not yet implemented. |
| **Physical View** | Deployment viability, trust boundary security | **Draft / Gap** | Single developer machine design; 4 distinct trust boundaries; per-service DB users. Sizing remains an unmeasured candidate estimate. |
| **+1 Scenarios View** | End-to-end requirement validation | **Draft / Gap** | SC-01 through SC-08 described against PRD journeys; complete SC/EX assertion mapping and runtime execution remain open. |

### 7.3 Open Decisions and Handoff
- **Pending Owner Decisions:** Initial access/Sprint/lifecycle/release directions are confirmed in ADR-0007–ADR-0011. ADR-0013 confirms current-read entitlement for unavailable citation identity and generic withheld-answer responses. Additional delegation, physical retention, cleanup protocol and application stack/provider details remain open. OD-12's storage portion is selected and implemented under ADR-0004; this does not approve other proposals.
- **Downstream Handoff:**
  - Stage 4 (Data Design): Implements physical schemas adhering to logical data ownership (§2.2).
  - Stage 5 (API Design): Finalizes OpenAPI specifications following boundary contracts (§2.3, §3.3).
  - Stage 6 (UI/UX): Designs interface states aligning with buffered delivery, citation modals, and AI fallback (§3.1, §3.4).
  - Stage 7 (UML Diagrams): Validates and synchronizes diagram artifacts against 4+1 views.
  - Stage 8 (Test Plan): Derives test cases from scenario exception paths and handoff guard invariants (§3.1, §6.1).

---

**v0.5 corrective review:** Restores complete ADR-0006 handoff/lifecycle rules, Current-only default retrieval, nonempty-but-insufficient evidence behavior, and explicit AI failure. Replaces grouped FR ranges with exact PRD BR/FR responsibility rows; clarifies proposed topology and evidence limits. No business scope, accepted ADR or contract changes. Runtime enforcement, deployment, full SC/EX coverage and diagram semantics remain unverified.

**v0.6 storage implementation:** Records owner-authorised ADR-0004, PostgreSQL 17/pgvector 0.8.2, owned migrations and storage tests. The two-service flow and HTTP contracts are unchanged, so no new application-flow diagram is introduced. Complete application and corpus evaluation evidence remains open.

**v0.7 change:** Applies owner-confirmed ADR-0007–ADR-0011, immediate Current revision, Workspace-first creation, all protected response handoffs and 68 active FR traces. Migration 002 storage tests passed; application/concurrency and full downstream diagram review remain pending.

**v0.8 change:** Aligns Flow 3 and SC-02/03/04/08 with ADR-0004's independent English full-text keyword baseline and pgvector exact AI discovery. Fusion remains unselected pending pilot evidence and a separate ADR. No application handler or quality result is claimed.

**v0.9 change:** Resynchronizes all FR wording/BR sources with PRD-01 v0.6, adds FR-70 and ADR-0007–0017 decisions, corrects `permission_revision`, and specifies durable manifests, partial answers and terminal withholding in Flow 4. Runtime ordering and per-handoff schema remain unproven.

**v0.10 change — 16 October 2026:** OWNER-Q-01 resolves Q-1/Q-2: unfinished Backlog returns become To Do; exact immutable manifests are durable before guard acquisition and must match guarded revalidation. Stale attempts abort without bytes and retry outside the guard. Schema/handler enforcement remains unimplemented.

**v0.11 editorial correction — 17 October 2026:** Corrects the hardware paragraph to acknowledge implemented ADR-0004 storage. PRD-01 v0.8 changes handoff wording only; its FR/AC and this architecture's permission, transport and storage behavior are unchanged. Current candidate toolchain versions and compatibility gates are maintained in [TECH-STACK-01](tech-stack.md).

## 18 October design correction handoff

SYS-05 is corrected by distinguishing target-member descriptive role from caller authority and document citations from operational observation identity. Proposed ADR-0018–ADR-0023 refine the existing two-service design; they are not new owner-approved policies or runtime evidence. SYS-01 still blocks provider relay pending storage/claim/guard/adapter tests. Additional non-read delegation and retention/identity/provisioning remain open. The source/route inventories are reconciled in the current register and UX entry; dated snapshots remain historical.

## NEXT-12 additive handoff storage

Knowledge migration 003 stores complete immutable manifest/evidence JSON and exact raw bytes in one transaction, generated SHA-256/receipt identity and append-only outcomes. A run/actor/project FK prevents rebinding preparation to another owned execution. Workspace migration 004 reserves protected_handoff in existing idempotency_record with permanent immutable fence/process and infinity expiry; a fresh insertion returns a fence, while duplicate/changed claims return none. Outcomes bind the exact claim fence. Commit/acknowledgement and current permission/guard/transport checks remain application responsibilities. Isolated SQL evidence does not implement active-process fencing or prove any provider byte was blocked/delivered. No development database upgrade or framework/provider selection.

## Editorial reconciliation — 25 October 2026

Version 0.16 corrects the deployment sketch to English full-text search (GIN) plus independent pgvector discovery, restores FR-70 inside the traceability table and updates its PRD source label. This aligns existing ADR-0004 and PRD-01 wording; no service boundary, requirement, permission policy or application behavior changes. Full downstream semantic and runtime acceptance remain open.


## Backend layering clarification — 4 November 2026

[HOTFIX-BACKEND-42-01](implementation/features/hotfix-backend-layering/plan.md) clarifies the inspected Workspace structure, transaction and denial responsibilities and known read/pagination limits in §4.2. Metadata reconciliation is separate from runtime evidence; no handler, policy, service boundary or accepted decision changes.
