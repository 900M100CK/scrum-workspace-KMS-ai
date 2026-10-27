# Implementation source and artifact register

**Artifact ID:** IMPL-REG-01\
**Version/date:** 0.10 Draft · 27 October 2026\
**Status:** Source snapshot and navigation, not approval or runtime evidence.\
**Inputs:** REG-00; PRD-01 v0.9; SPEC-INDEX v0.4; PLAN-01 v0.4; SAD-03 v0.16; ADR-0001–ADR-0025.\
**Trace:** Existing BR-01–BR-14 / SC-01–SC-08.\
**Owner role:** Sequential development coordinator.

## Canonical sources

Versions below are reading snapshots. Reopen the source before implementation. A newer source requires impact review, not automatic relabelling of old evidence.

| Source | Snapshot / status | Use and dependent pack |
| --- | --- | --- |
| [AGENTS](../../AGENTS.md), [rules](../development-rules.md), [workflow](../../agents/WORKFLOW.md), [pre-flight](../agent-preflight-checklist.md) | AGENTS 1.10; rules 1.9; pre-flight 0.1; workflow unversioned | Authority/workflow for every pack, including mandatory saved planning for features/fixes/hotfixes/testing; owner/platform instructions prevail |
| [BRD entry](../BRD.md) → [full baseline](../baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md) | 1.0 Draft for business validation | Business scope; proposed addenda do not silently amend it |
| [PRD](../sdlc/PRD_SRS.md) | PRD-01 0.9 Draft | Canonical FR/ACs, release gates, assumptions and ODs; all tasks |
| [use cases](../sdlc/use-cases.md) | UC-02 0.8 Draft | Actor and alternate/failure flows; corresponding slice |
| [architecture](../architecture.md), [ADR index](../adr/README.md) | SAD-03 0.16 Draft; decision status varies | Ownership and boundaries; see [decision register](decisions.md) |
| [technology stack](../tech-stack.md) | TECH-STACK-01 1.6; owner-selected framework foundation distinct from domain/security/runtime gaps | Required for D-01 / SP-01.1 and technology-dependent tasks; section 7 maps algorithms/data structures to existing slices. Official observations checked 26 October; framework adoption is bounded by OWNER-FRAMEWORK-01; no database-image or retrieval benchmark is implied. Reverify compatibility before installation. |
| [owner decision record](../planning/owner-decisions-2026-10-16.md) | OWNER-Q-01 0.1 | Backlog return state and immutable pre-guard manifest order |
| [Earlier owner input](../../owner-decisions-OD-02-03-04-11.md), [business-review record](../analyst/business-review-2026-10-13.md) | Confirmation provenance; read current ADR disposition and dated records | Relevant decision preparation across packs. Avoid re-asking settled choices or treating an old proposal as new authority. |
| [data design](../sdlc/data-design.md), [logical model](../../contracts/data-model.json), [storage runbook](../../infra/postgres/README.md) | DATA-04 0.12; logical model 0.8; inspect current migration state | Reuse owned migrations; SQL evidence is not application enforcement |
| [Data-policy fit review](../sdlc/data-policy-fit-review.md) | DATA-FIT-01 0.6 Draft with dated snapshot/follow-ups | SP-02/05–08/11: schema capability versus handler invariants. Reconcile later migrations/references before calling historical gaps still missing. |
| [API design](../sdlc/api-design.md), [Workspace](../../contracts/openapi/workspace.openapi.json), [Knowledge](../../contracts/openapi/knowledge.openapi.json) | API-05 0.17; Workspace 0.2.8 / Knowledge 0.2.9 | Exact methods, paths, wire schemas, auth, revision and replay rules |
| [Contract pack](../../contracts/README.md), [domain-change schema](../../contracts/events/domain-change.schema.json) | CONTRACT-01 0.19 Draft; event schema is a draft interface | SP-02–11: replay requires current authority; events are invalidation hints, not permission decisions. No broker/event framework is selected. |
| [Byte-binding reference](../sdlc/references/handoff-byte-reference-2026-10-18.md), [SQL projection](../sdlc/references/handoff-sql-projection-2026-10-18.md), [prepared-record query](../../services/knowledge/queries/get-handoff-manifest.sql) | HANDOFF-REF-01 0.3; HANDOFF-SQL-01 0.2; historical synthetic/SQL evidence | SP-09/11: reuse exact-byte/query prerequisites. They do not prove current authority, HTTP handler, guard, transport or permission enforcement. |
| [spec index](../../specs/README.md), [machine index](../../specs/index.json) | SPEC-INDEX 0.4; individual specs retain their own versions | Canonical scope, allowed paths and dependency ownership; all task packs |
| [release scope](../planning/release-scope.json), [backlog](../planning/backlog.md), [relative plan](../planning/five-month-plan.md) | PLAN-01 0.4; BACKLOG-01 0.3 | Tier authority and existing planning; this folder adds no deadline or deferral |
| [UX blueprint](../sdlc/ui-ux-blueprint.md), [sitemap](../ux/sitemap.md), [web preview](../../apps/web/README.md) | Blueprint 1.4; sitemap 0.10; web guide unversioned | Bind actual routes/API state; preserve owner-selected soft-green UI |
| [UX entry](../sdlc/ui-ux-spec.md), [permission matrix](../ux/permission-matrix.md), [wireframe plan](../ux/wireframe-workplan.md), [native frame inventory](../ux/wireframes/README.md) | UX-06 0.13; matrix 0.11; UX-PLAN-01 0.2; UX-WF-EX-01 0.2 | UI work in SP-01–09/13: frame/state/UC/TC mapping and independent action/read rights. Native frames do not close usability or runtime gates. |
| [UI reference desk](../../references/README.md), [development skills and UI routing](../../agents/development-skills.md#ui-skill-workflow) | UI-REF-01 0.5; DEV-SKILLS-01 0.2 | Preserve current visual direction and canonical skill paths. Skills/templates guide method, not scope, authority or automatic framework adoption. |
| [Board](../ux/flows/board-flow.md), [Documents](../ux/flows/docs-flow.md), [AI](../ux/flows/ai-qa-flow.md) | 0.10 / 0.9 / 0.9 Draft | Work reconstruction; independent document commands; protected evidence/delivery |
| [test plan](../sdlc/test-plan.md), [coverage](../sdlc/test-coverage.md), [verification](../sdlc/requirement-verification.md), [evaluation](../../eval/README.md) | TEST-08 0.21; coverage 0.4; verification 0.5; EVAL-01 0.2 Draft, no model execution/frozen criteria | Canonical TC assertions and evidence destinations; not passing runtime results. Older evaluation input versions remain its documented snapshot. |
| [Evaluation rubric](../../eval/rubric.md), [configuration draft](../../eval/config/configurations.yaml), [safety applicability](../../eval/safety-configuration-expectations.md) | EVAL-RUBRIC-01 0.2; configuration/applicability are draft definitions, not run results | SP-09/10/12: separate RQ/EVAL corpus/scenario/configuration identity and claim scoring. SP-12.1 must implement runner/adapters/result capture and validate applicability before pilot. |
| [central register](../sdlc/artifact-register.md) | Current REG-00; read current header | Registers this pack alongside SDLC artifacts |

## Pack inventory

Artifacts below are owned by the sequential development coordinator. IMPL-REG-01 is v0.10 Draft dated 27 October; IMPL-DEC-01 is v0.5 and IMPL-SP-01 is v0.6 dated 27 October; IMPL-ENTRY-01 and IMPL-TASKS-01 are v0.2 dated 27 October; IMPL-EXEC-01 is v0.5 and IMPL-ROADMAP-01 is v0.6 dated 27 October; IMPL-SP-11 and IMPL-SP-12 remain v0.2 dated 26 October; other original pack artifacts remain v0.1 dated 26 October. Inputs and trace are in each header. Handoff is preparation-ready with stated gaps, never approval. No handlers have been delivered by this pack.

| Artifact | Path | Dependency / purpose |
| --- | --- | --- |
| IMPL-ENTRY-01 | [README](README.md) | Entry and reading order |
| IMPL-REG-01 | [register](register.md) | Canonical source map |
| IMPL-DEC-01 | [decisions](decisions.md) | Current decisions and implementation gates |
| IMPL-ROADMAP-01 (v0.6) | [roadmap](roadmap.md) | Milestones using existing slices and feature-plan backlinks |
| IMPL-EXEC-01 (v0.5) | [execution](execution.md) | Agent workflow and saved feature-plan gate |
| IMPL-FEATURES-01 (v0.5) | [work plan register/template](features/README.md) | Plan mode → saved plan → parent registration → small tasks → actual evidence; FEAT-SP01-01 registered under M-01 |
| FEAT-SP01-01 (v0.2) | [session foundation work plan](features/sp-01-session-foundation/plan.md) | M-01 / PLAN-01 Month 1; 12 small tasks; SP01-P01 next, application adoption gated |
| FEAT-SP01-ENTRY / SP01-P01–SP01-P12 (all v0.1) | [feature folder entry](features/sp-01-session-foundation/README.md); individual task links in [plan](features/sp-01-session-foundation/plan.md#tasks-and-acceptance) | Bounded executable task briefs; one authoritative parent status table, no new runtime pass |
| IMPL-HANDOFF-01 | [handoff template](handoff-template.md) | Brief and result record |
| IMPL-TASKS-01 | [task catalogue](tasks/README.md) | Maps all 13 packs to specs, tiers and dependencies |
| IMPL-SP-01 (v0.6) | [session preparation](tasks/01-session.md) | SP-01.1 preparation In progress; remaining application children Not started |
| IMPL-BRIEF-SP01-01 (v0.2) | [SP-01.1 brief](briefs/SP-01.1-session-foundation.md) | Canonical contract assertions; links the detailed runtime plan; prior result remains a v0.1 snapshot |
| IMPL-SPIKE-SP01-01 (v0.2) | [runtime spike brief](../../SP-01.1-spike-brief.md) | Corrected external brief: clock/renewal, barriers, serializer stages, pool discard, before/after manifests and scope; runtime Not run |
| External preparation review (unversioned) | [original review](../../SP-01.1-prep-review.md) | Preserved author input; dispositions are in the revised spike and source register, not an executed independent review |
| ADR-0024 / ADR-0025 (v0.1) | [backend proposal](../adr/0024-backend-session-foundation.md), [session proposal](../adr/0025-opaque-session-candidate.md) | D-01a/D-02 Proposed; frontend adoption and expiry policy remain open |
| IMPL-IMPROVE-01 (v0.2) | [reconciled improvement report](improvement-report-techstack-to-sp.md) | Corrected external-review recommendations and dependency interpretation |
| IMPL-PREP-SP01-01 (v0.2) | [dated preparation result](../sdlc/reports/SP-01.1-preparation-2026-10-27.md) | Original v0.1 execution evidence unchanged; input snapshot clarified after the plan revision; runtime/owner gates explicit |
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

[INIT-FRAMEWORK-01 v0.1](features/framework-foundation/plan.md) and its README/INIT-01–INIT-04 v0.1 task files are registered for the owner-directed main scaffold, design/prototype preservation and GitHub publication. This is separate from SP-01 domain acceptance.
