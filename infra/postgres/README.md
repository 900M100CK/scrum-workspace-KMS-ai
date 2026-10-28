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

The current lifecycle below describes migrations 001 plus 002. Migration 001 retains its historical Draft publication design for reproducibility; do not implement it as the current product lifecycle. Remaining reconciliation is tracked in [the business review](../../docs/analyst/business-review-2026-10-13.md). Storage tests do not prove HTTP permission boundaries or application completion.

Workspace's [migration](../../services/workspace/migrations/001-store.up.sql) stores projects, memberships, sessions, work, policy/grants, audit and idempotency. Knowledge's [migration](../../services/knowledge/migrations/001-store.up.sql) stores documents, immutable versions/passages, indexing jobs, embeddings, links and execution/provenance. Cross-service identities are UUID references without cross-database foreign keys or joins. Neither SQL schema supplies an application authentication or permission-delegation implementation.

Knowledge has no ACL table. Its `exact_search(project, document_ids, configuration_id, vector, limit)` and `keyword_search(project, document_ids, text, limit)` functions require scope supplied by the authenticated Workspace authority. Missing/empty scope yields no rows. Exact search materialises eligible rows before computing distances; both functions exclude noncurrent and unavailable sources; migration 002 removes the product Draft state. Keyword search uses PostgreSQL English full-text search and needs neither embeddings nor model availability. Trigram/fusion tuning remains future pilot work, not a dependency of this foundation.

Configurations record model identifier/version, dimensions and distance metric (`cosine`, `l2`, `inner_product`). The unconstrained vector type plus composite configuration/dimension constraints supports separate embedding spaces without choosing a model or a universal dimension. Configuration records are immutable to runtime users; create a new identity to change them. There is no approximate index, similarity cutoff or answer cache. Search returns stable document/version/passage IDs; source support still needs evaluation.

Runtime credentials are trusted **service credentials**, not end-user database accounts. They can read their own tables. Never expose these SQL functions directly to browsers or accept client-supplied access scopes. Future handlers must fail closed on Workspace errors, revalidate current scope for citation opening, and implement ADR-0006's guards at provider/response handoff. Database filtering tests do not prove those unimplemented boundaries.

Under migration 002, revision is one local transaction: supersede the old Current version, insert the new immutable Current version, and update the document pointer/revision. No product Draft or separate publication operation exists. A deferred constraint requires the pointer and Current state to agree. Retiring the last Current clears the pointer. Content and passage identity cannot be rewritten using runtime privileges. Deletion sets the monotonic `unavailable` flag; physical cleanup remains a retention decision. Citation handlers must check availability and permission before selecting the exact tuple; they must never substitute Current for a historical locator.

Index writes lock the local document and compare document revision, processing generation and current version. Old jobs cannot publish replacement/deleted evidence. Search also checks those fields and job readiness, so stale persisted vectors cannot become candidates. Increase processing generation when scheduling another attempt with a new job identity; retries for the same job reuse its identity. Lifecycle/metadata changes invalidate vectors by document revision until current indexing finishes. Keyword search remains available during that interval. Background scheduling and cross-service handoff guards are not implemented.

## Verification and open work

### Work location migration 003 — 18 October follow-up

Workspace `003-work-location` adds `task.location_kind`, nullable `location_sprint_id`, deferred same-project/allocation references, final consistency checks, completed-allocation immutability and `project.backlog_revision`. See [Proposed ADR-0018](../../docs/adr/0018-operational-read-projections.md). This migration is included in `db:migrate`; it has not been applied to the development database by this change. Handlers must lock the project before work rows and compose task revisions, minimum audit and idempotent receipts in the transaction. Storage constraints are not end-user permission checks.

Backfill is deliberately conservative. A live allocation identifies the current Sprint. With no live or completed association, the task is Backlog. A task with completed history but no live allocation requires explicit reconciliation even if its current state is Done: it may have been reopened and completed again in Backlog. Missing or revision-stale mapping aborts the entire 003 transaction, preserving the original schema/data. Do not remove history to make the upgrade pass.

For such legacy rows, an operator must establish the correct location from authorised evidence, stop writers, and create/populate this owner-only input in `workspace_db` before rerunning the normal migrator. Use the existing migration administrator connection; never expose it through the application or commit credentials:

```sql
BEGIN;
SET LOCAL ROLE workspace_owner;
CREATE TABLE IF NOT EXISTS _migrations.task_location_reconciliation (
  task_id uuid PRIMARY KEY,
  expected_task_revision bigint NOT NULL,
  location_kind text NOT NULL CHECK (location_kind IN ('backlog','sprint','completed')),
  location_sprint_id uuid
);
-- Insert explicitly reviewed task IDs, current task revisions and current locations.
-- backlog requires NULL Sprint; completed requires the matching completed association.
-- This guide intentionally supplies no guessed production mapping.
COMMIT;
```

The mapping table stays private to the owner and is retained as reconciliation evidence. Unknown/stale rows cause failure; inspect and explicitly correct them, never reset the database as a shortcut. Validate constraints and renewed reads after migration. Existing task/history revisions are not rewritten by backfill; application caches must be discarded across the maintenance upgrade.

**Rollback limit:** 003 down refuses if any task exists, because removing the location discriminator loses authoritative information. Empty task stores can reverse/forward safely. Even `db:rollback -- workspace --allow-data-loss` will stop at this guard for nonempty work stores; the switch does not bypass it. Use a reviewed forward recovery for valuable data. The isolated storage suite clears only its own disposable synthetic database to test reverse/forward; do not copy that cleanup onto development data.

Verified on 18 October with Node 24.21.0 against a uniquely named disposable PostgreSQL 17.10 container: 15 results passed (14 scenarios plus parent), including the full complete/reopen/Done-in-Backlog/reallocation cycle, contradictory locations, rollback, Backlog generation, ambiguous/stale legacy mappings and safe reverse/forward. No development volume was migrated. HTTP authority, cursor validation, complete-list reorder handler/idempotency/audit and concurrent end-user behavior remain untested.

The [integration suite](../../tests/storage.test.mjs) starts a unique temporary container with random credentials, no host port and only synthetic data, then stops that container. It does not touch the Compose development volume or other running containers. Tests fail if Docker/SQL execution fails; they are never silently skipped. Hand-written three-dimensional vectors test storage/ranking behavior, not semantic quality or a trained model.

Execution on 13 October 2026: nine database scenarios passed (10 Node test results including the parent) on PostgreSQL 17.10, pgvector 0.8.2 and Docker 29.3.1, first on host Node 22.23.0 and then on a checksum-verified portable Node 24.21.0. Context lint/check/test passed (9 tests); documentation lint/test passed (7 tests, eight diagram pairs). The first documentation run caught architecture origin-version drift; the source metadata and current-version inventories were corrected before the passing run. Local bootstrap, migration and replay also succeeded; the database was running at the loopback address above at that time; current availability must be checked separately.

Not run: full handler/consumer-provider tests, paused concurrent permission revocation at transport, service authentication, historical retrieval UI, backup restore/retention, rendered diagram inspection and corpus recall/latency evaluation. No FR or complete SP is marked Done by the database suite. A portable runtime was used for supported-version validation; the system-wide Node installation was not replaced.

References: [pgvector 0.8.2](https://github.com/pgvector/pgvector/tree/v0.8.2), [PostgreSQL database/object grants](https://www.postgresql.org/docs/17/sql-grant.html), and [official PostgreSQL image initialization](https://github.com/docker-library/docs/blob/master/postgres/README.md).

## Handoff preparation and protected claims — additive follow-up

[Proposed ADR-0023](../../docs/adr/0023-immutable-handoff-storage.md) maps Knowledge migration 003 and Workspace migration 004. These new files were verified only in isolated synthetic containers in this task; the development database was not upgraded. db:test now runs both storage suites sequentially. Existing applied 001/002 files are unchanged. db:migrate applies all pending owned migrations, including Workspace 003's legacy-location reconciliation gate; inspect that gate before upgrading valuable data.

Knowledge stores immutable exact manifest bytes/full metadata and generated SHA-256 with append-only outcomes. Workspace reserves protected_handoff in idempotency_record with immutable fence/process, infinity expiry and append-only matching outcomes. The helper returns a newly inserted fence inside the caller's transaction; wait for known commit acknowledgement before any guard/send. Duplicate/changed/unknown claims authorize no replay. Service roles/SQL do not implement current user permission or active-process/guard/transport behavior.

Upgrade rejects existing legacy protected_handoff rows rather than guessing their status or clearing them. New down files refuse nonempty handoff/claim/outcome records: use reviewed forward recovery with retained consumed identities. Do not delete claims or reset a database to make a handoff eligible again. The general rollback CLI remains destructive and service-by-service; it is not a safe routine cleanup. Physical retention outside these no-replay identities remains an owner decision.

## Optional receipt integration check

With installed development dependencies (npm ci), Node 24+ and Docker, run npm run contracts:storage:test for the isolated get-handoff-manifest.sql projection and byte-reference integration. This optional check uses Ajv development tooling; db:test remains dependency-free. The query binds independently validated actor/project/run/context/generations and canonicalizes PostgreSQL base64 line separators while preserving stored bytes. A matching row does not decide permissions or authorize another send. See HANDOFF-SQL-01 in docs/sdlc for evidence and limits.

## Workspace 005 — owner-authorised P08 persistence

Migration 005 adds private accounts, token digests, persistent clock health and authentication audit. db:migrate discovers it, but this task applied it only in disposable test databases. Upgrade refuses nonempty legacy Session rows; down refuses retained identities/audit/used-clock state. Do not clear data to bypass the guard. Existing 001–004 are unchanged. The clock begins unhealthy; explicit operator initialization/recovery and atomic session revocation/audit are required. See [the private operations guide](../../services/workspace/SESSION-OPERATIONS.md). Run npm run test:session:storage for owned role/failure/restart tests. No public login/logout handler, development upgrade or reset is implied.

## P10 lifecycle audit extension

Workspace migration 006 adds session_renewed/session_revoked to the authentication audit action constraint. Existing migrations 001–005 remain unchanged; 006 down refuses retained lifecycle events and never deletes them. P10 verification uses disposable storage only; no development migration is implied. Public session handlers now exist as described in [the HTTP guide](../../services/workspace/SESSION-HTTP.md); earlier stage notes retain their original execution scope.
