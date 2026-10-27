# Backend candidates for the first authenticated slice

**Artifact ID:** ADR-0024  
**Version/date:** 0.1 Draft · 27 October 2026  
**Decision status:** Proposed; no application package adoption or replacement of ADR-0003.  
**Inputs:** ADR-0003 v0.1; TECH-STACK-01 v1.5; PRD-01 v0.9; Workspace contract v0.2.8; [SP-01.1 brief](../implementation/briefs/SP-01.1-session-foundation.md); [ADR-0025](0025-opaque-session-candidate.md).  
**Trace:** FR-01/36/37/68; AC-01/36/37/68; BR-01/10; SC-06.  
**Owner role:** Architect preparing D-01a for owner review.

## Context and proposed decision

D-01 currently combines backend and frontend choices. Prepare D-01a backend compatibility independently of D-01b frontend. ADR-0003 remains Proposed; this record narrows its backend recommendation without selecting React or changing the existing preview. D-01b must be resolved before a frontend framework is adopted, rather than automatically at a numbered child step.

Recommend Node 24 LTS, TypeScript, Fastify 5, node-postgres (`pg`), explicit SQL and service-owned bounded pools. The exact compiler, driver, plugins and runtime patches must be recorded and tested together before adoption. TypeScript 6.x is the conservative compiler-API compatibility candidate; neither it nor TypeScript 7 is selected by this document. Running erasable `.ts` directly is an option to test alongside `tsc --noEmit`, including module resolution and actual startup commands. Do not infer runtime type validation from type checking.

Recommend a small Workspace-owned same-client transaction utility when real handlers need it. Begin/commit/rollback use one acquired client; release in `finally`; failed rollback must not return a suspect connection for reuse. Preserve the original failure and safe diagnostics. Transactions must not span provider generation waits or inter-service HTTP. Prove rollback and mandatory audit atomicity using real PostgreSQL. A function name or lexical ban on `pool.query` is not enforcement evidence.

Keep database int8/revision values as exact decimal strings at JSON boundaries; compare through validated `BigInt` where needed. Do not serialize native `BigInt` into JSON or convert revisions to `Number`. Pool limits/timeouts and transaction isolation must be explicit per operation. Each service owns its connection configuration and database privileges.

Ajv 2020-12 with formats is a validator candidate, not a complete OpenAPI runtime integration. Reuse [existing schema loading](../../scripts/contract-schemas.mjs) as structural evidence. Before application adoption, test local `$ref` resolution, formats, unknown fields, request mutation settings, OpenAPI annotations, plugin schemas and response serialization. The serializer and validator must agree with the selected route contracts. No network schema loading or silent contract weakening is allowed.

## Alternatives and bounded exclusions

- A supported TypeScript 7 toolchain remains viable if the actual editor/lint/codegen dependencies pass; avoid dual compiler installations without a demonstrated need.
- A compile-to-JavaScript launch path remains viable if direct `.ts` execution creates module/plugin incompatibilities.
- Other HTTP frameworks or an ORM require a concrete benefit and measured compatibility; do not add them to this spike by default.
- Fastify cookie/rate-limit integrations are candidates to verify. No session plugin, auth framework, broker, UI rewrite or provider SDK is selected here.

## Evidence gate and consequences

Use the brief's separate E-SCHEMA, E-HTTP, E-DB and E-SESSION checks. Package/lockfile isolation prevents accidental adoption but does not grant authority. Record exact installed versions, source digests, commands, failures and unresolved decisions. Schema checks alone cannot close this gate. A successful isolated spike permits a recommendation; the owner decision and coordinated application scope must precede integration.

**Checklist:** Pass for a bounded D-01a proposal; Gap for full compatibility, owner selection and application evidence. **Handoff:** run only the authorised preparation in the [brief](../implementation/briefs/SP-01.1-session-foundation.md); keep D-01b independent and Proposed.
