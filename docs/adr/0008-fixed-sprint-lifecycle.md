# Fixed Sprint lifecycle and blocker ordering

**Artifact ID:** ADR-0008\
**Version/date:** 0.3 · 16 October 2026
**Status:** Owner-confirmed direction; application implementation pending. No owner commit or independent approval claimed.\
**Inputs:** PRD-01 v0.7 ASM-02/ASM-07; [owner input](../../owner-decisions-OD-02-03-04-11.md); current Workspace migration 001.\ [OWNER-Q-01](../planning/owner-decisions-2026-10-16.md).
**Trace:** OD-03; BR-02, BR-03, BR-06; FR-07–FR-09, FR-42, FR-44; SC-03, SC-04.

## Decision

Sprint states are Planned → Active → Completed, with at most one Active Sprint per project. A work item belongs to at most one Planned or Active Sprint. Completion keeps Done items associated with that Sprint and returns unfinished items to the Product Backlog in To Do state. The same reset applies to unfinished tasks returned by optional allocation removal; Done items retained by completion remain Done. Board states are To Do, In Progress and Done. No configurable workflow or automatic Scrum Master approval is introduced.

Owner clarifications on 14 October 2026: an authorised member may change a task directly between any two of these board states, including To Do → Done and Done → To Do/In Progress. Revision checks and audit remain required. If a reopened Done task belongs to a Completed Sprint, preserve that Sprint's completed allocation history, return the task to the Product Backlog as To Do for later allocation and leave the Sprint Completed. A requested In Progress reopen target is normalised to To Do for this Completed-Sprint case; ordinary direct transitions within ongoing work remain available. Apply the state/backlog change atomically; do not rewrite what was completed historically.

A task is Blocked exactly when its latest blocker event is Open. A subsequent Resolved event ends the block. Preserve append-only history and the distinction between a plan and a recorded resolution.

Use the existing physical `workspace.blocker_event` and its unique per-task `sequence` as the authoritative ordering, rather than the input's illustrative timestamp/UUID order. No duplicate `blocker_events` table or mutable `is_blocked` truth is introduced. A task with no event is not Blocked.

```sql
SELECT t.task_id
FROM workspace.task t
JOIN LATERAL (
  SELECT b.status FROM workspace.blocker_event b
  WHERE b.task_id = t.task_id
  ORDER BY b.sequence DESC LIMIT 1
) latest ON latest.status = 'open'
WHERE t.project_id = $1;
```

## Alternatives, consequences and evidence

A configurable lifecycle adds unsupported scope. A stored blocker flag can drift from evidence. Timestamp/UUID ordering can disagree with the committed event sequence. Existing database uniqueness and append-only tests are useful prerequisites, but Sprint completion, authority and concurrent sequence allocation need real handler tests.

**Checklist:** Pass for policy and physical-name reconciliation; Gap for complete operational AC evidence. **Handoff:** update PRD/UC, contracts and SC-03/SC-04 tests without claiming database constraints implement the whole workflow.

## 16 October clarification: Backlog return state

[OWNER-Q-01](../planning/owner-decisions-2026-10-16.md) confirms the To Do reset. Commit state, allocation return, Backlog placement, task revision and minimum audit in one Workspace transaction; preserve completed allocation and append-only history. Preserve blocker events rather than inventing a resolution. Test In Progress and To Do returns, Done retention, Completed-Sprint reopening, stale revision, rollback and same-key replay. This resolves Q-1's state choice; handlers and ordering implementation remain unverified.
