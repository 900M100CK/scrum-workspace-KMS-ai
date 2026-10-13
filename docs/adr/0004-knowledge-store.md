# Use one relational engine with owned databases

**Artifact ID:** ADR-0004  
**Version/date:** 0.2 · 13 October 2026
**Status:** Storage implementation authorised by the owner's request to read and implement this ADR; application policies/deferrals are not approved by this change.
**Inputs:** [architecture](../architecture.md) v0.5; PRD-01 v0.4; PLAN-01 v0.1; DATA-04 v0.1; owner instruction on 13 October 2026.
**Author:** development agent acting sequentially; owner reviews business choices.

**Decision status:** Selected for the local storage foundation by owner direction. Database verification is distinct from application acceptance or embedding-provider adoption. OD-12's storage portion is implemented; ADR-0003's application framework choice remains separate.

**Context:** Versions, grants, work state and audits require relational correctness; semantic discovery must respect current document scope (BR-05, BR-07, BR-10, BR-14).

**Decision:** One PostgreSQL engine, separate owned databases/credentials for Workspace and Knowledge, and pgvector for the Knowledge storage pilot. Start with scoped exact discovery on the small pilot corpus. Embedding dimension, model and index parameters are pilot settings. No cross-database joins/writes.

**Alternatives:** A dedicated vector server adds deployment cost; choose it only if measured retrieval operations justify it. Graph storage is not justified by manual links. Approximate indexes are optional after a recall/latency baseline, not the default demonstration.

**Consequences:** Fewer infrastructure products; operational/version metadata and passages remain distinct. A local database says nothing about embedding/generation locality. Authority checks occur independently of vector scores.

**Implementation:** [Local runbook](../../infra/postgres/README.md), [Workspace migration](../../services/workspace/migrations/001-store.up.sql), [Knowledge migration](../../services/knowledge/migrations/001-store.up.sql), and [integration tests](../../tests/storage.test.mjs). The owner-authorised storage slice includes `infra/postgres/`, owned service migrations, `scripts/database.mjs`, test/package command wiring and supporting documentation. It implements storage prerequisites for SP-06/SP-07/SP-09, not their complete HTTP/UI flows; no shared API contracts or business scope change.

Pin `pgvector/pgvector:0.8.2-pg17-bookworm` at digest `sha256:feb68f4f15446397d8cac7f4fe48fe4586de83160d1fc48b46283312d1a33966`; runtime reports PostgreSQL 17.10. Runtime logins are separate from non-login schema owners; PUBLIC database access is revoked. Only Knowledge installs vector. Reversible migrations are transactional, locked and checksum-tracked. SQL stores configurable embedding identities/dimensions/metrics; no approximate index or universal threshold is selected. English full-text search provides an independent keyword baseline; trigram/fusion work remains unselected.

**Permission and failure boundary:** SQL requires both project and document scope from Workspace, then filters local current/available versions before ranking. Missing scope gives no results; storage errors do not retry unrestricted. Runtime database logins are trusted service identities, not end-user authorization. No copied Knowledge ACL, permission cache or answer cache is added. Local indexing writes lock the document and reject obsolete revisions/generations. Permission changes and provider/citation/answer delivery still require the unimplemented ADR-0006 application guards. An uncertain remote lifecycle write must still block handoff until reconciliation. A local query test is not proof of concurrent revocation at transport.

**Evidence:** [pgvector 0.8.2](https://github.com/pgvector/pgvector/tree/v0.8.2) documents exact search and configurable vector storage; [PostgreSQL grants](https://www.postgresql.org/docs/17/sql-grant.html) define database/object privileges. On 13 October 2026 the real integration suite passed nine scenarios (10 results including the parent) on PostgreSQL 17.10 / pgvector 0.8.2: forward/reverse/repeated migration and drift rejection; cross-database credential denial; operational constraints; immutable evidence/locator constraints; dual-scope exact/keyword queries; refreshed scope; replacement/retry; deletion/stale-job rejection. The fixture uses synthetic vectors and is not semantic-quality, capacity or latency evidence. Host Node was 22.23.0, below the required 24+; supported-version validation is recorded separately when run.

**Supported-version follow-up:** The same nine database scenarios and context lint/check/test (9 tests) passed on portable Node 24.21.0. Documentation lint/test passed (7 tests) after correcting the initially detected SAD/diagram source-version drift. Local Compose bootstrap, migrations and replay succeeded on the digest-pinned image. Host Node was not replaced. No commit was made.

**Checklist:** Pass for owned physical migrations and the executed storage scenarios. Gap for full handler/consumer-provider/security tests, concurrent permission handoff, backup restore, retention and measured corpus recall/latency. N/A for graph/dedicated vector store, sharding and approximate indexes in this small local foundation. **Handoff:** Wire service-owned adapters and authoritative scope/guard flows through the bounded specs; do not mark SP-06/SP-07/SP-09 or Core complete from this storage implementation.
