# User Flow: AI Q&A, Citations & Fallback

**Artifact ID:** UX-FLOW-AI-03\
**Version/date:** 0.5 Draft · 14 October 2026\
**Status:** Owner-confirmed policy direction; runtime and full UX review pending.\
**Sources:** PRD-01 v0.5; UC-02 v0.3 (UC-09/UC-10/UC-12); SAD-03 v0.7; ADR-0007/0009/0011; OpenAPI v0.2.0.\
**Trace:** BR-07–BR-10, BR-12–BR-14; FR-18–FR-30, FR-32–FR-34, FR-46, FR-53–FR-55, FR-59–FR-61, FR-69; SC-02, SC-03, SC-05–SC-08.

## 1. Request and protected handoffs

Use the authenticated application session, not client-asserted user identity or an assumed JWT. Submit `POST /knowledge/questions` with project selector, question and explicit current/historical scope. All paths here are OpenAPI keys relative to `/api`.

1. Workspace checks current session and membership; Knowledge retrieves only authorised project AND document scope. Project-shared sources need no explicit grant; restricted sources do, including the author's revocable grant. Unknown authority denies. Default retrieval is Current-only; deliberate history is labelled. Revisions become Current immediately; no product Draft exists.
2. Before provider input, Workspace revalidates current scope while Knowledge validates versions/availability, under the ADR-0006 guard through provider transport handoff completion/abort.
3. Generation waits outside the guard. Buffer all output. A loading indicator exposes no answer tokens, source titles, snippets or hidden counts.
4. Validate citation identities assigned from server evidence records. Before answer delivery, revalidate the **entire evidence set, including uncited model context**, session, permissions and validity under the guard through response transport handoff.
5. If any evidence was revoked, withhold the entire original draft. Optionally regenerate as a new bounded attempt solely from remaining permitted evidence and repeat both handoff checks. Never remove only a citation/sentence and release the old text.
6. Opening a citation performs a new protected read with current checks; previous delivery grants no lasting authority.

Current task/Sprint answers use authorised operational observations with entity identity and observation time/version. Recorded facts, synthesis and uncertainty remain distinct. Conflicting accessible evidence is surfaced with exact citations; nonempty but inadequate evidence still gives insufficient evidence. Runtime AI remains read-only; retrieved text cannot grant authority.

## 2. Answer and source inspector

The following is a **layout placeholder, not a source quotation, project fact or evaluation fixture**:

```text
Question: <user question>
Recorded fact: <claim supported by an accessible evidence passage> [1]
Synthesis: <supported interpretation, labelled as synthesis>
Uncertainty: <what the evidence does not establish>
[1] <permitted source title> · <exact version_id> · <passage_id>
```

Resolve each chip using `GET /knowledge/citations/{document_id}/{version_id}/{passage_id}`. Display only the returned permitted title, exact immutable identity, excerpt and Current/Superseded/Archived validity label. Do not invent a JWT quotation, classification or version. The Passage contract does not include classification; displaying it needs a separate authorised metadata response.

“Open full document” opens the exact version after a fresh check; editing controls additionally require content-write authority. No automatic redirect to Current.

| Inspector result | UI behaviour |
| --- | --- |
| Exact accessible passage | Show exact excerpt and version/validity; historical content is clearly labelled. |
| Unknown or inaccessible source | Generic `404` / “Source unavailable”, identical for both; no title, version, snippet or revocation explanation. |
| Evidence unavailable, surviving identity readable | “Citation unavailable”; no version substitution. ADR-0013 and UnavailableCitation permit only a verified surviving locator after current membership and retained read-policy checks; no excerpt or newer-version substitution. |
| Authority unavailable | Generic service failure; withhold protected source details. |
| Session expired | Sign-in required; no protected response. |

## 3. Question states and actions

| State | Message / available actions |
| --- | --- |
| Loading / final validation | “Preparing answer…”; no streamed draft output. |
| Original answer withheld / bounded regeneration | “Unable to deliver this answer. Please try again.” or “Preparing answer…” during the new attempt. Do not name the revoked source or expose the internal cause. |
| Insufficient evidence | Contract message: **“Insufficient evidence”**. Optional UI guidance: “Try another question or search by keywords.” Do not list hidden/restricted/Draft sources as possible reasons, counts or hints. |
| Conflict | Show unresolved conflicting permitted evidence; do not claim newest means correct. |
| AI dependency failure | Explicit failure, with no generated answer; offer keyword search and normal work/document UI where their dependencies are available. |

“Create New Document” appears only with current create capability; the creation server rechecks it. The runtime AI does not create documents. Keyword search uses `POST /knowledge/search/keyword` with current scope checks.

Withholding/regeneration are interaction states, not new QuestionResult enum values. The current contract defines answered, partially_answered, insufficient_evidence and conflict, plus HTTP errors. ADR-0013 and Knowledge OpenAPI v0.2.2 map terminal withholding to HTTP 503 AnswerWithheld with a fixed generic message and no evidence or source identities. Do not use insufficient evidence to disguise infrastructure failure.

## 4. Failure boundaries

| Failure | Required behaviour |
| --- | --- |
| Generation/embedding/semantic dependency fails or budget is exhausted | FR-69: explicit AI failure. FR-33/FR-34: work, permitted document reads and keyword retrieval continue when Workspace/Knowledge and their required stores remain available. |
| Knowledge service/storage fails | Document reads and keyword search may also fail; show their unavailable state. Keep Workspace work operations available when their own dependencies are healthy. |
| Workspace/session/permission authority fails | Deny protected output; no unrestricted search, cached answer or source fallback. |
| Network outcome uncertain | Show unavailable/retry guidance, recheck scope on retry; no availability percentage promise. |

DGM-FLOW-01: [Mermaid](../../sdlc/diagrams/flowchart/ai-qa-flow.mmd) · [Draw.io](../../sdlc/diagrams/flowchart/ai-qa-flow.drawio). [AI permission checkpoints](../../sdlc/diagrams/flowchart/permission-ai-checkpoints.mmd) (DGM-FLOW-05) cover all four boundaries; citation opening returns to [source reads](../../sdlc/diagrams/flowchart/permission-read-flow.mmd) (DGM-FLOW-04), repeating current checks. Revocation boundary is server transport handoff, not browser rendering; already transmitted data cannot be recalled.

**Assumptions/open decisions:** ADR-0007/0009/0011 confirm initial access, immediate revisions and guarded source/citation/AI handoffs. Additional delegation and physical retention remain open; unavailable identity requires current read entitlement under ADR-0013. Internal authenticated/scoped policy/state reads do not reacquire the guard. No saved-answer or feedback-persistence feature is added.
**Checklist/handoff:** Pass for documented buffered delivery, exact-citation placeholders and non-disclosing states; Gap for visual/usability and runtime evidence; wire mappings are now specified by ADR-0013. Ready for Stage 5/8 follow-up. v0.3 addresses A1–A5 and F-01 locally; wider findings need re-review.

**v0.4 correction:** Updated the diagram handoff after the permission-flow split; the four checkpoints and policy assumptions are unchanged.

**ADR-0015 partial-answer state:** Show supported claims with their exact citations, then visibly list requested components with insufficient evidence. Use request-visible wording only, never hidden source/grant hints. No supported component means the existing Insufficient evidence view. Provider failure and AnswerWithheld remain error states. Never show an invalid original draft with a citation merely removed.
