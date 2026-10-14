# Architecture decision index

Updated 14 October 2026. Owner-confirmed direction is distinct from implemented and tested behaviour. No commit or independent review is implied by this index.

| Record | Current decision status |
| --- | --- |
| [0001: protected resource read policy](0001-protected-resource-read-policy.md) | Proposed historical policy; corresponding access/lifecycle directions amended by 0007/0009. Preserve disclosure and whole-answer withholding safeguards. |
| [0002: minimal service boundaries](0002-minimal-microservices.md) | Proposed boundaries; microservices style owner-directed. Creation direction amended by 0011. |
| [0003: student stack](0003-student-stack.md) | Proposed application framework. |
| [0004: owned PostgreSQL/pgvector storage](0004-knowledge-store.md) | Selected and implemented storage foundation; application enforcement remains unimplemented. |
| [0005: provider pilot](0005-ai-provider-pilot.md) | Proposed; no provider selected. |
| [0006: permission handoff guard](0006-permission-handoff-guard.md) | Proposed implementation mechanics; scope clarified by owner-confirmed 0011. |
| [0007: document access](0007-document-access-model.md) | Owner-confirmed direction; downstream reconciliation pending. |
| [0008: Sprint lifecycle](0008-fixed-sprint-lifecycle.md) | v0.2 adds owner-confirmed direct board transitions and reopening Done from Completed Sprint into Backlog with history preserved; full application verification pending. |
| [0009: no-Draft revisions](0009-versions-without-draft.md) | Owner-confirmed direction; additive migration 002 and storage checks recorded; application and remaining regression/trace updates pending. |
| [0010: release scope and capacity](0010-release-scope-and-capacity.md) | Owner-confirmed exceptions; 60 Must retained, capacity unmeasured. |
| [0011: creation and guard scope](0011-document-creation-and-guard-scope.md) | Owner-confirmed direction; orphan cleanup protocol and runtime verification pending. |
| [0012: audit visibility and durable evidence](0012-audit-visibility-and-durable-evidence.md) | Owner-confirmed scoped audit identity with content redaction; mandatory atomic audit and durable run/evidence before protected handoff. Adapter/runtime verification pending. |
| [0013: unavailable citations and withheld answers](0013-unavailable-citations-and-withheld-answers.md) | Owner-confirmed current-read entitlement for surviving citation identity and generic withheld-answer message; draft wire mapping and runtime verification pending. |
| [0014: multiple Sprint allocation](0014-multiple-sprint-allocation.md) | Owner confirmed multi-selection and per-task outcomes; existing allocateTask requests are aggregated by UI with per-item replay/reconciliation. Runtime checks pending. |

The [business review](../analyst/business-review-2026-10-13.md) records the source conflicts and explicit owner clarifications. Older documents may still describe superseded proposals until the pending reconciliation is complete.

ADR-0015: [partial evidence answers](0015-partial-evidence-answers.md), owner-confirmed partial answers with citations and missing components; RQ-20/22 clarified before pilot. Runtime and evaluation remain pending.

ADR-0016: [optional task keyword search](0016-optional-task-keyword-search.md), owner-added Should after 60 Must; Workspace title/description search independent of AI/Knowledge.

ADR-0017: [membership removal and assignments](0017-membership-removal-capabilities-and-assignees.md), owner-confirmed invalidation of all individually granted project capabilities plus atomic unassignment with history preserved; rejoin restores neither.
