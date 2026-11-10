# SP06-P01-B — Discuss B03 at the transport boundary

**Artifact ID:** SP06-P01-B\
**Version/date:** 0.2 Owner-selected · 9 November 2026
**Inputs:** [FEAT-SP06-01](../plan.md) v0.2; SP06-DECISION-BATCH-01 v0.2; SP-06 v0.6.3; PRD-01 v0.10.3; original source snapshot and B01 receipt.\
**Trace:** FR/AC-10, supporting04/31/39/59/68; BR-01/04/10/11/14; SC-06; SP-06.1 / PLAN-01 Month2 / M-04.\
**Owner role:** Sequential implementer; state only in parent plan.

**Prerequisites:** Concrete P02/P05 protocol exploration; owner-selected B03 bounded direction recorded below. Detailed fencing algorithm remains a P02/P05 design and test task.

**Allowed paths:** Owning feature decision/task/receipt/handoff and registration metadata. P02-A additionally allows the exact B01-only canonical/spec/pack/test-source amendments named in its steps; runtime paths require their explicit canonical amendment first. No accepted ADR, BRD pointer, application, applied migration or prior evidence rewrite.

**Steps:** Inspect service/actor authentication, project-scoped reader-writer lock ordering, final in-process checks, stream finish/abort and deadline-driven socket destruction, startup fencing and unknown restart handling. Implement only after the selected bounded protocol is mapped to concrete contracts and tests.

**Acceptance:** B03 is limited to the fixed Workspace gateway, Workspace-only authority, trusted TLS/service key with rotation and constant-time comparison, forwarded actor session, project-scoped reader-writer guard with writer preference, revoked flag plus active-socket destruction and close deadline, deny-on-ambiguous restart, and no automatic failover. Do not infer full Proposed ADR adoption, weaken retained revocation semantics or reopen settled independent rights.

**Planned verification:** Node24 context lint/check/test, contracts tests, docs lint/tests, metadata/diff, local links, scope/source/index preservation. Review of evidence is not runtime authority/transport proof. Preserve original failures in fresh evidence; do not overwrite prior planning logs.

**Handoff:** Record actual outcomes and remaining gates in a source-bound result linked only from the plan; no commit/push, agents or independent self-approval.

## Owner-selected B03 direction — 9 November 2026

The owner selected the project-scoped reader-writer design after brainstorming. Protected deliveries take a shared read lock; membership revocation, authority changes and other project-wide invalidations take an exclusive write lock. Writers have preference so a continuous stream of readers cannot starve revocation.

Revocation sets a revoked flag, actively destroys affected sockets, and waits for confirmed close up to a bounded deadline. It reports `revoked` only after closure is confirmed; an expired close deadline is `unknown`. New deliveries re-check the revoked flag before entering shared delivery. The guard key is project-scoped, avoiding document-plus-project lock ordering and cross-document deadlocks.

The guard is in-memory and is lost on restart. A fencing generation must be established before protected delivery resumes; ambiguous startup or remote lifecycle state denies protected output. `X-Service-Key` is server-side, rotated, compared in constant time and sent only over trusted TLS. `X-Actor-Session` is server-forwarded and never accepted as client/model authority. No automatic multi-authority failover is selected.
