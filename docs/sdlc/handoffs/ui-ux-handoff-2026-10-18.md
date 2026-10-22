# Bounded UI/UX design handoff

**Artifact ID:** UX-HANDOFF-01  
**Version/date:** 0.8 Draft · 18 October 2026  
**Status:** Author handoff for wireframe drafting with explicit gaps; not approval or application acceptance.  
**Inputs:** PRD-01 v0.9; UC-02 v0.7; SAD-03 v0.15 / SAD-03-ENTRY v0.14; DATA-04 v0.11; API-05 v0.16; UX-06 v0.12; TEST-08 v0.20; SPEC-REVIEW-01 v0.29; Workspace OpenAPI v0.2.8 / Knowledge v0.2.9; logical model v0.7; Proposed ADR-0018–ADR-0022.  ; Proposed ADR-0023
**Trace:** BR-01–BR-14; SC-01–SC-08; original 60 Must requirements retained. FR-27 summary and FR-70 task search remain Should.

## Completed author tasks

The [correction queue](remediation-priorities-2026-10-18.md) is the task authority. Ticks there mean delivered design and the stated checks, never a running feature. Earlier isolated SQL results are separate from the checks performed for this handoff.

| Task | Delivered output | Remaining acceptance |
| --- | --- | --- |
| NEXT-00 | Ordered checklist and closure conditions | Update during future implementation |
| NEXT-01/02 · SYS-01 | Complete immutable manifest, exact payload/mixed evidence, durable receipt and one-use claim design; reconciled specs/sequence/tests | Storage prerequisites supplied; real current-authority/guard/transport, crash/revocation/replay and zero-byte-abort tests before AI relay |
| NEXT-03 · SYS-03/04 | Promised query/step/ranked-source evidence and measured/unavailable/not_performed metrics | Capture, storage, current disclosure filtering and inspection handlers |
| NEXT-04 · UX-R03/04/05 | Separate citation inspectors, deliberate recovery and semantic-readiness terminology | Rendered UI and live permission/failure tests |
| NEXT-05 · SYS-05/UX-R06 | Descriptive target role versus caller authority, citation identity and current source/route inventories | Full usability/readability and independent review |
| NEXT-06 | Opaque action-bound concurrency and minimal acknowledgements for non-reading document commands | Token storage/cleanup, command atomicity, idempotency, revocation and HTTP adapters |
| NEXT-07 | Targeted final design audit, current-reference regression, executable component-schema examples and this bounded handoff | Full OpenAPI conformance, application and owner acceptance remain distinct |

Priority 1's persisted current-location/Backlog design and Workspace migration 003 are supplied; Workspace migration 003 is not claimed applied to the development database. Priority 2's six discovery reads and P2-R01/02/03 corrections are supplied. SYS-02 fresh-client correctness still needs handlers; supplied read contracts are not operational evidence.

## Screen-to-contract bindings for wireframes

Use the [sitemap](../../ux/sitemap.md), [permission matrix](../../ux/permission-matrix.md) and [UX entry](../ui-ux-spec.md) as canonical UI sources. Browser routes are draft navigation, not additional HTTP endpoints. All selections and allowed actions are renewed under current server authority.

| Screen/journey | Contract operations | Required design states and limits |
| --- | --- | --- |
| Projects/membership | getSession, listProjects, getProject, listMembers, getAllowedActions | No global user directory or role editor. AddMember.role describes the target membership; it does not delegate capability. Unknown/inaccessible resources share generic failure. |
| Backlog/Sprint/Board/task | listTasks, listSprints, listSprintItems, getSprint, getTask, listBlockerEvents | Restore task location independently of retained Sprint history. Reorder only after collecting every Backlog page with one backlog_revision; stale data requires refresh/reconsideration. Preserve ordered blocker history and completed-Sprint history. |
| Documents/version history | listDocuments, getDocument, listVersions, getVersion, getReadiness | Only readable documents/versions appear. Current/Superseded/Archived labels are distinct from semantic readiness. Pending/failed semantic processing does not itself decide keyword availability. |
| Known-ID access management | getDocumentPolicy, listDocumentReadGrants, getAllowedActions | Independent of content-read. No title, content, history or current-version prefill without read authority. No invented resource-discovery list for non-read managers. |
| Known-ID independent document actions | getAllowedActions, getDocumentCommandPrecondition, reviseDocument, archiveVersion, deleteDocument, editDocumentMetadata | Obtain a token for one selected action; archive uses an already-known exact version. Send exactly one revision/token selector. Success uses a minimal receipt or delete 204. Conflict requires reconsideration; unknown outcome preserves the original operation identity. |
| Keyword/AI search | keywordSearch, askQuestion; optional searchTasks | Work and keyword fallback remain usable during AI outage when their dependencies are healthy. A stale health badge cannot permanently disable deliberate retry. Lost answer delivery is unknown, never an automatic resend. No request-status API is invented. |
| Document citation | openCitation, getVersion | Exact document/version/passage; renewed current access; no silent replacement. Distinguish verified unavailable identity from generic inaccessible/unknown target. |
| Operational citation | getProject, getSprint, getTask | Show the delivered observation identity/time/revision separately from freshly fetched current state. No fabricated document locator or historical snapshot endpoint. |
| Audit/trace/optional summary | listAudit, getTrace, getRetrievalSummary | Scoped audit/trace entitlements stay separate from an answer reader's optional summary. Show only permitted query/steps/ranked exact sources. Zero is measured zero; unavailable is Not measured; unexecuted is Not performed. No private reasoning or raw provider payloads. |

## Historical NEXT-07 verification boundary

This pass uses Node 24.19.0. Reproduction commands are `npm ci`, `npm run context:lint`, `npm run context:check`, `npm run context:test`, `npm run docs:lint`, `npm run docs:test`, and `npm run contracts:test`. The first context commands remain dependency-free. Schema tests add development-only Ajv 8.20.0 / ajv-formats 3.0.1, without choosing an application framework or provider.

The linked-input guard checks current local header aliases against target versions and preserves labelled historical snapshots. Schema examples evaluate actual oneOf/allOf/if constraints with no coercion, defaults or property stripping. OpenAPI annotations are tolerated; this is not full OpenAPI meta-schema validation. A valid shape cannot prove authority, byte/digest equality, full evidence capture, durable commit, complete Backlog permutation or factual claim support.

Final executed counts and failures/rechecks are recorded in the queue's NEXT-07 evidence section. The previously inspected four changed diagram exports covered overview routing only; wide/long routes and print-scale readability remain open. Header propagation after those exports does not establish a fresh visual review.

Not run in this pass: application handlers, consumer/provider compatibility, live permission/revocation/concurrency, database migration/application or storage rerun, provider/evaluation, rendered wireframes, keyboard/accessibility/usability tests, full API/UI workbook certification or independent acceptance. No commit/deployment, accepted ADR edit or new product scope.

## Next implementation and owner gates

1. Draft low-fidelity Core work/document/search/citation/inspection states against these bindings. Mark unavailable/denied/empty/loading/conflict/unknown-outcome states explicitly; avoid visual authority claims. Choose visual tokens/viewports and test usability before freezing UI.
2. Select and test application framework/auth/session mechanics under the existing decision process. Implement the first operational slice and run actual fresh-client, stale-page, reorder, blocker and Completed-Sprint reopening scenarios. Follow the storage runbook before applying migration 003.
3. Implement document token/receipt storage and handlers with same-key replay, current action authority, token invalidation and atomic rollback tests. Do not grant content-read as a shortcut.
4. Bind the tested manifest/claim SQL to real handlers and implement/test active-process fencing, guard and configured relay adapters before enabling AI transport. SYS-01 remains blocking until its real boundary evidence exists; a UI mock cannot close it.
5. Retain open owner decisions on additional delegation, identity/provisioning, retention and provider/deployment details. Existing read/write/manage distinctions remain binding while drafting proceeds; do not invent delegation or cut Must scope.

Checklist: Pass for bounded source/operation handoff and supplied author corrections; Gap for the runtime, visual and owner gates above. Handoff: Ready for downstream wireframe drafting with these limits. No self-approval or production-readiness claim.

## Supplemental NEXT-08 verification

After the original handoff checkpoint, local checks were extended to the full OpenAPI document structure and every inline HTTP Schema Object, with calibration negatives and pinned upstream provenance. The raw dynamic-reference validator was unsuitable without specialization and its false failures are not project defects. The final task evidence is recorded in the queue. Full OpenAPI semantic conformance, document-level formats, external dialect overrides and every runtime/visual gate above remain open. Account monitoring subsequently observed 87% used / 13% remaining; this is still above the requested 5% threshold.

## NEXT-09 detailed checklist companion

[UX-CHECK-01](../reviews/ui-ux-checklist-review-2026-10-18.md) disposes every pinned UI/UX and Blueprint workbook item and walks SC-01–08. It records the corrected original-observation-unavailable state after operational inspector reload/direct navigation and retains all visual/research/runtime gaps. No new API or saved-answer feature follows. Use its per-row gaps when drafting wireframes.

## NEXT-10 routing and declaration guard

The context harness now rejects ambiguous/equivalent route templates, invalid effective path selectors and weakened authentication alternatives before UI consumers rely on those drafts. API-V10-01 was a reproduced verifier gap on mutated copies; current API declarations required no change. Runtime HTTP session/actor/service enforcement remains unimplemented and is still a separate gate.

## NEXT-11 byte-binding reference

[HANDOFF-REF-01](../references/handoff-byte-reference-2026-10-18.md) adds local protocol evidence without changing any UI/API surface or enabling AI. It checks bytes and source mappings against synthetic inputs; real store/current-authority/claim/guard/provider/transport tests remain gates. This does not change the bounded wireframe handoff or make the operational paths implemented.

## NEXT-12 storage prerequisite

Knowledge 003 / Workspace 004 now have isolated SQL evidence for immutable preparation/outcomes and permanent claim storage. No development migration or application API was added; the Core UI and AI-relay runtime gates remain as above. Source-level handler/guard/provider/active-process evidence is still required.

## NEXT-13 receipt projection

[HANDOFF-SQL-01](../references/handoff-sql-projection-2026-10-18.md) adds seven optional storage/serialization integration results behind the existing internal contract. No UI route, public operation, permission, provider or application handler changes; AI relay and real UI acceptance remain gated.

## NEXT-14 wireframe work brief

[UX-PLAN-01](../../ux/wireframe-workplan.md) supplies ordered Core wireframe tasks and concrete Backlog/document-command state variants, retaining exact source/authority/failure distinctions. It addresses planning and textual state detail only; no WF frame, UI framework, viewports, measurements or usability/permission gate is completed.
