# SP06-P01-B — Selected project-scoped guarded delivery

**Artifact ID:** SP06-P01B-RESULT-01\
**Version/date:** 0.1 Owner-selected · 9 November 2026
**Inputs:** FEAT-SP06-01 v0.4; SP06-DECISION-BATCH-01 v0.4; SP06-P01-B v0.2; SP-06 v0.6.4; PRD-01 v0.10.3; B01 receipt and [B03 owner receipt](evidence/p01b-20261109/owner-receipt.json).\
**Owner role:** Sequential coordinator/implementer; preparation records the owner choice and does not self-approve implementation.\

The owner selected B03 as a bounded transport direction after review of the mutex, global guard and distributed-lease alternatives. The selected guard is reader-writer and project-scoped: protected delivery uses shared access; membership removal, revocation and authority changes use exclusive access with writer preference. This preserves concurrent deliveries while preventing revocation starvation and avoids document-plus-project lock ordering.

Revocation must set a revoked flag, destroy affected sockets and await confirmed close up to a bounded deadline. It returns success only after close is confirmed; deadline expiry is `unknown`. New delivery re-checks the revoked flag before acquiring shared delivery. The in-memory guard is fenced across restart; ambiguous startup/remote lifecycle state denies protected output until a new generation is established.

Service authentication is fixed to the Workspace gateway and Workspace authority over trusted TLS. `X-Service-Key` is server-side, rotated and constant-time compared; `X-Actor-Session` is forwarded by the gateway and is not client/model authority. No automatic multi-authority failover is selected. B02 remains open. This receipt does not authorize P05 code until the exact protocol, lock order, fencing lifecycle, socket-close behavior and runtime tests are mapped.

No application, contract, migration, dependency or runtime test code changed for this decision receipt. No commit/push/PR/merge or independent approval.
