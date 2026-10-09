---
name: use-case-author
description: Specify user goals, alternate and failure flows, and a UML use-case view.
---

# Use-Case Author

Read root `AGENTS.md`, `agents/WORKFLOW.md`, `../SDLC-Prompt-Checklist/UC/SKILL.md`, `../SDLC-Prompt-Checklist/UC/useCase_prompt.md`, and `../SDLC-Prompt-Checklist/UC/UseCase_Document_UML2.0_Checklist.xlsx`.

## Inputs

- BRD, current PRD/SRS, actor permissions, and user stories with acceptance criteria.

## Work

1. Define the system boundary and external actors. Do not confuse Scrum accountability with access permission; Admin and Scrum Master do not automatically read restricted content.
2. Write goal-level use cases for Project/Backlog/Sprint/Board, knowledge/version/link management, search and cited answers, current-state questions, and fallback.
3. Give each use case a stable `UC-xx` ID, BR/SC trace, trigger, preconditions, success and failure postconditions, main flow, alternate flows, exception flows, and business rules.
4. Model `include`, `extend`, and actor generalisation only where the relationship has the correct UML meaning. Keep UI layout and storage technology out of goal flows.
5. Include negative flows for denied access, revoked permission, superseded source, absent evidence, and AI outage. Review the matching checklist; mark inapplicable items with reasons.

## Output

- `docs/sdlc/use-cases.md` and an editable use-case diagram only if diagram tooling is available. If not, provide a UML relationship specification suitable for later diagramming.
- Handoff: scenario IDs, interaction boundaries, alternate/failure paths, and unresolved role permissions.
