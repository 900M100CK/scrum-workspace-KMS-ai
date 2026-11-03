# SP03-P01 — Source and AC/permission/test reconciliation

**Artifact ID:** SP03-P01\
**Version/date:** 0.2 Draft · 2 November 2026\
**Execution status:** Read the [parent plan](../plan.md#authoritative-task-and-execution-table); this brief has no independent mutable status.\
**Inputs:** [FEAT-SP03-01](../plan.md) v0.2 for this continuation; original task-definition/source snapshots and template digests remain recorded in the plan.\
**Trace:** FR-05 / AC-05; supporting FR-03/31/59, BR-01/02/10/11/14; FR-50 is contextual document classification only; UC-03 main and EX-01/02; SC-01 subset only.

## Objective

Deliver source and ac/permission/test reconciliation as one reviewable outcome.

## Context

This refines existing canonical child SP-03.1 under PLAN-01 Month 1 / M-02. [Source: parent plan, Goal/source/acceptance sections; canonical SP-03 and IMPL-SP-03 linked there.] Local SP03-WP01P is a work-package ID, not a new business requirement. Owner role: sequential development agent; material product/policy decisions belong to the project owner. Audience: next implementer and owner/reviewer.

## Scope

- Inventory actual source headers/SHAs and read SP-03, UC-03, FR-05/AC-05 and supporting permission/audit/HTTP contracts.
- Create a bounded source-review.md with existing vs absent handler paths and exact gaps, including timestamp and create-authority discrepancies.

Out of scope: unrelated refactoring, requirement/API expansion, task editing/reordering, assignee/state/Sprint operations, Knowledge/AI/provider work and other-service writes. D01/D02 implement documentation only; P01/P02 prepare sources/design only. No runtime implementation in this publication.

## Inputs and readiness

Read the parent source/decision/acceptance sections, canonical SP-03, current FR-05/AC-05 and UC-03, existing Workspace OpenAPI, relevant owned migrations/code and affected tests. Read AGENTS, development-rules, pre-flight and workflow before editing; do not execute from this summary alone. Reconcile actual source versions before starting; parent snapshots are not a claim that later patches were reviewed.

Dependencies: Published plan; SP-02 evidence (finish-to-start). DoR: parent task is ready under actual authorization, G-01–G-05 inspected as source-review subjects; resolution belongs to P02 and is not a prerequisite for this preparation task, allowed paths/commands/fixtures confirmed, and an observable deliverable plus safe recovery identified. A brief is not implementation authority. Material gaps block only dependent work, with independent preparation continuing.

## Files and components touched

- docs/implementation/features/sp-03-create-task/source-review.md (planned; canonical spec/pack preparation)
- docs/implementation/features/sp-03-create-task/plan.md (existing; task evidence only)

Canonical future code scope is services/workspace/**, apps/web/** and tests/workspace/**. Existing files keep their current ownership. New names above are explicitly planned from canonical SP-03 and must be confirmed by P02 before use. Metadata/shared-path exceptions require the coordinated plan/spec registration before editing; a blanket path label is not authority to touch unrelated files.

## Implementation guidance

Read only implementation/contract sources; do not fix unrelated source drift or run application fixtures as part of source reconciliation.

Use the smallest existing service-owned pattern that satisfies the chosen design. Authentication/current project authority comes from the server and the owning transaction, never role/client assertions. Mandatory audit and replay are part of the producer transaction. Unknown outcomes retain the original operation identity; no unrestricted fallback, partial success claim or fresh automatic key. Preserve immutable evidence, service boundaries and runtime-AI read-only restrictions.

## Acceptance criteria

1. Map supported creation, validation and unauthorized/foreign access to AC-05/FR-03/59 and producer tests.
2. Distinguish role names from explicit create authority and identify private provisioning prerequisites.
3. Record 003/007/008 task-location/audit/outcome limits and Proposed ADR-0018/D-04 gates; no assumed policy acceptance.

## Verification

Use Node 24+ and record its actual version. All application-specific files below are planned until implemented; their commands must not be reported as executed now. Existing command prerequisites are in package guides/storage/TLS runbooks. Documentation-only tasks must not launch runtime suites merely because the overall feature will need them.

- npm run context:lint
- npm run context:check
- npm run context:test
- npm run docs:lint
- npm run docs:test

For every check record command, source/fixture/config identity, actual result, failed attempts and unrun boundaries in the parent evidence or a registered dated report. Context/schema checks are not handler permission evidence. Reconcile command/path changes before execution rather than weakening expected assertions.

## Definition of Done

- The listed deliverable and every applicable acceptance assertion have reviewable evidence.
- Producer tests and required negative/failure/concurrency checks pass at their actual boundary; checks not run are explicit.
- Scoped diff/links/whitespace and source/version registrations are checked; unrelated work is preserved.
- Parent task status/result and affected actual trace rows are updated; WBS/brief do not copy mutable status.
- Independent review/owner acceptance remains unclaimed unless actually obtained; this author's self-check is identified.

## Estimate, risks and mitigation

Rough budget: 1–2 engineer-hours, medium confidence; basis is the existing session/project pattern and the bounded deliverable, not measured elapsed time or an owner calendar commitment. Split before execution if the work exceeds one reviewable result or its four-hour upper estimate; keep mandatory producer checks with the split producers. Do not invent capacity or dates.

Primary risk: acting on an unresolved design/source/fixture or treating a structural pass as runtime acceptance. Mitigation: enforce readiness gates, preserve negative evidence and escalate only the missing material choice to the owner. Dependency failures deny access without fabricated output.

## Rollback

Restore only the newly authored documentation delta using the scoped before/after diff; never overwrite unrelated working-tree changes. A published branch uses normal follow-up correction; no force push or deletion of owner work.

## Dependencies and ordering

Published plan; SP-02 evidence (finish-to-start). Read [breakdown](../breakdown.md) for WBS/child mapping and the parent for downstream task readiness. P07 starts with its producers and must finish before their verification closes; safety coverage cannot be deferred to an optional final run.

## Execution guardrails

Work sequentially in the authorized branch, within closed paths, with synthetic/authorized fixtures and no new dependencies by default. No accepted ADR/baseline edits, valuable-data reset, cross-service writes, new provider transfer, parallel agents or automatic commits. Git publication is explicitly limited to D02. Check the plan at each continuation; stop only dependent work at a failed gate or material missing decision. The selected implementation prompt's example approval/dirty-tree/commit steps remain subordinate to owner/platform/project authorization. No arbitrary iteration cap removes required verification; repeated identical failures require diagnosis and a revised task, not blind retries.

## Open questions and handoff

Relevant open questions are the parent G-01–G-05 rows. Owner and due point are explicit prerequisite gates there, not invented calendar dates. P01 inventories; P02 proposes/disposes; dependent tasks wait. If this task reveals another material question, record its source and affected prerequisite before proceeding.

Result destination: [parent execution evidence](../plan.md#execution-evidence) and, for future measured application work, the dated registered report named by the producing task. Handoff includes exact assertions met/unmet, source identity, current gates and next ready task. No separate mutable INDEX or implementation-plan duplicate.
