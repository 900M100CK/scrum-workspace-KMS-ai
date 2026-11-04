# AG02 — corrected review reconciliation and source-check closure

**Artifact ID:** SP04-AG02-DISPOSITION\
**Version/date:** 0.1 Draft · 3 November 2026\
**Status:** AG01 source cross-check closed with this explicit citation errata; AG02 corrected report received. No implementation or release acceptance.\
**Author:** Codex, coordinator/integrator.\
**Inputs:** [Antigravity corrected report](antigravity-p01-review-v0.2.md) v0.2, [AG02](../tasks/AG02-evidence-correction.md) v0.1 and [AG01 disposition](ag01-codex-disposition.md) v0.1 as receipt/execution snapshots; [current plan](../plan.md) v0.5; [P01 map](../source-review.md) v0.2.\
**Trace:** SP-04.1 / FR-09/40/43/44 and supporting FR-31 / PLAN-01 Month 1 / M-02–M-03.

## 1. Receipt, hash verification and verdict

The owner returned AG02 and reviews/antigravity-p01-review-v0.2.md exists on codex/sp-04 at HEAD 6b837fd52e01709f72bfe2de6cb96f0e9cc52653. Raw SHA-256 of this corrected artifact is `81c4d3190217d3a39e44d2c8cc2c1cab1afc19045775b78c315e5be14d5261ed`.

Codex parsed the actual numbered table, computed hashes from raw bytes and compared all 42 reported paths/hashes both with their current files and the P01 selected-source manifest. All 42 hashes are exactly 64 hex characters and match; path coverage is complete with no missing or duplicate manifest entries. Additional source-review.md hash `9d01f5d943eede207cba9ba1d30c5fe3a6c70ad0365216f710d3c073ea78c7be` and original-report hash `1184ab57018c73d3812f8885939991bf2ffa15dacf4aada21ca7ff6b9ff640c2` also match. Both reports are preserved. Exact machine comparisons and documentation checks are captured in [AG02 evidence](../evidence/ag02-reconciliation.json).

The invalid source-hash evidence in v0.1 is corrected in v0.2. Do not retroactively treat v0.1's prefixes as valid. The corrected substantive conclusions now align with the coordinator's source checks: current capability requirements, missing audited provisioning and typed immutable receipts, existing createTask status codes, unknown outcomes, actual complete lock ordering and preserved creation state/content.

**Verdict:** close AG01 as a bounded source cross-check using **v0.2 together with the errata below**. AG02's correction outcome is received/reconciled; the original report is not edited. This does not assert that every v0.2 line citation was corrected or that any missing handler, SQL behaviour, concurrency case or API has been tested. No third external review round is needed to resolve the source map; remaining product/mechanics decisions belong to P02.

## 2. Explicit citation and wording errata

The following claims are supported by source but still have inaccurate location/wording in v0.2. Use these exact current locations when producing P02; do not copy its incorrect ranges into new evidence.

| Source/assertion | v0.2 reference or wording | Coordinator correction from actual source |
| --- | --- | --- |
| 003-work-location.up.sql: task_location_shape | Lines 16–24 | Constraint begins at line 40; shape is lines 40–44. The cited earlier range is reconciliation setup. |
| 003-work-location.up.sql: preserve_completed_allocation | Lines 34–45 | Function begins line 110; immutable completed-allocation trigger begins line 118. |
| 003-work-location.up.sql: advance_backlog_revision | Lines 61–71 | Function begins line 89; its task trigger is lines 107–108. |
| 009-task-creation.up.sql: protect_project_outcome | Lines 90–106 | Function begins line 88 and ends line 95; file has 95 lines, so the reported end is beyond EOF. |
| 001-store.up.sql: assignee membership FK | Lines 66–67 | FK is line 48. This is storage referential integrity, not proof that membership.active is checked by a future assignment handler. |
| 001-store.up.sql: UNIQUE(task_id, sequence) | Lines 77–78 | Unique constraint is line 70. |
| 001-store.up.sql: blocker update privilege | Line 128 | REVOKE UPDATE ON business_audit, blocker_event is line 129. |
| clockLock | Advisory/row lock | Current session/store.ts uses a PostgreSQL row FOR UPDATE lock on auth_clock_state, not an advisory lock. |
| Conflict vocabulary | Earlier coordinator warning could suggest stale_revision is undeclared | Error.code explicitly declares both stale_revision and state_conflict; the current generic conflict() helper emits state_conflict. Preserve or deliberately coordinate the actual operation choice, rather than describing a declared enum value as invented. |

New OpenAPI component positions/dialect/version given in v0.2 are confirmed: dialect 3.1.1, contract info.version 0.2.12; Error starts 3556, EditTask 3841, SetState 3861, SetAssignee 3882, Blocker 3902 and RecordBlocker 3953. The old erroneous v0.1 ranges remain historical errors, not a change in the source file.

The report's Assignment reference to coordination v0.1 denotes the original assignment snapshot; AG02 was issued with coordination v0.2. Do not relabel either report's inspected source or original assignment metadata as newly verified under a later plan version.

## 3. C01–C06 final handling and P02 inputs

| Item | Source-check disposition | Required next design output; not an adopted change |
| --- | --- | --- |
| C01 | Confirmed UC-04/current-revision versus Error-shape mismatch | Propose a generic conflict plus a separate current-authorised getTask, or an explicitly coordinated alternative. Record exact wire behaviour before implementation. |
| C02 | Confirmed Blocker-event response versus UI derived state mismatch | Specify original event acknowledgement and a separate fresh current Task/history read, or coordinate another response design. Do not treat historical replay as current state. |
| C03 | Confirmed retry terminology needs current unknown-outcome discipline | Separate known rollback, unknown COMMIT/response and retained committed outcome; preserve original actor/operation/key/body and renewed authority. No automatic fresh-key resend. |
| C04 | Confirmed missing 413/415 declarations for future mutation routes only | Fix body/media boundaries and record coordinated contract support before exposing those routes. Existing createTask already declares 413/415 and blocker GET already declares 400. |
| C05 | Confirmed audited-rights and typed immutable-result prerequisites | Define exact explicit action names/scope/private audited provisioning and validated immutable Task 200/Blocker 201 receipts, including both shape and immutability protection. Membership/role alone is insufficient. No current schema change occurs here. |
| C06 | Confirmed unresolved no-op/normalization/bounds mechanics | Define empty edit/same-value behaviour, semantically correct canonical payload hashing, safe revisions/sequences and deterministic audit/outcome handling. |

Additional P02 obligations: document the complete actual clock → actor account/session → target account → Project → target membership → ordered Task protocol for assignment/removal and reconcile all cooperating writers. Treat disabled-assignee eligibility as a source/policy question rather than silently adding to AC-43. Define before/after audit state or resolvable immutable references to meet existing Musts; initial creation state/content already exists in the retained original result. No chart history subsystem, scheduler, estimates or load-balancing requirement is added. Full completed-Sprint reopening acceptance still needs actual SP-05 producers.

P02 remains the next feature task, not executed or newly authorised by this source-review closure. The review does not settle material owner decisions or accept Proposed ADRs. No change to the formal MVP definition or release priority occurs.

## 4. Scope and verification limits

Actual coordinator checks: current branch/HEAD, report raw hashes/preservation, 42-row reported-hash comparison and manifest coverage, both additional displayed-source hashes, current source locations and code/contract assertions, preserved runtime/contract/test/infra hashes and documentation metadata/link/whitespace checks captured in evidence. Initial parsing with the v0.1 table pattern found no numbered rows; that was a parser mismatch, not a failed report hash. The final numbered-table comparison above is the actual result.

The owner's transcript mentions temporary inspection helper scripts. No listed helper was found in the nonignored workspace paths checked; their external/ignored locations and cleanup are not attested. Do not infer that only one file anywhere was written. The coordinator verifies preserved source bytes rather than making a global filesystem claim.

Unrun: all application/build/DB/SQL/HTTP/DOM/browser/concurrency/deadlock/failure/load/provider/evaluation campaigns and independent release review. No new P01 test run is claimed. This reconciliation writes planning/review/evidence/navigation only, preserves both Antigravity reports and applied migrations, and performs no runtime fix, package change, commit/push or external dispatch.
