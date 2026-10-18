# Vertical-slice backlog

**Artifact ID:** BACKLOG-01  
**Version/date:** 0.3 Draft · 17 October 2026\
**Status:** Draft for owner review; ADR-0007–ADR-0011 direction is owner-confirmed; application acceptance remains unproven.\
**Inputs:** [PLAN-01](five-month-plan.md), PRD-01 v0.7 and [spec index](../../specs/README.md).\
**Author:** development agent acting sequentially; owner reviews business choices.

Each row is a deliverable with its own acceptance evidence. Dependencies represent integration order, not requests to spawn agents. Estimates are planning windows, not measured effort. Capture audit in each feature from its first committed operation; SP-13 inspection UI may follow.

| Slice | Goal | Month | Dependencies | Requirements | Status |
| --- | --- | --- | --- | --- | --- |
| [SP-01](../../specs/001-session.md) | Establish and end a session | 1 | None | FR-01, FR-36, FR-37, FR-68 | Draft; not implemented |
| [SP-02](../../specs/002-project-membership.md) | Create a project and manage membership | 1 | SP-01 | FR-02, FR-03, FR-38, FR-39, FR-64 | Draft; not implemented |
| [SP-03](../../specs/003-create-task.md) | Create a task in the project backlog | 1 | SP-02 | FR-05 | Draft; not implemented |
| [SP-04](../../specs/004-update-task.md) | Update work state and record blockers | 1 | SP-03 | FR-09, FR-40, FR-43, FR-44 | Draft; not implemented |
| [SP-05](../../specs/005-sprint-lifecycle.md) | Plan, start and complete a basic Sprint | 2 | SP-04 | FR-06, FR-07, FR-08, FR-41, FR-42, FR-66, FR-67 | Draft; not implemented |
| [SP-06](../../specs/006-document-access.md) | Create restricted knowledge and manage its access | 2 | SP-02, SP-11 | FR-04, FR-10, FR-14, FR-50, FR-51, FR-52, FR-62, FR-65 | Draft; not implemented |
| [SP-07](../../specs/007-version-publication.md) | Revise and retire a knowledge version | 2 | SP-06 | FR-11, FR-12, FR-13, FR-15, FR-19, FR-47, FR-48, FR-61 | Draft; not implemented |
| [SP-08](../../specs/008-linked-keyword-search.md) | Find linked knowledge without AI | 2 | SP-06, SP-03 | FR-16, FR-17, FR-18, FR-20, FR-34, FR-49, FR-59, FR-63, FR-70 (Should) | Draft; not implemented |
| [SP-09](../../specs/009-cited-question.md) | Answer a question with exact accessible evidence | 3 | SP-07, SP-08, SP-11 | FR-21, FR-22, FR-23, FR-24, FR-28, FR-29, FR-30, FR-46, FR-53, FR-54, FR-55, FR-60, FR-69 | Draft; not implemented |
| [SP-10](../../specs/010-current-work-question.md) | Answer a current work-state question | 3 | SP-04, SP-09 | FR-25, FR-26 | Draft; not implemented |
| [SP-11](../../specs/011-audit-and-source-inspection.md) | Capture business audit and answer provenance | 1 capture / 3 execution | SP-01 | FR-31, FR-32, FR-57 | Draft; not implemented |
| [SP-12](../../specs/012-failure-and-evaluation.md) | Verify fallback and evaluate the evidence pipeline | 4 | SP-05, SP-09, SP-10 | FR-33 | Draft; not implemented |
| [SP-13](../../specs/013-scoped-inspection.md) | Inspect scoped audit and answer evidence | 4 | SP-11, SP-09 | FR-27, FR-56, FR-58 | Draft; not implemented |

Month 5 has no new feature row: final regression, evaluation, report and demo are its deliverables. FR-35 is deferred Enhanced work. Should/Could operations within a spec are explicitly tagged; do not silently skip them while claiming all original Core criteria passed.

**Done evidence per row:** actual request/response and persisted state, unit/domain checks, real consumer/provider contract checks, access/version/failure negatives, UI result and BR/AC trace. A context/schema check is not implementation completion.

**Checklist:** Pass for coverage/dependency trace and unimplemented status; Gap for estimates calibrated by delivery. **Handoff:** Core exceptions are already confirmed in ADR-0010; framework/provider choices and measured capacity remain open. Implement one authorised slice at a time.

**v0.2 gate:** ADR-0010 records the seven optional original-Core exceptions and FR-45 withdrawal. Week-2/Months-2/3 evidence gates retain 60 Must and escalate schedule/capacity. April 2027 submission is confirmed; kickoff/calendar and measured throughput are not. No slice is Done from migration tests.

FR-70 / SP-08: owner-added Should under ADR-0016, project-scoped Workspace task title/description search after 60 Must. Unimplemented; TC-25 defines acceptance negatives and AI/Knowledge-outage independence.
