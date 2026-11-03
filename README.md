# Scrum Workspace and AI Project KMS

Solo capstone, target five months. This repository contains draft requirements/design/contracts, bounded feature specs, a context harness and an implemented PostgreSQL storage foundation. Framework foundations and bounded session/project/Task creation/read handlers with live UI now exist; later task mutations, Knowledge and guarded AI features remain unimplemented.

Start with [agent entry](AGENTS.md), [five-month MoSCoW plan](docs/planning/five-month-plan.md), [architecture](docs/architecture.md), [contracts](contracts/README.md) and [feature specs](specs/README.md). The [artifact register](docs/sdlc/artifact-register.md) records status and owner decisions.

## Repository map

| Location | Responsibility |
| --- | --- |
| [docs/](docs/README.md) | Requirements, decisions, design and implementation planning; start with the reading routes |
| [apps/web/](apps/web/README.md) | React/Vite/TypeScript application foundation |
| [services/](services/) | [Workspace](services/workspace/README.md) and [Knowledge](services/knowledge/README.md) ownership, migrations and SQL |
| [contracts/](contracts/README.md), [specs/](specs/README.md), [eval/](eval/README.md) | Interfaces, bounded feature work and evaluation definitions |
| [scripts/](scripts/README.md), [tests/](tests/) | Tooling and matching verification suites grouped by responsibility |
| [infra/postgres/](infra/postgres/README.md) | Local storage setup and runbook |
| [references/](references/README.md) | UI source notes and rendered evidence |
| [agents/](agents/WORKFLOW.md), `SDLC-Prompt-Checklist/` | Development workflow and pinned upstream templates |

Use the named npm commands below as stable entry points. Historical reports may show the former flat `scripts/` and `tests/` paths; the [tooling map](scripts/README.md) explains their current locations. Keep one canonical document per topic and link to it instead of copying workflow or checklist folders into `docs/`.

## First implementation order

1. SP-01 sessions → SP-02 project membership → SP-03 create task → SP-04 update/blockers. Capture business audit from the first mutation.
2. Fixed Sprint lifecycle, restricted sources/versions and links/keyword fallback.
3. One provider pipeline with exact citations/operational observations and real revocation/failure tests.
4. Pilot/evaluation, then reserve Month 5 for regressions, report and demo.

## Reproduce the context checks

Use Node 24 or later and initialize the pinned checklist submodule:

```sh
git clone --recurse-submodules https://github.com/900M100CK/scrum-workspace-KMS-ai.git
cd scrum-workspace-KMS-ai
npm run context:lint
npm run context:check
npm run context:test
```

For an existing clean checkout, run `git submodule update --init --recursive` first. No npm install is needed for these dependency-free scripts. GitHub Actions checks out submodules before running the same commands on Node 24.

The upstream checklist commit stores templates at its root. Uncommitted grouped directories in a developer's nested working tree are not CI inputs; see the [template guide](agents/template-guide.md).

ADR-0004's PostgreSQL/pgvector storage foundation is implemented by owner direction; framework foundations are selected under OWNER-FRAMEWORK-01; provider and session/guard implementation choices remain Proposed. Acceptance remains unproven; ADR-0010 confirms the seven Core exceptions and ADR-0016 adds optional task search. Context checks are not API conformance, application security or retrieval evidence. See [evaluation plan](eval/README.md) for the separate 25-case research and 25-case safety suites.

## Run the local database

With Docker running, use `npm run db:init`, `npm run db:up`, then `npm run db:migrate`. The [storage runbook](infra/postgres/README.md) explains credentials, owned databases, reversible migrations and scope boundaries. `npm run db:test` runs real PostgreSQL integration tests in an isolated synthetic container. `npm run db:stop` preserves local data. These commands do not start application handlers or an AI provider.

## Reproduce documentation checks

Run `npm ci`, then `npm run docs:lint` and `npm run docs:test` on Node 24+. Development-only dependencies are pinned in the lockfile; the context commands above remain dependency-free. CI runs both harnesses. Sources, native Draw.io pairs and current versions are registered in [diagram manifest](docs/sdlc/diagrams/manifest.json). Use `npm run docs:sync-metadata` to synchronize registered metadata and current-version tables; update both diagram representations for semantic changes. Unsupported types require an explicit adapter; historical snapshots remain intact. The docs:sync-permissions command regenerates only the two permission layouts with ELK; inspect renders after regeneration. These checks do not prove UI accessibility, permission enforcement or factual support.

Current documentation maintenance: [17 October freshness review](docs/sdlc/documentation-freshness-2026-10-17.md), including remaining corrections and coverage limits.

## Framework foundation and preserved prototype

Use Node 24+, then npm ci. Run npm run dev:web (5173), npm run dev:workspace (3001), npm run dev:knowledge (3002), or npm run dev:prototype (4173) in separate terminals. npm run typecheck, npm run build, npm run test:foundation and npm run test:prototype verify their distinct layers. Each server binds localhost. See [web commands](apps/web/README.md), [design/prototype](design/prototype/README.md) and [owner-directed foundation record](docs/planning/framework-foundation-owner-2026-10-27.md). Prototype UI remains the product design reference; liveness and scaffold tests do not prove sessions, permissions, DB or AI functionality.

## SP-03 local implementation

See [Task operations](services/workspace/TASKS.md), the [registered plan](docs/implementation/features/sp-03-create-task/plan.md) and [actual handoff](docs/sdlc/reports/SP-03-2026-11-02-execution.md). Task creation requires a separate private audited project grant; role labels do not grant it. Verification uses disposable data; runtime startup does not migrate or provision. Local changes are not a new GitHub publication.
