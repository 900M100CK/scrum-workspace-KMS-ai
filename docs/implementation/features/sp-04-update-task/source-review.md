# SP-04.1 — current source and invariant map

**Artifact ID:** SP04-P01-MAP\
**Version/date:** 0.2 Draft · 3 November 2026\
**Status:** Source assessment; runtime mutation implementation and verification remain unrun.\
**Inputs/trace:** Exact versions, authorisation, canonical FR/AC/UC/TC sources and task ownership are in [FEAT-SP04-01](plan.md); [selected source hashes](evidence/p01-source-inputs.json) bind the inspected local files. Author: Codex; this is not independent acceptance.

## 1. Current boundary

Current branch is codex/sp-04, created from main 6b837fd52e01709f72bfe2de6cb96f0e9cc52653. SP-03 was published/merged before this branch; see the actual [publication receipt](../../../sdlc/reports/SP-03-publication-2026-11-03.md). Uncommitted documentation and unrelated files remain present; the branch alone does not identify source bytes.

The separate older codex/sp-04-update-task worktree contains a v0.1 feature plan, ADR-0028 and earlier implementation/evidence. It was inspected read-only. None of those runtime files, owner-choice assertions or reported tests are adopted here. This current main-based continuation preserves that work and must reconcile any future reuse rather than overwrite or claim its results.

Current [Task store](../../../../services/workspace/src/tasks/store.ts) implements create/list/detail only; [HTTP](../../../../services/workspace/src/tasks/http.ts) registers those routes only. There are no current edit/state/assignment/blocker-write/history handlers to credit as completed. Task.blocked is already projected from highest blocker sequence; current placement is explicit, not inferred from historical Sprint allocation.

## 2. Operation and requirement map

All routes below are declared in [Workspace OpenAPI](../../../../contracts/openapi/workspace.openapi.json), not implemented by P01. Every mutation requires the original actor/operation-scoped Idempotency-Key and expected_revision. Identity comes from the server session. Current read scope/action authority must precede original-result disclosure. Shared error rules: unknown/nonmember protected targets have the exact generic 404; readable target lacking action authority uses 403; authentication loss 401; stale/changed-key conflict 409; unavailable required authority/storage 503. No mutation may commit without minimum audit and the durable original outcome.

| Operation / route | Requirement / observable invariant | Input → success contract | Producer |
| --- | --- | --- | --- |
| editTask / PATCH /tasks/{task_id} | FR-40/AC-40, UC-03 content editing, NFR-02: authorised Backlog content edit; stale requests preserve newer data | EditTask: required expected_revision; optional title/description; extra fields forbidden → 200 Task | P02 resolves author/no-op details; P03 edit slice; P05 UI; P06/07 negatives/integration |
| setTaskState / POST /tasks/{task_id}/state | FR-09/AC-09, UC-04 main/Alt-1: any direct transition among todo/in_progress/done; no automatic Scrum Master approval | SetState: state + expected_revision → 200 Task | P03 state slice, P05, P06/07; actual Sprint producer races P08 |
| setAssignee / POST /tasks/{task_id}/assignee | FR-43/AC-43, UC-04 main/EX-02, ADR-0017: current same-project member or null; departed assignee cannot be restored by a race | SetAssignee: nullable assignee_id + expected_revision → 200 Task | P03 assignment slice plus actual SP-02 removal; P06 both lock orders; P05 UI |
| recordBlocker / POST /tasks/{task_id}/blockers | FR-44/AC-44, UC-04 main/Alt-2/EX-04: append actor/time/text and unique committed per-task sequence; never overwrite history | RecordBlocker: open/resolved + nonempty description + expected_revision; outcome optional nullable → 201 Blocker | P04 append/replay; P06 concurrency/rollback; P05 history UI |
| listBlockerEvents / GET /tasks/{task_id}/blockers | Supporting FR-44, ADR-0018: current member/read scope per page, ascending sequence, no audit-read requirement | Optional cursor → 200 BlockerEventList; malformed/foreign 400; stale/expired 409 without items | P04 read/paging; P05 current history; P06/07 denied/stale recovery |
| getAllowedActions / existing scoped endpoint | FR-03 and Proposed ADR-0019: exact Task target advisory operations, never authorisation for a later write | Existing selector/AllowedActions schemas; task scope requires project and task identity, no role/actor assertions | P02 defines scope; P03/P04 advertise only registered handlers; P05 consumes |

Task/Blocker revisions and sequence are integers on the wire; PostgreSQL uses bigint. Preserve the existing safe-number bounds at every serialization/storage boundary, not JavaScript rounding. Do not add story points, fields, routes or errors without a recorded coordinated contract scope.

## 3. Mandatory state, placement and assignment invariants

1. Current enabled account/session, project membership and exact mutation capability are checked server-side. Role, creator, assignee, backlog-author and membership-manage are not interchangeable capabilities. [UC-04](../../../sdlc/use-cases.md#uc-04--update-work-state-and-record-blockers) requires state/assignment/blocker authority separately. The current private [operator](../../../../services/workspace/src/projects/operator.ts) supports membership-manage/project-administrator/backlog-author only. Exact provisioning of the additional rights needs P02 design/provenance; do not import the older worktree's choices as new owner consent.
2. Reuse the single-client transaction from [WorkspaceProjectStore](../../../../services/workspace/src/projects/store.ts): current clock/account/session inspection before Project and work-row locking, final session/time revalidation after relevant waits, before business mutation/output. If a target account/member lock is needed for assignment, P02 must reconcile its order with actual removeMember/private writers. An expiry while waiting cannot authorise a later write.
3. Stale expected_revision causes no Task/event/audit-success/outcome mutation. Concurrent edits must yield a serialised committed winner, not last-writer overwrite. Decide same-value/empty-edit semantics explicitly in P02; the schema currently permits an EditTask with only expected_revision.
4. For ordinary current work, direct todo → done and done → in_progress are allowed under the same checks. For a Done task whose current location is completed, reopening to either todo or in_progress must atomically yield Backlog/todo with no current Sprint reference. Keep the Sprint Completed and its completed allocation immutable. Preserve earlier completed history even when the task later becomes Done in Backlog or joins another Sprint.
5. [Migration 003](../../../../services/workspace/migrations/003-work-location.up.sql) already supplies explicit location, deferred same-project allocation consistency, completed-allocation immutability and Backlog generation triggers. Reopening across the Backlog boundary advances backlog_revision through the existing trigger; no second manual increment. Content/state/assignee/blocker changes without location/order change need not advance Backlog generation but may invalidate list projection cursors.
6. Assignment to a nonmember, wrong-project user or unknown target is rejected without changing the assignee; avoid target-directory leakage in errors. Removal and assignment must cooperate so committed removal leaves no current assignment to that member, increments affected task revisions and co-commits audit. Rejoin restores no grants or assignment. Historical attribution remains preserved.

## 4. Blocker ordering, read reconstruction and replay

- Existing blocker_event has actor_id, recorded_at, immutable append-only service permissions and UNIQUE(task_id, sequence). Latest highest committed sequence, not timestamp or UUID, determines blocked; no events means false. Repeated distinct Open events append; a retrospective Resolved with no prior Open also appends and leaves false. A retry with the same original operation identity appends once.
- Allocate sequence under the common Project/Task transaction protocol; a count or max read outside the serialised boundary is insufficient. Reconcile how an appended event advances Task revision so stale expected_revision is meaningful; this producer detail belongs to P02/P04.
- A history page must recheck current Task/project read scope and bind cursor to actor, route/task, membership generation, order and the entire projected dataset generation. Fresh login alone does not invalidate pagination under Proposed ADR-0019 v0.4. No cached protected history or audit-read prerequisite. A 409 discards all accumulated pages before restart.
- The current [Task outcome adapter](../../../../services/workspace/src/tasks/outcomes.ts) handles only createTask/201. [Migration 009](../../../../services/workspace/migrations/009-task-creation.up.sql) permits typed original results only for existing operations. Reusing a Project result reference or coercing a Task 200/Blocker 201 through createTask would violate shape/identity semantics. P02 must design minimal typed extensions and retained-result access rules before a new additive migration.
- Preserve original operation/key/body, including target and expected_revision. Changed payload under one identity conflicts. A committed retry must recheck current access/action before disclosing its original result; the UI separately reads current state. A changed live revision must not automatically force an already-committed original replay into a new operation. Exact hash/default/no-op rules need P02 reconciliation, not an undocumented handler choice.
- Audit/result/store failure before known commit rolls back every related business write. Lost COMMIT or HTTP acknowledgement is unknown; no false rollback, fresh-key automatic retry or duplicate event. SQL receipt evidence alone does not prove exclusion through the HTTP/source socket boundary D-07.

## 5. Contract/use-case reconciliation queue

| ID | Observed current sources | P02 disposition needed; no source changed here |
| --- | --- | --- |
| C01 | UC-04 EX-01 says a stale conflict returns the current revision token. OpenAPI 409 uses Error with no current_revision field. | Choose/record whether conflict instructs a fresh getTask under current access, or a coordinated response change is needed. Do not leak current state by inventing extra fields. |
| C02 | UC-04 blocker step 6 describes event plus current derived Blocked status. The existing 201 Blocker schema has no blocked or Task revision field. | Reconcile acknowledgement with a separate fresh getTask/history read, or explicitly coordinate source/contract change before implementation. Do not silently add fields. |
| C03 | UC-04 EX-03 calls the operation retryable and refers to failed/pending outcomes. Current transport contracts allow generic unavailable and original-key reconciliation. | Preserve unknown outcome semantics; never treat every 503/timeout as proven rollback or authorise a new automatic key. |
| C04 | Current mutation operations declare 400/401/403/404/409/503; reusable HTTP body/media guards may generate 413/415. | Record exact bounds/media/error scope and coordinate the missing responses if retained, before exposing new handlers. Existing blocker GET already declares 400; no redundant fix is needed. |
| C05 | Action requirements are separate; current private tooling does not provision state/assignment/blocker rights. Retention choices selected for createTask do not automatically settle every future result shape. | Review explicit grant names/scope/provisioning and minimum immutable mutation receipts with owner-choice provenance. Do not grant all current members or all PO/Admin-labelled users automatically. |
| C06 | Empty EditTask, same-value mutation, optional outcome normalization and revision/sequence limits are not fully described by schemas. | State deterministic validation/no-op/hash/replay/audit behaviour compatible with the existing ACs; surface material decisions and coordinate sources where necessary. |

P02 is reviewable design work. No new ADR is required to describe these observed gaps. Any actual permission/data-model/protocol change gets a bounded Proposed ADR and coordinated scope before implementation; existing accepted/owner-confirmed records remain unchanged.

## 6. Audit-history inspection for the later chart checkpoint

This is the requested early inspection, not a new chart requirement or permission to add a historical event subsystem.

| Data | Existing evidence | Gap / producer owner |
| --- | --- | --- |
| Sprint dates and Done definition | Sprint start_date/end_date and task state=done exist in 001/contract | Actual lifecycle and time-boundary semantics are SP-05; planned dates alone are not evidence of actual transition times. |
| Task creation | SP-03 stores immutable server created_at and backlog-item-create audit atomically | No Task estimate field is needed for a future count-based candidate chart. Creation time alone cannot reconstruct all later changes. |
| State transitions | UC-04 requires actor/time and before/after state audit; physical business_audit has time and before_ref/after_ref text columns | SP-04 state producer is absent. A revision-only reference without retained resolvable state is insufficient. P02/P03 must demonstrate the required before/after audit, independent of chart optionality. |
| Assignment history | PRD AC-43 preserves historical assignment records; current Task stores only current assignee | Verify audit representation and actual assignment/removal producers in P02/P03/P06; no complete assignment ledger is inferred from generic reference columns. |
| Sprint membership/scope changes | UC-05 requires per-allocation audit. sprint_allocation stores current allocation_state/revision and retained completed associations | No actual SP-05 allocation/completion producers and no proven timestamped scope ledger. SP-05 source reconciliation must check actual add/return/complete history before claiming chart reconstruction. |
| Blockers | blocker_event already has actor/time/text/sequence and highest-sequence projection | P04 must implement and verify append/read; blocker events do not substitute for state/allocation history. |

Conclusion: timestamped generic audit capacity is present, but a complete historical Sprint-progress series is not demonstrated. Do not fabricate past points from current state or add a daily scheduler/snapshot here. After SP-08 evaluate data completeness, unit=number of work items, scope-change/reopen/timezone/day-boundary rules and whether to implement optional charts at all. FR-35 remains Enhanced and outside the selected release; no FR/AC/priority count changes are made.

## 7. Acceptance ownership and checks

| Acceptance / use-case branch | Required future evidence owner |
| --- | --- |
| AC-40 persisted edit; stale newer content preserved | P03 edit + P05 reload + P06 conflict/rollback + P07 AC trace |
| AC-09 all direct states; UC-04 main/Alt-1 | P03 state + P05 UI + P06 stale/expiry/denial; P08 actual completion/allocation integration |
| AC-43 member/null, EX-02 and removal/rejoin | P03 assignment + actual SP-02 removal in P06; both concurrency orders and no revival |
| AC-44 ordered actor/time/text, Alt-2 and EX-04 | P04 append/read; P06 concurrent distinct keys, duplicate key and audit/result rollback |
| UC-04 EX-01 conflict, EX-03 unknown failure | P02 reconciles wire contract; P03/P04/P05/P06 verify original-key recovery and fresh current reads |
| Supporting FR-31/59/68 and TC-07/08/14/16/18/19/22 | All producers: authenticated actor, denied/unknown output, current authority before replay, atomic audit, lock-wait expiry and provider-independent work |

Controlled SQL setup can exercise a reopen handler before Sprint endpoints exist, but cannot close the actual SP-05 producer race gate. No declared TC/SC is marked passed from P01. Existing fixtures retain their 006/008/009 ceilings; future explicit new-schema fixtures are designed only after P02.

P01 structural command results and retained failures belong to [check capture](evidence/p01-checks.json) and the parent status table. No application/DB/browser/failure/load/provider/evaluation suite was run in this source preparation. The next reviewable work is P02; optional chart/load-balancing design and older-worktree integration are not silently included.
