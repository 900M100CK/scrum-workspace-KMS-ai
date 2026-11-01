# Owned project authority and membership transactions

**Artifact ID:** ADR-0026\
**Version/date:** 0.4 Proposed · 1 November 2026\
**Status:** Reconciled reduced P03 design after owner-supplied brainstorming; bounded implementation owner-authorised; formal acceptance and deployment remain open.\
**Inputs:** [SP-02](../../specs/002-project-membership.md) v0.7; [plan](../implementation/features/sp-02-project-membership/plan.md) v0.6; [owner decisions](../implementation/features/sp-02-project-membership/decision-batch.md) v0.6; PRD-01 v0.9; UC-02 v0.8; SAD-03 v0.16; DATA-04 v0.14; Workspace contract v0.2.11; ADR-0004/0007/0012/0017, ADR-0019 v0.4 Proposed; ADR-0024/0025 Proposed; Workspace migrations 001–006.\
**Trace:** FR/AC-02/03/38/39; BR-01/10/11/14; UC-02 EX-01–04; TC-02/03/18/22/24; SC-06 foundation, not full source-disclosure evidence.\
**Owner role:** Sequential architect/implementer; owner decides bounded adoption.\
**Parent:** FEAT-SP02-01 P02 preparation → proposed P03A session refactor → reduced P03 authority foundation → P04 replay/paging prerequisites and P04–P08 integration; PLAN-01 Month 1 / M-02 and M-03.

## Context and scope

The owner selected private explicit audited provisioning (D-03), then selected current-member project visibility, minimal member IDs/descriptive roles/revisions and advisory actions (bounded D-04) on 31 October. These choices do not select the mechanics below or Accept ADR-0019. The member needs current authorised work; the operator needs accountable grants; the implementer needs same-service atomicity and reproducible failure tests within a solo capstone.

Current project storage lacks creator/time. capability_grant requires an existing project; business_audit cannot represent global provisioning. Member revisions are bigint but public revisions are JSON integers. Existing session inspection commits in its own transaction, so calling inspect before a project transaction would leave a revocation race. The current listProjects response catalogue lacks the 400/409 errors required by opaque paging. These are source observations, not failing application tests: SP-02 handlers do not exist.

Propose one additive Workspace migration, 007-project-membership, and reuse existing pg transactions, session policy, auth accounts, project/membership/grant/audit/idempotency tables. No Redis, Kafka, new service, provider, dependency, public delegation UI, global directory, account provisioning expansion or optional FR-64. Knowledge data is untouched. Creator identity records history; only explicit current grants authorise actions.

## Proposed 007 storage and privileges

| Object | Proposed minimum and invariant |
| --- | --- |
| project additions | created_by UUID referencing auth_account and created_at timestamptz, both non-null and immutable after insert. Server actor and SQL decision time supply them; no client authorship assertion. Public Project stays its current four fields. |
| global_project_authority | user_id FK/primary key, can_create boolean and positive bigint revision. No row means deny. Only the private operator may insert/update; runtime SELECT only. No fake global project or role-name mapping. |
| authority_provisioning_audit | Append-only event UUID, target user ID, nullable project ID, exact capability, grant/revoke, old/new authority reference, operator_ref, nonempty reason, database principal, SQL time and correlation ID. Global and project provisioning share this private log; ordinary project audit inspectors receive no access. Runtime has no writes or reads here. |

007 contains only project creator/time, global create authority, private provisioning audit and numeric revision bounds. No mutation-receipt or cursor table belongs to 007. Public mutation replay is a P04 prerequisite, proposed below, and paging uses no per-cursor storage. These are revised proposals, not adopted mechanisms.

Keep original migrations/checksums. New object privileges are explicit; do not grant all future tables automatically. Append-only/immutable triggers also reject accidental privileged updates. These triggers do not constrain a malicious database owner or replace service authorisation. Any SECURITY DEFINER helper must have fixed search_path, PUBLIC execution revoked and only the narrow documented operation; reuse the existing account-lock helper.

Retain capability_grant without adding a membership-generation column: removal invalidates every valid individual grant in the project atomically, grant issuance requires current membership under the project lock, and rejoin never revalidates old rows. Project administrator and membership-manager are explicit project-scoped grants (resource_kind=project, resource_id=project_id); exact action strings must be shared by provisioning, evaluator and tests. Initial creation grants the creator membership-manage once, as selected in ADR-0007; project-administrator provisioning remains explicit and its optional edit action stays unimplemented while FR-64 is unselected. No document capability or restricted read is inferred.

Propose a private operator command for global create authority and project administrator/membership-manager grant/revoke, with nonsecret operator/reason references and expected authority revision. Enabled known accounts only; project grants additionally require active membership. A duplicate grant/revoke is an explicit no-change result, never a fabricated change audit. Revoking a project's last effective membership-manager grant is rejected. No operator password/connection string is passed as a command argument or logged.

## Legacy refusal, rollback and exact revisions

007 must refuse any pre-existing project: creator/time cannot be reconstructed from names or membership. No synthetic creator, guessed timestamp, reset or automatic deletion. Unrelated session data remains valid and is not a reason to refuse. Before P04, its separate replay migration must refuse legacy createProject/addMember/removeMember idempotency rows with outcomes that cannot be established; P03 introduces none of these public mutations.

Use the existing integer wire contract without rounding: read PostgreSQL revisions as decimal strings; validate before converting to Number; require positive values no greater than 9007199254740991. Mutation increments of public project/member/task revisions must not exceed this bound; fail the whole transaction explicitly before writes. 007 adds bounds to applicable revision columns, refusing incompatible retained rows. Internal generations remain exact bigint strings/SQL arithmetic. A later string-revision wire migration is separate scope, not silently introduced here.

007 down refuses retained global authority, provisioning audit or any project data; it never erases that evidence or historical creator identity to succeed. Empty synthetic stores can reverse/forward/repeat. With valuable data use reviewed forward recovery; the existing general rollback command is not routine cleanup. Development DB upgrade is outside the requested adoption batch.

## Single-client authority and mutation protocol

First complete the separately bounded P03A refactor and its session regression, without new schema or public endpoints. Factor the existing session validation into a transaction-scoped function used by both SP-01 and SP-02; keep its public behaviour and stored formats. Check current account/session, SQL deadlines, clock health and recovery state inside the same client transaction as project authority/state. A prior inspect result alone supplies no authority. Persist an observed clock fault without committing project effects; typed denial/fault outcomes and savepoint placement must preserve SP-01's latched fault semantics. Session regression is mandatory after this refactor.

All cooperating paths acquire auth_clock_state first, then validate/lock the actor account/session, then an optional target account, global authority when applicable, project, current membership/capability/read-grant records and affected tasks in task-ID order. Private provisioning uses clock → target account → global authority or project/membership/capability. The shared clock serializes cooperating writers before account acquisition; do not acquire it after project locks. There is no separate sorted-all-accounts-before-session step in the implementation. Reuse existing lock/statement timeouts and connection-discard/unknown-COMMIT behavior. No KDF, external HTTP/provider call or UI wait holds these locks.

The clock singleton serialises authority checks conservatively; no throughput claim is made. Project locking is also mandatory for later assignment, grant issuance and rejoin producers. Permission guarantees do not extend to arbitrary direct SQL with trusted service credentials. Count a manager only when membership is active, the account enabled and the exact membership-manage grant valid. Account disable may make a project temporarily unmanageable; do not bypass disable or invent a successor. Private audited provisioning can restore an enabled member's explicit authority. Changing account-disable policy is not part of SP-02.

| Mutation | Atomic effects after current authority checks |
| --- | --- |
| createProject | Lock/recheck global create authority; allocate UUID; insert creator/time/project, creator membership (descriptive role product_owner), explicit initial grants, minimum business audit and exact receipt. Default descriptive role is no authority source. Reject whitespace-only names in application validation despite the broader schema. |
| addMember | Require current membership-manage; resolve known enabled account without exposing a directory; absent/unknown target uses generic 404. Reject already-active target. New row starts fresh; inactive row advances generation AND revision. Invalidate any retained stale individual grants defensively; no default capability/read grant/task assignment on join or rejoin. Co-commit audit/receipt. |
| removeMember | Current manager, active target and exact expected membership revision required. Under project lock, reject if no other effective manager remains. Deactivate target, advance generation/revision, invalidate all target individual capability/read grants, unassign all currently assigned tasks with exact revision increments, and persist removal plus affected-task audit and receipt. Preserve task states, positions, allocations and all historical events. Any failure rolls everything back. |

Project grants, membership and affected task records are Workspace-owned. These transactions are not a Knowledge query, source transport guard, provider handoff or proof of D-07. After a mutation, no response is successful until COMMIT acknowledgement is known.

## P04 prerequisite: compact immutable outcomes

Source inspection confirms buildApp registers only session handlers and health; P03 adds private provisioning, no public SP-02 mutation. It is safe to defer the public replay store until P04, but implement and test it before enabling createProject, then reuse it for addMember/removeMember. Private provisioning still needs expected-revision checks and unknown-outcome reconciliation: being private does not make retry safe.

Propose extending the existing idempotency_record in a separate additive migration before P04, instead of adding a second receipt table in 007. Reuse actor_id + operation + key, payload_hash, state, result_ref and expiry; add a result status and a typed minimal immutable result snapshot where required. No generic serialized HTTP body, headers, cookies, account metadata or global directory data. Exact SQL shape and privileges must be recorded and checked with P04, not silently inferred from this proposal.

| Committed operation | Minimal saved outcome needed by current contract |
| --- | --- |
| createProject / 201 | Stable project reference plus original project_id, name, description and revision. |
| addMember / 201 | Stable project/user reference plus original project_id, user_id, role and membership revision. |
| removeMember / 204 | Stable project/user reference and committed status; no response body. |

A status + result ID alone prevents duplicate mutation when the consumed key survives, but cannot reconstruct the current 201 Project/Member schemas without mutable reads. Concrete failure: addMember commits role=developer/revision=1, response is lost, target is removed and rejoined as viewer/revision=3, then the old key is retried. Reading the current Member would return a different operation's role/revision; reapplying add would be wrong. A minimal typed snapshot preserves the historical committed result. Replaying only a generic outcome would require a coordinated response-contract/consumer change; it is not a drop-in implementation of current v0.2.10. Byte-identical HTTP serialization is not a business requirement here; stable schema values are sufficient.

Validate/hash operation, exact target IDs, expected revision where applicable and accepted fields/defaults. JSON property order does not change identity; changed role/name/target/precondition does. Recheck current session and operation authority before lookup/disclosure. createProject replay additionally needs current membership of its result project; add/remove replay needs current membership-management, not the stale original target precondition. Return the recorded outcome without reapplying effects; clients refresh separately for current state. Revoked callers cannot retrieve it. Include operation in key scope, not merely actor + key.

Keep consumed identities permanent for these three operations until a safe retention design is selected. This retains some original project/member fields and has real storage/privacy cost; it is not a claim of bounded growth. Protect committed outcomes against rewrite/deletion and constrain operation/result/status consistency. Pending or unknown state cannot authorize fresh execution. Lost COMMIT acknowledgement discards the connection and requires the same key for reconciliation. State, audit and outcome co-commit. Existing protected_handoff claims stay unchanged.

## P04/P05 paging without a cursor table

Preserve paging: listMembers explicitly declares opaque authenticated cursors and malformed/foreign/stale cases, and SP-02 requires a fresh client to page members. ADR-0019 v0.4 remains Proposed and now explicitly excludes login-session identity from cursor binding, following the owner-directed documentation correction. A small expected dataset is not measured evidence and does not waive these existing interface assertions.

Propose a versioned HMAC-authenticated cursor with no per-cursor database row. It binds the authenticated actor, endpoint, project, filter/order/page size, membership/authority generations, expiry and the permitted projection digest; each page independently checks current authority and filters before pagination. No session identity/token is bound or placed in the payload or MAC context; no hidden identity, email or removed-member history belongs in a readable token payload. Use keyed binding fingerprints; include only the already-delivered ordering position, bounded expiry and non-disclosing metadata needed to verify state. A signature authenticates data, it does not encrypt it; the payload must not rely on base64 for confidentiality.

Use a separately configured random signing key of at least 32 bytes, never a DB password or bearer token, loaded through existing private configuration. Stable configuration supports multiple processes; missing/invalid key fails closed for the paging-enabled runtime. Rotation invalidates outstanding cursors and clients restart paging; they never gain permissions through a signature. Bounded token length/schema/expiry and constant-time MAC checking are implementation/test obligations, not proven properties of this design. Initial lifetime five minutes is configurable, not a measured SLA. No cursor cleanup job or table is required.

A valid current session is still required for every request, independently of cursor validation. Relogin as the same actor alone does not invalidate a current, unexpired cursor; a different actor cannot reuse it. Before P04/createProject, explicitly define the listProjects and listMembers watermark/digest, every membership/permission/project/member-field change that invalidates it, and coherent read/compare boundaries. Neither HMAC nor removal of session binding detects dataset changes by itself. These endpoint-specific mechanics remain an open hard gate; no counter column or migration is silently selected here.

For listProjects, order by project_id and use fixed 50-item pages, with no undeclared limit parameter; for listMembers order by user_id and use the declared 1–100/default 50 limit. Compare current authority and projection generation on every page. Malformed/foreign/tampered tokens are generic 400; authenticated expired/changed projections generic 409 without items; revoked project scope takes precedence with generic 404. DB failure is 503, never an empty success. Rotation may produce a generic invalid-cursor 400 and requires restart; do not imply a changed-key signature is authenticated. Successful projection responses use no-store.

Failure example for a raw last-ID cursor: page one is captured, membership is removed/rejoined or the visible set changes before page two, then the old cursor silently continues a different projection. Request-time access filtering can still prevent foreign-project reads, but alone does not satisfy foreign/stale-cursor rejection or multi-page consistency. HMAC binding plus current projection checks addresses those requirements without cursor rows. Deleting pagination entirely or relaxing those assertions would require a separate coordinated scope/contract change.

listProjects still lacks the declared 400/409 errors needed by this scheme. Coordinate those Error responses and exact paging semantics in contract/API/spec before P04. No contract is edited by this design revision. getAllowedActions and member/project lists remain independent authority snapshots, not cross-endpoint transactions.

getAllowedActions implements global/project only. Global lists current implemented session/project-list operations and createProject only with its grant. Project lists getProject/listMembers for members, addMember/removeMember only with current management authority and only after their handlers exist. Omit editProject and every later work/document/AI operation. Unsupported exact scopes disclose nothing and do not trigger Knowledge. IDs never assert authority; unexpected selectors are 400. Refresh after navigation/focus/reconnect/mutation; clear protected UI on sign-out, scope change or denial. Actions remain advisory.

Check permission again immediately before handing an assembled project response to the existing local HTTP adapter; abort if revalidation fails. Transaction locks prove database decision ordering, not exclusion through socket completion. Record that transport boundary explicitly in P04/P07; retain D-07 as open rather than claiming this proposal proves protected source handoff. Already delivered bytes cannot be recalled.

## Bootstrap and alternatives

Bootstrap is private and explicit: an authorised operator uses the existing SP-01 account tooling to provision or identify an enabled account, then the new P03 operator command grants global create-project authority with expected revision/absence and mandatory audit/reason. No default admin, hardcoded password, public bootstrap endpoint, empty-table auto-grant or role-name bypass. The operator credential is already the private migration/operations identity; an unauthenticated browser cannot bootstrap itself. Granting create authority does not create a project in P03. At P04, the first authorised create atomically adds its creator membership and initial membership-manage grant.

A missing/uninitialised operator or account leaves authority denied and requires explicit setup; operator errors/unknown acknowledgements require inspecting the same target/revision/audit evidence before retry. Project-manager provisioning requires an existing current membership; last-manager revocation is rejected under project lock. Account disable can still leave no enabled manager as previously documented; bootstrap must not bypass a disabled identity.

The owner-supplied brainstorming retains creator/time, global authority/audit and same-transaction checks; these fit the source constraints. Project row locking and DB CHECK revision bounds were already present in v0.1, not newly discovered missing mechanisms. P03A separation and explicit bootstrap improve the implementation handoff. Moving replay to P04 and replacing cursor storage reduce 007 while preserving requirements.

Role-wide grants, a sentinel global project, unrestricted offsets and reconstructing old outcomes from current entities do not preserve the selected boundaries. HMAC cursors trade DB rows/cleanup for signing-key configuration/rotation; this alternative remains Proposed. Minimal immutable outcome snapshots trade modest retained data for unchanged response contracts. Coarse existing clock locking remains a throughput limitation to measure; neither this proposal nor a future cache removes the need for authority/race tests.

## Verification and adoption gate

All runtime checks below are Planned, not executed by this design:

| Task / requirement | Required assertion and boundary |
| --- | --- |
| P03 / AC-02/03 | Real disposable PostgreSQL; 007 forward/reverse/repeat and original 001–006 hashes; legacy refusal; runtime cannot provision global authority or rewrite provisioning audit; owner/runtime isolation; missing/disabled/expired/unhealthy authority denies; audit failure rolls back provisioning; explicit bootstrap, absent/wrong operator, disabled target, stale grant revision and lost-ack reconciliation. |
| P03A / SP-01 regression | No migration/new endpoint; preserve login/inspection/renewal/logout/disable and clock-fault persistence, rollback and unknown commit behaviour while enabling same-client authority checks; actual session suites must pass before P03 proceeds. |
| P04/P05 / AC-02/03/38 | Actual HTTPS handlers and exact contract responses; forged actor/role rejected; creator/time persisted server-side; identical-role users differ by grants; unknown/nonmember identical 404; new/rejoining member gets no old capability/read/assignment; fresh-client list reconstructs stored state. |
| P06/P07 / AC-39 | Two-manager concurrent removals allow at most one; revoke/grant/assignment/rejoin barriers; stale precondition after rejoin fails; audit/receipt failure leaves all state unchanged; other projects/history unchanged. Preserve last-manager rejection even through private grant revocation. |
| P04–P07 / replay/discovery | Concurrent duplicate, changed payload, lost acknowledgement and restart; current authority loss denies replay; same-key removal cannot remove rejoined membership; minimal original snapshots after remove/rejoin/current-state edits; no public write before durable replay support; signed cursor forgery, readable-payload non-disclosure, missing/rotated key, foreign actor/scope/limit/expiry/change/revocation, valid same-actor relogin without session-only invalidation; malformed/changed listProjects matches coordinated contract. |
| P07/P08 | SP-01 regressions after session reuse; exact max-safe-boundary/overflow; no tokens/credentials/emails in logs; measured response-handoff boundary; UI denial/conflict clearing and keyboard/browser evidence separately. |

Planned runtime files: tests/workspace/project-authority.test.mjs, project-http.test.mjs, membership-lifecycle.test.mjs, project-ui.test.mjs; command: Node 24+ --test --test-concurrency=1 against each implemented suite, plus existing session suites. These files/commands add no test pass until authored and executed. No development database, real external data or provider run is needed.

**Checklist:** Pass for bounded context, ownership, interfaces, lock/replay/legacy reasoning and trace; Gap for SQL/driver/HTTP/race/UI evidence, precise transport adoption and owner schema disposition. Architecture/blueprint prompts and relevant workbook concern/data/interface/decision rows were inspected as author guidance; no standards-conformance or independent-review claim.

**Handoff:** Request one bounded owner decision on P03A session refactor and reduced 007/P03 private authority/storage/bootstrap integration plus disposable tests. P04 must finalize/test the compact replay extension and HMAC cursor design before public mutation/list adoption; moving work is not permission to omit it. The proposed listProjects 400/409 coordination is identified now but must be registered in affected canonical contract/API/spec before P04. This is not acceptance of all ADR-0019/0024/0025/0026, optional FR-64, a development upgrade or a commit/push.

## Revision 0.2 disposition

Owner-supplied brainstorming was checked against SP-02 v0.5, Workspace v0.2.10, buildApp, session store/operator and migrations. It is external review input, not independent code review or owner implementation approval. Revised proposals remove both receipt/cursor tables from 007, place compact outcomes before P04 public writes, propose table-free authenticated paging, split P03A and specify bootstrap. Canonical business rules and public schemas remain unchanged.

## Change log — revision 0.3

31 October 2026: remove SP-02 pagination cursor/session binding, aligning Proposed ADR-0019 v0.4 with the spec and OpenAPI, which do not require it. Actor/generation/route/filter/order/page size/dataset/expiry and current-session authentication remain. Source dependency review distinguishes pagination from separately session-bound command preconditions and AI handoffs; those bindings are unchanged. Endpoint watermarks and signing-key/error policy remain hard prerequisites before P04, not a runtime/schema adoption.

## P04A bounded mechanics for authorised implementation

Use a keyed digest over the complete canonical ordered authorised projection, actor membership generations/revisions and relevant capability validity/revisions for BOTH listProjects and listMembers; read/filter/hash under the same clock/account/session/project transaction protocol. This adds no counter columns and costs a full eligible projection read per page; capacity is unmeasured. Cooperating writers take the same clock/project locks. One configured kid + 32-byte base64 key (private JSON environment value), no previous key ring. Unknown kid/MAC failure 400; verified expiry/dataset change 409; missing/invalid server key 503. No session binding; current session required each request. Initial cursor TTL 300 seconds, configurable. Compact outcome extension is separate 008; original Project/Member fields retained until separately selected safe retention. These bounded mechanics follow the owner’s sequential implementation instruction; no new service/dependency.

007 down only removes its own additions and refuses retained authority/audit/project rows. SP-01 state is untouched and tested. This authorisation is not formal whole-ADR acceptance or permission for development upgrades.

## Revision 0.4 — bounded execution reconciliation, 1 November 2026

The owner's sequential implementation instruction adopts the bounded P03A/007 plus separate 008 and public SP-02 implementation for disposable verification. This remains a Proposed ADR; no whole-ADR acceptance or development upgrade is inferred. Earlier proposed/unimplemented statements describe the design-time snapshot, superseded for current execution status by this section and FEAT-SP02-01.

Actual lock order is the shared auth_clock_state row first, actor account/session validation next, optional target account, project, current membership/capability rows, and affected tasks sorted by task_id. Private provisioning uses the same clock first, target account, global authority or project/membership/capability. It does not first sort every participating account before the session. The shared clock serializes cooperating authority/account/membership writers, preventing crossed actor/target account deadlocks in this implementation. No guarantee is claimed for arbitrary SQL writers that ignore this protocol. Session/time are rechecked after project waits before business writes/response; typed denial commits a clock-fault latch without business effects. P07 has real barrier evidence and labels future SP-04/SP-06 SQL doubles.

Both endpoint watermarks are complete keyed projection digests; exact fields and one-key/kid/error policy are implemented as recorded in P04A. 007 and 008 remain separate immutable migration files. Browser recovery stores one actor-bound pending request identity/payload in tab session storage before sending; no credential, fetched list or bearer grant is cached there. Confirmed explicit sign-out clears it. Expiry hides protected UI and allows same-actor sign-in to check the original key. Current permission denial does not prove an earlier uncertain operation rolled back.
