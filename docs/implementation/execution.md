# Agent execution protocol

**Artifact ID:** IMPL-EXEC-01\
**Version/date:** 0.8 Draft · 2 November 2026\
**Status:** Execution guide subordinate to root rules and canonical specs.\
**Inputs:** [source register](register.md); [decisions](decisions.md); SPEC-INDEX v0.7; ADR-0001–ADR-0025.\
**Trace:** Existing BR-01–BR-14 / SC-01–SC-08.\
**Owner role:** Sequential development coordinator.

## One bounded step per turn

For feature work, fixes, hotfixes and standalone testing, complete the [Plan mode and saved feature plan gate](../development-rules.md#111-work-planning-gate) before starting work. Use the [work register/template](features/README.md), register parent PLAN-01/spec/milestone links and small tasks, then execute ready child tasks from that file. A continuation reuses the existing feature plan; the current chat is not the only task record. If Plan mode is unavailable, disclose it and persist the same plan before coding; do not invent a mode switch. Existing feature/slice evidence and decision gates remain binding.

1. Read the root rules/pre-flight and required local development skills before coding/review. Inspect branch, dirty work and actual implementation conventions. Preserve unrelated changes; no commit, push or parallel agents unless requested.
2. Read the selected task pack, canonical spec, exact FR/AC rows, UC/EX flows and operation contracts. Record source versions. Verify Proposed dependencies against [decisions](decisions.md).
3. State the user-observable outcome, allowed paths, prerequisites, failures and meaningful tests using the [brief template](handoff-template.md). Preparation-ready does not mean implementation-authorised.
4. Implement the smallest complete behaviour through UI, handler and owned storage as applicable. Reuse the existing synthetic UI's selected visual direction; replace fixtures slice by slice, without disguising remaining synthetic screens as live.
5. Execute actual checks, inspect failed results and fix within scope. Re-run only impacted checks. Finish with pre-flight section 9, evidence and a precise next step.

## Proposed decisions, experiments and adoption

A Proposed ADR is an input for comparison, not evidence of owner acceptance. Authorised bounded experiments may proceed with recorded paths, synthetic data, exact dependencies and explicit limitations. Record their results as preparation evidence. Isolation by branch or temporary directory does not itself grant authority. Do not adopt packages into application manifests/lockfiles, change protected contracts/migrations or close a whole pack because an experiment passed. Resolve only material gates touched by the selected slice; continue independent authorised work.

For each dependency, record purpose, exact version tested, install location, direct/transitive distinction and intended application disposition. If it changes a material architecture/policy choice, prepare a concrete decision batch before adoption. Preserve unrelated dependency changes. A lexical lint or static coverage rule cannot establish transaction/audit/permission behaviour.

Link a dated handoff containing actual commands/results from every changed child status. A preparation deliverable can be ready for review while runtime checks remain Not run. Do not mark it Verified when its stated exit includes missing experiments or owner decisions. Common exit requirements live here; selected child briefs add their exact contract assertions and do not redefine upstream wire names.

For the first batch, use the [SP-01.1 brief](briefs/SP-01.1-session-foundation.md) and [reconciled review](improvement-report-techstack-to-sp.md). A source/version/link check is a navigation prerequisite, not proof that an agent read or semantically reconciled the inputs.

## Reusable patterns, not a universal transaction framework

| Pattern | Boundary and tests |
| --- | --- |
| Query | Session/current scope, authorised selectors, correct empty/error distinction; protected response handoff rules apply where required |
| Local command | Validate authority and expected revision with the owning transaction/concurrency design; atomically commit business state, mandatory audit and replay record where required |
| Cross-service workflow | Owned local transactions, authenticated scoped calls, stable operation identity, bounded waits and explicit uncertain outcomes; no distributed DB transaction |
| AI question | Scoped discovery → frozen exact context/evidence → durable preparation outside guard → fresh authoritative checks and guarded provider handoff → buffered generation outside guard → citation/support validation → fresh durable answer preparation and guarded delivery |

Share small technical utilities only when justified by implemented repetition. No copied permission policy, shared cross-service DB client, universal transaction around HTTP/LLM waiting, or role-derived document-read. Existing contracts determine wire names and enum values. Do not copy the illustrative generic HTTP client from the discussion: use exact routes/methods, actor/session context, error status/schema and operation-specific retry semantics.

## Verification expectations

- Domain checks exercise rules independently of UI/provider adapters.
- Owning-service integration checks use real persisted state for constraints, transaction rollback and replay. Test minimum audit failure separately from optional metric/sink failure.
- Consumer checks may use synthetic doubles. Add provider checks against real handlers and actual inter-service HTTP/failure behaviour; in-process boot or response schema validation alone does not prove service isolation.
- Concurrency tests control the interleaving with barriers at the enforcement point, rather than merely launching two requests. Check final DB state, audit/replay state and actual protected transport bytes as relevant.
- UI checks cover reload/reconnect, keyboard action, loading/empty/conflict/unknown/denied/dependency states where applicable. No fabricated polling/status endpoint or health-based permission guess.
- Keep English synthetic corpus/questions. Research RQ and safety EVAL suites remain separate. Valid locators do not prove supported claims. Compare matched keyword retrieval before claiming improvement; manual/helper baseline is required for time-saving claims.

## Available commands and evidence boundaries

Use Node 24+. Existing commands are in [package.json](../../package.json). `npm run context:lint`, `context:check`, `context:test` check the scaffold. `docs:lint`, `docs:test`, `contracts:test` require installed dependencies (`npm ci` when needed). Review existing dependency changes before installation; never overwrite unrelated lockfile work.

Storage commands and destructive rollback cautions belong to the [runbook](../../infra/postgres/README.md). The [UI preview guide](../../design/prototype/README.md) documents local preview checks. These are not live application acceptance. The shared foundation now has actual root dev/typecheck/build/test commands documented in apps/web and services guides; these verify framework readiness only. Add later feature commands with actual installed and verified entry points. Do not promise a nonexistent `npm test` or production launch command.

For each result record command, runtime/configuration, source revision or dirty-worktree digest, fixture/corpus identity, assertions and outcome. Record Not run explicitly. No commit is needed just to obtain evidence identity; do not invent a SHA. Retain failed results and distinguish later reruns.

## Progress vocabulary

Child steps use Not started → In progress → Implemented, not verified → Verified. Use Waiting for decision/dependency or Failed verification when accurate. Preparation can be finished while implementation remains gated. Verified requires the child assertions; a whole spec requires all its Must ACs and applicable integration/negative cases. Optional omissions are stated explicitly. Separate author verification from independent review and owner acceptance.

Update only affected task status rows and link a dated result; bump changed artifact versions and register them. Canonical verification tables receive their actual evidence without relabelling structural checks as runtime passes.

Checklist: Pass for workflow and evidence rules; Gap for executable application commands/behaviour. Handoff: use one child step and [handoff template](handoff-template.md).

## P10 input metadata — 28 October 2026

Input versions synchronize the bounded session lifecycle update. Existing requirement, evaluation and UI assertions remain unchanged; no runtime acceptance is inferred from this metadata revision.

## P12 integrated handoff — 28 October 2026

See [P12 result](../sdlc/reports/SP-01-P12-handoff-2026-10-28.md) for bounded integrated session/UI regression, owner local test feedback and screenshot evidence. AC-01/36/37/68 and applicable session producers/UI are mapped there; D-07, other protected features, full cross-browser/accessibility and deployment/formal ADR gates remain open. No new requirement or independent acceptance is inferred.

## Feature planning, task breakdown and execution

**Workflow extension:** SP03-WORKFLOW-01 v0.1 Draft · 2 November 2026. Owner-authorised project adaptation; not standards certification or runtime acceptance.

Use the current canonical specifications under docs/sdlc/, their linked architecture/contracts, PLAN-01 and one bounded spec as inputs. Reuse the existing roadmap and registered feature folder; do not create another top-level project plan or relocate specifications to template example directories.

| Gate | Template and purpose | Project output and exit condition |
| --- | --- | --- |
| 1. Source reconciliation | Read requirements, use case, design, contract, test trace, decisions and actual implementation | Record IDs, source versions/revisions, scope conflicts, prerequisites and permission/failure implications. A Proposed decision remains Proposed. |
| 2. Draft development plan | development/DevPlan_ISO_24748_5_Prompt.md | docs/implementation/features/<work-id>/plan.md: observable goal/non-goals, parent milestone, ownership, allowed paths, risks, dependencies and acceptance strategy. |
| 3. Deliverable/task breakdown | development/TaskBreakdown_ISO_21511_Prompt.md | breakdown.md contains WBS/dictionary, dependency order, estimates/basis and existing child-ID mapping; tasks/ contains one executable brief per stable task ID. |
| 4. Reconcile and register | Recheck plan against the breakdown and every applicable Must AC | Register entry/plan/breakdown/task IDs in feature/source/central registers and roadmap before implementation. Keep the only mutable task-status table in plan.md; README, WBS and briefs link to it. |
| 5. Execute one ready task | development/Implementation_Task_Prompt.md | Reopen plan/brief, verify actual inputs, implement within allowed paths, run specified checks, preserve failures and record result/handoff in the plan. Continue authorised ready children sequentially. |

The three prompts above were inspected at template revision 6996dae13b2bfe31e77b5d90bb5eb24888a6a910 (v2.0 each). The parent gitlink 3c65f5cbefa7d69a75cadd89b177e3add8b400b0 has an older flat layout and does not supply these development prompts. Resolve against the actual tracked template tree and record its revision/digests; if unavailable, flag the dependent template review rather than inventing a path, copying local duplicates or changing the gitlink. The saved SP-03 plan is self-contained. This extension neither installs templates nor claims fresh-clone template availability.

A task brief must specify one reviewable deliverable, objective/context, inputs and FR/AC/BR/SC trace, dependencies/gates, existing/planned file paths, closed allowed scope and non-goals, acceptance assertions, exact existing or explicitly planned commands, DoR/DoD, estimate/confidence/basis, risk, safe rollback, execution guardrails and result/handoff target. Split oversized tasks without moving mandatory negative/audit/concurrency coverage away from their producers. Preparation or a structural pass cannot close application acceptance.

Project/owner/platform rules override template examples: use English artifacts and the owner's language in conversation; preserve IDs and the single project registry; do not infer scope, owner approval, dates, standards compliance, role permissions, automatic commits or agents. The template's default stop-on-dirty-tree, repeated approval and automatic-commit steps do not override an owner's explicit bounded authorization to preserve unrelated work and proceed. Pause only the dependent work on a material missing decision, unavailable prerequisite or failed required gate. Commit/push/review authority remains explicit and task-specific. Use Plan mode when available, otherwise disclose its absence and complete the same written gate.

Use the task-specific implementation invocation: read AGENTS and this workflow, reopen <work-id>/plan.md and tasks/<task-id>.md, confirm the registered source/branch/path scope and DoR, execute only that ready task, run its actual commands, then update the plan's evidence and handoff. Do not introduce a separate mutable task index or a generic implementation-plan duplicate.
