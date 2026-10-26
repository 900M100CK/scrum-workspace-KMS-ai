# Supporting document review register

**Artifact ID:** DOC-REVIEW-REG-01\
**Version/date:** 0.4 Draft · 26 October 2026\
**Status:** Review planning with bounded author rechecks recorded below; no full document-type review or approval.\
**Inputs:** [Development rules](../../development-rules.md) v1.5; [PREFLIGHT-01](../../agent-preflight-checklist.md) v0.1; [REG-00](../artifact-register.md) v0.63; [SDLC-INDEX-01](../README.md) v0.3; [SDLC workflow](../../../agents/WORKFLOW.md), unversioned working guide.\
**Trace:** Supports navigation and review of existing BR-01–BR-15 / SC-01–SC-08 documentation; no new requirement, application slice or acceptance criterion.\
**Owner role:** SDLC coordinator; review assignments remain unassigned.

## Purpose and boundaries

Track reviews of supporting document types alongside the main SDLC specifications. The [artifact register](../artifact-register.md) remains authoritative for artifact identity, version, ownership and dependencies. This file records review scope and follow-up; findings belong in a bounded review record under [reviews](../reviews/).

Assumption: “other document types” means supporting project documentation, including references, reports, handoffs, decisions, runbooks, development guides and evaluation material. The groups below are starting points, not an exhaustive file inventory. Main PRD, use-case, architecture, data, API, UX and test specifications retain the review stages defined in the workflow. No application feature or import-format support is added.

## Review queue by document type

Queue groups remain **Not reviewed** until their full declared scope is reviewed. The bounded author rechecks below close only the named corrections. Existing source checks/reviews retain their historical evidence; suggested roles are routing suggestions, not assignments.

Priority routing: start with DR-08 (agent guidance), DR-05 (architecture/decisions/stack) and DR-06 (release scope), then DR-12 (contracts/specs), DR-01 (protocol evidence) and DR-11 (baseline/addenda). Schedule the remaining groups according to their dependency on the active work slice. These priorities do not authorise changes to baseline requirements or accepted decisions. A bounded correction in REG-00 does not close an entire queue group.

| Review ID | Document type and starting sources | Review focus | Suggested role | State | Evidence / findings |
| --- | --- | --- | --- | --- | --- |
| DR-01 | Protocol references: [byte binding](handoff-byte-reference-2026-10-18.md), [SQL projection](handoff-sql-projection-2026-10-18.md) | Current input versions, exact evidence scope, synthetic/storage versus handler claims, unresolved Proposed dependencies | Contract / data reviewer | Not reviewed | Not recorded |
| DR-02 | Execution and progress [reports](../reports/) | Reproducible commands, environment/date, observed versus inferred results, unrun checks, historical snapshots | Verification reviewer | Not reviewed | Not recorded |
| DR-03 | Downstream [handoffs](../handoffs/) | Canonical inputs, remaining gaps, correction ownership, work-before-AI order, readiness versus approval | SDLC coordinator | Not reviewed | Not recorded |
| DR-04 | Supporting [review records](../reviews/) and [specification review](../spec-review.md) | Source locations/versions, severity, correction owner, evidence required for closure, author versus independent review | Consistency reviewer | Not reviewed | Not recorded |
| DR-05 | [Architecture](../../architecture.md), [ADR index](../../adr/README.md), [technology stack](../../tech-stack.md) | Decision status, owner-direction source, current retrieval technology, input freshness and downstream impact | Architecture reviewer | Not reviewed | Not recorded |
| DR-06 | [Planning](../../planning/five-month-plan.md) and linked scope material | Existing Must boundaries, authorised deferrals, unresolved capacity/calendar inputs, delivery dependencies | Requirements / planning reviewer | Not reviewed | Not recorded |
| DR-07 | Operational runbooks: [PostgreSQL](../../../infra/postgres/README.md) | Prerequisites, actual commands, rollback/data-loss cautions, storage versus application evidence | Operations / data reviewer | Not reviewed | Not recorded |
| DR-08 | Development guides: [pre-flight checklist](../../agent-preflight-checklist.md), [rules](../../development-rules.md), [skills guide](../../../agents/development-skills.md), [workflow](../../../agents/WORKFLOW.md) | Stale drift warnings, authority, canonical paths, pinned sources and actual commands | Development reviewer | Not reviewed | Not recorded |
| DR-09 | Evaluation material: [evaluation entry](../evaluation-cases.md), [eval directory](../../../eval/) | Corpus/source versions, access context, research versus safety suites, frozen criteria, matched baselines and unmeasured claims | Evaluation reviewer | Not reviewed | Not recorded |
| DR-10 | UI supporting material: [UI references](../../../references/README.md), [wireframes](../../ux/wireframes/README.md) | Canonical UX/API bindings, synthetic preview limits, rendered evidence, accessibility and open runtime gaps | UX reviewer | Not reviewed | Not recorded |
| DR-11 | [BRD entry](../../BRD.md), linked baseline and Proposed addenda | Baseline versus proposal, exact source trace and authorisation required for changes; read-only review | Requirements reviewer | Not reviewed | Not recorded |
| DR-12 | [Contract pack](../../../contracts/README.md), [feature specs](../../../specs/README.md) | FR/AC trace, service ownership, permission/failure assertions and structural versus handler evidence | Contract / implementation reviewer | Not reviewed | Not recorded |
| DR-13 | [Analyst material](../../analyst/), root [consistency review](../../../consistency-review.md), [agent change plan](../../../agent-change-plan.md), [owner decisions](../../../owner-decisions-OD-02-03-04-11.md), [research note](../../../research-question-and-advisor-note.md) | Historical/current classification, owner-direction provenance, downstream references; location alone is not a defect | Coordinator / requirements reviewer | Not reviewed | Not recorded |

The UI reference desk and native wireframe previews exist. Unchecked WF tasks may still lack required state variants, native rendering, accessibility/usability or runtime evidence; their unchecked state does not invalidate DR-10's source links. Unversioned workflow input is deliberately identified above; freeze its commit/digest in each concrete review record rather than inventing a guide version here.

## Recording an individual review

1. Select a queue group and add one row below per bounded review. Record exact file paths and versions; use a date plus commit or digest for unversioned inputs. Recheck current headers before starting.
2. Name the reviewer role and checklist, applicable BR/FR/AC/SC trace, exclusions and dependent artifacts. Review existing content without rewriting accepted decisions or historical evidence.
3. Write findings with source locations, severity, impact, correction owner and closure evidence in a linked review record. Log material missing choices for the owner; continue independent work.
4. Record actual checks, environment and outcomes separately from semantic assessment. Structural checks do not prove application behavior or permission enforcement.
5. After an authorised correction, record the revised source version and recheck the specific finding. Update artifact metadata and REG-00 when artifacts change. Preserve prior review snapshots.

| Review record ID | Queue ID | Source paths / reviewed versions | Reviewer / date | Checklist and trace | State | Findings / evidence link | Follow-up owner / next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DOC-CORR-01 | DR-08 | PREFLIGHT-01 v0.1; UC-02 v0.8; TEST-08 v0.21 | Sequential author / 25 October 2026 | B1/B2; retained authority, membership, evidence and evaluation checks | Rechecked | [Correction record](../artifact-register.md#historical-bounded-documentation-corrections--25-october-2026); EX/source assertions checked | Coordinator: remaining known-drift notes still need review |
| DOC-CORR-02 | DR-05 / DR-12 | SAD-03 v0.16; UC-02 v0.8; UML-07 v0.20 | Sequential author / 25 October 2026 | B3–B6; ADR-0004 search selection, FR-70 table and branch-specific audit include | Rechecked | [Correction record](../artifact-register.md#historical-bounded-documentation-corrections--25-october-2026); structural checks only | Existing artifact owners: full semantic/rendered/runtime gaps retained |
| DOC-CORR-03 | DR-06 | PLAN-01 / release-scope.json v0.4; PRD-01 v0.9 | Sequential author / 25 October 2026 | B7; existing ADR-0010/0016 scope and BR/PP/BO trace | Rechecked | [Correction record](../artifact-register.md#historical-bounded-documentation-corrections--25-october-2026); no release-priority change | Coordinator: capacity and application acceptance remain open |
| DOC-CORR-04 | DR-10 | UX-PLAN-01 / UX-WF-EX-01 v0.2; UI-REF-01 v0.4 | Sequential author / 25 October 2026 | R3 clarification; source-link existence versus WF acceptance | Rechecked | [Correction record](../artifact-register.md#historical-bounded-documentation-corrections--25-october-2026); no new visual/runtime acceptance | UX author: complete remaining WF variants and validation |

States: **Not reviewed** → **In review** → **Findings open** or **Rechecked**. Use **Needs owner decision** only for a material missing decision and link the question. **N/A** requires a recorded reason. Rechecked means the named findings were checked against recorded evidence; it does not mean independent approval, complete document consistency or runtime acceptance.

## Checklist and downstream handoff

| Check | Result | Basis |
| --- | --- | --- |
| Separate review tracking from artifact identity and approval | Pass | REG-00 owns artifact metadata; this register owns review routing and follow-up only. |
| Review scope and initial state explicit | Pass | Starting groups and per-review fields are defined; no review result is prefilled. |
| Complete supporting-file inventory and semantic review | Gap | Bounded corrections above do not constitute a full inventory or group review. |
| Application/runtime verification | N/A | Documentation tracking only; no handler or policy change. |

Open decisions: no blocking decision for using this template; broader group assignments remain open. Handoff: Ready for downstream review planning with the bounded corrections recorded. Select the next document set and record its current versions before reviewing; existing design, runtime and owner-decision gaps remain with their canonical sources.

Revision 0.3 updates the linked register version and historical correction anchors after the Studio experiment registration. Review assignments, findings and prior evidence remain unchanged.

Revision 0.4 synchronizes the linked register version following owner selection of Studio. No review finding or assignment changes.
