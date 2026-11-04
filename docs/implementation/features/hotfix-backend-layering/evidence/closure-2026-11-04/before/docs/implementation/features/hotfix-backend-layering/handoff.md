# Backend layering hotfix — implementation handoff

**Artifact ID:** HOTFIX-BACKEND-42-RESULT\
**Version/date:** 0.2 Draft · 4 November 2026\
**Status:** Bounded documentation author verification complete; HF42-F01 resolved. No independent approval or runtime acceptance.

Task status/results are authoritative in [plan.md](plan.md). Branch: `codex/hotfix-backend-layering`; base: `6b837fd52e01709f72bfe2de6cb96f0e9cc52653`. No commit, push, merge or cherry-pick was performed.

## Change and source evidence

Canonical SAD-03 v0.17 §4.2 now documents feature modules, transaction-script-style stores with direct SQL and read pagination; the database runner/authenticated wrapper/callback split; scoped Task create sequencing; recorded denial and the null type risk; atomic original outcome/audit and trigger-driven Backlog generation; Project read locking and 50-item in-memory pages. Original layering invariants and provider/service ownership remain binding. Entry SAD-03-ENTRY v0.16 points to the correct version.

[Source identities](evidence/source-inputs.json) freeze base content; architecture source anchors identify the symbols. `ownedTransaction` owns BEGIN/COMMIT/ROLLBACK; `WorkspaceProjectStore.transaction` supplies actor/guard and raises recorded denial after a normal commit; `projectAccess` explicitly locks Project and checks membership. Task create/get/list and outcome helpers establish the source-level description. `advance_backlog_revision` is in Workspace migration003. These are source observations, not fresh handler proof.

The [exact metadata map](evidence/metadata-scope.json) and [T02 brief](tasks/HF42-T02-layering.md) bound downstream updates. Dependent document changes are own version/date and current input headers; diagram changes are generated source/title metadata and index version labels. Original diagram dates, graph bodies, historical reviews/results, requirements, runtime, schemas/contracts and migrations are preserved. No brainstorming file or uncommitted SP-04 implementation was copied.

## Verification and retained failures

Node v24.22.1 was invoked explicitly with npm-cli.js. The default npm.cmd binds its sibling Node22; its initial install emitted engine warnings, so installation was rerun with Node24. See [setup](evidence/setup.json) and [installation log](evidence/npm-ci-node24.log). No manifest/lockfile change.

[Baseline checks](evidence/baseline-checks.json) were run after registration and before architecture edits. Context lint passed, docs lint passed and docs tests passed 20/20; context check and one of 45 context tests failed because the new worktree's template submodule was not initialised. Initialising the exact pinned gitlink `3c65f5cbefa7d69a75cadd89b177e3add8b400b0` resolved the prerequisite without editing template source or changing its pin. The original negative logs remain.

[After-edit checks](evidence/after-edit-checks.json) retain one introduced docs-test failure: diagram-specific dates conflicted with an existing date-preservation assertion. The correction preserves original diagram dates; the test and expectations are unchanged.

[Final checks](evidence/final-checks.json): context:lint, context:check, context:test (45/45), docs:lint and docs:test (20/20) all pass. These are structure/harness checks only. [Preservation and links](evidence/preservation.json) record scope, source checkout identity, metadata-only assertions and whitespace checks. No DB, handler HTTP, DOM/browser, provider, retrieval-quality, load or independent-review suite was run; no new live handler behaviour is claimed.

## Integration with in-progress SP-04

The original checkout stays on `codex/sp-04`, with its original staged/unstaged and untracked content preserved. Do not replace its whole architecture or register files with this worktree's older-base files.

For later authorised integration, reconcile these groups separately:

1. Architecture: replace only §4.2, retain SP-04's other design/source changes, and reconcile the header/version/change record.
2. Entry: update canonical/self versions while preserving SP-04-specific current sources and navigation.
3. Registration: carry the hotfix folder and append its row/backlink in feature/source/central registers and M-02/M-03 roadmap; retain all existing SP-04 registrations.
4. Metadata: re-resolve current dependency versions against the destination, then regenerate paired headers/titles/indexes. Do not overwrite destination manifest wholesale or change diagram graph bodies/history. The version map here describes this base only.

The shared capability helper remains conditional follow-up inside the owning SP-04 plan. Actions-discovery separation, runner extraction and null-risk correction are not implemented or independently authorised by this hotfix.

## Recovery

Keep the managed worktree for owner review. To discard this uncommitted work later, revert only the hotfix-owned paths in this worktree after reviewing its exact diff; never reset/stash the original checkout or remove unrelated edits. Dependency setup is local and leaves the tracked gitlink unchanged. Archive only when the worktree is no longer needed. No deployment or valuable-data rollback applies.


## Historical remaining acceptance gap

The broad Markdown scan retains a pre-existing missing source link in the UI blueprint Inputs header: `../agents/06-ui-ux.md`. It is identical at base commit 6b837fd and resolves to missing `docs/agents/06-ui-ux.md`. It was not changed because unrelated source-link repair is outside this hotfix. See [HF42-F01](tasks/HF42-T03-verification.md#hf42-f01--pre-existing-source-link). All newly introduced hotfix links resolve; all five npm gates pass. Overall local-link acceptance remains open, so this handoff does not mark the entire plan complete.


## HF42-F01 closure — 4 November 2026

The owner subsequently authorised the source-link correction. The Stage 6 profile link is now ../../agents/06-ui-ux.md, pointing to the existing repository profile. Current blueprint/wireframe metadata and register versions are synchronised; UI body/frames, old negative evidence and application behaviour are preserved. [Checks](evidence/f01-checks.json) pass all five existing commands; [preservation and link results](evidence/f01-preservation.json) show no missing local targets. [Plan v0.2](plan.md) closes the bounded documentation acceptance by author verification only. No outstanding HF42-F01 gap, runtime test, independent approval, commit or integration is implied.
