# Guarded service transport and project-scoped concurrency guard

**Artifact ID:** ADR-0033\
**Version/date:** 0.1 Proposed · 10 November 2026
**Status:** Proposed implementation mechanics for selected B03 only; no runtime or whole-ADR acceptance.\
**Inputs:** PRD-01 v0.10.3; SP-06 v0.6.4; ADR-0006/0007/0011 owner-confirmed directions; FEAT-SP06-01 v0.4; [exact B03 owner receipt](../implementation/features/sp-06-document-access/evidence/p01b-20261109/owner-receipt.json); existing session/Fastify conventions.\
**Trace:** FR/AC-04/10/14/50/51/52 and supporting31/39/59/68; BR-01/04/10/11/14; SC-06.

## Context and bounded decision

The owner explicitly chose B03 for Workspace-Knowledge transport and concurrency guard: fixed Workspace gateway, Workspace-only permission authority, trusted TLS, rotated server-side `X-Service-Key`, forwarded `X-Actor-Session`, project-scoped reader-writer guard with writer preference, active socket destruction with bounded close deadline, startup fencing generation, deny-on-ambiguous restart, and no automatic multi-authority failover.

Workspace alone owns session validation and permission authority. Knowledge holds immutable document content and does not evaluate membership or grant validity directly. Service-to-service calls between Workspace and Knowledge must be authenticated over trusted TLS using a server-side `X-Service-Key` compared in constant time (`crypto.timingSafeEqual`) and the forwarded `X-Actor-Session`. Any client-supplied `X-Service-Key` or `X-Actor-Session` header entering the Workspace gateway must be stripped before processing.

## Project-scoped reader-writer guard and socket destruction

Protected document deliveries prepare their payload outside the guard and acquire a shared read lock on the project during delivery. Membership removal, read revocation, and document authority changes acquire an exclusive write lock on the project. Writers are given preference: when an exclusive lock request is pending, new shared read requests are queued behind it to prevent revocation starvation under continuous streaming.

To prevent slow or stalled readers from holding the guard indefinitely:
1. Revocation marks the project as `revoked` and registers the invalidation intent.
2. The server actively destroys (`socket.destroy()`) the sockets of all in-flight protected responses for that project.
3. The server waits for confirmed socket closure up to a bounded deadline (`close_deadline_ms`, default 500ms).
4. If socket closure is confirmed within the deadline, the revocation operation returns confirmed `revoked` (e.g. 204 No Content). If the deadline expires before closure is confirmed, the operation returns `unknown` (e.g. 504 Gateway Timeout or generic 500 error), never reporting unconfirmed success.
5. New delivery attempts re-check the project's `revoked` flag immediately before acquiring shared delivery; any delivery encountering a revoked state fails closed.

## Restart lifecycle and fencing generation

Because the guard resides entirely in process memory, its state is lost upon process restart. A fencing generation (monotonically increasing generation number or startup epoch) must be established before protected delivery resumes. If the process is in an ambiguous startup, shutdown, or remote lifecycle state, all protected handoffs and deliveries are denied (`deny-on-unknown`). No automatic multi-authority failover is permitted in this solo deployment.

## P05 implementation paths and boundaries

Reserve the following implementation paths for P05:
- `services/workspace/src/policy/guard.ts`: `ProjectRWGuard` with writer preference, socket registry, active socket destruction, close timeout deadline, and generation fencing.
- `services/workspace/src/transport/service-auth.ts`: Constant-time `X-Service-Key` validation, internal header stripping, and actor session forwarding.
- `tests/workspace/transport-guard.test.mjs`: Unit and integration concurrency tests covering parallel reads, writer preference, socket destruction, close deadline timeout, delivery re-check, generation fencing, and constant-time key validation.

## Alternatives and consequences

Using a mutex instead of a reader-writer lock would serialize all concurrent responses within a project, severely reducing throughput. Guarding per document rather than per project creates lock ordering hazards and potential deadlocks when membership removal spans multiple documents. Indefinite waiting without a socket-destroy deadline allows slow clients to dictate revocation latency. Check-then-send without transport-held guards allows data leaks during concurrent revocation.

## Verification and handoff

P02-B aligns this specification into canonical sources and registers test trace without changing application code. P05 implements the guard and service auth, providing real concurrency and timeout test evidence under disposable environments. B02 projection decisions remain separate. **Checklist:** context/decision/alternatives/consequences/trace specified; Gap for runtime implementation and test evidence. **Handoff:** P05 runtime implementation.
