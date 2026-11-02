# Implementation source and artifact register

**Artifact ID:** IMPL-REG-01\
**Version/date:** 0.26 Draft · 2 November 2026\
**Status:** Source snapshot and navigation, not approval or runtime evidence.\
**Inputs:** REG-00; PRD-01 v0.9; SPEC-INDEX v0.8; PLAN-01 v0.4; SAD-03 v0.16; ADR-0001–ADR-0026.\
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
