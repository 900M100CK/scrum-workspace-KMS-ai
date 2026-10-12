# Personas & User Responsibilities (SACW)

**Artifact ID:** UX-PERSONAS-01\
**Version/date:** 0.3 Draft · 12 October 2026\
**Status:** Illustrative draft; no interviews or measured satisfaction.\
**Source versions:** BRD English v1.0; PRD-01 v0.4; UC-02 v0.2; SAD-03 v0.5; Proposed ADR-0001 v0.2 / ADR-0006 v0.1.\
**Trace:** BR-01–BR-15; FR-01–FR-69; SC-01–SC-08.\
**Scope:** Core user goals and examples; Enhanced reports and Future Work remain outside these journeys.

## 1. Responsibilities and access assumptions

Names and situations are synthetic examples. Scrum responsibilities describe user needs, not system permission enums. All personas need authenticated sessions and current project membership. Document access is project-shared or restricted with an explicit current read grant. Content-write, lifecycle, manage-access, audit-read and trace-read capabilities are separate scoped authorities; titles do not grant them automatically. Action-to-role mapping remains OD-02.

| Persona | Responsibility / goal | Illustrative capability assumption | Source / AI access |
| --- | --- | --- | --- |
| Sarah, Product Owner | Prioritise Backlog and find recorded rationale | Work editing; lifecycle/manage-access only if separately assigned | Only currently permitted sources, including restricted with grant |
| Alex, Scrum Master | Follow blockers and facilitate Sprint lifecycle | Sprint/blocker actions only if assigned | Current Workspace state; permitted documents explain history |
| David, Developer | Implement tasks and inspect exact source requirements | Task updates; content-write only for assigned documents | No Draft in retrieval/model context; direct Draft needs content-write and document checks |
| Maya, stakeholder | Observe permitted work and supporting decisions | Read-only work; scoped inspection only if separately assigned | Restricted reads possible with grant; stakeholder status neither grants nor forbids them |

Membership and document-access management are separate. An administrator does not automatically read restricted content. Removal invalidates grants; rejoining needs fresh restricted grants. Audit/trace capabilities give no source content access (FR-56/FR-58).

## 2. Illustrative profiles

### Sarah — Product Owner

Sarah wants ordered Backlog items with clear acceptance criteria and linked documents. Her hypothesised difficulty is remembering recorded rationale across Sprints. An example question is **“What rationale was recorded for the authentication approach?”** It assumes no chosen authentication technology. The answer must use permitted recorded evidence or state insufficient evidence; application stack choices remain Proposed.

In the journey Sarah creates a Story, publishes a permitted immutable Draft as Current and observes the former Current as Superseded. Classification changes and revocation require separately assigned manage-access authority. These are human UI mutations, never runtime AI actions (SC-05/SC-06).

### Alex — Scrum Master

Alex wants to distinguish a historical plan from a confirmed blocker resolution. Blocked status derives from the latest ordered blocker event. Alex uses All / Blocked Only / My Tasks on authorised cards, and starts/completes a Sprint only with the relevant capability. One Active Sprint remains the proposed PRD policy.

“Which tasks are currently blocked?” uses current Workspace records and an observation locator/time. During provider failure Alex can continue permitted work while Workspace is healthy. Keyword/docs additionally need Knowledge and current permission checks to be healthy (SC-03/SC-08).

### David — Developer

David follows a task to applicable specifications and checks claims against exact immutable passages/versions. With state-change authority he moves work through **To Do → In Progress → Done** and flags/resolves blockers with the relevant capability. Failed/stale mutations show explicit errors/conflicts.

A revision creates Draft, excluded from current/historical retrieval and model context. Direct Draft reading needs content-write and document checks. History labels Superseded/Archived. Citation opening renews access checks and never silently substitutes Current for missing evidence (SC-01/SC-02/SC-05).

### Maya — Stakeholder

Maya wants a readable Board and decision evidence without editing work. Read-only is an illustrative capability assignment, not a permanent persona restriction. Membership allows project-shared reads; restricted reads need explicit grants. Inaccessible protected resources expose the same generic 404 as unknown ones without hidden titles/counts/versions.

Maya inspects audit events/traces only with separately scoped capabilities and still needs source permission for details. Unsupported questions receive insufficient evidence without explaining hidden sources (SC-06/SC-07).

## 3. Journey diagram

[DGM-JOURNEY-01 Draw.io](../sdlc/diagrams/user-journey/core-user-journeys.drawio) / [Mermaid](../sdlc/diagrams/user-journey/core-user-journeys.mmd) contains three illustrative sequences. Numeric scores are Mermaid display inputs, **not measured satisfaction, research results or evaluation evidence**. Title, actors and Draw.io steps carry that qualification. Capabilities are assumed only for the synthetic example.

## 4. UI implications and handoff

Controls reflect current action capabilities; servers enforce requests. Citation chips use server-controlled exact locators and only permitted metadata. Buffer answers until the full evidence set passes guarded checks. If any source, including uncited context, is revoked, withhold the whole original draft; stripping a chip or sentence is insufficient.

Provider outage shows explicit failure and independent keyword access while dependencies are healthy. Knowledge outage makes docs/search unavailable; Workspace operations continue only while their own dependencies are healthy. Indexing-not-ready is distinct from provider outage and denial.

**Assumptions/open decisions:** Personas/pain points await interviews (OD-01); action assignments OD-02; history OD-04; environment OD-06; identity OD-09. No policy or feature is approved.

**Checklist:** Pass for responsibility/capability separation and illustrative-evidence labels; Gap for research, complete UI/UX workbook review, accessibility/usability evaluation and runtime tests. **Handoff:** Ready for scoped Stage 7/8/9 review; consolidated UX-06 entry is still missing.

**v0.3 correction:** Removed administrator/viewer shortcuts, old classifications, authentication-choice assumption, four-column Board and unconditional outage-continuity claims; qualified journey scores/examples.
