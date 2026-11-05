# SP05-AG01 — Antigravity tracking and verification assignment

**Artifact ID:** SP05-AG01\
**Version/date:** 0.2 Draft · 5 November 2026\
**Handoff:** Ready for manual delivery; receipt/execution are not confirmed. Mutable assignment status belongs only to [FEAT-SP05-01](../plan.md).\
**Owner role:** Antigravity reviews/tests; Codex reconciles returned evidence; the project owner retains acceptance/publication authority.\
**Trace:** FR-06/07/08/41/42 and FR-31; AC-06/07/08/41/42/31; relevant FR-03/09/40/59/68; BR-01/02/03/06/10/11/14; SC-03/04/06; UC-05 and SP04-P08; TC-07/08/13/14/16/18/19/21/22. PLAN-01 Month 2 / roadmap M-03, SP-05.1–05.4.

## Mission and starting point

Independently inspect the uncommitted SP-05 candidate, track coverage against P00–P15 and the actual Must acceptance criteria, rerun meaningful tests, and return reproducible findings. Do not treat Codex's implementation, plan statuses, screenshots or green logs as your own verification. This assignment is a review/testing task, not permission to fix production code or approve release.

- Workspace: `C:/Users/MCK/.codex/worktrees/sp-05-lifecycle/scrum-workspace-KMS-ai`.
- Required review branch: `codex/sp-05`; historical base: `1cb54f3cfdfd650caef35dce6d5fd0fd1e32a1d6`. For the published PR, inspect its actual head commit; the base is not the required current HEAD.
- The original candidate was dirty and included untracked implementation files. PUB01 publishes that candidate to a Draft PR. Prefer the actual PR head/base diff and complete source tree; if reviewing the earlier local candidate, inspect tracked and untracked files. Do not stash/reset/clean another checkout.
- Do not review the separate dirty hotfix checkout/main worktree or import their S01/workflow changes. Do not rely on an older SP-04 worktree.
- Start with [reviewer input manifest](../evidence/antigravity-assignment/reviewer-inputs.json). Verify each listed SHA-256 against actual bytes. It references preserved author manifests; newer coordination documents are explicitly distinguished from the tested runtime candidate. Later PUB01 publication/coordination updates are recorded separately; do not demand the old base as current HEAD. Unexpected runtime/test drift requires assessment before dependent conclusions. Compare published runtime Git blob identities from evidence/publication/staged-source.json; raw author SHA-256 snapshots may differ on a fresh checkout solely because of CRLF/LF conversion. Preserve the original snapshots.

Read `AGENTS.md`, `docs/development-rules.md`, `docs/agent-preflight-checklist.md`, `agents/WORKFLOW.md`, and project-local Karpathy/Ponytail/Ponytail Review guidance. Use Plan mode if available; otherwise disclose its absence and use this registered written gate. Run pre-flight before work and before handback. Do not spawn more agents.

## Inputs and source review

Open the actual files and record their current versions/digests:

1. BRD entry and linked English baseline; PRD v0.10.2; PLAN-01 v0.4; architecture v0.19.1; UC-05 and applicable test-plan assertions.
2. [SP-05](../../../../../specs/005-sprint-lifecycle.md) v0.7.4; [pack](../../../tasks/05-sprint-lifecycle.md); [plan](../plan.md), [WBS](../breakdown.md), all P00–P15 briefs and [local handoff](../handoff.md) v0.1.
3. Workspace OpenAPI v0.2.14, logical model v0.14; ADR-0008/0014/0017; Proposed ADR-0018/0019/0028/0029/0030. Proposed does not mean accepted. The owner's separate five-action/Must-only directions are recorded in the parent plan.
4. [Sprint runbook](../../../../../services/workspace/SPRINTS.md), Task/project/session guides and existing fixture patterns. Inspect the connected transaction, capability, cursor, Task, HTTP and UI callers, not only the new Sprint files.
5. Preserved author evidence: `evidence/final-source.json`, `regression2-source.json`, `regression2.json`, `reorder-races-final.json`, `controller-final.json`, `browser-final.json`, `final-checks.json`, and failed attempts. Their counters are author observations, not a target you must reproduce by weakening assertions.

## Closed scope and outputs

Read all connected source needed for the named change. Write only:

- `docs/implementation/features/sp-05-sprint-lifecycle/reviews/antigravity-<run-id>/`: `report.md`, `tracking.md` and dated progress notes. Use a unique timestamped run ID. Never overwrite a previous report.
- `docs/implementation/features/sp-05-sprint-lifecycle/evidence/antigravity-<run-id>/`: source manifests, exact commands/exit codes, redacted stdout/stderr, test results, screenshots and environment/cleanup records. Do not overwrite Codex evidence or TLS material.
- If a concrete missing assertion requires a new reproducer: `tests/workspace/sp05-antigravity/<run-id>/*.test.mjs`, using existing disposable fixtures. First record its reason, trace, expected behavior and command in the run notes. Do not edit old test expectations, fixture ceilings or production files. Enumerate these new files explicitly when running them.

Local generated `dist`/cache outputs and uniquely owned disposable PostgreSQL/browser resources are allowed by the existing runbooks. Use installed lockfile dependencies; any required clean dependency setup must preserve package manifests/lockfile. Missing TLS, Docker, Node or browser runner is **Blocked/Not run**, never **Pass** or reason to bypass checks. No new provider/service/dependency, real data transfer, valuable-data migration, source fix, historical migration/evidence edit, commit, push, PR, merge, Git cleanup or accepted-ADR change. Do not edit parent implementation statuses/registers; Codex integrates returned findings afterward.

## Sequential checkpoints

### 1. Freeze and map

Record branch, HEAD, tracked/untracked inventory and hashes before tests. Separate the runtime/test candidate from later documentation-only coordination. Build `tracking.md` (ID `SP05-AG01-TRACKING`, version0.1 Draft) as a dated assessment snapshot with one row for each P00–P15: claimed deliverable, inspected producer/consumer paths and lines, matching FR/AC/UC exception, actual reviewer test/evidence, assessment (`Not checked`, `Pass`, `Fail`, `Blocked`), and finding IDs. Link to the parent rather than duplicating its live execution statuses. Test records including parents are not counts of unique requirements.

### 2. Review producers and authority

Verify these observable assertions; a missing test is a coverage gap, while a proven wrong behavior is a defect:

| Area / owning tasks | Required review and test assertions |
| --- | --- |
| P00–P02 source/scope | Correct base/worktree; no imported S01/workflow; Must-only; FR-66/67 edit/remove not implemented or advertised; no changed 001–010/accepted ADR/baseline; all current source/contract deltas explained |
| P03 storage | 011 forward/repeat/empty reverse/reapply on disposable DB; legacy times null; exact typed immutable receipts; rollback refuses retained evidence; old 006/008/009/010 ceilings preserved |
| P04 authority/discovery | Five separate private audited capabilities; PO/SM/creator grant none implicitly; grant/revoke revision and provenance; removal/rejoin restores no capability; discovery advertises only registered/currently applicable operations |
| P05 create | Blank/invalid goal, invalid or reversed/equal dates, unknown fields/media/body size, cross-project and session/CSRF denial; valid Planned server-created timestamp; atomic original result |
| P06 reads | list/get/items current scope; cursor first/middle/terminal pages, tampering, actor/resource binding, expiry/invalidation; fresh client reconstructs current Sprint/Backlog and old Completed/Returned associations without confusing current Task state |
| P07 allocate | Task current project/read/location rechecked in transaction; expected revision is Sprint revision; Planned/Active only; two allocations cannot both remain current; per-item audit/revisions/receipt atomic |
| P08 start | Planned → Active with observed start time; only one Active per project under two actual starts; Completed rejected; empty Sprint allowed; replay does not start twice |
| P09 complete | Active → Completed with observed time; Done remains associated; unfinished returns To Do appended by Task ID with proper revisions/audit; original counts unchanged by later reopen/allocation; empty Sprint counts zero |
| P10 reorder | Entire Backlog permutation and exact decimal-string backlog generation; duplicates400, incomplete/foreign/stale409; no partial write; identical order no revision/audit; unchanged numeric positions do not gain revisions through scale differences |
| Every mutation | Current session/member/action before replay, including lost permission with unchanged/changed body; same actor/operation/key with changed canonical payload409; textual keys of two actors isolated; state+audit+receipt rollback on each failure; actual lost COMMIT acknowledgement resolves with same body/key, no second write/audit |
| P14 concurrency/SP04-P08 | Actual start/start, allocate/allocate, complete/reopen in both relevant orders, completed reopen/new allocation in both orders; old Completed association unchanged and at most one current allocation. Actual reorder races with create/allocate/complete/reopen; stale request fails without partial positions/audit/receipt. Project → Sprint → Task lock order, stable IDs and session recheck after waits |

Check 404 protected reads against the current exact generic response, and denial/outage logs for secrets/protected payloads. Distinguish same-operation historical receipts from current reads. Use controlled barriers/DB wait evidence for concurrency; ordinary sequential calls do not prove a race. SQL fixture state cannot substitute for actual complete/allocate handlers in SP04-P08.

### 3. Execute actual regression

Use Node24+, Docker and the trusted local HTTPS setup in the runbooks. Record actual versions, image digest, browser runner/version, commands, durations and exit codes. Do not print environment secrets, cookie values, TLS key bytes or private database URLs. Preserve failing attempts separately from corrected reruns. Clean up only resources created by this run.

Run build/typecheck before live UI tests:

```powershell
npm run typecheck
npm run build
npm run test:foundation
npm run context:lint
npm run context:check
npm run context:test
npm run docs:lint
npm run docs:test
npm run contracts:test
node scripts/docs/docs-metadata.mjs --check
```

Run all current top-level Workspace non-browser tests, including session/project/Task/Sprint regression; record the resolved file array rather than only the wildcard:

```powershell
$workspaceTests = @(Get-ChildItem tests/workspace -Filter '*.test.mjs' -File |
  Where-Object { $_.Name -notmatch 'browser' } | Sort-Object Name |
  ForEach-Object { $_.FullName })
node --test --test-concurrency=1 @workspaceTests
```

For diagnosis, the Sprint subset is `sprint-storage`, `sprint-http`, `sprint-security`, `sprint-concurrency`, `sprint-controller`, and `sprint-ui` under `tests/workspace/`, each ending `.test.mjs`. This subset does not replace the full relevant regression. New focused reproducers require their own explicit command/source identity.

The author reported a broad343/343 at its captured sources, then focused concurrency17/17 and controller7/7 after adding assertions. A fresh full run can have a different count. Explain source/count differences; do not require the old counter or sum overlapping runs. Context/docs/contracts/SQL shape checks are separate from actual handler/UI permission evidence.

### 4. Verify real UI, not only DOM

Run `node --test tests/workspace/sprint-browser.test.mjs` with the installed runner and trusted local certificate as documented in `SPRINTS.md`. Set `SACW_PLAYWRIGHT_MODULE` to the actual installed module if necessary. Use process-local `NODE_USE_SYSTEM_CA=1`/`NODE_EXTRA_CA_CERTS` for the trusted certificate when needed; never disable TLS verification. Use an isolated browser profile and actual disposable011 backend.

Inspect P11–P13: labelled goal/date forms, blank/reversed dates and focus, keyboard controls, full-list up/down/save, responsive layout, loading/empty/denial/conflict/outage, no page errors. Test multi-selection with actual mixed results, permission loss between items and reload while unconfirmed. Prior successes stay committed; every item has its own key; replay uses exactly its original body/key. New writes stay blocked while an unknown outcome remains. A definitive reorder409 discards old order/pages, reloads the complete list and does not automatically resend with a new key. After acknowledgement read current state; never display an old receipt as live data. Removed membership clears protected parent/child panes; logout clears recovery.

The existing Sprint browser test writes timestamped author-style `evidence/browser-*` captures. Preserve old directories and relocate only the newly created capture directory into this review's evidence directory, recording its original/new paths. Do not edit the existing test just to change its output location. Record what the browser did versus what only a DOM/controller test proved. If relevant historical browser gates are not rerun, list them and the coverage implication.

### 5. Hand back findings and tracking

Recheck source hashes and pre-flight at the end. In `report.md` use ID `SP05-AG01-RESULT`, version0.1 Draft, actual date, reviewer identity and branch/HEAD. Include:

1. What was reviewed; actual frozen inputs and source drift; expected capstone-sized use, with no unmeasured load claims.
2. P00–P15 assessment snapshot and FR/AC/UC coverage with links to `tracking.md` and specific assertions/evidence.
3. Numbered findings grouped Must fix / Should fix / Nice to have. Each needs a current path/line, concrete trigger/reproduction, expected versus observed behavior, impact, evidence and smallest proposed remedy. Separate confirmed defects, missing assertions, environment blockers, documentation drift and unresolved policy. No style-only or hypothetical findings. No findings is valid.
4. Exact executed commands/results, preserved failures, skipped/blocked checks with reasons, DB/browser environment and cleanup outcomes. Distinguish author evidence, your source inspection, your runtime reproduction and unverified inference.
5. Recommendation: `Ready for Codex reconciliation`, `Changes required: <finding IDs>`, or `Verification incomplete: <gates>`. Do not use a bare Ship/Approved verdict or close P08/M03/release/ADR gates yourself.

Return the report, tracking and evidence paths to the owner/Codex. Do not send them through external messaging tools. Codex must reconcile each finding against the named source and register any authorised fixes/retests before closing this assignment. A separate reviewer does not by itself establish formal independent acceptance.

## Readiness, completion and recovery

DoR: correct branch/HEAD and source identities; parent P15 handoff available; rules/trace read; required runtime prerequisites either available or explicitly blocked. DoD: every Must assertion has inspected/executed evidence or an explicit gap; P00–P15 snapshot complete; reproducible findings or explicit none; source before/after identity, redacted raw results and unrun limits returned. Blocked mandatory runtime gates keep verification incomplete.

Estimate: relative L, medium confidence, driven by real DB/HTTPS/browser setup and negative/concurrency cases; no calendar commitment. Risks: dirty candidate drift, credential leakage in failure logs, stale browser/process state and accidental cleanup of another run. Recovery: retain failed evidence; stop only the dependent gate, release test barriers, close owned app/browser and remove only uniquely owned disposable resources. Production corrections require a separately recorded authorised task.

## Published review navigation

PUB01 is owner-authorised to publish this assignment with the implementation. Read the Draft PR actual head and publication receipt when available; use the commit/tree as the review boundary. Antigravity may review through GitHub or its own appropriate checkout of that exact head. Publication does not mean Antigravity has executed this assignment. The earlier reviewer-inputs.json remains an immutable pre-publication snapshot.
