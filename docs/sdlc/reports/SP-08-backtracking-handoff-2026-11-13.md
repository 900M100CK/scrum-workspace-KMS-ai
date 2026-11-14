# SP-08 regression backtracking handoff

**Artifact ID:** SP08-BACKTRACK-01\
**Version/date:** 0.1 Draft · 13 November 2026\
**Status:** Historical result and regression guide.\
**Inputs:** [SP-08](../../../specs/008-linked-keyword-search.md), [FEAT-SP08-01 v0.2](../../implementation/features/sp-08-linked-keyword-search/plan.md), [SP08-WBS-01](../../implementation/features/sp-08-linked-keyword-search/breakdown.md), [Workspace discovery runbook](../../../services/workspace/DISCOVERY.md), [SP-07 breakdown](../../implementation/features/sp-07-version-publication/breakdown.md).

SP-08 merged as **723e443** through PR #6. Its SP-07 safety prerequisite merged as **0ab2854** through PR #5. The [SP-08 plan](../../implementation/features/sp-08-linked-keyword-search/plan.md#local-handoff) records the original 3/3 runtime and Edge result. The [SP-09 handoff](SP-09-fixture-handoff-2026-11-13.md) records the later 82-check SP-06–SP-08 regression. The documentation correction reused that evidence.

| Symptom | First check | Owner and verification |
| --- | --- | --- |
| Link missing from one end, duplicate after retry or missing audit | Compare endpoint kind/project/read access, then the Knowledge link transaction and original idempotency key. | SP08-P02. Run the link replay and forced-audit rollback scenarios. [Knowledge discovery](../../../services/knowledge/src/documents/discovery.ts) |
| A restricted source appears or a revoked reader still gets output | Compare Workspace policy and pending lifecycle state at final handoff. Reproduce with two actors and the pause/revoke case. | SP08-P01/P03. [Workspace discovery](../../../services/workspace/src/documents/discovery.ts) and [delivery](../../../services/workspace/src/documents/delivery.ts) |
| Current/History is wrong or a search page repeats | Reissue the same scope and check exact version state before checking signed cursor scope and snapshot generation. | SP08-P03. Compare the keyword scenario with the [SP-07 history suite](../../../tests/integration/document-history-reads.test.mjs). If the exact read also fails, use [SP-07 P05/P07](../../implementation/features/sp-07-version-publication/breakdown.md). |
| Search fails while Task works | Check the Knowledge TLS/auth dependency first. A provider outage alone should leave keyword Search and Task available. | SP08-P01/P03. Run the isolated dependency failure scenarios. |
| HTTP is correct while the web shows stale data | Compare project switch, request cancellation and source selection using the same actor and scope. | SP08-P04. [React discovery](../../../apps/web/src/KnowledgeDiscovery.tsx) and Edge runtime scenario. |

Run the [SP-08 runtime suite](../../../tests/workspace/sp08-runtime.test.mjs) with Node 24, disposable PostgreSQL, trusted TLS and the Edge module from the discovery runbook.

```
node --test tests/workspace/sp08-runtime.test.mjs
```

For a new failure, record the revision, actor/project scope, scenario, expected and actual status, and the first failing boundary. Compare against the merged baseline in an isolated checkout when ancestry matters. Route an exact-version, supersede or lifecycle failure to the existing SP-07 breakdown. Route an Ask-only failure to the SP-09 handoff.
