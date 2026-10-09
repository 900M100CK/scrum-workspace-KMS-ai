# SDLC artifact register

**Artifact ID:** REG-00  
**Version/date:** 0.7 Draft · 9 October 2026  
**Status:** Draft; Needs owner decision for PRD-01's affected handoffs.  
**Source versions:** [BRD stable entry](../BRD.md) → [English BRD v1.0](../baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md), [AGENTS.md v1.3](../../AGENTS.md), [workflow](../../agents/WORKFLOW.md), coordinator profile (unversioned), owner's PRD v0.1 review, [v0.3 patch list](../analyst/PRD_SRS_v0.3_patch.md), PRD-01 v0.4 and proposed ADR-0001 v0.2. Patch policy choices remain proposals tied to their OD. No accepted ADRs, interviews, pilot or runtime results were available.

| Stage/ID | Path | Owner role | Version/status | Inputs/dependencies | Planned BR/SC coverage | Open decisions |
| --- | --- | --- | --- | --- | --- | --- |
| 0 / REG-00 | `docs/sdlc/artifact-register.md` | SDLC coordinator | 0.8 Draft | BRD v1.0, workflow, owner review, v0.3 patch | BR-01–BR-15; SC-01–SC-08 planned | OD-01–OD-12 |
| 1 / PRD-01 | `docs/sdlc/PRD_SRS.md` | PRD/SRS author | 0.4 Draft; Needs owner decision | BRD v1.0, AGENTS v1.3, owner review, v0.3 patch | BR-01–BR-15; SC-01–SC-08 mapped | OD-01–OD-12 |
| Architecture policy / ADR-0001 | `docs/adr/0001-protected-resource-read-policy.md` | Architect role | 0.2 Proposed; Needs owner decision | BRD v1.0, PRD-01 v0.4, owner review | BR-01, BR-05, BR-08, BR-10, BR-12, BR-14; SC-05, SC-06 | OD-02, OD-04; enforcement design remains Stage 3 |
| 2 / UC-02 | `docs/sdlc/use-cases.md`; `docs/sdlc/diagrams/use-case/use-case-diagram.drawio` | Use-case author | 0.2 Draft; Ready for downstream (Stage 3/4); Needs owner decision on OD-02–OD-04 before Stage 5 | PRD-01 v0.4; 26-point UML 2.0 checklist | BR-01–BR-14; SC-01–SC-08 | OD-02–OD-05, OD-08–OD-11 |
| 3 / SAD-03 | `docs/architecture.md`; `docs/sdlc/SAD.md` entry; proposed `docs/adr/` | Architect | 0.3 Draft; Needs owner decision | BRD v1.0, PRD-01 v0.4, UC-02 v0.2, ADR-0001 Proposed | BR-01–BR-14; SC-01–SC-08 flows | OD-02–OD-04, OD-06, OD-08–OD-11 |
| 4 / DATA-04 | `docs/sdlc/data-design.md` | Data designer | 0.1 Draft; logical only | PRD-01 v0.4, UC-02 v0.2, SAD-03 | BR-01–BR-14; SC-01, SC-03, SC-05–SC-06 | OD-02–OD-04, OD-08–OD-11 |
| 5 / API-05 | `docs/sdlc/api-design.md`; `contracts/` | API designer | 0.1 Draft; interface policy pending | Stages 1–4, including PRD-01 v0.4 | BR-01–BR-14; SC-01–SC-08 | OD-02–OD-05, OD-08–OD-11 |
| 6 / UX-06 | `docs/sdlc/ui-ux-spec.md` | UI/UX designer | Planned | Stages 1–3, 5, including PRD-01 v0.4 | BR-01–BR-14; SC-01–SC-08 | OD-01–OD-06, OD-08–OD-11 |
| 7 / UML-07 | `docs/sdlc/diagrams/README.md`; five type folders | Diagram author | 0.2 Draft inventory; 8/8 drawio files pass strict linter | UC-02 v0.2, SAD-03 v0.3, UX sources v0.2, PRD-01 v0.4 | BR-01–BR-14; SC-01–SC-08 as applicable | All 8 drawio validated score 0; CLI ACL prevents rendered review; RV-01–RV-04 route to Stage 6 |
| 8 / TEST-08 | `docs/sdlc/test-plan.md`, `evaluation-cases.md`, `eval/` | Test/evaluation author | 0.1 Draft; runtime unrun | BRD and Stages 1–7 | BR-01–BR-14 Must; BR-15 Should; SC-01–SC-08 | OD-01, OD-06–OD-07, OD-11 |
| 9 / REVIEW-09 | `docs/sdlc/spec-review.md` | Consistency reviewer | 0.1 Draft; Needs downstream correction | All available artifacts (BRD, PRD, SAD, UC, Data, API, UX, UML, Test) | BR-01–BR-15; SC-01–SC-08 | 12 findings (3 Blocking, 5 Important, 4 Minor) routed to owning stages |

All Must BRs (BR-01–BR-14) and all Core scenarios (SC-01–SC-08) have Stage 1, design and test owners. BR-15 remains Should/Enhanced. Planned status is not completion or approval.

## Decision and gap log

OD-01–OD-12 are defined in [PRD-01 §11](PRD_SRS.md#11-open-decisions-and-handoff). The owner validates business policy and outcomes; architect/evaluator roles propose implementation and measurements. Owner review selected English-only as the draft default and requested P0/P1 delivery order, a first thin slice and corrected coverage. This is evidence of those directions, not approval of the full baseline. Permission delegation, fixed Sprint completion and document retention/authority (OD-02–OD-04) materially affect downstream artifacts. Identity, inspector delegation and answer-persistence boundary (OD-08–OD-10) also require validation before accepting related contracts. Independent drafts may proceed under PRD ASM-01–ASM-08. OD-11 adds a capacity estimate and proposed deferral order for owner validation; no Must scope is actually removed. OD-06 requires an embedding/generation ADR before D0b. Interviews, pilot, environment sizing and runtime results remain absent.

The BRD leaves architecture to design while AGENTS.md directs minimal microservices; the latter governs development and must be represented in SAD without rewriting BRD. AGENTS v1.3 clarifies `docs/BRD.md` as entry point and `docs/baseline/` as linked full editions; it changes no architecture or business scope.

## Revision impacts and delivery coverage

PRD v0.3 preserves prior IDs and splits FR-33 into work continuity and new FR-69 AI failure state; its §8 records ID continuity. All 69 FRs have matching ACs and BR/priority traces: 55 P0, 13 P1 and one P2. D0a lists 21 P0 requirements for access/keyword/audit foundation; D0b lists 17 P0 requirements for semantic retrieval, evidence-backed AI and failure behavior. D0b depends on D0a and an embedding/generation choice ADR under OD-06. Both are demos; all P0/P1 Must requirements still gate Core completion. Proposed scope-at-risk deferrals require explicit owner approval and a recorded Core-gate effect.

| Affected downstream artifact | Required update when authored |
| --- | --- |
| UC-02 | **v0.2 addressed:** Per-UC specific triggers, detailed main flows, named alternate/exception flows (Alt-\*/EX-\*), inline Business Rules, UML relationship specification, and `use-case-diagram.drawio` created. Remaining gaps: NFR inline per UC (deferred to Stage 5/6) and data field contracts (Stage 5). |
| SAD-03 / ADRs | Whole-draft withholding on evidence revocation; Draft exclusion; proposed ADR-0001 v0.2; budget definition and D0b provider-choice ADR; enforcement/index/cache mechanisms remain design work. Now consumes UC-02 v0.2 actor/trigger/flow detail. |
| DATA-04 | Invalidated grants on membership removal; Draft/Current/Superseded/Archived states; immutable evidence; audit catalogue, blocker event order and Sprint allocation; retention remains open. Now consumes UC-02 v0.2. |
| API-05 | Not-found-equivalent public reads (404 for HTTP), whole-answer withholding/regeneration, Draft access, invalidation on rejoin and separate FR-69 failure contract; no saved-answer API assumed. UC-02 v0.2 EX-\* flows provide endpoint error contract inputs. |
| UX-06 | D0a/D0b and P0/P1 views, unpublished Draft labels versus historical labels, exact excerpts, bounded summary, explicit inspectors and failure categories. |
| UML-07 | Stage 2 use-case source relocated unchanged and structurally validated. Inventory now contains seven architecture/UX extractions; semantic and visual review remain open. |
| TEST-08 | Named EX-\* exception flows in UC-02 v0.2 provide direct test-case inputs: EX-01–EX-05 in UC-09, EX-01–EX-03 in UC-12, EX-01–EX-03 in UC-05, etc. |
| REVIEW-09 | Check all revised IDs, assumptions and accepted policies across the eventual document set. |

Stage 2–5 and Stage 8 now have focused drafts; UC-02 updated to v0.2 with specific flows and diagram; Stage 6–7/9 remain Planned. No app/domain/provider/security test has been run. Contract/context harness evidence is distinct from runtime completion.

## Checklist and handoff

| Check | Result | Note |
| --- | --- | --- |
| Artifact inventory and upstream versions | Pass | Existing BRD and profiles recorded; downstream artifacts marked Planned. |
| Every Must BR and SC assigned to PRD/design/test | Pass | Coverage shown in table; PRD mapping in §8. |
| Owner decisions and missing inputs logged | Pass | OD-01–OD-12, assumptions and evidence gaps above. |
| Changed requirements and impacts recorded | Pass | PRD §8 continuity map and downstream impact table. |
| Owner review and approval distinguished | Pass | Owner comments incorporated; full baseline and proposed ADR are not approved. |
| Runtime verification / complete-set review | Gap | No implementation or complete downstream set exists. |

**Handoff:** Needs owner decision for PRD-01 and ADR-0001, including capacity/deferral plan OD-11. Independent journeys/measurements may be drafted under explicit assumptions; affected baselines await the listed policy choices. Update the register on revision/review and do not mark a planned stage complete from an upstream draft.

## Five-month context pack — v0.4 update

Owner direction on 8 October 2026: solo capstone, five months, retain minimal microservices and keep budgeting proportionate. [PLAN-01](../planning/five-month-plan.md) and [scope data](../planning/release-scope.json) propose 61 release Must, three Should, four Could and one Won't; original Core remains binding until OD-11 exact deferrals are recorded. [BACKLOG-01](../planning/backlog.md) and [13 specs](../../specs/README.md) assign every original Core FR once.

| Artifact | Version/status | Inputs / coverage / gap |
| --- | --- | --- |
| PLAN-01 / BACKLOG-01 | 0.1 Draft | BRD PP-01–PP-06 + PRD-01 v0.4 + owner horizon; all 69 FRs; capacity/deferrals pending |
| ADR-0002–ADR-0006 | 0.1 Proposed | service boundary, stack, store, AI pilot and guarded permission handoff; owner acceptance/implementation unproven |
| CONTRACT-01 | 0.1 Draft | two OpenAPI facades, authenticated internal policy/provider contracts, event shape and logical DB model; physical DB/app contracts unrun |
| SPEC-INDEX / SP-01–SP-13 | 0.1 Draft; Unimplemented | all 68 original Core FRs mapped; SP-11 early capture independent of SP-13 inspection UI |
| EVAL-01 / EVAL-CASES-01 | 0.1 Draft; Not run | 25 synthetic English references, 12 pilot/13 final; provider/config/thresholds and runtime evidence pending |
| Context scaffold / harness | Implemented for context checks only | concise AGENTS entry + full preserved rules, service/UI directories and Node built-in checks; no runnable application |

Affected downstream work: every Stage 2–9 uses PRD v0.4 plus the proposed release overlay; approved omissions must update AC/tests/UI/API as a coherent change. Permission/read/version/citation invariants are not descoping candidates. Full data/protocol/auth decisions and physical migrations require installed versions; real unit/consumer-provider tests are added with handlers. The local CI file has not executed remotely.

Handoff: Needs owner decision for scope/policy/stack/store/provider; independently authorised context work is complete and reviewable. Do not infer accepted architecture or a finished five-month application from draft files.

## Context verification evidence — 8 October 2026

The local Node context validator and Node built-in test runner completed: 69 FR/AC pairs, bidirectional BR trace, 61/3/4/1 proposed release tiers, two service contract files with 56 operation IDs, 13 specs, 25 reference cases and nine harness unit tests passed. D0a/D0b counts and P0 membership also passed. Required development-rule sections 4–12 were preserved verbatim when shortening the entry. BRD pointer and complete English edition were checked unchanged. The synthetic corpus is synthetic-0.2; JWT v1 text is retained and a new Current v2 explicitly records its rationale before pilot. No provider output or final answer expectation was changed to make a model run pass.

These are documentation/reference/contract-shape tests and harness unit negatives, not full OpenAPI meta-schema conformance, consumer/provider behavior or factual evaluation. Application runtime, permission/revocation integration, database migrations, provider evaluation and remote CI were not run. Physical DB schema/migrations remain a stack-selection implementation gate; the current data contract is logical.


## Diagram organization — 9 October 2026

REG-00 v0.6 records [UML-07 v0.1](diagrams/README.md): eight editable diagrams across five type folders, seven preserved Mermaid sources, updated links and DG-01–DG-06 routed to Stage 6/7 with architecture/data/API consultation. SAD-03 and six UX source documents are v0.2 for diagram relocation only. UC-02 stays v0.2 and its diagram bytes are unchanged. Proposed policies remain unchanged; Stage 7/9 completion or approval is not implied. Structural validation passed; rendered visual review and runtime checks were not run.


## Focused diagram review — 9 October 2026

[DGM-REVIEW-01 v0.1](diagrams/review.md) records RV-01–RV-08. UML-07 inventory is v0.2. Current nine-file scan includes an extra root use-case copy; 8/9 pass strict structural checks, while the architecture WD/title overlap fails. Draw.io 32.3.0 is installed but cannot start because of an installation ACL/AppContainer error. Semantic corrections route to Stage 5/6 and layout/source issues to Stage 7. No rendered acceptance or independent Stage 9 completion is claimed; prior checks describe prior snapshots.
