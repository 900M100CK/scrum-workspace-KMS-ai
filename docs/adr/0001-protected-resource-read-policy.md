# ADR-0001 — Protected resource disclosure, read boundaries and Draft visibility

**13 October amendment:** [ADR-0007](0007-document-access-model.md) records the owner's access direction and initial restricted-author grant. [ADR-0009](0009-versions-without-draft.md) supersedes the Draft/publication proposal below. The original proposal is retained for history; it is not the current target lifecycle. Disclosure and whole-answer withholding safeguards remain.

**Version/date:** 0.3 · 16 October 2026
**Status:** Superseded in part by ADR-0007 and ADR-0009; remaining disclosure safeguards are Proposed under OD-02/OD-04.
**Inputs:** BRD English v1.0 via [stable entry](../BRD.md), AGENTS.md v1.2, [PRD-01 v0.3](../sdlc/PRD_SRS.md), owner's review of PRD v0.1 and [v0.3 patch list](../analyst/PRD_SRS_v0.3_patch.md), applied on 8 October 2026. Applying proposed policies does not approve them.  
**Related requirements:** BR-01, BR-05, BR-08, BR-10, BR-12, BR-14; FR-04, FR-10–FR-12, FR-14, FR-17, FR-19, FR-28, FR-29, FR-38, FR-39, FR-45, FR-47, FR-50–FR-52, FR-55, FR-59, FR-61; SC-05, SC-06.

## Context

BRD requires no disclosure of restricted content or metadata. Earlier PRD drafts left existence disclosure, grant revival on rejoining and unpublished revision visibility underspecified. Citations do not establish every sentence's dependency on model context: output may use a revoked source without citing it. A cached or in-flight result must not bypass current permission. No implementation establishes enforcement evidence.

## Proposed decision

For authenticated public resource reads, inaccessible and unknown identities return the same not-found-equivalent status, body/schema and unavailable UI message. HTTP maps this response to 404. No source title, owner, version, excerpt or hidden-resource count distinguishes the cases. Unauthenticated operations still require sign-in; access-check infrastructure errors deny protected output and may show a generic service error without naming a resource.

Document access management is a scoped capability, distinct from content read and Scrum accountability. Current project membership remains necessary under the draft project-shared/restricted model. Removing a member invalidates that member's document-read grants; rejoining restores only project-shared access and requires new restricted grants. At creation, the author explicitly chooses project-shared or restricted; omission rejects creation. Later classification changes require manage-access authority. Classification, granting and revoking are human operations with audit events. These proposals remain OD-02.

Test revocation at renewed protected reads, before model-context submission, before answer delivery and at citation opening. Revoke-before-submission excludes the source from context. If any source in the answer's evidence set is revoked before delivery, withhold the entire original draft or regenerate solely from remaining permitted evidence; deliver no original draft text. Claim-level filtering cannot guarantee that output omits uncited revoked context. Retrying cannot broaden access. Already transmitted data cannot be recalled. SAD must define enforcement and index/cache invalidation; this ADR selects no services, locks, database or provider.

The initial version is Current. Revision creates an immutable Draft; publishing it makes it Current and the prior Current Superseded. Draft is excluded from current/historical retrieval and model input; direct access requires current project membership and content-write authority. Draft is labelled unpublished, while Superseded/Archived content is historical. Full transitions, publication authority and retention remain proposed under OD-04.

An unavailable historical citation never substitutes another version. Only users permitted to see surviving citation identity may receive the specific Unavailable state; other requesters receive the generic read response. OD-04 must determine those identity/retention rights.

## Alternatives

| Alternative | Assessment |
| --- | --- |
| Distinct 403 for restricted resources | Easier to diagnose, but publicly distinguishes existing restricted resources from unknown ones. Not the draft default. |
| Filter only the final answer | Cannot prevent restricted context from being sent to the model; conflicts with AGENTS.md and BRD. |
| Rely solely on stored retrieval permissions | May allow revoked sources through a stale result; conflicts with current-access requirements. |
| Keep old grants dormant on membership removal | Rejoining can revive restricted access without a new grant; OD-02 proposes invalidation. |
| Remove only sentences citing a revoked source | Uncited context can still influence remaining text; withhold the whole draft instead. |
| Publish every revision immediately | Does not distinguish unpublished work from designated Current evidence; OD-04 proposes Draft. |

## Consequences and evidence

Public error diagnosis is less specific; scoped audit can record denial without exposing protected details. Rejoining requires fresh restricted grants; revocation may discard completed generation. Draft processing must not publish unpublished content into retrieval. Citation/answer/source paths need current checks and concurrent-revocation tests. Response-field equivalence does not prove absolute timing/side-channel protection. Delegation, Draft lifecycle and retention remain unresolved; no runtime/security tests have run.

**v0.2 changes:** Aligned with PRD v0.3 for interface-neutral denial, invalidated grants on removal, creator-set classification, whole-draft withholding and Draft visibility. All policy decisions remain Proposed.

**Checklist:** Pass for context, alternatives, consequences, source trace and explicit proposed status; Gap for owner review, implementation/concurrency mechanism and execution evidence.  
**Handoff:** Needs owner decision; architecture author must complete the enforcement design and contracts after policy validation.
