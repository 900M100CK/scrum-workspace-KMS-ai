# Goal-level use cases for the five-month release

**Artifact ID:** UC-02  
**Version/date:** 0.6 Draft · 17 October 2026
**Status:** Owner-confirmed ADR-0007–ADR-0011 direction; remaining policy and application evidence gaps are explicit.
**Inputs:** BRD v1.0; [PRD-01](PRD_SRS.md) v0.9; [PLAN-01](../planning/five-month-plan.md) v0.3; ADR-0007–ADR-0017; repository UC prompt/checklist.
**Author:** development agent acting sequentially; owner reviews business choices.  
**Changes v0.1 → v0.2:** Replaced boilerplate trigger/flow template with per-UC specific triggers, detailed numbered main success scenarios, separate alternate (Alt-*) and exception (EX-*) flows, and inline Business Rules. All FR/BR/SC traces, postconditions, relationship notes and handoff statements preserved unchanged.
**Revision note (12 October 2026, version unchanged):** Corrected the UML relationship specification and `use-case-diagram.drawio` so UC-02, UC-03, UC-07 and UC-13 are associated with their scoped actors instead of Authorised Member; added the FR-35 trace note below. No UC flow, FR/BR/SC trace or postcondition changed.

**Out-of-scope trace (FR-35 / BR-15, Should, P2):** No use case covers the basic Sprint report. PRD-01 keeps FR-35 as Enhanced and PLAN-01 lists it as Won't for this release under owner-confirmed ADR-0010. Sixty release Must requirements remain binding; optional FR traces below preserve requirements without adding them to that gate.

Boundary: Scrum Workspace and AI Project KMS. Primary actors are PRD authorised members/PO/content authors/Sprint managers and scoped inspectors. Identity and AI providers are supporting systems when applicable. Protected cases require a valid session and current resource authority. Sign-in is a separate goal (UC-01), not automatically included in every case; it is a precondition. Actor accountability grants no content access.

---

## UC-01 — Establish and end a session

**Purpose:** Use an authenticated session whose expiry and sign-out end protected access.  
**Actor:** User. **Supporting system:** Identity mechanism (mechanism TBD, OD-09).  
**Trace:** FR-01, FR-36, FR-37, FR-68; BR-01, BR-10; SC-06.  
**Trigger:** User submits authentication credentials via the identity mechanism (sign-in), OR submits a sign-out request, OR attempts a protected operation with an expired session token.  
**Precondition:** Account and identity mechanism are configured (pre-provisioned for D0a/D0b per ASM-05).

### Main Success Scenario — Sign-in

1. **User** submits credentials (username/password or identity-provider token) to the sign-in endpoint.
2. **System** forwards credentials to the identity mechanism; receives a valid positive result.
3. **System** establishes an application session with a bound session token and configured expiry.
4. **User** receives the session token; subsequent protected requests include it and succeed.

### Main Success Scenario — Sign-out

1. **User** submits sign-out request with a valid session token.
2. **System** invalidates the session; the token can no longer authorise protected requests.
3. **User** receives sign-out confirmation; prior session token yields no protected result (AC-37).

### Alternate Flows

- **Alt-1 (Step 1 — Sign-in):** User initiates sign-in via an external identity provider (OD-09); system delegates credential verification to the provider, then proceeds at Step 3 on success.

### Exception Flows

- **EX-01 (Step 2 — Sign-in):** Identity mechanism returns a negative result (wrong credentials, locked account, or provider unreachable) → System returns a generic authentication-failed response; does not reveal whether the account exists (AC-36). No session is created.
- **EX-02 (Expired session on protected request):** Session token is beyond configured expiry when a protected operation is attempted → System rejects the request, returns session-expired / sign-in-required state, and no protected result is returned (AC-68).
- **EX-03 (Sign-out with already-expired token):** User signs out with an expired or already-invalidated token → System treats it idempotently; returns success; no 500 error; session is already closed.

### Business Rules

- **BR-01:** The effective requester is derived from the authenticated session, not from any caller-supplied identifier (FR-01, AC-01).
- **BR-10:** Expired sessions are rejected for all protected operations (FR-68).
- **OD-09 (open):** Session duration and identity mechanism are not yet confirmed; test fixtures use pre-provisioned accounts (ASM-05).

**Success postcondition:** Only a valid credential exchange creates a session; invalid authentication yields no session.  
**Failure postcondition:** No unauthorised output or write occurs; no session token is issued on failed authentication.

---

## UC-02 — Create a project and manage membership

**Purpose:** Set the authorised project scope and remove membership without grant revival.  
**Actor:** Authorised project administrator (create/edit project) or membership manager (add/remove members).  
**Supporting system:** None required outside product.  
**Trace:** FR-02, FR-03, FR-38, FR-39, FR-64; BR-01, BR-10, BR-14; SC-06.  
**Trigger:** Project administrator submits a create-project or edit-project request with name and required fields; OR membership manager submits an add-member or remove-member request with project ID and user ID.  
**Precondition:** Valid session; requester holds the required scoped capability (project-administrator or membership-manager) for the action requested.

### Main Success Scenario — Create project

1. **Project administrator** submits create-project request with project name and any required metadata.
2. **System** validates requester holds create-project authority and name is non-empty.
3. **System** persists a new project with a stable project ID, name, creator identity, and creation timestamp.
4. **Project administrator** receives project ID and confirmation; creator is recorded but does not automatically gain restricted-document access (ADR-0007).

### Main Success Scenario — Add member

1. **Membership manager** submits add-member request with project ID and user ID of a registered account.
2. **System** validates: requester has membership-manager capability; user exists and is not already a member.
3. **System** records the membership; the new member gains project-shared document access within the project (no restricted-document grant inferred, AC-38).
4. **Membership manager** receives confirmation; new member can access permitted project resources.

### Main Success Scenario — Remove member

1. **Membership manager** submits remove-member request with project ID and user ID.
2. **System** validates: requester has membership-manager capability; target is a current member; removing this target will leave another current effective membership manager.
3. **System** atomically removes membership, invalidates all individually granted project capabilities and document-read grants, clears current assignees on affected tasks, increments their revisions and persists minimum audit. Historical attribution/state/allocation remain (FR-39, AC-39, ADR-0017).
4. **Membership manager** receives confirmation; removed member's subsequent reads on project/document/retrieval/citation resources are denied. Re-adding the member later restores no prior individual capability, restricted-document grant or task assignment.

### Alternate Flows

- **Alt-1 (Step 1 — Add member):** User being added was previously removed and then re-added → System records new membership; project-shared access resumes; former individual capabilities, restricted-document grants and task assignments are NOT restored (AC-39 / ASM-03, ADR-0007).
- **Alt-2 (FR-64 — Project metadata, optional):** Authorised project administrator edits name/description; system validates authority and expected revision, persists the descriptive change with audit, and preserves project identity and memberships. Refreshed reads show the new values; stale or unauthorised writes do not overwrite the project (AC-64, NFR-02; optional under ADR-0010).

### Exception Flows

- **EX-01 (Step 2 — Create project):** Requester lacks create-project authority → System denies with forbidden response; no project created.
- **EX-02 (Step 2 — Add member):** Target user ID does not exist in the system → System denies with not-found-equivalent response (FR-59); does not reveal whether the user exists.
- **EX-03 (Step 3 — Remove member):** A required write/audit dependency fails → System rolls back the complete Workspace transaction; a lost response is an unknown outcome reconciled with the same operation identity before retry (NFR-03).
- **EX-04 (Step 2 — Remove member):** Removal would leave no current member with effective membership-management authority → System rejects before mutation; membership, grants, assignments, revisions and audit state remain unchanged. Concurrent removals are serialized so at most one of the last two managers can be removed (ADR-0017).

### Business Rules

- **BR-01:** Project-administrator and membership-manager are scoped capabilities, not universal Scrum roles; Workspace Admin does not automatically hold them (PRD §2).
- **BR-14:** Removing a member invalidates all individually granted capabilities and read grants, clears current assignments with revision increments, and preserves history; re-adding restores none of them (ADR-0017).
- **OD-02 (open):** Who may grant membership-manager and project-administrator capabilities is unresolved; affects downstream tests.

**Success postcondition:** A nonmember and an unknown project receive indistinguishable protected read denial (FR-59).  
**Failure postcondition:** No unauthorised output or write; partial state, if any, is labelled pending and retryable.

---

## UC-03 — Create a task in the project backlog

**Purpose:** Persist one Story/Task/Bug in the correct authorised project and initial board state.  
**Actor:** Authorised Product Owner (PO) or equivalent backlog-author capability.  
**Supporting system:** None required outside product.  
**Trace:** FR-05, FR-40, FR-41; BR-02; SC-01.  
**Trigger:** Authorised PO submits a create-backlog-item request with type (Story, Task, or Bug), title/content, and project ID.  
**Precondition:** Valid session; requester holds PO or backlog-author capability within the target project.

### Main Success Scenario

1. **PO** submits create-backlog-item request specifying type (Story/Task/Bug), title, optional description, and project ID.
2. **System** validates: session is valid; requester has PO/author capability in the project; type is one of the three supported values; title is non-empty.
3. **System** persists the new item with a stable item ID, project reference, type, title, initial board state To Do, and creation timestamp.
4. **System** records a business audit event: actor, action (backlog-item-create), entity ID, time (FR-31).
5. **PO** receives item ID, type, board state To Do, and creation timestamp. HTTP 201 on success (AC-05).

### Alternate Flows

- **Alt-1 (Step 1):** PO submits an edit-content request on an existing item (FR-40) → System validates stale-write token (NFR-02) and updates title/description; another member sees the change after refresh (AC-40). Audit event recorded.
- **Alt-2 (Step 1):** PO submits a reorder-backlog request with a new relative ordering (FR-41) → System applies the ordering; reads confirm updated relative sequence without changing item content (AC-41). Audit event recorded.

### Exception Flows

- **EX-01 (Step 2):** Type value is not Story, Task, or Bug → System rejects with validation error; no item created (AC-05).
- **EX-02 (Step 2):** Requester lacks PO/author capability in the project → System returns forbidden; no item created.
- **EX-03 (Step 2 — Edit, Alt-1):** Revision token is stale — another member has committed a newer update → System returns conflict error with the current revision token; does not overwrite the newer state (NFR-02, AC-40).

### Business Rules

- **BR-02:** Only authorised PO capability creates and orders Backlog items; Scrum Master accountability alone is insufficient.
- **SC-01:** A task's linked permitted specifications and decisions must be navigable without revealing restricted target metadata.
- Supported item types are Story, Task, Bug only (AC-05).

**Success postcondition:** Creation returns 201 with server-assigned item ID, project reference, and initial To Do state (AC-05).  
**Failure postcondition:** No unauthorised output or write; no partial item persisted.

---

## UC-04 — Update work state and record blockers

**Purpose:** Update a task without stale overwrite and retain blocker resolution evidence in observable event order.  
**Actor:** Work operator: current member with the capability for the requested mutation.
**Supporting system:** None required outside product.  
**Trace:** FR-09, FR-40, FR-43, FR-44; BR-03, BR-02, BR-06; SC-03, SC-04.  
**Trigger:** Authorised member submits a board-state-change request between To Do, In Progress and Done (including reopening Done), an assignee-set request, or a blocker-event request (Open or Resolved) with item ID and required fields.
**Precondition:** Valid session; requester holds current membership and the requested state-change, assignment or blocker capability; target item exists and is within an accessible project.

### Main Success Scenario — Board state change

1. **Member** submits board-state-change request with item ID, target state, and current revision token.
2. **System** validates: session valid; member has access and state-change capability; current revision token matches the stored token (NFR-02); target state is To Do, In Progress or Done. Direct changes and reopening Done are permitted under ADR-0008 v0.2.
3. **System** applies the state change; updates the revision token.
4. **System** records audit event: actor, board-state-change, item ID, before/after state, time (FR-31).
5. **Member** receives updated state and new revision token. Another member sees the change after refresh (AC-09).

### Main Success Scenario — Set assignee

1. **Member** submits set-assignee request with item ID and target user ID (or unassigned).
2. **System** validates: requester has member access and assignment capability; target user ID is a current project member or is the unassigned value.
3. **System** persists the assignee; records audit event (FR-31, AC-43).
4. **Member** receives confirmation of new assignee.

### Main Success Scenario — Record blocker event

1. **Member** submits a blocker-event request with item ID, event type (Open or Resolved), and description/outcome text.
2. **System** validates: requester has member access and blocker capability; description is non-empty.
3. **System** appends the event with actor, event type, description/outcome, timestamp and unique per-task committed sequence; does not overwrite prior events (FR-44).
4. **System** derives current Blocked status from the event with the **highest committed per-task sequence**: Open → item is Blocked; Resolved → item is not Blocked; no events → not Blocked (ASM-07, AC-44). Timestamp or identifier ordering cannot override sequence.
5. **System** records audit event (FR-31).
6. **Member** receives the event record and the current derived Blocked status.

### Alternate Flows

- **Alt-1 (Step 1 — Board state):** Member changes To Do directly to Done, or reopens Done as To Do/In Progress → System applies the same membership/revision checks and commits the requested state with audit. No intermediate state or Scrum Master approval is required. If the Done task belongs to a Completed Sprint, atomically return it to Product Backlog as To Do for later allocation (normalising an In Progress reopen request) while preserving the completed allocation history; the Sprint remains Completed.
- **Alt-2 (Step 1 — Blocker):** Member records a Resolved event when no prior Open event exists → System records the Resolved event; derived Blocked status remains Not Blocked. No error; this is valid as a retrospective record.

### Exception Flows

- **EX-01 (Step 2 — Board state):** Revision token is stale — another member committed a newer change → System returns conflict error with the current revision token; does not overwrite (NFR-02, AC-09).
- **EX-02 (Step 2 — Set assignee):** Target user ID is not a current project member → System rejects with invalid-assignee error; assignee is not changed (AC-43).
- **EX-03 (Step 3 — Any):** Dependency fails during commit → System returns explicit failed/pending state (NFR-03); no partial event is recorded; operation is retryable.
- **EX-04 (Step 3 — Blocker):** Member records an Open event when latest event is already Open → System appends the new Open event; current Blocked status remains Blocked; no de-duplication or rejection; event history is preserved.

### Business Rules

- **BR-03:** Board-state transitions require no automatic Scrum Master approval (AC-09).
- **BR-06:** Blocked status is derived from the **latest** blocker event, not from document text or older events (ASM-07). An Open plan is not presented as a completed resolution (AC-44).
- **NFR-02:** Stale concurrent edits are rejected, not silently overwritten.
- **SC-03 / SC-04:** Current blocked state comes from operational observations; historical blocker events distinguish plan (Open) from recorded outcome (Resolved).

**Success postcondition:** Expected revision mismatch returns conflict and preserves the newer committed update (AC-09).  
**Failure postcondition:** No unauthorised output or write; safe partial state, if any, is labelled pending and retryable.

---

## UC-05 — Plan, start and complete a basic Sprint

**Purpose:** Run the fixed Scrum lifecycle without introducing a workflow configuration engine.  
**Actor:** Authorised Sprint manager.  
**Supporting system:** None required outside product.  
**Trace:** FR-06, FR-07, FR-08, FR-41, FR-42, FR-66, FR-67; BR-02; SC-03.  
**Trigger:** Sprint manager submits one of: create-sprint request with goal/dates; add-to-sprint or remove-from-sprint request with item IDs; start-sprint request; or complete-sprint request with Sprint ID.  
**Precondition:** Valid session; requester holds Sprint-manager capability in the target project.

### Main Success Scenario — Create planned Sprint

1. **Sprint manager** submits create-sprint request with project ID, Sprint goal (non-empty string), start date, and end date.
2. **System** validates: Sprint-manager capability confirmed; start date is before end date (AC-06).
3. **System** persists Sprint with status Planned, a stable Sprint ID, goal, dates, and creation timestamp.
4. **System** records audit event: sprint-create, actor, Sprint ID, time (FR-31).
5. **Sprint manager** receives Sprint ID and Planned status.

### Main Success Scenario — Allocate backlog items

1. **Sprint manager** selects multiple items and submits add-to-sprint in the UI. Under ADR-0014, the UI dispatches a separate `allocateTask` request for each item with its own operation key and expected revision, and aggregates the results.
2. **System** validates: Sprint is in Planned or Active status; Sprint-manager capability confirmed.
3. **System** checks each item: item belongs to the project; item is not already allocated to another Planned or Active Sprint (FR-07, AC-07).
4. **System** allocates valid items to the Sprint; records audit event per allocation.
5. **Sprint manager** receives each confirmed result: allocated or rejected with a scoped reason. A lost response after possible commit is shown as unknown/reconciling, not failed; replay uses the same per-item key/payload. No hidden task or competing-Sprint metadata is exposed (ADR-0014).

### Main Success Scenario — Start Sprint

1. **Sprint manager** submits start-sprint request with Sprint ID.
2. **System** validates: Sprint is Planned; no other Active Sprint exists in this project (AC-08); Sprint-manager capability confirmed.
3. **System** transitions Sprint to Active; records start timestamp.
4. **System** records audit event: sprint-start, actor, Sprint ID, start time (FR-31).
5. **Sprint manager** receives Active status and start timestamp.

### Main Success Scenario — Complete Sprint

1. **Sprint manager** submits complete-sprint request with Sprint ID.
2. **System** validates: Sprint is Active; Sprint-manager capability confirmed.
3. **System** transitions Sprint to Completed with completion timestamp.
4. **System** moves unfinished items (not in Done state) back to Product Backlog as To Do, increments task revisions and records minimum audit; items in Done state remain associated with the completed Sprint. This and Step 3 commit atomically (AC-42, ADR-0008).
5. **System** records audit event: sprint-complete, actor, Sprint ID, done-item count, returned-item count, time (FR-31).
6. **Sprint manager** receives Completed status, done-item count, and returned-item count.

### Alternate Flows

- **Alt-1 (Step 3 — Allocate):** One or more items in the list fail the allocation check (already allocated to another Active/Planned Sprint) → System allocates valid items, rejects conflicting items individually with reason, and reports a partial result. Valid items remain allocated (AC-07).
- **Alt-2 (Step 1 — Remove from Sprint, FR-67):** Sprint manager submits remove-from-sprint request with Sprint ID and item ID → System removes the item from Sprint Backlog; item returns to Product Backlog without deletion or implicit completion; unfinished items become To Do with task revision and audit in the same transaction (AC-67).
- **Alt-3 (Step 1 — Edit Sprint, FR-66):** Sprint manager submits edit-sprint request to update goal/dates on a Planned Sprint → System validates dates and persists changes; Invalid dates are rejected (AC-66).

### Exception Flows

- **EX-01 (Step 2 — Start):** Another Active Sprint already exists in the same project → System rejects start request with single-active-sprint constraint violation; Sprint remains Planned (AC-08).
- **EX-02 (Step 2 — Start):** Start date is after end date or dates are missing → System rejects with date-validation error; Sprint remains Planned (AC-06).
- **EX-03 (Step 2 — Start):** Requester attempts to start a Completed Sprint → System rejects; Completed state is terminal (AC-08).
- **EX-04 (Step 3 — Complete):** Dependency fails during completion commit → System returns explicit failed/pending state (NFR-03); Sprint state is unchanged; operation is retryable.
- **EX-05 (Step 2 — Complete):** Sprint is not Active (already Completed or still Planned) → System rejects with invalid-state error.

### Business Rules

- **BR-02 / ASM-02:** At most one Active Sprint per project at any time; an item cannot be allocated to two Planned/Active Sprints simultaneously (AC-07, AC-08).
- **OD-03 (confirmed, ADR-0008):** Sprint completion returns unfinished items to Backlog as To Do and preserves completed work history. No Scrum Master approval gate on start or complete; Sprint completion and these allocation changes form one atomic operation.
- **SC-03:** Current blocked items in Sprint are derived from latest operational observations, not historical document text.

**Success postcondition:** Two concurrent start requests cannot create two Active Sprints in one project (AC-08).  
**Failure postcondition:** No unauthorised output or write; safe partial state, if any, is labelled pending and retryable.

---

## UC-06 — Create restricted knowledge and manage its access

**Purpose:** Store an owned English text/Markdown source with explicit, independently enforced document access classification.  
**Actor:** Authorised content author (create/edit) and/or document access manager (classification and grants).  
**Supporting system:** None required outside product.  
**Trace:** FR-04, FR-10, FR-14, FR-50, FR-51, FR-52, FR-62, FR-65; BR-01, BR-10, BR-04, BR-14; SC-06.  
**Trigger:** Authorised author submits a create-document request with content, project ID, owner designation, and an explicit classification (project-shared or restricted); OR a document access manager submits a reclassification, grant-read, or revoke-read request.  
**Precondition:** Valid session; requester holds author capability for creation/edit or manage-access capability for classification and grants; target project accessible.

### Main Success Scenario — Create document

1. **Author** submits create-document request with: English text/Markdown content, project ID, title, labels/owner metadata, and explicit classification (project-shared or restricted).
2. **System** validates: author capability confirmed; classification field is present and has a valid value; project exists and author is a member.
3. **System** allocates the stable document identity and atomically registers its classification, initial author capabilities and explicit revocable author read grant for restricted content in the permission authority. The idempotency key is bound to the authenticated actor, project and request.
4. **System** persists the initial immutable Current version using that registered identity after validating current create authority. Initial content, passages, hash and pointer commit together in the content-owning service. No separate registry-activation operation exists; policy registration alone does not mean content is available.
5. **System** records committed creation/policy audit events with actor, document/version identity, classification and time (FR-31). **Author** receives confirmed document/version IDs and Current status only after content persistence succeeds; indexing readiness is reported separately (AC-10, AC-15).

### Main Success Scenario — Grant restricted read access

1. **Document access manager** submits grant-read request with document ID and target member user ID.
2. **System** validates: manage-access capability confirmed; target user is a current project member; document exists and is classified restricted.
3. **System** records an explicit read grant linking the user to the document.
4. **System** records audit event: grant, actor, document ID, grantee, time (FR-31).
5. **Document access manager** receives confirmation; grantee can now read the document (AC-51).

### Main Success Scenario — Revoke read access

1. **Document access manager** submits revoke-read request with document ID and target user ID.
2. **System** validates manage-access capability and document scope. An already-absent grant is an idempotent success; it does not skip the authority check.
3. **System** removes the grant. All subsequent reads, deliveries, searches, and citation openings by that user on this document are denied (FR-14, FR-28, FR-29, FR-55).
4. **System** records audit event: revoke, actor, document ID, grantee, time (FR-31).
5. **Document access manager** receives confirmation; repeating revocation has no adverse effect (AC-52).

### Alternate Flows

- **Alt-1 (Step 1 — Import, FR-62):** Author submits supported English text/Markdown → System validates format/encoding, then follows create from Step 2, including membership, create authority and explicit classification. Unsupported input fails before content persistence (AC-62). *(P1, optional under ADR-0010)*
- **Alt-2 (Step 1 — Reclassify, FR-50):** Access manager changes classification from project-shared to restricted → System validates manage-access capability; persists new classification; members without explicit grants can no longer read (AC-50). Subsequent restricted reads follow FR-59.
- **Alt-3 (Step 1 — Metadata edit, FR-65):** Author submits metadata-edit request (owner/labels) → System validates; updates metadata; version content and citation locators remain intact (AC-65). *(P1)*

### Exception Flows

- **EX-01 (Step 2 — Create):** Classification field is missing from the create request → System rejects with validation error; no document or version is created (FR-10, AC-10).
- **EX-02 (Step 2 — Create):** Requester lacks author capability in the project → System returns forbidden; no document created.
- **EX-03 (Step 2 — Grant):** Target user ID is not a current project member → System rejects with invalid-grantee error; no grant is recorded. Access manager does not receive information about why the user is not a member (FR-59-equivalent).
- **EX-04 (Step 3 — Revoke):** A protected response races revocation → The shared guarded boundary orders the protected handoff and permission commit. After revocation succeeds, subsequent protected source/citation reads, provider submissions and answer handoffs cannot use the revoked grant. Already transmitted information cannot be recalled. Internal authenticated/scoped policy/state reads do not reacquire this guard (ADR-0011).
- **EX-05 (Steps 3–4 — Create):** Policy registration or content persistence fails or has an unknown outcome → Return an explicit failed/pending result; never label an orphan policy as an accessible document. Reconcile/retry using the same scoped key; duplicates cannot create extra documents, versions or author grants. Do not delete a policy solely because one content read returned absent: delayed persistence must first be fenced or resolved.
- **EX-06 (After create):** Author's explicit read grant is revoked or membership is removed → Authorship/content-write/manage-access do not bypass protected read checks. Rejoining does not revive the old read grant.

### Business Rules

- **BR-04:** Author creates text/Markdown documents; initial classification (project-shared or restricted) is set at creation and cannot be omitted (FR-10, AC-10).
- **BR-01 / BR-14:** Membership removal invalidates document-read grants; manage-access capability is separate from content-read access.
- **OD-02 (partly resolved):** ADR-0007 gives the author initial scoped content-write/manage-access/lifecycle capabilities and a revocable restricted read grant. Manage-access does not imply read. Delegation of additional non-read capabilities remains open; test fixtures must assign them explicitly.

**Success postcondition:** Omitting initial classification rejects creation; initial Current version is created only after access registration succeeds (AC-10).  
**Failure postcondition:** No unauthorised output or write; safe partial state, if any, is labelled pending and retryable.

---

<a id="uc-07--revise-publish-and-retire-a-knowledge-version"></a>

## UC-07 — Revise and retire a knowledge version

**Purpose:** Keep immutable evidence, make each successful revision Current immediately, and distinguish historical sources.
**Actor:** Authorised content author or lifecycle manager; content-write, lifecycle and read capabilities are distinct.
**Supporting system:** None required outside product.\
**Trace:** FR-11, FR-12, FR-13, FR-15, FR-19, FR-47, FR-48, FR-61; BR-05, BR-14, BR-07, BR-12; SC-05, SC-06. FR-45 is Withdrawn; replacement/history assertions continue under AC-11.
**Trigger:** Author submits a revision, or lifecycle manager submits archive/delete.
**Precondition:** Valid session and project membership; requester holds the operation-specific document capability; target is not deleted. Any content returned also requires current read authority.

### Main Success Scenario — Create immediate Current revision

1. **Author** submits document ID, new content, expected aggregate revision and required idempotency key. The editor states that saving changes Current immediately.
2. **System** validates current membership/content-write authority, document lifecycle and expected revision under the guarded lifecycle-write protocol.
3. **System** atomically inserts a distinct immutable Current version and passages, supersedes the previous Current and updates the document pointer/revision. Prior bytes and citation locators remain unchanged (AC-11).
4. **System** records the committed revision with actor, old/new version identities and time. Index/cache work follows the committed version and cannot revive obsolete content.
5. **Author** receives confirmed version/lifecycle identity and independent indexing readiness, subject to response access. Ordinary retrieval admits only the new eligible Current; pending indexing never permits falling back to Superseded content as current. No Draft or publish step exists.

### Main Success Scenario — Archive version

1. **Lifecycle manager** submits archive request with document ID, exact version ID, expected aggregate revision and required idempotency key.
2. **System** validates: lifecycle-manager authority confirmed; target is a Current or Superseded version.
3. **System** transitions target to Archived; excludes it from ordinary retrieval; permits historical access with Archived label (FR-13, AC-13).
4. **System** records audit event: archive, actor, entity ID, time (FR-31).
5. **Lifecycle manager** receives Archived status. Physical retention duration is a separate OD-04 decision.

### Alternate Flows

- **Alt-1 (Step 1 — Revise):** Document is Archived when revision is submitted → System rejects; no replacement is created. Error detail must respect current read entitlement.
- **Alt-2 (Withdrawn):** The former no-Draft publication branch is removed by ADR-0009. Its ID is retained for historical trace only, not an executable requirement.
- **Alt-3 (Step 1 — Delete, FR-48):** Lifecycle manager submits delete request → System removes document from active access; subsequent reads, retrieval, and answer support cannot expose it; stale work cannot revive it (AC-48). Physical storage retention is OD-04.
- **Alt-4 (Step 1 — Historical retrieval, FR-47):** Member explicitly selects historical scope → System returns permitted Superseded/Archived evidence with exact version/status labels; ordinary scope remains Current-only (AC-47). *(P1)*

### Exception Flows

- **EX-01 (Step 2 — Revise):** Requester lacks content-write authority → System returns forbidden; no version created.
- **EX-02 (Withdrawn):** The former invalid-Draft publication branch is withdrawn with FR-45; do not count it as current test coverage or reuse its ID.
- **EX-03 (Step 3 — Any):** Dependency fails or the remote commit outcome is unknown → Return explicit failure/pending. A failed transaction leaves no partial pointer/version change; an unknown remote outcome blocks affected protected handoffs until authoritative reconciliation. Retry only with the same scoped key; never assume timeout means rollback.
- **EX-04 (Citation on unavailable version, FR-61):** Exact evidence is deleted or no longer available → Return specific Unavailable only for a caller entitled to surviving identity, otherwise the same generic response as an unknown resource. Do not substitute another version. Archival alone does not make retained, authorised historical evidence unavailable.
- **EX-05 (Step 2 — Revise):** Expected revision is stale → Return conflict without overwriting the current pointer or creating a replacement; refresh only permitted state before a new author decision.
- **EX-06 (Retry after uncertain result):** The same scoped idempotency key and request are replayed → Reconcile the original result without adding another version. A reused key with different input is rejected.

### Business Rules

- **BR-05:** Every revision creates a new immutable version; prior version content and citation locators are never overwritten.
- **BR-07:** Ordinary retrieval uses permitted Current versions only; Superseded and Archived require deliberate labelled history. Product Draft does not exist (ADR-0009).
- **BR-12:** Citation identity is document/version/passage; unavailable evidence is reported without substitution (FR-61).
- **OD-04 (partly resolved):** Initial authority and immediate revision/retirement transitions are confirmed in ADR-0007/0009. ADR-0013 confirms current membership and retained document-read policy for unavailable identity inspection; audit capability and old citation possession are insufficient. Physical retention remains open.

**Success postcondition:** Two successive revisions leave exactly one Current and preserve the first exact citation unchanged and labelled Superseded. No publish action is needed.
**Failure postcondition:** No unauthorised output or write; safe partial state, if any, is labelled pending and retryable.

---

## UC-08 — Find linked knowledge without AI

**Purpose:** Address scattered context with explicit links and an AI-independent keyword path.  
**Actor:** Authorised member.  
**Supporting system:** None required outside product.  
**Trace:** FR-16, FR-17, FR-18, FR-20, FR-34, FR-49, FR-59, FR-63; BR-06, BR-10, BR-07, BR-13, BR-01; SC-01, SC-04, SC-08.  
**Trigger:** Authorised member submits a keyword search query with project/document scope; OR submits an add-relationship or remove-relationship request between two resources; OR browses related-resource links on a task/document; OR views search readiness status.  
**Precondition:** Valid session; requester holds member access within the project; for relationship creation, requester must have authority over both endpoints.

### Main Success Scenario — Keyword search

1. **Member** submits keyword search request with query terms and project/document scope.
2. **System** validates: session and project membership confirmed; access-check service is available (FR-20).
3. **System** runs keyword match over Current permitted versions only (FR-18, FR-19); excludes Superseded, Archived and documents the requester cannot access. Product Draft does not exist.
4. **System** returns ranked results; each result displays source title, version identity, and validity status (FR-63, AC-63).
5. **Member** receives result list. Restricted-document matches are absent from the results without revealing their existence (FR-59).

### Main Success Scenario — Create explicit relationship (FR-16)

1. **Member** submits create-relationship request specifying source resource ID, relationship type, and target resource ID.
2. **System** validates: both endpoints exist; requester has access to both; no unconfirmed AI-suggested link is treated as an established relationship (AC-16).
3. **System** persists the explicit relationship bidirectionally with actor and timestamp.
4. **System** records audit event: relationship-create, actor, source ID, target ID, time (FR-31).
5. **Member** receives relationship ID and confirmation; relationship appears from both resource perspectives.

### Alternate Flows

- **Alt-1 (Step 4 — Keyword):** Query returns zero permitted matches → System returns empty result set with success status; no restricted match is revealed (FR-59).
- **Alt-2 (Step 1 — Remove relationship, FR-49):** Member submits remove-relationship request → System validates access; removes the relationship from both resource perspectives; both resources remain (AC-49). Audit event recorded. *(P1)*
- **Alt-3 (Step 1 — Browse links, FR-17):** Member views related links on a task that includes a restricted target document → System conceals target title/ID/snippet and hidden-link count; accessible links display normally; guessed reads for the hidden target follow FR-59 (AC-17). *(P1)*
- **Alt-5 (FR-70 - Task keyword search, optional Should):** Member selects Tasks and submits a nonempty keyword; Workspace checks current project membership, searches committed title/description, and returns only scoped task identities/content/state with cursor navigation. Empty matches succeed; blank query fails validation; denied/unknown project is generic. Task search continues during AI or Knowledge outage if Workspace dependencies are healthy (ADR-0016).
- **Alt-4 (Step 1 — Readiness, FR-15):** Member views search readiness for a new or revised version → System returns pending/ready/failed status; pending or failed semantic processing is not labelled ready for semantic search; keyword availability is reported independently for committed, permitted, current passages (AC-15). *(P1)*

### Exception Flows

- **EX-01 (Step 2 — Keyword):** Access-check service fails during retrieval → System returns access-check-failed error; no results returned; no unrestricted retry (FR-20, AC-20).
- **EX-02 (Step 2 — Relationship create):** Requester does not have access to one or both endpoint resources → System denies with forbidden or FR-59-equivalent; no relationship created.
- **EX-03 (Step 3 — Keyword):** Retrieval index includes a version that has since been revoked or archived → Access check at retrieval time excludes the revoked/archived content; stale index entries do not produce results the requester cannot access.

### Business Rules

- **BR-06:** Only explicitly confirmed relationships are shown; no AI-inferred or auto-suggested links are surfaced as established (AC-16).
- **BR-07:** Keyword retrieval operates on Current permitted versions only; Superseded and Archived are excluded from ordinary scope (FR-18, FR-19).
- **BR-13 / SC-08:** Keyword search must remain available when generation or semantic retrieval fails (FR-34).

**Success postcondition:** Link views conceal inaccessible target metadata and hidden counts (AC-17).  
**Failure postcondition:** No unauthorised output or write; safe partial state, if any, is labelled pending and retryable.

---

## UC-09 — Answer a question with exact accessible evidence

**Purpose:** Answer an English question with exact citations or explicit insufficiency/conflict/failure.  
**Actor:** Authorised member.  
**Supporting system:** Configured AI provider (embedding model and generation model; OD-06 pending).  
**Trace:** FR-21, FR-22, FR-23, FR-24, FR-28, FR-29, FR-30, FR-46, FR-53, FR-54, FR-55, FR-60, FR-69; BR-08, BR-10, BR-12, BR-07, BR-13; SC-02, SC-06, SC-07, SC-08.  
**Trigger:** Authorised member submits an English natural-language question with a project/document scope selector.  
**Precondition:** Valid session; requester has project membership; AI provider is available; scope selects at least one accessible document.

### Main Success Scenario

1. **Member** submits question (English string, max length per NFR) with project/document scope.
2. **System** validates: session and project membership confirmed (FR-01, FR-03).
3. **System** runs semantic passage retrieval (FR-53): generates query embedding; ranks passages from permitted Current versions only (FR-19); excludes Superseded, Archived and documents the requester cannot read.
4. **System** validates current access for each candidate passage immediately before submission (FR-28, AC-28): removes any passage whose grant has since been revoked. Access-check failure at this boundary halts submission.
5. **System** durably records the run ID and immutable per-handoff manifest outside the guard, then acquires the guard and matches current full evidence/revisions and frozen payload before submitting permitted evidence passages and the question to the AI model; model context contains only the permitted passages (FR-21, AC-21). Retrieved text cannot change the model's read-only authority (FR-30, AC-30).
6. **Model** returns a candidate answer with references to retrieved passage identities.
7. **System** validates each citation identity returned by the model (FR-60, AC-60): rejects any invented or nonexistent document/version/passage ID.
8. **System** validates current access and availability for the entire evidence set, including uncited model context, before delivery (FR-29, AC-29). If any source was revoked, the entire original draft is withheld; only a new bounded attempt using permitted evidence may deliver. Persist a fresh complete manifest outside the guard for each answer handoff, then reacquire the guard and match full evidence/revisions and frozen payload. Any mismatch sends no bytes: release the guard and start a bounded new attempt with a fresh manifest; revoked/invalid evidence still withholds the whole original draft (FR-57, ADR-0012).
9. **System** delivers a checked `answered` or `partially_answered` outcome. Fact cites supporting passages; Synthesis cites contributing passages. For `partially_answered`, include supported cited claims and explicit `missing_components` without hidden-source hints. With no supported component, return `insufficient_evidence` (FR-23/24, ADR-0015). Each citation binds document, version and passage.
10. **System** correlates optional trace metrics and validation outcomes with the durable run/evidence records already written before provider input and each answer handoff (FR-57); missing optional metrics are labelled unavailable.
11. **Member** receives labelled answer with citation links; each link opens the exact cited passage with the exact version (FR-46, AC-46). SC-02 journey is satisfied.

### Alternate Flows

- **Alt-3a (Step 3):** Semantic retrieval returns zero permitted passages → System skips model call; returns "Insufficient evidence" immediately without generating any text (FR-23, AC-23). SC-07 journey is satisfied.
- **Alt-5a (Step 5/6):** Two accessible passages explicitly disagree on a claim → Model returns both conflicting statements; System surfaces both source versions and the conflict without suppressing either or resolving it unilaterally (FR-54, AC-54).
- **Alt-4a (Step 4):** All candidates are revoked during access validation; zero passages remain → System halts; returns "Insufficient evidence" rather than calling the model with empty context (FR-28 boundary).
- **Alt-6a (Step 6/7):** Model output references an identity that was not in the retrieved set (invented citation) → System withholds that draft and records validation failure. It may deliver only a new bounded attempt after checking its claims against permitted evidence, exact citation binding, current access and durable provenance again. Removing the invalid citation alone does not make the original draft deliverable. If no validated replacement can be delivered, return ADR-0013's generic AnswerWithheld response (FR-22, FR-60; owner-confirmed clarification).

### Exception Flows

- **EX-01 (Step 4):** Access-check service is unavailable → System stops; returns access-check-failed error; no evidence submitted to model; no result delivered; run recorded with error (FR-20, AC-20).
- **EX-02 (Step 8):** Any source in the evidence set is revoked between retrieval and delivery → System withholds entire draft answer; records revocation event in trace; member receives the generic "Unable to provide this answer" message without source identity, citation or detailed cause (ADR-0013); no part of the original draft is delivered (FR-29, AC-29).
- **EX-03 (Step 5):** Retrieved content contains prompt-injection instructions to mutate work or reveal restricted sources → System makes no mutation; does not disclose any restricted source; model-context submission boundary is enforced (FR-30, AC-30).
- **EX-04 (Step 3):** Embedding or semantic retrieval service fails → EX-AI-FAIL: System falls back to explicit failure state per UC-12 / FR-69; keyword search remains available (FR-34).
- **EX-05 (Step 5):** AI generation service returns an error or times out → System returns explicit AI-failure response (FR-69) with failure category; no generated text delivered; run recorded with error.

### Business Rules

- **BR-08:** Citations are assigned only from retrieved evidence records; invented IDs are rejected at FR-60 boundary (AC-22, AC-60).
- **BR-10:** Access validated twice: at context-submission boundary (FR-28) and at delivery boundary (FR-29); both boundaries are independently enforced.
- **BR-12:** Citation identity is document/version/passage; validated before release; unavailable evidence reported without substitution.
- **BR-13 / SC-08:** AI failure returns an explicit failure state, not generated content (FR-69); keyword search operates independently (FR-34).
- **SC-02:** Ask why JWT was chosen → inspect recorded rationale and exact version and passage.
- **SC-07:** An unrecorded decision → system returns Insufficient evidence (FR-23); no invented rationale.

**Success postcondition:** Semantic paraphrase retrieval finds a permitted reference passage; generation never receives a restricted-to-user candidate (AC-53).  
**Failure postcondition:** No unauthorised output or write; safe partial state, if any, is labelled pending and retryable.

---

## UC-10 — Answer a current work-state question

**Purpose:** Report current blockers from operational observations rather than historical text.  
**Actor:** Authorised member.  
**Supporting system:** Configured AI provider.  
**Trace:** FR-25, FR-26; BR-09, BR-10; SC-03.  
**Trigger:** Authorised member submits an English question about current work state (e.g., "Which tasks are currently blocked in Sprint X?") with project scope.  
**Precondition:** Valid session; requester has project membership; AI provider is available; operational work records are accessible.

### Main Success Scenario

1. **Member** submits current-state question with project scope.
2. **System** validates: session and project membership confirmed.
3. **System** queries operational work records (not historical document text) for tasks in scope: derives Blocked status from the **latest** blocker event per task (ASM-07, FR-25).
4. **System** applies access check: includes only tasks and links the requester has permission to see (FR-26, AC-26).
5. **System** synthesises a response from the operational observations; includes entity IDs, Blocked status, and observation time/version for each referenced item (AC-25).
6. **System** delivers response with permitted task references and status labels.
7. **System** records execution trace (FR-57).
8. **Member** receives response; SC-03 journey is satisfied.

### Alternate Flows

- **Alt-1 (Step 3):** No tasks in scope are currently blocked → System returns an empty-blocked-list response with success status; no error.
- **Alt-2 (Step 3):** A task has a Resolved operational event overriding an old document saying "blocked" → System reports the task as Not Blocked, referencing the Resolved event with its timestamp (AC-25); the old document text is irrelevant.

### Exception Flows

- **EX-01 (Step 4):** Access check fails for a subset of tasks → System includes only tasks for which access is confirmed; denied tasks are not revealed in counts or lists (FR-26, FR-59).
- **EX-02 (Step 5):** AI provider fails during synthesis → System returns explicit AI-failure response (FR-69) with failure category; work operations remain available (FR-33).

### Business Rules

- **BR-09:** Current work-state answers use operational observations (Blocked from latest event), not historical text; plan events are not presented as completed resolutions.
- **BR-10:** Operational answer links include only readable entities for the requester; no cross-project data leaks.
- **ASM-07:** Blocked status is derived from the most recent blocker event (Open → Blocked; Resolved → Not Blocked).
- **SC-03:** Ask for blocked tasks → result uses operational state; resolves discrepancy between an old document and current state.

**Success postcondition:** A resolved operational item contradicting an old blocked document is reported resolved (AC-25).  
**Failure postcondition:** No unauthorised output or write; safe partial state, if any, is labelled pending and retryable.

---

## UC-11 — Capture business audit and answer provenance

**Purpose:** Record trustworthy change/run receipts from the first operation, independently of inspection UI.  
**Actor:** System (triggered internally by committed mutations and answer attempts). Scoped human inspectors access via UC-13.  
**Supporting system:** None required outside product.  
**Trace:** FR-31, FR-32, FR-57; BR-11, BR-12; SC-02, SC-06.  
**Trigger:** Any committed mutation (project/membership/work/knowledge/relationship change per audit catalogue) or any answer attempt (success or failure) triggers internal audit/trace capture.  
**Precondition:** A committed change or answer attempt has just completed or failed.

> **Relationship note:** UC-11 capture is a mandatory include of every committed mutation/answer case (UC-02 through UC-10, UC-12). In a UML include diagram, base cases → UC-11 (`<<include>>`). Authentication (UC-01) is a precondition, not a forced include.

### Main Success Scenario — Business audit event (FR-31)

1. **System** prepares a change in an audit catalogue domain (project/access, work, knowledge, relationships).
2. **System** persists the audit event or durable pending audit record in the same owning-service transaction as the business state: actor ID, action, entity ID(s), time and before/after values or protected references. Commit succeeds only with this minimum record; asynchronous sink delivery may follow.
3. **System** assigns the event a stable event ID and marks it immutable; no subsequent update removes or modifies committed events.
4. The event is available for scoped inspection by an Audit Inspector (UC-13; FR-56).

### Main Success Scenario — Answer execution trace (FR-32, FR-57)

1. **System** begins an answer attempt (from UC-09 or UC-10), durably records its run ID and a complete immutable manifest outside the guard for each provider/answer handoff. Acquire the guard only after durable acknowledgement, then match the entire evidence set, recorded revisions and frozen payload before sending; mismatch aborts with zero bytes and a bounded fresh manifest/attempt outside the guard. Failure to persist mandatory records stops the corresponding handoff (ADR-0012).
2. **System** appends each tool step, source IDs, model/configuration, duration, usage, and error/validation outcomes to the run record as they occur.
3. On attempt completion (success or failure), **System** closes and persists the run record; correlation links the run ID to its business context.
4. No private model reasoning is stored (NFR-05); run records contain only tool steps, source IDs, and outcomes.
5. The record is available for scoped inspection by an Execution Inspector (UC-13; FR-58).

### Alternate Flows

- **Alt-1:** Audit catalogue operation fails → No committed event is recorded for a failed write (BR-11); failed change produces no audit event (AC-31).

### Exception Flows

- **EX-01 (Step 2 — Audit event):** Minimum audit/pending-record persistence fails → Roll back the owning business transaction. If only later sink delivery fails, keep the committed result and durable pending record, report delivery failure and retry idempotently; do not falsely label the business mutation uncommitted.
- **EX-02 (Step 2 — Trace):** Mandatory run/evidence persistence fails → Withhold protected provider/answer handoff and report explicit failure. Optional metric recording alone may fail without stopping an otherwise valid answer; mark the field/run diagnostics incomplete. Never treat missing evidence or an unknown permission check as an optional metric.

### Business Rules

- **BR-11:** Audit events are created only for committed changes; failed writes produce no committed audit event.
- **BR-12:** Every answer attempt has an execution record with its run ID; correlation links attempt, trace, and evidence identities (FR-32, AC-32).
- **NFR-05:** Logs and traces minimise source content and exclude secrets and private model reasoning.

**Success postcondition:** Each committed catalogue mutation records actor/action/entity/time and protected before/after references; failed writes are not committed events.  
**Failure postcondition:** No unauthorised output or write; safe partial state, if any, is labelled pending and retryable.

---

## UC-12 — Continue work during AI failure

**Purpose:** Produce measured retrieval, citation and fallback evidence; ensure core work/document/keyword operations survive AI provider unavailability.  
**Actor:** Authorised member.  
**Supporting system:** Configured AI provider (expected to be unavailable in this scenario).  
**Trace:** FR-33, FR-34, FR-69; BR-13; SC-08.  
**Trigger:** Authorised member submits any request (work operation, document read, keyword search, or AI question) while the AI provider is in one of the three failure modes: connection failure, timeout, or exhausted AI usage budget (ASM-08, AC-33).  
**Precondition:** Valid session; work/document/identity subsystems are healthy; AI provider is unavailable.

### Main Success Scenario — Work/document operation during AI failure

1. **Member** submits a non-AI operation: create/edit a Backlog item, change board state, start or complete a Sprint, or open a permitted document.
2. **System** detects AI provider is unavailable (injected failure mode: connection, timeout, or budget exhaustion).
3. **System** routes the request through the work/document subsystem only; does not attempt to invoke the AI provider.
4. **System** completes the operation normally: persists the change, records the audit event (UC-11), and returns success.
5. **Member** receives the operation result; a fresh read by another member confirms the committed state (AC-33).

### Main Success Scenario — Keyword search during AI failure

1. **Member** submits keyword search request.
2. **System** detects AI provider is unavailable.
3. **System** executes keyword match directly without invoking the embedding or generation service (FR-34, AC-34).
4. **Member** receives keyword search results from permitted Current sources, identical to the result in a healthy AI state.

### Alternate Flows

- **Alt-1:** Member submits an AI question during AI failure → Exception flow EX-01 applies.
- **Alt-2:** Member opens a previously-cited passage during AI failure → Citation opens from storage without AI, with session, project/document access, exact version validation and guarded protected handoff (FR-55, ADR-0011).

### Exception Flows

- **EX-01 (AI question during failure):** Member submits a natural-language question when AI provider is unavailable → System returns an explicit failure response naming the failure category (connection failure/timeout/budget exhausted); response contains no generated text; run is recorded with the error and failure category (FR-69, AC-69). Keyword search remains available to the member.
- **EX-02 (Partial AI degradation):** Embedding service is unavailable but generation is not (or vice versa) → System treats either required AI dependency as a failure for question-answering; returns EX-01 response; work and keyword operations proceed normally.
- **EX-03 (Work/document dependency fails independently):** Work or document storage fails while AI is also unavailable → The work/document failure follows NFR-03 (explicit failed/pending state); AI failure does not cause work failure and vice versa; failure states are reported independently.

### Business Rules

- **BR-13:** Core work operations (Backlog create/edit, board state, Sprint start/complete), permitted document reading, and keyword search must remain independently available under each of the three AI failure modes (AC-33).
- **ASM-08:** AI budget exhaustion is treated as an AI-unavailable state, not a silent error; the failure category is named in the response (FR-69).
- **SC-08:** AI failure leaves work/document/keyword operations usable; questions return an explicit failure (AC-33, AC-69, AC-34).

**Success postcondition:** In every AC-33 failure mode, independent work/document operations succeed under healthy own dependencies.  
**Failure postcondition:** No unauthorised output or write; safe partial state, if any, is labelled pending and retryable.

---

## UC-13 — Inspect scoped audit and answer evidence

**Purpose:** Let permitted users inspect recorded changes/retrieval while enforcing current source and log scope.  
**Actor:** Scoped audit inspector (FR-56) or scoped execution inspector (FR-58).  
**Supporting system:** None required outside product.  
**Trace:** FR-27, FR-56, FR-58; BR-12, BR-10, BR-11; SC-02, SC-06.  
**Trigger:** Audit inspector submits an audit-read request with scope parameters (project ID, event type, time range); OR execution inspector submits a trace-read request with run ID or scope parameters.  
**Precondition:** Valid session; requester holds the relevant scoped capability (audit-read or trace-read); target scope is within the granted boundary.

### Main Success Scenario — Audit inspection (FR-56)

1. **Audit inspector** submits audit-read request with project scope, event type filter, and time range.
2. **System** validates: session valid; requester holds audit-read capability with a grant covering the requested project scope.
3. **System** returns audit events within scope; each event shows actor, action, entity ID, time, and permitted before/after fields.
4. Events from other projects, or fields requiring document-level access the inspector lacks, are denied/redacted without revealing protected content (AC-56).
5. **Audit inspector** receives scoped audit event list.

### Main Success Scenario — Execution trace inspection (FR-58)

1. **Execution inspector** submits trace-read request with run ID or scope parameters.
2. **System** validates: session valid; requester holds trace-read capability for the run or scope.
3. **System** returns permitted trace fields: query, tool steps, source IDs, model/config, duration, usage, error/validation outcomes for the run (AC-58).
4. Source document content and metadata require separate document-level access; the trace alone does not grant it (AC-58).
5. **Execution inspector** receives the permitted trace record.

### Alternate Flows

- **Alt-1 (FR-27 — Bounded retrieval summary):** Answer reader submits bounded-summary request with run ID → System returns retrieval mode, ranked permitted source/version/passage IDs, operational observation time, and citation-validation outcomes; denied sources are omitted; absent steps show "Not performed" (AC-27). *(P1)*

### Exception Flows

- **EX-01 (Step 2 — Audit):** Inspector requests audit events for a project outside their scoped grant → System denies with FR-59-equivalent response; no metadata about the other project is disclosed.
- **EX-02 (Step 3 — Audit):** Event references a restricted document the inspector cannot read → With current project membership and scoped audit-read, return the in-scope actor/action/entity identity/time, while redacting protected content/title/before-after fields. This explicit identity entitlement grants no direct document/citation/retrieval/AI access and is not inherited by trace-read alone (AC-56, ADR-0012).
- **EX-03 (Step 4 — Trace):** Inspector attempts to read full document content via source IDs in the trace → System serves only document-level access if the inspector also has document-read permission; trace IDs alone confer no document-read authority (AC-58).

### Business Rules

- **BR-10:** Audit and trace inspection is scoped; no blanket document-content access is granted by audit-read or trace-read capability.
- **BR-11:** Audit scope covers only committed events; no private model reasoning is stored (NFR-05).
- **BR-12:** Source details in traces require separate source access; execution records do not grant content access.
- **OD-08 (open):** Who grants audit-read and trace-read capabilities and to which users/roles is unresolved.

**Success postcondition:** Audit/trace capability is scoped and gives no blanket document-content access.  
**Failure postcondition:** No unauthorised output or write; safe partial state, if any, is labelled pending and retryable.

---

## Relationships, checklist and handoff

### UML Relationship Specification (for Stage 7 diagramming)

**System Boundary:** "Scrum Workspace + AI Project KMS"

**Actors:**
- Primary (left): User, Authorised Member, Project Administrator / Membership Manager, Product Owner, Work Operator, Sprint Manager, Content Author, Lifecycle Manager, Document Access Manager, Audit / Execution Inspector
- Secondary (right): Identity Provider, AI Model API (generation), Embedding Service
- Actor generalisation: Authorised Member is a specialisation of User. Project Administrator / Membership Manager, Product Owner, Work Operator, Sprint Manager, Content Author, Lifecycle Manager, Document Access Manager and Audit / Execution Inspector are scoped-capability specialisations of Authorised Member; use a solid hollow-triangle arrow. Because specialisations inherit the parent's associations, Authorised Member is associated only with use cases open to every authorised member (UC-08, UC-09, UC-10, UC-12; mutation branches still require their own capability); capability-gated cases (UC-02, UC-03, UC-04, UC-07, UC-13) are associated only with their scoped actors (BR-01, BR-02, BR-10).

**Associations (solid lines, no arrowhead):**
- User ↔ UC-01
- Authorised Member ↔ UC-08, UC-09, UC-10, UC-12
- Work Operator ↔ UC-04 (check the capability for each requested mutation; membership alone is insufficient)
- Project Administrator / Membership Manager ↔ UC-02
- Product Owner ↔ UC-03
- Sprint Manager ↔ UC-05
- Content Author ↔ UC-06, UC-07
- Lifecycle Manager ↔ UC-07
- Document Access Manager ↔ UC-06
- Audit / Execution Inspector ↔ UC-13
- Identity Provider ↔ UC-01 (conditional external integration; local/external identity choice remains open)
- AI Model API ↔ UC-09, UC-10, UC-12
- Embedding Service ↔ UC-09, UC-12

**Include relationships (`<<include>>`, dashed arrow Base → Included):**
- UC-02 → UC-11 (every committed membership/project mutation records audit)
- UC-03 → UC-11
- UC-04 → UC-11
- UC-05 → UC-11
- UC-06 → UC-11
- UC-07 → UC-11
- UC-08 relationship create/remove branches require UC-11 audit. No unconditional include arrow is drawn from the broad search/navigation use case.
- UC-09 → UC-11
- UC-10 → UC-11
- UC-12 mutation branches still require UC-11 audit. No unconditional include arrow is drawn for simply continuing a read during an outage.

**Extend relationships:** N/A — no confirmed optional/conditional extension use cases identified within MVP scope.

**Generalisation:** N/A for use-case generalisation at this time; actor generalisation as noted above.

**Editable diagram:** `docs/sdlc/diagrams/use-case/use-case-diagram.drawio` (paired Mermaid representation: `docs/sdlc/diagrams/use-case/use-case-diagram.mmd`) — v0.5 diagram correction adds Work Operator, qualifies optional external identity, and removes unconditional audit includes from UC-08/12. Branch-specific audit remains mandatory in the textual flows. See the 17 October diagram report for author verification; independent approval remains pending.

### Checklist result (26-point UML 2.0 Benchmark)

| Check | Result | Notes |
| --- | --- | --- |
| 1 · Use Case ID | Pass | UC-01–UC-13, Artifact UC-02 |
| 2 · Use Case Name | Pass | Active verb phrases throughout |
| 3 · Description/Purpose | Pass | One-to-two sentence Purpose per UC |
| 4 · Version & Date | Pass | 0.3 Draft · 14 October 2026 |
| 5 · Author & Stakeholders | Pass | Development agent; owner reviews |
| 6 · Status | Pass | Draft for owner review |
| 7 · Primary Actor | Pass | Named per UC |
| 8 · Secondary Actors | Pass | Identity/AI providers named where applicable |
| 9 · System Boundary | Pass (text) / Gap (diagram) | Text boundary in header; .drawio file created in v0.2 |
| 10 · Trigger | Pass | Specific per-UC trigger replacing boilerplate |
| 11 · Pre-conditions | Pass | Session, capability, resource stated per UC |
| 12 · Post-conditions (Success) | Pass | Specific outcome per UC |
| 13 · Post-conditions (Failure) | Pass | Safe partial-state rule stated per UC |
| 14 · Main Success Scenario | Pass | Numbered steps per sub-goal; action/response format |
| 15 · Action/Response Format | Pass | Actor vs System clearly distinguished per step |
| 16 · Alternate Flows | Pass | Named Alt-* flows with branch step references |
| 17 · Exception Flows | Pass | Named EX-* flows with condition and system response |
| 18 · Flow References | Pass | Branch step numbers cited in all Alt/EX entries |
| 19 · Association | Pass | Actor–UC pairs listed in relationship spec above |
| 20 · Include (`<<include>>`) | Pass (text) | UC→UC-11 include list; in diagram |
| 21 · Extend (`<<extend>>`) | N/A | No confirmed optional extension goal in MVP |
| 22 · Generalisation | N/A (actor) | Actor generalisation specified; UC generalisation N/A |
| 23 · Business Rules | Pass | Inline Business Rules section per UC |
| 24 · Non-Functional Reqs | Gap | NFR-01–NFR-09 traced via FR/BR; not repeated inline per UC to avoid duplication of PRD §6 |
| 25 · Data Requirements | Gap | Key input/output fields noted in Trigger and flow steps; full data contracts deferred to Stage 5 (api-design.md) |
| 26 · Quality Check | Pass | No UI layout specifics; no storage technology; assumptions and ODs remain in PRD |

**Overall result:** 22 Pass / 2 Gap / 2 N/A. Gap-24 and Gap-25 are non-blocking for Stage 3/4; full data contracts belong to Stage 5.

### Handoff

The v0.3 correction applies ADR-0007–ADR-0011 and the direct board-transition/reopening clarification. UC-07 Alt-2/EX-02 remain explicitly Withdrawn for trace continuity; new UC-06 EX-05/06 and UC-07 EX-05/06 need Stage 8 mapping. The historical checklist above is not a fresh full-set sign-off. Use-case diagram actor/UC-07 labels are corrected; remaining downstream trace/checklist work stays open. No runtime behaviour is claimed from these flows.

**Handoff state:** Ready for downstream correction with explicit gaps. Additional non-read capability delegation, physical retention and fenced orphan cleanup remain open. ADR-0013 resolves unavailable citation entitlement and generic terminal withholding. FR-35 remains outside this release under ADR-0010; no new Must deferral is implied.

### UC-09 change record - 16 October 2026

Main step 9 now contains the ADR-0015 partial-answer outcome; invalid or revoked drafts retain whole-draft withholding.

### UC-02 change record - 16 October 2026

Removal, rejoin and last-manager checks now appear in the main/exception flows. UC-04 assignment must recheck membership under the same serialization boundary.
