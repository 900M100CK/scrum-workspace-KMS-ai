# SP-02 project and membership work plan

**Artifact ID:** FEAT-SP02-01\
**Version/date:** 0.6 Draft · 1 November 2026\
**Status:** Owner-authorised sequential implementation after breakdown corrections; P03A–P07 verified; P08 DOM/browser verified; P10 integrated verification/handoff recorded.\
**Inputs:** [SP-02](../../../../specs/002-project-membership.md) v0.7; [pack](../../tasks/02-project-membership.md) v0.3; PRD-01 v0.9; UC-02 v0.8; SAD-03 v0.16; Workspace contract v0.2.11; ADR-0007/0017 owner-confirmed, ADR-0019 v0.4 and [ADR-0026 v0.4](../../../adr/0026-project-membership-foundation.md) Proposed; PLAN-01 v0.4.\
**Trace:** FR-02/03/38/39 and AC-02/03/38/39; optional FR/AC-64; BR-01/10/14; UC-02 and applicable TC-02/18/22/24; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer; material choices belong to owner.\
**Planning mode:** Unavailable; registered written plan gate used instead.\
**Work kind:** Feature with bounded preparation, implementation and verification tasks.

## Goal, parent and merge baseline

Create/read projects only with current explicit authority; add/remove/rejoin known accounts without capability revival, protect the last effective membership manager and clear current assignees atomically with audit. Connect a fresh UI to real authority and revisions. Parent: [PLAN-01 Month 1](../../../planning/five-month-plan.md#calendar-and-exit-gates), [M-02 smallest work flow and M-03 full membership safety](../../roadmap.md), [SP-02 children 02.1–02.4](../../tasks/02-project-membership.md). Registers: [work plans](../README.md), [source register](../../register.md), [REG-00](../../../sdlc/artifact-register.md).

The owner explicitly requested merge after passing SP-01 tests. All nine P12 regression groups and six documentation/context groups passed; 94 non-scratch runnable hashes matched the retained run. On 28 October main was fast-forwarded/pushed to 52a10dd0bbdf76b173c2c2f387e6615def4312e9 and verified at origin. This branch, codex/sp-02-project-membership, starts there. SP-01's formal ADR/deployment/D-07 and broader release limits are not closed by merging. Unrelated dirty submodule/prompt copies/patches/scratch inventories are preserved.

Non-goals: global user directory, invitations/registration, role editor/delegation UI, automatic restricted read, Scrum/Knowledge/AI features, optional FR-64 without inclusion, new services/providers/dependencies, development DB reset, implicit commits/pushes or Accepted ADRs.

## Decisions and ownership

| Gate | Selected constraints / remaining disposition | Safe work |
| --- | --- | --- |
| D-03 authority provisioning | Existing defaults are retained: creator's initial membership-manage, no role-name bypass, no restricted read, rejoin restores no old grant. The owner selected private audited explicit create-project/member-manager provisioning; inspector/content/lifecycle delegation beyond SP-02 stays open. | Bounded private tooling/storage and disposable verification authorised by the owner; formal ADR/deployment acceptance remains separate. |
| D-04 discovery | On 31 October the owner selected current-member project visibility, minimal member IDs/descriptive roles/revisions and advisory actions with request-time authority checks; no emails or global directory. Detailed cursor/storage/transport mechanics remain Proposed. | Bounded current-member UI/list/actions implemented and tested; no whole-ADR acceptance. |
| Persistence/idempotency/cursor mechanics | Concrete [ADR-0026](../../../adr/0026-project-membership-foundation.md) proposes reduced 007, separate P03A session refactor, compact P04 outcomes before public mutations and table-free authenticated paging; bounded implementation is owner-authorised. Workspace v0.2.11 records the required listProjects cursor errors. | Actual results recorded per task; no rewrite of 001–006 or development migration. |
| D-07 protected transport | Current project/document authority and source-send guard remain distinct. | Session/project transaction tests never claim Knowledge/citation/provider guarded handoff. |

Workspace owns accounts/sessions/projects/membership/grants/tasks/audit/idempotency. No cross-service DB write or copied permission rule. Unknown authority fails closed. Read denial for unknown/nonmember is identical generic 404; unauthenticated is 401; known available target with inadequate action authority follows the declared contract. Current account/session must be rechecked; UI allowed-actions is advisory. Mandatory audit accompanies every mutation in the same owning transaction.

## Tasks and acceptance

All statuses and results live in this table. Approval is the owner's 31 October instruction to fix breakdown and execute tasks sequentially; ready children need no repeat approval. Optional FR-64 remains excluded. The corrected task briefs supply bounded scope/assertions and inherit source versions below.

| Task | Reviewable outcome | Prerequisites | Status / result |
| --- | --- | --- | --- |
| [P01](tasks/SP02-P01-source-contract-gates.md) | Original source inventory | None | Historical preparation retained |
| [P02](tasks/SP02-P02-decision-and-contract-preparation.md) | Resolve design and register corrected tasks | P01 | Corrected breakdown registered; owner authorised implementation |
| [P03A](tasks/SP02-P03A-session-transaction-refactor.md) | Same-client session validation, unchanged SP-01 semantics | P02 | Verified bounded refactor; execution report P03A |
| [P03](tasks/SP02-P03-owned-authority-foundation.md) | 007 private authority/bootstrap and safe migration | P03A regression | Verified bounded 007/private authority; execution report P03 |
| [P04A](tasks/SP02-P04A-contract-and-paging-design.md) | Exact contracts/watermarks/key/error design | P03 | Verified contract/context preparation; selected mechanics recorded |
| [P04B](tasks/SP02-P04B-durable-outcomes.md) | Separate 008 compact immutable outcomes | P04A | Verified separate 008; 6 test outcomes |
| [P04C](tasks/SP02-P04C-project-create.md) | Authorised atomic createProject and replay | P04B | Verified create/replay/rollback/HTTPS; 9 test outcomes |
| [P04](tasks/SP02-P04-project-create-and-reads.md) | Scoped project reads and signed paging | P04C | Verified scoped reads/watermarks; 8 PG + 1 cursor unit outcomes |
| [P05](tasks/SP02-P05-members-and-action-discovery.md) | Add/rejoin/list members and applicable actions | P04 | Verified add/rejoin/member paging/actions; 6 outcomes |
| [P06](tasks/SP02-P06-remove-rejoin-last-manager.md) | Atomic removal and last-manager protection | P05 | Verified atomic removal/history/no revival; 7 outcomes |
| [P07](tasks/SP02-P07-concurrency-failure-regression.md) | Current handler/DB races and failure evidence | P06 | Verified 8 barrier/failure outcomes; future-writer doubles labelled |
| [P08](tasks/SP02-P08-project-membership-ui.md) | Current-authority project/member UI | P07 | Verified DOM/HTTPS and isolated Edge; actual results in execution report |
| [P09](tasks/SP02-P09-optional-project-edit.md) | Optional FR-64 | Explicit inclusion | Not selected; no implementation |
| [P10](tasks/SP02-P10-integrated-evidence-handoff.md) | Bounded integrated evidence/handoff | P03A–P08 | Verified bounded integration; execution report, logs/source identity and follow-up SP02-F01 |

## Exact contract and acceptance plan

Existing operations: POST/GET /projects, GET/PATCH /projects/{project_id}, POST/GET /projects/{project_id}/members, DELETE /projects/{project_id}/members/{user_id}, GET /access/allowed-actions. getProject is an existing FR-03 contract dependency even though the pack's short operation list omits it. FR-64 PATCH remains optional. Payload schema names are CreateProject/AddMember/EditProject, not illustrative aliases. Mutations require existing Idempotency-Key; removal requires X-Expected-Revision from Member.revision. listMembers supports limit 1–100/default 50 plus cursor; listProjects declares cursor only. Any necessary shared wire correction must be proposed and registered before editing.

| AC / boundary | Required measured result |
| --- | --- |
| AC-02 | Explicit permitted create succeeds with stable identity, server creator/time and required initial grants/audit; denied/invalid creates nothing; exact replay/current-authority and lost-ack cases. |
| AC-03 | Actor from SP-01 only; member reads own projects; unknown/foreign/nonmember same generic denial; no global privilege from Admin/role; disabled/store-unavailable denies. |
| AC-38 | Known registered account joins with fresh membership revision/generation; project-shared access only, no implicit restricted read or capabilities from descriptive role. |
| AC-39 / ADR-0017 | Removal atomically deactivates membership, invalidates all individual capabilities/read grants, unassigns current tasks with revision/audit, preserves history/other projects; rejoin restores nothing individual; last-manager and concurrent races are enforced. |
| TC-18/22/24 subset | Each producer's audit failure rolls back; UI uses actual projections and preconditions, clears denied/revoked scope; browser evidence separately captured. |

Existing actual commands: npm run typecheck, build, test:foundation, test:session:storage, test:session:http, test:session:lifecycle, test:session:ui, db:test, contracts:test, context:lint/check/test, docs:lint/test. These do not yet verify SP-02 application handlers. Planned preparation command: Node 24 --test tests/workspace/sp02-contract-preparation.test.mjs after creating it in P02. New SP-02 runtime suites and root commands are Planned until selected implementation exists. Disposable PostgreSQL only; no development mutation. Capture exact source/fixture/command identity, retain negatives and source archives, and record local/browser/structural boundaries separately.

## Handoff

Read [P01 review](p01-source-review.md) and [owner decision proposal](decision-batch.md) before P03. Continue independent P02 preparation while material policy/design choices are pending. No automatic gate acceptance from a test result, task completion, main merge or this plan.

## 31 October continuation scope and checks

Brainstorming follow-up: the owner supplied external feedback based only on the Vietnamese brief. Resume this same P02 plan to check it against spec/contracts/code and revise Proposed ADR-0026 and the owner brief. This feedback is review input, not explicit migration/refactor adoption. Documentation preparation additionally includes SP-02-approval-brief.vi.md and a separate P03A task brief for the proposed session refactor. Current registration versions must be synchronized through the same parent/source/central/manifest/review metadata paths. Do not change contracts, implementation, old migrations or historical results. Verification: docs lint/suite, context check/suite, local Markdown links and diff whitespace under Node 24+; record negatives without changing expectations.

The owner clarified that continuation targets SP-02 and selected the minimal discovery information scope in the decision batch. Plan mode remains unavailable. Resume P02 to produce a concrete Proposed additive 007 authority/transaction design for owner disposition before P03, using the existing P02 task rather than a second plan. No implementation, migration application, dependency change, commit or push is authorised by this preparation step.

Allowed preparation paths: this feature folder, a bounded Proposed ADR under docs/adr/, docs/adr/README.md, parent implementation plan/roadmap/source/decision registers and docs/sdlc/artifact-register.md. These documentation paths support the existing registration gate; SP-02's canonical code paths remain unchanged. Do not edit shared contracts, accepted ADRs, baseline, runtime code or the owner's untracked preparation test. Planned checks for this continuation: Node 24+ scripts/docs/verify-docs.mjs; node --test tests/docs/docs.test.mjs; node scripts/verify-context.mjs; node --test tests/context/context.test.mjs; git diff --check; inspect changed local Markdown links. Report structural results separately from application acceptance. Historical P02 test execution is not rerun or relabelled.

Metadata coordination: REG-00's version is also owned by docs/sdlc/diagrams/manifest.json and generated version tables in docs/sdlc/diagrams/README.md and the central register. Include those registry-only paths and scripts/docs/docs-metadata.mjs synchronization when bumping REG-00; do not change diagram designs. The first docs lint and docs suite caught the unsynchronized register version (19/20 docs checks passed); retain this negative result and rerun after the metadata correction.

The next docs run caught the dependent REG-00 input alias in docs/sdlc/references/document-review-register.md (again 19/20 docs checks); include that input-only registry correction and its version registration. No historical evidence or expected assertion is changed to pass these gates.

A third docs run caught the old report's unlabelled plan input. Include metadata-only snapshot clarification in docs/sdlc/reports/SP-02-P02-preparation-2026-10-28.md; retain its original plan v0.1/source captures/results and register report v0.2. No new execution is attributed to that historical report.

### Continuation verification and handoff

31 October actual runtime for documentation commands: C:/Users/MCK/AppData/Local/Temp/kms-node24/node-v24.21.0-win-x64/node.exe (24.21.0); host default Node 22.23.0 was not used for these checks. Branch codex/sp-02-project-membership, starting HEAD 362831f; unrelated dirty submodule, patches, inventories and untracked test retained.

- Passed: scripts/verify-context.mjs; --test tests/context/context.test.mjs (45/45); scripts/docs/verify-docs.mjs; --test tests/docs/docs.test.mjs (20/20). These are structural/context checks, not SP-02 application acceptance.
- Initial docs lint/suite failures: generated REG-00 metadata, dependent input alias, historical report input label and unlabelled historical register section. Corrected version sources/aliases and historical labels; no expected test assertion, original execution result or source capture changed. Final docs lint/suite passed.
- Changed local Markdown link targets inspected; git diff --check run. No migration, runtime handler, session regression, PostgreSQL, browser or provider test executed for this documentation-only continuation. SP-02 handler behaviours verified: 0.
- Next step: owner disposition of concrete ADR-0026 007/P03 authority/storage/session integration and disposable tests, as requested in the decision batch. P03 remains unstarted; P04 must coordinate the explicit listProjects 400/409 correction before implementation. No independent acceptance, commit, push or development upgrade.

Pre-flight and pre-report checklist: author checked scope/trace/ownership, unchanged accepted ADRs and baseline, explicit Proposed adoption, parent registration, historical evidence and unrun checks. Cross-service/source transport, full SC-06, optional FR-64 and release acceptance remain gaps, not passed results.

## Brainstorming reconciliation result and revised handoff

The owner supplied feedback from a reviewer who had only SP-02-approval-brief.vi.md, not the ADR/spec/code. Source inspection confirms P03 has no public SP-02 write endpoint, so public replay moves to P04 before createProject is enabled. 007 no longer proposes receipt or cursor tables. P03A isolates the session refactor/regression before reduced P03; explicit audited bootstrap is added. Project locking and numeric DB CHECK bounds were already in ADR-0026 v0.1 and remain mandatory.

Status/ID-only replay is insufficient for existing 201 Project/Member schemas after mutable state changes. ADR-0026 v0.2 proposes minimal immutable result snapshots on the existing idempotency store rather than a generic HTTP-body table. No response contract is changed by this proposal. Cursor persistence is unnecessary, but paging/foreign/stale checks remain existing interface assertions; propose HMAC-authenticated binding without a per-cursor table. Detailed P04 design and key handling remain Proposed.

The revised owner-facing brief explains concrete failure examples and the reduced approval request. Feedback is not recorded as implementation approval. No runtime/schema/contract change or independent review is claimed. Documentation verification for this revision is recorded after execution below.

### Brainstorming revision verification

Under Node 24.21.0 at the same portable runtime path, scripts/docs/docs-metadata.mjs synchronized the two generated REG-00 version tables; scripts/docs/verify-docs.mjs passed; --test tests/docs/docs.test.mjs passed 20/20; scripts/verify-context.mjs passed; --test tests/context/context.test.mjs passed 45/45. These are current documentation/context checks after the design revision, with zero SP-02 runtime behaviours verified. No new test expectation was changed. Historical initial-proposal metadata failures above remain the original attempts, not failures in this revised run.

Pre-report scope review: unchanged shared contracts, runtime source, migrations 001–006, accepted ADRs and baseline; no dependency, external transfer, database mutation, commit or push. The new P03A brief remains Proposed. Local Markdown targets and whitespace checked; session/PostgreSQL/HTTP/browser regressions are Not run because only proposals/task briefs changed. Next implementation step still requires the bounded owner disposition described in decision-batch.md and the revised owner brief.

## Cursor session-binding correction scope

The owner explicitly requested removal of SP-02 cursor/session binding, alignment of Proposed ADR-0019/0026 and change logs, after checking other ADR-0019 consumers; code must stay unchanged. Plan mode remains unavailable. Resume P02 documentation preparation only. Inspect current spec/contracts, ADR-0018/0019 and session-related command/handoff contracts, then revise the cursor rule only. Allowed documentation paths are the existing feature/ADR/owner-brief and dependent registration/manifest/review-metadata paths. No public contract, runtime, migration, command-precondition token or protected-handoff binding is changed. Planned verification: Node 24+ docs metadata synchronization, docs lint/suite, context check/suite, local links and whitespace. Watermark selection for each endpoint and key handling remain prerequisites before P04/createProject; this correction grants no P03A/007 runtime adoption.

### Cursor correction result and verification

Dependency review found no same-session pagination requirement in current cursor-bearing Workspace/Knowledge operation descriptions, ADR-0018, SP-02 or service/web/context paging consumers. ADR-0019 v0.4 therefore corrects the shared pagination rule without an SP-02 exception; ADR-0026 v0.3 and P04 v0.3 align with it. Actor, membership/permission generation, scope/route/filter/order/page size, visible dataset generation and expiry remain. Every request still requires a current authenticated session. Separate document command-precondition and protected-transport session bindings are unchanged. Change logs record the owner direction and spec/OpenAPI rationale.

Actual Node 24.21.0 verification for this documentation-only correction: docs metadata synchronization passed (two generated REG-00 table updates); scripts/docs/verify-docs.mjs passed; --test tests/docs/docs.test.mjs 20/20; scripts/verify-context.mjs passed; --test tests/context/context.test.mjs 45/45. Local Markdown targets and git diff whitespace inspected. No code, contract, schema or accepted ADR changed; no application/session/PostgreSQL/browser tests run, no commit/push. P04 must still select explicit listProjects/listMembers watermarks and invalidation/read rules plus key/error policy before enabling createProject and dependent paging. This is not migration/refactor adoption.

## Owner authorisation and execution contract — 31 October

Direct owner instruction: “ok bạn có thể triển khai sửa và task rồi triển khai các tasks lần lượt”. This authorises corrected breakdown and sequential SP-02 implementation under bounded ADR-0026, including P03A/007, separate P04 replay migration, existing-contract corrections, tests and UI. It does not Accept all ADRs or authorise production/development upgrades, unrelated features, agents, commits or pushes. Earlier pending-approval statements above are historical snapshots superseded only within this scope.

Coordinated allowed paths: canonical Workspace/web/tests paths plus contracts/openapi/workspace.openapi.json, contracts/README.md, specs/002-project-membership.md and spec metadata, root package scripts/lock only if needed, scripts/database.mjs test migration ceiling, historical fixture adaptation, owning storage/data/API/diagram documentation and parent registers. Knowledge DB/code remains untouched. Shared changes must be registered before execution; no new dependency is expected.

Verification baseline: Node 24.21.0 portable runtime; use PATH for npm children. Existing session fixture/legacy suites retain their 006 schema snapshot through an explicit fixture ceiling; new SP-02 suites exercise current migrations plus real session checks. Never silently skip Docker/TLS failures. Evidence: docs/sdlc/reports/SP-02-execution-2026-10-31.md plus synthetic logs/source identities under its evidence folder. Run P03A typecheck/build/foundation and session suites first; P03 migration/operator tests next; P04–P07 unit/contract/real PG/HTTP negatives; P08 DOM/live/browser separately; final context/docs/contracts/typecheck/build and relevant regressions. Preserve negative runs.

P04 planning estimate (rough engineering budget, not measured delivery promise): design/contracts 1–2 h, durable outcomes 2–4 h, create handler/tests 2–4 h, reads/cursor/tests 3–5 h; revise after measured execution. No schedule or Must deferral follows from this estimate.

Cross-feature follow-up SP02-F01: actual setAssignee versus removal and document-grant handler versus removal are rerun when SP-04/SP-06 exist. P07 currently uses actual SP-02 handlers/private provisioning plus clearly labelled controlled Workspace SQL writers for those future producers. This does not complete future-handler or D-07 transport evidence.

## Resume checkpoint — 1 November 2026

Owner instruction: “resume lại task ở Saturday 1:53 PM”. App history confirms 31 October 2026 13:53:48 Asia/Saigon was the sequential implementation authorisation. P03A–P07 retain their recorded evidence; P08 code is unfinished and has typecheck evidence only. Resume P08 live DOM/HTTPS and browser checks, then P10 schema/API/diagram/runbook reconciliation and integrated regression. Plan mode remains unavailable; this written continuation gate applies. Preserve unrelated work; no agents, commit, push or development DB upgrade. Browser session storage holds at most one pending operation identity/payload for the current actor, never credentials or fetched protected lists. Confirmed explicit sign-out clears it; expiry hides the UI and same-actor sign-in may reconcile the original key. A current permission denial cannot prove that an earlier unknown operation rolled back.

Browser continuation: native Edge automation could read the test URL but repeated user-input/cache-generation errors prevented stable form interaction. Use the already bundled Playwright test runner to launch an isolated Edge test profile instead; no new dependency, personal profile, TLS bypass, provider or development data. Author a reproducible browser test and retain native automation failures as unpassed attempts.

P10 coordinated metadata scope: reconcile bounded SP-02 observations in requirement-verification/test-coverage/test-plan and input-only aliases in evaluation-cases, UX wireframe plan/blueprint/index and earlier preparation/session reports. Original design frames, acceptance assertions, source captures and historical run results stay unchanged. Update AGENTS/development-rules/package guides only for current command/handler status, not new policy.

## Bounded handoff — 1 November 2026

P03A–P08 and P10 have the actual evidence linked in [SP02-EXECUTION-RESULT v0.2](../../../sdlc/reports/SP-02-execution-2026-10-31.md). Optional P09/FR-64 remains not selected. Next feature dependency is SP-03; this handoff does not implement it. SP02-F01 remains a mandatory future-handler rerun, not a missing SP-02 SQL protocol test. Formal ADR/deployment, independent review, complete SC-06 and D-07 remain open. No production/development upgrade, reset, provider, new dependency, agent, commit or push.
