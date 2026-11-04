# SP-02 sequential implementation evidence

**Artifact ID:** SP02-EXECUTION-RESULT\
**Version/date:** 0.2.1 Draft · 4 November 2026\
**Status:** Bounded SP-02 implementation and local integration verified; wider acceptance/deployment remain open.\
**Inputs:** [FEAT-SP02-01](../../implementation/features/sp-02-project-membership/plan.md) v0.6; SP-02 (execution snapshot v0.7); ADR-0026 (original design snapshot v0.3; current bounded reconciliation v0.4); current Workspace contract.\
**Trace:** AC-02/03/38/39, session prerequisite regression; BR-01/10/11/14.

Owner authorised corrected sequential tasks. No development data migration, commit or push. Actual task results and unrun boundaries are appended only after execution.

## P03A actual result

Node 24.21.0; typecheck/build passed. npm run test:foundation passed 18 tests with 1 existing opt-in HTTPS skip; dedicated real HTTPS integration ran in session suites. node --test --test-concurrency=1 tests/workspace/session-transaction.test.mjs tests/workspace/persistence.test.mjs tests/workspace/http.test.mjs tests/workspace/lifecycle.test.mjs tests/workspace/ui.test.mjs passed 63 results (including parents), 0 failures/skips. Existing fixtures created unique PostgreSQL 17.10/pgvector containers and removed only those resources. Added test proves same-client rollback and committed clock-fault latch without entering protected writes. Counts are test outcomes, not 63 distinct application behaviours; no project handler yet.

## P03 actual result

Workspace typecheck passed. project-authority.test.mjs passed 9 results (including parent) on disposable PostgreSQL 17.10: legacy refusal/data retention, empty reverse/forward preserving SP-01 latched fault/audit/session, runtime-role limits, explicit bootstrap/revoke/recovery, audit rollback, disabled target, concurrent last-manager capability revocation, origin/revision constraints and actual private CLI. Original 001–006 migration checksums matched. 007 has no receipt/cursor table. Initial run failed on a TypeScript parameter property unsupported by Node strip-only mode; replaced with explicit field/constructor and rerun passed. Development DB untouched.

## P04A actual result

Workspace OpenAPI 0.2.11 adds declared listProjects cursor errors and bounded mutation-body errors; no new operation. Existing entity responses unchanged. Context check and 26 contract/byte-reference tests passed under Node 24.21.0. Digest watermark, one-key/kid rotation/error behaviour, exact retained snapshot fields and separate 008 scope are recorded in decision batch/ADR execution clarification. This structural result is not handler permission evidence.

## P04B actual result

project-outcomes.test.mjs passed 6 results, 0 failures/skips. Separate 008 refuses legacy unknown outcomes, reverses/reapplies only when empty, preserves 007 checksum, rejects malformed/null/extra/unsafe snapshots, keeps committed identity immutable/infinite, rolls back unsuccessful transactions and preserves existing protected_handoff shape. No public project write existed before these checks.

## P04C actual result

project-http.test.mjs passed 9 results including parent: denied/forged/blank input, server creator/time and initial grant, concurrent same-key create exactly once, changed payload conflict, injected audit/outcome rollback, lost actual COMMIT acknowledgement then same-key reconciliation, current-authority/membership replay denial, bounded body/media handling, final serializer corruption rejection and trusted HTTPS. Workspace typecheck passed after correcting unknown-error narrowing and the inferred UUID-template type of the correlation default. No development data touched.

## P04 actual result

Workspace typecheck passed; cursor unit test and project-reads.test.mjs passed (1 + 8 results). Real reads prove fixed 50-row project paging, stable order/authorised-only rows, identical denied/unknown reads, keyed actor/scope binding, tamper/rotated/missing key errors, same-actor relogin without session-bound invalidation, projection/role-generation changes, DB failure as 503 rather than empty list and session expiry after an actual project lock wait. No per-cursor table or counter was added. Complete permitted projection hashing costs a full eligible read per page; no performance/load claim. listProjects/getProject query errors are coordinated in Workspace 0.2.11.

## P05 actual result

Workspace typecheck and membership-lifecycle.test.mjs passed 6 results. Actual add/list/actions handlers prove no capability from descriptive role, minimal paged members/revisions, actor/limit cursor binding, fresh rejoin generation/revision, old read/capability invalidation and original historical add snapshot replay after rejoin. Controlled persisted-removal fixture is labelled and does not claim removeMember handler acceptance yet. Actual DB CHECK injection maps to 409, not 500, with no partial membership. Unsupported resource actions disclose no metadata.

## P06 actual result

Workspace typecheck and membership-removal.test.mjs passed 7 results. Real DELETE removes membership/all capability families/read grant, unassigns both Backlog and Completed-location tasks with revisions/audit, preserves completed allocation/state/order and other-project assignment. Last-manager rejection, old-key replay after rejoin, stale fresh-key removal, audit/outcome rollback, task revision ceiling and concurrent manager removal were verified. Transport boundary remains the current transaction/handler adapter, not a D-07 socket-completion claim.

## P07 actual result

project-concurrency.test.mjs passed 8 outcomes: two actual manager-removal HTTP requests observed at the PostgreSQL clock-lock barrier, controlled assignment/read-grant writers before and after actual removal, actual private operator grant queued before removal and rejected after removal, lost actual removal COMMIT acknowledgement with same-key reconciliation and healthy pool. SQL writers are explicit future-producer protocol doubles, not SP-04/SP-06 handler evidence; SP02-F01 remains. No D-07 transport acceptance.

## P08 DOM and controller result — 1 November 2026

Actual controller unit suite: 5/5. Actual React DOM + same-origin trusted-client HTTPS + current 008 PostgreSQL: 5 outcomes including parent. Create/add/remove, displayed revision preconditions, explicit keyboard-accessible confirmation, real committed response loss then original-key recovery after reload, dependency outage and actual removal clearing were measured. No protected fetched list, credential or session token is persisted in browser storage.

Initial UI typecheck failed on optional RequestInit.body; omitted undefined body and reran successfully. An editing helper had a Python syntax error before writing; corrected without partial App/CSS edits. No failing result is relabelled as passing.

## P10 integrated run — 1 November 2026

Node 24.21.0, disposable pinned PostgreSQL image and existing local TLS material. npm run test:projects passed 64/64, zero skips; [retained log](evidence/SP-02-2026-11-01/projects.log). This includes typed cursor/controller unit results, SQL migration/operator results, actual handlers/barrier/HTTPS results and DOM results; 64 is not a count of distinct permission behaviours.

Native desktop Edge attempt could inspect the URL but repeated user-input/cached-element errors prevented stable form interaction; it is not a browser pass. The fixture was closed. An isolated Edge Playwright attempt using the existing bundled runner then failed at TLS trust (ERR_CERT_AUTHORITY_INVALID), before login; [failed log](evidence/SP-02-2026-11-01/browser-attempt-1.log). No bypass was enabled. Owner chose to install trust for the existing localhost development certificate; awaiting actual trust installation and rerun. Tests never use the personal browser profile.

### Browser rerun result

Owner confirmed local trust setup. The second attempt reached real browser login but the Node-side route.fetch client lacked the explicit local CA and failed; its synthetic cookie was redacted from the retained failure log. Added sensitive-error withholding in the browser forwarding helper and supplied only the existing public localhost certificate via NODE_EXTRA_CA_CERTS (TLS verification remains enabled). Attempt 3 passed: one real isolated Edge test with real browser cookie enforcement, create/add, reload and identical original-key reconciliation after a real committed response was dropped, second-manager removal clearing current UI, keyboard confirmation/cancel, logout/reload denial and no page errors. [Summary](evidence/SP-02-2026-11-01/browser-summary.json), [successful log](evidence/SP-02-2026-11-01/browser-attempt-3.log), [desktop](evidence/SP-02-2026-11-01/project-desktop.png), [390 px layout](evidence/SP-02-2026-11-01/project-mobile.png). No personal browser profile, certificate bypass or external provider. Full cross-browser/usability/accessibility certification remains unmeasured.

## Final bounded verification and handoff

| Verification group | Actual result | Retained evidence |
| --- | --- | --- |
| SP-02 unit/SQL/operator/actual HTTP/DOM | 64/64, zero skips | projects.log |
| Isolated Microsoft Edge actual browser | 1/1, zero skips | browser-attempt-3.log and browser-summary.json |
| Existing session + storage regression | 89/89, zero skips | regression-attempt-1.log |
| Framework foundation with explicit HTTPS configuration | 19/19 (web 9, Workspace 7, Knowledge 3), zero skips | foundation-attempt-3.log |
| Existing preparation schema assertions | 6/6, structural only | preparation-regression.log |
| Context unit negatives | 45/45 | context-test.log |
| Documentation/diagram negatives | 20/20 | docs-test.log |
| Contract/reference schema/bytes | 26/26 | contracts-test.log |
| Typecheck and all application builds | Passed | typecheck.log, build.log |

Counts include parents and typed SQL/schema checks; they are not interchangeable with distinct application behaviours. Seven implemented SP-02 operations are createProject/getProject/listProjects/addMember/listMembers/removeMember/getAllowedActions (global/project scopes). Actual observations are mapped separately in VERIFY-01 v0.11 and TEST-COVERAGE-01 v0.10; no entire TC-02/18/22/24 or SC-06 pass is asserted.

Failure record: foundation first failed on environment EACCES loopback access; rerun with required local transport access passed web HTTPS but caught the old liveness expectation that /projects was unimplemented 404. Updated that bounded scaffold assertion to require configured-route-unavailable 503 with exact error/no-store, while unknown internal/future routes still require generic 404. Rerun passed all 19. Documentation lint caught unsynchronised current input aliases/register rows; metadata and explicit historical snapshots were corrected, not old execution results or assertion thresholds. Earlier browser trust/Node CA failures and synthetic-cookie redaction are retained above. No remaining failed required bounded check is silently skipped.

Reconciled artifacts: FEAT-SP02-01/entry/decision batch v0.6 and child headers, Proposed ADR-0026 v0.4, Workspace OpenAPI v0.2.11 / CONTRACT-01 v0.22, logical data JSON v0.10 / DATA-04 v0.14, API-05 v0.20, physical Workspace ERD v0.5 (canonical Mermaid/native pair), canonical SP-02 v0.7, SPEC-INDEX v0.8 / machine index v0.5, parent catalogue v0.5 and implementation registers. Dependent UX/evaluation references update only input metadata; no frame or research rubric is changed. The ERD and desktop/mobile UI were author-inspected; this is not independent visual acceptance. [Standalone ERD](evidence/SP-02-2026-11-01/workspace-erd.svg) and [raster](evidence/SP-02-2026-11-01/workspace-erd.png) are retained.

Permission enforcement remains in Workspace, using current cookie session/account, current membership and exact explicit grant inside the owning transaction. UI action lists only advise; strict response schemas withhold invalid data. Audit/outcome failure rolls back business effects; unknown commit/response loss retains the original operation identity. Unavailable DB/authority/key fails closed, not an empty/unrestricted success. No Knowledge DB write, provider input, permission cache, directory, Redis/Kafka or new dependency was added.

Next feature is SP-03 under its own registered work plan. Open: actual SP-04 setAssignee and SP-06 document-grant handler races SP02-F01 (current controlled SQL doubles are labelled), Knowledge/source/citation/provider tests and D-07 exclusion through socket handoff, whole-release/SC-06/independent acceptance, broader cross-browser/usability, production deployment and capacity calibration. Optional P09/FR-64 remains not selected. Full eligible projection hashing is unbenchmarked and immutable snapshots retain original project name/description indefinitely by current contract.

Pre-flight/pre-report checklist rechecked: owner scope/trace/service ownership, unchanged Accepted ADRs/BRD and old migrations, current/snapshot source headers, registered coordinated paths, preserved unrelated work, synthetic-only evidence and no provider, actual required checks, explicit unrun boundaries. No agents, commits/pushes, development DB migration/reset or whole-ADR acceptance. The owner installed localhost trust explicitly; the agent did not bypass TLS or install a CA incidentally. All task-owned disposable test fixtures are closed.

### Final source and check identity

[Source manifest](evidence/SP-02-2026-11-01/source-manifest.json) freezes 117 runnable source/contract/test inputs and 25 build-output hashes at HEAD 362831fbf6e342e81226195f56f9d697faa0a367 on codex/sp-02-project-membership. The dirty inputs are preserved in a [verified archive](evidence/SP-02-2026-11-01/source-inputs.zip); no environment/certificate/private-key file is included. All 117 source hashes were rechecked unchanged after final checks. Original Workspace 001–006 up/down files have no Git diff. [Final check summary](evidence/SP-02-2026-11-01/final-checks-summary.json) records six successful context/docs/contracts groups; final logs retain 45/20/26 results. git diff --check passed; retained logs contain no raw synthetic session cookies.

All required bounded checks have passing final runs; wider unrun boundaries remain exactly as listed above. This result is a sequential author implementation/handoff, not independent approval.
