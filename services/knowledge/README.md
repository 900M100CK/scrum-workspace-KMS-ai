# Knowledge service scaffold

Status: PostgreSQL storage migrations and scoped exact/keyword query functions are implemented; Fastify/TypeScript liveness exists, but no protected business handler, indexing worker or provider is implemented. See the [database runbook](../../infra/postgres/README.md). Own knowledge/version/passages/links/retrieval/AI/provenance under the [architecture](../../docs/architecture.md) and [Knowledge contract](../../contracts/openapi/knowledge.openapi.json).

Never copy or independently interpret permission rules: obtain current scoped decisions from Workspace and filter project AND document before query/context. Own Knowledge data only. Generation is read-only and provider-independent. There is no persisted product Draft under ADR-0009; unsaved editor text never enters retrieval/context; citation IDs are assigned from retrieved records. Guarded delivery validates the full evidence set, including uncited context.

Implement SP-06–SP-10 after the foundation; capture evidence from the first operation. Real build/test/run commands follow installed versions, not this README.

Knowledge migration 003 additionally stores immutable exact handoff manifests and append-only outcomes under Proposed ADR-0023. Isolated SQL evidence is supplied; authenticated preparation lookup/capture and actual guarded provider/answer adapters remain unimplemented. A generated receipt before known commit acknowledgement authorizes no send.

queries/get-handoff-manifest.sql supplies an internal exact-byte StoredHandoff projection with trusted-context selectors, verified by the optional contracts:storage:test command. It is not an HTTP handler or permission decision; its context must come from independently validated server state and final guard/source checks remain required.

## Framework commands

Node 24+: from root use npm run dev:knowledge for localhost 3002, npm run typecheck, npm run build and npm run test:foundation. From this package use npm start after build. PORT must be an integer from 1 to 65535; bind is 127.0.0.1. GET /healthz reports process liveness only; other routes return generic 404. It is not database/provider readiness or authentication. No DB connection/provider client is created by this scaffold.
