# PostgreSQL storage foundation

Implements the owner-requested [ADR-0004](../../docs/adr/0004-knowledge-store.md) storage slice. One PostgreSQL engine hosts `workspace_db` and `knowledge_db`. Each database has a separate non-login owner and a runtime login. PostgreSQL 17 / pgvector 0.8.2 are pinned by image tag and digest; the tested PostgreSQL patch version is 17.10. No application server, permission authority, embedding provider or generation provider is started by these commands.

## Local commands

Requires Docker with Linux containers and Node 24+. No additional npm packages are needed. From the repository root:

```powershell
npm run db:init
npm run db:up
npm run db:migrate
npm run db:test
npm run db:stop
```

`db:init` generates three independent random passwords in ignored `infra/postgres/.env`, refusing to overwrite an existing file. Keep it private. `db:up` starts the Compose project `scrum-kms-store`, binds only `127.0.0.1:55432`, and waits for bootstrap readiness. Set `POSTGRES_PORT` in that file before starting if the port is occupied. The named data volume survives `db:stop`. Bootstrap runs only on a new volume; editing environment passwords does not rotate credentials in an existing database. Do not delete a volume to fix authentication.

Connection parameters for future service adapters:

| Service | Host / port | Database | Runtime user | Password environment key |
| --- | --- | --- | --- | --- |
| Workspace | `127.0.0.1:55432` | `workspace_db` | `workspace_app` | `WORKSPACE_DB_PASSWORD` |
| Knowledge | `127.0.0.1:55432` | `knowledge_db` | `knowledge_app` | `KNOWLEDGE_DB_PASSWORD` |

Only deployment/migration tooling may use the administrator credential. Runtime users cannot connect to the other database, become schema owners, create schemas, truncate tables, or delete immutable records. `pgvector` is installed only in Knowledge. This local development setup does not configure TLS, encrypted backups, production secret management, backup schedules or retention automation.

`db:migrate` applies each service's owned SQL in a transaction, serialises migrations with an advisory lock, and records a checksum of both directions. A repeat is a no-op; checksum drift fails. Never edit a deployed migration; append a new numbered migration. A failed migration rolls back in its own database. There is no distributed migration transaction: if Knowledge fails after Workspace succeeds, fix the failure and rerun.

For an intentional rollback of **all implemented migrations for one service**, with data loss:

```powershell
npm run db:rollback -- knowledge --allow-data-loss
```

This drops the service schema and records its rollback. The database, roles, extension and other service remain. Take and verify a backup before rollback on any valuable data. Do not run this as ordinary cleanup. `db:test` verifies reverse/forward migration only against its own disposable synthetic database.

## Storage and retrieval boundary

### Policy migration 002 — 13 October follow-up

The owner subsequently confirmed [ADR-0009](../../docs/adr/0009-versions-without-draft.md) and [ADR-0011](../../docs/adr/0011-document-creation-and-guard-scope.md), authorising new migrations. Applied migration 001 is unchanged. Knowledge migration `002-current-revisions` removes the product Draft state: a revision supersedes the old Current, inserts the new Current and updates the pointer in one transaction. Workspace migration `002-registered-policy` removes pending registration and defaults policy to active; active means registered policy, not proof that content exists or permission to read it. Creation/read handlers are still unimplemented.

Upgrade aborts transactionally if legacy Draft versions or pending policies remain. It never publishes, deletes or relabels them automatically. Reconcile those records explicitly before retrying; do not reset a database to avoid the check. The 002 down scripts restore the old allowed state sets without rewriting evidence or policy rows. The existing `db:rollback` CLI still rolls back **all** migrations and is destructive; it is not a policy-only rollback command.

The lifecycle description below describes the original 001 foundation where it mentions Draft publication. Current target behaviour is immediate revision under ADR-0009. Broader contract/spec/UX reconciliation is pending and is tracked in [the business review](../../docs/analyst/business-review-2026-10-13.md). New database tests verify storage transitions, not HTTP permission boundaries or application completion.

Workspace's [migration](../../services/workspace/migrations/001-store.up.sql) stores projects, memberships, sessions, work, policy/grants, audit and idempotency. Knowledge's [migration](../../services/knowledge/migrations/001-store.up.sql) stores documents, immutable versions/passages, indexing jobs, embeddings, links and execution/provenance. Cross-service identities are UUID references without cross-database foreign keys or joins. Neither SQL schema supplies an application authentication or permission-delegation implementation.

Knowledge has no ACL table. Its `exact_search(project, document_ids, configuration_id, vector, limit)` and `keyword_search(project, document_ids, text, limit)` functions require scope supplied by the authenticated Workspace authority. Missing/empty scope yields no rows. Exact search materialises eligible rows before computing distances; both functions exclude Draft, noncurrent and unavailable sources. Keyword search uses PostgreSQL English full-text search and needs neither embeddings nor model availability. Trigram/fusion tuning remains future pilot work, not a dependency of this foundation.

Configurations record model identifier/version, dimensions and distance metric (`cosine`, `l2`, `inner_product`). The unconstrained vector type plus composite configuration/dimension constraints supports separate embedding spaces without choosing a model or a universal dimension. Configuration records are immutable to runtime users; create a new identity to change them. There is no approximate index, similarity cutoff or answer cache. Search returns stable document/version/passage IDs; source support still needs evaluation.

Runtime credentials are trusted **service credentials**, not end-user database accounts. They can read their own tables. Never expose these SQL functions directly to browsers or accept client-supplied access scopes. Future handlers must fail closed on Workspace errors, revalidate current scope for citation opening, and implement ADR-0006's guards at provider/response handoff. Database filtering tests do not prove those unimplemented boundaries.

Publication is one local transaction: supersede the old Current version, promote the immutable Draft, and update the document pointer/revision. A deferred constraint requires the pointer and Current state to agree. Retiring the last Current clears the pointer. Content and passage identity cannot be rewritten using runtime privileges. Deletion sets the monotonic `unavailable` flag; physical cleanup remains a retention decision. Citation handlers must check availability and permission before selecting the exact tuple; they must never substitute Current for a historical locator.

Index writes lock the local document and compare document revision, processing generation and current version. Old jobs cannot publish replacement/deleted evidence. Search also checks those fields and job readiness, so stale persisted vectors cannot become candidates. Increase processing generation when scheduling another attempt with a new job identity; retries for the same job reuse its identity. Lifecycle/metadata changes invalidate vectors by document revision until current indexing finishes. Keyword search remains available during that interval. Background scheduling and cross-service handoff guards are not implemented.

## Verification and open work

The [integration suite](../../tests/storage.test.mjs) starts a unique temporary container with random credentials, no host port and only synthetic data, then stops that container. It does not touch the Compose development volume or other running containers. Tests fail if Docker/SQL execution fails; they are never silently skipped. Hand-written three-dimensional vectors test storage/ranking behavior, not semantic quality or a trained model.

Execution on 13 October 2026: nine database scenarios passed (10 Node test results including the parent) on PostgreSQL 17.10, pgvector 0.8.2 and Docker 29.3.1, first on host Node 22.23.0 and then on a checksum-verified portable Node 24.21.0. Context lint/check/test passed (9 tests); documentation lint/test passed (7 tests, eight diagram pairs). The first documentation run caught architecture origin-version drift; the source metadata and current-version inventories were corrected before the passing run. Local bootstrap, migration and replay also succeeded; the database remains running at the loopback address above.

Not run: full handler/consumer-provider tests, paused concurrent permission revocation at transport, service authentication, historical retrieval UI, backup restore/retention, rendered diagram inspection and corpus recall/latency evaluation. No FR or complete SP is marked Done by the database suite. A portable runtime was used for supported-version validation; the system-wide Node installation was not replaced.

References: [pgvector 0.8.2](https://github.com/pgvector/pgvector/tree/v0.8.2), [PostgreSQL database/object grants](https://www.postgresql.org/docs/17/sql-grant.html), and [official PostgreSQL image initialization](https://github.com/docker-library/docs/blob/master/postgres/README.md).
