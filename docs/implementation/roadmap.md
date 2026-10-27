# Dependency-based implementation roadmap

**Artifact ID:** IMPL-ROADMAP-01\
**Version/date:** 0.5 Draft · 27 October 2026\
**Status:** Planning order, not completed work or scope acceptance.\
**Inputs:** PRD-01 v0.9; SPEC-INDEX v0.4; PLAN-01 v0.4; [decisions](decisions.md); [task catalogue](tasks/README.md).\
**Trace:** BR-01–BR-14; SC-01–SC-08.\
**Owner role:** Sequential development coordinator.

Dependencies are gates, not dates. Keep all release Must ACs. Optional requirements remain optional, with explicit inclusion decisions; do not treat every declared operation as an equal-size unit of delivery.

| Milestone | Packs / sequence | Observable exit evidence |
| --- | --- | --- |
| M-01 authenticated foundation | SP-01 + SP-11.1 capture; relevant D-01/02 decisions first | Real sign-in/out/expiry and actor integrity; owned audit capture where required; executable application checks actually wired |
| M-02 smallest work flow | SP-02 project/membership foundation → SP-03 → SP-04, capture in every producer | Two synthetic accounts; create project/task; update state/blocker; fresh client reconstructs persisted authorised work; membership loss denies and clears protected UI |
| M-03 complete Scrum behaviour | Finish SP-02 removal/last-manager tests and SP-05 | Fixed lifecycle, complete Backlog reorder, exclusive allocation, mixed per-task outcomes, complete/reopen with history preservation; controlled concurrency/failure tests |
| M-04 knowledge access | SP-06 with SP-11.1; SP-07 | Workspace-first creation, independent rights, guarded protected reads, revoke/rejoin, immutable Current replacement and exact labelled history; same-key unknown-outcome reconciliation |
| M-05 useful context without AI | SP-08 plus relevant SP-07 readiness/history | Task links and permission-filtered English keyword search; no hidden target metadata; work and healthy document/keyword paths survive provider failure |
| M-06 evidence-backed AI | SP-11.2/3 and SP-09 after work/doc prerequisites; SP-10 | Selected permitted provider configuration; scoped retrieval, durable manifests, guarded input/answer transport, exact citation and full evidence checks; operational state overrides old text |
| M-07 scoped inspection | SP-13 after producing evidence exists; capture is already mandatory | Audit identity exception/redaction; scoped trace and sources; optional summary entitlement independent of audit/trace; honest missing metrics |
| M-08 release verification | SP-12 with regressions from every pack | Must AC/SC coverage, reproducible evaluation, matched keyword baseline for improvement claims, known failures/limitations and dependency-specific fallback |

## Capture and dependency interpretation

### Registered work plans

The [work plan register](features/README.md) links feature, fix, hotfix and test plans to their PLAN-01 sections, canonical spec/pack children and milestones above. Keep each plan's detailed task statuses in its own task table. Registration adds no Must deferral, dependency reorder, decision acceptance or calendar change.

| Milestone / parent | Child work plan | Scope / next task |
| --- | --- | --- |
| M-01 / PLAN-01 Month 1 | [FEAT-SP01-01 v0.2](features/sp-01-session-foundation/plan.md) | SP-01 session foundation; SP01-P01 next, 12 tasks from spike through owner gates to real handlers/UI/regression; no application acceptance |

SP-11 is cross-cutting: its mutation-capture child accompanies every first mutation. Its AI evidence children are later, after work and knowledge prerequisites. SP-06's SP-11 dependency means applicable capture readiness, not completion of the entire AI manifest/inspection pipeline. SP-01 and SP-11 capture are co-delivered where session-producing operations require records; do not create a circular wait or defer audit.

The task catalogue retains canonical spec dependencies. Within a spec, foundational children may be integrated early, but the whole pack is not Verified until its mandatory children and dependencies pass. For example, initial project membership can support SP-03 while full member-removal regression continues; final SP-02 acceptance still includes it.

## Stop and recovery rules

- Stop the affected step on unknown authority, unresolved material policy or failing required tests. Continue independent authorised preparation; do not bypass the gate.
- A timeout is unknown outcome, not rollback. Reconcile the original scoped identity/payload. A protected AI transport follows its one-use/unknown-transport rules, not generic mutation replay.
- Do not simplify by removing guards, content permissions, durable evidence, history or tests. Revisit unnecessary mechanism complexity through the decision process.
- Later milestone preparation may use local synthetic doubles. It does not authorise live AI relay before the work/document gates.
- No additional Must deferral, automatic graph, meeting AI, reports expansion or runtime multi-agent feature is introduced.

Checklist: Pass for explicit sequence, capture interpretation and observable exits; Gap for all application milestone evidence. Handoff: select SP-01.1 from [tasks](tasks/README.md), following [execution](execution.md).
