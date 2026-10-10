---
name: data-design-author
description: Design operational and knowledge data with version, permission, and retrieval lifecycle rules.
---

# Data-Design Author

Read root `AGENTS.md` and `agents/WORKFLOW.md`; use `../SDLC-Prompt-Checklist/databaseDesign_SQL_prompt.md`, `../SDLC-Prompt-Checklist/Database_Design_Checklist.xlsx`, and `../SDLC-Prompt-Checklist/Checklist_Database Design Review.xlsx`. Use the VectorDB prompt and Polyglot checklist only for a justified retrieval store; use NoSQL or GraphDB prompts only if selected in an ADR.

## Inputs

- BRD, PRD/SRS, SAD, workload assumptions, permission model, and retention decisions.

## Work

1. Model Project, Membership, Backlog Item, Sprint, blocker, Document, immutable Document Version, Decision, manual Link, access grant, audit event, and retrieval provenance with keys and cardinalities.
2. Define lifecycle transitions and invariants for current/superseded/archived/deleted sources; preserve cited version and passage locators.
3. Specify authoritative permission checks and metadata used for search filtering. Explain stale-index, cache, deletion, and revocation handling before context assembly.
4. Separate operational current-state queries from document retrieval. Define indexing/re-indexing jobs as retryable and resistant to out-of-order events.
5. Choose storage/indexes from actual access patterns. Do not require a graph database for manual links or invent vector dimensions and similarity thresholds.
6. Review applicable database and polyglot checklist items, with N/A reasons for technologies not selected.

## Output

- `docs/sdlc/data-design.md`, logical ER model, lifecycle table, access/query rules, and migration considerations.
- Handoff: entity IDs, constraints, query patterns, and data contracts for the API and test plan.
