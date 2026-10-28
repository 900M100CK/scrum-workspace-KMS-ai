# SP-02 bounded owner decision proposal

**Artifact ID:** SP02-DECISION-BATCH\
**Version/date:** 0.1 Draft · 28 October 2026\
**Status:** D-03 private explicit provisioning direction owner-confirmed; D-04 and schema/implementation disposition pending.\
**Inputs:** [FEAT-SP02-01](plan.md) v0.1; [P01 review](p01-source-review.md) v0.1; ADR-0007/0017; Proposed ADR-0019 v0.3; D-03/D-04.\
**Trace:** SP-02.1; FR-02/03/38/39; BR-01/10/14.

## A — Private explicit provisioning (recommended, awaiting owner)

Use a private operator tool, outside public HTTP, to explicitly grant/revoke global create-project authority and scoped project-administrator/membership-manager capabilities. Every change has mandatory owning-service audit and reason/operator identity. Keep already-selected creator initial membership-manage, default deny, no role-name bypass, no restricted read inheritance and no rejoin revival. Do not add an administrative/delegation UI. Inspector/content/lifecycle grant adoption beyond SP-02 remains separately gated. This is a policy proposal, not permission to write its schema now.

## B — Bounded existing discovery (recommended, awaiting owner)

Authorise detailed implementation/testing of the existing project reads, listMembers and global/project applicable getAllowedActions per current contract/ADR-0019. Minimal current-member IDs/descriptive roles/revisions, opaque actor/scope-bound paging with current-authority recheck, no emails/global directory/grant reasons. Actions are advisory and every handler rechecks real authority. Other resource-scope implementations stay later; unavailable/unimplemented authority fails closed. Do not Accept the whole ADR or fabricate support for future resources.

## Next concrete design gate

After A/B disposition, prepare one additive migration-007/transaction design: global authority representation and audit, creator/time, initial project membership/grants, lock order, immutable idempotent response/reconciliation and cursor identity/revocation. Identify legacy refusal/reconciliation, forward/reverse/repeat and real role/failure/race assertions before asking for the bounded schema/implementation decision. No old migration edit or development upgrade follows from generic continuation. FR-64 remains unselected optional work.

Owner response and its scope must be recorded here before dependent implementation. Independent source/schema-only preparation may continue.

## Owner disposition — D-03

28 October 2026: the owner selected “Chốt công cụ riêng và quyền tường minh (khuyến nghị)” in direct response to proposal A. This selects private audited explicit create-project and project membership-management provisioning, retains initial creator/default-deny/no-role-bypass/no-rejoin-revival and excludes a new delegation UI. It does not approve a migration, add inspector/content/lifecycle scope or Accept an ADR. D-04 remains pending.
