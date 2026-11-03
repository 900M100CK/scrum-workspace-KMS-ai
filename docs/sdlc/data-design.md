# Logical data and lifecycle design

**Artifact ID:** DATA-04  
**Version/date:** 0.16 Draft · 2 November 2026
**Status:** Draft for owner review; proposed policies/deferrals are not approved.
**Inputs:** Proposed ADR-0027 v0.2; PRD-01 v0.9; UC-02 v0.8; [SAD-03](../architecture.md) v0.16; [logical entities](../../contracts/data-model.json) v0.12; owner-authorised ADR-0004 implementation; ADR-0007–ADR-0017.; Proposed ADR-0018.; Proposed ADR-0020; Proposed ADR-0021; Proposed ADR-0022; Proposed ADR-0023; [ADR-0024](../adr/0024-backend-session-foundation.md); [ADR-0025](../adr/0025-opaque-session-candidate.md); Proposed ADR-0026
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

## Current work location and Backlog concurrency — 18 October 2026

Proposed ADR-0018 is implemented structurally by Workspace migration 003. The logical model is v0.4. Project gains backlog_revision; Task gains location_kind and nullable location_sprint_id. The existing numeric backlog_position is used only for Backlog ordering. Same-project Sprint and (Sprint, Task) association references are deferred. Final checks also run on allocation and Sprint changes. No new entity/service or copied permission rule is introduced.

| Current location | Required final persisted state |
| --- | --- |
| backlog | Null location_sprint_id; no live allocated association; To Do/In Progress/Done allowed. Historical completed/returned associations may remain. |
| sprint | Same-project Planned/Active Sprint and matching allocated association; any task state allowed. |
| completed | Same-project Completed Sprint, matching completed association and Done task; no live allocation. |

| Mutation | Atomic placement/history/revision effect |
| --- | --- |
| Create | Backlog marker; append after current maximum position under project lock; initialise task revision; advance backlog_revision. |
| Allocate | Require current Backlog task and eligible Sprint; create/update its non-completed allocation; set sprint marker/reference; bump task revision; advance backlog_revision. Never overwrite a completed association. |
| Complete Sprint | In the same transaction set Sprint Completed; Done allocated tasks become completed marker/association; unfinished tasks become Backlog/To Do, returned association, null marker reference and append positions. Batch returns append in task-ID order. Bump affected task/allocation revisions and Backlog generation for entries. |
| Reopen from completed | Set Backlog/To Do and clear current Sprint reference, append position, bump task revision/generation; keep the old completed association byte-for-byte. |
| Done in Backlog | Change state/revision only; remain Backlog despite old completed associations. Later allocation to another Sprint changes current marker only. |
| Optional allocation removal | Return to Backlog, clear reference, mark association returned; unfinished becomes To Do, Done stays Done; append and bump revisions. This remains FR-67 Could. |
| Reorder | Full permutation of current Backlog, revision from listTasks.backlog_revision; only changed positions/task revisions are written, generation advances transactionally, no location/history changes. |

All producing handlers must use current operation-specific authority, idempotency and minimum audit in the same transaction. Lock order: project before affected Sprint/task rows, then stable IDs; permission handoff ordering remains upstream policy. Trigger-maintained backlog_revision prevents unnoticed membership/order changes; it is not an access decision or a global cursor version. Task content/state-only changes leave it unchanged. Dataset cursors still invalidate on any projected-field change.

Legacy rows with a live allocation map to that Sprint; with neither live nor completed history they map to Backlog. Rows with completed history and no live allocation require an explicit revision-bound reconciliation row; never guess from state, dates or maximum historical Sprint. Invalid/missing/stale reconciliation aborts migration transactionally. Migration 003's down refuses nonempty tasks; use reviewed forward recovery on valuable data. Applied 001/002 remain untouched.

## Historical SYS-01 transport design before additive SQL

This section supersedes the earlier draft field summary: revision_refs are represented by per-evidence document/operational bindings. Logical model v0.5 and Proposed ADR-0020 refine HandoffManifest: session/project generations, exact full discriminated evidence, payload length/digest, destination, exact manifest-byte reference/digest and durable receipt. The per-source document/operational entries carry revision bindings rather than one aggregate source revision. Workspace ProtectedHandoffClaim is a logical mapping to owned idempotency storage, with a durable claim fence and no expiry into send eligibility. Existing generic idempotency cleanup cannot reclaim protected identities. Knowledge records and evidence commit atomically, remain immutable and omit raw provider/source content; outcomes append separately.

Required additive Knowledge storage and Workspace claim/fence enforcement are not implemented by migration 003. No migration is applied or added in this design slice. The selected final provider adapter must validate actual wire bytes against the semantic payload; no provider is selected. See ADR-0020 and TC-26 for prepared-versus-sent, unknown commit/transport and restart constraints.

## NEXT-03 recorded inspection and optional metrics

Logical model v0.6 adds actual query/step/availability fields to Execution and entity_revision to exact per-run Provenance. ExecutionStep has (run_id, step_id); StepSource has (run_id, step_id, source_id) and recorded_order so a source can appear in multiple steps without changing its per-run identity. Visible display_order/rank is derived densely after current disclosure filtering; never expose unrestricted original gaps or hidden totals. Mandatory source/query/step capture remains distinct from optional measured/unavailable/not_performed telemetry.

Proposed ADR-0021 defines typed inspection and safe query/check disclosure. This is logical design, not a change to physical execution/provenance tables. Additive capture/retention/mapping and handlers remain pending; no migration is added/applied. DGM-DATA-03 reflects the logical extensions; the physical ERD still describes selected existing columns.

## NEXT-06 opaque command precondition records

Logical model v0.7 adds Knowledge-owned DocumentCommandPrecondition keyed by token hash, privately binding actor/session/project/document/action/version, document aggregate revision, policy-generation reference and state. It creates no read grant. Guarded commands compare/consume with state, audit and idempotency in one transaction; rollback preserves correct consumption state. Unknown/stale tokens always reject, so cleanup cannot turn them into newly issued valid tokens. This differs from nonreplayable AI handoff claims. Minimal command receipts contain no content/current metadata; their original created/supplied identity is operation-authorised acknowledgement. Proposed ADR-0022 defines issuance/unknown outcome/replay and cleanup; no physical migration is supplied/applied.

## NEXT-12 physical handoff mapping

Logical model v0.8 maps to Knowledge 003 handoff_manifest/handoff_outcome and Workspace 004 reserved idempotency claims/protected_handoff_outcome. Manifest JSON and exact bytes commit as one immutable row; generated digest and receipt cannot be caller-updated, and the owned execution FK binds run/actor/project. SQL checks metadata shapes/raw equality, duplicate source IDs and project consistency; actual captured-context completeness and current source authority remain handler checks. No raw payload/excerpt columns are introduced.

Protected claim rows are consumed by existence, remain pending in the generic state column, expire at infinity and retain immutable fence/process. Only a fresh known committed insertion can proceed toward the guard; an uncommitted returned UUID is not send authority. Existing/unknown/aborted claims cannot resume or acquire a new fence. Outcome rows bind the exact claim and append without rewriting it. Active-process lifecycle/quarantine/current-scope enforcement still needs real adapters.

New down scripts refuse nonempty protected records. Upgrade rejects legacy protected_handoff rows pending explicit reconciliation instead of assigning a guessed fence. Isolated runtime-role/transaction/concurrent-claim tests passed; no development migration was run. Inspection-step/provenance extensions and opaque command-precondition storage remain separate gaps; the physical ERDs show only implemented DDL.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.

## Owner-authorised P08 authentication storage — 28 October 2026

Workspace 005 adds auth_account, session_token, auth_clock_state and append-only authentication_audit. Existing session holds effective expiry and references private account identity; immutable token metadata holds only digest and original absolute cap. Clock begins unhealthy and runtime cannot reset it. Operator recovery compares explicit attestation/preconditions and revokes all prior sessions with audit before restoring health; missing clock denies. Manual disable denies login and all existing sessions. No automatic account lockout or physical cleanup is selected. Authentication audit is private and project-independent; project audit entitlement grants no global account visibility.

Existing 001–004 SQL bytes remain unchanged. Upgrade refuses nonempty legacy sessions; down refuses retained account/token/audit/used-clock state. Empty forward/reverse/reapply and actual runtime/operator-role negatives are tested on disposable PostgreSQL only; no development upgrade or HTTP authentication acceptance is implied. A narrowly scoped SECURITY DEFINER account-lock function with fixed search_path supplies row locking without granting runtime credential UPDATE. Logical JSON v0.9 and DGM-DATA-01 v0.4 reflect this owned slice. The [P08 design](../implementation/features/sp-01-session-foundation/p08-persistence-design.md) records scope and limitations; KDF deployment calibration and unobserved-clock intervals remain open, with ADRs Proposed. API/test-plan input metadata is synchronized to DATA-04 v0.13; no wire operation or planned acceptance assertion changes.

## SP-02 owned schema and replay — 1 November 2026

Owner-authorised 007 adds immutable Project.created_by/created_at, private GlobalProjectAuthority and append-only AuthorityProvisioningAudit. Runtime may read global authority but cannot provision it or read the private provisioning audit. DB constraints bound Project/Membership/Task revisions to the JavaScript safe-integer maximum; handlers map constraint/overflow conflicts to controlled 409.

Separate 008 extends existing Workspace idempotency_record with result_status/result_snapshot for createProject/addMember/removeMember. Consumed actor/operation/key/hash/status/reference and minimum original 201 Project/Member fields are immutable and retained indefinitely under the current API contract; removal stores 204 with no body. Snapshot retention includes owner-entered project name/description intentionally. No automatic pruning or privacy-deletion promise is introduced; a changed retention contract needs a separate decision. Existing protected_handoff records retain their shape.

No cursor table/counter/cache is added. listProjects and listMembers compare keyed digests of complete canonical authorised projections and relevant authority generations under the existing clock/project lock protocol. Each page costs a full eligible projection read; capacity is unmeasured. Private audit rows and consumed outcomes block destructive down migrations; 007 never removes SP-01 clock-fault/session/audit state. Current-schema tests use disposable databases through 008; historic 006 storage/session fixtures remain labelled snapshots, not current-schema acceptance.

## SP-03 selected contract support — 2 November 2026

Workspace v0.2.12 and logical model v0.11 add required read-only Task.created_at, preserving UC-03 server creation-time output without accepting client origin fields. Owner selected immutable server time and permanent consumed key/hash plus original Task 201 snapshot (including original title/description), with current access checked before replay. Existing project/member receipts are unchanged. Proposed ADR-0027 and FEAT-SP03-01 define the bounded mechanics; additive 009 and task handlers remain unimplemented at this support checkpoint.

createTask declares 413/415 for bounded JSON/media rejection; getTask declares 400 for invalid query shape. No operation or permission is added. Task consumers must move together: strict older schemas may reject the required new field. Contract tests prove schema boundaries, not migration or HTTP authority. No legacy timestamp is inferred, no applied migration is edited and no development database upgrade is performed.

## SP-03 additive 009 storage implementation checkpoint

New 009 adds finite millisecond Task.created_at with an immutable-origin trigger, a strict typed permanent original createTask result branch alongside unchanged project/member/protected branches, a private audited backlog-author action and unique active project-author index. Upgrade refuses all existing Task rows, createTask identities or author grants before DDL; no guessed legacy origin. Empty-compatible down restores the exact prior 008 constraint/function and refuses retained task/history/outcome/author/audit data. Applied 001–008 remain byte-identical. Only disposable storage tests have exercised 009; the development database remains unchanged and task HTTP/UI handlers remain pending. Workspace ERD v0.6 adds the actual origin field without adding an entity or relationship.

## SP-03 current local handoff — 2 November 2026

The registered SP-03 now implements createTask/listTasks/getTask and the existing-design Task UI against Workspace 0.2.12, logical model 0.12 and additive draft 009. See [execution evidence](reports/SP-03-2026-11-02-execution.md) for final actual command results/source identity and limits. Prior support/checkpoint paragraphs above are historical stages; they do not mean these handlers are still absent. Business audit uses UC-03 backlog-item-create; durable replay operation remains createTask. Current access precedes original snapshot disclosure; creation time is immutable server time. No Task edit/reorder/Sprint/Knowledge/AI handler is added. Formal Proposed ADR/release/independent gates remain open; no development upgrade or new Git publication.
