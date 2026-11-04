# SP04-P03D1 — Backlog content edit handler

**Artifact ID:** SP04-P03D1  
**Version/date:** 0.1 Draft · 4 November 2026

Parent/status authority: [plan](../plan.md). PLAN-01 Month1 / M-02–M-03 / SP-04.2; FR-40/AC-40, supporting FR-03/31/59/68, BR-01/02/10/11/14; UC-03 Alt-1 and UC-04 command recovery, TC-07/14/18/22. Owner asked for the next task after the completed backend hotfix; this continues P03C's named next producer. Plan mode is unavailable; this written gate precedes code and tests. No independent approval or broad Proposed ADR adoption.

## One outcome and prerequisite

Implement existing PATCH /tasks/{task_id} editTask using explicit010 storage, private task-edit authority and current transaction protocol. P03A/A2/B/C are prerequisite bounded results. Read decision-batch v0.4 and owner-decisions; preserve current contracts (Workspace0.2.13) and Proposed ADR0028 selected mechanics. No state/assignment/blocker/history/UI handlers or immediate architecture refactor.

## Exact write scope

- services/workspace/src/tasks/types.ts: internal EditTask type only.
- services/workspace/src/tasks/store.ts: additive edit operation; existing create/get/list behaviour preserved.
- services/workspace/src/tasks/http.ts: EditTask validation, PATCH and registered editTask discovery.
- tests/workspace/task-edit.test.mjs: new real disposable010 HTTP/store/failure/concurrency suite.
- tests/workspace/task-mutation-authority.test.mjs: adjust only production-registry expectation now that editTask exists; future synthetic registry remains labelled.
- services/workspace/TASKS.md: bounded endpoint/setup/results and current registry navigation.
- This feature folder: plan/entry/coordination/breakdown/brief, result and evidence.
- Registration-only version/status/backlinks: docs/implementation/features/README.md, docs/implementation/register.md, docs/implementation/roadmap.md, docs/sdlc/artifact-register.md.
- Metadata-only registration propagation: docs/sdlc/diagrams/manifest.json, docs/sdlc/diagrams/README.md, generated group README files already present under architecture/c4/data/deployment/development/flowchart/sequence/sitemap/state/use-case/user-journey, and docs/sdlc/references/document-review-register.md. No graph or historical evidence edits.

No001–010, wire/model/ADR/baseline, package/dependency, old fixtures/create outcome, other-service DB, hotfix worktree or Git publication changes. Source before-images/hashes are evidence/p03d1. Reuse existing same-client transaction/session guard; do not introduce runner extraction or generic repositories.

## Exact behaviour

Validate only title/description/expected_revision, safe positive revision, nonblank valid UTF-8/no-NUL title when present, string description when present; omission leaves unchanged, explicit null/undefined is invalid. Hash operation, normalised route Task UUID, expected revision and explicit presence/value pairs in fixed order. HTTP requires nonempty Idempotency-Key, existing cookie/origin/header/body/media/query rules; task body limit8192.

Inside existing wrapper resolve internal project hint; lock Project/current membership via projectAccess; require explicit project task-edit; then lock/re-read Task. Resolve original receipt before new-write placement/revision tests. Replay after current authority and final session guard returns exact retained200 even if later revision or placement differs. New edit requires current Backlog (otherwise409 state_conflict), exact expected revision and safe increment. Empty/same-value edit stores original200 with no revision change or fake business audit. Actual title/description change increments Task revision once, writes business audit action backlog-item-edit with actor/entity/correlation and before/after revision refs, and saves original200 in the same transaction. Preserve server creation time, location/order, state, assignee and blocker state. Final guard false returns null before business writes, retaining wrapper's typed-denial commit semantics. DB/audit/outcome failures roll back. Unknown delivery reconciles original key/body; no fresh automatic key.

## Verification before closure

Node24+ and Docker; random disposable010 only. Commands: node --test --test-concurrency=1 tests/workspace/task-edit.test.mjs; regression task-mutation-authority.test.mjs/task-http.test.mjs/task-reads.test.mjs/task-concurrency.test.mjs; npm run typecheck --workspace @sacw/workspace; npm run context:check/context:test/contracts:test/docs:lint/docs:test. Record all command exits/logs and negatives under evidence/p03d1. Original session/project/Task fixtures keep006/008/009.

Assertions: strict HTTP400/401/403/404/409/413/415; role/create grants do not imply edit; successful persisted change visible fresh read; precise original replay after later content/placement and grant revocation denial; changed hash conflicts; omission vs empty description distinct; no-op/maximum revision bounds; Task/audit/outcome rollback; concurrent same revision yields one winner; duplicate key writes once; revocation/removal ordering and expiry after lock waits block new writes/replays; registered discovery advertises edit only with live grant and Backlog. SQL/placement test doubles are labelled, not claimed as future Sprint handlers. No D-07 socket exclusion, SP-05 or UI acceptance.

## Failure and handoff

Preserve failures; fix only in-scope causes. Publish result with exact observed boundary/unrun gates. Update only parent task status, not whole-SP04/release acceptance. Revert only this producer's additions against captured before-images if needed, preserving unrelated SP04 changes. No valuable-data rollback or applied migration edit.
