# Workspace Task creation and current reads

**Artifact ID:** WORKSPACE-TASKS-01\
**Version/date:** 0.1 Draft · 2 November 2026\
**Status:** Local bounded implementation/runbook; no deployment or independent acceptance.\
**Inputs:** [FEAT-SP03-01](../../docs/implementation/features/sp-03-create-task/plan.md) v0.5; canonical SP-03 v0.8; Workspace v0.2.12; logical model v0.12; Proposed ADR-0027 v0.2.

Current operations: POST /projects/{project_id}/tasks, GET the same collection (location=all or backlog; optional cursor), GET /tasks/{task_id}. Session/project prerequisites remain in [SESSION-HTTP.md](SESSION-HTTP.md) and [PROJECTS.md](PROJECTS.md); use the existing [same-origin HTTPS setup](../../apps/web/LOCAL-HTTPS.md). Browser calls only the Workspace /api facade. No Task edit/reorder/assignment/state/blocker/Sprint/Knowledge/AI mutation is implemented here.

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
