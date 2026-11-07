# SP-05 Could business decisions and implementation contract

**Artifact ID:** SP05-COULD-DECISIONS-01\
**Version/date:** 0.1 Draft · 5 November 2026
**Authority:** Owner explicitly selected two independent permissions and unfinished-only removal in the 5 November planning conversation. This written record preserves that direction; it is not an accepted ADR or milestone approval.
**Inputs:** SP-05 v0.7.4; PRD-01 v0.10.2; PLAN-01 v0.4; Workspace OpenAPI v0.2.14; ADR-0008 v0.3, ADR-0010, ADR-0014 and ADR-0017; existing Proposed ADR-0030.
**Parent:** [FEAT-SP05-01](plan.md), PLAN-01 Month 2 / M-03. Trace: FR/AC-66/67/31; UC-05 alternatives 2/3; BR-02; SC-03/04/06.

## Owner-selected business rules

- Add independent private capabilities `sprint-edit` and `sprint-deallocate`. Neither descriptive roles nor create/allocate grants imply them.
- Edit only Planned Sprints: goal and planned dates, with start_date strictly before end_date.
- Remove only an unfinished Task (todo or in_progress) from a current allocation in a Planned or Active Sprint. Reset it to To Do and append to Product Backlog; never delete or implicitly complete it.
- Reject Done Tasks and every Completed Sprint. The owner selected this limitation to preserve attribution of completed work and future Sprint metrics. Supporting Done removal would require a separately scoped business decision with its own authority and rules.
- Removal audit includes source Sprint, previous Task state/location and resulting Backlog position, linked to actor/operation/key/hash. Preserve assignee, blockers and unrelated data.
- FR-66/67 remain release Could. Existing Must implementation/evidence is preserved; selecting these features does not reopen resolved F-REG-01 or grant M03/release acceptance.

C01 must update the current FR/AC/use-case/spec/contract rows before implementation. This record authorises the chosen scope, not a claim that downstream sources already contain it. No accepted ADR or baseline is rewritten.

## API and domain defaults

Retain declared PATCH /sprints/{sprint_id} and DELETE /sprints/{sprint_id}/items/{task_id}, both returning 200 Sprint. PATCH uses the existing partial EditSprint body with expected_revision; DELETE has no body and X-Expected-Revision means Sprint.revision. Do not introduce a Task revision header.

Merge partial dates with the locked current Sprint before validation. Reuse existing strict dates/goal validation and 8192-byte JSON limit; declare actual 400/401/403/404/409/413/415/503 errors for PATCH. DELETE rejects unexpected body/query and documents actual applicable transport errors. Omitted fields remain unchanged. Identical values, including expected_revision alone, are no-op: persist acknowledgement without revision/audit changes. State/revision checks still apply to a new key.

After current access, expected revision and current allocation/location are validated, a Done removal returns HTTP409 code `task_already_done` (a distinct reason within the existing Error shape); other lifecycle/stale/idempotency conflicts retain the existing state_conflict convention. This reason never bypasses generic hidden-resource denial.

For a successful removal: allocation becomes Returned; allocation, Task and Sprint revisions advance; Task becomes todo/Backlog with no current Sprint; append after numeric MAX(position), using PostgreSQL arithmetic. Existing Backlog generation invalidation applies. A new key for an already returned association conflicts.

## Transactions, history and recovery

Reuse Workspace transactions, current session/member/scope/action authority and Project → Sprint → Task lock order, with guards after waits. Recheck current Task access before removal replay. Look up immutable original results before current lifecycle/revision/location restrictions: retries after later state changes return the first result only if current access still allows it. Bind actor/operation/key/payload hash; changed payload409. Data, audit and receipt commit together.

Migration012 extends private action/provisioning-audit/typed Sprint receipt constraints and immutability for the two existing operations. Down refuses retained Could grants, provisioning audit, mutation audit or receipts. Preserve applied001–011 and historical fixture ceilings; no extra domain tables, fake timestamps or service needed.

UI reuses current design: a prefilled Planned edit form and a labelled remove button per unfinished current allocation. No bulk removal. Explain Done denial; refresh current Sprint/items/Task/Backlog after mutation and keep historical association state distinct. A receipt is never rendered as current state.

Recovery v2 supports validated known PATCH/DELETE operations and exact original revision header/body/key. Migrate valid existing v1 records without changing old identities or queued-allocation behavior. Persist before wire; unknown outcomes block new mutations and reconcile the original request. A 409 reloads current state and never auto-submits a new key; signout clears both versions.

## Git and evidence boundaries

Branch codex/sp-05-could starts at cfe0dbe61eeba4e34583b77317ec7f2e41fe4a6e, the merged main baseline. Preserve other worktrees, old source manifests and reviewer logs. Current authority is planning/task creation only; no implementation, commit/push/merge or reviewer dispatch in this preparation slice.

All new producer, UI and concurrency gates require new source-bound evidence. Prior 347-record regression and 57-record independent Sprint evidence remain historical and cannot prove changed code. No fixed future test count is imposed.
