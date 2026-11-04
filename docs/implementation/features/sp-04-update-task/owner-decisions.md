# SP-04 — owner dispositions for P02

**Artifact ID:** SP04-OWNER-01\
**Version/date:** 0.1 Owner-confirmed directions · 3 November 2026\
**Status:** Three explicit owner policy choices recorded; detailed mechanics remain proposed and require producer evidence.\
**Inputs:** [Decision batch](decision-batch.md) v0.4; owner's three explicit asynchronous replies in this chat on 3 November 2026, preserved as data in [response record](evidence/owner-responses-2026-11-03.json).\
**Trace:** SP-04.1–04.2 / FR-09/40/43/44, supporting FR-03/31/59/68 / PLAN-01 Month 1 / M-02–M-03.

| Choice | Actual owner selection | Bounded implementation consequence |
| --- | --- | --- |
| D-01 | A Backlog creator does not automatically receive content-edit authority; provision edit separately. | Select the separately scoped task-edit branch; retain task-state/task-assign/task-blocker as the design's explicit action names. Current membership plus the requested action is required. Existing backlog-author remains create-only; no automatic grant, role bypass or expansion of create rights. Edit remains Backlog-only. |
| D-02 | Do not assign a Task to a disabled account, even if project membership remains active. | New assignments require an enabled current same-project member; null unassign remains available to an authorised caller. Unknown/nonmember/disabled targets share the bounded invalid-assignee response after current Task/action checks. This new-write eligibility does not prevent permitted acknowledgement of an already committed original operation. |
| D-03 | Keep original results indefinitely as in SP-03. The question explicitly disclosed retained Task title/description and current-authority checks. | Retain immutable original Task 200/Blocker 201 results and consumed actor/operation/key/hash without automatic expiry/key reuse. Full Task snapshots include title/description. Replays recheck current read/action authority; current state is read separately. No silent purge or current-row substitution. |

The original answers, rather than a preselected UI option, are the authority for these choices. Internal action-name spelling is the selected design's implementation mapping, not a claim that the owner supplied literal code identifiers. No new business feature, chart, estimate, scheduler, load balancer, runtime AI mutation or service is selected.

## Handoff

P02 source/design preparation can close with these dispositions and the current coordinator-reconciled design. This is not whole-feature, independent, deployment or formal ADR acceptance. Detailed permission/storage mechanics remain Proposed until implemented and tested. Existing applied migrations and historical reports remain untouched.

Next small support slice is [P03A](tasks/P03A-contract-support.md): four future mutation transport response declarations only, with coordinated metadata. [P03A2](tasks/P03A2-policy-source-alignment.md) must align the selected policy and UC wording before permission/storage producer work. Neither task adds a new FR, changes release priorities or grants authority to apply a migration. The [parent plan](plan.md) owns status and subsequent bounded assignments.
