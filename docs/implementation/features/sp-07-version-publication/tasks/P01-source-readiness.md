# Task Brief: SP07-P01 Source Readiness & Spec Setup

**Task ID:** SP07-P01  
**Parent plan:** [FEAT-SP07-01](../plan.md)  
**Deliverable:** Source readiness, schema inspection and plan registration  
**Dependency:** None  
**Allowed paths:** `docs/implementation/features/sp-07-version-publication/**`, `docs/sdlc/artifact-register.md`  

## Objective & Scope
Reconcile canonical specifications, OpenAPI contracts, and existing PostgreSQL schemas for SP-07. Inspect `services/knowledge/migrations/002-current-revisions.up.sql` to confirm database trigger `protect_version()` and state constraints. Register the feature plan and task breakdown in the central registry.

## Verification
- Context checks: `npm run context:lint`, `npm run context:check`, `npm run context:test`.
- Documentation checks: `npm run docs:lint`, `npm run docs:test`.
