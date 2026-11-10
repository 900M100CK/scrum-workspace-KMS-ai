# Decision map for implementation

**Artifact ID:** IMPL-DEC-01\
**Version/date:** 0.15 Draft · 7 November 2026
**Status:** Index of existing decisions; no new acceptance.\
**Inputs:** PRD-01 v0.10.3; ADR-0001–ADR-0026; OWNER-Q-01 v0.1; [TECH-STACK-01](../tech-stack.md) v1.6; [source register](register.md).\; Proposed ADR-0032 v0.1
**Trace:** BR-01–BR-14; SC-01–SC-08.\
**Owner role:** Sequential development coordinator.

## Constraints already recorded

| Source and status | Implementation consequence | Affected packs |
| --- | --- | --- |
| Owner-directed microservices; [ADR-0002](../adr/0002-minimal-microservices.md) exact boundaries Proposed | Workspace is the proposed gateway/permission authority, Knowledge owns evidence. Do not add services or cross-service DB access. Confirm exact boundary design before relying on it. | All; especially SP-06/09/11 |
| [ADR-0004](../adr/0004-knowledge-store.md) implemented storage foundation | Reuse owned PostgreSQL/pgvector storage and runbook; no claim that SQL proves permission handlers. | All persisted slices |
| [ADR-0007](../adr/0007-document-access-model.md) Owner-confirmed | Project-shared versus restricted; explicit revocable author read grant; read/write/manage/lifecycle are independent. | SP-02/06–10/13 |
| [ADR-0008](../adr/0008-fixed-sprint-lifecycle.md), [OWNER-Q-01](../planning/owner-decisions-2026-10-16.md) Owner-confirmed | Fixed three-state board/Sprint lifecycle; unfinished returns and completed-task reopen go to Backlog To Do; preserve completed history. | SP-03–05/10 |
| [ADR-0009](../adr/0009-versions-without-draft.md) Owner-confirmed | Immutable revisions become Current immediately; no product Draft/publish. | SP-06–09/13 |
| [ADR-0010](../adr/0010-release-scope-and-capacity.md), [ADR-0016](../adr/0016-optional-task-keyword-search.md) Owner-confirmed | Preserve release Musts and existing optional exceptions; no automatic cuts or additions. | All |
| [ADR-0011](../adr/0011-document-creation-and-guard-scope.md) Owner-confirmed | Workspace-first document identity/policy; same-key reconciliation; guard protected source/citation/provider/answer handoffs. Retain inaccessible orphans until cleanup is proven safe. | SP-06–09/11 |
| [ADR-0012](../adr/0012-audit-visibility-and-durable-evidence.md), OWNER-Q-01 Owner-confirmed | Mutation + minimum audit atomically; complete immutable evidence persisted outside guard and exactly revalidated within guard through transport completion/abort. Include uncited context. | Every producer; SP-09/11/13 |
| [ADR-0013](../adr/0013-unavailable-citations-and-withheld-answers.md), [ADR-0015](../adr/0015-partial-evidence-answers.md) Owner-confirmed | Exact unavailable identity only with retained read entitlement; generic withheld error; partial supported answers differ from invalid drafts. | SP-07/09/10/13 |
| [ADR-0014](../adr/0014-multiple-sprint-allocation.md) Owner-confirmed | Per-task allocation identity, result and reconciliation; no bulk atomicity claim. | SP-05 |
| [ADR-0017](../adr/0017-membership-removal-capabilities-and-assignees.md) Owner-confirmed | Atomic membership/grant/capability invalidation, unassignment, revisions and audit; last-manager protection; rejoin restores no individual grants/assignments. | SP-02/04/06/10/13 |

Owner-confirmed direction is neither implemented behaviour nor independent approval. The canonical documents retain the confirmation sources. Read them before changing a protected boundary.

## Open choices and bounded preparation

31 October SP-02 disposition: [decision batch v0.5](features/sp-02-project-membership/decision-batch.md) records selected D-03 private explicit provisioning and bounded D-04 information scope. Detailed schema/transaction/paging adoption is proposed in [ADR-0026 v0.3](../adr/0026-project-membership-foundation.md), not accepted by generic continuation. Inspector/content/lifecycle delegation and other projection scopes in the table remain open. P03 depends on concrete schema disposition; P04 also needs the identified listProjects contract correction.

| Gate | Decision still required | Proposed input / affected tasks | Work that may proceed |
| --- | --- | --- | --- |
| D-01 application stack | Select framework/tooling, application DB client and tested versions; do not infer adoption from preview packages | OD-12; [TECH-STACK-01](../tech-stack.md) v1.6; [ADR-0003](../adr/0003-student-stack.md); SP-01.1, then all code packs | Record candidate versus installed versus tested/selected; verify compiler/plugin/runtime and OpenAPI/validator/serializer dialect compatibility. Decide bounded service-owned pools, same-client transactions and exact bigint handling. Preserve existing preview; no package adoption by this pack |
| D-02 identity/session | Core bundle owner-confirmed; detailed KDF/time/recovery and account lock/disable mechanics still open | OD-09; ADR-0025 v0.2; SP-01.1–3; SP-02 scope tests | Bounded P07 scaffold/interfaces/config/local HTTPS may proceed; P08/P10 detailed persistence/algorithm gates remain; no registration/reset expansion |
| D-03 capability provisioning | Who grants non-read capabilities and inspector rights, scope and removal semantics | OD-02/08; SP-02.1, SP-06.3, SP-13.1 | Explicit synthetic grants for tests; deny unknown actions. No role-name bypass or invented delegation UI |
| D-04 UI read/projection design | Accept/reject Proposed projection/discovery mechanics needed for live UI | [ADR-0018](../adr/0018-operational-read-projections.md), [ADR-0019](../adr/0019-scoped-ui-discovery.md); SP-02–08/13 | Map existing wire contracts and fresh-client scenarios; SQL/shape checks do not accept design |
| D-05 non-reading commands | Accept/reject opaque-precondition/minimal-receipt mechanics; preserve independent write/lifecycle authority | [ADR-0022](../adr/0022-opaque-document-command-preconditions.md); SP-06/07 | Inspect known-ID commands; no content prefill bypass |
| D-06 AI configuration and transfers | Select embedding/generation configuration, final provider-wire mapping, budget and permitted transfer policy | OD-06; [ADR-0005](../adr/0005-ai-provider-pilot.md); SP-09.1; SP-12 | Local synthetic doubles and acceptance design; work/document slices continue. No real data to a new provider |
| D-07 transport implementation | Accept/reject detailed Proposed mechanics implementing the retained guarded-handoff invariant | [ADR-0006](../adr/0006-permission-handoff-guard.md), [ADR-0020](../adr/0020-manifest-bound-ai-transport.md), [ADR-0023](../adr/0023-immutable-handoff-storage.md); SP-06/07/09/11 | Inspect existing storage/reference tests; record affected contracts/specs/data/UX/tests. No send authority from a stored claim or schema |
| D-08 inspection capture | Accept/reject additional query/step/metric projection mechanics | [ADR-0021](../adr/0021-scoped-inspection-and-missing-metrics.md); SP-09/11/13 | Separate required provenance from optional metrics; do not fabricate measurements |
| D-09 retention/cleanup | Physical retention, surviving locator policy and safe cancellation/cleanup protocol | OD-04/08; SP-06/07/11/13 | Enforce logical unavailability and retain inaccessible orphan records; no age-based purge |
| D-10 evaluation | Pilot configuration and later numerical quality/latency thresholds | OD-07; SP-12 | SP-12.1 implements runner/adapters, scenario verification, configuration applicability and result capture before pilot. Freeze questions/rubric before pilot, thresholds before final; preserve research/safety separation |

### D-01a / D-01b preparation split

D-01a is backend runtime/compiler/HTTP/DB/schema compatibility under Proposed [ADR-0024](../adr/0024-backend-session-foundation.md). D-01b is frontend framework/tooling adoption, which remains under Proposed ADR-0003 and does not block backend experiments. Preserve the current preview; decide frontend tooling before adopting it, not automatically at SP-01.3. D-02 has a concrete candidate in Proposed [ADR-0025](../adr/0025-opaque-session-candidate.md); production expiry/provisioning/CSRF choices remain open.

The [SP-01.1 brief](briefs/SP-01.1-session-foundation.md) scopes preparation and isolated experiments; its [result](../sdlc/reports/SP-01.1-preparation-2026-10-27.md) distinguishes existing schema checks from missing HTTP/DB/session evidence. The D-01 table's “no package adoption by this pack” prevents application adoption; it does not prohibit a separately scoped, authorised isolated experiment. No gate is resolved by these proposals or by the owner's instruction to prepare them.

## Recording a decision

For technology choices, TECH-STACK-01 is the candidate inventory, ADR-0003/0004/0005 and owner records establish decision status, and installed configuration plus executed checks establish implementation evidence. A version listed as a recommended update is not an automatic upgrade instruction. Keep the implemented storage baseline and existing preview distinct from the proposed production application stack. Do not duplicate the stack matrix into this folder or infer that every listed tool is required.

Prepare one reviewable batch for the next affected slice: exact question, source, alternatives, recommendation, behavioural consequence, affected artifacts and tests. Ask only for material missing choices; continue independent authorised preparation. Existing owner confirmations do not need repeated permission.

Record an actual owner response in the canonical owner-decision/ADR process with a persistent source, then reconcile downstream artifacts and this table. Silence, time, a successful schema test or the request to create this folder is not acceptance. Do not mark all gates resolved at once. New technical simplifications may change mechanisms only after showing which required guarantees remain and how they will be tested.

Checklist: Pass for surfaced decisions/dependencies; Gap for the listed choices and runtime proof. Handoff: D-01/D-02 are the first preparation batch; D-06 does not block work implementation.

## Bounded framework selection — 27 October 2026

[OWNER-FRAMEWORK-01](../planning/framework-foundation-owner-2026-10-27.md) and [INIT-FRAMEWORK-01](features/framework-foundation/plan.md) supersede the earlier no-adoption preparation restriction only for the owner-directed framework foundation. React/Vite/TypeScript and Fastify/TypeScript packages are initialised and selected for the tested scaffold. Earlier gate descriptions retain their broader unimplemented driver/validator/auth/transport scope: D-02, D-07 and pg/session policy remain open. Do not wait for a repeated framework-choice approval to use the selected scaffold, or infer session/permission acceptance from liveness/build tests. The existing synthetic UI moved to design/prototype and remains the design reference.

## SP-01 owner disposition — 28 October 2026

The owner selected pre-provisioned username accounts, opaque digest-backed independent sessions, same-origin secure cookie/Origin/header checks and configurable starting 30-minute idle / 8-hour absolute limits. These choices are recorded in ADR-0025 v0.2 and the P06 decision batch; do not reopen them. Detailed KDF/time/recovery mechanics remain Proposed. The owner expressly permits P07 scaffold/interfaces and local HTTPS while P08/P10 wait for the remaining gates. Account lock/disable policy is still unselected and TC-01 remains binding. No application schema extension, concrete KDF/time algorithm or D-07 acceptance follows from P07. See [P07 evidence](../sdlc/reports/SP-01-P07-scaffold-2026-10-28.md).

## Bounded P08 disposition — 28 October 2026

The owner selected manual account disable without automated lockout and authorised P08/schema 005 under the explicit memory/admission/libuv, private atomic recovery, fail-closed and honest-limitation conditions. [P08 design](features/sp-01-session-foundation/p08-persistence-design.md) v0.2 and [result](../sdlc/reports/SP-01-P08-persistence-2026-10-28.md) record disposition and evidence. No development migration, formal Accepted ADR or D-07 closure is implied; P09–P12 remain outside the bounded P08 approval.

## P09 disposition — 28 October 2026

The owner separately authorised P09 POST/GET handlers. Selected identity/cookie/Origin and explicit final schema validation are integrated with P08; no new policy, Accepted ADR or D-07 closure is inferred. Logout/renewal/UI remain later tasks.

## P10 disposition — 28 October 2026

The owner separately requested P10. Selected session lifecycle and additive audit migration 006 are implemented within that task; [P10 result](../sdlc/reports/SP-01-P10-lifecycle-2026-10-28.md) retains execution evidence. No formal ADR acceptance or D-07 closure.

## SP-02 bounded disposition — 1 November 2026

The owner explicitly authorised corrected sequential implementation: P03A session transaction reuse, reduced 007/private bootstrap, separate 008 compact permanent outcomes, current scoped project/member/action handlers and UI with session-independent HMAC projection cursors. Actual SQL/HTTP/DOM/Edge evidence is in SP02-EXECUTION-RESULT v0.2. ADR-0026 remains Proposed; optional FR-64, D-07, development upgrade and wider acceptance are not selected by this disposition.

## SP06 bounded D-03 disposition — 7 November 2026

The [B01 owner receipt](features/sp-06-document-access/evidence/p01a-20261107/owner-selection.json) selects private explicit per-member project document-create provisioning with operation recording. P02-A aligns project-scoped knowledge-author and its documented private operator/provenance path; [Proposed ADR-0032](../adr/0032-private-document-create-authority.md) specifies bounded mechanics. This resolves only the document-create provisioning question, not additional content/lifecycle/inspector delegation. Runtime proof is P03-A/P04. D-04/B02 document projection and D-07/B03 guarded service transport remain open; no whole-ADR acceptance. Initial scoped document author/read grants remain settled ADR-0007 defaults at creation only.
