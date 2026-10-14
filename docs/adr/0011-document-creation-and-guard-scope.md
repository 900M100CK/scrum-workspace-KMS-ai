# Workspace-first creation and protected handoff guard scope

**Artifact ID:** ADR-0011\
**Version/date:** 0.1 · 13 October 2026\
**Status:** Owner-confirmed direction; cleanup protocol and application implementation pending. No owner commit or independent approval claimed.\
**Inputs:** SAD-03 v0.6; ADR-0002/0006; [owner input](../../owner-decisions-OD-02-03-04-11.md); [BA-D04/BA-D05](../analyst/business-review-2026-10-13.md).\
**Trace:** BR-01, BR-05, BR-10, BR-14; FR-10, FR-14, FR-28, FR-29, FR-55, FR-59; SC-05, SC-06.

## Creation decision

Workspace authenticates the requester, checks creation authority, allocates the stable document ID, and commits document policy, initial scoped capabilities and any restricted-author read grant in its own transaction. Use the existing physical `document_policy.permission_revision` as the logical ACL revision; do not create a second permission authority column.

The gateway calls Knowledge to persist initial Current content and passages. Creation is idempotent on the stable document identity and scoped client idempotency key. Workspace must bind the key to the allocated ID and request payload so a retry does not allocate a second ID or accept changed content. Knowledge also checks the immutable operation identity and payload. No later Workspace activation step is required.

An ACL without Knowledge content reveals no document: missing content and unknown/denied public reads share the generic response. Audit ownership stays separate and is correlated by document/run IDs. No cross-service database write or join is introduced.

A timeout leaves an uncertain creation outcome and is reconciled by retry/status under the same operation identity. A one-time “no content” observation is insufficient authority to delete an orphan ACL while a delayed create can still commit. The proposed sweep must prove the operation cannot later persist before physical cleanup, with retry and crash tests. Until that protocol is specified, retain inaccessible orphan policy records for reconciliation; do not invent an age threshold or implement unsafe deletion. This is an explicit remaining design gap.

## Guard decision

Amend the input's narrow “only Flow 4” wording per the owner's explicit clarification: protect all protected content/metadata response handoffs, including source and citation reads, as well as provider input and AI answer delivery. Permission/session and lifecycle changes use the corresponding guard. Lifecycle changes commit only in Knowledge; unknown remote-write outcomes block affected handoffs until reconciled.

Internal read-only policy and operational-state endpoints read committed data without acquiring the project guard again. Their service authentication, actor scope and resource authorisation still apply. An internal path is not automatically exempt from content protection. Workspace's final authority check inside a held guard is in-process, not an HTTP self-call. Map this rule to actual contract operation IDs; the input's `/internal/policy/*` and `/internal/state/*` are illustrative names, not permission to invent routes.

Hold the guard from final session/access/version validation through transport handoff or confirmed abort; generation waiting stays outside. Buffer generated output and validate all evidence, including uncited input. Revocation success means its commit occurs after prior protected handoffs finish/abort. Aborted sends cannot resume. This protects server handoff, not receipt/rendering; already transmitted data cannot be recalled.

## Verification and alternatives

- T-1: with a handoff holding the guard, ten internal policy reads finish within the configured policy timeout without recursive lock acquisition.
- T-2: revocation waits for held handoff completion/abort, then commits; repeat for source, citation and AI response surfaces.
- T-3: crash after Workspace creation commit but before Knowledge persist; same-key retry produces exactly one document/version and unchanged policy/grants.
- T-4: an orphan ACL and an unknown document produce identical public read responses.
- T-5: a cleanup candidate races a delayed/retried create; no deletion of policy for committed content and no resurrected cancelled operation. Requires the pending cleanup protocol.

Check-then-send alone leaves the revocation race. Holding the guard for full generation delays unrelated work. Recursive guarded callbacks can deadlock. These tests must exercise real concurrent handlers; TODOs or SQL shape tests cannot prove them.

**Checklist:** Pass for owner-confirmed guard and creation direction; Gap for cleanup protocol, transport abort/restart and real concurrency evidence. **Handoff:** amend ADR-0002/0006 references, SAD/contracts/data/specs and test plan. Preserve independent keyword fallback and explicit AI failure; automatic redirection and provider selection remain unadopted.
