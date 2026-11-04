# RF05 combined verification and handoff

**Artifact ID:** HF42-RF05-RESULT\
**Version/date:** 0.1 Draft · 4 November 2026\
**Status:** RF01–RF05 bounded hardening author verification passed. Ready for owner review; no independent, parent-feature or release acceptance.

## Requirement and delivered behaviour

[HOTFIX-BACKEND-42-01 v0.8](plan.md#rf05-owner-continuation--4-november-2026) is the sole execution/status authority on codex/hotfix-backend-layering. Trace: PLAN-01 Month1 / M-02–M-03, SP-04.2–04.4 / FR-09/40/43/44 with FR-03/31/59/68, BR-01/02/10/11/14. Committed SP-04 e6f233735f6e7c09dee7af4ec54b19902b0910b9 supplies the source/regression baseline; execution was not transferred into SP-04. Plan mode unavailable; the registered written continuation preceded the campaign. [ADR-0029 v0.1](../../../adr/0029-unexpected-null-transaction-result.md) remains Proposed.

Two delivered changes are isolated in [runtime-against-sp04.diff](evidence/rf05-2026-11-04/runtime-against-sp04.diff):

1. Shared hasCapability retains the exact grant predicate for Project membership-manage and Task backlog-author/task-edit/task-state/task-assign/task-blocker. The six call sites retain the same client, parameters, membership/read checks, session revalidation and ordering. The helper propagates database errors; it adds no permission or role bypass.
2. The existing authenticated transaction awaits its callback and throws before COMMIT for exactly null without recorded denial. The existing owning runner rolls back attempted Task/business-audit/original-outcome changes; existing HTTP handling emits generic503 access_unavailable without internal details. Recorded denial retains commit-then-raise, including actual required clock latch/authentication audit. False, zero and204 objects with null bodies stay valid. Lost COMMIT acknowledgement stays unknown and reconciles through original operation/key/body.

Only [projects/capabilities.ts](../../../../services/workspace/src/projects/capabilities.ts), [projects/store.ts](../../../../services/workspace/src/projects/store.ts) and [tasks/store.ts](../../../../services/workspace/src/tasks/store.ts) differ in runtime from the SP-04 checkpoint. The two new suites are project-capabilities.test.mjs and project-transaction-null.test.mjs. RF05 changes no runtime source or test assertion. No runner/actions-discovery extraction, cursor/query pagination rewrite, new capability policy, service, provider, dependency, wire or SQL change.

## Actual commands and results

All commands used Node v24.22.1 and existing installed dependencies; no installation. The combined database run used actual PostgreSQL17.10, pinned pgvector/pgvector:0.8.2-pg17-bookworm image digest feb68f4f15446397d8cac7f4fe48fe4586de83160d1fc48b46283312d1a33966. Configuration/source details: [environment](evidence/rf05-2026-11-04/environment.json). Only uniquely named disposable synthetic databases were migrated and removed by the unchanged fixtures; no valuable-data upgrade.

| Check | Actual result | Evidence under evidence/rf05-2026-11-04 |
| --- | --- | --- |
| npm run typecheck | Exit0, all configured workspaces | build-checks.json / typecheck-attempt1.log |
| npm run build | Exit0, all configured workspaces | build-checks.json / build-attempt1.log |
| npm run context:lint; npm run context:check | Both exit0 | structural-checks-attempt1.json / context-lint-attempt1.log / context-check-attempt1.log |
| npm run context:test | 45/45 | context-test-attempt1.log |
| npm run contracts:test | 27/27 | contracts-test-attempt1.log |
| npm run docs:lint; npm run docs:test | Exit0; docs20/20 | docs-lint-attempt1.log / docs-test-attempt1.log |
| node --test --test-concurrency=1 with the registered18 test files | 179/179; failures0, skips0, cancellations0, TODO0 | pg-result-attempt1.json / pg-combined-attempt1.log |

[pg-suite-files.json](evidence/rf05-2026-11-04/pg-suite-files.json) and [pg-result-attempt1.json](evidence/rf05-2026-11-04/pg-result-attempt1.json) preserve every exact filename/argument. Session persistence/lifecycle keep006; Project authority/HTTP/removal/concurrency keep008; Task authority/HTTP/reads/concurrency keep009; mutation/helper/null suites explicitly use010. Historical ceilings and assertions are unchanged. These179 are test records including parent records, not179 independent handler behaviours; overlapping RF02/RF04 results are not summed as unique coverage. Context/contracts/docs results are harness/structural evidence, separate from database/HTTP behaviour. All RF05 runtime and npm check first attempts passed; earlier RF02 Docker-off, RF03 invalid first setup/actual red reproduction and RF04 metadata-alias failures remain frozen with their original explanations.

## Behavioural boundaries verified

The unchanged helper suite covers exact grant dimensions, parameterized actions, no role/other-action bypass, membership concealment, revoke/regrant, actual runtime SQL permission failure and recovery. The null suite reaches the actual null return and verifies unchanged Task revision1, audit count1 and outcome count1 after rejection, not just an HTTP503. It also verifies valid result commit, thrown rollback, generic protected HTTP failure, ordinary401 without callback execution or invented audit, actual initial/final clock-fault latch/audit persistence, and an actual COMMIT followed by injected acknowledgement loss with original-key single-effect replay.

Combined existing session/Project/Task suites cover current access, revocation, disabled/removed/expired identities, both real lock orderings, stale revisions, duplicate original identities, cross-producer competing writes, business/audit/outcome failure rollback and current-authority checks on replay. Internal completed-Sprint placement setup remains a test double for that boundary; it does not prove actual SP-05 completion/allocation/reopen integration. This is bounded execution evidence, not a claim of absolute concurrency/security correctness.

## Source identity, preservation and recovery

[checkpoint-comparison.json](evidence/rf05-2026-11-04/checkpoint-comparison.json) records58 baseline runtime/UI/schema/contract/dependency paths unchanged after CRLF-to-LF comparison, plus the exact isolated runtime delta. Current files and source identities are checked against [RF05 before](evidence/rf05-2026-11-04/before.json) and [RF04 tested sources](evidence/rf04-2026-11-04/final-checks.json). [Final checks](evidence/rf05-2026-11-04/final-checks.json) record exact pre-existing/frozen-evidence hash preservation, changed-path allowlist, branch/ref/index identity, local links/whitespace and source hashes.

The pre-existing474-path guarded SP-04 baseline restore remains separate from these two new changes; it is not newly authored RF05 implementation. All other dirty owner work is retained. HEAD remains dcd2d815a173f8adfd71619fcc00f84880d88636; codex/sp-04 remains e6f2337; no staging, commit, merge, push or branch switch. Root build outputs are generated artifacts and do not change source identity.

RF05 documentation edits are limited to plan/entry/WBS/report, WORKSPACE-TASKS-01 v0.6 current notes and registered source/feature/roadmap/central/review/index metadata. Generated outputs were calculated in memory and written only to the explicit index/README allowlist. The first final-inventory check classified the directory entry docs/SDLC-Prompt-Checklist/ as a new file because only the before side had applied is_file filtering. [Attempt1](evidence/rf05-2026-11-04/final-checks-attempt1.json) retains that checker failure; the corrected file-only comparison applies the same filter to both sides without editing the directory or changing any source/hash assertion. Exact hash-validated [before-images](evidence/rf05-2026-11-04/before-images.json) support selective recovery of the RF05 documentation delta. RF04's guard.diff/projects-store-before.ts.txt and the RF02 source baseline retain implementation recovery identities; reverse only the relevant authored deltas, never reset/stash unrelated work or rewrite evidence. No data rollback/migration is required for these code changes.

Architecture §4.2 retains its original base6b837fd snapshot. Its earlier hypothetical-helper/null observations are superseded for current implementation by the RF02/RF04 results and [current runbook](../../../../services/workspace/TASKS.md#hotfix-capability-reuse-and-unexpected-null-boundary). Project FOR UPDATE and full-projection/in-memory pagination limits remain; this campaign makes no scalability claim.

## Remaining gates and handoff

RF01–RF05 has no remaining registered bounded hardening task. Owner review and any commit/publication require their own explicit instruction. SP-04 P08 actual SP-05 handler integration, D-07, formal ADR decisions and independent/whole-feature/release/deployment acceptance remain open. No runtime AI write authority or Knowledge implementation is introduced.

Not run in RF05: new UI/DOM/browser campaigns, provider/AI/retrieval evaluation, load testing, valuable-data migrations, deployment or remote CI. Unchanged UI/wire and isolated backend changes did not justify those new campaigns. The registered root/static and real database regressions ran; mandatory failures were not deferred or hidden.
