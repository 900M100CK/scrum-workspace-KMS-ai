# Specification consistency review

**Artifact ID:** SPEC-REVIEW-01
**Version/date:** 0.30 Draft · 25 October 2026
**Status:** Author review with dated evidence; not independent approval or application acceptance.
**Snapshot inputs (18 October 2026):** PRD-01 v0.9; UC-02 v0.7; SAD-03 v0.15; DATA-04 v0.11 and DATA-FIT-01 v0.5; Workspace API v0.2.8 / Knowledge v0.2.9; UX-06 v0.12; TEST-08 v0.20; VERIFY-01 v0.4; ADR-0007 through ADR-0017; Proposed ADR-0018; Proposed ADR-0019; Proposed ADR-0020; Proposed ADR-0021; Proposed ADR-0022; Proposed ADR-0023

The [v0.4 review](spec-review-v0.4-history.md) is preserved verbatim as historical evidence. Its old source versions, open findings and environment statements are not current conclusions. This review checked present text and diagram sources plus five targeted overview renders. Full print-scale readability, independent review and application behavior remain unverified.

## Retained findings

| ID | Current disposition | Evidence and remaining work |
| --- | --- | --- |
| F-01 | Text and targeted diagram corrections supplied | DGM-FLOW-01 v0.8 includes partial answers, invalid-citation whole-draft withholding, immutable manifests before guard and unavailable identity inspection. Both formats match. Overview render inspected; wide layout/long routes and runtime review remain open. |
| F-02 | Lifecycle and membership labels corrected in sources | DGM-FLOW-03 v0.6 preserves immediate immutable Current revisions and adds atomic invalidation of all individual grants, unassignment and the last-manager restriction. Rendered and transactional enforcement remain unverified. |
| F-03 | Classification and unavailable identity labels corrected | DGM-FLOW-04 v0.7 uses current membership and retained read policy for verified unavailable citation identity; otherwise generic 404. No role-wide read bypass. Both formats match; overview inspected, runtime enforcement remains unproven. |
| F-04 | Original endpoint drift corrected | Current AI/board/docs source paths match Knowledge questions and Workspace task-state contracts. Removed publication is intentional ADR-0009. The 16 October metadata reconciliation addressed the later search/partial-answer additions; semantic corrections and current evidence are recorded in the 17 October report. |
| F-05 | Current overview render inspected | DGM-ARCH-01 v0.8 exported and was inspected at overview scale. Independent keyword and semantic branches are visible; legend text is small at reduced scale. Print-scale readability remains open. |
| F-06 | Header and matrix corrected | At the earlier review, canonical SAD was v0.10 with UC-02 v0.5 / PRD-01 v0.7; current sources are SAD v0.12, UC v0.6 and PRD v0.9; all FR rows were resynchronised and FR-70 added. Q-1/Q-2 now have owner direction; full design acceptance remains open. |
| F-07 | Design rule clarified; implementation unproven | DATA-FIT-01 and ADR-0017 state generation/validity, atomic capability invalidation and unassignment. Schema fields do not enforce authority queries or concurrent removal by themselves. |
| F-08 | Inventory/definition mapping supplied | TEST-COVERAGE-01 covers 49 EX identities (48 active, one Withdrawn); VERIFY-01 covers FR/AC, alternate and NFR observations with named gaps. FR-70/UC-08 Alt-5 is included. No runtime test coverage inferred. |
| F-09 | Original duplicate-source finding remains resolved | Categorized use-case diagram retained; no new deletion claimed. |
| F-10 | Environment/render evidence still pending | Draw.io exported AI flow twice successfully. First render showed crossings; targeted ELK relayout improved them but leaves wide layout/long routes. Other renders and practical readability remain pending; the old startup failure is not current. |
| F-11 | Illustration labelling corrected | Persona header, AI layout placeholder and journey title/source explicitly disclaim measured research/satisfaction. Runtime evaluation still absent. |
| F-12 | Three-column source defect corrected | Board Mermaid/source use To Do, In Progress, Done and owner-confirmed direct transitions/reopening; no In Review state. No rendered or handler pass claimed. |

## Remaining review work

1. Reconcile latest ADR-0013/15/16/17 changes with affected diagram source pairs, regenerate only where necessary and inspect renders. Keep both formats.
2. Finish residual reference classification and current status/version cleanup; historical records now live in [CHANGELOG](CHANGELOG.md). Avoid deleting legitimate draft labels, withdrawal records and negative tests.
3. Complete safety-regression configuration expectations and check operational collection/link evidence; research rubric remains proposed, not frozen or executed.
4. Resolve or explicitly hand off orphan cancellation/fencing, immutable handoff evidence and retained identity schema design. Remaining capability delegation, identity/provider and retention inputs must be surfaced without inventing decisions.
5. Record clean-clone/pinned-submodule reproducibility separately from successful working-tree checks, then complete T0-T10 audit in the [change report](../planning/change-report.md).

## Evidence boundaries and handoff

Current context evidence reports 69 active requirements, 60 Must, 56 operations and separate 25-case research/safety suites. Last complete context unit run passed 31/31; five concurrency declarations are TODO with zero passes. Database storage tests are earlier prerequisite evidence only. No UI, provider, permission race or real application test has passed in this review.

Ready for targeted correction with the listed gaps. Source corrections may close the original textual mismatch while implementation/visual proof remains open. Do not call the overall document set complete or independently approved from this table. The [continuation handoff](../planning/review-handoff.md) records exact next steps and owner decisions.

**16 October Q-1/Q-2 recheck:** OWNER-Q-01 resolves both owner choices; TC-26 specifies persistence/guard ordering, stale-manifest, zero-byte rejection, one-use and restart assertions. DATA-04 supplies immutable logical records; physical storage and handler tests remain Not run. This is author reconciliation, not independent approval.

## 17 October diagram correction handoff

The earlier F-01–F-06 rows retain their dated render/input evidence, not current diagram-version claims. See [DGM-REVIEW-03](diagrams/review-2026-10-17.md) for the current source corrections, operation ownership check, visual evidence and remaining implementation gates. No old finding is closed solely by metadata propagation.

## Diagram foundation follow-up — 17 October 2026

The [design foundation](diagrams/design-foundation-2026-10-17.md) adds eleven pairs and records their checks separately. Earlier finding rows are dated evidence; they do not assert that a newer figure was inspected. Runtime and independent acceptance remain open.

## Pre-UI/UX review — 18 October 2026

**Review status:** Draft author review; Ready for downstream wireframing with explicit gaps. Not ready to freeze the affected screens as implementation-ready contracts. No product approval, scope change or new authority is inferred.

**Inputs checked:** BRD English v1.0, development rules v1.4, workflow/profiles, PRD-01 v0.9, PLAN-01 v0.3, SAD-03 v0.12, API-05 v0.6, UX-06 v0.3 and its six supporting sources, current Workspace v0.2.2 / Knowledge v0.2.3 contracts, ADR-0007/0010 and recorded owner directions through ADR-0017, SP-06 v0.3, DATA-FIT-01 v0.3, register and dated diagram/freshness reviews. Targeted checks also covered use-case, data and verification passages. UI/UX and Blueprint prompt templates were read; workbook dispositions were taken from UX-06, not independently re-audited.

**Method/limits:** Inventoried `docs/` and ran the current context/documentation validators; semantic review focused on the inputs to Stage 6 and the public payloads needed by its screens. This is not a line-by-line review of every historical report, translation, binary workbook or rendered diagram. Obsidian MCP was requested but no callable Obsidian tool or resource was exposed; plugin discovery returned no match. Reads used the local workspace Markdown/JSON files instead. No vault API, Obsidian backlinks/plugin behavior, external upload or fresh visual review is claimed. Existing unrelated edits were preserved.

### Findings ordered by impact

“Blocking” below means blocking an implementation-ready handoff of affected screens, not blocking exploratory wireframes. All findings remain open; this review records corrections to make, rather than silently adopting new API/policy designs.

| ID / severity | Evidence and consequence | Correction owner / closure evidence |
| --- | --- | --- |
| UX-R01 / Blocking | UX-06 screen inventory and sitemap §3 require membership management, a document explorer and version history. Workspace paths provide add/remove member but no member-list operation. Knowledge paths provide known-ID document/version reads but no document/version-list operation. `SearchRequest.query` is nonempty and `SearchResult.items` are passages; keyword search is not a specified browse/history replacement. Grant/revoke forms also lack a documented read projection for existing grants and the policy revision needed by `ReadGrant.expected_revision`. Designers would otherwise invent lists, selectors and concurrency inputs. Trace: BR-01/04/05/10; SC-01/05/06; FR-38/39/47/50–52. | Stage 5/API with Stage 6: map each required list/selector and revision to an authorised response or explicitly supported known-ID interaction. Define filtering, pagination, denied/empty/error states and the metadata visible to non-reading access managers. Do not introduce a listing bypass. Validate screen-to-operation coverage; new operations, if chosen, require contract/spec updates. |
| UX-R02 / Blocking | UX-06 common rules and the permission matrix require controls derived from current capabilities. Public `Session` contains only user ID/expiry; `Project`, `Member`, `Task` and `Document` do not provide allowed actions. `evaluateAccess` is internal. The public UI has no documented capability-discovery projection. Sitemap §2 says “Role-dependent” and §3 says “manage ... project roles”, while ADR-0007 keeps additional non-read delegation open and there is no public role-update operation. `AddMember.role` is an initial descriptive selection, not permission to manage arbitrary capabilities. Trace: BR-01/10; SC-06. | Stage 3/5/6: specify how the UI learns scoped allowed actions and refreshes them; keep server enforcement authoritative. Distinguish add-member role selection from unsupported role/delegation administration. Do not expose internal policy APIs or infer permissions from Scrum titles. Resolve delegation only when designing that dependent feature. |
| UX-R03 / Important | AI flow §1 recognises operational observations, but §2 says “Resolve each chip” through the document/version/passage route. `OperationalCitation` instead contains entity kind/ID, revision and observation time. UX-06 already distinguishes these kinds. Applying the detailed flow literally makes SC-03 task citations impossible to open correctly or encourages fabricated document locators. Trace: BR-09/12; SC-03; FR-25/26/46. | Stage 6 with Stage 5: branch the inspector by citation kind. Specify exact document inspection separately from operational observation identity and a fresh authorised entity read. Label present state separately from the cited observation; no historical-snapshot endpoint is implied. Add a scenario covering state change between answer and opening. |
| UX-R04 / Important | Sitemap §4.3 disables the AI prompt after provider failure but gives no recovery/retry transition. UX-06 common rules explicitly prohibit permanent disablement from an obsolete health badge; UC-12 accepts requests during failure and returns explicit errors. This can strand the user after recovery. Trace: BR-13; SC-08; FR-33/34/69. | Stage 6: define request failure, bounded retry and recovered states. Allow a deliberate retry when appropriate; a stale global badge must not prevent it. Keep keyword/Board availability dependent on their own services and never show generated content for a failed request. |
| UX-R05 / Important | Docs flow §2 explicitly labels pending/ready/failed as semantic readiness and allows keyword discovery from committed eligible passages despite embedding failure. VERIFY-01 FR-15 still says “pending/failed never advertised searchable” without naming the path; the `Readiness` schema has one unqualified enum. The UI could disable keyword search when only semantic indexing failed. Trace: BR-07/13; SC-08; FR-15/18/34/69. | Stage 1/5/6/8: clarify readiness semantics consistently in the response description and test assertion. Distinguish semantic status from observed keyword availability; do not promise either solely from Current validity. Test failed embedding with successful permitted keyword retrieval. |
| UX-R06 / Minor | UX-06 Sources still names sitemap/docs v0.4 and permission matrix v0.5; their current headers are v0.5/v0.5/v0.6. The register's stage table still names REG-00 v0.24, UC-02 v0.5 and SPEC-REVIEW-01 v0.7 despite newer headers/generated inventory. Independent document action routes are appended to sitemap rather than included in its main route table. Trace: Stage 0/6 handoff; BR-10, SC-06. | Coordinator/Stage 6: reconcile the manually maintained source/route tables after semantic review, preserving dated history. Include independent action entry for a known document ID without read permission in the main screen inventory. A passing generated-metadata check does not validate these manual tables. |

### UI/UX handoff and decision boundaries

No new conflict with the confirmed three-column Board, immediate immutable Current revisions, revocable restricted-author read grant, whole-draft withholding or seven Core release exceptions was identified in the targeted review. This is not full-set approval. The existing diagrams and UC/TC mappings provide enough structure to begin wireframes.

1. Begin with the required Project → Backlog → Sprint → Board flow and Documents → revision/history → keyword search → answer/source inspection. Include scoped audit and trace views separately. Keep FR-70 task search and the seven ADR-0010 exceptions visibly optional; do not turn sitemap presence into a Must requirement.
2. For each screen, record FR/UC, data source, operation, capability basis, and loading/empty/denied/dependency-error/conflict/unknown-commit states. Use synthetic data. Mark UX-R01/R02-dependent controls as unresolved rather than inventing backend behavior.
3. Define operational and document citation views separately; include partial answer, insufficient evidence, conflict, withheld, source unavailable and AI-outage recovery. Use buffered answers, no streamed draft tokens or hidden-source hints.
4. Select target viewport/browser, navigation layout, tokens, component states and keyboard/focus behavior during Stage 6. These are normal design work, not reasons to require a working backend first. English query/content/evaluation is the current assumption; UI language is a separate design choice, not an implied multilingual retrieval commitment. Interviews, usability and measured accessibility remain absent.
5. Identity/sign-in mechanism, additional capability provisioning, physical retention/purge and provider selection remain explicit dependent implementation decisions. Do not add signup/reset/MFA, permission administration, restore/purge controls, persistent chat, reports or runtime AI mutations from template examples. Existing server guard/orphan/manifest gaps remain in DATA-FIT-01 and the diagram foundation; they do not block unrelated wireframing.

**Checklist:** Pass for current structural checks and a bounded Stage 6 gap handoff; Gap for UX-R01–R06 closure, full workbook re-audit, visual design, user validation and runtime evidence; N/A for publication, provider adoption and framework installation in this review.

**Verification on 18 October, Node 24.21.0:** `context:lint` and `context:check` passed (69 active requirements, 60 Must, 56 operations, 13 specs); `context:test` passed 32/32; `docs:lint` passed 20 pairs / 35 registered artifacts / 301 nodes / 330 edges; `docs:test` passed 17/17. These are structure/harness results only, not proof of screen completeness or application permissions. Post-edit verification is recorded below after execution.

**Not run:** Obsidian MCP/vault integration; live UI/browser/accessibility/usability tests; fresh diagram exports; database/migrations; application/provider/permission-concurrency tests; clean-clone reproduction; new evaluation experiments. No commit or deployment.

**Post-edit verification:** Metadata synchronization checked 66 outputs and changed only the generated version tables in the register and diagram index. Documentation lint passed again with 20 pairs / 35 artifacts / 301 nodes / 330 edges. No diagram topology, product contract or accepted policy was changed.

## System logic review through Obsidian — 18 October 2026

[SYS-REVIEW-01 v0.1](system-consistency-review-2026-10-18.md) extends the earlier Stage 6 review with system ownership, transport contracts, operational reconstruction and inspection evidence. The `obsidian_docs` connector was available for this run and read/searched vault `docs`; the earlier unavailability statement above remains evidence about that earlier run only. OpenAPI/spec/evaluation reads and validators used the repository directly.

New findings: **SYS-01 Blocking** — provider/answer transport payloads lack the immutable per-handoff binding required by ADR-0012; **SYS-02 Blocking** — public work reads cannot reconstruct Sprint allocation, Backlog location/order and blocker history; **SYS-03 Important** — inspection responses omit promised query/step/exact-evidence fields; **SYS-04 Important** — required numeric trace duration cannot represent a missing optional measurement; **SYS-05 Minor** — SAD overgeneralises caller role inputs and document citation identity. Blocking means the affected implementation handoff, not all independent drafting.

UX-R01–UX-R06 remain open after targeted recheck. Existing collection-completeness, storage/fencing, retention and formal baseline gaps are carried forward without counting them as new discoveries. The report records sources, scenarios, correction owners and closure evidence. It does not revise product contracts, accepted policy or scope, and does not claim independent review.

**Executed before report edits:** context lint/check passed; context tests 32/32; documentation lint passed 20 pairs / 35 artifacts / 301 nodes / 330 edges; documentation tests 17/17. Application, database, provider, concurrency, rendered UI/diagram and clean-clone checks were not run. Post-edit evidence follows after execution.

**Handoff:** Stage 3/4/5 resolves SYS-01 and SYS-02 alongside UX-R01/R02, then Stage 5/6/8 reconciles inspection, missing metrics, UX states and test assertions. All findings remain open; source/shape checks are not runtime proof.

**Post-edit verification for the system review:** Metadata synchronization checked 66 outputs and updated only the register and diagram-index version tables. The first documentation lint rejected this report's old review-input version; the input now names the current review entry while preserving the earlier review section. Documentation lint then passed (20 pairs / 35 artifacts / 301 nodes / 330 edges), and metadata check reported zero drift across 66 outputs. No contract, diagram topology, migration or application code was changed.

## First correction slice — 18 October 2026

See [FIX-PLAN-01](handoffs/remediation-priorities-2026-10-18.md) for the ordered queue and [Proposed ADR-0018](../adr/0018-operational-read-projections.md) for design rationale. SYS-02's missing wire projections are addressed by Workspace v0.2.3: two public reads, current task location, ordered Backlog selection and completion counts. Status: draft contract correction supplied; cursor/transaction/permission and fresh-client runtime evidence still open. It is not a closed implementation finding. SYS-01/03/04/05 and UX-R01–UX-R06 remain open. No accepted ADR or product scope was changed.

Affected sources: API-05 v0.7; CONTRACT-01 v0.5; SP-03 v0.4, SP-04/05 v0.5; Board flow v0.7; TEST-08 v0.6. The existing Board/state diagrams retain their business transitions; source metadata follows the revised Board flow, with no topology change. Existing storage relations describe allocation and blocker history, but an explicit persisted current-location discriminator remains an additive Stage 4 task under ADR-0018; historical completed rows cannot identify a task later reopened and marked Done in Backlog. Cursor implementation remains Proposed. No migration or application handler was added.

## Remediation-priority recheck — 18 October 2026

[FIX-PLAN-01 v0.2](handoffs/remediation-priorities-2026-10-18.md#priority-ordered-recheck--18-october-2026) reviews all six queue positions against Workspace/Knowledge v0.2.3 and the current dependent artifacts. SYS-02 has draft read projections, not closure: P1-R01 confirms the existing Stage 4 current-location gap; P1-R02 identifies the undefined Backlog reorder revision source and whole-list/subset semantics. Both need design closure before the affected handler handoff. Priorities 2–6 remain open; SYS-01 still blocks AI relay implementation regardless of queue order.

Executed checks: context lint/check passed (58 operations, unchanged 69 active / 60 Must); context tests 33/33; documentation lint 20 pairs / 35 artifacts / 301 nodes / 330 edges; documentation tests 17/17. The queue records scope, evidence, owner and closure conditions. No application, migration, provider, rendering or full OpenAPI meta-schema verification was performed. This is sequential author review, not independent acceptance; no contract or policy was changed.

## SYS-02 Stage 4/5 completion — 18 October 2026

Proposed ADR-0018 now specifies explicit location invariants, migration 003 with revision-bound legacy reconciliation, and a dedicated Backlog generation. Workspace v0.2.4 binds complete-list reorder to TaskList.backlog_revision with full-page traversal, generic stale/set rejection and same-key receipt semantics. DATA-04/DATA-FIT-01, logical model, affected specs/Board/test plan and diagrams are reconciled. P1-R01/P1-R02 design corrections are supplied; application/cursor/permission/transactional audit acceptance remains open. Priority 2–6 and SYS-01's pre-AI gate remain open.

**Verification:** Isolated synthetic storage tests passed 15/15 reported tests (14 scenarios plus parent); context/documentation tests passed 50/50. Context lint/check and documentation lint passed; documentation inventory is 20 pairs / 35 artifacts / 304 nodes / 336 edges. Metadata check passed for 66 outputs and Git whitespace check passed. Fresh exports of the Workspace ERD and Sprint/task/location state diagram were inspected at overview scale. Detailed evidence and unrun checks are recorded in [the priority 1 follow-up](handoffs/remediation-priorities-2026-10-18.md#priority-1-follow-up-correction--18-october-2026). No development database upgrade, application acceptance, independent approval, commit or deployment is claimed.

## Priority 2 correction review — 18 October 2026

[Proposed ADR-0019](../adr/0019-scoped-ui-discovery.md) addresses UX-R01/R02's missing discovery projections with six public reads and explicit scope, pagination, nondisclosure and concurrency-source rules. Readable content discovery remains distinct from known-ID policy/grant management. Membership roles stay descriptive; additional capability delegation remains open. Non-reading write/lifecycle preconditions and actual handler permission/cursor tests are not closed by this design. See the current [remediation queue](handoffs/remediation-priorities-2026-10-18.md#priority-2-correction--18-october-2026). SYS-01 and priorities 3–6 remain open. Sequential author review only; no independent acceptance.

Checks passed: context lint/check (64 operations / 69 active / 60 Must / 13 specs), 51/51 context/documentation tests, documentation lint (20 pairs / 35 artifacts / 304 nodes / 336 edges), metadata check (66 outputs). These are selected contract and document checks; no live authorization, cursor, UI or migration execution was performed. Repository reads were used because Obsidian MCP was not exposed in this turn. Detailed limitations and handoff are in the queue.

## Priority 2 verification recheck — 18 October 2026

[FIX-PLAN-01 v0.5](handoffs/remediation-priorities-2026-10-18.md#priority-2-verification-recheck--18-october-2026) confirms six reads and reproduces 34 context plus 17 documentation tests, both lints/checks and zero metadata drift. Obsidian search was available in this subsequent run; earlier availability reports remain historical.

Three Important findings remain: P2-R01 needs an unambiguous document/version locator for version action discovery; P2-R02 separates answer-reader summary access from full trace-read; P2-R03 records that the full API validator accepts injected actual internal/unknown action names despite the stated whitelist rule. The last finding was reproduced on in-memory copies without changing contracts; it is a guard gap, not a current internal-action exposure. Owners, scenarios and closure conditions are in the queue. UX-R01/R02 have supplied draft projections but are not fully resolved or runtime-accepted. SYS-01 remains the pre-AI-relay blocker; additional delegation and non-reading write preconditions remain open. No application, migration or policy change was made.

## Priority 2 recheck corrections — 18 October 2026

Workspace v0.2.6 / Knowledge v0.2.5 and Proposed ADR-0019 v0.2 correct P2-R01's full version locator and P2-R02's independent run entitlements. SP-07/SP-13, API/UI and test assertions are aligned. P2-R03 replaces selected-name denial with public operation membership derived from both contracts and negative tests for actual internal/unknown names. See the queue's latest correction section for execution evidence and remaining limits. This is sequential author correction, not independent acceptance or live access verification. SYS-01 continues to block AI relay.

Executed checks passed: context lint/check (64 operations, 69 active requirements, 60 Must, 13 specs), context tests 36/36 and documentation tests 17/17 (53/53 total), documentation lint (20 pairs / 35 artifacts / 304 nodes / 336 edges). The actual internal/unknown catalogue probes now fail through validateApi with both current contracts. Version-scope and run-entitlement regressions check declarations only. Metadata synchronization changes source headers/inventories, with no diagram topology change or fresh rendering claim. No handler, permission/concurrency, database/migration, provider or application/UI acceptance is claimed; full limits remain in the queue.

## SYS-01 design correction and task tracking — 18 October 2026

Proposed ADR-0020, Workspace v0.2.7 / Knowledge v0.2.6 and logical model v0.5 bind both protected transport purposes to full immutable durable preparation and exact payload bytes, replacing partial answer evidence. Internal getHandoffManifest establishes a scoped receipt lookup outside guard; Workspace owns the one-use claim. SP-09/10/11, sequence/logical diagrams and TC-26 are reconciled. The active queue checklist separates completed author design from unimplemented storage/adapters/guard and live boundary evidence. SYS-01 remains a pre-AI-relay runtime blocker. This is sequential author work, not independent acceptance.

## NEXT-03 / SYS-03 and SYS-04 design correction

Proposed ADR-0021 and Knowledge v0.2.7 supply the promised query/step/exact-evidence inspection with source-to-step visible ranks, structured validation and honest missing timing/usage. Logical model v0.6, SP-11/13, inspection UX and TC-11/18 are reconciled. FR-58 remains Must; summary FR-27 stays Should with its independent entitlement. These are author design corrections plus declaration checks; producing capture/storage/query filtering/revocation/metric behavior remain unimplemented. SYS-01 runtime gate is unchanged; the queue checklist records NEXT-03 verification after execution.

Executed checks passed: context lint/check (65 operations, 69 active requirements / 60 Must / 13 specs), context tests 38/38 and documentation tests 17/17 (55/55 total), documentation lint (20 pairs / 35 artifacts / 304 nodes / 338 edges), metadata check (66 outputs, no drift) and Git whitespace check. The queue records exact negatives and unrun checks. NEXT-03 is ticked for design/contract work only; no live metric, authority/redaction or capture/storage behavior is accepted. NEXT-04 remains the next unchecked task.

## NEXT-04 design correction

UX-R03/R04/R05 now branch citation inspectors by kind, separate historical operational observation from fresh current reads, specify deliberate new-request recovery and unknown-outcome handling, and name semantic_readiness separately from keyword availability. AI flow, sitemap, Knowledge v0.2.8, verification/UX/test sources are reconciled. No new endpoint, permission entitlement or runtime acceptance. The queue records checks before NEXT-04 is ticked.

## NEXT-05 wording and inventory correction

SYS-05 and UX-R06 have targeted author corrections in the canonical SAD and its entry, UX source paragraph, sitemap route table and manual register stage rows. The descriptive AddMember.role exception and operational citation identity are explicit; no caller authority or new role-management surface is introduced. Canonical sources/versions were read directly. Earlier source/review snapshots are preserved as history; structural checks alone do not prove full semantic or runtime consistency. NEXT-06/07 and the runtime/owner-policy gates remain open.

## NEXT-06 independent command design correction

Proposed ADR-0022, Workspace v0.2.8 / Knowledge v0.2.9 and logical model v0.7 supply opaque action-bound concurrency and minimal command receipts for non-reading writers/lifecycle managers. No current revision/content metadata is exposed by issuance, and content-bearing success objects are removed from revise/archive/metadata operations. UC-07, SP-06/07, API/UI and TC assertions are reconciled. This resolves the outstanding design dependency without deciding additional delegation; no storage/handler/permission acceptance is implied.

## NEXT-07 bounded author audit

The final design pass corrected an obsolete citation operation name to openCitation, added Proposed ADR-0022 to the canonical architecture summary, and reconciled current input/manual-register editions while preserving historical snapshots. A new linked-input-version regression detects stale aliases in current headers. Executable synthetic component-schema examples supplement the existing declaration checks; neither supplies complete OpenAPI or application acceptance. The bounded UI/UX handoff records screen bindings, denial/failure requirements, remaining owner decisions and real-runtime gates. Readiness is for drafting wireframes with explicit gaps, not owner approval or permission/provider acceptance.

## NEXT-08 supplemental contract tooling review

A pinned official document-structure schema plus a calibrated dynamic-reference specialization now checks both complete OpenAPI drafts locally. Named and inline Schema Objects are separately meta-validated/compiled; executable negatives supplement shape inspection. Raw Ajv use with the official dynamic schema produced false failures and was not used to diagnose project contract defects. The primary swagger-parser validator documents the same Ajv limitation; snapshot provenance, adaptation and unverified semantics are explicit. No operation, product policy, handler or runtime gate changed.

## NEXT-09 item-by-item UX review

UX-CHECK-01 records all 41 items in the two byte-verified pinned workbooks and eight source-based Core walkthroughs. UX-H09-01 found the missing original-context state on an operational citation route after reload/direct navigation. AI/UX/sitemap and TC-08 now distinguish absent historical context from a separately renewed current entity read. No historical endpoint, saved answer or permission change is introduced. Minor current Board/AI source headers are reconciled. Workbook rows remain Pending; visual/research/runtime gaps are explicit, not cleared by this author review.

## NEXT-10 routing/authentication verifier gap

API-V10-01 · Important test-coverage gap: the prior validator accepted four in-memory defects (an added empty internal security alternative, public security removal, extra path selector and duplicate selector). Existing contracts did not contain those defects. The dependency-free routing guard and five new full-validator test groups close this bounded gap, including all eight internal operations, legitimate inheritance/overrides and all HTTP methods. No runtime API exposure, permission closure or full OpenAPI conformance claim follows.

## NEXT-11 byte-binding reference evidence

HANDOFF-REF-01 makes selected ADR-0020 byte/evidence rules executable against synthetic inputs. It detects decoded duplicate JSON keys, invalid encoding, precision loss, normalization/serialization changes, omitted uncited operational evidence and mismatched citation locators beyond schema shape. Independent capture/receipt fixtures are not an authoritative store or permission decision. Provider wire mapping and all live preparation/claim/guard/transport tests remain missing; SYS-01 stays blocking. No migration/handler was added or SP marked Done.

## NEXT-12 storage prerequisite implementation

Proposed ADR-0023, logical model v0.8, Knowledge 003 and Workspace 004 supply immutable preparation/outcomes and permanent protected idempotency claim storage, with 26 real isolated SQL results. No accepted policy or HTTP schema changed. Physical ERDs and logical-gap labels are reconciled; command-token/inspection additions and all permission/guard/provider/handler evidence remain open. A stored fence/process or generated receipt alone proves neither current authority nor known durable acknowledgement. SYS-01 remains blocking.

## NEXT-13 query-to-receipt integration

HANDOFF-SQL-01 records a parameterized trusted-context query and seven optional SQL-to-byte-reference results. It prevents a likely encoding integration mistake (PostgreSQL base64 line wrapping) and rejects raw-byte reconstruction/precision loss while keeping consumed claim and readable receipt separate. The query accepts independently validated context, not user/model authority; real authenticated lookup/current scope/guard/provider implementations remain absent. Existing API operations, product policies and migrations are unchanged.

## Input metadata reconciliation — 25 October 2026

The original 18 October input versions are explicitly retained as a frozen snapshot. Prior review findings, commands and observed results are unchanged and have not been rerun by this metadata correction. Read current canonical sources before implementation.
