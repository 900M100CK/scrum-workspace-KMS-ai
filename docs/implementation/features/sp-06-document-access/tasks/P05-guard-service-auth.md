# SP06-P05 — Implement and prove the selected guarded source transport boundary

**Artifact ID:** SP06-P05\
**Version/date:** 0.2 Verified slice · 10 November 2026
**Inputs:** [Owning FEAT-SP06-01](../plan.md) v0.5; SP-06 v0.6.4; IMPL-SP-06 v0.2; PRD-01 v0.10.3; Proposed ADR-0033 v0.1; [SP06-P05 evidence](../evidence/p05-20261110/results.json).\
**Trace:** FR/AC-04/10/14/50/51/52 with supporting31/39/59/68; BR-01/04/10/11/14; SC-06.\
**Owner role:** Sequential implementer; current status only in the owning plan.

**Parent:** PLAN-01 Month 2 / M-04; SP-06.1 (P00–P02), SP-06.2 (P03–P08), SP-06.3 (P09–P11), SP-06.4 (P12–P14); co-delivered SP-11.1 capture.

**Prerequisites:** P02/P03; D-07 selection; exact protocol/fence mapped before implementation.

**Allowed paths:** Workspace src/policy, guarded transport/session/project adapters; Knowledge authenticated adapters; tests; local configuration runbooks. Implementation paths outside current canonical allowance remain conditional on P02's coordinated scope amendment; this brief grants no authority to silently bypass it.

**Steps:** Prepare payload outside guard; validate current session/project/document and exact version inside guard through response finish or confirmed abort. Authenticate both service and forwarded actor; strip browser-supplied internal headers. Define single-active startup fencing and ambiguous restart behavior before claiming coverage.

**Acceptance assertions:** Revocation/removal/expiry order with handoff; aborted streams never resume; no recursive guarded callback; internal scoped policy reads complete while guard held; uncertain remote lifecycle outcome blocks affected handoffs. No provider or AI integration.

**Verification (Planned unless linked from the plan as executed):** Planned real TLS/service-auth tests, ten parallel internal reads, paused socket/revoke/abort, expiry/restart/fencing and deny-on-unknown negatives. Synthetic locks alone close no AC. Existing commands and future runner boundaries are in the plan; new runners must be wired before claiming execution.

**Result/handoff:** Save source identity, actual command/exit/assertions, original failures, unrun checks and remaining decisions under fresh feature evidence; link the result from plan.md. Confirm no unrelated files, accepted ADRs, applied migrations or old evidence changed. No independent approval is implied.
