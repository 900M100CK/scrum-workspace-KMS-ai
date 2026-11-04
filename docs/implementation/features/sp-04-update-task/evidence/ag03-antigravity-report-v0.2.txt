# SP-04 P02 — Antigravity design report and handoff for Codex (v0.2)

**Artifact ID:** SP04-P02-REPORT\
**Version/date:** 0.2 Draft · 3 November 2026\
**Status:** Design report and handoff; P02 design revised under AG03. Ready for coordinator disposition.\
**Author:** Antigravity (assigned reviewer/designer)\
**Audience:** Codex (coordinator/integrator), Project Owner\
**Inputs:** [FEAT-SP04-01](../plan.md) v0.6; [SP04-DECISION-BATCH](../decision-batch.md) v0.2; [SP04-P02-DISPOSITION](p02-codex-disposition.md) v0.1; [SP04-AG03](../tasks/AG03-p02-design-correction.md) v0.1; preserved original v0.1 report [p02-codex-report.md](p02-codex-report.md); current Workspace v0.2.12; migrations 001–009; canonical [SP-04](../../../../../specs/004-update-task.md) v0.7.1; [UC-04](../../../../sdlc/use-cases.md#L151-205).\
**Trace:** SP-04.1–04.2, FR-09/AC-09, FR-40/AC-40, FR-43/AC-43, FR-44/AC-44; supporting FR-03/31/59/68, BR-01/02/03/06/10/11/14, UC-04 main/Alt-1/Alt-2/EX-01–04, TC-07/08/14/16/18/19/22, PLAN-01 Month 1 / M-02–M-03.

---

## 1. Executive summary

In accordance with assignment [SP04-AG03](../tasks/AG03-p02-design-correction.md), Antigravity has revised the SP-04 P02 design deliverable in direct response to Codex's coordinator review ([SP04-P02-DISPOSITION](p02-codex-disposition.md)).

The two permitted output artifacts for this task are:
1. **Updated Decision Batch (v0.2 Draft):**  
   [`docs/implementation/features/sp-04-update-task/decision-batch.md`](../decision-batch.md)  
   *(Artifact ID: `SP04-DECISION-BATCH`, v0.2 Draft · 3 November 2026)*
2. **This Corrected Report (v0.2 Draft):**  
   [`docs/implementation/features/sp-04-update-task/reviews/p02-codex-report-v0.2.md`](p02-codex-report-v0.2.md)  
   *(Artifact ID: `SP04-P02-REPORT`, v0.2 Draft · 3 November 2026)*

All policy and capability choices in `decision-batch.md` have been set to **Proposed (Unselected)**. No implementation authority is claimed, no runtime code or migration has been altered, and no tests were executed during this documentation correction turn.

---

## 2. Explicit R01–R07 Dispositions

### R01 — Preservation of existing SP-02/SP-03 outcome shapes and dependencies
- **Status:** **CORRECTED**.
- **Source evidence & resolution:**
  - In `decision-batch.md` Section 2.2, the erroneous SQL block from v0.1 has been completely removed.
  - The new specification preserves the exact existing `idempotency_record` constraints from Migration 009 (`009-task-creation.up.sql#L63-87`):
    - `createProject`: HTTP 201 with project snapshot (`project_id`, `name`, `description`, `revision`).
    - `addMember`: HTTP 201 with member snapshot (`project_id`, `user_id`, `role`, `revision`).
    - `removeMember`: HTTP 204 with `result_snapshot IS NULL`.
    - `createTask`: HTTP 201 with `valid_task_creation_snapshot(result_snapshot, result_ref)`.
  - The non-existent helper `valid_project_creation_snapshot` has been removed. All required helper functions (`valid_task_outcome_snapshot`, `valid_blocker_outcome_snapshot`, and `protect_mutation_capability_provisioning`) are fully declared with complete DDL bodies and explicit search paths.
  - Preserved all existing safeguards: `state = 'committed'`, `expires_at = 'infinity'`, canonical 64-hex `payload_hash`, non-empty `idempotency_key`, and safe integer numeric revision bounds $\le 9007199254740991$.

### R02 — Total boolean validators, NULL rejection, and trigger return handling
- **Status:** **CORRECTED**.
- **Source evidence & resolution:**
  - **Total validation:** Authored complete PL/pgSQL validation functions for Task (`valid_task_outcome_snapshot`) and Blocker (`valid_blocker_outcome_snapshot`). Both functions:
    - Enforce exact required keys using `?& ARRAY[...]` and enforce no additional properties via subtraction `- ARRAY[...] = '{}'::jsonb`.
    - Enforce explicit JSON types for every field (`jsonb_typeof(...)`).
    - Validate UUID formats via safe casting `::uuid IS NOT NULL`.
    - Validate RFC 3339 UTC timestamps matching `^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$`.
    - Enforce safe integer numeric bounds ($\le 9007199254740991$) on revisions and blocker sequences.
    - Conclude with an explicit `(...) IS TRUE; EXCEPTION WHEN OTHERS THEN RETURN false;` block, ensuring no SQL NULL truth values can pass.
  - **CHECK NULL rejection:** The outer constraint `project_outcome_shape` is wrapped in `((... IS TRUE))) IS TRUE`, ensuring PostgreSQL fails closed if any expression evaluates to NULL.
  - **Trigger return handling:** In `protect_project_outcome`:
    - Checks both `OLD.operation IN (...)` and `(TG_OP = 'UPDATE' AND NEW.operation IN (...))`.
    - Handles returns correctly: `IF TG_OP = 'DELETE' THEN RETURN OLD; END IF; RETURN NEW;`. This ensures permitted updates to other records are not silently converted into no-ops.
  - **Rollback refusal:** `010-task-mutation-outcomes.down.sql` specifies explicit refusal checks: fails with error `23514` if any retained rows exist in `idempotency_record` (under the 4 new operations), `capability_grant`, `authority_provisioning_audit`, or `blocker_event`. Applied migrations 001–009 remain untouched.

### R03 — Replay precedence over write preconditions and stable no-op outcomes
- **Status:** **CORRECTED**.
- **Source evidence & resolution:**
  - **Protocol re-ordering:** Section 2.1 reorganizes the transaction protocol so that the idempotency check (Step 5) occurs **before** target account locking (Step 6), before target task locking (Step 8), and before optimistic concurrency checks (Step 10).
  - **Committed replay flow:** When an existing committed record matches `(actor_id, operation, idempotency_key)`:
    1. Replay validates `payload_hash === current_request_hash`.
    2. Server verifies caller holds current project read authority.
    3. Server verifies session validity via `await guard()`.
    4. Server immediately returns the retained immutable snapshot. It does **not** check `expected_revision` or target member active status, preventing valid replays from being rejected due to subsequent task revisions or member removals.
  - **Stable no-op outcomes:** For empty `EditTask`, same-value edits, same-value state transitions, or same-value assignee assignments:
    - The server commits an `idempotency_record` row with HTTP status 200 and the stable Task snapshot as of that operation.
    - The server does **not** advance `task.revision` and does **not** write `business_audit`.
    - Subsequent replays return this exact stable snapshot.

### R04 — Proposed capabilities, DB-enforced provisioning, and unified invalid-assignee response
- **Status:** **CORRECTED**.
- **Source evidence & resolution:**
  - **Unselected proposed status:** In Section 1, Decision D-01 presents the recommended granular capabilities (`'task-edit'`, `'task-state'`, `'task-assign'`, `'task-blocker'`) alongside Alternative B (reusing `backlog-author` for Backlog content editing) with the Owner Disposition explicitly marked **Proposed (Unselected)**.
  - **DB-enforced provisioning protection:** Migration 010 introduces trigger `private_mutation_capability` on `workspace.capability_grant` executing `protect_mutation_capability_provisioning()`. Any attempt to insert or update `valid = true` for the 4 mutation actions by a role other than `workspace_owner` raises SQL exception `42501`. Runtime invalidation (`valid = false`) during member removal remains permitted.
  - **Unified invalid-assignee response:** D-02 unifies all invalid target assignee conditions (nonexistent user UUID, nonmember, or disabled account) into a single bounded response: `400 validation_failed`. This completely eliminates out-of-project user existence disclosure. `404` is reserved strictly for missing target project or task.
  - **Disabled-target policy:** Checking `NOT auth_account.disabled` is explicitly presented as a Proposed addition to baseline AC-43 text.

### R05 — Session fault semantics, complete reopen mechanics, blocker bounds, and audit
- **Status:** **CORRECTED**.
- **Source evidence & resolution:**
  - **Session fault semantics:** Clarified in Section 2.1 that failed session checks in `WorkspaceSessionStore.inspectInTransaction` commit the durable clock-fault latch and authentication audit while withholding business effects; they do not erase authentication fault evidence.
  - **Lock protocol:** Documented as a bounded protocol observation for cooperating runtime writers under single-clock serialization, without an untested claim of absolute deadlock immunity.
  - **Reopening completed tasks:** Section 2.3 explicitly covers both requested `todo` **and** requested `in_progress`. In both cases, the task location normalizes to `location_kind = 'backlog'` with `location_sprint_id = NULL`. Backlog position is dynamically assigned under project lock. Completed allocations in `sprint_allocation` remain immutable (protected by 003 trigger), and project backlog revision advances automatically.
  - **Blocker sequences and bounds:** Section 2.4 specifies monotonic sequence allocation under task row lock with an explicit safe integer bound check (`next_seq <= 9007199254740991`). Every committed blocker event increments `task.revision` by 1. History paging cursor contract, validation, and generic 400/409 error behaviors are defined.
  - **Audit reconstruction:** Structured references cover `editTask` (`title` and description hash changes), `setTaskState` (including location changes on reopen), `setAssignee`, and `recordBlocker` without adding speculative chart or scheduler infrastructure.

### R06 — Decomposed producer slices and attached verification criteria
- **Status:** **CORRECTED**.
- **Source evidence & resolution:**
  - In Section 4, the monolithic P03D task has been refined into three discrete sub-slices:
    - **P03D1:** `editTask` handler (optimistic concurrency, no-op detection, outcome save).
    - **P03D2:** `setTaskState` handler (reopen transitions for todo/in_progress, backlog placement).
    - **P03D3:** `setAssignee` handler (member active check, unified 400 error, unassign handling).
  - Explicit planned test files, command entry points, and verification assertions are attached directly to each producer slice (P03A through P08).

### R07 — Accurate evidence wording and documentation-only correction
- **Status:** **CORRECTED**.
- **Source evidence & resolution:**
  - Section 5 accurately states that the active project baseline comprises **69 active requirements** (with 1 withdrawn: FR-45).
  - Context tests are accurately described as a **45-case structural test suite** in `tests/context/context.test.mjs`.
  - Confirmed that this AG03 task is a documentation-only correction. No tests were executed, no runtime code was altered, and no test logs were fabricated.

---

## 3. Preserved evidence and verification limits

- **Preserved historical artifacts:**
  - `docs/implementation/features/sp-04-update-task/evidence/p02-decision-batch-v0.1.txt` (raw bytes of v0.1 decision batch preserved).
  - `docs/implementation/features/sp-04-update-task/reviews/p02-codex-report.md` (preserved v0.1 report).
  - `docs/implementation/features/sp-04-update-task/reviews/antigravity-p01-review.md` (preserved v0.1 source review).
  - `docs/implementation/features/sp-04-update-task/reviews/antigravity-p01-review-v0.2.md` (preserved v0.2 source review).
- **Checks not run:**
  - No database engines or migrations were run.
  - No application HTTP servers or UI clients were started.
  - No automated test runners were launched during this documentation turn.

---

## 4. Handoff

The revised deliverables are complete and submitted for coordinator review:
- Primary design deliverable: [`docs/implementation/features/sp-04-update-task/decision-batch.md`](../decision-batch.md) (v0.2 Draft)
- Coordinator report: [`docs/implementation/features/sp-04-update-task/reviews/p02-codex-report-v0.2.md`](p02-codex-report-v0.2.md) (v0.2 Draft)

P03A and P03B remain unexecuted and pending owner disposition and coordinator integration.
