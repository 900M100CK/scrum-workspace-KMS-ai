# SDLC artifact register

## Current business review and policy reconciliation — 14 October 2026

REG-00 v0.18 records the owner's confirmed directions in [BA-REVIEW-02 v0.2](../analyst/business-review-2026-10-13.md) and [ADR-0007–ADR-0011](../adr/README.md): explicit revocable author read grants, fixed Sprint policy, immediate Current revisions, 60 release Musts and Workspace-first creation with protected source/citation/AI handoffs. ADR-0008 v0.2 also records direct board transitions and reopening Done; reopening from a Completed Sprint preserves completion history and returns the task to Backlog. These are session-confirmed directions, not independent approval or completed application implementation.

New migration 002 pairs preserve applied migration 001; database evidence is recorded in the business review. PRD/scope/contracts/specs and the selected UC/UX/diagram flows now reflect these directions; full semantic review and Stage 8/9 reconciliation remain pending. The owner supplied the research note and adopted 25 research questions (8/8/9) with fixtures/reference answers, retaining 25 safety regressions separately. BRD §13.4 is a Proposed addendum, not academic approval. Capacity is at least eight hours per working day with submission April 2027; kickoff/days per week remain unknown. Shortfalls trigger schedule/capacity review, not automatic Must cuts.

| Added artifact | Version / state | Owner and next handoff |
| --- | --- | --- |
| BA-REVIEW-02 | 0.2 Draft; review ongoing | Business analyst; full BR/FR/AC/SC/UC audit pending |
| ADR-0007–ADR-0011 | 0.1 except ADR-0008 v0.2; owner-confirmed direction | Architect/requirements/data; full runtime evidence pending |
| Workspace/Knowledge migration 002 | Added; isolated verification recorded in BA review | Data designer; no applied migration rewritten; local development upgrade not yet claimed |

Before this UC/UX slice, context checks passed with 68 active FRs, withdrawn FR-45, 60 Must, 55 operations and 25 research definitions; 21 context unit tests passed. Each edited diagram pair has structural checks; final full docs checks are recorded after execution below. No runtime/provider result, visual acceptance or commit is claimed.

## Current register and handoffs

Latest UC/UX checks on portable Node 24.21.0: `docs:lint` passed 8 pairs, 17 artifacts, 144 nodes and 166 edges; `docs:test` passed 7/7 (before the final source-read label clarification, subsequently covered by `docs:lint`); `context:test` passed 21/21 after fixing the old UC-07 anchor. `git diff --check` passed. Rendered diagrams, full semantic coverage and runtime handlers remain unverified.

**Artifact ID:** REG-00
**Version/date:** 0.18 Draft · 14 October 2026
**Status:** Draft; confirmed policy corrections in progress, full coverage and remaining decisions explicit.
**Source versions:** [BRD stable entry](../BRD.md) → [English BRD v1.0](../baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md), [AGENTS.md v1.3](../../AGENTS.md), [workflow](../../agents/WORKFLOW.md), PRD-01 v0.5, UC-02 v0.3, SAD-03 v0.7 and ADR-0007–ADR-0011. Prior review inputs remain historical. Storage has measured test evidence; interviews, pilot and application runtime evidence remain absent.

| Stage/ID | Path | Owner role | Version/status | Inputs/dependencies | Planned BR/SC coverage | Open decisions |
| --- | --- | --- | --- | --- | --- | --- |
| 0 / REG-00 | `docs/sdlc/artifact-register.md` | SDLC coordinator | 0.18 Draft | Owner-confirmed ADRs and session clarifications | BR-01–BR-15; SC-01–SC-08 planned | Full coverage review and remaining policy details |
| 1 / PRD-01 | `docs/sdlc/PRD_SRS.md` | PRD/SRS author | 0.5 Draft; 68 active FRs plus withdrawn FR-45 | BRD v1.0; ADR-0007-0011; owner clarifications | BR-01–BR-15; SC-01–SC-08 mapped | Remaining decisions as recorded in PRD; 60 Must retained |
| Architecture policy / ADR-0001 | `docs/adr/0001-protected-resource-read-policy.md` | Architect role | 0.2 Proposed; Needs owner decision | BRD v1.0, PRD-01 v0.4, owner review | BR-01, BR-05, BR-08, BR-10, BR-12, BR-14; SC-05, SC-06 | OD-02, OD-04; enforcement design remains Stage 3 |
| 2 / UC-02 | `docs/sdlc/use-cases.md`; `docs/sdlc/diagrams/use-case/use-case-diagram.drawio` | Use-case author | 0.3 Draft; confirmed creation/revision/board flows | PRD-01 v0.5; ADR-0007-0011; retained historical checklist | BR-01–BR-14; SC-01–SC-08 | Stage 8 exception mapping; remaining delegation/retention |
| 3 / SAD-03 | `docs/architecture.md`; `docs/sdlc/SAD.md` entry; `docs/adr/` | Architect | Canonical SAD-03 v0.7; SAD-03-ENTRY v0.6; handlers unimplemented | PRD-01 v0.5; ADR-0004 v0.2; ADR-0007-0011 | BR-01–BR-14; SC-01–SC-08 flows | Fenced orphan cleanup; current UC board clarification follow-up |
| 4 / DATA-04 | `docs/sdlc/data-design.md`; owned service migrations | Data designer | 0.3 Draft; migration 002 added and database-tested | PRD-01 v0.5; SAD-03 v0.7; ADR-0007-0011 | BR-01–BR-14; SC-01, SC-03, SC-05–SC-06 storage prerequisites | Reopened task/history mapping; handlers/retention/restore |
| 5 / API-05 | `docs/sdlc/api-design.md`; `contracts/` | API designer | 0.4 Draft; Workspace OpenAPI v0.2.1 / Knowledge v0.2.2, 56 operations | PRD-01 v0.5; UC-02 v0.3; SAD-03 v0.7; DATA-04 v0.3; ADR-0007–ADR-0012 | BR-01–BR-14; SC-01–SC-08 | ADR-0013 wire mapping specified; retained-policy/tombstone, atomic audit and pre-handoff evidence handler tests |
| 6 / UX-06 | `docs/sdlc/ui-ux-spec.md`; `docs/ux/` supporting sources | UI/UX designer | Entry v0.1 Draft; Board/AI v0.5; Docs/matrix/personas/sitemap v0.4 | PRD-01 v0.5 and amendments; UC-02 v0.3; SAD-03 v0.7; ADR-0007 through ADR-0016 | BR-01-BR-14; SC-01-SC-08 with UC/TC mapping | Checklist dispositions recorded; rendering/accessibility and runtime evidence remain missing |
| 7 / UML-07 | `docs/sdlc/diagrams/README.md`; five type folders; `docs/sdlc/diagrams/review.md` | Diagram author | UML-07 v0.10; current versions below; historical review retained | Current UC/UX/SAD sources and owner-confirmed direction | BR-01–BR-14; SC-01–SC-08 as applicable | Rendered routing and full semantic review |
| 8 / TEST-08 | `docs/sdlc/test-plan.md`, `test-coverage.md`, `evaluation-cases.md`, `eval/` | Test/evaluation author | TEST-08 v0.3; TEST-COVERAGE-01 v0.1; EVAL-CASES-ENTRY v0.3; application results Not run | PRD-01 v0.5; UC-02 v0.3; ADR-0007–ADR-0012; separate research/regression fixtures | BR-01–BR-14 and SC-01–SC-08 gate mappings; 48 EX identities (47 active, 1 withdrawn); FR/AC/alternate/NFR observation inventory in VERIFY-01; runtime unproven | Orphan protocol, runtime enforcement, pilot/provider/environment; terminal/unavailable mapping specified |
| 9 / SPEC-REVIEW-01 (Stage alias REVIEW-09) | `docs/sdlc/spec-review.md` | Consistency reviewer | 0.5 Draft; current source re-review, original v0.4 preserved | Source versions and focused recheck limits are recorded in the review | BR-01–BR-15; SC-01–SC-08; full semantic coverage unproven | F-01-F-12 rechecked in source; recent diagram amendments and rendered/runtime evidence remain open |

All Must BRs (BR-01–BR-14) and all Core scenarios (SC-01–SC-08) have Stage 1, design and test owners. BR-15 remains Should/Enhanced. Planned status is not completion or approval.

**Optional output decision:** Stage 1 `user-stories.md` is N/A for this draft. PRD-01 FR/AC pairs and UC-02 journeys are the inputs for design and TEST-08; a separate story document would duplicate them. This documentation choice removes no BR/SC, acceptance criterion or required test. PRD-01 is v0.5; this register adds no requirement or acceptance change.

## Decision and gap log

OD-01–OD-12 are defined in [PRD-01 §11](PRD_SRS.md#11-open-decisions-and-handoff). Initial document access/authority, Sprint lifecycle, direct board transitions, immediate revisions and the 60-Must release gate are owner-confirmed. Remaining decisions include additional capability delegation, unavailable-citation identity/retention, identity/provider choices, pilot thresholds and exact calendar capacity. ADR-0010 lists the exact authorised Core-gate exceptions; no additional Must reduction is allowed without owner direction. Interviews, pilot, environment sizing and application runtime results remain absent.

The BRD leaves architecture to design while AGENTS.md directs minimal microservices; the latter governs development and must be represented in SAD without rewriting BRD. AGENTS v1.3 clarifies `docs/BRD.md` as entry point and `docs/baseline/` as linked full editions; it changes no architecture or business scope.

## Checklist and handoff

| Check | Result | Note |
| --- | --- | --- |
| Artifact inventory and upstream versions | Gap | Current summary reconciled in v0.9; UX entry is absent and complete downstream input-version/semantic revalidation remains open. |
| Every Must BR and SC assigned to PRD/design/test | Pass | Coverage shown in table; PRD mapping in §8. |
| Owner decisions and missing inputs logged | Pass | OD-01–OD-12, assumptions and evidence gaps above. |
| Changed requirements and impacts recorded | Pass | PRD §8 continuity map and downstream impact table. |
| Owner review and approval distinguished | Pass | Owner comments incorporated; full baseline and proposed ADR are not approved. |
| Runtime verification / complete-set review | Gap | No implementation or complete downstream set exists. |

**Handoff:** Needs owner decision for PRD-01 and ADR-0001, including capacity/deferral plan OD-11. Independent journeys/measurements may be drafted under explicit assumptions; affected baselines await the listed policy choices. Update the register on revision/review and do not mark a planned stage complete from an upstream draft.

## Current artifact versions

This is the current lint inventory. Historical snapshots retain their original versions.

| Artifact ID | Version | Canonical source |
| --- | --- | --- |
| UML-07 | v0.10 | [Source](diagrams/README.md) |
| REG-00 | v0.18 | [Source](artifact-register.md) |
| SAD-03 | v0.7 | [Source](../architecture.md) |
| UX-PERM-MATRIX-02 | v0.4 | [Source](../ux/permission-matrix.md) |
| UX-PERSONAS-01 | v0.4 | [Source](../ux/personas.md) |
| UX-SITEMAP-03 | v0.4 | [Source](../ux/sitemap.md) |
| UX-FLOW-AI-03 | v0.5 | [Source](../ux/flows/ai-qa-flow.md) |
| UX-FLOW-BOARD-01 | v0.5 | [Source](../ux/flows/board-flow.md) |
| UX-FLOW-DOCS-02 | v0.4 | [Source](../ux/flows/docs-flow.md) |
| DGM-ARCH-01 | v0.5 | [Source](diagrams/architecture/service-composition.mmd) |
| DGM-SITE-01 | v0.4 | [Source](diagrams/sitemap/application-sitemap.mmd) |
| DGM-FLOW-01 | v0.6 | [Source](diagrams/flowchart/ai-qa-flow.mmd) |
| DGM-FLOW-02 | v0.5 | [Source](diagrams/flowchart/board-flow.mmd) |
| DGM-FLOW-03 | v0.6 | [Source](diagrams/flowchart/docs-flow.mmd) |
| DGM-FLOW-04 | v0.6 | [Source](diagrams/flowchart/permission-read-flow.mmd) |
| DGM-FLOW-05 | v0.2 | [Source](diagrams/flowchart/permission-ai-checkpoints.mmd) |
| DGM-JOURNEY-01 | v0.3 | [Source](diagrams/user-journey/core-user-journeys.mmd) |

## Verification inventory update - 14 October 2026

[VERIFY-01](requirement-verification.md) v0.1 Draft records 69 FR/AC identities (68 active, one Withdrawn), all current named alternate branches and nine NFR observations. TEST-08 adds TC-23 discovery and TC-24 project/membership positives. UC-02 Alt-2 supplies optional FR-64. ADR-0014 records owner-confirmed multi-selection with per-task outcomes through the existing allocateTask contract. No additional release Must or new endpoint is introduced. Application evidence remains Not run.

Research review update: RESEARCH-CASES-01 v0.2 and EVAL-RUBRIC-01 v0.1 Draft (eval/rubric.md) record semantic review and scoring definitions. ADR-0015 and Knowledge OpenAPI v0.2.2 add partial cited answers; RQ-20/22 clarified with owner confirmation. Provider runs, freeze and independent review remain pending.

## UX consolidation and optional search - 14 October 2026

UX-06 v0.1 now exists with source inventory, screen/UC/TC mapping, common states and dispositions for all 22 UI/UX and 19 Blueprint workbook items. Earlier missing-entry statements below are historical. Rendered UI, measured accessibility and user research remain absent. ADR-0016 adds FR-70 Should (69 active FRs plus Withdrawn FR-45), keeping 60 Must; Workspace API v0.2.1 has searchTasks and total operation count is 56. VERIFY-01 and TC-25 include the extension; no application result is claimed.

## Storage policy fit - 14 October 2026

DATA-FIT-01 v0.1 Draft (`docs/sdlc/data-policy-fit-review.md`) compares actual owned migration fields/privileges against current ADRs. It distinguishes schema fit from absent transaction enforcement and records handoff manifest/entity-kind, purge tombstone, unlink and orphan protocol gaps. ADR-0017 confirms all individually granted capabilities invalidated and current task assignees cleared atomically on member removal; history is preserved. No migration or runtime evidence is claimed by this review.

## Historical records

Earlier register observations are preserved in [the SDLC changelog](CHANGELOG.md). Current decisions and evidence take precedence over those historical snapshots. No history was discarded.
