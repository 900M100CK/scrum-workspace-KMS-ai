# SP-04 — Codex and Antigravity coordination

**Artifact ID:** SP04-COORD-01\
**Version/date:** 0.11 Draft · 4 November 2026\
**Status:** P03C private authority/exact read discovery completed by Codex; no active external assignment.\
**Inputs:** [FEAT-SP04-01](plan.md) v0.13; [SP04-OWNER-01](owner-decisions.md) v0.1; [SP04-P03A](tasks/P03A-contract-support.md) v0.1; [SP04-P01-MAP](source-review.md) v0.2; [SP04-AG01](tasks/AG01-source-crosscheck.md) v0.3; [SP04-AG02](tasks/AG02-evidence-correction.md) v0.1; [SP04-AG03](tasks/AG03-p02-design-correction.md) v0.1; [SP04-DECISION-BATCH](decision-batch.md) v0.4; existing SP-04 requirements/ADRs/contracts from the parent.\
**Trace:** SP-04.1 / FR-09/40/43/44 and supporting FR-31; PLAN-01 Month 1 / M-02–M-03. No feature scope or policy change.

## Current assignment and ownership

The owner asked Codex to coordinate and assign work to Antigravity. The [parent task table](plan.md#tasks-and-acceptance) remains the single mutable status record. This file is the execution/communication protocol, not a second plan, approval system or autonomous agent runner.

| Owner | Deliverable | Write ownership |
| --- | --- | --- |
| Codex — coordinator/integrator | Maintain parent status/assignments/owner dispositions and reconcile returned source/evidence | Codex-owned parent/coordination/tasks/owner files; no competing shared support edits during actual P03A execution |
| Antigravity — returned P03A support producer | Add 413/415 declarations for four future Task mutation operations and required version/input metadata | Exact support paths/evidence in P03A brief only; no runtime, migration or policy-body edits |
| Project owner | Product/material policy choices and external handoff | User decisions; no automatic ADR acceptance or scope changes |

There is no direct Antigravity connector in this session. AG01/AG02/AG03 are complete as source/design contributions. The owner explicitly selected the three policy choices; [owner-decisions.md](owner-decisions.md) is their provenance. **Current written task: [P03A transport contract support](tasks/P03A-contract-support.md) only.** It is ready for manual delivery, not claimed received/executed. No P03A2/P03B/handler/migration is dispatched by it.

## Historical AG01 start procedure — not the current assignment

1. Open D:/scrum-workspace-KMS-ai. Confirm the active branch is codex/sp-04 and record actual HEAD/status. Do not switch branches, stash, reset or create a new worktree. The separate old codex/sp-04-update-task checkout is outside this assignment.
2. Read AGENTS.md and docs/development-rules.md, the pre-flight checklist and agents/WORKFLOW.md. Read this file, the parent plan, source-review.md and tasks/AG01-source-crosscheck.md. Apply the project's required review guidance; it does not grant fixes or approval.
3. Read evidence/p01-source-inputs.json and evidence/p01-checks.json as the recorded P01 snapshot. Inspect the actual referenced code/contracts/ADRs. Record current source SHA-256/versions; report changes from the snapshot without silently treating old tests as new evidence.
4. Execute **AG01 only**. Use read-only file/search/hash inspection; do not run tests, install packages, provision accounts, touch databases, start servers or change implementation. This task checks source assertions, not runtime behaviour.
5. Write the single report below, then return its absolute path plus the most consequential findings to the owner/Codex. Do not proceed to P02, code, fixes or another assignment automatically.

## Historical AG01 definition of done

The findings report must contain:

- Reviewer identity, actual date, branch/HEAD and exact source versions/hashes inspected. Identify any source drift during review and its effect on the conclusions.
- A verdict for each C01–C06 in source-review.md: confirmed, refuted or unresolved, with exact source file/line evidence. A design question is not automatically a defect.
- A check of expected revisions, permission provisioning/action discovery, original-key recovery, audit/result atomicity, blocker ordering, membership-removal/assignment ordering and completed-Sprint reopening. Distinguish current handlers from SQL constraints and future SP-05 dependencies.
- An audit-data assessment: which existing Must records support state/assignment/Sprint-scope history and what is unproven. Do not add chart requirements, estimates, a scheduler or a speculative historical subsystem.
- Actionable findings ordered by impact: source/evidence, consequence, proposed correction and owning task. Explicitly say when there are no findings; do not fabricate issues or test results.
- Checks actually performed and checks not run. No claim of tested multi-process behaviour, complete SP-04, security certification or independent release acceptance.

Report heading: `# SP-04 AG01 — Antigravity source cross-check`. Use Artifact ID SP04-AG01-RESULT, version 0.1 Draft, actual date and status Findings only. Organise content as Sources and scope; C01–C06 dispositions; Additional findings; Audit/history assessment; Checks and limits; Handoff. A compact report is preferred when the evidence permits.

Do not overwrite an existing report. If the assigned output exists, return that fact and identify a proposed distinct revision path; do not delete or replace earlier evidence. Do not edit the plan, task, coordination file, registers, source-review, tests, contracts, migrations, runtime or UI.

## Return and integration protocol

1. Antigravity returns the report path and findings; that is the acknowledgement that AG01 was executed. A missing connector is handled by owner copy/paste, not by inventing a dispatch receipt.
2. Codex checks report/source identity and evidence for each finding. Record accepted/refuted/needs-decision dispositions in a new report under this feature's reviews/ folder, then update only the parent's AG01 task row. Preserve Antigravity's original report.
3. Routine factual/document corrections within current authorisation may proceed. Material capability, contract, retention or policy choices are presented concretely to the owner; continue unaffected authorised preparation while a dependent decision is pending. A review does not authorise fixes outside the registered scope.
4. Only after reconciliation define the next small P02 deliverable and its exact file ownership. Future parallel implementation is not dispatched by this file. Never let two agents write the same contracts, runtime files, registrations or metadata concurrently.

Codex's P01 author verification is already recorded separately. It remains bounded source/structural evidence while AG01 is pending. No build, application/DB/browser/load/provider test, new dependency, commit/push or external transfer is part of this coordination update.

## Completed correction and next handoff

Both report paths are now evidence and must be preserved. Read reviews/ag02-codex-final-disposition.md for exact remaining citation corrections and accepted P02 input observations. Codex owns refinement of the next small P02 design assignment; the current source-check receipt does not dispatch implementation or another Antigravity task. The parent table owns actual status. Any later assignment must define its deliverable, source versions, allowed output and verification before execution.

## Historical AG03 assignment and completed handoff

Read tasks/AG03-p02-design-correction.md and reviews/p02-codex-disposition.md. Correct the proposed decision-batch to v0.2 and create p02-codex-report-v0.2.md only. Keep receipt snapshots and previous reports intact. Address R01–R07, list remaining material owner choices and do not mark P02 or any decision accepted. No test/DB/server/code/contract/schema/branch operation or additional task is permitted. Return the two paths and correction summary, then stop. Codex reconciles before any owner decision or implementation readiness claim.

This assignment was returned and is not active. Read decision-batch.md v0.3 and reviews/ag03-codex-disposition.md for the current corrected technical baseline and the three material owner questions. Codex keeps ownership of registration, selected-policy recording, producer briefs and integration. Do not dispatch or execute another Antigravity task automatically while a required policy branch is unselected.

## Historical P03A start and return protocol

1. Read tasks/P03A-contract-support.md, owner-decisions.md, decision-batch.md v0.4 and the actual parent status. AG01/AG02/AG03 instructions above are historical; do not repeat them.
2. Confirm branch/source identity and freeze the exact existing contract/support inputs before edits. Register coordinated support paths/version metadata in the canonical spec/register before changing the shared contract. This is a small support slice, not permission to implement handlers.
3. Antigravity has sole write ownership of the brief's permitted contract/metadata/support/evidence files during this task. Codex does not concurrently edit those shared paths. Do not touch parent/task/coordination/owner files or unrelated dirty work. Forbidden runtime/migration/test/body-policy changes remain forbidden.
4. Add exactly four pairs of 413/415 response declarations, run the registered structural checks with real logs/source/runtime identity, and return reviews/p03a-contract-support.md with changed paths, all attempted commands and actual results. Do not claim a missing handler ran or use a shape check as permission evidence.
5. Stop after P03A. Codex reviews and updates parent status. P03A2 will separately align selected policy/UC bodies and its mechanics record before P03B storage/authority work; no automatic next task or commit/push.

## Historical P03A receipt and next gate

P03A was returned; [SP04-P03A-DISPOSITION v0.1](reviews/p03a-codex-disposition.md) and the parent own its bounded closure and limitations. The shared P03A write lease has ended. Original report/hashes/logs are preserved; coordinator metadata changes supersede mutable latest-file hashes without relabelling the receipt. No further Antigravity task is active.

P03A2 remains a planned source-alignment prerequisite, not an executable assignment. Codex must first refine/register its exact scope, including canonical support paths/backlink, owner-selected policy, UC wording and a bounded Proposed mechanics ADR before storage/authority producers. Do not begin P03B or request the three settled choices again.

## Historical P03A2 result and next producer boundary

The owner explicitly requested execution of P03A2. Codex refined/registered SP04-P03A2 v0.2 and executed canonical source alignment sequentially. [SP04-P03A2-RESULT v0.1](reviews/p03a2-source-alignment.md) records actual checks, metadata scope and preservation limits; ADR-0028 remains Proposed. The P03A2 source prerequisite is complete, not runtime/independent acceptance. Original owner replies and Antigravity receipts stay preserved.

No external assignment is active. Next is a separately refined/registered P03B storage/types/disposable-verification brief; do not apply a migration, alter historical ceilings or start handlers from the P03A2 source report. Three policy choices are settled, not another permission question.

## Historical P03B result and next producer boundary

Owner-requested [SP04-P03B](tasks/P03B-mutation-storage.md) is implemented and verified at storage/types layer. [SP04-P03B-RESULT v0.1](reviews/p03b-storage-result.md) and parent/evidence own actual results and limits. No active Antigravity task or shared-write lease. P03C private audited selected-action tooling and exact Task discovery need a separate scoped brief before implementation. Current read/action authority remains mandatory for future replay callers; a storage result is not permission/HTTP acceptance. No settled policy question is reopened, no valuable-data migration or publication.

## Current P03C result and next producer boundary

[SP04-P03C](tasks/P03C-task-authority-discovery.md) delivered private selected-action tooling and exact current Task discovery under owner request. [SP04-P03C-RESULT v0.1](reviews/p03c-authority-result.md) and the parent record actual results/limits. No external task/write lease is active. Next separately refine/register P03D1 Backlog edit with current authority/Backlog/revision/audit/original-outcome HTTP negatives; do not infer implemented mutation/history handlers from synthetic registry projections. No settled policy question is reopened or automatic migration/publication authorised.


P03D1 navigation — 4 November 2026: [SP04-P03D1](tasks/P03D1-backlog-edit.md) is the current registered edit-only producer; [plan](plan.md) v0.13 owns status/evidence. No external assignment or automatic later producer.

P03D1 result: [bounded edit report](reviews/p03d1-edit-result.md) records real disposable HTTP/store/race verification; [plan](plan.md) owns current results and next producer. No edit UI or later mutation handler acceptance; no active external assignment or publication.


Current owner continuation — 4 November 2026: [plan](plan.md) v0.14 authorises sequential remaining producers, meaningful verification and bounded commit before hotfix switch. P03D2/P03D3 and refined P04–P07 briefs apply. P08 actual-SP05 prerequisite remains open; no full acceptance or unrelated publication.
