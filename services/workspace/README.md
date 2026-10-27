# Workspace service scaffold

Status: owned PostgreSQL migrations are implemented; Fastify/TypeScript infrastructure liveness exists, but no protected business handler or permission-authority implementation exists yet. See the [database runbook](../../infra/postgres/README.md). Own auth/session/policy and Scrum operations under the [architecture](../../docs/architecture.md) and [Workspace contract](../../contracts/openapi/workspace.openapi.json). Read the root agent entry and chosen feature spec before code.

Domain modules: sessions, projects/memberships, backlog/tasks/blockers, Sprints, policy, gateway/guarded transport, observations and business audit. Only this service decides permissions. It writes only Workspace data; no Knowledge database import/write. Secrets are runtime inputs. Provider transport runs in a bounded lane distinct from ordinary work.

Implement SP-01–SP-04 as the walking skeleton. The owner-directed framework foundation supplies dev/typecheck/build/test/start scripts; these do not accept session or business-handler behaviour.

Workspace migration 004 reserves permanent protected_handoff idempotency claims and fence-bound append-only outcomes under Proposed ADR-0023. Fresh insertion/duplicate SQL tests pass in isolation; current authority, known commit acknowledgement, active process fencing, guard and relay handlers remain unimplemented. Existing/unknown claims never authorize resume.

## Framework commands

Node 24+: from root use npm run dev:workspace for localhost 3001, npm run typecheck, npm run build and npm run test:foundation. From this package use npm start after build. PORT must be an integer from 1 to 65535; bind is 127.0.0.1. GET /healthz reports process liveness only; other routes return generic 404. It is not database/provider readiness or authentication. No DB connection/provider client is created by this scaffold.
