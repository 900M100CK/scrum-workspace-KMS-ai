# Feature specifications and execution rules

**Artifact ID:** SPEC-INDEX  
**Version/date:** 0.8.1 Draft · 2 November 2026\
**Status:** Draft for owner review; ADR-0007–ADR-0017 directions are owner-confirmed; application acceptance remains unproven.\
**Inputs:** PRD-01 v0.10; [PLAN-01](../docs/planning/five-month-plan.md); [architecture](../docs/architecture.md); [contracts](../contracts/README.md).\
**Author:** development agent acting sequentially; owner reviews business choices.

Read AGENTS and full rules, then one spec/contract. All 13 specs remain Draft; SP-01 has a bounded POST/GET/DELETE session implementation with renewal/logout; UI and bounded integrated regression have local evidence; wider release/guard acceptance remains open. SP-02 now has bounded project/member handlers and live UI; its evidence is recorded in the registered SP-02 plan. Other feature handlers are unimplemented. Shared contracts have one editing owner at a time. No agents are spawned by this plan. Context checks are available; actual session persistence/HTTP tests are wired; see the registered SP-01 feature plan.

| ID | Goal | Dependencies | Month |
| --- | --- | --- | --- |
| [SP-01](001-session.md) | Establish and end a session | None | 1 |
| [SP-02](002-project-membership.md) | Create a project and manage membership | SP-01 | 1 |
| [SP-03](003-create-task.md) | Create a task in the project backlog | SP-02 | 1 |
| [SP-04](004-update-task.md) | Update work state and record blockers | SP-03 | 1 |
| [SP-05](005-sprint-lifecycle.md) | Plan, start and complete a basic Sprint | SP-04 | 2 |
| [SP-06](006-document-access.md) | Create restricted knowledge and manage its access | SP-02, SP-11 | 2 |
| [SP-07](007-version-publication.md) | Revise and retire a knowledge version | SP-06 | 2 |
| [SP-08](008-linked-keyword-search.md) | Find linked knowledge without AI | SP-06, SP-03 | 2 |
| [SP-09](009-cited-question.md) | Answer a question with exact accessible evidence | SP-07, SP-08, SP-11 | 3 |
| [SP-10](010-current-work-question.md) | Answer a current work-state question | SP-04, SP-09 | 3 |
| [SP-11](011-audit-and-source-inspection.md) | Capture business audit and answer provenance | SP-01 | 1 capture / 3 execution |
| [SP-12](012-failure-and-evaluation.md) | Verify fallback and evaluate the evidence pipeline | SP-05, SP-09, SP-10 | 4 |
| [SP-13](013-scoped-inspection.md) | Inspect scoped audit and answer evidence | SP-11, SP-09 | 4 |

First implement SP-01 → SP-02 → SP-03 → SP-04 with SP-11 capture in each operation. SP-05–SP-08 follow, then SP-09/SP-10. SP-13 human inspection is later and does not block capture. SP-12 evaluation protects Month 5 from new feature work. Checklist: Pass for index/trace; Gap for application command wiring.

Index `service` identifies the owners of the listed HTTP operations, not every orchestration consumer. `both` (legacy alias `knowledge + workspace`) denotes both API owners. SP-06 spans both; SP-10 operations belong to Workspace, while Knowledge consumes observations through SP-09. The harness validates operation ownership.
