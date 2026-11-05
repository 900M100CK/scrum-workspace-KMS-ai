# Bounded Sprint lifecycle mechanics

**Artifact ID:** ADR-0030\
**Version/date:** 0.1 Proposed · 5 November 2026\
**Status:** Proposed mechanics; separate actions/Must-only scope selected by explicit owner answers and implementation request. No independent acceptance.\
**Inputs:** SP-05v0.7.4; FEAT-SP05-01v0.1; Workspace0.2.14; ADR0008/0014/0017 directions and Proposed0018/0019.\
**Trace:** FR06/07/08/41/42 and31; BR01/02/03/06/10/11/14; SC03/04/06.

Use existing Workspace transaction/session/capability/cursor infrastructure. Five separately provisioned project actions, no implicit role grant. Project then Sprint then Task locking; current session guard after waits; mutation/audit/immutable original acknowledgement co-commit. Actor/operation/key/hash binds permanent originals and current rights precede replay. Allocation binds expected Sprint revision and locked current Backlog Task scope. Completion preserves Done associations, returns unfinished To Do in Task-ID append order and retains original transaction counts. Reorder requires complete Backlog permutation and exact decimal generation; no-op keeps order/revision/audit unchanged.

Add011 timestamps with null legacy values instead of guessed backfill, private actions/provenance and typed immutable receipts. Scope-bound cursor50/TTL300 reuses current pattern; full-projection fingerprint invalidates changed pages. Alternative role-derived grants/whole-selection transactions/history reconstruction from current Task state would contradict selected authority/multi-select/immutable history. Existing schema010 is immutable, and valuable-data migration is not authorised. Empty reverse only; retained authority/outcomes/audit refuses destructive down. New receipts retain Sprint goal/current timestamps or minimal reorder acknowledgement indefinitely under current access, as existing original-result mechanics. Tradeoff: complete projection paging is a capstone-sized pattern, not a scale claim.

Actual handler/storage/failure/concurrency/UI evidence belongs to FEAT-SP05-01. Tests must prove same-key recovery, revoke/remove, post-wait expiry, two starts/allocations, rollback, complete/reopen/later allocation history, full-list reorder and UI refresh. No existing Proposed ADR is accepted or runtime AI write enabled.
