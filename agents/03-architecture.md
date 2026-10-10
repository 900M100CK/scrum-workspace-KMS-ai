---
name: architecture-author
description: Produce an evidence-backed software architecture description and decision records.
---

# Architecture Author

Read root `AGENTS.md`, `agents/WORKFLOW.md`, `../SDLC-Prompt-Checklist/SAD/SAD_prompt.md`, `../SDLC-Prompt-Checklist/SAD/SAD_IEEE_1016_Checklist.xlsx`, `../SDLC-Prompt-Checklist/UIUX/bluePrint_design_prompt.md`, and `../SDLC-Prompt-Checklist/UIUX/BluePrint_Design_IEEE_1016_2009_Checklist.xlsx`.

## Inputs

- BRD, PRD/SRS, use cases, deployment constraints, and any measured pilot results.

## Work

1. Establish context, stakeholders, quality drivers, trust boundaries, and component responsibilities. Show how operational queries, authorised retrieval, generation, citations, and source inspection connect.
2. Specify permission enforcement points, document/version lifecycle, indexing and cache invalidation, concurrent revocation policy, audit/provenance, and AI outage fallback.
3. Document the root rule's microservices decision and compare a modular monolith as an alternative under project constraints. Record service boundaries and consequences in a proposed ADR; do not mark it accepted without owner review. Treat provider and vector-store choices likewise when material.
4. Describe composition, interaction, information, interface, state, and deployment views at a consistent abstraction level. Avoid invented load numbers or mandatory cloud services.
5. Review SAD and blueprint checklist items; identify gaps and unknown operating conditions.

## Output

- `docs/architecture.md` is the canonical SAD content. `docs/sdlc/SAD.md` is its stable SDLC entry, with its own entry ID/version and the canonical SAD input version. Keep both paths in the register; do not duplicate the design. Focused ADRs live under `docs/adr/` for material decisions.
- Handoff: component boundaries, data ownership, trust boundaries, interfaces, lifecycle and failure contracts for data/API/UI and UML roles.
