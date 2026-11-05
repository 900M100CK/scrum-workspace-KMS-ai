# SP-05 Sprint lifecycle implementation

**Artifact ID:** FEAT-SP05-01\
**Version/date:** 0.4 Draft · 5 November 2026\
**Status:** Bounded Must implementation verified locally; publication and independent/release acceptance remain open.\
**Planning mode:** Owner supplied the completed Plan-mode plan; execution now in Default mode. This saved written gate precedes code/tests.\
**Work kind:** Feature\
**Trace:** FR-06/07/08/41/42 and FR-31; BR-01/02/03/06/10/11/14; SC-03/04/06; UC-05 and SP04-P08; TC-07/13/14/16/18/19/21/22.

## Goal and parents

Implement create/allocate/start/complete Sprint, complete Backlog reorder, current reads and UI. Separate private actions sprint-create/sprint-allocate/sprint-start/sprint-complete/backlog-order were selected explicitly by the owner. FR-66/67 Could excluded; no charts, reports, scheduler, extra service/provider, agents or AI mutations.

Parents: [SP-05](../../../../specs/005-sprint-lifecycle.md), [SP-05.1–05.4](../../tasks/05-sprint-lifecycle.md), [PLAN-01 Month2](../../../planning/five-month-plan.md#calendar-and-exit-gates), [roadmap M-03](../../roadmap.md). Applicable SP-11 audit is co-delivered; SP-04 P08 is a coordinated actual-producer integration gate, not a circular prerequisite. Registers: [features](../README.md), [source](../../register.md), [central](../../../sdlc/artifact-register.md).

## Source and bounded mechanics

Base main/codex-sp05 1cb54f3 contains SP04e6f2337 plus hotfix. Separate managed worktree preserves uncommitted S01/workflow/root work. The first managed checkout failed on a Windows historical long path; repository-local core.longpaths=true enabled safe retry. No historical file was edited. No commits, push, PR, merge, production migration or cleanup is authorised.

Inputs: SP-05v0.7.3, IMPL-SP-05v0.1, PRD01v0.10.2, PLAN01v0.4, ADR0008v0.3/0014v0.2/0017v0.2 owner directions; Proposed ADR0018v0.2/0019 and current0028/0029; existing Workspace0.2.13. Exact current digests are in evidence/source-inputs.json. Source alignment changes are new proposed bounded mechanics, not acceptance of old Proposed ADRs.

Allowed runtime/test paths: services/workspace/**, apps/web/**, tests/workspace/**. Workspace owns all state/authority/audit/replay. Coordinated P02 source support: canonical SP-05 and pack/catalogue, contracts/openapi/workspace.openapi.json, contracts/data-model.json, contracts/README.md, docs/sdlc/{api-design,data-design,test-plan,test-coverage,requirement-verification}.md; new Proposed ADR0030 and ADR index; this feature folder and registration/version aliases/current generated metadata; exact policy/navigation only in SP04 plan/P08 brief when actual integration evidence exists. Applied001–010 and old evidence immutable. No other service writes or new dependencies.

Replay: current server session/project/member/action before original receipt; bind actor/operation/key/canonical payload hash; changed payload409; retain original indefinitely; state+audit+receipt commit together. Unknown COMMIT/HTTP outcome remains unknown until same-key/body reconciliation. Lock Project then Sprint then Task (stable IDs for sets); final session guard follows waits, no network inside transaction.

Allocation expected_revision is Sprint.revision; read/current-scope/location of Task rechecked inside lock. Start/complete use Sprint revision; reorder uses decimal-string backlog_revision from every terminal Backlog page. Different actor keys cannot disclose each other's results. Done retained history is immutable; unfinished returns append by Task ID as To Do with revisions/audit. Empty Sprint lifecycle allowed. No-op reorder writes only its immutable acknowledgement, no fake audit/revision.

011 adds nullable created_at/started_at/completed_at without fabricated legacy backfill, five private grants and exact immutable typed receipts. HTTP Sprint adds these timestamps; real create/start/complete stamps server time. listSprints gains cursor/400/409; mutations gain413/415. Standard mutation limit8192 bytes; complete reorder limit1MiB with generic413 and no partial application. Cursor reuses existing HMAC/page50/TTL300/full-projection invalidation; old fixtures retain006/008/009/010, new fixtures opt011 explicitly.

## Task table — only mutable execution status

| Task | Outcome | Dependencies | Current status |
| --- | --- | --- | --- |
| [P00](tasks/P00-source-branch.md) | Prepare isolated codex/sp-05 from verified main; preserve other dirty worktrees | — | Verified branch/main1cb54f3; no imported dirty changes |
| [P01](tasks/P01-registration.md) | Register plan, WBS, task briefs and source trace | P00 | Verified registered plan/WBS/16 briefs and parent links |
| [P02](tasks/P02-source-contract.md) | Align sources, explicit actions, revision, timestamps, paging/errors and audit | P01 | Verified source/contract alignment; ADR0030 remains Proposed |
| [P03](tasks/P03-storage-receipts.md) | Additive011 authority/timestamps/immutable original receipts; disposable forward/repeat/reverse/refusal | P02 | Verified disposable011 forward/repeat/reverse, receipt shape/immutability and rollback refusal |
| [P04](tasks/P04-authority-discovery.md) | Private provisioning and registered-handler discovery; revoke/rejoin negatives | P03 | Verified five private actions, audited grants, revoke/rejoin and exact registered discovery |
| [P05](tasks/P05-create.md) | Create Planned Sprint with dates/goal, server time, atomic audit/replay | P04 | Verified actual create input/time/audit/replay and failure rollback |
| [P06](tasks/P06-reads.md) | Current scoped Sprint/list/items reads with actor/generation-bound cursor | P05 | Verified scoped current reads, paging/invalidation and post-wait session denial |
| [P07](tasks/P07-allocate.md) | Single Backlog Task allocation with Sprint revision and exclusive location | P06 | Verified actual exclusive allocation, revisions/audit/receipt and competing handler schedule |
| [P08](tasks/P08-start.md) | Planned to Active with unique Active guarantee and exact original replay | P06 | Verified actual unique Active start, empty lifecycle and original replay |
| [P09](tasks/P09-complete.md) | Atomic Done retention/unfinished To Do return/counts; task-ID append order | P07/P08 | Verified actual mixed completion, Task-ID append, original counts/history and rollback |
| [P10](tasks/P10-reorder.md) | Complete Backlog permutation with exact string generation and no-op semantics | P04 | Verified full permutation/generation/no-op/numeric scale plus all four competing producers |
| [P11](tasks/P11-sprint-ui.md) | Existing-design create/read/start/complete with current scope, conflict and keyboard | P06/P08/P09 | Verified actual HTTPS DOM and Edge lifecycle, labels, focus and denial/outage |
| [P12](tasks/P12-allocation-ui.md) | Sequential multi-select with per-item result/identity and reload reconciliation | P07/P11 | Verified mixed real item results, actual mid-selection revoke, exact reload recovery |
| [P13](tasks/P13-reorder-ui.md) | Full-list up/down ordering; stale restart; no partial-list write | P10/P11 | Verified full-list UI order, mixed-generation discard and generic stale denial |
| [P14](tasks/P14-integration.md) | Actual complete/reopen/allocate/reorder races; close SP04-P08 only with evidence | P07–P13 | Verified actual SP04 completion/reopen/allocation schedules and four stale reorder races |
| [P15](tasks/P15-handoff.md) | Relevant regression/AC mapping and reviewable PR preparation, no publication | P14 | Verified final regression/structure/source/preflight; handoff and local PR text ready; no publication |
| [AG01](tasks/AG01-antigravity-tracking-testing.md) | Antigravity source-identified P00–P15 coverage assessment, actual independent reruns, concrete findings and handback | P15 local handoff; source/branch/runtime identity confirmed by reviewer | Written assignment prepared for manual delivery; receipt, execution and reviewer verdict not confirmed |
| [PUB01](tasks/PUB01-draft-publication.md) | Commit/push the verified SP05 candidate and open one Draft PR to main for later Antigravity review | P15; owner publication request; source/preservation and final checks | In progress: owner-authorised publication preparation; no merge authorised |

## Verification and handoff

Use Node24 and installed lockfile dependencies; pinned disposable PG image per existing fixture. Commands: npm run typecheck/build; node --test --test-concurrency=1 tests/workspace/sprint-*.test.mjs (actual enumerated argv recorded); existing Task/project/session suites relevant to the changed producer; controller tests, live HTTPS DOM and installed-runner Edge tests separately; context:lint/check/test, docs:lint/test, contracts:test, metadata --check and scoped git diff --check. New tests use explicit011; no valuable-data upgrade. Preserve command/exits/logs including setup failures. Permission correctness comes from actual handlers/DB, not shape checks.

P15 maps every Must AC/UC exception to actual evidence, lists unrun checks, captures source identity, and updates SP04-P08 only after actual producer races pass. Final result is handoff.md. Missing/failing gate keeps its producer open without weakening assertions. Preparation/publication is not whole-feature or independent/release acceptance.

Producer refinement before security/UI checks: new sprint-security.test.mjs covers actual revoke-first races for all five operations and post-wait expiry for all eight operations. New sprint-controller.test.mjs covers exact lost second-item recovery, mixed outcomes, current denial, tampered/foreign recovery, full-generation reads and storage/read failure. Their source/commands are recorded with the parent suite evidence. No new business scope.

P15 regression triage: first full40-file invocation339 tests325 passed14 failed, including parent/cascade failures. Root causes: JSDOM reportValidity did not focus the date field (explicit production focus added); historical010 storage direct-SQL test read CRLF while the migration runner normalises LF, so post-down function-definition comparison failed and later subtests remained at009. Only direct test SQL strings now normalise CRLF like the existing runner; applied001–010, ceilings, assertions and expected definitions are unchanged. This necessary tests/workspace harness adaptation is within canonical allowed paths. Negative logs retained. Numeric-scale reorder test now checks untouched positions keep Task revision. Final full rerun follows corrections.

Final UI recovery refinement preserves per-item confirmation/rejection/unconfirmed counters in original selection order while withholding Task IDs/content after access/transport failure. Numeric reorder comparison test normalises the DB bigint string versus public safe integer; no expected revision value is weakened. Final affected producer/controller/DOM/browser checks and full rerun follow.

P12 live consumer refinement: sprint-ui.test.mjs additionally changes actual sprint-allocate authority between two real HTTPS items, proves first commit survives, same second body/key reconciles after explicit regrant, and uses an actual competing allocation to prove mixed confirmed/rejected feedback. UI withholding keeps generic outcome statuses while clearing protected Task identities. No mock result counts replace these producer observations.

P15 navigation support, recorded before edits: add services/workspace/SPRINTS.md and a link in services/workspace/README.md; AGENTS.md gets current Sprint navigation/status only, with no working-rule/PR policy import from the separate dirty main worktree. Refresh spec/catalogue and coverage/verification current evidence pointers; link SP04 P08 result only after final producer races. No accepted ADR or old evidence bytes change.

DOM harness refinement: requiring react-dom/client before installing JSDOM globals selected its legacy attachEvent polyfill when explicit input focus was introduced. The Sprint DOM harness now loads ReactDOM after DOM setup and asserts an empty captured jsdomError list. This removes environment drift rather than masking warnings; actual Edge also asserts pageErrors empty. Browser negative-date focus and scoped checkbox touch/long-content styling receive final live checks.

P14 coordinated navigation amendment: SP04 plan/P08 brief and canonical SP04 status-only source navigation may record actual SP05 producer coverage. Existing AC/priority/runtime/old evidence stay unchanged. This implements the owner-approved P08 integration outcome rather than introducing a new feature or erasing old failures.

P14 final coverage reconciliation: add controlled actual create/allocate/completed-reopen-first schedules versus queued full Backlog reorder. Each must reject its stale generation with no reorder receipt/audit and preserve every unaffected numeric position/revision. Existing completion-return schedule remains. Production files are unchanged; rerun the changed concurrency suite and capture its exact source separately from regression2.

P15 result navigation: [SP05-RESULT-01](handoff.md), [SP05-PR-DRAFT-01](pull-request.md) and evidence/final-input-aliases.json. Current-only header input aliases in three SDLC consumers carry no revalidation of their historical result bodies. Final runtime source identity and all retained failures remain linked; no commit or publication.

P13 final controller assertion: a definitive reorder409 must discard moved local positions, refresh the full Backlog, clear the rejected request and never automatically issue another key. This consumer-only test changes no production behavior; capture its focused source/run.

P15 final verification: regression2 runtime source hashes match unchanged production and earlier tests; focused final concurrency17/17 and controller7/7 bind the only later test changes. Context45/contracts27/docs20=92 structural records, metadata/lints, tracked diff and new source whitespace, protected001–010/old ADR/baseline/package/submodule and evidence-redaction checks pass. See final-source.json/final-preflight.json. No commit was created, so the tested base plus final file digests identify this uncommitted candidate. Publication and independent/release/deployment gates remain open.

## Owner-requested Antigravity verification assignment — 5 November 2026

The owner requested a written tracking/testing task for Antigravity. This is preparation and manual handoff, not dispatch or reviewer execution. Plan mode is unavailable in this turn; this written amendment precedes assignment/support edits. Add AG01 under the existing FEAT-SP05-01, PLAN-01 Month2 / M-03 and SP04-P08; retain all P00–P15 author results as historical local verification, not reviewer approval.

Preparation allowed paths: this feature folder; registration-only updates in feature/source/central registers and roadmap; REG-00 manifest/current input aliases and generated metadata required by existing documentation checks. No runtime, contract, migration, existing test, old evidence or Git-state change. AG01 itself defines the reviewer's narrower report/evidence/new-test scope. A new reviewer input manifest records current coordination documents separately from the already tested runtime identity; do not rewrite final-source.json or original test logs.


Codex owns integration of the returned report and this canonical status table. Antigravity reports an assessment snapshot and dated progress in its own run folder; those are observations, not a competing implementation task board or acceptance. Ready-for-review never means approved or shipped.

## PUB01 owner-authorised Draft PR publication — 5 November 2026

The owner explicitly requested creating the PR so Antigravity can review it afterward. This authorises the necessary SP05 commit, normal push of codex/sp-05 and creation/update of one Draft PR targeting main, plus a bounded publication receipt commit if needed. It supersedes earlier no-publication statements for this task only. No merge, force push, other-branch cleanup, valuable-data migration, runtime fix, reviewer dispatch or acceptance is authorised. Plan mode is unavailable; this written gate precedes publication changes.

Use existing verified runtime/tests, confirm source hashes and immutable evidence, inspect the full tracked/untracked candidate and exclude ignored secrets/local setup. Current support scope: this feature folder, registration-only feature/source/central/roadmap and required REG-00/input/generated metadata. Preserve prior evidence and label later publication/coordination snapshots separately. Temporary credential/API or body helpers may live only in ignored .tmp; secrets remain in memory and are never logged. Check actual remote main/branch/PR, preserve remote changes, commit with Codex identity/byline and publish normally. Final P15/AG01 source review follows the published head, with old source manifests retained as historical snapshots. Draft PR is not merge/release/independent approval.

PUB01 staging format correction: git diff --cached --check exposed one extra blank line at the end of new011 up SQL, previously invisible to tracked-only checks while untracked. Remove only trailing file whitespace; SQL content is identical after trimEnd. Applied001–010 remain unchanged. Record the old/new SHA and rerun the existing disposable011 storage suite; retain earlier author snapshots rather than claim identical raw SQL bytes.
