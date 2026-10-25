# Supporting document review register

**Artifact ID:** DOC-REVIEW-REG-01\
**Version/date:** 0.1 Draft · 25 October 2026\
**Status:** Review planning register; no document review or approval is claimed.\
**Inputs:** [Development rules v1.5](../../development-rules.md), [pre-flight checklist](../../agent-preflight-checklist.md), [SDLC workflow](../../../agents/WORKFLOW.md), [REG-00](../artifact-register.md), [SDLC index](../README.md).\
**Trace:** Supports navigation and review of existing BR-01–BR-15 / SC-01–SC-08 documentation; no new requirement, application slice or acceptance criterion.\
**Owner role:** SDLC coordinator; review assignments remain unassigned.\

## Purpose and boundaries

Track reviews of supporting document types alongside the main SDLC specifications. The [artifact register](../artifact-register.md) remains authoritative for artifact identity, version, ownership and dependencies. This file records review scope and follow-up; findings belong in a bounded review record under [reviews](../reviews/).

Assumption: “other document types” means supporting project documentation, including references, reports, handoffs, decisions, runbooks, development guides and evaluation material. The groups below are starting points, not an exhaustive file inventory. Main PRD, use-case, architecture, data, API, UX and test specifications retain the review stages defined in the workflow. No application feature or import-format support is added.

## Review queue by document type

All rows are **Not reviewed** in this register. Existing checks or reviews linked by a source remain their own historical evidence; they do not constitute a new review here. Suggested roles are routing suggestions, not assignments.

| Review ID | Document type and starting sources | Review focus | Suggested role | State | Evidence / findings |
| --- | --- | --- | --- | --- | --- |
| DR-01 | Protocol references: [byte binding](handoff-byte-reference-2026-10-18.md), [SQL projection](handoff-sql-projection-2026-10-18.md) | Current input versions, exact evidence scope, synthetic/storage versus handler claims, unresolved Proposed dependencies | Contract / data reviewer | Not reviewed | Not recorded |
| DR-02 | Execution and progress [reports](../reports/) | Reproducible commands, environment/date, observed versus inferred results, unrun checks, historical snapshots | Verification reviewer | Not reviewed | Not recorded |
| DR-03 | Downstream [handoffs](../handoffs/) | Canonical inputs, remaining gaps, correction ownership, work-before-AI order, readiness versus approval | SDLC coordinator | Not reviewed | Not recorded |
| DR-04 | Supporting [review records](../reviews/) and [specification review](../spec-review.md) | Source locations/versions, severity, correction owner, evidence required for closure, author versus independent review | Consistency reviewer | Not reviewed | Not recorded |
| DR-05 | [ADR index](../../adr/README.md) and linked records | Decision status, owner-direction source, downstream impact, distinction between Proposed and implemented | Architecture reviewer | Not reviewed | Not recorded |
| DR-06 | [Planning](../../planning/five-month-plan.md) and linked scope material | Existing Must boundaries, authorised deferrals, unresolved capacity/calendar inputs, delivery dependencies | Requirements / planning reviewer | Not reviewed | Not recorded |
| DR-07 | Operational runbooks: [PostgreSQL](../../../infra/postgres/README.md) | Prerequisites, actual commands, rollback/data-loss cautions, storage versus application evidence | Operations / data reviewer | Not reviewed | Not recorded |
| DR-08 | Development guides: [rules](../../development-rules.md), [skills guide](../../../agents/development-skills.md), [workflow](../../../agents/WORKFLOW.md) | Authority, canonical paths, pinned sources, current commands, no implied scope or permission grants | Development reviewer | Not reviewed | Not recorded |
| DR-09 | Evaluation material: [evaluation entry](../evaluation-cases.md), [eval directory](../../../eval/) | Corpus/source versions, access context, research versus safety suites, frozen criteria, matched baselines and unmeasured claims | Evaluation reviewer | Not reviewed | Not recorded |
| DR-10 | UI supporting material: [UI references](../../../references/README.md), [wireframes](../../ux/wireframes/README.md) | Canonical UX/API bindings, synthetic preview limits, rendered evidence, accessibility and open runtime gaps | UX reviewer | Not reviewed | Not recorded |

## Recording an individual review

1. Select a queue group and add one row below per bounded review. Record exact file paths and versions; use a date plus commit or digest for unversioned inputs. Recheck current headers before starting.
2. Name the reviewer role and checklist, applicable BR/FR/AC/SC trace, exclusions and dependent artifacts. Review existing content without rewriting accepted decisions or historical evidence.
3. Write findings with source locations, severity, impact, correction owner and closure evidence in a linked review record. Log material missing choices for the owner; continue independent work.
4. Record actual checks, environment and outcomes separately from semantic assessment. Structural checks do not prove application behavior or permission enforcement.
5. After an authorised correction, record the revised source version and recheck the specific finding. Update artifact metadata and REG-00 when artifacts change. Preserve prior review snapshots.

| Review record ID | Queue ID | Source paths / reviewed versions | Reviewer / date | Checklist and trace | State | Findings / evidence link | Follow-up owner / next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Unassigned | Unassigned | Not recorded | Unassigned | Not recorded | Not reviewed | Not recorded | Coordinator: select the first bounded review |

States: **Not reviewed** → **In review** → **Findings open** or **Rechecked**. Use **Needs owner decision** only for a material missing decision and link the question. **N/A** requires a recorded reason. Rechecked means the named findings were checked against recorded evidence; it does not mean independent approval, complete document consistency or runtime acceptance.

## Checklist and downstream handoff

| Check | Result | Basis |
| --- | --- | --- |
| Separate review tracking from artifact identity and approval | Pass | REG-00 owns artifact metadata; this register owns review routing and follow-up only. |
| Review scope and initial state explicit | Pass | Starting groups and per-review fields are defined; no review result is prefilled. |
| Complete supporting-file inventory and semantic review | Gap | Neither has been performed by creating this register. |
| Application/runtime verification | N/A | Documentation tracking only; no handler or policy change. |

Open decisions: no blocking decision for using this template; the first review target and reviewer remain unassigned. Handoff: Ready for downstream review planning. Select a bounded document set and record its current versions before reviewing; existing design, runtime and owner-decision gaps remain with their canonical sources.
