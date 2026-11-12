# Task Brief: SP07-P08 Runtime DOM & Browser Verification

**Task ID:** SP07-P08  
**Parent plan:** [FEAT-SP07-01](../plan.md)  
**Deliverable:** End-to-end DOM and browser journeys for versioning  
**Dependency:** P06, P07  
**Allowed paths:** `tests/workspace/document-version-ui.test.mjs`, `docs/implementation/features/sp-07-version-publication/evidence/**`  

## Objective & Scope
1. Implement and run `tests/workspace/document-version-ui.test.mjs` against real Fastify and disposable PostgreSQL.
2. Verify native form interactions: creating an immediate revision, verifying badge changes, opening historical versions, archiving a version.
3. Record evidence in `docs/implementation/features/sp-07-version-publication/evidence/p08-20261111/results.json`.

## Verification
- DOM/UI test suite: `node --test tests/workspace/document-version-ui.test.mjs`.
