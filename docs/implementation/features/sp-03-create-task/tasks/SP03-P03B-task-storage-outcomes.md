# SP03-P03B — Additive task origin and outcome persistence

**Artifact ID:** SP03-P03B\
**Version/date:** 0.2 Draft · 2 November 2026\
**Work package:** SP03-WP03B (single executable leaf under SP03-WP03P).\
**Execution status:** Read the [parent plan](../plan.md#authoritative-task-and-execution-table); no independent mutable status.\
**Inputs:** [FEAT-SP03-01](../plan.md) v0.4; [decision batch](../decision-batch.md) v0.2; Proposed [ADR-0027](../../../../adr/0027-task-creation-foundation.md) v0.2; current source identities in P01.\
**Trace:** Child of SP03-P03 / canonical SP-03.2; FR-05/AC-05 and supporting FR-03/31/59, BR-01/02/10/11/14; TC-02/13/18/19 as applicable; PLAN-01 Month 1 / M-02. FR-50 is contextual document-access scope only.

## Objective

Deliver additive task origin and outcome persistence as one reviewable producer slice of the P03 work package.

## Context

P01 identified missing supported author provisioning, project-only outcome shapes and the Task timestamp mismatch. P02 supplies the bounded proposal and exact owner dispositions. [Source: decision-batch sections 1–5; ADR-0027; unchanged canonical SP-03.] Task splitting preserves the owning feature/WBS and all Must/negative coverage; it adds no product requirement.

## Scope

- Implement only the selected new origin/outcome/authority-audit constraints. Preserve raw bytes of applied 001–008 and the default 006/008 historical fixtures.
- Refuse unreconciled old Task rows, createTask keys or backlog-author grants before DDL; no fabricated time/backfill or implicit grant adoption.
- Extend the existing idempotency shape and immutable identity for a typed original 201 Task outcome if Q-03 selects it; Task result_ref is task_id, while project binding is validated in the snapshot.
- Use types.ts so outcome helpers compile before P04 store exists; reuse small existing fault/hash/revision helpers without broad refactoring.

Out of scope: task edit/reorder/assignment/state/Sprint work, Knowledge/provider/AI, unrelated cleanup and any unchecked owner-choice branch. This P02 turn authors the brief only; no task implementation is claimed.

## Inputs and readiness

Read AGENTS, development-rules, pre-flight, workflow, parent plan, this brief, P01 source identities, decision batch, Proposed ADR-0027, existing code/tests and the relevant contract/migration runbook before editing. Dependencies: P03A; owner Q-03 retention disposition; selected Q-02 branch; G-01–G-03 and next-task authorization. Source versions, allowed paths, fixture commands and safe recovery must be current. Pending owner choices are not defaults; formal Proposed status alone is not evidence of an implementation pass.

## Files and components touched

- Planned services/workspace/migrations/009-task-creation.up.sql and 009-task-creation.down.sql; confirm 009 is unused before writing
- Planned services/workspace/src/tasks/types.ts and outcomes.ts
- Planned tests/workspace/task-storage.test.mjs and task-fixture.mjs; import existing sessionFixture with explicit through=009 and through=008 only for controlled legacy-refusal preparation
- Existing docs/sdlc/data-design.md, diagrams/data/workspace-erd.mmd and workspace-erd.drawio plus required manifest/version inventories only to synchronize actual selected owned DDL

Paths marked planned do not exist yet. Closed exceptions to canonical code scope are exactly the support paths above and must be recorded in SP-03 before implementation. Runtime ownership stays Workspace; applied migrations/other-service stores remain read-only. No generic root-command/dependency change is authorized.

## Implementation guidance

Disposable fixtures only, never valuable development data. Retained data means reviewed forward recovery, not permission to delete. Do not change scripts/database.mjs or default fixture ceilings; numeric through=009 is already supported. No public task handler or private CLI operation is implemented in this slice.

Follow the exact protocol in ADR-0027: current same-client auth/project/capability; project-before-task ordering; immutable evidence and safe numbers; audit/outcome transaction atomicity; typed guard denial preserves clock-fault latching; unknown COMMIT never becomes rollback certainty or a fresh-key retry. Reuse only small helpers with matching semantics. No new universal transaction/cursor/permission framework.

## Acceptance criteria

1. Empty-compatible forward/repeat/empty down/up succeeds; legacy/nonempty refusal retains state; partial/failed migration makes no claimed successful adoption.
2. Created_at (if chosen) and original consumed outcome are immutable; null/extra/malformed/unsafe JSON/revisions/positions reject safely.
3. No direct Task state/location default inference or second Backlog-generation increment is introduced; minimum result/audit constraints do not weaken other operations.
4. Down refuses task/outcome/author-grant/private-audit data and never deletes it; old project/member/protected outcomes retain their shape and tests.

## Verification

Node 24+; exact version/source/fixture identities and failed attempts recorded. Planned test files below become runnable only after authoring. Read storage/TLS/browser guides before any fixture; missing setup is not a passing skip.

- npm run typecheck
- npm run build
- node --test --test-concurrency=1 tests/workspace/task-storage.test.mjs (planned test file)
- npm run docs:lint
- npm run docs:test
- npm run test:projects (existing disposable 008 regression; follow TLS prerequisites)

Producer permission/audit/rollback/migration checks are mandatory here, not deferred to P07. P07 supplies controlled cross-producer schedules and must close before aggregate verification. Context/schema/SQL evidence is labelled separately from HTTP/UI/browser enforcement. No application test is executed by drafting this card.

## Definition of Done

All acceptance assertions have actual evidence; exact defined checks pass or the gate remains failed with preserved diagnostics. Source/path/version and relevant trace/diagram metadata are reconciled without changing old results. Update only the parent task table and registered dated evidence. Independent review is unassigned unless actually obtained; this author does not self-approve.

## Estimate, risks and mitigation

Rough 2–4 engineer-hours, low confidence, derived from the existing foundation plus this split deliverable; not a deadline or measured capacity. Re-estimate after decisions/first evidence and split before execution if a leaf exceeds one reviewable result or four estimated hours. Risk: acting on pending policy or legacy data assumptions. Mitigate through exact owner disposition, preflight refusal, synthetic fixtures and explicit failure boundaries; no deletion to obtain a pass.

## Rollback

Documentation/source-only correction restores only the scoped new delta. For future 009, use the selected empty-compatible down path on disposable data only; retained rows require forward recovery, not a destructive rollback. Private provisioning changes use a new expected-revision audited revoke, never editing an old audit/outcome. No automatic commit/force push or valuable DB reset.

## Dependencies and ordering

P03A; owner Q-03 retention disposition; selected Q-02 branch; G-01–G-03 and next-task authorization. The P03 parent aggregates children and is not a second execution of their work. P04/P05 depend on the complete selected persistence/provisioning support; public operation discovery stays coupled to actual handlers. All work remains sequential; no parallel-agent authority.

## Execution guardrails

One authorized task, closed paths, existing packages and synthetic fixtures. No accepted ADR/baseline edit, provider transfer, cross-service write, role bypass, old migration edit, ignored failure or automatic commit/push. Reopen the plan before continuing. Stop only dependent work for a missing material choice or failed required gate; independent authorised preparation may continue.

## Open questions and handoff

Decision batch Q-01/Q-02/Q-03 records actual owner answers. Owner/deadline is the project owner before the affected child starts; no invented calendar date. If an answer changes the proposal, reconcile task paths/assertions first. Result destination: parent evidence and the producer's registered dated report. Handoff states what was actually implemented/measured, which gates remain and the next ready child; no duplicate status table.

## Actual execution input disposition

Owner selected all three bounded directions and requested all SP-03 tasks. P03A support checks passed against Workspace 0.2.12/logical JSON 0.11/canonical SP-03 0.7. Earlier conditional/drafting language above is the historical task definition. Current results and status remain solely in the parent plan.

Coordinated reproducibility path: docs/sdlc/diagrams/design-models.json, DGM-DATA-01 entry only (task.created_at, 009 scope and ADR-0027), recorded in canonical SP-03 before edit. Existing generator remains unchanged.
