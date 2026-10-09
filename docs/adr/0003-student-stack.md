# Keep application implementation in one language

**Artifact ID:** ADR-0003  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** [architecture](../architecture.md) v0.1; PRD-01 v0.4; PLAN-01 v0.1.  
**Author:** development agent acting sequentially; owner reviews business choices.

**Decision status:** Proposed; authoring is not acceptance.

**Context:** Solo delivery makes language/tool switching expensive; no application stack is installed or adopted.

**Decision proposed:** TypeScript for web and both service domains, React for the UI and Fastify for HTTP. Keep domain operations free of provider/UI types. Local development uses one simple environment; pin supported versions during scaffolding. The context harness uses only Node built-ins now and is independent of application stack approval.

**Alternatives:** Python AI plus another work-service language is viable when existing experience justifies it; it increases interfaces/toolchains for a solo student. A large orchestration framework is unnecessary for a read-only request pipeline.

**Consequences:** One language reduces tool switching but does not eliminate permissions/concurrency design or prove developer throughput. No third-party package has been installed by this documentation change.

**Evidence:** [Fastify TypeScript documentation](https://fastify.dev/docs/latest/Reference/TypeScript/) describes typed routes; the productivity conclusion is a project-specific inference, not a measured result. **Handoff:** OD-12 records stack choice and tested version/commands before application code.

**Checklist:** Pass for context/decision/alternatives/consequences/trace; Gap for owner acceptance and implementation/pilot evidence.
