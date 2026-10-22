# Prepared-record SQL and receipt integration

**Artifact ID:** HANDOFF-SQL-01  
**Version/date:** 0.1 Draft · 18 October 2026  
**Status:** Executed optional SQL-to-reference integration; no HTTP handler, permission authority or relay acceptance.  
**Inputs:** PRD-01 v0.9; Proposed ADR-0020 v0.3 / ADR-0023 v0.2; HANDOFF-REF-01 v0.2; Knowledge OpenAPI v0.2.9; Knowledge migration 003; SP-09/11; TC-26.  
**Trace:** BR-08–BR-10, BR-12, BR-14; FR-21/28/29/32/55/57/59; SC-02/03/05/06.

## Query contract and trust

[get-handoff-manifest.sql](../../../services/knowledge/queries/get-handoff-manifest.sql) returns the existing StoredHandoff shape from committed Knowledge records. Bind handoff identity, actor, project, run, access-context reference, session generation and project permission generation through seven parameters. The caller must obtain those values from independently validated current server context; accepting client/model assertions as that context would be incorrect. Unknown authority prevents calling the query. NULL/mismatch produces no row, never a less-scoped fallback.

This is a storage selector/projection. It neither decides membership/document grants nor implements authenticated getHandoffManifest. Current session/project/document checks, service authentication, scoped request/run correlation and later guarded revalidation remain application responsibilities. A matching immutable record can become stale immediately after a read. A prepared record may remain readable after its claim is consumed; reading or byte-matching it does not authorize another send.

## Exact stored bytes and encoding

The projection reads manifest_bytes directly, rather than serializing the JSONB metadata back into bytes. It exports canonical base64 by removing the LF line separators inserted by PostgreSQL's encode(..., 'base64'); the decoded bytes, including original whitespace/Unicode, stay unchanged. PostgreSQL documents the 76-character wrapping and LF separator in its [binary conversion functions](https://www.postgresql.org/docs/17/functions-binarystring.html#ENCODE-FORMAT-BASE64). The tests reproduce the native wrapping and demonstrate why unmodified output fails the reference profile.

The generated SQL digest is compared against SHA-256 of original fixture bytes, and the receipt is checked by the JSON Schema and HANDOFF-REF-01 byte/evidence validator. JSONB key ordering and serialization differences cannot replace frozen bytes. SQL may preserve integers that a JavaScript JSON parse rounds; the reference profile rejects such a record rather than accepting a rounded binding. This remains a fail-closed profile, not a selected public revision representation or a complete application serializer.

## Reproduction and executed results

Requires Node 24+, installed development dependencies (`npm ci`) and Docker with the pinned PostgreSQL/pgvector image. Run `npm run contracts:storage:test`. This optional command is separate from dependency-free context/storage commands and from the Docker-free contracts:test command. It starts one uniquely named disposable container using random environment-only credentials, synthetic fixtures, no published port and no development volume; cleanup stops/removes that container.

The actual command passed **7/7 results**: six subtests plus parent, on Node 24.19.0 / PostgreSQL 17.10 / pgvector 0.8.2:

1. Both provider-input and answer-delivery receipts roundtrip complete document/operational metadata and exact Unicode/whitespace bytes with canonical base64.
2. Every one of the seven context parameters is separately mismatched and set NULL; each returns no row.
3. Native wrapped base64 and reserialized metadata bytes are rejected by the reference consumer.
4. A consumed claim remains consumed although the preparation can still be read and pass binding-only checks.
5. A separate reader cannot see an inserted uncommitted row. The writer is observed holding a transaction lock reached after insertion, then its own query is cancelled; rollback leaves no projected row.
6. An exact stored integer outside safe JavaScript precision is rejected by the reference decoder after projection, rather than accepted as its rounded value.

The writer cancellation targets only the backend identified by this test's unique application name in its own disposable database. No user/development backend was cancelled and no development migration was applied. The independent receipt/capture/identity values are synthetic oracles; they are not current authoritative decisions.

## Remaining gates

Not implemented or tested here: real HTTP/session/service authorization, current document scope, source-capture truth, provider wire schema/mapping, claim acquisition after known durable application acknowledgement, active-process fencing/quarantine, real guard ordering through transport completion/abort, crash recovery or actual zero-byte rejection/delivery. No endpoint, business policy, provider, framework, schema migration or SP Done is added by this query. SYS-01 remains blocking for AI relay; the UI/UX handoff retains its original runtime/visual limitations.

Checklist: Pass for bounded query/projection/reference integration; Gap for the live application boundary above. Handoff: use this query and cases when implementing the authenticated adapter, retaining the exact bytes and independently validated context.
