# AG03 receipt — P02 coordinator correction and owner decision handoff

**Artifact ID:** SP04-AG03-DISPOSITION\
**Version/date:** 0.1 Draft · 3 November 2026\
**Status:** AG03 outputs received; coordinator resolves remaining technical draft errors. P02 waits three material owner dispositions; no producer implementation.\
**Author:** Codex, coordinator/integrator.\
**Inputs:** Received SP04-DECISION-BATCH v0.2 and SP04-P02-REPORT v0.2 as [immutable receipt snapshots](../evidence/ag03-received-snapshots.json); [P02 findings R01–R07](p02-codex-disposition.md) v0.1; [current decision batch](../decision-batch.md) v0.3; [current plan](../plan.md) v0.7; Workspace v0.2.12, actual session/project/Task code and migrations 001–009.\
**Trace:** SP-04.1–04.2 / FR-09/40/43/44, supporting FR-03/31/59/68 / PLAN-01 Month 1 / M-02–M-03.

## 1. Receipt and scope

The owner forwarded the AG03 result; both permitted documents exist. The current branch is codex/sp-04 at 6b837fd52e01709f72bfe2de6cb96f0e9cc52653. Codex rechecked the 174 preserved runtime/contract/test/script/infra source paths against P01 and found no drift. The earlier P02 v0.1 snapshots remain byte-identical. Received AG03 design/report bytes were frozen before coordinator changes; the report remains untouched.

Useful corrections in v0.2 include retaining old operation statuses/snapshots, removing the undefined project validator, adopting exact-key/total-boolean validation, protecting OLD/NEW outcome operations, defining no-op receipts, acknowledging actual fault evidence, splitting producers and leaving policy choices unselected. These are source/design improvements, not executed SQL or application passes.

The report's claim that all R01–R07 are corrected is broader than the actual draft. Instead of another external correction round, Codex records the residual findings below and integrates precise requirements into the canonical design v0.3. Executable-looking draft DDL is replaced by declarative extension obligations tied to current source; future implementation must prove them on disposable PostgreSQL before acceptance.

## 2. Remaining technical findings corrected in v0.3

| Finding | Actual received v0.2 text/source mismatch | Coordinator correction |
| --- | --- | --- |
| A01 — replay action authority | D-05 and replay branch check current project read authority only; no explicit requested mutation capability check before original snapshot disclosure | Every replay rechecks current authenticated actor, current target/project read scope and the exact selected action capability before revealing the retained result. Current write revision, old assignee eligibility and live Backlog placement are new-write preconditions; they do not overwrite or regenerate a committed receipt. |
| A02 — lock order | Project lock is acquired before the new-write target account lock, contradicting current removeMember's target-account-before-Project order | Use an internal outcome-presence branch after actor/session locks. A replay branch validates current Task/project/action and never acquires the old assignee account. An absent-outcome assignment branch acquires target account before Project/member/Task, matching cooperating writers. Recheck outcome as needed under the stable boundary. No new lock protocol is silently adopted. |
| A03 — invalid Task work_location shape | Proposed validator requires kind+sprint_id+position for Sprint/completed; current OpenAPI WorkLocation and tasks/types.ts require only kind+sprint_id there and forbid extras | Exact branches are Backlog {kind,position}, Sprint {kind,sprint_id}, Completed {kind,sprint_id}; do not require or emit position in the latter two. Match finite numeric/date/UUID semantics and existing immutable creation time. |
| A04 — incomplete reopen mapping and nonexistent fields | Received section 2.3 normalizes location but does not explicitly normalize requested in_progress to state=todo. It queries MAX(position) although the actual Task column is backlog_position. Section 2.4 adds a Task timestamp update although only immutable created_at exists | Both todo/in_progress reopen requests atomically produce state=todo, Backlog/null Sprint reference and exact new backlog_position; preserve completed allocation, increment Task revision and let existing trigger advance Backlog generation. No mutable Task timestamp is invented. |
| A05 — clock-fault persistence versus throwing inside the transaction | Text says fault evidence commits, but post-wait failure throws before the wrapper's typed-denial commit | Reuse guard() false / typed null return followed by wrapper denial outside the transaction. Preserve a fault latch/auth audit only when actually produced; not every missing/revoked/expired session creates a fault audit. No business mutation/success audit/outcome is written on denial. |
| A06 — private grant and paging details incomplete | New owner-only grant trigger is useful, but selected-grant uniqueness/legacy-refusal/rollback and exact task action discovery remain unspecified. History cursor omits several existing binding/expiry rules | Define selected-action issuance/revival protection with runtime invalidation allowed, exact current grant scope, one-current-grant uniqueness and explicit legacy refusal. Bind history actor/project/task/route/order/page size/membership generation/full projection, recheck current authority each page and retain generic stale/expired/foreign behaviour. |
| A07 — audit representation and capture overclaims | Titles are concatenated into semicolon text; description hashes are proposed without a resolvable source. Returned states are said to fully satisfy FR-31 before any producer test | Use unambiguous bounded structured references or resolvable immutable identities; a digest alone does not recover content. Capture state/assignee/placement and content-change identity with mandatory original outcome in one transaction. Prove producer-linked audit behaviour later. |

The v0.3 document is the current proposed implementation design; archived v0.2 remains the exact Antigravity receipt. Neither is an applied migration. A03/AG03 denotes this completed document correction assignment, not a further pending external review.

## 3. Three material choices for the owner

The design now distinguishes routine implementation obligations from changes to who can act and what is retained. Do not request blanket acceptance of every technical row or treat a report handoff as a choice.

1. **Edit authority:** recommendation: four separate explicit rights task-edit/task-state/task-assign/task-blocker. This keeps a user who can create Backlog items from automatically gaining edit permission. Alternative: reuse existing backlog-author for Backlog content edits and add only the other three rights. Both preserve the Backlog-only edit rule and deny role/membership bypass.
2. **Disabled assignee:** recommendation: reject assignment to a disabled account even if its project membership is still active; use the same bounded invalid-assignee response. Alternative: enforce current membership only. This is additional target eligibility, not merely a synonym for the existing AC-43 text.
3. **New mutation original-result retention:** recommendation: retain consumed identity and original typed Task 200/Blocker 201 outcome indefinitely, without automatic key reuse, with current authority rechecked before every replay; Task snapshots include title/description. This extends the pattern already selected for createTask to new operations. Alternative: choose a different retention/deletion policy first; do not silently replace immutable original results with a current-row lookup or delete/recycle keys.

No choice is preselected by Codex or Antigravity. The owner-facing questions are concrete and limited to these behavioural consequences. Code/migration implementation remains dependent on those choices and its exact registered small-task scopes; no application code is changed while they are pending.

## 4. Handoff and verification boundary

AG03 documentation handoff is received and closed through coordinator corrections; P02's technical source/design reconciliation is ready for the above owner dispositions and subsequent bounded support/implementation planning. P03A/P03B are not executed. No external task is currently active; there is no new AG04 request.

Actual checks: receipt/source hashes, preserved initial snapshots, current WorkLocation/Task/Blocker schemas, actual lock/guard/projection code and migration inventory, then documentation metadata/link/whitespace checks recorded in [AG03 evidence](../evidence/ag03-reconciliation.json). No application/build/DB/SQL/HTTP/DOM/browser/concurrency/load/provider/evaluation run or independent release approval. Do not relabel prior P01 checks or Antigravity assertions as a new runtime pass.
