# Architecture for the five-month capstone

**Artifact ID:** SAD-03  
**Version/date:** 0.3 Draft · 9 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** [BRD](BRD.md) v1.0; [PRD](sdlc/PRD_SRS.md) v0.4; [use cases](sdlc/use-cases.md) v0.2; [delivery plan](planning/five-month-plan.md) v0.1; AGENTS rules; owner confirmation to retain minimal microservices.  
**Author:** development agent acting sequentially; owner reviews business choices.

## Context and decisions

Build a small Scrum workspace with permission-aware evidence retrieval. One student implements/integrates the system in five months. The owner retained microservices; the proposed boundary is **two business services**, not one service per feature. The web client is a UI, not an extra business domain. No claim of independent scaling benefit has been measured.

| Decision | Status / source |
| --- | --- |
| Keep microservices | Owner direction; AGENTS mandate |
| Workspace + Knowledge boundary | Proposed [ADR-0002](adr/0002-minimal-microservices.md) |
| One application language and simple local deployment | Proposed [ADR-0003](adr/0003-student-stack.md) |
| Relational ownership and pgvector candidate | Proposed [ADR-0004](adr/0004-knowledge-store.md) |
| One provider configuration and bounded pilot | Proposed [ADR-0005](adr/0005-ai-provider-pilot.md) |
| Guard protected transport handoffs at permission authority | Proposed [ADR-0006](adr/0006-permission-handoff-guard.md); requires concurrency tests |

Current policy decisions OD-02–OD-04/OD-09 are drafts. Contract HTTP/JSON schemas make review concrete, not accepted interface baselines. Stack versions and numerical timeout/capacity limits must be pinned/tested in the implementation slice.

## Composition, ownership and trust

| Element | Owns | Does not own |
| --- | --- | --- |
| Workspace service | Auth sessions, Project/Membership, Backlog/Sprint/Task/Blocker, all project/document policy and permission revisions, its business audit; same-origin gateway and guarded transport | Knowledge content, embeddings, AI synthesis rules |
| Knowledge service | Documents/immutable versions/passages, source validity, manual links, keyword/vector index/jobs, evidence selection, synthesis/citation validation, execution/provenance, its business audit | Identity or independent permission rules; Workspace operational data |
| Web UI | Forms and visible state | Authorisation decisions or direct database access |
| Embedding/generation provider | Configured computation on permitted input | Application state mutation, permission decisions or source identity assignment |

Use one local PostgreSQL instance as a candidate hosting separate Workspace and Knowledge databases and credentials. Each service writes only its own database. There are no cross-database writes or runtime joins. Workspace's document policy registry stores document/project identity and ACL state, not document text or a duplicate knowledge lifecycle. Knowledge stores links to operational IDs and reads their current state through Workspace contracts. Each service records its own committed audit events; readers receive a correlated authorised view.

Browser → gateway, gateway → Knowledge, service → database and service → model are trust boundaries. Only Workspace is publicly exposed in the initial deployment. Internal endpoints require environment-supplied per-service credentials and a validated actor session reference; Knowledge obtains identity from Workspace, never a client user_id or model text. Credential values are neither written to contracts nor traced. Session expiry, secure cookie and CSRF protection are specified before mutating HTTP handlers are enabled. Administrator/owner titles grant no blanket source read.

See the centralized diagram: [editable Draw.io](sdlc/diagrams/architecture/service-composition.drawio) · [Mermaid source](sdlc/diagrams/architecture/service-composition.mmd).

Diagram ID: `DGM-ARCH-01`. Source content is preserved; see the [diagram review and open gaps](sdlc/diagrams/README.md).

The provider transport in Workspace is a narrow guard/relay, not an AI business service. Knowledge owns retrieval and generation decisions; server-registered provider endpoints prevent arbitrary URL relay. Provider network waits use a separate bounded lane from board operations. No Kubernetes, service-discovery product, broker or graph database is required for this capstone deployment.

## Boundary contracts and failures

| Boundary / owner | Authentication | Consistency | Timeout configuration | Retry / failure |
| --- | --- | --- | --- | --- |
| UI → Workspace / Workspace | Opaque session verified by Workspace; mutations also CSRF-protected | Own committed records; optimistic revisions | operational_request_timeout_ms | Mutations only with actor/operation-scoped idempotency key. Conflict does not overwrite. Unknown/inaccessible reads share 404. |
| Gateway → Knowledge / Knowledge | Service credential plus Workspace-validated actor context | Knowledge own transaction; operational/permission queries remain authoritative | knowledge_timeout_ms | Same key/payload may resume a pending operation; no unrestricted or blind mutation retry. Returns explicit unavailable/pending state. |
| Knowledge → policy/operational Workspace / Workspace | Service credential and authenticated session reference | Current authoritative permission/operational revision, no copied rules | policy_timeout_ms | Failed/unknown check denies; current-state failure never becomes a document guess. Reads may retry only within request budget. |
| Knowledge → guarded provider handoff / Workspace | Registered service + actor + server-selected evidence manifest | Authoritative permission guard covers validation through transport handoff | handoff_timeout_ms and provider_timeout_ms | Guard must cancel/abort before releasing on timeout. Generation waits outside handoff guard. Withhold original draft on changed evidence; optional regeneration is a new bounded attempt. |
| Knowledge jobs → own search / Knowledge | Internal worker identity | Eventual readiness, immutable source revision/tombstone guards | index_job_timeout_ms | Same event/version generation processed once; older work cannot restore obsolete/deleted content. |

All bounds are finite startup-required config; defaults and acceptance limits are selected in pilot, not universal PRD promises. Idempotency stores minimal operation identity/result references, payload hash and status; replay rechecks current access. Different payload under the same actor/key conflicts. Current state and source availability are stronger than delivery events.

## Key flows

1. **Work:** authenticate → current policy → validate expected revision/domain rules → own transaction and audit → confirmed response. Reconnect performs an authoritative reload; push/realtime transport is optional until simple refresh works.
2. **Create knowledge:** Knowledge allocates stable ID; Workspace validates create authority and registers pending ACL with explicit classification; Knowledge commits initial Current/version/content audit; Workspace activates registry. Each step is idempotent. Pending registration denies ordinary reads/retrieval. Partial failure is reported pending and resumed, not claimed atomically successful across databases; cleanup may tombstone an orphan under a safe job.
3. **Retrieve:** Workspace supplies current authorised project and document IDs; Knowledge applies both in the source and keyword/vector query before selecting passages. It filters lifecycle/version validity and checks candidate current access. Index ACL hints and model content cannot grant permission. Query current work separately through operational endpoints with observation revision/time.
4. **Generate:** selected records assign stable source IDs; guard all evidence before model input handoff; Knowledge synthesises through a provider-independent interface; reject invented IDs/wrong versions and evaluate claim support separately. No evidence yields insufficient_evidence; detected conflict preserves both sources. No AI write tool exists.
5. **Deliver/open citation:** Knowledge rechecks source validity; Workspace guard checks current access to the full evidence set. If a source is revoked, withhold the complete original answer; regenerate only in a new run using permitted sources. Citation resolution returns the exact accessible passage/version, or generic not-found/unavailable without substitution.

## Permission concurrency and source lifecycle

Proposed first deployment has one active Workspace process. A project-scoped handoff guard serialises permission mutation commits with protected provider/context and buffered response handoffs. Hold from final current permission validation until bytes are handed to the transport; generation waiting is outside that guard. Revocation may report success only after it acquires the guard and commits. A handoff aborted by its bounded timeout cannot later resume output. All policy writers, including membership removal/classification/grant changes, must use the same guard. Source publication/archive/deletion also enter the gateway project guard; their Knowledge-owned transaction remains in Knowledge. Final Knowledge validity validation runs while this guard is held, so publication cannot race the checked transport handoff. A timed-out remote mutation with unknown commit outcome leaves the scope blocked until its idempotent receipt/rollback is reconciled; releasing a local guard is not proof that a remote write stopped. Session invalidation needs equivalent ordering for the relevant session/project keys. The boundary is server handoff, not receipt/rendering by an external provider/browser.

This is a proposal requiring real paused-request tests; an ordinary check-then-send gap is not accepted as proof. Do not add a second Workspace replica until shared/distributed guard semantics have an ADR and tests. Separate audit/metrics must show pending/failed revocation without protected source content. Passing tests demonstrates these boundaries only, not absolute security.

Knowledge versions: creation → Current; revision → Draft; publish Draft → Current and former Current → Superseded; archive permitted Current/Superseded → Archived; active deletion makes content unavailable. Full transitions/authority/retention remain OD-04. Draft is excluded from all retrieval/model input and requires content-write access to inspect. Historical citations remain pinned and labelled, subject to current access. Knowledge checks version/lifecycle again before new answer delivery; unavailable/obsolete candidates cannot be silently substituted.

Jobs carry source version, aggregate revision and processing generation. Validate against own current metadata/tombstone before publication; discard stale work. MVP uses no answer cache and no cached permission decisions. If a search/index cache is later introduced, its key must include source and scope revisions and it must not bypass final checks. Physical retention/trace periods remain owner policy, not fabricated durations.

## Interfaces, deployment and evaluation

Required interfaces are authentication/policy, operational observation, document/version storage, retrieval, generation, citation resolution and audit/provenance. Draft [OpenAPI contracts](../contracts/README.md) and [data model](sdlc/data-design.md) define ownership/shape; business logic remains independent of UI/provider. Deployment initially uses one web UI, two processes and two owned logical databases on one student machine; provider may be external or local. Machine/GPU and resource sizing are unknown. No replica/discovery setup is planned before the measured need exists.

Provider data inventory: embedding receives permitted passage text and IDs only as necessary; generation receives question and permitted evidence excerpts/operational observations; tracing stores run/config/IDs/usage/errors, not a full knowledge copy or private reasoning. A provider change requires the owner-authorised data-transfer policy. A local vector store does not prove local generation. Fixtures remain synthetic.

High-priority tests: cross-project/document denial, removal/rejoin, paused handoff revocation, exact/historical citations, Draft exclusion, stale/duplicate jobs, deletion, stale work state, prompt injection and provider outage. About 20–30 English questions measure retrieval separately from generation and claim support; freeze criteria after pilot. A provider comparison is bounded and conditional, not an ML research programme.

## Checklist and handoff

SAD/blueprint checklists: Pass for context, concerns, composition/dependency/data/interaction/state views, ownership, named interfaces, failure rules, alternatives and BR trace (BR-01–BR-14; SC-01–SC-08). Gap for accepted policy/contracts, installed stack/provider versions, physical sizing, calibrated timeout values and tested guard implementation. No full standards-conformance or security claim is made.

Handoff: Needs owner decision on business policies/stack/store/provider; independent contract/context work can proceed. Guard, own-data transactions and provider isolation are implementation gates, not facts already achieved. Author self-check is not independent review.


**v0.2 documentation change:** Moved the inline diagram to the Stage 7 diagram directory, retaining its labels and relationships. Added an editable Draw.io representation; no policy or product scope is changed. Diagram consistency gaps are recorded in the central index.
