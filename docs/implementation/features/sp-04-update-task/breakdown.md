# SP-04 deliverable dictionary

**Artifact ID:** SP04-WBS-01\
**Version/date:** 0.3 Draft · 3 November 2026

The [plan](plan.md) is the sole mutable status record. Scope/trace/paths/acceptance are inherited from it; this dictionary introduces no product requirement or execution authority.

- SP-04.1: P01 source reconciliation, then P02 bounded authority/storage/transaction design.
- SP-04.2: P03 command producers, refined into small executable slices before code.
- SP-04.3: P04 blocker append/read and P05 connected UI.
- SP-04.4: P06 producer-linked negatives/concurrency, P07 integrated evidence/handoff and P08 actual SP-05 producer integration.
- SP-11.1 capture accompanies every mutation producer; it is not deferred to P07.
- Optional charts, estimation and load balancing are outside this breakdown. P01's audit inspection is a gap assessment only.

No effort/date estimate is supplied before the current source and material design choices are reconciled. Older worktree plans/evidence are historical and are not merged by this dictionary.

P03D1 narrows SP-04.2 to existing editTask HTTP/store plus independent authority, immutable recovery/no-op and rollback/concurrency verification. P03A/A2/B/C are prerequisites. State/assignment/blocker/history/UI stay separate; [plan](plan.md) owns status.
