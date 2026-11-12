# SP-07 Feature Entry: Revise and retire a knowledge version

**Artifact ID:** FEAT-SP07-ENTRY  
**Version/date:** 0.1 Draft · 11 November 2026  
**Status:** In progress; planning and source readiness  
**Inputs:** [SP-07 canonical spec](../../../specs/007-version-publication.md) v0.6.3; [PRD-01](../../sdlc/PRD_SRS.md) v0.10.3; [architecture](../../architecture.md); [contracts](../../../contracts/README.md); [PLAN-01](../../planning/five-month-plan.md); Proposed ADR-0009/0011/0013/0019/0022/0033.  
**Trace:** FR-11, FR-12, FR-13, FR-15, FR-19, FR-47, FR-48, FR-61; BR-05, BR-07, BR-12, BR-14; SC-05, SC-06.  
**Owner role:** Sequential implementer.  

## Goal, scope and parent registration

- **Observable outcome:** Atomic creation of new Current versions with supersession of old Current; explicit labelled version history (`current`, `superseded`, `archived`) without content rewriting; archiving of versions and documents; dual-layer authorization (Project scope + Document scope) for version history; CAS aggregate revision check; and client UI for version traversal, revision authoring, and archiving.
- **Non-goals:** AI search or vector embeddings (SP-08/SP-09); meeting AI or transcription; separate Draft or Publish state (FR-45 Withdrawn; immediate Current revision only); cross-service direct DB access; unauthenticated version history browsing.
- **Parent PLAN-01 section:** Month 2 — Knowledge versioning and publication.
- **Parent roadmap milestone:** M-05 — Knowledge publication and version lifecycle.
- **Canonical spec:** [specs/007-version-publication.md](../../../specs/007-version-publication.md).
- **Owning work plan:** [plan.md](plan.md) (owns mutable task status).
- **Work breakdown structure:** [breakdown.md](breakdown.md).
