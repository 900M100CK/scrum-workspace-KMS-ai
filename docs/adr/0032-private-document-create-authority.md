# Private project document-create provisioning

**Artifact ID:** ADR-0032\
**Version/date:** 0.1 Proposed · 7 November 2026
**Status:** Proposed implementation mechanics for selected B01 only; no runtime or whole-ADR acceptance.\
**Inputs:** PRD-01 v0.10.3; SP-06 v0.6.4; ADR-0007/0011/0017 owner-confirmed directions; FEAT-SP06-01 v0.3; [exact B01 owner receipt](../implementation/features/sp-06-document-access/evidence/p01a-20261107/owner-selection.json); existing private operator/013 predicate convention.\
**Trace:** FR/AC-10 and supporting04/31/39/59/68; BR-01/04/10/11/14; SC-06.

## Context and bounded decision

The owner explicitly chose private per-member provisioning, with operation recording. Existing WorkspaceProjectOperator uses the operator database identity and owned transaction, checks enabled current membership, compares grant revision and co-commits append-only private provisioning audit. It does not yet support document-create authority. Runtime cannot read that private audit. Reuse this pattern; add no service, public operation, delegation UI or role policy.

Propose project-scoped action knowledge-author solely for createDocument. It does not grant document-read, content-write, manage-access, lifecycle, or any task/Sprint action. Initial document author capabilities and restricted-author read are later creation-time defaults under ADR-0007, never reconstructed from the project grant, authorship, descriptive role or rejoin. Runtime protected creation still requires a current valid session, enabled account, current project membership and provenanced exact create grant. The predicate described below is not a substitute for those enclosing checks.

## Storage and private/runtime boundaries

Reserve additive Workspace014-document-create-authority for P03-A only: extend the existing provisioning-audit action check with knowledge-author, preserving every earlier allowed action; require its resource_kind=project/resource_id=project_id and existing safe revision bound; allow at most one valid grant for that actor/project/action. Add a trigger which applies when either OLD or NEW is knowledge-author: only workspace_owner may create/retarget/revalidate it, or change another action into/out of it. Runtime may only invalidate a previously valid exact grant with every identity field unchanged and permission_revision advanced by one, preserving current membership-removal semantics. Runtime DELETE or other privilege changes must not bypass the trigger.

Expose only workspace.has_document_create_authority(actor uuid,project uuid) returning boolean, using SECURITY DEFINER with fixed pg_catalog search_path and fully qualified Workspace names. REVOKE PUBLIC execute; grant execute to workspace_app only. Match a valid exact project knowledge-author grant to its allowed private issuance event using event_id=grant_id, target user/project/action and equal issuance revision. Never grant runtime SELECT on provisioning audit or return private reasons, references or grant inventories. Unknown/missing/mismatched provenance denies. Remove/rejoin never revives invalid grants; account/session/membership validity remains the caller's responsibility.

P04 extends the existing private operator/CLI allowlist with this one action. Preserve lock ordering, enabled membership and expected revision checks. On allowance, the same event ID binds grant_id and its private issuance audit. Revoke co-commits the corresponding audit. An identical provenanced request is a no-op; stale revisions reject. Existing unprovenanced knowledge-author rows refuse grant/revoke/no-op and require explicit owner/operator reconciliation, never silent adoption. No automatic grant on startup, project creation or member rejoin. No new public discovery operation is advertised before its producer exists.

014 down must first refuse any knowledge-author capability or provisioning/business-audit evidence; no deletion to bypass refusal. Empty down removes only the new helper/index/scope/trigger and restores the prior audit action check. Prior001–013 remain byte-identical. Knowledge migration and creation/policy receipt schema are outside this increment. The private app identity must retain its existing inability to read private audit.

## Alternatives and consequences

Giving every member or Admin create authority contradicts the selected explicit grant. A public delegation UI adds policy/scope. Copying audit data or granting runtime audit SELECT discloses operator information. A narrow boolean predicate reuses013's existing pattern with no cross-service database access; it requires actual runtime-role tests. An in-memory grant list or structural allowlist does not establish persisted authority.

## Verification and handoff

P03-A: disposable014 up/down/repeat; existing action preservation; wrong scope/revision/duplicate current grant rejected; runtime insert/retarget/revalidate/delete denied; membership-style invalidation succeeds; exact versus forged issuance predicate; PUBLIC/other-service role execution and runtime audit SELECT denied; rollback refuses retained evidence. P04: private grant/revoke/stale/no-op, disabled/nonmember/cross-project, same-role different grants, audit failure rollback, removal/grant race and rejoin. Preserve old schema-ceiling fixtures. No tests executed by this proposal.

B01 is selected; these bounded engineering mechanics remain Proposed until implemented/tested under their tasks. B02 projection and B03 service/guard choices remain open. No authority or source response is implemented here. **Checklist:** context/decision/alternatives/consequences/trace specified; Gap for real storage/operator/permission proof. **Handoff:** P03-A then P04; P05/P06+ keep their independent decision gates.
