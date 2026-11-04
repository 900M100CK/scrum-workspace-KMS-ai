# Bounded Task mutation authority, original outcomes and history

**Artifact ID:** ADR-0028\
**Version/date:** 0.1 Proposed · 3 November 2026\
**Status:** Proposed mechanics; three owner-selected policy directions have explicit provenance. No formal ADR, storage, handler, deployment or independent acceptance.\
**Inputs:** [SP04-OWNER-01](../implementation/features/sp-04-update-task/owner-decisions.md) v0.1 and its submitted-answer record; [SP04-DECISION-BATCH](../implementation/features/sp-04-update-task/decision-batch.md) v0.4; [P03A disposition](../implementation/features/sp-04-update-task/reviews/p03a-codex-disposition.md) v0.1; [owning plan](../implementation/features/sp-04-update-task/plan.md); Workspace OpenAPI v0.2.13; logical model v0.13; ADR-0008 v0.3 / ADR-0017 v0.2 owner-confirmed directions; Proposed ADR-0018 v0.2 / ADR-0019 v0.4 / ADR-0026 v0.4 / ADR-0027 v0.2.\
**Trace:** FR-09/40/43/44 and supporting FR-03/31/59/68; BR-01/02/03/06/10/11/14; UC-03 Alt-1/EX-03 and UC-04 main/Alt-1/Alt-2/EX-01–04; TC-07/08/13/14/16/18/19/22; SP-04.1–04.4 / PLAN-01 Month 1 / M-02–M-03.

## Context and owner directions

The current Workspace implements create/read Task, session and project/membership handlers. These four Task mutations and blocker history handlers remain absent. Existing private tooling provisions backlog-author for creation; it must not silently become edit authority. Existing 009 receipts permit original createTask201, not Task200/Blocker201 for new operations. The separate older SP-04 worktree is historical, not an adopted implementation.

The owner explicitly selected on 3 November 2026:

1. Provision edit authority separately; Task creator/create-only backlog-author receives no automatic edit right.
2. Reject new assignment to a disabled account even if its project membership remains active.
3. Retain original mutation outcomes indefinitely as in SP-03, including Task title/description, with current authority rechecked before disclosure.

These directions do not accept every proposed mechanism below. They do not change Core scope, FR priorities, document access, service ownership or read-only runtime AI.

## Proposed mechanics

### Authority and private provisioning

Use four explicit project-scoped action names: task-edit, task-state, task-assign and task-blocker. Resolve the exact current Task/project and require current session, membership, read scope and the requested action for new writes **and** committed replay. Role labels, creator, assignee, backlog-author and membership-manage imply none of these actions. Edit applies only to current Backlog work for new edits. Discovery reports public operation IDs only for registered handlers, current authority and applicable current context; it is advisory, never a reusable allow decision.

Extend private operator/CLI provisioning under workspace_owner with enabled current membership, expected grant revision, operator/reason provenance and atomic append-only audit. Enforce issue/revival restrictions in the DB as well as the CLI; runtime cannot issue/revive a selected grant. Enforce one current project/subject/action grant and reject unsupported legacy rows without deletion or guessed provenance. Membership removal invalidates selected grants atomically with existing assignee cleanup; rejoin restores neither. No public grant endpoint or implicit manager bypass is added.

### Transaction and original-outcome branches

Reuse the actual single-client owned transaction and existing clock/account/session validation in [Project store](../../services/workspace/src/projects/store.ts), [session store](../../services/workspace/src/session/store.ts) and existing cooperating removal/private writers. No Knowledge write, provider call or network wait belongs in the transaction.

After actor clock/account/session locks, read internal target/outcome hints without disclosing them. A committed identity takes the replay branch: verify current Task/project read/action authority and exact actor/operation/key/canonical-input/target/receipt binding, then final same-client session/time check before returning its immutable original result. Do not apply current write revision, old assignee eligibility or current placement as replay prerequisites, and do not mutate again. Changed payload conflicts. Current revocation denies historical disclosure; UI fetches current state separately.

A genuinely new non-null assignment locks the target account **before Project**, matching removeMember, then checks current actor membership/action, target membership and Task. Unknown target is an internal eligibility result; disclose only bounded validation after caller scope/action authorisation. Other new commands lock Project before Task; multi-Task writers use stable Task-ID order. Recheck outcomes at the stable boundary before write preconditions if needed. The current clock serializes cooperating writers; it does not prove capacity or universal deadlock freedom.

After relevant waits use the existing guard's false/typed-null path. A clock-fault latch/authentication audit actually produced by the guard must commit before denial is raised outside the wrapper; throwing inside would erase it. Ordinary expiry does not imply a fault audit. Recheck current expected revision and safe integer bounds for new writes. Actual business change, minimum business audit and durable original result commit together; persistence failure rolls back all business effects. Lost COMMIT/HTTP acknowledgement is unknown and reconciles with the same original identity/body, never a fresh automatic key. This is not D-07 source/socket-handoff proof.

### Typed immutable results and retention

Retain original editTask/setTaskState/setAssignee **200 Task** with result_ref=task_id and recordBlocker **201 Blocker** with result_ref=event_id indefinitely alongside consumed actor/operation/key/hash. No automatic expiry, key recycling or current-row substitution. Preserve existing createProject201/Project, addMember201/Member, removeMember204/null and createTask201/Task branches exactly; protected-handoff/other operation semantics remain unchanged.

Future additive storage must use total typed validators and explicit true enforcement. Reject missing/extra/wrong/null-ambiguous values, unsafe casts, invalid UUID/date/enum and non-safe positive integer revision/sequence. Task has its exact current wire fields including immutable millisecond UTC created_at, no updated_at. WorkLocation is exactly Backlog(kind,position) or Sprint/Completed(kind,sprint_id); Sprint locations have no position, and Completed receipts require the appropriate historical done state. Backlog position is an exact finite decimal string. Blocker has its exact current fields and actual wire timestamp serialization, not an invented precision rule. Bind identities without requiring an old receipt to equal mutable live state. Preserve correct OLD/NEW operation immutability and DELETE/UPDATE trigger returns, fixed search paths and least privileges.

New empty/same-value edit, same-state or same-assignee requests are business no-ops after current new-write preconditions, including target eligibility. Retain the original Task200 without Task revision bump or fake business-change audit; mandatory authentication fault evidence remains separate. Omitted edit field means unchanged, explicit null is invalid for nonnullable fields; omitted blocker outcome normalizes to null. Canonical hashing binds operation, route Task, original expected revision and exact semantic input, not arbitrary object property order. Every distinct valid blocker operation appends and increments Task revision, even if derived blocked stays the same; a committed retry appends nothing.

### Placement, history and audit

Preserve direct todo/in_progress/done transitions. A Done task at Completed Sprint location reopened to either todo or in_progress has effective todo/Backlog, null location_sprint_id and an appended exact backlog_position under Project lock. Existing 003 trigger advances backlog_revision once; do not double-increment it. Preserve Completed Sprint and completed allocations; no mutable Task timestamp is added. Actual completeSprint/allocateTask races remain an SP-05 integration gate.

Allocate blocker sequence under the common Project/Task boundary with explicit revision/sequence bounds. Highest committed per-task sequence determines blocked, not time or ID. History pages require current Task/project read authority without audit-read. Proposed bounded HMAC cursors bind actor/project/task/route/order/page size/membership generation/complete event projection/expiry; reuse page size50 and TTL300 seconds. A new login alone does not invalidate the actor's cursor. Malformed/foreign400 and verified stale/expired409 return no items; clear accumulated pages and restart. No cache or permission fallback is introduced.

Audit retains actor/time/action/entity and resolvable before/after content/state/assignment/placement or blocker-event identity. Use bounded unambiguous structured references and retained immutable source identities when reconstruction is claimed; neither a concatenated raw title nor an unresolvable digest suffices. Audit-read never substitutes for Task/history read, and operational reads confer no private authority-audit access.

### Additive migration and verification gates

Applied 001–009 remain immutable. A separately briefed future additive migration refuses ambiguous new-operation identities, unprovenanced selected grants/audits and unsupported legacy semantics; no guessed backfill. Down refuses retained new grants (including invalidated ones), outcomes/events or dependent authority/business audit; empty-compatible reverse restores exact 009 functions/constraints. Keep historical 006/008/009 fixture ceilings and use explicit new-schema disposable fixtures for forward/reverse/repeat, malformed/null/unsafe validation, runtime issue/revival denial and data-refusal tests. No migration is authored or applied by P03A2.

Future producer evidence must cover old-operation regressions, new grants/removal/rejoin, disabled/null assignment, both removal/assignment orderings, post-wait expiry, replay after later state/eligibility/revision changes, revoked replay denial, no-op recovery, sequence/overflow, audit/outcome rollback and unknown acknowledgement. Permission and transport behaviour need actual handlers; SQL/schema/source checks are prerequisites only. P05 UI refresh/conflict/unknown recovery and P08 actual Sprint producer races remain required, not deferred Must scope.

## Transport reconciliation and alternatives

Keep current Error/Task/Blocker wire schemas and operation count. C01: generic409 state_conflict has no current_revision; client reads getTask under current authority. C02: Blocker201 acknowledges only the event; fresh Task/history supplies current blocked/revision. C03: known rollback differs from unknown acknowledgement; existing503/transport failure is not a new pending wire object. Existing413/415 declarations from P03A are not Fastify evidence.

Rejected policy alternatives were implicit edit via create, membership-only disabled-target eligibility and automatic original-result expiry/current-row substitution. Extra conflict/event fields would require a wire change and are unnecessary for the selected refresh flow. A coarse task-mutate grant would collapse independent requested actions. None is adopted here.

## Consequences and current evidence

Separating grants requires private provisioning and DB checks before usable mutation handlers. Permanent receipts intentionally retain owner-entered Task text; current-authority replay protects disclosure but is not automatic erasure. Exact retained before/after sources and serialized writes cost storage and may constrain throughput; capacity is unmeasured. No load balancing, charts, scheduler or new service is selected.

P03A2 aligns source and planned verification only. Its [result](../implementation/features/sp-04-update-task/reviews/p03a2-source-alignment.md) records actual structural checks and preservation limits. The owning plan must refine/register P03B before storage/test implementation; no code, runtime permission or formal ADR acceptance is claimed here.
