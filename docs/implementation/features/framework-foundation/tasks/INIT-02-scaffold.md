# INIT-02 — Initialise the framework packages

**Artifact ID:** INIT-02\
**Version/date:** 0.2 Draft · 27 October 2026\
**Inputs:** [Parent plan](../plan.md) v0.2; ADR-0003 foundation selection; Proposed ADR-0024/0025.\
**Status:** See parent status table. **Trace:** SP-01 preparation / BR-01/10 / SC-06 relevance.

Prerequisite INIT-01 and exact package compatibility evidence. Allowed writes: coordinated package/build/web/service paths in parent. Initialise React/Vite/TypeScript app plus independent Fastify/TypeScript Workspace and Knowledge packages. Reuse owned service boundaries, explicit bounded localhost startup and safe unknown-route behaviour. Verify exact dependency tuples, compiler resolution and built output. Only infrastructure liveness is allowed; no session, permission, SQL, provider or business endpoint. Do not install optional ORM/auth/AI/style tooling. Record actual commands and lockfile; failing installation remains evidence. **Checklist:** Task specified, no adoption from a version label alone.
