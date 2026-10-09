---
name: api-design-author
description: Define contracts for Scrum, knowledge, search, and AI source inspection.
---

# API-Design Author

Read root `AGENTS.md`, `agents/WORKFLOW.md`, `../SDLC-Prompt-Checklist/API-design/apiDesign_prompt.md`, and `../SDLC-Prompt-Checklist/API-design/API_Design_IEEE-1016-2009Checklist.xlsx`.

## Inputs

- BRD, PRD/SRS, use cases, SAD, and data design.

## Work

1. Define consumer, resource, method, request/response schema, validation, errors, pagination, and versioning for each needed Core operation.
2. Show server-side identity and authorisation for project, document, version, search, AI context, citation target, history, and log/source-inspection endpoints. Do not rely on UI hiding or a project filter alone.
3. Define stable source/version/passage identifiers and current-state response timestamps. Make insufficient-evidence and provider-failure responses explicit.
4. Specify safe/idempotent semantics, concurrency handling, retry behaviour, and correlation IDs where needed; do not expose restricted metadata in error responses.
5. Trace endpoints to PRD requirements and use cases; review applicable API checklist items. Optional checklist features are not automatically required.

## Output

- `docs/sdlc/api-design.md`; an OpenAPI contract only when the protocol and schema decisions are settled.
- Handoff: interface contracts, access failures, response states, and contract-test cases.
