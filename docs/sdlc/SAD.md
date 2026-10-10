# Architecture — stable SDLC entry

**Artifact ID:** SAD-03-ENTRY
**Version/date:** 0.4 Draft · 10 October 2026
**Status:** Draft for owner review; proposed policies/deferrals are not approved.
**Inputs:** SAD-03 v0.5; PRD-01 v0.4; PLAN-01 v0.1.
**Author:** development agent acting sequentially; owner reviews business choices.

Read [the complete architecture](../architecture.md). It is the single design source; this entry preserves the workflow path without duplicating design.

The canonical artifact is **SAD-03 v0.5**; this pointer is **SAD-03-ENTRY v0.4**. Stage 3 owns both under the [workflow](../../agents/WORKFLOW.md).

## 4+1 Architectural View Model Organization

The canonical architecture ([docs/architecture.md](../architecture.md)) is structured according to Philippe Kruchten's 4+1 Architectural View Model:

1. **Context, Drivers & Decisions (§1):** System scope, business drivers (Authorization Integrity, Evidence Fidelity, AI Outage Fallback, Bounded Footprint), and decision log (ADR-0001–ADR-0006).
2. **Logical View (§2):** Decomposition into Workspace Service, Knowledge Service, Web UI, and Provider Relay; strict Database-per-Service isolation; OpenAPI 3.1.1 schemas and security invariants.
3. **Process View (§3):** Concurrency model; ADR-0006 Protected Handoff Guard; five dynamic runtime workflows; boundary timeouts and retry budgets; explicit AI failure and independent keyword search.
4. **Development View (§4):** Monorepo structure (`services/`, `apps/`, `contracts/`, `specs/`, `eval/`); domain-layer isolation; Node context harness standards.
5. **Physical / Deployment View (§5):** Single-workstation topology; four distinct trust boundaries; database credential isolation; network port allocation.
6. **Scenarios View / +1 View (§6):** Core architectural scenarios SC-01 through SC-08 linking requirements to the four structural views; execution remains unverified.
7. **Traceability & Review (§7):** Per-FR BR sources and implementation responsibilities, scenario references and explicit trace gaps; author checklist; open decision log.

Status: Draft; Needs owner decision. Checklist: Pass for source link and 4+1 structure mapping; Gap for accepted policies and implementation evidence. Handoff: use the canonical architecture and its ADRs for data/API/UI design.

**v0.4 change summary:** Points to SAD-03 v0.5 and its scoped review corrections; this entry makes no approval or implementation claim.
