# SP06-P02-A — Align selected B01 sources without adopting B02/B03

**Artifact ID:** SP06-P02-A\
**Version/date:** 0.2 Draft · 7 November 2026
**Inputs:** [FEAT-SP06-01](../plan.md) v0.3; SP06-DECISION-BATCH-01 v0.3; SP-06 v0.6.4; PRD-01 v0.10.3; original source snapshot and B01 receipt.\; Proposed ADR-0032 v0.1
**Trace:** FR/AC-10, supporting04/31/39/59/68; BR-01/04/10/11/14; SC-06; SP-06.1 / PLAN-01 Month2 / M-04.\
**Owner role:** Sequential implementer; state only in parent plan.

**Prerequisites:** Verified P01-A handoff.

**Allowed paths:** Owning feature decision/task/receipt/handoff and registration metadata. P02-A additionally allows the exact B01-only canonical/spec/pack/test-source amendments named in its steps; runtime paths require their explicit canonical amendment first. No accepted ADR, BRD pointer, application, applied migration or prior evidence rewrite.

**Steps:** Amend only B01 portions of canonical SP06/pack and their directly dependent authority/provisioning/test/register sources. Correct private-authority src/project operator and future owned migration/test/runbook paths explicitly before runtime edits. Define planned create-only action tests using existing audited operator conventions; preserve operation count and all unselected contract behavior.

**Acceptance:** No app/runtime/schema/dependency edit, new endpoint, global default or role mapping; no premature future-runner wiring. Exact dependent source versions/trace and normal structural checks pass before P04 storage/producer work.

**Planned verification:** Node24 context lint/check/test, contracts tests, docs lint/tests, metadata/diff, local links, scope/source/index preservation. Review of evidence is not runtime authority/transport proof. Preserve original failures in fresh evidence; do not overwrite prior planning logs.

**Handoff:** Record actual outcomes and remaining gates in a source-bound result linked only from the plan; no commit/push, agents or independent self-approval.
