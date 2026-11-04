# HF42-T02 — Layering clarification

**Artifact ID:** HF42-T02\
**Version/date:** 0.1 Draft · 4 November 2026

Parent/status authority: [plan](../plan.md). Trace: HOTFIX-BACKEND-42-01 / PLAN-01 Month 1 / M-02–M-03 / SP-03–SP-04 support, no changed acceptance.

Prerequisites: T01; baseline results; owner text; projectAccess/transaction, ownedTransaction, Task create/list and migration003 trigger.

Steps: Replace §4.2 with the owner text plus explicit source links and retained one-way dependency invariant. Scope Task sequence; distinguish recorded denial from arbitrary null. Bump SAD-03 to 0.17 and entry to 0.16; preserve non-4.2 design. Enumerate metadata before writing.

Allowed paths: docs/architecture.md, docs/sdlc/SAD.md and this feature folder. Exact downstream metadata paths are to be recorded below before any downstream edit.

Acceptance/verification: Final checks in T03; source and before-image comparisons; no code or diagram semantic changes.

Result/handoff: record in [plan](../plan.md), with evidence and final handoff; never self-approve.

## Exact downstream write scope — recorded before edits

Metadata-only paths below are required by current header/generated-source references. Architecture and entry semantic scope remains the owner-defined bounded edit. No dated report/review/handoff or graph semantics may change.

- `docs/architecture.md`
- `docs/implementation/features/README.md`
- `docs/implementation/register.md`
- `docs/implementation/roadmap.md`
- `docs/sdlc/SAD.md`
- `docs/sdlc/api-design.md`
- `docs/sdlc/artifact-register.md`
- `docs/sdlc/data-design.md`
- `docs/sdlc/diagrams/README.md`
- `docs/sdlc/diagrams/architecture/README.md`
- `docs/sdlc/diagrams/architecture/service-composition.drawio`
- `docs/sdlc/diagrams/architecture/service-composition.mmd`
- `docs/sdlc/diagrams/c4/README.md`
- `docs/sdlc/diagrams/c4/containers.drawio`
- `docs/sdlc/diagrams/c4/containers.mmd`
- `docs/sdlc/diagrams/c4/system-context.drawio`
- `docs/sdlc/diagrams/c4/system-context.mmd`
- `docs/sdlc/diagrams/data/README.md`
- `docs/sdlc/diagrams/data/handoff-logical-model.drawio`
- `docs/sdlc/diagrams/data/handoff-logical-model.mmd`
- `docs/sdlc/diagrams/data/knowledge-erd.drawio`
- `docs/sdlc/diagrams/data/knowledge-erd.mmd`
- `docs/sdlc/diagrams/data/workspace-erd.drawio`
- `docs/sdlc/diagrams/data/workspace-erd.mmd`
- `docs/sdlc/diagrams/deployment/README.md`
- `docs/sdlc/diagrams/deployment/local-development.drawio`
- `docs/sdlc/diagrams/deployment/local-development.mmd`
- `docs/sdlc/diagrams/development/README.md`
- `docs/sdlc/diagrams/development/package-ownership.drawio`
- `docs/sdlc/diagrams/development/package-ownership.mmd`
- `docs/sdlc/diagrams/flowchart/README.md`
- `docs/sdlc/diagrams/flowchart/ai-qa-flow.drawio`
- `docs/sdlc/diagrams/flowchart/ai-qa-flow.mmd`
- `docs/sdlc/diagrams/flowchart/board-flow.drawio`
- `docs/sdlc/diagrams/flowchart/board-flow.mmd`
- `docs/sdlc/diagrams/flowchart/docs-flow.drawio`
- `docs/sdlc/diagrams/flowchart/docs-flow.mmd`
- `docs/sdlc/diagrams/flowchart/permission-ai-checkpoints.drawio`
- `docs/sdlc/diagrams/flowchart/permission-ai-checkpoints.mmd`
- `docs/sdlc/diagrams/flowchart/permission-read-flow.drawio`
- `docs/sdlc/diagrams/flowchart/permission-read-flow.mmd`
- `docs/sdlc/diagrams/manifest.json`
- `docs/sdlc/diagrams/sequence/README.md`
- `docs/sdlc/diagrams/sequence/document-creation.drawio`
- `docs/sdlc/diagrams/sequence/document-creation.mmd`
- `docs/sdlc/diagrams/sequence/protected-handoff.drawio`
- `docs/sdlc/diagrams/sequence/protected-handoff.mmd`
- `docs/sdlc/diagrams/sitemap/README.md`
- `docs/sdlc/diagrams/sitemap/application-sitemap.drawio`
- `docs/sdlc/diagrams/sitemap/application-sitemap.mmd`
- `docs/sdlc/diagrams/state/README.md`
- `docs/sdlc/diagrams/state/document-and-readiness.drawio`
- `docs/sdlc/diagrams/state/document-and-readiness.mmd`
- `docs/sdlc/diagrams/state/sprint-task-allocation.drawio`
- `docs/sdlc/diagrams/state/sprint-task-allocation.mmd`
- `docs/sdlc/diagrams/use-case/README.md`
- `docs/sdlc/diagrams/use-case/use-case-diagram.drawio`
- `docs/sdlc/diagrams/use-case/use-case-diagram.mmd`
- `docs/sdlc/diagrams/user-journey/README.md`
- `docs/sdlc/diagrams/user-journey/core-user-journeys.drawio`
- `docs/sdlc/diagrams/user-journey/core-user-journeys.mmd`
- `docs/sdlc/evaluation-cases.md`
- `docs/sdlc/references/document-review-register.md`
- `docs/sdlc/requirement-verification.md`
- `docs/sdlc/test-coverage.md`
- `docs/sdlc/test-plan.md`
- `docs/sdlc/ui-ux-blueprint.md`
- `docs/sdlc/ui-ux-spec.md`
- `docs/ux/wireframe-workplan.md`
- `docs/ux/wireframes/README.md`

Exact version mapping: [metadata-scope.json](../evidence/metadata-scope.json). Derived from the registered plan before T02 target edits.
