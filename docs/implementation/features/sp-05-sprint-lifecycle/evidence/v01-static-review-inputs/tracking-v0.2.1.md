# SP05-AG01 tracking snapshot

**Artifact ID:** SP05-AG01-TRACKING\
**Version/date:** 0.2.1 Draft · 5 November 2026\
**Run ID:** antigravity-20261105T120000\
**Reviewer:** Antigravity (Google DeepMind Advanced Agentic Coding)\
**Inspected Merge Commit:** `b40a014` (Merge PR #1 from `codex/sp-05`)\
**PR Final HEAD:** `ff93ebe44306553da1a602a171cb9560455c58d3` (`ff93ebe`)\
**Feature Commit:** `0bb0f57d9fe3893fb66a0aded3939aed2605eaf8` (`0bb0f57`)\
**Base Commit:** `1cb54f3cfdfd650caef35dce6d5fd0fd1e32a1d6` (`1cb54f3`)\
**Author final-source.json SHA-256 (preserved):** `174c1fbabbf70f2b0210eef1d143b3003f0a0db358da78d23b8ca32bfd807b46`\
**Reviewer Inputs Manifest:** `evidence/antigravity-assignment/reviewer-inputs.json`\
**Reviewer Git Blob Manifest:** `evidence/antigravity-20261105T120000/source-manifest.json`

> **Scope Note:** This snapshot is a dated reviewer assessment representing a **bounded static inspection** of 18 core files. It is not a competing implementation task board, production fix, or release acceptance. FEAT-SP05-01 plan.md remains the only mutable authoritative status table for P00–P15.

---

## 1. Source Identity & Freeze Check (Checkpoint 1)

### Commit and Tree Boundary
- **Inspected Tree:** `b40a014` (merged into `origin/main`), containing PR commits `0bb0f57` (feature implementation) and `ff93ebe` (PR publication receipt).
- **PR Head:** `ff93ebe` on `codex/sp-05`.
- **Base:** `1cb54f3` on `main`.
- **Git Blob Verification:** Blob hashes of 18 core contract, runtime, migration, and test fixture files were verified directly via `git rev-parse b40a014:<path>` without checking out into the sandbox, recorded in `source-manifest.json`:
  - `contracts/openapi/workspace.openapi.json`: `3e85581561d32677f3ad7e8606ec26754819b942`
  - `services/workspace/src/sprints/store.ts`: `868efe19169435396d6289a4c7dd36d632ed50ee`
  - `services/workspace/src/sprints/http.ts`: `0d1d07946878bfdc4c27cfb103e53fa2c3cb9210`
  - `services/workspace/src/sprints/authority.ts`: `a8f9598ec8ac637c67ca5433a672813694caef03`
  - `services/workspace/src/sprints/types.ts`: `25d250a69dbc531a0e3e7a81d8517546cc2df2a2`
  - `services/workspace/src/sprints/outcomes.ts`: `0ca126ab0824dee2b569f411cacb0ee791c81ead`
  - `services/workspace/migrations/011-sprint-lifecycle.up.sql`: `e7a69899b0eb82d369e764606f7e49b0d4e2af0d`
  - `services/workspace/migrations/011-sprint-lifecycle.down.sql`: `ed7ada80db6c626e6a447ce5fcf12cbdfb547d82`
  - `apps/web/src/SprintWorkspace.tsx`: `c2e8fed2358027b9254b1b2d8a8c9f71f0b14682`
  - `apps/web/src/sprints.ts`: `522cc0cd34e15d4b8fa08026c2a7ae76b6a320d9`
  - `tests/workspace/sprint-storage.test.mjs`: `ee2823cc13dc09ec5d07c7db4cbdabfced0469d6`
  - `tests/workspace/sprint-http.test.mjs`: `692193cee76b0842338f5e6f4090ff420d493af1`
  - `tests/workspace/sprint-security.test.mjs`: `77f8612ee343ebda9c5beec87aafe92ae0292cec`
  - `tests/workspace/sprint-concurrency.test.mjs`: `98819e5b0dbbb0508921e3560e70081f6218966e`
  - `tests/workspace/sprint-controller.test.mjs`: `100654ac6ac8810f6ed7a641dda11869769d4ec7`
  - `tests/workspace/sprint-ui.test.mjs`: `091200dcf9f3c2ee43546a784306e36f56ad1d68`
  - `tests/workspace/sprint-browser.test.mjs`: `c59b2caa16bb83880e86bbf4baa81a12b5ebce93`
  - `tests/workspace/sprint-fixture.mjs`: `23efe8eaa614ae4dbc31d2c905ea00f01ceccbc7`

---

## 2. P00–P15 Assessment Snapshot

> **Terminology Note:** To maintain strict separation between author claims and reviewer verification:
> - **Pass (source inspection):** Deliverable verified by direct static analysis of code, contracts, migrations, or git history within the bounded scope.
> - **Author evidence reviewed; reviewer verification not completed:** Author logs/evidence reviewed and verified present, but independent execution by Antigravity was not completed.

| Task | Deliverable | Source & Author Evidence | Reviewer Assessment | Gaps / Gate Status |
|------|-------------|--------------------------|---------------------|-------------------|
| **P00** | Isolated `codex/sp-05` from verified `main`; dirty worktrees preserved | Base `1cb54f3`; git history confirms PR merged without importing unrelated dirty work | **Pass (source inspection)** | — |
| **P01** | Register plan, WBS, 16 task briefs, parent links | `plan.md`, `breakdown.md`, `README.md`, 18 task briefs in `tasks/` | **Pass (source inspection)** | — |
| **P02** | Align OpenAPI v0.2.14, data-model.json, SP-05 spec v0.7.4; 5 actions; Proposed ADR-0030 | `workspace.openapi.json`, `data-model.json`, `005-sprint-lifecycle.md`, `0030-sprint-lifecycle-mechanics.md` | **Pass (source inspection)** | — |
| **P03** | 011 migration forward/repeat/reverse, immutable receipts, rollback refusal | `011-sprint-lifecycle.up.sql`, `011-sprint-lifecycle.down.sql`; `sprint-storage.test.mjs`; author `storage-attempt1.txt` | **Author evidence reviewed; reviewer verification not completed** | Gate unrun: requires real PostgreSQL/Docker |
| **P04** | 5 private actions (`sprint-create`, `sprint-allocate`, `sprint-start`, `sprint-complete`, `backlog-order`); audited grants; revoke/rejoin negatives; discovery | `services/workspace/src/sprints/authority.ts`, `011-sprint-lifecycle.up.sql` (trigger `protect_sprint_action`), `sprint-security.test.mjs` | **Author evidence reviewed; reviewer verification not completed** | Gate unrun: requires real PostgreSQL/Docker |
| **P05** | Create Planned Sprint; server time; atomic audit/replay; input negatives | `services/workspace/src/sprints/store.ts` (`operation==='createSprint'`), `http.ts` (`/projects/:project_id/sprints`), `sprint-http.test.mjs` | **Author evidence reviewed; reviewer verification not completed** | Gate unrun: requires real PostgreSQL/Docker |
| **P06** | Scoped reads (`get`, `list`, `items`); cursor paging; post-wait session check | `services/workspace/src/sprints/store.ts` (`get`, `list`, `items`), `http.ts`, `sprint-http.test.mjs` | **Author evidence reviewed; reviewer verification not completed** | Gate unrun: requires real PostgreSQL/Docker |
| **P07** | Exclusive allocation; Sprint revision check; Task location recheck; competing handler schedule | `store.ts` (`operation==='allocateTask'`), `sprint-concurrency.test.mjs` | **Author evidence reviewed; reviewer verification not completed** | Gate unrun: requires real PostgreSQL/Docker |
| **P08** | Planned→Active; unique Active guarantee; completed denied; replay; empty Sprint | `store.ts` (`operation==='startSprint'`), `sprint-concurrency.test.mjs` | **Author evidence reviewed; reviewer verification not completed** | Gate unrun: requires real PostgreSQL/Docker |
| **P09** | Done retained; unfinished→To Do; counts; task-ID append order; rollback on error | `store.ts` (`operation==='completeSprint'`), `sprint-http.test.mjs`, `sprint-storage.test.mjs` | **Author evidence reviewed; reviewer verification not completed** | Gate unrun: requires real PostgreSQL/Docker |
| **P10** | Complete Backlog permutation; 1MiB bodyLimit; backlog_revision check; no-op semantics | `store.ts` (`operation==='reorderBacklog'`), `http.ts`, `sprint-concurrency.test.mjs`, `reorder-races-final.json` | **Author evidence reviewed; reviewer verification not completed** | Gate unrun: requires real PostgreSQL/Docker |
| **P11** | Sprint UI: create/read/start/complete; forms, focus, error states | `apps/web/src/SprintWorkspace.tsx`, `apps/web/src/sprints.ts`, `tests/workspace/sprint-ui.test.mjs`, `sprint-browser.test.mjs` | **Author evidence reviewed; reviewer verification not completed** | Gate unrun: DOM tests require PostgreSQL 011 + HTTPS + Node runner; browser tests require TLS + Playwright/Edge |
| **P12** | Allocation UI: sequential multi-select; per-item outcomes; reload recovery | `apps/web/src/sprints.ts` (`SprintController.allocate`), `tests/workspace/sprint-controller.test.mjs` | **Author evidence reviewed; reviewer verification not completed** | Gate unrun: requires Node test runner (pure JS/in-memory) |
| **P13** | Reorder UI: full-list up/down; 409 discard and refresh; no automatic resend | `apps/web/src/sprints.ts` (`SprintController.reorder`, `move`), `tests/workspace/sprint-controller.test.mjs` | **Author evidence reviewed; reviewer verification not completed** | Gate unrun: requires Node test runner (pure JS/in-memory) |
| **P14** | Actual producer races (SP04-P08 integration) with real DB barriers | `tests/workspace/sprint-concurrency.test.mjs` (barrier tests, `pauseTaskQuery`, `taskBarrier`), `reorder-races-final.json` | **Author evidence reviewed; reviewer verification not completed** | Gate unrun: requires real PostgreSQL/Docker |
| **P15** | Consolidated regression and handoff | `regression2.json` (343/343), `final-checks.json`, `final-preflight.json`, `handoff.md` | **Author evidence reviewed; reviewer verification not completed** | Gate unrun: independent full suite not executed |

---

## 3. Code & Assertion Inspection (Checkpoint 2)

Direct inspection of the implementation code was performed across core files to verify whether the business logic and constraints match the requirements:

### FR-06 / AC-06: Create Sprint
- **Source Inspection:** `services/workspace/src/sprints/store.ts` (`execute`, lines 40-52):
  - Validates `v.goal`: rejects empty/whitespace strings (`!text(v.goal)||!v.goal.trim()`).
  - Validates dates: rejects invalid ISO dates, non-existent calendar dates, and reversed/equal dates (`!date(v.start_date)||!date(v.end_date)||v.start_date>=v.end_date`).
  - Server-created timestamp: stamps `date_trunc('milliseconds',clock_timestamp())` as `created_at`.
  - Replay handling: checks `saveSprintOutcome`, hashes canonical payload, and returns original outcome if key matches.
- **HTTP Layer:** `services/workspace/src/sprints/http.ts`: enforces `bodyLimit: 8192`, `content-type: application/json` (415 on mismatch), schema validation via AJV (400 on unexpected/missing fields), CSRF/Origin check (403).
- **Test Alignment:** `sprint-http.test.mjs` tests empty goal, reversed dates, feb-30 date, payload size overflow (413), and non-json content (415).

### FR-07 / AC-07: Allocate Task
- **Source Inspection:** `store.ts` (`operation==='allocateTask'`):
  - Checks Sprint state: must be `planned` or `active` (`!['planned','active'].includes(current.state)` throws conflict).
  - Checks Task location: must be `backlog` (`task.location_kind!=='backlog'` throws conflict).
  - Row locking: `SELECT ... FROM workspace.task WHERE ... FOR UPDATE`.
  - Checks existing allocation: prevents allocating a task that was previously marked `completed` in this sprint.
  - Updates: changes `task.location_kind='sprint'`, sets `location_sprint_id`, bumps `task.revision`, bumps `sprint.revision`, logs `sprint-allocate` in `businessAudit`.
- **Test Alignment:** `sprint-concurrency.test.mjs` tests competing allocations on the same task across two concurrent transactions hitting SQL barriers; asserts only one transaction commits allocation.

### FR-08 / AC-08: Start Sprint
- **Source Inspection:** `store.ts` (`operation==='startSprint'`):
  - Validates current state: `current.state!=='planned'` throws conflict.
  - Active Sprint uniqueness: `SELECT 1 FROM workspace.sprint WHERE project_id=$1 AND state='active'` throws conflict if another sprint in the same project is active.
  - Server-started timestamp: sets `started_at=date_trunc('milliseconds',clock_timestamp())`.
  - Replay: same idempotency key returns committed 200 without second state transition.
- **Test Alignment:** `sprint-concurrency.test.mjs` tests two concurrent starts queued behind a barrier, verifying exactly one active sprint is created and the other receives 409.

### FR-41 / AC-41: Reorder Backlog
- **Source Inspection:** `store.ts` (`operation==='reorderBacklog'`):
  - Validates `expected_revision`: must match `project.backlog_revision`.
  - Permutation check: loads all tasks in backlog (`SELECT task_id, revision ... FOR UPDATE`), compares set of IDs. Duplicates throw 400; missing or extra IDs throw 409.
  - No-op check: if order is identical, writes only idempotency receipt; does not bump task revisions or write audit.
  - Scale invariance: numeric scale differences (e.g. 1.0 vs 1) do not cause unnecessary revision bumps.
- **HTTP Layer:** `http.ts`: sets `bodyLimit: 1048576` (1MiB) for reorder payload.
- **Test Alignment:** `sprint-concurrency.test.mjs` verifies that concurrent task creation, allocation, or sprint completion invalidates a queued reorder via 409 without leaving partial writes.

### FR-42 / AC-42: Complete Sprint
- **Source Inspection:** `store.ts` (`operation==='completeSprint'`):
  - Validates state: `current.state!=='active'` throws conflict.
  - Unfinished tasks return: tasks not `done` have their state set to `todo`, `location_kind='backlog'`, `location_sprint_id=NULL`, and are appended to the backlog with updated `backlog_position` ordered by `task_id`.
  - Done tasks: `location_kind='completed'`, allocation set to `completed`.
  - Counts: returns `retained_done_count` and `returned_unfinished_count`.
  - Server-completed timestamp: sets `completed_at=date_trunc('milliseconds',clock_timestamp())`.
- **Test Alignment:** `sprint-http.test.mjs` and `sprint-concurrency.test.mjs` verify mixed completion, verifying that done tasks remain associated with the sprint and unfinished tasks return to To Do.

### FR-31 / AC-31 & Authority
- **Authority Invariants:** `services/workspace/src/sprints/authority.ts` defines 5 separate private actions: `sprint-create`, `sprint-allocate`, `sprint-start`, `sprint-complete`, `backlog-order`.
- **Storage Protection:** `011-sprint-lifecycle.up.sql` creates trigger `protect_sprint_action` preventing runtime role from inserting or granting capabilities (only `workspace_owner` can provision; runtime can only invalidate).
- **Audit & Receipt:** Every mutation writes `businessAudit` and `idempotency_record` atomically within `this.projects.transaction`.

### Client-Side Recovery & State (`apps/web/src/sprints.ts`)
- **Recovery Invariants:** `SprintController` stores in-flight operations under `sessionStorage` key `sacw.sprint.pending.v1`.
- **Validation:** Enforces strict structural checks (`validRecovery`): matches actor, project ID, valid operation names, UUID keys, and body size limits (8192 bytes for standard mutations, 1MiB for reorder).
- **Sequential Allocation:** Multi-select invokes `allocateTask` sequentially per task with distinct keys; failure on one task does not retry earlier confirmed items.
- **Conflict Handling:** Definitive 409 on reorder clears local optimistic positions, re-fetches from server, and never automatically resubmits with a new key.
- **Cleanup:** Explicit logout invokes `SprintController.clearPending(storage)` to remove recovery keys.

### FR-66 / FR-67 Scope Clarification
- **OpenAPI Contract:** Operations `editSprint` (`PATCH /sprints/{sprint_id}`) and `removeAllocation` (`DELETE /sprints/{sprint_id}/items/{task_id}`) remain declared in `contracts/openapi/workspace.openapi.json` with tags `x-requirements: ["FR-66"]` and `["FR-67"]`.
- **Runtime & Discovery Boundary:** These operations are **unimplemented in backend runtime** (`http.ts` does not register their routes; `store.ts` does not implement them) and are **not advertised through project/sprint discovery** (`authority.ts` does not include `sprint-edit` or `sprint-remove-allocation`). This matches the owner-directed Could tier exclusion (ADR-0010).

---

## 4. Reviewer Execution Gates & Unrun Boundary

| Test Suite / Gate | Nature | Technical Requirements | Status for Antigravity | Specific Blocker Reason |
|-------------------|--------|------------------------|------------------------|-------------------------|
| `context:*`, `docs:*`, `contracts:*` | Static / Lint / Schema | Node.js + project scripts | Ran in author CI (`ff93ebe`); not run locally | Context commands require Node execution |
| `sprint-storage.test.mjs` | Database / Migration | PostgreSQL 17 + pgvector | **Unrun** | Reviewer sandbox lacks Docker daemon and local PostgreSQL service |
| `sprint-http.test.mjs` | Database / HTTP API | Fastify + PostgreSQL | **Unrun** | Reviewer sandbox lacks PostgreSQL/Docker |
| `sprint-security.test.mjs` | Database / Authority | PostgreSQL + Auth triggers | **Unrun** | Reviewer sandbox lacks PostgreSQL/Docker |
| `sprint-concurrency.test.mjs` | Database / Concurrency | PostgreSQL + DB barriers | **Unrun** | Reviewer sandbox lacks PostgreSQL/Docker |
| `sprint-ui.test.mjs` | Real DB + HTTPS DOM | JSDOM + PostgreSQL 011 + local HTTPS (via `sprint-ui-fixture.mjs`) | **Unrun** | Requires running PostgreSQL 011 instance and local HTTPS certificate setup |
| `sprint-controller.test.mjs` | Pure In-Memory Controller | Node.js (No PostgreSQL, mock transport) | **Unrun** | Reviewer sandbox does not have Node test runner available in current path |
| `sprint-browser.test.mjs` | Live E2E / Browser | HTTPS + Playwright + Edge | **Unrun** | Reviewer sandbox lacks HTTPS certificates, browser binaries, and Playwright execution environment |

---

## 5. Finding Register

| ID | Severity | Category | Description |
|----|----------|----------|-------------|
| **F-ENV-01** | Environment Blocker | Reviewer Verification Incomplete | Antigravity was unable to independently run any test suites (database, DOM, controller, or browser) due to sandbox environment constraints (lack of Docker/PostgreSQL, lack of Node test runner in sandbox environment, and lack of Playwright/browser). This keeps reviewer verification incomplete under DoD. |
| **F-COMMIT-01** | Documentation / Alignment | Resolved in v0.2 | v0.1 incorrectly reported PR HEAD as `0bb0f57` instead of `ff93ebe`, and did not record the merge commit `b40a014`. Corrected in v0.2. |
| **F-SCOPE-01** | Scope Clarification | Clarified in v0.2.1 | FR-66 (`editSprint`) and FR-67 (`removeAllocation`) are declared in `workspace.openapi.json`, but are **unimplemented in runtime handlers and not advertised via discovery**. Confirmed compliant with ADR-0010 (Could tier, deferred by owner direction). |

---

## 6. Recommendation

**`Verification incomplete: F-ENV-01`**

- **Static Inspection Finding:** Bounded static inspection of 18 core files confirms that code implementation (`store.ts`, `http.ts`, `authority.ts`, `011-sprint-lifecycle.up.sql`, `SprintWorkspace.tsx`, `sprints.ts`) aligns with the specifications for FR-06, FR-07, FR-08, FR-41, FR-42, and FR-31.
- **Runtime Verification Finding:** Because no test gates could be independently executed by Antigravity in this environment, this report records **author evidence reviewed**, not independent Antigravity test verification.
- **Gate Status:** AG01 static review is delivered. The runtime verification gate cannot be closed by Antigravity under this environment. The decision to accept author evidence and CI runs (`ff93ebe` GitHub Actions passing) rests with the project owner and Codex.
