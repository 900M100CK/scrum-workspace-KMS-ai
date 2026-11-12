# Task Brief: SP07-P03 Internal Versioning Transport

**Task ID:** SP07-P03  
**Parent plan:** [FEAT-SP07-01](../plan.md)  
**Deliverable:** Knowledge internal HTTP service routes for versioning  
**Dependency:** P02  
**Allowed paths:** `services/knowledge/src/documents/http.ts`, `services/knowledge/src/documents/types.ts`  

## Objective & Scope
Register internal HTTP routes in `services/knowledge/src/documents/http.ts` guarded by constant-time `X-Service-Key` verification:
- `POST /internal/documents/:document_id/revisions`
- `GET /internal/documents/:document_id/versions`
- `GET /internal/documents/:document_id/versions/:version_id`
- `POST /internal/documents/:document_id/versions/:version_id/archive`
- `DELETE /internal/documents/:document_id`

## Verification
- HTTP service test suite: `tests/knowledge/document-version-http.test.mjs`.
