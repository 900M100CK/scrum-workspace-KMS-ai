# SP05-P13 — Full-list up/down ordering; stale restart; no partial-list write

**Artifact ID:** SP05-P13\
**Version/date:** 0.1 Draft · 5 November 2026

Parent [FEAT-SP05-01](../plan.md) owns mutable status, source versions, exact allowed support/runtime paths, trace and boundaries. Dependencies: P10/P11. Trace: FR-06/07/08/41/42 and FR-31; BR-01/02/03/06/10/11/14; SC-03/04/06; UC-05 and SP04-P08; TC-07/13/14/16/18/19/21/22; canonical child SP-05.3.

One outcome and acceptance: Full-list up/down ordering; stale restart; no partial-list write. Inspect existing patterns before edits; preserve old ceilings/evidence and selected rights. Producer tests accompany the producer and include current permission, stale input, replay/hash, audit/result faults and post-wait session denial as applicable. Exact planned commands and fixtures are in the parent; output goes to ../evidence/ and actual result/handoff to ../handoff.md. Expected authority/dependency failure denies; no speculative new features, cross-service writes, schema-history edits, agents, commit/push or independent approval. DoR: dependencies and source alignment satisfied. DoD: actual outcome plus meaningful positive/negative checks and honest remaining gaps. Effort is relative M, confidence medium pending implementation; no calendar commitment. Recovery: revert only task-authored uncommitted files or tested empty disposable011, never valuable data/user work.
