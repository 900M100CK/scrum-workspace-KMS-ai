# System logic and cross-document consistency review

**Artifact ID:** SYS-REVIEW-01  
**Version/date:** 0.1 Draft · 18 October 2026  
**Status:** Sequential author review; findings open, not independent approval or application acceptance.  
**Owner:** Stage 9 consistency reviewer; Stage 0 coordinates corrections.  

**Snapshot inputs (pre-correction review):** BRD English v1.0 and proposed audit/research addenda; development rules v1.4; PRD-01 v0.9; UC-02 v0.6; PLAN-01 v0.3; SAD-03 v0.12; DATA-04 v0.6; DATA-FIT-01 v0.3; API-05 v0.6; Workspace OpenAPI v0.2.2 / Knowledge v0.2.3; UX-06 v0.3 and supporting flows; TEST-08 v0.5; VERIFY-01 v0.3; SPEC-REVIEW-01 v0.11 (retains the earlier Stage 6 review); ADR-0006 through ADR-0017 and OWNER-Q-01.
**Trace:** BR-01–BR-14; SC-01–SC-08, with targeted findings below. BR-15 remains Should/Enhanced.

## Method and boundaries

The requested `obsidian_docs` connector was available in this run. Its filename search resolved `BRD.md` in vault `docs`; text search and note reads were used for the baseline, requirements, architecture, data/API design, use cases, register, ADRs and UX sources. Repository reads supplemented the vault with OpenAPI JSON, feature specs, evaluation definitions, migration references and validators outside the vault. No semantic-search provider or external upload was used.

The review followed requirement → service owner → contract payload → user observation → verification, concentrating on protected handoff, Scrum reconstruction, provenance, lifecycle and failure behavior. All path/method entries in both OpenAPI files were inspected programmatically for operation inventory; targeted schemas and narrative flows received semantic review. The existing large working-tree changes were treated as the current input snapshot and preserved.

This is a bounded cross-document review, not a line-by-line audit of every historical note, translation or rendered diagram. API and SAD workbook rows concerning interface/data views, traceability, errors and correlation were inspected directly; no full workbook or standards-conformance pass is claimed. Diagram checks parse sources and compare pairs; this run did not inspect fresh renders or Obsidian backlink behavior. No live application exists to substantiate these findings as observed runtime failures.

## Findings ordered by impact

Two new findings block an implementation-ready handoff of their affected flows. Two further findings are Important and one is Minor. Existing UX-R01–UX-R06 remain separate open findings in [SPEC-REVIEW-01](spec-review.md#pre-uiux-review--18-october-2026); they are not counted as new discoveries.

### SYS-01 — Blocking: the AI transport contracts cannot carry the specified handoff binding

**Evidence:** [ADR-0012, immutable manifest decision](../adr/0012-audit-visibility-and-durable-evidence.md#decision-immutable-manifest-before-guard-checked-again-inside-it), [DATA-04, per-handoff design](data-design.md#per-handoff-manifest-and-backlog-return-design--16-october-2026), and [DGM-SEQ-01](diagrams/sequence/protected-handoff.mmd) require a distinct immutable handoff identity, purpose, complete evidence/revision set, payload/manifest digests and durable completeness acknowledgement before Workspace claims and sends it. The sequence explicitly passes the manifest and frozen payload to Workspace.

The actual [Workspace contract](../../contracts/openapi/workspace.openapi.json), `POST /internal/guards/provider-input` → `ProviderInput`, carries only run/project/configuration/question/document evidence/operational observations. It defines no handoff or attempt identity, manifest reference or complete durable binding. Its `Idempotency-Key` has only generic mutation/replay wording, with no mapping to the one-use handoff claim. `additionalProperties: false` prevents silently adding the missing envelope fields.

The [Knowledge contract](../../contracts/openapi/knowledge.openapi.json), `generateInternalQuestion` → `InternalQuestionResult`, similarly returns result, document-only `evidence_set`, bare `operational_entity_ids` and one `source_revision`. It cannot express kind/revision/time for every uncited operational observation or identify the persisted delivery manifest. Cited observations in the public answer cannot stand in for the complete evidence set. No alternative manifest-resolution contract is specified.

**Failure scenario:** Two attempts in one run prepare different evidence. Workspace receives a schema-valid request/result but has no agreed protocol to bind it to the exact durable manifest and one-use claim. Implementers would have to invent side channels, infer evidence from citations, or change the contract before implementing TC-26. This is a protocol specification gap, not proof of an existing disclosure.

**Trace:** BR-08/09/10/12; SC-02/03/06; FR-21/25/28/29/32/57; SP-09/SP-10/SP-11; TC-26.

**Correction owner:** Stage 3 + Stage 5, with Stage 4. Specify a contract envelope or an authenticated immutable manifest reference/resolution protocol; define its mapping to the one-use key, exact bytes, operational observations, current revalidation and outcomes. Keep Knowledge ownership and the no-cross-database-write rule. Do not treat run ID, a digest alone, or generic idempotency as durable completeness proof.

**Closure evidence:** Consumer/provider examples must encode distinct attempts, uncited operational evidence, digest/revision mismatch and unknown/consumed claims. Then implement the additive storage/handlers and TC-26; schema agreement alone does not establish the transport boundary.

### SYS-02 — Blocking: public work reads cannot reconstruct the required Sprint/Backlog state

**Evidence:** [PRD FR-07/09/41/42/44](PRD_SRS.md#41-authentication-membership-and-work), UC-03/04/05 and [ADR-0008](../adr/0008-fixed-sprint-lifecycle.md) require visible Sprint allocation, ordered Backlog, preserved completed association and blocker history. NFR-04 requires reconstruction from committed state after reconnect.

In the [Workspace contract](../../contracts/openapi/workspace.openapi.json), `listTasks` accepts project and cursor only; `Task` has content/state/assignee/blocked/revision, but no allocation or location projection. `getSprint`/`listSprints` return `Sprint` records with no item identities. `/sprints/{sprint_id}/items` has allocation POST and removal DELETE, but no read operation. `allocateTask` returns the same item-free Sprint representation. `listTasks` also leaves Backlog-versus-all-tasks and persisted ordering semantics unspecified. A numeric position field is not inherently required, but a defined ordered read is.

`recordBlocker` is a POST returning the newly created event; there is no normal member-facing blocker-history read. A fresh task read supplies only the derived boolean. Scoped audit inspection is a different entitlement and cannot silently become the ordinary member's history API. The Knowledge relationship API models manually created links, not authoritative Sprint allocation.

**Failure scenario:** A member allocates a task, reloads the page or opens it from a second browser. The specified responses cannot identify which tasks belong to that Sprint versus the Product Backlog, or recover the chronological blocker account from the boolean. Client memory cannot meet refresh/reconnect behavior. UC-05 also promises completion counts that its response does not define.

**Trace:** BR-02/03/06/13; SC-01/03/04/08; FR-07/09/41/42/44; NFR-04; SP-03/SP-04/SP-05; TC-07/08/16/21.

**Correction owner:** Stage 5 with Stage 2/4/6. Define authoritative allocation/location and ordered Backlog read projections, plus permitted blocker-history access. Reuse or extend existing operations where appropriate; no new service is needed. State current versus completed association, pagination/order/revision semantics and completion result fields. Preserve the seven authorised release exceptions.

**Closure evidence:** From a new session using only documented public reads, reconstruct Planned/Active/Completed Sprint membership, returned/reopened To Do location and blocker history; compare with persisted state after concurrent changes. Include the same reconstruction during AI outage.

### SYS-03 — Important: inspection responses omit the evidence promised by the use cases

**Evidence:** [UC-13 execution inspection](use-cases.md#uc-13--inspect-scoped-audit-and-answer-evidence) explicitly returns query, tool steps, source IDs, model/configuration, duration, usage and errors/validation. UC-11 makes the recorded steps available for that inspection. PRD AC-27 additionally requires ranked exact source/version/passage identities and operational observation time/version for the optional bounded summary.

In [Knowledge schemas](../../contracts/openapi/knowledge.openapi.json), `Trace` has only run ID, source ID strings, model configuration, duration, error category and validation outcomes. There are no query/tool-step/usage fields or another documented detail projection. `RetrievalSummary` has query/mode/source ID strings/validation outcomes, but no exact locator records, defined rank binding or operational observation identities. No source-ID resolver is specified. Both schemas reject extra properties.

**Consequence:** A conforming UI cannot show the specified inspection evidence or navigate from run-local source IDs to exact evidence using the documented contract. Persistence of richer provenance by itself does not fix the reader interface.

**Trace:** BR-10/12; SC-02/03/06; FR-27/32/57/58; SP-11/SP-13; TC-11/18. FR-58 remains release Must; FR-27 remains Should.

**Correction owner:** Stage 5 with Stage 4/6/8. Specify the permission-filtered trace projection and exact source/observation bindings. Define ranked ordering when the optional summary is delivered. Keep audit-identity entitlement separate from trace/source read and avoid exposing hidden-source counts.

**Closure evidence:** Contract examples and later consumer tests cover an authorised trace reader, a reader lacking source access, capability revocation, and a mixed document/operational run. Do not promote the optional summary into a release Must to close this finding.

### SYS-04 — Important: missing optional timing has no valid Trace representation

**Evidence:** [ADR-0012 durable minimum decision](../adr/0012-audit-visibility-and-durable-evidence.md#decision-durable-minimum-records-are-mandatory), PRD AC-57 and UC-09 step 10 permit unavailable optional metrics when explicitly labelled; they forbid invented measurements. Knowledge `Trace.duration_ms` is required, numeric and non-nullable, with minimum zero. There is no metric-availability field. A string in validation outcomes cannot make a missing required numeric value valid.

**Failure scenario:** Durable run/evidence survives but duration collection is lost. Returning that trace requires a fabricated zero, an invalid response, or failure of the otherwise inspectable run. None encodes the specified unavailable metric faithfully.

**Trace:** BR-12/13; FR-57/58; TC-18; NFR-05.

**Correction owner:** Stage 5 with Stage 8. Define an explicit missing-measurement representation and distinguish real zero, not performed and unavailable values. Preserve mandatory provenance and access checks; this finding does not make evidence persistence optional.

**Closure evidence:** Validate one recorded zero-duration case and one missing-duration case as different states, then test optional telemetry loss without suppressing durable evidence or inventing measurements.

### SYS-05 — Minor: two universal architecture statements contradict supported payloads

**Evidence:** [SAD §2.3](../architecture.md#23-boundary-contracts-and-schemas) states that client bodies never submit `role`, while Workspace `AddMember.role` is required. It also says citations require a document/version/passage tuple without qualifying document citations; Knowledge `OperationalCitation` instead correctly requires entity kind/ID, observation time and revision.

**Consequence:** An implementer could reject a valid membership request or invent document locators for operational evidence. The more detailed policies already establish the intended distinctions.

**Trace:** BR-01/09/10/12; FR-25/26/38; SC-03/06.

**Correction owner:** Stage 3. Distinguish a submitted descriptive role for the member being added from authenticated caller identity/authority. Qualify the tuple rule as document citation identity and state the operational alternative. No permission or scope change is required.

**Closure evidence:** Reconcile the paragraph with `AddMember`, both citation branches and the operation-specific authority rules. This is textual correction, not application verification.

## Existing findings and acknowledged gaps

| Existing item | Recheck and disposition |
| --- | --- |
| UX-R01 / Blocking | Still open: member/document/version browsing and grant-policy read projections remain absent from the public operations. SYS-02 adds the separate operational reconstruction gap. |
| UX-R02 / Blocking | Still open: UX capability-driven controls lack a documented public discovery projection; sitemap role-management wording exceeds the add/remove contract. Known open delegation choices remain distinct from the missing read projection. |
| UX-R03 / Important | Still open: AI flow §2 says every chip uses the document citation route, although the contract and UX entry recognise operational citations. SYS-05 identifies the same overgeneralisation in SAD. |
| UX-R04 / Important | Still open: sitemap §4.3 disables the prompt on failure without a recovery transition; UX-06 forbids permanent disablement from a stale badge. |
| UX-R05 / Important | Still open: PRD AC-15 correctly distinguishes semantic readiness, while VERIFY-01 FR-15 says pending/failed is not searchable and `Readiness` remains unqualified. |
| UX-R06 / Minor | Manual input/version drift remains in UX-06 and DATA-04's SAD v0.9 reference versus current v0.12. This review updates its own register entries, not every stale manual table. Historical snapshots must remain historical. |
| Operational collection evidence | Existing open gap, not a new finding: EVAL-14 requires the complete scoped blocked-task collection; Observation carries rows/time/revision but does not define collection scope/completeness or revision behavior for added/removed matches. Define empty and changed collections before claiming SC-03 enumeration correctness. |
| Physical storage and concurrency | Existing DATA-FIT-01 gaps remain: immutable manifests/outcomes and operational entity kind need additive storage; orphan cleanup needs cancellation/fencing; purge needs locator retention; handlers must enforce membership/assignment and audit transactions. None is closed by this review. |
| Baseline acceptance | The scoped audit-identity exception is owner-directed in ADR-0012 and separately proposed at BRD level. This already-declared baseline acceptance gap is not a new unauthorised policy or a reason to reopen the owner's choice. |

## Scenario coverage and consistent directions

| Scenario | Reviewed path and remaining issue |
| --- | --- |
| SC-01 | Task → permitted linked knowledge; ownership/access rules align. Operational reconstruction and document browsing remain SYS-02 / UX-R01. |
| SC-02 | Recorded decision → immutable passage → cited answer → inspection; exact identity and withholding rules align. Transport binding/inspection projections remain SYS-01 / SYS-03. |
| SC-03 | Current operational observations, not embedded historical text; SYS-01 / SYS-02 and collection/operational-inspector gaps remain. |
| SC-04 | Open plan differs from recorded resolution; sequence-based blocker truth is consistent. Member-facing blocker-history reconstruction remains SYS-02. |
| SC-05 | Immediate immutable Current revisions, labelled historical retrieval and exact citations agree across the checked requirement/ADR/data flows. History browsing and runtime lifecycle enforcement remain unverified. |
| SC-06 | Authoritative project AND document checks, no Admin/author read bypass, whole-evidence revocation and scoped audit exception are explicit. SYS-01 and existing grant/capability/inspection gaps prevent acceptance. |
| SC-07 | Missing evidence, partial supported answers, unresolved conflicts and invalid-draft withholding remain distinct. No fabricated-answer or quality pass is inferred. |
| SC-08 | Independent keyword and healthy Workspace fallback are consistent at service level. SYS-02 / SYS-04 and UX recovery/readiness mismatches remain. |

The checked release plan retains two business services, 60 Must requirements, four Should, four Could and one Won't; FR-45 remains Withdrawn. Runtime AI remains read-only. Provider/framework choices and measured pilot targets remain open. No new deferral, runtime agent, report feature or service is introduced.

## Verification, checklist and handoff

Executed on the current working tree before report edits: `context:lint` Pass; `context:check` Pass (69 active requirements, 60 Must, two services, 56 operations, 13 specs, separate 25-case research and safety definitions); `context:test` 32/32 Pass; `docs:lint` Pass (20 pairs, 35 registered artifacts, 301 nodes, 330 edges); `docs:test` 17/17 Pass. These validators do not exercise the missing protocol/read projections or application behavior. Post-edit documentation checks are recorded in SPEC-REVIEW-01 after execution.

Checklist: **Pass** for locating the vault, checking source ownership, tracing concrete findings and running existing structural checks. **Gap** for SYS-01–SYS-05, UX-R01–UX-R06, full workbook review, complete rendered review and runtime evidence. **N/A** for new provider adoption, publication, commits and product scope changes in this review.

**Not run:** application/consumer-provider/permission-concurrency tests, database/migrations, provider evaluation, new diagram exports, browser/accessibility/usability checks and clean-clone reproduction. No runtime test result, security acceptance or performance claim is made.

**Handoff: Ready for targeted correction; affected flows are not implementation-ready.** Correct SYS-01 and SYS-02 with Stage 3/4/5 first, alongside existing UX-R01/R02. Then reconcile inspection and metric contracts, detailed UX flows and affected TC assertions. Recheck only affected artifacts and preserve the owner's existing decisions. Stage 0 must list dependent specs/diagrams before contract changes; this review records the required work without choosing new product behavior.
