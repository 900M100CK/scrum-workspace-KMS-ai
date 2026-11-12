# SP06-P03-A — Private document-create authority storage

**Artifact ID:** SP06-P03-A\
**Version/date:** 0.1 Draft · 7 November 2026
**Inputs:** FEAT-SP06-01 v0.3; SP-06 v0.6.4; IMPL-SP-06 v0.2; Proposed ADR-0032 v0.1; exact selected B01 receipt.\
**Trace:** FR/AC-10 and supporting04/31/39/59/68; BR-01/04/10/11/14; SC-06; SP-06.2 / PLAN-01 Month2 / M-04.\
**Owner role:** Sequential implementer; status only in plan.md.

**Prerequisite:** Verified P02-A. No B02/B03 dependency; this task does not implement document creation or transport.

**Allowed paths:** The two reserved014-document-create-authority migration files; tests/workspace/document-authority-storage.test.mjs and document-authority-fixture.mjs; minimal existing fixture helper change only if required to request explicit014 without changing any old default ceiling; directly needed real test command wiring when files exist; owning evidence/result and storage runbook notes. No Knowledge/schema receipt, public app/contract or old migration edits.

**Steps:** Follow ADR-0032 exact014 audit-action extension, scope/safe revision/one-current-grant constraint, runtime insert/update/delete protection and exact issuance boolean predicate. Preserve all previous actions/private audit access; no permission copy. Add evidence-preserving down refusal and empty up/down/repeat. Build uniquely named disposable014 fixture, retain old suite ceilings, inventory resources before/after and keep keys/private credentials out of logs. If Docker is unavailable, keep authored checks Not run; never use structural success as storage/permission proof or migrate valuable data to test.

**Acceptance/tests:** Real workspace_app may only invalidate an exact existing valid create grant with revision+1; cannot insert/retarget/revalidate/delete or change another action into/out of it. Exact valid issuance returns true; forged/mismatched/revoked/wrong scope returns false. PUBLIC/Knowledge roles do not execute the helper; runtime does not SELECT private audit. Reject wrong scope, oversized revision, duplicate valid grant. Old capability actions survive up/down/repeat. Down refuses any retained knowledge-author grant/audit evidence without deleting it. Preserve immutable001–013 and prior captures. Include private-audit privilege test and both before/after action transitions, not just an allowlist shape test.

**Verification:** Planned actual Node24 disposable PostgreSQL014 storage tests plus relevant prior-ceiling storage regression and current structural/typecheck checks if adapters change. Record exact commands/source/config/exit/assertions and failures; no pass/independent acceptance until executed. No automatic commit/push, production upgrade, container deletion outside the test's own newly created resources or new dependency.

**Handoff:** Source-bound P03-A result for P04 private operator integration; later document producer/session/transport proof remains separate.
