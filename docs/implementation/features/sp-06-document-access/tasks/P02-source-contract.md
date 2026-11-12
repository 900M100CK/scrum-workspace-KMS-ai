# SP06-P02 — Align canonical scope, contracts and verification trace

**Artifact ID:** SP06-P02\
**Version/date:** 0.2 Draft · 7 November 2026
**Inputs:** [Owning FEAT-SP06-01](../plan.md) v0.2 and its frozen source manifest; SP-06 v0.6.3; IMPL-SP-06 v0.1; PRD-01 v0.10.3.\
**Trace:** FR/AC-04/10/14/50/51/52 with supporting31/39/59/68; BR-01/04/10/11/14; SC-06.\
**Owner role:** Sequential implementer; current status only in the owning plan.

**Parent:** PLAN-01 Month 2 / M-04; SP-06.1 (P00–P02), SP-06.2 (P03–P08), SP-06.3 (P09–P11), SP-06.4 (P12–P14); co-delivered SP-11.1 capture.

**Prerequisites:** P01 selected clauses; no runtime implementation before alignment.

**Allowed paths:** specs/006-document-access.md; docs/implementation/tasks/06-document-access.md; contracts/**; directly dependent API/data/test/UX/spec/register docs; package scripts. Implementation paths outside current canonical allowance remain conditional on P02's coordinated scope amendment; this brief grants no authority to silently bypass it.

**Steps:** Resolve actual src/policy and gateway/guard paths; declare auth forwarding, exact error/receipt/replay behavior, unsupported operation handling and cross-service trust. Adopt bounded source changes under the recorded selection.

**Acceptance assertions:** Keep declared operation ownership; no new activation route, copied permission rules or SP07 lifecycle/optional metadata commands. Preserve independent read and command authority.

**Verification (Planned unless linked from the plan as executed):** Existing context/contracts/docs checks; negative consumer/provider assertions designed here and executed with their handlers. Existing commands and future runner boundaries are in the plan; new runners must be wired before claiming execution.

**Result/handoff:** Save source identity, actual command/exit/assertions, original failures, unrun checks and remaining decisions under fresh feature evidence; link the result from plan.md. Confirm no unrelated files, accepted ADRs, applied migrations or old evidence changed. No independent approval is implied.

## Incremental continuation

Execute decision-specific increments. P02-A may align only selected B01 provisioning sources, canonical private-authority paths and test trace after P01-A; it requires no B02/B03 adoption. Later increments must register exact scope before execution. Do not alter inter-service auth, creation replay response or projection mechanics before the relevant selection.
