# Use one relational engine with owned databases

**Artifact ID:** ADR-0004  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** [architecture](../architecture.md) v0.1; PRD-01 v0.4; PLAN-01 v0.1.  
**Author:** development agent acting sequentially; owner reviews business choices.

**Decision status:** Proposed; authoring is not acceptance.

**Context:** Versions, grants, work state and audits require relational correctness; semantic discovery must respect current document scope (BR-05, BR-07, BR-10, BR-14).

**Decision proposed:** One PostgreSQL engine, separate owned databases/credentials for Workspace and Knowledge, and pgvector as the Knowledge vector candidate. Start with scoped exact discovery on the small pilot corpus. Embedding dimension, model and index parameters are pilot settings. No cross-database joins/writes.

**Alternatives:** A dedicated vector server adds deployment cost; choose it only if measured retrieval operations justify it. Graph storage is not justified by manual links. Approximate indexes are optional after a recall/latency baseline, not the default demonstration.

**Consequences:** Fewer infrastructure products; operational/version metadata and passages remain distinct. A local database says nothing about embedding/generation locality. Authority checks occur independently of vector scores.

**Evidence:** [pgvector official repository](https://github.com/pgvector/pgvector) documents exact and approximate search. Feasibility, chosen versions and permission-filtered query behaviour have not been tested. **Handoff:** complete physical migrations after OD-12/store acceptance; never invent universal vector settings.

**Checklist:** Pass for context/decision/alternatives/consequences/trace; Gap for owner acceptance and implementation/pilot evidence.
