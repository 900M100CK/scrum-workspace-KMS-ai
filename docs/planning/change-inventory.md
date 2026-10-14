# Current change inventory

**Artifact ID:** CHANGE-INVENTORY-01
**Version/date:** 0.1 Draft - 14 October 2026
**Status:** Post-edit inventory, not a recreated clean baseline.

HEAD observed: c6bd8dc870714d097dd3533f1e59f65031a78266. Working tree was already dirty and remains uncommitted. Original pre-edit evidence is in the business review; this inventory does not pretend all current files existed at T0. Owner clarifications supersede original plan counts and no-migration wording.

## Environment and evidence

.nvmrc and CI configuration specify Node 24. Working-tree checks used portable Node 24.21.0; context tests last passed 31/31. Current scope has 69 active FRs plus Withdrawn FR-45, 60 Must/4 Should/4 Could/1 Wont, 56 operations. Submodule is initialized locally at 3c65f5cbefa7d69a75cadd89b177e3add8b400b0 with unrelated modifications preserved. Remote pin/clean-clone execution remains unverified. No commits or upstream pushes.

## Reference inventory by file

Search covers Markdown/JSON/JS/SQL/YAML/Mermaid/Draw.io text in docs, specs, contracts, eval, tests and scripts. This is a discovery inventory with review routing, not proof that every match is semantically correct. Draft document status, explicit lifecycle exclusions, historical snapshots and negative tests must not be deleted by global replacement. Full residual line-level classification remains T9 work.

| File | Match categories | Task owner | Initial disposition |
| --- | --- | --- | --- |
| contracts/CHANGELOG.md | Draft/lifecycle, FR-45 | T5 | Historical/proposed/review material; inspect context before changing |
| contracts/README.md | Draft/lifecycle | T5 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| contracts/data-model.json | Draft/lifecycle | T5 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| contracts/events/domain-change.schema.json | Draft/lifecycle | T5 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| contracts/openapi/knowledge.openapi.json | Draft/lifecycle, Legacy count | T5 | Current contract: Draft header is design status; no product Draft permitted |
| contracts/openapi/workspace.openapi.json | Draft/lifecycle, Legacy count | T5 | Current contract: Draft header is design status; no product Draft permitted |
| docs/BRD.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/adr/0001-protected-resource-read-policy.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/adr/0002-minimal-microservices.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/adr/0003-student-stack.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/adr/0005-ai-provider-pilot.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/adr/0006-permission-handoff-guard.md | Draft/lifecycle | T8/T9 | Historical/proposed/review material; inspect context before changing |
| docs/adr/0009-versions-without-draft.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/adr/0010-release-scope-and-capacity.md | FR-45 | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/adr/0012-audit-visibility-and-durable-evidence.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/adr/0013-unavailable-citations-and-withheld-answers.md | Draft/lifecycle, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/adr/0014-multiple-sprint-allocation.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/adr/0015-partial-evidence-answers.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/adr/0016-optional-task-keyword-search.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/adr/0017-membership-removal-capabilities-and-assignees.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/adr/README.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/analyst/PRD_SRS_v0.3_patch.md | Draft/lifecycle, FR-45, Legacy count | T3 | Historical/proposed/review material; inspect context before changing |
| docs/analyst/architecture_4_plus_1_restructuring_report.md | Draft/lifecycle, Legacy count | T4 | Historical/proposed/review material; inspect context before changing |
| docs/analyst/business-review-2026-10-13.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Historical/proposed/review material; inspect context before changing |
| docs/analyst/evaluation-25-case-proposal.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/architecture.md | Draft/lifecycle, FR-45, Legacy count | T4 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md | Draft/lifecycle | T8/T9 | Historical/proposed/review material; inspect context before changing |
| docs/planning/backlog.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/planning/change-report.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Historical/proposed/review material; inspect context before changing |
| docs/planning/five-month-plan.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/planning/release-scope.json | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/planning/review-handoff.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Historical/proposed/review material; inspect context before changing |
| docs/sdlc/CHANGELOG.md | Draft/lifecycle, Legacy count | T8/T9 | Historical/proposed/review material; inspect context before changing |
| docs/sdlc/PRD_SRS.md | Draft/lifecycle, FR-45, Legacy count | T3 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/SAD.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/api-design.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/artifact-register.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/data-design.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/data-policy-fit-review.md | Draft/lifecycle | T8/T9 | Historical/proposed/review material; inspect context before changing |
| docs/sdlc/diagrams/README.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/architecture/README.md | Draft/lifecycle | T4 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/architecture/service-composition.drawio | Draft/lifecycle | T4 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/architecture/service-composition.mmd | Draft/lifecycle | T4 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/flowchart/README.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/flowchart/ai-qa-flow.drawio | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/flowchart/ai-qa-flow.mmd | Draft/lifecycle, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/flowchart/board-flow.drawio | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/flowchart/board-flow.mmd | Draft/lifecycle, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/flowchart/docs-flow.drawio | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/flowchart/docs-flow.mmd | Draft/lifecycle, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/flowchart/permission-ai-checkpoints.drawio | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/flowchart/permission-ai-checkpoints.mmd | Draft/lifecycle, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/flowchart/permission-read-flow.drawio | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/flowchart/permission-read-flow.mmd | Draft/lifecycle, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/review.md | Draft/lifecycle | T8/T9 | Historical/proposed/review material; inspect context before changing |
| docs/sdlc/diagrams/sitemap/README.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/sitemap/application-sitemap.drawio | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/sitemap/application-sitemap.mmd | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/use-case/README.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/user-journey/README.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/user-journey/core-user-journeys.drawio | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/diagrams/user-journey/core-user-journeys.mmd | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/evaluation-cases.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/requirement-verification.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/spec-review.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Historical/proposed/review material; inspect context before changing |
| docs/sdlc/test-coverage.md | Draft/lifecycle, FR-45 | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/test-plan-v0.2-history.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/test-plan.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/ui-ux-spec.md | Draft/lifecycle | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/sdlc/use-cases.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/tech-stack.md | Draft/lifecycle, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/ux/flows/ai-qa-flow.md | Draft/lifecycle, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/ux/flows/board-flow.md | Draft/lifecycle, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/ux/flows/docs-flow.md | Draft/lifecycle, FR-45, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/ux/permission-matrix.md | Draft/lifecycle, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/ux/personas.md | Draft/lifecycle, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| docs/ux/sitemap.md | Draft/lifecycle, Legacy count | T8/T9 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| eval/README.md | Draft/lifecycle | T7 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| eval/fixtures/corpus.json | Draft/lifecycle | T7 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| eval/fixtures/history/reference-cases-pre-lifecycle-0.2.json | Draft/lifecycle, Legacy count | T7 | Historical/proposed/review material; inspect context before changing |
| eval/fixtures/history/research-cases-0.1.json | Draft/lifecycle | T7 | Historical/proposed/review material; inspect context before changing |
| eval/fixtures/history/synthetic-0.2.json | Draft/lifecycle | T7 | Historical/proposed/review material; inspect context before changing |
| eval/reference-cases.json | Draft/lifecycle, Legacy count | T7 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| eval/research-cases.json | Draft/lifecycle | T7 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| eval/rubric.md | Draft/lifecycle | T7 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| scripts/sync-permission-diagrams.mjs | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| scripts/verify-context.mjs | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| scripts/verify-docs.mjs | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/001-session.md | Draft/lifecycle, Legacy count | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/002-project-membership.md | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/003-create-task.md | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/004-update-task.md | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/005-sprint-lifecycle.md | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/006-document-access.md | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/007-version-publication.md | Draft/lifecycle, FR-45, Legacy count | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/008-linked-keyword-search.md | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/009-cited-question.md | Draft/lifecycle, Legacy count | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/010-current-work-question.md | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/011-audit-and-source-inspection.md | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/012-failure-and-evaluation.md | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/013-scoped-inspection.md | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/README.md | Draft/lifecycle | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| specs/index.json | Draft/lifecycle, FR-45, Legacy count | T6/T10 | Current or mixed document: draft status/lifecycle exclusions intentional; old counts require contextual review |
| tests/context.test.mjs | Draft/lifecycle, FR-45 | T6/T10 | Negative tests/TODO or storage assertions; not runtime pass evidence |
| tests/storage.test.mjs | Draft/lifecycle | T6/T10 | Negative tests/TODO or storage assertions; not runtime pass evidence |
