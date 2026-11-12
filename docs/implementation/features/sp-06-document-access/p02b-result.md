# SP06-P02-B — B03 source alignment result

**Artifact ID:** SP06-P02B-RESULT-01\
**Version/date:** 0.1 Draft · 10 November 2026
**Inputs:** FEAT-SP06-01 v0.5; SP-06 v0.6.4; IMPL-SP-06 v0.2; IMPL-DEC-01 v0.15; Proposed ADR-0033 v0.1; exact B03 owner receipt.\
**Trace:** FR/AC-04/10/14/50/51/52 plus supporting31/39/59/68; BR-01/04/10/11/14; SC-06; SP-06.1 / PLAN-01 Month2 / M-04.\
**Owner role:** Sequential implementer; author source verification only.

Canonical SP06 and its implementation pack now record B03 guarded service transport, exact future guard and service-auth paths, and planned concurrency/timeout/fencing negatives. The decision map resolves this transport direction under the owner's explicit selection. The future implementation paths are explicitly reserved: `services/workspace/src/policy/guard.ts`, `services/workspace/src/transport/service-auth.ts`, and `tests/workspace/transport-guard.test.mjs`.

[Proposed ADR-0033](../../../adr/0033-guarded-transport-boundary.md) specifies the bounded transport and guard design:
- Project-scoped reader-writer guard (`ProjectRWGuard`) with writer preference: shared read for delivery, exclusive write for revocation/removal/authority changes.
- Revocation actively destroys in-flight sockets, sets `revoked` flag, and waits for confirmed closure up to a bounded deadline (`close_deadline_ms`); unconfirmed close is `unknown`.
- New delivery re-checks the revoked flag before acquiring shared delivery.
- In-memory guard is lost on restart; startup fencing generation prevents premature delivery before generation is established.
- Service authentication uses rotated server-side `X-Service-Key` compared constant-time (`crypto.timingSafeEqual`) and server-forwarded `X-Actor-Session` over trusted TLS.

No application, contract, migration, dependency or runtime test code changed for this source alignment. No commit/push/PR/merge or independent approval.

**Checklist:** Source/scope/trace alignment and structural consistency recorded; runtime proof and B02 remain open. **Handoff:** P05 is ready for runtime implementation and test verification; plan.md owns current task state.
