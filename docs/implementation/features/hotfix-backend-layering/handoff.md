# Backend layering hotfix — implementation handoff

**Artifact ID:** HOTFIX-BACKEND-42-RESULT\
**Version/date:** 0.3 Draft · 4 November 2026\
**Status:** Bounded C01 documentation/publication reconciliation verified. No runtime or independent acceptance.

## Historical pre-publication handoff

The following original receipt describes its pre-publication source snapshot; current ref evidence appears below.

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


## C01 current publication and source reconciliation — 4 November 2026

The owner selected documentation closure before any runtime refactor. Actual original commit: dcd2d815a173f8adfd71619fcc00f84880d88636, parent6b837fd52e01709f72bfe2de6cb96f0e9cc52653, author/committer Codex with Co-Authored-By. Local hotfix/main/cached origin refs match. [Live origin/main](evidence/closure-2026-11-04/live-origin.json) independently returns the same full commit; this is read-only remote evidence, not inferred publication or CI success. No new push/merge/commit was performed for C01. SP-04 e6f2337 remains a separate checkpoint with its actual Sprint integration gate open; no SP-04 sources are imported here.

Source inspection confirms that section4.2 describes feature modules and transaction-script stores with embedded SQL, database runner/authenticated wrapper/callback responsibilities, recorded-denial commit semantics and uncertain COMMIT outcomes. Both existing limits are explicit: projectAccess obtains Project FOR UPDATE and can serialize reads; Task lists load/fingerprint their full ordered projection before in-memory pages50. The null-without-denied extension risk is documented as a risk, not a reproduced current caller failure. These are identified source observations, not new performance or permission-handler proof.

[Reference checks](evidence/closure-2026-11-04/reference-checks.json) rerun the original five gates on the clean existing dcd2d81 worktree with exact pinned3c65f5c template: context lint/check/tests45/45 and docs lint/tests20/20 pass on Node24.22.1. Reference sources remain clean. Current dirty checkout/template is preserved; closure-owned changes are checked in a separately exported committed-source projection with the pinned template, without installs or resetting user work. Projection results and preservation evidence are recorded separately under the new closure directory.

The metadata synchronizer initially attempted to align four pre-existing dirty document headers. All four complete files were restored using their captured original SHA-256; [recovery record](evidence/closure-2026-11-04/metadata-preservation-recovery.json) retains the observation and exact recovery. Subsequent synchronization/testing runs only in the bounded projection. This does not relabel unrelated metadata changes as this task's work or rewrite a historical source.

Future disposition is deliberately separate: hasCapability has concrete reuse in SP-04; unexpected-null handling can remain in the existing transaction with a separately stated generic503/rollback assertion and real PostgreSQL tests using explicit006/008/009/010 ceilings as applicable. Neither change is implemented by C01. Runner extraction is a separate sensitive change when justified; actions-discovery separation waits for actual Sprint/document branches. No bundled architecture adoption, new dependency or runtime change.

Unrun: database/HTTP/DOM/browser/load/provider/evaluation/independent review and remote CI. Documentation/source/ref verification establishes none of those runtime gates. Recovery applies only to this continuation's source snapshots; never reset/stash/delete unrelated work. Actual mutable task closure is in plan.md.


### C01 final check outcome

Reference and closure projection context45/45/docs20/20 pass; metadata checks66 outputs with no drift. Original attempt1 docs failure and exact header-recovery observation are retained. Closure-local links, scoped whitespace and outside/index/ref preservation are in [final closure checks](evidence/closure-2026-11-04/final-closure-checks.json).133 pre-existing outside files are byte-identical. This updates documentation receipts only and creates no commit/publication or runtime acceptance.
