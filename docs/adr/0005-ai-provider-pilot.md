# Select one AI configuration through a bounded pilot

**Artifact ID:** ADR-0005  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** [architecture](../architecture.md) v0.1; PRD-01 v0.4; PLAN-01 v0.1.  
**Author:** development agent acting sequentially; owner reviews business choices.

**Decision status:** Proposed; authoring is not acceptance.

**Context:** PP-04/PP-06 need useful verifiable answers, not a many-model benchmark. Student machine/API budget and entitlement are unknown; the owner asked not to overemphasise budgeting.

**Decision proposed:** Provider-independent embedding/generation interfaces and one initial permitted configuration. Use synthetic English text, about 20–30 questions, keyword baseline and manual claim support. Record model/provider/embedding settings. Choose cloud or local after checking the available machine, permitted data handling, quality and measured median/p95. Do not commit a model name, price or retention guarantee without evidence.

**Alternatives:** Local requires adequate measured hardware; cloud requires authorised data transfer and runtime/API allowance. Use one alternate only if the initial pilot fails the needed gate. Existing development-assistant access is not assumed to fund runtime calls.

**Consequences:** No new training, framework or runtime agents. Board/document/keyword fallback works without providers. Operator usage bounds stop new AI requests explicitly.

**Evidence:** BRD §13 evaluation commitments and owner's student-project instruction; no provider run or price calculation. **Handoff:** OD-06 selects a concrete configuration before D0b/SP-09; final criteria are frozen after pilot.

**Checklist:** Pass for context/decision/alternatives/consequences/trace; Gap for owner acceptance and implementation/pilot evidence.
