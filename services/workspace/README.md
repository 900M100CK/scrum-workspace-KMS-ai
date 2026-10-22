# Workspace service scaffold

Status: owned PostgreSQL migrations are implemented; no application handler or permission-authority implementation exists yet. See the [database runbook](../../infra/postgres/README.md). Own auth/session/policy and Scrum operations under the [architecture](../../docs/architecture.md) and [Workspace contract](../../contracts/openapi/workspace.openapi.json). Read the root agent entry and chosen feature spec before code.

Domain modules: sessions, projects/memberships, backlog/tasks/blockers, Sprints, policy, gateway/guarded transport, observations and business audit. Only this service decides permissions. It writes only Workspace data; no Knowledge database import/write. Secrets are runtime inputs. Provider transport runs in a bounded lane distinct from ordinary work.

Implement SP-01–SP-04 as the walking skeleton. Application run/build/test commands are added after ADR-0003/version selection; no fake passing service test exists.

Workspace migration 004 reserves permanent protected_handoff idempotency claims and fence-bound append-only outcomes under Proposed ADR-0023. Fresh insertion/duplicate SQL tests pass in isolation; current authority, known commit acknowledgement, active process fencing, guard and relay handlers remain unimplemented. Existing/unknown claims never authorize resume.
