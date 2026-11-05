# Implement SP-05 Sprint lifecycle and full Backlog ordering

**Artifact ID:** SP05-PR-DRAFT-01\
**Version/date:** 0.2 Draft · 5 November 2026

Owner-authorised publication candidate under PUB01. Base: main; head: codex/sp-05. Actual URL/head/check state belong to the publication receipt after execution.

## Behavior

Implement Must create/read/allocate/start/complete Sprint and complete Product Backlog reorder, with five independent private capabilities, current-authority original-result replay and atomic audit/receipts. Add migration011 with nullable lifecycle observations and rollback evidence guards; preserve001–010. Allocation binds Sprint revision; reorder binds exact Backlog generation. Optional editSprint/removeAllocation remain excluded.

Connect the existing UI with sequential per-task allocation outcomes and exact persisted recovery identity, native lifecycle forms and full-list up/down order. Refresh current projections after mutation; distinguish old Completed/Returned associations from current Task location.

## Validation and review

[Owning plan](plan.md), [P00–P15 breakdown](breakdown.md), [AC/UC/TC evidence and limits](handoff.md). Real disposable PostgreSQL/HTTP/DOM session/project/Task/Sprint regression343/343; focused final concurrency17/17 and controller7/7; isolated trusted-HTTPS Edge1/1; root build/typecheck. Final context/docs/contracts/metadata/source preservation records: evidence/final-checks.json. Actual SP04 P08 races preserve old Completed history under reopen/new allocation.

Review authority-before-replay, Project/Sprint/Task locks and session-after-wait guards, immutable receipts and rollback refusal, numeric ordering and association/current-state separation. No production migration or CI/deployment/independent acceptance claimed. The original dirty S01/workflow work is outside this branch.

The PR includes SP05-AG01 for later Antigravity tracking/testing. Review the actual PR head, not the old hotfix checkout; old author source/result manifests remain historical snapshots. No Antigravity execution or merge is claimed.
