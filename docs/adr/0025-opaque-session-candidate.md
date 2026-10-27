# Opaque server-side sessions for SP-01

**Artifact ID:** ADR-0025  
**Version/date:** 0.1 Draft · 27 October 2026  
**Decision status:** Proposed; OD-09 remains open.  
**Inputs:** PRD-01 v0.9; UC-02 v0.8 (UC-01); TEST-08 v0.21; Workspace contract v0.2.8; ADR-0006 v0.1; ADR-0011 v0.1; ADR-0012 v0.3; [ADR-0024](0024-backend-session-foundation.md); [SP-01.1 brief](../implementation/briefs/SP-01.1-session-foundation.md).  
**Trace:** FR-01/36/37/68; AC-01/36/37/68; BR-01/10; SC-06.  
**Owner role:** Architect preparing D-02 for owner review.

## Context and proposed decision

The contract exposes `POST /session` (`signIn`), `GET /session` (`getSession`) and `DELETE /session` (`signOut`). Login requires `username` and `password`; Session returns only `user_id` and `expires_at`. Do not replace username with email, add registration/reset/MFA flows or change these wire shapes through a task brief.

Recommend opaque random session tokens and Workspace-owned session persistence, with pre-provisioned synthetic accounts for preparation. Generate 32 cryptographically random bytes per token and store only a SHA-256 token digest. Never put the raw token or password into JSON responses, logs, traces or audit payloads. Successful authentication establishes a fresh token; client actor fields never set identity. Session checks fail closed on unavailable or unknown persistence state.

Recommend a cookie with HttpOnly, Secure, SameSite=Strict and Path=/ in the intended same-origin deployment. Specify the cookie name, host/domain behaviour and expiry/deletion attributes before implementation. Prove Secure-cookie behaviour through HTTPS; an HTTP-only synthetic probe cannot close the browser gate. Validate Origin and a deliberate CSRF mechanism for state-changing cookie-authenticated requests, including sign-in/out. The exact missing-Origin policy, header/token mechanics and development-origin configuration belong in the decision evidence, not implicit defaults.

Use a supported password KDF with an explicit salt and measured parameters. Node scrypt is the initial dependency-minimising candidate; argon2id is an alternative if its additional dependency is justified. Unknown and invalid accounts receive the same public invalid-credential response and comparable KDF work. Do not claim byte-identical execution time or constant network latency. Rate limiting and safe secret handling must be tested without revealing account existence.

## Expiry and logout questions for the owner

Propose separate configurable idle and absolute limits. Thirty minutes idle and eight hours absolute are discussion values only, not selected defaults. The spike uses an injected clock and labelled short synthetic limits; it does not choose production policy. Record which authenticated requests refresh idle expiry, the write/concurrency policy and how `Session.expires_at` reflects the effective deadline. Absolute expiry cannot slide; a rejected expired token cannot revive itself through renewal. Concurrent logout and renewal must not resurrect a closed session.

Logout invalidates the current session and clears its cookie using matching scope attributes. UC-01 EX-03 and TC-01 require already-expired/already-invalidated logout to succeed idempotently; use the declared 204 success. Protected reuse returns 401 with the declared Error schema. Required audit capture, if applicable to the operation catalogue, accompanies its producer; no new sign-in audit requirement is invented here.

Session persistence supports logout and expiry. Document revocation still depends on current authoritative permission checks and guarded handoffs; a valid session alone grants no project/document access. A DB session does not solve the check/send race. Detailed concurrency integration remains subject to D-07 and the existing guard ADRs.

## Alternatives, evidence and consequences

JWT with server-side current-authority checks is possible, but adds token lifecycle choices without a demonstrated SP-01 benefit. An external identity provider remains possible under OD-09; its account provisioning, callback/origin and outage consequences need a separate comparison. No alternative is rejected by owner acceptance in this proposal.

No session table migration is added here. Inspect existing Workspace schema first; any credential/session fields, foreign keys, hash constraints, indexes, retention or cleanup changes require a coordinated data/spec path update. Do not copy illustrative SQL over applied migrations or turn physical retention into an assumed duration.

**Evidence:** E-SESSION and E-HTTP in the [brief](../implementation/briefs/SP-01.1-session-foundation.md), followed by real SP-01.2–4 and applicable guarded invalidation tests. All live session results remain Not run at authoring. **Checklist:** Pass for an explicit candidate and open policy; Gap for owner policy, implementation and runtime verification. **Handoff:** owner reviews the concrete proposal after available spike evidence; agent does not mark this Accepted.
