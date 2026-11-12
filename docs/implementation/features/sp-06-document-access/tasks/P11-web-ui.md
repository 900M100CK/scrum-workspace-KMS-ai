# SP06-P11 — Connect existing-design document and known-ID access flows

**Artifact ID:** SP06-P11\
**Version/date:** 0.1 Draft · 7 November 2026
**Inputs:** [Owning FEAT-SP06-01](../plan.md) v0.1 and its frozen source manifest; SP-06 v0.6.3; IMPL-SP-06 v0.1; PRD-01 v0.10.3.\
**Trace:** FR/AC-04/10/14/50/51/52 with supporting31/39/59/68; BR-01/04/10/11/14; SC-06.\
**Owner role:** Sequential implementer; current status only in the owning plan.

**Parent:** PLAN-01 Month 2 / M-04; SP-06.1 (P00–P02), SP-06.2 (P03–P08), SP-06.3 (P09–P11), SP-06.4 (P12–P14); co-delivered SP-11.1 capture.

**Prerequisites:** P08/P09/P10.

**Allowed paths:** apps/web document client/controller/components and existing routes; tests. Implementation paths outside current canonical allowance remain conditional on P02's coordinated scope amendment; this brief grants no authority to silently bypass it.

**Steps:** Preserve current visual conventions. Add classified text/Markdown creation, readable explorer/detail, known-ID access management and safe recovery. Use current server actions; maintain content-independent manage route. Clear protected state on denial, scope/session change or failure.

**Acceptance assertions:** Keyboard/focus/validation; no Draft/publish, import or metadata edit; fresh reload reconstructs permitted state; original receipt differs from fresh read; no hidden title prefill for managers.

**Verification (Planned unless linked from the plan as executed):** Planned controller tests and real HTTPS/DOM tests; denied controls bypass still rejected by server; unknown acknowledgement reload and stale-conflict behavior. Existing commands and future runner boundaries are in the plan; new runners must be wired before claiming execution.

**Result/handoff:** Save source identity, actual command/exit/assertions, original failures, unrun checks and remaining decisions under fresh feature evidence; link the result from plan.md. Confirm no unrelated files, accepted ADRs, applied migrations or old evidence changed. No independent approval is implied.
