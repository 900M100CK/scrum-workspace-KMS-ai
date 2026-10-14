# Owner-decision change report

**Artifact ID:** CHANGE-REPORT-01
**Version/date:** 0.1 Draft - 14 October 2026
**Status:** Interim T9 report; full review and completion audit still in progress.

## Repository and authority

Observed HEAD before/current: `c6bd8dc870714d097dd3533f1e59f65031a78266`. No commits were requested or created. Original dirty work was preserved; the plan's clean-tree prerequisite was not met and no reset was performed. Decisions are owner-confirmed in conversation, not owner-committed or independently approved. [The handoff](review-handoff.md) identifies current progress and continuation steps; [the review](../analyst/business-review-2026-10-13.md) records decision-specific evidence.

## Original task disposition

| Task | Current evidence / remaining work |
| --- | --- |
| T0 | Baseline HEAD and dirty-work observations recorded in review/session; post-edit change-inventory now lists 105 matching files and correction owners; line-level residual classification remains pending. Do not manufacture a clean baseline. |
| T1 | .nvmrc requires 24; supported Node 24 harness runs recorded. Pinned submodule and clean-clone execution still need reproducibility audit. |
| T2 | ADR-0007–0011, amendment notes and index exist; later owner clarifications extend through ADR-0017. No false Accepted-on-commit claim. |
| T3 | PRD v0.5 removes product Draft and withdraws FR-45; later owner-added FR-70 changes count to 69 active while retaining 60 Must. |
| T4 | SAD v0.7 records Workspace-first creation and full protected guard scope. Latest downstream additions still require final consistency pass. |
| T5 | Removed Draft/publish/activation; exact 404 and new citation/partial-answer contracts specified. Owner explicitly authorised additive migration 002, superseding original no-migrations instruction. Applied 001 preserved. |
| T6 | Scope derives active counts and tests withdrawal/deferral invariants. Current owner extension is Should, not an extra Must or silent Core deferral. |
| T7 | Proposed BRD addendum, configurations and separate 25 research/25 safety definitions exist. Owner authorised new 8/8/9 questions/fixtures. Rubric drafted; safety configuration expectations/freeze/execution remain pending. |
| T8 | Register/contract changelog updated; 13 historical sections moved verbatim to docs/sdlc/CHANGELOG.md; current source/status reconciliation continues. Both diagram formats retained. |
| T9 | This interim report exists; residual-reference classification, clean-clone evidence and final finding dispositions remain incomplete. |
| T10 | Node 24.21.0 ran `node --test tests/concurrency/guard.test.mjs`: five TODO, zero pass, zero fail. Original four plus cleanup race are explicit placeholders. No Vitest dependency or implemented guard test. |

## Verification record and limits

Latest completed full working-tree checks used Node 24.21.0: context lint/check passed, context tests 31/31 passed, docs lint passed. Later ADR-0017 text changes reran context check/docs lint and whitespace check successfully. Original pre-edit baseline command output and clean-clone result must be attributed to their actual recorded run; they are not reconstructed by a current run.

Current context inventory: 69 active FRs plus Withdrawn FR-45, 60 Must / 4 Should / 4 Could / 1 Wont, 56 operations, 13 specs, 25 safety cases and 25 research cases (8/8/9). These are structural counts. No feature, user scenario, provider-quality or permission behavior is proved by them.

Earlier isolated database evidence is recorded separately in the storage runbook/review. No runtime application code or provider integration was added by this review. Two additive migration pairs were authored and storage-tested earlier under explicit owner authorisation; saying "no migrations" would now be false. No live development database upgrade or provider run is claimed here.

Remaining work is enumerated in the handoff. Do not treat this draft report as completion of T0–T10 or the comprehensive business analysis.

## Continuation evidence

On 14 October, the current checklist submodule was initialized at `3c65f5cbefa7d69a75cadd89b177e3add8b400b0` (status had no uninitialized marker), with 20 modified tracked prompt files and eight untracked entries. They were not edited or pushed by this continuation. This local observation supersedes older uninitialized-status notes; it does not prove remote pin availability or clean-clone success.

The checked-in `.github/workflows/context.yml` declares recursive submodule checkout, Node 24, npm ci, docs lint/tests and context lint/check/tests. This is configuration evidence only; no remote CI execution was inspected. `.nvmrc` contains 24. AGENTS.md and agents/WORKFLOW.md now distinguish existing database commands from absent application build/run commands. Diff whitespace check passed after these documentation edits.


## Diagram continuation evidence - 14 October 2026

DGM-FLOW-01/03/04 are v0.6 in both editable formats and current register tables. Partial answers, invalid-citation withholding, minimum evidence, retained-policy unavailable identity, optional task-search fallback and all-grant membership removal labels were synchronized to owner decisions. Persona handoff now points to existing UX-06.

Draw.io at C:/Program Files/draw.io/draw.io.exe successfully exported the AI flow twice in a hidden process. The first image exposed edges crossing text. A targeted ELK relayout of AI flow preserved 23 nodes/31 edges and removed the prominent crossings in the inspected overview. The second layout is wide with long return routes; it still needs a closer readability/print review. No visual acceptance of the other diagrams is claimed. Existing permission-diagram generator was not changed or run.

Local diagnostic images (not committed, may be cleaned later):
- ai-qa-flow.png: 7b97b708d0291c97c712eb5136c7ba5abec0f0c4c400a21d64478ff54de4b0fe
- ai-qa-flow-relayout.png: 244eb2d83c1f71dbe2111f4c29cf1c416d2de0d1f1b6362b5aa60d25642651da

After relayout, docs:lint passed: 8 diagram pairs, 17 artifacts, 144 nodes, 166 edges. context:check passed before geometry-only relayout: 69 active FRs, 60 Must, 56 operations, 25 research and 25 safety cases. No runtime or model test ran. No renderer process/session remains from the completed exports.

Next: inspect remaining renders and improve AI layout for practical reading; reconcile board/search/checkpoint diagrams; complete C0/C1/C2 safety expectations, residual reference review and clean-clone reproducibility. This checkpoint supersedes the earlier statement that all rendering was unverified; only AI was inspected, with limitations above.
