# Workspace Task commands and blocker history

**Artifact ID:** WORKSPACE-TASKS-01\
**Version/date:** 0.6 Draft · 4 November 2026\
**Status:** Local bounded implementation/runbook; no deployment or independent acceptance.\
**Historical SP-03 inputs:** [FEAT-SP03-01](../../docs/implementation/features/sp-03-create-task/plan.md) v0.5; canonical SP-03 v0.8; Workspace v0.2.12; logical model v0.12; Proposed ADR-0027 v0.2.

Current operations: POST /projects/{project_id}/tasks, GET the same collection (location=all or backlog; optional cursor), GET /tasks/{task_id}, PATCH /tasks/{task_id} (editTask, explicit010). Session/project prerequisites remain in [SESSION-HTTP.md](SESSION-HTTP.md) and [PROJECTS.md](PROJECTS.md); use the existing [same-origin HTTPS setup](../../apps/web/LOCAL-HTTPS.md). Browser calls only the Workspace /api facade. The PATCH edits Backlog title/description only. Explicit010 also implements POST /tasks/{task_id}/state, /assignee, /blockers and GET /tasks/{task_id}/blockers. Reorder/Sprint/Knowledge/AI remain unimplemented here.

## Storage and explicit setup

Task routes require additive Workspace 009. Startup never migrates, initializes clock/accounts or grants authority. Follow the [storage runbook](../../infra/postgres/README.md); these checks upgraded only uniquely named disposable databases, not development storage. Applied 001–008 remain unchanged. Historical session/storage fixtures keep 006 and SP-02 keeps 007/008; Task fixtures explicitly request 009.

009 refuses existing Task rows, createTask identities or backlog-author grants before DDL. It never invents legacy time, adopts an unprovenanced grant or deletes retained data. Reconcile valuable legacy data through a separately reviewed forward recovery; this migration does not supply guessed backfill. Empty-compatible down restores prior constraints, but retained Task/history/outcome/author/audit data blocks it. The root rollback command reverses more than this migration; do not use it as an incidental Task reset.

Creation returns immutable server `created_at`, exact decimal Backlog position, todo/null-assignee/unblocked/revision 1 and a server UUID. Project guard serializes max(current Backlog position)+1; existing 003 advances generation once. The Task, UC-03 business audit `backlog-item-create` (actor/entity/same creation time/correlation) and permanent original result commit together. Idempotency operation is `createTask`; it is deliberately distinct from the audit event label. Draft 009 down retains both that canonical label and the earlier draft audit alias.

## Private author provisioning

An enabled authenticated current member needs an explicit project-scoped `backlog-author` grant. PO/Admin/creator role text and membership-manage do not grant it. No automatic creator grant, permission editor or public provisioning endpoint exists. Runtime may invalidate an author on member removal; the ordinary runtime database role cannot issue or revive one.

Use the existing private operator environment described in PROJECTS.md: SACW_OPERATOR_DATABASE_URL and SACW_OPERATOR_REF, never a browser role or credentials in argv/logs. Node 24+ accepts bounded JSON on stdin:

```powershell
'{"user_id":"<enabled-current-member-uuid>","project_id":"<project-uuid>"}' | node services/workspace/src/projects/cli.ts state
'{"user_id":"<enabled-current-member-uuid>","project_id":"<project-uuid>","action":"backlog-author","allowed":true,"expected_revision":"0","reason":"Explicit project author provisioning"}' | node services/workspace/src/projects/cli.ts project
```

Select the latest revision for backlog-author from state; absence means 0. Do not reuse a manager/global revision. Revoke with allowed=false and the current revision. Changes co-commit private audit; no-op grants do not create another grant/audit. Last-author revoke is allowed; the existing last membership-manager safeguard is separate. Removal invalidates grants and rejoin restores none. An uncertain operator acknowledgement requires inspecting the same target/revision/private audit before retry, not provisioning a role bypass.

## Read and recovery boundary

Current membership is checked for detail/list, current author authority again for create/replay. Unknown and inaccessible reads share generic 404; an existing readable project without create authority returns 403. Session/clock/DB/key failures withhold output. Detail resolves an internal scope hint, then locks Project and re-reads Task; no Task-first lock.

All lists use Task UUID order. Backlog uses PostgreSQL numeric position then UUID and includes Done Backlog tasks. `work_location`, highest committed blocker sequence and exact `backlog_revision` come from current owned data. Page size is internally 50; no public limit query exists. Reuse SACW_PROJECT_CURSOR_KEY and its 300-second default TTL. Actor/project/filter/order/membership/full ordered projection and Backlog generation bind the cursor. Malformed/foreign tokens return 400, verified expired/stale/missing bookmarks 409 without items; the UI discards accumulation and loads the current first page. Full-projection hashing has no scalability/load acceptance claim. Cooperating writers must retain the Project/clock protocol; this does not prove D-07 socket exclusion.

Consumed key/hash plus original minimal Task 201 snapshot (including original title/description/time) are retained indefinitely without automatic expiry/recycling. Current access is rechecked before every replay. A later Task change never rewrites that snapshot. UI validates confirmed replay, then separately fetches current detail; a historical receipt is not current work state. Strict old Task validators may reject the required new created_at field: consumers must use the coordinated Workspace 0.2.12 schema.

Before sending, browser tab storage retains only the actor-bound original request/key/body, not credentials/tokens or fetched protected lists. Timeout, dropped response or denied reconciliation does not prove rollback; check the original creation and never create a new automatic key. Explicit sign-out clears pending input. Same-actor re-login can reconcile after expiry; current denial keeps the earlier result unknown. Storage failure prevents sending a mutation while reads remain available.

## Verification

Use the existing installation with Node 24+ active. These commands create/clean only their uniquely identified synthetic containers/volumes:

```powershell
npm run typecheck
npm run build
node --test --test-concurrency=1 tests/workspace/task-storage.test.mjs tests/workspace/task-authority.test.mjs tests/workspace/task-http.test.mjs tests/workspace/task-reads.test.mjs tests/workspace/task-concurrency.test.mjs tests/workspace/task-ui-controller.test.mjs tests/workspace/task-ui.test.mjs
```

The separate browser command is `node --test tests/workspace/task-browser.test.mjs`. Supply the already installed Playwright entry URL through SACW_PLAYWRIGHT_MODULE if it is not locally resolvable, installed Edge and the existing owner-trusted localhost certificate. NODE_EXTRA_CA_CERTS may reference that specific public certificate for the Node forwarding probe. No TLS bypass, personal profile, package/browser install or incidental trust-store change is part of the test. Missing prerequisites fail, never pass as a skip. Each successful browser attempt writes a unique evidence run directory and preserves earlier captures.

Run the four session suites and test:projects with their retained ceilings for regression. Schema/context/docs checks are separate from actual handler/DB/DOM/browser assertions. [Actual execution report](../../docs/sdlc/reports/SP-03-2026-11-02-execution.md) records final commands/source hashes, prior failures, measured boundaries and unrun broader gates. No fresh-install, all-browser/accessibility, independent review, full scenario/release/deployment or newly published GitHub runtime claim is made.

## SP-04 P03B additive010 storage support — 4 November 2026

[FEAT-SP04-01](../../docs/implementation/features/sp-04-update-task/plan.md) and [SP04-P03B](../../docs/implementation/features/sp-04-update-task/tasks/P03B-mutation-storage.md) own current execution/evidence under [Proposed ADR-0028](../../docs/adr/0028-task-mutation-authority-and-outcomes.md). New010 adds typed immutable permanent original editTask/setTaskState/setAssignee200 Task and recordBlocker201 Blocker, preserving009 creation/project/member/protected outcomes. Stored Task originals include title/description; replay callers must recheck current session, Task/project read scope and exact action. The internal adapter is not a permission check and never substitutes live revision/state/assignee for an original result.

New project-scoped task-edit/task-state/task-assign/task-blocker grants have private DB issue/revival and current uniqueness/scope protection. Runtime may only invalidate an existing selected grant with its next revision and unchanged identity, as actual member removal does; rejoin restores none. At the historical P03B checkpoint the operator/CLI did not yet provision these actions; current P03C support is described below. No mutation/history HTTP handler or UI is introduced by P03B.

010 refuses pre-existing selected operation keys/grants/audits or blocker history requiring explicit reconciliation; old SP-03 Task/create-result/author data stays compatible. Down refuses retained new operation results, even invalidated selected grants, authority/business audit or blocker history. Empty-compatible reverse restores the exact009 original-outcome constraint/function, without editing001–009. No automatic legacy backfill, evidence purge or development upgrade is supplied. Startup never migrates.

Run only the explicit disposable suite with existing Node24+ and Docker:

```powershell
node --test --test-concurrency=1 tests/workspace/task-mutation-storage.test.mjs
node --test --test-concurrency=1 tests/workspace/task-storage.test.mjs
```

The new fixture explicitly requests010 (or009 for upgrade/refusal tests). Existing Task/session/project fixture ceilings remain009/006/008. Fixtures generate synthetic identities/secrets and random named container/volume resources, cleaning only their own verified resources; never use global Docker cleanup or the valuable-data rollback command as a test reset. Actual passes/failures/source identities and unrun gates are recorded by the owning plan/report, not inferred from these commands.

## Historical SP-04 P03C private action tooling and Task discovery — 4 November 2026

The existing private project command now also accepts task-edit, task-state, task-assign and task-blocker, with current enabled account/membership, expected revision, explicit reason and private operator provenance. No action is inherited from creator, backlog-author, role text or another Task action. Use the existing private operator configuration, never browser input or database credentials in command arguments. Example:

```powershell
'{"user_id":"<enabled-current-member-uuid>","project_id":"<project-uuid>","action":"task-edit","allowed":true,"expected_revision":"0","reason":"Explicit Backlog edit authority"}' | node services/workspace/src/projects/cli.ts project
'{"user_id":"<enabled-current-member-uuid>","project_id":"<project-uuid>"}' | node services/workspace/src/projects/cli.ts state
```

Revoke with allowed=false and the current highest action revision. Grant/revoke and its private audit commit atomically; unchanged requests are no-ops and stale revisions deny. A selected grant issuance uses one UUID for grant_id and its private issue audit event_id, binding project/subject/action/original revision without new schema. Existing selected rows without matching immutable issue evidence are retained and rejected for explicit reconciliation, including apparent no-ops. Ordinary runtime never reads this private audit. Existing three capability actions retain their previous audit encoding. Removal invalidates current grants, rejoin restores none, and an explicit later regrant uses a fresh ID/revision/audit.

GET /access/allowed-actions?resource_kind=task&project_id=<project-uuid>&resource_id=<task-uuid> now resolves current membership and the exact same-project Task, returning existing AllowedActions fields, only public operation IDs and Cache-Control:no-store. Missing/foreign/nonmember targets share generic404; malformed or contradictory selectors use bounded400; unavailable authority uses503 without cached allow. A final session guard runs after lock waits. The response contains no grant IDs/reasons, title, revision or authority token and cannot authorise a later write.

Production currently advertises getTask for readable Task targets, plus getAllowedActions itself. New mutation/history handlers are still absent and are not advertised, even when their private grants exist. The shared Workspace policy mapping prepares their capability/context filtering; future producers must explicitly register actual handlers and independently check current read/action authority for every write/replay. Edit discovery is Backlog-only; history read needs operational read, not audit-read. Synthetic future-operation registries in tests are projection tests, not implemented HTTP handlers.

Run the new010 disposable authority/discovery suite directly:

```powershell
node --test --test-concurrency=1 tests/workspace/task-mutation-authority.test.mjs
```

[SP04-P03C](../../docs/implementation/features/sp-04-update-task/tasks/P03C-task-authority-discovery.md) and its parent own actual evidence, regressions and limits. CLI failures do not prove rollback after a lost acknowledgement; inspect the same target/revision/private audit before retrying. No startup migration, valuable-data upgrade or public provisioning endpoint is added.


## SP-04 P03D1 Backlog content edit — 4 November 2026

PATCH /tasks/{task_id} implements the existing editTask contract on explicit migration010. Startup still never migrates or grants authority. Body: required safe positive expected_revision; optional nonblank title and string description. Omission preserves a field; explicit null is invalid. Require existing session, same-origin mutation headers, JSON within8192 bytes and Idempotency-Key. Unknown/foreign/nonmember Task reads conceal existence; current readable Task without task-edit returns403. Creator, PO role, membership-manage and create-only backlog-author grant no edit authority.

Use the current same-client transaction/session guard. Internal Task-to-project resolution precedes Project lock/current membership, explicit task-edit check and Task lock. Original receipts resolve before new-write placement/revision conditions. New edits require current Backlog and expected revision, otherwise generic409 state_conflict; stale output contains no current_revision. Actual content changes advance Task revision once and co-commit backlog-item-edit audit (actor/entity/correlation and revision refs) with permanent original200 Task. Unchanged/empty edits retain their original200 without revision bump or fake business-change audit. Location, position, created_at, state, assignee and blocker state stay unchanged; title/description alone do not advance Backlog generation.

Replay rechecks current session/member/Task scope/exact action, then returns the retained historical200 even after later revision or placement. It does not restore old state. A fresh getTask supplies current state. Known task/audit/outcome failures roll back together; response/COMMIT loss remains unknown and retries must use original key/body. Guard false returns before business writes without erasing a required durable authentication clock-fault latch. This is not D-07 socket-time exclusion evidence.

Production allowed-actions now advertises editTask only with current grant and Backlog context, alongside existing read operations. Later mutation/history handlers stay unadvertised. The older P03C section records its earlier read-only registration checkpoint.

Run Node24+ and Docker with the existing installation:

```powershell
node --test --test-concurrency=1 tests/workspace/task-edit.test.mjs
```

The fixture opts into disposable010; original006/008/009 suites remain unchanged. The [P03D1 brief](../../docs/implementation/features/sp-04-update-task/tasks/P03D1-backlog-edit.md), parent plan and result own exact source/configuration, actual passes/failures and unrun gates. Internal placement doubles are not implemented Sprint handlers. No edit UI, later mutation/history, actual SP-05 integration, valuable-data upgrade, release/deployment or independent acceptance is implied.


## SP-04 remaining command/history/UI checkpoint

Existing Task views now expose exact permitted edit/state/assignment/blocker actions and member-facing ascending history. Private task-edit/task-state/task-assign/task-blocker grants are separate; no role bypass. New assignees must be enabled current same-project members. Replay uses the same actor/operation/key/body and requires current read/action access. Historical200/201 is an acknowledgement; UI refreshes current Task/history separately. State/audit/outcome and event/revision/audit/outcome commit together. Reopen from a physically completed Sprint returns Backlog/todo and retains allocation history; actual SP-05 handler integration remains open.

Run Node24 --test --test-concurrency=1 tests/workspace/task-state.test.mjs tests/workspace/task-assignment.test.mjs tests/workspace/task-blocker.test.mjs tests/workspace/task-mutation-ui-controller.test.mjs tests/workspace/task-mutation-ui.test.mjs. New suites explicitly use disposable010; the UI fixture keeps default009 for historical suites. Browser: node --test tests/workspace/task-mutation-browser.test.mjs with the same installed-runner/trusted-localhost prerequisites above. No startup migration, valuable-data upgrade or browser/TLS installation is implied. [Owning plan](../../docs/implementation/features/sp-04-update-task/plan.md) and continuation evidence own actual status, failures and P08 boundary.


## Hotfix capability reuse and unexpected-null boundary

The hotfix-owned [RF01–RF05 plan](../../docs/implementation/features/hotfix-backend-layering/plan.md) uses committed SP-04 e6f2337 as its source/regression baseline. Shared projects/capabilities.ts hasCapability preserves the exact existing grant predicate at Project membership-management and Task create/edit/state/assignment/blocker checks. Callers retain current session, membership/read scope, action-specific authority and lock ordering; the helper does not establish those scopes. Database errors propagate to existing unavailable handling. Batch discovery, last-manager policy, private provisioning/provenance and cursor queries are unchanged.

WorkspaceProjectStore.transaction now awaits its callback. Exactly null without a recorded denial throws before COMMIT; ownedTransaction rolls back attempted business state, business audit and original outcome, and existing projectFailure returns generic503 access_unavailable. A recorded denial keeps the existing commit-then-raise path, retaining required actual authentication clock-fault latch/audit without inventing an audit for every401. Valid204 objects with null bodies, false and zero results retain their semantics. COMMIT acknowledgement loss remains unknown; reconcile using the original operation/key/body. The correction does not change session/database.ts or create a generic runner.

Architecture §4.2 identifies its original base6b837fd source snapshot. Its earlier potential-helper/unexpected-null observations describe that baseline; these current notes and [RF04 evidence](../../docs/implementation/features/hotfix-backend-layering/rf04-report.md) record the later RF02/RF04 implementation. Project FOR UPDATE and full-projection/in-memory pagination limits remain. Runner/actions-discovery separation awaits a concrete requirement. Proposed ADR-0029 remains Proposed; no formal or independent acceptance is inferred.

[RF05 combined handoff](../../docs/implementation/features/hotfix-backend-layering/rf05-report.md) owns actual commands/results, source identities, retained failures,006/008/009/010 fixture ceilings and recovery. Tests use unique disposable synthetic PostgreSQL databases; never migrate valuable data or edit applied SQL for this hotfix. Original SP-04 P08 actual SP-05 completion/allocation/reopen integration, D-07, deployment and independent/release gates remain open. No automatic commit or publication.
