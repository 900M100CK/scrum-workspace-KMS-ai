# Implementation source and artifact register

**Artifact ID:** IMPL-REG-01\
**Version/date:** 0.48 Draft · 4 November 2026\
**Status:** Source snapshot and navigation, not approval or runtime evidence.\
**Inputs:** REG-00; PRD-01 v0.10.1; SPEC-INDEX v0.8; PLAN-01 v0.4; SAD-03 v0.16.2; ADR-0001–ADR-0027 (ADR-0027 Proposed).\
**Trace:** Existing BR-01–BR-14 / SC-01–SC-08.\
**Owner role:** Sequential development coordinator.

## Canonical sources

Documentation maintenance: [AGENT-ALIGN-01 v0.1](features/agents-sdlc-alignment/plan.md), [entry](features/agents-sdlc-alignment/README.md) and AGENT-A01/A02 task briefs v0.1 align [agent profiles](../../agents/README.md) with current SDLC sources. Parent M-02/M-03 / PLAN-01 Month 1; no feature, decision or runtime acceptance.

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

## Cursor test continuation — 2 November 2026

[FEAT-SP02-01 v0.7](features/sp-02-project-membership/plan.md), its entry v0.7 and [SP02-T01 v0.1](features/sp-02-project-membership/tasks/SP02-T01-cursor-boundaries.md) register owner-authorised Node-only TTL/key/expiry boundary tests under SP-02.2 / FR-03 / AC-03 / PLAN-01 Month 1 / M-02–M-03. IMPL-FEATURES-01 v0.22, IMPL-ROADMAP-01 v0.15 and REG-00 v0.95 supply coordinated registration. Historical source rows remain snapshots; no new handler, independent approval or release acceptance.

Metadata-only continuation: SP02-EXECUTION-RESULT v0.3 and SP02-TEST-AUDIT-01 v0.2 label the original plan v0.6 as an execution snapshot; no prior run is relabelled.

SP01-TEST-AUDIT-01 v0.2 likewise preserves its original SP-02 integration-report input as execution snapshot v0.2. Only linked-input metadata is clarified.

AGENT-ALIGN-01/ENTRY v0.2 and AGENT-A03 v0.1 resume the existing plan for owner-authorised PRD source-link repair. Parent M-02–M-03 / PLAN-01 Month 1, supporting SP-02 context verification; no requirements or runtime change. Actual source-version and check results are recorded in the parent continuation.

## A03 source-version metadata reconciliation

PRD v0.10 changes only template links. Dependent inputs and patch versions below are synchronized for documentation checks; no requirement/design/contract behaviour or prior measured result is revised. Historical report/review input snapshots retain their original versions.

| Artifact | Version | Path |
| --- | --- | --- |
| CONTRACT-01 | 0.22.1 | contracts/README.md |
| SAD-03 | 0.16.1 | docs/architecture.md |
| API-05 | 0.20.1 | docs/sdlc/api-design.md |
| REG-00 | 0.96 | docs/sdlc/artifact-register.md |
| DATA-04 | 0.14.1 | docs/sdlc/data-design.md |
| DGM-DESIGN-01 | 0.1.1 | docs/sdlc/diagrams/design-foundation-2026-10-17.md |
| UML-07 | 0.21.1 | docs/sdlc/diagrams/README.md |
| DGM-REVIEW-02 | 0.1.1 | docs/sdlc/diagrams/review-2026-10-16.md |
| DGM-REVIEW-03 | 0.1.1 | docs/sdlc/diagrams/review-2026-10-17.md |
| EVAL-CASES-ENTRY | 0.8.1 | docs/sdlc/evaluation-cases.md |
| PRD-01 | 0.10 | docs/sdlc/PRD_SRS.md |
| DOC-REVIEW-REG-01 | 0.37 | docs/sdlc/references/document-review-register.md |
| SP01-P12-RESULT | 0.1.1 | docs/sdlc/reports/SP-01-P12-handoff-2026-10-28.md |
| SP01-TEST-AUDIT-01 | 0.2.1 | docs/sdlc/reports/SP-01-testing-audit-2026-11-01.md |
| SP02-EXECUTION-RESULT | 0.3.1 | docs/sdlc/reports/SP-02-execution-2026-10-31.md |
| SP02-TEST-AUDIT-01 | 0.2.1 | docs/sdlc/reports/SP-02-testing-audit-2026-11-01.md |
| VERIFY-01 | 0.11.1 | docs/sdlc/requirement-verification.md |
| SAD-03-ENTRY | 0.15.1 | docs/sdlc/SAD.md |
| TEST-COVERAGE-01 | 0.10.1 | docs/sdlc/test-coverage.md |
| TEST-08 | 0.23.1 | docs/sdlc/test-plan.md |
| UX-BLUEPRINT-01 | 1.7.1 | docs/sdlc/ui-ux-blueprint.md |
| UX-06 | 0.13.1 | docs/sdlc/ui-ux-spec.md |
| UC-02 | 0.8.1 | docs/sdlc/use-cases.md |
| UX-FLOW-AI-03 | 0.9.1 | docs/ux/flows/ai-qa-flow.md |
| UX-FLOW-BOARD-01 | 0.10.1 | docs/ux/flows/board-flow.md |
| UX-FLOW-DOCS-02 | 0.9.1 | docs/ux/flows/docs-flow.md |
| UX-PERM-MATRIX-02 | 0.11.1 | docs/ux/permission-matrix.md |
| UX-PERSONAS-01 | 0.5.1 | docs/ux/personas.md |
| UX-SITEMAP-03 | 0.10.1 | docs/ux/sitemap.md |
| UX-PLAN-01 | 0.4.1 | docs/ux/wireframe-workplan.md |
| UX-WF-EX-01 | 0.5.1 | docs/ux/wireframes/README.md |
| SP-01 | 0.5.1 | specs/001-session.md |
| SP-02 | 0.7.1 | specs/002-project-membership.md |
| SP-03 | 0.6.1 | specs/003-create-task.md |
| SP-04 | 0.7.1 | specs/004-update-task.md |
| SP-05 | 0.7.1 | specs/005-sprint-lifecycle.md |
| SP-06 | 0.6.1 | specs/006-document-access.md |
| SP-07 | 0.6.1 | specs/007-version-publication.md |
| SP-08 | 0.4.1 | specs/008-linked-keyword-search.md |
| SP-09 | 0.9.1 | specs/009-cited-question.md |
| SP-10 | 0.5.1 | specs/010-current-work-question.md |
| SP-11 | 0.10.1 | specs/011-audit-and-source-inspection.md |
| SP-12 | 0.4.1 | specs/012-failure-and-evaluation.md |
| SP-13 | 0.6.1 | specs/013-scoped-inspection.md |
| SPEC-INDEX | 0.8.1 | specs/README.md |

A03 final result: current-checkout context check passed, context tests 45/45 and docs tests 20/20 with zero skips; docs lint and scoped whitespace passed. The original failed runs remain historical. No application tests or clean-clone reproduction were run; template gitlink and unrelated user work are unchanged. See the canonical AGENT-ALIGN-01 A03 handoff.

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

## Historical SP-04 preparation source registration — 3 November 2026

[FEAT-SP04-01 v0.2](features/sp-04-update-task/plan.md), FEAT-SP04-ENTRY v0.2, SP04-WBS-01 v0.2 and SP04-P01–P08 v0.2 map existing SP-04.1–04.4 / FR-09/40/43/44 / supporting FR-31 / PLAN-01 Month 1 / M-02–M-03. Current sources: SP-04 v0.7.1, PRD-01 v0.10, UC-02 v0.8.1, SAD-03 v0.16.1, Workspace v0.2.12, TEST-08 v0.24. Selected source hashes and actual structural checks belong to the parent P01 evidence. Only P01 is requested; older worktree approvals/results are not imported. No Task mutation handler or new policy is implemented by this registration.

## Historical SP-04 coordination source registration — 3 November 2026

[FEAT-SP04-01 v0.3](features/sp-04-update-task/plan.md), FEAT-SP04-ENTRY v0.3, [SP04-COORD-01 v0.1](features/sp-04-update-task/COORDINATION.md) and SP04-AG01 v0.3 define owner-requested write ownership, one Antigravity findings output and Codex reconciliation under SP-04.1 / M-02–M-03. P01-map/WBS/P01–P08 and earlier tests keep their v0.2 source/result identity. Written assignment is not delivery or execution; no runtime, contract or policy change.

## Historical SP-04 AG01 reconciliation source registration — 3 November 2026

[FEAT-SP04-01 v0.4](features/sp-04-update-task/plan.md), FEAT-SP04-ENTRY v0.4, SP04-COORD-01 v0.2, SP04-AG01-RESULT v0.1, [SP04-AG01-DISPOSITION v0.1](features/sp-04-update-task/reviews/ag01-codex-disposition.md) and SP04-AG02 v0.1 register report receipt/correction under SP-04.1 / FR-09/40/43/44 and supporting FR-31 / M-02–M-03. Actual hashes/limits are captured in feature evidence/ag01-reconciliation.json. Original report/P01 evidence remain unchanged; no accepted review, code fix, new requirement or external dispatch is inferred.

## Historical SP-04 corrected source-review handoff — 3 November 2026

[FEAT-SP04-01 v0.5](features/sp-04-update-task/plan.md), FEAT-SP04-ENTRY v0.5, SP04-COORD-01 v0.3, preserved SP04-AG01-RESULT v0.2 and [SP04-AG02-DISPOSITION v0.1](features/sp-04-update-task/reviews/ag02-codex-final-disposition.md) record actual 42/42 source-hash reconciliation and remaining citation errata. Parent SP-04.1 / FR-09/40/43/44, supporting FR-31 / M-02–M-03 unchanged. Source-check closure is not runtime verification, accepted policy or implementation authority for P02.

## Historical SP-04 P02 proposal source review — 3 November 2026

[FEAT-SP04-01 v0.6](features/sp-04-update-task/plan.md), FEAT-SP04-ENTRY v0.6, SP04-COORD-01 v0.4, SP04-P02 v0.4, received SP04-DECISION-BATCH v0.1 / SP04-P02-REPORT v0.1, [SP04-P02-DISPOSITION v0.1](features/sp-04-update-task/reviews/p02-codex-disposition.md) and SP04-AG03 v0.1 record static design corrections under SP-04.1–04.2 / M-02–M-03. All 174 preserved source paths match. The draft SQL is not ready to apply; policy choices and Antigravity-reported structural tests are not silently accepted. Old report/task/design bytes are retained separately.

## Historical SP-04 current reconciled design — 3 November 2026

[FEAT-SP04-01 v0.7](features/sp-04-update-task/plan.md), FEAT-SP04-ENTRY v0.7, SP04-COORD-01 v0.5, SP04-P02 v0.5, [SP04-DECISION-BATCH v0.3](features/sp-04-update-task/decision-batch.md), preserved SP04-P02-REPORT v0.2 and [SP04-AG03-DISPOSITION v0.1](features/sp-04-update-task/reviews/ag03-codex-disposition.md) identify current design and receipt. Parent SP-04.1–04.2 / FR-09/40/43/44 and supporting FR-03/31/59/68 / M-02–M-03 unchanged. All 174 preserved source paths match; policy choices remain pending, not inferred from earlier createTask choices or model recommendations. No runtime/DDL execution or new passing producer evidence.

## Historical SP-04 recorded owner choices and P03A assignment — 3 November 2026

[FEAT-SP04-01 v0.8](features/sp-04-update-task/plan.md), FEAT-SP04-ENTRY v0.8, SP04-COORD-01 v0.6, SP04-P02 v0.6, [SP04-DECISION-BATCH v0.4](features/sp-04-update-task/decision-batch.md) and [SP04-OWNER-01 v0.1](features/sp-04-update-task/owner-decisions.md) record actual D-01/D-02/D-03 replies: edit authority is separate from create, new assignees must be enabled current project members, and original mutation outcomes are retained indefinitely with current authority checks. P02 design preparation is complete; detailed mechanics remain Proposed and unimplemented. Parent SP-04.1–04.2 / FR-09/40/43/44, supporting FR-03/31/59/68 / PLAN-01 Month 1 / M-02–M-03 remain the trace.

[SP04-P03A v0.1](features/sp-04-update-task/tasks/P03A-contract-support.md) is the written Antigravity assignment for eight 413/415 response declarations across four future mutation operations and coordinated metadata only; manual delivery/execution is unconfirmed. [SP04-P03A2 v0.1](features/sp-04-update-task/tasks/P03A2-policy-source-alignment.md) is planned policy-source alignment before P03B, not dispatched. Current navigation: IMPL-FEATURES-01 v0.37, IMPL-REG-01 v0.42, IMPL-ROADMAP-01 v0.30, DOC-REVIEW-REG-01 v0.51, REG-00 v0.110. No runtime, migration, test-result acceptance, new FR, priority change or whole-feature completion.

## Historical SP-04 P03A receipt reconciliation — 3 November 2026

[FEAT-SP04-01 v0.9](features/sp-04-update-task/plan.md) registers [SP04-P03A-R v0.1](features/sp-04-update-task/tasks/P03A-R-return-reconciliation.md) for the owner's returned [SP04-P03A-RESULT v0.1](features/sp-04-update-task/reviews/p03a-contract-support.md). Trace SP-04.2 / FR-09/40/43/44 and supporting FR-03/31/59/68 / PLAN-01 Month 1 / M-02–M-03. Inputs: SP-04 v0.7.2, CONTRACT-01 v0.25, API-05 v0.23, Workspace v0.2.13. Preserve actual receipt, verify exact API delta and source hashes, record evidence limits and update parent status. No runtime or applied migration changes, independent approval or next-producer dispatch. P03A2 remains the planned source-alignment prerequisite before P03B.

P03A receipt result: [SP04-P03A-DISPOSITION v0.1](features/sp-04-update-task/reviews/p03a-codex-disposition.md) verifies the exact eight-entry delta, 42 Workspace / 24 Knowledge operations and 172/174 unchanged preserved paths (contract/README are expected changes). Source/report/failure-log/preregistration limits remain explicit; original return is preserved. FEAT-SP04-ENTRY v0.9 and SP04-COORD-01 v0.7 close the shared-write lease. No external task is active; P03A2 refinement/registration is next before dispatch/P03B, without another material policy-selection round. Structural checks are not runtime acceptance.

## Historical SP-04 P03A2 registered source alignment — 3 November 2026

[FEAT-SP04-01 v0.10](features/sp-04-update-task/plan.md) and [SP04-P03A2 v0.2](features/sp-04-update-task/tasks/P03A2-policy-source-alignment.md) register owner-requested sequential source alignment before storage/permission producers. Trace SP-04.1–04.2 / FR-09/40/43/44, supporting FR-03/31/59/68 / PLAN-01 Month 1 / M-02–M-03. Exact primary/support/metadata paths, initial versions, planned checks and preservation assertions are in the brief; source before-images are captured. Canonical support amendment precedes further primary edits. New ADR-0028 will remain Proposed; existing ADRs/baseline/OpenAPI/runtime/migrations/tests and requirement priorities stay unchanged. No independent/runtime acceptance or automatic P03B execution.

P03A2 actual result: [SP04-P03A2-RESULT v0.1](features/sp-04-update-task/reviews/p03a2-source-alignment.md) and evidence/p03a2/checks.json close canonical source alignment under FEAT-SP04-01 v0.10 / SP04-P03A2 v0.2; entry v0.10 and coordination v0.8. Current sources: PRD-01 v0.10.1, UC-02 v0.8.2, DATA-04 v0.16.1, logical model v0.13, API-05 v0.23.1, CONTRACT-01 v0.25.1, SP-04 v0.7.3, TEST-08 v0.24.1, TEST-COVERAGE-01 v0.11.1 and VERIFY-01 v0.12.1. [ADR-0028 v0.1 Proposed](../adr/0028-task-mutation-authority-and-outcomes.md) is new bounded mechanics with explicit owner-policy provenance, not formal acceptance. Actual context45/45, contracts27/27, docs20/20 remain structural checks; protected runtime/wire/old ADR/baseline sources and graph content are preserved. Exact metadata-only propagation/frozen report envelope limits and failed attempts are recorded. Next P03B requires its own exact brief; no runtime, migration, new requirement/priority, independent approval or external dispatch.

## Historical SP-04 P03B registered storage producer — 3 November 2026

[FEAT-SP04-01 v0.11](features/sp-04-update-task/plan.md) and [SP04-P03B v0.1](features/sp-04-update-task/tasks/P03B-mutation-storage.md) register the owner's requested bounded additive010/types/storage-test producer after P03A2. Parent SP-04.2 / FR-09/40/43/44 and supporting FR-03/31/59/68 / PLAN-01 Month1 / M-02–M-03. Exact paths, selected design inputs, real disposable verification and refusal/preservation gates precede implementation. No Task handler/operator/UI change, applied migration edit, valuable-data upgrade, broad ADR adoption, external assignment or Git publication.

P03B actual result — 4 November 2026: [SP04-P03B-RESULT v0.1](features/sp-04-update-task/reviews/p03b-storage-result.md) verifies additive010/internal typed mutation outcomes/private grant guard under FEAT-SP04-01 v0.11 / SP04-P03B v0.1; entry v0.11, coordination v0.9, WORKSPACE-TASKS-01 v0.2. Actual disposable new storage13/13 and historical009 regression8/8, Workspace typecheck and context45/45/contracts27/27/docs20/20 pass with original failures preserved. Parent SP-04.2 / M-02–M-03 is unchanged; old applied SQL/create adapter/handlers/UI/wire/ADR/baseline remain preserved. No valuable-data upgrade or runtime end-user mutation/permission/HTTP acceptance. Next separately briefed P03C; actual SP-05 integration and whole-SP-04 gates remain open.

## SP-04 P03C private authority/discovery producer — 4 November 2026

[FEAT-SP04-01 v0.12](features/sp-04-update-task/plan.md) and [SP04-P03C v0.1](features/sp-04-update-task/tasks/P03C-task-authority-discovery.md) register owner-requested private selected Task actions and exact target discovery under SP-04.2 / M-02–M-03. Exact code/test/provenance/registered-operation scope and disposable verification precede edits. No001–010/wire/ADR/baseline/UI/root/dependency change or new mutation handler. Prior results remain bounded; no formal ADR/runtime end-user mutation acceptance.

P03C actual result: [SP04-P03C-RESULT v0.1](features/sp-04-update-task/reviews/p03c-authority-result.md) and evidence/p03c/checks.json verify private selected Task actions/provenance and exact registered-operation Task discovery under FEAT-SP04-01 v0.12; entry v0.12, coordination v0.10, WORKSPACE-TASKS-01 v0.3. New13/13 and combined43/43 real disposable authority/projectHTTP/storage regressions, Workspace typecheck and context45/45/contracts27/27/docs20/20 pass. Prior001–010/wire/model/ADR/baseline/old tests/UI remain preserved. Production exposes current getTask/read discovery only; no synthetic future registry is credited as a handler. Next separately briefed P03D1; whole-SP-04/SP-05/D-07/independent gates remain open.


## SP-04 P03D1 Backlog edit registration — 4 November 2026

[SP04-P03D1 v0.1](features/sp-04-update-task/tasks/P03D1-backlog-edit.md) / FEAT-SP04-01 v0.13 registers the owner-requested next bounded existing editTask handler and real disposable verification, PLAN-01 Month1 / M-02–M-03 / FR-40/AC-40. Exact paths/commands/pre-images precede edits. No new operation/schema, later mutation/UI, broad ADR adoption or Git publication. Parent plan owns actual outcome.

P03D1 bounded result: [SP04-P03D1-RESULT v0.1](features/sp-04-update-task/reviews/p03d1-edit-result.md) under FEAT-SP04-01 v0.13 verifies Backlog editTask only; new14/14 and combined61/61 actual disposable Task assertions, Workspace typecheck, context45/45/contracts27/27/docs20/20. Prior failures/source limits preserved; no schema/wire/ADR adoption, edit UI, full-SP04/SP05/independent acceptance or Git publication. Next separately briefed state-change producer.


## SP-04 owner-requested remaining implementation — 4 November 2026

FEAT-SP04-01 v0.14 registers sequential P03D2/P03D3/P04–P07 remaining implementation and bounded commit before hotfix switch under the owning plan. Trace SP-04.2–04.4 / FR-09/40/43/44 / PLAN-01 Month1 / M-02–M-03. Exact paths/assertions and commands are saved before execution. Actual SP-05 P08 remains prerequisite, no Must deferral or complete-feature acceptance. No unrelated changes, push, deployment, new dependency or accepted ADR edit.

## Database status inspection — 4 November 2026

[DB-CHECK-01 v0.1](features/database-status-check/plan.md) registers a bounded read-only operational check under PLAN-01 v0.4 Month 1 / M-01 / SP-01.1. Entry and DB01 task are v0.1. No startup, migration, data changes or application acceptance. See the plan for authoritative results.


SP-04 bounded checkpoint outcome: [SP04-CONTINUATION-RESULT v0.1](features/sp-04-update-task/reviews/continuation-result.md) / FEAT-SP04-01 v0.14 records actual commands/history/live UI, producer negatives, retained regression failures/focused corrections and final source identity. Canonical SP-04 v0.7.4 / IMPL-SP-04 v0.2 retain P08 actual SP-05 integration open under explicit owner direction. Same FR/AC/PLAN-01/M-02–M-03 trace; no whole-feature, Must deferral, independent approval or deployment. Local commit/switch is authorised; actual Git result is resolved from history, not predicted.
