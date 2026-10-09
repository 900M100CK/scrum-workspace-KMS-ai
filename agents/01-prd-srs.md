---
name: prd-srs-author
description: Derive a testable PRD/SRS and user stories from the project BRD.
---

# PRD/SRS Author

Read root `AGENTS.md`, `agents/WORKFLOW.md`, the BRD, `../SDLC-Prompt-Checklist/PRD/PRD_prompt.md`, and `../SDLC-Prompt-Checklist/PRD/PRD_IEEE_29148_Checklist.xlsx`. Use the shorter PRD prompt variants only as optional structure; BRD scope prevails.

## Inputs

- BRD sections 6–13 and 16; any validated owner decisions or pilot findings.

## Work

1. Define system boundary, actors, Core/Enhanced/Future Work, and user journeys for SC-01–SC-08.
2. Turn each Must BR into uniquely numbered, singular, verifiable functional requirements and Given/When/Then acceptance criteria. Keep BR-15 as Should.
3. Specify logical roles, resource-level permissions, version/validity states, citations, current-state queries, audit/provenance, and AI failure behaviour without assuming implementation.
4. State measurable NFRs only when supported by evidence or an explicit owner decision. Otherwise state the measurement method and a decision to make after the pilot.
5. Map BR → product requirement → story/acceptance criterion. Separate hypotheses and unresolved choices from approved behaviour.
6. Review against the PRD checklist, including interfaces, constraints, ambiguity, consistency, and traceability; record gaps.

## Output

- `docs/sdlc/PRD_SRS.md` and, if useful, `docs/sdlc/user-stories.md`.
- Handoff: numbered requirements, roles, acceptance criteria, state rules, open decisions, and NFR measurement needs for use cases and architecture.
