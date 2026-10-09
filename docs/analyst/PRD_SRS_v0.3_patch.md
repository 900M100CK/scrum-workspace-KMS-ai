# PRD/SRS v0.2 → v0.3 patch list

Apply in order. Each item has: **Where**, **Replace**, **With**. Items marked *(proposed)* are policy choices that need owner confirmation; keep them tied to the named OD.

After applying, re-run the consistency checks (unique FR/AC IDs, P0/P1/P2 counts, row-level vs reverse BR map, D0a/D0b lists ⊆ P0, no undefined FR references) and update the counts in §10.

---

## A. Permission and lifecycle defects

### A1. Membership removal must invalidate grants *(proposed, OD-02)*

**Where:** §2, paragraph starting "Draft document classification".

**Replace:**
```text
Removing membership ends effective document access even if a prior grant remains recorded.
```

**With:**
```text
Removing a member invalidates that member's document-read grants in the project. Re-adding the member restores project-shared access only; restricted documents require new explicit grants.
```

**Where:** FR-38 and FR-39 acceptance criteria.

**AC-38 — append:**
```text
A restricted-document grant held before a previous removal is not restored.
```

**AC-39 — replace** `then subsequent project/document/retrieval/citation reads are denied.` **with:**
```text
then subsequent project/document/retrieval/citation reads are denied, and re-adding the member does not restore that grant.
```

### A2. AC-29 must not assume claim-level source tracking

**Where:** FR-29, AC-29.

**Replace:**
```text
AC-29: Given generation paused before delivery, when a supporting source is revoked before delivery resumes, then no text supported by that source is delivered. Repeating a question/source read cannot reuse restricted output. No saved-answer/history/preview creation feature is implied.
```

**With:**
```text
AC-29: Given generation paused before delivery, when a source in the answer's evidence set is revoked before delivery resumes, then the draft answer is withheld, or regenerated only from remaining permitted evidence; no text from the original draft is delivered. Repeating a question or source read cannot reuse restricted output.
```

Rationale: the system cannot know which sentences depend on which source, and model output may carry information from context that it did not cite. Withholding the whole draft is the only verifiable behaviour. The "no saved-answer feature" note already lives in ASM-04.

### A3. Add an unpublished (Draft) version state *(proposed, OD-04)*

**Where:** §2, definitions paragraph.

**Replace:**
```text
Current means applicable to ordinary retrieval; Superseded and Archived mean noncurrent.
```

**With:**
```text
Current means applicable to ordinary retrieval; Superseded and Archived mean noncurrent. Draft means a revision not yet designated Current; it is excluded from ordinary retrieval, historical retrieval and model context, and is readable only by users with content-write access to the document.
```

**FR-10, AC-10 — append:**
```text
The initial version is created Current.
```

**FR-11, AC-11 — replace** `the new version has a distinct identity.` **with:**
```text
the new version has a distinct identity and state Draft until FR-45 designates it Current.
```

**FR-12, AC-12 — replace** `Given Current, Superseded and Archived fixtures` **with:** `Given Current, Draft, Superseded and Archived fixtures`.

**FR-19, AC-19 — replace** `only current eligible versions are candidates` **with:** `only Current eligible versions are candidates; Draft, Superseded and Archived versions are not`.

**OD-04 — append:** `State set (Draft/Current/Superseded/Archived) and allowed transitions.`

### A4. Resolve FR-10 vs FR-50 classification authority *(proposed, OD-02)*

**Where:** FR-10, AC-10.

**Replace:**
```text
missing classification cannot implicitly publish content.
```

**With:**
```text
the author may set project-shared or restricted for a document they create; omitting classification rejects creation. Changing classification later requires FR-50.
```

Alternative if the owner wants stricter separation: creation always yields `restricted` with no grants, and only FR-50 can open it to the project.

---

## B. Ambiguities

### B1. One Active Sprint per project *(proposed, OD-03)*

**ASM-02 — append:**
```text
At most one Sprint per project is Active.
```

**FR-08, AC-08 — append:**
```text
Starting a Sprint while another Sprint in the same project is Active is rejected.
```

**FR-07, AC-07 — replace** `assignment to another active Sprint is rejected under ASM-02.` **with:**
```text
an item already allocated to a Planned or Active Sprint cannot be added to a second Sprint.
```

### B2. Define how "blocked" is derived

**§9 — add row:**
```text
| ASM-07 | A work item is Blocked when its most recent blocker event is Open; a later Resolved event ends the block. | Confirm OD-03. |
```

**FR-44, AC-44 — append:**
```text
Given an Open event followed by a Resolved event, the item is not Blocked; given Resolved followed by Open, it is.
```

### B3. Define the AI usage budget

**§9 — add row:**
```text
| ASM-08 | AI budget is an operator-configured usage limit (calls or tokens per period) whose exhaustion produces an explicit AI-unavailable state. | Limits and scope are OD-06. |
```

**OD-06 — append:** `AI usage budget definition and limits.`

**AC-33 — replace** `exhausted budget` **with:** `exhausted AI usage budget (ASM-08)`.

---

## C. Delivery plan

### C1. Split D0 into D0a and D0b

**Where:** §1 increment table and the paragraph beginning "D0 requires".

**Replace the D0 row with:**
```text
| D0a — access foundation | Two pre-provisioned accounts: sign in; create a project; add the second account; create a task and an English Markdown decision; classify it restricted; grant, then revoke read access; keyword search and direct reads before/after each step, including generic not-found for the revoked reader (FR-59); audit events captured. |
| D0b — evidence-backed AI | Requires the embedding/generation choice recorded as an ADR (OD-06). Semantic retrieval; ask SC-02 and open the exact citation; explicit conflicting-source case and SC-07; revoke and repeat search, question and direct citation reads; force AI outage and continue work/search; execution and source IDs captured. |
```

**Replace the "D0 requires" paragraph with:**
```text
D0a requires FR-01–FR-05, FR-09, FR-10, FR-14, FR-18, FR-20, FR-31, FR-36–FR-38, FR-40, FR-50–FR-52, FR-59, FR-63, FR-68 (21 FRs). D0b requires FR-21–FR-24, FR-28–FR-30, FR-32–FR-34, FR-46, FR-53–FR-55, FR-57, FR-60, FR-69 (17 FRs). FR-33's Sprint checks complete in D1. FR-14 is exercised for content/search reads in D0a and for answer delivery in D0b. Minimal capture and citation excerpt opening (FR-46) are P0; extended human retrieval inspection (FR-27) is P1.
```

### C2. Record a scope-at-risk order *(proposed, OD-11)*

**Where:** §1, after the increment table.

**Add:**
```text
If capacity falls short, the owner may consider deferring in this order. BRD priorities do not change and each deferral needs explicit owner approval and a recorded effect on the Core gate:
1. FR-35 (already P2).
2. FR-64, FR-65, FR-66, FR-67 (edit conveniences).
3. FR-62 (import).
4. FR-49 (relationship removal).
5. FR-27 (bounded retrieval summary; FR-58 remains).
```

**§11 — add row:**
```text
| OD-11 | Capacity check and descoping order / owner | Estimate D0a and D0b effort before baselining; confirm or reorder the §1 list. |
```

---

## D. Make the requirement rows singular and implementation-free

### D1. Split FR-33

**FR-33 — replace the requirement and AC with:**
```text
| FR-33 | P0 / BR-13 | Core work operations and permitted document reading shall remain available during AI failure. | AC-33: Given healthy identity/work/document dependencies and each injected AI failure mode in {connection failure, timeout, exhausted AI usage budget (ASM-08)}, when a user creates/edits a Backlog item, changes board state, starts or completes a Sprint, or opens a document, then the operation succeeds and a fresh read confirms the result. |
| FR-69 | P0 / BR-13 | An AI question shall return an explicit failure state, not generated content, when the AI dependency fails. | AC-69: Given each failure mode in AC-33, when a question is asked, then the response names the failure category, contains no generated answer, and the run is recorded with the error. |
```

Also: add FR-69 to BR-13 in §8; add `FR-33 → FR-33 work continuity; FR-69 AI failure state` to the split table; update the P0 count (54 → 55) and the FR/AC total (68 → 69).

### D2. Turn FR-31 into a catalogue

**FR-31, AC-31 — replace the AC with:**
```text
AC-31: Given one committed change of each type in the audit catalogue below, when its event is read within FR-56 scope, then actor, action, entity, time and before/after values (or protected references) are present; a failed change produces no committed event.
```

**Add under §4.5:**
```text
| Audit catalogue domain | Event types |
| --- | --- |
| Project and access | project create/edit, member add/remove, classification change, grant, revoke |
| Work | Backlog create/edit/reorder, Sprint create/edit/start/complete, allocation add/remove, board state, assignee, blocker event |
| Knowledge | document create/import, revision, designate Current, metadata edit, archive, delete |
| Relationships | relationship create/remove |
```

### D3. Make FR-59 interface-neutral

**FR-59 requirement — append:** `Where the interface is HTTP, the response is 404.`

**AC-59 — replace** `then both return HTTP 404 with the same generic body/schema` **with:** `then both return the same not-found-equivalent status, body and schema`.

### D4. Move test instructions out of ACs into §7

| AC | Text to remove from the AC | Move to |
| --- | --- | --- |
| AC-14 | `Test prior-result reuse and concurrent revocation at §5 boundaries.` | §7 (already covered; delete the AC copy) |
| AC-24 | `Manual claim scoring follows §7.` | delete |
| AC-35 | `Gap: report types/calculations require an Enhanced decision, outside Core gate.` | §11 as a note on FR-35 |
| AC-53 | `Separately measure top-five discovery… final aggregate thresholds are OD-07. One passing fixture does not establish superiority over keyword retrieval.` | NFR-07 / NFR-09 |
| AC-59 | `Compare response fields; no absolute timing-security claim.` | §7 |
| AC-59 | `Proposed default: ADR-0001/OD-02.` | OD-02 (already present) |

---

## E. Housekeeping

- **Version line:** `0.3 Draft`.
- **§10 rows:** keep "Singular and complete" and "Implementation-free" as **Gap** until D1–D4 are applied, then change to Pass and re-run the consistency checks.
- **v0.3 changes paragraph** (replace the v0.2 one):
```text
v0.3 changes: invalidated grants on membership removal; withheld-answer rule for revocation before delivery; Draft version state; creation-time classification rule; one Active Sprint; blocker derivation; AI budget definition; D0 split into D0a/D0b; descoping order and OD-11; FR-33 split with new FR-69; FR-31 catalogue; interface-neutral FR-59; test instructions moved out of ACs.
```
- **§11 handoff:** unchanged apart from adding OD-11 to the list that needs owner input.
