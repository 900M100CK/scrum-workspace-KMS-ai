# Architecture decision index

Updated 16 October 2026. Owner-confirmed direction is distinct from implemented and tested behaviour. No commit or independent review is implied by this index.

| Record | Current decision status |
| --- | --- |
| [0001: protected resource read policy](0001-protected-resource-read-policy.md) | Superseded in part by 0007/0009; remaining disclosure and whole-answer withholding safeguards are Proposed. |
| [0002: minimal service boundaries](0002-minimal-microservices.md) | Proposed boundaries; microservices style owner-directed. Creation direction amended by 0011. |
| [0003: student stack](0003-student-stack.md) | Proposed application framework. |
| [0004: owned PostgreSQL/pgvector storage](0004-knowledge-store.md) | Implemented storage foundation; application enforcement remains unimplemented. |
| [0005: provider pilot](0005-ai-provider-pilot.md) | Proposed; no provider selected. |
| [0006: permission handoff guard](0006-permission-handoff-guard.md) | Proposed implementation mechanics; scope clarified by owner-confirmed 0011. |
| [0007: document access](0007-document-access-model.md) | Owner-confirmed direction; downstream reconciliation pending. |
| [0008: Sprint lifecycle](0008-fixed-sprint-lifecycle.md) | v0.3: owner-confirmed To Do on unfinished Backlog returns and Completed-Sprint reopening; preserve completed history. Direct transitions remain available; application verification pending. |
| [0009: no-Draft revisions](0009-versions-without-draft.md) | Owner-confirmed direction; additive migration 002 and storage checks recorded; application and remaining regression/trace updates pending. |
| [0010: release scope and capacity](0010-release-scope-and-capacity.md) | Owner-confirmed exceptions; 60 Must retained, capacity unmeasured. |
| [0011: creation and guard scope](0011-document-creation-and-guard-scope.md) | Owner-confirmed direction; orphan cleanup protocol and runtime verification pending. |
| [0012: audit visibility and durable evidence](0012-audit-visibility-and-durable-evidence.md) | v0.3: scoped audit identity, atomic audit and complete immutable per-handoff manifests before guard; guarded matching and zero-byte abort/fresh preparation on mismatch. Adapter/runtime verification pending. |
| [0013: unavailable citations and withheld answers](0013-unavailable-citations-and-withheld-answers.md) | Owner-confirmed current-read entitlement for surviving citation identity and generic withheld-answer message; draft wire mapping and runtime verification pending. |
| [0014: multiple Sprint allocation](0014-multiple-sprint-allocation.md) | Owner confirmed multi-selection and per-task outcomes; existing allocateTask requests are aggregated by UI with per-item replay/reconciliation. Runtime checks pending. |
| [0015: partial evidence answers](0015-partial-evidence-answers.md) | Owner-confirmed partial answers with citations and missing components; runtime and evaluation pending. |
| [0016: optional task keyword search](0016-optional-task-keyword-search.md) | Owner-added Should after 60 Must; Workspace title/description search independent of AI/Knowledge. |
| [0017: membership removal and assignments](0017-membership-removal-capabilities-and-assignees.md) | Owner-confirmed individual-capability invalidation, atomic unassignment and last-manager protection; runtime checks pending. |

The [business review](../analyst/business-review-2026-10-13.md) records the source conflicts and explicit owner clarifications. Older documents may still describe superseded proposals until the pending reconciliation is complete.

[ADR-0018: operational read projections](0018-operational-read-projections.md) — v0.2 Proposed. Defines member-scoped Sprint associations, persisted current task location, blocker history, ordered paging, complete-list Backlog reorder and transactional completion counts for SYS-02. Migration 003 is verified in isolated storage tests; application verification remains pending. No new business permission or service.

[ADR-0019: scoped UI discovery](0019-scoped-ui-discovery.md) — v0.3 Proposed. Minimal member/document/version lists, independent policy/grant reads and scoped action discovery for UX-R01/R02; delegation and runtime evidence remain open.

[ADR-0020: manifest-bound AI transport](0020-manifest-bound-ai-transport.md) — v0.3 Proposed. Full immutable durable receipt, exact payload and mixed evidence for both purposes; additive storage and live TC-26 remain prerequisites.

[ADR-0021: scoped inspection and missing metrics](0021-scoped-inspection-and-missing-metrics.md) — v0.1 Proposed. Query/steps, exact ranked evidence and measured/unavailable/not_performed telemetry; live inspection/capture tests remain pending.

[ADR-0022: opaque document command preconditions](0022-opaque-document-command-preconditions.md) — v0.1 Proposed. Non-reading writers/lifecycle managers obtain opaque concurrency tokens and minimal receipts without content-read; token/handler verification remains pending.

[ADR-0023: immutable handoff storage](0023-immutable-handoff-storage.md) — v0.2 Proposed. Knowledge 003 stores immutable exact manifests and outcomes; Workspace 004 reserves permanent protected idempotency claims and append-only outcomes. Isolated SQL tests supplied; development migration, handlers/guard/relay and active-process enforcement remain pending.
