# RF04 unexpected-null guard result

**Artifact ID:** HF42-RF04-RESULT\
**Version/date:** 0.1 Draft · 4 November 2026\
**Status:** Bounded RF04 producer verification passed; RF05 combined handoff remains pending. No whole-feature, independent or release acceptance.

## Requirement and bounded change

[HOTFIX-BACKEND-42-01 v0.7](plan.md#rf04-owner-continuation--4-november-2026) owns this owner-requested continuation on codex/hotfix-backend-layering. Trace: PLAN-01 Month1 / M-02–M-03; SP-04.2–04.4; FR-03/31/59/68, supporting FR-09/40/43/44; BR-01/02/10/11/14. [ADR-0029 v0.1 Proposed](../../../adr/0029-unexpected-null-transaction-result.md) records the bounded technical contract; this report does not accept it. Plan mode was unavailable; the registered written continuation preceded code/testing.

The only new runtime delta for RF04 is inside [WorkspaceProjectStore.transaction](../../../../services/workspace/src/projects/store.ts): await the callback; if its result is exactly null and no denial was recorded, throw an internal error before the owning transaction sends COMMIT. Existing ownedTransaction rolls back Task, business audit and immutable original outcome together. Existing projectFailure returns generic503 access_unavailable without internal detail. No session/database.ts rewrite, new result framework, runner extraction, migration, wire schema, dependency, UI or capability-policy change.

Recorded denial retains its existing commit-then-raise path, preserving an actual clock-fault latch/authentication audit where produced; ordinary unauthenticated denial does not invent that audit. Valid false/zero and204 outcome objects whose body is null stay valid. A failure after COMMIT is sent stays unknown and reconciles using the same original key/body. This hardens a synthetic extension-risk reproduction, not an observed production incident.

## Actual verification

Node v24.22.1, existing installed dependencies, actual PostgreSQL17.10 with the existing pinned pgvector0.8.2-pg17-bookworm image. Every database was a uniquely named synthetic disposable fixture. Session suites retain006; Project suites008; Task concurrency009; mutation/null suites010. No valuable-data database upgrade or SQL001–010 edit. Logs are under [RF04 evidence](evidence/rf04-2026-11-04/).

| Command / scope | Actual result | Evidence |
| --- | --- | --- |
| npm run typecheck --workspace @sacw/workspace | Exit0 | typecheck.log |
| npm run build --workspace @sacw/workspace | Exit0 | build.log |
| node --test --test-concurrency=1 tests/workspace/project-transaction-null.test.mjs | 8/8 test records: seven child cases plus parent; unchanged RF03 assertions | null-green-attempt1.log |
| Registered12-file session/Project/Task regression command in parent plan | 129/129 test records; no failed/skipped/cancelled/TODO results | regression-attempt1.log |
| node scripts/verify-context.mjs | Exit0; structural only | context-check.log |
| node scripts/docs/verify-docs.mjs | Exit0 in attempt3; two earlier metadata alias failures retained | docs-lint-attempt1/2/3.log |

The formerly red null case reaches the callback's null return, raises generic503 with commitOutcome=not-committed, and preserves title, revision1, audit count1 and original-outcome count1 exactly. Other unchanged child cases verify valid results commit, thrown callback rollback, protected HTTP generic503/no-store, forged-auth401 without callback execution, actual initial/final clock-fault persistence, and actual lost-COMMIT acknowledgement with single-effect replay. RF03's original red log and invalid first setup attempt remain frozen in their original directory. Regression counts overlap earlier reports and are not summed as unique coverage.

Documentation attempt1 found the linked REG00 alias still at0.118; attempt2 found the current UML07 alias still at0.25.3. Only those current aliases were aligned to0.119/0.25.4; attempt3 passed. Metadata outputs were calculated in memory and written only to the registered index/README allowlist, preserving all other generated/source documents. This is structural evidence, separate from PostgreSQL/HTTP behaviour.

## Preservation, recovery and remaining work

[evidence/rf04-2026-11-04/guard.diff](evidence/rf04-2026-11-04/guard.diff) isolates this runtime delta against the exact pre-RF04 source; projects-store-before.ts.txt is verified by the before snapshot's SHA256. [Final preservation checks](evidence/rf04-2026-11-04/final-checks.json) identify changed paths, source hashes, exact pre-existing file/ref/index preservation and local link/whitespace checks. Existing dirty baseline integration and unrelated owner work are retained. Recovery reverses only this minimal guarded source delta; never reset/stash unrelated work or rewrite test evidence.

RF05 combined regression/handoff, full root typecheck/build, contracts/context/docs unit campaigns, UI/browser/load/provider/deployment/remote-CI and independent acceptance were not run in RF04. No claim closes SP-04 P08 actual SP-05 handler integration. No new commit, push, merge, branch switch, runtime AI mutation or service boundary change.
