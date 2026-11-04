# SP04-P03A — bounded Task transport contract support

**Artifact ID:** SP04-P03A\
**Version/date:** 0.1 Draft · 3 November 2026\
**Status:** Written assignment to Antigravity, ready for manual delivery; no execution/result claimed.

## One reviewable outcome

Declare the already planned 413/415 failures for four future Task mutation routes, preserving every existing operation, schema and requirement. This is a transport contract/metadata slice, not handler implementation or the entire SP-04 feature. Parent: [FEAT-SP04-01](../plan.md) / SP-04.2 / FR-09/40/43/44 and supporting FR-03/31/59/68 / PLAN-01 Month 1 / M-02–M-03. Read [owner decisions](../owner-decisions.md) and [decision batch](../decision-batch.md) before work; the selected policy is not itself new runtime evidence.

Workspace D:/scrum-workspace-KMS-ai; intended branch codex/sp-04, base HEAD 6b837fd52e01709f72bfe2de6cb96f0e9cc52653. Confirm actual branch/HEAD/status and source versions. Do not change branches, stash/reset, import the old SP-04 worktree or overwrite unrelated dirty work. Plan mode is unavailable in the coordinating chat; the saved parent and this brief are the written gate. Apply the actual environment's planning constraints without claiming a mode switch.

## Exact primary changes

In contracts/openapi/workspace.openapi.json, verify the current methods/operation IDs and add only 413/415 response declarations using the existing Error schema and established response style:

| Method and route | Existing operation |
| --- | --- |
| PATCH /tasks/{task_id} | editTask |
| POST /tasks/{task_id}/state | setTaskState |
| POST /tasks/{task_id}/assignee | setAssignee |
| POST /tasks/{task_id}/blockers | recordBlocker |

Preserve all existing responses, request/response schemas, required headers, permission semantics, identities and operation counts. Do not re-add statuses to createTask (already present), change blocker GET, add operation/field/enum/query parameters, claim a handler exists or change any runtime code. A declaration does not prove Fastify rejection behaviour; actual handler tests come with its producer. No 8192-byte field-length constraint or new content policy is added by assumption.

Bump Workspace info.version from 0.2.12 to 0.2.13 if still the inspected baseline; if another writer changed it, stop conflicting edits and report the source instead of overwriting. Coordinate CONTRACT-01/API-05 status/version pointers and canonical SP-04 support-path/backlink metadata. Preserve original evidence/source captures.

## Allowed writes and exclusive ownership

Antigravity is the sole writer for this slice until it returns its report; Codex will inspect but will not concurrently mutate the listed shared sources.

- Primary: contracts/openapi/workspace.openapi.json; contracts/README.md; docs/sdlc/api-design.md; specs/004-update-task.md **support-path/version/backlink metadata only**, without changing FR/AC/policy bodies in this slice.
- Registration: docs/sdlc/artifact-register.md; docs/sdlc/diagrams/manifest.json; docs/sdlc/references/document-review-register.md; generated metadata outputs through the existing docs:sync-metadata command only. Diagram graph/design changes are forbidden.
- Only when required by the existing linked-input checker: current input/version aliases and patch-version registration in docs/sdlc/*.md, docs/ux/*.md, docs/ux/wireframes/README.md, specs/*.md and docs/architecture.md. No body/requirement/diagram/UX/evaluation changes; preserve labelled historical snapshot versions. List every such adjustment and its necessity in the result.
- New result/evidence: docs/implementation/features/sp-04-update-task/reviews/p03a-contract-support.md and evidence/p03a/**. Record source hashes, exact commands/Node version, all failed attempts and scoped diff/preservation results. If the result path already exists, preserve it and report the conflict.

Do not edit parent plan.md, COORDINATION.md, task briefs, owner decisions, the current decision batch or implementation source register/roadmap/feature register. Codex owns mutable task status and integration. Do not edit logical data-model.json, PRD/UC requirement bodies, any ADR/baseline, app/services code, migrations, tests, root scripts/package files or dependencies in P03A. P03A2 handles policy-source alignment separately before P03B. No server/DB/browser/load execution, package installation, commits/push/merge or external transfer.

## Verification and completion

Reuse installed dependencies and actual Node 24+. Existing portable Node is C:/Users/MCK/AppData/Local/Temp/kms-node24/node-v24.21.0-win-x64/node.exe; use direct execution or a process-local PATH for npm children, never global environment changes. Record the actual version. Missing setup is a failed/unrun prerequisite, not a passing skip.

After source capture, run existing context:lint/check/test, contracts:test, docs metadata synchronization/check, docs:lint/test and scoped whitespace/local-target checks. Equivalent direct Node commands are in the parent/P01 evidence and package.json. These are structural/schema/harness checks; do not claim permission/handler behaviours. Capture stdout/exit codes even when a command fails; never weaken a test or modify its expectation. No runtime suite or installation is needed for this slice.

Accept only when the semantic API delta is exactly the eight response additions plus version metadata, all existing operation/schema/identity/error/permission assertions are preserved, required checks pass, historical artifacts/applied migrations/runtime sources remain unchanged, and every ancillary file change is within the metadata-only scope above. No declared operation or requirement count changes. Do not quote predetermined test counts as actual output.

Return the result path (Artifact ID SP04-P03A-RESULT, v0.1 Draft, actual author/date/source/commands/results/limits), exact changed paths, source hashes and any unresolved issue. Stop after P03A; do not start P03A2, P03B, implement handlers or select new policy. Codex reconciles actual evidence and updates the parent status.
