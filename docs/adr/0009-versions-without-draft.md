# Immutable revisions become Current immediately

**Artifact ID:** ADR-0009\
**Version/date:** 0.1 · 13 October 2026\
**Status:** Owner-confirmed direction; migration and downstream reconciliation pending. No owner commit or independent approval claimed.\
**Inputs:** BRD v1.0 BR-05; PRD-01 v0.4; [owner input](../../owner-decisions-OD-02-03-04-11.md); [BA-D01](../analyst/business-review-2026-10-13.md).\
**Trace:** OD-04; FR-11–FR-13, FR-19, FR-45, FR-47, FR-48, FR-61; SC-05, SC-06.

## Decision

Product version states are Current, Superseded and Archived. There is no unpublished Draft state or separate publish operation in this release. Initial creation and each content revision create a new immutable Current version. On revision, supersede the previous Current and install the new Current in one Knowledge transaction after Workspace authorises content-write. Existing content and passage locators are never rewritten.

Ordinary retrieval admits only permitted Current content. Explicit historical retrieval labels Superseded and Archived versions. Archive permits Current/Superseded → Archived. Deletion stops active reads and new answer support at the protected boundary; tombstones prevent obsolete index work from reviving evidence. Physical purge is retryable; duration remains undecided and is not a Core completion gate.

Exact citations retain document/version/passage identities. Never substitute another version. A caller entitled to the surviving historical identity can receive a specific Unavailable state; otherwise preserve the generic non-disclosing read response. ADR-0013 resolves entitlement using current membership and the retained document-read policy; deletion does not grant content access. Physical retention remains open.

Withdraw FR-45 while retaining its ID as a historical row. Do not reuse it. Active requirements become 68, expected delivery counts 54 P0 / 13 P1 / 1 P2. Recompute these counts from revised artifacts before reporting them as verified.

## Migration and consequences

Review-before-publish is deferred outside this release. The existing applied `001-store` migrations remain immutable. Add reversible migrations and update database tests. Upgrade must not silently publish, delete or relabel existing Draft evidence: detect incompatible rows and fail transactionally with a reconciliation requirement. The same rule applies to unresolved old pending registrations. Test rejected upgrade and preserved data, not only fresh installation.

Compare the alternative Draft workflow: it requires a publication capability, unpublished read rules, UI and fixtures absent from the original BRD. Immediate revision preserves required immutable history with fewer product steps. It also means a successful authorised edit changes the current retrieval source immediately; the editor must make that visible.

**Checklist:** Pass for owner direction, trace and migration safety; Gap for implementation, remaining retention/identity policy and end-to-end evidence. **Handoff:** update PRD, SP-07, API/data contracts, UX/diagrams, evaluation fixtures and validators together; distinguish document status Draft in development artifacts from the removed product state.
