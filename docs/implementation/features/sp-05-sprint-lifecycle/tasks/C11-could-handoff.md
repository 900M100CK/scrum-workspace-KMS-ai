# SP05-C11 — Consolidate regression, trace and independent-review handoff

**Artifact ID:** SP05-C11\
**Version/date:** 0.1 Draft · 5 November 2026

Parent [FEAT-SP05-01](../plan.md) owns the only mutable execution status. Source versions and owner choices: [Could decisions](../could-decisions.md). Parent roadmap: PLAN-01 Month 2 / M-03; canonical SP-05 / SP-05.1–05.4. Trace: FR/AC-66/67/31; PLAN-01 Month 2 / M-03 technical trace; BR-01/02/03/10/11/14; SC-03/04/06.

## Prerequisites and allowed paths

Dependencies: C10. Definition of ready: dependencies have their required evidence and source support is aligned before changing a producer. Allowed paths: Owning feature dossier and registration metadata; test-plan/coverage/verification result navigation; reviewer assignment and local PR preparation text. No runtime fixes or publication implicit in this task. No other service writes, applied migration edits, accepted ADR changes, dependency additions or unrelated cleanup.

## Deliverable and steps

Resolve and record the full current Workspace test-file list; run all relevant suites, structural checks, typecheck/build/foundation/prototype, and final preflight. Map AC-66/67/31 to actual assertions/evidence; provide a separate Antigravity follow-up brief pinned to final source.

## Acceptance assertions

No skipped/unrun gate is labelled passed; original Must/AG01 evidence remains immutable and applies only to its original source. Record author versus independent execution separately. Review-ready requires producer/UI/race gates and regression success; M03/release owner acceptance stays separate.

Producer tests ship with their producer; C09 consolidates races rather than postponing permission/revision/replay/rollback coverage.

## Verification and handoff

Planned checks: Full enumerated Workspace regression plus separate browser; context/docs/contracts/metadata, typecheck/build/foundation/prototype and git diff --check. Use explicit Node 24+, disposable PostgreSQL and existing local TLS/browser setup where required; never migrate valuable data. New fixtures explicitly select 012; keep historical 006/008/009/010/011 ceilings.

Record actual argv, versions, source identity, exit codes and raw logs under a fresh ../evidence/could-<run-id>/; report results through the parent plan and eventual Could handoff. These checks are planned, not executed by this brief. Never substitute structural checks or author execution for independent runtime verification.

Recovery: preserve user work and immutable evidence; revert only task-authored changes or use the tested empty disposable rollback. On a failing assertion, retain the failure and leave the task open. No commit/push/merge, reviewer dispatch or owner acceptance is granted by this brief. Effort: relative M, medium confidence; no calendar promise.
