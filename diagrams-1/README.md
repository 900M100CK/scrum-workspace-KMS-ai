# Central Diagram Index (diagrams-1)

**Artifact ID:** UML-08  
**Version/date:** 1.3 Draft · 17 October 2026  
**Status:** Alternative generated diagram set; semantic, structural and visual verification against current sources is not established by this audit. The registered set remains [UML-07](../docs/sdlc/diagrams/README.md).  
**Coverage:** 13 Use Cases, Kruchten's 4+1 Architectural View Model, and 5-Month SDLC Process.

---

## 1. Kruchten's 4+1 Architectural View Model Mapping

This alternative set is intended to map to Philippe Kruchten's 4+1 Architectural View Model as detailed in [SAD-03 §2–§6](../docs/architecture.md):

| 4+1 View | Diagram ID | Sources | Purpose & Design Focus | Origin / Trace |
| :--- | :--- | :--- | :--- | :--- |
| **+1 Scenarios View** | DGM-UC-01 | [Draw.io](use-case/use-case-diagram.drawio) / [Mermaid](use-case/use-case-diagram.mmd) | 13 Use Cases, Primary Actor specialization, Supporting Systems, `<<include>>` audit | [UC-02 v0.3](../docs/sdlc/use-cases.md); BR-01..14 |
| **+1 Scenarios View** | DGM-SCEN-01 | [Draw.io](scenarios-view/core-scenarios-mapping.drawio) / [Mermaid](scenarios-view/core-scenarios-mapping.mmd) | SC-01 to SC-08 Cross-View Validation Matrix connecting Logical, Process, Dev, Physical | [SAD-03 §6.1](../docs/architecture.md); PRD §3 |
| **+1 Scenarios View** | DGM-JOURNEY-01 | [Draw.io](scenarios-view/core-user-journeys.drawio) / [Mermaid](scenarios-view/core-user-journeys.mmd) | 3 Core Persona User Journeys: Product Owner, Developer, Content Author | [UX-PERSONAS-01](../docs/ux/personas.md); SC-01..08 |
| **Logical View** | DGM-ARCH-01 | [Draw.io](logical-view/service-composition.drawio) / [Mermaid](logical-view/service-composition.mmd) | Minimal microservices boundary: Workspace & Knowledge services, isolated DBs, TB1-TB4 | [SAD-03 §2](../docs/architecture.md); ADR-0002, 0004 |
| **Logical View** | DGM-SITE-01 | [Draw.io](logical-view/application-sitemap.drawio) / [Mermaid](logical-view/application-sitemap.mmd) | Client screen structure, navigation hierarchy, Generic 404 security invariant | [UX-SITEMAP-03](../docs/ux/sitemap.md); SAD-03 §2.1 |
| **Logical View** | DGM-DOMAIN-01 | [Draw.io](logical-view/domain-model.drawio) / [Mermaid](logical-view/domain-model.mmd) | Domain entity model, bounded contexts, soft ID references (zero cross-DB FKs) | [contracts/data-model.json](../contracts/data-model.json) |
| **Process View** | DGM-FLOW-01 | [Draw.io](process-view/ai-qa-flow.drawio) / [Mermaid](process-view/ai-qa-flow.mmd) | AI Q&A runtime flow, 4 checkpoints, ADR-0006 mutex, whole-draft withholding, fallback | [SAD-03 §3.1, §3.2](../docs/architecture.md); ADR-0006 |
| **Process View** | DGM-FLOW-02 | [Draw.io](process-view/board-flow.drawio) / [Mermaid](process-view/board-flow.mmd) | Scrum board mutations, optimistic locking (409 Conflict), blocker events, transactions | [SAD-03 §3.2 Flow 1](../docs/architecture.md); PRD AC-09 |
| **Process View** | DGM-FLOW-03 | [Draw.io](process-view/docs-flow.drawio) / [Mermaid](process-view/docs-flow.mmd) | Knowledge ingestion, immediate Current version, atomic revision replacement, draft exclusion | [SAD-03 §3.2 Flow 2](../docs/architecture.md); ADR-0009 |
| **Process View** | DGM-FLOW-04 | [Draw.io](process-view/permission-read-flow.drawio) / [Mermaid](process-view/permission-read-flow.mmd) | Dual-scope permission evaluation (Project-shared vs Restricted), Generic 404 non-disclosure | [UX-PERM-MATRIX-02](../docs/ux/permission-matrix.md); ADR-0001 |
| **Process View** | DGM-FLOW-05 | [Draw.io](process-view/permission-ai-checkpoints.drawio) / [Mermaid](process-view/permission-ai-checkpoints.mmd) | 4 AI Security Checkpoints: Pre-filter, Provider Mutex, Delivery Re-check, Citation Inspection | [SAD-03 §3.1](../docs/architecture.md); ADR-0006 |
| **Development View** | DGM-DEV-01 | [Draw.io](development-view/package-layering.drawio) / [Mermaid](development-view/package-layering.mmd) | Monorepo layout (`apps/web`, `services/`, `contracts/`), domain independence, no shared DB writes | [SAD-03 §4](../docs/architecture.md); AGENTS.md |
| **Physical View** | DGM-PHYS-01 | [Draw.io](physical-view/deployment-topology.drawio) / [Mermaid](physical-view/deployment-topology.mmd) | Single developer workstation, ports 8000/8001/5432, 4 Trust Boundaries (TB1..TB4) | [SAD-03 §5](../docs/architecture.md); ADR-0003, 0004 |
| **SDLC View** | DGM-SDLC-01 | [Draw.io](sdlc/sdlc-process-flow.drawio) / [Mermaid](sdlc/sdlc-process-flow.mmd) | 5-Month Capstone Plan (Months 1-5), 9 Stages, 2-Week Scrum Loop, Automated CI Gates | [five-month-plan.md](../docs/planning/five-month-plan.md) |

---

## 2. Directory Layout

```
diagrams-1/
├── README.md                           # This index
├── manifest.json                       # Machine-readable diagram register
├── use-case/
│   ├── use-case-diagram.drawio         # DGM-UC-01 (Draw.io source)
│   └── use-case-diagram.mmd            # DGM-UC-01 (Mermaid source)
├── logical-view/
│   ├── service-composition.drawio      # DGM-ARCH-01
│   ├── service-composition.mmd
│   ├── application-sitemap.drawio      # DGM-SITE-01
│   ├── application-sitemap.mmd
│   ├── domain-model.drawio             # DGM-DOMAIN-01
│   └── domain-model.mmd
├── process-view/
│   ├── ai-qa-flow.drawio               # DGM-FLOW-01
│   ├── ai-qa-flow.mmd
│   ├── board-flow.drawio               # DGM-FLOW-02
│   ├── board-flow.mmd
│   ├── docs-flow.drawio                # DGM-FLOW-03
│   ├── docs-flow.mmd
│   ├── permission-read-flow.drawio     # DGM-FLOW-04
│   ├── permission-read-flow.mmd
│   ├── permission-ai-checkpoints.drawio# DGM-FLOW-05
│   └── permission-ai-checkpoints.mmd
├── development-view/
│   ├── package-layering.drawio         # DGM-DEV-01
│   └── package-layering.mmd
├── physical-view/
│   ├── deployment-topology.drawio      # DGM-PHYS-01
│   └── deployment-topology.mmd
├── scenarios-view/
│   ├── core-scenarios-mapping.drawio   # DGM-SCEN-01
│   ├── core-scenarios-mapping.mmd
│   ├── core-user-journeys.drawio       # DGM-JOURNEY-01
│   └── core-user-journeys.mmd
└── sdlc/
    ├── sdlc-process-flow.drawio        # DGM-SDLC-01
    └── sdlc-process-flow.mmd
```

---

## 3. Structural Validation & Compliance

Historical generation claims (not independently reverified on 17 October 2026):
- Validated with `scripts/validate.py` from Draw.io Architecture Studio.
- Strict adherence to `<mxGeometry relative="1" as="geometry"/>` on all edges.
- Zero sibling node overlaps, valid IDs, clean orthogonal routes.
- Dual format (Draw.io + Mermaid) maintained for complete project traceability.

**v1.1 freshness correction:** Fixed source links for the actual root-level folder and removed unsupported Complete/Canonical status. Older source-version labels remain the generation inputs, not current-source review evidence. `docs:lint` does not register this alternative set. Compare both formats against the current manifest and inspect renders before promotion.

## Known source drift — 17 October 2026

This set contains historical illustrations, not current implementation instructions. On 17 October, the nine shared views were refreshed as copies of the canonical sources. The five alternative-only views remain unverified. Framework labels are candidate-only, vector dimensions are configuration-defined, and keyword/semantic paths are independent. These corrections do not validate the remaining domain/deployment/scenario/SDLC claims. Use the [registered canonical drafts](../docs/sdlc/diagrams/README.md) for current design. The root-level manifest paths and generator output paths are corrected, but regeneration does not perform semantic reconciliation or establish approval.

## Recommended documentation direction — 17 October 2026

Use C4 Context/Container as the primary architecture communication views, with focused UML/ERD detail. Keep 4+1 as a coverage crosswalk; see [the correction report](../docs/sdlc/diagrams/review-2026-10-17.md). Nine shared files are snapshots copied from the registered set, not a second source of truth. Edit canonical files first; do not implement from the five alternative-only sketches. No C4 migration or deployment acceptance is claimed.

## Canonical successors — 17 October 2026

Use the [registered foundation](../docs/sdlc/diagrams/design-foundation-2026-10-17.md) for current design work: C4-01/02 replace the structural entry; DATA-01/02/03 replace the alternative domain model; DEV-01 and DEPLOY-01 replace alternative package/deployment guidance; the report supplies the scenario crosswalk. Original alternatives remain unverified historical drafts. Nine shared diagrams are refreshed copies of the registered set.
