# SP04-P03B — additive mutation storage and typed originals

**Artifact ID:** SP04-P03B\
**Version/date:** 0.1 Draft · 4 November 2026\
**Status:** Owner requested implementation; Codex sequential producer. Parent plan owns actual status.

Parent [FEAT-SP04-01](../plan.md); SP-04.2 / FR-09/40/43/44, supporting FR-03/31/59/68 / BR-01/02/03/06/10/11/14 / UC-03 edit and UC-04 command recovery / TC-07/08/13/14/18/19 / PLAN-01 Month1 / M-02–M-03. Inputs: P03A2 result v0.1, ADR-0028 v0.1 Proposed, owner choices v0.1, Workspace0.2.13, logical0.13, SP-04 v0.7.3 and applied001–009. Plan mode unavailable; saved scope/registration precedes code/testing. No blanket ADR adoption.

## One outcome and steps

1. Capture source/branch/HEAD; register this exact brief. Inspect existing009 outcome/authority guards and disposable runners.
2. Add010-task-mutations up/down only: total exact wire-compatible Task200/Blocker201 validators, permanent new-operation original results and immutability, private new-action issue/revival guard and scoped-current uniqueness, audit action extension. Preserve every009 receipt branch and runtime privilege boundary. Preflight refuses existing selected keys/grants/audits/events requiring explicit reconciliation. Down refuses retained selected grants (including invalidated), outcomes/events and mutation/audit evidence; empty-compatible reverse restores exact009 definitions. Existing SP-03 Task/create-result/author data remains compatible.
3. Extend existing Task types with Blocker and mutation operation/result types; add a separate internal mutation-outcome adapter binding current caller-supplied authorised Task/project/actor/operation/key/hash, with historical immutable response independent of live revision/state/assignee. Adapter is not an authority service; caller must check current session/read/action before replay and own lock protocol. Preserve original create adapter.
4. Add explicit new010 disposable fixture/storage suite. Test forward/repeat/reverse and checksum preservation; each legacy/refusal class; runtime issue/revival denial with allowed member-removal invalidation; uniqueness/scope; old receipt/protected-handoff regression; all exact Task location variants; malformed/missing/SQL-null/JSON-null/type/extra/date/unsafe identities and increments; immutable identity/update/delete including transitions into protected ops; actor/operation/key/body/Task/project binding; rollback of Task/event/audit/outcome and durable original after lost acknowledgement/live changes. These are actual storage tests, not HTTP current-permission proof.
5. Run targeted new/old storage suites, Workspace typecheck and existing context/contracts/docs checks, preserve failures/exit logs and resources cleanup. Update owning status and report.

## Allowed paths and non-goals

Primary: services/workspace/migrations/010-task-mutations.up.sql and .down.sql; services/workspace/src/tasks/types.ts; new services/workspace/src/tasks/mutation-outcomes.ts; services/workspace/TASKS.md; new tests/workspace/task-mutation-fixture.mjs and task-mutation-storage.test.mjs. Existing create outcome adapter and all001–009 SQL stay byte-identical. No handler/store/operator CLI/UI/new route or policy/schema wire change. P03C and actual mutation producers remain separate.

Support: this feature folder and existing feature/source/roadmap/central/review registers, REG-00 manifest/generated metadata only. No root command/dependency, baseline/existing ADR, contracts, requirement or design body edits. Tests run directly with existing Node24.21.0; no new npm alias needed. No old-worktree import, parallel agents, commit/push or valuable-data migration. Workspace owns all data; no Knowledge/provider access. Startup never migrates.

## Verification contract

Read infra/postgres/README.md. Use only random named/labeled disposable fixture container/volume and generated synthetic identities/credentials. Never print credentials or inspect private .env. Existing fixture cleans only its verified own resources. Run: portable Node --test --test-concurrency=1 tests/workspace/task-mutation-storage.test.mjs; old tests/workspace/task-storage.test.mjs; Node node_modules/typescript/bin/tsc -p services/workspace/tsconfig.json --noEmit; existing context syntax/check/test, contracts:test, docs metadata sync/check/lint/test; scoped diff/whitespace/source-hash checks. Docker/image/setup absence is a failed/unrun prerequisite, never skip-as-pass. Store every attempt under evidence/p03b/.

Meaningful negative cases must fail under real PostgreSQL owner/runtime roles with actual SQLSTATE or wrapped cause. No test weakening or fabricated output. Exact009 old function/constraint text is compared after reverse; legacy refusal precedesDDL and preserves rows. No development DB migration/rollback or globalDocker cleanup. Unknown COMMIT evidence at this layer does not close handler/socket D-07.

Result: reviews/p03b-storage-result.md and evidence/p03b/checks.json; final paths/hashes/runtime/source versions and all unrun gates. P03B completes only when its mandatory checks pass. Next private tooling/action discovery and mutation handlers require their own small briefs.

Result: [SP04-P03B-RESULT v0.1](../reviews/p03b-storage-result.md), evidence/p03b/checks.json and executions.json. Actual execution crossed into4 November2026; initial registration/source capture retain their original date. All state resides in the parent; no later handler is authorised by this result.
