# Owner decisions and patches: OD-02, OD-03, OD-04, OD-11 + B1

**Prepared:** 13 October 2026
**Applies to:** PRD-01 v0.4 -> v0.5, SAD-03 v0.5 -> v0.6, REG-00 v0.15 -> v0.16
**How to use:** each `ADR-xxxx` section below maps to one file in `docs/adr/`. Section 6 and 7 are patch lists for the PRD and SAD. Section 8 is the check list to run after applying.

**Status rule:** every ADR is written as **Accepted, effective when the owner commits it**. Nothing here is approved until you commit. Items that differ from the existing PRD proposals are marked **CHANGED**. Everything else restates the PRD/SAD proposal so it can be closed.

| ADR | Closes | Source | Change vs. current drafts |
| --- | --- | --- | --- |
| ADR-0007 | OD-02 permissions | PRD ASM-03, ADR-0001 | None (accepts as proposed) + capability defaults |
| ADR-0008 | OD-03 Sprint policy | PRD ASM-02, ASM-07, AC-42 | None (accepts as proposed) |
| ADR-0009 | OD-04 versions and lifecycle | PRD FR-11/12/13/19/45/47/48 | **CHANGED**: remove `Draft` |
| ADR-0010 | OD-11 five-month scope | PLAN-01, release-scope.json | Accepts overlay, adds Week-2 gate |
| ADR-0011 | amends ADR-0002 / ADR-0006 | SAD Flow 2, Flow 3, Flow 4 | **CHANGED**: document creation order, guard-exempt internal reads |

---

## ADR-0007: Document access model (OD-02)

**Status:** Accepted (owner commit)
**Context:** BRD BR-01, BR-10, BR-14 and Business Rules 3 and 6 require access checks before content enters AI context, and revoked content must stop supporting answers. BRD Section 7 states that Scrum roles and Admin do not automatically grant access to restricted content.

**Decision**

1. Two classifications: `project-shared` (any current project member may read) and `restricted` (current membership **and** an explicit read grant).
2. The author sets the classification at creation. Omitting it rejects creation (FR-10). Later changes need `manage-access` (FR-50).
3. Removing a member invalidates all of that member's document-read grants in the project. Re-adding restores `project-shared` access only. Restricted documents need new grants (FR-39, FR-38).
4. Default deny. If an access check is unknown or fails, the request is denied (FR-20).
5. Unauthorised and nonexistent resources return the same not-found-equivalent response. For HTTP: 404 with identical status, body and schema (FR-59).
6. Role names (PO, Scrum Master, Developer, Admin) never grant read access to a restricted document.

**Capability defaults** (editable by owner; the full action-to-role matrix stays in UC-02):

| Capability | Default holder |
| --- | --- |
| `membership-manage` | Project creator / project administrator |
| `content-write` | Document author; others only if explicitly granted |
| `manage-access` | Document author; project administrator **only if** granted on that document |
| `lifecycle-manage` (archive, delete) | Document author |
| `audit-read`, `trace-read` | Explicitly granted per project; source details still need document permission (FR-56, FR-58) |

**Consequences:** UC-02, DATA-04 (`document_acls`, grant invalidation), API-05 (404 shape) may now be baselined. No change to PRD text except marking ASM-03 as accepted.

---

## ADR-0008: Fixed Sprint lifecycle (OD-03)

**Status:** Accepted (owner commit)

**Decision**

1. Sprint states: `Planned -> Active -> Completed`. No configurable workflow.
2. At most **one Active Sprint per project**. Starting a second is rejected (FR-08).
3. A work item belongs to at most one Planned or Active Sprint (FR-07).
4. Completing a Sprint: Done items stay associated with the Sprint; unfinished items return to the Product Backlog and are **not** marked Done (FR-42).
5. Board states: To Do, In Progress, Done. No automatic Scrum Master approval (FR-09).
6. A work item is **Blocked** when its most recent blocker event is `Open`. A later `Resolved` event ends the block (ASM-07, FR-44).

**Consequences:** DATA-04 needs an append-only blocker event table and a derived `is_blocked` read; no stored boolean that can drift. Test SC-03 and AC-44 directly from event order.

```sql
-- Blocked = latest event is Open
SELECT t.id FROM tasks t
JOIN LATERAL (
  SELECT status FROM blocker_events b
  WHERE b.task_id = t.id ORDER BY b.occurred_at DESC, b.id DESC LIMIT 1
) e ON e.status = 'Open'
WHERE t.project_id = $1;
```

---

## ADR-0009: Document versions and lifecycle, no Draft (OD-04) **CHANGED**

**Status:** Accepted (owner commit)
**Context:** BRD BR-05 requires distinguishing versions and current / superseded / archived content. BRD Rule 5 requires a citation to open the exact version it cites, which implies immutable versions. The BRD does not require an unpublished `Draft` state, a publisher role, or Draft-only read access. PRD v0.4 added these (FR-45, parts of FR-11, FR-12, FR-19, FR-47). For one developer in five months they add a state, an authority, an access rule and fixtures with no BRD requirement behind them.

**Decision**

1. Version states: `Current`, `Superseded`, `Archived`. **`Draft` is removed from the MVP.**
2. Each content revision creates a new immutable version that is `Current` immediately. The previous `Current` becomes `Superseded`. Both changes commit in one Knowledge transaction after Workspace validates `content-write` (FR-11).
3. Ordinary retrieval uses `Current` only. Historical retrieval is an explicit scope and labels `Superseded` and `Archived` results (FR-19, FR-47).
4. Archive: `Current` or `Superseded` becomes `Archived`; excluded from ordinary retrieval (FR-13).
5. Delete: active access and new answer support stop at the protected boundary; tombstones exclude stale index entries; physical purge is a retryable job. No retention duration is promised (FR-48). **Physical retention stays open and is not a Core gate.**
6. Citations always carry `[document_id, version_id, passage_id]`. An unavailable cited version returns `Unavailable`, never a newer version (FR-61).

**Not decided here:** review-before-publish workflow. If wanted later, it is an Enhanced feature with its own FR and access rules.

**Consequences**
- FR-45 is **Withdrawn** (keep the ID and a Withdrawn row for ID continuity; do not reuse the number).
- Active FR count becomes 68 (54 P0, 13 P1, 1 P2). Check `release-scope.json`, the context validator and the slice backlog, because they hard-code 69 / 61 / 3 / 4 / 1.
- `Draft` must be removed from the OpenAPI `validity` enum and from the SAD contract invariant 4.
- Draft-related fixtures and tests disappear. Add: "revise twice, the first version is `Superseded` and still opens by exact citation".

---

## ADR-0010: Five-month release scope and capacity gate (OD-11)

**Status:** Accepted (owner commit)

**Decision**

1. Accept the PLAN-01 overlay for this release: **Should** FR-27, FR-49, FR-62; **Could** FR-64, FR-65, FR-66, FR-67; **Won't** FR-35. After ADR-0009 the Must count is 60 (was 61, FR-45 withdrawn). Verify against `release-scope.json`.
2. The BRD is not edited. Deferred FRs are recorded as **Core-gate exceptions** for this release. Effect on the BRD Core scope: text/Markdown **creation** stays; **import** (FR-62) is deferred.
3. Never in the deferral list: permission, version, exact citation, current-state, fallback and evaluation gates (FR-01, 03, 04, 14, 20, 21, 28, 29, 46, 55, 59, 60, 61, 25, 33, 34, 69).
4. **Week-2 capacity gate.** At the end of Week 2 after kickoff, record the number of Must FRs completed with evidence (passing AC, not "code written"). Compute:

```
required_rate = remaining_Must_FRs / weeks_left_before_Month_5
```

   With 60 Must FRs and about 17 weeks before Month 5, the average is about 3.5 FRs per week (an estimate; FRs differ in size, so use slices). If the measured rate is below `required_rate` after Week 2, apply further deferrals **in this order**, each needing a recorded effect on the Core gate:

   1. FR-64, FR-65, FR-66, FR-67 (already Could, simply do not build)
   2. FR-62 (import)
   3. FR-49 (relationship removal)
   4. FR-27 (bounded retrieval summary; FR-58 remains)

5. Month 5 has no new features. Repeat the gate at the end of Month 2 and Month 3.

**Consequences:** PLAN-01 and BACKLOG-01 gain a "gate" row per month. REG-00 logs the recorded rates.

---

## ADR-0011: Document creation order and guard-exempt internal reads (amends ADR-0002, ADR-0006) **CHANGED**

**Status:** Accepted (owner commit)
**Context:** Microservices (2 services) stays as the owner's direction. SAD v0.5 Flow 2 creates a document in four steps across two services (Knowledge allocates ID, Workspace registers pending ACL, Knowledge persists, Workspace activates), and partial failure leaves pending state to clean up. Flows 3 and 4 have Workspace hold the handoff guard while Knowledge calls back Workspace for policy and operational state. SAD v0.5 does not say that those callbacks avoid the guard.

**Decision A: Workspace allocates the ID; no activation step**

1. Workspace allocates `document_id` and commits the ACL record (classification, `acl_version`, author) in its own transaction.
2. The Gateway then calls Knowledge to persist the first `Current` version, **idempotent on `document_id`** and the client idempotency key.
3. A document is readable only when Knowledge holds a version for it. A Workspace ACL row without Knowledge content leaks nothing: reads return the generic not-found response (FR-59).
4. If step 2 fails or times out, the client retries with the same key. A sweep job removes ACL rows older than a configured age that never gained content.
5. `workspace_audit_events` and `knowledge_audit_events` stay separate and are correlated by `document_id` and run ID.

**Decision B: internal read endpoints never take the guard**

1. `/internal/policy/*` and `/internal/state/*` are read-only, read committed data, and **do not acquire the project guard**.
2. The guard is taken only (a) by mutations that change permissions or lifecycle and (b) at the two protected handoffs in Flow 4 (provider input, response delivery). Inside those handoffs Workspace validates in-process, not by calling its own HTTP endpoints.
3. Correctness: a revocation commits under the guard, so it cannot commit between final validation and handoff completion. Callbacks during a held handoff read the pre-revocation state, which is consistent with that handoff.

```ts
// Gateway: protected provider handoff (sketch)
async function submitToProvider(run: Run) {
  await guard.acquire(run.projectId);            // held through handoff or abort
  try {
    const ok = policy.validateInProcess(run.actor, run.evidenceSet); // no HTTP self-call
    const live = await knowledge.checkVersions(run.evidenceSet, { timeoutMs: cfg.policyTimeoutMs });
    if (!ok || !live) return withhold(run);
    return await provider.send(run.packagedInput); // transport only
  } finally {
    guard.release(run.projectId);
  }
}

// Internal endpoint: never touches `guard`
app.get('/internal/policy/documents/:id', async (req) => {
  return policyRepo.readCommitted(req.actor, req.params.id); // read committed
});
```

**Required tests (add to TEST-08 and the SP-01..SP-04 harness from the start)**
- T-1: with the guard held by a handoff, 10 concurrent internal policy reads complete within `policy_timeout_ms` (no deadlock, no timeout-deny).
- T-2: a revocation attempted while a handoff holds the guard blocks until release or abort, then commits.
- T-3: kill the process between Workspace ACL commit and Knowledge persist; the retry with the same key completes once and creates one version.
- T-4: orphan ACL row without content returns the same response as an unknown ID.

**Not decided (recorded so it is not lost)**
- Automatic redirect to keyword search when the AI provider fails: **not adopted**. Keep FR-69 (explicit failure) and FR-34 (independent keyword search).
- Provider selection (OD-06) stays open. Before D0b, write the ADR with these criteria: data-transfer and retention policy, cost versus the AI usage budget (ASM-08), latency under the declared load, local versus cloud, and exact-citation behaviour on the 12 pilot cases.

---

## 6. PRD v0.5 patch list (for ADR-0009 and ADR-0010)

Replace or edit exactly these items. Keep every other FR, AC and ID unchanged.

**Header:** version 0.5; add "applies ADR-0007 to ADR-0010".

**Section 1 (Core paragraph):** replace "immutable versions" sentence with "immutable versions with Current / Superseded / Archived states".

**Section 2, "document classification" paragraph:** delete the sentence beginning "Draft means a revision not yet designated Current" and "This Draft policy is proposed under OD-04". Replace with:

> A revision creates a new immutable version that is Current at once; the previous Current becomes Superseded in the same operation (ADR-0009).

**FR-11 (replace row text):**

| ID | Delivery / source | Requirement | Acceptance criterion |
| --- | --- | --- | --- |
| FR-11 | P0 / BR-05 | A content revision shall create a distinct immutable document version designated Current and mark the previous Current Superseded in the same operation. | AC-11: Given a cited version, when revised, then its content and locators are unchanged, the new version has a distinct identity and state Current, and the cited version is Superseded and still opens by its exact citation. |

**FR-45:** change the row to `Withdrawn by ADR-0009 (13 October 2026). ID retained for continuity; not reused.` Remove FR-45 from SC-05 (Section 3), BR-05 (Section 8) and the D1 list.

**FR-12 / AC-12:** remove "Draft" from the fixtures and from the labels. New AC-12: "Given Current, Superseded and Archived fixtures, when opened with the required access, then version and status match; Superseded and Archived are labelled historical."

**FR-19 / AC-19:** "Ordinary retrieval shall exclude Superseded and Archived versions from current results."

**FR-47 / AC-47:** remove "and exclude Draft".

**Section 5, second paragraph:** delete "A revised version remains Draft until publication ... (proposed, OD-04)". Replace with "A revision becomes Current at once; the previous Current becomes Superseded (ADR-0009)."

**Section 7, second paragraph:** delete the Draft test sentence. Add: "Revise a document twice; verify the first version is Superseded and opens by exact citation, and ordinary retrieval returns only the latest."

**Section 9:** ASM-03 and ASM-02 status becomes "Accepted (ADR-0007, ADR-0008)".

**Section 11:** OD-02 and OD-03 status "Closed by ADR-0007 / ADR-0008". OD-04 "Closed except physical retention (ADR-0009)". OD-11 "Closed by ADR-0010; gate at end of Week 2".

**Counts:** active FRs 68 (54 P0, 13 P1, 1 P2); overlay 60 Must / 3 Should / 4 Could / 1 Won't. Update Section 10 verification text and the context-validator constants.

---

## 7. SAD v0.6 patch list (for ADR-0009 and ADR-0011)

**Section 1.3:** add rows for ADR-0007 to ADR-0011; mark ADR-0002 as "amended by ADR-0011".

**Section 2.3, contract invariant 4:** replace with "Validity in retrieval results is one of `current`, `superseded`, `archived`. Ordinary scope returns `current` only."

**Section 3.1:** add after the "Hold Duration" bullet:

> Internal read endpoints (`/internal/policy/*`, `/internal/state/*`) do not acquire the project guard (ADR-0011). Inside a protected handoff, Workspace validates in-process.

**Section 3.2, Flow 2 (replace steps 1 to 5):**

1. Workspace validates `document:create`, allocates `document_id`, commits the ACL record (classification, `acl_version`) in its transaction.
2. Gateway calls Knowledge to persist the initial `Current` version and passages, idempotent on `document_id` and the idempotency key.
3. The document is readable when Knowledge holds a version. An ACL row without content grants and reveals nothing.
4. A sweep removes ACL rows that never gained content.
5. Lifecycle state machine:
   - Creation -> `Current`
   - Revision -> new `Current`; previous `Current` -> `Superseded` (one Knowledge transaction)
   - Archive -> `Archived` (excluded from default retrieval; explicit historical scope only)
   - Deletion -> unchanged from v0.5

**Section 3.2, Flow 3, step 3:** delete every mention of `Draft`.

**Section 7.1 (traceability):** remove FR-45 from BR-05 and SC-05 rows; add ADR-0011 to BR-10 and BR-14 rows.

---

## 8. After applying: checks to run

```bash
# 1. Find every remaining Draft / FR-45 reference
grep -rniE "draft (version|state)|FR-45|designate(s)? current|publisher" docs specs contracts eval tests

# 2. Context harness (expect failures on hard-coded counts until updated)
npm run context:lint
npm run context:check
npm run context:test
```

Expected places to touch: `docs/planning/release-scope.json` (60 / 3 / 4 / 1), the spec that owned FR-45 (re-home its acceptance into the FR-11 spec), `contracts/openapi/*.json` (remove the publish operation and `draft` enum value), evaluation cases that mention Draft, and REG-00 (add v0.16, ADR-0007 to ADR-0011, the Week-2 gate).

Record in REG-00 that these are **author-prepared decisions committed by the owner**, not independent approval, and that no runtime tests have been run.
