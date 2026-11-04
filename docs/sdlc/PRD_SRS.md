# Scrum Workspace and AI Project KMS — PRD/SRS

**Artifact ID:** PRD-01  
**Version/date:** 0.10.1 Draft · 3 November 2026\
**Status:** Draft for owner validation; no requirements baseline is approved by this revision.  
**Handoff:** Applies owner-confirmed ADR-0007–ADR-0017. Downstream reconciliation and remaining policy choices are pending; this document is not application acceptance.\
**Sources:** [BRD stable entry](../BRD.md) → [complete English BRD v1.0](../baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md); [AGENTS.md v1.3](../../AGENTS.md); [workflow](../../agents/WORKFLOW.md); [PRD author profile](../../agents/01-prd-srs.md); [PRD prompt](../../SDLC-Prompt-Checklist/analysis/PRD_prompt.md); [PRD checklist](../../SDLC-Prompt-Checklist/analysis/PRD_IEEE_29148_Checklist.xlsx), repository edition; [v0.2 → v0.3 patch list](../analyst/PRD_SRS_v0.3_patch.md), unversioned input applied on 8 October 2026. Owner review and this patch guide the revision; proposed policy choices remain tied to their OD and are not approved by applying the patch. No interviews, pilot measurements, implementation results or accepted ADRs were available.

## 1. Purpose, scope and delivery order

This revision applies [document access](../adr/0007-document-access-model.md), [Sprint policy](../adr/0008-fixed-sprint-lifecycle.md), [immediate Current revisions](../adr/0009-versions-without-draft.md), [release exceptions](../adr/0010-release-scope-and-capacity.md) and [creation/guard scope](../adr/0011-document-creation-and-guard-scope.md). The earlier source list above describes the v0.4 input snapshot. The owner confirmed direction in the current session; no owner commit, independent approval or complete application verification is claimed.

The web workspace connects Project, Backlog, Sprint, board and blocker work with documents, recorded decisions and manual relationships. Members search permitted knowledge and ask a read-only AI assistant for answers with evidence. User benefit remains a hypothesis pending evaluation.

Core includes Project → Backlog → Sprint → Board → Sprint completion; text/Markdown knowledge; document permissions and immutable versions; keyword and semantic retrieval; cited answers; audit/provenance; manual relationships; and AI-independent work/document access. Enhanced includes BR-15 Sprint reports, complex imports, visual/suggested relationships, external integrations and advanced hybrid search. Future Work retains the BRD §8 exclusions, including meeting AI/STT, autonomous writes, estimation/forecasting, automatic graphs, multiple runtime agents and model training.

The application owns sign-in/session handling, authorisation, business operations, knowledge retrieval and answer presentation. Identity verification may be local or external (OD-09). Account provisioning, self-service registration, password reset, MFA and identity-provider administration are not assumed Core features. Embedding/generation and infrastructure are external dependencies to assess; no provider is adopted. Current work facts come from operational records. The runtime AI has no mutation authority.

Default query/content/evaluation language is **English only** (ASM-01). Core supports plain text and Markdown creation/import. No multilingual quality commitment or PDF/OCR completion condition is introduced. The draft Core answer view handles one question and source inspection; creating saved answers, persistent conversations or a separate preview feature is not required (ASM-04/OD-10). Audit/trace/provenance records remain required. Later persistence needs explicit scope and access requirements.

Original business priorities remain Must/Core except FR-35 (Should/Enhanced); FR-45 is Withdrawn under ADR-0009. P0/P1/P2 describe delivery order. ADR-0010 authorises exactly seven original Core FR/AC exceptions for this release: FR-27, FR-49, FR-62 and FR-64–FR-67. Of 69 active requirements, those seven exceptions, FR-35 and owner-added Should FR-70 are outside the 60 release Must. The owner retains one student developer and minimal microservices, with submission in April 2027 and an intended effort of at least eight hours per working day. Kickoff, exact submission date, working days per week and measured throughput remain unknown. The five-month plan remains relative, with its final month reserved for verification and submission work; feasibility is unproven.

| Increment | Deliverable and exit evidence |
| --- | --- |
| D0a — access foundation | Two pre-provisioned accounts: sign in; create a project; add the second account; create a task and an English Markdown decision; classify it restricted; grant, then revoke read access; keyword search and direct reads before/after each step, including generic not-found for the revoked reader (FR-59); audit events captured. |
| D0b — evidence-backed AI | Requires the embedding/generation choice recorded as an ADR (OD-06). Semantic retrieval; ask SC-02 and open the exact citation; explicit conflicting-source case and SC-07; revoke and repeat search, question and direct citation reads; force AI outage and continue work/search; execution and source IDs captured. |
| D1 — P0 complete | Finish all P0 rows: membership removal, fixed Sprint lifecycle, current-state SC-03, revision/replacement, archive/delete, conflict handling, concurrent revocation and dependency failures. |
| D2 — P1 Core complete | Add readiness presentation, relationships/navigation, historical retrieval, knowledge organisation and permitted retrieval/audit/trace inspection; finish SC-01/SC-04 and full evaluation. |
| Enhanced | Consider FR-35 and other Enhanced work after Core gates pass. |

D0a requires FR-01–FR-05, FR-09, FR-10, FR-14, FR-18, FR-20, FR-31, FR-36–FR-38, FR-40, FR-50–FR-52, FR-59, FR-63, FR-68 (21 FRs). D0b requires FR-21–FR-24, FR-28–FR-30, FR-32–FR-34, FR-46, FR-53–FR-55, FR-57, FR-60, FR-69 (17 FRs). FR-33's Sprint checks complete in D1. FR-14 is exercised for content/search reads in D0a and for answer delivery in D0b. Minimal capture and citation excerpt opening (FR-46) are P0; extended human retrieval inspection (FR-27) is P1.

The already optional items are listed below in their earlier proposed deferral order. ADR-0010 now records their exact release-gate effects. If capacity falls short, stop optional work and revisit schedule/capacity with the owner; retain 60 Must. This list does not authorise further Must cuts:

1. FR-35 (already P2).
2. FR-64, FR-65, FR-66, FR-67 (edit conveniences).
3. FR-62 (import).
4. FR-49 (relationship removal).
5. FR-27 (bounded retrieval summary; FR-58 remains).

### Five-month release overlay

[PLAN-01](../planning/five-month-plan.md), ADR-0010 and ADR-0016 define 60 Must, four Should (FR-27, FR-49, FR-62, FR-70), four Could (FR-64–FR-67), and FR-35 Won't this release, plus the retained Withdrawn FR-45 record. Omission of those seven original Core FR/ACs is an owner-confirmed release exception. Text/Markdown creation remains required; file import is optional. Creation-time project/document/Sprint fields and fixed Sprint completion remain required despite optional editing operations. Permission, version, exact citation, current-state and fallback/evaluation gates remain Must. Original BRD priorities are not rewritten.

Walking skeleton comes first in Month 1; D0a knowledge/access completes in Month 2, D0b evidence-backed AI in Month 3. Source inspection/evaluation follow in Month 4; Month 5 has no planned new feature. See the [slice backlog](../planning/backlog.md) and [bounded specs](../../specs/README.md) for implementation paths, contracts and Done evidence.

## 2. Actors, capabilities and terms

| Actor/capability | Responsibility and limit |
| --- | --- |
| Product Owner | Maintains/orders Backlog; this accountability alone grants no restricted knowledge access. |
| Scrum Master | Supports Sprint process/blockers; no automatic approval of transitions or access to restricted sources. |
| Developer, including QA | Performs explicitly authorised work updates and maintains assigned knowledge. |
| Viewer/stakeholder | Reads permitted resources; no mutation entitlement by default. |
| Workspace Admin | Manages permitted project/membership/access settings; administration grants no blanket restricted-content access. |
| Content owner | Named maintenance responsibility, not an automatic access entitlement. |
| Document access manager | Existing authenticated human with scoped manage-access capability for a document; may change its classification after creation and grant/revoke without automatically receiving content-read access. Initial classification follows FR-10 and ADR-0007. |
| Audit inspector | Existing authenticated human with scoped audit-read capability; uses FR-56 within that scope. |
| Execution inspector | Existing authenticated human with scoped trace-read capability; uses FR-58; source details require separate source access. |
| Runtime AI assistant | Reads only in the requester's permitted scope; no mutation capabilities. |

The three inspection/access capabilities are not additional universal Scrum roles. An existing user may hold several capabilities. Who grants these capabilities and their assignment to roles remain OD-02/OD-08. Undefined actions deny by default. Test fixtures explicitly assign capabilities rather than treating every Admin or Scrum Master as a content reader.

Other action-holder terms in §4 are scoped capabilities: project administrator, membership manager, Sprint manager, author (create/import/revise knowledge), and lifecycle manager (archive/delete). There is no separate publisher capability in this release. ADR-0007 defines initial document capabilities; additional delegation remains explicit and default-deny. No capability implies another by its name.

Document classification under ADR-0007: **project-shared** permits current project members to read; **restricted** additionally requires an explicit read grant. Creation grants the restricted author an explicit, revocable read grant; authorship is never a read bypass. Content-write, lifecycle and manage-access authorities remain separate. Removing membership invalidates document-read grants; rejoining restores project-shared access only. The author chooses initial classification under FR-10; later changes require FR-50. Initial author capabilities follow ADR-0007; further non-read delegation/provisioning remains to be specified.

A document has stable identity; each immutable version and passage has its own locator. Creation and revision become Current immediately; revision supersedes the previous Current in the same operation (ADR-0009). Superseded and Archived are noncurrent and explicitly labelled in historical access. No unpublished product Draft state exists. Citation identity is document/version/passage or operational entity plus observation time/version. Audit records business changes, trace records execution, provenance identifies evidence. No private model reasoning is collected.

## 3. Representative journeys

| Scenario | Outcome | Requirements |
| --- | --- | --- |
| SC-01 | Open a task and follow permitted specifications/decisions; restricted links reveal no target metadata. | FR-16, FR-17, FR-46, FR-59 |
| SC-02 | Ask why JWT was chosen; inspect recorded rationale and exact version. | FR-21–FR-24, FR-46, FR-53, FR-60 |
| SC-03 | Ask for blocked tasks using operational state and permitted task links. | FR-25, FR-26, FR-44 |
| SC-04 | Find prior blocker handling; distinguish a plan from a recorded outcome. | FR-18, FR-24, FR-44, FR-53, FR-63 |
| SC-05 | Revise an API version; current retrieval uses the replacement and history labels the old version. | FR-11, FR-12, FR-19, FR-47 |
| SC-06 | Classify, grant, revoke/remove membership, then repeat retrieval, answer delivery and citation reads without disclosure. | FR-03, FR-04, FR-14, FR-28, FR-29, FR-39, FR-50–FR-52, FR-55, FR-59 |
| SC-07 | An unrecorded decision receives Insufficient evidence. | FR-23 |
| SC-08 | AI failure leaves work operations, document reading and keyword search usable; questions return an explicit failure. | FR-33, FR-34, FR-69 |

## 4. Functional requirements and acceptance criteria

Each FR states one operation or outcome. Fields of one record/event are its data contract. AC IDs share the corresponding FR number. Existing FR-01–FR-35 retain IDs with narrowed wording; split operations use new IDs. Every row states its BR source and delivery priority. These are specifications, not executed results.

### 4.1 Authentication, membership and work

| ID | Delivery / source | Requirement | Acceptance criterion |
| --- | --- | --- | --- |
| FR-01 | P0 / BR-01, BR-10 | The system shall derive the effective requester from an authenticated session. | AC-01: Given A's session and a forged B identifier, when an operation is requested, then A remains the actor. |
| FR-36 | P0 / BR-01 | The system shall establish an application session after successful sign-in through the selected identity mechanism. | AC-36: Given valid and invalid authentication results, when sign-in is attempted, then only the valid result creates a session for protected requests. |
| FR-37 | P0 / BR-01, BR-10 | Sign-out shall end the current application session. | AC-37: Given a signed-in user, when sign-out completes and the old session is reused, then protected requests are unauthenticated. |
| FR-68 | P0 / BR-01, BR-10 | Expired sessions shall be rejected for protected operations. | AC-68: Given a session beyond configured expiry, when reused, then no protected result is returned and the UI requests sign-in; duration is OD-09. |
| FR-02 | P0 / BR-01 | An authorised project administrator shall be able to create a project. | AC-02: Given create-project authority, when saved, then a new project identity/name/creator persist; without authority creation is denied. |
| FR-64 | P1 / BR-01 | An authorised project administrator shall be able to edit project descriptive metadata. | AC-64: Given a permitted edit, when saved, then reads show the new name/description without changing identity or membership. |
| FR-38 | P0 / BR-01 | An authorised membership manager shall be able to add an existing user to a project. | AC-38: Given a nonmember, including one previously removed, when added, then only new membership and project-shared access take effect; no former individually granted capability, restricted-document read grant or task assignment is restored. |
| FR-39 | P0 / BR-01, BR-10, BR-14 | An authorised membership manager shall be able to remove a project member. | AC-39: Given a current member, when removal commits, then membership and every individually granted project capability/read grant are invalidated, current task assignees are cleared with task revisions incremented, and minimum audit is durable in the same Workspace transaction; historical attribution/state/allocation remain. Concurrent removal of the last effective membership manager is rejected with all state unchanged. Subsequent protected reads deny; rejoin restores no grant, capability or assignment. |
| FR-03 | P0 / BR-01, BR-10 | The system shall authorise project operations against current project access. | AC-03: Given a nonmember, when a project/work resource is requested directly, then content is absent and protected reads follow FR-59. |
| FR-04 | P0 / BR-01, BR-10 | Document reads shall be authorised separately from project access. | AC-04: Given a member without document-read permission, when content/metadata is requested, then the response matches an unknown document under FR-59. |
| FR-05 | P0 / BR-02 | An authorised PO shall be able to create a Story, Task or Bug Backlog item. | AC-05: Given supported type/content, when created, then the item persists; unsupported type or unauthorised creation is rejected. |
| FR-40 | P0 / BR-02 | An authorised PO shall be able to edit Backlog item content. | AC-40: Given current project membership and separately provisioned content-edit authority for an item currently in Backlog, when saved, then reads show updated content; stale new writes follow NFR-02. Creator identity, backlog-author create capability and PO/other role labels alone do not authorise editing. Committed retries follow the SP-04 original-outcome rule below. |
| FR-41 | P0 / BR-02 | An authorised PO shall be able to reorder the Product Backlog. | AC-41: Given three items, when the third moves before the first, then reads show that relative order without changing content. |
| FR-06 | P0 / BR-02 | An authorised Sprint manager shall be able to create a planned Sprint with dates and goal. | AC-06: Given a goal and start before end, when saved, then a planned Sprint exists; reversed dates are rejected. |
| FR-66 | P1 / BR-02 | An authorised Sprint manager shall be able to edit planned Sprint details. | AC-66: Given a planned Sprint, when dates/goal are edited, then valid values persist and invalid dates are rejected. |
| FR-07 | P0 / BR-02 | An authorised Sprint manager shall be able to add an item to a Sprint Backlog. | AC-07: Given an unallocated item, when added, then it appears in the Sprint; an item already allocated to a Planned or Active Sprint cannot be added to a second Sprint. |
| FR-67 | P1 / BR-02 | An authorised Sprint manager shall be able to remove an item from a Sprint Backlog. | AC-67: Given an allocated item, when removed, then it returns to Product Backlog without deletion or implicit completion; an unfinished item becomes To Do atomically with allocation return, revision and audit. |
| FR-08 | P0 / BR-02 | An authorised Sprint manager shall be able to start a planned Sprint under the fixed Core lifecycle. | AC-08: Given a planned Sprint with dates/goal, when started, then it becomes Active with start time; starting a completed Sprint is rejected. Starting a Sprint while another Sprint in the same project is Active is rejected. |
| FR-42 | P0 / BR-02 | An authorised Sprint manager shall be able to complete an active Sprint under the fixed Core policy. | AC-42: Given Done and unfinished items, when completed, then the Sprint becomes Completed with completion time, unfinished items return to Backlog as To Do with task revisions incremented, and completed work remains associated with the Sprint. This follows owner-confirmed ADR-0008. |
| FR-09 | P0 / BR-03 | An authorised member shall be able to change a work item directly between To Do, In Progress and Done, including reopening Done. | AC-09: Given current membership, the specific state-change capability and the expected revision for a new operation, when any change between the three states is committed (including To Do → Done and Done → To Do/In Progress), then another member sees it after refresh/resync; a stale revision is rejected and no automatic Scrum Master approval is required. Reopening Done from a Completed Sprint atomically returns the task to Product Backlog as To Do (including a requested In Progress reopen target) while preserving completed allocation history and leaving the Sprint Completed. Committed retries follow the SP-04 original-outcome rule below. |
| FR-43 | P0 / BR-03 | An authorised member shall be able to set a work item's assignee. | AC-43: Given the caller's current membership and separate assignment capability, when a new assignment targets an enabled current member of the same project or the unassigned value, then that value persists. Unknown, nonmember, foreign-project and disabled targets are rejected without changing the prior assignee; a disabled account is ineligible even while its membership remains active. An assignment racing membership removal observes the serialized result; removal clears affected current assignees and increments task revisions, while historical assignment records remain. Rejoin restores no assignment or capability. Committed retries follow the SP-04 original-outcome rule below, without reapplying new-assignee eligibility to a historical result. |
| FR-44 | P0 / BR-03, BR-06 | An authorised member shall be able to record a blocker event on a work item. | AC-44: Given current membership and the specific blocker capability, for a new Open or Resolved event with description/outcome and expected revision, when saved, then actor/time/history persist; an Open plan is not presented as a completed resolution. Given Open followed by Resolved, the item is not Blocked; given Resolved followed by Open, it is. Distinct accepted events append once each and advance Task revision; same-operation retries follow the SP-04 original-outcome rule below. |

### 4.2 Document permissions, knowledge and validity

| ID | Delivery / source | Requirement | Acceptance criterion |
| --- | --- | --- | --- |
| FR-50 | P0 / BR-01, BR-10 | A document access manager shall be able to set its access classification. | AC-50: Given a project-shared document, when made restricted, then a member without a grant cannot read it; returning to project-shared allows current members only. Without manage-access capability the change is denied. |
| FR-51 | P0 / BR-01, BR-10 | A document access manager shall be able to grant document-read access to a current member. | AC-51: Given a restricted document and member without access, when granted, then read/search/citation access succeeds; another restricted document remains denied. |
| FR-52 | P0 / BR-01, BR-10, BR-14 | A document access manager shall be able to revoke a document-read grant. | AC-52: Given an effective grant, when revocation commits, then subsequent reads/delivery follow FR-14, FR-28, FR-29 and FR-55; repeated revocation does not restore access. |
| FR-10 | P0 / BR-04 | An authorised author shall be able to create a text/Markdown document or recorded decision. | AC-10: Given content/project/labels/owner/explicit classification, when saved, then stable document and initial version exist; the author may set project-shared or restricted for a document they create; omitting classification rejects creation. Changing classification later requires FR-50. The initial version is created Current. A restricted author receives an explicit revocable read grant; authorship does not bypass later revocation. |
| FR-62 | P1 / BR-04 | An authorised author shall be able to import text/Markdown content as a document. | AC-62: Given a supported English file, when imported, then content has owner/classification; unsupported formats fail without partial publication. Size/encoding limits are OD-06. |
| FR-65 | P1 / BR-04 | An authorised author shall be able to update document organisational metadata. | AC-65: Given a permitted owner/label edit, when saved, then metadata changes while version content and citation locators remain intact. |
| FR-11 | P0 / BR-05 | A content revision shall create a distinct immutable document version designated Current and mark the previous Current Superseded in the same operation. | AC-11: Given a cited version, when revised, then its content and locators are unchanged, the new version has a distinct identity and state Current, and the cited version is Superseded and still opens by its exact citation. |
| FR-45 | Withdrawn / BR-05 | Withdrawn by ADR-0009 (13 October 2026). ID retained for continuity; not reused. | AC-45: Withdrawn; atomic replacement and immutable-history assertions continue under AC-11. |
| FR-12 | P0 / BR-05 | Viewed sources shall display version identity and validity status. | AC-12: Given Current, Superseded and Archived fixtures, when opened with the required access, then version and status match; Superseded and Archived are labelled historical. |
| FR-13 | P0 / BR-14 | An authorised lifecycle manager shall be able to archive a document/version. | AC-13: Given Current or Superseded content, when archive commits, then it becomes Archived and is excluded from ordinary retrieval; permitted historical access is labelled Archived. Physical retention duration is not needed to test this behavior. |
| FR-48 | P0 / BR-14 | An authorised lifecycle manager shall be able to delete a document from active access. | AC-48: Given live content, when deletion commits, then reading/retrieval/new answer support cannot expose it and stale work cannot revive it. Physical storage retention is separate OD-04 policy. |
| FR-14 | P0 / BR-10, BR-14 | Revoked/deleted sources shall not be exposed by subsequent protected reads or answer delivery. | AC-14: Given a FR-51 grant, when FR-52 or FR-48 commits before a renewed read/delivery check, then search/content/answer/citation results omit protected content. |
| FR-15 | P1 / BR-05, BR-14 | The system shall display search readiness for a new/revised version. | AC-15: Given pending/ready/failed semantic processing, when viewed, then the corresponding semantic readiness appears; pending/failed content is not labelled ready for semantic search. Keyword availability is independent and applies only to committed, permitted, current passages; a Current badge alone promises neither path is ready. P0 retrieval must already avoid invalid results. |
| FR-61 | P0 / BR-05, BR-12, BR-14 | An unavailable cited version shall be reported without substitution. | AC-61: Given an unavailable old version and a live newer version, when old citation opens, then no newer excerpt is returned; a permitted citation identity shows Unavailable, otherwise FR-59 applies. |

### 4.3 Relationships and retrieval

| ID | Delivery / source | Requirement | Acceptance criterion |
| --- | --- | --- | --- |
| FR-16 | P1 / BR-06 | An authorised member shall be able to create an explicit relationship among tasks, Sprints, documents and decisions. | AC-16: Given permitted endpoints, when saved, then a relationship appears from both; no unconfirmed AI link is shown as established. |
| FR-49 | P1 / BR-06 | An authorised member shall be able to remove an explicit relationship. | AC-49: Given a relationship, when removed, then it disappears while both resources remain. |
| FR-17 | P1 / BR-06, BR-10 | Related-resource navigation shall enforce current target access. | AC-17: Given an accessible task linked to a restricted document, when viewed without target access, then target title/ID/snippet and hidden-link count are absent; guessed reads follow FR-59. |
| FR-18 | P0 / BR-07 | The system shall provide keyword retrieval over permitted current English knowledge. | AC-18: Given an exact-term query with permitted/restricted matches, when searched, then eligible permitted matches return and restricted matches do not. |
| FR-53 | P0 / BR-07, BR-08 | The system shall provide semantic passage retrieval for English natural-language questions over permitted current knowledge. | AC-53: Given a pilot paraphrase fixture whose reference passage lacks the query's main terms, when semantic retrieval runs separately from generation, then the ranked results include that permitted passage, exclude candidates the requester cannot access and record source IDs. |
| FR-63 | P0 / BR-07 | Displayed retrieval results shall identify their permitted source, version and validity. | AC-63: Given a result, when displayed, then title/identity/version/status match its source record and inaccessible metadata are absent. |
| FR-19 | P0 / BR-05, BR-07 | Ordinary retrieval shall exclude Superseded and Archived versions from current results. | AC-19: Given current/noncurrent versions, when keyword/semantic retrieval runs in ordinary scope, then only Current eligible versions are candidates; Superseded and Archived versions are not; modification time alone does not establish source authority. |
| FR-47 | P1 / BR-05, BR-07 | The system shall provide deliberately selected historical retrieval with version labels. | AC-47: Given historical scope explicitly selected, when retrieved, then permitted historical results show version/status; ordinary scope remains current-only. |
| FR-20 | P0 / BR-07, BR-10 | Retrieval shall deny when required access checks are unknown or fail. | AC-20: Given an access-check failure, when keyword/semantic retrieval runs, then an explicit error returns no protected results and no unrestricted retry. |
| FR-59 | P0 / BR-01, BR-10 | Protected read surfaces shall conceal resource existence from unauthorised requesters. Where the interface is HTTP, the response is 404. | AC-59: Given an inaccessible ID and unknown ID under the same session, when each is read, then both return the same not-found-equivalent status, body and schema and no distinguishing title/ID/owner/version/snippet. UI messages match; search/relationship results expose no hidden counts. |
| FR-70 | P1 / BR-01, BR-07, BR-13 | A current project member should be able to search task titles and descriptions by keyword without AI. | AC-70: Given matching tasks in the current and another project, when a current member searches a nonempty keyword, then only current-project title/description matches return with task identity and state; no-match is empty, missing membership denies without disclosure, and healthy Workspace search still works during AI or Knowledge outage. Owner-added Should under ADR-0016, after 60 Must. |

### 4.4 Evidence-backed AI and current state

| ID | Delivery / source | Requirement | Acceptance criterion |
| --- | --- | --- | --- |
| FR-21 | P0 / BR-08, BR-10 | The assistant shall use only authorised evidence as answer context. | AC-21: Given permitted/restricted matching passages, when answered, then captured model-context source IDs contain only permitted evidence; inspect the submission boundary with synthetic fixtures. |
| FR-22 | P0 / BR-08 | Answer citations shall be assigned from retrieved evidence records. | AC-22: Given retrieved records and a draft inventing an ID/URL, when bound, then the original draft is withheld. Only a new bounded attempt passing claim support, exact binding, current access and durable provenance may deliver; otherwise return generic `AnswerWithheld`. Stripping the locator does not validate the original draft. |
| FR-60 | P0 / BR-08, BR-12 | Document citation identity shall be validated before release. | AC-60: Given a wrong/nonexistent document, version or passage identity, when validated, then the original draft is withheld. A replacement must pass claim support, exact citation binding, access and provenance; otherwise return generic `AnswerWithheld`. Structural identity checks alone do not prove claim support (§7). |
| FR-46 | P0 / BR-08, BR-12 | A permitted user shall be able to open the exact cited passage. | AC-46: Given an accessible citation, when opened, then excerpt/document/version match exactly; no redirect to another version. |
| FR-23 | P0 / BR-08 | The assistant shall report insufficient evidence for an unsupported requested claim. | AC-23: Given no supported requested component, when the answer is checked, then return `insufficient_evidence` without invented rationale/citation. Given some supported and some unsupported components, when the answer is checked, then return `partially_answered` with cited supported claims and explicit `missing_components`, without hints about inaccessible sources; invalid/revoked drafts remain wholly withheld. |
| FR-54 | P0 / BR-08 | The assistant shall surface detected unresolved evidence conflicts. | AC-54: Given two accessible passages explicitly disagreeing in a reference case, when answered, then both versions/conflicting statements appear with no unsupported resolution. |
| FR-24 | P0 / BR-08 | Answer presentation shall distinguish recorded fact, synthesis and uncertainty. | AC-24: Given a recorded fact, two-source synthesis and missing fact, when the answer is presented, then label Fact, Synthesis or Uncertain/Insufficient evidence; cite each supported claim and list missing components explicitly in `partially_answered` without hidden-source hints. If none is supported, return `insufficient_evidence`. A confidence score is not evidence. |
| FR-25 | P0 / BR-09 | Current work-state answers shall use operational observations. | AC-25: Given old text saying blocked and current state saying resolved, when asked for current status, then resolved state is used with entity and observation time/version. |
| FR-26 | P0 / BR-09, BR-10 | Operational answer links shall include only readable entities. | AC-26: Given blocked tasks in two projects, when asked, then only permitted tasks/links appear. |
| FR-27 | P1 / BR-12 | A permitted answer reader shall be able to inspect a bounded retrieval summary. | AC-27: Given an answer/run ID, when inspected, then retrieval mode, actual query, ranked permitted source/version/passage IDs, operational observation time/version and citation-validation outcomes appear. Denied sources are omitted; absent steps show Not performed. No private reasoning/unrestricted debug logs; full trace inspection is FR-58. |
| FR-28 | P0 / BR-08, BR-10 | Current document access shall be validated before answer context is sent to the model. | AC-28: Given retrieval paused after selection, when FR-52 revokes a candidate before submission resumes, then its ID/content are absent from model input; access-check failure stops submission. |
| FR-55 | P0 / BR-10, BR-12 | Citation opening shall validate current source access. | AC-55: Given a previously accessible citation, when its grant is revoked and it is reopened, then no excerpt/metadata returns and FR-59 applies. |
| FR-29 | P0 / BR-10 | Answer delivery and source endpoint reads shall enforce current access. | AC-29: Given generation paused before delivery, when a source in the answer's evidence set is revoked before delivery resumes, then the draft answer is withheld, or regenerated only from remaining permitted evidence; no text from the original draft is delivered. Repeating a question or source read cannot reuse restricted output. |
| FR-30 | P0 / BR-08, BR-10 | Retrieved text shall not change the assistant's read-only authority. | AC-30: Given instructions to mutate work/reveal a restricted source, when retrieved, then no mutation is attempted/performed and no restricted source disclosed. |

### 4.5 Audit, provenance and continuity

| ID | Delivery / source | Requirement | Acceptance criterion |
| --- | --- | --- | --- |
| FR-31 | P0 / BR-11 | Each significant committed change shall durably record its business audit event or pending audit delivery in the same owning-service transaction. | AC-31: Given one committed change of each catalogue type, when read within FR-56 scope, then actor/action/entity/time and permitted before/after values or protected references exist. Failure to persist the minimum audit record prevents business commit; sink failure retains a replayable record without losing committed state. A failed change produces no committed event (ADR-0012). |
| FR-56 | P1 / BR-10, BR-11 | An audit inspector shall be able to read audit events within granted scope. | AC-56: Given current project membership and scoped audit-read, when inspected, then in-scope actor/action/entity identity/time may show even without document-read; protected content/title/before-after fields remain redacted unless separately readable. Another project's events are omitted. Audit identity grants no source/citation/retrieval/AI access (ADR-0012). |
| FR-32 | P0 / BR-12 | Each answer attempt shall correlate with execution trace and source provenance. | AC-32: Given success/failure, when fixture records are examined, then its run ID links attempt/trace/exact evidence identities; correlation alone proves no answer correctness. |
| FR-57 | P0 / BR-12 | Each answer attempt shall have an execution record with durable minimum provenance before protected provider/answer handoff. | AC-57: Given success/failure, when recorded, then run ID and a complete immutable per-handoff manifest are durable before guard acquisition; guarded revalidation must match the full evidence, recorded revisions and frozen payload before any bytes are sent. A mismatch aborts that handoff, releases the guard and requires a fresh manifest outside the guard for a bounded new attempt; no manifest write occurs inside the guard. Failure to store that minimum withholds the corresponding handoff. Query/tool steps, model/configuration, duration, usage, errors and validation outcomes are recorded; unavailable optional metrics are marked, never fabricated. No private reasoning is stored (ADR-0012). |
| FR-58 | P1 / BR-10, BR-12 | An execution inspector shall be able to read execution records within granted scope. | AC-58: Given scoped trace-read, when inspected, then permitted fields show; without capability access is denied and source details require separate source permission. |
| FR-33 | P0 / BR-13 | Core work operations and permitted document reading shall remain available during AI failure. | AC-33: Given healthy identity/work/document dependencies and each injected AI failure mode in {connection failure, timeout, exhausted AI usage budget (ASM-08)}, when a user creates/edits a Backlog item, changes board state, starts or completes a Sprint, or opens a document, then the operation succeeds and a fresh read confirms the result. |
| FR-69 | P0 / BR-13 | An AI question shall return an explicit failure state, not generated content, when the AI dependency fails. | AC-69: Given each failure mode in AC-33, when a question is asked, then the response names the failure category, contains no generated answer, and the run is recorded with the error. |
| FR-34 | P0 / BR-07, BR-13 | Keyword retrieval shall remain available when generation or semantic retrieval fails. | AC-34: Given each failed AI dependency, when keyword search runs, then the same permitted exact-term reference source is found/opened without invoking that dependency. |

Audit catalogue for FR-31:

| Audit catalogue domain | Event types |
| --- | --- |
| Project and access | project create/edit, member add/remove, classification change, grant, revoke |
| Work | Backlog create/edit/reorder, Sprint create/edit/start/complete, allocation add/remove, board state, assignee, blocker event |
| Knowledge | document create/import, immediate Current revision with supersession, metadata edit, archive, delete |
| Relationships | relationship create/remove |

### 4.6 Enhanced / Should

| ID | Delivery / source | Requirement | Acceptance criterion |
| --- | --- | --- | --- |
| FR-35 | P2 / BR-15 (Should) | The team should be able to view a basic Sprint report derived from work records. | AC-35: Given a selected report definition and fixture, when displayed, then values reconcile with work records. |

## 5. Observable access and validity rules

Access changes affect subsequent protected reads, model-context submission, answer delivery and citation opening. At the context-submission boundary revoked sources cannot be submitted. If a source in the answer's evidence set is revoked before delivery, the entire original draft is withheld; only a new answer generated solely from permitted evidence may be delivered. This does not assume that citations identify every sentence's dependency on context. Already transmitted information cannot be recalled; concurrency guarantees name the tested boundaries. Failed access checks deny. Inaccessible/unknown resources share FR-59's public response. Membership removal invalidates document-read grants; rejoining requires new grants for restricted content (ADR-0007).

Ordinary retrieval uses applicable Current versions; deliberate history is labelled. A revision becomes Current immediately and the previous Current becomes Superseded in the same operation. Citations preserve exact version identity and report unavailable evidence without substitution. Archive/delete effects on active access are testable independently of physical retention; ADR-0013 permits surviving unavailable citation identity only after current membership and retained document-read policy checks; unknown/denied identity remains generic. ADR-0011 applies the protected handoff boundary to source/citation reads as well as AI output.

SAD/ADRs define service ownership, authoritative permission queries, concurrency enforcement, index/cache invalidation, retries and out-of-order processing under AGENTS.md. These mechanisms are not duplicated here. [ADR-0001](../adr/0001-protected-resource-read-policy.md) records the proposed disclosure/read-boundary policy without selecting implementation.

## 6. Interfaces and quality requirements

| ID | Delivery / source | Requirement / measurement | Verification / gap |
| --- | --- | --- | --- |
| NFR-01 | P0 / BR-01, BR-07, BR-13 | UI shall expose loading, empty, conflict, sign-in-required and AI-error states; protected reads use FR-59's generic unavailable state. | Exercise each; P1 views follow their FR priorities. Browser/accessibility targets are OD-06. |
| NFR-02 | P0 / BR-03, BR-05 | Stale conflicting edits shall not overwrite committed newer state. | Concurrent work/metadata edit test returns conflict and preserves newer values. |
| NFR-03 | P0 / BR-13, BR-14 | Dependency failure/repeated processing shall produce explicit failure without fabricated answers or obsolete revival. | Inject bounded-call timeout, duplicate/out-of-order processing; check access/version outcomes. Numeric bounds are pilot/design decisions. |
| NFR-04 | P0 / BR-03 | Reconnected clients shall recover committed work state. | Disconnect/update/reconnect and compare with authoritative results. |
| NFR-05 | P0 / BR-10, BR-11, BR-12 | Logs/traces shall minimise source content and exclude secrets/private model reasoning. | Inspect synthetic samples/access negatives; retention policy OD-08. |
| NFR-06 | P0 / BR-10, BR-12 | Every data kind sent to embedding/LLM/tracing providers shall have a documented transfer/access/retention policy. | Inventory before real-data use; local vector storage alone proves no local-only pipeline. Provider OD-06. |
| NFR-07 | P1 / BR-07, BR-08, BR-12 | Retrieval, answer support and citations shall be evaluated separately on about 20–30 English reference questions. | Record sources/versions/access/claims/insufficiency; measure top-five discovery across eligible cases and identify multi-source cases. Final aggregate thresholds are OD-07, frozen after pilot and before final evaluation. |
| NFR-08 | P1 / BR-07, BR-13 | Search/AI performance shall be measured under declared corpus/hardware/provider/load. | Median/p95/capacity pilot observations; targets OD-07, no invented numeric commitment. |
| NFR-09 | P1 / BR-07, BR-08 | Claimed semantic improvement shall be supported by an equivalent keyword comparison. | Compare FR-53/FR-18 on identical questions/corpus/access; one passing semantic fixture does not establish superiority over keyword retrieval. Time savings additionally need manual searcher/helper baseline and learning-effect controls. |

Logical external interfaces: identity verification, embeddings and generation. Product interfaces: work, knowledge/import/access policy, retrieval, questions, citations and inspection. Contracts require authenticated context, stable identities and explicit errors. Products/versions, protocols, payloads, boundaries and retries belong to SAD/API design. No physical hardware interface is required. Minimal microservices follows AGENTS.md; no service is selected here.

## 7. Verification and release gates

Functional tests cover every AC and SC-01–SC-08. Prioritise cross-project access; document classification/grant/revoke; membership removal; prior-result reuse after revocation; direct citations; concurrent revocation before context/delivery; replacement; history; failed/retried/out-of-order indexing; stale results; deletion; stale work state; prompt injection; provider failure; logout/expiry. Tests name enforcement boundaries and retain failed results.

For revocation cases, pause before context submission and before answer delivery, commit the change and resume; also test prior-result reuse at §5 boundaries. Membership removal/re-addition must not revive old grants. Revise a document twice; verify the first version is Superseded and opens by exact citation, and ordinary retrieval returns only the latest. Revoke the author read grant and verify that authorship does not bypass read checks. For FR-59 compare not-found-equivalent response status/body/schema and UI fields; HTTP uses 404. These response checks do not establish absolute timing or side-channel security. Exercise all AC-33 failure modes, derive Blocked from the latest event, and verify one Active Sprint and exclusive Planned/Active allocation under ADR-0008.

Answer scoring splits responses into substantive claims. A reviewer checks each Fact against its cited passage. For Synthesis, check all contributing passages and that the inference adds no unsupported decision/outcome. Uncertain/Insufficient evidence must not read as recorded fact. Unsupported claims, wrong versions and fabricated citations count as failures; a link alone earns no evidence credit. Supplementary LLM judging cannot replace manual evidence checks. AC-24 uses a bounded fixture; aggregate thresholds remain post-pilot decisions.

Use about 20–30 English reference questions and mark top-five-discovery-eligible/multi-source cases. Separate retrieval from generation and tuning from final cases where feasible. Record model/provider version, embedding/retrieval settings, corpus version, hardware/load, negative results and small-sample limits. Compare keyword/semantic retrieval before improvement claims; measure manual searcher/helper time before time-saving claims.

D0a and D0b are demonstrations, not Core completion. **This release requires all 60 release Must ACs and applicable SC-01–SC-08 outcomes verified, no known unauthorised-access defects remaining open, usable AI fallback and evaluation against criteria frozen before the final run.** ADR-0010 exempts AC-27, AC-49, AC-62 and AC-64–AC-67 if omitted; FR-45 is withdrawn under ADR-0009. Original BRD priorities remain unchanged. Unresolved policy details still precede acceptance of affected behaviour. Do not change expected answers/thresholds to make results pass. This document records no executed application tests.

## 8. Traceability and ID continuity

FR rows include their BRs; ACs share FR numbers. NFR source traces are in §6 and SC traces in §3. Detailed implementation/test IDs follow in Stage 8.

| BR / priority | Functional requirements |
| --- | --- |
| BR-01 Must | FR-01, FR-02, FR-03, FR-04, FR-36, FR-37, FR-38, FR-39, FR-50, FR-51, FR-52, FR-59, FR-64, FR-68, FR-70 |
| BR-02 Must | FR-05, FR-06, FR-07, FR-08, FR-40, FR-41, FR-42, FR-66, FR-67 |
| BR-03 Must | FR-09, FR-43, FR-44 |
| BR-04 Must | FR-10, FR-62, FR-65 |
| BR-05 Must | FR-11, FR-12, FR-15, FR-19, FR-47, FR-61 |
| BR-06 Must | FR-16, FR-17, FR-44, FR-49 |
| BR-07 Must | FR-18, FR-19, FR-20, FR-34, FR-47, FR-53, FR-63, FR-70 |
| BR-08 Must | FR-21, FR-22, FR-23, FR-24, FR-28, FR-30, FR-46, FR-53, FR-54, FR-60 |
| BR-09 Must | FR-25, FR-26 |
| BR-10 Must | FR-01, FR-03, FR-04, FR-14, FR-17, FR-20, FR-21, FR-26, FR-28, FR-29, FR-30, FR-37, FR-39, FR-50, FR-51, FR-52, FR-55, FR-56, FR-58, FR-59, FR-68 |
| BR-11 Must | FR-31, FR-56 |
| BR-12 Must | FR-27, FR-32, FR-46, FR-55, FR-57, FR-58, FR-60, FR-61 |
| BR-13 Must | FR-33, FR-34, FR-69, FR-70 |
| BR-14 Must | FR-13, FR-14, FR-15, FR-39, FR-48, FR-52, FR-61 |
| BR-15 Should | FR-35 (P2/Enhanced) |

| Earlier grouped FR | Current split / clarification |
| --- | --- |
| FR-02 project/membership | FR-02 create; FR-38 add; FR-39 remove |
| FR-05 create/edit/order | FR-05 create; FR-40 edit; FR-41 order |
| FR-08 start/complete | FR-08 start; FR-42 fixed-policy completion |
| FR-09 state/assignee/blocker | FR-09 state; FR-43 assignee; FR-44 blocker event |
| FR-12 status/history; FR-13 archive/delete | FR-12 status; FR-47 historical retrieval; FR-13 archive; FR-48 delete |
| FR-16 add/remove | FR-16 create; FR-49 remove |
| FR-18 search/presentation | FR-18 keyword; FR-63 presentation; new FR-53 semantics |
| FR-22 assign/validate/open | FR-22 assign; FR-60 validate; FR-46 excerpt |
| FR-23 missing/conflict | FR-23 insufficiency; FR-54 detected conflict |
| FR-27/FR-32 inspection/correlation | FR-27 bounded summary; FR-32 correlation; FR-57 capture; FR-58 scoped trace inspection |
| FR-28 context/citation | FR-28 context; FR-55 citation opening |
| FR-29 persistence surfaces | FR-29 answer delivery/source reads; no saved/history/preview creation capability |
| FR-31 capture/inspection | FR-31 capture; FR-56 scoped audit inspection |
| FR-33 continuity/failure state (v0.2) | FR-33 work continuity; FR-69 AI failure state (v0.3) |

Other added operations fill authentication/session, document policy, non-disclosure, Core import and metadata gaps. Existing references need review against this table; preserving an ID does not preserve its old wording.

## 9. Draft assumptions and constraints

| ID | Assumption / source | Validation |
| --- | --- | --- |
| ASM-01 | English-only query/content/evaluation as requested in owner review; text/Markdown Core. | Pilot fit OD-05; broader languages/formats need a later decision. |
| ASM-02 | To Do/In Progress/Done board; Planned → Active → Completed Sprint; unfinished items return to Backlog as To Do, completed work remains linked, no implicit completion. At most one Sprint per project is Active; an item cannot be allocated to two Planned/Active Sprints. | Owner-confirmed ADR-0008; no configurable workflow engine. |
| ASM-03 | Project-shared/restricted document classes; explicit restricted read grants plus current membership. Membership removal invalidates grants; rejoining does not restore them. The creator sets initial classification; later changes require manage-access authority. | Owner-confirmed initial access model in ADR-0007, including a revocable initial author read grant; additional non-read delegation remains open. |
| ASM-04 | Single-question Core answer view; no saved answers/persistent conversation/separate previews. | Scope boundary OD-10; trace/provenance retention is separate. |
| ASM-05 | Pre-provisioned accounts for D0a/D0b; sign-in/session behavior remains application scope. | Mechanism/provisioning/expiry OD-09. |
| ASM-06 | Owner-directed solo capstone with a five-month target; pilot content still needs named ownership. Weekly available hours, machine and actual throughput are unmeasured. | ADR-0010 retains 60 Must and exact exceptions. April 2027 submission and at least eight hours per working day are owner directions; kickoff, working days/week and measured throughput remain OD-01. |
| ASM-07 | A work item is Blocked when its most recent blocker event is Open; a later Resolved event ends the block. | Owner-confirmed ADR-0008; latest committed per-task sequence is authoritative. |
| ASM-08 | AI budget is an operator-configured usage limit (calls or tokens per period) whose exhaustion produces an explicit AI-unavailable state. | Limits and scope are OD-06. |

Pain points lack interview validation. PostgreSQL/pgvector storage is selected and tested under ADR-0004; application framework/provider choices and enforcement remain separate. LM Studio/Agno remain candidates. Fixtures must be synthetic/authorised and secrets runtime-supplied. AGENTS.md directs minimal microservices while BRD §12.3 leaves architecture to design; record this difference in SAD without rewriting the BRD.

## 10. Checklist results and revision evidence

The repository checklist's question columns were used. Its pre-filled notes describe another product and are not project evidence. Pass means author documentation self-check, not approval, feasibility proof or executed tests.

| Checklist item | Result | Evidence / gap |
| --- | --- | --- |
| Purpose/scope | Pass | §1 defines boundary, releases, language and persistence assumption. |
| Business context | Pass | BRD purpose preserved; value unvalidated. |
| User characteristics | Gap | Roles/capabilities exist; personas/proficiency OD-01. |
| Operating environment | Gap | Deployment/browser sizing OD-06. |
| Singular and complete | Pass | D1–D4 applied: FR-33 split from FR-69, FR-31 references an event catalogue, and AC verification guidance relocated. Other prior splits remain. Completeness is relative to current sources and subject to validation. |
| Implementation-free | Pass | FR-59 states not-found-equivalent behavior with a conditional HTTP mapping; §5 defines observable behavior and delegates mechanisms to SAD. Test guidance is in §7/NFR verification. |
| Verifiable | Gap | Concrete Core ACs; initial access, Sprint and lifecycle choices are confirmed. Additional delegation, physical retention and identity OD-09 remain unresolved. FR-35 calculations are deferred. |
| Performance/capacity | Gap | Pilot targets OD-06/OD-07. |
| Security/privacy | Gap | Explicit access/revocation/non-disclosure ACs; delegation, transfer/retention and actual enforcement unproven. |
| Reliability/availability | Gap | Concrete AI failures; uptime/RTO/RPO/timeout values not evidenced. |
| Scalability | Gap | Workload/corpus/hardware OD-06. |
| UI interfaces | Pass | Journeys, excerpts and failures; layout belongs to UI/UX. |
| Hardware interfaces | N/A | No physical interface. |
| Software interfaces | Gap | Logical identity/embedding/generation interfaces; contracts/vendor downstream. |
| Communication interfaces | Gap | Protocol/deployment security in SAD/API. |
| Constraints | Pass | BRD/AGENTS direction recorded without stack/service selection. |
| Dependencies | Pass | External choices and independent fallback stated. |
| Unambiguous language | Gap | Tightened ACs; proposed policies still need owner validation. |
| Traceable/numbered | Pass | FR/AC pairing, row BRs, SC/reverse BR maps. |
| Consistent | Pass | Handoff, fixed workflow, persistence and actors reconciled; no independent approval claimed. |

**v0.4 context checks:** The local validator confirmed 69 FR/AC and BR trace, the proposed 61 Must / three Should / four Could / one Won't overlay, two service contracts, 13 specs and 25 reference cases; nine context-harness unit tests passed. This is not application/security/provider evidence. Read the [artifact register](artifact-register.md) for verification and unrun checks.

**v0.4 changes:** Owner-directed solo/five-month horizon; pain-point MoSCoW overlay and PLAN-01/backlog/spec handoff; original Core/BR priorities retained pending exact OD-11 deferrals; OD-12 records the proposed stack/store. No FR/AC ID or functional policy changes in this revision.

**v0.3 prior changes:** Invalidated grants on membership removal; withheld-answer rule for revocation before delivery; Draft version state; creation-time classification rule; one Active Sprint; blocker derivation; AI budget definition; D0 split into D0a/D0b; descoping order and OD-11; FR-33 split with new FR-69; FR-31 catalogue; interface-neutral FR-59; test instructions moved out of ACs. Policy proposals remain tied to their OD rather than approved by this revision. Follow-through consistency fixes label Draft unpublished, require a Draft replacement in FR-45 and permit restricted semantic candidates when the requester has access.

**Historical v0.4 documentation verification:** Checked 69 unique FR/AC Given/When/Then pairs, valid FR references, row-level/reverse BR map equality for BR-01–BR-15, all eight scenario rows, P0/P1/P2 labels and local links/anchors. Delivery counts are 55 P0, 13 P1 and one P2; D0a lists 21 P0 FRs and D0b lists 17 P0 FRs. Reviewed against the repository checklist questions and all v0.3 patch items. Build, lint, application/UAT, retrieval evaluation and security/failure tests were not run: no implementation or pilot exists. These checks establish document consistency only.

## 11. Open decisions and handoff

| ID | Decision / owner | Proposal and impact |
| --- | --- | --- |
| OD-01 | Pilot/personas/resources / owner | Solo developer and five-month target are owner directions; validate pilot users, actual weekly hours, machine and kickoff calendar. |
| OD-02 | Action-to-role matrix and delegation / owner | Initial model confirmed by ADR-0007: project-shared/restricted, explicit creator classification, author read grant, revocation/rejoin and generic 404. Initial capability defaults are recorded; additional non-read delegation/provisioning and inspector delegation remain open. |
| OD-03 | Fixed Sprint policy / owner | Closed by owner-confirmed ADR-0008: fixed Sprint lifecycle, one Active Sprint, exclusive allocation and highest-committed-sequence blocker derivation. |
| OD-04 | Document transitions/authority/history/retention / owner | Lifecycle and initial authority confirmed by ADR-0007/0009: Current/Superseded/Archived, immediate atomic revision, no product Draft or publish operation. ADR-0013 confirms current-read entitlement for surviving unavailable citation identities. Physical retention remains open; retention duration is not a Core gate. |
| OD-05 | Validate English/text/Markdown pilot assumption / owner | ASM-01 is draft default; no other language/format assumed. |
| OD-06 | Deployment/provider/transfers/corpus/load/browser/accessibility / owner with architect | No unsupported vendor/sizing/numeric commitment. AI usage budget definition, limits and scope (ASM-08). Record embedding/generation choice as an ADR before D0b. |
| OD-07 | Post-pilot thresholds/final cases / owner with evaluator | Freeze before final evaluation and keep negative results. |
| OD-08 | Audit/trace delegation and retention / owner | Scoped inspectors; source permissions still apply; no unrestricted logs/private reasoning. |
| OD-09 | Identity/session expiry/provisioning / owner with architect | Sign-in/out/expiry FRs explicit; D0a/D0b pre-provisioned accounts provisional. |
| OD-10 | Core answer interaction / owner | ASM-04 omits saved/history/preview creation; adding them needs scope/access requirements. |
| OD-11 | Five-month MoSCoW/capacity and exact deferrals / owner | Seven Core exceptions are confirmed by ADR-0010. With ADR-0016's optional FR-70 addition, current totals are 60 Must, 4 Should, 4 Could, 1 Won't; FR-45 is withdrawn. Week-2 and Months-2/3 capacity gates retain 60 Must and escalate schedule/capacity, not automatic additional cuts. |
| OD-12 | Student application stack and installed versions / owner with architect | ADR-0004 storage selected: PostgreSQL 17.10 / pgvector 0.8.2 and owned migrations implemented/tested. ADR-0003 application frameworks remain Proposed. Migration 002 tests do not prove handlers or concurrent handoffs. |

**FR-35 Enhanced gap:** Report types/calculations require an Enhanced decision before its acceptance criterion can be instantiated; FR-35 remains outside the Core gate.

**Handoff: Ready for downstream with explicit gaps.** ADR-0007–ADR-0017 and OWNER-Q-01 already confirm the recorded access, Sprint, lifecycle, release and evidence directions. Do not reopen those choices or the seven OD-11 exceptions. Additional capability delegation, physical retention, identity/provisioning, provider/framework selection and measured calendar capacity remain open under the corresponding OD rows. Storage is implemented under ADR-0004; application enforcement is not. Stage 2 can proceed under confirmed policies, while unresolved details still prevent full baseline/application acceptance. Stage 3 defines enforcement/concurrency/failure/storage under AGENTS.md and reviews [ADR-0001](../adr/0001-protected-resource-read-policy.md). Stage 8 can prepare cases/measurements, then bind them to accepted policies. The register tracks downstream impacts; no planned artifact becomes complete from this revision.

**v0.5 change record:** Applies confirmed access/Sprint/lifecycle/release direction, retains Withdrawn FR-45, and distinguishes storage evidence from application completion. Active counts are derived by the context validator; historical v0.4 counts above remain snapshots.

### Owner clarification - 14 October 2026: invalid citations

The FR-22/FR-60 rows above incorporate ADR-0013 and BA-D16. Structural identity checks remain distinct from claim-support checks.

### Owner clarification - 14 October 2026: partial evidence

The FR-23/FR-24 rows above incorporate ADR-0015. Partial content must come from a valid checked attempt.

### Owner extension - 14 October 2026: task keyword search

ADR-0016 adds FR-70 as Should after 60 Must. There are now 69 active FRs (54 P0, 14 P1, one P2) plus Withdrawn FR-45. The new optional behavior does not change the seven original-Core exceptions in ADR-0010 or promote optional work into the release gate.

### Owner clarification - 14 October 2026: complete membership removal

The AC-38/39/43 rows above incorporate ADR-0017. Verify races between removal, assignment and grant issuance, including two concurrent removals of the last two effective membership managers. Other projects are unaffected.

**v0.7 change — 16 October 2026:** OWNER-Q-01 confirms To Do on unfinished Backlog return and complete immutable manifest persistence before guard acquisition, with guarded matching and bounded fresh attempts. FR-09/42/57/67 assertions are inline; no runtime evidence is claimed.

**v0.8 editorial correction — 17 October 2026:** Corrects the checklist and downstream handoff to distinguish settled owner choices from remaining details. FR/AC text, priorities and scope are unchanged from v0.7.

## Template source-link correction — 2 November 2026

Version 0.10 changes only the prompt/checklist source paths to analysis/ in the existing tracked template checkout 6996dae13b2bfe31e77b5d90bb5eb24888a6a910. FR/AC/BR/SC, release priorities, decisions and requirement text are unchanged from v0.9. The parent repository still pins template revision 3c65f5cbefa7d69a75cadd89b177e3add8b400b0 with the older flat layout; this correction verifies the current working checkout, not clean-clone/submodule reproducibility. No template reset, copy, gitlink publication, application test or new owner acceptance is implied.

## SP-04 selected authority and original-outcome rule — 3 November 2026

AC-09/40/43/44 apply the actual [SP04-OWNER-01 D-01/D-02/D-03 directions](../implementation/features/sp-04-update-task/owner-decisions.md). Current server session, Task/project read scope and the exact requested action are required for new writes and committed-result replay. Action names/provisioning and transaction details in [Proposed ADR-0028](../adr/0028-task-mutation-authority-and-outcomes.md) remain implementation mechanics, not role-based implicit grants.

For editTask/setTaskState/setAssignee retain the immutable original 200 Task, including title/description, and for recordBlocker retain the original 201 Blocker indefinitely with consumed actor/operation/key/canonical-input hash; no automatic expiry, recycling or substitution with the current row. Recheck current read/action authority before every original-result disclosure. A committed same-input retry returns that original result even after later revisions, placement or assignee eligibility changes, without applying the mutation again. Changed input under the same identity conflicts; new requests use current expected revision. UI reads current Task/history separately. Atomic change/audit/outcome and unknown-acknowledgement recovery use the original identity; timeout is not proof of rollback. This refines existing ACs, adds no FR/priority and is not runtime evidence.
