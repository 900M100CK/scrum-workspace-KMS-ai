# Opaque server-side sessions for SP-01

**Artifact ID:** ADR-0025\
**Version/date:** 0.5 Draft · 28 October 2026\
**Decision status:** Owner-confirmed policy direction; detailed adoption remains Proposed with KDF/time/recovery verification gates.\
**Inputs:** PRD-01 v0.9; UC-02 v0.8 (UC-01); TEST-08 v0.22; Workspace contract v0.2.8; ADR-0006 v0.1; ADR-0011 v0.1; ADR-0012 v0.3; [ADR-0024](0024-backend-session-foundation.md); [SP-01.1 brief](../implementation/briefs/SP-01.1-session-foundation.md).\
**Trace:** FR-01/36/37/68; AC-01/36/37/68; BR-01/10; SC-06.\
**Owner role:** Architect preparing D-02 for owner review.

## Context and proposed decision

The contract exposes `POST /session` (`signIn`), `GET /session` (`getSession`) and `DELETE /session` (`signOut`). Login requires `username` and `password`; Session returns only `user_id` and `expires_at`. Do not replace username with email, add registration/reset/MFA flows or change these wire shapes through a task brief.

On 28 October the owner selected opaque random session tokens and Workspace-owned digest persistence, pre-provisioned username accounts, independently valid concurrent sessions, same-origin secure cookies with Origin/header checks, 30-minute idle expiry and 8-hour absolute expiry. Exact owner reply and remaining gates are retained in the [P06 batch](../implementation/features/sp-01-session-foundation/decision-batch.md). Generate 32 cryptographically random bytes per token and store only a SHA-256 token digest. Never put the raw token or password into JSON responses, logs, traces or audit payloads. Successful authentication establishes a fresh token; client actor fields never set identity. Session checks fail closed on unavailable or unknown persistence state. No registration/reset/MFA scope is introduced.

Recommend a cookie with HttpOnly, Secure, SameSite=Strict and Path=/ in the intended same-origin deployment. Specify the cookie name, host/domain behaviour and expiry/deletion attributes before implementation. Prove Secure-cookie behaviour through HTTPS; an HTTP-only synthetic probe cannot close the browser gate. Validate Origin and a deliberate CSRF mechanism for state-changing cookie-authenticated requests, including sign-in/out. The exact missing-Origin policy, header/token mechanics and development-origin configuration belong in the decision evidence, not implicit defaults.

Use a supported password KDF with an explicit salt and measured parameters. Node scrypt is the initial dependency-minimising candidate; argon2id is an alternative if its additional dependency is justified. Unknown and invalid accounts receive the same public invalid-credential response and comparable KDF work. Do not claim byte-identical execution time or constant network latency. Rate limiting and safe secret handling must be tested without revealing account existence.

## Expiry and logout questions for the owner

The owner selected configurable starting 30-minute idle and 8-hour absolute limits, not risk-analysis findings; the short laboratory limits remain unrelated. The detailed proposal renews idle expiry on authenticated GET /session and later shared Workspace authenticated checks, sampling authoritative time after the applicable locks. The effective deadline is min(absolute, max(existing idle, decision time + idle window)); it cannot decrease or extend the original absolute cap. Return that effective deadline and align cookie lifetime with the remaining cap. A rejected expired token cannot revive itself through normal renewal. Concurrent logout and renewal must not resurrect a closed session. Account lock/disable policy remains unselected and TC-01 remains binding. P07 may implement ports/configuration/local HTTPS only; P08/P10 detailed algorithm and schema gates remain open.

Logout invalidates the current session and clears its cookie using matching scope attributes. UC-01 EX-03 and TC-01 require already-expired/already-invalidated logout to succeed idempotently; use the declared 204 success. Protected reuse returns 401 with the declared Error schema. Required audit capture, if applicable to the operation catalogue, accompanies its producer; no new sign-in audit requirement is invented here.

Session persistence supports logout and expiry. Document revocation still depends on current authoritative permission checks and guarded handoffs; a valid session alone grants no project/document access. A DB session does not solve the check/send race. Detailed concurrency integration remains subject to D-07 and the existing guard ADRs.

## Alternatives, evidence and consequences

JWT with server-side current-authority checks is possible, but adds token lifecycle choices without a demonstrated SP-01 benefit. An external identity provider remains possible under OD-09; its account provisioning, callback/origin and outage consequences need a separate comparison. No alternative is rejected by owner acceptance in this proposal.

The owner subsequently authorised additive Workspace migration 005 for P08, with coordinated logical/data/ERD/test updates. Original 001–004 remain unchanged. Upgrade refuses legacy sessions rather than guessing bearer/account/absolute-time bindings; down refuses retained identities/audit/used clock. No development migration or physical retention policy is implied.

## Clock, KDF and recovery evidence — 28 October 2026

The [runtime result](../sdlc/reports/SP-01-runtime-spike-2026-10-28.md) records actual HTTP, pg and controlled-lock repository tests. The baseline DB-wall-time algorithm failed backward-time non-revival. The owner explicitly chose further fault detection/fail-closed hardening before acceptance. A separate persistent singleton clock-health candidate detects an observed backward step, latches a fault across repository reconstruction and denies issue/check/renewal even after time catches up. Logout still revokes. All guarded operations lock clock state before session rows; decision time is sampled after the relevant locks. This serializes session checks and must be measured in application work.

Recovery is proposed as an operator-only procedure, never a public endpoint or automatic reset: independently verify time, supply a current guard precondition and attestation reference, lock clock state, compare DB time with attested time, revoke every prior session and persist minimum recovery audit atomically before clearing the fault. The laboratory candidate tests stale/mismatched attestation rejection, audit-failure rollback, successful revocation and fresh issuance. Its 1-second attestation comparison is synthetic engineering calibration, not an owner-selected operational tolerance. An actual operator tool, independent trusted-time procedure, service authorization and DB restart scenario remain unverified. Neither this guard nor a clamp can detect elapsed time in an entirely unobserved forward/backward interval; DB time is still a trusted operational dependency. No stronger elapsed-time or universal restart guarantee is supported.

For KDF calibration, recommend scrypt N=131072/r=8/p=1, 16-byte random salt, 32-byte output and explicit maxmem=192 MiB. This matches an [OWASP scrypt baseline](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt); [Node 24](https://nodejs.org/download/release/v24.21.0/docs/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback) requires sufficient explicit memory for these parameters. Local single/dummy/concurrent timings and hardware are retained in the measured log; no deployment capacity SLA follows. Bound concurrent KDF jobs and input bytes in application integration and test unavailable/rate-limit responses against the contract. Do not import the weaker N=16384 synthetic fixture as production policy.

**Checklist:** Self-checked owner direction and attributed laboratory evidence; technical adoption remains Proposed. **Handoff:** review the measured KDF/recovery recommendation and trusted-time limitations before detailed application adoption. Real handlers, browser cookie semantics, production operating procedure and D-07 integration remain unverified. The agent does not mark this Accepted.

## P08 implementation disposition

The owner selected manual disable (deny login/all existing sessions; no automatic lockout), then authorised P08/schema extension with the stated conditions. The actual adapters use explicit 192 MiB maxmem, a process-wide two-job admission cap across verifier instances, no queue, bounded stored parameters/input, and SQL decision-time precision. Recovery is private operator tooling with role/precondition/time comparison, all-session revocation and audit in one transaction. Missing clock/role/read state denies; observed faults survive real PostgreSQL restart. The runtime cannot clear faults or mutate accounts. A narrow account-lock helper avoids granting runtime credential UPDATE. Tests observe singleton lock timeout and later health; no throughput SLA is claimed.

See [P08 result](../sdlc/reports/SP-01-P08-persistence-2026-10-28.md) for actual checks. Shared libuv, target-deployment KDF calibration, independently verified operating time, unobserved intervals, public handlers/browser and D-07 remain separate gaps. ADR status remains Proposed despite bounded implementation authorisation and passing tests.

## P09 bounded adapter evidence

The owner authorised the next P09 task. Actual POST/GET session handlers, selected cookie/Origin, non-mutating request validation and final JSON-object validation are integrated over owned persistence. Exact new Workspace dependencies are @fastify/cookie 11.1.5, Ajv 8.20.0 and ajv-formats 3.0.1. [P09 result](../sdlc/reports/SP-01-P09-http-2026-10-28.md) separates actual handler/PG/HTTPS/compiled startup from unrun browser/logout/renewal/deployment/D-07 gates. Earlier absence-of-handler statements describe their prior stages. No Accepted status follows from implementation.

## Bounded P10 implementation — 28 October 2026

The owner separately requested P10 after P09. Actual GET renewal and DELETE logout now use the owned transaction/clock/account/session ordering, atomic lifecycle audit and additive migration 006. [P10 result](../sdlc/reports/SP-01-P10-lifecycle-2026-10-28.md) records execution evidence. GET refreshes the same host cookie from DB expiry; strict idle/absolute expiry cannot be revived by renewal, and logout reduces access even with a fault-latched clock. A pre-authorized response can remain in flight; protected-content guarded handoff, UI/browser, deployment calibration and formal acceptance remain open. This is bounded implementation, not an Accepted ADR or D-07 closure.
