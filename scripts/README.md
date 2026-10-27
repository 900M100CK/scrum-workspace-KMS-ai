# Tooling and test map

Run commands from the repository root with Node 24+. Public npm command names
are unchanged; only their file locations changed on 27 October 2026.

| Responsibility | Tooling | Tests | Entry point |
| --- | --- | --- | --- |
| Context, requirement trace and evaluation definitions | [verify-context.mjs](verify-context.mjs), [context/](context/) | [tests/context/](../tests/context/) | `npm run context:lint`, `context:check`, `context:test` |
| Documentation and editable diagram pairs | [docs/](docs/), [design-diagrams.mjs](design-diagrams.mjs) | [tests/docs/](../tests/docs/) | `npm run docs:lint`, `docs:test`, `docs:sync-metadata`, `docs:sync-permissions` |
| Schema validation and exact handoff bytes | [contract-schemas.mjs](contract-schemas.mjs), [contracts/](contracts/) | [tests/contracts/](../tests/contracts/) | `npm run contracts:test` |
| Database setup and owned migrations | [database.mjs](database.mjs) | [storage.test.mjs](../tests/storage.test.mjs), [tests/storage/](../tests/storage/) | `npm run db:test`, `contracts:storage:test`; follow the [runbook](../infra/postgres/README.md) for changes |
| Optional NotebookLM utility | [notebooklm/](notebooklm/README.md) | [tests/notebooklm/](../tests/notebooklm/) | See the utility guide; upload requires explicit owner authority |

Shared pinned schema fixtures remain in [tests/fixtures/](../tests/fixtures/).
The [concurrency declarations](../tests/concurrency/) remain separate and are
not executed handler evidence. Application foundation tests stay with [apps/web/](../apps/web/README.md); preserved synthetic UI tests live in [design/prototype](../design/prototype/README.md).

## Paths in older reports

Each moved `.mjs` file keeps its filename. For example,
`scripts/verify-docs.mjs` is now `scripts/docs/verify-docs.mjs`, and
`tests/docs.test.mjs` is now `tests/docs/docs.test.mjs`.
The former `scripts/NOTEBOOKLM.md` is now `scripts/notebooklm/README.md`.
Historical reports retain the commands actually used at the time; use this
map or the current root `package.json` when repeating a check.

`scripts/verify-context.mjs`, `scripts/database.mjs`, `scripts/contract-schemas.mjs`,
`scripts/design-diagrams.mjs` and `tests/storage.test.mjs` retain their established
entry paths, referenced by canonical architecture, decisions and the foundation
guide. They remain the implementations, without duplicate wrappers or copied logic.

Add tooling and its tests to the matching existing group. Keep service code
under its owning service and UI tests inside the web app. Do not run diagram
generators merely to check a relocation: lint/test commands inspect their
existing outputs without rewriting evidence. Database and external utility
checks have the side effects described in their runbooks.
