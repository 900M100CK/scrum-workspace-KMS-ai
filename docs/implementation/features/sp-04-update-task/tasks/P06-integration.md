# SP04-P06 — integration

**Artifact ID:** SP04-P06\
**Version/date:** 0.3 Draft · 4 November 2026

Parent [FEAT-SP04-01](../plan.md) owns the only mutable status, exact source/FR/AC/UC/TC/PLAN-01 trace, acceptance outcome and path boundaries for this task. Read its matching row before execution. This future brief is not authorisation or an executed result from the current P01 request.

Prerequisites: Relevant P03/P04/P05 producers; assertions accompany them.

Before execution: refine this brief with the selected source versions, one small reviewable deliverable, exact allowed paths, assertions, commands/fixtures, evidence destinations and failure triage. Resolve material choices without treating Proposed sources or prior branch decisions as current adoption.

Acceptance/verification: satisfy the matching parent row with actual persisted/API/UI evidence where applicable. Use synthetic disposable fixtures, preserve historical schema ceilings and applied migrations, and retain failed attempts. Permission, revision, immutable history, atomic audit/replay and same-key unknown recovery remain binding. A fixture is not a missing actual producer.

Handoff: execute only registered checks after the written gate; save logs/source identity under ../evidence/ and update the parent table. List unrun/dependent checks. No cross-service writes, automatic retries, role bypass, agents, commits or independent approval are supplied by this file.


## Registered executable continuation

Owner full-continuation gate in [plan](../plan.md) supersedes the earlier placeholder. Producer suites include concurrent same-revision writes, duplicate keys, assignment/removal both orders, revocation/expiry, rollback of business/audit/outcome and unknown acknowledgement. Cross-producer assertions use actual Task handlers; completed Sprint fixtures are not P08. Paths: new tests/workspace/task-{state,assignment,blocker}.test.mjs. Commands: Node24 --test --test-concurrency=1 with named suites; npm run typecheck/build, context:lint/check/test, contracts:test, docs:lint/test as applicable. Capture all attempts separately under evidence/continuation. Synthetic disposable010 only. No applied SQL/schema/dependency/Knowledge changes; recover only scoped edits. Selected owner policies and parent trace apply. No independent approval.
