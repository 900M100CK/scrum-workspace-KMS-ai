# SP06-P03 — Add owned creation, policy and receipt persistence

**Artifact ID:** SP06-P03\
**Version/date:** 0.2 Draft · 7 November 2026
**Inputs:** [Owning FEAT-SP06-01](../plan.md) v0.1 and its frozen source manifest; SP-06 v0.6.4; IMPL-SP-06 v0.2; PRD-01 v0.10.3.\; Proposed ADR-0032 v0.1
**Trace:** FR/AC-04/10/14/50/51/52 with supporting31/39/59/68; BR-01/04/10/11/14; SC-06.\
**Owner role:** Sequential implementer; current status only in the owning plan.

**Parent:** PLAN-01 Month 2 / M-04; SP-06.1 (P00–P02), SP-06.2 (P03–P08), SP-06.3 (P09–P11), SP-06.4 (P12–P14); co-delivered SP-11.1 capture.

**Prerequisites:** P02; exact migration design reviewed within selected scope.

**Allowed paths:** services/workspace/migrations/014+; services/knowledge/migrations/004+; owned store adapters; tests and runbooks. Implementation paths outside current canonical allowance remain conditional on P02's coordinated scope amendment; this brief grants no authority to silently bypass it.

**Steps:** Inspect already-applied schemas; add only missing same-key identity binding, scoped generation/provenance, content-format/payload identity, immutable outcomes and minimum audit. Each service uses its own pool and transaction.

**Acceptance assertions:** Forward/reverse/repeat on disposable databases; refuse destructive rollback with durable content/evidence; audit or receipt failure rolls back owning mutation; applied001–013/001–003 unchanged.

**Verification (Planned unless linked from the plan as executed):** Planned real PostgreSQL storage tests, constraint negatives, runtime-role isolation and original-outcome immutability. Existing commands and future runner boundaries are in the plan; new runners must be wired before claiming execution.

**Result/handoff:** Save source identity, actual command/exit/assertions, original failures, unrun checks and remaining decisions under fresh feature evidence; link the result from plan.md. Confirm no unrelated files, accepted ADRs, applied migrations or old evidence changed. No independent approval is implied.

## P03-A authority-only increment

[SP06-P03-A](P03-A-create-authority-storage.md) owns014 private knowledge-author scope/protection/predicate and evidence-preserving down only. No Knowledge migration, policy registration or creation receipt schema is part of A. Broader P03 work requires later registered source increments and decisions. Mutable state remains only in plan.md.
