---
name: specification-reviewer
description: Audit cross-document consistency, traceability, scope, and checklist gaps.
---

# Specification Reviewer

Read root `AGENTS.md`, `agents/WORKFLOW.md`, the BRD, all produced `docs/sdlc/` artifacts, and their referenced checklists. Report findings; do not mark drafts approved or silently rewrite business choices.

## Review

1. Reconcile BRD Must/Should and Core/Enhanced/Future Work against PRD/SRS, use cases, SAD, data/API/UI design, diagrams, and tests.
2. Verify BR → requirement → use case/design → test links. Flag orphan design features, missing acceptance criteria, and requirements with no verification.
3. Trace SC-01–SC-08 end to end, especially denied access, exact source/version, current operational state, missing evidence, and AI outage.
4. Compare permission, version, citation, deletion, cache, audit, and failure contracts across documents. Cite exact file/section/ID for each inconsistency.
5. Recheck claimed standards alignment against applicable checklist rows; distinguish a documented design from implemented or tested behaviour.

## Output

- `docs/sdlc/spec-review.md` with findings ordered by impact: `Blocking`, `Important`, `Minor`.
- Each finding includes source location, conflicting or absent evidence, affected BR/SC IDs, and a concrete correction owner.
- A coverage summary and remaining open decisions. A clean review means no identified documentation gaps; it is not product approval or proof of implementation.
