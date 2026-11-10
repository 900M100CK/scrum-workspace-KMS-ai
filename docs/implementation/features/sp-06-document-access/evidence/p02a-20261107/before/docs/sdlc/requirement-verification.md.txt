# Functional and alternate-flow verification design

**Artifact ID:** VERIFY-01
**Version/date:** 0.12.5 Draft · 6 November 2026
**Inputs:** Proposed ADR-0027 v0.2; PRD-01 v0.10.3; UC-02 v0.8.4; TEST-08 v0.24.6; ADR-0007 through ADR-0017; release-scope v0.2.; Proposed ADR-0028 v0.1; Proposed ADR-0031 v0.1
**Status:** Verification design with bounded SP-01 and SP-02 handler/DOM/browser evidence; complete application acceptance remains open. No independent approval.
**Trace:** BR-01 through BR-15; SC-01 through SC-08 through TEST-COVERAGE-01.

## Interpretation

Each row identifies the matching numbered AC, producing/consuming UC and an observation needed beyond a requirement ID. TC gates are in [the test plan](test-plan.md). [The scenario/exception matrix](test-coverage.md) covers SC/BR and EX branches; this document adds FR/AC, alternates and NFR checks. `Defined` means a test can be designed from the stated rule, not that code exists or passes. `Gap` retains an unresolved implementation/input decision. Optional and outside-release rows remain visible; the authoritative release gate stays 60 Must in release-scope.json, regardless of P0/P1 labels here.

For every applicable mutation add authority denial, stale revision, replay, owning-state/audit atomicity and fresh-read assertions. For protected reads add current project/document scope and unknown/denied equivalence. These cross-cutting checks apply even when a row states only its distinctive observation. Complete handler/consumer-provider/UI evidence remains missing; the bounded session subset below is now measured separately from storage/schema prerequisites.

## FR and matching AC matrix

| FR / AC | UC | Gate | Distinctive observation and definition gap |
| --- | --- | --- | --- |
| FR-01 / AC-01 | UC-01; all protected UCs | TC-01 | Forge B in A's request; effective actor remains A in persisted state, evidence and audit. Defined. |
| FR-02 / AC-02 | UC-02 create | TC-13, TC-24 | Authorised creation persists stable project ID/name/creator; missing capability creates nothing. Defined. |
| FR-03 / AC-03 | UC-02; work UCs | TC-02 | Nonmember direct project/work reads match unknown IDs; membership change affects renewed reads. Defined. |
| FR-04 / AC-04 | UC-06 | TC-02 | Current member without restricted read grant receives neither content nor metadata. Defined. |
| FR-05 / AC-05 | UC-03 main | TC-13, TC-19 | Exercise Story, Task and Bug creation; invalid type and unauthorised actor leave no item. Bounded real handler/DOM/Edge evidence is linked in the SP-03 execution trace; no whole-application acceptance. |
| FR-06 / AC-06 | UC-05 create | TC-13, TC-21 | Valid dates and goal create Planned Sprint; reversed dates fail before persistence. Defined. |
| FR-07 / AC-07 | UC-05 allocate / Alt-1 | TC-07, TC-21 | Each selected item has its own allocation result; conflicting item does not undo valid allocations; exclusive current allocation survives races. ADR-0014 specifies separate keyed allocateTask calls aggregated by UI; lost outcomes reconcile per task. |
| FR-08 / AC-08 | UC-05 start | TC-07, TC-21 | Planned starts with timestamp; Completed and second concurrent Active reject without state change. Defined. |
| FR-09 / AC-09 | UC-04 main / Alt-1 | TC-07, TC-16 | All directed moves among three states, another member refresh, stale conflict; reopen Completed-Sprint Done task into Backlog as To Do, including an In Progress request, preserving completed history. Defined; physical history mapping pending. |
| FR-10 / AC-10 | UC-06 create | TC-13, TC-15, TC-20 | Text/Markdown decision has owner/labels/explicit classification and stable initial Current; missing classification rejects. Restricted author receives revocable grant. Orphan cleanup protocol gap retained. |
| FR-11 / AC-11 | UC-07 revise | TC-05 | Two revisions preserve old bytes/locators, atomically swap Current and label old citations Superseded. Defined. |
| FR-12 / AC-12 | UC-07; UC-09 citation | TC-05, TC-06 | Exact source view matches stored version and Current/Superseded/Archived status; historical label visible. Defined. |
| FR-13 / AC-13 | UC-07 archive | TC-06 | Archive Current and Superseded separately; ordinary discovery excludes them, permitted history still labels/opens retained content. Defined. |
| FR-14 / AC-14 | UC-06 revoke; UC-07 delete | TC-03, TC-04 | Commit revoke/delete before renewed protected boundary; source/search/citation/answer content is absent, including stale cache reuse. Defined. |
| FR-15 / AC-15 | UC-08 Alt-4 | TC-06, TC-20 | Pending/ready/failed readiness differs from Current validity; pending/failed never advertised ready for semantic search; keyword availability is independent and checked through its own request against committed, permitted Current passages. Defined. |
| FR-16 / AC-16 | UC-08 create link | TC-13, TC-17 | Permitted endpoints show explicit relationship from both directions; AI suggestion alone persists nothing. Defined. |
| FR-17 / AC-17 | UC-08 Alt-3 | TC-02, TC-17 | Readable source with hidden target exposes no target metadata or hidden-link count; guessed read generic. Defined. |
| FR-18 / AC-18 | UC-08 keyword | TC-23 | Exact-term fixture includes permitted and restricted matches; only eligible Current results return. Defined. |
| FR-19 / AC-19 | UC-08/09 ordinary retrieval | TC-05, TC-23 | Both keyword and semantic candidates exclude Superseded/Archived; timestamps cannot confer authority. Defined. |
| FR-20 / AC-20 | UC-08/09 EX access failure | TC-14, TC-23 | Fail authority independently for keyword and semantic discovery; explicit failure, no protected result or unrestricted retry. Defined. |
| FR-21 / AC-21 | UC-09 main | TC-04, TC-09 | Capture actual provider input under mixed grants; only authorised evidence IDs/content cross submission boundary. Defined. |
| FR-22 / AC-22 | UC-09 Alt-6a | TC-09 | Invented ID/URL invalidates original draft; only a newly checked replacement may deliver, otherwise generic withholding. Defined by BA-D16. |
| FR-23 / AC-23 | UC-09 Alt-3a/4a | TC-09 | No supported components yield `insufficient_evidence`; some supported plus missing components yield `partially_answered` with cited support and `missing_components`, without hidden-source hints. Defined. |
| FR-24 / AC-24 | UC-09 presentation | TC-09, TC-22 | Distinguish Fact, two-source Synthesis and Uncertain/Insufficient; `partially_answered` visibly cites support and lists missing components. Defined. |
| FR-25 / AC-25 | UC-10 main / Alt-2 | TC-08 | Resolved current operation overrides stale blocked text with exact entity/revision/observation time. Defined. |
| FR-26 / AC-26 | UC-10 main | TC-02, TC-08 | Two-project operational fixture returns only readable entities/links and no hidden counts. Defined. |
| FR-27 / AC-27 | UC-13 Alt-1 | TC-11 | Optional bounded summary includes actual query/mode/ranks/permitted locators/observation/validation; absent steps Not performed. Defined if delivered. |
| FR-28 / AC-28 | UC-09 submission | TC-04, TC-26 | Pause after retrieval, revoke then resume; revoked IDs/content never reach provider; authority failure stops submission. Defined. |
| FR-29 / AC-29 | UC-09 delivery; source reads | TC-04, TC-26 | Revoke cited and uncited evidence before delivery; original draft never escapes, including replay. New attempt repeats checks. Defined. |
| FR-30 / AC-30 | UC-09 hostile evidence | TC-09 | Retrieved mutation/disclosure instruction causes no mutation attempt or protected disclosure; inspect adapter calls, not just answer text. Defined. |
| FR-31 / AC-31 | UC-11 business | TC-18 | Every catalogue operation has atomic durable minimum audit; failure rolls back, sink failure retains replayable event; failed writes never appear committed. Defined. |
| FR-32 / AC-32 | UC-11 answer | TC-18, TC-26 | Successful and failed attempts correlate run, trace and exact provenance without treating correlation as correctness. Defined. |
| FR-33 / AC-33 | UC-12 main | TC-10 | For connection/timeout/budget failures, create/edit/board/start/complete/document read succeed independently and fresh reads confirm. Defined. |
| FR-34 / AC-34 | UC-12 keyword | TC-10, TC-23 | Each failed AI dependency leaves same permitted exact-term source findable/openable without calling that dependency. Defined. |
| FR-35 / AC-35 | No Core report UC | None | Enhanced/Wont; report definition unresolved and outside release. No invented report result or gate. |
| FR-36 / AC-36 | UC-01 sign-in | TC-01 | Valid selected identity outcome creates session; invalid outcome does not. Pre-provisioned identity direction selected; bounded P09 handlers measured below, complete flow remains open. |
| FR-37 / AC-37 | UC-01 sign-out | TC-01 | Old session is unusable after sign-out; repeated sign-out cannot renew it. Defined. |
| FR-38 / AC-38 | UC-02 add / Alt-1 | TC-03, TC-24 | New membership enables project-shared access, not restricted grant; re-add restores no old individual capability, grant or assignment. Defined. |
| FR-39 / AC-39 | UC-02 remove | TC-03, TC-14 | Removal atomically invalidates every individually granted capability/read grant, clears current assignees, bumps task revisions and persists minimum audit; history survives, rejoin restores none, and last-manager removal rejects. Defined. |
| FR-40 / AC-40 | UC-03 Alt-1 | TC-07, TC-19 | Separate edit grant plus current membership/read and Backlog placement; create/creator/role implies no edit. Refresh shows edits; new stale write conflicts. Retain original200 including title/description with current read/action replay after later revisions; revoked replay denied. Specified, not executed. |
| FR-41 / AC-41 | UC-03 Alt-2 | TC-07, TC-19 | Move third item before first; read relative order and unchanged content, with stale/replay checks. Defined. |
| FR-42 / AC-42 | UC-05 complete | TC-16, TC-21 | One atomic Completed/time plus unfinished To Do return, task revisions and audit; Done association preserved; rollback and same-key replay verified. Defined. |
| FR-43 / AC-43 | UC-04 assignee | TC-13, TC-19 | Assignment grant plus enabled current same-project target or null; unknown/nonmember/foreign/disabled rejected uniformly after scope checks. Both removal-race orders clear assignees/revisions and preserve history; rejoin restores none. Current-authority original replay does not restore/revalidate historical target. Specified, not executed. |
| FR-44 / AC-44 | UC-04 blocker / Alt-2 | TC-08 | Exact blocker action; actor/time/sequence/history persist with Task revision per distinct event and atomic audit/original201; repeated-key appends once. Open/Resolved highest-sequence truth, no plan mistaken for outcome; event201 then authorised current Task/history refresh. Permanent original replay rechecks current read/action. Specified, not executed. |
| FR-45 / AC-45 | UC-07 withdrawn branch | None | Withdrawn under ADR-0009; immutable replacement assertions remain AC-11. |
| FR-46 / AC-46 | UC-09 open citation | TC-05, TC-06 | Exact permitted passage/document/version matches saved citation; no silent redirect to newer version. Defined. |
| FR-47 / AC-47 | UC-07 Alt-4 | TC-05, TC-23 | Explicit historical selection returns permitted historical labels; ordinary selection remains Current-only. Defined. |
| FR-48 / AC-48 | UC-07 Alt-3 | TC-04, TC-06 | Delete denies content/new support and stale indexing cannot revive; surviving identity follows ADR-0013 only. Defined. |
| FR-49 / AC-49 | UC-08 Alt-2 | TC-17 | Optional unlink disappears both directions; both resources and immutable evidence remain. Defined if delivered. |
| FR-50 / AC-50 | UC-06 Alt-2 | TC-03 | Shared-to-restricted denies ungranted member; restricted-to-shared enables only current members; manager capability required. Defined. |
| FR-51 / AC-51 | UC-06 grant | TC-03, TC-13 | Grant allows named document read/search/citation for current member without enabling another restricted document. Defined. |
| FR-52 / AC-52 | UC-06 revoke | TC-03, TC-04 | Revocation affects protected boundaries and repeated revocation never restores grant. Defined. |
| FR-53 / AC-53 | UC-09 retrieval | TC-12, TC-23 | Paraphrase lacking main query terms retrieves reference passage independently of generation; inaccessible candidates absent. Pilot fixture success is not superiority evidence. |
| FR-54 / AC-54 | UC-09 Alt-5a | TC-09 | Two disagreeing accessible passages retain both statements/versions without invented resolution. Defined. |
| FR-55 / AC-55 | UC-09 citation; UC-12 Alt-2 | TC-03, TC-04 | Reopen formerly permitted citation after revoke: no metadata/excerpt and generic 404, including cache. Defined. |
| FR-56 / AC-56 | UC-13 audit | TC-11 | In-scope audit identity allowed without source-read; protected fields redacted; other-project events absent; no content entitlement inferred. Defined. |
| FR-57 / AC-57 | UC-11 answer; UC-09 handoffs | TC-18, TC-26 | Complete immutable manifest durable outside guard; guarded exact evidence/revision/payload matching, zero-byte abort on mismatch, fresh per-handoff retry and no resume/replay after abort/restart. Prepared is not proof of delivery. Handler/storage evidence Not run. |
| FR-58 / AC-58 | UC-13 trace | TC-11 | Scoped trace capability and separate source entitlement control fields; capability revocation denies; audit identity exception not inherited. Defined. |
| FR-59 / AC-59 | All protected read UCs | TC-02, TC-11, TC-22 | Compare missing/denied status/body/schema/UI; hidden title/ID/owner/version/snippet/count absent. Audit exception uses operation-specific scope. Defined. |
| FR-60 / AC-60 | UC-09 validation | TC-09 | Wrong document/version/passage rejected; original invalid-citation draft withheld, claim support checked separately. Defined. |
| FR-61 / AC-61 | UC-07 EX-04; UC-09 citation | TC-06 | Current entitled member receives verified unavailable locator only; unknown/revoked/audit-only caller generic; never substitute newer live passage. Defined; retained-policy/tombstone implementation pending. |
| FR-62 / AC-62 | UC-06 Alt-1 | TC-13, TC-20 | Optional English text/Markdown import preserves owner/classification; unsupported format fails without content. Encoding/size limits OD-06. |
| FR-63 / AC-63 | UC-08/09 results | TC-23 | Result title/identity/version/validity matches authoritative source; denied metadata absent. Defined. |
| FR-64 / AC-64 | UC-02 Alt-2 | TC-24 | Optional project name/description edit preserves project ID and memberships. Explicit optional UC branch now matches AC/contract. |
| FR-65 / AC-65 | UC-06 Alt-3 | TC-20 | Optional owner/label edit leaves immutable version content and citation locators unchanged. Defined. |
| FR-66 / AC-66 | UC-05 Alt-3 | TC-13, TC-21 | Could: independent sprint-edit; Planned-only partial merge, strict dates/goal, stale/lifecycle denial, no-op acknowledgement and current-authority immutable original replay. C01 source-aligned; runtime Not run (C04/C07/C09/C10). |
| FR-67 / AC-67 | UC-05 Alt-2 | TC-21 | Could: independent sprint-deallocate; only current todo/in_progress in Planned/Active returns To Do with atomic numeric append/revisions/audit/receipt. Done 409 task_already_done after access/revision/location; Completed denied. C01 source-aligned; runtime Not run (C05/C08/C09/C10). |
| FR-68 / AC-68 | UC-01 EX-02 | TC-01, TC-22 | Expired session yields no protected result and asks sign-in; configurable starting limits selected. P09 server denial measured; UI prompt remains unrun. |
| FR-69 / AC-69 | UC-12 EX-01 | TC-10, TC-18 | Each required AI dependency failure category returns no generated answer with recorded run/error; healthy operations survive. Defined. |
| FR-70 / AC-70 | UC-08 Alt-5 | TC-25 | Owner-added Should: scoped title/description keyword search, independent of AI/Knowledge, with paging rechecks and no hidden counts. Defined by ADR-0016. |

## Alternate-flow inventory

Rows are branch-specific, not claims that the enclosing UC has passed. UC-01 external identity is conditional on the eventual selected mechanism. Optional release features remain conditional. Withdrawn UC-07 Alt-2 is retained only for trace continuity.

| UC / Alt | Gate | Observable result / gap |
| --- | --- | --- |
| UC-01 / Alt-1 | TC-01 | If external identity is selected, verified provider identity creates the server session; failed verification does not. OD-09 remains open. |
| UC-02 / Alt-1 | TC-03, TC-24 | Re-add creates fresh membership, restores shared access but no former restricted grants. |
| UC-02 / Alt-2 | TC-24 | Optional name/description edit preserves project identity/memberships; denied/stale writes do not persist. |
| UC-03 / Alt-1 | TC-07, TC-19 | Content edit visible on refresh, stale write rejected, audit durable. |
| UC-03 / Alt-2 | TC-07, TC-19 | Reorder changes relative ordering only, with audit and refresh. |
| UC-04 / Alt-1 | TC-16 | Direct state moves; reopening completed-Sprint task preserves history and returns to Backlog. |
| UC-04 / Alt-2 | TC-08 | Resolved without earlier Open persists as history and leaves Not Blocked. |
| UC-05 / Alt-1 | TC-07, TC-21 | Owner confirmed multiple selected tasks with per-task partial results. Successful tasks remain; conflicting tasks do not change. ADR-0014 uses per-task keys and same-payload replay; uncertain outcomes stay unconfirmed. |
| UC-05 / Alt-2 | TC-21 | Could unfinished-only removal as above; Done/Completed denial protects completed-work attribution and future Sprint metrics. Runtime Not run. |
| UC-05 / Alt-3 | TC-13, TC-21 | Could independent sprint-edit and Planned-only partial validation/no-op/replay as above. Runtime Not run. |
| UC-06 / Alt-1 | TC-13, TC-20 | Optional supported import follows the same Workspace-first policy and immutable creation flow. |
| UC-06 / Alt-2 | TC-03 | Reclassification requires manage-access and affects renewed protected reads. |
| UC-06 / Alt-3 | TC-20 | Optional metadata edit preserves evidence bytes/locators. |
| UC-07 / Alt-1 | TC-05 | Archived-document revision rejected without replacement; error details respect current access. |
| UC-07 / Alt-2 | None | Withdrawn no-Draft publication branch. |
| UC-07 / Alt-3 | TC-04, TC-06 | Delete removes active content access and blocks stale revival; identity-only exception requires current retained-policy read. |
| UC-07 / Alt-4 | TC-23 | Historical selection explicit and labelled. |
| UC-08 / Alt-1 | TC-23 | Zero permitted matches is successful empty set with no hidden-match count. |
| UC-08 / Alt-2 | TC-17 | Optional unlink preserves both resources. |
| UC-08 / Alt-3 | TC-02, TC-17 | Restricted target and hidden-link count omitted. |
| UC-08 / Alt-4 | TC-20 | Readiness pending/ready/failed accurately shown. |
| UC-08 / Alt-5 | TC-25 | Optional Workspace task keyword search: scoped results, blank query rejection, independent failure, fresh membership on every page. |
| UC-09 / Alt-3a | TC-09 | No permitted passage: insufficient evidence and no generation call. |
| UC-09 / Alt-5a | TC-09 | Unresolved conflict retains both supported statements with their versions. |
| UC-09 / Alt-4a | TC-04, TC-09 | All candidates revoked before submission: no provider call, insufficient evidence without source hints. |
| UC-09 / Alt-6a | TC-09 | Invented citation withholds original draft; only fully rechecked replacement can deliver, otherwise generic failure. |
| UC-10 / Alt-1 | TC-08 | No blocked tasks returns successful empty list only after complete scoped observations. |
| UC-10 / Alt-2 | TC-08 | Current Resolved operational event overrides stale blocked text with observation identity/time. |
| UC-11 / Alt-1 | TC-18 | Failed business write produces no committed-change event. |
| UC-12 / Alt-1 | TC-10 | AI question during outage follows explicit category failure with no generated answer. |
| UC-12 / Alt-2 | TC-04, TC-10 | Exact permitted citation opens from healthy storage during AI outage; still guarded. |
| UC-13 / Alt-1 | TC-11 | Optional bounded summary applies field/source permissions and labels missing steps. |

## Nonfunctional evidence

| NFR | Gate / required evidence | Unresolved input |
| --- | --- | --- |
| NFR-01 | TC-22: each loading/empty/conflict/sign-in/AI failure/denied state, including keyboard and focus feedback | Supported browsers/accessibility target OD-06 |
| NFR-02 | TC-07: race real edits, inspect persisted winner and rejected stale response | Handler execution |
| NFR-03 | TC-06/10/14: timeout, duplicate/out-of-order work and unknown commit outcomes with no invented result | Numeric bounds and orphan cancellation/fencing protocol |
| NFR-04 | TC-19/22: disconnect, commit through another client, reconnect and compare authoritative state | Transport implementation |
| NFR-05 | TC-11/18: inspect stored synthetic logs/traces, secrets/private reasoning absent, protected fields scoped | Retention OD-08 |
| NFR-06 | Inventory actual data sent to embedding/generation/tracing and provider retention/access before real-data use | Provider selection and transfer policy; no assumed local-only pipeline |
| NFR-07 | TC-12: independent retrieval/citation/support scores, exact eligible denominators and multi-source checks on frozen cases | Pilot and final thresholds; no measured results |
| NFR-08 | TC-12: record corpus/hardware/provider/load and median/p95/capacity observations | Pilot performance targets |
| NFR-09 | TC-12/23: matched keyword/semantic cases, corpus and access; manual/helper baseline before time-saving claim | Controlled experiment and measurements |

## Findings and handoff

The old gates named retrieval broadly but lacked explicit exact-term, paraphrase and result-metadata assertions; TC-23 now supplies them. TC-24 makes positive project creation/membership and optional project edit visible instead of relying only on denial tests. FR-64 now has UC-02 Alt-2 under its existing optional scope. Multi-selection is explicitly owner-confirmed; ADR-0014 describes per-task transport/retry semantics without a new bulk endpoint. Source-policy/tombstone, reopening-history mapping, orphan cleanup, identity/provider choices and measured evaluation remain recorded implementation/input gaps.

This completes an explicit inventory against the current FR/AC rows and named alternate branches, not proof that every AC is implemented or that every business rule is unambiguous. Further consistency findings must amend the source and this matrix together. Test authors should split compound observations into runnable cases, attach actual evidence and preserve failures.

## NEXT-04 recovery and citation assertions

TC-08: an operational citation opens by entity kind/ID, observation revision/time; a fresh authorised entity read is labelled current and cannot substitute for the historical observation. Change a blocker after answer generation and verify both labels, generic denial after membership loss and no fabricated document locator/snapshot.

TC-10/22: after terminal provider failure the editor permits deliberate new request; a recovered successful request clears stale failure presentation. A lost response is unknown, never automatic same-handoff replay or fresh-identity resend; explicit new user intent still cannot bypass server quarantine. Healthy keyword/work paths remain available according to their own dependencies. TC-20: failed/pending semantic indexing with committed permitted Current passages still permits a successful keyword request. No runtime result is claimed.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.

## Bounded P09 application evidence — 28 October 2026

[P09 result](reports/SP-01-P09-http-2026-10-28.md) records actual POST/GET handlers, owned PostgreSQL and trusted HTTPS. AC-01 is measured for cookie-bound actor despite forged client selectors; AC-36 for valid versus wrong/unknown/disabled auth and failed audit; AC-68 for server rejection of expired state. These are scoped observations, not full-case/FR acceptance. Logout/renewal/UI (including the AC-68 prompt), project/document scope, cross-service guards and deployment calibration remain unrun. No whole release row is marked Passed.

## Bounded P10 measured subset — 28 October 2026

[P10 result](reports/SP-01-P10-lifecycle-2026-10-28.md) measures AC-37 at the GET session boundary after confirmed DELETE, strict idle/absolute server expiry for AC-68, renewal/logout interleavings and TC-18 atomic lifecycle audit rollback. TC-01/18 remain Partial: live UI/browser semantics, all protected operations/producers and D-07 guarded content handoff are not passed. The AC-68 UI sign-in prompt remains P11. Historical P09 paragraphs describe their earlier measured scope. No whole FR/SC/release row is marked Passed.

## P11 measured UI subset — 28 October 2026

[P11 result](reports/SP-01-P11-ui-2026-10-28.md) records actual React DOM over Workspace/PostgreSQL via same-origin HTTPS: generic failed sign-in, confirmed session, workspace navigation, dependency denial, expired-session sign-in prompting/state removal, logout and reload-style revalidation. Controller tests separately cover stale results, uncertain mutation, malformed output and request timeout; the local-expiry DOM case uses controlled time. TC-22/AC-68 observations are bounded DOM/live-consumer evidence. Actual browser keyboard/reload/Secure-cookie semantics remain a separate certificate-dependent gate; TC-01/18, D-07 and complete feature/release acceptance remain open.

## P11 actual browser observations — 28 October 2026

After owner TLS handoff, the in-app browser demonstrated Enter-key login, authenticated reload, workspace navigation/cross-document Back, actual DB-expiry denial with sign-in prompting/state removal, and logout followed by unauthenticated reload. See P11 result v0.2. These add bounded AC-37/68 and TC-22 observations; other browsers, comprehensive accessibility/usability, all protected operations and D-07 remain open. Earlier browser-pending statements are execution snapshots, not current status.

## P12 integrated handoff — 28 October 2026

See [P12 result](reports/SP-01-P12-handoff-2026-10-28.md) for bounded integrated session/UI regression, owner local test feedback and screenshot evidence. AC-01/36/37/68 and applicable session producers/UI are mapped there; D-07, other protected features, full cross-browser/accessibility and deployment/formal ADR gates remain open. No new requirement or independent acceptance is inferred.

## SP-02 bounded runtime observation — 1 November 2026

| Requirement | Measured observation and source | Remaining boundary |
| --- | --- | --- |
| AC-02 | Explicit global create authority, persisted server creator/time, initial manager grant, same-key exact replay, changed-payload conflict, audit/outcome rollback, lost actual COMMIT acknowledgement; project-http/project-authority suites | No optional editProject or development deployment |
| AC-03 | Only current-member project directory/direct reads, identical nonmember/unknown 404, current membership generation, foreign/stale/tampered cursor and relogin semantics; project-reads/cursor suites | Work/document reads remain future handler checks |
| AC-38 | Known-account add/rejoin, descriptive roles grant no capabilities, minimal IDs/roles/revisions, original snapshot replay and no grant revival; membership-lifecycle suite | Future delegation beyond private explicit provisioning remains open |
| AC-39 | Atomic membership/grant/read invalidation and current assignment clearing with task revisions/audit; last effective manager, concurrent removals, stale rejoin precondition, preserved state/history/other project; removal/concurrency suites | Actual SP-04/SP-06 producers must repeat SP02-F01 races; current SQL doubles labelled |

UI/controller/actual HTTPS and isolated Edge evidence covers fresh current views, original-key unknown-result recovery across reload, keyboard confirmation, mobile overflow, permission removal clearing, real secure-cookie login/logout. [Execution report](reports/SP-02-execution-2026-10-31.md) contains exact commands, failures and limits. These are bounded observations, not whole TC/SC-06/D-07 or independent acceptance.

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
