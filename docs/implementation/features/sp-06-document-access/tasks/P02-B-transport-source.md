# SP06-P02-B — Align selected B03 transport sources and verification trace

**Artifact ID:** SP06-P02-B\
**Version/date:** 0.1 Draft · 10 November 2026
**Inputs:** [FEAT-SP06-01](../plan.md) v0.4; SP06-DECISION-BATCH-01 v0.4; SP06-P01-B v0.2; SP-06 v0.6.4; PRD-01 v0.10.3; B03 owner receipt; Proposed ADR-0033 v0.1.\
**Trace:** FR/AC-04/10/14/50/51/52, supporting31/39/59/68; BR-01/04/10/11/14; SC-06; SP-06.1 / PLAN-01 Month2 / M-04.\
**Owner role:** Sequential implementer; state only in parent plan.

**Prerequisites:** Verified P01-B handoff and B03 owner receipt.

**Allowed paths:** Owning feature decision/task/receipt/handoff and registration metadata. P02-B additionally allows the exact B03-only canonical/spec/pack/ADR amendments named in its steps: specs/006-document-access.md; docs/implementation/tasks/06-document-access.md; docs/adr/0033-guarded-transport-boundary.md; docs/adr/README.md; and parent register metadata. No accepted ADR, BRD pointer, application code, migration or prior evidence rewrite.

**Steps:**
1. Align selected B03 clauses across canonical SP06, pack and Proposed ADR-0033.
2. Formulate the exact project-scoped reader-writer guard protocol:
   - Shared read lock for protected document delivery.
   - Exclusive write lock for membership removal, revocation and document authority changes.
   - Writer preference to prevent starvation of revocation under continuous delivery streams.
   - Active socket destruction on revocation with bounded close deadline; report `revoked` only on confirmed socket close, `unknown` on deadline expiry.
   - Delivery re-checks the revoked flag before acquiring shared delivery.
   - In-memory guard lost on restart: startup fencing generation prevents premature delivery before generation is established.
   - Service authentication: rotated server-side `X-Service-Key` compared in constant time + server-forwarded `X-Actor-Session` over trusted TLS. Strip client-supplied internal headers at the gateway.
   - No automatic multi-authority failover.
3. Record explicit future P05 implementation paths (`services/workspace/src/policy/guard.ts`, `services/workspace/src/transport/service-auth.ts`, `tests/workspace/transport-guard.test.mjs`) without editing code in this step.
4. Define planned concurrency, socket-destruction, fencing and denial tests.

**Acceptance:** No application/runtime/schema/dependency edit, new public endpoint, global role bypass or B02 projection adoption; no premature future-runner execution. Exact dependent source versions/trace and structural checks pass before P05 runtime work.

**Planned verification:** Node24 context lint/check/test, contracts tests, docs lint/tests, metadata/diff, local links, scope/source/index preservation. Review of evidence is not runtime authority/transport proof. Preserve original failures in fresh evidence; do not overwrite prior planning logs.

**Handoff:** Record actual outcomes and remaining gates in a source-bound result (`p02b-result.md`) linked from plan.md; no commit/push, agents or independent self-approval.
