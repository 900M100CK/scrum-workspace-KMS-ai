# Logical data and lifecycle design

**Artifact ID:** DATA-04  
**Version/date:** 0.6 Draft · 16 October 2026
**Status:** Draft for owner review; proposed policies/deferrals are not approved.
**Inputs:** PRD-01 v0.9; UC-02 v0.6; [SAD-03](../architecture.md) v0.9; [logical entities](../../contracts/data-model.json) v0.3; owner-authorised ADR-0004 implementation; ADR-0007–ADR-0017.
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
| Revise | atomically insert new immutable Current; previous Current becomes Superseded; update pointer | current scope sees replacement; explicit history sees old; no separate publish operation |
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

SQL functions filter the supplied project AND document scope. Exact discovery materialises eligible rows and does not install ANN indexes. PostgreSQL English full-text search (GIN) — independent keyword path — supports the C0 evaluation baseline. It uses English stemming, does not match word fragments or reliably correct typos, and is appropriate only for the current English-only synthetic corpus. Vietnamese content would need a new language/search decision; no keyword-quality or improvement claim follows from the index. Trigram and fusion remain unselected. FR-70 task title/description search is a separate Workspace literal substring path under ADR-0016; a pg_trgm index is not selected without measured need. Permission authority and guarded delivery remain Workspace application work. Table access is for trusted service credentials; this foundation does not expose an end-user SQL interface. No answer or permission-decision cache is introduced.

Checklist review uses the repository SQL/VectorDB prompts, `Database_Design_Checklist.xlsx` and `Checklist_Database Design Review.xlsx`. Pass: owned objects, relational keys, separation of immutable evidence, migration replay/rollback, configured vector shape and scoped-query negatives. Gap: empirical workload/growth, full foreign-key/query-plan tuning, final policy mapping, encryption/backup restore/retention, full application audit enforcement and concurrent transport tests. N/A: separate polyglot/NoSQL/graph infrastructure, sharding/partitioning/replication and ANN tuning; no measured need in this foundation. These are author checks, not independent approval.

Handoff: storage is available for bounded handler implementation; preserve the remaining permission/lifecycle/retention decisions. SP-06/SP-07/SP-09, business ACs and the full data design are not declared complete by database tests.

## Owner-confirmed policy follow-up — 13 October 2026

ADR-0007–ADR-0011 govern the new target. Workspace allocates document identity and stores registered policy plus scoped initial capabilities and the restricted-author read grant in one transaction. `document_policy.permission_revision` is the logical ACL revision; `blocker_event.sequence` orders per-task history. No duplicate ACL revision or blocker table is added. Active registry means policy exists, not that content is readable. Knowledge content availability plus current Workspace permission are both required. Internal policy/state reads remain authenticated and scoped without reacquiring the guard; source/citation output remains guarded.

Owned migration 002 pairs remove the product Draft/pending registration states without editing applied migration 001. Legacy Draft/pending rows abort upgrade pending explicit reconciliation. SQL rollback preserves evidence/policy rows; the all-migrations CLI rollback is still destructive. The 12-result database suite passed in an isolated synthetic container. Handlers, initial capability/grant transaction composition, guard races and orphan cleanup remain unimplemented. ADR-0013 resolves surviving identity entitlement using current membership and retained read policy. Physical retention remains unresolved.

## Durable evidence and inspection follow-up — 14 October 2026

ADR-0012 requires each mutation's audit event or durable pending audit delivery in the same owning-service transaction as business state. Audit sink delivery may be asynchronous/idempotent, but failure to store the local minimum prevents commit. AI run identity and exact evidence manifest must be durable before protected provider/answer handoffs; unavailable optional metrics are labelled, not fabricated. Existing tables/storage tests do not yet prove this transaction composition or failure boundary; adapter/schema-fit verification remains required before handlers.

Scoped audit-read with current project membership permits event actor/action/entity identity/time without document-read. Protected title/content/before-after references remain redacted; use null for inaccessible references in the current AuditEvent contract. This bounded inspection entitlement cannot feed unrestricted retrieval/provider input or grant direct source/citation access. Trace-read alone does not inherit it. Store protected event payload separately from the response projection; exact physical projection/retention enforcement remains to be verified.

## Schema fit review - 14 October 2026

[DATA-FIT-01](data-policy-fit-review.md) records actual column/constraint/privilege evidence against current policies. Existing fields support completed allocation preservation and ADR-0017 atomic grant invalidation/unassignment, but no handlers prove them. The immutable per-handoff manifest and entity-kind design is specified below; additive storage and guard enforcement remain unimplemented. Physical-purge locator tombstones and optional link soft-removal remain design gaps. No applied migration was changed.

## v0.4 search-path clarification - 16 October 2026

The C0 baseline uses independent PostgreSQL English full-text search (GIN) over the current English-only synthetic corpus. Word fragments, typos and Vietnamese content need a separate search decision; no measured quality is claimed. FR-70 remains a distinct Workspace task substring search. Applied migrations are unchanged.

## Per-handoff manifest and Backlog return design — 16 October 2026

ADR-0008 / OWNER-Q-01: returning unfinished work sets task state to To Do atomically with allocation return, Backlog placement, revision and audit. Completed-Sprint reopening also returns To Do, preserving completed allocation history; blocker/assignment history is retained. No applied migration implements this transaction.

ADR-0012: Knowledge owns immutable `HandoffManifest` records. Required fields: `handoff_id` primary key; `run_id`; `attempt_id`; `purpose` (`provider_input` or `answer_delivery`); authenticated `actor_id`, `project_id` and `access_context_ref`; exact complete `evidence_set` including uncited context; policy/lifecycle/observation revision references; `payload_digest`; `manifest_digest`; `prepared_at`. Evidence entries contain document/version/passage or operational entity kind/ID/revision/observed time. Insert all entries and the completeness marker in one owning transaction; rows cannot be updated. Store provenance identities/digests, not raw protected content or private reasoning.

Freeze the payload and obtain durable acknowledgement before acquiring the guard. Inside the guard, match current full-evidence scope, source validity, recorded revisions and payload/manifest digests. A mismatch aborts with zero bytes and releases the guard; retries prepare a fresh immutable `handoff_id` outside it. Revoked/invalid evidence requires a new validated answer attempt, never trimming the original. Guard scope remains final validation through completed/aborted transport. Remote persistence and retry waits stay outside it.

`HandoffOutcome` is append-only and references `handoff_id`; distinguish prepared from completed/aborted/unknown. Prepared alone proves no send. Before acquiring the guard, Workspace durably claims the ID once using its existing owned idempotency record (`protected_handoff`, actor, handoff ID and manifest digest); only a fresh successful claimant may continue. Existing/unknown claims never authorise sending, unresolved/consumed identities cannot expire into replay, and abort/restart fences the old claimant. Unknown transport outcomes cannot trigger automatic fresh-identity resend. Logical entities are in contracts/data-model.json; additive manifest migrations, immutable/one-use enforcement and TC-26 are implementation gaps.
