# Implementation source and artifact register

**Artifact ID:** IMPL-REG-01\
**Version/date:** 0.71 Draft · 7 November 2026
**Status:** Source snapshot and navigation, not approval or runtime evidence.\
**Inputs:** REG-00; PRD-01 v0.10.3; SPEC-INDEX v0.8.2; PLAN-01 v0.4; SAD-03 v0.19.1; ADR-0001–ADR-0026.\; Proposed ADR-0029 v0.1
**Trace:** Existing BR-01–BR-14 / SC-01–SC-08.\
**Owner role:** Sequential development coordinator.

## Canonical sources

Versions below are reading snapshots. Reopen the source before implementation. A newer source requires impact review, not automatic relabelling of old evidence.

| Source | Snapshot / status | Use and dependent pack |
| --- | --- | --- |
| [AGENTS](../../AGENTS.md), [rules](../development-rules.md), [workflow](../../agents/WORKFLOW.md), [pre-flight](../agent-preflight-checklist.md) | AGENTS 1.13; rules 1.12; pre-flight 0.1; workflow unversioned | Authority/workflow for every pack, including mandatory saved planning for features/fixes/hotfixes/testing; owner/platform instructions prevail |
| [BRD entry](../BRD.md) → [full baseline](../baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md) | 1.0 Draft for business validation | Business scope; proposed addenda do not silently amend it |
| [PRD](../sdlc/PRD_SRS.md) | PRD-01 0.9 Draft | Canonical FR/ACs, release gates, assumptions and ODs; all tasks |
| [use cases](../sdlc/use-cases.md) | UC-02 0.8 Draft | Actor and alternate/failure flows; corresponding slice |
| [architecture](../architecture.md), [ADR index](../adr/README.md) | SAD-03 0.16 Draft; decision status varies | Ownership and boundaries; see [decision register](decisions.md) |
| [technology stack](../tech-stack.md) | TECH-STACK-01 1.6; owner-selected framework foundation distinct from domain/security/runtime gaps | Required for D-01 / SP-01.1 and technology-dependent tasks; section 7 maps algorithms/data structures to existing slices. Official observations checked 26 October; framework adoption is bounded by OWNER-FRAMEWORK-01; no database-image or retrieval benchmark is implied. Reverify compatibility before installation. |
| [owner decision record](../planning/owner-decisions-2026-10-16.md) | OWNER-Q-01 0.1 | Backlog return state and immutable pre-guard manifest order |
| [Earlier owner input](../../owner-decisions-OD-02-03-04-11.md), [business-review record](../analyst/business-review-2026-10-13.md) | Confirmation provenance; read current ADR disposition and dated records | Relevant decision preparation across packs. Avoid re-asking settled choices or treating an old proposal as new authority. |
| [data design](../sdlc/data-design.md), [logical model](../../contracts/data-model.json), [storage runbook](../../infra/postgres/README.md) | DATA-04 0.13; logical model 0.9; inspect current migration state | Reuse owned migrations; SQL evidence is not application enforcement |
| [Data-policy fit review](../sdlc/data-policy-fit-review.md) | DATA-FIT-01 0.6 Draft with dated snapshot/follow-ups | SP-02/05–08/11: schema capability versus handler invariants. Reconcile later migrations/references before calling historical gaps still missing. |
| [API design](../sdlc/api-design.md), [Workspace](../../contracts/openapi/workspace.openapi.json), [Knowledge](../../contracts/openapi/knowledge.openapi.json) | API-05 0.19; Workspace 0.2.10 / Knowledge 0.2.9 | Exact methods, paths, wire schemas, auth, revision and replay rules |
| [Contract pack](../../contracts/README.md), [domain-change schema](../../contracts/events/domain-change.schema.json) | CONTRACT-01 0.20 Draft; event schema is a draft interface | SP-02–11: replay requires current authority; events are invalidation hints, not permission decisions. No broker/event framework is selected. |
| [Byte-binding reference](../sdlc/references/handoff-byte-reference-2026-10-18.md), [SQL projection](../sdlc/references/handoff-sql-projection-2026-10-18.md), [prepared-record query](../../services/knowledge/queries/get-handoff-manifest.sql) | HANDOFF-REF-01 0.3; HANDOFF-SQL-01 0.2; historical synthetic/SQL evidence | SP-09/11: reuse exact-byte/query prerequisites. They do not prove current authority, HTTP handler, guard, transport or permission enforcement. |
| [spec index](../../specs/README.md), [machine index](../../specs/index.json) | SPEC-INDEX 0.5; individual specs retain their own versions | Canonical scope, allowed paths and dependency ownership; all task packs |
| [release scope](../planning/release-scope.json), [backlog](../planning/backlog.md), [relative plan](../planning/five-month-plan.md) | PLAN-01 0.4; BACKLOG-01 0.3 | Tier authority and existing planning; this folder adds no deadline or deferral |
| [UX blueprint](../sdlc/ui-ux-blueprint.md), [sitemap](../ux/sitemap.md), [web preview](../../apps/web/README.md) | Blueprint 1.4; sitemap 0.10; web guide unversioned | Bind actual routes/API state; preserve owner-selected soft-green UI |
| [UX entry](../sdlc/ui-ux-spec.md), [permission matrix](../ux/permission-matrix.md), [wireframe plan](../ux/wireframe-workplan.md), [native frame inventory](../ux/wireframes/README.md) | UX-06 0.13; matrix 0.11; UX-PLAN-01 0.3; UX-WF-EX-01 0.4 | UI work in SP-01–09/13: frame/state/UC/TC mapping and independent action/read rights. Native frames do not close usability or runtime gates. |
| [UI reference desk](../../references/README.md), [development skills and UI routing](../../agents/development-skills.md#ui-skill-workflow) | UI-REF-01 0.5; DEV-SKILLS-01 0.2 | Preserve current visual direction and canonical skill paths. Skills/templates guide method, not scope, authority or automatic framework adoption. |
| [Board](../ux/flows/board-flow.md), [Documents](../ux/flows/docs-flow.md), [AI](../ux/flows/ai-qa-flow.md) | 0.10 / 0.9 / 0.9 Draft | Work reconstruction; independent document commands; protected evidence/delivery |
| [test plan](../sdlc/test-plan.md), [coverage](../sdlc/test-coverage.md), [verification](../sdlc/requirement-verification.md), [evaluation](../../eval/README.md) | TEST-08 0.21; coverage 0.4; verification 0.5; EVAL-01 0.2 Draft, no model execution/frozen criteria | Canonical TC assertions and evidence destinations; not passing runtime results. Older evaluation input versions remain its documented snapshot. |
| [Evaluation rubric](../../eval/rubric.md), [configuration draft](../../eval/config/configurations.yaml), [safety applicability](../../eval/safety-configuration-expectations.md) | EVAL-RUBRIC-01 0.2; configuration/applicability are draft definitions, not run results | SP-09/10/12: separate RQ/EVAL corpus/scenario/configuration identity and claim scoring. SP-12.1 must implement runner/adapters/result capture and validate applicability before pilot. |
| [central register](../sdlc/artifact-register.md) | Current REG-00; read current header | Registers this pack alongside SDLC artifacts |

## Pack inventory

Artifacts below are owned by the sequential development coordinator. IMPL-REG-01 v0.23, IMPL-DEC-01 v0.13 and IMPL-ROADMAP-01 v0.11 are dated 31 October for the SP-02 design continuation. Other pack versions retain their existing source headers and execution snapshots. Inputs and trace are in each header. Handoff is preparation-ready with stated gaps, never approval; this source register supplies no handler evidence.

| Artifact | Path | Dependency / purpose |
| --- | --- | --- |
| IMPL-ENTRY-01 | [README](README.md) | Entry and reading order |
| IMPL-REG-01 | [register](register.md) | Canonical source map |
| IMPL-DEC-01 | [decisions](decisions.md) | Current decisions and implementation gates |
| IMPL-ROADMAP-01 (v0.11) | [roadmap](roadmap.md) | Milestones using existing slices and feature-plan backlinks |
| IMPL-EXEC-01 (v0.7) | [execution](execution.md) | Agent workflow and saved feature-plan gate |
| IMPL-FEATURES-01 (v0.18) | [work plan register/template](features/README.md) | Plan mode → saved plan → parent registration → small tasks → actual evidence; FEAT-SP01-01 registered under M-01 |
| FEAT-SP01-01 (v0.9) | [session foundation work plan](features/sp-01-session-foundation/plan.md) | M-01 / PLAN-01 Month 1; 12 small tasks; P01–P04 laboratory preparation verified with limits, P05 partial, P06 material decisions open |
| FEAT-SP01-ENTRY / SP01-P01–SP01-P12 (all v0.8) | [feature folder entry](features/sp-01-session-foundation/README.md); individual task links in [plan](features/sp-01-session-foundation/plan.md#tasks-and-acceptance) | Bounded task briefs; execution status/results remain in the authoritative parent table |
| IMPL-HANDOFF-01 | [handoff template](handoff-template.md) | Brief and result record |
| IMPL-TASKS-01 | [task catalogue](tasks/README.md) | Maps all 13 packs to specs, tiers and dependencies |
| IMPL-SP-01 (v0.6) | [session preparation](tasks/01-session.md) | SP-01.1 preparation In progress; remaining application children Not started |
| IMPL-BRIEF-SP01-01 (v0.2) | [SP-01.1 brief](briefs/SP-01.1-session-foundation.md) | Canonical contract assertions; links the detailed runtime plan; prior result remains a v0.1 snapshot |
| IMPL-SPIKE-SP01-01 (v0.2) | [runtime spike brief](../../SP-01.1-spike-brief.md) | Corrected external brief: clock/renewal, barriers, serializer stages, pool discard, before/after manifests and scope; runtime Not run |
| External preparation review (unversioned) | [original review](../../SP-01.1-prep-review.md) | Preserved author input; dispositions are in the revised spike and source register, not an executed independent review |
| ADR-0024 / ADR-0025 (v0.5) | [backend proposal](../adr/0024-backend-session-foundation.md), [session proposal](../adr/0025-opaque-session-candidate.md) | Shared frameworks selected; owner chose session policy direction, including expiry. Detailed driver/KDF/time/recovery adoption remains Proposed |
| IMPL-IMPROVE-01 (v0.2) | [reconciled improvement report](improvement-report-techstack-to-sp.md) | Corrected external-review recommendations and dependency interpretation |
| IMPL-PREP-SP01-01 (v0.3) | [dated preparation result](../sdlc/reports/SP-01.1-preparation-2026-10-27.md) | Original v0.1 execution evidence unchanged; input snapshot clarified after the plan revision; runtime/owner gates explicit |
| IMPL-SP-11 / IMPL-SP-12 (v0.2) | [capture](tasks/11-audit-and-source-inspection.md); [evaluation](tasks/12-failure-and-evaluation.md) | Explicit protocol prerequisites and pre-pilot runner ownership |
| IMPL-SP-02–IMPL-SP-10 / IMPL-SP-13 (v0.1) | Individual links in [task catalogue](tasks/README.md) | Spec-derived trace, operations, allowed paths and bounded child steps |

## Maintenance and change impact

- PRD/ADR change → affected spec, contract, UX and tests → task pack and roadmap → handoff evidence. Never let a task pack redefine upstream policy.
- API change → inspect both producer and consumer, task operation list and UI bindings. A shared operation may occur in several specs; that is not a second handler owner.
- Allowed paths remain those of the canonical spec. Cross-cutting guard/relay work can require coordinated specs and a recorded path update; this pack grants no wider paths.
- Change a pack artifact with a version/date bump and update its inventory version (split rows when versions diverge). Update REG-00 for changed registered versions. Keep historical evidence labelled, not rewritten.
- Child-step progress is recorded in its task table with a link to a dated handoff/result under `docs/sdlc/reports/`. Do not copy mutable result summaries into every source. SP-01.1 preparation is In progress; the other 51 child steps remain Not started.
- Do not edit implementation documentation merely to make its status look green. A source conflict becomes an explicit finding and decision impact.

Checklist: Pass for source ownership and planned registration. Gap for source-wide semantic review and all runtime gates. Handoff: use [decisions](decisions.md), then one [task pack](tasks/README.md).

## Shared framework foundation

[INIT-FRAMEWORK-01 v0.2](features/framework-foundation/plan.md) and its README/INIT-01–INIT-04 v0.2 task files are registered for the owner-directed main scaffold, design/prototype preservation and GitHub publication. This is separate from SP-01 domain acceptance.

| SP01-RUNTIME-RESULT / SP01-DECISION-BATCH (v0.2) | [runtime evidence](../sdlc/reports/SP-01-runtime-spike-2026-10-28.md); [decision batch](features/sp-01-session-foundation/decision-batch.md) | Partial laboratory evidence, preserved baseline clock failure, owner-requested clock hardening; no application or ADR acceptance |

| SP01-SCAFFOLD-RESULT (v0.2) | [bounded P07 result](../sdlc/reports/SP-01-P07-scaffold-2026-10-28.md) | Clock/KDF ports, configurable starting durations and actual local HTTPS/proxy; no concrete algorithm, schema extension or live login |

| SP01-P08-DESIGN / SP01-P08-RESULT | [authorised design](features/sp-01-session-foundation/p08-persistence-design.md) v0.2; [result](../sdlc/reports/SP-01-P08-persistence-2026-10-28.md) v0.1 | Bounded private persistence/KDF/operator/schema slice; no public handler, development upgrade or Accepted ADR |

| SP01-P09-RESULT (v0.1) | [P09 result](../sdlc/reports/SP-01-P09-http-2026-10-28.md) | Actual sign-in/current-session, server identity, non-mutating validation, failure/secret/HTTPS negatives; no full SP acceptance |

| SP01-P10-RESULT (v0.2) | [P10 result](../sdlc/reports/SP-01-P10-lifecycle-2026-10-28.md) | Actual lifecycle expiry/renewal/logout, lock interleavings and audit/failure/HTTPS checks; UI/D-07 open |

| SP01-P11-RESULT (v0.3) | [P11 result](../sdlc/reports/SP-01-P11-ui-2026-10-28.md) | Actual session UI/React DOM/live HTTPS/PG evidence; browser handoff separate, no full feature acceptance |

## P11 browser continuation — 28 October 2026

The owner completed the certificate handoff. Actual keyboard login, reload/cookie reuse, navigation/back, server expiry and logout were observed; browser outcomes are retained in SP01-P11-RESULT v0.2. P12 and broader acceptance remain open. No independent approval is implied.

## P12 integrated handoff — 28 October 2026

See [P12 result](../sdlc/reports/SP-01-P12-handoff-2026-10-28.md) for bounded integrated session/UI regression, owner local test feedback and screenshot evidence. AC-01/36/37/68 and applicable session producers/UI are mapped there; D-07, other protected features, full cross-browser/accessibility and deployment/formal ADR gates remain open. No new requirement or independent acceptance is inferred.

| SP01-P12-RESULT (v0.1) | [P12 result](../sdlc/reports/SP-01-P12-handoff-2026-10-28.md) | Bounded integrated regression, four original screenshots, owner local feedback and authorised publication; wider gates open |


28 October: owner-authorised main merge/push verified at 52a10dd0bbdf76b173c2c2f387e6615def4312e9 after all SP-01 local gates passed; current branch codex/sp-02-project-membership starts there. Unrelated local work is retained; no new SP-02 commit/push authority inferred. IMPL-SP-02 v0.2 and IMPL-TASKS-01 v0.4 register preparation.


## SP-02 registered artifacts

| Artifact / version | Source | Reading purpose and limits |
| --- | --- | --- |
| FEAT-SP02-01 / entry / P02 (v0.4); P04 (v0.3); P03 (v0.2); P03A/other tasks (v0.1) | [SP-02 feature folder](features/sp-02-project-membership/README.md) | M-02/M-03 / PLAN-01 Month 1; canonical SP-02 v0.5; resume P02 design preparation before selected implementation |
| SP02-P01-REVIEW (v0.1) / SP02-DECISION-BATCH (v0.4) | [source review](features/sp-02-project-membership/p01-source-review.md); [owner proposal](features/sp-02-project-membership/decision-batch.md) | D-03 and bounded D-04 information scope selected; concrete schema adoption remains gated |
| ADR-0026 (v0.3 Proposed) | [project/membership design](../adr/0026-project-membership-foundation.md) | Reconciled P03A/reduced 007 proposal; no cursor table; bounded replay/paging at P04 before public mutation; no adoption or runtime evidence |
| SP02-P02-RESULT (v0.2; original execution unchanged) | [SP-02 preparation result](../sdlc/reports/SP-02-P02-preparation-2026-10-28.md) | Six historical actual-contract schema probes; plan input labelled as execution snapshot; no SP-02 handler coverage |

1 November SP-02: FEAT-SP02-01/entry v0.6, decision batch v0.6, ADR-0026 v0.4, canonical SP-02 v0.7 and corrected child headers describe the bounded implementation. Current results live in SP02-EXECUTION-RESULT v0.2; original preparation/older session evidence retains its snapshot versions. Private operation guidance is services/workspace/PROJECTS.md v0.1.

Final source/status pointers: source capture/checks are retained in the SP-02 evidence folder; registered parent catalogue IMPL-TASKS-01 v0.5 and machine SPEC-INDEX v0.5 distinguish the implemented bounded SP-01/SP-02 subsets from later unimplemented slices. Source table versions above remain historical reading snapshots unless explicitly updated.

## SP-01/SP-02 testing/audit publication — 1 November 2026

[PUB-SP01-SP02-01](features/sp-01-sp-02-test-audit-publication/plan.md) v0.1 registers the owner-authorised bounded report/check/commit/push sequence. [SP01-TEST-AUDIT-01](../sdlc/reports/SP-01-testing-audit-2026-11-01.md) v0.1 and [SP02-TEST-AUDIT-01](../sdlc/reports/SP-02-testing-audit-2026-11-01.md) v0.1 contain reproducible test commands, manual sheets, source/evidence maps and explicit limits. Existing measured source/results remain historical captures; no new runtime run or independent audit is claimed.

## SP-03 source registration — 2 November 2026

[FEAT-SP03-01](features/sp-03-create-task/plan.md), [entry](features/sp-03-create-task/README.md), [SP03-WBS-01](features/sp-03-create-task/breakdown.md) and SP03-D01/D02/P01–P09 task briefs are v0.1 Draft. They refine SP-03.1–03.4 / FR-05 / AC-05 / PLAN-01 Month 1 / M-02. The plan freezes committed source versions at dd69700e58d28e367f94833b85a6909a5faec1a5 and distinguishes local uncommitted hashes. SP03-WORKFLOW-01 v0.1 and IMPL-EXEC-01 v0.8 adapt the three development templates to this project without runtime or independent acceptance. Current parent status/evidence, decisions and estimates belong only to the plan.

## SP-03 P01 source reconciliation continuation

[FEAT-SP03-01](features/sp-03-create-task/plan.md), entry/WBS and SP03-P01 brief v0.2 register this owner-authorised preparation. [SP03-P01-SOURCE-REVIEW](features/sp-03-create-task/source-review.md) v0.1 records current source/permission/test mapping and P02 gaps under SP-03.1 / PLAN-01 Month 1 / M-02. Original publication/task snapshots and measured evidence are unchanged; no runtime, independent approval, commit or push is authorized by this continuation.

P01 handoff is recorded in FEAT-SP03-01 v0.2: source review and exact current/committed input identities, future producer/test mapping and P02 decision gaps. Follow the parent for actual status/results; no runtime acceptance or publication is implied.

## SP-03 P02 bounded design registration

FEAT-SP03-01/entry/SP03-WBS-01 v0.3 and SP03-P02 v0.2 resume owner-authorised design after P01. [SP03-DECISION-BATCH v0.1](features/sp-03-create-task/decision-batch.md) and [Proposed ADR-0027 v0.1](../adr/0027-task-creation-foundation.md) record mechanics, alternatives, pending/answered owner choices and future coordinated paths. SP03-P03A/P03B/P03C v0.1 split the P03 parent; exact amended task versions live in their headers. Parent: SP-03.1 / PLAN-01 Month 1 / M-02; no runtime, migration, public-schema edit, accepted ADR or independent approval.

P02 task-version reconciliation: SP03-P03/P04/P05/P06/P07/P08/P09 v0.2 refine the frozen implementation seams and P03 aggregate; SP03-P03A/P03B/P03C v0.1 are the executable child dictionaries. SP03-P01 and P01 source/evidence remain unchanged. These versions record design only, not executed task status.

### Historical SP-03 selected support continuation — 2 November 2026

FEAT-SP03-01/entry/WBS v0.4 resumes all SP-03 tasks under the owner objective. SP03-DECISION-BATCH v0.2 and Proposed ADR-0027 v0.2 record all three actual owner choices; P02 preparation is complete. P03A v0.2 coordinates canonical SP-03 v0.7, Workspace v0.2.12, CONTRACT-01 v0.23, logical JSON v0.11, DATA-04 v0.15 and API-05 v0.21. Parent plan owns actual test/status evidence. No migration/handler or Git publication has occurred at this support checkpoint. Earlier source tables/results are dated snapshots, not relabelled runtime evidence.

### Historical SP-03 foundation execution evidence — 2 November 2026

FEAT-SP03-01 v0.4 now links actual P03A/P03B/P03C evidence and v0.2 child briefs. P03B adds only draft migration 009, internal task types/outcome adapter, explicit 009 fixture and storage tests; DGM-DATA-01 v0.6/model entry reflects Task.created_at. P03C extends the private operator/CLI and tests author grant/removal ordering. Parent plan is the only mutable task-status table; migration/contract/source versions and old captures are retained as dated identities. No task HTTP/UI/browser or whole-feature completion, development upgrade, Git publication or independent approval is claimed.

### Historical SP-03 P08 evidence registration — 2 November 2026

Planned SP03-UI-01 v0.1 at docs/sdlc/reports/SP-03-2026-11-02-ui.md and synthetic feature evidence/ui-2026-11-02/ screenshots/browser-summary are registered before writing. Parent FEAT-SP03-01 v0.4 owns actual readiness/results; P07 bounded integrated evidence is captured separately. No browser pass, certificate trust or independent acceptance is presumed.

### Historical SP-03 P09 handoff registration — 2 November 2026

Planned SP03-EXEC-01 v0.1: docs/sdlc/reports/SP-03-2026-11-02-execution.md; WORKSPACE-TASKS-01 v0.1: services/workspace/TASKS.md; registered feature p09/source identity/completion audit and unique browser rerun evidence subdirectories. Parent plan owns current results; this registration precedes writing and is not final acceptance. Final regressions/audit remain required.

### SP-03 final handoff source registration — 2 November 2026

Current local reading sources: FEAT-SP03-01/entry/WBS 0.5, canonical SP-03 0.8, IMPL-SP-03 0.2 / IMPL-TASKS-01 0.6, Workspace 0.2.12, logical JSON 0.12, CONTRACT-01 0.24, API-05 0.22, DATA-04 0.16, TEST-08 0.24, TEST-COVERAGE-01 0.11 and VERIFY-01 0.12. SP03-UI-01 0.2 preserves its original 0.1 report snapshot and actual captures; SP03-EXEC-01/WORKSPACE-TASKS-01 are 0.1. Source status updates in AGENTS 1.15/rules 1.14 change no planning/permission authority. P09 final regression/audit results belong to the parent/report; do not infer acceptance from this registration. Older source/result sections remain historical observations and are not relabelled.

## Historical SP-03 publication follow-up — 3 November 2026

[PUB-SP03-01 v0.1](features/sp-03-publication/plan.md) registers bounded review/verification, selective publication, merge into main and deletion of the merged SP-03 branch under the owner instruction. Parent FEAT-SP03-01 / SP-03.1–03.4 / FR-05/AC-05 / PLAN-01 Month 1 / M-02. PUB03-T01/T02 v0.1 and PUB-SP03-ENTRY-01 v0.1 define the ready work; the publication plan owns actual results. Planned report SP03-PUB-REPORT-01 v0.1: docs/sdlc/reports/SP-03-publication-2026-11-03.md. No product scope, independent approval or deployment is implied.

## SP-03 publication completion — 3 November 2026

[PUB-SP03-01 v0.2](features/sp-03-publication/plan.md) and [SP03-PUB-REPORT-01 v0.2](../sdlc/reports/SP-03-publication-2026-11-03.md) record actual verification, source commit a8b3192, successful GitHub CI, confirmed fast-forward into main and deletion of both SP-03 source branches. Parent FR-05/AC-05 / SP-03.1–03.4 / PLAN-01 Month 1 / M-02 is unchanged. Unrelated working files and the template gitlink are preserved. No deployment, complete master milestone or independent approval.


## Backend layering hotfix source registration — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.1](features/hotfix-backend-layering/plan.md) registers base commit 6b837fd and frozen source identities for §4.2 clarification, PLAN-01 Month 1 / M-02–M-03 / SP-03–SP-04 support. No runtime, schema, contract, accepted ADR or baseline changes.

Backend layering bounded result: [HOTFIX-BACKEND-42-RESULT v0.1](features/hotfix-backend-layering/handoff.md) records implemented §4.2, preserved SP-04 checkout/source boundaries and five passing npm gates. Overall acceptance remains open for inherited local-source-link gap HF42-F01; no runtime evidence or automatic integration. Parent plan owns task status.


## HF42-F01 owner-authorised continuation — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.2](features/hotfix-backend-layering/plan.md) registers the explicitly requested Stage 6 profile source-link correction and bounded current metadata reconciliation. Same PLAN-01 Month 1 / M-02–M-03 support; no runtime or design change. Original gap evidence is retained; parent plan owns status/results.

HF42-F01 current result: [HOTFIX-BACKEND-42-01 v0.2](features/hotfix-backend-layering/plan.md) closes the explicitly authorised source-link correction with five passing npm gates, no missing local targets and preserved prior failures. Bounded documentation author verification only; no runtime, independent acceptance or integration. HOTFIX-BACKEND-42-RESULT is now v0.2.


## Backend layering publication authorisation — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.3](features/hotfix-backend-layering/plan.md) registers HF42-P01 for the owner-requested exact-scope commit and fast-forward integration/publication into main. Same PLAN-01 Month1 / M-02–M-03 parent; no code/design expansion, force push, branch deletion, runtime or independent acceptance. Actual final Git refs are reported after execution.


## HF42-C01 owner-selected documentation closure — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.4](features/hotfix-backend-layering/plan.md) registers HF42-C01 v0.1 to reconcile existing task/source/publication receipts and retain the documented Project-lock/in-memory-page limits. Same PLAN-01 Month1 / M-02–M-03 / FR-05/AC-05 support. Exact reference/projection checks and preservation gates precede execution. Runtime helpers/null changes require separate SP-04 scope; runner/discovery remain deferred. No automatic commit/publication or new runtime acceptance.


HF42-C01 actual result: [HOTFIX-BACKEND-42-01 v0.4](features/hotfix-backend-layering/plan.md) / result v0.3 reconciles original publication using live origin/main=dcd2d81 and retains the documented Project-lock/full-projection-page limits. Reference/projection context45/45, docs20/20 and metadata pass with original negatives retained;133 pre-existing outside files/index/refs remain preserved. Documentation author verification only; no new runtime refactor/commit/push/merge or independent acceptance. Deferred query/null work is separate SP-04 scope; runner/discovery awaits concrete demand.


## Backend follow-up task breakdown — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.5](features/hotfix-backend-layering/plan.md) / WBS v0.3 / entry v0.3 registers five planning-only handoff briefs HF42-RF01–RF05 v0.1: current SP-04 source/registration, shared capability query, unexpected-null contract/regression, small existing-transaction guard and combined regression/handoff. No runtime task is executed here; RF01 must adopt the drafts into existing FEAT-SP04-01 before code/testing. Same PLAN-01 Month1 / M-02–M-03 / proposed future SP-04.2–04.4 FR-09/40/43/44 and supporting FR-03/31/59/68. Original hotfix evidence/closure is unchanged; runner/discovery separation and automatic commits/publication are excluded.


## RF01–RF05 owner-authorised execution — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.6](features/hotfix-backend-layering/plan.md) owns actual RF01–RF05 runtime follow-up, superseding draft SP-04 adoption. Trace PLAN-01 Month1 / M-02–M-03 / SP-04.2–04.4 / FR-09/40/43/44 and supporting FR-03/31/59/68. Exact reversible committed-baseline reconciliation, allowed helper/null/ADR support and real006/008/009/010 verification are saved before edits. No automatic commit/merge/push, runner/discovery split or P08/independent acceptance.


RF01 baseline source: existing FEAT-SP04-01 v0.14 at e6f2337 is restored as committed source/evidence, retaining its P08 actual-SP05 gate. HOTFIX-BACKEND-42-01 v0.6 owns only the new RF01–RF05 changes. Baseline integration creates no Git merge/commit or new wire/schema policy.


HF42-RF03 source registration: Proposed ADR-0029 v0.1 / ADR index0.4 / canonical SP-04 v0.7.5 / pack0.3 record the bounded unexpected-null503/rollback versus recorded-denial contract before regression authoring. HOTFIX-BACKEND-42-01 v0.6 owns execution. RF02 verified6/6 helper and69/69 existing regressions; RF03 reproduction is next and RF04 guard stays unimplemented until separately continued. ExistingADR0028, wire/SQL/baseline and P08 remain preserved.


RF03 owner-requested report boundary: [HF42-RF03-RESULT v0.1](features/hotfix-backend-layering/rf03-report.md) / HOTFIX-BACKEND-42-01 v0.6, entry/WBS0.4. RF01 source reconciliation is verified; RF02 helper6/6, affected regressions69/69 and typecheck pass. ProposedADR0029/RF03 actual010 reproduction intentionally retains one failing null child plus parent, with six other child cases passing. RF04 guard is unchanged/unimplemented; RF05 and P08 remain open. No full-hotfix acceptance, automatic commit/merge/push or independent approval. Original setup failures and false initial reproduction setup are retained and explained.


## RF04 bounded continuation — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.7](features/hotfix-backend-layering/plan.md) resumes the owner-requested RF04 existing-transaction null guard and unchanged real-PostgreSQL RF03 assertions, with session006/Project008/mutation010 regressions and Workspace typecheck/build. Planned [HF42-RF04-RESULT v0.1](features/hotfix-backend-layering/rf04-report.md) will record actual outcomes. RF05 remains pending; no automatic commit/merge/push, P08 or independent acceptance.


## RF05 combined verification registration — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.8](features/hotfix-backend-layering/plan.md) resumes RF05 after verified RF02/RF04: source-identified combined real006/008/009/010 regression, root build/typecheck, context/contracts/docs checks and preservation handoff. Planned [HF42-RF05-RESULT v0.1](features/hotfix-backend-layering/rf05-report.md) and WORKSPACE-TASKS-01 v0.6 bounded notes record actual outcomes. No code/test/schema/policy expansion, publication, P08/SP-05/D-07 closure or independent acceptance.


RF05 bounded result: HOTFIX-BACKEND-42-01 v0.8 / HF42-RF05-RESULT v0.1 verifies the combined helper/null change: real disposable006/008/009/010 PostgreSQL179/179; root typecheck/build; context45/45, contracts27/27, docs20/20 and lints. WORKSPACE-TASKS-01 v0.6 records current mechanics; original §4.2 baseline observations and old evidence remain unchanged. Test records include parents and overlap earlier runs. P08 actual SP-05 integration, D-07, deployment and formal/independent/release acceptance remain open; no new commit/merge/push.


## HF42-P01 publication status correction — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.9](features/hotfix-backend-layering/plan.md) / HF42-P01 v0.2 / entry0.6 reopen publication closure after owner correction. RF01–RF05 bounded verification remains valid; historical dcd2d81 documentation publication is preserved and does not prove publication of current dirty work. No new commit/merge/push/CI or whole-branch acceptance. Original documentation-only publication authority does not expand to runtime/SP-04.


## P01 final delivery registration — 4 November 2026

[HOTFIX-BACKEND-42-01 v0.10](features/hotfix-backend-layering/plan.md) / HF42-P01 v0.3 registers owner-authorised final checks, exact current hotfix/SP-04 dependency commit/push, green-check main integration and safe merged-branch cleanup. SAD-03 v0.19 / entry0.18 align §4.2 with tested RF02/RF04. Actual outcomes follow execution; P08/SP-05/D-07 and independent/release/deployment gates remain open.


## P01 actual publication receipt — 4 November 2026

[HF42-P01-RESULT v0.2](features/hotfix-backend-layering/p01-report.md) / HOTFIX-BACKEND-42-01 v0.11 / P01v0.4 / entry0.8 record actual dde2933 hotfix push, exact-commit CI success and verified main fast-forward/publication. Earlier pending receipts remain historical observations. Final audit receipt/cleanup follow normal checked publication; parent SP05/P08/D07/independent/release gates remain open.

[FEAT-SP05-01 v0.1](features/sp-05-sprint-lifecycle/plan.md) / [entry0.1](features/sp-05-sprint-lifecycle/README.md) / [SP05-WBS-01v0.1](features/sp-05-sprint-lifecycle/breakdown.md) and SP05-P00–P15v0.1 register owner-approved Must implementation for SP-05.1–05.4 / PLAN-01 Month2/M-03, FR06/07/08/41/42 and co-delivered31. Separate five actions; FR66/67 excluded; SP04-P08 actual integration mandatory. Status belongs only to plan; no publication or independent acceptance.


## SP-05 bounded local delivery — 5 November 2026

[FEAT-SP05-01 v0.2](features/sp-05-sprint-lifecycle/plan.md) / entry v0.2 owns P00–P15 execution; [SP05-RESULT-01 v0.1](features/sp-05-sprint-lifecycle/handoff.md) maps Must AC/UC/TC to actual evidence; [SP05-PR-DRAFT-01 v0.1](features/sp-05-sprint-lifecycle/pull-request.md) prepares local review text. WORKSPACE-SPRINTS-01 v0.1, Proposed ADR0030 v0.1, SP-05 v0.7.4 and SP-04 v0.7.7, FEAT-SP04-01 v0.15 / SP04-P08 v0.3 record bounded actual-producer integration. Test-plan/coverage/verification current entries point to the owning result. These local observations supersede earlier pending SP05/P08 snapshots only; M03 other gates, CI, deployment and independent/release acceptance remain open. No commit/push/PR or valuable-data migration.


## SP05-AG01 written reviewer assignment — 5 November 2026

[FEAT-SP05-01 v0.3](features/sp-05-sprint-lifecycle/plan.md) / entry v0.3 / SP05-WBS-01 v0.2 registers [SP05-AG01 v0.1](features/sp-05-sprint-lifecycle/tasks/AG01-antigravity-tracking-testing.md), the owner-requested Antigravity P00–P15 tracking, source review and actual regression/browser verification brief for SP-05.1–05.4 / PLAN-01 Month2 / M-03 and coordinated SP04-P08. Reviewer inputs are frozen separately under evidence/antigravity-assignment/reviewer-inputs.json; old author evidence is immutable. Planned output SP05-AG01-RESULT v0.1 belongs to a new timestamped reviewer run. Preparation/manual delivery only: no dispatch, reviewer execution/result, source fix, commit or independent/release acceptance. The parent owns mutable assignment status.


## SP05-PUB01 Draft PR authority — 5 November 2026

[FEAT-SP05-01 v0.4](features/sp-05-sprint-lifecycle/plan.md) / entry v0.4 registers [SP05-PUB01 v0.1](features/sp-05-sprint-lifecycle/tasks/PUB01-draft-publication.md), owner-authorised agent commit, normal push and one Draft PR codex/sp-05 to main so Antigravity can later review. SP05-AG01 v0.2 supports the actual published head instead of requiring the historical base HEAD; original source/evidence snapshots remain unchanged. Planned SP05-PUBLICATION-01 v0.1 records actual publication only after execution. No merge, main update, reviewer result, valuable-data migration or independent/release acceptance. PLAN-01 Month2/M-03 and SP04-P08 trace unchanged.


## SP05-PUB01 actual Draft PR receipt — 5 November 2026

[FEAT-SP05-01 v0.5](features/sp-05-sprint-lifecycle/plan.md) / entry v0.5 / [SP05-PUBLICATION-01 v0.1](features/sp-05-sprint-lifecycle/publication.md) record normal feature commit0bb0f57 push and actual open [Draft PR #1](https://github.com/900M100CK/scrum-workspace-KMS-ai/pull/1), codex/sp-05 to main. SP05-PR-DRAFT-01 v0.3 links the actual PR. Runtime Git blob identities and fresh011 format-only storage proof are retained with old failures. First context CI was pending; final head/check state is verified after the documentation receipt push. No merge, reviewer execution or independent/release acceptance. Parent status remains canonical.


## SP05-V01 runtime verification continuation — 5 November 2026

[FEAT-SP05-01 v0.6](features/sp-05-sprint-lifecycle/plan.md) / entry v0.6 / WBS v0.3 registers [SP05-V01 v0.1](features/sp-05-sprint-lifecycle/tasks/V01-runtime-verification.md) and [SP05-RUNTIME-GUIDE-01 v0.1](features/sp-05-sprint-lifecycle/verification/README.md), with planned SP05-RUNTIME-RESULT-01 v0.1. Owner requested runtime follow-up after AG01 bounded static v0.2.1. Exact published source/tree, Node24/Docker/TLS/browser prerequisites, pure-controller separation and actual command/cleanup evidence govern execution. PLAN-01 Month2/M-03 and SP04-P08 trace unchanged. Codex runs are supplemental author evidence; no reviewer impersonation, acceptance, production edit, valuable-data migration or publication. Parent plan owns status.


SP05-V01 bounded result: [SP05-RUNTIME-RESULT-01 v0.1](features/sp-05-sprint-lifecycle/verification/runtime-report.md) records Codex supplemental execution on122 unchanged published inputs: Workspace347/347, isolated Edge1/1, structural92/92 and root build/typecheck/foundation/prototype success; pure controller7/7 also runs when Docker access is denied. Runner/guide v0.1 provides explicit-Node phased reproduction; no new resource leftovers or production changes. Antigravity runtime remains unexecuted/open; no independent/release acceptance or commit/push.


## AG01 v0.4 bounded runtime handback — 5 November 2026

[FEAT-SP05-01 v0.7](features/sp-05-sprint-lifecycle/plan.md) / entry v0.7 / [SP05-AG01-DISPOSITION-01 v0.1](features/sp-05-sprint-lifecycle/verification/antigravity-reconciliation.md) receive Antigravity report/tracking v0.4, manifest v0.3.1 and runtime record v1.0. Seven reported SP05 suites57/57;18 static and122 published blobs matched. SP05-RUNTIME-GUIDE-01 v0.2 links the later disposition. F-ENV-01 resolved within named runs; broader independent40-file regression not reported and not waived. Original raw inputs preserved; other-suite stdout granularity and browser capture origin noted. No production fix, commit/push or milestone/release acceptance. Parent owns current status.


## SP05-PUB02 final dossier publication — 5 November 2026

[FEAT-SP05-01 v0.8](features/sp-05-sprint-lifecycle/plan.md) / entry v0.8 / [SP05-PUB02 v0.1](features/sp-05-sprint-lifecycle/tasks/PUB02-verification-publication.md) register owner-authorised docs/runner/evidence commit/push and a Draft PR. [SP05-FINAL-HANDOFF-01 v0.1](features/sp-05-sprint-lifecycle/verification/final-handoff.md), SP05-AG01-DISPOSITION-01 v0.2, canonical SP05-AG01-RESULT/TRACKING v0.4.1 and immutable final input snapshots retain reviewer57 versus author347. F-REG-01 explicitly open/not waived; M03/release separate. No runtime/schema/test/package edit, production migration, force push or merge. PUB02-RESULT v0.1 is planned after actual publication.


## PUB02 actual verification dossier publication — 5 November 2026

[FEAT-SP05-01 v0.9](features/sp-05-sprint-lifecycle/plan.md) / entry v0.9 / [SP05-PUB02-RESULT-01 v0.1](features/sp-05-sprint-lifecycle/verification/publication-receipt.md) record normal commit6e3d662 push and actual open [Draft PR #2](https://github.com/900M100CK/scrum-workspace-KMS-ai/pull/2), codex/sp-05 to main. Final receipt head/check state is verified after its push. Runtime122 unchanged, final AG01 v0.4.1 preserved. F-REG-01 explicitly remains open/not waived; no merge, production change or M03/release acceptance.


## AG01 v0.5 full Workspace regression closure — 5 November 2026

[FEAT-SP05-01 v0.10](features/sp-05-sprint-lifecycle/plan.md) / entry v0.10 / [SP05-FREG-CLOSURE-01 v0.1](features/sp-05-sprint-lifecycle/verification/regression-closure.md) receive Antigravity report/tracking v0.5 and actual full40-file347/347 log/record.40 source markers and122 published inputs match; F-REG-01 resolved by execution, not waived. SP05-AG01-DISPOSITION-01 v0.3, SP05-FINAL-HANDOFF-01 v0.2 and SP05-RUNTIME-GUIDE-01 v0.3 reflect the newer boundary. [SP05-M03-READINESS-01 v0.1](features/sp-05-sprint-lifecycle/verification/m03-readiness.md) prepares owner review with actual roles/states/test names; no M03/release acceptance, product edit or new runtime rerun. Existing docs PR #2 publishes this continuation.

## SP-05 selected Could planning — 5 November 2026

[FEAT-SP05-01 v0.11](features/sp-05-sprint-lifecycle/plan.md), entry v0.11 and [SP05-WBS-01 v0.4](features/sp-05-sprint-lifecycle/breakdown.md) register SP05-C00–C11 v0.1 and [SP05-COULD-DECISIONS-01 v0.1](features/sp-05-sprint-lifecycle/could-decisions.md) under SP-05 / PLAN-01 Month 2 / M-03. Owner selected FR-66/67 Could implementation planning, two private actions sprint-edit/sprint-deallocate, Planned-only editing, and removal of unfinished Tasks only in Planned/Active. Done and Completed removal are excluded to protect completed-work attribution and Sprint metrics. Branch codex/sp-05-could starts at merged main cfe0dbe. Only the owning plan stores mutable task status. Planning/briefs only; C01 source alignment must precede producers,012 is planned not applied, Must evidence remains historical, and M03/release acceptance remains separate. No new runtime result, publication or reviewer dispatch.

## SP05 C01 source/contract continuation — 6 November 2026

[FEAT-SP05-01 v0.12](features/sp-05-sprint-lifecycle/plan.md) records owner-requested C01 under SP-05.1–05.4 / PLAN-01 Month 2 / M-03. PRD-01 v0.10.3, UC-02 v0.8.4, SP-05 v0.7.5, IMPL-SP-05 v0.3, Workspace0.2.15/logical0.15, CONTRACT-01 v0.25.4, DATA-04 v0.16.5, API-05 v0.23.5, TEST-08 v0.24.5, coverage0.11.4 and verification0.12.4 align independent sprint-edit/sprint-deallocate, Planned partial edits and unfinished-only current removal in Planned/Active. Done/Completed exclusion preserves completed-work attribution and future Sprint metrics. [Proposed ADR-0031](../adr/0031-sprint-could-edit-and-removal.md) records bounded mechanics; accepted ADRs/baseline and historical evidence remain unchanged. Existing two operations keep 200 Sprint and Could priority. Registration/source structure is not runtime permission evidence; C02–C11 remain separate. No runtime/schema/UI/dependency edit, commit/push or independent acceptance.

[SP05-C01-RESULT-01 v0.1](features/sp-05-sprint-lifecycle/verification/c01-source-contract.md) supplies C01 author source/contract evidence; final input digests and actual command logs remain under the owning feature.

## Selected Could runtime registration — 6 November 2026

FEAT-SP05-01 v0.13 / entry v0.13 records C02–C11 selected FR/AC-66/67/31 under SP-05.1–05.4 / PLAN-01 Month 2 / M-03. Workspace0.2.16, CONTRACT-01 v0.25.5, API-05 v0.23.6, DATA-04 v0.16.6, Proposed ADR-0031 v0.2 / ADR index0.7, canonical SP-05 v0.7.6 / IMPL-SP-05 v0.4 and TEST-08 v0.24.6 / coverage0.11.5 / verification0.12.5 navigate actual selected Could runtime work.012 plus additive013 preserve independent private rights and provenance without direct runtime audit read. WORKSPACE-SPRINTS-01 v0.2 documents reproduction and rollback limits. SP05-C09 v0.2 records its bounded companion amendment. Current statuses/results belong only to the owning plan and source-bound SP05-COULD-RUNTIME-01 v0.1; prepared SP05-COULD-REVIEW-01 v0.1 is not independent execution. Existing200 Sprint/Could priorities and historical evidence remain unchanged; no commit/push, production upgrade, accepted ADR change or owner milestone/release acceptance.

[SP05-COULD-RUNTIME-01 v0.1](features/sp-05-sprint-lifecycle/verification/could-runtime-result.md) records final author379/379 Workspace,5/5 Edge,19/19 foundation,20/20 prototype and92/92 structural plus build/typecheck/metadata. Prepared SP05-COULD-REVIEW-01 v0.1 remains unexecuted; current status belongs only to FEAT-SP05-01.

## PUB03 selected Could acceptance/publication — 7 November 2026

FEAT-SP05-01/entry v0.14 registers SP05-PUB03 v0.1, SP05-COULD-REVIEW-DISPOSITION-01 v0.1 and current author result/review assignment v0.2 under SP-05 / PLAN-01 Month2/M-03. Owner explicitly accepted selected Could and requested PR then SP-06. Exact supplied reviewer text/checks are preserved, with independent PG/Edge blocked/unrun distinct from author379/5. Bounded runner resource-probe and immutable capture-destination corrections are verified separately. Publication authority includes necessary agent commit/normal push/one PR, not main merge, production migration, accepted ADR change, independent runtime fabrication or M03/release acceptance. Actual PR/head belongs to the owning plan/publication receipt after creation; SP-06 is separate.

## Selected Could publication result — 7 November 2026

FEAT-SP05-01/entry v0.15 and [SP05-PUB03-RESULT-01 v0.1](features/sp-05-sprint-lifecycle/verification/could-publication-receipt.md) record exact426-file commit8fa597c, normal push and ready PR #3 to main under owner acceptance. Only the owning plan stores task status. SP-05 / PLAN-01 Month2/M-03; original author/reviewer runtime limits preserved. SP-06 continuation is separate; no merge or M03/release acceptance.

## SP-06 planning registration — 7 November 2026

[FEAT-SP06-01 v0.1](features/sp-06-document-access/plan.md), [FEAT-SP06-ENTRY v0.1](features/sp-06-document-access/README.md), [SP06-WBS-01 v0.1](features/sp-06-document-access/breakdown.md), SP06-P00–P14 v0.1 and SP06-DECISION-BATCH-01 / SP06-SOURCE-MAP-01 v0.1 register the owner-requested planning-only continuation. Parent PLAN-01 Month2 / M-04 / SP-06.1–06.4 with SP-11.1 capture; FR/AC-04/10/14/50/51/52, supporting31/39/59/68, BR-01/04/10/11/14, SC-06. Mutable task state belongs only to the plan. D-03/D-04/D-07 bounded owner choices and coordinated canonical path amendment precede dependent code. Optional import/metadata, SP07 lifecycle and AI excluded; no runtime/ADR acceptance, SP06 publication or master-milestone closure. Local stacked branch starts at published SP05 PR #3 head8031503, not merged main.


## SP06 first-task B01 continuation — 7 November 2026

FEAT-SP06-01 / entry / SP06-WBS-01 / SP06-DECISION-BATCH-01 v0.2 and parent briefs P01/P02/P04 v0.2 register P01-A/B/C and P02-A v0.1. Owner explicitly selected B01 private internal project document-create provisioning, then authorised first ready task on codex/sp-06-document-access. P01-A receives that decision; B03 is discussed before guarded transport, B02 before document projections/access UI. P02-A aligns selected B01 sources independently. Exact owner receipt and SP06-P01A-RESULT-01 v0.1 belong to the owning feature; the plan alone owns mutable state. Parent SP-06.1 / PLAN-01 Month2 / M-04, FR/AC-10 and supporting04/31/39/59/68, BR-01/04/10/11/14, SC-06. No application/schema/contract/dependency change, whole-ADR adoption, runtime pass, publication or milestone acceptance.


## SP06 P02-A B01 source alignment — 7 November 2026

FEAT-SP06-01/entry/WBS/decision v0.3, P02-A v0.2, P03 parent v0.2, P04 v0.3 and new P03-A v0.1 register selected B01-only source alignment. Canonical SP-06 v0.6.4 / IMPL-SP-06 v0.2, IMPL-DEC-01 v0.15, Proposed ADR-0032 v0.1 / ADR index0.8, TEST-08 v0.24.7 / coverage0.11.6 / verification0.12.6 and spec/task indices0.8.7/0.8 identify exact private knowledge-author scope/014/operator/test paths and planned authority negatives. SP06-P02A-RESULT-01 v0.1 records actual source checks when executed; current state only in plan.md. Parent SP-06.1–06.2 / PLAN-01 Month2 / M-04, FR/AC-10 plus04/31/39/59/68, BR-01/04/10/11/14, SC-06. No public operation/contract/application/schema/dependency edit, accepted ADR change, B02/B03 adoption, runtime pass or publication. P03-A storage is separate from broader document creation storage.

P02-A input-only companion: EVAL-CASES-ENTRY v0.8.4 updates current TEST-08 alias after retained initial lint failure; no evaluation definition/result change.
