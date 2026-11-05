# SP-05 local implementation handoff

**Artifact ID:** SP05-RESULT-01\
**Version/date:** 0.1 Draft · 5 November 2026\
**Status:** Bounded local verification; owner/independent/release acceptance and publication are not claimed.\
**Execution inputs:** [plan v0.2](plan.md), SP-05 v0.7.4, Workspace OpenAPI0.2.14, logical model0.14; exact initial hashes in [source-inputs](evidence/source-inputs.json).

## Delivered behavior

Workspace now implements createSprint/listSprints/getSprint/listSprintItems/allocateTask/startSprint/completeSprint/reorderBacklog. Separate privately provisioned actions never derive from PO/SM roles. Current session/member/action checks precede original-result reconciliation. State, audit and the immutable actor/operation/key/hash receipt commit together; changed payload409. Lock order Project → Sprint → Task, stable Task IDs; session rechecked after waits.

011 is additive; 001–010 are unchanged. Nullable server observation timestamps preserve missing legacy times as null. Retained grants/audit/receipts/timestamps prevent destructive rollback. The [runbook](../../../../services/workspace/SPRINTS.md) covers private provisioning, bounded transport, test setup and rollback limits. No valuable database was migrated.

UI preserves the current design: labelled lifecycle forms, per-item sequential allocation with mixed outcomes, exact saved key/body reconciliation after lost response/reload, and full Backlog up/down ordering. Reads reconstruct current data after acknowledgement. Completed/Returned association labels remain historical even when the current Task was reopened/allocated elsewhere. Denied/unavailable reads clear protected panes; explicit logout clears recovery.

## Acceptance and actual evidence

Counts below are Node test records including parent records, not independent business requirements. Suites overlap; do not sum them as unique behaviors. All disposable DB suites use real PostgreSQL17.10 and pinned pgvector0.8.2 image. Node24.22.1; installed lockfile dependencies; local TLS trust without verification bypass.

| Trace / assertion | Executed proof |
| --- | --- |
| FR06/AC06, UC05 create/date exceptions | sprint-http invalid goal/date/schema/media/CSRF and actual server timestamp/atomic original; DOM and Edge blank-goal/reversed-date focus and zero invalid writes |
| FR07/AC07, UC05 allocation | HTTP same-project/current Backlog/exclusive Planned-or-Active allocation; actual two-producer barrier; task/Sprint revisions, audit/receipt co-commit |
| FR08/AC08, UC05 start | Actual competing starts produce one Active; completed start denied; original start replay; server time; empty Sprint permitted |
| FR42/AC42, UC05 complete | Actual Done + unfinished completion, counts, To Do return, revised Task state, retained association/current fresh read; empty completion; original counts after later writes |
| FR41/AC41, UC05 reorder | Complete permutation only; missing/duplicate/stale deny; unchanged order no audit/revision; numeric-scale unchanged positions retain revision; actual create/allocate/complete/reopen versus queued reorder |
| FR31/AC31, TC13/14/16/18/19/21/22 | Every five producer operations: audit and receipt insertion faults roll back state; actual lost COMMIT ack replays without duplicate state/audit; private audited grants; DB shape/immutability/refused destructive rollback |
| BR01/03/06/10/11/14, SC04/06 bounded authority | Actual revoke-first for all five operations and original/changed body; current membership removal/rejoin restores no right; post-wait expiry for all eight reads/writes; foreign actor keys/cursors and cross-project denials |
| SP04 P08 / TC07/08 integration | Controlled completion-first/reopen-first and both completed reopen versus new allocation orders use actual SP04/SP05 handlers; old Completed history unchanged; at most one current association. No SQL fixture completion substitutes for these producers |
| UI / TC07/16/22 | Live HTTPS/PG DOM:6/6; controller7/7; actual mid-selection revoke/regrant and conflicting allocation yield independent outcomes; full-generation pages discard mixed state; storage failure prevents sends |
| Browser consumer boundary | Isolated Edge156.0.4314.58 over trusted HTTPS:1/1. Actual cookie, keyboard/form focus, complete/reload/original key-body, 390px overflow assertion, revoked action and member removal, logout; no page errors. Final desktop/mobile captures visually inspected |

### Final executed gates

- [regression2](evidence/regression2.json): root build and typecheck passed; all40 non-browser Workspace test files343/343 passed, zero skips, covering historical006/008/009/010 and new011, session/project/Task/Sprint producer and DOM/controller regressions.
- [reorder-races-final](evidence/reorder-races-final.json): changed concurrency suite17/17 passed including three additional actual create/allocate/reopen versus reorder schedules. Production source is unchanged from regression2. [controller-final](evidence/controller-final.json):7/7 includes definitive409 discard/no-new-key recovery. These focused runs supersede those two files' earlier versions, not the whole343 counter.
- [browser-final](evidence/browser-final.json): final real Edge1/1, [environment/screenshots](evidence/browser-1793848599262/summary.json); [desktop](evidence/browser-1793848599262/desktop.png), [mobile](evidence/browser-1793848599262/mobile.png).
- [regression1](evidence/regression1.json): foundation checks passed before the final UI corrections; build/typecheck and structural92 also passed there. Final structure/source checks are separately recorded in evidence/final-checks.json.
- Source identity: [regression2-source](evidence/regression2-source.json) binds runtime/test files actually exercised by the broad run; the focused concurrency/controller records bind their later test-only changes. evidence/final-source.json binds final source and verifies preservation; evidence/final-preflight.json records final scope checks.

### Failed attempts retained

No result is inferred from a contract/shape check. Initial producer fixtures omitted JSON media on malformed-null tests; first concurrency tests contained quoting/schema-invalid changed-body errors. Initial Edge route.fetch lacked process CA trust; its diagnostic cookie is redacted while failure semantics are retained. First full regression339 records had325 pass14 fail including parent/cascade failures: date validation focus plus direct SQL CRLF comparison left the historical test at009 after failure. Production focus and direct-test newline handling were corrected; old migrations/ceilings/semantic assertions remain unchanged. The later DOM harness loaded ReactDOM after JSDOM setup and asserts no jsdomError, rather than masking its attachEvent console error. Logs and corrective runs are preserved under evidence/; final343 and Edge/DOM results do not rewrite those failures.

## Git, preservation and limits

Implementation is uncommitted on codex/sp-05 in the dedicated managed sp-05-lifecycle worktree, based on main1cb54f3. The original dirty hotfix checkout, separate main S01/workflow work and legacy SP04 worktree remain separate. No unrelated changes were imported. No commit/staging/push/PR/merge, production upgrade or branch deletion occurred. [PR description](pull-request.md) is prepared locally; create one Draft PR only after authorised commit/publication.

SP04 P08 is locally verified with actual producers and linked in its canonical plan; this does not self-approve SP04/SP05 or close all M03 gates. FR66/67 edit/remove remain excluded and undiscovered. Proposed ADR0030 records selected bounded mechanics without declaring broader ADR adoption. D07/SP02-F01, external review, CI, valuable-data migration rehearsal, performance/load limits, wider browser/accessibility matrix and deployment remain unproven. Existing historical browser suites were not rerun individually in this final pass; current Edge Sprint gate and all existing non-browser/DOM suites ran. The full Backlog UI and reads use existing page50/300-second cursors and a documented1MiB reorder bound; no measured scalability claim.
