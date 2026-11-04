# P01 final publication candidate

**Artifact ID:** HF42-P01-RESULT\
**Version/date:** 0.1 Draft · 4 November 2026\
**Status:** Local candidate verified; authorised branch publication, exact-commit CI and main integration follow. No predicted remote result.

[Plan v0.10](plan.md#p01-final-publication-and-cleanup-authority--4-november-2026) records explicit owner authority to commit/push the current hotfix with its necessary SP-04 checkpoint, merge after green checks and clean up merged branches. This supersedes the original documentation-only publication scope. Plan mode unavailable; written gate preceded edits/testing/Git mutations. The candidate preserves both dcd2d81 documentation and e6f2337 SP-04 history in a normal merge commit. The owner checkout/current branch/index and133 unrelated file hashes remain unchanged after the bounded root documentation edits; publication is prepared in the clean existing worktree.

Runtime changes from e6f2337 are limited to shared hasCapability/imports/six call sites and the existing-transaction unexpected-null guard. Two new suites retain exact authority/error propagation and actual Task/audit/outcome rollback/denial/clock/unknown-COMMIT assertions. Session/database.ts, batch discovery, cursor/private provisioning, UI, wire schemas, dependencies and SQL001–010 are unchanged from the checkpoint. No valuable-data migration, provider transfer or independent acceptance.

## Actual final checks

Node24.22.1, actual disposable PostgreSQL17.10, pinned pgvector0.8.2 image and unchanged006/008/009/010 fixture ceilings. The final combined18-file run passes179/179 with no failures/skips/TODOs (pg-final-result-attempt2.json / pg-final-attempt2.log). First run had173 passes and6 failed records: three HTTPS fixture children plus parents, all due to missing local-https/localhost.crt. A local junction reuses the existing synthetic TLS fixture without exporting keys or changing OS trust; unchanged suite rerun passes.

Typecheck/build, contracts27/27, prototype20/20 and all foundation workspace commands exit0. Foundation has18 passes and one pre-existing opt-in HTTPS skip, not19 passes; no TODOs. Context lint/check/tests45/45 and docs lint/tests20/20 pass on final metadata. Detailed command/exits and all failed attempts are under evidence/p01-final-2026-11-04. No overlapping historic counts are summed.

Clean-pin context initially failed because two PRD Sources links assumed a newer template layout. They now resolve to existing paths at the unchanged3c65f5c pin; PRD0.10.2 requirements/body are unchanged. Dependent current header/version metadata is exhaustively recorded in dependent-header-versions.json; historical report Inputs retain original execution snapshot versions and measured bodies. Architecture §4.2 now matches RF02/RF04. Candidate aliases for four owner-modified artifacts use the actual committed sources, without copying their private edits. Original failed metadata/context/TLS and long-path staging attempts are retained.

Scoped authored whitespace is required clean. Full staged diff retains an inherited blank-line-at-EOF diagnostic in the byte-identical checkpoint SQL010; its immutable bytes are preserved and this diagnostic is explicitly retained, not silently fixed or hidden. Graph bodies, accepted ADRs, BRD baseline, SQL and test assertions are unchanged.

## Publication and remaining gates

The local candidate is staged only from reviewed paths. Actual agent-identity/byline commit, branch push, exact-commit GitHub CI, live main equality and cleanup will be reported after execution, with no force push. Keep codex/sp-04 for its open P08 gate and all dirty/in-use worktrees/branches. Recovery after publication uses a normal follow-up commit; never rewrite main or reset/stash owner work.

SP-04 P08 actual SP-05 completion/allocation/reopen integration, D-07, formal ADR/independent/release/deployment acceptance remain open. Browser/provider/load/new UI campaigns and valuable-data migrations were not run. Foundation opt-in HTTPS skip remains visible; actual backend HTTPS cases passed in the PostgreSQL campaign. Local and CI structure checks are separate from runtime evidence.
