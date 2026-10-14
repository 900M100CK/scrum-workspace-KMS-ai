# Unavailable citation identity and withheld answer responses

**Artifact ID:** ADR-0013
**Version/date:** 0.1 Draft - 14 October 2026
**Status:** Owner-confirmed business direction in two explicit session replies; wire mapping is a draft design, not runtime evidence.
**Inputs:** ADR-0007/0009/0011/0012; PRD-01 v0.5; UC-02 v0.3.
**Trace:** FR-14, FR-29, FR-46, FR-55, FR-59, FR-61; SC-06.

## Decision

An exact citation whose content is no longer available may expose its surviving document/version/passage identity only to a current project member who still satisfies the retained document-read policy. For restricted documents this requires a current explicit grant. Revocation, membership removal and removal/rejoin rules still apply; authorship, possession of an old citation and audit-read do not confer citation access. Deletion stops content access and new answer support even when identity inspection remains permitted.

Keep the policy and exact locator tombstone needed to make this decision separate from retained source bytes. Workspace remains the permission authority; Knowledge does not copy grant rules. Identity inspection cannot reactivate content access on a deleted document. If authority is unavailable, fail closed; if policy or exact locator no longer exists, or the caller is not entitled, use the same generic 404 as an unknown citation. Never echo arbitrary guessed locators as existing evidence. Physical retention duration remains open; no permanent storage promise is introduced.

For an entitled caller and a verified exact locator, the citation endpoint returns a typed unavailable result containing only that locator and a constant unavailable message. A newer live version is never substituted. Retained, readable Archived evidence returns its exact passage normally. A transient dependency failure is an explicit failure, not evidence that a locator is unavailable.

If an answer is withheld because its evidence cannot safely be delivered, the public response says only that the answer cannot be provided. It contains no answer, citation, source identity or detailed access-change reason. Detailed causes belong in access-controlled execution records. Whole-answer withholding applies to the full evidence set, including context not cited by the model. A new bounded generation attempt must repeat authority, provenance and handoff checks; it cannot resume the withheld draft.

## Draft wire mapping and consequences

The owner subsequently confirmed the same terminal policy for an invented citation: do not merely drop the locator and deliver the original draft. A replacement must pass claim-support and exact-citation checks as well as current access and durable provenance before delivery. If it cannot, withhold using the generic response. Structural locator validation alone is not a claim-support check; the implementation and evaluation method remain to be verified.

Knowledge `openCitation` HTTP 200 is either the existing exact `Passage` or `UnavailableCitation` with `state=unavailable`, a verified document/version/passage locator and fixed message `Cited content unavailable`. This is a successful identity inspection, not retrieved evidence, and must never enter generation context. Unknown/denied remains the existing fixed 404; infrastructure failure remains 503.

Question operations use HTTP 503 with fixed `AnswerWithheld`: `code=answer_withheld`, `message=Unable to provide this answer`. No run/source IDs are returned in this response. Other dependency failures retain their existing explicit categories. Minimum provenance persistence failure also uses this nondisclosing terminal response if no safe answer can be delivered. An HTTP status/schema proves neither enforcement nor durable storage.

Alternatives: universally hiding unavailable identities would omit the owner-selected entitled inspection; allowing every prior citation holder would bypass current revocation. Naming the changed source or access-change reason in a withheld response would disclose more than the owner selected.

## Verification and handoff

TC-06: same unavailable locator for a current entitled member, revoked reader, removed/rejoined member, audit-only inspector and unknown locator; only the entitled member sees the verified identity, never an excerpt or replacement. TC-04/18: revoke uncited evidence or fail mandatory provenance before delivery; no draft/source metadata crosses the response boundary. Check stale cache, retries and policy-service failure. Schema negatives cover extra disclosure fields and missing locator components only; handler, permission and transport tests remain unrun.

Ready for downstream design with explicit implementation gaps: retained-policy identity inspection must work without enabling deleted content, and exact-locator tombstones must survive for as long as this inspection is offered. No new service or cross-service database writes are authorised.
