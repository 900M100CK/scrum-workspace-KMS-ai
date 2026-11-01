# SP-02 bounded owner decision proposal

**Artifact ID:** SP02-DECISION-BATCH\
**Version/date:** 0.6 Draft · 1 November 2026\
**Status:** D-03 and bounded D-04 information scope owner-confirmed; bounded sequential implementation owner-authorised; formal ADR/deployment acceptance remains open.\
**Inputs:** [FEAT-SP02-01](plan.md) v0.6; [P01 review](p01-source-review.md) v0.1; ADR-0007/0017; Proposed ADR-0019 v0.4 and ADR-0026 v0.4; D-03/D-04.\
**Trace:** SP-02.1; FR-02/03/38/39; BR-01/10/14.

## A — Private explicit provisioning (direction selected)

Use a private operator tool, outside public HTTP, to explicitly grant/revoke global create-project authority and scoped project-administrator/membership-manager capabilities. Every change has mandatory owning-service audit and reason/operator identity. Keep already-selected creator initial membership-manage, default deny, no role-name bypass, no restricted read inheritance and no rejoin revival. Do not add an administrative/delegation UI. Inspector/content/lifecycle grant adoption beyond SP-02 remains separately gated. This is a policy proposal, not permission to write its schema now.

## B — Bounded existing discovery (information scope selected)

Authorise detailed implementation/testing of the existing project reads, listMembers and global/project applicable getAllowedActions per current contract/ADR-0019. Minimal current-member IDs/descriptive roles/revisions, opaque actor/scope-bound paging with current-authority recheck, no emails/global directory/grant reasons. Actions are advisory and every handler rechecks real authority. Other resource-scope implementations stay later; unavailable/unimplemented authority fails closed. Do not Accept the whole ADR or fabricate support for future resources.

## Next concrete design gate

After A/B disposition, prepare one additive migration-007/transaction design: global authority representation and audit, creator/time, initial project membership/grants, lock order, immutable idempotent response/reconciliation and cursor identity/revocation. Identify legacy refusal/reconciliation, forward/reverse/repeat and real role/failure/race assertions before asking for the bounded schema/implementation decision. No old migration edit or development upgrade follows from generic continuation. FR-64 remains unselected optional work.

Owner response and its scope must be recorded here before dependent implementation. Independent source/schema-only preparation may continue.

## Owner disposition — D-03

28 October 2026: the owner selected “Chốt công cụ riêng và quyền tường minh (khuyến nghị)” in direct response to proposal A. This selects private audited explicit create-project and project membership-management provisioning, retains initial creator/default-deny/no-role-bypass/no-rejoin-revival and excludes a new delegation UI. It does not approve a migration, add inspector/content/lifecycle scope or Accept an ADR. D-04 remains pending.

## Owner disposition — bounded D-04 information scope

31 October 2026: after clarifying “SP-02”, the owner answered “Chọn phương án đề xuất” to this exact question: “Với SP-02, bạn chọn cách hiển thị danh sách và quyền thao tác nào? Đề xuất là chỉ hiện dự án người dùng đang tham gia, danh sách thành viên gồm mã/role mô tả/phiên bản; không hiện email hay danh bạ toàn hệ thống. Mỗi yêu cầu vẫn kiểm tra quyền hiện tại.” This selects that information scope. It does not select cursor persistence, schema/transaction/transport mechanics or Accept all ADR-0019 resource scopes. The earlier D-04-pending sentence is the 28 October snapshot.

## Revised concrete adoption batch for P03A/P03

[ADR-0026 v0.3](../../../adr/0026-project-membership-foundation.md) proposes P03A session-transaction refactor/regression first, then reduced 007/P03: immutable project creator/time, explicit global create authority, private append-only provisioning audit, revision CHECK bounds and explicit private first-authority bootstrap. Project row locking and last-manager/removal/rejoin safeguards remain unchanged. No receipt/cursor table or public SP-02 write endpoint belongs to P03.

Public replay is deferred to P04 before createProject is enabled. Proposed compact extension of existing idempotency_record retains permanent consumed identities and minimal original Project/Member field snapshots required by current 201 schemas; status/ID-only replay would need a coordinated contract change. No generic HTTP body/header storage. Paging is retained but proposes signed actor/scope/projection-bound cursors without login-session identity without a per-cursor table. listProjects 400/409 and exact P04 mechanics must be coordinated before their implementation.

The owner supplied brainstorming based on the Vietnamese brief, explicitly acknowledging missing ADR/spec/code context. This is review input and a request for source reconciliation, not migration/refactor approval or independent code review. P03A/P03 remain unstarted. The revised owner brief lists the remaining bounded decision; no optional FR-64, Accepted ADR, development upgrade, deletion, commit or push follows.

Owner decision requested after preparation verification: authorise P03A and reduced 007/P03 private authority/bootstrap with disposable tests, or request a specific adjustment. The later replay/paging work cannot be omitted because it moved out of 007.

## Owner-directed cursor correction

31 October: the owner explicitly requested removal of SP-02 cursor/session binding and alignment of Proposed ADR-0019/0026 after checking other consumers, with no code change. The dependency review found no distinct pagination feature requiring same-session binding, so ADR-0019 v0.4 corrects the shared paging rule and ADR-0026 v0.3 follows it. Authentication still requires a valid session; separate command-token and protected-handoff bindings remain unchanged. Per-endpoint actor/membership/permission/dataset watermarks, expiry, signing-key/error policy and P04 contract coordination remain required before implementation. This direction approves the documentation correction, not P03A/007 implementation.

## Owner authorisation — sequential implementation

31 October: the owner instructed “ok bạn có thể triển khai sửa và task rồi triển khai các tasks lần lượt”. Bounded adoption is authorised after fixing the five breakdown findings: separate P04 design/outcome/create/read tasks, P05 ownership of add/rejoin, honest later-feature concurrency follow-up, explicit P03 migration safety tests and current task source versions. Proceed sequentially without repeat child approvals. No accepted-ADR declaration, optional FR-64, development migration, data reset, agents, commit or push follows.

## P04A bounded mechanics for authorised implementation

Use a keyed digest over the complete canonical ordered authorised projection, actor membership generations/revisions and relevant capability validity/revisions for BOTH listProjects and listMembers; read/filter/hash under the same clock/account/session/project transaction protocol. This adds no counter columns and costs a full eligible projection read per page; capacity is unmeasured. Cooperating writers take the same clock/project locks. One configured kid + 32-byte base64 key (private JSON environment value), no previous key ring. Unknown kid/MAC failure 400; verified expiry/dataset change 409; missing/invalid server key 503. No session binding; current session required each request. Initial cursor TTL 300 seconds, configurable. Compact outcome extension is separate 008; original Project/Member fields retained until separately selected safe retention. These bounded mechanics follow the owner’s sequential implementation instruction; no new service/dependency.

1 November execution reconciliation: P03A–P07 actual results and P08 DOM/browser evidence are in the parent plan/report. Historical pending-adoption language above is superseded only for the bounded owner-authorised SP-02 implementation, not whole ADR or release acceptance.
