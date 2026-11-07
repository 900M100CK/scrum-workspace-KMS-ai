# Selected Could runtime verification

**Artifact ID:** SP05-COULD-RUNTIME-01\
**Version/date:** 0.2 Draft · 7 November 2026\
**Status:** Author gates passed at their frozen source; bounded independent static/checks handback and owner acceptance received7 November. Independent PostgreSQL/Edge unexecuted in that handback.
**Parent:** [FEAT-SP05-01](../plan.md), SP-05.1–05.4 / PLAN-01 Month 2 / M-03.\
**Trace:** FR/AC-66/67/31; UC-05 Alt-2/3; BR-01/02/03/10/11/14; SC-03/04/06; TC-07/13/14/16/18/19/21/22.

## Behavior and enforcement

Independent privately provisioned sprint-edit/sprint-deallocate gate Planned partial goal/date editing and current todo/in_progress removal in Planned/Active. Both existing operations retain200 Sprint and Could priority. No-op edits acknowledge without revision/change audit; actual edits and returns co-commit state, minimum audit and permanent original typed receipt. Done409 task_already_done follows current access/Sprint revision/current-location checks; Completed rejects. Return resets To Do, numeric-appends after MAX(position), advances allocation/Task/Sprint revisions and Backlog generation, and preserves assignee/blockers/completed history.

The owning Workspace transaction checks current server session, membership, scope and action before original-result lookup. Removal locks/checks current Task read before replay; the original lookup precedes live lifecycle/revision/location restrictions. Project → Sprint → Task ordering and guard checks after waits prevent stale writes. Same actor/operation/key/hash recovers the immutable original; changed payload conflicts. Unknown COMMIT/response remains unknown and uses the same exact request. Recovery v2 persists known method/body/key and DELETE Sprint revision header before wire, migrates valid v1 identities unchanged, blocks new mutations while unknown and clears both versions on signout. Current UI state is fetched separately from a historical receipt.

Additive012 extends existing private actions/typed receipt constraints. Additive013 is required for current Could runtime: an owner-defined exact boolean provenance function with fixed pg_catalog search_path and PUBLIC execute revoked, runtime execute only. It requires matching grant and immutable private issuance audit; runtime still cannot SELECT that private audit. This avoids exposing audit contents or dropping provenance validation. Missing required authority/storage fails closed. Historical001–011 and already-tested012 are unchanged. The [Proposed ADR-0031](../../../../adr/0031-sprint-could-edit-and-removal.md) records mechanics and tradeoffs without accepted ADR adoption. No provider/Knowledge call or runtime AI mutation is involved.

## Evidence and reproduction

Fresh staged [raw evidence](../evidence/could-runtime-20261106/) retains each actual argv/exit/log and runtime source hash, including failed attempts. Fresh could-final-workspace/browser/checks directories contain the final runner's full source manifest, environment, exact test paths, raw output, result footer and cleanup record. [run-could-runtime.mjs](run-could-runtime.mjs) is the current reproduction entry; the published122-input V01 runner/evidence remains historical and untouched. The final consolidated result table is appended after observed completion. Node v24.22.1, PostgreSQL17.10 with pinned pgvector image, installed isolated Edge156.0.4314.58, existing trusted localhost HTTPS; no TLS bypass or personal browser profile. Browser captures include desktop/mobile and zero observed page errors.

## Retained failures and corrections

- C02 test initially named entity_ref instead of existing business_audit.entity_id; corrected synthetic fixture and reran unchanged storage assertions.
- Direct-store/operator tests initially examined the wrapping SessionStoreUnavailable rather than its mapped/cause error; assertions were corrected at the existing interface boundary and rerun.
- C05 runtime exposed C01's missing task_already_done Error enum member; serializer correctly withheld the undeclared response as503. Workspace0.2.16 adds the selected code; actual Done409 tests then pass. Original C01 evidence remains historical.
- C09 direct runtime audit JOIN was denied; an automatic approval review rejected removing provenance enforcement as a security weakening. The rejected removal was not executed. Companion013 preserves the same provenance predicate behind a boolean-only owner function, with private audit SELECT still denied. Storage/security/race suites re-execute against explicit013.
- Native date controls have multiple keyboard segments; the browser assertion now verifies bounded Tab reachability and Enter activation. A related stale custom end-date validation error is cleared when start changes, with a real Edge assertion.

No expected business result, scope check or mandatory gate was waived to make a run pass. Old347/57 records are not relabelled as final changed-source execution.

## Acceptance map and remaining boundary

AC-66: sprint-could-http/fault verify partial merge/no-op/denial/immutable original after later lifecycle and rollback/lost COMMIT; controller/UI/browser verify exact PATCH and accessible current refresh; concurrency/security verify both edit/start orders, revoke and actual post-wait expiry.

AC-67: HTTP/fault verify unfinished Planned/Active numeric return, Done/stale/location/Completed/transport negatives, revisions/audit, preserved assignee and original replay; security verifies blockers/unknown provenance; concurrency verifies both remove/complete/Done/reallocate/reorder orders; UI/Edge verify Done-after-display, Returned history and exact bodyless DELETE reload.

AC-31: dedicated012/013 storage, authority, fault/security tests verify immutability, empty reverse/reapply/repeat, retained-data reverse refusal, independent audited grants, revoked/rejoined rights, unavailable authority, audit/receipt rollback and original recovery. Full current Workspace regression and separate browsers retain their own exact file lists and source manifests.

Independent review is prepared in [SP05-COULD-REVIEW-01](could-review-assignment.md), not dispatched or executed. No valuable-data migration/rollback, production deployment, capacity benchmark, CI/publication, commit/push/merge, M03 or release acceptance is claimed. These are bounded author assertions, not proof of universal security or independent acceptance.

## Final observed results — 6 November 2026

All selected C02–C11 author implementation and verification tasks have their required evidence. This is ready for independent review, not independent, milestone or release acceptance.

| Actual gate | Result | Evidence |
| --- | --- | --- |
| workspace | 379/379; skipped 0 | [raw output](../evidence/could-final-workspace-20261106T034059603Z/workspace.txt) |
| typecheck | exit 0 | [raw output](../evidence/could-final-checks-20261106T035517720Z/typecheck.txt) |
| build | exit 0 | [raw output](../evidence/could-final-checks-20261106T035517720Z/build.txt) |
| test-foundation | 19/19; skipped 0 | [raw output](../evidence/could-final-checks-20261106T035517720Z/test-foundation.txt) |
| test-prototype | 20/20; skipped 0 | [raw output](../evidence/could-final-checks-20261106T035517720Z/test-prototype.txt) |
| context-lint | exit 0 | [raw output](../evidence/could-final-checks-20261106T035517720Z/context-lint.txt) |
| context-check | exit 0 | [raw output](../evidence/could-final-checks-20261106T035517720Z/context-check.txt) |
| docs-lint | exit 0 | [raw output](../evidence/could-final-checks-20261106T035517720Z/docs-lint.txt) |
| structural | 92/92; skipped 0 | [raw output](../evidence/could-final-checks-20261106T035517720Z/structural.txt) |
| metadata | exit 0 | [raw output](../evidence/could-final-checks-20261106T035517720Z/metadata.txt) |
| diff-check | exit 0 | [raw output](../evidence/could-final-checks-20261106T035517720Z/diff-check.txt) |
| browser | 5/5; skipped 0 | [raw output](../evidence/could-final-browser-20261106T035716055Z/browser.txt) |

The Workspace row is379 tests across48 explicitly enumerated non-browser files, including real PG/HTTP/HTTPS DOM, controller and preparation assertions; it is not a claim of379 independent handler behaviors. The separate browser row executes all five current browser files. Final foundation aggregates all three package footers19/19, including the actual opt-in HTTPS test; prototype20/20 and structural92/92 are separate from runtime permission evidence. No final gate has a skipped/cancelled/TODO test. Each final phase records preserved source during execution and no new disposable containers/volumes after completion.

## Source reconciliation and protected state

[Final closure receipt](../evidence/could-runtime-20261106/closure.json) records the final current source, per-phase directories and exact post-Workspace classification. All application/runtime/SQL/JSON contract and executed non-browser test sources are unchanged since successful379 execution. Three manifest paths changed afterwards: contracts/README.md documentation, the separately executed task-browser confirmation-copy assertion, and the verification runner's multi-footer/TLS handling. Latest successful browser/checks manifests bind all172 final source inputs byte-for-byte. The older Workspace whole manifest is therefore not falsely labelled identical to later metadata. The separate review assignment uses that reconciliation and the final manifests.

Final checks preserve001–011, already-tested012, accepted/prior ADRs, BRD/baseline, Knowledge, package/dependency files and all pre-existing tracked evidence. Additive013 is new and required for current Could provenance; no valuable-data DB was migrated. New timestamped browser captures emitted by unchanged SP-03/SP-04 regression suites retain their original owning paths and executor origin; no old capture is overwritten or moved. Final closure scans new textual evidence for private-key, live session-cookie and credential-URL patterns without printing matches; none found. Existing user containers remain untouched; disposable test resources are closed by their original fixture owners.

The first final checks campaign had an existing opt-in HTTPS skip and a runner JSON field showing only the last package footer. Its original raw output/JSON is retained. The runner now aggregates footers and explicitly enables the existing trusted TLS paths; the fresh final foundation19/19 executes the formerly skipped case. The first complete browser group and its unchanged Task-only rerun exposed a stale Creation confirmed copy assertion: unchanged HEAD Task UI says Operation confirmed. Current task details are loaded. Only that exact test copy was synchronised, with keyboard focus, persistence, cookie, unknown/recovery and denial assertions retained; the full five-file browser rerun then passed. No application Task source or business expected outcome changed.

Final preflight reviewed authority/scope, current version/trace registration, same owning-service transaction and immutable evidence, real-versus-structural evidence, source drift, environment/cleanup and unrun independent/deployment/valuable-data boundaries. No agents, commit/push/merge, external messages, new provider or owner acceptance. [Independent review brief](could-review-assignment.md) is prepared for manual handoff only.

## Implementation references

[Workspace transaction and producers](../../../../../services/workspace/src/sprints/store.ts), [current grant predicate](../../../../../services/workspace/src/sprints/authority.ts), [HTTP validation/serialization](../../../../../services/workspace/src/sprints/http.ts), [private typed receipt storage012](../../../../../services/workspace/migrations/012-sprint-could.up.sql), [boolean-only provenance013](../../../../../services/workspace/migrations/013-sprint-could-authority.up.sql), [exact browser recovery](../../../../../apps/web/src/sprints.ts), and [existing-design form/return controls](../../../../../apps/web/src/SprintWorkspace.tsx) locate the implementation described above. [Actual handler race tests](../../../../../tests/workspace/sprint-could-concurrency.test.mjs) and [security/expiry/provenance tests](../../../../../tests/workspace/sprint-could-security.test.mjs) identify the bounded enforcement assertions; they do not establish independent acceptance.

## Later bounded reviewer receipt and publication — 7 November 2026

[SP05-COULD-REVIEW-DISPOSITION-01](could-review-disposition.md) receives the exact reviewer text/checks and owner acceptance. Earlier independent-not-executed wording describes the6 November snapshot; the7 November handback covers static/checks and reports pure controller results, while independent379/Edge remains unrun. PUB03 resolves the Docker-off resource-classification tooling defect and preserves generated Project captures before restoring overwritten historical paths; that writer now uses fresh run directories. The new helper/browser-output-path corrections require fresh focused evidence and are not silently attributed to the earlier172-input author manifests. No Sprint producer/SQL/JSON behavior changed. The user authorised PR publication and subsequent SP-06, not main merge or M03/release acceptance.
