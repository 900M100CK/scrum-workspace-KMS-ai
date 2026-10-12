# SDLC artifact register

## Current UX source and automation follow-up — 12 October 2026

REG-00 v0.15 tracks UX permission/personas v0.3, UML-07 v0.8, journey v0.2 and the permission split (DGM-FLOW-04 v0.4 / DGM-FLOW-05 v0.1). The owner authorised these four documentation/tooling tasks. Existing Proposed ADR-0001/ADR-0006 retain the rationale; policy choices, contracts and PRD are unchanged. Runtime and independent review remain unrun. Verification results are recorded after execution below.

## Historical: reviewer follow-up — 12 October 2026

REG-00 v0.14 records UML-07 v0.7: DGM-SITE-01 and DGM-ARCH-01 v0.2 Draft, `docs/ux/sitemap.md` v0.3, and README version/trace reconciliation (SAD-03 v0.5, flow origin versions v0.3/v0.4/v0.3, historical section relabelled). Owner-supplied patch report on commit `d7ae887` plus this change: Mermaid grammar parse of all seven sources passed (mermaid 10.9.3); `.mmd` and `.drawio` node and edge sets compared for the four flowcharts, sitemap and architecture. Local application checks: `git apply --check` passed before application; context lint/check/test passed (9/9) on Node 22.23.0; XML parsed, edge sets matched and vertex rectangles did not overlap for sitemap (21 nodes/20 edges) and architecture (8 nodes/7 edges); `git diff --check` passed. Mermaid grammar parsing was not rerun locally. Not run: rendered layout/arrow routing, Node 24+ context checks, runtime or security tests. Splitting permission-read-flow remains open. Author/reviewer structural checks are not independent approval.

## Historical: patch follow-up verification — 12 October 2026

REG-00 v0.13 tracks the owner's patch against `6854162`, plus optional bounded-retry exits before provider submission and in the permission flow, Board AI event labelling and restored authorised-card quick filters. Four flowcharts are v0.3, Board UX v0.4 and UML-07 v0.6. PRD, ADRs and OpenAPI remain unchanged. Sitemap/architecture additions and splitting permission-read-flow are deferred; Stage 5 still owns unresolved terminal-response mapping.

Current execution: `context:lint`, `context:check`, `context:test` (9/9) and `git diff --check` passed on Node v22.23.0. Four Draw.io XML files parsed with no overlapping node rectangles. Independent label/edge comparisons passed: AI 23 nodes/31 edges, Board 19/22, Docs 26/37, permission 28/41. All edge endpoints exist; entry nodes are Start or explicitly labelled Event; retry loops have explicit terminal Unable branches. Archive/delete method/path keys match OpenAPI. These counts differ from the supplied patch because of the additional retry exits and restored Board filter node.

Mermaid grammar parsing, rendered arrow routing, runtime/security tests and Node 24+ execution were not run. Node/edge comparisons are structural checks, not permission evidence or independent review. Existing unrelated submodule changes were preserved.

## Historical flow correction verification — 11 October 2026

REG-00 v0.12 records three UX flows v0.3, DGM-FLOW-01–DGM-FLOW-04 v0.2 (both Mermaid and editable Draw.io), UML-07 v0.5 and SPEC-REVIEW-01 v0.4. Scope: D1–D6 including D4b, A1–A5, B1–B4 and P1–P2. PRD/ADRs/contracts are unchanged; this is an author correction, not independent approval. Existing Proposed ADR-0001/ADR-0006 remain the policy/architecture basis.

Initial flow checks: context lint passed; context check and one of nine tests failed because `SDLC-Prompt-Checklist/PRD_prompt.md` was absent. A separate source check passed for 93 nodes, 126 directed labelled edges, four Draw.io XML parses, 130 local Markdown links and 17 exact API method/path references. These checks establish structure, not rendered layout, policy enforcement or citation support.

Checklist recovery follow-up, 11 October: the owner supplied the upstream repository URL, which already matched `.gitmodules`. Registered the existing submodule and restored 35 missing tracked templates from pinned commit `3c65f5cbefa7d69a75cadd89b177e3add8b400b0`, creating only absent files. SHA-256 checks confirmed all 39 existing local files were preserved, including grouped local copies. The pin and validation rules were unchanged. Context lint/check/test then passed, including all 9 tests. Installed Node remains v22.23.0, below required Node 24+; supported-version and fresh-clone execution remain unverified. No commit or upstream publication was made.

Remaining work: Stage 5 terminal withheld-answer and specific unavailable-citation response mapping; broader permission-matrix/persona/sitemap correction; full checklist review, rendered/accessible UX inspection, supported-Node context run and runtime permission/version/concurrency/provider tests. Stages 8/9 consume the scoped correction addendum without treating historical findings as independently closed.

## Current register and handoffs

**Artifact ID:** REG-00
**Version/date:** 0.15 Draft · 12 October 2026
**Status:** Draft; Needs owner decision for PRD-01's affected handoffs.
**Source versions:** [BRD stable entry](../BRD.md) → [English BRD v1.0](../baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md), [AGENTS.md v1.3](../../AGENTS.md), [workflow](../../agents/WORKFLOW.md), coordinator profile (unversioned), owner's PRD v0.1 review, [v0.3 patch list](../analyst/PRD_SRS_v0.3_patch.md), PRD-01 v0.4 and proposed ADR-0001 v0.2. Patch policy choices remain proposals tied to their OD. No accepted ADRs, interviews, pilot or runtime results were available.

| Stage/ID | Path | Owner role | Version/status | Inputs/dependencies | Planned BR/SC coverage | Open decisions |
| --- | --- | --- | --- | --- | --- | --- |
| 0 / REG-00 | `docs/sdlc/artifact-register.md` | SDLC coordinator | 0.15 Draft | BRD v1.0, workflow, owner patch; 12 October flow follow-up | BR-01–BR-15; SC-01–SC-08 planned | OD-01–OD-12 |
| 1 / PRD-01 | `docs/sdlc/PRD_SRS.md` | PRD/SRS author | 0.4 Draft; Needs owner decision | BRD v1.0, AGENTS v1.3, owner review, v0.3 patch | BR-01–BR-15; SC-01–SC-08 mapped | OD-01–OD-12 |
| Architecture policy / ADR-0001 | `docs/adr/0001-protected-resource-read-policy.md` | Architect role | 0.2 Proposed; Needs owner decision | BRD v1.0, PRD-01 v0.4, owner review | BR-01, BR-05, BR-08, BR-10, BR-12, BR-14; SC-05, SC-06 | OD-02, OD-04; enforcement design remains Stage 3 |
| 2 / UC-02 | `docs/sdlc/use-cases.md`; `docs/sdlc/diagrams/use-case/use-case-diagram.drawio` | Use-case author | 0.2 Draft; Ready for downstream (Stage 3/4); Needs owner decision on OD-02–OD-04 before Stage 5 | PRD-01 v0.4; 26-point UML 2.0 checklist | BR-01–BR-14; SC-01–SC-08 | OD-02–OD-05, OD-08–OD-11 |
| 3 / SAD-03 | `docs/architecture.md`; `docs/sdlc/SAD.md` entry; proposed `docs/adr/` | Architect | Canonical SAD-03 v0.5 Draft (4+1 View Model); SAD-03-ENTRY v0.4 Draft; Needs owner decision | BRD v1.0, PRD-01 v0.4, UC-02 v0.2, ADR-0001 Proposed | BR-01–BR-14; SC-01–SC-08 flows | OD-02–OD-04, OD-06, OD-08–OD-11 |
| 4 / DATA-04 | `docs/sdlc/data-design.md` | Data designer | 0.1 Draft; logical only | PRD-01 v0.4, UC-02 v0.2, SAD-03 | BR-01–BR-14; SC-01, SC-03, SC-05–SC-06 | OD-02–OD-04, OD-08–OD-11 |
| 5 / API-05 | `docs/sdlc/api-design.md`; `contracts/` | API designer | 0.1 Draft; interface policy pending | Stages 1–4, including PRD-01 v0.4 | BR-01–BR-14; SC-01–SC-08 | OD-02–OD-05, OD-08–OD-11 |
| 6 / UX-06 | `docs/ux/` supporting sources; planned `docs/sdlc/ui-ux-spec.md` entry | UI/UX designer | Board/AI v0.4; Docs, sitemap, permission matrix and personas v0.3 Draft; entry missing | Flow and sitemap corrections use PRD v0.4, UC v0.2, SAD v0.5, ADR-0001 v0.2/0006 v0.1 and OpenAPI v0.1.0 | BR-01–BR-14; SC-01–SC-08 planned; detailed trace remains open | OD-01–OD-06, OD-08–OD-11; full UX semantic/accessibility review remains open |
| 7 / UML-07 | `docs/sdlc/diagrams/README.md`; five type folders; `docs/sdlc/diagrams/review.md` | Diagram author | UML-07 v0.8; AI/Board/Docs and source reads v0.4; AI checkpoints v0.1; journey v0.2; sitemap/architecture v0.3 Draft; DGM-REVIEW-01 v0.2 historical | Corrected flow source versions above; owner patch against 6854162; other diagrams retain recorded snapshots | BR-01–BR-14; SC-01–SC-08 as applicable | Rendered routing and wider semantic review remain open |
| 8 / TEST-08 | `docs/sdlc/test-plan.md`, `evaluation-cases.md`, `eval/` | Test/evaluation author | TEST-08 v0.2 Draft; EVAL-CASES-ENTRY v0.2; runtime unrun | BRD and available Stage 1–7 drafts; UX/diagram gaps remain | BR-01–BR-14 Must; BR-15 Should; SC-01–SC-08 planned, full scenario/exception matrix remains a gap | OD-01, OD-06–OD-07, OD-11 |
| 9 / SPEC-REVIEW-01 (Stage alias REVIEW-09) | `docs/sdlc/spec-review.md` | Consistency reviewer | 0.4 Draft; scoped author correction addendum | Source versions and focused recheck limits are recorded in the review | BR-01–BR-15; SC-01–SC-08; full semantic coverage unproven | F-01–F-12 retained; scoped corrections pending re-review; no self-approval |

All Must BRs (BR-01–BR-14) and all Core scenarios (SC-01–SC-08) have Stage 1, design and test owners. BR-15 remains Should/Enhanced. Planned status is not completion or approval.

**Optional output decision:** Stage 1 `user-stories.md` is N/A for this draft. PRD-01 FR/AC pairs and UC-02 journeys are the inputs for design and TEST-08; a separate story document would duplicate them. This documentation choice removes no BR/SC, acceptance criterion or required test. PRD-01 remains v0.4 and is not revised by this register update.

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

Stages 2–5 and Stage 8 have focused drafts. Stage 6 has existing supporting UX drafts but no consolidated entry; Stages 7 and 9 have draft inventory/review artifacts with unresolved findings. No app/domain/provider/security test has been run. Contract/context harness evidence is distinct from runtime completion.

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

## Historical: five-month context pack — v0.4 update

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

## Historical: context verification evidence — 8 October 2026

The local Node context validator and Node built-in test runner completed: 69 FR/AC pairs, bidirectional BR trace, 61/3/4/1 proposed release tiers, two service contract files with 56 operation IDs, 13 specs, 25 reference cases and nine harness unit tests passed. D0a/D0b counts and P0 membership also passed. Required development-rule sections 4–12 were preserved verbatim when shortening the entry. BRD pointer and complete English edition were checked unchanged. The synthetic corpus is synthetic-0.2; JWT v1 text is retained and a new Current v2 explicitly records its rationale before pilot. No provider output or final answer expectation was changed to make a model run pass.

These are documentation/reference/contract-shape tests and harness unit negatives, not full OpenAPI meta-schema conformance, consumer/provider behavior or factual evaluation. Application runtime, permission/revocation integration, database migrations, provider evaluation and remote CI were not run. Physical DB schema/migrations remain a stack-selection implementation gate; the current data contract is logical.


## Historical snapshot: diagram organization — 9 October 2026

REG-00 v0.6 records [UML-07 v0.1](diagrams/README.md): eight editable diagrams across five type folders, seven preserved Mermaid sources, updated links and DG-01–DG-06 routed to Stage 6/7 with architecture/data/API consultation. SAD-03 and six UX source documents are v0.2 for diagram relocation only. UC-02 stays v0.2 and its diagram bytes are unchanged. Proposed policies remain unchanged; Stage 7/9 completion or approval is not implied. Structural validation passed; rendered visual review and runtime checks were not run.


## Historical snapshot: focused diagram review — 9 October 2026

[DGM-REVIEW-01 v0.1](diagrams/review.md) records RV-01–RV-08. UML-07 inventory is v0.2. Current nine-file scan includes an extra root use-case copy; 8/9 pass strict structural checks, while the architecture WD/title overlap fails. Draw.io 32.3.0 is installed but cannot start because of an installation ACL/AppContainer error. Semantic corrections route to Stage 5/6 and layout/source issues to Stage 7. No rendered acceptance or independent Stage 9 completion is claimed; prior checks describe prior snapshots.

## Historical: focused documentation reconciliation — 10 October 2026

REG-00 v0.9 reconciles the previous header v0.7/table v0.8 mismatch. The v0.6 and v0.1/v0.2 review notes above describe historical snapshots, not current versions or repeated checks. Current links open the latest files; consult version history for old text.

Stage 3 uses the canonical SAD-03 v0.3 and SAD-03-ENTRY v0.2. Stage 6 owns the existing `docs/ux/` drafts despite its missing entry. Stage 7/9 status is Draft, not Planned. SPEC-REVIEW-01 v0.2 uses English, separates structural evidence from semantic/runtime claims, and records F-06/F-09 resolution from current source inspection. F-09 closure does not claim a new file deletion or diagram validation in this revision.

At the v0.9 snapshot, the checklist dependency had a reproducibility gap: the parent Git index records `SDLC-Prompt-Checklist` as a gitlink (mode 160000), while `.gitmodules` is absent. Local template availability does not establish fresh-clone availability. This update changes no nested repository or Git metadata; checklist packaging and full SC/exception-to-test coverage remain open work.

Owner decisions remain open until explicitly recorded; elapsed time cannot promote an assumption to accepted. This is documentation maintenance and author self-check, not independent approval or a change to business scope, contracts or proposed policies.

**Verification for this revision:** `context:lint`, `context:check` and `context:test` passed (9/9 harness tests; 69 FRs, 56 operations, 13 specs and 25 reference cases). A separate read-only check of the 11 changed Markdown files passed for 109 local links, seven artifact version headers, register self-version, retained F-01–F-12 IDs and F-06/F-09 status/path assertions. Historical line-number fragments were treated as source locators, not validated heading anchors. `git diff --check` passed. The temporary check initially failed because PowerShell changed a Unicode character in the piped assertion; the ASCII-safe rerun passed without altering document content to satisfy it.

These commands ran on installed Node v22.23.0, below the declared Node 24+ requirement; supported-version execution remains unverified. No clean clone, diagram validator/rendering, application/security tests or provider evaluation ran in this revision. Structural checks do not close semantic findings or establish business acceptance.

## Historical: 4+1 Architectural View Model restructuring — 10 October 2026

REG-00 v0.10 records the formal restructuring of canonical architecture [SAD-03 v0.4](../architecture.md) and its SDLC entry [SAD-03-ENTRY v0.3](SAD.md) under Philippe Kruchten's 4+1 Architectural View Model:
- **Logical View (§2):** Service decomposition (Workspace, Knowledge, Web UI, Provider Relay), strict database-per-service isolation, OpenAPI 3.1.1 schemas.
- **Process View (§3):** Concurrency, ADR-0006 Protected Handoff Guard, five dynamic runtime workflows, boundary timeouts/retries, deterministic AI outage fallback.
- **Development View (§4):** Monorepo organization, module layering invariants, Node context harness standards.
- **Physical / Deployment View (§5):** Single-workstation topology, four network trust boundaries, per-service database credentials.
- **Scenarios View / +1 View (§6):** Core scenarios SC-01 through SC-08 unifying and validating the four structural views.
- **Central Diagram Index ([UML-07 v0.4](diagrams/README.md)):** Added explicit mapping of all system Draw.io and Mermaid diagrams to the 4+1 views.

## Historical: corrective review - 10 October 2026

REG-00 v0.11 records SAD-03 v0.5, SAD-03-ENTRY v0.4, SPEC-REVIEW-01 v0.3 and [ANL-REPORT-01 v1.2 Draft](../analyst/architecture_4_plus_1_restructuring_report.md). Earlier version references in dated revision sections are historical snapshots. The current architecture restores full protected handoff/lifecycle conditions, Current-only ordinary retrieval and claim-level insufficient evidence, and replaces grouped trace ranges with explicit PRD BR/FR rows and spec owners.

The diagram inventory remains UML-07 v0.4, based on its recorded SAD-03 v0.4 mapping snapshot; existing diagrams have not been semantically updated to v0.5 or rendered. F-01-F-05, F-07-F-08 and F-10-F-12 remain open or pending as stated in the review. Stage 4/5 must compare their designs with restored SAD conditions; Stage 8 still owns complete SC/EX assertions and runtime evidence. No policy or business scope is approved here.

The working tree now contains a .gitmodules mapping whose URL matches the local nested repository origin. This repairs missing configuration but does not prove fresh-clone availability: local submodule status has a leading minus sign (not initialized under parent configuration), and a clean remote clone/init has not been run. Existing unrelated Git/nested-repository changes are preserved.

Current correction checks: context lint/check/test passed with 9/9 harness tests on Node v22.23.0. The five corrected documents passed 170 local-link checks and version checks; all 69 SAD FR rows match PRD wording and BR sources, with the 68 Core spec owners matching the spec index. `git diff --check` passed. Node 24+, clean clone/init, diagram rendering and runtime/provider tests remain unverified. This is scoped author verification, not approval of the full document set.

Publication preparation found that the pinned upstream checklist commit uses flat root-level files, whereas grouped template paths and additions are uncommitted changes in the local nested repository. The parent commits preserve that gitlink; they do not publish the nested changes. The .gitmodules mapping alone cannot reproduce grouped references, and local harness success depends on those existing local files. Reconcile the template layout and references before claiming clean-clone reproducibility.

## Current artifact versions

This is the current lint inventory. Historical snapshots retain their original versions.

| Artifact ID | Version | Canonical source |
| --- | --- | --- |
| UML-07 | v0.8 | [Source](diagrams/README.md) |
| REG-00 | v0.15 | [Source](artifact-register.md) |
| SAD-03 | v0.5 | [Source](../architecture.md) |
| UX-PERM-MATRIX-02 | v0.3 | [Source](../ux/permission-matrix.md) |
| UX-PERSONAS-01 | v0.3 | [Source](../ux/personas.md) |
| UX-SITEMAP-03 | v0.3 | [Source](../ux/sitemap.md) |
| UX-FLOW-AI-03 | v0.4 | [Source](../ux/flows/ai-qa-flow.md) |
| UX-FLOW-BOARD-01 | v0.4 | [Source](../ux/flows/board-flow.md) |
| UX-FLOW-DOCS-02 | v0.3 | [Source](../ux/flows/docs-flow.md) |
| DGM-ARCH-01 | v0.3 | [Source](diagrams/architecture/service-composition.mmd) |
| DGM-SITE-01 | v0.3 | [Source](diagrams/sitemap/application-sitemap.mmd) |
| DGM-FLOW-01 | v0.4 | [Source](diagrams/flowchart/ai-qa-flow.mmd) |
| DGM-FLOW-02 | v0.4 | [Source](diagrams/flowchart/board-flow.mmd) |
| DGM-FLOW-03 | v0.4 | [Source](diagrams/flowchart/docs-flow.mmd) |
| DGM-FLOW-04 | v0.4 | [Source](diagrams/flowchart/permission-read-flow.mmd) |
| DGM-FLOW-05 | v0.1 | [Source](diagrams/flowchart/permission-ai-checkpoints.mmd) |
| DGM-JOURNEY-01 | v0.2 | [Source](diagrams/user-journey/core-user-journeys.mmd) |
