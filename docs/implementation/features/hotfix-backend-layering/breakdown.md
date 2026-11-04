# Backend hotfix work breakdown

**Artifact ID:** HOTFIX-BACKEND-42-WBS\
**Version/date:** 0.5 Draft · 4 November 2026

The [plan](plan.md) is the single source of original hotfix results and handoff preparation state. This WBS records scope/dependencies, not duplicate mutable execution status. Original documentation tasks retain their original IDs/evidence and are not scheduled again.

## Original documentation work

| Package | Reviewable outcome | Prerequisite |
| --- | --- | --- |
| HF42-T01 | Isolated source snapshot and registered plan | Owner original instruction |
| HF42-T02 | Exact section4.2 description and current metadata | T01 and source checks |
| HF42-T03 | Structural/source/preservation verification and handoff | T02 |
| HF42-F01 | Existing Stage6 header-link correction | T03 finding and owner direction |
| HF42-P01 | Original scoped publication | T01–T03/F01 and original publication authority |
| HF42-C01 | Actual publication/source/result reconciliation | Existing original evidence and owner selection2 |

## RF01–RF05 runtime follow-up sequence

The owner authorised this separate hotfix follow-up. The hotfix plan owns execution; committed SP-04 e6f2337 is its guarded source/regression baseline. No registration transfer to SP-04 or competing implementation plan is required. Earlier draft adoption wording is superseded.

| Order / brief | One deliverable | Dependency / stop condition |
| --- | --- | --- |
| 1. [HF42-RF01](tasks/HF42-RF01-source-registration.md) | Current source/caller inventory and hotfix baseline registration | Reconcile latest owning sources before any code/testing |
| 2. [HF42-RF02](tasks/HF42-RF02-shared-capability-query.md) | hasCapability for identical existing SQL, with real PG proof of unchanged behaviour | RF01; leave batch discovery and private provisioning unchanged |
| 3. [HF42-RF03](tasks/HF42-RF03-unexpected-null-contract.md) | Proposed generic503/rollback contract and real failing regression | RF02; preserve the red result, no guard implementation yet |
| 4. [HF42-RF04](tasks/HF42-RF04-unexpected-null-guard.md) | Small unexpected-null guard in existing transaction | RF03; recorded denial/clock evidence must still commit correctly |
| 5. [HF42-RF05](tasks/HF42-RF05-regression-handoff.md) | Combined runtime regression and source-identified handoff | Producer checks pass; retain failures and explicit fixture ceilings |

Mandatory permission/replay/rollback/failure assertions stay with their producer; RF05 does not defer them. Historical session006/project008/Task009 and new mutation010 fixture ceilings are explicit in the briefs and must be preserved. Runtime error details stay generic and no helper grants implicit read authority. Actual SP-05 producer integration/P08 and independent release acceptance stay open.

## Excluded work and estimates

Runner extraction, cursor changes, actions-discovery separation, schema/dependency changes, new services, optional charts/load work and automatic publication are excluded. Open a separately justified task only when a concrete requirement demands it. No duration or delivery estimate is supplied before current-source reconciliation; each brief is intentionally one bounded reviewable outcome. Recovery always preserves unrelated work and immutable evidence.


RF03 report boundary: [HF42-RF03-RESULT](rf03-report.md) records the contract and real expected-red reproduction. The owner requested report/stop before RF04; no guard or RF05 completion is implied. Actual mutable states remain solely in plan.md.


RF05 continuation navigation: [RF04 producer report](rf04-report.md) and [RF05 combined handoff](rf05-report.md). The earlier RF03 stop records its historical boundary; actual RF readiness/results remain solely in plan.md.
