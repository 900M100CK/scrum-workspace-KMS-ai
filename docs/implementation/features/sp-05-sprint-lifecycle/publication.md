# SP-05 Draft PR publication receipt

**Artifact ID:** SP05-PUBLICATION-01\
**Version/date:** 0.1 Draft · 5 November 2026\
**Status:** Actual Draft PR created; no merge or reviewer/independent/release acceptance.

The owner requested a PR for later Antigravity review. [PUB01](tasks/PUB01-draft-publication.md) and [plan](plan.md) record explicit commit/push/Draft authority. The feature commit is 0bb0f57d9fe3893fb66a0aded3939aed2605eaf8, authored/committed by Codex with a Co-Authored-By byline. It was normally pushed to origin/codex/sp-05. [Draft PR #1](https://github.com/900M100CK/scrum-workspace-KMS-ai/pull/1) is open, targeting main, with no merge. Remote main remained1cb54f3cfdfd650caef35dce6d5fd0fd1e32a1d6 at publication verification. The GitHub API confirmed actual head/base/draft state; no credential was printed or stored.

A bounded documentation receipt commit follows this event; read the PR's actual current head for review. The feature runtime/test/contract sources are identified by [122 Git blob IDs](evidence/publication/staged-source.json), suitable for fresh checkouts across CRLF/LF differences. Earlier raw author snapshots and failed logs remain immutable historical evidence. The old dirty root/main S01/workflow work was not staged or imported.

## Verification and limits

Publication [candidate checks](evidence/publication/candidate-checks.json) passed context/docs/contracts92 records, lints and metadata. Runtime/test source is the previously measured343-record regression plus focused concurrency17/controller7 evidence, with one publication format-only change: an extra trailing blank line removed from new011 up SQL. [Format identity](evidence/publication/sql-format-change.json) proves identical trimmed SQL; [fresh disposable storage rerun](evidence/publication/storage-final.json) passed. Original001–010 remain unchanged. The first Docker-offline rerun and metadata snapshot-label failure are retained, not relabelled as successful.

[Initial PR checks](evidence/publication/first-pr-checks.json) observed context jobs still running and GitGuardian success at the feature commit. That is not a claim that CI passed, nor evidence for this receipt commit's later CI. Final exact remote head and current check state are verified after its push and reported with the PR. Do not infer handler/PG/browser correctness from the structural CI; actual local evidence remains linked separately.

Antigravity starts at [SP05-AG01](tasks/AG01-antigravity-tracking-testing.md) and the actual PR head. It need not open the old hotfix checkout or demand that HEAD equal the historical base. No Antigravity execution is claimed. No force push, main update, branch/worktree cleanup, production migration or deployment occurred. Publication rollback is a normal reviewed follow-up commit, never a history rewrite.
