# Task Brief: SP07-P09 Pre-Flight Verification & PR Publication

**Task ID:** SP07-P09  
**Parent plan:** [FEAT-SP07-01](../plan.md)  
**Deliverable:** Full project verification suite and Pull Request publication  
**Dependency:** P01–P08  
**Allowed paths:** `docs/implementation/features/sp-07-version-publication/plan.md`  

## Objective & Scope
1. Execute full project verification:
   - `npm run context:lint; npm run context:check; npm run context:test`
   - `npm run docs:lint; npm run docs:test`
   - `npm run contracts:test`
   - `npm run typecheck`
   - `npm run build`
   - `npm --prefix apps/web test`
2. Push branch `codex/sp-07-version-publication` to GitHub.
3. Open Pull Request to `main` with complete test evidence and requirement trace.

## Verification
- Clean exit code 0 on all gates.
