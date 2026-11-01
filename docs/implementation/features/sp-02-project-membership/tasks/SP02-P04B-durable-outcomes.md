# SP02-P04B — Persist compact immutable outcomes before public writes

**Artifact ID:** SP02-P04B\
**Version/date:** 0.2 Draft · 1 November 2026\
**Status:** Task brief; execution state in parent plan.\
**Inputs:** [FEAT-SP02-01](../plan.md) v0.6; SP-02 v0.5; Workspace v0.2.11; ADR-0019 v0.4 / ADR-0026 v0.3.\
**Trace:** SP-02.2; AC-02/03/38/39 as applicable; BR-01/10/11/14; PLAN-01 Month 1 / M-02/M-03.

## Outcome, scope and verification

After P04A, add separate migration 008 extending idempotency_record for createProject/addMember/removeMember only. Original schema-value snapshots, immutable committed identity/result/status, infinity retention, current-authority replay, same-key/different-payload conflict. Preserve protected_handoff semantics. Real forward/repeat/refused unsafe reverse, role, audit/receipt rollback and unknown-COMMIT tests. Never add these columns to 007. Command: Node 24 --test tests/workspace/project-authority.test.mjs.

Allowed paths: Workspace/web/test canonical scope and coordinated paths explicitly registered in parent plan. No new dependency, Knowledge writes, development upgrade or implicit commit. Record actual command/source/fixture identity and failures in the SP-02 execution report; schema results are not runtime authority evidence.
