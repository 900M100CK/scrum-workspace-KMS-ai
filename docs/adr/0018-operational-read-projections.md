# Operational reads for refresh and reconnect

**Artifact ID:** ADR-0018  
**Version/date:** 0.2 Proposed · 18 October 2026
**Status:** Proposed implementation design under existing requirements; not owner-approved or implemented.  
**Inputs:** PRD-01 v0.9; ADR-0008/0014/0017; SYS-REVIEW-01 v0.1 SYS-02.  
**Trace:** BR-02/03/06/13; FR-07/09/41/42/44; NFR-04; SC-01/03/04/08.

## Context and proposed decision

Workspace owns authoritative allocations and blocker events. Before Workspace v0.2.3, public task/Sprint reads omitted enough information that a new browser could not reconstruct work location or blocker history. The v0.2.3/v0.2.4 corrections add member-scoped read projections to the existing Workspace service, not a new store or permission authority.

- Task responses contain a discriminated `work_location`: backlog with decimal-string position; allocated Sprint with Sprint ID; or completed Sprint with retained Sprint ID. A Done task created or moved in Backlog remains a Backlog item until an allocation changes its location. Reopening completed-Sprint work produces Backlog/To Do; historical allocations remain independent.
- `listTasks` defaults to all project tasks, ordered by task ID. `location=backlog` selects Backlog items, ordered numerically by position, then task ID. Decimal strings preserve PostgreSQL numeric precision. Reordering is authoritative only after committed confirmation and a renewed list.
- `listSprintItems` returns allocation rows (allocated/completed/returned) plus the current Task projection, sorted by task ID. The allocation state describes association history; current task state/location must never be presented as a historical completion snapshot. Returned items are history, not current Sprint Board cards. Reopening preserves a completed association while current location becomes Backlog.
- `listBlockerEvents` returns committed events in ascending per-task sequence, including actor/time/description/outcome. It requires current membership and task read access, not audit-read. An empty history and derived unblocked state are valid. Audit-only metadata permissions do not apply to this ordinary work-data surface.
- Sprint completion returns its committed Sprint plus retained-Done and returned-unfinished counts from that transaction. Same-key reconciliation preserves counts but renews current access before returning them.

Each list page is an internally consistent committed read. Cursors bind authenticated actor, current membership generation, resource/filter, ordering and a scoped dataset version. Reject malformed/foreign cursors without leaking scope; a changed/expired dataset returns a generic 409 `state_conflict` and no items. The UI discards accumulated pages and restarts. A dataset version can be an opaque digest over the canonical ordered projection; a persisted revision optimisation is optional and must invalidate on every change affecting the projection. No numeric expiration or unbounded snapshot retention is selected. Every page rechecks current authority; cursor possession grants no access. Separate reads are not a shared global snapshot; reconnect reloads affected lists and treats notifications only as invalidation hints.

## Alternatives and consequences

Browser-only allocation memory fails reload/reconnect. Audit reconstruction would require unrelated privileges. An unbounded nested Sprint response couples every read to project size. Separate paginated projections and explicit task location support existing flows with two read operations and no new business feature. Conservative invalidation can cause restarts under active editing; implementation must measure this and must not silently mix pages.

No migration is applied. Existing task position, allocation state and blocker sequence supply history, but historical completed allocations alone cannot determine current location: a reopened task can later become Done in Backlog without losing its old completion association. Persist an explicit current-location discriminator and applicable Sprint reference atomically with creation/allocation/completion/return/reopen; The follow-up below supplies that schema and migration; handlers remain unimplemented. Do not derive current location from any historical completed row or task state alone. Read transactions and cursor integrity/current-authority checks also require handlers and tests. Unknown authority denies, AI outage has no dependency on these reads, and stale pages never become proof of current state.

## Verification and handoff

Checklist: specified ownership, data/error/auth semantics and requirement trace; Gap for consumer/provider, permission, pagination/concurrency and database behavior. SP-03/04/05 and TC-07/08/16/21 must verify reload from a fresh client, completed/reopened history, returned To Do items, equal-position ordering, event sequence, stale/foreign cursors, removal between pages and independent AI failure. Schema tests prove only declared fields and paths. No security or runtime acceptance is claimed.

## Location persistence and complete reorder protocol

The Stage 4/5 follow-up supplies Workspace migration 003 and DATA-04's transition matrix. Task.location_kind and location_sprint_id are authoritative current placement; completed history cannot derive them. Deferred same-project/Sprint-allocation references and final consistency checks reject invalid combinations. Completed allocation rows are immutable. Project.backlog_revision is a dedicated positive bigint, encoded as a decimal string on the wire. It is independent of project metadata/task revisions and cursor fingerprints.

Reorder is a complete-list operation. Gather every page of listTasks(location=backlog) at the same backlog_revision and stop only at next_cursor=null. A cursor conflict discards the accumulated list. Send a full permutation with expected_revision equal to that revision; never send a filtered page. The server rechecks authority, locks the project before work rows, and rejects stale generation, omitted/foreign/non-Backlog IDs generically without writes. Duplicates/malformed input are 400; set/revision mismatch is generic 409. Empty is a no-op only for an empty Backlog. Actual reorder uses positions 1..N; identical order does nothing. Persist minimum audit and the idempotent receipt in the transaction. Same-key successful replay returns the original receipt after renewed access checks, even if newer mutations have advanced the current generation.

Creation in Backlog, allocation out of Backlog, returns/reopening into Backlog and changes to Backlog positions advance the generation through storage triggers. One transaction may advance it multiple times; clients compare equality, never assume +1. A content/state/assignee/blocker edit with unchanged location/order does not advance it, although it invalidates a list cursor fingerprint. Every writer locks the same project row before Sprint/task rows, in stable ID order, and updates task revisions when placement/position changes. SQL constraints do not supply end-user authority or business audit.

Migration refuses ambiguous old completed history without explicit owner-only task-location reconciliation bound to the old task revision. Live allocations are unambiguous; rows without live/completed associations default to Backlog. No old row is deleted or guessed from Done state. Downgrade refuses when any tasks exist rather than erasing current-location truth. See the storage runbook for reconciliation and forward recovery. The applied development database is unchanged.
