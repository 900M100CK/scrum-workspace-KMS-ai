# SP-03 — Backlog task creation plan

**Artifact ID:** FEAT-SP03-01\
**Version/date:** 0.1 Draft · 2 November 2026\
**Status:** Owner-authorised planning/publication only; application implementation not started.\
**Inputs:** Publication snapshots: SP-03 v0.6; IMPL-SP-03 v0.1; PRD-01 v0.9; UC-02 v0.8; SAD-03 v0.16; DATA-04 v0.14; API-05 v0.20; UX-06 v0.13; TEST-08 v0.23; PLAN-01 v0.4; Workspace v0.2.11; ADR-0018 v0.2 / ADR-0019 v0.4 / ADR-0026 v0.4 Proposed. Full source identity is below.\
**Trace:** FR-05 / AC-05; supporting FR-03/31/50/59, BR-01/02/10/11/14, UC-03 main/EX-01/EX-02; bounded SC-01 relevance, not whole-scenario coverage.\
**Owner role:** Solo project owner for material decisions; sequential development agent for authoring/implementation.\
**Planning mode:** Actual Plan mode used in the preceding conversation; the owner then authorised this saved plan/breakdown/workflow publication. Current mode is Default; no mode switch is claimed.\
**Work kind:** Feature planning with bounded documentation/publication tasks; future implementation tasks remain separate gates.

## Goal, parent and authorization

Future observable feature: an enabled authenticated actor with explicit Backlog-author authority creates one Story/Task/Bug in the authorised project; creation returns the contracted 201 Task in todo/Backlog, persists exact server identity/location/revision and mandatory audit/replay atomically, and fresh list/detail reads reconstruct it. Invalid/denied requests create no task or successful audit. This authoring turn creates the plan/WBS/task briefs and workflow, not those handlers.

Parents: [PLAN-01 Month 1](../../../planning/five-month-plan.md#calendar-and-exit-gates), [roadmap M-02](../../roadmap.md#registered-work-plans), [canonical SP-03](../../../../specs/003-create-task.md), [SP-03.1–SP-03.4 pack](../../tasks/03-create-task.md). Registers: [work plans](../README.md), [source register](../../register.md), [REG-00](../../../sdlc/artifact-register.md). WBS and task dictionary: [breakdown](breakdown.md). The central register is registration, not independent approval.

The owner explicitly authorised branch codex/sp-03-create-task, plan and task cards, project workflow extension, bounded checks, selective commit and push. Preserve unrelated prior edits; do not publish them, merge, force-push or alter the template gitlink. Only D01/D02 below are executed now. Future P01–P09 are planned and do not receive implementation authority from a ready status or this publication.

Non-goals: task content editing/reordering, assignee/state/blocker mutations, Sprint lifecycle, Knowledge/AI/provider work, a second permission service, new project scope, production migration, independent/standards approval. Existing UC-03 Alt-1/Alt-2 belong to later packs and are not silently implemented here.

## Source baseline and current-state findings

Publication baseline is main HEAD dd69700e58d28e367f94833b85a6909a5faec1a5. All source versions above describe that committed snapshot, not the uncommitted local metadata/source-link patches. The same requirement/spec files have local patch versions; record their digests separately without attributing those patches to this branch's commit. P01 must re-open actual headers at execution time and reconcile semantic changes before relying on a different revision.

- SP-01 session and bounded SP-02 project/membership handlers/UI exist; SP-03 task handlers/UI do not. Relevant reusable code is session/store.ts inspectInTransaction, session/database.ts ownedTransaction and projects/{store,outcomes,cursor,http}.ts under services/workspace/src/. Reuse only where semantics fit; avoid a speculative universal transaction framework.
- Workspace migrations 001–008 already exist. 003 has task location and project.backlog_revision; 007 adds membership/capability safety; 008 restricts durable snapshots to project/member operations. Task replay cannot simply be inserted into the existing project-only shape. P02 decides the minimal extension, and P03 uses a new migration only if required, never edits applied files.
- Existing routes are POST/GET /projects/{project_id}/tasks and GET /tasks/{task_id}. CreateTask accepts type/title/optional description; Task includes server IDs, state, assignee_id, blocked, revision and work_location. TaskList includes items/next_cursor/backlog_revision. No public API or schema is changed by this plan.
- The default list covers all project tasks ordered by task_id; Backlog lists sort numeric position then task_id and include Done Backlog work. Projection/cursor freshness and Backlog generation are separate. Never derive work_location from browser memory or state alone.
- Authority labels are descriptive; creator/Admin/PO text alone must not bypass explicit capability/current membership. Unknown or nonmember reads use the exact generic 404; known readable targets with insufficient mutation authority use the contracted denial. Recheck authentication after relevant lock waits.

## Decisions, risks and Definition of Ready

| Gate | Concrete question / required deliverable | Owner / deadline | Affected tasks |
| --- | --- | --- | --- |
| G-01 authority | Exact persisted Backlog-author capability and private provisioning/recovery; demonstrate no role-name bypass or inherited grant on rejoin. Reconcile ADR-0007 and current permission storage. | Project owner for policy; agent proposes in P02, before P03/P04 | P02–P04/P06 |
| G-02 persistence/replay | Minimal task audit/replay snapshot shape, replay current-access check, idempotency scope/hash, revision/position bounds and safe failure handling, using the existing owned store. | Agent design in P02; material policy choices to owner before P03 | P03/P04/P07 |
| G-03 read protocol | Bounded same-transaction projection/backlog_revision, actor/route/filter/order/generation/expiry cursor binding and exact decimal ordering. ADR-0018/D-04 remain Proposed until selected within a bounded authorization. | Owner disposition before dependent P03/P05; agent drafts P02 | P03/P05/P06 |
| G-04 contract discrepancy | UC-03 mentions creation timestamp but current Task wire schema omits it; resolve presentation/source mapping without adding a response field by assumption. Freeze validation/body bounds and getAllowedActions/UI applicability. | Agent inventory P01/P02; owner only if product/API decision is needed, before P04/P06 | P02/P04/P06 |
| G-05 evidence | Exact Node/TLS/Docker/browser setup, pinned disposable DB/schema ceiling, test entry points and fresh source identity must be recorded before running future application tests. | Agent, before the producing task's verification | P03–P09 |

No missing calendar date is invented: deadlines above are prerequisite gates. A gate blocks only dependent execution. Independent source preparation may proceed. DoR for an implementation task: current plan/brief read, source versions recorded, required decisions resolved with evidence, allowed paths confirmed, existing/planned commands runnable, synthetic fixture and recovery approach defined. No approval is inferred from this plan or a passing shape test.

## Implementation boundaries and failure behaviour

Canonical future code scope: services/workspace/**, apps/web/** and tests/workspace/**. Workspace owns sessions/permissions/tasks/audit/replay; no Knowledge or cross-service database write. Planned files are listed in the briefs; P02 may refine planned names within those paths and must update the task before implementation. Applied migrations 001–008 are immutable.

Current authoring scope: this folder; the requested workflow extension in agents/WORKFLOW.md and matching execution guidance; registration-only feature/source/central/roadmap/review metadata and generated REG-00 inventories. Shared contracts, root scripts and schema/API metadata are read dependencies now; any future change outside canonical paths requires a recorded coordinated-spec path update before work.

Business mutation plus task position/generation, minimum audit and replay must commit in one owned transaction. Audit/result failure rolls back every business effect. A lost COMMIT/HTTP acknowledgement is unknown, not rollback; reconcile the same actor/operation/key/body after current authority checks, with no fresh automatic key. Do not expose raw storage errors, credentials, permission inventories or cross-project metadata. Runtime AI stays read-only; versions, exact citations and provider behaviour are unaffected by this feature plan.

## Authoritative task and execution table

This is the only mutable status table. Briefs and WBS hold no independent execution status.

| Task | Deliverable / canonical child | Dependencies / gates | Estimate / basis | Status / evidence |
| --- | --- | --- | --- | --- |
| [D01](tasks/SP03-D01-plan-and-workflow.md) | Registered plan, WBS, eleven briefs and workflow adaptation | Owner instruction / source inspection | Authoring budget 2–4 h; low confidence, documentation scope | Verified documentation outcome; bounded checks below |
| [D02](tasks/SP03-D02-verify-and-publish.md) | Bounded checks and selected GitHub branch publication | D01 | Authoring budget 1–2 h; low confidence, no runtime suite | Verified bounded publication; actual receipt below; future P01 remains next |
| [P01](tasks/SP03-P01-source-reconciliation.md) | Versioned source/FR-AC/permission/test map; SP-03.1 | Published source baseline; SP-02 evidence | 1–2 h; medium, existing sources | Not started; next preparation task after this publication |
| [P02](tasks/SP03-P02-bounded-design.md) | Reviewable authority/transaction/read design and decision batch; SP-03.1 | P01; owner dispositions for G-01/G-03 where needed | 2–4 h; low, design gaps | Waiting for P01; decisions remain Proposed |
| [P03](tasks/SP03-P03-owned-persistence.md) | Minimal owned persistence and rollback evidence; SP-03.2 | P02 and G-01/G-02/G-03 | 2–4 h; low, reuse 003/007/008 | Waiting for design |
| [P04](tasks/SP03-P04-create-task.md) | Authorised atomic createTask and replay; SP-03.2 | P03; resolved G-04 | 2–4 h; low, session/project patterns | Waiting for persistence |
| [P05](tasks/SP03-P05-task-reads.md) | Current-scoped getTask/listTasks projections; SP-03.3 | P02/P03/P04 and G-03 | 2–4 h; low, existing cursor patterns | Waiting for design/create |
| [P06](tasks/SP03-P06-task-ui.md) | Actual create/list/detail UI and reload/recovery; SP-03.3 | P04/P05; current action discovery | 2–4 h; low, preserve existing React UI | Waiting for handlers |
| [P07](tasks/SP03-P07-permission-failure-races.md) | Persisted permission/failure/race evidence; SP-03.4 | Starts with P03–P05; finishes before their verification closes | 2–4 h; low, barrier fixtures | Waiting for producers; mandatory negatives stay with producers |
| [P08](tasks/SP03-P08-ui-browser-evidence.md) | DOM plus separate actual-browser evidence; SP-03.4 | P06; installed runner/TLS | 2–4 h; low, existing DOM/Edge fixtures | Waiting for UI |
| [P09](tasks/SP03-P09-regression-handoff.md) | Integrated AC trace, regressions and dated handoff; SP-03.4 | P03–P08, G-05 | 2–4 h; low, suite size unknown | Waiting for integrated evidence |

Estimates are rough engineering budgets, not measured delivery or a calendar promise; total future P01–P09 is 17–34 h before material decisions/rework. Re-estimate after P02. Split a task before execution if it exceeds one reviewable deliverable or the four-hour upper authoring estimate; preserve stable parent IDs and all Must coverage. One agent executes sequentially; no capacity/delivery date is fabricated.

## Acceptance and verification strategy

| Requirement / scenario | Required assertion | Producer / closure |
| --- | --- | --- |
| FR-05 / AC-05 positive | Each supported type yields 201, persisted correct project, todo/Backlog, server IDs/revision and fresh matching list/detail | P03/P04/P05/P06; integrated P09 |
| AC-05 / UC-03 EX-01 | Unsupported type, malformed/extra/invalid input produce the declared validation failure; no task, generation, success audit or replay effect | P04/P07 |
| FR-03/59 / UC-03 EX-02 | Unauthenticated, nonmember/foreign/unknown, disabled/revoked and member-without-author cases deny appropriately; descriptive PO alone cannot create | P03/P04/P05/P07 |
| FR-31/50 / BR-11 | Atomic audit; injected storage/audit/result failure leaves no partial creation; same key/body returns original outcome, changed body conflicts, current authority precedes replay disclosure | P03/P04/P07 |
| NFR-02 / existing SP-03 placement | Controlled concurrent appends have deterministic unique persisted order and exact Backlog generation, no lost update; revocation/expiry during waits does not authorize later output | P03/P04/P05/P07 |
| Fresh client / SC-01 subset | Create/list/detail reload from server; correct all-vs-Backlog order and work_location; cursor malformed/foreign/stale/expired cases; UI clears denied/stale scope | P05/P06/P08 |

Existing documentation commands: npm run context:lint, context:check, context:test, docs:lint, docs:test; metadata sync only for coordinated registration. Existing future runtime prerequisites: npm run typecheck, build, test:foundation, test:projects, session suites and separate project-browser gate with their documented Docker/TLS requirements. Planned task-specific test paths/commands are specified in the briefs, not claimed installed or executed. If P02 selects different test filenames/root scripts, register those choices before implementing them. Do not change a test expectation to manufacture a pass.

Fixture policy: synthetic two-project accounts with separate roles/capabilities, enabled/disabled/revoked membership, deterministic replay keys, real disposable PostgreSQL for persistence/HTTP/lock schedules, isolated HTTPS/browser profile for UI. No valuable development DB mutation. Historical storage/session ceilings at 006 remain; current SP-02 tests use 008; new SP-03 fixture ceiling follows the selected new migration explicitly.

D01/D02 verification is structural/context/link/commit-boundary only; zero task handler behaviours, no PostgreSQL/HTTP/DOM/browser/build/provider/evaluation run. Full SC-01/SC-06, D-07 and SP02-F01 future SP-04/SP-06 races remain open. Planned SP-03 tests do not close those gates.

## Tailoring, governance and handoff

Use the three v2.0 development prompts as content guidance, with their source digests recorded in [source identity](#source-identity). Project layout replaces docs/05-development/ examples; plan.md replaces a separate project SDP for this bounded feature; breakdown.md provides WBS/dictionary; the plan table replaces a second mutable INDEX. Task briefs retain the template's objective/context/scope/input/path/guidance/acceptance/check/DoD/risk/rollback/dependency/guardrail/open-question information. Existing FR/AC IDs are preserved; local task/WBS IDs add no business requirement.

The owner chooses product scope/material policy; the agent proposes bounded mechanics, authors artifacts and runs authorised checks; independent reviewer is unassigned. Status does not grant approval. The WBS refines PLAN-01 Month 1/M-02 and the existing pack, with no new calendar, cost, dependency reorder or Must deferral. Project-wide staffing/budget/maintenance/retirement remain PLAN-01 and existing operational sources; no invented numbers or extra provider procurement. Feature recovery follows reversible new migrations only on authorised disposable data; rollout and actual deployment remain future gates.

Template checklists are not standards certification. Self-check applicability: source identity/trace/paths/task dependencies/DoR-DoD/estimates/negative coverage/publication boundaries are checked in D02; independent standards/workbook review is Not run, not a fabricated score. Communication is the canonical plan/handoff and owner-facing result; review findings route to the earliest owning artifact. No source requirements, accepted ADR or template content is amended by tailoring.

Publication uses selected deltas on committed dd69700e58d28e367f94833b85a6909a5faec1a5, verifies the exact candidate tree with the pinned old template contents, and preserves dirty local files separately. A plain working-tree pass is not substituted for a candidate-tree check. Workflow templates inspected at the newer local revision are identified as external inputs absent from the old pin; this limitation is explicit, not silently repaired by a gitlink update.

Next: finish D01/D02 only; future P01 source preparation is the next implementation-pack task when separately requested. P02 must settle the listed mechanics before P03–P06; no task starts merely because its brief exists. Actual results and failures are recorded below, using the existing handoff conventions. Author verification is not independent acceptance.

## Execution evidence

Actual bounded results are recorded below. No task handler implementation, predicted SHA or independent approval is inferred.

## Source identity

Committed source versions are frozen at dd69700e58d28e367f94833b85a6909a5faec1a5; working-tree digests are recorded as separate local observations, not publication inputs. Sources are immutable evidence of what was inspected, not authority to change requirements.

| Source | Publication baseline SHA-256 | Observed local SHA-256 |
| --- | --- | --- |
| docs/sdlc/PRD_SRS.md | 3bfbddafc0a5488afa1ec5ef29d06648adf67c00ebb532534abe747c5e07925e | b0b013d3237cf4eb71a0c074a444c8e4ce12831ddd8b9457479a0692fd0ef8ab |
| docs/sdlc/use-cases.md | cbe41dfda6039db0822011b719ff9bc4ba7944d75e9d100c7901d36a5fa0d37b | 29475d6da902b1b3bbebae65e822cbc4c4292d122149f6c29d0cd6e154bbf616 |
| docs/architecture.md | cc89ae3c4df29e055ee601f3207933109ace492a2093bc4380275d8a412371a1 | a99772633e51ce45cfa7301c41c39032b23a78dd8b941df9fe09345d8b943b05 |
| docs/sdlc/data-design.md | 8a8790461d86dfccdde6b62d6997ce46ff5f7058be8114d329261b0b964e89e4 | 68ca283d2b6c743b8bc2df623ce49609766f542a6b892f679adb474a7696d0bf |
| docs/sdlc/api-design.md | 128de44c6351d5319a45410e97198f74a3ebea05f8ffda80218c8814646ee106 | e00d67a8f68304e5ca8b996db427c75c1297ae97b1b86ed9501881f0f8add5ff |
| docs/sdlc/ui-ux-spec.md | d7eb505ff8ad9570655b7063ef5e881d27e4da2c5f92a3162c221f011917667a | 95a801a8ab96fe3a7d432df69414e94b1aa6abf7f77beddb37218e896150328e |
| docs/sdlc/test-plan.md | a6e3962812ab08e4802c4049fa2994ac85d1ac5121da2c89e621a7d06c6f3d38 | 727db68c774b06724428d605b50da9b5ded8b1827ca07100c4a88d6a05d1cbe4 |
| docs/planning/five-month-plan.md | 36ab17ddd0d694e269590e8f9f542cc13cb13c593c6221680b3690403dd123da | 33eef3af5de2dd269d24b42fc5837abc64fb11b152da0444fa371ad10cad5efe |
| specs/003-create-task.md | 342f4ab09fca12199853a416fcad27ab630adda47ffe4d51492b6e3871f8f838 | dc3c2ec1ec44e8a1ec1cae87ed3c2dad120e511b1f72aa04e1a6e44db03436fb |
| docs/implementation/tasks/03-create-task.md | e0096bab41695613bb157c6da8d454722851a8989077adb3f1f81b979db80366 | 81edb27a73db6d0ff66658cd1f08b1f4de0782bbb26b8158b43745073d415a31 |
| contracts/openapi/workspace.openapi.json | 36244b33701655cde4b894821350693d3feaccac8406c6a85afef8bf55f2cc38 | 36244b33701655cde4b894821350693d3feaccac8406c6a85afef8bf55f2cc38 |
| services/workspace/migrations/003-work-location.up.sql | b0c4919576bbaeba73bb7e54f7e3cc16329986fdd2ed2bb8a8379aeec1c70e72 | e73b8af5f4cae23ee0368cf0577d881d0a2560a133a69b2fa38876b060a6727c |
| services/workspace/migrations/008-project-outcomes.up.sql | 91f6fa1c4654341d485be0b5ed226380b0e4b06f29c94fe196631e2e3fe4e6a2 | 91f6fa1c4654341d485be0b5ed226380b0e4b06f29c94fe196631e2e3fe4e6a2 |

Template inputs below are v2.0 at local tracked revision 6996dae13b2bfe31e77b5d90bb5eb24888a6a910, from https://github.com/minhtrantrong/SDLC-Prompt-Checklist.git. They are absent at parent pin 3c65f5cbefa7d69a75cadd89b177e3add8b400b0; no gitlink update is included.

| Template path relative to SDLC-Prompt-Checklist | SHA-256 |
| --- | --- |
| development/DevPlan_ISO_24748_5_Prompt.md | 3aab4fda4a8da0d281e174b04f24f6ee1618fe21d642cb546fd705cef129f560 |
| development/TaskBreakdown_ISO_21511_Prompt.md | 70450b841233c63e2b5ce3dff31e7e12ed47434d521a9433044737b734c78bd1 |
| development/Implementation_Task_Prompt.md | 88e430cc3dc2acb20de9200942978e8522a7d490b4052f116d603997d16e2dcb |

D01 intermediate check: candidate metadata sync and docs lint passed. Initial working-tree docs lint failed because the pre-existing review-register input still referenced workflow v0.1 after the requested local workflow revision v0.2; synchronized that input only. No runtime/test expectation or prior evidence changed.

## D01/D02 bounded verification result — 2 November 2026

D01 authored the plan, WBS/dictionary, eleven briefs and project workflow adaptation; future P01–P09 remain Not started or waiting on prerequisites. Independent review is unassigned. D02 subsequently verified the initial selected commit/push and remote comparison; see the publication receipt below.

[Check record](evidence/planning-checks.json) distinguishes working-tree checks from the exact selected publication candidate and retains failed attempts. [Captured logs](evidence/planning-logs.zip) include all five successful working-tree commands, the failed initial candidate npm startup attempts and all five successful candidate reruns. Node 24.21.0 was selected explicitly; dependencies already installed were reused. The candidate contains committed source baseline plus selected planning changes and the unchanged pinned template archive; this is not a clean dependency-install or full application reproduction.

| Check | Working tree | Selected publication candidate |
| --- | --- | --- |
| npm run context:lint | Passed | Passed on attempt 2 |
| npm run context:check | Passed | Passed on attempt 2 |
| npm run context:test | 45/45, zero skips | 45/45, zero skips on attempt 2 |
| npm run docs:lint | Passed; structural only | Passed; structural only on attempt 2 |
| npm run docs:test | 20/20, zero skips | 20/20, zero skips on attempt 2 |
| New local links/anchors | Checked across both trees | 166 references across both trees; no missing target/anchor |
| Task contract | 11 briefs, 14 required sections each | Parent is the single mutable status table |
| Preservation | 107 initially dirty tracked files outside the selected paths retain their initial bytes | No old dirty content is selected for publication |

Failure history is evidence, not erased: initial live docs lint exposed the review-register workflow input version and was corrected; initial candidate npm startup could not resolve a module before running scripts, while the existing system npm CLI under Node 24 passed on rerun. No dependency installation, expectation weakening, source/template reset or runtime change was used.

Unrun: PostgreSQL, task/session/project HTTP/DOM/browser suites, application build/typecheck, provider/evaluation, fresh-install and independent/workbook standards review. This authoring change verifies zero task handler behaviours. Proposed decisions, full scenario/security/deployment and future SP02-F01/D-07 gates remain open. Final selected-diff/whitespace and publication receipt are recorded after actual verification, not predicted here.

Selected-tree boundary check: staged blobs match the checked candidate in Git-normalized form. Initial raw-byte comparison encountered Windows CRLF materialization from git archive; comparison of Git blob hashes with only CRLF normalization confirmed every unselected parent file is unchanged. Baseline source digests above refer to raw committed blob bytes; local digests refer to observed local bytes. Scoped staged whitespace passed.

## Publication receipt and final handoff

The initial publication commit is 65ec8078bacdc73421bd93155878a1090989bc00 on codex/sp-03-create-task, based on dd69700e58d28e367f94833b85a6909a5faec1a5. `git push --set-upstream origin codex/sp-03-create-task` succeeded, and `git ls-remote --heads origin refs/heads/codex/sp-03-create-task` returned the exact same SHA as local HEAD. [Publication receipt](evidence/publication-receipt.json) preserves this actual observation. This final receipt is a normal follow-up documentation commit; its eventual SHA is verified in Git/remote output rather than predicted inside itself.

The initial selected commit contains 25 planning/workflow/registration/evidence files only. Its staged blobs were checked against the candidate; 806 unselected parent files were unchanged after accounting for Windows archive CRLF materialization. Prior dirty source/spec/runtime/template/profile work was not included. Scoped staged whitespace passed. Full source identities and the unchanged template gitlink remain recorded above.

Final pre-flight: owner-authorised scope and Git publication respected; source/FR-AC/BR-SC trace, single task-status authority, planned paths/commands, decision gates and actual-versus-planned evidence checked. D01/D02 documentation outcomes are verified; future P01–P09 remain unexecuted and retain their prerequisites. No application feature, cross-service write, accepted ADR/baseline change, deployment, dependency installation, independent review or parallel agent is implied. Next future work is P01 source reconciliation when requested. Unrelated prior edits remain in the working tree.
