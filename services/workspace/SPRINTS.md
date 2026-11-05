# Workspace Sprint lifecycle

**Artifact ID:** WORKSPACE-SPRINTS-01\
**Version/date:** 0.1 Draft · 5 November 2026

[SP-05 plan](../../docs/implementation/features/sp-05-sprint-lifecycle/plan.md) owns exact task status/evidence. Must scope: create, allocate, start, complete, full Backlog reorder and current reads. editSprint/removeAllocation are not implemented or advertised. Workspace owns all data, authority and audit; no Knowledge or provider call is involved.

## Configuration and private authority

Reuse the [session configuration](SESSION-HTTP.md) and project cursor key. Startup never migrates. New operations require reviewed schema011; existing006/008/009/010 fixture ceilings remain explicit. No valuable-data migration is performed by tests or this guide. [PostgreSQL runbook](../../infra/postgres/README.md) governs any separately authorised development upgrade.

Each enabled current project member needs its own private action: sprint-create, sprint-allocate, sprint-start, sprint-complete or backlog-order. Role/creator labels supply none. Reuse projects/cli.ts project with private SACW_OPERATOR_DATABASE_URL/SACW_OPERATOR_REF and JSON user_id, project_id, action, allowed, expected_revision, reason, as documented in [project operations](PROJECTS.md). Never print credentials. Revoke/regrant is revisioned/co-audited; membership removal invalidates grants and rejoin restores none. Runtime cannot issue or rewrite those grants.

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
