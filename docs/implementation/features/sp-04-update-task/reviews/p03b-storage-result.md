# SP-04 P03B — additive mutation storage result

**Artifact ID:** SP04-P03B-RESULT\
**Version/date:** 0.1 Draft · 4 November 2026\
**Status:** Bounded storage/types producer verified on disposable PostgreSQL; no Task mutation HTTP/UI, deployment or independent acceptance.\
**Author:** Codex, sequential implementer and author self-check.\
**Inputs:** [FEAT-SP04-01](../plan.md) v0.11; [SP04-P03B](../tasks/P03B-mutation-storage.md) v0.1; P03A2 result v0.1; [ADR-0028 Proposed](../../../../adr/0028-task-mutation-authority-and-outcomes.md) v0.1; owner record v0.1; Workspace0.2.13/logical0.13; actual source hashes in [baseline](../evidence/p03b/source-inputs.json).\
**Trace:** SP-04.2 / FR-09/40/43/44; supporting FR-03/31/59/68; BR-01/02/03/06/10/11/14; UC-03 edit/UC-04 recovery; TC-07/08/13/14/18/19; PLAN-01 Month1 / M-02–M-03.

## Result and purpose

New010-task-mutations up/down extends permanent typed original outcomes with editTask/setTaskState/setAssignee200 Task and recordBlocker201 Blocker. Total validators reject missing/extra/wrong/SQL-null/JSON-null fields, malformed IDs/date/location, wrong status/identity/hash/expiry and unsafe revision/sequence. Task originals preserve title/description and exact location/origin; Blocker UTC snapshots support actual0–6 fractional precision without imposing a three-digit event-time rule. Physical blocker history now also rejects unsafe sequence and nonfinite server time. Existing009 create/project/member/protected branches remain intact.

Four project-scoped Task actions have private issue/revival guards, current grant uniqueness, scoped identity and safe revision checks. Runtime may invalidate a currently valid selected grant with the next revision; it cannot insert even an invalid selected grant, revive it or rewrite its identity/action to escape the guard. Actual existing member removal clears current assignee and all selected valid grants; rejoin revives none. Private provisioning CLI and allowed-action discovery are still P03C, not implemented here.

New internal mutation-outcomes adapter binds caller actor/operation/key/hash plus Task/project/event identities, retaining original snapshots independently of current revision/state/assignee. Its caller must perform current session/read/action checks with the same-client lock protocol before any replay disclosure. This storage adapter does not implement an end-user permission check. Receipt acknowledgement is historical; current Task state remains a separate read.

Up refuses ambiguous selected legacy identities/grants/audits/events beforeDDL while retaining seeded records. Down refuses new outcomes/grants (even invalidated), authority/business audit and history, without purging evidence. Compatible reverse restores exact009 constraints on the affected tables and original outcome function; new helpers/index/guards are removed. Existing SP-03 Task/create-result/author data survives compatible reverse and reapply. No development database upgrade/rollback was run;001–009 SQL bytes are unchanged.

## Changed implementation paths

- services/workspace/migrations/010-task-mutations.up.sql and .down.sql
- services/workspace/src/tasks/types.ts; new tasks/mutation-outcomes.ts
- tests/workspace/task-mutation-fixture.mjs and task-mutation-storage.test.mjs
- services/workspace/TASKS.md v0.2; owning feature/status/registration/REG metadata

Original create outcome adapter, handlers, project/member/session code, UI, wire/logical contracts, old tests/fixtures, old migrations, baseline and existing ADRs are unchanged. No dependency or root npm alias is added. Historical fixture ceilings006/008/009 are preserved; the new fixture explicitly opts into009/010. Startup never migrates.

## Actual verification

Environment: Node24.21.0, Docker29.3.1, pinned pgvector0.8.2-pg17 image/digest and actual PostgreSQL17.10. Final new fixture identity/image/version appears in storage-final.log; generated credentials never enter logs. Container sp01-p08-test-cf0cb8d4c954 and its exact matching volume are absent after cleanup (read-only exact-name inspections logged). Existing valuable resources were not reset.

| Check | Actual result | Evidence |
| --- | --- | --- |
| New010 disposable storage suite | 13/13,0 failed/skipped | storage-final.log |
| Historical009 storage regression | 8/8,0 failed/skipped | storage-009-regression.log |
| Workspace typecheck | Exit0 | typecheck-final.log |
| Context syntax/check/test | Exit0;45/45 tests | context-*.log |
| Contract schema suite | 27/27 | contracts-test.log |
| Docs metadata sync/check/lint/test | Exit0;20/20 tests | metadata-*.log;docs-*.log |

The new suite verifies exact affected009 reverse definitions and checksum preservation; each independent legacy/refusal class; strict valid/invalid receipts and all location branches; immutable identity/update/delete/operation transitions; real runtime/owner role restrictions and member removal/rejoin; original receipt acknowledgement after removal/live changes; atomic Task/event/audit/outcome rollback; and actual COMMIT followed by injected lost acknowledgement, with durable same-key recovery after later live state. These are storage/adapter observations, not new mutation handler or HTTP/socket boundary proof.

[Execution manifest](../evidence/p03b/executions.json) preserves exact commands/exits and failed attempts. First two fixture attempts failed before SQL because Docker was unavailable. The first real run exposed new010 function-body line endings during exact reverse comparison; the next exposed a missing synthetic membership. New010 source/setup were corrected without editing old migrations, weakening FK/guard checks or changing expected results. All original logs remain. Strengthened final assertions were rerun on a fresh disposable fixture. [Final checks](../evidence/p03b/checks.json) capture hashes, scope, whitespace/local links and cleanup.

## Remaining gates and handoff

P03B bounded storage foundation is complete after final source/docs gates. Next P03C must receive its exact brief for private selected-action provisioning/audit and scoped action discovery. Edit/state/assignment and blocker/history handlers, current action replay enforcement, actual disabled-target validation, new mutation HTTP/UI/browser/concurrency, full relevant regressions and actual SP-05 completion/allocation integration remain unrun/unimplemented. Existing mutation/storage tests do not close D-07, formal Proposed ADR adoption, release or independent acceptance. No commit, push, deployment, valuable-data migration, chart/load-balancing/AI or new agent action.
