# Minimum test and evidence plan

**Artifact ID:** TEST-08
**Version/date:** 0.24.4 Draft · 5 November 2026
**Status:** Planned application assertions; owner-confirmed policy direction, no release acceptance.
**Inputs:** Proposed ADR-0027 v0.2; [PRD-01](PRD_SRS.md) v0.10.2; [UC-02](use-cases.md) v0.8.3; [SAD-03](../architecture.md) v0.19.1; DATA-04 v0.16.4; API-05 v0.23.4; ADR-0007 through ADR-0017; current UX/diagrams; [specs](../../specs/README.md); [evaluation](../../eval/README.md).; Proposed ADR-0018.; Proposed ADR-0019; Proposed ADR-0020; Proposed ADR-0021; Proposed ADR-0022; Proposed ADR-0023; Proposed ADR-0028 v0.1
**Author:** Development agent acting sequentially; no independent review claimed.

## Scope, levels and environment

One student implements and verifies; the owner resolves policy and evaluates criteria. The release gate contains 60 Must requirements under ADR-0010. FR-45 is Withdrawn, not renumbered; FR-35 remains Enhanced/Won't. Seven named original Core exceptions remain optional for this release, without reducing the other Musts. No automatic additional cut is permitted.

Runnable context/contract-definition and diagram checks exist. Real PostgreSQL storage migrations and synthetic database tests also exist: the latest recorded database run passed 12 results (11 scenarios plus parent). These verify storage prerequisites, not full feature ACs, application authentication/permission, transport concurrency or provider quality. Application handlers, end-to-end UI tests and model evaluation remain unimplemented/unrun. Five guard tests are TODO declarations, not passes.

Use unit tests for domain transitions and evidence binding; owning-database integration tests for transactions/constraints; consumer-provider tests for service identity, authority and failure semantics; system/UI tests for complete user actions, refresh/resync and accessible interaction; manual evaluation for claim support and usability. Do not infer one level's result from another.

Target test environment: two isolated owned databases, Workspace permission gateway, Knowledge process and controllable provider/transport adapters. Record actual stack/provider/model/hardware/load and corpus hashes before results. Never test against a production or personal-data volume. Runtime/provider choices and measured capacity remain open. Node context tooling uses Node 24 or later; no private reasoning, secrets or unrestricted source copies go into logs.

## Required gates

Each gate below is a required test design for its traced scope. All application results are Not run. The [coverage matrix](test-coverage.md) supplies exact SC/UC assertions and identifies contract/protocol gaps; an FR ID alone is not evidence.

| ID | Trigger and observable assertion | Primary trace / slice |
| --- | --- | --- |
| TC-01 | Valid login creates a session; wrong/locked credentials are generic; expired/signed-out sessions expose nothing; repeated expired sign-out is idempotent | FR-01, FR-36, FR-37, FR-68 / SP-01 |
| TC-02 | Pair outside-project, missing and no-grant reads; status/body/schema match with no hidden metadata; project membership alone cannot read restricted content | FR-03, FR-04, FR-59 / SP-02, SP-06 |
| TC-03 | Grant then revoke; repeat source/search/question/citation. Remove/rejoin does not revive grants. Revoked author's write/manage authority gives no read bypass | FR-14, FR-38, FR-39, FR-50-FR-52, FR-55 / SP-06 |
| TC-04 | Pause before/during protected source/citation/provider/answer handoffs; race revocation and lifecycle writes; preserve guarded ordering, whole-answer withholding and fail-closed unknown outcomes. Abort/restart cannot resume old handoff | FR-14, FR-28, FR-29, FR-55 / SP-09; ADR-0011 |
| TC-05 | Save two immediate revisions; exactly one Current, old bytes/passages unchanged and labelled historical, no Draft/publish. Failed transaction cannot partially swap version/pointer; ordinary retrieval never presents superseded evidence as Current | FR-11, FR-12, FR-19, FR-47, FR-60 / SP-07 |
| TC-06 | Duplicate/out-of-order indexing after revision/archive/delete cannot revive obsolete content. Exact retained Archived citation still opens with access; missing/deleted evidence never substitutes another version; unavailable identity uses ADR-0013 current-read policy and exact locator only | FR-13, FR-15, FR-48, FR-61 / SP-07 |
| TC-07 |Stale edits conflict; same scoped key/input resumes one outcome, changed input conflicts; concurrent Sprint starts/allocations preserve one Active Sprint and exclusive current allocation; select A (free) and B (already allocated), commit A and reject B without exposing B's competing Sprint SP-04, SP-05 SP-04: generic409 has no current_revision; fresh reads obtain current state. Same committed key/input replays original after later revisions/placement/target eligibility changes with current read/action; changed input conflicts. |FR-07, FR-08, FR-09, FR-42 / |
| TC-08 |Highest committed blocker sequence determines current state; no event means unblocked, distinct repeated Open appends history, same-key replay does not duplicate. Current operational links/revisions/time override stale documents; denied/unknown observations never leak or imply a complete result SP-04: Blocker201 contains only event; fresh authorised Task/history supplies blocked/revision. Every distinct event advances Task revision; repeated-key replay does not append. |FR-25, FR-26, FR-44 / SP-10 |
| TC-09 | Split evidence outcomes: (a) invalid/revoked draft wholly withheld; (b) one supported and one missing component yields `partially_answered` with citations and `missing_components` but no hidden-source hint; (c) no supported component yields `insufficient_evidence`. Unresolved contradictions remain explicit; fabricated locators withhold the original draft, and only a new attempt checked for claim support/citation/access/provenance may deliver; malicious retrieved instructions cannot mutate/disclose | FR-22-FR-24, FR-30, FR-54, FR-60 / SP-09 |
| TC-10 | Inject generation/embedding connection failure, timeout and budget exhaustion independently; question fails without generated content while healthy work/Sprint/docs/keyword paths succeed | FR-33, FR-34, FR-69 / SP-12 |
| TC-11 | Scoped audit may expose actor/action/entity/time under ADR-0012 but redacts protected title/content/payload. Non-scoped/other-project requests reveal nothing. Audit/trace IDs grant no source/citation/AI read; revoke inspector capability and repeat | FR-27, FR-56, FR-58, FR-59 / SP-13 |
| TC-12 | Score exact citations and claim support separately; eligible top-five and multi-source completeness have declared denominators; compare keyword only on matched corpus/access. Freeze rubric before pilot and thresholds before formal runs | NFR-07-NFR-09 / SP-12 |
| TC-13 |Deny missing create-project/backlog-author/content-write/manage-access capability; reject invalid item type, dates, classification, assignee, grantee and inaccessible relationship endpoints; reject removal of the final effective membership manager with all state unchanged without persistence or existence leak SP-04: creator/create-only backlog-author/role cannot edit without separate grant; state/assignment/blocker actions are independent. Disabled current-member, unknown/nonmember/foreign assignees return the same bounded validation after caller scope checks; null unassign is permitted. |FR-02, FR-05, FR-06, FR-10, FR-16, FR-38, FR-43, FR-51, FR-66 / SP-02-SP-08 |
| TC-14 |Fail storage/authority at each check/commit and lose responses after possible commit: no partial membership/Sprint/version change; race two removals of the last two membership managers so exactly one is rejected and protected state remains; unknown outcome reconciles before retry; independent dependency failures reported honestly SP-04-SP-09, SP-12 SP-04: injected Task/event/audit/original-outcome failure rolls back atomically; uncertain COMMIT/HTTP acknowledgement keeps original actor/operation/key/body and is not proof of rollback or reason for a fresh automatic key. |FR-20, FR-28, FR-39, FR-44; NFR-03 / SP-02, |
| TC-15 | Workspace allocates identity/policy/capabilities/revocable author grant before Knowledge Current persistence; same-key retries create no duplicate identity/version/grant. Policy-only orphan is unreadable. Cleanup versus delayed persist remains a protocol gate | FR-10, FR-14, FR-51, FR-52 / SP-06 |
| TC-16 | Direct To Do-to-Done and Done-to-To Do/In Progress succeed with authority/revision. Reopening from Completed Sprint atomically returns task to Backlog as To Do (also for a requested In Progress target), retains completed allocation history and leaves Sprint Completed; race against completion/allocation | FR-09, FR-42 / SP-04, SP-05; ADR-0008 |
| TC-17 | Create explicit links between permitted endpoints; navigate both directions; hide inaccessible target metadata/counts; optional remove leaves resources intact; AI suggestions alone create no links | FR-16, FR-17, FR-49 / SP-08 |
| TC-18 | Every catalogue mutation commits audit/pending delivery atomically; minimum-record failure rolls back, sink failure retains replay. Mandatory run/evidence persistence precedes provider/answer handoff; optional metric gaps are labelled, never fabricated | FR-31, FR-32, FR-57 / SP-11; ADR-0012 |
| TC-19 |Authorised item creation yields server ID/type/To Do; content edit and Backlog ordering persist with audit and refresh/resync; no unauthorised writes SP-04 SP-04: deny content editing outside Backlog, separate create/edit authority, retain original Task200/Blocker201 indefinitely with current read/action replay checks, deny revoked replay, and verify new same-value/empty no-op receipts without fake audit/revision bump. |FR-05, FR-40, FR-41 / SP-03, |
| TC-20 | Create readable classified text/Markdown with owner and immutable identity; readiness pending/ready/failed is separate from Current. Optional import/metadata changes validate format/authority and preserve evidence | FR-10, FR-15, FR-62, FR-65 / SP-06, SP-07 |
| TC-21 | Planned-to-Active-to-Completed only; select A (free) and B (already allocated), commit A and reject B without leaking B's competing Sprint; completion atomically returns unfinished work as To Do with revised tasks/audit and retains Done work and completed allocation history. Optional removal resets unfinished items to To Do. Verify rollback and same-key replay preserve one result. Starting Completed or completing Planned is rejected; retries follow idempotency | FR-06-FR-08, FR-42, FR-66, FR-67 / SP-05 |
| TC-22 |Exercise permitted/denied/empty/conflict/unavailable UI, keyboard alternatives and focus/feedback for board/editor/citation/inspection; server denial remains effective when controls are bypassed SP-04 UI distinguishes historical original receipt from current Task/history, clears protected state on denial/outage, recovers unknown acknowledgement by original identity and reads fresh state before a new user-confirmed conflict resolution. |Current UX sources; relevant FR/ACs / apps/web |
| TC-23 | Exact-term and paraphrase fixtures separately exercise keyword and semantic retrieval; check authorised Current candidates, explicit labelled history, matching result metadata, successful empty results and fail-closed authority failure; keyword survives AI failure | FR-18-FR-20, FR-47, FR-53, FR-63 / SP-08, SP-09 |
| TC-24 | Authorised project creation and membership add persist identity/creator/membership; shared access resumes but restricted grants do not revive. Optional project name/description edit preserves identity/membership, rejects stale/unauthorised writes | FR-02, FR-38, FR-64 / SP-02 |
| TC-25 | Optional task title/description match, no match, blank input, cross-project/unknown equivalence, revoked membership between pages, refreshed edits, AI and Knowledge outage | FR-70 / SP-08; ADR-0016 |
| TC-26 | Pause manifest persistence outside guard: revocation must not wait for that remote write. Pause after durable acknowledgement, change access/source lifecycle/operational revision or payload digest, then acquire guard: zero protected bytes; release before preparing a fresh immutable handoff ID and bounded new attempt. Fail/timeout persistence, replay a consumed handoff ID, crash/restart after possible send: no unvalidated or duplicate retry. A valid attempt retains guard through transport completion/abort. Exercise provider input and answer delivery, including uncited evidence and whole-draft withholding | FR-28, FR-29, FR-32, FR-57 / SP-09, SP-11; ADR-0012; application Not run |

TC-22 is an interaction-verification plan, not a claim of standards compliance or a new accessibility certification requirement. Optional requirements in a gate are tested if delivered; they are not silently promoted into the 60-Must release gate.

## Coverage and execution order

Read [TEST-COVERAGE-01](test-coverage.md): all eight SCs and BR-01-BR-14 have named gates. The UC matrix retains 49 named EX identities: 48 active and one Withdrawn. Most assertions are specified; orphan cleanup remains a protocol gap; ADR-0013 specifies terminal/unavailable wire assertions. [VERIFY-01](requirement-verification.md) adds every FR/AC, named alternate branch and NFR observation, with definition/input gaps retained. Inventory completeness is not implementation or runtime coverage.

Run in dependency order: identity/project authority; work and document creation; immediate revision and exact reads; retrieval/citation/AI transport; inspection/provenance; failures and controlled evaluation. Begin audit capture with the first mutation. For every test record actor/capability scope, snapshot/configuration, request/key/revision, controlled pause/commit/handoff boundary, persisted state and observed response/transport. Do not store private reasoning or unnecessary source content.

## Research and safety regression

Use [25 research cases](../../eval/research-cases.json) with their separate research corpus (8 document / 8 state / 9 combined), and [25 safety regressions](../../eval/reference-cases.json) on synthetic-0.3 plus declared mutations. EVAL-05 checks unsaved form text is not ingested; EVAL-21 applies two immediate revisions. Historical synthetic-0.2 and pre-correction definitions are retained as unexecuted snapshots, not current input. A definition materializer is not a handler or permission test.

Questions/reference claims/split/rubric freeze before pilot; pilot selects thresholds/margins, frozen before formal evaluation. C0/C1/C2 use matched settings and snapshot within each suite/scenario. Keep negative results; repeated attempts do not enlarge the independent question count. H3 uses operation-specific entitlements: authorised audit identity is permitted, content remains separately protected. This does not expand AI evidence access. A measured manual baseline is required before time-saving claims; no provider run or superiority result exists.

## Exit, suspension and deliverables

Required evidence is a per-test result with reproducible configuration, relevant logs/redaction, persisted-state assertions, consumer/provider or UI evidence as appropriate, and unresolved defects. Known unauthorised disclosure, version substitution, fabricated failure answers or incorrect state overwrites suspend release. Resume only after correction and the affected regression pass. Do not lower expected answers/thresholds to clear failure. Month 5 retains final regression/report/demo; exact calendar dates depend on confirmed schedule/capacity.

Deliver: complete FR/AC/SC/UC trace, executable tests, reviewed fixtures/rubric, result/defect records, run configuration and limitations. Current matrices are definition evidence only. Missing full positive/alternate-flow trace, runtime handlers, provider choices, pilot thresholds, visual/accessibility checks and the orphan cleanup protocol row remain gaps.

The optional user-stories file stays N/A because PRD FR/AC and UC journeys supply those inputs. [The v0.2 test plan](test-plan-v0.2-history.md) is a historical unexecuted-plan snapshot, preserving the old 17/7/20 mapping; it is not the current gate or current test count. Checklist: scope/levels/owners/assertions/environment/exit are written; full workbook compliance, runtime verification and independent approval are not claimed.

ADR-0017 extends TC-03/13/14/18/19: remove all individually granted capability families and clear task assignees atomically, preserve historical attribution, race removal against assignment/grant issuance, inject audit failure and verify rollback, then rejoin and prove neither grant nor assignment revival. These assertions apply to FR-38/39/43 and do not add a release requirement.

ADR-0017 last-manager rule: reject removal of the final current member with effective membership-management authority until another current member has that authority. Check inside the serialized removal transaction, including concurrent removals/capability changes; no Admin/creator bypass or automatic successor. Rejection leaves all state unchanged.

## SYS-02 operational reconstruction acceptance — 18 October 2026

Proposed ADR-0018 / Workspace v0.2.3 extend TC-07/08/16/21 without changing release scope. From a fresh authenticated client, use only public reads to reconstruct all versus ordered Backlog tasks, Planned/Active Sprint allocated rows and Completed Sprint retained/returned rows. Reopen completed work and verify Backlog/To Do while the old completed association remains. Do not infer a historical task state from the current Task nested in an association. Verify equal numeric positions use task-ID tie order and decimal precision is preserved.

Read blocker events in ascending sequence after refresh, including repeated Open and subsequent Resolved, actor/time/outcome and empty history. A member without audit-read can inspect permitted work history; a removed member cannot. During pagination mutate a projected row, reorder, reassign or revoke membership: stale datasets return 409 without rows, access loss returns generic denial, foreign cursors disclose no scope. The client discards stale pages. Compare completion counts to its transaction and same-key replay after later work changes. Repeat with AI unavailable. All runtime assertions remain Not run; context tests only protect contract declarations.

## P1-R01/P1-R02 closure assertions — 18 October 2026

TC-07/16/21: complete in Sprint A, reopen into Backlog, mark Done there and allocate to B; A's completed association remains unchanged throughout. Reject cross-project/wrong-state/missing-association markers and completion with unsettled live allocations. Rollback restores location and generation. Legacy ambiguous completed histories fail upgrade without explicit revision-bound mapping; stale mapping fails; no content/history deletion. Down refuses nonempty tasks.

TC-07/19: traverse multiple Backlog pages at one revision; valid full permutation succeeds, duplicate/omitted/foreign/currently allocated IDs fail unchanged, empty only succeeds for an empty set, same-order is no-op. Concurrent creation/allocation/return/reorder changes backlog_revision and rejects the old request; content-only edits do not change this revision but invalidate cursor datasets. Same-key replay after a later reorder returns its original receipt without rewriting newer order. Handler/cursor/permission scenarios remain Not run even if SQL storage tests pass.

## Priority 2 discovery assertions — 18 October 2026

TC-03/13/24: page current members, remove/rejoin and reject a prior membership revision; known-ID add does not enumerate accounts. Compare same-role actors with different grants. getAllowedActions must not return internal operations, other-scope actions, grant identities, hidden metadata or usable authority after revocation. Unknown/denied response equivalence includes forged cross-project resource selectors. Authority failures return no cached allow.

TC-05/15/20: browse readable documents with pending/failed indexing or null Current; page exact labelled history and retrieve selected immutable version. Non-reading manage-access retains policy/grant administration while content/explorer/history remain denied. Reader without manage-access cannot enumerate grantees. Verify fresh policy preconditions, grant-page revision consistency, concurrent classification/grant changes and remove/rejoin invalidation. Forge/expire/change cursors and ensure no mixed page sets or hidden counts; test final protected handoff revocation, Knowledge outage and authority outage. No handler tests have run; harness negatives below only protect selected contract declarations. Trace: SC-01/05/06; Proposed ADR-0019.

## Priority 2 recheck regression assertions

P2-R01 / TC-05/20: seed two documents in one project with identical version IDs and different grants; discover using full pairs and verify exact echoed bindings. Wrong project/parent, unknown version, missing/extra selectors and independently held non-read action grants must not borrow another document's read authority. Runtime handler evidence is pending.

P2-R02 / TC-11/18: pair answer-reader/no-trace, trace-inspector/no-answer, both, unrelated and revoked readers. Discover summary and trace independently; recheck at actual inspection and source delivery. FR-27 remains Should. Declaration tests do not exercise these decisions.

P2-R03: through validateApi, inject actual guardProviderInput, retireDocumentPolicy and an unknown operation into separate catalogue copies; each must fail public membership derived from both current contracts. A Knowledge public operation must pass, a removed/renamed peer operation must fail, a narrower intentional catalogue must pass, and missing peer contracts must fail closed. Catalogue membership does not prove operation-to-scope enforcement.

## SYS-01 transport contract and runtime distinction

TC-26 now uses manifest-bound ProviderInput and InternalQuestionResult. Exercise the authenticated internal getHandoffManifest outside guard, then local one-use claim, then exact full current evidence validation and frozen byte handoff. Alter purpose, actor/session/project/run/attempt/destination, complete marker, byte length/digests, receipt, uncited document and operational entity revision/time. Failed/unknown persistence or claim sends zero bytes. Duplicate/unknown claim never resends. A source revision/permission change rejects the entire original draft; fresh validated replacement occurs only after guard release. Crash/restart/unknown send cannot resume or auto-resend with a new identity. A valid attempt holds guard through completion/confirmed abort.

Harness mutation tests protect mandatory receipt/manifest/frozen-byte fields, purpose and full mixed evidence declarations across both contracts. They do not execute storage, byte hashing, provider adapter semantic mapping, guard/claim fencing or real revocation. Both purposes require live paused-boundary tests and additive storage evidence before AI relay. No such test has run in this slice.

## NEXT-03 inspection and metric cases

TC-11: permitted answer reader without trace-read sees optional summary only; scoped trace inspector sees separately allowed fields. Exercise actual query, two recorded retrieval steps, source-to-step ranks, exact document tuple and operational entity/revision/time, including a repeated source in both steps. Deny/revoke one source and verify no identity, dependent query/validation text, hidden count or rank gap survives; recheck at protected response handoff. Unknown/denied run is generic 404; authority or mandatory-record failure is generic 503. No audit-only identity exception carries into trace/summary.

TC-18: valid measured-zero duration/usage, unavailable metrics with no number, unexecuted not_performed step/query/metrics, partial totals with unavailable run total, failed step with measured duration, optional metric persistence loss and mandatory query/step/evidence failure. Optional metric loss does not invent defaults or undo durable mandatory provenance; missing mandatory records are failures. Test strict exclusive metric shapes and safe error categories without private reasoning/raw logs.

Harness negatives reject absent actual query/steps, incomplete exact document/operational source binding, numeric-only timing, values attached to unavailable metrics, missing usage availability, full generation stages in summary and FR-27 promotion to Must. These are contract regression checks, not capture/permission/telemetry runtime evidence.

## NEXT-04 consumer scenarios

TC-08: change current blocker/task state after an operational citation was delivered; open its observation locator, fetch exact current entity under renewed project scope and label the two separately. Denial must not repopulate cached titles/current values or call a document citation endpoint. No historical snapshot read is invented.

TC-10/22: terminal AI failure followed by deliberate new request and success clears stale health/error UI; no background loop. Lose a response and verify explicit unknown state, no automatic replay/new-ID resend and server quarantine respected by any new user request. Test expired session and membership loss separately from provider recovery. TC-20: semantic pending/failed plus committed permitted Current passages still allows keyword results; Current alone promises neither path. These are planned runtime/UI cases; contract negatives only protect explicit semantic readiness fields.

## NEXT-06 command precondition and receipt scenarios

TC-03/05/06/13/20: revoke restricted-author read but retain exact write/lifecycle authority; deny all content/history/readiness while allowing known-ID opaque precondition and new-text revision/archive/delete. Return only minimal receipt, never Version/Document content. Read-only/manage-only actor is denied the requested command precondition. Race revocation/session change and revision; reject wrong actor/project/document/action/version/generation and stale/unknown tokens without current revision/state leakage. Commit state/audit/token consumption atomically, roll back all on failure and return original minimal same-key receipt without re-executing or requiring a consumed token. A changed replay payload conflicts. Unknown outcome keeps the original key; a new precondition does not prove rollback. FR-65 remains Could. Contract negatives cover selected precondition unions and receipt disclosure only; runtime/SQL tests are unrun.

## NEXT-07 contract example checks

`npm run contracts:test` evaluates synthetic component-schema samples with pinned development tooling after `npm ci`. It compiles the current OpenAPI component schemas and checks valid/invalid metric states, inspection locators, full version discovery identity, command selector exclusivity, minimal acknowledgements and manifest purposes. Inputs are never coerced, defaulted or stripped. This supplements declaration checks; it neither validates the complete OpenAPI document nor executes HTTP, permissions, storage, relay or UI behavior. Non-schema semantics in TC-26 and command/token/reorder scenarios remain unrun.

## NEXT-08 document and inline-schema checks

The same contract test command now adds whole-document structure checks using the pinned official 3.1.x schema and a calibrated local dynamic-reference specialization. Schema Object validation remains a separate JSON Schema 2020-12 meta-validation/compilation step for both named components and inline HTTP schemas. A valid synthetic document and malformed response/parameter/operation cases calibrate the structure adapter; an invalid inline schema must fail while arbitrary example data stays opaque. Source hash and license are recorded under tests/fixtures/openapi31. This is bounded structural evidence, without document-level format assertions, external dialect overrides, full standard semantics or live HTTP acceptance.

## NEXT-09 operational inspector reload scenario

TC-08 / NFR-01: deliver an operational citation, open its inspector, then reload/direct-navigate after losing the original answer context. The historical panel must state original cited observation unavailable; a renewed current entity read is separate and cannot supply historical observation time/revision/value. Tampered URL observation parameters or browser storage must not become authoritative history. Back navigation may retain actual in-memory delivered context but still renews scope; denied/expired scope clears protected details. Do not auto-submit a new question or borrow trace/optional-summary entitlement. These are planned UI assertions; no browser handler/prototype test ran in this textual correction.

## NEXT-10 routing/authentication declaration regressions

Dependency-free context tests now reject empty or partial authentication alternatives for all eight actual internal operations, public session opt-outs/unknown schemes, duplicate/extra/missing path parameters and equivalent templated routes. Positive tests retain inherited parameter references and legal operation overrides; cyclic references fail, and HEAD cannot bypass requirement trace. This tests the harness through current full contracts. Real HTTP authentication, guard and route behavior remain Not run.

## NEXT-11 executable byte reference for TC-26

HANDOFF-REF-01 adds local tests for canonical base64, byte limits, invalid UTF-8/JSON/decoded duplicate keys, exact integers, raw byte digest/length, independent preparation/identity, full uncited mixed evidence and exact answer citations/claim references. Whitespace/Unicode changes and UTF-16 versus UTF-8 byte counting are explicit negatives. Zero-evidence insufficiency is retained. The source/capture/receipt fixtures are synthetic test oracles, not real authoritative persistence or access evidence. Provider wire mapping, actual guard/claim/byte boundaries and factual support remain unrun; TC-26 is not Passed.

## NEXT-12 isolated SQL evidence and remaining TC-26

The separate handoff storage suite passed 11 results (10 subtests plus parent), and the updated existing storage suite passed 15 (14 plus parent) on PostgreSQL 17.10 / pgvector 0.8.2. It checks new migration repeat/empty reverse, exact byte/digest/owned identity, rejected malformed/partial metadata and duplicate sources, rollback/append-only rights, both purposes, permanent duplicate claims, two-session claim race, outcome-fence FK, nonempty down refusal and legacy protected-row rejection without mutation. The existing policy/revision/location/retrieval/isolation tests remain passing. All fixtures ran in unique disposable containers; no development migration occurred.

These are SQL service-role/storage tests. Active process fencing, durable/unknown acknowledgements at application boundaries, real scoped getHandoffManifest, source capture/revocation, guard retention, actual provider/answer zero-byte rejection and no automatic resend still need handler/transport evidence. No SP or TC-26 is marked Passed.

## NEXT-13 optional SQL/reference integration

The actual contracts:storage:test command passed seven results (six subtests plus parent) in a fresh isolated container. Both purposes retain exact raw bytes through a canonical StoredHandoff projection. Every trusted-context selector mismatch/NULL yields no row; wrapped base64 and reserialized bytes fail; readable consumed preparations do not regain a claim; a separate connection cannot see uncommitted preparation and cancelled rollback leaves none; unsafe integer parsing fails closed. These are storage/serialization tests with synthetic context, not current permission or HTTP consumer/provider acceptance. No live TC-26 or SP Done is claimed.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.

## P10 input metadata — 28 October 2026

Input versions synchronize the bounded session lifecycle update. Existing requirement, evaluation and UI assertions remain unchanged; no runtime acceptance is inferred from this metadata revision.

## SP-02 measured subset — 1 November 2026

The registered SP-02 execution report maps current create/project/member/replay/discovery/removal/audit/failure checks to AC-02/03/38/39. These include actual disposable 008 PostgreSQL, HTTP, DOM/HTTPS and isolated Edge tests. TC-02/18/22/24 have measured bounded subsets, not whole-case acceptance. SP02-F01 actual future producer races, Knowledge/source/citation/provider and D-07 remain unrun. The original 006 storage/session suites retain explicit schema ceilings; new SP-02 suites exercise 007/008. No threshold, expected outcome or future required assertion is removed.

## SP-03 bounded execution trace — 2 November 2026

[SP-03 execution report](reports/SP-03-2026-11-02-execution.md), [UI report](reports/SP-03-2026-11-02-ui.md) and [registered plan](../implementation/features/sp-03-create-task/plan.md) distinguish source/SQL/HTTP/DOM/browser results and preserve failures. Current final counts belong to that report, not an inferred completion from this design matrix.

| Required creation assertion | Producer and evidence boundary |
| --- | --- |
| AC-05 supported Story/Task/Bug content persists | P04 real Task HTTP + P08 DOM/Edge + P09 fresh current regression; stable ID/project, todo, null assignee, unblocked revision 1 and server time. |
| AC-05 unsupported/invalid content makes no item | P04 invalid body/type/blank/title/extra identity/media/body-size matrix checks Task/generation/audit/outcome unchanged. |
| AC-05 unauthorised or foreign creation denied | P03C explicit-author/private audit and P04/P07 current scope/authority/disabled/removal races; descriptive roles and forged actor headers cannot grant authority. |
| UC-03 server timestamp, persisted read and audit | P03B immutable origin/outcome; P04 backlog-item-create actor/entity/time audit co-commits with Task/result; P05 fresh list/detail; P08 reload/current content. |
| TC-18/19/22 replay, rollback, unknown outcome and outage | P03B/P04/P07 actual durable outcomes, loss after committed response, exact key/hash recovery, rollback/barriers; P06/P08 unknown/denied/outage UI. |
| Current Backlog reconstruction and permission-aware reads | P05 107-row numeric/UUID/current-location/blocker/cursor/member tests; P07 read watermark/append schedule; P08 fresh first-page restart. |

UC-03 EX-01 and EX-02 now have bounded creation evidence. EX-03/Alt-1 editing and Alt-2 reorder remain later SP-04/SP-05 scope. FR-50 is document classification, not Task creation. This does not close whole SC-01/SC-06, document/citation/provider/D-07 gates, SP02-F01 or independent/release acceptance. Historical scenarios and failures remain unchanged.

## SP-04 P03A2 planned verification alignment — 3 November 2026

Existing TC-07/08/13/14/16/18/19/22 and FR-09/40/43/44 trace now include [actual owner directions](../implementation/features/sp-04-update-task/owner-decisions.md) and [Proposed ADR-0028](../adr/0028-task-mutation-authority-and-outcomes.md). All new/refined assertions are Specified, not executed runtime results. Actual handler/DB/DOM/browser and SP-05 producer race evidence belongs to the future owning producers; source/schema passes close none of those gates. No test-case/EX/FR ID, priority, expected-answer fixture or historical result is changed.

## SP-05 bounded implementation evidence — 5 November 2026

[FEAT-SP05-01](../implementation/features/sp-05-sprint-lifecycle/plan.md) / SP05-P00–P15 owns the only current status. FR06/AC06: real create/date/goal/timestamp and original-result tests in sprint-http; FR07/AC07: actual exclusive allocations/mixed outcomes and separate keys in sprint-http/concurrency/controller/live DOM; FR08/AC08: actual competing starts and empty lifecycle in sprint-http/concurrency; FR41/AC41: complete permutation/string generation/partial rejection/no-op/numeric position revision in sprint-http and live DOM/browser; FR42/AC42: real completion retains Done and returns unfinished To Do with original counts, audit and receipts, followed by actual reopen/allocation with preserved history in sprint-http/concurrency. FR31 capture and rollback/lost COMMIT apply to all five producers; sprint-security tests actual revoke-first and all eight post-wait expiry boundaries. TC07/13/14/16/18/19/21/22 and UC05 denial/alternate branches are exercised only to these named boundaries. FR66/67 remain excluded Could, not failed Must gates.

Exact positive/negative runs, initial failed339-run, focused corrections, final rerun source hashes, isolated Edge and unrun/independent/release limits are retained in the feature handoff/evidence. A fixture or schema pass alone does not close a handler/permission gate; no whole SC03/04/06, protected transport D07, provider/evaluation, deployment or independent acceptance is claimed.
