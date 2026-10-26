# UI reference desk

**Artifact ID:** UI-REF-01
**Version/date:** 0.5 Draft · 25 October 2026
**Status:** Local source index and bounded author review; no independent acceptance.
**Inputs:** PRD-01 v0.9; UC-02 v0.8; SAD-03 v0.16; UX-06 v0.13; UX-BLUEPRINT-01 v1.4; UX-PLAN-01 v0.2; Proposed ADR-0018/0019/0021/0022.
**Trace:** BR-01/02/03/10/12/13; SC-01/03/06/08; SP-01–SP-04 presentation groundwork.

This folder is the review desk requested by the owner before starting UI work. Link to canonical documents rather than copying them. A listed source is not approval. Preserve the distinction between proposed design, a rendered sample and tested application behaviour.

| Read order | Canonical source | What to check before changing a screen |
| --- | --- | --- |
| 1 | [Development rules](../docs/development-rules.md), [pre-flight](../docs/agent-preflight-checklist.md), [workflow](../agents/WORKFLOW.md) | Authority, scope, evidence and handoff |
| 2 | [BRD entry](../docs/BRD.md), [PRD/SRS](../docs/sdlc/PRD_SRS.md), [delivery plan](../docs/planning/five-month-plan.md) | Requirement → acceptance criterion; work before AI |
| 3 | [Architecture](../docs/architecture.md), [ADR index](../docs/adr/README.md) | Service ownership; Proposed decisions remain open |
| 4 | [UX entry](../docs/sdlc/ui-ux-spec.md), [blueprint](../docs/sdlc/ui-ux-blueprint.md), [wireframe work plan](../docs/ux/wireframe-workplan.md) | Screen scope, required states and visual assumptions |
| 5 | [Sitemap](../docs/ux/sitemap.md), [permission matrix](../docs/ux/permission-matrix.md), [Board flow](../docs/ux/flows/board-flow.md) | Reachable navigation; capability versus descriptive role |
| 6 | [Workspace API](../contracts/openapi/workspace.openapi.json), [Knowledge API](../contracts/openapi/knowledge.openapi.json) | Actual request/response fields; errors and independent entitlements |
| 7 | [Session](../specs/001-session.md), [projects](../specs/002-project-membership.md), [create task](../specs/003-create-task.md), [update task](../specs/004-update-task.md) | Boundaries for the first implementation slices |

## Review record

Use [the initial UI review](ui-review-2026-10-23.md) as a historical first-preview record. The [24 October implementation handoff](ui-work-wireframe-2026-10-24.md) records the owner-authorised corrections against [the Excalidraw wireframes](../docs/ux/wireframes/README.md), updated preview coverage and remaining gaps. The [local preview guide](../apps/web/README.md) gives run/test commands.

Before the next UI slice, record source versions, FR/AC/UC references, exact operations/fields, loading/empty/denied/failure/conflict/unknown states, actual checks and remaining gaps. Review only relevant sections; this index does not authorise broad document edits.

Checklist/handoff: Pass for canonical source navigation and bounded first-slice trace. Gap for live session, permission, persistence and usability acceptance. No source document is approved by this reference desk.

Revision 0.2 adds the work-preview handoff and links the owner-provided Excalidraw design reference. It changes no requirement or design approval status.

Revision 0.3 adds the [Taste redesign record](ui-redesign-2026-10-24.md) and fresh desktop/tablet/phone screenshots. Earlier review records retain their historical evidence.

Revision 0.4 adds the [dark theme and Board separation report](ui-dark-theme-2026-10-24.md), including the current token table, screenshots and bounded verification for the UI/UX report. Earlier palette trials remain historical.

Revision 0.5 adds the [Hallmark Studio branch experiment](hallmark-studio-2026-10-25.md) and refreshes current input versions. It records an alternative direction, not adoption or independent acceptance.
