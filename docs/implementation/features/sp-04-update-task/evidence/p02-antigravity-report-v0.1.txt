# SP-04 P02 — Antigravity design report and handoff for Codex

**Artifact ID:** SP04-P02-REPORT\
**Version/date:** 0.1 Draft · 3 November 2026\
**Status:** Design report and handoff; P02 design complete, ready for coordinator disposition.\
**Author:** Antigravity (assigned reviewer/designer)\
**Audience:** Codex (coordinator/integrator), Project Owner\
**Inputs:** [FEAT-SP04-01](../plan.md) v0.5; [SP04-DECISION-BATCH](../decision-batch.md) v0.1; [SP04-AG02-DISPOSITION](ag02-codex-final-disposition.md) v0.1; [SP04-P01-MAP](../source-review.md) v0.2; [SP04-P02](../tasks/P02-storage-authority.md) v0.2; canonical [SP-04](../../../../../specs/004-update-task.md) v0.7.1; [UC-04](../../../../sdlc/use-cases.md#L151-205).\
**Trace:** SP-04.1–04.2, FR-09/AC-09, FR-40/AC-40, FR-43/AC-43, FR-44/AC-44; supporting FR-03/31/59/68, BR-01/02/03/06/10/11/14, UC-04 main/Alt-1/Alt-2/EX-01–04, TC-07/08/14/16/18/19/22, PLAN-01 Month 1 / M-02–M-03.

---

## 1. Executive summary

In response to the owner's request and building upon Codex's [AG02 final disposition](ag02-codex-final-disposition.md), Antigravity has executed task **P02** (bounded storage, authority, conflict, and audit design) for SP-04.

The primary reviewable deliverable has been authored at:
[`docs/implementation/features/sp-04-update-task/decision-batch.md`](../decision-batch.md) (Artifact ID: `SP04-DECISION-BATCH`, v0.1 Draft).

All open items from the P01 reconciliation queue (C01–C06), the coordinator's errata, and the database/authority gaps have been concretely resolved without altering runtime code, database schemas, or Git state.

---

## 2. Resolution of C01–C06 and coordinator errata

| Item | Source observation | Bounded P02 design decision |
|---|---|---|
| **C01 Conflict response** | UC-04 EX-01 mentions returning current revision token, but OpenAPI 409 `Error` schema has `additionalProperties: false`. | **Resolved:** Reconcile as standard `409 state_conflict` (using existing `projects/outcomes.ts:9` helper). The 409 response body strictly adheres to `#/components/schemas/Error`. No ad-hoc fields are injected. The client is directed to issue an authenticated, authorized `getTask` read to synchronize current revision and board state. |
| **C02 Blocker response** | UC-04 Step 6 mentions member receives blocker event and derived `blocked` status, but 201 `Blocker` schema contains neither `blocked` nor `revision`. | **Resolved:** Reconcile as returning the committed `Blocker` event snapshot only (`#/components/schemas/Blocker`). No uncoordinated fields are added to 201. Client UI performs a follow-up fresh `getTask` read or board sync to reflect derived boolean `blocked` status. |
| **C03 Unknown outcomes** | UC-04 EX-03 refers to retryable failed/pending state; transport contracts define 503 and original-key idempotency. | **Resolved:** Preserve unknown-outcome discipline at the transport boundary. Network drops or 503 during COMMIT do not prove rollback. Client replay must use the original `Idempotency-Key` and exact same request body. Server verifies actor's current authority on replay: returns retained immutable snapshot if committed, or safely executes if rolled back. |
| **C04 413/415 Status codes** | OpenAPI omits 413 and 415 for future mutation endpoints (`editTask`, `setTaskState`, `setAssignee`, `recordBlocker`), while Fastify route guards map them. `createTask` already declares 413/415 and `listBlockerEvents` already declares 400. | **Resolved:** Coordinated contract support in P03A will add 413 and 415 under `responses` for the four mutation operations in `contracts/openapi/workspace.openapi.json`, formalizing payload size (8192-byte limit) and content-type rules. |
| **C05 Authority & outcomes** | `capability_grant.action` is `text NOT NULL` in base table (001), but private audited provisioning is restricted to 4 actions by `authority_provisioning_audit` CHECK constraint (007/009) and `operator.ts`. In addition, `project_outcome_shape` constraint (009) rejects snapshots for new mutation operations. | **Resolved:**<br>1. Introduce 4 granular project capabilities: `'task-edit'`, `'task-state'`, `'task-assign'`, `'task-blocker'`. Extend `authority_provisioning_audit` CHECK constraint in Migration 010 and update `projects/operator.ts`. Callers must possess active project membership AND the specific capability (`Work Operator` in UC-04).<br>2. Define Migration 010 extending `project_outcome_shape` and `protect_project_outcome` to accept and protect 200 Task snapshots (`editTask`, `setTaskState`, `setAssignee`) and 201 Blocker snapshot (`recordBlocker`). |
| **C06 Edge cases & bounds** | Empty `EditTask`, same-value edits, payload canonicalization, and safe integer bounds require deterministic handling. | **Resolved:**<br>1. Empty/identical `EditTask`: acts as an idempotent no-op returning the current Task snapshot (HTTP 200) without bumping revision or writing audit.<br>2. Canonical hashing: deterministic JSON stringification distinguishing missing fields from explicit `null`.<br>3. Bounds: `wireRevision` enforces `1 <= revision <= 9007199254740991` (`Number.MAX_SAFE_INTEGER`). Blocker sequence enforces `sequence > 0`. |

---

## 3. Concurrency and lock hierarchy specification

In full agreement with Codex's [AG02 disposition](ag02-codex-final-disposition.md#section-2), the complete actual locking protocol is formally documented in `decision-batch.md` Section 2.1:

1. **Singleton clock:** Row lock `FOR UPDATE` on `workspace.auth_clock_state` (acquired via `clockLock(c)` in `services/workspace/src/session/store.ts#L73`).
2. **Actor account:** Locked via `workspace.lock_auth_account(actor_id)`.
3. **Actor session:** Locked via `SELECT ... FROM workspace.session WHERE session_id = $1 FOR UPDATE`.
4. **Target account (for `setAssignee` & `removeMember`):** Locked via `workspace.lock_auth_account(target_id)`.
5. **Project row:** Locked via `SELECT ... FROM workspace.project WHERE project_id = $1 FOR UPDATE` (inside `projectAccess`).
6. **Target membership (for `setAssignee` & `removeMember`):** Locked via `SELECT ... FROM workspace.membership WHERE project_id = $1 AND user_id = $2 FOR UPDATE`.
7. **Target task row(s):** Locked via `SELECT ... FROM workspace.task WHERE ... ORDER BY task_id FOR UPDATE`.
8. **Transaction guard:** Re-evaluated via `await guard()` before business writes to ensure session has not expired during lock acquisition waits.

**Concurrency Invariants:**
- Transactions running through `WorkspaceProjectStore.transaction` are serialized by the common clock lock at the start of each transaction. Differing row access orders across operations do not create deadlocks under this single-clock protocol.
- `setAssignee` follows the exact target account $\to$ project $\to$ target membership $\to$ task lock sequence established by `removeMember`.

---

## 4. Storage and audit specifications

1. **Migration 010 DDL blueprint (`010-task-mutation-outcomes.up.sql`):**
   - Updates `authority_provisioning_audit_action_check` to include the 4 new mutation capabilities.
   - Adds PL/pgSQL validation functions: `workspace.valid_task_outcome_snapshot` and `workspace.valid_blocker_outcome_snapshot`.
   - Extends `project_outcome_shape` CHECK constraint to validate snapshots for `editTask`, `setTaskState`, `setAssignee`, and `recordBlocker`.
   - Updates `protect_project_outcome` trigger to enforce immutability across all 8 operations.
   - Full reverse/down migration restores migration 009 cleanly after verifying no retained records use the new operations.
2. **Audit history reconstruction (`business_audit`):**
   - Satisfies FR-31 / UC-04 requirements for reconstructible state transitions by recording structured references:
     - `setTaskState`: `before_ref: 'state:<old>;revision:<old>'`, `after_ref: 'state:<new>;revision:<new>'`.
     - `setAssignee`: `before_ref: 'assignee:<old|null>;revision:<old>'`, `after_ref: 'assignee:<new|null>;revision:<new>'`.
     - `recordBlocker`: `after_ref: 'event_id:<id>;status:<open|resolved>;sequence:<seq>'`.
   - Creation state and content remain durably preserved in the initial `idempotency_record` snapshot and `task` row; no separate chart or scheduler tables are introduced.

---

## 5. Decomposed implementation task breakdown (P03A–P08)

To maintain small, reviewable slices with strictly bounded deliverables, P03 is broken down as follows:

1. **P03A — Contract support:** Coordinated updates to `contracts/openapi/workspace.openapi.json` (declaring 413/415 for the 4 mutation routes), `contracts/data-model.json`, and `specs/004-update-task.md`. Verified via `contracts:test` and `docs:lint`.
2. **P03B — Owned persistence:** Authoring migration 010 (up/down) and extending `services/workspace/src/tasks/outcomes.ts`. Verified via disposable PostgreSQL tests (`task-mutation-storage.test.mjs`).
3. **P03C — Private authority provisioning:** Updating `services/workspace/src/projects/operator.ts` to support the 4 new action rights and co-committed audit. Verified via unit/authority tests (`task-mutation-authority.test.mjs`).
4. **P03D — Task mutation handlers:** Implementing `editTask`, `setTaskState`, and `setAssignee` in `services/workspace/src/tasks/store.ts` and `http.ts`. Handling optimistic concurrency, reopen transitions, and assignee validation.
5. **P04 — Blocker history handlers:** Implementing `recordBlocker` and `listBlockerEvents` with contiguous sequence allocation and cursor pagination.
6. **P05 — Connected UI:** React UI in `apps/web/src/TaskWorkspace.tsx` supporting mutation actions, optimistic state reflection, and blocker modals.
7. **P06 — Concurrency and failure testing:** Cross-producer concurrency tests (`removeMember` racing `setAssignee`, concurrent edits, stale conflicts).
8. **P07 — Integrated regression and handoff:** Build, typecheck, full suite execution, and formal handoff.
9. **P08 — SP-05 producer integration:** Integration gate against real SP-05 sprint lifecycle handlers.

---

## 6. Verification and status

### Verification checks executed:
- `npm run context:check`: 45/45 requirements, 66 operations, 13 specs verified.
- `npm run context:test`: 45/45 TAP unit tests passed with 0 failures, 0 skips.
- Schema bounds and citation line numbers verified against unchanged sources.

### Verification limits:
- No runtime code (`services/workspace/src/`), database migrations (`migrations/`), shared contracts (`contracts/`), or Git commits were executed during this design phase.
- All pre-existing work and historical reports remain intact.

### Handoff to Codex:
P02 design deliverable [`decision-batch.md`](../decision-batch.md) is ready for Codex's review, registration in `plan.md`, and owner approval. Upon approval, task **P03A** can proceed as the first implementation support slice.
