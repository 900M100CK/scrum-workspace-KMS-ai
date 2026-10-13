# Logical data and lifecycle design

**Artifact ID:** DATA-04  
**Version/date:** 0.2 Draft · 13 October 2026
**Status:** Draft for owner review; proposed policies/deferrals are not approved.
**Inputs:** PRD-01 v0.4; UC-02 v0.2; [SAD-03](../architecture.md) v0.6; [logical entities](../../contracts/data-model.json) v0.1; owner-authorised ADR-0004 implementation.
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

## Implemented storage foundation — ADR-0004

The owner requested implementation on 13 October 2026. [ADR-0004 v0.2](../adr/0004-knowledge-store.md) and the [storage runbook](../../infra/postgres/README.md) record commands, versions, migrations, query boundaries and executed tests. The JSON remains a logical contract; physical SQL now lives in each owning service. This does not accept the remaining policy decisions or complete a feature spec.

Physical mapping: UUID identities; bigint revisions/generations/sequences; date Sprint bounds; timestamptz event/observation times; composite version/passage foreign keys; unique Current version, Active Sprint and allocated task indexes. A deferred circular document/current-version foreign key and constraint trigger permit atomic publication while enforcing a matching Current pointer. Application lifecycle operations still own audit/idempotency transaction composition and capability checks. Read-grant membership-generation fields do not implement revocation by themselves.

Embedding configuration and passage embeddings extend the logical search representation without changing HTTP contracts. Configurations carry model/version, dimensions and metric; jobs carry document revision and processing generation. `Execution.source_ids` is normalised into Provenance rows, rather than a duplicated list. Project IDs on allocations/grants enforce same-project references inside Workspace. User/project/work references in Knowledge are opaque service references, not cross-database foreign keys. Labels remain an array; bounded execution metadata uses JSONB. No document content is copied into audit or error fields by this migration.

SQL functions filter the supplied project AND document scope. Exact discovery materialises eligible rows and does not install ANN indexes. English full-text GIN supports the independent keyword baseline. Permission authority and guarded delivery remain Workspace application work. Table access is for trusted service credentials; this foundation does not expose an end-user SQL interface. No answer or permission-decision cache is introduced.

Checklist review uses the repository SQL/VectorDB prompts, `Database_Design_Checklist.xlsx` and `Checklist_Database Design Review.xlsx`. Pass: owned objects, relational keys, separation of immutable evidence, migration replay/rollback, configured vector shape and scoped-query negatives. Gap: empirical workload/growth, full foreign-key/query-plan tuning, final policy mapping, encryption/backup restore/retention, full application audit enforcement and concurrent transport tests. N/A: separate polyglot/NoSQL/graph infrastructure, sharding/partitioning/replication and ANN tuning; no measured need in this foundation. These are author checks, not independent approval.

Handoff: storage is available for bounded handler implementation; preserve the remaining permission/lifecycle/retention decisions. SP-06/SP-07/SP-09, business ACs and the full data design are not declared complete by database tests.
