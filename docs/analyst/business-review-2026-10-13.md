# Business analysis review and owner clarifications

**Artifact ID:** BA-REVIEW-02\
**Version/date:** 0.2 Draft · 14 October 2026
**Status:** Review in progress; not a full-document consistency sign-off.\
**Sources:** Initial review snapshot: BRD English v1.0; PRD-01 v0.4; SAD-03 v0.6; DATA-04 v0.2; API-05 v0.1; TEST-08 v0.2; REG-00 v0.16; PLAN-01 v0.1; SP-07 v0.1; ADR-0004 v0.2; ADR-0006 v0.1. Current correction evidence is recorded below; root owner decision/plan inputs and explicit owner replies remain inputs.
**Trace:** BR-01–BR-14; SC-01–SC-08. Coverage remains under review.\
**Author:** Codex acting sequentially as business analyst; no independent approval.

## Confirmed direction

The owner explicitly confirmed that `owner-decisions-OD-02-03-04-11.md` and `agent-change-plan.md` describe the chosen direction, and requested questions about conflicts before application. These inputs are not authority to commit, overwrite unrelated work, erase historical evidence or silently accept unresolved choices.

| ID | Explicit session clarification | Application impact |
| --- | --- | --- |
| BA-D01 | Synchronise the already implemented schema using new migrations; preserve migrations that have run. | Supersedes the change plan's prohibition on new migrations for this task. Keep `001-store` files unchanged. Verify upgrade, rollback and immutable evidence on synthetic databases. |
| BA-D02 | Retain 60 release Must requirements; revisit schedule/capacity if throughput is insufficient. | The ADR-0010 proposed escalation list already contains only Should/Could requirements. Omitting them cannot lower the remaining Must count. No additional Must deferral is authorised. |
| BA-D03 | The owner will supply `research-question-and-advisor-note.md`. | T7 is pending input. Do not invent the research question, advisor confirmation, BRD §13.4 or C0/C1/C2 definitions. Continue independent work. |
| BA-D04 | Create an explicit read grant for the author of a restricted document; the grant can subsequently be revoked. | Author identity is not a permanent read bypass. Current membership and current grant remain required. Initial read-grant creation belongs in Workspace's creation transaction. |
| BA-D05 | Keep the guard for protected document/citation reads and AI responses; internal policy/state reads do not reacquire it. | Amend ADR-0011's overly narrow “only” wording. Preserve final check-through-handoff for protected output, generation wait outside the guard, and uncertain lifecycle-write reconciliation. |
| BA-D06 | Fix questions/rubric before the pilot, select thresholds from pilot evidence, then freeze thresholds before formal evaluation. | Resolves the research note's contradictory “before any run” threshold wording. No thresholds or results are invented. |
| BA-D07 | Score document and operational citations by their respective identities; top-five applies only to eligible document-retrieval questions. | Preserve exact document/version/passage versus operational entity/time/revision and correct metric denominators. |

Additional owner confirmations: BA-D08 adopts the 25-question research direction (8 document / 8 state / 9 combined), retains the original 25 cases as safety regression and requests fixtures/reference answers. BA-D09 records at least eight hours per working day and submission in April 2027; kickoff, days per week and exact submission date remain unknown. Do not invent weekly capacity or a calendar Week-2 deadline.

These are business directions confirmed in conversation, not claims of independent review, owner commits or implemented runtime behaviour. No commit was requested.

## Current test/evidence correction — 14 October 2026

Latest storage-fit review: [DATA-FIT-01](../sdlc/data-policy-fit-review.md) inspects actual migrations and runtime-role privileges. Existing columns can express completed allocation preservation and membership grant invalidation/unassignment, but no handler enforces these transactions yet. Concrete gaps remain for immutable per-handoff evidence records/operational entity kind, locator survival during physical purge, optional unlink, creation fencing and unresolved idempotency expiry. Local business_audit rows can satisfy mandatory minimum durability without inventing a remote sink/outbox requirement. No migration was changed or database test rerun.

BA-D21 confirms invalidation of all individually granted project capabilities on removal and fresh grants on rejoin. BA-D22 confirms atomic current task unassignment with revisions/audit and historical attribution preserved; rejoin does not reassign. BA-D23 rejects removing the last effective membership manager until another member has that authority, without an Admin bypass. [ADR-0017](../adr/0017-membership-removal-capabilities-and-assignees.md) and dependent requirements/UC/spec/UX/API assertions record the decisions. Delegation/provisioning mechanics remain open.

Verification for this documentation slice: current contract descriptions were checked at removeMember/setAssignee; context check, docs lint and diff whitespace checks passed. No new runtime test or independent review is claimed. Existing 69 active FRs, 60 Must and 56 operations are unchanged.

Latest UX consolidation: [UX-06](../sdlc/ui-ux-spec.md) v0.1 now provides the missing Stage 6 entry, six-source inventory, screen/UC/TC trace, protected/empty/loading/conflict/unknown-outcome/partial-answer states, and dispositions for all 22 local UI/UX and 19 Blueprint checklist items. Workbook examples are not adopted targets; visual tokens, rendered UI, accessibility measurements and user interviews remain gaps. The AI inspector's obsolete claim that unavailable-citation policy/payload was undefined is corrected against ADR-0013.

BA-D20: the owner explicitly added task title/description keyword search and selected Should after the existing 60 Must. [ADR-0016](../adr/0016-optional-task-keyword-search.md), FR-70/AC-70, scope, SP-08, UC-08 Alt-5, VERIFY-01 and TC-25 record it. Workspace OpenAPI v0.2.1 adds searchTasks, separate from Knowledge document search; current project membership, paging rechecks and AI/Knowledge-outage independence are required. No additional service or application handler was implemented.

Latest executed checks: context lint/check passed with 69 active FRs plus Withdrawn FR-45, 60 Must / 4 Should / 4 Could / 1 Wont and 56 operations; context tests 31/31 passed; docs lint passed for eight pairs/17 registered diagram-source artifacts; diff whitespace check passed. The new UX entry is a text design and is not included in that diagram-artifact count. No rendered, application or provider tests were run. Earlier counts and missing-entry findings below are historical snapshots superseded here.

Latest research semantic review: BA-D18 confirms partial answers with supported claims/citations and explicit missing requested components; total lack of support remains insufficient_evidence. BA-D19 confirms clarified RQ-20 (named t-api) and RQ-22 (first unfinished Product Backlog item); C0 may not infer RQ-22's task from disabled operational state. [ADR-0015](../adr/0015-partial-evidence-answers.md), Knowledge OpenAPI v0.2.2 and research-cases v0.2 apply these decisions. Previous unexecuted research definitions are retained with a hash. RQ-09 reference output also removes the out-of-project ID formerly embedded in an exclusion instruction.

[EVAL-RUBRIC-01](../../eval/rubric.md) records the author semantic review, component/support/completeness/abstention and citation denominators, per-configuration discovery eligibility, input isolation, failure treatment and shared pilot/final-source limitations. It is a proposed rubric, not frozen scoring or measured research. Query completeness, source-task linkage evidence, provider selection, independent review, configuration-specific safety regressions and actual pilot/formal runs remain pending.

Verification after these changes: context lint/check passed; 31/31 context tests passed (including partial-response and disabled-selector negatives); docs lint and diff whitespace checks passed. Existing 68 active requirements, 60 Must, 55 operations and 25 research / 25 safety cases remain. These checks cannot establish semantic entailment, live access enforcement or statistical quality.

Latest inventory correction: [VERIFY-01](../sdlc/requirement-verification.md) now maps all 69 FR/AC identities (68 active plus Withdrawn FR-45), 31 named UC alternate branches and nine NFRs to observations and explicit gaps. A source-to-matrix comparison verified equal identity sets, matching AC numbers, unique alternate identities and existing TC references; 24 gates are defined. This verifies inventory completeness, not semantic sufficiency or runtime acceptance. Context check, docs lint and diff whitespace checks passed after this correction; unchanged context tests were not rerun in this slice.

The review found and corrected absent explicit discovery-positive assertions (TC-23), project/membership-positive assertions (TC-24) and the missing optional FR-64 use-case branch (UC-02 Alt-2). BA-D17: the owner retained multi-task Sprint selection with per-task outcomes. [ADR-0014](../adr/0014-multiple-sprint-allocation.md), the existing allocateTask contract description, SP-05 and board UX describe separate keyed operations aggregated by UI, successful items retained, and unknown outcomes reconciled without fresh-key duplication. The inventory remains 55 operations and 60 release Must requirements. This does not require a new bulk endpoint.

The remaining comprehensive review must still inspect research claim/rubric semantics and configuration-specific safety expectations, consolidated UX and rendered diagrams, data/handler fit for the changed policies, safe orphan handling, remaining authority/capability choices, and current-versus-historical entry/status consistency. These are not resolved by the complete identity inventory.

Latest clarification: BA-D14 requires current project membership and retained document-read policy before exposing a surviving unavailable citation identity; audit-only rights and old citation possession are insufficient. BA-D15 chooses a fixed generic withheld-answer response, without source identity or detailed cause. BA-D16 rejects delivery of an original draft with an invented citation: only a new attempt checked for claim support, exact citations, current access and durable provenance may be delivered. [ADR-0013](../adr/0013-unavailable-citations-and-withheld-answers.md) records these directions and the draft wire mapping.

Knowledge OpenAPI v0.2.1 specifies typed UnavailableCitation and HTTP 503 AnswerWithheld; Workspace remains v0.2.0, 55 operations total. API-05 v0.4, affected PRD/UC/UX/specs and test assertions reflect the decisions. The UC exception matrix now has 46 Specified active rows, one Protocol gap and one Withdrawn row (48 identities). Retained-policy/tombstone implementation, safe orphan cleanup, full FR/AC and alternate-flow coverage, research semantic review, consolidated UX and rendered checks remain incomplete.

Latest executed verification after contract changes: context lint/check passed; context tests 28/28 passed, including four new schema negatives; docs lint passed for eight diagram pairs and 17 artifacts; git diff whitespace check passed. These are definition checks, not evidence of claim-support validation, permission enforcement or transport safety. No application/provider evaluation or database test rerun was performed for this change.

The following earlier correction record preserves the prior 44/1/2 exception mapping and 24-test snapshot; its two contract-policy gaps are superseded above.

BA-D12: the owner chose scoped audit visibility of actor/action/entity identity/time even when the inspector lacks document-read, while protected content remains redacted. BA-D13: the owner confirmed mandatory durable minimum audit/provenance: business audit or pending delivery is atomic with the owning mutation; run ID/exact evidence is persisted before protected provider/answer handoff; optional metrics may be unavailable and labelled. [ADR-0012](../adr/0012-audit-visibility-and-durable-evidence.md), FR/AC-31/56/57, UC-11/13, architecture/data notes, contract descriptions, inspection UX and SP-11/13 now record these decisions. This is not a read bypass or implemented audit adapter.

TEST-08 v0.3 and [TEST-COVERAGE-01](../sdlc/test-coverage.md) replace the old open 17/7/20 mapping with concrete assertions: 48 EX identities exactly match current UC-02; 47 are active and one Withdrawn. Forty-four are Specified, one has a protocol gap (orphan cleanup), two have contract gaps (unavailable citation/withheld answer). All application results remain Not run. Eight SCs and BR-01–BR-14 have named gates; 22 gate definitions do not establish full positive/alternate-flow FR/AC coverage. The v0.2 plan is preserved as historical documentation.

Regression corpus synthetic-0.3 excludes product Draft without relabelling the old evidence: historical synthetic-0.2 and pre-correction definitions are retained with verified hashes. EVAL-05 now tests unsaved editor text exclusion; EVAL-21 declares two immediate revisions, newest Current and unchanged exact old citations. All 25 EVAL identities remain; changes occurred before any model run/freeze. A definition-only materializer permits scenario locators without pretending to execute an application mutation. Research fixtures remain separate.

Verification: context tests passed **24/24** after three new fixture negatives; subsequent `context:lint`, `context:check` and `docs:lint` passed after audit contract descriptions changed. Inventory remains 68 active FRs, withdrawn FR-45, 60 Must, 55 operations, 25 regression plus 25 research questions (8/8/9). Separate inspection confirmed all 48 matrix identities/withdrawal status against UC text, every referenced TC exists, and both historical hashes match. No application, provider or new database run is claimed.

Remaining review includes the full FR/AC positive/alternate-flow trace; concrete orphan cleanup and terminal response/identity policies; research semantic/rubric review and regression configuration-specific expectations; consolidated UX and rendered checks; data/handler mapping for reopening and mandatory evidence. Current author corrections do not establish independent approval or project completion.

## Historical UC/UX correction evidence — 14 October 2026

BA-D10: the owner confirmed direct changes between any two of To Do, In Progress and Done, including reopening Done. BA-D11: reopening a Done task from a Completed Sprint preserves completed allocation history, returns the task to Product Backlog and leaves the Sprint Completed. ADR-0008 v0.2, FR/AC-09, UC-04, SP-04 and the `setTaskState` contract now record this direction. Data/handler mapping and concurrency tests remain required; no new workflow engine or Must requirement is added.

UC-02 v0.3 reconciles UC-06 creation/grants and UC-07 immediate Current revision, removes publication actors, retains withdrawn Alt/EX identities and adds explicit failure/retry cases. It also corrects the assumption that archival alone makes a citation unavailable: retained authorised history still opens the exact evidence. New UC-06 EX-05/06 and UC-07 EX-05/06 need Stage 8 mapping. Import follows the full create-authority/classification checks; repeated revocation remains idempotent while checking manager authority.

The six UX sources and all eight Mermaid/Draw.io pairs now have current source/version metadata and the affected lifecycle/access/board labels. Docs creation no longer uses an activation step; source reads no longer use a Draft/content-write bypass; final source handoff explicitly rechecks current access and exact evidence inside the guard. The use-case Draw.io labels match the new author/UC-07 wording. REG-00 v0.18 and UML-07 v0.10 record current versions separately from historical evidence. Native diagrams remain editable; layout/rendering and full UX checklist review are not proven by source matching.

Latest verification: `docs:lint` passed **8 pairs / 17 artifacts / 144 nodes / 166 edges**. `docs:test` passed **7/7** before the final source-read label clarification, whose regenerated pair then passed `docs:lint`. Context initially caught the old UC-07 heading link; that link was corrected and `context:test` passed **21/21**. `git diff --check` passed after normalising only added Markdown lines while preserving hard breaks. No application handler/provider or database tests were rerun for this UC/UX documentation slice.

Remaining review: full semantic/trace audit and consolidated UX entry; Stage 8 scenario/exception matrix and old regression lifecycle corrections; research claim support and frozen rubric; data/architecture mapping of reopened completed-Sprint work; terminal response contracts and fenced orphan cleanup. This is progress in the comprehensive review, not full-set approval.

## Historical pre-UC correction evidence — 14 October 2026

PRD-01 v0.5, SAD-03 v0.7, DATA-04 v0.3, API-05 v0.2, PLAN-01 v0.2 and the v0.2 contract/spec packs now carry the owner-confirmed direction. Context validation reports 68 active requirements plus withdrawn FR-45, 60 Must / 3 Should / 4 Could / 1 Won't, 55 API operations and 13 specs. This is structural evidence, not full business or application acceptance. Downstream use cases, UX, diagrams, test-plan matrices and the artifact register still need reconciliation; do not treat their old lifecycle or version references as current authority.

BA-D08 is implemented as `eval/research-cases.json` with 25 RQ identities and `eval/fixtures/research-corpus.json`, including added documents, source-task links, Sprint/task/allocation/backlog/blocker observations and C0/C1/C2 claim references and reference answers. The research corpus is separate from the original regression corpus; new tasks alter aggregate answers. The original 25 safety cases remain, with obsolete Draft/publication scenarios explicitly pending correction. The proposal and evaluation README now record adoption rather than requesting it again.

BRD English v1.0 now includes §13.4 as a **Proposed addendum**, pending formal research-framing confirmation, with the confirmed pilot freeze sequence and separate document/operational citation metrics. The baseline version and BRD pointer are unchanged. No advisor message was sent. Academic approval, numeric margins, pilot and formal results remain absent.

Verification on portable Node 24.21.0: `context:lint` passed; `context:check` returned the inventory above and 25 research questions grouped 8/8/9; `context:test` passed **21/21**. Added negatives reject observation values inconsistent with their operational source, observations without source rows and source-task links crossing projects, in addition to access/configuration/revision/blocker checks. These checks do not prove prose support or runtime permissions. `docs:lint` currently fails at **Origin version drift: DGM-ARCH-01**; additional downstream issues may follow. `git diff --check` reports trailing whitespace in revised Markdown metadata; cleanup is pending. The three one-use reconciliation/generation scripts were removed after use.

Remaining review work includes semantic inspection of every reference answer, frozen scoring rubric/splits, regression lifecycle correction, full BR/FR/AC/SC/UC-to-test coverage, diagram/source reconciliation and orphan-cleanup protocol. No provider evaluation or application handler tests ran. The previous database results below remain historical evidence and were not rerun in this documentation slice.

## Historical first correction slice

[ADR-0007–ADR-0011](../adr/README.md) now record the confirmed direction and remaining gaps. The original root inputs remain unchanged. Existing Proposed ADR-0001/0002/0006 have amendment pointers; their historical proposal text is preserved. REG-00 is v0.17 and explicitly distinguishes the new direction from unreconciled dependent artifacts.

Added owned migration pairs `002-current-revisions` (Knowledge) and `002-registered-policy` (Workspace), leaving both services' migration 001 files unchanged. Upgrade refuses legacy Draft/pending data rather than silently exposing or removing it. Policy-only reverse SQL preserves content and policy records; the existing all-migrations rollback CLI remains destructive and must not be confused with that test.

After these additions, `npm run db:test` passed **12 results (11 scenarios plus parent)** on portable Node 24.21.0, PostgreSQL 17.10 and pgvector 0.8.2. New assertions cover atomic immediate revision twice, exact original passages, no Draft insertion, rejection of invalid Current-pointer commits, replay, policy rollback preserving evidence, and failed upgrades preserving legacy Draft/pending rows. Tests used only the suite's uniquely named disposable container, not the development volume.

The local development database has not been upgraded in this slice. PRD/contracts/scope/specs/evaluation/UX still describe the old target and require reconciliation before the changes form an implementation baseline. Database test success does not close the full review or any end-to-end feature spec.

Follow-up evidence: context check/test still pass against the unreconciled 69-FR baseline. Post-change docs checks detected REG-00 v0.16 references in both version tables and the unlabelled historical storage paragraph after the register moved to v0.17. Both tables were corrected and the old storage section explicitly labelled Historical. The final rerun passed `docs:lint` and all seven `docs:test` cases. `git diff --check` passed and the tracked diff for all four migration-001 files was empty.

## Historical research input arrival

The owner subsequently added `research-question-and-advisor-note.md`; it has now been read. BA-D03's missing-file condition is resolved, but T7 is not yet applied. Part A remains an advisor note, not evidence that the advisor agreed, and no message has been sent. Part B must remain a Proposed addendum when incorporated.

The owner resolved both methodological conflicts through BA-D06/BA-D07 above. Do not invent H1/H2 numeric margins, provider settings, capacity measurements or achieved results. Inspection of all 25 questions found only EVAL-14/15 have expected operational entities; no case currently requires both a document and an operational observation. T7 must disclose that H1 cannot yet be evaluated on this set, rather than relabelling multiple-document questions as `both` or inventing new questions without the requested scope change. EVAL-05/21 also require reconciliation with removal of Draft/publication.

## Findings and correction ownership

| ID / severity | Evidence and business consequence | Correction owner / next action |
| --- | --- | --- |
| BA-F01 / Blocking application | The change inputs target SAD v0.5 and REG v0.15, but current SAD is v0.6 and REG v0.16 with implemented PostgreSQL storage. T4/T8 would reuse current version numbers; blanket “no runtime tests have been run” would erase recorded database evidence. | Coordinator: rebase edits on current files, increment from current versions and distinguish database tests from unimplemented handlers/transport tests. |
| BA-F02 / Blocking application | Knowledge `001-store.up.sql` allows Draft and Draft-to-Current; Workspace has pending/active registration. ADR-0009/0011 remove these product steps while T5 forbids migrations. | Data designer: BA-D01 authorises additive migration work. Do not edit applied migration history. Pre-existing Draft or pending data requires an explicit safe upgrade disposition, not implicit publication or deletion. |
| BA-F03 / Important | ADR-0010 proposes 60 Must after FR-45 withdrawal, then lists only already optional work as further deferrals. The list cannot resolve a deficit in the 60 Must delivery rate. Its approximate 17-week denominator also differs from PLAN-01's feature freeze at week 17. | Planner: BA-D02 keeps 60 Must. Use kickoff and actual remaining feature weeks; report capacity uncertainty. No invented kickoff or weekly availability. |
| BA-F04 / Blocking application | ADR-0011 B.2 narrows the guard to Flow 4, whereas SAD §3.1 and Flow 5 protect document/source response handoffs too. | Architect: BA-D05 resolves intent. Map the rule to actual internal routes and retain source/citation protection. Required concurrency tests are not runtime evidence yet. |
| BA-F05 / Important | ADR-0007 gives author write/manage capabilities but restricted reads require an explicit grant. Without a creation grant the author can create content they cannot subsequently read. | Requirements/API/data: BA-D04 resolves initial read entitlement. Test creation, grant revocation and removal/rejoin without author bypass. Capability delegation remains distinct. |
| BA-F06 / Important | T7 names a missing research note. T2 requests an ADR index not present in the listed ADR files. T10 assumes Vitest although `package.json` uses Node's test runner. | Coordinator/evaluator: defer T7 per BA-D03; use existing repository conventions or add a documented ADR index. Do not introduce a framework just for TODO tests. |
| BA-F07 / Important | PRD OD-12, TEST-08 environment text and root command guidance still describe migrations as absent; ADR-0004, current DATA-04 and package scripts show real storage implementation. | Coordinator and Stage 8: refresh current-state statements without treating storage scenarios as complete application AC coverage. Historical claims must be labelled snapshots. |
| BA-F08 / Important | TEST-08 explicitly retains a missing SC-to-test matrix and 7 Partial / 20 Gap exception rows. Passing context checks cannot close those assertions. | Stage 8: write the scenario and exception assertions against the reconciled decisions, then bind real handlers when present. Do not mark full coverage from FR-ID membership. |
| BA-F09 / Important | SAD §2.3 writes the not-found message as `Resource not found`; both OpenAPI contracts use `Resource unavailable`. ADR-0007 requires identical status/body/schema for missing and denied reads. | API/architecture: choose one canonical contract representation and align prose, fixtures and UI. Test actual paired responses once handlers exist. |
| BA-F10 / Important | ADR-0008's illustrative SQL orders `blocker_events` by timestamp/ID, while physical `blocker_event` has an explicit unique per-task `sequence`. T5 also names `document_acls.acl_version`; physical authority is `document_policy.permission_revision`. | Data/architecture: use the existing canonical physical names and sequence ordering; document logical-to-physical mappings rather than adding duplicate authority fields or tables. |
| BA-F11 / Important | The new creation sweep can race a delayed Knowledge persist: observing no content once does not prove content will never be committed. ADR-0011 does not yet specify fencing, cancellation or reconciliation for orphan cleanup. | Architect: define a recoverable cleanup protocol before implementing physical deletion. Preserve fail-closed reads and no cross-service DB writes. |

## Verification baseline

HEAD before changes: `c6bd8dc870714d097dd3533f1e59f65031a78266`.
The worktree was already dirty: the template submodule was modified and root decision/plan/patch files plus NotebookLM tooling were untracked. Preserve them. A clean-worktree precondition is not permission to delete or stash the owner's work.

Executed with portable Node **24.21.0**, without replacing host Node **22.23.0**:

| Check | Result | Meaning |
| --- | --- | --- |
| `npm run context:lint` | Pass | JavaScript syntax for the context harness. |
| `npm run context:check` | Pass | 69 FRs; proposed 61/3/4/1 overlay; 56 operations; 13 specs; 25 reference cases. This is the pre-change baseline. |
| `npm run context:test` | Pass, 9 tests | Context/contract negative unit cases. |
| `npm run docs:lint` | Pass | 8 diagram pairs, 17 artifacts, 148 nodes, 173 edges. |
| `npm run docs:test` | Pass, 7 tests | Parser/structure/version checks, not rendered usability or business approval. |
| `npm run db:test` | Pass, 10 results (9 scenarios plus parent) | PostgreSQL 17.10 / pgvector 0.8.2 in a disposable synthetic container; existing storage behaviour only. |

Not run in this review: application security/handler tests, live provider evaluation, visual/accessibility inspection, clean-clone reproducibility, backup restore or final retrieval evaluation. The three context commands cannot establish these properties. The full BR/FR/AC/SC/UC-to-test audit is not complete.

## Checklist and handoff

- Pass: applicable skill and development rules read; current source versions checked; material conflicts put to the owner; responses recorded without inventing approval or test evidence.
- Gap: finish downstream UC/UX/diagram/register/test-plan reconciliation, semantic research-reference review and full coverage audit. The historical migration test run is recorded above; handlers remain unimplemented.
- Pending input: exact kickoff/weekly capacity and remaining PRD open decisions when required by the affected work. H1 now has combined-source definitions, but no executed evidence; academic confirmation and post-pilot margins remain open.

Handoff: ready for bounded correction with the confirmed directions above. The overall review remains active; this report does not declare the project or document set complete.
