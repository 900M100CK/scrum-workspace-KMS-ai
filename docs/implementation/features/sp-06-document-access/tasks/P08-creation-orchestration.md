# SP06-P08 — Deliver public Workspace-first creation and exact-key recovery

**Artifact ID:** SP06-P08\
**Version/date:** 0.1 Draft · 7 November 2026
**Inputs:** [Owning FEAT-SP06-01](../plan.md) v0.1 and its frozen source manifest; SP-06 v0.6.3; IMPL-SP-06 v0.1; PRD-01 v0.10.3.\
**Trace:** FR/AC-04/10/14/50/51/52 with supporting31/39/59/68; BR-01/04/10/11/14; SC-06.\
**Owner role:** Sequential implementer; current status only in the owning plan.

**Parent:** PLAN-01 Month 2 / M-04; SP-06.1 (P00–P02), SP-06.2 (P03–P08), SP-06.3 (P09–P11), SP-06.4 (P12–P14); co-delivered SP-11.1 capture.

**Prerequisites:** P06/P07.

**Allowed paths:** Workspace gateway; Knowledge public create integration; web transport/recovery; tests. Implementation paths outside current canonical allowance remain conditional on P02's coordinated scope amendment; this brief grants no authority to silently bypass it.

**Steps:** Route declared createDocument through Workspace gateway using existing session identity. Reconcile registration then content persistence under the original identity and payload; return only declared committed/pending outcome. Revalidate any content-bearing receipt independently.

**Acceptance assertions:** Lost response/timeout is unknown; no automatic fresh key, duplicate identity or unsafe orphan cleanup. Policy-only orphan and unknown source have identical protected reads; no activation step.

**Verification (Planned unless linked from the plan as executed):** Planned two-service HTTP tests: crash between commits, delayed commit, reconnect/same-key replay, changed payload, access revoked before replay and authority/Knowledge outage. Existing commands and future runner boundaries are in the plan; new runners must be wired before claiming execution.

**Result/handoff:** Save source identity, actual command/exit/assertions, original failures, unrun checks and remaining decisions under fresh feature evidence; link the result from plan.md. Confirm no unrelated files, accepted ADRs, applied migrations or old evidence changed. No independent approval is implied.
