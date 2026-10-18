# Owner decisions: Backlog return state and AI handoff order

**Artifact ID:** OWNER-Q-01
**Version/date:** 0.1 Draft · 16 October 2026
**Status:** Owner-confirmed direction; implementation and independent review pending.
**Source:** The assistant recommended the two choices below in the consistency-review follow-up; the owner replied “làm theo đề xuất của bạn” on 16 October 2026. This record preserves the decision, not an implementation result.
**Trace:** Q-1/Q-2 in the 16 October consistency review; ADR-0008, ADR-0012; FR-09/42/57/67; BR-02/03/10/12.

- Q-1: An unfinished task returned to Product Backlog becomes To Do. Apply to Sprint completion and optional allocation removal. Reopening Done from a Completed Sprint also returns it as To Do; a requested In Progress target is normalised to To Do at this boundary. Preserve completed allocation and assignment/blocker history. Done tasks retained by completion stay Done.
- Q-2: Persist a complete immutable manifest outside the project handoff guard, then acquire the guard and revalidate current session, full evidence access, lifecycle/observation revisions and exact payload/manifest binding. Any mismatch sends no bytes: release the guard and prepare a new immutable handoff record for a bounded new attempt. Never persist remotely or rewrite a manifest while holding the guard. Revoked/invalid evidence still withholds the whole original draft. Keep the guard from successful final validation through transport completion or abort.

The owner selected these directions; schemas, handlers and concurrency/failure tests still need implementation. No new release requirement, endpoint or migration is authorised by this documentation record.
