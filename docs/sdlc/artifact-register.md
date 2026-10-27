# SDLC artifact register

## Historical consistency reconciliation — 16 October 2026

Historical REG-00 v0.22 records SAD-03 v0.10, DATA-04 v0.6, SAD-03-ENTRY v0.9, UML-07 v0.14, DGM-ARCH-01 v0.9, DGM-FLOW-01 v0.9 and TECH-STACK-01 v1.1. PostgreSQL English full-text search (GIN) — independent keyword path — is the C0 baseline; pgvector exact discovery serves the AI path. Trigram/fusion remains unselected. Applied migrations were inspected and not changed. Structural lint and rendered review are separate from runtime evidence.

The earlier search-path correction checked 8 diagram pairs / 17 artifacts under Node 24.21.0 and rendered its two changed diagrams. The current complete-inventory evidence below supersedes those counts. No application, database migration, provider or permission-runtime test was run for these corrections.

## Historical diagram metadata review — 16 October 2026

[DGM-REVIEW-02 v0.1](diagrams/review-2026-10-16.md) rechecks RV-01–RV-08 against current sources; [DGM-REVIEW-01](diagrams/review.md) remains an unchanged historical record. SITE-01 v0.5 removes product Drafts in both formats. FLOW-05 v0.4 includes ADR-0013/0015/0017 in its generated Sources. DGM-UC-01 had an explicit verifier exclusion with no documented scope waiver; v0.4 is now registered and checked using typed UML relations, including corrected «include» labels.

`diagrams/manifest.json` now controls registered IDs, versions, paths, source origins, ADR sets and checked operation references. `npm run docs:sync-metadata` generates paired headers/titles, child READMEs and marked inventory/version tables. Lint checks generated drift, all diagram ADR references, same-label unselected/not adopted retrieval terminology and 13 facade operation mappings. RV-09 remains open for use-case/document-flow routing and print-scale readability; structural success does not supply visual or runtime acceptance.

## Historical business review and policy reconciliation — 14 October 2026

REG-00 v0.18 records the owner's confirmed directions in [BA-REVIEW-02 v0.2](../analyst/business-review-2026-10-13.md) and [ADR-0007–ADR-0011](../adr/README.md): explicit revocable author read grants, fixed Sprint policy, immediate Current revisions, 60 release Musts and Workspace-first creation with protected source/citation/AI handoffs. ADR-0008 v0.2 also records direct board transitions and reopening Done; reopening from a Completed Sprint preserves completion history and returns the task to Backlog. These are session-confirmed directions, not independent approval or completed application implementation.

New migration 002 pairs preserve applied migration 001; database evidence is recorded in the business review. PRD/scope/contracts/specs and the selected UC/UX/diagram flows now reflect these directions; full semantic review and Stage 8/9 reconciliation remain pending. The owner supplied the research note and adopted 25 research questions (8/8/9) with fixtures/reference answers, retaining 25 safety regressions separately. BRD §13.4 is a Proposed addendum, not academic approval. Capacity is at least eight hours per working day with submission April 2027; kickoff/days per week remain unknown. Shortfalls trigger schedule/capacity review, not automatic Must cuts.

| Added artifact | Version / state | Owner and next handoff |
| --- | --- | --- |
| BA-REVIEW-02 | 0.2 Draft; review ongoing | Business analyst; full BR/FR/AC/SC/UC audit pending |
| ADR-0007–ADR-0011 | 0.1 except ADR-0008 v0.2; owner-confirmed direction | Architect/requirements/data; full runtime evidence pending |
| Workspace/Knowledge migration 002 | Added; isolated verification recorded in BA review | Data designer; no applied migration rewritten; local development upgrade not yet claimed |

Before this UC/UX slice, context checks passed with 68 active FRs, withdrawn FR-45, 60 Must, 55 operations and 25 research definitions; 21 context unit tests passed. Each edited diagram pair has structural checks; final full docs checks are recorded after execution below. No runtime/provider result, visual acceptance or commit is claimed.

## Historical reconciliation details — 16 October 2026

C-1: scoped audit identity is recorded in a Proposed BRD addendum and ADR-0012 context; formal baseline acceptance and runtime enforcement remain open. C-2/C-4: PRD AC rows and UC-02/09 flows are inline. C-3: SAD FR wording and Flow 4 were resynchronised. T-1–T-6 are specified assertions, not executed results. Q-1/Q-2 are owner-confirmed in OWNER-Q-01: unfinished returns become To Do; complete immutable manifests persist before guard, followed by guarded exact matching and zero-byte abort/fresh preparation on mismatch. Schema/handler enforcement remains unimplemented.

Historical reconciliation versions (OWNER-Q-01 v0.1, SP-04/05/09/11 v0.4, SPEC-INDEX v0.4, CONTRACT-01 v0.4, logical model v0.3): PRD-01 v0.9; UC-02 v0.6; SAD-03 v0.12 / entry v0.11; DATA-04 v0.9; API-05 v0.6; UX-06 v0.3; TEST-08 v0.5; TEST-COVERAGE-01 v0.3; VERIFY-01 v0.3; DATA-FIT-01 v0.3; EVAL-CASES-ENTRY v0.5; EVAL-RUBRIC-01 v0.2; SPEC-REVIEW-01 v0.9; UML-07 v0.16 and DGM-ARCH-01 v0.9 ADR-0001 is v0.3 Superseded in part; ADR-0012 is v0.3 and ADR-0013–ADR-0017 are v0.2 Owner-confirmed, with owner-direction source paths and no runtime claim. The research and audit BRD addenda are each v0.1 Proposed; the dated §13.4 text is no longer inside BRD v1.0.

Historical 16 October reconciliation checks used Node 24.21.0. `docs:lint` passed 9 pairs, 21 artifacts, 172 native nodes (including the use-case boundary) and 207 relations. Combined docs/context tests passed 46/46 (15 docs, 31 context); context lint/check passed with 69 active FR and 56 operations. Metadata check passed with 35 outputs checked and no changes. All nine Draw.io diagrams exported with exit 0 and their overviews were inspected. Structural validation found zero errors; crossing warnings remain for AI (15), Board (1), protected-read (2) and AI checkpoints (3). Use-case/document-flow through-node routes are visible despite zero static warnings; RV-09 remains open. Generator syntax and diff whitespace checks passed. Application, migration, provider and guard-runtime tests were not run.

Prior OWNER-Q-01 verification: combined Node 24.21.0 run `node --test tests/docs.test.mjs tests/context.test.mjs` passed 40/40; `npm run context:lint`, context check, generator syntax and `git diff --check` passed. Draw.io structural validation reported zero errors on all five changed pairs; crossing warnings remain (AI 15, AI checkpoints 3, protected-read 2, Board 1, architecture 0). Visual Board repairs removed the observed through-node routes; the remaining crossing/print-scale limitations are not runtime evidence. TC-26 remains Specified / application Not run.

## Current register and handoffs

**Artifact ID:** REG-00
**Version/date:** 0.78 Draft · 27 October 2026
**Status:** Draft; confirmed policy corrections in progress, full coverage and remaining decisions explicit.
**Source versions:** Proposed ADR-0024/0025 for SP-01.1; [BRD stable entry](../BRD.md) → [English BRD v1.0](../baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md) and two Proposed addenda, [AGENTS.md v1.10](../../AGENTS.md), [workflow](../../agents/WORKFLOW.md), PRD-01 v0.9, UC-02 v0.8, SAD-03 v0.16 and ADR-0007–ADR-0017. Prior review inputs remain historical. Storage has measured test evidence; interviews, pilot and application runtime evidence remain absent.; Proposed ADR-0019; Proposed ADR-0021; Proposed ADR-0022; Proposed ADR-0023

| Stage/ID | Path | Owner role | Version/status | Inputs/dependencies | Planned BR/SC coverage | Open decisions |
| --- | --- | --- | --- | --- | --- | --- |
| 0 / REG-00 | docs/sdlc/artifact-register.md | Coordinator | 0.78 Draft | Current requirements, corrective ADRs and queue | BR-01–BR-15; SC-01–SC-08 | Author corrections tracked separately from runtime acceptance |
| Shared framework foundation / INIT-FRAMEWORK-01; INIT-FRAMEWORK-ENTRY; INIT-01–INIT-04 | [plan and task folder](../implementation/features/framework-foundation/README.md); apps/web; services/workspace; services/knowledge; [design/prototype](../../design/prototype/README.md) | Sequential implementer | Plan/entry/tasks v0.1; actual tuple in owner record | TECH-STACK-01 v1.6; OWNER-FRAMEWORK-01 v0.1; ADR-0003 v0.2; bounded shared scope | M-01 / SP-01 preparation, BR-01/10 and SC-06 relevance only | Framework startup/build/typecheck/liveness separate from all session/permission/DB/provider acceptance; publication pending |
| Owner framework selection / OWNER-FRAMEWORK-01 | [owner record](../planning/framework-foundation-owner-2026-10-27.md) | Owner direction recorded by implementer | 0.1 Draft; selected foundation | Explicit owner messages, current installed package/lockfile and foundation checks | Existing frontend/two-service design; no new domain scope | Identity, pg transaction/validator integration, guard and provider remain open; no independent acceptance |
| Framework execution result / INIT-FRAMEWORK-RESULT | [result](reports/framework-foundation-2026-10-27.md) | Sequential implementer | 0.1 Draft; local foundation verified, initial publication pending | INIT-FRAMEWORK-01 v0.1; selected exact packages; new source/lockfile; OWNER-FRAMEWORK-01 v0.1 | Framework preparation for existing M-01 / SP-01 | 7 foundation, 20 prototype, 45 context, 26 contract and 20 docs tests; actual built HTTP smoke; zero protected business handlers verified |
| Session feature work plan / FEAT-SP01-01 | [saved plan](../implementation/features/sp-01-session-foundation/plan.md); [work index](../implementation/features/README.md); [parent roadmap](../implementation/roadmap.md) | Sequential implementer | Plan v0.2 Draft; task briefs v0.1 | SP-01 v0.4; IMPL-SP-01 v0.6; runtime/canonical brief v0.2; Proposed ADR-0024/0025 | FR-01/36/37/68; BR-01/10; SC-06 relevance | 12 tasks Not started; SP01-P01 next, D-01a/D-02 adoption gates open; active feature branch, no new runtime result |
| Session folder entry and small tasks / FEAT-SP01-ENTRY; SP01-P01–SP01-P12 | [entry](../implementation/features/sp-01-session-foundation/README.md); [task files linked from plan](../implementation/features/sp-01-session-foundation/plan.md#tasks-and-acceptance) | Sequential implementer | All v0.1 Draft | FEAT-SP01-01 v0.2; canonical SP-01 and spike inputs | Existing session ACs and applicable TC-18/22; no scope addition | Each task has dependencies, write scope, steps, assertions and handoff; execution state stays in plan, Not started |
| Development entry / feature planning | [AGENTS.md](../../AGENTS.md); [development rules](../development-rules.md#111-work-planning-gate); [feature register/template](../implementation/features/README.md) | Owner-directed development workflow | AGENTS 1.10; development rules 1.9; IMPL-FEATURES-01 v0.5 Draft | PLAN-01 v0.4; canonical specs; IMPL-ROADMAP-01 v0.6; IMPL-EXEC-01 v0.5 | Existing feature FR/AC/BR/SC planning only; no product scope change | Features/fixes/hotfixes/testing require Plan mode when available, a saved plan with parent registration and small tasks before coding; no feature runtime acceptance |
| Repository navigation / DOC-NAV-01 | [docs/README.md](../README.md); [tooling map](../../scripts/README.md) | Sequential development coordinator | 0.2 Draft | Development rules v1.9; AGENTS.md v1.10; existing canonical indexes | Existing BR-01–BR-15 / SC-01–SC-08 navigation only | Location-only tooling/test refactor; runtime and independent acceptance unchanged |
| Implementation navigation / IMPL-ENTRY-01; IMPL-REG-01; IMPL-DEC-01; IMPL-ROADMAP-01; IMPL-EXEC-01; IMPL-HANDOFF-01; IMPL-TASKS-01; IMPL-SP-01–IMPL-SP-13 | [docs/implementation/README.md](../implementation/README.md); [pack register](../implementation/register.md); [task catalogue](../implementation/tasks/README.md) | Sequential development coordinator | IMPL-REG-01 v0.10 / IMPL-DEC-01 v0.5 / IMPL-SP-01 v0.6; IMPL-EXEC-01 v0.5; IMPL-ROADMAP-01 v0.6; IMPL-ENTRY-01 / IMPL-TASKS-01 / IMPL-SP-11/12 v0.2; others v0.1 Draft | PRD-01 v0.9; SPEC-INDEX v0.4; PLAN-01 v0.4; SAD-03 v0.16; current contracts, UX and ADR-0001–ADR-0025 | Existing BR-01–BR-14 / SC-01–SC-08 through canonical specs; no added scope | SP-01.1 preparation In progress; other 51 children Not started; Proposed gates open, no application acceptance |
| Session preparation / IMPL-BRIEF-SP01-01; IMPL-PREP-SP01-01 | [brief](../implementation/briefs/SP-01.1-session-foundation.md); [result](reports/SP-01.1-preparation-2026-10-27.md) | Sequential implementer | Both v0.2 Draft; result clarifies its historical v0.1 input snapshot | SP-01 v0.4; PRD v0.9; Workspace v0.2.8; TECH-STACK v1.5; ADR-0024/0025 | FR-01/36/37/68; BR-01/10; SC-06 | Original schema pre-evidence unchanged; full HTTP/DB/session spike and owner decisions open |
| Session runtime experiment plan / IMPL-SPIKE-SP01-01 | [detailed spike brief](../../SP-01.1-spike-brief.md); [external review input](../../SP-01.1-prep-review.md) | Sequential preparation author | Brief v0.2 Draft; external review unversioned and unchanged | IMPL-BRIEF-SP01-01 v0.2; current session contract; Proposed ADR-0024/0025 | FR-01/36/37/68; BR-01/10; SC-06 relevance only | 38 revised experiment IDs, runtime Not run; no dependency, clock policy or owner acceptance |
| Session foundation candidates / ADR-0024; ADR-0025 | [backend](../adr/0024-backend-session-foundation.md); [opaque sessions](../adr/0025-opaque-session-candidate.md) | Architect | Both v0.1 Proposed | ADR-0003; PRD v0.9; canonical session contract and brief | FR-01/36/37/68; BR-01/10; SC-06 | D-01a/D-02 not selected; D-01b independent; no application package or session migration adoption |
| Reconciled improvement review / IMPL-IMPROVE-01 | [report](../implementation/improvement-report-techstack-to-sp.md) | Coordinator | v0.2 Draft, first repository edition | Owner-supplied external report and rebuttal; current contracts/packs; Proposed ADR-0024/0025 | Existing BR-01–BR-14 / SC-01–SC-08 | Corrected recommendations, retained canonical dependency order and full Must scope |
| Implementation input review / IMPL-REVIEW-01 | [docs/sdlc/reviews/implementation-input-review-2026-10-26.md](reviews/implementation-input-review-2026-10-26.md) | Coordinator consolidating three owner-requested read-only reviewer passes | 0.2 Draft; documentation corrections author-rechecked, runtime open | Snapshot TECH-STACK-01 v1.4; IMPL-REG-01/DEC-01/SP-01 v0.2; other implementation packs v0.1; actual local configuration and canonical sources | Existing BR-01–BR-14 / SC-01–SC-08 readiness; bounded DR-05/08/09/10/12 | Six documentation corrections recorded; runner implementation, technology selection and runtime/independent acceptance still open |
| Supporting review register / DOC-REVIEW-REG-01 | [docs/sdlc/references/document-review-register.md](references/document-review-register.md) | SDLC coordinator | 0.19 Draft | Development rules v1.9; pre-flight checklist; workflow; REG-00; SDLC index | Existing BR-01–BR-15 / SC-01–SC-08 documentation navigation only | Bounded corrections recorded; full document-type reviews remain unassigned |
| Navigation / SDLC-INDEX-01 | [docs/sdlc/README.md](README.md) | SDLC coordinator | 0.5 Draft | Development rules; workflow; REG-00 | Existing documentation navigation only | Review register linked; source review and acceptance remain separate |
| Excalidraw wireframes / UX-WF-EX-01 | [docs/ux/wireframes/README.md](../ux/wireframes/README.md); native scene and PNG/SVG previews | Sequential UX author | 0.2 Draft | UX-BLUEPRINT-01 v1.4; UX-PLAN-01 v0.2; UX-06 v0.13; current scoped contracts | BR-01–BR-14; SC-01–SC-08 through frame UC/TC mappings | Initial 12 desktop frames; native import, full BL/DC variants, responsive/accessibility/usability and runtime gates remain open |
| UI references / UI-REF-01; UI-REVIEW-01 | references/README.md; references/ui-review-2026-10-23.md | Sequential UI author | UI-REF-01 v0.5; UI-REVIEW-01 v0.1 historical | UX-BLUEPRINT-01 (snapshot 1.3); contracts; SP-01–04; Proposed stack/read designs | BR-01/02/03/10/12/13; SC-01/03/06/08 | Live stack/identity, application enforcement and independent acceptance remain open |
| Soft green CSS system / UI-CSS-01 | references/ui-css-green-system-2026-10-26.md; apps/web/ | Sequential UI author | 0.1 Draft | UX-BLUEPRINT-01 v1.4; UI-REF-01 v0.5; owner CSS refinement | BR-01/02/03/10/13; SC-01/03/06/08 | Synthetic preview only; independent/runtime acceptance open |
| Studio refinement / UI-REFINE-01 | references/studio-refinement-2026-10-26.md; apps/web/ | Sequential UI author | 0.1 Draft | UX-BLUEPRINT-01 v1.4; UI-REF-01 v0.5; owner comparison | BR-01/02/03/10/13; SC-01/03/06/08 | Local preview checks; independent/runtime acceptance open |
| UI experiment / UI-STUDIO-01 | references/hallmark-studio-2026-10-25.md; apps/web/ | Sequential UI author | 0.1 Draft | UX-BLUEPRINT-01 v1.4; UI-REF-01 v0.5; Hallmark Studio reference | BR-01/02/03/10/13; SC-01/03/06/08 | Owner selected 26 October; independent/runtime acceptance open |
| UI theme / UI-THEME-01 | references/ui-dark-theme-2026-10-24.md; apps/web/ | Sequential UI author | 0.1 Draft | UX-WF-EX-01 (snapshot 0.1); UX-BLUEPRINT-01 (snapshot 1.3); UI-REF-01 v0.4 | BR-01/02/03/10/13; SC-01/03/06/08 | Local theme, token tests and screenshots; independent/runtime acceptance open |
| UI redesign / UI-REDESIGN-01 | references/ui-redesign-2026-10-24.md; apps/web/ | Sequential UI author | 0.1 Draft | UX-WF-EX-01 (snapshot 0.1); UI-REF-01 v0.3; existing contracts and Proposed stack | BR-01/02/03/06/10/13; SC-01/03/04/06/08 | Local rendered observations and DOM tests; live application and independent acceptance open |
| UI wireframe implementation / UI-WORK-02 | references/ui-work-wireframe-2026-10-24.md; apps/web/ | Sequential UI author | 0.1 Draft | UX-WF-EX-01 (snapshot 0.1); UI-REF-01 v0.2; existing contracts; ADR-0008/0014; Proposed stack/read designs | BR-01/02/03/06/10/13; SC-01/03/04/06/08 | DOM/test evidence only; live security/transaction/runtime and fresh rendered acceptance open |
| UI preview / local presentation | apps/web/ | UI author | Work-preview update; synthetic state only | UX-WF-EX-01 frames 03/04/10; WF-01–03/09; current work_location draft | SP-01–05 presentation groundwork only | No live session/API/permissions/persistence; fresh rendered validation blocked by browser URL policy |
| Development tooling / DEV-SKILLS-01 | agents/development-skills.md; .agents/skills/sources.json | Development agent | 0.2 Draft; five local skills plus routing for 13 user-level UI skills | AGENTS v1.7; development-rules v1.5; pinned upstream revisions in guide | Supports SP-01–04 presentation discipline; no new FR/AC or runtime evidence | Exact-path workflow is guidance, not global discovery control; adherence and design outcomes unmeasured |
| 1 / PRD-01 | `docs/sdlc/PRD_SRS.md` | PRD/SRS author | 0.9 Draft; 69 active FRs plus withdrawn FR-45 | BRD v1.0; ADR-0007-0017; owner clarifications | BR-01–BR-15; SC-01–SC-08 mapped | Remaining decisions as recorded in PRD; 60 Must retained |
| Architecture policy / ADR-0001 | `docs/adr/0001-protected-resource-read-policy.md` | Architect role | 0.3 Superseded in part; remaining safeguards Proposed | BRD v1.0, PRD-01 (historical v0.4 input), owner review | BR-01, BR-05, BR-08, BR-10, BR-12, BR-14; SC-05, SC-06 | OD-02, OD-04; enforcement design remains Stage 3 |
| 2 / UC-02 | docs/sdlc/use-cases.md | Use-case author | 0.8 Draft | PRD-01 v0.9; owner-confirmed ADRs | BR-01–BR-14; SC-01–SC-08 | Delegation/retention and runtime exception execution |
| 3 / SAD-03 | docs/architecture.md; docs/sdlc/SAD.md entry | Architect | SAD-03 v0.16; SAD-03-ENTRY v0.15 Draft | Current PRD/use cases; Proposed ADR-0018–ADR-0023 | BR-01–BR-14; SC-01–SC-08 | Isolated handoff storage supplied; active process/guard/adapter evidence open |
| Architecture reference / TECH-STACK-01 | `docs/tech-stack.md` | Architect | v1.6; owner-selected framework foundation, prototype and unimplemented protected mechanics separated | SAD-03 v0.16; ADR-0004 v0.2; official-source check 26 October; existing slice/algorithm mapping | BR-07, BR-08, BR-13; SC-02, SC-08 | Framework foundation selected; session/guard/provider/DB-adapter and pilot evidence remain open |
| 4 / DATA-04 | docs/sdlc/data-design.md; contracts/data-model.json | Data designer | DATA-04 v0.12 Draft; logical model v0.8 | SAD-03 v0.16; confirmed policy and corrective Proposed ADRs | BR-01–BR-14; SC-01–SC-08 | Applied storage foundation distinct from unimplemented logical additions |
| 5 / API-05 | docs/sdlc/api-design.md; contracts/ | API designer | API-05 v0.17; Workspace v0.2.8 / Knowledge v0.2.9; 66 operations | DATA-04 v0.12; SAD-03 v0.16; Proposed ADR-0018–ADR-0023 | BR-01–BR-14; SC-01–SC-08 | Handler/consumer-provider/access tests and unimplemented opaque token/receipt handlers |
| 6 / UX-06 | docs/sdlc/ui-ux-spec.md; docs/ux/ | UX designer | UX-06 v0.13; Board v0.10, AI v0.9, Docs v0.9, sitemap v0.10, matrix v0.11, personas v0.5 | Current PRD/use cases/SAD and contract drafts | BR-01–BR-14; SC-01–SC-08 | Token/receipt handlers, visual tokens/viewports, usability/accessibility and application evidence |
| 7 / UML-07 | `docs/sdlc/diagrams/README.md`; five type folders; `docs/sdlc/diagrams/review-2026-10-16.md`; historical `review.md` | Diagram author | UML-07 v0.21; DGM-REVIEW-02 v0.1; current versions below | Current UC/UX/SAD sources and owner-confirmed direction | BR-01–BR-14; SC-01–SC-08 as applicable | RV-09 rendered routing/readability and full semantic review |
| 8 / TEST-08 | docs/sdlc/test-plan.md; test-coverage.md; requirement-verification.md; eval/ | Test author | TEST-08 v0.21; TEST-COVERAGE-01 v0.4; VERIFY-01 v0.5; EVAL-CASES-ENTRY v0.6 | Current PRD/use cases/specs/corrective contracts | BR-01–BR-14; SC-01–SC-08 planned | All application/permission/guard/provider evaluation evidence remains unrun |
| 9 / SPEC-REVIEW-01 (Stage alias REVIEW-09) | docs/sdlc/spec-review.md | Sequential reviewer | 0.30 Draft; original v0.4 history preserved | Snapshot inputs retained in source; no execution or review rerun | BR-01–BR-15; SC-01–SC-08 | Bounded handoff, owner-policy gaps and all runtime acceptance |
| Budget checkpoint / PROGRESS-01 | docs/sdlc/reports/progress-report-2026-10-18.md | Coordinator / author | 0.2 Draft | Correction queue and executed evidence; account 5% observation | BR-01–BR-14; SC-01–SC-08 | Budget-stop reporting complete; application, owner and rendered UI gates remain open |
| Concise handoff / PROGRESS-HANDOFF-01 | docs/sdlc/reports/progress-report-handoff-2026-10-18.md | Coordinator / author | 0.1 Draft | PROGRESS-01 v0.1; FIX-PLAN-01 (snapshot 0.20) | BR-01–BR-14; SC-01–SC-08 | Ready for downstream with runtime/UI gaps; no approval implied |
| Wireframe plan / UX-PLAN-01 | docs/ux/wireframe-workplan.md | UX author | 0.2 Draft | Current Core sources and checklist gaps | BR-01–BR-14; SC-01–SC-08 | Initial native frames/previews exist; full WF variants and rendered/runtime acceptance remain open |
| SQL projection / HANDOFF-SQL-01 | docs/sdlc/references/handoff-sql-projection-2026-10-18.md | Sequential storage/contract author | 0.2 Draft | Snapshot inputs retained in source; no execution or review rerun | BR-08–BR-10, BR-12, BR-14; SC-02/03/05/06 | Seven isolated integration results; current-authority/HTTP/guard/provider gates open |
| Protocol reference / HANDOFF-REF-01 | docs/sdlc/references/handoff-byte-reference-2026-10-18.md | Sequential contract/test author | 0.4 Draft | Snapshot inputs retained in source; no execution or review rerun | BR-08–BR-10, BR-12, BR-14; SC-02/03/05/06 | Synthetic byte/evidence binding only; live SYS-01 gates remain open |
| UX checklist / UX-CHECK-01 | docs/sdlc/reviews/ui-ux-checklist-review-2026-10-18.md | Sequential UX reviewer | 0.2 Draft | Snapshot inputs retained in source; no execution or review rerun | BR-01–BR-14; SC-01–SC-08 | No workbook approval; research, rendered UI and runtime gates remain open |
| UI/UX Blueprint / UX-BLUEPRINT-01 | docs/sdlc/ui-ux-blueprint.md | UI/UX Designer / Author | 1.4 Draft | Local IEEE templates; UX-06, UX-PLAN-01, contracts v0.2.8/v0.2.9; Proposed ADR-0018–0023 | BR-01–BR-14; SC-01–SC-08 | Answer-local optional summary and API task placement aligned; visual/runtime/independent-review gaps open |
| Handoff / UX-HANDOFF-01 | docs/sdlc/handoffs/ui-ux-handoff-2026-10-18.md | Coordinator / UX author | 0.9 Draft | Snapshot inputs retained in source; no execution or review rerun | BR-01–BR-14; SC-01–SC-08 | Wireframes may be drafted; runtime, owner and visual gates remain open |
| 9 / SYS-REVIEW-01 | `docs/sdlc/system-consistency-review-2026-10-18.md` | Consistency reviewer | 0.1 Draft; targeted system review through obsidian_docs | PRD-01 v0.9; UC-02 (dated review snapshot); SAD-03 (dated review snapshot); DATA-04 (pre-correction snapshot); Workspace v0.2.2 / Knowledge v0.2.3; ADR-0012 / OWNER-Q-01 | BR-01–BR-14; SC-01–SC-08 scenario handoff | Two Blocking, two Important, one Minor new finding; existing UX findings remain open |

| Agent checklist / PREFLIGHT-01 | docs/agent-preflight-checklist.md | Development agent | 0.1 Draft | Current source assertions; historical review context | Existing permission/version/citation and evaluation safeguards | Remaining drift notes and runtime enforcement need separate review |
| Delivery / PLAN-01 | docs/planning/five-month-plan.md; release-scope.json | Coordinator / requirements author | 0.4 Draft | PRD-01 v0.9; existing ADR-0010/0016 directions | Existing release scope; no priority change | Capacity and runtime acceptance remain open |

All Must BRs (BR-01–BR-14) and all Core scenarios (SC-01–SC-08) have Stage 1, design and test owners. BR-15 remains Should/Enhanced. Planned status is not completion or approval.

**Optional output decision:** Stage 1 `user-stories.md` is N/A for this draft. PRD-01 FR/AC pairs and UC-02 journeys are the inputs for design and TEST-08; a separate story document would duplicate them. This documentation choice removes no BR/SC, acceptance criterion or required test. PRD-01 is v0.9; this register adds no requirement or acceptance change.

## Decision and gap log

OD-01–OD-12 are defined in [PRD-01 §11](PRD_SRS.md#11-open-decisions-and-handoff). Initial document access/authority, Sprint lifecycle, direct board transitions, immediate revisions and the 60-Must release gate are owner-confirmed. Remaining decisions include additional capability delegation, physical retention, identity/provider choices, pilot thresholds and exact calendar capacity. ADR-0010 lists the exact authorised Core-gate exceptions; no additional Must reduction is allowed without owner direction. Interviews, pilot, environment sizing and application runtime results remain absent.

The BRD leaves architecture to design while AGENTS.md directs minimal microservices; the latter governs development and must be represented in SAD without rewriting BRD. AGENTS v1.3 clarifies `docs/BRD.md` as entry point and `docs/baseline/` as linked full editions; it changes no architecture or business scope.

## Checklist and handoff

| Check | Result | Note |
| --- | --- | --- |
| Artifact inventory and upstream versions | Gap | Current summary reconciled in v0.9; UX-06 entry exists and complete downstream input-version/semantic revalidation remains open. |
| Every Must BR and SC assigned to PRD/design/test | Pass | Coverage shown in table; PRD mapping in §8. |
| Owner decisions and missing inputs logged | Pass | OD-01–OD-12, assumptions and evidence gaps above. |
| Changed requirements and impacts recorded | Pass | PRD §8 continuity map and downstream impact table. |
| Owner review and approval distinguished | Pass | Owner comments incorporated; full baseline and proposed ADR are not approved. |
| Runtime verification / complete-set review | Gap | No implementation or complete downstream set exists. |

**Handoff:** Initial access/lifecycle/Sprint direction and the seven OD-11 exceptions are already owner-confirmed. Proceed under those directions. Remaining delegation, identity, provider, retention, exact calendar and measured capacity decisions still affect baselining; do not request approval again for settled choices. Update the register on revision/review and do not mark a planned stage complete from an upstream draft.

## Historical review handoffs — 18 October 2026

### System logic review handoff — 18 October 2026

[SYS-REVIEW-01 v0.1](system-consistency-review-2026-10-18.md) and [SPEC-REVIEW-01 v0.11](spec-review.md#system-logic-review-through-obsidian--18-october-2026) record the subsequent review with working `obsidian_docs` access. The earlier Stage 6 tool-availability statement below is historical to that run. Status: Draft, Ready for targeted correction; affected flows are not implementation-ready. Stage 3/4/5 owns manifest transport and operational read reconstruction, Stage 5/6/8 owns inspection/metric projections and dependent UX/test reconciliation. Existing policy decisions and 60 Must remain unchanged. This register entry does not add the report to the diagram manifest's 35-artifact validation inventory.

### Pre-UI/UX review handoff — 18 October 2026

[SPEC-REVIEW-01 v0.10](spec-review.md#pre-uiux-review--18-october-2026) records the latest targeted Stage 6 readiness review. Inputs: PRD-01 v0.9, UC-02 v0.6, SAD-03 v0.12, current contracts and UX sources; trace BR-01–BR-14 / SC-01–SC-08. Owner: sequential consistency reviewer/coordinator. Status: Draft; Ready for downstream wireframes with explicit gaps, not implementation-ready approval. UX-R01/R02 block freezing affected screen contracts; UX-R03–R05 require source-inspection/recovery/readiness reconciliation; UX-R06 tracks manual inventory drift. Earlier review versions/counts remain dated snapshots. Obsidian MCP was unavailable; the review used local files and explicitly records its limits.

## Current artifact versions

<!-- BEGIN GENERATED:artifact-versions -->
| Artifact ID | Version | Canonical source |
| --- | --- | --- |
| UML-07 | v0.21 | [Source](diagrams/README.md) |
| REG-00 | v0.78 | [Source](artifact-register.md) |
| SAD-03 | v0.16 | [Source](../architecture.md) |
| UX-PERM-MATRIX-02 | v0.11 | [Source](../ux/permission-matrix.md) |
| UX-PERSONAS-01 | v0.5 | [Source](../ux/personas.md) |
| UX-SITEMAP-03 | v0.10 | [Source](../ux/sitemap.md) |
| UX-FLOW-AI-03 | v0.9 | [Source](../ux/flows/ai-qa-flow.md) |
| UX-FLOW-BOARD-01 | v0.10 | [Source](../ux/flows/board-flow.md) |
| UX-FLOW-DOCS-02 | v0.9 | [Source](../ux/flows/docs-flow.md) |
| DGM-ARCH-01 | v0.9 | [Source](diagrams/architecture/service-composition.mmd) |
| DGM-SITE-01 | v0.8 | [Source](diagrams/sitemap/application-sitemap.mmd) |
| DGM-FLOW-01 | v0.13 | [Source](diagrams/flowchart/ai-qa-flow.mmd) |
| DGM-FLOW-02 | v0.7 | [Source](diagrams/flowchart/board-flow.mmd) |
| DGM-FLOW-03 | v0.9 | [Source](diagrams/flowchart/docs-flow.mmd) |
| DGM-FLOW-04 | v0.9 | [Source](diagrams/flowchart/permission-read-flow.mmd) |
| DGM-FLOW-05 | v0.4 | [Source](diagrams/flowchart/permission-ai-checkpoints.mmd) |
| DGM-JOURNEY-01 | v0.4 | [Source](diagrams/user-journey/core-user-journeys.mmd) |
| PRD-01 | v0.9 | [Source](PRD_SRS.md) |
| UC-02 | v0.8 | [Source](use-cases.md) |
| DGM-UC-01 | v0.5 | [Source](diagrams/use-case/use-case-diagram.mmd) |
| DGM-REVIEW-02 | v0.1 | [Source](diagrams/review-2026-10-16.md) |
| DGM-REVIEW-03 | v0.1 | [Source](diagrams/review-2026-10-17.md) |
| DATA-04 | v0.12 | [Source](data-design.md) |
| DGM-DESIGN-01 | v0.1 | [Source](diagrams/design-foundation-2026-10-17.md) |
| DGM-C4-01 | v0.1 | [Source](diagrams/c4/system-context.mmd) |
| DGM-C4-02 | v0.1 | [Source](diagrams/c4/containers.mmd) |
| DGM-SEQ-01 | v0.2 | [Source](diagrams/sequence/protected-handoff.mmd) |
| DGM-SEQ-02 | v0.1 | [Source](diagrams/sequence/document-creation.mmd) |
| DGM-STATE-01 | v0.1 | [Source](diagrams/state/document-and-readiness.mmd) |
| DGM-STATE-02 | v0.2 | [Source](diagrams/state/sprint-task-allocation.mmd) |
| DGM-DATA-01 | v0.3 | [Source](diagrams/data/workspace-erd.mmd) |
| DGM-DATA-02 | v0.2 | [Source](diagrams/data/knowledge-erd.mmd) |
| DGM-DATA-03 | v0.5 | [Source](diagrams/data/handoff-logical-model.mmd) |
| DGM-DEPLOY-01 | v0.1 | [Source](diagrams/deployment/local-development.mmd) |
| DGM-DEV-01 | v0.1 | [Source](diagrams/development/package-ownership.mmd) |
<!-- END GENERATED:artifact-versions -->

## Historical Verification inventory update - 14 October 2026

[VERIFY-01](requirement-verification.md) v0.2 Draft records 70 FR/AC identities (69 active, one Withdrawn), all current named alternate branches and nine NFR observations. TEST-08 adds TC-23 discovery and TC-24 project/membership positives. UC-02 Alt-2 supplies optional FR-64. ADR-0014 records owner-confirmed multi-selection with per-task outcomes through the existing allocateTask contract. No additional release Must or new endpoint is introduced. Application evidence remains Not run.

Research review update: RESEARCH-CASES-01 v0.2 and EVAL-RUBRIC-01 v0.1 Draft (eval/rubric.md) record semantic review and scoring definitions. ADR-0015 and Knowledge OpenAPI v0.2.2 add partial cited answers; RQ-20/22 clarified with owner confirmation. Provider runs, freeze and independent review remain pending.

## Historical UX consolidation and optional search - 14 October 2026

UX-06 v0.3 now exists with source inventory, screen/UC/TC mapping, common states and dispositions for all 22 UI/UX and 19 Blueprint workbook items. Earlier missing-entry statements below are historical. Rendered UI, measured accessibility and user research remain absent. ADR-0016 adds FR-70 Should (69 active FRs plus Withdrawn FR-45), keeping 60 Must; Workspace API v0.2.1 has searchTasks and total operation count is 56. VERIFY-01 and TC-25 include the extension; no application result is claimed.

## Historical Storage policy fit - 14 October 2026

DATA-FIT-01 v0.3 Draft (`docs/sdlc/data-policy-fit-review.md`) compares actual owned migration fields/privileges against current ADRs. It distinguishes schema fit from absent transaction enforcement and records handoff manifest/entity-kind, purge tombstone, unlink and orphan protocol gaps. ADR-0017 confirms all individually granted capabilities invalidated and current task assignees cleared atomically on member removal; history is preserved. No migration or runtime evidence is claimed by this review.

## Historical records

Earlier register observations are preserved in [the SDLC changelog](CHANGELOG.md). Current decisions and evidence take precedence over those historical snapshots. No history was discarded.

**16 October owner follow-up:** [OWNER-Q-01](../planning/owner-decisions-2026-10-16.md) records acceptance of both recommendations. ADR-0008 v0.3 / ADR-0012 v0.3, FR-09/42/57/67, UC-04/05/09/11, SP-04/05/09/11 and TC-16/21/26 carry the decisions. Logical model v0.3 specifies HandoffManifest/HandoffOutcome and operational entity_kind; additive migration/relay one-use enforcement remain pending. OpenAPI Workspace v0.2.2 / Knowledge v0.2.3 change operation descriptions; no endpoint or response shape was added. Current verification is recorded in the current handoff section above.

## Historical Freshness audit — 17 October 2026

The prior v0.23 refresh registered [DOC-FRESH-01 v0.2](documentation-freshness-2026-10-17.md) and its file inventory. TECH-STACK-01 v1.2, PLAN-01 v0.3, BACKLOG-01 v0.3 and development rules v1.4 correct stale operational guidance; see the audit for evidence, remaining findings and verification limits. No baseline/ADR approval or runtime completion is implied. Earlier dated runs remain historical evidence.

## Historical technology and handoff follow-up — 17 October 2026

REG-00 v0.24 recorded PRD-01 v0.8, SAD-03 v0.11, SAD-03-ENTRY v0.10, TECH-STACK-01 v1.3 and DOC-FRESH-01 v0.2. SPEC-INDEX was v0.3; SP-04/05/09/11 were v0.4 and the other nine specs v0.3. That PRD/SAD refresh was editorial; input-number changes did not establish semantic or runtime acceptance. Official technology evidence and adoption gates are in TECH-STACK-01 §2. No provider/dependency/database upgrade was executed.

## Historical nine-pair correction report — 17 October 2026

| Artifact | Path | Version/status | Inputs / trace | Owner / handoff |
| --- | --- | --- | --- | --- |
| DGM-REVIEW-03 | [Diagram correction report](diagrams/review-2026-10-17.md) | 0.1 Draft; author review | PRD-01 v0.9, UC-02 v0.6, SAD-03 v0.11, DATA-04, current UX/contracts; BR-01/03–05/08–14, SC-01–08 | Documentation coordinator; ready for downstream planning with stated implementation gates |

SPEC-INDEX v0.4 corrects SP-06/SP-10 ownership and adds a contract-owner negative check. The report recommends C4 primary views and a 4+1 crosswalk; it does not adopt a new stack, approve an ADR, or implement handlers. Earlier dated evidence remains a snapshot.

## Historical Diagram foundation extension — 17 October 2026

DGM-DESIGN-01 v0.1 Draft ([report](diagrams/design-foundation-2026-10-17.md)) records eleven additional editable pairs, source/checklist trace, the C4/4+1 crosswalk and unresolved implementation gates. Inputs: PRD-01 v0.9, UC-02 v0.6, SAD-03 v0.12, DATA-04 v0.6, current migrations and ADRs. Coverage: BR-01–BR-14 / SC-01–SC-08. Owner role: sequential documentation author/reviewer. Handoff: Ready for downstream design use with stated gaps; not independent approval. C4 Code/component detail is N/A until implemented handlers justify it.

## Historical Operational read correction handoff — 18 October 2026

FIX-PLAN-01 v0.1 Draft ([queue](handoffs/remediation-priorities-2026-10-18.md)) routes SYS/UX findings and dependencies. ADR-0018 v0.1 Proposed ([decision](../adr/0018-operational-read-projections.md)) specifies the first slice. Inputs: PRD-01 v0.9, SYS-REVIEW-01 v0.1 and confirmed Sprint rules. Trace: BR-02/03/06/13; SC-01/03/04/08. Owner: sequential API author/coordinator. Workspace v0.2.3 / Knowledge v0.2.3 now have 58 operations; API-05 v0.7, CONTRACT-01 v0.5, SP-03 v0.4, SP-04/05 v0.5, Board v0.7, TEST-08 v0.6 and SPEC-REVIEW-01 v0.12 carry the correction. Earlier tables/runs are historical input snapshots where superseded here.

Handoff: Ready for downstream review of the proposed read contracts; SYS-02 runtime acceptance remains open. No inference of policy approval or whole-set completion. SYS-01 is a mandatory pre-AI gate; UX-R01/R02 are the next UI contract slice.

## Historical Priority recheck handoff — 18 October 2026

[FIX-PLAN-01 v0.2](handoffs/remediation-priorities-2026-10-18.md#priority-ordered-recheck--18-october-2026) and [SPEC-REVIEW-01 v0.13](spec-review.md#remediation-priority-recheck--18-october-2026) record the sequential review of all six priorities. Inputs: Workspace/Knowledge v0.2.3, API-05 v0.7, PRD-01 v0.9, ADR-0018 v0.1 Proposed and TEST-08 v0.6. Trace: BR-01–BR-14 / SC-01–SC-08 through the queue; P1-R01/R02 focus FR-07/09/41/42 and NFR-02/04. Owner: Stage 9 reviewer/Stage 0 coordinator. Status: Draft, Ready for targeted correction; no finding group closed. Stage 4 must supply current-location invariants/mapping and Stage 5 must specify reorder preconditions and list semantics before dependent handler readiness. Other priorities retain their existing owners and pre-UI/pre-AI gates. No contract, accepted ADR, release scope or runtime behavior changed.

## Historical Priority 1 persistence and reorder follow-up — 18 October 2026

Proposed ADR-0018 supplies migration 003, explicit current location and full-list Backlog reorder. DATA-04/logical model, DATA-FIT-01, API-05, CONTRACT-01, SP-03/04/05, Board flow and TEST-08 are the owning outputs; exact current versions are in their headers. Workspace v0.2.4 / Knowledge v0.2.3 retain 58 operations. Trace: BR-02/03/06/13, SC-01/03/04/08. P1-R01/P1-R02 design corrections are supplied; remaining handlers/cursor/authority evidence prevent runtime acceptance. SYS-01 remains a pre-AI gate. Historical review inputs remain snapshots.

## Historical Priority 2 discovery handoff — 18 October 2026

Proposed ADR-0019 records UX-R01/R02 discovery design (Stage 3/5), dependent SP-02/06/07 and UI/test updates (Stages 6/8). Workspace v0.2.5 / Knowledge v0.2.4: 64 operations. No accepted ADR, release scope or physical schema is changed. Draft design is usable for bounded wireframes; runtime authorization/paging, additional delegation and non-reading write/lifecycle preconditions remain gaps. SYS-01 remains a pre-AI-relay blocker.

## Historical Priority 2 verification handoff — 18 October 2026

[FIX-PLAN-01 v0.5](handoffs/remediation-priorities-2026-10-18.md#priority-2-verification-recheck--18-october-2026) and [SPEC-REVIEW-01 v0.16](spec-review.md#priority-2-verification-recheck--18-october-2026) record three Important open findings (P2-R01–P2-R03), confirmed six-read inventory and reproduced 51/51 structural tests. Inputs: Workspace v0.2.5 / Knowledge v0.2.4, ADR-0019 v0.1 Proposed, DATA-04 v0.7 and PRD-01 v0.9. Trace: BR-05/10/12; FR-04/12/27/47/58/59; SC-05/06. Owner: sequential Stage 9 reviewer/Stage 0 coordinator; correction owners Stage 3/5/6/8 and context-harness maintainer. Status: Draft, Ready for targeted correction; no runtime closure. Version identity, summary-versus-trace authority and action-catalogue regression checks need reconciliation. SYS-01 and the previously recorded delegation/write-precondition gaps remain open.

## Historical Priority 2 recheck correction handoff — 18 October 2026

Proposed ADR-0019 v0.2, Workspace v0.2.6 / Knowledge v0.2.5, SP-07 v0.5 and SP-13 v0.4 correct the exact version scope and separate summary/trace entitlements. API/UI/test sources are aligned and public-action membership is now validated against both contracts. P2-R01/R02 have design corrections; P2-R03 has harness regression coverage. Live permission, scope pairing/revocation, additional delegation and non-reading write preconditions remain open. No storage change, scope expansion or independent approval; SYS-01 remains the AI gate.

## Historical SYS-01 transport-design handoff — 18 October 2026

Proposed ADR-0020 v0.1, Workspace v0.2.7 / Knowledge v0.2.6, logical model v0.5 and revised SP-09/10/11 supply complete manifest-bound internal transport. DGM-SEQ-01 and DGM-DATA-03 reflect authoritative preparation lookup and exact receipt/evidence/byte/claim bindings. No applied migration, framework/provider choice or runtime permission evidence is changed. The queue checklist tracks remaining priorities, owner-policy gaps and the separate AI-relay runtime gate.

## Historical NEXT-03 inspection handoff — 18 October 2026

Proposed ADR-0021 v0.1, Knowledge v0.2.7, logical model v0.6, revised SP-11/13 and API/UX/test sources address SYS-03/SYS-04 inspection data and missing telemetry at design level. Exact sources bind per-step visible rank; unavailable/not_performed metrics never fabricate values. Source/query/check filtering retains current permission authority; summary stays optional and separate from trace-read. No migration, provider or runtime acceptance. SYS-01 remains the pre-AI-relay gate.

## Historical NEXT-04 consumer handoff — 18 October 2026

UX-FLOW-AI-03 v0.7, UX-SITEMAP-03 v0.7, VERIFY-01 v0.4, UX-06 v0.7 and Knowledge v0.2.8 address citation-kind inspection, deliberate AI recovery and semantic-versus-keyword readiness. Existing entity reads serve operational inspection with historical/current labels. No new operation or runtime evidence. NEXT-05 owns the remaining architecture wording and manual-source inventory reconciliation.

## Historical NEXT-05 wording and inventory handoff — 18 October 2026

SAD-03 v0.13 / SAD-03-ENTRY v0.12 distinguish target-member role data from caller authority and document tuples from operational citation locators. Manual stage/source/route inventories now identify current drafts; older review outcomes and source lists remain under explicitly historical sections. Current table updates do not claim the original dated reviews were rerun. Additional delegation and NEXT-06 remain open; SYS-01 still blocks AI relay.

## Historical NEXT-06 independent command handoff — 18 October 2026

Proposed ADR-0022 v0.1, Workspace v0.2.8 / Knowledge v0.2.9 and logical model v0.7 resolve the known-ID non-reading write/lifecycle precondition/acknowledgement design. Opaque tokens keep current revisions private; minimal receipts never substitute for source reads. UC-02 v0.7, SP-06/07, UX and tests are aligned. Additional delegation/provisioning and token/handler/guard/runtime evidence remain open; SYS-01 still blocks AI relay. NEXT-07 supplied the bounded design recheck and UI handoff; application acceptance remains pending.

## Historical NEXT-07/08 bounded UI/UX handoff — 18 October 2026

UX-HANDOFF-01 v0.2 supplies screen-to-operation bindings, completed author correction tasks and explicit owner/runtime/visual gaps. The queue records 72/72 final structural/schema tests and protected-file comparison; it also distinguishes the calibrated whole-document structure adapter from full OpenAPI semantics and runtime evidence. NEXT-00 through NEXT-08 are supplied author work, while RUNTIME-GATE stays open. SYS-01 remains a pre-AI-relay blocker; SYS-02 still requires operational handlers. Wireframe drafting can use the bounded sources without inventing permissions or marking the drafts approved.

## Historical blueprint author correction — 21 October 2026

UX-BLUEPRINT-01 v1.2 preserves v1.1 gateway/sitemap corrections and aligns remaining bindings with current contracts. Team/capability distinctions, exact citations, unknown outcomes and BR/SC trace are restored. Candidate tokens establish no measured budget or WCAG claim. Four sequential draft briefs retain work-before-AI order. Existing Proposed ADR dependencies remain unresolved; no new policy, requirement or ADR is created. These are design-text corrections, not runtime evidence or independent acceptance.

DGM-FLOW-01 v0.12 repairs one missing Draw.io edge target (Fallback → KnowledgeError) to match its existing Mermaid source. This restores a disconnected connector without changing the declared flow or asserting visual acceptance. REG-00 v0.49 and generated inventories are synchronized through the manifest.

PROGRESS-01 v0.2 changes only metadata: the 18 October checkpoint input list is explicitly a frozen snapshot. Original observations/results and the downstream v0.1 handoff snapshot are retained. This prevents current REG-00 version checks from treating historical checkpoint inputs as current design dependencies.

Verification for the 21 October blueprint correction (Node 24.19.0): context:lint/context:check passed and context:test passed 45/45; all six embedded blueprint Mermaid blocks parsed, 16 local links resolved, 14 BR/FR sets matched PRD and 53 distinct module operation names existed in OpenAPI. docs:sync-metadata passed after synchronizing REG-00 v0.49 / DGM-FLOW-01 v0.12. docs:lint and docs:test remain failing: the existing AI Draw.io pair differs from its Mermaid source in node inventory/labels (17/18 docs tests pass). The missing Fallback target was repaired, but broader pre-existing diagram differences are not declared resolved. No rendered UI/diagram, application handler, provider, database or evaluation acceptance was run. This documentation slice supports UX-S1 and existing SP-01/SP-02 work; it adds no handler behaviour, policy or ADR.

## Historical directory organization checkpoint — 22 October 2026

REG-00 v0.50 records an owner-requested navigation change. Seven previously untracked supporting documents now live in `reports/`, `handoffs/`, `references/` and `reviews/`; see the [directory index](README.md) for the map. Stable tracked specifications, existing reviews, diagram sources and historical snapshots retain their paths. Incoming and outgoing references are rebased; moved artifact IDs, versions, status and semantic content remain unchanged. This location-only repair does not revise requirements, contracts, permissions, accepted ADRs or runtime behavior. The documentation verifier discovers nested supporting Markdown so relocation does not remove input-version checks. Source versions remain those recorded by each artifact; affected downstream consumers receive path repairs only. Author checks are recorded separately from independent acceptance. Open limitations: the existing AI Mermaid/Draw.io mismatch and branch merge coordination. Trace: navigation for existing BR-01–BR-15 / SC-01–SC-08; no new FR/AC or application slice. Checklist: path mapping and preserved content require verification; runtime checks are N/A. Handoff: Ready for downstream navigation with existing design/runtime gaps retained.

Layout verification (22 October 2026, Node 24.19.0): context:lint and context:check passed; context:test passed 45/45. All 185 local links examined across relocated documents and affected references resolve, and the new directory index has no broken local links. The seven moved documents preserve non-link content. Metadata check passed with 66 outputs and no pending changes; verifier syntax and git diff whitespace checks passed, and the Git index has no unmerged entries. docs:lint and docs:test were run and still fail on the AI Mermaid/Draw.io node/label mismatch observed before this layout change. No diagram behavior was changed to suppress that failure. Database, contract-runtime, provider, UI and application tests were not run because this change only reorganizes documentation and its discovery. No commit, branch change, independent review or runtime acceptance is claimed.

<a id="ai-diagram-reconciliation--22-october-2026"></a>

## Historical AI diagram reconciliation — 22 October 2026

REG-00 v0.51 / UML-07 v0.19 register the owner-requested DGM-FLOW-01 v0.13 correction. The native page now follows all 28 nodes and 42 edges of the existing Mermaid source, including operational citations and unknown-outcome/new-question branches. The source design, requirements and APIs are unchanged. Prior 21 October diagram and directory checkpoint results remain explicitly historical; their former failures are not rewritten into passes. The [central index](diagrams/README.md#ai-diagram-reconciliation--22-october-2026) records inputs, reproducible sync command, trace, author checklist and remaining 32 crossing warnings. No overlapping vertices or through-vertex routes were reported for the updated page. The owner-requested repair supports existing SP-09/10/12 documentation and restores the documentation verification prerequisite; it creates no new application slice, policy or ADR. Downstream impact: generated inventories, AI preview and this register only; implementation and independent acceptance remain open. Final executed check results follow after verification.

Verification (22 October 2026, Node 24.19.0): docs:lint passed for all 20 pairs / 35 artifacts (318 semantic nodes, 359 edges), and docs:test passed 18/18, including date-override isolation. context:lint/context:check passed and context:test passed 45/45. The AI synchronizer passed a byte-identical repeat run; metadata check passed with 66 outputs and no drift. Native draw.io exported the draft PNG successfully; overview and citation-detail inspection were performed. The skill validator reported 0 structural errors, 0 overlapping vertices, 0 through-vertex routes and 32 crossing warnings, which remain an explicit visual limitation. An initial register-version mismatch was corrected by labeling earlier checkpoint sections as historical rather than changing their recorded observations. Runtime/application, provider, database, print-scale readability and independent-review checks were not run. No handler behavior, policy approval, commit or push is claimed for this repair.

## Historical UI contract alignment — 23 October 2026

REG-00 v0.53 records UX-BLUEPRINT-01 v1.3, UX-SITEMAP-03 v0.10 and UX-FLOW-DOCS-02 v0.8. The optional FR-27 summary opens on its exact answer through independent run-scoped discovery, outside the Audit navigation gate. Work cards use the existing Task.work_location union, including Backlog position and Sprint/completed sprint_id. The non-reading command precondition gap now explicitly has a Proposed ADR-0022 design; implementation and verification remain open. Trace: BR-10/12, AC-27/58/59 and SP-13; task placement supports existing SP-03/04/05, while independent commands retain ADR-0022 trace. These are bounded corrections to existing design/contract bindings, not new policy, operations, requirements or handlers; no new ADR is needed. Downstream: screen briefs use these corrected bindings; generated diagram source-version headers and inventories are synchronized without changing diagram nodes/edges. Checklist: pre-flight and reporting scope/permission/version checks inspected; rendered UI, runtime enforcement and independent acceptance remain gaps. Handoff: Ready for downstream design with existing Proposed dependencies retained.

Verification (23 October 2026, bundled Node 24.22.1; default PATH Node remains 22.23.0): context:lint/context:check passed; context:test 45/45, docs:lint 20 diagram pairs / 35 artifacts, docs:test 18/18 and contracts:test 26/26 passed using existing installed dependencies. docs:sync-metadata synchronized 66 outputs. These are structural/declaration/byte-reference checks, with zero application handler behaviours verified. No rendered UI, live access/revocation, database, provider or evaluation checks were run. Existing package/submodule/untracked owner changes were preserved; no commit or branch change.

## Historical first local UI preview — 23 October 2026

REG-00 v0.54 records the owner-requested root references folder and a first interactive UI preview under apps/web. UI-REF-01 and UI-REVIEW-01 v0.1 retain canonical links, the three earlier binding corrections, exact first-slice scope and Proposed design dependencies. The preview supplies project selection, Board/Backlog, task detail, local creation/state changes and explicit empty/loading/read-only/denied/failure/conflict/unknown/AI-offline/session-ended presentations. It unblocks SP-01–04 screen discussion and WF-01–03/09 rendering; it does not implement those application slices or complete their acceptance criteria. No framework/provider is selected, dependency installed, backend rule copied or live protected data fetched. The static server binds only loopback and serves allowlisted UI files. Existing owner package/submodule/untracked work is preserved. No new ADR or contract operation is introduced. Checklist: bounded reversible UI work and requirement trace supplied; runtime/security, usability and independent acceptance remain Gap. Handoff: continue work-first UI and decide stack/identity before live integration.

Verification for this preview (23 October 2026, Node 24.22.1): UI 5/5, context 45/45 and docs 18/18 passed; context:lint/context:check and docs:lint passed. Initial sandbox loopback and checkpoint-version failures and their resolutions are retained in UI-REVIEW-01. Default desktop and 390px Board rendering, task dialog Escape and focus restoration were observed. Screenshot and remaining gaps are in references/. Zero application handler behaviours verified; live authentication, permission/concurrency, database/provider/evaluation and independent acceptance were not run. No contracts changed, and contracts:test was not rerun for this slice.

## Historical Excalidraw wireframe draft — 23 October 2026

REG-00 v0.55 registers UX-WF-EX-01 v0.1: the owner-requested native Excalidraw scene, 12 individual frame previews, overview PNG/SVG and usage/trace notes under docs/ux/wireframes. It supports existing WF-01–09 design discussion, with work before AI, exact evidence inspection, independent capabilities and state-family sheets. It does not close every individual Backlog/document command variant or the existing work-plan acceptance checkboxes. No application code, requirement, contract, accepted ADR, package, branch or unrelated owner work was changed. Generated register-version references in the manifest and diagram index were synchronized. No new policy or ADR is needed for this presentation-only artifact.

Author verification used bundled Node 24.22.1 and Python/Pillow 12.3.0: JSON/ID/frame-bound/local-link checks passed for 12 frames and 582 editable elements; overview, Board and AI PNGs were visually inspected. Context syntax/checks passed; combined context/docs tests passed 63/63, and docs lint passed 20 pairs / 35 registered artifacts. Initial metadata/header/current-reference failures were corrected by synchronizing the register version, spelling out ADR range endpoints and labelling the earlier UI checkpoint historical; their historical results were preserved. Zero application handler behaviours verified. Native Excalidraw import/rendering, contracts/storage/provider/evaluation, mobile, interactive accessibility/usability and independent acceptance were not run. Pre-flight/reporting checklist reviewed; handoff is an editable initial desktop draft with the README gaps retained.

## Historical UI skill conflict workflow — 24 October 2026

REG-00 v0.56 records AGENTS v1.7 and DEV-SKILLS-01 v0.2. The owner requested a workflow after installing four UI skill repositories. Exact canonical user-level paths resolve duplicate selection; at most one visual lead supplies design choices, while implementation, optimization and review retain separate roles. Routine edits preserve existing designs. Stack compatibility and existing authorisation govern migrations, providers and deployments. This unblocks consistent SP-01–04 presentation work without adding FR/AC, an application dependency, a provider or a new ADR. Existing global skill copies and unrelated owner changes are preserved. The manifest and generated version tables track this register revision only; diagram content is unchanged. Author checklist: bounded documentation and tooling scope; no runtime behavior verified. Handoff: Ready for downstream use; this guidance does not control global skill discovery, guarantee adherence or constitute independent acceptance. Executed checks are reported in the task response.

Author verification used bundled Node 24.22.1: context:lint/context:check passed, context tests 45/45 passed, and docs lint plus the final docs tests 18/18 passed. All 13 canonical skill paths exist and generated metadata has no drift. The initial combined run passed 62/63: the prior Excalidraw checkpoint was interpreted as a current REG-00 reference after this version bump. Labelling that checkpoint Historical preserved its evidence and fixed the failure. No application, contract, storage, provider, rendering or fresh-chat skill-routing behavior was tested for this documentation-only change.

## Historical Work UI wireframe implementation — 24 October 2026

REG-00 v0.57 records the owner-authorised implementation of the three UI review items against UX-WF-EX-01 frames 03/04/10. UI-WORK-02 v0.1 and UI-REF-01 v0.2 document the bounded preview update: neutral unavailable/authority-failure shells with no project metadata, explicit full-list Backlog order, Sprint planning and per-task mixed outcomes, a nonmodal task inspector with project-scoped assignment, ordered blocker events and exact synthetic source inspection. Local Sprint completion/reopening retains ADR-0008 behaviour; unknown sample operations retain original context and block affected resubmission. It supports SP-01–05/08 presentation discussion without implementing service handlers or ticking WF/application acceptance. Existing visual direction and Proposed stack/read designs are retained. No new dependency, contract, ADR, provider, migration, branch or commit is introduced. Browser URL policy blocked fresh UI observation; no workaround or new screenshot acceptance is claimed. Check results follow after verification.

Final author verification (24 October 2026, bundled Node 24.22.1): UI DOM/static-server tests passed 13/13; context:lint/context:check passed and context:test passed 45/45; docs:lint passed for 20 diagram pairs / 35 registered artifacts and docs:test passed 18/18. UI/fixture syntax, generated metadata (66 outputs, no drift), local reference links and changed-file whitespace checks passed. The UI suite was rerun after the narrow-layout focus adjustment. These are local presentation and structural checks; zero live application handler behaviours verified. Contracts were unchanged and contracts:test was not rerun; database, provider, evaluation, live permission/idempotency/concurrency, fresh rendering/mobile/contrast and independent review were not run. The browser URL-policy denial is retained above as the rendering limitation. No screenshot from an older revision is presented as new evidence.

## Historical Work preview redesign — 24 October 2026

REG-00 v0.58 records UI-REF-01 v0.3 and UI-REDESIGN-01 v0.1. Owner-requested redesign uses canonical Taste as the sole visual lead and Web Design Guidelines for review, with achromatic-ledger seed 1650259184. Shared preview presentation, self-hosted licensed Geist, SVG icons, responsive navigation and phone task details retain existing synthetic work/source flows. Fresh 1440/768/390 browser observations and screenshots are recorded separately from the prior historical browser limitation. UI/static-server tests passed 14/14 with bundled Node 24.22.1. No contract, accepted ADR, provider, backend, migration, package selection, branch or commit was added. Checklist: bounded presentation work and source trace retained; live permission/runtime and independent acceptance remain Gap. Handoff: local visual direction available for owner inspection; application stack and integration remain open.

Final author checks (bundled Node 24.22.1): context:lint and context:check passed; context:test passed 45/45; docs:lint passed for 20 diagram pairs and 35 manifest artifacts; docs:test passed 18/18. UI syntax and changed tracked-file whitespace checks passed. Taste source lint: zero failures, four explained warnings. These are presentation and structural results, with zero live application handler behaviours verified.

## Historical dark theme and Board separation — 24 October 2026

REG-00 v0.59 records UI-THEME-01 v0.1 and UI-REF-01 v0.4. Owner-requested Board shadows and neutral dark theme retain the existing work-first preview layout and flows. Theme switching preserves form text and navigation state without changing unavailable scope. The report preserves historical palette rollback evidence and supplies dark tokens, desktop/phone/source screenshots and explicit reporting limits. Local UI/server/token tests passed 16/16 with Node 24.22.1; zero live application handler behaviours verified. No product requirement, contract, accepted ADR, provider, migration, dependency, branch or commit was added. Checklist: bounded reversible presentation and reporting scope; independent accessibility/usability and runtime acceptance remain Gap. Handoff: reusable UI/UX evidence supplied; do not treat token contrast as complete rendered accessibility acceptance.

Final structural verification (Node 24.22.1): context:lint and context:check passed; context:test 45/45 and docs:test 18/18 passed. docs:lint passed for 20 diagram pairs / 35 manifest artifacts. Generated metadata check: 66 outputs, no drift. Changed tracked-file whitespace check passed. These structural results do not add live handler or independent acceptance evidence.

## Historical Supporting document review register — 25 October 2026

REG-00 v0.60 records the owner-requested DOC-REVIEW-REG-01 v0.1 and SDLC-INDEX-01 v0.2 navigation update. The new reference groups supporting document types and supplies a per-review record for exact source versions, reviewer/date, checklist/trace, findings, evidence and follow-up ownership. All initial items are Not reviewed; no repository audit, independent review or approval is claimed. This is an explicit owner-requested documentation aid, not a new application slice, requirement, ADR or runtime feature. Existing historical records and unrelated workspace changes are preserved. Downstream impact: review planning, navigation and generated register-version metadata only. Checklist: scope and authority preserved; semantic review remains Gap; application checks are N/A. Handoff: Ready for downstream planning with the first bounded target and reviewer unassigned. Executed checks and unrun work are reported in the task response.

## Historical Bounded documentation corrections — 25 October 2026

REG-00 v0.61 records owner-authorised corrections to the confirmed B1–B7 findings, R1 input identification and R4 review routing. PREFLIGHT-01 distinguishes repaired source text from unrun application evidence and records 49 EX identities. SAD-03 v0.16 restores the selected English full-text keyword sketch and FR-70 table; UC-02 v0.8 reconciles branch-specific audit includes. PLAN-01 v0.4 and release-scope.json retain priorities while recording current inputs, confirmed exceptions and FR-70 trace. TECH-STACK-01 v1.4 updates source metadata only. UML-07 v0.20 refreshes manual source labels; generated child inventories use its record date, preserving individual diagram dates. DOC-REVIEW-REG-01 v0.2 adds routing and three supporting groups; UX-PLAN-01 v0.2 distinguishes existing visual artifacts from outstanding WF acceptance.

The corrections support existing SP-01–SP-08 work/document implementation and later evidence safeguards; this explicit owner-requested reconciliation adds no feature, operation, provider, migration or ADR. Baseline editions, accepted decisions, historical reports, root owner notes and unrelated package/submodule work are preserved. R2 and B8 were already absent at review; R3 links are retained and R5 relocation is not performed. Full queue groups remain Not reviewed. ADR-0019/0020 source-version interpretation and broader remaining drift are not declared resolved.

Downstream metadata closure: these current headers were revised together because their explicit input versions depend on the corrections. Non-primary revisions change input labels only; body text, acceptance assertions and results are unchanged. Dated reference/checklist/handoff records retain original inputs under snapshot headers. Existing root UI/report snapshot inputs remain recorded in their own sources. Generated paired headers and inventories follow these versions without changing diagram graphs or claiming fresh visual acceptance. A version bump is not a repeated review or execution.

| Artifact ID | Current version | Canonical source | Revision scope |
| --- | --- | --- | --- |
| SAD-03 | 0.16 | docs/architecture.md | Bounded correction / coordination |
| CONTRACT-01 | 0.19 | contracts/README.md | Input metadata only |
| PLAN-01 | 0.4 | docs/planning/five-month-plan.md | Bounded correction / coordination |
| TECH-STACK-01 | 1.4 | docs/tech-stack.md | Bounded correction / coordination |
| API-05 | 0.17 | docs/sdlc/api-design.md | Input metadata only |
| REG-00 | 0.61 | docs/sdlc/artifact-register.md | Bounded correction / coordination |
| DATA-04 | 0.12 | docs/sdlc/data-design.md | Input metadata only |
| DATA-FIT-01 | 0.6 | docs/sdlc/data-policy-fit-review.md | Snapshot metadata clarification only |
| EVAL-CASES-ENTRY | 0.6 | docs/sdlc/evaluation-cases.md | Input metadata only |
| SDLC-INDEX-01 | 0.3 | docs/sdlc/README.md | Bounded correction / coordination |
| VERIFY-01 | 0.5 | docs/sdlc/requirement-verification.md | Input metadata only |
| SAD-03-ENTRY | 0.15 | docs/sdlc/SAD.md | Input metadata only |
| SPEC-REVIEW-01 | 0.30 | docs/sdlc/spec-review.md | Snapshot metadata clarification only |
| TEST-COVERAGE-01 | 0.4 | docs/sdlc/test-coverage.md | Input metadata only |
| TEST-08 | 0.21 | docs/sdlc/test-plan.md | Input metadata only |
| UX-BLUEPRINT-01 | 1.4 | docs/sdlc/ui-ux-blueprint.md | Input metadata only |
| UX-06 | 0.13 | docs/sdlc/ui-ux-spec.md | Input metadata only |
| UC-02 | 0.8 | docs/sdlc/use-cases.md | Bounded correction / coordination |
| FIX-PLAN-01 | 0.21 | docs/sdlc/handoffs/remediation-priorities-2026-10-18.md | Snapshot metadata clarification only |
| UX-HANDOFF-01 | 0.9 | docs/sdlc/handoffs/ui-ux-handoff-2026-10-18.md | Snapshot metadata clarification only |
| DOC-REVIEW-REG-01 | 0.2 | docs/sdlc/references/document-review-register.md | Bounded correction / coordination |
| HANDOFF-REF-01 | 0.3 | docs/sdlc/references/handoff-byte-reference-2026-10-18.md | Snapshot metadata clarification only |
| HANDOFF-SQL-01 | 0.2 | docs/sdlc/references/handoff-sql-projection-2026-10-18.md | Snapshot metadata clarification only |
| UX-CHECK-01 | 0.2 | docs/sdlc/reviews/ui-ux-checklist-review-2026-10-18.md | Snapshot metadata clarification only |
| SP-01 | 0.4 | specs/001-session.md | Input metadata only |
| SP-02 | 0.5 | specs/002-project-membership.md | Input metadata only |
| SP-03 | 0.6 | specs/003-create-task.md | Input metadata only |
| SP-04 | 0.7 | specs/004-update-task.md | Input metadata only |
| SP-05 | 0.7 | specs/005-sprint-lifecycle.md | Input metadata only |
| SP-06 | 0.6 | specs/006-document-access.md | Input metadata only |
| SP-08 | 0.4 | specs/008-linked-keyword-search.md | Input metadata only |
| SP-09 | 0.9 | specs/009-cited-question.md | Input metadata only |
| SP-10 | 0.5 | specs/010-current-work-question.md | Input metadata only |
| SP-11 | 0.10 | specs/011-audit-and-source-inspection.md | Input metadata only |
| SP-12 | 0.4 | specs/012-failure-and-evaluation.md | Input metadata only |
| SP-13 | 0.6 | specs/013-scoped-inspection.md | Input metadata only |
| UX-PERM-MATRIX-02 | 0.11 | docs/ux/permission-matrix.md | Input metadata only |
| UX-PERSONAS-01 | 0.5 | docs/ux/personas.md | Input metadata only |
| UX-PLAN-01 | 0.2 | docs/ux/wireframe-workplan.md | Bounded correction / coordination |
| UX-FLOW-AI-03 | 0.9 | docs/ux/flows/ai-qa-flow.md | Input metadata only |
| UX-FLOW-BOARD-01 | 0.10 | docs/ux/flows/board-flow.md | Input metadata only |
| UX-FLOW-DOCS-02 | 0.9 | docs/ux/flows/docs-flow.md | Input metadata only |
| UX-WF-EX-01 | 0.2 | docs/ux/wireframes/README.md | Input metadata only |
| PREFLIGHT-01 | 0.1 | docs/agent-preflight-checklist.md | Targeted drift corrections; newly versioned checklist |

Checklist: owner scope and source authority preserved; no application acceptance or independent approval. Handoff: use corrected guidance and routing, retain Proposed decisions and outstanding runtime/semantic review gaps. Executed checks and their limits follow after verification.

Author verification (bundled Node 24.22.1): context:lint/context:check passed; context:test passed 45/45; docs:lint passed for 20 diagram pairs / 35 manifest artifacts; docs:test passed 20/20. Regression coverage now rejects the abbreviated trgm label when presented as current, checks EX counts against use-case definitions, requires one continuous architecture FR table and checks the inventory-date override without redating unrelated diagrams. The new terminology scan initially flagged its own example command; an explicit unselected annotation resolved that authoring failure. The two dated 17 October freshness snapshots are explicitly excluded from current-technology scanning so their recorded historical observations are preserved; canonical sources remain checked.

All 635 checked local path targets in changed Markdown resolved, including the new register, and correction-record anchors resolved. The seven snapshot evidence bodies were compared with HEAD and remain unchanged apart from version/input-label metadata; release identities, priorities and statuses are unchanged. Generated metadata checked 66 outputs with no drift; changed tracked-file whitespace check passed. No contract behavior, application handler, database/storage, provider, rendering, external technology lifecycle or independent acceptance check was run; zero live handler behaviors are verified by this documentation change.

## Historical Hallmark Studio branch experiment — 25 October 2026

REG-00 v0.62 records UI-STUDIO-01 v0.1 and UI-REF-01 v0.5 on the owner-requested codex/hallmark-field-office branch. Hallmark Studio is the sole visual lead: proof-paper surfaces, Hedvig/Geist and an orange action preserve Threadwork content, all handlers and the separated Board/dark theme. Self-hosted font/CSS assets use the existing static allowlist. Unrelated dirty work is preserved; no framework, provider, contract or runtime scope is adopted. The report supplies desktop/dark/phone screenshots, source/licence records, initial failures and explicit limits. No commit or push. Checklist: reversible design experiment with source trace; runtime, independent accessibility/usability and adoption remain Gap. Verification results follow after execution.

Final verification with bundled Node 24.22.1: UI/static-server/contrast tests passed 17/17; context:lint/context:check passed and context:test passed 45/45; docs:lint passed for 20 diagram pairs / 35 manifest artifacts and docs:test passed 20/20; generated metadata checked 66 outputs with no drift. Hallmark static sweep: zero failures and zero warnings, one answered dialog finish finding. The first documentation run failed on the supporting register's linked REG-00 v0.61 input after the version bump; DOC-REVIEW-REG-01 v0.3 updates that input to v0.62 and preserves historical correction anchors, then the checks passed. No live application handler behaviours verified; render-tier, contract, storage, provider, evaluation and independent acceptance remain unrun.

## Historical Owner-selected Studio integration — 26 October 2026

REG-00 v0.63 records the owner's explicit selection of the Hallmark Studio preview and request to merge it into main. The [selection record](../../references/ui-selection-2026-10-26.md) preserves the boundary: visual direction selected, application/runtime and independent accessibility acceptance still open. The original Studio experiment remains historical evidence. DOC-REVIEW-REG-01 v0.4 synchronizes the linked register version only. No contract, accepted ADR, product scope or backend rule changes. Verification and Git outcome are reported with the integration.

Pre-merge verification on 26 October 2026 with Node 24.22.1: UI/static-server/contrast tests 17/17 passed; docs lint and tests 20/20 passed; generated metadata checked 66 outputs with no drift. No code changes since the Studio interaction/render observations beyond documentation and licence whitespace. This run does not add live handler, contract/storage/provider or independent accessibility acceptance evidence.

## Historical Studio work-screen refinement — 26 October 2026

REG-00 v0.64 records UI-REFINE-01 v0.1: owner-requested refinement retains Studio and all source/filter/Sprint features, with sans column headings, semantic status markers, readable metadata, card depth, latest open blocker notes and a keyboard-scrollable horizontal Board on narrow screens. Invalid inherited white-space properties and the noninteractive main-landmark outline are corrected. Tests passed 18/18 locally and fresh desktop/dark/phone captures record the bounded observations. DOC-REVIEW-REG-01 v0.5 updates the linked register version only. No contract, backend, provider or accepted ADR changes; independent/runtime acceptance remains Gap. No commit/push. Structural results follow after verification.

Final structural verification: docs:lint passed for 20 diagram pairs / 35 manifest artifacts; docs:test passed 20/20; changed tracked-file whitespace check passed. UI tests remain 18/18 as recorded above. No claim of full accessibility or live application correctness is added.

## Historical soft green CSS system refinement — 26 October 2026

REG-00 v0.65 records [UI-CSS-01 v0.1](../../references/ui-css-green-system-2026-10-26.md): one light/dark token definition, component CSS cleanup, distinct green surfaces, readable metadata, primary selection, source chips and active Sprint Done/Total progress. The README names the current soft-green direction and labels previous palettes historical. UI tests passed 20/20 using Node 24.22.1; rendered desktop/dark/phone observations and tablet geometry are bounded evidence. DOC-REVIEW-REG-01 v0.6 synchronizes its current register input only. No live handler behaviours verified, scope/contract/accepted ADR changes or commit/push. Independent acceptance remains Gap.

Verification: docs:lint passed (20 diagram pairs / 35 manifest artifacts), docs:test passed 20/20, context:lint/context:check passed, context:test passed 45/45, and generated metadata checked 66 outputs. git diff --check passed. These are structural checks; live handler/runtime and independent acceptance remain unrun.

## Historical implementation execution pack — 26 October 2026

REG-00 v0.66 registers the owner-requested [implementation entry](../implementation/README.md), [source register](../implementation/register.md), [decision map](../implementation/decisions.md), dependency roadmap, execution/handoff guides and [13 task packs](../implementation/tasks/README.md). All 20 artifacts are v0.1 Draft; 52 child steps start Not started. Existing spec FRs, optional tiers, operation identities and allowed paths remain canonical. The pack adds no deadline, scope cut, framework/provider selection, accepted decision, handler or migration. It unblocks SP-01 decision preparation and bounded sequential work, with SP-11 mutation capture co-delivered and AI evidence work after work/document foundations. Source-wide semantic review and runtime acceptance remain Gap.

DOC-REVIEW-REG-01 v0.7 synchronizes its current register input only. The preceding soft-green evidence is labelled historical without changing its observations or versions. Initial documentation lint caught that older current-section REG-00 reference after the version bump; historical labelling preserves the actual record instead of relabelling its evidence as a new run. Verification results for this pack are reported separately from application acceptance.

Author verification with Node 24.21.0: context:lint/context:check passed; context:test 45/45 and docs:test 20/20 passed; docs:lint passed (20 existing diagram pairs / 35 manifest artifacts). A separate one-off pack check verified 20 unique artifact IDs, 283 local links, 13 spec/requirement mappings, 52 initial child rows and coverage of all 60 canonical Must IDs. These are documentation/structure checks, not new handler tests. Generated metadata and scoped whitespace checks passed. No contracts, DB/storage, live UI/handler, provider, evaluation or independent acceptance checks were run; zero live handler behaviours were verified by this change. No commit/push.

## Historical technology-stack implementation input — 26 October 2026

REG-00 v0.67 records IMPL-REG-01, IMPL-DEC-01 and IMPL-SP-01 v0.2. TECH-STACK-01 v1.4 is explicitly registered as a required candidate-inventory input for D-01 / SP-01.1, reconciled with actual package/lockfiles, the existing preview and storage configuration. Dated recommendations are not selected, installed or newly verified versions. No stack source, technology choice, dependency or application behaviour changes. Other implementation pack artifacts remain v0.1 Draft. DOC-REVIEW-REG-01 v0.8 synchronizes its linked register input only.

## Historical implementation input reviewer passes — 26 October 2026

REG-00 v0.68 registers IMPL-REVIEW-01 v0.1, consolidating three owner-requested read-only passes across architecture/stack, PRD/data/API, and UX/evaluation/operations. Six bounded findings remain Open: evaluation runner ownership, preview/stack layout drift, stale Compose path, omitted supporting-source registration, incomplete stack input provenance and evaluation-source version metadata. Existing source documents are retained; missing decisions are distinguished from missing files. No broad document family was identified as absent in this bounded pass.

DOC-REVIEW-REG-01 v0.9 records the bounded review as Findings open while whole queue groups remain Not reviewed. Source corrections, technology choices, source semantic refresh and runtime acceptance are not claimed. No application files, dependencies, accepted decisions or implementation-pack sources were changed by this review turn. Verification outcomes follow below after execution.

Author verification for report registration (Node 24.21.0): context:check passed with runtime evidence not run; docs:lint passed for 20 existing diagram pairs / 35 manifest artifacts; docs:test passed 20/20; generated metadata checked 66 outputs without drift. A separate one-off check resolved all 45 report links, confirmed six finding headings and verified all 15 recorded source hashes unchanged. Scoped whitespace checks passed. These are structural registration checks, not correction closure or runtime acceptance. Application/DB/UI/provider/pilot/external-version and independent acceptance checks were not run; no commit/push.

## Historical stack freshness and implementation-input corrections — 26 October 2026

REG-00 v0.69 records owner-authorised corrections to IR-01–IR-06: TECH-STACK-01 v1.5, IMPL-REG-01 / IMPL-DEC-01 / IMPL-SP-01 v0.3, IMPL-SP-11 / IMPL-SP-12 v0.2 and IMPL-REVIEW-01 v0.2. The stack corrects Compose/UI/provenance and refreshes official observations for runtime/compiler/frontend/backend/storage/tooling. Section 7 maps small algorithms/data structures to existing Must slices, with validation criteria and explicitly unselected optional experiments. SP-01 now explicitly plans DB-client/transaction/bigint/schema compatibility decisions; SP-12 owns runner preparation before pilot. Supporting sources and EVAL-01 identity are registered, not duplicated.

DOC-REVIEW-REG-01 v0.10 records an author recheck of documentation corrections only. Original review hashes/evidence remain snapshots. No accepted ADR/BRD, migration/schema/contract, application handler, dependency/lockfile, storage image or provider choice changed. Node 24.22.1 was already available locally and is used for this verification; this does not upgrade a deployment. All runtime/benchmark/compatibility and owner-decision gates remain explicit. Verification results follow after checks.

Author verification (Node 24.22.1): context:lint/context:check passed; context:test 45/45 and docs:test 20/20 passed; docs:lint passed for 20 diagram pairs / 35 manifest artifacts. A one-off source check verified the corrected factual/source/runner markers, resolved 200 local links across seven changed source/review documents and confirmed five non-document runtime/configuration snapshot hashes unchanged. Generated metadata and scoped whitespace checks passed. Official upstream pages were read on 26 October 2026; those observations are not installed compatibility, benchmark, live permission or security evidence. The first edit-helper attempt failed at JavaScript parsing before any write; the corrected edits and subsequent checks succeeded. No application/DB/UI interaction/provider/evaluation/upgrade/independent acceptance run or commit/push occurred.

## Historical SP-01.1 bounded preparation — 27 October 2026

REG-00 v0.70 registers IMPL-BRIEF-SP01-01 / IMPL-PREP-SP01-01 v0.1, IMPL-IMPROVE-01 v0.2 (first repository edition), and Proposed ADR-0024/0025 v0.1. IMPL-REG-01 / IMPL-DEC-01 / IMPL-SP-01 are v0.4; IMPL-ENTRY-01 / IMPL-EXEC-01 / IMPL-TASKS-01 are v0.2; DOC-REVIEW-REG-01 is v0.11. The brief binds actual `/session` operations to contract/UC assertions and distinguishes isolated preparation from application adoption. The author executed schema pre-evidence with existing dependencies; HTTP/DB/session compatibility and owner selection remain open. SP-01.1 is In progress, the other 51 children remain Not started. No canonical dependency reorder, Must cut, accepted ADR, package/lockfile, contract, migration, provider or application change is made by this batch. Detailed commands, source hashes, limitations and next work belong in the [dated result](reports/SP-01.1-preparation-2026-10-27.md).

## Historical repository organization — 27 October 2026

REG-00 v0.71 records owner-requested repository organization on main. DOC-NAV-01 v0.1 supplies reading routes without copying or relocating canonical requirements, accepted ADRs, applied migrations or historical evidence. Tooling is grouped under scripts/context, docs, contracts and notebooklm; tests use matching groups plus storage. The context and database entry implementations keep their established root paths because current architecture/stack sources reference them. Existing npm command names remain stable; module imports, repository-root resource paths, the storage runbook link and schema-fixture guidance follow the new locations. Twenty-four files are relocated, retaining their filenames except the NotebookLM guide, now scripts/notebooklm/README.md. No wrapper, dependency, product requirement or handler is added. DOC-REVIEW-REG-01 v0.12 synchronizes this register input only. Local editor state, scratch work and Python bytecode are ignored; pre-existing local copies, patches and checklist changes are preserved.

Trace: navigation and tooling prerequisites for existing BR-01–BR-15 / SC-01–SC-08, including SP-01 preparation; no FR/AC or Proposed design is accepted. Handoff: Ready for navigation and existing checks; application/runtime and independent acceptance remain open.

Author verification (Node 24.22.1): context:lint/context:check, docs:lint and git diff --check passed. Context tests passed 45/45, documentation tests 20/20, contract/schema/byte tests 26/26 and NotebookLM compatibility unit tests 3/3. Synthetic UI tests passed 20/20 after rerunning with local loopback access; the first run had 19 passes and one environment EACCES connection failure. Initial navigation/version-table checks found a missing newly added link and register metadata drift; both were corrected before the final passing checks. All 26 tooling/test modules were compared with HEAD and matched after only import, resource-root and displayed-command path repairs; syntax/import checks and 66 navigation links passed. No application handler behaviours were verified. db:test and contracts:storage:test were not run because the Docker Linux engine was unavailable; migrations, diagram layout generation, live NotebookLM login/upload, providers, pilot/evaluation and independent review were not run. Git fetch and switch confirmed main matched origin/main; no commit, push or merge was performed.

## Historical reference follow-up — 27 October 2026

REG-00 v0.72 records a wider scan after the owner asked whether all references worked. The earlier navigation check covered selected edited indexes, not every repository link. The scan found live ADR/schema/storage links, three current diagram commands and two protocol-reference links still using former paths. The original schema-loader and storage-test entry files now retain their established paths, preserving ADR-0004 and ADR-0024 without editing decision records or adding wrappers. Other imports and npm commands follow these stable locations. The design generator also retains its established path so the dated foundation guide remains executable without rewriting it. The resulting relocation contains 21 files. UML-07 v0.21 repairs its three executable commands and synchronizes generated child inventories; HANDOFF-REF-01 v0.4 repairs its two local links while retaining snapshot inputs and historical evidence. DOC-REVIEW-REG-01 v0.13 synchronizes this register. Historical commands, dated inventories and source-hash records remain snapshots; the tooling map supplies current locations. No runtime or independent acceptance is implied.

Follow-up verification (Node 24.22.1): scanned 187 tracked/new canonical Markdown files and 1,627 local link occurrences; no Markdown link still targets a relocated old path. All 26 tooling/test modules passed syntax/local-import checks and matched HEAD with path-only repairs. context:lint/context:check and docs:lint passed; context tests 45/45, docs tests 20/20, contract tests 26/26 and NotebookLM compatibility unit tests 3/3 passed after the final locations were established. Previous UI 20/20 remains applicable because no UI source changed. Database integration remains Not run because Docker is unavailable; live provider/login/upload and independent acceptance remain Not run. This scan verifies relocation targets, not every historical command, external URL, fragment anchor or pre-existing unrelated link. No accepted ADR, source snapshot/hash evidence, dependency or business rule was changed.

## Historical runtime spike brief corrections — 27 October 2026

REG-00 v0.73 registers IMPL-SPIKE-SP01-01 v0.2 at the owner's root file and updates IMPL-BRIEF-SP01-01 to v0.2 / IMPL-REG-01 to v0.5. The revised runtime brief fixes renewal clock/expiry semantics, barrier-controlled race evidence, serializer phases, connection discard and before/after source manifests. It qualifies the external review's harness/runtime, checklist, trace and historical-heading claims; the original external review remains unchanged. It removes unsupported release-age, clean-worktree, self-registration, automatic commit and reviewer-acceptance obligations. Existing production decisions, canonical spec dependencies, contract/SQL/migration/runtime code and packages remain unchanged. The 38 experiment IDs describe planned assertions, not passing runtime checks. Earlier preparation result/source hashes and reference-follow-up evidence retain their historical versions. DOC-REVIEW-REG-01 v0.14 synchronizes the current register input only; no independent review is claimed.

Author verification for this brief revision (Node 24.22.1): context:lint/context:check passed, context:test 45/45, docs:lint passed for 20 diagram pairs / 35 manifest artifacts, and docs:test 20/20. Metadata checked 66 outputs without drift; scoped whitespace checks passed. A bounded source check confirmed 38 distinct experiment IDs and resolved 101 local links across four changed brief/register/result files. Historical preparation-result narrative from Deliverables through its original checklist was compared with HEAD and remained unchanged. Initial docs checks failed on the old result's linked v0.1 brief being interpreted as current; IMPL-PREP-SP01-01 v0.2 now explicitly identifies that original execution snapshot and adds only a metadata clarification, without changing prior commands, hashes or results. Current canonical brief is v0.2. No HTTP/DB/session experiment, contract change, application handler, package install, database mutation, provider call, commit or independent acceptance occurred. Contract/runtime tests were not rerun because this batch changes planning documentation only.

## Historical new-feature saved planning gate — 27 October 2026

REG-00 v0.74 records the owner's explicit requirement to plan each new feature before coding. AGENTS v1.8 points to development-rules v1.6 section 11.1: use Plan mode when available, save a versioned feature plan, register parent PLAN-01/spec/roadmap links and break down bounded executable tasks. Platform mode availability is respected; unavailable Plan mode is disclosed and the written planning gate still applies. IMPL-FEATURES-01 v0.1 supplies a single register/template; IMPL-ROADMAP-01 v0.2 adds feature-plan backlinks, IMPL-EXEC-01 v0.3 connects task execution, and IMPL-REG-01 v0.6 registers current versions. DOC-REVIEW-REG-01 v0.15 synchronizes rule/register inputs. Continuing an existing feature reuses its saved plan; ordinary documentation maintenance does not create a fake application feature. Existing authorisation allows ready small tasks to proceed without repeated approval. Product scope, ADR statuses, accepted baselines, contracts, dependencies and runtime behaviour are unchanged. This turn's environment exposes no mode-switch capability; no claim of switching to Plan mode is made for this documentation-only workflow update.

Verification for the planning-rule update (Node 24.22.1): context:lint/context:check passed; docs:lint and docs:test passed (20/20); generated metadata checked 66 outputs with no drift; feature-register links and scoped whitespace checks passed. The initial docs run flagged the ordinary backlink wording as an unselected retrieval keyword; the wording was clarified to backlink without changing the checker or any retrieval policy, and the rerun passed. No application/context test implementation changed; runtime, database, provider and feature-behaviour tests were not run for this documentation-only update. No application feature was implemented or accepted.

## Historical planning gate for fixes, hotfixes and testing — 27 October 2026

REG-00 v0.75 extends the owner's planning requirement to fixes, hotfixes and standalone testing, including test design, execution and regression campaigns. AGENTS v1.9 / development-rules v1.7 require a saved or updated registered work plan before work; short plans are allowed for small/urgent changes, without an exemption. IMPL-FEATURES-01 v0.2 retains its stable path/ID as the common register and adds work kind, reproduction/regression, hotfix recovery/follow-up and test-environment/evidence fields. Existing planned checks and reruns reuse the active task; no new plan per command. IMPL-EXEC-01 v0.4, IMPL-ROADMAP-01 v0.3 and IMPL-REG-01 v0.7 register these consequences. DOC-REVIEW-REG-01 v0.16 updates current inputs. No runtime, product scope, test expectation, ADR acceptance or approval authority changes.

## Historical SP-01 branch and saved work plan — 27 October 2026

REG-00 v0.76 registers FEAT-SP01-01 v0.1 under M-01 / PLAN-01 Month 1. The owner requested a switch to the existing feature/sp-01-session-foundation branch and a plan. Direct checkout first hit local index permissions, then Git correctly refused to overwrite dirty register files. After confirming the branch was an ancestor of main, a local fast-forward moved it from aec6bed to f25fd35; checkout then retained all dirty and untracked work without stash/discard, commit or push. The written plan discloses unavailable Plan mode and defines 12 bounded tasks from candidate/environment and reproducible spike evidence through owner decisions, scoped scaffold/persistence, handlers, session UI and regression. No task is passed by plan creation. SP01-P01 is next; application adoption remains gated. IMPL-FEATURES-01 v0.3, IMPL-ROADMAP-01 v0.4, IMPL-SP-01 v0.5 and IMPL-REG-01 v0.8 supply parent/backlinks and source registration. DOC-REVIEW-REG-01 v0.17 synchronizes the register; no independent review or technology acceptance is claimed.

Author verification for plan registration (Node 24.22.1): context:lint/context:check passed; docs:lint passed for 20 diagram pairs / 35 manifest artifacts; docs:test passed 20/20. Metadata checked 66 outputs without drift; scoped whitespace checks passed; the saved plan has 12 unique task IDs and 16 resolved local links. Active branch was verified as feature/sp-01-session-foundation. No application, spike HTTP/DB/session, UI, provider or storage runtime checks were executed; this turn performs branch preparation and planning only. No commit/push or independent acceptance occurred.

## Historical feature folders and SP-01 task files — 27 October 2026

REG-00 v0.77 records the owner's per-feature-folder instruction. Development-rules v1.8 now requires <work-id>/README.md, plan.md and tasks/<task-id>-<slug>.md for feature/fix/hotfix/test work. FEAT-SP01-01 v0.2 moves to docs/implementation/features/sp-01-session-foundation/plan.md; FEAT-SP01-ENTRY v0.1 provides navigation and SP01-P01–SP01-P12 v0.1 provide individually scoped task briefs. Stable task IDs, dependency/acceptance meaning and Not started states are preserved; mutable status/results remain only in the parent table. No forwarding duplicate plan is kept. Current source/roadmap/pack/register links point to the new location: IMPL-FEATURES-01 v0.4, IMPL-ROADMAP-01 v0.5, IMPL-SP-01 v0.6 and IMPL-REG-01 v0.9. DOC-REVIEW-REG-01 v0.18 updates current rule/register inputs. Existing historical evidence, accepted decisions, application code, dependencies and SQL remain unchanged. No runtime task is executed by this documentation-only decomposition.

Author verification for folder/task decomposition (Node 24.22.1): context:lint/context:check and docs:lint passed; docs:test passed 20/20. Metadata checked 66 outputs without drift; scoped whitespace checks passed. The feature-folder check found 14 Markdown documents, exactly 12 linked task rows/files with matching IDs and required sections, 141 resolved local links and no duplicate old plan file. Application/spike, DB, browser/provider and runtime feature tests were not run; no task execution status, accepted policy, dependency or migration changed. No commit/push or independent acceptance occurred.

## Framework foundation registration — 27 October 2026

INIT-FRAMEWORK-01 v0.1 / INIT-FRAMEWORK-ENTRY v0.1 / INIT-01–INIT-04 v0.1 are registered at [the foundation folder](../implementation/features/framework-foundation/README.md), under M-01 and PLAN-01 Month 1. Owner authorised React/Vite/TypeScript plus Fastify/TypeScript following the stack inventory, retained synthetic UI as design/prototype and confirmed origin for source publication. Allowed coordinated shared paths and assertions are in the plan. No session policy, DB or provider selection is implied.

## Framework foundation result — 27 October 2026

REG-00 v0.78 records the owner-directed shared framework setup and prototype separation. Framework plan/entry/INIT-01–INIT-04 v0.1, OWNER-FRAMEWORK-01 v0.1 and INIT-FRAMEWORK-RESULT v0.1 are registered. Node 24.22.1 verification uses exact React/react-dom 19.3.1, Vite 8.3.5, TypeScript 6.0.3 and Fastify 5.12.7. Root workspaces keep app React 19 distinct from React 18 diagram tooling. TECH-STACK-01 v1.6 and ADR-0003 v0.2 record bounded framework selection; ADR-0024/0025 wider driver/session/guard mechanics remain Proposed. AGENTS v1.10, development-rules v1.9, DOC-NAV-01 v0.2, IMPL-REG-01 v0.10, IMPL-DEC-01 v0.5, IMPL-EXEC-01 v0.5, IMPL-ROADMAP-01 v0.6 and IMPL-FEATURES-01 v0.5 reflect real commands/status and shared scope. DOC-REVIEW-REG-01 v0.19 synchronizes current rules/register inputs only.

The old synthetic UI moved to design/prototype, preserving 16 original code/style/test/font/license files (binary hashes matched; text comparison normalized Git line endings), with only package/guide metadata intentionally changed. The new React app has a pending-session entry; Fastify services expose only infrastructure liveness and generic unknown-route denial. CI includes verified foundation/typecheck/build/prototype/contracts checks. Fresh npm ci under explicit Node 24, all-package typecheck/build, foundation 7/7, prototype 20/20, context 45/45, contract 26/26 and docs 20/20 passed; actual compiled service HTTP and built frontend HTML/JS smoke passed. Initial install Node-22 launcher warnings, loopback EACCES and local Vite CLI resolution error were corrected and retained in the result. No auth/permission/session/DB/provider business behaviour is claimed. The owner confirmed source publication to the configured GitHub origin after the initial automatic push review rejection; actual commit/push/synchronization facts follow only after execution.
