# Minimal business service boundaries

**13 October amendment:** [ADR-0011](0011-document-creation-and-guard-scope.md) replaces pending/activation creation with Workspace-first policy registration and clarifies guard-exempt internal reads. Original proposal text below is retained; the owner-confirmed amendment governs that changed direction.

**Artifact ID:** ADR-0002  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** [architecture](../architecture.md) v0.1; PRD-01 v0.4; PLAN-01 v0.1.  
**Author:** development agent acting sequentially; owner reviews business choices.

**Decision status:** Proposed; authoring is not acceptance.

**Context:** One student, five months, BRD PP-01–PP-06, BR-01–BR-14. The owner retained microservices on 8 October 2026. The style is owner-directed; exact boundaries remain a proposed design.

**Decision proposed:** Two business services: Workspace owns auth/policy/operational Scrum, Knowledge owns immutable knowledge/search/AI/provenance. The Workspace gateway is also the sole public surface and permission authority. No service per UI feature, standalone broker, discovery platform or graph database is selected. Each writes its own data.

**Alternatives:** Modular monolith would reduce distributed coordination and remains technically viable for this workload, but changes the current owner direction. More independently deployed domains add contracts, failure paths and operational burden without a measured capstone benefit.

**Consequences:** A clear work/knowledge boundary demonstrates integration and isolates AI business handling, but two databases mean pending/idempotent document registration and real contract/concurrency tests. The decision is not a claim of scale superiority. Resource and latency costs need measurement.

**Evidence:** Owner confirmation plus the five-month/solo constraint; no load results. **Handoff:** implement one slice through these boundaries after policy validation.

**Checklist:** Pass for context/decision/alternatives/consequences/trace; Gap for owner acceptance and implementation/pilot evidence.
