# SP02-P04A — Freeze exact contract and paging mechanics

**Artifact ID:** SP02-P04A\
**Version/date:** 0.2 Draft · 1 November 2026\
**Status:** Task brief; execution state in parent plan.\
**Inputs:** [FEAT-SP02-01](../plan.md) v0.6; SP-02 v0.5; Workspace v0.2.11; ADR-0019 v0.4 / ADR-0026 v0.3.\
**Trace:** SP-02.2; AC-02/03/38/39 as applicable; BR-01/10/11/14; PLAN-01 Month 1 / M-02/M-03.

## Outcome, scope and verification

Record listProjects 400/409 and runtime 413/415 if used; preserve schemas and current authority. Select per-endpoint HMAC digest over canonical ordered authorised projection plus actor membership/permission generations, avoiding new counters; compute and compare under the same authority/transaction boundary. Configure one kid/key; key rotation invalidates old cursor with 400, expiry/current-dataset mismatch 409, missing server key 503. No session binding. Register shared contract/spec/API changes before implementation. Verify contracts/context checks.

Allowed paths: Workspace/web/test canonical scope and coordinated paths explicitly registered in parent plan. No new dependency, Knowledge writes, development upgrade or implicit commit. Record actual command/source/fixture identity and failures in the SP-02 execution report; schema results are not runtime authority evidence.
