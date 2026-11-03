# Workspace service scaffold

Status: owned PostgreSQL migrations are implemented; Fastify/TypeScript infrastructure liveness exists, and bounded session/project/membership handlers now exist; later business/guard slices remain unimplemented. See the [database runbook](../../infra/postgres/README.md). Own auth/session/policy and Scrum operations under the [architecture](../../docs/architecture.md) and [Workspace contract](../../contracts/openapi/workspace.openapi.json). Read the root agent entry and chosen feature spec before code.

Domain modules: sessions, projects/memberships, backlog/tasks/blockers, Sprints, policy, gateway/guarded transport, observations and business audit. Only this service decides permissions. It writes only Workspace data; no Knowledge database import/write. Secrets are runtime inputs. Provider transport runs in a bounded lane distinct from ordinary work.

Implement SP-01–SP-04 as the walking skeleton. The owner-directed framework foundation supplies dev/typecheck/build/test/start scripts; these do not accept session or business-handler behaviour.

Workspace migration 004 reserves permanent protected_handoff idempotency claims and fence-bound append-only outcomes under Proposed ADR-0023. Fresh insertion/duplicate SQL tests pass in isolation; current authority, known commit acknowledgement, active process fencing, guard and relay handlers remain unimplemented. Existing/unknown claims never authorize resume.

## Framework commands

Node 24+: from root use npm run dev:workspace for localhost 3001, npm run typecheck, npm run build and npm run test:foundation. From this package use npm start after build. PORT must be an integer from 1 to 65535; bind is 127.0.0.1. GET /healthz reports process liveness only; other routes return generic 404. It is not database/provider readiness or authentication. No DB connection/provider client is created by this scaffold.

The earlier P07 stage adds session clock/password-verifier interfaces and `readSessionPolicy`, with configurable starting `SESSION_IDLE_SECONDS=1800` / `SESSION_ABSOLUTE_SECONDS=28800`. The reader validates configuration but is not connected to a handler yet. These values are owner-selected starting configuration, not risk-analysis findings. No runtime KDF/time algorithm, account lock/disable policy, session DB client or migration is adopted. See the web [same-origin HTTPS guide](../../apps/web/LOCAL-HTTPS.md); browser calls use /api while the service's draft route paths remain unchanged.

## P08 private persistence

P08 subsequently adds owner-authorised session persistence/KDF/operator adapters and additive migration 005. See [SESSION-OPERATIONS.md](SESSION-OPERATIONS.md) for role boundaries, initialization/recovery/manual disable, memory/libuv limits and refusal rules. Run npm run test:session:storage for real PostgreSQL tests. No adapter is wired into the infrastructure server; public authentication handlers remain unimplemented. The P07-only limits above describe the earlier stage. ADRs remain Proposed for broader verification and D-07 is unchanged.

## P09 HTTP integration

P09 subsequently wires POST/GET /session to the real store when the explicit runtime DB URL/origin are configured. Read [SESSION-HTTP.md](SESSION-HTTP.md) for startup, schema/cookie/error/logging policy and actual-handler tests. Earlier P07/P08 unimplemented-handler notes describe their execution stages. Missing runtime configuration now makes /session return 503; unrelated routes remain unimplemented. DELETE/renewal/UI and full SP-01 acceptance remain later tasks. No DB migration runs at startup.

## P10 lifecycle integration

GET now renews a strictly unexpired session within its immutable absolute cap; DELETE atomically revokes the current token/audit and clears the secure cookie on confirmed 204. See [SESSION-HTTP.md](SESSION-HTTP.md) and npm run test:session:lifecycle. Previous stage notes are historical; UI/browser/D-07 and full feature acceptance remain open. No startup migration or development upgrade was performed.

## Project and membership implementation — 1 November 2026

See [the project runbook](PROJECTS.md) for private audited bootstrap/recovery, separate 007/008 migration cautions, cursor configuration and current verification commands. npm run test:projects exercises disposable SQL/HTTP/DOM negatives; browser evidence is separate. Optional editProject, Knowledge handlers and D-07 guarded transport are not implemented by SP-02.

## SP-03 Task creation and current reads — 2 November 2026

See [Task operations](TASKS.md) and the registered SP-03 handoff for createTask/listTasks/getTask, current project authority, exact Backlog positions, immutable server time and original-key recovery. Prior foundation/stage notes above are historical. No role/creator auto-grant, public permission editor, Task mutation/Sprint/Knowledge handler or startup migration is added. Only disposable 009 is verified; existing 006/008 suites keep their ceilings. Browser acceptance is a separate installed-runner gate; local source changes are not automatically committed/published.
