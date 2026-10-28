# SP-02 P01 source/contract review

**Artifact ID:** SP02-P01-REVIEW\
**Version/date:** 0.1 Draft · 28 October 2026\
**Status:** Source inspection only; SP-02 application handlers verified: 0.\
**Inputs:** [FEAT-SP02-01](plan.md) v0.1; SP-02 v0.5; Workspace v0.2.10; migrations 001–006; ADR-0007/0017 and Proposed ADR-0019.\
**Trace:** SP-02.1; AC-02/03/38/39; BR-01/10/14.

## Findings that control the first slice

1. Global create-project authority has no current persistence representation: capability_grant.project_id is non-null and references an existing project. A descriptive Workspace Admin/role string must not be substituted. D-03 requires a concrete provisioning decision.
2. Project currently stores project_id/name/description/revision, while UC-02 creation records creator identity/time. An additive design and explicit legacy-data treatment are required; old migrations cannot be edited.
3. Business audit requires project_id, so a global authority provisioning audit cannot be forced into an invented sentinel project. Propose private/global audit representation and least privileges with the schema design.
4. Creator's initial membership-manage is already selected by ADR-0007. It is not permanent creator authority and must not revive on rejoin. Membership generations/revisions and grant invalidation are present, but no SP-02 runtime implementation or serialized last-manager test exists.
5. AddMember accepts a known account and descriptive role; no global directory/invitation/delegation UI is declared. Use auth_account as the current known-account source without exposing credentials or user existence to unauthorized callers.
6. Exact schema names are CreateProject/AddMember/EditProject/Project/Member. Idempotency-Key is required for mutations, removal additionally requires X-Expected-Revision. listProjects has cursor only; listMembers adds limit 1–100/default 50. Do not invent a shared limit field without a coordinated contract change.
7. getProject is an existing FR-03 contract and fresh-client dependency omitted from the pack's brief operation list; include it in the plan, not a new endpoint. getAllowedActions contains other future scopes; bounded SP-02 must not pretend those unimplemented permissions are grants.
8. idempotency_record stores actor/operation/key/hash/state/result_ref. Its exact immutable response/replay/current-authority policy and retention need selection/testing; timeout remains unknown, never automatic fresh-key retry.
9. ADR-0019 cursor binding/projection details and D-07 handoff remain Proposed. Database serialization alone cannot prove check-through-network-send or future Knowledge access.

## Disposition

P01 source review is recorded. P02 can prepare contract negatives and a decision batch without application dependency/schema adoption. P03 is gated on material authority/discovery/persistence dispositions. No SP-02 permission/runtime result is claimed.

## Subsequent D-03 disposition

The owner selected private audited explicit provisioning in the linked decision batch. Global representation/audit/schema/transaction mechanics and D-04 are still design gates; initial findings are source observations, not evidence of implementation.

## P02 schema observations

The actual CreateProject schema accepts whitespace-only names (minLength alone), while owning DB/business validation must reject them. Project/Member integer revisions have no JavaScript-safe upper bound in the contract: exact PostgreSQL bigint response/precondition transport needs an explicit policy and tests before P04. These are recorded gaps, not permission to weaken the wire contract or fabricate runtime passes. The six preparation tests assert these existing limitations instead of hiding them.
