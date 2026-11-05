# M-03 Scrum technical readiness checklist

**Artifact ID:** SP05-M03-READINESS-01\
**Version/date:** 0.1 Draft · 5 November 2026\
**Status:** Evidence prepared for owner milestone review; not a milestone or release acceptance.\
**Sources:** [roadmap M03](../../../roadmap.md), PLAN-01 Month2, PRD/UC contracts, existing SP02/SP03/SP04/SP05 plans and Antigravity report v0.5.

| Roadmap exit area | Actual bounded source and evidence | Technical handoff |
| --- | --- | --- |
| SP02 membership/removal/last manager | membership-removal.test.mjs and membership-lifecycle.test.mjs; project concurrency/authority/UI suites are in the returned40-file run. Actual last effective membership-manager protection, grant invalidation, unassignment/revisions/audit, no revival and two-removal serialization. | Evidence present; descriptive role labels never substitute for explicit capabilities. |
| SP03 Backlog create/read | task-authority.test.mjs, task-storage.test.mjs, task-http.test.mjs, task-reads.test.mjs, task-ui/controller suites in the independent regression. Creation needs private backlog-author, immutable original-result receipt and atomic audit. | Evidence present. No unsupported task_origins table claim. |
| SP04 task state/assignment/blockers | task-state, task-assignment, task-blocker and task-mutation-* suites in the regression. Actual assign-first/remove-first producers, enabled-member eligibility, historical replay, append-only blocker sequence/current flag and stale revision denial. | Evidence present for actual producers; Task states are todo/in_progress/done with direct authorised transitions. |
| SP05 lifecycle/order/exclusivity | Seven dedicated suites57 reported pass plus broad347 regression; current source122 verified. Planned/Active/Completed, one Active per project, exclusive current allocation, per-item results, full permutation/generation/no-op, retained/returned history and fresh reads. | Evidence present within existing Must scope; FR66/67 remain unimplemented Could operations. |
| SP04-P08 actual integration | sprint-concurrency actual complete/reopen/new allocation schedules and create/allocate/complete/reopen versus reorder; audit/receipt faults and lost COMMIT replay included.17 is Node test records including parents/fault cases, not17 distinct races. | Actual handler/PG evidence present; no SQL-only completion fixture substituted. |
| Full relevant Workspace regression | Antigravity40 files347/347, exit0, raw log and source/marker/counter reconciliation. [F-REG-01 closure](regression-closure.md). | Resolved by execution; not waived. |

## Corrections to the pasted summary

Use the actual descriptive membership roles product_owner/scrum_master/developer/viewer (OpenAPI); capabilities are separately provisioned. Task workflow has only todo/in_progress/done, with no in_review and no imposed linear approval chain. Existing test names include membership-removal/membership-lifecycle and task-authority, rather than invented member-* or task-author file names. Creation receipts use the existing idempotency outcome mechanism; the summary's task_origins label is not an asserted storage table. The original pasted text is preserved as received; these notes correct the coordinator's interpretation without rewriting reviewer input or adding product scope.

## Owner acceptance boundary and later work

This checklist supports a **Ready for M03 owner review** recommendation for the Scrum scope. It is not a new claim that every milestone/release requirement is accepted from a pass counter. SP02's parent still records SP02-F01: the actual assignment/removal portion now has concrete producer evidence; the document-grant/removal portion belongs to the later SP06/Knowledge dependency and is not silently marked closed here. Its own plan/status must retain the correct cross-feature scope. This document does not edit or close another feature's canonical task table.

M03 acceptance requires the owner's recorded milestone decision against the roadmap exit evidence. Release verification is a separate later M08/SP12 scope, including remaining Knowledge/access/retrieval/AI/audit/evaluation slices. No need to repeat the already passing controller or seven Sprint suites merely to correct wording or close F-REG-01. Only new code changes, failures or source drift justify another affected runtime check.
