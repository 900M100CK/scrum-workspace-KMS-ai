# P08 persistence and adoption proposal

**Artifact ID:** SP01-P08-DESIGN\
**Version/date:** 0.2 Draft · 28 October 2026\
**Status:** Owner-authorised bounded P08 design; broader ADR adoption/acceptance and deployment evidence remain open.\
**Inputs:** [FEAT-SP01-01](plan.md); [P08 task](tasks/SP01-P08-owned-persistence.md); [decision batch](decision-batch.md); [ADR-0024](../../../adr/0024-backend-session-foundation.md) (P08 design snapshot v0.3); [ADR-0025](../../../adr/0025-opaque-session-candidate.md) (P08 design snapshot v0.3); Workspace migrations 001–004; DATA-04 v0.13; Workspace contract v0.2.8.\
**Trace:** M-01 / SP-01.2 and applicable SP-11.1; FR-01/36/37/68, TC-01 and TC-18 relevance.\
**Owner role:** Owner selects material persistence/time/KDF mechanics; implementer prepares and verifies the selected slice.

## Selected policy and remaining adoption

Reuse the selected framework, pre-provisioned usernames, opaque 32-byte tokens with SHA-256 persistence, independent concurrent sessions, secure same-origin cookies, and configurable starting idle 1800 / absolute 28800 seconds. These values are starting configuration, not a risk-analysis result. On 28 October the owner also selected manual account disable: deny new login and all existing sessions; no automatic lockout after failed attempts. Login errors for unknown, wrong or disabled credentials stay publicly generic. There is no registration/reset/account-management UI in this slice.

The remaining proposed adoption is exact pg/cookie/validation integration, the stronger measured scrypt candidate, the clock-health mitigation/recovery protocol and additive owned schema below. P07 did not approve these by providing interfaces. A successful spike does not self-Accept an ADR.

## Existing schema and additive migration

Migration 001 already has `workspace.session(session_id, user_id, expires_at, revoked, revision)` and no credential/token/absolute-deadline fields. Existing business_audit requires a project ID, but login and clock recovery occur before project selection. Do not fabricate a project, repurpose another service's table or weaken the existing audit table to fit authentication.

Propose a new `005-session-foundation` up/down migration without editing 001–004:

| Owned object | Proposed content and invariants |
| --- | --- |
| workspace.auth_account | user_id UUID primary key; exact case-sensitive username unique and nonempty; encoded salted credential; disabled flag; exact bigint credential revision. No Unicode normalization, email alias or trimming policy is invented. Credentials remain private service/operator data. |
| workspace.session_token | session_id primary/foreign key to existing session; token_digest unique lowercase 64-hex; created_at and immutable absolute_expires_at. Existing session.expires_at remains the effective idle deadline. Effective expiry cannot exceed the original absolute cap. Account association is enforced without modifying historical rows. |
| workspace.auth_clock_state | One guarded singleton: last_observed timestamp, latched healthy/fault state and exact bigint recovery generation. Initially uninitialized/unhealthy, so no login is issued until explicit operator initialization. No application auto-reset on process start. |
| workspace.authentication_audit | Append-only event identity, producer/operator reference or authenticated actor, action/entity/session references, observed time, clock state and correlation. Never password, credential hash, raw token, cookie, or token digest. A separate private authentication surface does not grant project audit inspectors global identity access. |

The upgrade must refuse a nonempty legacy session table: bearer digests, credential bindings and original absolute deadlines cannot be inferred. Preserve the data and report reconciliation required; do not delete/revoke legacy rows implicitly to make migration pass. A future nonempty-store reconciliation requires explicit owner disposition.

Down must refuse any account, session-token or authentication-audit data and any initialized/used clock state. Empty synthetic stores can reverse/forward/reapply. This is not permission to clear application data. Original checksums and service isolation remain binding. Prefer constraints/triggers for immutable deadlines, append-only audit and one-way runtime fault latching; exact SQL is implementation work after adoption.

## Transaction, disable and clock protocol

Use one Workspace pg client per short transaction. All affected operations acquire locks in one order: clock state, account, then session. Token lookup before locking supplies only a hint; reread account/session under locks before deciding. Credential derivation happens outside DB locks; on success, recheck the unchanged credential revision/hash and enabled account under lock before issuing a new server-generated actor/token. No DB transaction waits for a KDF, HTTP call or provider.

Authenticated decision time is sampled in PostgreSQL after the relevant locks. Perform deadline comparisons and renewal arithmetic in SQL so JavaScript Date conversion does not become the authority or silently reduce timestamp precision. Effective expiry is min(absolute, max(existing idle, decision time + idle window)). Renewal cannot revive an expired/revoked session or extend its original absolute deadline.

An observed backwards clock step latches unhealthy state; issuance/check/renewal fails closed. An unavailable guard or failed DB read also denies access. Logout can still invalidate an identified session while unhealthy and returns idempotent 204 for unknown/expired/already-revoked tokens. Minimum mutation/fault audit is co-committed where required; failure cannot produce successful auth or a cookie. Connection/protocol/rollback failure discards the client. Lost COMMIT acknowledgement is unknown, never assumed rollback or automatically replayed.

Manual disable is an operator transaction using the same lock order: set disabled, invalidate all that account's sessions, increment applicable revisions and append minimum audit atomically. Later re-enable does not reactivate old sessions. Runtime checks always inspect current disabled state; possession of an earlier valid session is insufficient. KDF still executes the same configured work for invalid/disabled/unknown account paths; do not promise identical latency.

Clock health is mitigation. It cannot establish elapsed time during an entirely unobserved forward/backward interval or replace operating-system/DB time discipline. The singleton serializes checks; no throughput claim is made. Actual deployment clock monitoring and operator authorization remain required operating work, separate from the laboratory result.

## KDF, resource bounds and recovery

Recommend the locally measured scrypt N=131072/r=8/p=1, random salt of at least 16 bytes, 32-byte output and explicit maxmem=192 MiB. Use a versioned, strictly parsed stored format with accepted parameters bounded before KDF allocation; never let stored/request-supplied parameters request unbounded work. The [OWASP baseline](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt) and [Node memory requirement](https://nodejs.org/download/release/v24.21.0/docs/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback) support this candidate; local latency is not a deployment SLA.

Propose two concurrent derivations per Workspace process and no unbounded waiting queue. Saturation returns the declared 503 access_unavailable shape. A bounded request body also bounds credential input allocation; detailed body-limit/413/415 documentation must be coordinated with the contract rather than silently tightening Login schema. Do not add a separate auth framework, ORM or automatic account-lockout policy.

Recovery is operator-only, never a browser endpoint. The operator independently verifies UTC/DB time and supplies a nonsecret attestation reference, current recovery generation/observed-state precondition and an explicit time comparison bound. The laboratory's 1-second bound is a proposal for configurable initial operation, not an approved universal tolerance. While holding the clock lock, compare fresh DB time with the attestation; revoke every pre-recovery session; persist minimum recovery audit and advance generation before restoring health, all in one transaction. Audit failure leaves the fault and prior state unchanged; stale preconditions fail. Old sessions stay revoked after subsequent restarts. Initialization uses the same explicit attestation discipline with no pre-existing sessions.

The Workspace runtime must not re-enable accounts, provision credentials, erase audit or clear an unhealthy clock through its ordinary database privileges. Use a separate operator/migration identity and enforce fault-reset privileges in SQL. No operator secret or password is a command-line argument, HTTP field or audit/log payload.

## Coordinated scope and tests after owner disposition

P08 would add only Workspace-owned migration/adapters/tests and operator tooling. Coordinate services/workspace/package.json plus the root lockfile for exact pg 8.23.1 / @fastify/cookie 11.1.5 and validator dependencies actually used. Shared root test scripts, logical data inventory, relevant documentation/contract limit descriptions and dependent spec trace need a registered coordinated update before editing. Knowledge has no authentication table/client or copied permission rules.

Required execution: real owner/runtime-role forward/reverse/repeat migration tests; unchanged 001–004 hashes; refusal of legacy nonempty sessions; forbidden credential/fault-reset/audit mutation under runtime role; generic wrong/unknown/disabled auth; disable/login and disable/renew barrier races; recovery/audit rollback; healthy/failed rollback/discard; exact bigint; no cookie before known commit; real restart; then actual POST/GET/DELETE handlers and browser UI in P09–P12. Schema inspection and the laboratory spike do not satisfy these application assertions.

**Checklist:** Author self-checked proposal against existing migration shape and selected policy; no independent review or application adoption. **Handoff:** [P06 disposition](decision-batch.md) must explicitly cover this schema/KDF/clock proposal before P08 application implementation. No commit, real-data transfer, development reset or migration was performed by writing this design.

## Conditional implementation authorisation

The owner authorised P08 and migration 005 with explicit conditions: configured memory above the scrypt minimum; two bounded jobs/no queue; shared libuv and deployment-calibration limits; private audited atomic recovery; missing clock denial; singleton contention evidence; explicit account-disable behaviour; and honest unobserved-time limits. These conditions do not Accept ADRs or close D-07. P08 implements these mechanisms and tests only disposable PostgreSQL. A narrow fixed-search-path account-lock function supplies locking without runtime credential UPDATE; direct runtime clock reset/provision/disable remains denied. Physical ERD/logical inventory and private operations guide follow actual 005; no public handler is delivered.

Implementation evidence: [SP01-P08-RESULT](../../../sdlc/reports/SP-01-P08-persistence-2026-10-28.md) v0.1 records completed bounded P08 checks. Conditional schema authorisation does not Accept ADRs, deploy the schema or grant P09–P12 scope.
