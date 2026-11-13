# Guarded document delivery and lifecycle reconciliation

**Artifact ID:** ADR-0034
**Version/date:** 0.1 Proposed · 13 November 2026
**Status:** Proposed implementation mechanics for the authorised document safety fix.
**Inputs:** ADR-0007, ADR-0011 and Proposed ADR-0033. [Fix plan](../implementation/features/document-safety-fix/plan.md).
**Trace:** FR-04/11/13/14/39/48/50/52/59, SC-05/06.

Workspace checks independent document write and lifecycle grants and owns the protected handoff. Final authority and lifecycle checks run at the handoff boundary. The shared project guard lasts through response finish or confirmed abort. An exclusive operation prevents new delivery and coordinates bounded cancellation of active transports. Existing database session/account locking coordinates session invalidation across processes.

Before contacting Knowledge for a version mutation, Workspace durably records the scoped command identity and request hash. An unresolved command blocks the affected document through restart. Confirmed success or definite rejection resolves the block. Knowledge alone commits content/lifecycle state, minimum audit and original result. A timeout preserves the original operation identity. Reconciliation requires current action authority. Legacy unavailable records require evidence from both stores before repair.

Direct pre-send checks leave a revocation race. Marking policy unavailable ahead of Knowledge CAS can hide live content on a rejected command. The selected mechanics require concurrency, replay and restart evidence before publication.
