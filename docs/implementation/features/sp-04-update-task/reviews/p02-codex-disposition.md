# P02 proposal — coordinator review and design correction

**Artifact ID:** SP04-P02-DISPOSITION\
**Version/date:** 0.1 Draft · 3 November 2026\
**Status:** Proposal received; changes required. P02 is not closed and P03A/P03B are not ready from this receipt.\
**Author:** Codex, coordinator; this is source/design review, not independent release approval.\
**Inputs:** Antigravity [decision batch](../decision-batch.md) v0.1, [handoff report](p02-codex-report.md) v0.1 and SP04-P02 brief v0.3 as receipt snapshots preserved byte-for-byte in [evidence](../evidence/p02-received-snapshots.json); current [FEAT-SP04-01](../plan.md) v0.6; Workspace v0.2.12 and migrations 001–009.\
**Trace:** SP-04.1–04.2 / FR-09/40/43/44, supporting FR-03/31/59/68 / PLAN-01 Month 1 / M-02–M-03.

## Receipt and authority boundary

The owner forwarded an Antigravity P02 deliverable. The previous parent/coordination recorded P02 as next/unexecuted, not an active external assignment. Antigravity created two design documents and refined the task itself. Treat these as **received proposals**, not retroactive execution approval, selected owner policies or proof that all design gates are resolved. This review and its correction assignment are now registered before further work. The self-edited brief does not grant implementation authority.

Codex verified that all 174 preserved runtime/contract/test/script/infra paths still match the P01 snapshot. No runtime/schema/contract change was found among those paths. Both submitted design artifacts and the externally edited task were frozen before this reconciliation; no original result is overwritten.

The proposals for explicit permissions, current-authority replay, separate current reads, additive typed receipts and mandatory audit are useful directions. However the SQL blueprint and transaction protocol contain implementation-blocking errors. **Do not activate P03A/P03B or apply the SQL block from v0.1.** The status and decision table's recommendations remain Proposed.

## Findings and required correction

### R01 — SQL blueprint changes existing SP-02 behaviour and names an absent dependency

Decision batch section 2.2 changes addMember to result_status=204 with no snapshot; the existing Workspace contract and migration 009 require **201 Member snapshot**. It also permits createProject 204, contrary to the existing 201 Project result, and calls valid_project_creation_snapshot, which does not exist in the current migration inventory. This is a design regression and missing dependency; no SQL was executed.

Preserve the exact existing createProject/addMember/removeMember/createTask shape, immutable result and permanent identity rules. Extend only the new operation branches. Do not drop existing state=committed, expires_at=infinity, canonical payload hash, nonempty key, reference, required shape, numeric bounds and original-result protections. If any helper is newly required, declare its full definition and ownership rather than assuming it exists. A partial illustrative block must not be presented as executable migration design.

### R02 — Validators are not total or exact, and the CHECK loses null rejection

The proposed Task validator omits required fields such as description, assignee_id, blocked and work_location, lacks exact-key/type/UUID/time/location validation, and accepts numeric/string coercions through ->>. Revision/sequence upper bounds are absent. The Blocker validator omits actor/text/outcome and exact JSON type/shape checks. For a missing revision or other nullable expression they can return SQL NULL; the outer CHECK is not explicitly required to be TRUE.

PostgreSQL CHECK accepts a NULL expression as well as TRUE, so this can admit invalid rows instead of failing closed. Require a total boolean validator with explicit required keys, exact allowed keys, JSON types and semantic bounds, safe cast handling, nullable-field rules, valid locator/work-location/time identities and an outer (... IS TRUE) discipline. Preserve the existing total-validation pattern in 009. [PostgreSQL 17 CHECK semantics](https://www.postgresql.org/docs/17/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS)

The proposed protect_project_outcome checks OLD only and returns OLD for all other cases. In a BEFORE UPDATE trigger this silently discards permitted updates; it also loses the existing guard against updates into a protected NEW operation if the return behaviour is corrected alone. Preserve the existing OLD-or-NEW protected-operation check, proper DELETE/UPDATE return handling, and extend the protected set without changing unknown/protected-handoff operation semantics.

Rollback must check more than result snapshots/audit: retained new grants (including revoked historical rows), business events and other new semantic dependencies can prevent safe reversal. Specify exact empty-compatible reverse behaviour and refusal cases; do not delete evidence or alter applied 001–009.

### R03 — Replay must precede current write preconditions

Section 2.1 states revision validation immediately after Task locking, before the diagram's idempotency outcome lookup. A previously committed operation normally advanced the Task revision; an original-key retry would then fail before recovering its retained result. Similarly, rejecting a removed old assignee before checking a committed receipt can prevent safe acknowledgement recovery.

Specify the operation branches explicitly: resolve and validate authenticated actor/current target read/action scope; check exact original operation/key/hash and, when present, return the permitted original outcome after final current-session/time validation. Only an absent original outcome proceeds to **new-write** expected_revision, assignee eligibility, location/state/no-op and mutation checks. Changed payload still conflicts and current authority always precedes disclosure. Replaying an old assignment must not restore it; the UI separately reads current state.

A same-value/empty edit may be a business no-op, but must still define a stable original operation outcome if the contract promises replay. State whether the original 200 snapshot is retained atomically even though no Task revision or business-change audit is created. Returning whatever is current on each retry is not immutable original-result recovery. Also define same-value state/assignment behaviour, not empty EditTask alone.

### R04 — Permission and disclosure choices remain Proposed; private tooling alone is insufficient

Four new project-wide action names are a proposal, not a recorded owner choice. Reconcile whether a separate task-edit is necessary versus current explicit backlog-author authority for Backlog content editing; preserve the FR-40 Backlog boundary. Neither membership nor role labels supply mutation rights. Keep any disabled-target eligibility addition clearly proposed against AC-43, not silently selected.

D-02 distinguishes a nonexistent target UUID (404) from other ineligible targets (400), potentially exposing account existence outside the current project's member directory. Define one bounded invalid-assignee response that does not distinguish unknown/out-of-project/ineligible users, while separately preserving generic unavailable **Task/project** target handling. No global account lookup UI is authorised.

The proposed migration extends audit action names but omits DB issuance/revival protection for the new grants. Current runtime has capability-table privileges and 009 guards backlog-author specifically. If the design claims workspace_owner-only issuance, extend the actual enforced boundary to every selected new action, preserve runtime invalidation on removal, reject runtime issue/revival and unprovenanced legacy adoption, define uniqueness and include negative test assertions. Merely adding an operator CLI whitelist does not establish owner-only DB enforcement. Specify exact getAllowedActions task scope, selector validation and actually-registered-handler filtering as well.

### R05 — Preserve actual session fault semantics and complete reopen/history rules

The claim that a failed guard always rolls back with no audit conflicts with the reused transaction's typed denial path: it can intentionally commit a durable clock-fault latch/authentication audit while withholding business effects. Preserve that behaviour; require no Task/event/success-audit/receipt write on failed authorisation, not erasure of the authentication fault evidence. Current common-clock serialization is a bounded cooperating-writer observation, not a tested absolute no-deadlock guarantee.

The completed-Sprint section must explicitly include requested in_progress being normalised to Backlog/todo, not only requested todo; define Backlog position, task revision, unchanged completed allocation and automatic Backlog generation. Blocker writes must define their Task revision effect and safe sequence upper bound, including repeated Open/Resolved event effects and original-key replay. History paging still needs current per-page authority, exact cursor scope/dataset/expiry/error semantics and consistent reload behaviour; a short monotonicity example is not that design.

FR-31 audit must cover **editTask** as well as state/assignment/blocker mutations and any reopen placement change. State a bounded resolvable before/after representation and visibility; do not assume proposed string formats alone prove the full requirement. No chart history table, estimate, scheduler, new provider or load-balancing feature is added.

### R06 — Keep producer slices small and verification with the producer

P03D combines three mutation APIs plus replay/reopen/authority/failure integration; refine these into separate small briefs before execution, with typed persistence/private authority as prerequisites. Actual storage/audit/replay/permission/failure assertions accompany their producers. P06 may add cross-producer integration but cannot be the first time those boundaries are checked. Explicitly retain separate actual-browser evidence and actual SP-05 completion/allocation race gates; controlled SQL setup does not replace them.

No design snapshot may say all C01–C06 are resolved while these obligations or owner choices remain open. P03A contract/support paths, spec/use-case alignment, central registration and a bounded Proposed ADR must be recorded before implementation rather than made ready by an acknowledgement alone.

### R07 — Report structural checks accurately and preserve evidence

The P02 brief says no tests executed but later claims context:test ran; the handoff calls its result 45/45 requirements. The current baseline has 69 active requirements; 45/45 refers to context tests, not requirement acceptance. No P02 command/runtime/log capture was supplied under evidence at receipt. Treat those executions as **Antigravity-reported, not independently reproduced**; do not import old P01 logs as a new P02 run. Future source-only correction need not run tests at all. Record exact observed output if retaining a historical claim, and separate it from runtime evidence.

## Required next outcome

[AG03](../tasks/AG03-p02-design-correction.md) requests corrected design and a new handoff report only. Preserve submitted v0.1 design/report/brief snapshots. Use a Proposed decision table with actual owner disposition left unselected. Supply complete precise obligations or fully defined SQL pseudocode, not a destructive approximate rewrite of 009. Codex reconciles the next draft before any concrete material owner decision or implementation request.

This review does not ask the owner to approve a faulty design and does not require approval for routine source corrections. It only keeps dependent implementation unready while authorised documentation correction proceeds. No existing scope, FR/AC, role authority, retention policy, ADR status or original evidence is changed by receiving the proposal.

## Verification boundary

Actual checks: read the submitted artifacts, compare current 009/007/001 constraints and operator/transaction code, inspect current contracts, freeze receipt hashes and compare 174 preserved source paths. SQL/trigger consequences above are static findings, not executed DB failures. Documentation/link/metadata/preservation results are recorded in evidence/p02-reconciliation.json. No application/build/DB/browser/concurrency/load/provider/evaluation run, dependency/schema change, commit/push or direct external dispatch.
