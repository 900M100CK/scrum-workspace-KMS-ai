# Workspace Sprint lifecycle

**Artifact ID:** WORKSPACE-SPRINTS-01\
**Version/date:** 0.2 Draft · 6 November 2026

[SP-05 plan](../../docs/implementation/features/sp-05-sprint-lifecycle/plan.md) owns exact task status/evidence. Must scope: create, allocate, start, complete, full Backlog reorder and current reads. Selected Could editSprint/removeAllocation are now implemented under the same owning plan. Workspace owns all data, authority and audit; no Knowledge or provider call is involved.

## Configuration and private authority

Reuse the [session configuration](SESSION-HTTP.md) and project cursor key. Startup never migrates. Current Could operations require reviewed012 plus additive013; existing Must handlers and historical fixtures retain011. existing006/008/009/010 fixture ceilings remain explicit. No valuable-data migration is performed by tests or this guide. [PostgreSQL runbook](../../infra/postgres/README.md) governs any separately authorised development upgrade.

Each enabled current project member needs its own private action: sprint-create, sprint-allocate, sprint-start, sprint-complete backlog-order, sprint-edit or sprint-deallocate. Role/creator labels supply none. Reuse projects/cli.ts project with private SACW_OPERATOR_DATABASE_URL/SACW_OPERATOR_REF and JSON user_id, project_id, action, allowed, expected_revision, reason, as documented in [project operations](PROJECTS.md). Never print credentials. Revoke/regrant is revisioned/co-audited; membership removal invalidates grants and rejoin restores none. Runtime cannot issue or rewrite those grants.

## HTTP and recovery

Existing declared routes now implement POST/GET /projects/:project_id/sprints; GET /sprints/:sprint_id; POST/GET /sprints/:sprint_id/items; POST /sprints/:sprint_id/start and /complete; POST /projects/:project_id/backlog-order. Use existing secure session cookie, same-origin mutation header, JSON and Idempotency-Key. Identity comes from the server session.

Allocation.expected_revision, start and complete bind Sprint.revision; current Task read/project/Backlog placement is checked under lock. Reorder.expected_revision is the exact decimal-string Backlog generation obtained by reading every location=backlog page, with terminal null cursor. Missing/foreign/stale sets409; duplicates/malformed input400; identical ordering is a no-op. The normal body limit is8192 bytes; complete reorder is bounded at1MiB, with413/no partial changes above that limit. This is a documented transport bound, not a measured capacity claim.

Scope-bound pages contain50 items, use the existing HMAC/300-second cursor pattern and invalidate on full projection changes. Changed/expired cursor409 discards all accumulated pages; unknown or removed membership404 discloses no items. Requesting another actor/resource cursor400 grants no access.

Current authority precedes every original-result replay. Actor/operation/key/canonical payload hash consumes one immutable original201/200 indefinitely, including goal and transactional completion counts; changed payload409 never substitutes an old result. A timeout or lost COMMIT/HTTP acknowledgement is unknown, reconciled with the original key/body. UI saves recovery before sending and preserves each selected item's independent outcome. Explicit signout clears browser recovery.

Sprint timestamps are server observations. Existing rows have null observations when unavailable; planned dates are never used to fabricate creation/start/completion time. Completion keeps Done associations and marks current location completed; unfinished tasks return To Do in Task-ID append order. A later reopen/allocation never rewrites completed association history. Counts from an old completion receipt are historical counts; read current Task/Sprint separately.

## Verification

Node24+, installed lockfile dependencies and pinned Docker image are required. All DB tests provision disposable011 databases and remove only their own named resources. Commands:

- node --test --test-concurrency=1 tests/workspace/sprint-storage.test.mjs tests/workspace/sprint-http.test.mjs tests/workspace/sprint-concurrency.test.mjs tests/workspace/sprint-security.test.mjs
- node --test tests/workspace/sprint-controller.test.mjs
- node --test tests/workspace/sprint-ui.test.mjs
- node --test tests/workspace/sprint-browser.test.mjs
- npm run typecheck; npm run build; existing session/project/Task regressions and context/docs/contracts checks from the owning plan.

UI/real-browser tests require existing trusted .tmp/local-https localhost certificate/key, never committed. The separate browser runner reuses installed Playwright through SACW_PLAYWRIGHT_MODULE and isolated headless Edge; no personal profile or TLS bypass. For route.fetch test interception, use process-local NODE_USE_SYSTEM_CA=1/NODE_EXTRA_CA_CERTS pointing at the trusted local cert. Never disable TLS verification. Runtime fixtures/logs must redact cookies; retain failure semantics and source identity.

Migration011 down refuses retained Sprint outcomes, authority/audit or non-null observation timestamps; it is not a valuable-data recovery shortcut. No CI, push, PR, merge, deployment or independent review is implied by local observations.

## Selected Could operations and verification — 6 November 2026

PATCH /sprints/:sprint_id accepts partial goal/dates plus expected_revision = Sprint.revision and needs independent sprint-edit. Only Planned may change. Validate merged strict dates/start-before-end and nonblank goal. Same values or revision alone acknowledge without change audit/revision. DELETE /sprints/:sprint_id/items/:task_id has no body/query and requires positive Sprint X-Expected-Revision plus independent sprint-deallocate. Only a current todo/in_progress allocation in Planned/Active returns To Do to Backlog. Done409 task_already_done is disclosed only after current access/revision/location checks; Completed/noncurrent/stale state conflicts. Both return the existing200 Sprint; Workspace0.2.16 enumerates the Done code.

Return atomically marks Returned, clears current Sprint, appends by PostgreSQL numeric MAX(position)+1 and advances allocation/Task/Sprint revisions and Backlog generation, with before/result audit and immutable original receipt. Preserve assignee/blockers/completed history. Current session/membership/read/action (including Task read for removal replay) precedes original lookup; lookup precedes live lifecycle/revision/location restrictions. Unknown outcome reuses the exact original key/body/header, never a fresh automatic key. Browser recovery v2 explicitly stores validated known method and DELETE revision; valid v1 identities migrate unchanged and signout clears both versions. Current data is refreshed independently of the historical receipt.

Additive013 retains grant provenance using workspace.has_sprint_could_action(actor,project,action), a boolean-only SECURITY DEFINER function owned by workspace_owner, fixed pg_catalog search_path, PUBLIC execution revoked and runtime execute only. Runtime still cannot SELECT private authority_provisioning_audit. Both private grant and matching immutable issuance audit must exist. Missing required function/storage fails closed; startup never migrates. 012 and013 downs refuse retained Could grants/provisioning audit/mutation audit/receipts. Historical001–011 and already-tested012 are unchanged.

Reproduce author gates with Node24 and installed dependencies/TLS/Edge, from the repository root:

- node docs/implementation/features/sp-05-sprint-lifecycle/verification/run-could-runtime.mjs workspace
- node docs/implementation/features/sp-05-sprint-lifecycle/verification/run-could-runtime.mjs browser
- node docs/implementation/features/sp-05-sprint-lifecycle/verification/run-could-runtime.mjs checks

The runner enumerates all current Workspace files (browser separately), freezes actual dirty-source hashes, records environment/argv/exit/raw output and checks disposable cleanup. New current Could producer/UI fixtures use013; dedicated012 storage and original011 regressions keep their own ceilings. See the owning Could runtime result for actual counts, retained failures and independent-review limits. No valuable-data upgrade, commit/push or production release follows from these commands.
