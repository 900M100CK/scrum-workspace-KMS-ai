# Scenario and exception verification matrix

**Artifact ID:** TEST-COVERAGE-01
**Version/date:** 0.4 Draft · 25 October 2026
**Inputs:** PRD-01 v0.9; UC-02 v0.8; TEST-08 v0.21; ADR-0007–ADR-0017.
**Status:** Planned assertions, not executed application coverage or independent approval.

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
| SC-06 | Cross-project, no-grant, revoked-author, removed/rejoined member and direct citation attempts deny protected content; scoped audit identity follows ADR-0012 without granting content access | TC-02–TC-04, TC-11, TC-15, TC-26 | Storage scope prerequisites tested; handlers not run |
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
| UC-03 / EX-03 | TC-07 | Specified | Stale edit conflicts and preserves newer content/revision. |
| UC-04 / EX-01 | TC-07 | Specified | Stale board move conflicts and preserves committed state. |
| UC-04 / EX-02 | TC-13 | Specified | Nonmember assignee fails and leaves previous assignee intact. |
| UC-04 / EX-03 | TC-14 | Specified | State/event transaction failure leaves no partial mutation/audit; unknown response is reconciled before retry. |
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
