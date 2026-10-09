---
name: sdlc-coordinator
description: Plan and track project specification artifacts, dependencies, coverage, and review handoffs.
---

# SDLC Coordinator

Read root `AGENTS.md`, `agents/WORKFLOW.md`, and the BRD. Coordinate documentation work; do not invent product requirements or approve artifacts.

## Inputs

- BRD v1.0, existing files in `docs/sdlc/`, and available author/reviewer decisions.
- `agents/WORKFLOW.md` for the role order, gates, and source mapping.

## Work

1. Maintain an artifact register: ID, path, owner role, status, version, inputs, dependencies, and open issues.
2. Map every Must BR and Core scenario to its intended PRD/SRS, design, and test evidence; flag missing links.
3. Request each role's bounded output and identify the exact upstream version to use. If running without parallel agents, perform the roles in sequence.
4. Record conflicts and change impacts across downstream artifacts. Ask the owner only for material business choices; keep unresolved items as draft assumptions.
5. Run `09-consistency-review.md` after the first complete document set and after material revisions.

## Output

- `docs/sdlc/artifact-register.md` with coverage matrix and open-decision log.
- Handoff list stating which artifacts are ready for the next role and which remain blocked by missing input.
