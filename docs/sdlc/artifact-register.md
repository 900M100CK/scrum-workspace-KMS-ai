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

## Current register and handoffs

C-1: scoped audit identity is recorded in a Proposed BRD addendum and ADR-0012 context; formal baseline acceptance and runtime enforcement remain open. C-2/C-4: PRD AC rows and UC-02/09 flows are inline. C-3: SAD FR wording and Flow 4 were resynchronised. T-1–T-6 are specified assertions, not executed results. Q-1/Q-2 are owner-confirmed in OWNER-Q-01: unfinished returns become To Do; complete immutable manifests persist before guard, followed by guarded exact matching and zero-byte abort/fresh preparation on mismatch. Schema/handler enforcement remains unimplemented.

Current reconciliation versions (OWNER-Q-01 v0.1, SP-04/05/09/11 v0.4, SPEC-INDEX v0.4, CONTRACT-01 v0.4, logical model v0.3): PRD-01 v0.9; UC-02 v0.6; SAD-03 v0.12 / entry v0.11; DATA-04 v0.6; API-05 v0.6; UX-06 v0.3; TEST-08 v0.5; TEST-COVERAGE-01 v0.3; VERIFY-01 v0.3; DATA-FIT-01 v0.3; EVAL-CASES-ENTRY v0.5; EVAL-RUBRIC-01 v0.2; SPEC-REVIEW-01 v0.9; UML-07 v0.16 and DGM-ARCH-01 v0.9 ADR-0001 is v0.3 Superseded in part; ADR-0012 is v0.3 and ADR-0013–ADR-0017 are v0.2 Owner-confirmed, with owner-direction source paths and no runtime claim. The research and audit BRD addenda are each v0.1 Proposed; the dated §13.4 text is no longer inside BRD v1.0.

Historical 16 October reconciliation checks used Node 24.21.0. `docs:lint` passed 9 pairs, 21 artifacts, 172 native nodes (including the use-case boundary) and 207 relations. Combined docs/context tests passed 46/46 (15 docs, 31 context); context lint/check passed with 69 active FR and 56 operations. Metadata check passed with 35 outputs checked and no changes. All nine Draw.io diagrams exported with exit 0 and their overviews were inspected. Structural validation found zero errors; crossing warnings remain for AI (15), Board (1), protected-read (2) and AI checkpoints (3). Use-case/document-flow through-node routes are visible despite zero static warnings; RV-09 remains open. Generator syntax and diff whitespace checks passed. Application, migration, provider and guard-runtime tests were not run.

Prior OWNER-Q-01 verification: combined Node 24.21.0 run `node --test tests/docs.test.mjs tests/context.test.mjs` passed 40/40; `npm run context:lint`, context check, generator syntax and `git diff --check` passed. Draw.io structural validation reported zero errors on all five changed pairs; crossing warnings remain (AI 15, AI checkpoints 3, protected-read 2, Board 1, architecture 0). Visual Board repairs removed the observed through-node routes; the remaining crossing/print-scale limitations are not runtime evidence. TC-26 remains Specified / application Not run.

**Artifact ID:** REG-00
**Version/date:** 0.28 Draft · 18 October 2026
**Status:** Draft; confirmed policy corrections in progress, full coverage and remaining decisions explicit.
**Source versions:** [BRD stable entry](../BRD.md) → [English BRD v1.0](../baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md) and two Proposed addenda, [AGENTS.md v1.4](../../AGENTS.md), [workflow](../../agents/WORKFLOW.md), PRD-01 v0.9, UC-02 v0.6, SAD-03 v0.12 and ADR-0007–ADR-0017. Prior review inputs remain historical. Storage has measured test evidence; interviews, pilot and application runtime evidence remain absent.

| Stage/ID | Path | Owner role | Version/status | Inputs/dependencies | Planned BR/SC coverage | Open decisions |
| --- | --- | --- | --- | --- | --- | --- |
| 0 / REG-00 | `docs/sdlc/artifact-register.md` | SDLC coordinator | 0.28 Draft | Owner-confirmed ADRs and system consistency review | BR-01–BR-15; SC-01–SC-08 planned | Full coverage review and remaining policy details |
| 1 / PRD-01 | `docs/sdlc/PRD_SRS.md` | PRD/SRS author | 0.9 Draft; 69 active FRs plus withdrawn FR-45 | BRD v1.0; ADR-0007-0017; owner clarifications | BR-01–BR-15; SC-01–SC-08 mapped | Remaining decisions as recorded in PRD; 60 Must retained |
| Architecture policy / ADR-0001 | `docs/adr/0001-protected-resource-read-policy.md` | Architect role | 0.3 Superseded in part; remaining safeguards Proposed | BRD v1.0, PRD-01 (historical v0.4 input), owner review | BR-01, BR-05, BR-08, BR-10, BR-12, BR-14; SC-05, SC-06 | OD-02, OD-04; enforcement design remains Stage 3 |
| 2 / UC-02 | `docs/sdlc/use-cases.md`; `docs/sdlc/diagrams/use-case/use-case-diagram.drawio` | Use-case author | 0.5 Draft; confirmed creation/revision/board flows | PRD-01 v0.9; ADR-0007-0017; retained historical checklist | BR-01–BR-14; SC-01–SC-08 | Stage 8 exception mapping; remaining delegation/retention |
| 3 / SAD-03 | `docs/architecture.md`; `docs/sdlc/SAD.md` entry; `docs/adr/` | Architect | Canonical SAD-03 v0.12; SAD-03-ENTRY v0.11; handlers unimplemented | PRD-01 v0.9; ADR-0004 v0.2; ADR-0007-0017 | BR-01–BR-14; SC-01–SC-08 flows | Fenced orphan cleanup; current UC board clarification follow-up |
| Architecture reference / TECH-STACK-01 | `docs/tech-stack.md` | Architect | v1.3 Draft candidate; storage portion implemented | SAD-03 v0.12 semantic recheck pending; ADR-0004 v0.2 | BR-07, BR-08, BR-13; SC-02, SC-08 | Framework/provider selection and pilot ranking evidence remain open |
| 4 / DATA-04 | `docs/sdlc/data-design.md`; owned service migrations | Data designer | 0.6 Draft; migration 002 added and database-tested | PRD-01 v0.9; SAD-03 v0.12; ADR-0007-0017 | BR-01–BR-14; SC-01, SC-03, SC-05–SC-06 storage prerequisites | Reopened task/history mapping; handlers/retention/restore |
| 5 / API-05 | `docs/sdlc/api-design.md`; `contracts/` | API designer | 0.6 Draft; Workspace OpenAPI v0.2.2 / Knowledge v0.2.3, 56 operations | PRD-01 v0.9; UC-02 v0.6; SAD-03 v0.12 semantic recheck pending; DATA-04 v0.6 semantic recheck pending; ADR-0007–ADR-0017 | BR-01–BR-14; SC-01–SC-08 | ADR-0013 wire mapping specified; retained-policy/tombstone, atomic audit and pre-handoff evidence handler tests |
| 6 / UX-06 | `docs/sdlc/ui-ux-spec.md`; `docs/ux/` supporting sources | UI/UX designer | Entry v0.3 Draft; Board/AI v0.6; matrix v0.6; Docs/sitemap v0.5; personas v0.4 | PRD-01 v0.9; UC-02 v0.6; SAD-03 v0.12 semantic recheck pending; ADR-0007 through ADR-0017 | BR-01-BR-14; SC-01-SC-08 with UC/TC mapping | Checklist dispositions recorded; rendering/accessibility and runtime evidence remain missing |
| 7 / UML-07 | `docs/sdlc/diagrams/README.md`; five type folders; `docs/sdlc/diagrams/review-2026-10-16.md`; historical `review.md` | Diagram author | UML-07 v0.16; DGM-REVIEW-02 v0.1; current versions below | Current UC/UX/SAD sources and owner-confirmed direction | BR-01–BR-14; SC-01–SC-08 as applicable | RV-09 rendered routing/readability and full semantic review |
| 8 / TEST-08 | `docs/sdlc/test-plan.md`, `test-coverage.md`, `evaluation-cases.md`, `eval/` | Test/evaluation author | TEST-08 v0.5; TEST-COVERAGE-01 v0.3; EVAL-CASES-ENTRY v0.5; application results Not run | PRD-01 v0.9; UC-02 v0.6; ADR-0007–ADR-0017; separate research/regression fixtures | BR-01–BR-14 and SC-01–SC-08 gate mappings; 49 EX identities (48 active, 1 withdrawn); FR/AC/alternate/NFR observation inventory in VERIFY-01; runtime unproven | Orphan protocol, runtime enforcement, pilot/provider/environment; terminal/unavailable mapping specified |
| 9 / SPEC-REVIEW-01 (Stage alias REVIEW-09) | `docs/sdlc/spec-review.md` | Consistency reviewer | 0.11 Draft; current source re-review, original v0.4 preserved | Source versions and focused recheck limits are recorded in the review | BR-01–BR-15; SC-01–SC-08; full semantic coverage unproven | SYS-01–SYS-05 and UX-R01–UX-R06 open; rendered/runtime evidence remains open |
| 9 / SYS-REVIEW-01 | `docs/sdlc/system-consistency-review-2026-10-18.md` | Consistency reviewer | 0.1 Draft; targeted system review through obsidian_docs | PRD-01 v0.9; UC-02 v0.6; SAD-03 v0.12; DATA-04 v0.6; Workspace v0.2.2 / Knowledge v0.2.3; ADR-0012 / OWNER-Q-01 | BR-01–BR-14; SC-01–SC-08 scenario handoff | Two Blocking, two Important, one Minor new finding; existing UX findings remain open |

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

## Current artifact versions

### System logic review handoff — 18 October 2026

[SYS-REVIEW-01 v0.1](system-consistency-review-2026-10-18.md) and [SPEC-REVIEW-01 v0.11](spec-review.md#system-logic-review-through-obsidian--18-october-2026) record the subsequent review with working `obsidian_docs` access. The earlier Stage 6 tool-availability statement below is historical to that run. Status: Draft, Ready for targeted correction; affected flows are not implementation-ready. Stage 3/4/5 owns manifest transport and operational read reconstruction, Stage 5/6/8 owns inspection/metric projections and dependent UX/test reconciliation. Existing policy decisions and 60 Must remain unchanged. This register entry does not add the report to the diagram manifest's 35-artifact validation inventory.

### Pre-UI/UX review handoff — 18 October 2026

[SPEC-REVIEW-01 v0.10](spec-review.md#pre-uiux-review--18-october-2026) records the latest targeted Stage 6 readiness review. Inputs: PRD-01 v0.9, UC-02 v0.6, SAD-03 v0.12, current contracts and UX sources; trace BR-01–BR-14 / SC-01–SC-08. Owner: sequential consistency reviewer/coordinator. Status: Draft; Ready for downstream wireframes with explicit gaps, not implementation-ready approval. UX-R01/R02 block freezing affected screen contracts; UX-R03–R05 require source-inspection/recovery/readiness reconciliation; UX-R06 tracks manual inventory drift. Earlier review versions/counts remain dated snapshots. Obsidian MCP was unavailable; the review used local files and explicitly records its limits.

<!-- BEGIN GENERATED:artifact-versions -->
| Artifact ID | Version | Canonical source |
| --- | --- | --- |
| UML-07 | v0.16 | [Source](diagrams/README.md) |
| REG-00 | v0.28 | [Source](artifact-register.md) |
| SAD-03 | v0.12 | [Source](../architecture.md) |
| UX-PERM-MATRIX-02 | v0.6 | [Source](../ux/permission-matrix.md) |
| UX-PERSONAS-01 | v0.4 | [Source](../ux/personas.md) |
| UX-SITEMAP-03 | v0.5 | [Source](../ux/sitemap.md) |
| UX-FLOW-AI-03 | v0.6 | [Source](../ux/flows/ai-qa-flow.md) |
| UX-FLOW-BOARD-01 | v0.6 | [Source](../ux/flows/board-flow.md) |
| UX-FLOW-DOCS-02 | v0.5 | [Source](../ux/flows/docs-flow.md) |
| DGM-ARCH-01 | v0.9 | [Source](diagrams/architecture/service-composition.mmd) |
| DGM-SITE-01 | v0.6 | [Source](diagrams/sitemap/application-sitemap.mmd) |
| DGM-FLOW-01 | v0.9 | [Source](diagrams/flowchart/ai-qa-flow.mmd) |
| DGM-FLOW-02 | v0.7 | [Source](diagrams/flowchart/board-flow.mmd) |
| DGM-FLOW-03 | v0.8 | [Source](diagrams/flowchart/docs-flow.mmd) |
| DGM-FLOW-04 | v0.9 | [Source](diagrams/flowchart/permission-read-flow.mmd) |
| DGM-FLOW-05 | v0.4 | [Source](diagrams/flowchart/permission-ai-checkpoints.mmd) |
| DGM-JOURNEY-01 | v0.4 | [Source](diagrams/user-journey/core-user-journeys.mmd) |
| PRD-01 | v0.9 | [Source](PRD_SRS.md) |
| UC-02 | v0.6 | [Source](use-cases.md) |
| DGM-UC-01 | v0.5 | [Source](diagrams/use-case/use-case-diagram.mmd) |
| DGM-REVIEW-02 | v0.1 | [Source](diagrams/review-2026-10-16.md) |
| DGM-REVIEW-03 | v0.1 | [Source](diagrams/review-2026-10-17.md) |
| DATA-04 | v0.6 | [Source](data-design.md) |
| DGM-DESIGN-01 | v0.1 | [Source](diagrams/design-foundation-2026-10-17.md) |
| DGM-C4-01 | v0.1 | [Source](diagrams/c4/system-context.mmd) |
| DGM-C4-02 | v0.1 | [Source](diagrams/c4/containers.mmd) |
| DGM-SEQ-01 | v0.1 | [Source](diagrams/sequence/protected-handoff.mmd) |
| DGM-SEQ-02 | v0.1 | [Source](diagrams/sequence/document-creation.mmd) |
| DGM-STATE-01 | v0.1 | [Source](diagrams/state/document-and-readiness.mmd) |
| DGM-STATE-02 | v0.1 | [Source](diagrams/state/sprint-task-allocation.mmd) |
| DGM-DATA-01 | v0.1 | [Source](diagrams/data/workspace-erd.mmd) |
| DGM-DATA-02 | v0.1 | [Source](diagrams/data/knowledge-erd.mmd) |
| DGM-DATA-03 | v0.1 | [Source](diagrams/data/handoff-logical-model.mmd) |
| DGM-DEPLOY-01 | v0.1 | [Source](diagrams/deployment/local-development.mmd) |
| DGM-DEV-01 | v0.1 | [Source](diagrams/development/package-ownership.mmd) |
<!-- END GENERATED:artifact-versions -->

## Verification inventory update - 14 October 2026

[VERIFY-01](requirement-verification.md) v0.2 Draft records 70 FR/AC identities (69 active, one Withdrawn), all current named alternate branches and nine NFR observations. TEST-08 adds TC-23 discovery and TC-24 project/membership positives. UC-02 Alt-2 supplies optional FR-64. ADR-0014 records owner-confirmed multi-selection with per-task outcomes through the existing allocateTask contract. No additional release Must or new endpoint is introduced. Application evidence remains Not run.

Research review update: RESEARCH-CASES-01 v0.2 and EVAL-RUBRIC-01 v0.1 Draft (eval/rubric.md) record semantic review and scoring definitions. ADR-0015 and Knowledge OpenAPI v0.2.2 add partial cited answers; RQ-20/22 clarified with owner confirmation. Provider runs, freeze and independent review remain pending.

## UX consolidation and optional search - 14 October 2026

UX-06 v0.3 now exists with source inventory, screen/UC/TC mapping, common states and dispositions for all 22 UI/UX and 19 Blueprint workbook items. Earlier missing-entry statements below are historical. Rendered UI, measured accessibility and user research remain absent. ADR-0016 adds FR-70 Should (69 active FRs plus Withdrawn FR-45), keeping 60 Must; Workspace API v0.2.1 has searchTasks and total operation count is 56. VERIFY-01 and TC-25 include the extension; no application result is claimed.

## Storage policy fit - 14 October 2026

DATA-FIT-01 v0.3 Draft (`docs/sdlc/data-policy-fit-review.md`) compares actual owned migration fields/privileges against current ADRs. It distinguishes schema fit from absent transaction enforcement and records handoff manifest/entity-kind, purge tombstone, unlink and orphan protocol gaps. ADR-0017 confirms all individually granted capabilities invalidated and current task assignees cleared atomically on member removal; history is preserved. No migration or runtime evidence is claimed by this review.

## Historical records

Earlier register observations are preserved in [the SDLC changelog](CHANGELOG.md). Current decisions and evidence take precedence over those historical snapshots. No history was discarded.

**16 October owner follow-up:** [OWNER-Q-01](../planning/owner-decisions-2026-10-16.md) records acceptance of both recommendations. ADR-0008 v0.3 / ADR-0012 v0.3, FR-09/42/57/67, UC-04/05/09/11, SP-04/05/09/11 and TC-16/21/26 carry the decisions. Logical model v0.3 specifies HandoffManifest/HandoffOutcome and operational entity_kind; additive migration/relay one-use enforcement remain pending. OpenAPI Workspace v0.2.2 / Knowledge v0.2.3 change operation descriptions; no endpoint or response shape was added. Current verification is recorded in the current handoff section above.

## Freshness audit — 17 October 2026

The prior v0.23 refresh registered [DOC-FRESH-01 v0.2](documentation-freshness-2026-10-17.md) and its file inventory. TECH-STACK-01 v1.2, PLAN-01 v0.3, BACKLOG-01 v0.3 and development rules v1.4 correct stale operational guidance; see the audit for evidence, remaining findings and verification limits. No baseline/ADR approval or runtime completion is implied. Earlier dated runs remain historical evidence.

## Historical technology and handoff follow-up — 17 October 2026

REG-00 v0.24 recorded PRD-01 v0.8, SAD-03 v0.11, SAD-03-ENTRY v0.10, TECH-STACK-01 v1.3 and DOC-FRESH-01 v0.2. SPEC-INDEX was v0.3; SP-04/05/09/11 were v0.4 and the other nine specs v0.3. That PRD/SAD refresh was editorial; input-number changes did not establish semantic or runtime acceptance. Official technology evidence and adoption gates are in TECH-STACK-01 §2. No provider/dependency/database upgrade was executed.

## Historical nine-pair correction report — 17 October 2026

| Artifact | Path | Version/status | Inputs / trace | Owner / handoff |
| --- | --- | --- | --- | --- |
| DGM-REVIEW-03 | [Diagram correction report](diagrams/review-2026-10-17.md) | 0.1 Draft; author review | PRD-01 v0.9, UC-02 v0.6, SAD-03 v0.11, DATA-04, current UX/contracts; BR-01/03–05/08–14, SC-01–08 | Documentation coordinator; ready for downstream planning with stated implementation gates |

SPEC-INDEX v0.4 corrects SP-06/SP-10 ownership and adds a contract-owner negative check. The report recommends C4 primary views and a 4+1 crosswalk; it does not adopt a new stack, approve an ADR, or implement handlers. Earlier dated evidence remains a snapshot.

## Diagram foundation extension — 17 October 2026

DGM-DESIGN-01 v0.1 Draft ([report](diagrams/design-foundation-2026-10-17.md)) records eleven additional editable pairs, source/checklist trace, the C4/4+1 crosswalk and unresolved implementation gates. Inputs: PRD-01 v0.9, UC-02 v0.6, SAD-03 v0.12, DATA-04 v0.6, current migrations and ADRs. Coverage: BR-01–BR-14 / SC-01–SC-08. Owner role: sequential documentation author/reviewer. Handoff: Ready for downstream design use with stated gaps; not independent approval. C4 Code/component detail is N/A until implemented handlers justify it.
