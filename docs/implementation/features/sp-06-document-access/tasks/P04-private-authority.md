# SP06-P04 — Provision project create authority without role bypass

**Artifact ID:** SP06-P04\
**Version/date:** 0.4 Verified · 9 November 2026
**Inputs:** Proposed ADR-0032 v0.1; SP-06 v0.6.4; IMPL-SP-06 v0.2;  [Owning FEAT-SP06-01](../plan.md) v0.3 and its frozen source manifest; SP-06 v0.6.4; IMPL-SP-06 v0.2; PRD-01 v0.10.3.\
**Trace:** FR/AC-04/10/14/50/51/52 with supporting31/39/59/68; BR-01/04/10/11/14; SC-06.\
**Owner role:** Sequential implementer; current status only in the owning plan.

**Parent:** PLAN-01 Month 2 / M-04; SP-06.1 (P00–P02), SP-06.2 (P03–P08), SP-06.3 (P09–P11), SP-06.4 (P12–P14); co-delivered SP-11.1 capture.

**Prerequisites:** verified P02-A and P03-A; explicit B01 selection. B02/B03 do not gate this private authority-only task.

**Allowed paths:** Workspace policy/authority and private operator integration; tests; provisioning guide. Implementation paths outside current canonical allowance remain conditional on P02's coordinated scope amendment; this brief grants no authority to silently bypass it.

**Steps:** Extend the existing private audited operator for explicit project knowledge-author only; initial document content-write/manage-access/lifecycle and restricted-author read are creation-time grants under ADR-0007. No general non-read delegation UI.

**Acceptance assertions:** Current enabled membership; grant/revoke CAS and provenance; removal invalidates all individual grants; rejoin restores none; no Admin/creator/read implication.

**Verification:** [P04 runtime evidence](../evidence/p04-20261109/results.json) records the disposable PostgreSQL operator/CLI run: 6/6 assertions passed, including denied unknown/disabled/non-member/cross-project targets, CAS/provenance, audit rollback and removal/rejoin invalidation. P03-A storage regression also passed in the same run. Structural and type checks are recorded in the owning plan.

**Result/handoff:** Save source identity, actual command/exit/assertions, original failures, unrun checks and remaining decisions under fresh feature evidence; link the result from plan.md. Confirm no unrelated files, accepted ADRs, applied migrations or old evidence changed. No independent approval is implied.

## Incremental continuation

B01 direction is selected in the exact owner receipt. P04 still requires B01 source/path alignment and its owned storage prerequisites; P01-A is no evidence that the operator now accepts knowledge-author. Preserve separation of runtime permission proof from structural/decision evidence.

## Verified continuation — 9 November 2026

The existing private project operator now accepts only the explicitly bounded `knowledge-author` capability in addition to its prior allowlist. It requires exact issuance provenance for both grant and revoke paths, records the grant identifier as the audit event for creation, and preserves CAS, current-membership and enabled-account checks. No role, administrator, read, write or management implication was added; no B02/B03 decision was adopted.
