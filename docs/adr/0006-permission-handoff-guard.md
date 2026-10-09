# Serialise current permission checks with protected handoff

**Artifact ID:** ADR-0006  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** [architecture](../architecture.md) v0.1; PRD-01 v0.4; PLAN-01 v0.1.  
**Author:** development agent acting sequentially; owner reviews business choices.

**Decision status:** Proposed; authoring is not acceptance.

**Context:** A remote current-access check followed by a later send leaves a race; uncited context can influence model output. BR-10/BR-14 and PRD FR-14/FR-28/FR-29/FR-39/FR-55 require revocation boundaries to be explicit.

**Decision proposed:** A single active Workspace permission/gateway process owns project/session guards. Permission mutations commit under the same guard as final check → provider-input or response transport handoff. Knowledge chooses evidence and validates version state; Workspace performs a narrow registered-provider transport relay. Generation waiting is outside the handoff guard. Revocation success means committed after prior handoffs have finished/aborted. Timeout aborts cannot resume later; rejoin never revives invalidated grants. Publication/archive/deletion use the gateway project guard but commit only in Knowledge; final validity validation is inside that guard. Unknown remote-write outcome blocks protected handoffs until reconciliation rather than assuming timeout cancelled the write. Buffer answer output until evidence-set validation, then withhold the whole original draft if any source is revoked.

**Alternatives:** Check-then-send alone does not prove the strong boundary. Distributed leases or multiple permission replicas require expiry/fencing/commit semantics and a new ADR; not selected for the first five-month deployment. Holding permission locks for all generation would delay revocation/board work unnecessarily.

**Consequences:** Only one active authority process initially; provider waits use a separately bounded lane. Workspace sees transient protected transport payloads, so logs exclude them. No cross-service data writes or copied permission rules. Abort/guard ordering and process-restart behaviour require real integration tests before claiming enforcement.

**Evidence:** Required negative cases, not executed evidence. Pause before/inside handoff, revoke, timeout, restart and retry; verify committed-revocation ordering and no output after an aborted handoff. The boundary is server handoff, not downstream receipt/rendering; data already sent cannot be recalled. **Handoff:** Proposed and unproven until these tests pass; never use the diagram alone as permission evidence.

**Checklist:** Pass for context/decision/alternatives/consequences/trace; Gap for owner acceptance and implementation/pilot evidence.
