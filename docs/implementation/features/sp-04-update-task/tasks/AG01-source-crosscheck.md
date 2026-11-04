# SP04-AG01 — Antigravity source cross-check

**Artifact ID:** SP04-AG01\
**Version/date:** 0.3 Draft · 3 November 2026\
**Status:** Assigned in writing to Antigravity; ready for manual delivery, receipt/execution not confirmed.

## Assignment

Owner explicitly requested dividing work with Antigravity during the first SP-04 task. Codex keeps the [parent plan](../plan.md), registrations, [source map](../source-review.md), structural verification and integration. Antigravity receives this bounded source cross-check supporting SP-04.1. This is a read-only code/design review plus one findings file; implementation, test execution, shell setup and fixes are outside this assignment.

Follow the [coordination and return protocol](../COORDINATION.md). It supplies the start checklist, exact report structure, completion assertions and Codex reconciliation process. The parent plan remains the sole mutable task-status record.

Workspace: D:/scrum-workspace-KMS-ai. Active intended branch: codex/sp-04, based on main 6b837fd52e01709f72bfe2de6cb96f0e9cc52653. Check the actual branch/HEAD and files before relying on this snapshot. The root is dirty with unrelated work. A different pre-existing codex/sp-04-update-task worktree exists elsewhere; do not use, modify or import it.

Read AGENTS.md, docs/development-rules.md, docs/agent-preflight-checklist.md, agents/WORKFLOW.md and the project-local Karpathy/Ponytail/Review guidance for requested review. Inherit sources/trace from the parent: SP-04 v0.7.1, FR-09/40/43/44 and supporting FR-31, UC-04 main/alternatives/exceptions, ADR-0008/0017, Proposed ADR-0018/0019/0026/0027, Workspace v0.2.12 and current migrations 001–009. Preserve English code/docs and all current permission/version/citation/audit boundaries. No agents are authorised by this brief beyond the owner-named Antigravity assignment.

## One reviewable output

Write only docs/implementation/features/sp-04-update-task/reviews/antigravity-p01-review.md. Use artifact ID SP04-AG01-RESULT, version 0.1 Draft, actual date, reviewer identity, actual branch/HEAD, exact inspected file hashes/versions, findings and unverified limits. If the output file already exists, preserve it and propose a distinct dated output rather than overwrite it. Do not edit source-review.md, plan.md, task status, registers, contracts, runtime, migrations, tests, shared configuration or Git state. Codex integrates findings after receipt; never self-approve implementation or an ADR.

Check these questions against actual source, not report wording alone:

1. Do current edit/state/assignment/blocker contracts and UC-04 align? Confirm or refute C01–C06 with exact source paths/lines. Separate factual mismatch from an unresolved design choice.
2. Which checks/storage already support current membership, safe revision, completed-Sprint reopening, removal versus assignment, immutable original results and append-only highest-sequence blockers? Which are SQL constraints versus unimplemented application behaviour?
3. Can current business_audit before_ref/after_ref and sprint_allocation reconstruct time-stamped state/scope history? Identify the smallest missing evidence required by existing Must audit rules. Do not design or add charts, estimates, a scheduler or new event tables.
4. Does the P01 map preserve unknown-commit/original-key recovery, exact denied reads, expiry after lock waits and the actual SP-05 producer integration gate? Flag any unsupported approval, runtime pass or imported old-worktree claim.

Report findings in priority order with evidence, consequence and producing task owner. Explicitly state no findings if none; do not invent a finding to fill a template. Proposed remedies are recommendations only. Runtime checks, DB/browser/load testing and independent acceptance are Not run. This assignment ends with the report; send its path/content back to the owner/Codex for reconciliation.

## Coordination

Codex may finish P01 author checks while this review is pending. Do not run competing documentation metadata synchronization or edit shared files. If a source changes during review, list its before/after identity and restrict conclusions to the actual inspected version. Branch/permission or missing-source problems are reported without resets, stashes, new branches, package installation, migrations, commits, push or external data transfer.
