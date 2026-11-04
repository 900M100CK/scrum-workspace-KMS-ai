# SP-03 verification and publication report

**Artifact ID:** SP03-PUB-REPORT-01\
**Version/date:** 0.2 Draft · 3 November 2026\
**Status:** SP-03 source published and merged into main; remote/local SP-03 branch deleted. No deployment or independent approval.\
**Inputs:** [PUB-SP03-01](../../implementation/features/sp-03-publication/plan.md) v0.2; FEAT-SP03-01 v0.5; [implementation handoff](SP-03-2026-11-02-execution.md) v0.1; SP03-UI-01 v0.2.\
**Trace:** FR-05/AC-05, supporting FR-03/31/59; UC-03 main/EX-01/EX-02; PLAN-01 Month 1 / M-02.

The owner authorised checking SP-03 and, if its bounded implementation is done, publishing to GitHub, merging into main and deleting the merged SP-03 branch. The initial branch was codex/sp-03-create-task at d6b8caf241603cdff4f9b7a2a491fc4e2e386453. Origin/main was dd69700e58d28e367f94833b85a6909a5faec1a5; remote SP-03 contained the earlier planning commits only.

## Review scope

Sequential author review covers the actual Task create/list/detail store and HTTP routes, reused session/project transaction/cursor, explicit private author provisioning, additive migration 009, atomic audit/replay, browser controller/UI and producer tests. No independent acceptance is claimed. Role/creator text does not authorise creation; current session/member/author checks precede replay. Unknown committed outcomes reconcile the original key. Reads reconstruct current operational state; the original result is retained separately.

Only the selected SP-03 implementation, coordinated contract/documentation, synthetic evidence and this publication follow-up may be committed. Unrelated agent/document alignment, SP-02 cursor follow-up, local patches/inventories and the modified template checkout remain outside publication. A candidate export checks that selected content stands on its own with the committed template revision; existing dependency installation is reused transparently.

## Actual verification and publication

Actual checks on 3 November used Node 24.21.0, existing dependencies, disposable PostgreSQL, existing trusted HTTPS and installed isolated Edge/Playwright. The selected candidate uses the committed template revision and excludes unrelated working changes.

| Check | Actual final result |
| --- | --- |
| context lint/check/test | Passed; 45/45 tests, zero skips |
| docs lint/test | Passed; 20/20 tests, zero skips |
| contracts | 27/27, zero skips |
| typecheck/build | Passed all configured workspaces |
| Project regression | 64/64, zero skips; the unrelated two new SP-02 cursor cases are intentionally excluded |
| Session storage/HTTP/lifecycle/UI | 17 + 15 + 18 + 10 = 60/60, zero skips |
| Complete Task storage/authority/HTTP/read/concurrency/controller/DOM | 66/66, zero skips |
| Foundation with existing TLS | 9 + 7 + 3 = 19/19, zero skips |
| Prototype | 20/20, zero skips |
| Real isolated Edge Task flow | 1/1, zero skips; login/create/reload/exact-key recovery/current denial/390px/sign-out |

[Exact commands/results](../../implementation/features/sp-03-publication/evidence/verification.json), [all attempted logs](../../implementation/features/sp-03-publication/evidence/verification-attempts.zip), [source validation](../../implementation/features/sp-03-publication/evidence/source-validation.json) and [browser capture](../../implementation/features/sp-03-publication/evidence/browser-capture.json) retain actual execution boundaries. All 91 recorded live runtime inputs still match P09. Candidate runtime/foundation/browser inputs match live input bytes; older SQL exports differ only by Git checkout line endings, and the intentionally excluded SP-02 test is the sole substantive difference. Applied migrations 001–008 and the template gitlink have no publication delta.

Foundation and browser ran from the original root after exact source comparison: the unchanged Vite deny rule intentionally refuses an application exported inside .tmp. No Vite protection, TLS assertion or expected result was weakened. Initial candidate attempts also exposed missing per-workspace dependency links and a missing local TLS link; setup was corrected without a package install. A non-elevated prototype attempt hit loopback EACCES; the host rerun passed. Intermediate document failures identified source aliases from excluded work; only candidate metadata was reconciled to the sources actually included. Every failed attempt remains in the archive.

Review verdict: the bounded SP-03 implementation is ready for publication. No must-fix runtime defect was found in the inspected flow; this is author self-review, not independent approval. A stale ADR-index summary is corrected to reflect all three already recorded owner choices. The specification index receives only its SP-03 implementation status. No requirement or policy is added.

## Confirmed GitHub outcome

- Source commit: [a8b31921038101d4d8e682032b13981e2421b228](https://github.com/900M100CK/scrum-workspace-KMS-ai/commit/a8b31921038101d4d8e682032b13981e2421b228), authored by Codex with the required Co-Authored-By trailer.
- Feature push succeeded, and [GitHub Actions CI](https://github.com/900M100CK/scrum-workspace-KMS-ai/actions/runs/41593728483) completed successfully before merge. The job executed dependency installation, documentation/context/contract checks, typecheck, build, foundation and prototype checks on the committed tree. It does not run PostgreSQL Task/session/project or real Edge suites; those have the separate local evidence above.
- main was fast-forwarded from dd69700e58d28e367f94833b85a6909a5faec1a5 to a8b31921038101d4d8e682032b13981e2421b228. A remote read confirmed that exact SHA before cleanup. No force-push, squash, destructive reset or merge conflict was involved.
- Both origin/codex/sp-03-create-task and the local codex/sp-03-create-task branch were deleted after the confirmed merge. The active checkout is main. The separate SP-04 worktree/branch was not altered.
- [Merge/deletion receipt](../../implementation/features/sp-03-publication/evidence/merge-receipt.json), [CI job/steps](../../implementation/features/sp-03-publication/evidence/github-ci.json) and [working-file preservation](../../implementation/features/sp-03-publication/evidence/working-preservation.json) record the outcome. All initially inventoried files outside the explicitly listed publication/documentation paths retain their bytes. Unrelated dirty/untracked work remains local and was not included in the selected commit.

Receipt-only verification passed: context check, docs lint and docs tests 20/20, zero skips. [Receipt check capture](../../implementation/features/sp-03-publication/evidence/receipt-checks.json) and [logs](../../implementation/features/sp-03-publication/evidence/receipt-checks.zip) preserve the actual results.

This v0.2 report and the plan/register status update are a documentation receipt after the source merge. Resolve their own publication commit from Git history; no self-referential SHA is predicted. Earlier P09 results remain historical evidence, not relabelled new runs.

## Limits

No development/production DB migration, deployment, dependency/provider change, force-push or independent approval. D-07 protected source/socket handoff, SP02-F01 future update/document producer races, complete SC-01/06, load calibration, other browser engines, screen-reader certification remain open. Local installation was reused; the separate GitHub CI job performed its own dependency installation and the linked structural/build checks. Formal Proposed ADR status is unchanged. Structural checks and test totals are not counts of distinct permission behaviours.
