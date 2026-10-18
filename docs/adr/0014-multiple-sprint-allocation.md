# Multiple task selection with per-task allocation outcomes

**Artifact ID:** ADR-0014
**Version/date:** 0.2 Draft - 16 October 2026
**Status:** Owner-confirmed multi-selection and per-task result behavior; transport design draft, handlers unimplemented.
**Owner confirmation source:** [BA-D17](../analyst/business-review-2026-10-13.md); source records direction, not implementation evidence.
**Inputs:** PRD-01 v0.6 FR-07/AC-07; UC-02 v0.4 UC-05 allocation and Alt-1; Workspace OpenAPI v0.2.1 allocateTask.
**Trace:** BR-02; FR-07, FR-31; NFR-02, NFR-03.

## Decision and transport design

Keep selection of multiple tasks in the Sprint UI and show each task's outcome. Successful allocations remain committed when another selected task conflicts. This is not an all-or-nothing batch.

Use the existing single-task `allocateTask` operation once per selected task. The UI coordinates the selection and aggregates the individual responses; no new batch endpoint or cross-task transaction is required. Validate each item's current project, read/action scope, expected revision and exclusive Planned/Active allocation in its owning transaction, including mandatory audit. Selection is not an authority snapshot. Recheck at each operation and do not display hidden task or competing-Sprint metadata in errors.

Assign each selected task its own actor/operation-scoped idempotency key and preserve the request payload for retries. Retry an unknown outcome with that same key/payload and reconcile it before issuing any new mutation for that item. A received confirmed allocation is success; a known rejected operation is rejection. A timeout or lost connection after a possible commit is shown as outcome unknown/reconciling, never as proof that allocation failed. Do not blindly resubmit the complete selection with fresh keys. Where a confirmed stale conflict requires a revised request, obtain current state and revalidate authority before a new operation; do not relabel it as a replay.

Use sequential dispatch as the initial design so shared revision changes do not create unnecessary conflicts; this is not a user-visible atomicity promise. Stopping or navigating away cannot undo already committed allocations. On resumption, reload authoritative allocation state and reconcile outstanding operations before permitting duplicate submissions.

## Verification and consequences

TC-07/21: select one eligible item and one already allocated item; first remains allocated with audit, second is unchanged with a scoped rejection. Select an inaccessible/unknown item: no hidden identity or conflicting resource details leak. Drop a successful response, retry with the same operation identity, and prove exactly one allocation/audit outcome. Change membership or Sprint state between selected items: later operations recheck authority/lifecycle. Concurrent attempts cannot allocate one task to two current Sprints. Check refresh/reconnect and per-item UI feedback.

A new bulk API could implement the same business behavior but adds aggregate protocol/retry design without being required by FR-07. A single-item-only UI would contradict the owner's chosen multi-selection. The current endpoint shape is therefore retained, with its orchestration semantics made explicit. Runtime tests, request persistence and UI rendering remain unimplemented; this ADR is not evidence of completion.
