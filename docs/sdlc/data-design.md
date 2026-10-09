# Logical data and lifecycle design

**Artifact ID:** DATA-04  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** PRD-01 v0.4; [SAD-03](../architecture.md); [logical entities](../../contracts/data-model.json).  
**Author:** development agent acting sequentially; owner reviews business choices.

## Ownership and relationships

- Project: owner workspace; key project_id.
- Membership: owner workspace; key project_id + user_id.
- Task: owner workspace; key task_id.
- Sprint: owner workspace; key sprint_id.
- SprintAllocation: owner workspace; key sprint_id + task_id.
- BlockerEvent: owner workspace; key event_id.
- DocumentPolicy: owner workspace; key document_id.
- ReadGrant: owner workspace; key document_id + user_id + grant_generation.
- Session: owner workspace; key session_id.
- Document: owner knowledge; key document_id.
- DocumentVersion: owner knowledge; key document_id + version_id.
- Passage: owner knowledge; key document_id + version_id + passage_id.
- Link: owner knowledge; key link_id.
- SearchJob: owner knowledge; key job_id.
- Execution: owner knowledge; key run_id.
- Provenance: owner knowledge; key run_id + source_id.
- BusinessAudit: owner per_service; key event_id.
- IdempotencyRecord: owner per_service; key actor_id + operation + idempotency_key.

Project has many memberships/tasks/Sprints. Task has ordered blocker events and at most one current Planned/Active Sprint allocation. Document has many immutable versions/passages and one current_version reference; links store stable endpoint identities. Workspace document policy/grants reference Knowledge document identity through a contract, not a foreign key across databases. Session and permission revisions are authoritative Workspace data. Each service has its own business audit/idempotency records; Execution and Provenance correlate by run/source IDs. The JSON model is a logical DB blueprint, not runnable SQL.

Workspace also owns CapabilityGrant (grant_id, subject/project/resource/action/valid/revision) for content-write, lifecycle, manage-access, audit/trace and operational capabilities. Their delegation matrix is OD-02/OD-08; named ownership or an Admin title never substitutes for a stored/current scoped decision. Read-grant mutations are Core UI operations; non-read policy provisioning must be explicitly recorded before the pilot.

## State and query rules

| State/action | Result | Ordinary/history/context |
| --- | --- | --- |
| Create source | initial Current | Current permitted source eligible |
| Revise | new immutable Draft | excluded everywhere; content-write-only direct viewing |
| Publish Draft | replacement Current; old Current Superseded | current scope sees replacement; history deliberately sees old |
| Archive | Current/Superseded → Archived | ordinary excluded; permitted labelled history |
| Delete | active access unavailable; tombstone retained per policy | no read/retrieval/new context; old citation never substitutes |

Allowed transition authority/physical retention are OD-04. Copy immutable text to a new version on content edit; label/owner edits do not rewrite cited text. Historical version labels do not make a source authoritative. Document policy queries come from Workspace; Knowledge source/vector queries use returned project AND document IDs then validate current availability/version. Operational observations bypass embeddings and record revision/time.

Jobs are unique by source/version/processing generation. Publish only when current source revision and tombstone still permit it. Retries/older events cannot overwrite later deletion/publication. No cached permission or answer results are selected for MVP; future caches require scope/version/deletion-aware keys and final current checks.

## Migration and retention gate

After store/version selection, create reversible owned migrations and constraints for unique Active Sprint, allocation, version identity and blocker sequence. Never edit applied migrations. Test forward/reverse migration on synthetic data before real deployment. Embedding dimensions/index tuning remain pilot parameters, not logical schema constants. Audit/trace/source retention periods remain policy decisions.

Checklist: Pass for logical identities/cardinalities/ownership/lifecycle/query/stale-job rules; Gap for accepted storage/policy, physical SQL, workload/index justification and migration execution. No database verification was run. Handoff: Needs owner decision; API schemas may be reviewed against this draft without declaring a completed DB.
