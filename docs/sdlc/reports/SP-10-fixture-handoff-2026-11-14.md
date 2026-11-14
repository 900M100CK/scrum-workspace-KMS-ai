# SP-10 current work fixture handoff

**Artifact ID:** SP10-FIXTURE-RESULT-01\
**Version/date:** 0.1 Draft · 14 November 2026

[Plan and task state](../../implementation/features/sp-10-current-work-question/plan.md) · [Breakdown](../../implementation/features/sp-10-current-work-question/breakdown.md) · [SP-10](../../../specs/010-current-work-question.md)

## Source and reproduction

Branch codex/sp-10-current-work-question, based on fb5644f (merged SP-09). The implementation commit contains this report. Runtime evidence was collected in its source worktree before commit. The disposable suite uses Node 24.21.0, PostgreSQL 17, the standard Workspace and Knowledge entry points, a trusted local certificate and an HTTP fixture provider on loopback.

Run the [SP-10 integration suite](../../../tests/workspace/sp10-runtime.test.mjs) with the [SP-09 runtime environment](../../implementation/features/sp-09-cited-question/README.md). Set SACW_TEST_EVIDENCE_DIR to a fresh directory for screenshots. Run:

```
node --test tests/workspace/sp10-runtime.test.mjs
```

## Demonstration and backtracking

1. Open Ask in the synthetic project. Choose Current work and the resolved Task. Ask “Is this task blocked?” and open the operational citation. The original observation is Resolved. A document-only path remains available in the same Ask interface.
2. In the mixed fixture scenario, the old document says the Task was blocked. The current fact is Resolved and the document claim is labeled historical. The run has two independently prepared handoffs, each binding all evidence.
3. Use the refresh control after changing the Task. Verify the current panel changes while the original observation remains. Reload to see the unavailable original observation message.
4. Reproduce the before-send barriers for a changed uncited Task and a newly blocked Task. The provider receives zero requests when provider input is blocked. An already-generated answer is replaced by the exact withholding response when browser delivery is blocked.

For blocker truth or event sequence, start with [SP-04](../../implementation/features/sp-04-update-task/plan.md). For Task location and Sprint completion, start with [SP-05](../../implementation/features/sp-05-sprint-lifecycle/plan.md). For byte binding, claim and quarantine, start with the [SP-09 fixture handoff](SP-09-fixture-handoff-2026-11-13.md).

## Verification and limits

- SP-10 runtime: 3/3 with Edge at 1280 px and 390 px. Checks include both handoff boundaries, mixed provenance, project/Sprint/Task scope, empty results, denied and foreign scope, observation dependency failure, and separate historical/current displays.
- Regression: 107/107 across SP-04 blocker, SP-05 Sprint, SP-08 and SP-09. The focused post-change regression passed 27/27, covering the blocker and Sprint HTTP suites plus the SP-08 and SP-09 runtime suites.
- Structural gates: typecheck, build, foundation, context lint/check/test, docs lint/test, contracts and Git whitespace checks all passed. Foundation has one opt-in check skipped.
- The fixture admits at most 32 Task snapshots per Ask and returns an explicit failure above the limit. It sends the operational status, locator and revision to the loopback provider. The full committed projection binds freshness through the digest. The scoped HTTP observation operations return existing Workspace projections.
- Provider acceptance and the two SP-09 transport gaps remain separate. SP-12 and SP-13 have separate acceptance. The fixture uses existing migrations and one Workspace gateway.
