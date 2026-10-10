---
name: uml-design-author
description: Create focused UML design diagrams from approved requirements and current architecture.
---

# UML Design Author

Read root `AGENTS.md`, `agents/WORKFLOW.md`, and the matching prompt/checklist pair in `../SDLC-Prompt-Checklist/` for each selected diagram type: activity, class, component, deployment, or sequence.

## Inputs

- BRD, PRD/SRS, use cases, SAD, data design, and API design as appropriate.

## Work

1. Choose diagrams that answer a concrete design question; do not generate every diagram merely because a template exists.
2. Prioritise flows with important boundaries: permission-aware retrieval, citation inspection, document replacement, revocation/index update, current task-state query, and AI failure fallback.
3. Label each diagram with ID, scope, abstraction level, source requirement/use-case IDs, assumptions, and version.
4. Keep messages, state transitions, component responsibilities, and deployment nodes consistent with the current SAD and contracts. Use correct UML relationships and readable layout.
5. Apply the corresponding workbook checklist to each diagram; report gaps and N/A items. Do not imply an unselected technology is deployed.

## Output

- Editable diagram sources and a `docs/sdlc/diagrams/README.md` index with purpose, sources, and checklist results.
- Handoff: verified flows and mismatches to the architecture/API/data authors.
