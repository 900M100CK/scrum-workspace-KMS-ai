# SP03-P06 — Server-backed create/list/detail UI and recovery

**Artifact ID:** SP03-P06\
**Version/date:** 0.1 Draft · 2 November 2026\
**Execution status:** Read the [parent plan](../plan.md#authoritative-task-and-execution-table); this brief has no independent mutable status.\
**Inputs:** [FEAT-SP03-01](../plan.md) v0.1; publication source snapshots and template digests in that plan.\
**Trace:** FR-05 / AC-05; supporting FR-03/31/50/59, BR-01/02/10/11/14; UC-03 main and EX-01/02; SC-01 subset only.

## Objective

Deliver server-backed create/list/detail ui and recovery as one reviewable outcome.

## Context

This refines existing canonical child SP-03.3 under PLAN-01 Month 1 / M-02. [Source: parent plan, Goal/source/acceptance sections; canonical SP-03 and IMPL-SP-03 linked there.] Local SP03-WP06P is a work-package ID, not a new business requirement. Owner role: sequential development agent; material product/policy decisions belong to the project owner. Audience: next implementer and owner/reviewer.

## Scope

- Extend the existing project workspace UI with supported item creation, current list/detail and authoritative work_location.
- Use server advisory actions plus request-time authority; reuse the exact-key unknown-outcome recovery pattern where it fits task creation.
- Co-deliver controller tests for cancellation, pending recovery and denied/stale responses.

Out of scope: unrelated refactoring, requirement/API expansion, task editing/reordering, assignee/state/Sprint operations, Knowledge/AI/provider work and other-service writes. D01/D02 implement documentation only; P01/P02 prepare sources/design only. No runtime implementation in this publication.

## Inputs and readiness

Read the parent source/decision/acceptance sections, canonical SP-03, current FR-05/AC-05 and UC-03, existing Workspace OpenAPI, relevant owned migrations/code and affected tests. Read AGENTS, development-rules, pre-flight and workflow before editing; do not execute from this summary alone. Reconcile actual source versions before starting; parent snapshots are not a claim that later patches were reviewed.

Dependencies: P04/P05 and selected action discovery (finish-to-start). DoR: parent task is ready under actual authorization, relevant G-01–G-05 resolved with recorded evidence, allowed paths/commands/fixtures confirmed, and an observable deliverable plus safe recovery identified. A brief is not implementation authority. Material gaps block only dependent work, with independent preparation continuing.

## Files and components touched

- apps/web/src/tasks.ts and TaskWorkspace.tsx (planned provisional names; P02 confirms names)
- apps/web/src/ProjectWorkspace.tsx, App.tsx and styles.css (existing; routine extension preserving design)
- tests/workspace/task-ui-controller.test.mjs (planned)

Canonical future code scope is services/workspace/**, apps/web/** and tests/workspace/**. Existing files keep their current ownership. New names above are explicitly planned from canonical SP-03 and must be confirmed by P02 before use. Metadata/shared-path exceptions require the coordinated plan/spec registration before editing; a blanket path label is not authority to touch unrelated files.

## Implementation guidance

Preserve existing visual design. Follow the project UI skill workflow before coding; do not add a visual lead or dependency for this routine extension. No credentials/fetched protected lists in browser recovery storage.

Use the smallest existing service-owned pattern that satisfies the chosen design. Authentication/current project authority comes from the server and the owning transaction, never role/client assertions. Mandatory audit and replay are part of the producer transaction. Unknown outcomes retain the original operation identity; no unrestricted fallback, partial success claim or fresh automatic key. Preserve immutable evidence, service boundaries and runtime-AI read-only restrictions.

## Acceptance criteria

1. Fresh navigation/reload reads actual committed tasks; no synthetic memory becomes work truth.
2. Only supported types submit; create controls follow advisory current capabilities without role-name assumptions.
3. Timeout/lost response retains the exact actor-bound original operation/key/body and prevents automatic fresh-key duplicate creation.
4. Denied/revoked/session-expired/outage responses hide or clear protected task data; late responses cannot restore it.
5. Cursor conflict discards accumulated pages and restarts; loading/empty/error/conflict/unknown states are explicit with accessible labels/focus.

## Verification

Use Node 24+ and record its actual version. All application-specific files below are planned until implemented; their commands must not be reported as executed now. Existing command prerequisites are in package guides/storage/TLS runbooks. Documentation-only tasks must not launch runtime suites merely because the overall feature will need them.

- npm run typecheck
- npm run build
- node --test tests/workspace/task-ui-controller.test.mjs (planned test file)

For every check record command, source/fixture/config identity, actual result, failed attempts and unrun boundaries in the parent evidence or a registered dated report. Context/schema checks are not handler permission evidence. Reconcile command/path changes before execution rather than weakening expected assertions.

## Definition of Done

- The listed deliverable and every applicable acceptance assertion have reviewable evidence.
- Producer tests and required negative/failure/concurrency checks pass at their actual boundary; checks not run are explicit.
- Scoped diff/links/whitespace and source/version registrations are checked; unrelated work is preserved.
- Parent task status/result and affected actual trace rows are updated; WBS/brief do not copy mutable status.
- Independent review/owner acceptance remains unclaimed unless actually obtained; this author's self-check is identified.

## Estimate, risks and mitigation

Rough budget: 2–4 engineer-hours, low confidence; basis is the existing session/project pattern and the bounded deliverable, not measured elapsed time or an owner calendar commitment. Split before execution if the work exceeds one reviewable result or its four-hour upper estimate; keep mandatory producer checks with the split producers. Do not invent capacity or dates.

Primary risk: acting on an unresolved design/source/fixture or treating a structural pass as runtime acceptance. Mitigation: enforce readiness gates, preserve negative evidence and escalate only the missing material choice to the owner. Dependency failures deny access without fabricated output.

## Rollback

Use a bounded source correction and the documented reversible new migration only on an explicitly disposable fixture. Nonempty/valuable-data rollback is not authorized; follow the storage runbook and preserve evidence. Unknown committed requests reconcile the original identity, never a blind duplicate mutation.

## Dependencies and ordering

P04/P05 and selected action discovery (finish-to-start). Read [breakdown](../breakdown.md) for WBS/child mapping and the parent for downstream task readiness. P07 starts with its producers and must finish before their verification closes; safety coverage cannot be deferred to an optional final run.

## Execution guardrails

Work sequentially in the authorized branch, within closed paths, with synthetic/authorized fixtures and no new dependencies by default. No accepted ADR/baseline edits, valuable-data reset, cross-service writes, new provider transfer, parallel agents or automatic commits. Git publication is explicitly limited to D02. Check the plan at each continuation; stop only dependent work at a failed gate or material missing decision. The selected implementation prompt's example approval/dirty-tree/commit steps remain subordinate to owner/platform/project authorization. No arbitrary iteration cap removes required verification; repeated identical failures require diagnosis and a revised task, not blind retries.

## Open questions and handoff

Relevant open questions are the parent G-01–G-05 rows. Owner and due point are explicit prerequisite gates there, not invented calendar dates. P01 inventories; P02 proposes/disposes; dependent tasks wait. If this task reveals another material question, record its source and affected prerequisite before proceeding.

Result destination: [parent execution evidence](../plan.md#execution-evidence) and, for future measured application work, the dated registered report named by the producing task. Handoff includes exact assertions met/unmet, source identity, current gates and next ready task. No separate mutable INDEX or implementation-plan duplicate.
