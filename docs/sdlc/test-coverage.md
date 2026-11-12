# Scenario and exception verification matrix

**Artifact ID:** TEST-COVERAGE-01
**Version/date:** 0.11.6 Draft · 7 November 2026
**Inputs:** Proposed ADR-0032 v0.1;  Proposed ADR-0027 v0.2; PRD-01 v0.10.3; UC-02 v0.8.4; TEST-08 v0.24.7; ADR-0007–ADR-0017.; Proposed ADR-0028 v0.1; Proposed ADR-0031 v0.1
**Status:** Planned assertions with bounded P09/P10/P11 measured subsets; no complete scenario or independent approval.

## Evidence rules

`Specified` means the observable assertion is written here and in its TC gate. It does not mean a handler/test exists or passes. `Contract gap` and `Protocol gap` name missing details without dropping the required assertion. `Withdrawn` retains the old identity without counting it as active coverage. Every active row below needs a real application result, failure-boundary evidence and relevant persisted-state/transport observations. SQL/context tests are partial prerequisites only.

## Core scenario matrix

| Scenario | Setup and observable result | Gates | Application evidence |
| --- | --- | --- | --- |
| SC-01 | Open an in-project task linked to one readable and one unreadable source; navigate only the readable source and its exact applicable version; no hidden target title/ID/count | TC-02, TC-17 | Not run |
| SC-02 | Ask recorded JWT rationale; find authorised reference passage, support the claim, open the exact citation and correlate run/provenance; related but insufficient text cannot fabricate rationale | TC-09, TC-12, TC-18 | Not run |
| SC-03 | Query blocked work after ordered Open/Resolved events; compare fresh operational IDs/revisions/time, exclude out-of-project tasks and stale document claims | TC-08 | Not run |
| SC-04 | Find past blocker plan and recorded resolution via history/links; keep plan distinct from confirmed outcome; exact citations remain labelled | TC-08, TC-09, TC-17 | Not run |
| SC-05 | Save two immediate revisions; exactly one Current, old passages unchanged; current retrieval cannot return old content as current; exact old citation opens labelled history | TC-05, TC-06 | Storage prerequisites tested; handlers not run |
| SC-06 | Cross-project, no-grant, revoked-author, removed/rejoined member and direct citation attempts deny protected content; scoped audit identity follows ADR-0012 without granting content access | TC-02–TC-04, TC-11, TC-15, TC-26 | SP-02 project/member handler subset measured; full document/citation/provider scenario not run |
| SC-07 | Ask an unrecorded decision with empty and related-but-insufficient evidence; explicit insufficient evidence, no fabricated rationale or hints about hidden sources | TC-09, TC-12 | Not run |
| SC-08 | Inject provider connection failure, timeout and exhausted budget; question fails without generated answer; healthy work/Sprint/docs/keyword paths still succeed | TC-10, TC-14 | Not run |

## Business requirement ownership

| Requirement | Gates and key assertion | Evidence status |
| --- | --- | --- |
| BR-01 | TC-01–TC-03, TC-13, TC-24: authenticated project membership and scoped actions | Application not run |
| BR-02 | TC-07, TC-19, TC-21: ordered Backlog, fixed Sprint allocation/completion, no implicit Done | Application not run |
| BR-03 | TC-07, TC-08, TC-16: direct state moves, assignee validation, ordered blocker history and resync | Application not run |
| BR-04 | TC-13, TC-15, TC-20: classified owned text/Markdown, immutable initial content, supported organisation | Application not run |
| BR-05 | TC-05/06: immediate revision, exact immutable historical evidence and retirement | Database prerequisites only |
| BR-06 | TC-17: explicit links, readable endpoints, no hidden relationship metadata | Application not run |
| BR-07 | TC-06, TC-12, TC-23, TC-25: current authorised keyword/semantic discovery and matched baseline if claiming improvement | Application not run |
| BR-08 | TC-09, TC-12: supported cited answers, missing evidence and conflicts | Application not run |
| BR-09 | TC-08: current operational truth with entity/revision/time | Application not run |
| BR-10 | TC-02–TC-04, TC-11: project/document/inspection scopes and protected handoff | Application not run |
| BR-11 | TC-18: durable audit accompanies each committed catalogue mutation | Application not run |
| BR-12 | TC-11, TC-18, TC-26: mandatory provenance and scoped source/trace inspection | Application not run |
| BR-13 | TC-10, TC-14, TC-25: dependency-specific failure and surviving independent paths | Application not run |
| BR-14 | TC-03, TC-06, TC-15: removal, revocation, archive/delete and no stale revival | Database prerequisites only |
| BR-15 | FR-35 remains Enhanced/Won't under ADR-0010; no fabricated report gate | Outside this release |

## UC exception matrix

49 named identities: 48 active and one Withdrawn. All active application results are **Not run**. Required assertions are below; this mapping does not claim full positive/alternate-flow or FR/AC coverage by itself.

| UC / EX | Gate | Definition status | Observable assertion |
| --- | --- | --- | --- |
| UC-01 / EX-01 | TC-01 | Specified | Wrong/locked credentials return generic failure without account enumeration or session creation. |
| UC-01 / EX-02 | TC-01 | Specified | Expired session returns sign-in-required and no protected result. |
| UC-01 / EX-03 | TC-01 | Specified | Expired/already-invalid sign-out is idempotent; no server error or renewed session. |
| UC-02 / EX-01 | TC-13 | Specified | Missing project-create capability denies without creating a project. |
| UC-02 / EX-02 | TC-13 | Specified | Unknown user add request reveals no account existence and creates no membership. |
| UC-02 / EX-03 | TC-14 | Specified | Failure cannot leave membership removed with old grants usable; retry reconciles one committed outcome. |
| UC-02 / EX-04 | TC-13, TC-14 | Specified | Last-manager removal is rejected with no mutation; racing removals of the last two managers result in exactly one rejection, preserving an effective manager. |
| UC-03 / EX-01 | TC-13 | Specified | Unsupported item type fails validation without a persisted item. |
| UC-03 / EX-02 | TC-13 | Specified | Missing backlog-author authority denies; Scrum title alone cannot create. |
| UC-03 / EX-03 | TC-07 | Specified | New stale edit returns generic409 without current_revision, preserves newer content and refreshes authorised getTask; committed original-key recovery instead checks current action/read. |
| UC-04 / EX-01 | TC-07 | Specified | New stale board move returns generic409 without current_revision and preserves committed state; refresh authorised getTask, separating new write from original-key replay. |
| UC-04 / EX-02 | TC-13 | Specified | After caller scope/action checks, unknown/nonmember/foreign/disabled new target receives the same bounded400 validation_failed and leaves previous assignee intact; enabled member/null succeeds, dependency failure stays503. |
| UC-04 / EX-03 | TC-14 | Specified | Known failure rolls back Task/event/audit/original outcome together; unknown COMMIT/HTTP acknowledgement reconciles only original actor/operation/key/body under current read/action, without inventing pending wire fields or fresh automatic keys. |
| UC-04 / EX-04 | TC-08 | Specified | A new Open event after Open appends at a new sequence; state stays Blocked and history remains. Replay of the same request key is separately idempotent. |
| UC-05 / EX-01 | TC-07 | Specified | Concurrent starts yield at most one Active Sprint; rejected start remains Planned. |
| UC-05 / EX-02 | TC-13 | Specified | Missing/reversed dates reject without changing lifecycle. |
| UC-05 / EX-03 | TC-21 | Specified | Starting Completed Sprint is rejected; historical completion remains. |
| UC-05 / EX-04 | TC-14 | Specified | Completion failure cannot commit only Sprint state, allocation returns, To Do resets, revisions or audit; rollback preserves all prior state. |
| UC-05 / EX-05 | TC-21 | Specified | Completing Planned/already Completed is rejected; identical request replay follows the recorded idempotent outcome. |
| UC-06 / EX-01 | TC-13 | Specified | Missing classification creates neither policy/content nor version. |
| UC-06 / EX-02 | TC-13 | Specified | Missing create authority persists no document or author grant. |
| UC-06 / EX-03 | TC-13 | Specified | Nonmember grantee creates no read grant and reveals no reason/account existence. |
| UC-06 / EX-04 | TC-03, TC-04 | Specified | Controlled read/revoke race orders commit and protected handoff; after revocation succeeds no new protected handoff uses the grant. |
| UC-06 / EX-05 | TC-15 | Protocol gap | Lost registration/persist response retries the scoped key without duplicates; orphan policy grants no content availability. Delayed persist versus cleanup needs a fencing/reconciliation design before destructive cleanup. |
| UC-06 / EX-06 | TC-03, TC-15 | Specified | Revoked author grant or membership removal denies source/citation/AI content despite unchanged authorship/write capability; rejoin never revives grant. |
| UC-07 / EX-01 | TC-13 | Specified | Missing content-write denies without creating a version or moving Current. |
| UC-07 / EX-02 | None | Withdrawn | Invalid-Draft publication branch removed with FR-45; never count as active or passed. |
| UC-07 / EX-03 | TC-05, TC-14 | Specified | Failed transaction is atomic; unknown remote outcome withholds affected protected handoffs until reconciled, not presumed rollback. |
| UC-07 / EX-04 | TC-06 | Specified | ADR-0013: current member satisfying retained read policy receives only verified exact UnavailableCitation identity; revoked/rejoined/audit-only and unknown callers get generic 404. Dependency failure denies, no guessed identity or replacement; retained authorised Archived evidence opens normally. |
| UC-07 / EX-05 | TC-07 | Specified | Stale revision request changes no Current pointer and inserts no replacement. |
| UC-07 / EX-06 | TC-07 | Specified | Same scoped key/request returns one reconciled revision; changed input with same key conflicts. |
| UC-08 / EX-01 | TC-14 | Specified | Access-check failure returns generic dependency failure without results or unrestricted retry. |
| UC-08 / EX-02 | TC-13, TC-17 | Specified | Unreadable relationship endpoint creates no link and exposes no endpoint metadata. |
| UC-08 / EX-03 | TC-03, TC-06 | Specified | Stale index entries do not reveal revoked or noncurrent content in ordinary results. |
| UC-09 / EX-01 | TC-14 | Specified | Authority outage before provider handoff sends no protected context; no fail-open cache. |
| UC-09 / EX-02 | TC-04 | Specified | ADR-0013: revoke any evidence including uncited context; withhold entire original answer. Terminal 503 AnswerWithheld is constant with no source/citation/run ID or detailed cause. New bounded attempt repeats all checks. |
| UC-09 / EX-03 | TC-09 | Specified | Malicious source instructions neither perform mutations nor disclose restricted information. |
| UC-09 / EX-04 | TC-10 | Specified | Required embedding/semantic failure produces explicit AI error; healthy keyword path remains independent. |
| UC-09 / EX-05 | TC-10 | Specified | Generation error/timeout produces no generated answer and retains minimum run/failure evidence. |
| UC-10 / EX-01 | TC-08, TC-14 | Specified | Include only confirmed readable observations; denied/unknown tasks reveal no names/counts. Do not claim an incomplete observation is a complete current list. |
| UC-10 / EX-02 | TC-10 | Specified | Synthesis failure leaves operational state intact and permitted work available. |
| UC-11 / EX-01 | TC-18 | Specified | Failure to persist minimum audit record rolls back mutation; sink-only failure retains committed state and replayable record. |
| UC-11 / EX-02 | TC-18 | Specified | Missing mandatory run/evidence record stops protected handoff; optional metric failure is marked incomplete without fabricating measurements. |
| UC-12 / EX-01 | TC-10 | Specified | AI question during outage has explicit failure category, no generated answer, and healthy keyword/work access. |
| UC-12 / EX-02 | TC-10 | Specified | Either required embedding or generation dependency failing halts Q&A; surviving work/keyword dependencies are tested separately. |
| UC-12 / EX-03 | TC-14 | Specified | Simultaneous storage and AI outage report independent failures; no false claim that unavailable documents remain usable. |
| UC-13 / EX-01 | TC-11 | Specified | Out-of-scope audit request denies without another project's metadata. |
| UC-13 / EX-02 | TC-11 | Specified | Scoped audit identity/time is visible under ADR-0012; restricted title/content/before-after payload remains redacted without source-read. |
| UC-13 / EX-03 | TC-11 | Specified | IDs learned from audit/trace do not grant direct source/citation/AI access; trace-read alone does not inherit audit identity entitlement. |

## Handoff and gaps

Test author owns fixtures/assertions; implementer owns runnable handler/consumer-provider/UI tests; the owner validates remaining policies and post-pilot thresholds. No parallel or independent reviewer is claimed. [VERIFY-01](requirement-verification.md) supplies the FR/AC, alternate and NFR inventory; detailed UI/accessibility and runtime checks remain separate work. ADR-0013 resolves two former contract-policy gaps; the orphan cleanup protocol gap remains. Run all relevant gates, record exact results and retain failures before claiming application coverage.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.

## P09 measured subset — 28 October 2026

See [P09 result](reports/SP-01-P09-http-2026-10-28.md) for real sign-in/current-session, actor-forgery and expired/disabled denial tests. TC-01 remains Partial: logout/renewal/UI and browser semantics are unrun. TC-18 is measured only for the P09 session-created producer and its owning audit rollback, not every mutation or protected handoff. SC-06 project/document/citation disclosure is not passed by a session result. Earlier scenario rows remain their planned whole-case scope.

## Bounded P10 measured subset — 28 October 2026

[P10 result](reports/SP-01-P10-lifecycle-2026-10-28.md) measures AC-37 at the GET session boundary after confirmed DELETE, strict idle/absolute server expiry for AC-68, renewal/logout interleavings and TC-18 atomic lifecycle audit rollback. TC-01/18 remain Partial: live UI/browser semantics, all protected operations/producers and D-07 guarded content handoff are not passed. The AC-68 UI sign-in prompt remains P11. Historical P09 paragraphs describe their earlier measured scope. No whole FR/SC/release row is marked Passed.

## P11 measured UI subset — 28 October 2026

[P11 result](reports/SP-01-P11-ui-2026-10-28.md) records actual React DOM over Workspace/PostgreSQL via same-origin HTTPS: generic failed sign-in, confirmed session, workspace navigation, dependency denial, expired-session sign-in prompting/state removal, logout and reload-style revalidation. Controller tests separately cover stale results, uncertain mutation, malformed output and request timeout; the local-expiry DOM case uses controlled time. TC-22/AC-68 observations are bounded DOM/live-consumer evidence. Actual browser keyboard/reload/Secure-cookie semantics remain a separate certificate-dependent gate; TC-01/18, D-07 and complete feature/release acceptance remain open.

## P11 actual browser observations — 28 October 2026

After owner TLS handoff, the in-app browser demonstrated Enter-key login, authenticated reload, workspace navigation/cross-document Back, actual DB-expiry denial with sign-in prompting/state removal, and logout followed by unauthenticated reload. See P11 result v0.2. These add bounded AC-37/68 and TC-22 observations; other browsers, comprehensive accessibility/usability, all protected operations and D-07 remain open. Earlier browser-pending statements are execution snapshots, not current status.

## P12 integrated handoff — 28 October 2026

See [P12 result](reports/SP-01-P12-handoff-2026-10-28.md) for bounded integrated session/UI regression, owner local test feedback and screenshot evidence. AC-01/36/37/68 and applicable session producers/UI are mapped there; D-07, other protected features, full cross-browser/accessibility and deployment/formal ADR gates remain open. No new requirement or independent acceptance is inferred.

## SP-02 bounded coverage — 1 November 2026

AC-02/03/38/39 and BR-01/10/14 have actual Workspace project/member, audit/replay/removal/last-manager and UI failure observations linked in [verification](requirement-verification.md#sp-02-bounded-runtime-observation--1-november-2026) and [execution](reports/SP-02-execution-2026-10-31.md). TC-02/18/22/24 subsets are measured, not wholly Passed. SQL assignment/read-grant producer doubles are explicitly distinct from future SP-04/SP-06 handler evidence. No complete SC-06, Knowledge/citation/provider guard or independent acceptance.

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

## Selected Could verification design — 6 November 2026

FR/AC-66/67/31 and UC-05 Alt-2/3 remain Could and are source-aligned by C01, not runtime-verified. [FEAT-SP05-01](../implementation/features/sp-05-sprint-lifecycle/plan.md) owns fresh execution status; original Must evidence remains historical.

| Assertion / boundary | Planned TC and producer | Runtime evidence |
| --- | --- | --- |
| Independent sprint-edit / sprint-deallocate, no role/create/allocate implication; current membership/read/action, revoked/rejoined/unknown/cross-project scope, post-wait expiry and generic hidden404 | TC-13/18/19/22; C03/C04/C05 | Not run for Could |
| Planned-only partial edit: omitted values preserved; full merged strict date/goal validation; equal/reversed/invalid dates, null/extra fields, stale revision and Active/Completed reject; identical/revision-only no-op retains one acknowledgement without revision/change audit | TC-13/21; C04 | Not run for Could |
| todo/in_progress current allocation in Planned/Active returns To Do with numeric append, Backlog generation and allocation/Task/Sprint revisions; assignee/blockers/history preserved; audit binds source/prior state/location/result position and actor/operation/key/hash | TC-16/21; C05 | Not run for Could |
| Done is unchanged and returns task_already_done only after current access/Sprint revision/location; Completed/noncurrent association rejects; inaccessible Task never leaks Done status | TC-13/18/21; C05 | Not run for Could |
| Original 200 Sprint after later state/revision/location changes under renewed current rights; changed payload conflicts; new key for returned association conflicts; audit/receipt failure rolls back; lost COMMIT/response remains unknown and reconciles exact original identity without duplicate audit/mutation | TC-14/16/19/21; C04/C05/C06 | Not run for Could |
| Actual handler edit/start, remove/complete, remove/reorder, Done transition/removal and duplicate-key races preserve lock order, atomicity and history; no structural test substitutes for these | TC-07/14/21; C09 | Not run for Could |
| Existing 200 Sprint shapes, PATCH8192/media/extra-query negatives, empty DELETE/no-body/query/revision-header transport; durable recovery v2 preserves v1 identities and queued allocation; reload409 without automatic fresh key; accessible existing-design UI/HTTPS/Edge reconstructs current state separately from historical receipt | TC-13/19/21/22; C06/C07/C08/C10 | Not run for Could |

TC-21 Done removal exclusion preserves completed-work attribution and future Sprint metrics. C11 consolidates source-bound regression/trace and prepares independent review without self-approval. C02 tests additive012 forward/repeat/safe-empty-down and retained-data refusal separately; historical schema ceilings stay unchanged.

## Selected Could author runtime navigation — 6 November 2026

[FEAT-SP05-01](../implementation/features/sp-05-sprint-lifecycle/plan.md) and [SP05-COULD-RUNTIME-01](../implementation/features/sp-05-sprint-lifecycle/verification/could-runtime-result.md) now hold source-bound author results for the selected continuation. Earlier C01 Not-run rows describe the source-only checkpoint. They are not rewritten as passed historical execution. Independent review remains unexecuted.

| Trace | Actual assertion source | Evidence boundary |
| --- | --- | --- |
| AC-66 / UC-05 Alt-3 / TC-13/21 | sprint-could-http, fault, concurrency, security, controller, UI and browser tests | Planned partial validation/no-op/denials, immutable replay and atomic rollback, real edit/start ordering, post-wait expiry and HTTPS/Edge current refresh |
| AC-67 / UC-05 Alt-2 / TC-07/13/16/21 | sprint-could-http, fault, concurrency, security, UI and browser tests | todo/in_progress return; Done409 after scope/revision/location; Completed/current-location denial; numeric append/revisions/audit; assignee/blocker/history; exact DELETE recovery; both completion/Done/reallocate/reorder commit orders |
| AC-31 / TC-14/18/19/22 | sprint-could-storage, authority-storage, authority, fault and security tests | Private independent grants, no role inference, immutable receipts,012/013 safe reverse/refusal, private-audit isolation/boolean provenance, revoke/rejoin, unavailable authority, rollback and lost actual COMMIT |

The fresh final runner lists every current Workspace test path and actual footer, browser separately. Structural92 checks, build/typecheck/foundation/prototype are distinct from actual PG/HTTP/DOM/Edge behaviors; see the result for final actual status/counts and unrun independent/valuable-data/deployment gates. No prior347/57 result is reused as evidence for changed source.

## SP06 B01 provisioning trace — 7 November 2026

| Requirement / flow | Planned assertion / owner | Status |
| --- | --- | --- |
| AC-10 / UC-06 EX-02; supporting AC-31/39/59/68; BR-01/04/10/11/14 / SC-06 | TEST-08 v0.24.7 B01 table, TC-13/14/18/19/24; exact private issuance/current membership/CAS/audit rollback, runtime-role isolation, no role/read implication, removal/rejoin and014 rollback refusal; FEAT-SP06-01 P03-A/P04 | Specified; runtime Not run |

[SP-06 v0.6.4](../../specs/006-document-access.md) / Proposed ADR-0032 v0.1 define the selected B01 increment; no new FR/AC/operation. B02/B03 and all public document-handler evidence remain separate.
