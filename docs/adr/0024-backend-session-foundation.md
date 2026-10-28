# Backend candidates for the first authenticated slice

**Artifact ID:** ADR-0024\
**Version/date:** 0.5 Draft · 28 October 2026\
**Decision status:** Proposed for detailed session/driver/validation mechanics; framework foundation already selected under OWNER-FRAMEWORK-01.\
**Inputs:** ADR-0003 v0.2; TECH-STACK-01 v1.6; PRD-01 v0.9; Workspace contract v0.2.8; [SP-01.1 brief](../implementation/briefs/SP-01.1-session-foundation.md); [ADR-0025](0025-opaque-session-candidate.md) v0.5; [runtime result](../sdlc/reports/SP-01-runtime-spike-2026-10-28.md) v0.2.\
**Trace:** FR-01/36/37/68; AC-01/36/37/68; BR-01/10; SC-06.\
**Owner role:** Architect preparing D-01a for owner review.

## Context and proposed decision

D-01a detailed backend compatibility remains separate from D-01b frontend. OWNER-FRAMEWORK-01 and ADR-0003 v0.2 already selected the React/Vite/TypeScript and Fastify/TypeScript foundations. Reuse those choices and preserve design/prototype. This proposal concerns remaining driver, validation and session infrastructure; it does not reopen framework selection.

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

## Measured recommendation — 28 October 2026

The [runtime result](../sdlc/reports/SP-01-runtime-spike-2026-10-28.md) retains exact source manifests and local HTTP/DB evidence for Node 24.22.1, TypeScript 6.0.3, Fastify 5.12.7, @fastify/cookie 11.1.5, pg 8.23.1, Ajv 8.20.0/formats 3.0.1. Recommend those compatible pins for the session slice after owner disposition. Explicit non-mutating body validation and separate output-object validation are necessary; serializer projection alone does not reject an invalid handler object. Actual PostgreSQL tests cover rollback/discard/cancellation/pool recovery, bigint strings and a simulated lost receipt after actual COMMIT. The caller retains unknown commit outcome, discards and does not retry. HTTP 413/415 and production rate-limit response mapping remain explicit contract integration work, not permission to change the contract silently.

Owner-confirmed session policy direction is recorded in ADR-0025 and the P06 batch. Proposed application coordination includes Workspace package/lockfile updates, canonical test/build script wiring and additive Workspace credential/session/clock/audit persistence only after the remaining gate is disposed. It grants no Knowledge database access, destructive development reset or automatic commit.

**Checklist:** Self-checked proposal and measured attribution; application integration/permission/browser verification remains open. **Handoff:** owner reviews detailed adoption with ADR-0025 and the recorded time-policy limits; no self-Accepted status.

## Bounded P08 authorisation and implementation

The owner authorised P08 pg/transaction/KDF/clock/schema implementation with explicit conditions; this is separate from formal ADR acceptance. Workspace now pins pg 8.23.1 and @types/pg 8.23.1; cookie/validator packages remain outside this persistence slice. Real PostgreSQL role/rollback/disable/restart tests and source-attributed regression are in [P08 evidence](../sdlc/reports/SP-01-P08-persistence-2026-10-28.md). Infrastructure server has no public auth handlers. No deployment calibration or D-07 acceptance is inferred.

## P09 bounded adapter evidence

The owner authorised the next P09 task. Actual POST/GET session handlers, selected cookie/Origin, non-mutating request validation and final JSON-object validation are integrated over owned persistence. Exact new Workspace dependencies are @fastify/cookie 11.1.5, Ajv 8.20.0 and ajv-formats 3.0.1. [P09 result](../sdlc/reports/SP-01-P09-http-2026-10-28.md) separates actual handler/PG/HTTPS/compiled startup from unrun browser/logout/renewal/deployment/D-07 gates. Earlier absence-of-handler statements describe their prior stages. No Accepted status follows from implementation.

## Bounded P10 implementation — 28 October 2026

The owner separately requested P10 after P09. Actual GET renewal and DELETE logout now use the owned transaction/clock/account/session ordering, atomic lifecycle audit and additive migration 006. [P10 result](../sdlc/reports/SP-01-P10-lifecycle-2026-10-28.md) records execution evidence. GET refreshes the same host cookie from DB expiry; strict idle/absolute expiry cannot be revived by renewal, and logout reduces access even with a fault-latched clock. A pre-authorized response can remain in flight; protected-content guarded handoff, UI/browser, deployment calibration and formal acceptance remain open. This is bounded implementation, not an Accepted ADR or D-07 closure.
