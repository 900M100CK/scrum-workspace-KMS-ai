# SP-04 AG01 — Antigravity source cross-check

**Artifact ID:** SP04-AG01-RESULT\
**Version/date:** 0.2 Draft · 3 November 2026\
**Status:** Findings only\
**Reviewer:** Antigravity (assigned reviewer)\
**Active branch:** `codex/sp-04`\
**HEAD commit:** `6b837fd52e01709f72bfe2de6cb96f0e9cc52653`\
**Assignment reference:** [SP04-AG02](../tasks/AG02-evidence-correction.md) v0.1 / [SP04-AG01-DISPOSITION](ag01-codex-disposition.md) v0.1 / [SP04-AG01](../tasks/AG01-source-crosscheck.md) v0.3 / [SP04-COORD-01](../COORDINATION.md) v0.1 / [FEAT-SP04-01](../plan.md) v0.4

---

## 1. Sources and scope

This review is a bounded, read-only source and contract cross-check supporting SP-04.1. In accordance with the assignment brief in [AG02](../tasks/AG02-evidence-correction.md), no runtime code, database schemas, migrations, shared contracts, task registers, or Git state have been altered. No tests or database engines were executed.

### Hash verification methodology and commands

SHA-256 hashes of all raw file bytes were calculated on the active filesystem without newline translation or normalization. The following commands were used:

1. **Node.js crypto check (reproducible manifest verification):**
   ```bash
   node -e "const fs=require('fs'),crypto=require('crypto');const m=JSON.parse(fs.readFileSync('docs/implementation/features/sp-04-update-task/evidence/p01-source-inputs.json','utf8'));for(const e of m.selected_sources){const h=crypto.createHash('sha256').update(fs.readFileSync(e.path)).digest('hex');console.log(e.path,h,h===e.sha256);}"
   ```

2. **PowerShell file hash verification:**
   ```powershell
   Get-FileHash -Algorithm SHA256 docs/implementation/features/sp-04-update-task/source-review.md
   ```

### Verification results for the 42 P01 selected sources

All 42 source files registered in [evidence/p01-source-inputs.json](../evidence/p01-source-inputs.json) were verified against their recorded SHA-256 hashes. Zero drift was detected across all 42 files (42 of 42 matched byte-for-byte).

| # | Source Path | Raw Byte SHA-256 Hash | Manifest Match |
|---|---|---|---|
| 1 | `AGENTS.md` | `9031e7e58bdbef4b1fad8b656ba1a0003f7c78af4cb2b4427645a0c6cfd4aab0` | Exact Match (`true`) |
| 2 | `docs/development-rules.md` | `a098906cb6df5ea45794d69f409fca74b094e21b522e2a72ccabdd7e80f37e89` | Exact Match (`true`) |
| 3 | `docs/agent-preflight-checklist.md` | `1de8f9e6ba1ae8138aafa525f4a5a7d861bd50636745b924cf7ca1d5616a6b1c` | Exact Match (`true`) |
| 4 | `agents/WORKFLOW.md` | `8c6586b3d69ef3a99ac9f5745b161bf05725f25bca230425a56acfe08d5c0f70` | Exact Match (`true`) |
| 5 | `agents/development-skills.md` | `5a561be0b816634bd29349e35743cc712625e1869f51bab803158cf710e4b120` | Exact Match (`true`) |
| 6 | `docs/BRD.md` | `2fa1da3a0d3ba2f80271e304301ba4370235fc1aafb82e1f15e1d0bfb88cdfa1` | Exact Match (`true`) |
| 7 | `docs/baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md` | `3195aefb50314c1a5a3ff7d31c505ffc083142752cf6184a754da7c5f61d4925` | Exact Match (`true`) |
| 8 | `docs/planning/five-month-plan.md` | `33eef3af5de2dd269d24b42fc5837abc64fb11b152da0444fa371ad10cad5efe` | Exact Match (`true`) |
| 9 | `docs/sdlc/PRD_SRS.md` | `b0b013d3237cf4eb71a0c074a444c8e4ce12831ddd8b9457479a0692fd0ef8ab` | Exact Match (`true`) |
| 10 | `docs/sdlc/use-cases.md` | `29475d6da902b1b3bbebae65e822cbc4c4292d122149f6c29d0cd6e154bbf616` | Exact Match (`true`) |
| 11 | `docs/architecture.md` | `a99772633e51ce45cfa7301c41c39032b23a78dd8b941df9fe09345d8b943b05` | Exact Match (`true`) |
| 12 | `docs/sdlc/data-design.md` | `c8b24f333fcafea19ab282a3e837f1f122c226d63cc05c7de777b9f010855d11` | Exact Match (`true`) |
| 13 | `docs/sdlc/test-plan.md` | `0aec147bd2b10eaf9d2af1f63c2efc135e9f519de98e0edcc66646d74d86cf5c` | Exact Match (`true`) |
| 14 | `docs/implementation/tasks/04-update-task.md` | `e99e970454990a3505fcc9b0b4e15e25ce53744695e6f46cd1b2f9e19650123d` | Exact Match (`true`) |
| 15 | `specs/004-update-task.md` | `c0a8bda3198643b60299c9fcd99808ee861bd4ad024f52231fd1d4c34970faab` | Exact Match (`true`) |
| 16 | `specs/005-sprint-lifecycle.md` | `718c003702f8da6b952131d0169f57cee2b28ecdfceb33f88e5ebc05368c9c3a` | Exact Match (`true`) |
| 17 | `docs/adr/0007-document-access-model.md` | `6a6d913df26e54fb86821b2ee4eefa7240b969edccf5637407e5659f3c9e87cb` | Exact Match (`true`) |
| 18 | `docs/adr/0008-fixed-sprint-lifecycle.md` | `07ff763471a3b7e55f74211253babb9e4db91aff13584616d88db45e06f52ca8` | Exact Match (`true`) |
| 19 | `docs/adr/0012-audit-visibility-and-durable-evidence.md` | `703015d03f084cd4a2f50ebfa4b9245f35d71fddfcc0bbce843bebd8bbe1a221` | Exact Match (`true`) |
| 20 | `docs/adr/0017-membership-removal-capabilities-and-assignees.md` | `43ddff14188428b6cbe630a499749265bbcd554d11115b9f992cd22cf21045a7` | Exact Match (`true`) |
| 21 | `docs/adr/0018-operational-read-projections.md` | `e2a8f053652923376661d572993f8c70b3a9cd95ecdfa272a6da878a44e7a738` | Exact Match (`true`) |
| 22 | `docs/adr/0019-scoped-ui-discovery.md` | `67f13286ce0fa2d29b035ee796a9a32ca5034b4657280f95ba699a3928966492` | Exact Match (`true`) |
| 23 | `docs/adr/0026-project-membership-foundation.md` | `98faa4926b30ea3ea634524c52c190b411f22b3c3b24ab29883946ba3f5f9bda` | Exact Match (`true`) |
| 24 | `docs/adr/0027-task-creation-foundation.md` | `eb884375223b19e2001b54dc8b1e203dbd5c31a0f153fc849d610a85fc50a031` | Exact Match (`true`) |
| 25 | `contracts/openapi/workspace.openapi.json` | `16110cb022aba48cccfb916b79b86e794b12796dfebf95f8933d1662f8f2c1d2` | Exact Match (`true`) |
| 26 | `contracts/data-model.json` | `5bb8346053fa241e2e307eef5ec842b886a5531622a34fb694b3828a2b70d602` | Exact Match (`true`) |
| 27 | `services/workspace/migrations/001-store.up.sql` | `9898406f45069f652b2ada98a0415353d5e7c0916df974dc5ff015b25403f269` | Exact Match (`true`) |
| 28 | `services/workspace/migrations/002-registered-policy.up.sql` | `cff0d0cdca9f3cc98be5443bac579c0351bfc2d301d383dda531f2c966f27040` | Exact Match (`true`) |
| 29 | `services/workspace/migrations/003-work-location.up.sql` | `e73b8af5f4cae23ee0368cf0577d881d0a2560a133a69b2fa38876b060a6727c` | Exact Match (`true`) |
| 30 | `services/workspace/migrations/007-project-membership.up.sql` | `cb7216447397b9ef4104230725e5037a4fba12971976507cf29f396c412481f6` | Exact Match (`true`) |
| 31 | `services/workspace/migrations/008-project-outcomes.up.sql` | `91f6fa1c4654341d485be0b5ed226380b0e4b06f29c94fe196631e2e3fe4e6a2` | Exact Match (`true`) |
| 32 | `services/workspace/migrations/009-task-creation.up.sql` | `24ff61006fddf17e172f30fb5e6267b27f5616aca46da25d4f89d801a4fe8b0f` | Exact Match (`true`) |
| 33 | `services/workspace/src/session/store.ts` | `9195b3d6cfb935ad6d5542ca64ccc5fecc0e1f7cea79651f5525398dfb7279ac` | Exact Match (`true`) |
| 34 | `services/workspace/src/session/database.ts` | `a94c2df12b2815ef4b93e71f386d0e4e8831f12a1c32931d13a2db1292afa489` | Exact Match (`true`) |
| 35 | `services/workspace/src/projects/store.ts` | `34923139ad9f0347d5b49c63724b2d90cf42a8c909322b4e16adf3fa6cc808b2` | Exact Match (`true`) |
| 36 | `services/workspace/src/projects/operator.ts` | `86ac65fdb3a1b464854c6ed643536b358bae8d15fa00491ebf127f81c5e9b403` | Exact Match (`true`) |
| 37 | `services/workspace/src/projects/outcomes.ts` | `57c954a7a871de99c3a1babdf6a3b58b6592dc1aab1d759319cd35e5ab7e245c` | Exact Match (`true`) |
| 38 | `services/workspace/src/tasks/store.ts` | `fb928c6d81012b0328abe43b0ef95f92dc74263be6bdc8252cbd838d55db4faa` | Exact Match (`true`) |
| 39 | `services/workspace/src/tasks/outcomes.ts` | `ddfd21efef8936b9ebe2c43b843dcd2531b50c53243ee1d0216ddfed0a66c14d` | Exact Match (`true`) |
| 40 | `services/workspace/src/tasks/http.ts` | `75ddcde72e4c516cf2f9d0a56cf196827417576e96a1bb3cbd6fbebd5fdd79b8` | Exact Match (`true`) |
| 41 | `services/workspace/src/tasks/types.ts` | `0a9b265752263f9b94de9376e3376d4635bb3360041f801a3dfef51a5ab796dd` | Exact Match (`true`) |
| 42 | `docs/sdlc/reports/SP-03-publication-2026-11-03.md` | `fd3ffdd92f455a59148a435d0862f9c3984bba5b20bea4bc29e9e3fed4960258` | Exact Match (`true`) |

### Additional displayed sources

| Source Path | Version / Identification | Raw Byte SHA-256 Hash | Role / Content |
|---|---|---|---|
| `docs/implementation/features/sp-04-update-task/source-review.md` | v0.2 Draft | `9d01f5d943eede207cba9ba1d30c5fe3a6c70ad0365216f710d3c073ea78c7be` | Codex P01 source review map (reconciliation queue C01–C06) |
| `docs/implementation/features/sp-04-update-task/reviews/antigravity-p01-review.md` | v0.1 Draft | `1184ab57018c73d3812f8885939991bf2ffa15dacf4aada21ca7ff6b9ff640c2` | Preserved original AG01 review artifact |

### Dialect, contract version, and module identity distinctions

- **OpenAPI dialect:** OpenAPI **3.1.1** (declared at line 2 of `contracts/openapi/workspace.openapi.json`: `"openapi": "3.1.1"`), not 3.1.0.
- **Contract specification version:** **0.2.12** (declared at line 5 of `contracts/openapi/workspace.openapi.json`: `"version": "0.2.12"`).
- **Source file / module identity:** TypeScript implementation files (`services/workspace/src/tasks/*.ts`, `services/workspace/src/projects/*.ts`, `services/workspace/src/session/*.ts`) possess distinct module identities and are tracked by Git commit `6b837fd52e01709f72bfe2de6cb96f0e9cc52653`. They do not inherit versioning from the OpenAPI contract specification.

---

## 2. C01–C06 Dispositions

Each item from the P01 reconciliation queue in `source-review.md` was reinspected against the exact lines of the underlying sources.

### C01: Conflict response payload vs generic Error schema
- **Claim:** UC-04 EX-01 states that a stale conflict returns the current revision token, whereas OpenAPI 409 responses use the generic `Error` schema without a `current_revision` property.
- **Source evidence:**
  - `docs/sdlc/use-cases.md#L191`: `EX-01 (Step 2 — Board state): Revision token is stale — another member committed a newer change → System returns conflict error with the current revision token; does not overwrite (NFR-02, AC-09).`
  - `contracts/openapi/workspace.openapi.json#L3556-3591`: Schema `Error` defines `additionalProperties: false` with fields `code`, `message`, `run_id` only. The enum for `code` (line 3566) contains `'state_conflict'` and `'stale_revision'`.
  - `services/workspace/src/projects/outcomes.ts#L9`: Generic conflict helper is defined as `export const conflict=()=>new ProjectFault(409,'state_conflict');`.
- **Verdict:** **CONFIRMED** factual divergence between use-case text and contract schema.
- **Nature:** Factual mismatch with an unresolved design reconciliation.
- **Disposition & Recommendation:** Do not invent ad-hoc fields on the 409 response or adopt uncoordinated wire changes. The existing runtime fault code in `projects/outcomes.ts:9` is `state_conflict`, not an ad-hoc string. P02 owns proposing how to reconcile UC-04 EX-01 with transport contracts: a separate, authenticated, authorised `getTask` read upon receiving `409 state_conflict` avoids leaking resource contents across concurrent permission changes and preserves the generic `Error` contract without modifying schema bounds.

### C02: Blocker creation response vs derived Blocked status
- **Claim:** UC-04 Step 6 states that the member receives the blocker event record and the current derived Blocked status, but the OpenAPI 201 `Blocker` schema contains neither `blocked` nor Task `revision`.
- **Source evidence:**
  - `docs/sdlc/use-cases.md#L182`: `6. **Member** receives the event record and the current derived Blocked status.`
  - `contracts/openapi/workspace.openapi.json#L3902-3951`: Schema `Blocker` defines `event_id`, `task_id`, `status` (`'open' | 'resolved'`), `description`, `outcome`, `actor_id`, `recorded_at`, `sequence`. It has `additionalProperties: false`. Here `status` reflects the lifecycle of the blocker event itself, not the derived boolean `blocked` state of the task, nor does it contain the task `revision`.
- **Verdict:** **CONFIRMED** factual mismatch.
- **Nature:** Factual mismatch with an unresolved design reconciliation.
- **Disposition & Recommendation:** The 201 response contract for `recordBlocker` returns schema `#/components/schemas/Blocker` (`workspace.openapi.json#L1390-1399`). Adding fields to `Blocker` is forbidden without an accepted contract change. P02 owns the reconciliation proposal: whether client state updates derive from a follow-up fresh `getTask` read or board synchronization, retaining the bounded event contract.

### C03: Unknown commit / retryable failure semantics
- **Claim:** UC-04 EX-03 refers to returning explicit failed/pending states and retryable operations, whereas transport contracts define standard 503 Unavailable and original-key idempotency reconciliation.
- **Source evidence:**
  - `docs/sdlc/use-cases.md#L193`, `#L204`: `EX-03: Dependency fails during commit → System returns explicit failed/pending state (NFR-03); no partial event is recorded; operation is retryable.`
  - `contracts/openapi/workspace.openapi.json#L857-865`, `#L1103-1111`: Mandatory header `Idempotency-Key` scoped to actor and operation.
  - `services/workspace/src/projects/outcomes.ts#L18-28`: Outcome lookup requires matching `payload_hash` and `state === 'committed'`.
- **Verdict:** **CONFIRMED** semantic divergence.
- **Nature:** Specification nuance vs transport reality.
- **Disposition & Recommendation:** Preserve unknown-outcome semantics at the HTTP and persistence boundaries. A 503 `access_unavailable` or socket timeout during COMMIT does not prove rollback. Replay by the client must preserve the original `Idempotency-Key` and exact same request payload; it must never retry under a freshly generated identity. On replay, the server reconciles authority and recovers the retained committed outcome if the transaction succeeded, or executes the operation if safely rolled back. P02 owns aligning UC-04 retry terminology with existing idempotency storage mechanics.

### C04: Status code declarations in OpenAPI vs runtime HTTP guards
- **Claim:** OpenAPI task mutation endpoints omit 413 (Payload Too Large) and 415 (Unsupported Media Type), while reusable Fastify route guards map these status codes.
- **Source evidence:**
  - `contracts/openapi/workspace.openapi.json`:
    - `createTask` (lines 867–935) **already declares** `413` (line 917) and `415` (line 927).
    - `editTask` (lines 1114–1158), `setTaskState` (lines 1206–1250), `setAssignee` (lines 1298–1342), and `recordBlocker` (lines 1390–1434) declare `200`/`201`, `400`, `401`, `403`, `404`, `409`, `503`, but **omit** `413` and `415`.
    - `listBlockerEvents` (lines 1480–1520) declares `200`, `400`, `401`, `404`, `409`, `503` (`400` is already declared for invalid query cursors).
  - `services/workspace/src/tasks/http.ts#L18`, `#L38`: Fastify route setup includes status mapping `[400,401,403,404,409,413,415,503]` and fault mapping `[400,413,415].includes(native) ? new ProjectFault(native,'validation_failed') : projectFailure(error)`.
- **Verdict:** **CONFIRMED**, scoped strictly to future mutation operations.
- **Nature:** Contract-to-framework alignment gap for unimplemented operations.
- **Disposition & Recommendation:** Reusable framework guards in `tasks/http.ts` serve existing endpoints (`createTask`); they do not constitute evidence that an unimplemented route ran or failed. Handlers for `editTask`, `setTaskState`, `setAssignee`, and `recordBlocker` are not yet implemented. P02 must define the exact request size and content-type rules for the new mutation operations and coordinate adding `413` and `415` to OpenAPI for those four operations if framework-level payload rejection is to be contractually exposed.

### C05: Capability provisioning and idempotency outcome shape constraints
- **Claim:** State, assignment, and blocker capabilities are not provisioned by current private tooling, and `idempotency_record` constraints prohibit snapshots for new task mutations.
- **Source evidence:**
  - `services/workspace/migrations/001-store.up.sql#L92-101`: Table `capability_grant` defines `action text NOT NULL`. At the base table level, `action` is **not** an enum and is not constrained to four strings.
  - `services/workspace/migrations/007-project-membership.up.sql#L31` & `009-task-creation.up.sql#L20`: Table `authority_provisioning_audit` CHECK constraint strictly enforces `action IN ('create-project','membership-manage','project-administrator','backlog-author')`.
  - `services/workspace/src/projects/operator.ts#L5`, `#L39`: `ProjectCapability` and operator provisioning logic are restricted to `'membership-manage' | 'project-administrator' | 'backlog-author'`.
  - `docs/sdlc/use-cases.md#L686`: UC-04 explicitly requires specific mutation capabilities (`Work Operator ↔ UC-04 (check the capability for each requested mutation; membership alone is insufficient)`).
  - `services/workspace/migrations/009-task-creation.up.sql#L62-87`: CHECK constraint `project_outcome_shape` on `idempotency_record` requires `result_status IS NULL AND result_snapshot IS NULL` for any operation other than `createProject`, `addMember`, `removeMember`, and `createTask`.
  - `services/workspace/migrations/009-task-creation.up.sql#L90-106`: Trigger `protect_project_outcome` enforces immutability only for those four named operations.
  - `services/workspace/src/tasks/outcomes.ts#L8`, `#L14`: Storage adapter hardcodes `operation='createTask'` and `status: 201`.
- **Verdict:** **CONFIRMED** readiness gap and architectural constraint.
- **Nature:** Missing private audited provisioning path and storage prerequisite for SP-04.
- **Disposition & Recommendation:**
  1. Base `capability_grant` table storage can physically store arbitrary action strings, but the private audited provisioning pipeline (`authority_provisioning_audit` CHECK constraint and `projects/operator.ts`) does not support issuing or auditing task mutation rights. Because UC-04 already mandates specific mutation capabilities in addition to membership, P02 must define the exact capability names and audited provisioning extensions; replacing this with role-only or membership-only access is not authorised.
  2. For idempotency storage, extending `project_outcome_shape` and `protect_project_outcome` to accept valid 200 Task snapshots (`editTask`, `setTaskState`, `setAssignee`) and 201 Blocker snapshots (`recordBlocker`) is an essential **implementation prerequisite** before enabling producers in P03/P04.

### C06: Underspecified schema edge cases
- **Claim:** Empty `EditTask`, same-value mutations, optional outcome normalization, and integer bounds require deterministic specification.
- **Source evidence:**
  - `contracts/openapi/workspace.openapi.json#L3841-3859`: Schema `EditTask` lists `title` and `description` as optional, requiring only `expected_revision`.
  - `contracts/openapi/workspace.openapi.json#L3953-3974`: Schema `RecordBlocker` defines `outcome` as optional nullable string.
  - `services/workspace/src/projects/outcomes.ts#L12`: `wireRevision` enforces `/^[1-9]\d*$/` and `BigInt(value) <= 9007199254740991n` (JavaScript `Number.MAX_SAFE_INTEGER`).
- **Verdict:** **CONFIRMED** schema edge-case ambiguity.
- **Nature:** Unresolved design choices.
- **Disposition & Recommendation:** P02 must define deterministic handling rules:
  1. Whether an `EditTask` request containing identical values or omitting all optional fields acts as a no-op or advances `revision` and writes audit.
  2. Distinguishing missing properties from explicit `null` values in payload canonicalization and hashing without conflating them.
  3. Consistent application of `wireRevision` safe-integer checks across all task mutation inputs, revisions, and projected output fields.

---

## 3. State, Placement, Assignment, and Blocker Mechanics

A comparative assessment was conducted between existing SQL constraints, triggers, and current application runtime implementations:

| Mechanic | SQL Constraints / Triggers in Place | Current Application Behaviour | Status & Gaps |
| --- | --- | --- | --- |
| **Current membership & assignment** | FK `task(project_id, assignee_id) REFERENCES membership(project_id, user_id)` (`001-store.up.sql#L66-67`). Note: does not enforce `active=true` at SQL level. | `removeMember` (`projects/store.ts#L113-125`) sets `active=false`, unassigns tasks, bumps task revision, and logs audit. | `setAssignee` handler is **UNIMPLEMENTED**. Confirmed AC-43 text (`PRD_SRS.md#L111`) requires current membership (`active=true`). Reconciling any additional account eligibility checks (e.g. `NOT auth_account.disabled`) is a design question for P02, not an existing AC-43 rule. |
| **Safe revision** | `task_safe_revision CHECK(revision<=9007199254740991)` (`007-project-membership.up.sql#L12`). | `wireRevision` bounds checking exists in `projects/outcomes.ts#L12` and `projects/store.ts#L106`. | Optimistic concurrency check (`expected_revision === task.revision`) for mutations is **UNIMPLEMENTED**. |
| **Completed-Sprint reopening** | `task_location_shape` CHECK constraint (`003-work-location.up.sql#L16-24`) prevents `location_kind='completed'` if `state<>'done'`. `preserve_completed_allocation` trigger (`003#L34-45`) forbids mutating completed allocations. `advance_backlog_revision` trigger (`003#L61-71`) auto-advances project backlog revision. | None. | `setTaskState` is **UNIMPLEMENTED**. Handler must atomically transition a task from completed sprint to `state='todo'`, `location_kind='backlog'`, `location_sprint_id=NULL`, and increment revision. |
| **Removal vs assignment lock ordering** | Foreign key on `membership`. | `removeMember` (`projects/store.ts#L109-129`): executes `sessions.inspectInTransaction` (locks singleton clock, actor account, actor session), then locks target account (`lock_auth_account`), then `projectAccess` (locks project `FOR UPDATE`), then locks target membership (`FOR UPDATE`), then locks assigned tasks (`ORDER BY task_id FOR UPDATE`). | `setAssignee` is **UNIMPLEMENTED**. Cooperative transactions are serialized by the singleton clock in `inspectInTransaction`. No deadlock is reproduced. The proposed Project-first target-account order is not the current protocol; P02 must document the complete actual lock hierarchy. |
| **Immutable original results** | `project_outcome_shape` CHECK constraint (`009-task-creation.up.sql#L62-87`) and `protect_project_outcome` trigger (`009#L90-106`) protect `createProject`, `addMember`, `removeMember`, and `createTask`. | `tasks/outcomes.ts` only supports `createTask`. | Replay and outcome storage for `editTask`, `setTaskState`, `setAssignee`, `recordBlocker` are **UNIMPLEMENTED**. Extending shape validation and immutability protection is an **implementation prerequisite** for SP-04. |
| **Append-only highest-sequence blockers** | `UNIQUE(task_id, sequence)` and `CHECK(sequence > 0)` (`001-store.up.sql#L77-78`). `REVOKE UPDATE ON blocker_event FROM workspace_app` (`001#L128`). | `getTask` / `listTasks` (`tasks/store.ts#L41,55`) project `blocked` using `ORDER BY sequence DESC LIMIT 1`. | Handlers `recordBlocker` and `listBlockerEvents` are **UNIMPLEMENTED**. Sequence allocation must be serialized under task row lock. |
| **SP-05 producer race gate** | `sprint` and `sprint_allocation` tables exist in 001/003. | None. | Sprint lifecycle handlers do not exist. Static SQL inspection cannot substitute for concurrent producer integration tests. |

### Concurrency and lock hierarchy analysis

In `services/workspace/src/projects/store.ts#L105-129`, the exact acquisition sequence in `removeMember` is:
1. `this.transaction` calls `this.sessions.inspectInTransaction(c, token)` (`services/workspace/src/session/store.ts#L71-87`):
   - Acquires advisory/row lock on the singleton clock (`clockLock`).
   - Locks actor account (`workspace.lock_auth_account(hint.user_id)`).
   - Locks actor session (`SELECT ... FROM workspace.session WHERE session_id=$1 FOR UPDATE`).
2. `removeMember` business logic:
   - Locks target account (`SELECT disabled FROM workspace.lock_auth_account($1)`, line 110).
   - Calls `projectAccess` which locks Project row (`SELECT ... FROM workspace.project WHERE project_id=$1 FOR UPDATE`, line 111 & line 16).
   - Locks target membership row (`SELECT ... FROM workspace.membership WHERE project_id=$1 AND user_id=$2 FOR UPDATE`, line 113).
   - Locks all target-assigned tasks ordered by task ID (`SELECT ... FROM workspace.task WHERE project_id=$1 AND assignee_id=$2 ORDER BY task_id FOR UPDATE`, line 117).

**Observations:**
- The existing protocol locks target `auth_account` **before** `projectAccess` locks the `project` row. Proposing a `Project -> Account` order contradicts the current implementation.
- All transactions running through `this.transaction` serialize through `sessions.inspectInTransaction` on the common clock lock. Therefore, differing row access orders across operations do not demonstrate an active deadlock under the current single-clock protocol.
- No database deadlock was reproduced. Concurrency design remains a design and verification obligation for P02, P03, and P06.

---

## 4. Audit / History Assessment

An evaluation of existing `business_audit` (`before_ref`/`after_ref`) and `sprint_allocation` was performed against FR-31 and UC-04 requirements to reconstruct time-stamped state and scope history.

### Assessment findings
- **Creation state and content:** In `services/workspace/src/tasks/store.ts#L33`, `createTask` logs `before_ref: NULL`, `after_ref: 'revision:1'`. The initial state (`todo`), item type, and initial attributes are durably stored in the `task` table row and in the retained `idempotency_record.result_snapshot`. The absence of redundant domain attributes in the initial audit row is not an SP-03 runtime defect.
- **Future state transition reconstruction:** UC-04 requires that state transitions be reconstructible. If future mutation handlers were to record only opaque revision numbers (e.g. `revision:2`), state progression could not be determined from audit records alone. P02 must specify how before and after states are captured (e.g. structured string references such as `state:todo;revision:1` vs explicit entity properties). These proposed string formats are design candidates, not proof of existing future handlers.
- **Sprint scope history:** Table `sprint_allocation` (`001`, `003`) tracks `allocation_state` (`'allocated' | 'completed' | 'returned'`) and `revision`, but lacks dedicated timestamp columns. Actual SP-05 audit producers must establish scope history. No event table, chart generator, scheduler, or broad historical data migration is authorised under SP-04.

---

## 5. Actionable Findings (Priority Order)

### Finding 1: Implementation prerequisite — Idempotency record shape constraint and outcome protection (Blocker for P03/P04 producers)
- **Source / Evidence:**
  - `services/workspace/migrations/009-task-creation.up.sql#L62-87`: CHECK constraint `project_outcome_shape` rejects non-null result snapshots for any operation other than `createProject`, `addMember`, `removeMember`, and `createTask`.
  - `services/workspace/migrations/009-task-creation.up.sql#L90-106`: Trigger `protect_project_outcome` restricts immutability checks to those same four operations.
- **Classification:** Implementation prerequisite for SP-04 producers, not a current SP-03 production defect.
- **Consequence:** Persisting committed receipts for `editTask`, `setTaskState`, `setAssignee`, or `recordBlocker` will fail with SQL error `23514` until an additive migration updates `project_outcome_shape` and `protect_project_outcome`.
- **Required Action:** P02 must specify an additive migration (e.g. 010) extending outcome shape validation and outcome immutability protection to include the four new task operations.
- **Owning Task:** P02 (storage design) $\to$ P03/P04 (producer implementation).

### Finding 2: Private audited provisioning missing for task mutation capabilities (High)
- **Source / Evidence:**
  - `services/workspace/migrations/001-store.up.sql#L92-101`: `capability_grant.action` is `text NOT NULL` (open-ended).
  - `services/workspace/migrations/007-project-membership.up.sql#L31` & `009-task-creation.up.sql#L20`: `authority_provisioning_audit.action` CHECK constraint restricts actions to `('create-project','membership-manage','project-administrator','backlog-author')`.
  - `services/workspace/src/projects/operator.ts#L5,39`: Operator tools only support those four actions.
- **Classification:** Implementation readiness gap.
- **Consequence:** Although the database can store other capability strings in `capability_grant`, private operator tools cannot provision or audit the specific mutation rights required by UC-04 (`Work Operator` capability check).
- **Required Action:** P02 must specify the required action capability names and define how they are audited and provisioned. Task mutations cannot be converted to role-only or membership-only access without violating UC-04.
- **Owning Task:** P02 (authority design).

### Finding 3: Concurrency and lock hierarchy specification (Medium)
- **Source / Evidence:** `services/workspace/src/projects/store.ts#L109-129` (`removeMember`) and `services/workspace/src/session/store.ts#L71-87` (`inspectInTransaction`).
- **Classification:** Design and verification obligation.
- **Consequence:** Concurrent assignment and member removal interact across accounts, memberships, and tasks. Current cooperating transactions serialize via the singleton clock lock in `inspectInTransaction`. Differing row lock orders do not cause deadlocks under this singleton clock protocol, but the complete lock hierarchy must be documented to avoid introducing deadlocks if concurrency boundaries change.
- **Required Action:** P02 must faithfully document the actual lock hierarchy: singleton clock $\to$ actor account/session $\to$ target account $\to$ project $\to$ target membership $\to$ assigned tasks. P03/P06 must test concurrent `removeMember` and `setAssignee` execution.
- **Owning Task:** P02 (locking mechanics) $\to$ P03 (assignment slice) $\to$ P06 (concurrency testing).

### Finding 4: Status code alignment for future mutation operations (Low)
- **Source / Evidence:** `contracts/openapi/workspace.openapi.json#L1086-1436` vs `services/workspace/src/tasks/http.ts#L18,38`.
- **Classification:** Contract coordination for unimplemented operations.
- **Consequence:** Future mutation operations (`editTask`, `setTaskState`, `setAssignee`, `recordBlocker`) do not declare 413 and 415 in OpenAPI, whereas Fastify route guards map these status codes. `createTask` already declares both 413 and 415, and `listBlockerEvents` already declares 400.
- **Required Action:** P02 should determine whether to add 413 and 415 to OpenAPI for the four new mutation operations or document them as transport/gateway-level behaviors.
- **Owning Task:** P02 (contract reconciliation).

---

## 6. Verification Checks and Limits

### Checks performed
- **Git status and HEAD verification:** Confirmed working directory is on branch `codex/sp-04` at HEAD commit `6b837fd52e01709f72bfe2de6cb96f0e9cc52653` without working-tree disruption.
- **Manifest source verification:** Calculated raw-byte SHA-256 hashes of all 42 files in `docs/implementation/features/sp-04-update-task/evidence/p01-source-inputs.json` using Node.js `crypto` and confirmed 42 of 42 exact matches (0 drift).
- **Displayed source verification:** Calculated raw-byte SHA-256 for `source-review.md` (`9d01f5d943eede207cba9ba1d30c5fe3a6c70ad0365216f710d3c073ea78c7be`) and verified preserved v0.1 report (`1184ab57018c73d3812f8885939991bf2ffa15dacf4aada21ca7ff6b9ff640c2`).
- **Exact source citation verification:** Rediscovered exact line numbers in unchanged files for OpenAPI schemas (`Error` at 3556, `EditTask` at 3841, `SetState` at 3861, `SetAssignee` at 3882, `Blocker` at 3902, `RecordBlocker` at 3953; operations at 841, 1087, 1179, 1271, 1363, 1453), migrations 001/003/007/009, and runtime stores.

### Verification limits (Checks not run)
- **No application/DB execution:** No PostgreSQL instance was launched; no migrations were applied or rolled back; no application handlers or API servers were started.
- **No automated test execution:** No test suites (`npm test`, `npm run test:projects`, etc.) were executed during this documentation review.
- **No concurrency or deadlock reproduction:** Concurrency conclusions are derived from static source inspection of lock statements and transaction wrappers; no multi-threaded or multi-connection race tests were run.
- **No independent release acceptance:** This report provides read-only review findings to support SP-04.1; final disposition and task acceptance remain with Codex and the repository owner.

---

## 7. Handoff

This corrected review artifact is complete and submitted for reconciliation by Codex.

- **Report path:** `docs/implementation/features/sp-04-update-task/reviews/antigravity-p01-review-v0.2.md`
- **Preserved report path:** `docs/implementation/features/sp-04-update-task/reviews/antigravity-p01-review.md` (preserved byte-for-byte, raw SHA-256 `1184ab57018c73d3812f8885939991bf2ffa15dacf4aada21ca7ff6b9ff640c2`)
- **Summary of corrections from v0.1:**
  1. Replaced all 14 invalid SHA-256 prefixes with the complete 64-character raw-byte SHA-256 hashes for all 42 manifest files and all displayed sources (`source-review.md`, preserved v0.1 report), recording the exact Node.js and PowerShell commands used.
  2. Corrected all source line citations against unchanged source files, accurately citing OpenAPI schemas (`Error` at 3556, `Blocker` at 3902, `EditTask` at 3841, etc.) and distinguishing OpenAPI dialect `3.1.1` from contract version `0.2.12` and distinct module file identities.
  3. Replaced ad-hoc `stale_revision` with the existing runtime `state_conflict` code (`projects/outcomes.ts:9`), retaining fresh `getTask` read reconciliation as a candidate P02 proposal; reaffirmed unknown COMMIT / original-key idempotency semantics for C03.
  4. Scoped C04 status code omissions strictly to future mutation operations (`editTask`, `setTaskState`, `setAssignee`, `recordBlocker`), noting that `createTask` already declares 413/415 and `listBlockerEvents` already declares 400.
  5. Clarified that `capability_grant.action` is `text NOT NULL` without table-level enum restriction, whereas private audited provisioning (`authority_provisioning_audit` CHECK constraint and `operator.ts`) is missing for task mutation actions; maintained UC-04's requirement for specific mutation authority and separated additional disabled-account recommendations from confirmed AC-43 text.
  6. Provided an accurate account of the complete lock sequence in `removeMember` (singleton clock $\to$ actor account $\to$ actor session $\to$ target account $\to$ project $\to$ target membership $\to$ ordered tasks), noting common serialization under the singleton clock and clarifying that no deadlock was reproduced.
  7. Reclassified idempotency outcome shape constraint and immutability trigger extension as an implementation prerequisite for SP-04 rather than an SP-03 runtime defect; clarified that initial task state/content is durably retained in creation outcomes.
