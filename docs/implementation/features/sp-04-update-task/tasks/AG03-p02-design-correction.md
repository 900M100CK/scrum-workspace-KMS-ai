# SP04-AG03 — P02 design correction, documentation only

**Artifact ID:** SP04-AG03\
**Version/date:** 0.1 Draft · 3 November 2026\
**Status:** Written assignment ready for manual Antigravity handoff; delivery/execution pending.

## Objective and sources

Correct the received P02 proposal before implementation. Read [Codex P02 findings](../reviews/p02-codex-disposition.md), [current parent plan](../plan.md), [coordination](../COORDINATION.md), current decision-batch.md, current OpenAPI, migrations 001–009 and actual operator/session/project/Task code. Parent SP-04.1–04.2 / FR-09/40/43/44, supporting FR-03/31/59/68 / PLAN-01 Month 1 / M-02–M-03. Confirm branch codex/sp-04 and actual HEAD; do not switch/reset/stash or use the older SP-04 worktree.

This correction assignment is now registered. The prior self-edited P02 brief did not grant future code/test authority. Proposed grants, disabled-target policy, no-op/retention and wire behaviour are **not owner-selected decisions**. Do not declare them approved or all gates closed.

## Exactly two permitted output documents

1. Update docs/implementation/features/sp-04-update-task/decision-batch.md to SP04-DECISION-BATCH v0.2 Draft. The original v0.1 raw bytes are already preserved in evidence/p02-decision-batch-v0.1.txt. Link the snapshot and identify actual current inputs. This is a corrected proposed design, not runtime code.
2. Create docs/implementation/features/sp-04-update-task/reviews/p02-codex-report-v0.2.md, Artifact ID SP04-P02-REPORT v0.2 Draft. Preserve reviews/p02-codex-report.md and all prior reports. If the new report exists, return the conflict rather than overwrite evidence.

Do not edit any other file, including the parent plan, P02/AG task briefs, coordination, registers, runtime, migrations, contracts, schemas, tests or shared configuration. Do not create workspace helper scripts; use read-only inspection/hash commands. No package install, tests, database/server startup, migration, Git mutation, commit/push or external transfer. Codex owns integration/status/registration and any later task refinement.

## Acceptance checklist — address R01–R07 explicitly

- Preserve existing createProject/addMember **201 snapshots**, removeMember 204 and createTask 201 semantics exactly. Do not reference an undeclared helper or drop current consumed-state, permanence, hash/key/ref and existing-shape safeguards. Either provide a complete internally consistent extension blueprint or replace incomplete SQL with precise declarative requirements; do not label approximate DDL as execution-ready.
- Specify total exact-shape typed Task/Blocker validators with required/exact keys, JSON types, safe integer bounds, UUID/time/location/null handling, safe casts and CHECK NULL rejection. Preserve OLD/NEW protected-operation detection and correct UPDATE/DELETE trigger returns. Include refused rollback with retained grants/audit/results/history; no applied-migration edits or deletion.
- Put current-authority and original-outcome recovery before new-write revision/target-eligibility checks. Explain committed replay after a later edit/member removal. Define stable retained 200 receipts for business no-ops and semantics for same-value state/assignment as well as empty edit. UI separately reads current state.
- Keep capabilities/options proposed with an unselected owner-disposition column. Reconcile separate task-edit versus existing backlog-author for Backlog content only, exact action scope and DB-enforced private issue/revival protection with runtime invalidation allowed. Define target action discovery and one invalid-assignee response without global account-existence disclosure. Disabled-target eligibility is a proposal, not an existing AC-43 rule.
- Preserve real clock-fault typed-denial semantics; no business change on failed guard, but do not require rolling back its durable fault latch/audit. State the complete actual lock protocol without an untested absolute no-deadlock claim.
- Cover completed-Sprint reopen for both todo and requested in_progress, correct Backlog placement/revision/history/generation; append-only blocker sequence **and safe upper bound**, Task revision effect, paging/cursor/current-authority rules, original-key recovery and producer-linked audit/failure assertions. Cover editTask audit and placement changes as well as the other three mutations. Do not add chart/estimate/scheduler infrastructure.
- Propose separate small storage/authority/edit/state/assignment/blocker/UI producer slices with meaningful verification attached to each. Keep actual SP-05 and browser gates. Future paths/commands are Planned, not installed/executed or automatically ready. Keep shared scope/spec/ADR coordination as prerequisites before code.
- Fix evidence wording: current context baseline has 69 active requirements; context tests are a separate 45-case structural suite. Prior Antigravity command claims without logs remain reported/unverified, not a fresh run. This source-only correction executes no tests and invents no logs. Capture exact inspected hashes/versions and distinguish source review from runtime proof.

## Return

For each R01–R07 state corrected, unresolved or refuted with exact source evidence. Record remaining material choices and recommendation/alternatives without selecting them for the owner. Return the two absolute output paths and a concise summary. Stop after documentation handoff; P03A/P03B are not dispatched by this task. Codex reviews before declaring the design ready.
