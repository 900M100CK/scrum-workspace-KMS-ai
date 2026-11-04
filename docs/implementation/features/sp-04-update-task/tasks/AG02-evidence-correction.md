# SP04-AG02 — Antigravity review evidence correction

**Artifact ID:** SP04-AG02\
**Version/date:** 0.1 Draft · 3 November 2026\
**Status:** Written follow-up assignment; manual delivery/receipt/execution pending.

## Objective and scope

Correct the evidence and factual scope of AG01, not application code. Read [Codex disposition](../reviews/ag01-codex-disposition.md), the preserved [original report](../reviews/antigravity-p01-review.md), [coordination](../COORDINATION.md), [parent plan](../plan.md) and actual sources. Parent: SP-04.1 / FR-09/40/43/44, supporting FR-31 / PLAN-01 Month 1 / M-02–M-03. This follow-up completes the same source-review assignment; it does not start feature P02.

Workspace D:/scrum-workspace-KMS-ai, intended branch codex/sp-04, HEAD 6b837fd52e01709f72bfe2de6cb96f0e9cc52653. Confirm the actual state without switching/resetting/stashing. Preserve unrelated work and the old separate SP-04 worktree.

Allowed write: **only** docs/implementation/features/sp-04-update-task/reviews/antigravity-p01-review-v0.2.md. Artifact ID SP04-AG01-RESULT, version 0.2 Draft, actual date, Findings only. Preserve the original v0.1 report byte-for-byte. If the new path already exists, return the conflict and propose a distinct revision path. No shared-file/status/contract/migration/runtime/test/Git edits, installations, DB access, server startup or test execution.

## Required corrections

1. Recompute SHA-256 from the actual raw file bytes. Show full hashes, actual commands and actual per-file comparisons for the 42 P01 selected sources. The 14 prefixes in v0.1 do not match raw or LF-normalized bytes; do not reuse them or claim zero drift without obtaining actual results. Verify every additional displayed source, including source-review.md, rather than inventing a prefix.
2. Correct every source path/line citation against the inspected file. Error is currently at OpenAPI line 3556 and Blocker at 3902; rediscover all locations from the actual source instead of copying these examples blindly. Distinguish OpenAPI dialect, contract version and source-file identity.
3. Keep C01/C02 source mismatches, but use the actual state_conflict vocabulary and leave a separate-current-read reconciliation as a P02 proposal. Preserve unknown COMMIT/original-key semantics for C03.
4. Scope C04 to future mutation operations: createTask already declares 413/415; listBlockerEvents already declares 400. Reusable guards are not evidence that an unimplemented route ran.
5. State accurately that private audited provisioning is missing for the additional action rights; capability_grant.action is not restricted to four action strings. Current UC-04 already requires specific mutation authority plus membership; do not offer role/membership-only access as if it were the existing requirement. Separate any extra disabled-assignee eligibility recommendation from AC-43's confirmed text.
6. Correct the complete lock-order account: current session inspection takes the singleton clock and actor account/session; removeMember locks target account before Project, then membership and ordered Tasks. Recognise common serialization. No deadlock is reproduced, and the proposed Project-first target-account order is not the current protocol.
7. Keep typed receipt storage as an implementation prerequisite, including shape validation **and** immutable original-result protection for new operations. It is not a current SP-03 runtime incident. Clarify audit history: retained creation results already contain initial state/content; proposed before/after encodings are design candidates, not proof of existing future handlers or mandatory chart infrastructure.

## Completion and handoff

Provide corrected C01–C06 dispositions, priority findings with exact evidence and ownership, actual hash/inspection checks, and explicit unrun runtime limits. Address each numbered correction or explain with source evidence why it is refuted. Never rewrite code, expected tests, v0.1 report or old measured results to obtain a pass. Return the new report's absolute path and a concise correction summary to Codex/owner; stop there. Codex verifies source identity and decides AG01's final disposition. No automatic independent/release acceptance or further task execution.
