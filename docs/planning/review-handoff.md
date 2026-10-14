# Business review continuation handoff

**Updated:** 14 October 2026
**Status:** In progress. The owner resumed work and requested a durable handoff if context/tokens run out.
**Objective:** Apply the business-analyst review to the whole workspace, clarify material ambiguities with the owner, and reconcile confirmed decisions. This is not a request to implement the entire application.

## Start here

Read AGENTS.md, docs/development-rules.md and agents/WORKFLOW.md, then [the current review](../analyst/business-review-2026-10-13.md), [ADR index](../adr/README.md), [change report](change-report.md) and [original task plan](../../agent-change-plan.md). Owner replies override conflicting instructions/counts in the original plan. Preserve unrelated dirty work, existing branch and applied migrations. No commits, upstream pushes, parallel agents or external messages have been authorised. Documents/code remain English; reply Vietnamese.

HEAD observed before and during this review: `c6bd8dc870714d097dd3533f1e59f65031a78266`. No commits made. Work is uncommitted across many files; inspect current worktree before relying on this handoff. The checklist submodule and root input/patch/NotebookLM files already contained unrelated changes; do not clean/reset or publish them.

## Confirmed business decisions: do not ask again

- ADR-0007–0011: immediate immutable Current revisions, no product Draft/publish; explicit revocable author read grant; Workspace allocates policy before Knowledge content; protected source/citation and AI handoffs guarded, internal scoped policy/state reads do not reacquire. New additive migrations allowed; applied 001 preserved. Retain 60 Must, revisit capacity/schedule rather than automatically cut more.
- ADR-0008 amendments: direct task moves including reopen Done; reopen from Completed Sprint returns to Backlog, preserves completed history and leaves Sprint Completed.
- ADR-0012: audit inspector may see scoped actor/action/entity/time without content-read; protected content remains redacted. Minimum audit or durable pending record is atomic with mutation. Run ID/exact evidence durable before protected handoffs; optional metrics may be missing and labelled.
- ADR-0013: unavailable citation identity requires current membership and retained read policy; old possession/audit rights do not suffice. Generic withheld-answer message without evidence or detailed cause. Invented citation invalidates original draft; only a fully rechecked replacement can deliver.
- ADR-0014: multi-task Sprint selection with per-item outcomes. Design uses separate keyed allocateTask operations aggregated by UI; confirmed successes persist, unknown outcomes reconcile.
- ADR-0015: partial cited answers with explicit missing requested components; no supported content means insufficient_evidence. RQ-20 names t-api; RQ-22 asks first unfinished Product Backlog item; C0 cannot infer the target from disabled operational data.
- ADR-0016: add FR-70 task title/description keyword search as Should after existing 60 Must. Workspace-owned and independent of AI/Knowledge. Latest counts: 69 active FRs plus Withdrawn FR-45; 60 Must / 4 Should / 4 Could / 1 Wont; 56 operations.
- ADR-0017: removal invalidates all individually granted project capabilities and clears current task assignees atomically, preserves history, increments revisions; rejoin restores neither. Reject removal of last effective membership manager until another current member has authority; no creator/Admin bypass.
- Research: 25 questions split 8 document / 8 state / 9 combined, plus separate 25 safety cases; fixtures/reference answers requested and authored. Freeze questions/references/rubric before pilot, thresholds after pilot before formal evaluation. Document and operational citations scored by their own identities. No provider/model or threshold selected.
- Capacity: at least eight hours per working day; submission April 2027. Kickoff, exact deadline and working days/week still unknown. Do not invent calendar commitments.

## Completed review artifacts and evidence

PRD v0.5 with dated owner amendments; SAD canonical v0.7; contracts Workspace v0.2.1 / Knowledge v0.2.2; new ADRs through 0017; updated release scope/specs; additive migration 002 pairs. TEST-08, TEST-COVERAGE-01 and VERIFY-01 distinguish planned assertions from actual results. VERIFY-01 gained FR-70/UC-08 Alt-5 after its original 69-row/31-alternate inventory check; recheck current counts before reporting them.

UX-06 (`docs/sdlc/ui-ux-spec.md`) now exists with screen/state/authority inventory and 22 UI/UX + 19 Blueprint checklist dispositions. Rendered verification remains missing. DATA-FIT-01 (`docs/sdlc/data-policy-fit-review.md`) compares real schema/privileges with policies; several implementation/schema gaps are explicit.

Research definitions v0.2 and proposed `eval/rubric.md` include semantic review, source-selector dependency, partial answers and denominators. Old research/regression definitions are retained under eval/fixtures/history with hashes. No model runs or frozen criteria exist. Safety-regression expectations per C0/C1/C2 still need review.

Most recent complete harness run: context lint/check pass, context tests 31/31 pass, docs lint pass (8 diagram pairs, 17 registered diagram-source artifacts), diff whitespace pass. Subsequent ADR-0017 prose slice reran context check/docs lint/diff only. Earlier database run passed 12 results (11 scenarios plus parent) on synthetic storage; not rerun for recent policies. No application handler, UI, provider or live permission/concurrency pass is claimed. Five concurrency tests are TODO, not passes.

## Work in progress and next actions

1. Finish original T0/T1/T8/T9 reporting: required change-inventory/report files were absent before this handoff; change-report is being created now. Capture present inventory separately from historical baseline; do not fabricate pre-edit output. Clean-clone/pinned-submodule reproducibility remains unverified. Check CI and actual commands.
2. Reconcile register/history and Stage 9 spec-review: old findings/counts/statuses persist in historical sections and some current entry prose. Move historical register sections to a changelog as T8 requests, preserving exact content and relative links; do not erase findings. Revalidate before marking each finding resolved.
3. Onboarding command correction is done: AGENTS/workflow now identify existing database commands and absent application build/run. Current submodule/CI configuration evidence and the fresh T10 listing (5 TODO, 0 pass) are in change-report.md. Clean-clone and remote CI execution remain unverified.
4. Review safety regressions per configuration; operational collection completeness/source-link observations; corpus consistency and current research claims. Rubric is proposed, not frozen or independently reviewed.
5. Inspect rendered diagrams and reconcile recent partial-answer/search/membership decisions with relevant sources. Preserve both Mermaid and Draw.io; no single-source deletion is authorised.
6. Close or explicitly hand off creation orphan fencing and data-fit gaps. BA completion does not require building handlers, but every material business ambiguity must be resolved or clearly surfaced with consequences. Additional capability delegation/provisioning, identity/provider/retention inputs remain open.
7. Final completion audit must cover original T0–T10 and all current review findings, not just green harness counts. Produce concrete current report and outstanding implementation decisions before marking the goal complete.

## Tool and execution notes

PowerShell workspace is `D:\scrum-workspace-KMS-ai`. Portable supported Node executable used: `C:\Users\MCK\AppData\Local\Temp\kms-node24\node-v24.21.0-win-x64\node.exe`; prepend its directory to PATH for npm. Host Node was 22; recheck before claiming otherwise.

Default exec sandbox has failed with helper setup errors; approved escalated exec has worked. Do not bypass approval. Use apply_patch for Unicode text: PowerShell here-string piped to Node can corrupt non-ASCII literals, so script literals should be ASCII or Unicode escapes. No known live process was left by the last completed read; still inspect any new returned handle before restarting an interrupted operation.

Update this handoff after material progress. Never claim a passed check merely from a prior handoff or a missing failure message.

## Latest continuation checkpoint

T0 post-edit inventory now exists at change-inventory.md (105 matching files, routing only; residual line-level semantic classification still pending). T8 moved 13 historical sections verbatim to docs/sdlc/CHANGELOG.md; concatenated moved-content SHA-256: 1cc32f4756fc915bd7d41dde2afdc1d14377b535ee8f4a179762d1852349d73b. SPEC-REVIEW-01 v0.5 rechecks F-01-F-12; original v0.4 is preserved at spec-review-v0.4-history.md. Context check/docs lint/diff whitespace passed. Next concrete work: update both diagram formats for partial-answer/unavailable-citation/membership and optional search decisions, then rendered review; finish reproducibility and safety-regression per-configuration expectations. Earlier pending inventory/history-move bullets above are superseded by this checkpoint.


## Diagram continuation evidence - 14 October 2026

DGM-FLOW-01/03/04 are v0.6 in both editable formats and current register tables. Partial answers, invalid-citation withholding, minimum evidence, retained-policy unavailable identity, optional task-search fallback and all-grant membership removal labels were synchronized to owner decisions. Persona handoff now points to existing UX-06.

Draw.io at C:/Program Files/draw.io/draw.io.exe successfully exported the AI flow twice in a hidden process. The first image exposed edges crossing text. A targeted ELK relayout of AI flow preserved 23 nodes/31 edges and removed the prominent crossings in the inspected overview. The second layout is wide with long return routes; it still needs a closer readability/print review. No visual acceptance of the other diagrams is claimed. Existing permission-diagram generator was not changed or run.

Local diagnostic images (not committed, may be cleaned later):
- ai-qa-flow.png: 7b97b708d0291c97c712eb5136c7ba5abec0f0c4c400a21d64478ff54de4b0fe
- ai-qa-flow-relayout.png: 244eb2d83c1f71dbe2111f4c29cf1c416d2de0d1f1b6362b5aa60d25642651da

After relayout, docs:lint passed: 8 diagram pairs, 17 artifacts, 144 nodes, 166 edges. context:check passed before geometry-only relayout: 69 active FRs, 60 Must, 56 operations, 25 research and 25 safety cases. No runtime or model test ran. No renderer process/session remains from the completed exports.

Next: inspect remaining renders and improve AI layout for practical reading; reconcile board/search/checkpoint diagrams; complete C0/C1/C2 safety expectations, residual reference review and clean-clone reproducibility. This checkpoint supersedes the earlier statement that all rendering was unverified; only AI was inspected, with limitations above.


## Owner-confirmed EVAL-19 correction

Applied API + JWT + session references in safety definitions v0.3, with explicit conflict expectations/reference answers for C0/C2 and insufficient_evidence with no document references for C1. Configuration applicability matrix and eval README synchronized. Prior v0.2 preserved byte-for-byte at eval/fixtures/history/reference-cases-pre-conflict-0.2.json with SHA-256 in current definitions. Context check and whitespace check passed. Targeted assertions verified all three sources are Current, project-shared and in p-alpha; C0/C2 and C1 expectations; archive hash; and all other 24 cases unchanged. No model run or criteria freeze. This EVAL-19 decision is resolved; broader BA review remains incomplete.

Prior remote clean-clone command completed successfully at .tmp/review-clean-clone-20261014, including submodule pin 3c65f5cbefa7d69a75cadd89b177e3add8b400b0. Dependency installation and checks inside that clone have not run. No process from that clone command remains live.
