# SP04-P03D2 — State transitions and completed-Sprint reopen

**Artifact ID:** SP04-P03D2\
**Version/date:** 0.1 Draft · 4 November 2026

Parent/status: [plan](../plan.md), owner full-continuation gate. PLAN-01 Month1 / M-02–M-03 / SP-04.2; FR-09/43, AC-09/43, supporting FR-03/31/59/68, BR-01/02/03/10/11/14, UC-04, TC-07/08/14/16/18/19/22. Inputs: SP-04 v0.7.3; decision-batch0.4; selected owner decisions0.1; Workspace0.2.13; ProposedADR0028; current010 foundations. No new policy.

Prerequisite: completed P03B/C/D1; P03D2 executes sequentially. One outcome: State transitions and completed-Sprint reopen. Write only services/workspace/src/tasks/{store,http,types}.ts, tests/workspace/task-state.test.mjs, production discovery expectations, owning feature evidence/plan and registered navigation. No migrations/wire/dependency/old evidence changes.

Assertions: All nine transitions; stale and duplicate keys; no-op audit; both completed reopen targets with exact Backlog position/generation and retained allocation; current permission replay denial; overflow; audit/outcome rollback; post-wait expiry. Each actual mutation/audit/original200 co-commits under current session/member/action. Replay precedes live preconditions. Exact lock/guard and no-op semantics are in decision-batch sections3/5/6. No actual SP-05 producer claimed from fixtures.

Commands: Node24 node --test --test-concurrency=1 tests/workspace/task-state.test.mjs, Workspace typecheck and combined Task regression at P07. Synthetic disposable010 only; logs/exits/source identities in evidence/continuation. Keep failures, correct in scope and rerun. DoD requires actual persisted handler assertions and parent result. Recovery reverses only these changes; no valuable-data migration, automatic extra scope or independent approval. Estimate: one bounded producer; confidence depends on actual regression. Handoff next registered slice.
