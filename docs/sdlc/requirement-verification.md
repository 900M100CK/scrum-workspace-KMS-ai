# Functional and alternate-flow verification design

**Artifact ID:** VERIFY-01
**Version/date:** 0.1 Draft - 14 October 2026
**Inputs:** PRD-01 v0.5 including dated owner clarifications; UC-02 v0.3; TEST-08 v0.3; ADR-0007 through ADR-0013; release-scope v0.2.
**Status:** Analyst review of required observations; application execution Not run. No independent approval.
**Trace:** BR-01 through BR-15; SC-01 through SC-08 through TEST-COVERAGE-01.

## Interpretation

Each row identifies the matching numbered AC, producing/consuming UC and an observation needed beyond a requirement ID. TC gates are in [the test plan](test-plan.md). [The scenario/exception matrix](test-coverage.md) covers SC/BR and EX branches; this document adds FR/AC, alternates and NFR checks. `Defined` means a test can be designed from the stated rule, not that code exists or passes. `Gap` retains an unresolved implementation/input decision. Optional and outside-release rows remain visible; the authoritative release gate stays 60 Must in release-scope.json, regardless of P0/P1 labels here.

For every applicable mutation add authority denial, stale revision, replay, owning-state/audit atomicity and fresh-read assertions. For protected reads add current project/document scope and unknown/denied equivalence. These cross-cutting checks apply even when a row states only its distinctive observation. Real handler/consumer-provider/UI evidence is missing for every active row; existing storage/schema tests establish prerequisites only.

## FR and matching AC matrix

| FR / AC | UC | Gate | Distinctive observation and definition gap |
| --- | --- | --- | --- |
| FR-01 / AC-01 | UC-01; all protected UCs | TC-01 | Forge B in A's request; effective actor remains A in persisted state, evidence and audit. Defined. |
| FR-02 / AC-02 | UC-02 create | TC-13, TC-24 | Authorised creation persists stable project ID/name/creator; missing capability creates nothing. Defined. |
| FR-03 / AC-03 | UC-02; work UCs | TC-02 | Nonmember direct project/work reads match unknown IDs; membership change affects renewed reads. Defined. |
| FR-04 / AC-04 | UC-06 | TC-02 | Current member without restricted read grant receives neither content nor metadata. Defined. |
| FR-05 / AC-05 | UC-03 main | TC-13, TC-19 | Exercise Story, Task and Bug creation; invalid type and unauthorised actor leave no item. Defined. |
| FR-06 / AC-06 | UC-05 create | TC-13, TC-21 | Valid dates and goal create Planned Sprint; reversed dates fail before persistence. Defined. |
| FR-07 / AC-07 | UC-05 allocate / Alt-1 | TC-07, TC-21 | Each selected item has its own allocation result; conflicting item does not undo valid allocations; exclusive current allocation survives races. ADR-0014 specifies separate keyed allocateTask calls aggregated by UI; lost outcomes reconcile per task. |
| FR-08 / AC-08 | UC-05 start | TC-07, TC-21 | Planned starts with timestamp; Completed and second concurrent Active reject without state change. Defined. |
| FR-09 / AC-09 | UC-04 main / Alt-1 | TC-07, TC-16 | All directed moves among three states, another member refresh, stale conflict; reopen Completed-Sprint Done task into Backlog preserving completed history. Defined; physical history mapping pending. |
| FR-10 / AC-10 | UC-06 create | TC-13, TC-15, TC-20 | Text/Markdown decision has owner/labels/explicit classification and stable initial Current; missing classification rejects. Restricted author receives revocable grant. Orphan cleanup protocol gap retained. |
| FR-11 / AC-11 | UC-07 revise | TC-05 | Two revisions preserve old bytes/locators, atomically swap Current and label old citations Superseded. Defined. |
| FR-12 / AC-12 | UC-07; UC-09 citation | TC-05, TC-06 | Exact source view matches stored version and Current/Superseded/Archived status; historical label visible. Defined. |
| FR-13 / AC-13 | UC-07 archive | TC-06 | Archive Current and Superseded separately; ordinary discovery excludes them, permitted history still labels/opens retained content. Defined. |
| FR-14 / AC-14 | UC-06 revoke; UC-07 delete | TC-03, TC-04 | Commit revoke/delete before renewed protected boundary; source/search/citation/answer content is absent, including stale cache reuse. Defined. |
| FR-15 / AC-15 | UC-08 Alt-4 | TC-06, TC-20 | Pending/ready/failed readiness differs from Current validity; pending/failed never advertised searchable. Defined. |
| FR-16 / AC-16 | UC-08 create link | TC-13, TC-17 | Permitted endpoints show explicit relationship from both directions; AI suggestion alone persists nothing. Defined. |
| FR-17 / AC-17 | UC-08 Alt-3 | TC-02, TC-17 | Readable source with hidden target exposes no target metadata or hidden-link count; guessed read generic. Defined. |
| FR-18 / AC-18 | UC-08 keyword | TC-23 | Exact-term fixture includes permitted and restricted matches; only eligible Current results return. Defined. |
| FR-19 / AC-19 | UC-08/09 ordinary retrieval | TC-05, TC-23 | Both keyword and semantic candidates exclude Superseded/Archived; timestamps cannot confer authority. Defined. |
| FR-20 / AC-20 | UC-08/09 EX access failure | TC-14, TC-23 | Fail authority independently for keyword and semantic discovery; explicit failure, no protected result or unrestricted retry. Defined. |
| FR-21 / AC-21 | UC-09 main | TC-04, TC-09 | Capture actual provider input under mixed grants; only authorised evidence IDs/content cross submission boundary. Defined. |
| FR-22 / AC-22 | UC-09 Alt-6a | TC-09 | Invented ID/URL invalidates original draft; only a newly checked replacement may deliver, otherwise generic withholding. Defined by BA-D16. |
| FR-23 / AC-23 | UC-09 Alt-3a/4a | TC-09 | Empty and related-but-insufficient evidence yield insufficient evidence without invented rationale or hints about hidden sources. Defined. |
| FR-24 / AC-24 | UC-09 presentation | TC-09, TC-22 | Distinguish Fact, two-source Synthesis and Uncertain/Insufficient; required supporting citations visible. Defined. |
| FR-25 / AC-25 | UC-10 main / Alt-2 | TC-08 | Resolved current operation overrides stale blocked text with exact entity/revision/observation time. Defined. |
| FR-26 / AC-26 | UC-10 main | TC-02, TC-08 | Two-project operational fixture returns only readable entities/links and no hidden counts. Defined. |
| FR-27 / AC-27 | UC-13 Alt-1 | TC-11 | Optional bounded summary includes actual query/mode/ranks/permitted locators/observation/validation; absent steps Not performed. Defined if delivered. |
| FR-28 / AC-28 | UC-09 submission | TC-04 | Pause after retrieval, revoke then resume; revoked IDs/content never reach provider; authority failure stops submission. Defined. |
| FR-29 / AC-29 | UC-09 delivery; source reads | TC-04 | Revoke cited and uncited evidence before delivery; original draft never escapes, including replay. New attempt repeats checks. Defined. |
| FR-30 / AC-30 | UC-09 hostile evidence | TC-09 | Retrieved mutation/disclosure instruction causes no mutation attempt or protected disclosure; inspect adapter calls, not just answer text. Defined. |
| FR-31 / AC-31 | UC-11 business | TC-18 | Every catalogue operation has atomic durable minimum audit; failure rolls back, sink failure retains replayable event; failed writes never appear committed. Defined. |
| FR-32 / AC-32 | UC-11 answer | TC-18 | Successful and failed attempts correlate run, trace and exact provenance without treating correlation as correctness. Defined. |
| FR-33 / AC-33 | UC-12 main | TC-10 | For connection/timeout/budget failures, create/edit/board/start/complete/document read succeed independently and fresh reads confirm. Defined. |
| FR-34 / AC-34 | UC-12 keyword | TC-10, TC-23 | Each failed AI dependency leaves same permitted exact-term source findable/openable without calling that dependency. Defined. |
| FR-35 / AC-35 | No Core report UC | None | Enhanced/Wont; report definition unresolved and outside release. No invented report result or gate. |
| FR-36 / AC-36 | UC-01 sign-in | TC-01 | Valid selected identity outcome creates session; invalid outcome does not. Identity mechanism remains OD-09. |
| FR-37 / AC-37 | UC-01 sign-out | TC-01 | Old session is unusable after sign-out; repeated sign-out cannot renew it. Defined. |
| FR-38 / AC-38 | UC-02 add / Alt-1 | TC-03, TC-24 | New membership enables project-shared access, not restricted grant; re-add does not restore old grants. Defined. |
| FR-39 / AC-39 | UC-02 remove | TC-03, TC-14 | Removal denies project/work/document/search/citation and invalidates grants atomically; rejoin does not revive. Defined. |
| FR-40 / AC-40 | UC-03 Alt-1 | TC-07, TC-19 | Authorised edit visible after refresh; stale edit preserves newer content. Defined. |
| FR-41 / AC-41 | UC-03 Alt-2 | TC-07, TC-19 | Move third item before first; read relative order and unchanged content, with stale/replay checks. Defined. |
| FR-42 / AC-42 | UC-05 complete | TC-16, TC-21 | One atomic Completed/time plus unfinished return; Done association preserved, no implicit completion. Defined. |
| FR-43 / AC-43 | UC-04 assignee | TC-13, TC-19 | Current member and unassigned persist; nonmember rejected without changing prior assignee. Defined. |
| FR-44 / AC-44 | UC-04 blocker / Alt-2 | TC-08 | Actor/time/history persist; Open-Resolved and Resolved-Open give correct latest status; no Open plan mistaken for outcome. Defined. |
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
| FR-57 / AC-57 | UC-11 answer | TC-18 | Durable run/exact evidence precedes provider and answer handoffs; mandatory failure sends no protected bytes; optional metrics explicitly missing. Defined. |
| FR-58 / AC-58 | UC-13 trace | TC-11 | Scoped trace capability and separate source entitlement control fields; capability revocation denies; audit identity exception not inherited. Defined. |
| FR-59 / AC-59 | All protected read UCs | TC-02, TC-11, TC-22 | Compare missing/denied status/body/schema/UI; hidden title/ID/owner/version/snippet/count absent. Audit exception uses operation-specific scope. Defined. |
| FR-60 / AC-60 | UC-09 validation | TC-09 | Wrong document/version/passage rejected; original invalid-citation draft withheld, claim support checked separately. Defined. |
| FR-61 / AC-61 | UC-07 EX-04; UC-09 citation | TC-06 | Current entitled member receives verified unavailable locator only; unknown/revoked/audit-only caller generic; never substitute newer live passage. Defined; retained-policy/tombstone implementation pending. |
| FR-62 / AC-62 | UC-06 Alt-1 | TC-13, TC-20 | Optional English text/Markdown import preserves owner/classification; unsupported format fails without content. Encoding/size limits OD-06. |
| FR-63 / AC-63 | UC-08/09 results | TC-23 | Result title/identity/version/validity matches authoritative source; denied metadata absent. Defined. |
| FR-64 / AC-64 | UC-02 Alt-2 | TC-24 | Optional project name/description edit preserves project ID and memberships. Explicit optional UC branch now matches AC/contract. |
| FR-65 / AC-65 | UC-06 Alt-3 | TC-20 | Optional owner/label edit leaves immutable version content and citation locators unchanged. Defined. |
| FR-66 / AC-66 | UC-05 Alt-3 | TC-13, TC-21 | Optional Planned dates/goal edit persists valid values; invalid dates reject. Defined. |
| FR-67 / AC-67 | UC-05 Alt-2 | TC-21 | Optional removal returns item to Product Backlog without deletion or Done transition. Defined. |
| FR-68 / AC-68 | UC-01 EX-02 | TC-01, TC-22 | Expired session yields no protected result and asks sign-in; configurable duration remains OD-09. |
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
| UC-05 / Alt-2 | TC-21 | Optional removal returns item without deletion/completion. |
| UC-05 / Alt-3 | TC-13, TC-21 | Optional planned goal/dates edit validates before commit. |
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
