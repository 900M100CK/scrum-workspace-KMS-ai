# Selected Sprint editing and unfinished allocation removal

**Artifact ID:** ADR-0031\
**Version/date:** 0.2 Proposed · 6 November 2026\
**Status:** Proposed detailed mechanics; owner-selected business rules are recorded separately, no independent or release acceptance.\
**Inputs:** [SP05-COULD-DECISIONS-01](../implementation/features/sp-05-sprint-lifecycle/could-decisions.md) v0.1; SP-05 v0.7.6; PRD-01 v0.10.3; Workspace v0.2.15; ADR-0008/0010/0014/0017; Proposed ADR-0030.\
**Trace:** FR/AC-66/67/31; UC-05 Alt-2/3; BR-01/02/03/10/11/14; SC-03/04/06.

## Context and decision

The owner selected independent sprint-edit/sprint-deallocate, Planned-only editing and unfinished-only removal in the linked decision record. Existing PATCH/DELETE and 200 Sprint suffice. Role-derived rights and Done removal would contradict those choices; the latter damages completed-work attribution and future Sprint metrics. Preserve the release Could classification and all accepted ADRs/baseline.

The owner-selected [Could decisions](../implementation/features/sp-05-sprint-lifecycle/could-decisions.md) refine FR/AC-66/67/31; release priority stays Could. C01 aligns sources only; producers and runtime assertions remain unimplemented. Current authority is required for writes and original-result disclosure. Independent sprint-edit and sprint-deallocate are privately audited grants; no role/create/allocate inference. Unknown/hidden resource access remains generic 404, readable but insufficient action is 403, unavailable authority/storage is 503.

editSprint accepts partial goal/dates plus expected_revision = Sprint.revision, only in Planned. Merge against locked current values, validate nonblank goal and strict dates/start_date < end_date. Identical values (including revision alone) acknowledge without change audit/revision. removeAllocation accepts no body/query; X-Expected-Revision is Sprint.revision, never Task.revision. Only current todo/in_progress allocations in Planned/Active return as To Do to Backlog. Done returns 409 task_already_done after current access/revision/location checks; other lifecycle/stale/idempotency conflicts use state_conflict. Completed rejects; preserving Done attribution protects future Sprint metrics.

Project → Sprint → Task locks and post-wait session guards apply. Current action/read (including Task read for removal replay) precedes immutable actor/operation/key/payload-hash original-result lookup; lookup precedes live lifecycle/revision/location restrictions. Changed payload conflicts. Removal marks Returned, clears current Sprint, appends using PostgreSQL numeric MAX(position), advances allocation/Task/Sprint revisions and Backlog generation, preserves assignee/blockers/history, and records source Sprint, prior Task state/location and resulting Backlog position linked to the operation. State, minimum audit and typed original 200 Sprint commit together; audit/receipt failure rolls back. Unknown commit/transport outcome reconciles the same exact key/body/header, never a fresh automatic key. Original receipts are historical; refresh current state separately.

PATCH has the existing 8192-byte JSON limit and explicit 400/401/403/404/409/413/415/503. DELETE rejects unexpected body/query (400), with transport 413 for oversized unexpected bodies and 415 for unsupported unexpected media; no Content-Type is required on an empty DELETE. Both keep existing 200 Sprint and operation IDs. Planned migration 012 extends private grant/provisioning-audit/typed receipt constraints and immutability; down refuses retained Could grants, provisioning/mutation audit or receipts. Applied 001–011 and historical fixture ceilings are unchanged. No runtime AI mutation, new service or new operation.

## Alternatives, consequences and evidence

Retaining the existing routes and typed Sprint receipts limits adapter changes. Requiring an additional Task revision header would expand the selected contract; locked current Task access/state/location and the Sprint revision remain mandatory. A fresh key after timeout risks duplicate writes, so durable exact-request recovery must precede the wire. Indefinite original results retain goal/dates and require current read/action authority before disclosure; they never establish current state.

C01 verifies source/contract structure only. C02 storage, C03 authority, C04/C05 producer denial/no-op/replay/rollback, C06 recovery, C07/C08 UI, C09 actual handler races and C10/C11 browser/regression remain unexecuted for this continuation. No Proposed ADR is accepted by implementation and no runtime AI mutation is enabled.

## Bounded runtime disposition — 6 November 2026

Actual producer verification exposed missing task_already_done in the Workspace Error enum; Workspace0.2.16 fixes it. A direct runtime provenance JOIN could not read the private issuance audit. Automatic approval review rejected removing that provenance check; implementation keeps it via additive013 boolean-only SECURITY DEFINER with fixed pg_catalog search_path, PUBLIC execute revoked and workspace_app execute only. No runtime SELECT grant or audit content is exposed. This companion preserves already-tested012 and historical001–011. Both new operations fail closed when required authority storage is missing. Existing project scope/session guards remain in the owning transaction, so the SQL boolean is a grant predicate, not a standalone application authorisation API.

[Author runtime result](../implementation/features/sp-05-sprint-lifecycle/verification/could-runtime-result.md) binds actual13 producer/UI/race/browser/regression source and retained failures. Detailed mechanics remain Proposed; no accepted ADR, business scope, runtime AI authority or independent/release approval changes.
