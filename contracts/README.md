# Contract-first interface pack

**Artifact ID:** CONTRACT-01  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** PRD-01 v0.4; [architecture](../docs/architecture.md); [data design](../docs/sdlc/data-design.md); PLAN-01 v0.1.  
**Author:** development agent acting sequentially; owner reviews business choices.

## Status and ownership

These are draft HTTP/JSON contracts for review before application code. The owner explicitly requested contracts; API-profile acceptance remains pending the named protocol/policy decisions. Workspace owns workspace.openapi.json; Knowledge owns knowledge.openapi.json. Their public facades are served by the Workspace gateway; Knowledge's actual internal transport additionally requires service credential and validated actor session. Internal paths must never be exposed by a generic public proxy.

[Workspace OpenAPI](openapi/workspace.openapi.json), [Knowledge OpenAPI](openapi/knowledge.openapi.json), [change event schema](events/domain-change.schema.json) and [logical DB model](data-model.json) are the sources for each feature spec. OpenAPI 3.1.1 and JSON Schema 2020-12 shape conventions follow [official OpenAPI](https://spec.openapis.org/oas/v3.1.1.html) and [JSON Schema](https://json-schema.org/draft/2020-12/json-schema-validation) documentation. No schema validation establishes permission, factual support or source authority.

## Required semantics beyond shape

- Identity is server-derived. Project IDs/doc IDs are selectors, not access claims. Membership role field is project-scoped and cannot promote an account to global Workspace Admin.
- Inaccessible/unknown resource reads share the same NotFound body and HTTP 404. Known readable resource/action denial may be 403; never use that distinction to reveal a hidden target. Generic permission infrastructure failure denies output.
- Mutations use scoped idempotency keys and expected revision, including X-Expected-Revision for deletion/removal. Replay rechecks current access; mismatch does not overwrite or revive a grant.
- Keyword/semantic retrieval filter current project AND document scope. Draft never becomes a retrieval result. Semantic retrieval can return restricted documents when explicitly permitted.
- Internal generation returns the **full evidence set**, not only cited sources, to the gateway. Guarded delivery validates all of it; any revoked source withholds the original draft. Evidence excerpts are transient provider input and must not be logged as a store copy.
- Initial source registration is pending until owned data plus ACL activation complete. 202 is pending, not successful search/read readiness. Schema approval cannot hide partial cross-service failure.
- Events carry IDs/revisions, no content/grants. Authenticate producer and handle duplicates/out-of-order state; events are invalidation hints, never the permission authority. No broker is required; transport is an implementation choice.
- Question result states answered/insufficient_evidence/conflict are separate from dependency failures. Error response names failure category and has no generated answer. No model endpoint or provider config is a caller-controlled URL.

Context checks validate references, operation/spec trace and expected non-disclosure schemas. Real consumer/provider tests must later exercise session expiry, current access, revocation, stale state and provider failures on real handlers. No generated API or runtime feature has been implemented.

Checklist: Pass for draft owner/shape/error/trace baseline; Gap for accepted auth/protocol policies, full OpenAPI meta-schema validation and real consumer/provider tests. Handoff: Needs owner decision; do not call this accepted wire compatibility.
