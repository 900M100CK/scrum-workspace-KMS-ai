# SP-04 AG01 — Antigravity source cross-check

**Artifact ID:** SP04-AG01-RESULT\
**Version/date:** 0.1 Draft · 3 November 2026\
**Status:** Findings only\
**Reviewer:** Antigravity (assigned reviewer)\
**Active branch:** `codex/sp-04`\
**HEAD commit:** `6b837fd52e01709f72bfe2de6cb96f0e9cc52653`\
**Assignment reference:** [SP04-AG01](../tasks/AG01-source-crosscheck.md) v0.3 / [SP04-COORD-01](../COORDINATION.md) v0.1 / [FEAT-SP04-01](../plan.md) v0.3

---

## 1. Sources and scope

This review is a bounded, read-only source and contract cross-check supporting SP-04.1. In accordance with the assignment brief, no runtime code, migrations, shared contracts, task statuses, registers, or git state have been altered.

### Inspected sources and hash verification

The 42 files recorded in [evidence/p01-source-inputs.json](../evidence/p01-source-inputs.json) were verified using SHA-256. All 42 files matched their recorded hashes exactly (0 drift detected). Key inspected sources include:

| File / Component | Version / Hash (prefix) | Inspected boundary / role |
| --- | --- | --- |
| `specs/004-update-task.md` | v0.7.1 Draft (`7437fa4...`) | Target canonical specification for SP-04 |
| `docs/sdlc/use-cases.md` | UC-04 (`42d7655...`) | Use case 04 (lines 151–205: main, Alt-1, Alt-2, EX-01–04) |
| `contracts/openapi/workspace.openapi.json` | OpenAPI 3.1.0 (`58b8d4f...`) | Operation declarations for `editTask`, `setTaskState`, `setAssignee`, `recordBlocker`, `listBlockerEvents` |
| `services/workspace/migrations/001-store.up.sql` | Migration 001 (`c260273...`) | Base tables (`task`, `blocker_event`, `sprint_allocation`, `business_audit`, `idempotency_record`) |
| `services/workspace/migrations/003-work-location.up.sql` | Migration 003 (`aa47a07...`) | Location constraints, triggers, and completed allocation immutability |
| `services/workspace/migrations/007-project-membership.up.sql` | Migration 007 (`961cefd...`) | Safe revision constraints, authority provisioning audit |
| `services/workspace/migrations/008-project-outcomes.up.sql` | Migration 008 (`31463bc...`) | Project idempotency record shape |
| `services/workspace/migrations/009-task-creation.up.sql` | Migration 009 (`c4656ca...`) | Task creation origin, `project_outcome_shape` constraint |
| `services/workspace/src/tasks/store.ts` | v0.2.12 (`22a4c14...`) | Current task store (createTask, getTask, listTasks only) |
| `services/workspace/src/tasks/http.ts` | v0.2.12 (`1cffaa6...`) | Fastify routes and schema guards for tasks |
| `services/workspace/src/tasks/outcomes.ts` | v0.2.12 (`7134371...`) | Outcome storage adapter (createTask only) |
| `services/workspace/src/projects/operator.ts` | v0.2.12 (`f72c019...`) | Capability provisioning logic |
| `services/workspace/src/projects/store.ts` | v0.2.12 (`183189a...`) | Reference project store, `removeMember`, transaction pattern |
| `docs/implementation/features/sp-04-update-task/source-review.md` | v0.2 Draft (`ae8e348...`) | Codex P01 source review map (C01–C06) |

---

## 2. C01–C06 Dispositions

Each item from the P01 reconciliation queue in `source-review.md` was inspected against the underlying sources.

### C01: Conflict response payload vs generic Error schema
- **Claim:** UC-04 EX-01 states that a stale conflict returns the current revision token, whereas OpenAPI 409 responses use the generic `Error` schema without a `current_revision` property.
- **Source evidence:**
  - `docs/sdlc/use-cases.md#L191`: `EX-01 (Step 2 — Board state): Revision token is stale — another member committed a newer change → System returns conflict error with the current revision token; does not overwrite (NFR-02, AC-09).`
  - `contracts/openapi/workspace.openapi.json#L1888-1912`: Schema `Error` has `additionalProperties: false` with fields `code`, `message`, `run_id` only.
- **Verdict:** **CONFIRMED** factual contract/use-case divergence.
- **Nature:** Factual mismatch with an unresolved design choice.
- **Recommendation:** Do not invent ad-hoc fields in the 409 response. Returning current state on a conflict without verifying that the caller still holds read access risks data leakage. The standard design choice is to instruct the client upon receiving 409 `stale_revision` to perform a fresh `getTask` under current access rules.

### C02: Blocker creation response vs derived Blocked status
- **Claim:** UC-04 Step 6 states that the member receives the blocker event record and the current derived Blocked status, but the OpenAPI 201 `Blocker` schema contains neither `blocked` nor Task `revision`.
- **Source evidence:**
  - `docs/sdlc/use-cases.md#L182`: `6. **Member** receives the event record and the current derived Blocked status.`
  - `contracts/openapi/workspace.openapi.json#L1572-1616`: Schema `Blocker` defines `event_id`, `task_id`, `status` (`'open' | 'resolved'`), `description`, `outcome`, `actor_id`, `recorded_at`, `sequence`. Note that `status` is the event type, not the task's boolean `blocked` status.
- **Verdict:** **CONFIRMED** factual mismatch.
- **Nature:** Factual mismatch with an unresolved design choice.
- **Recommendation:** P02 must reconcile whether the client reads derived `blocked` and new Task `revision` via a separate `getTask` / board refresh, or if a coordinated schema update is required. Uncoordinated additions to `Blocker` must not occur.

### C03: Unknown commit / retryable failure semantics
- **Claim:** UC-04 EX-03 refers to returning explicit failed/pending states and retryable operations, whereas transport contracts define standard 503 Unavailable and original-key reconciliation.
- **Source evidence:**
  - `docs/sdlc/use-cases.md#L193`, `#L204`: `EX-03: Dependency fails during commit → System returns explicit failed/pending state (NFR-03); no partial event is recorded; operation is retryable.`
  - `contracts/openapi/workspace.openapi.json`: Transport responses return 503 `Unavailable` with error codes. The header `Idempotency-Key` is mandatory on all mutation endpoints.
- **Verdict:** **CONFIRMED** semantic divergence.
- **Nature:** Specification nuance vs transport reality.
- **Recommendation:** Preserve unknown-outcome semantics at the HTTP boundary. A socket timeout or 503 during COMMIT does not prove rollback. Replay must use the original `Idempotency-Key` and exact same payload. The server recovers the outcome if already committed or retries if safely rolled back, preventing duplicate events or conflicting mutations.

### C04: Undeclared 413/415 status codes in OpenAPI vs runtime HTTP guards
- **Claim:** Task mutation endpoints declare 400/401/403/404/409/503 responses, but reusable Fastify guards generate 413 (Payload Too Large) and 415 (Unsupported Media Type).
- **Source evidence:**
  - `contracts/openapi/workspace.openapi.json#L779-994`: Operation definitions for `/tasks/{task_id}`, `/tasks/{task_id}/state`, `/tasks/{task_id}/assignee`, `/tasks/{task_id}/blockers` omit 413 and 415 under `responses`.
  - `services/workspace/src/tasks/http.ts#L18`, `#L38`: Fastify route definitions explicitly register and map 413 and 415:
    `const responses=(status:number,name:string)=>Object.fromEntries([[status,...],...[400,401,403,404,409,413,415,503].map(n=>[n,{}])]);`
    `const fault=[400,413,415].includes(native)?new ProjectFault(native,'validation_failed'):projectFailure(error);`
- **Verdict:** **CONFIRMED** factual divergence.
- **Nature:** Factual contract-to-implementation divergence.
- **Recommendation:** P02 must document body size limits and content-type rules. If 413 and 415 are formally retained for API responses, coordinate adding them to the OpenAPI contract; otherwise treat them as generic gateway/framework errors.

### C05: Capability provisioning and idempotency outcome shape constraints
- **Claim:** State, assignment, and blocker capabilities are not provisioned by current private tooling, and `idempotency_record` constraints prohibit snapshots for new task mutations.
- **Source evidence:**
  - `services/workspace/src/projects/operator.ts#L5`, `#L39`: `ProjectCapability` is strictly restricted to `'membership-manage' | 'project-administrator' | 'backlog-author'`.
  - `services/workspace/migrations/007-project-membership.up.sql#L31` & `009-task-creation.up.sql#L20`: Table `authority_provisioning_audit` CHECK constraint only permits `('create-project','membership-manage','project-administrator','backlog-author')`.
  - `services/workspace/migrations/009-task-creation.up.sql#L62-87`: CHECK constraint `project_outcome_shape` on `idempotency_record` explicitly asserts that any operation other than `createProject`, `addMember`, `removeMember`, and `createTask` must have `result_status IS NULL AND result_snapshot IS NULL`.
  - `services/workspace/src/tasks/outcomes.ts#L8`, `#L14`: Storage adapter hardcodes `operation='createTask'` and `status: 201`.
- **Verdict:** **CONFIRMED** factual architectural block.
- **Nature:** Missing schema and storage support required for SP-04.
- **Recommendation:** P02 must design:
  1. The exact authority model for task mutations (whether granular capabilities or project membership with write access).
  2. An additive migration (e.g., 010) extending `project_outcome_shape` to accept valid 200 Task snapshots (`editTask`, `setTaskState`, `setAssignee`) and 201 Blocker snapshots (`recordBlocker`).

### C06: Underspecified schema edge cases
- **Claim:** Empty `EditTask`, same-value mutations, optional outcome normalization, and integer bounds are underspecified in schemas.
- **Source evidence:**
  - `contracts/openapi/workspace.openapi.json#L1491-1509`: Schema `EditTask` lists `title` and `description` as optional, requiring only `expected_revision`.
  - `contracts/openapi/workspace.openapi.json#L1549-1570`: Schema `RecordBlocker` defines `outcome` as optional nullable string.
  - PostgreSQL schema uses `bigint` (up to $2^{63}-1$), while JS safe integers cap at $2^{53}-1$ (`9007199254740991`).
- **Verdict:** **CONFIRMED** schema ambiguity.
- **Nature:** Unresolved design choices.
- **Recommendation:** P02 must define:
  1. Whether an `EditTask` containing only `expected_revision` or identical values increments revision and writes audit, or acts as an idempotent no-op.
  2. Canonical normalization of `null` vs `undefined` in request payload hashing.
  3. Consistent application of `wireRevision` safe-integer checks across all task mutation inputs and outputs.

---

## 3. State, Placement, Assignment, and Blocker Mechanics

A comparative assessment was conducted between existing SQL constraints and application runtime implementations:

| Mechanic | SQL Constraints / Triggers in Place | Current Application Behaviour | Status & Gaps |
| --- | --- | --- | --- |
| **Current membership** | FK `task(project_id, assignee_id) REFERENCES membership(project_id, user_id)` (`001`). Note: does not enforce `active=true` at SQL level. | `removeMember` (`projects/store.ts#L120-125`) sets `active=false`, unassigns tasks, bumps task revision, and logs audit. | `setAssignee` handler is **UNIMPLEMENTED**. Must explicitly check `membership.active AND NOT auth_account.disabled`. |
| **Safe revision** | `task_safe_revision CHECK(revision<=9007199254740991)` (`007`). | `wireRevision` bounds checking exists in `projects/store.ts`. | Optimistic concurrency check (`expected_revision === task.revision`) for mutations is **UNIMPLEMENTED**. |
| **Completed-Sprint reopening** | `task_location_shape` CHECK constraint (`003`) prevents `location_kind='completed'` if `state<>'done'`. `preserve_completed_allocation` trigger (`003`) forbids mutating completed allocations. `advance_backlog_revision` trigger (`003`) auto-advances project backlog revision. | None. | `setTaskState` is **UNIMPLEMENTED**. Handler must atomically transition a task from completed sprint to `state='todo'`, `location_kind='backlog'`, `location_sprint_id=NULL`, and increment revision. |
| **Removal vs assignment concurrency** | Foreign key on `membership`. | `removeMember` locks target account, membership row, and queries/locks all assigned tasks `FOR UPDATE`. | `setAssignee` is **UNIMPLEMENTED**. Must follow identical lock ordering (Project $\to$ Account/Membership $\to$ Task) to avoid deadlocks and races. |
| **Immutable original results** | `project_outcome_shape` CHECK constraint (`009`) enforces schemas. `protect_project_outcome` trigger (`009`) prevents UPDATE/DELETE of committed outcomes. | `tasks/outcomes.ts` only supports `createTask`. | Replay and outcome storage for `editTask`, `setTaskState`, `setAssignee`, `recordBlocker` are **UNIMPLEMENTED** and currently **BLOCKED by SQL check constraint**. |
| **Append-only highest-sequence blockers** | `UNIQUE(task_id, sequence)` and `CHECK(sequence > 0)` (`001`). `REVOKE UPDATE ON blocker_event FROM workspace_app`. | `getTask` / `listTasks` (`tasks/store.ts#L41,55`) correctly project `blocked` using `ORDER BY sequence DESC LIMIT 1`. | Handlers `recordBlocker` and `listBlockerEvents` are **UNIMPLEMENTED**. Sequence allocation must be serialized under task lock. |
| **SP-05 producer race gate** | `sprint` and `sprint_allocation` tables exist in 001/003. | None. | Sprint lifecycle handlers do not exist. SQL fixtures cannot substitute for actual concurrent producer integration tests. |

---

## 4. Audit / History Assessment

An evaluation of existing `business_audit` (`before_ref`/`after_ref`) and `sprint_allocation` was performed against the requirement to reconstruct time-stamped state and scope history.

### Assessment findings
- **State reconstruction:** The existing `createTask` implementation (`tasks/store.ts#L33`) writes `before_ref: NULL`, `after_ref: 'revision:1'`. It does **not** record the initial state (`todo`), title, or item type in `business_audit`. If future state mutations only log revision numbers (e.g. `before_ref: 'revision:1'`, `after_ref: 'revision:2'`), state transitions (`todo` $\to$ `in_progress` $\to$ `done`) cannot be reconstructed from audit history.
- **Sprint scope history:** Table `sprint_allocation` (`001`, `003`) stores only `allocation_state` (`'allocated' | 'completed' | 'returned'`) and `revision`. It lacks timestamps (`created_at`, `allocated_at`, `completed_at` are absent). It cannot reconstruct when an item was added to or returned from a Sprint.
- **Smallest missing evidence:**
  To satisfy FR-31 and UC-04 without inventing speculative schemas, estimates, or schedulers:
  - `setTaskState` audit must record domain state in references: `before_ref: 'state:todo;revision:1'`, `after_ref: 'state:in_progress;revision:2'`.
  - `setAssignee` audit must record assignee references: `before_ref: 'assignee:<id>;revision:1'`, `after_ref: 'assignee:<id|null>;revision:2'` (matching the convention already used by `removeMember` in `projects/store.ts#L125`).
  - `recordBlocker` audit must record blocker event details: `after_ref: 'event_id:<id>;status:<open|resolved>;sequence:<seq>'`.

---

## 5. Actionable Findings (Priority Order)

### Finding 1: Database constraint blocks SP-04 idempotency record persistence (Critical)
- **Source / Evidence:** `services/workspace/migrations/009-task-creation.up.sql#L62-87` (CHECK constraint `project_outcome_shape`).
- **Consequence:** Any attempt by `editTask`, `setTaskState`, `setAssignee`, or `recordBlocker` to persist a committed outcome snapshot or status into `workspace.idempotency_record` will immediately trigger SQL error `23514` (check constraint violation) and abort the transaction.
- **Proposed Correction:** P02 must specify an additive migration (e.g., 010) updating `project_outcome_shape` to define valid payload and snapshot shapes for the 4 new operations before implementing outcomes.
- **Owning Task:** P02 (storage design) $\to$ P03/P04 (implementation).

### Finding 2: Unprovisioned action capabilities for task mutations (High)
- **Source / Evidence:** `services/workspace/src/projects/operator.ts#L5,39` and `migrations/007-project-membership.up.sql#L31` & `009-task-creation.up.sql#L20`.
- **Consequence:** Only `'create-project'`, `'membership-manage'`, `'project-administrator'`, and `'backlog-author'` exist in the database and operator tooling. If task mutations require specific capability grants (e.g., `task-edit`, `state-change`, `assignee-manage`, `blocker-record`), current systems cannot provision or audit them.
- **Proposed Correction:** P02 must explicitly resolve whether task mutations are governed by active project membership (developer/PO roles) or require new distinct capability actions in `capability_grant`.
- **Owning Task:** P02 (authority design).

### Finding 3: Deadlock risk and race condition between removal and assignment (Medium)
- **Source / Evidence:** `services/workspace/src/projects/store.ts#L110-125` (`removeMember`).
- **Consequence:** `removeMember` locks target account $\to$ membership row $\to$ all assigned tasks `FOR UPDATE`. If `setAssignee` locks the target task first and then attempts to verify membership/account, concurrent execution can produce a database deadlock. If `setAssignee` does not lock the target member row, it could reassign a user who is concurrently being removed.
- **Proposed Correction:** P02 and P03 must mandate strict acquisition ordering: Project $\to$ Target User Account / Membership $\to$ Target Task.
- **Owning Task:** P02 (locking mechanics) $\to$ P03 (assignment slice) $\to$ P06 (concurrency tests).

### Finding 4: Fastify route guards expose undeclared 413 and 415 HTTP statuses (Low)
- **Source / Evidence:** `services/workspace/src/tasks/http.ts#L18,38` vs `contracts/openapi/workspace.openapi.json`.
- **Consequence:** The HTTP implementation handles and documents 413 and 415 errors in its internal route schema, but these status codes are missing from the external OpenAPI contract responses.
- **Proposed Correction:** P02 should record whether to coordinate OpenAPI updates or treat 413/415 as standard transport/gateway behaviors outside operation schemas.
- **Owning Task:** P02 (contract reconciliation).

---

## 6. Verification Checks and Limits

### Checks performed
- Git status and commit verification: confirmed branch `codex/sp-04` at `6b837fd52e01709f72bfe2de6cb96f0e9cc52653`.
- Source integrity verification: verified SHA-256 hashes of all 42 source files against `p01-source-inputs.json` with 0 drift.
- Static cross-check of OpenAPI contracts, UC-04, SP-04 specification, migrations 001–009, and current runtime implementations (`tasks/`, `projects/`).

### Verification limits (Checks not run)
- No runtime execution: no test runners, database migrations, server startup, or live HTTP requests were executed.
- No multi-process concurrency, browser, DOM, load, or failure recovery testing was performed.
- No modifications were made to code, migrations, contracts, or registered plan files.
- This report constitutes read-only review evidence and does not represent independent acceptance or release certification.

---

## 7. Handoff

This review is complete and ready for reconciliation by Codex.

- **Report path:** `docs/implementation/features/sp-04-update-task/reviews/antigravity-p01-review.md`
- **Primary outcome:** C01–C06 are confirmed as factual gaps or unresolved design choices; two blocking database/operator architectural constraints (Finding 1 on `project_outcome_shape` and Finding 2 on capability provisioning) must be resolved in P02 prior to producer implementation.
