# Keep application implementation in one language

**Artifact ID:** ADR-0003\
**Version/date:** 0.2 Draft · 27 October 2026\
**Status:** Owner-directed foundation initialised; application/session/permission mechanics remain unverified.\
**Inputs:** [architecture](../architecture.md) v0.16; PRD-01 v0.9; PLAN-01 v0.4; [OWNER-FRAMEWORK-01](../planning/framework-foundation-owner-2026-10-27.md) v0.1.\
**Author:** development agent acting sequentially; owner reviews business choices.

**Decision status:** Owner-directed foundation selection recorded in [OWNER-FRAMEWORK-01](../planning/framework-foundation-owner-2026-10-27.md). This bounds the initial framework scaffold; runtime identity/permission/provider mechanics are not accepted here.

**Context:** Solo delivery makes language/tool switching expensive; the original 8 October proposal had no application stack installed; the 27 October foundation now implements the owner-selected subset.

**Foundation decision:** TypeScript for web and both service domains, React for the UI and Fastify for HTTP. Keep domain operations free of provider/UI types. Local development uses one simple environment; pin supported versions during scaffolding. The context harness uses only Node built-ins now and is independent of application stack approval.

**Alternatives:** Python AI plus another work-service language is viable when existing experience justifies it; it increases interfaces/toolchains for a solo student. A large orchestration framework is unnecessary for a read-only request pipeline.

**Consequences:** One language reduces tool switching but does not eliminate permissions/concurrency design or prove developer throughput. The owner-directed foundation installs exact framework packages and preserves the synthetic preview separately; no additional domain/provider/auth package is implied.

**Evidence:** [Fastify TypeScript documentation](https://fastify.dev/docs/latest/Reference/TypeScript/) describes typed routes; the productivity conclusion is a project-specific inference, not a measured result. **Handoff:** OWNER-FRAMEWORK-01 records the selected tuple and bounded commands. The framework foundation result records checks; protected application integration still needs its relevant decisions and evidence.

**Checklist:** Pass for context/decision/alternatives/consequences/trace; Gap for owner acceptance and implementation/pilot evidence.
