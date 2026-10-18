# Consistency review — SDLC document set (16 Oct 2026)

**Scope:** all 38 uploaded files. **Not reviewed (not supplied):** `contracts/openapi/*`, `specs/*`, `eval/*`, `planning/*`, `docs/ux/*`, diagrams, `analyst/business-review-*`, `owner-decisions-OD-*.md`. Every "owner-confirmed" claim below rests on the ADR text only.
**Status:** author review, not independent approval. No runtime evidence exists.

## 1. Verified consistent

- Counts: 69 active FR = 60 Must + 4 Should (FR-27/49/62/70) + 4 Could (FR-64–67) + 1 Won't (FR-35); FR-45 withdrawn. 60 Must = 54 P0 + 6 P1 (FR-15/16/17/47/56/58).
- 48 EX identities (47 active + 1 withdrawn) match the per-UC counts in `use-cases.md`.
- Core invariants agree across AGENTS, PRD, SAD, ADR-0006/0007/0009/0011/0013/0017: generic 404, fail-closed, whole-draft withholding, no version substitution, rejoin never revives grants, runtime AI read-only.
- Provider Relay is a Workspace module with timeout and Trust Boundary 4 (SAD §3.3, §5.2). Not a gap.

## 2. Conflicts to fix (priority order)

### C-1 ADR-0012 vs BRD SC-06 / BR-10 and AGENTS §5
BRD SC-06 forbids disclosing restricted "content or metadata". AGENTS §5 requires protecting metadata, traces and logs. ADR-0012 deliberately exposes actor/action/entity-ID/time of restricted documents to a scoped audit-reader.
**Fix:** record this as an explicit owner-approved exception to SC-06/BR-10 (new BRD addendum, see C-5), cite it in ADR-0012 "Context", and reference it from the H3 rubric. Do not leave it implicit.

### C-2 UC-09 vs ADR-0012 / 0013 / 0015
| Location | Current text | Required |
| --- | --- | --- |
| UC-09 step 8 | validates "all cited sources" | validate the **entire evidence set**, including uncited context (PRD AC-29, ADR-0013) |
| UC-09 EX-02 | "A cited source is revoked" | "Any source in the evidence set is revoked" |
| UC-09 step 10 | records trace after delivery | run ID + exact evidence manifest durable **before** provider input (step 5) and before each answer handoff (FR-57, UC-11) |
| UC-09 main flow | `partially_answered` only in end addendum | add as a main-flow outcome at step 9 |

### C-3 SAD-03 v0.7 stale
- Header "use cases v0.2" → v0.3. SPEC-REVIEW F-06 says this was fixed; it was not. Correct F-06.
- §7.1 claims "exact wording from PRD v0.5", but FR-09, FR-31, FR-57 are old wording. Resync all rows from PRD.
- §7.1 omits FR-70 (inventory says 68). Add the row, owner SP-08, ADR-0016.
- §1.3 decision table stops at ADR-0006. Add ADR-0007–0017 one line each.
- §3.2 Flow 4: add manifest-before-handoff (ADR-0012), `partially_answered` (ADR-0015), terminal `AnswerWithheld` (ADR-0013).
- §2.1, §3.2 Flow 3, §6.1 SC-08 say keyword search is **trigram**. ADR-0004 and DATA-04 implement **English full-text (GIN)**; trigram/fusion is "unselected". Align SAD to ADR-0004.
- §2.2 `acl_version` → `permission_revision` (ADR-0011).

### C-4 PRD body vs appended addenda
Addenda at the end of PRD change behaviour but the FR/AC table was not edited.
| Row | Edit |
| --- | --- |
| AC-22, AC-60 | invented citation ⇒ original draft withheld; replacement must pass claim support, exact binding, access, provenance; else `AnswerWithheld` |
| AC-23 / AC-24 | add `partially_answered` (supported components + explicit missing components, no hidden-source hint) |
| AC-38, AC-39, AC-43 | removal invalidates **all** individually granted capabilities, clears current assignees, bumps task revisions, atomic with audit; last-manager removal rejected |
| FR-70 row | already inline — keep |
Then delete the three matching addendum paragraphs (keep one change record). Also fix PRD §1 sentence "other 60 active requirements" to say 69 − 7 exceptions − FR-35 − FR-70.
`use-cases.md`: UC-02 "Remove member" step 3 and BR-14 still say "document-read grants" only; add EX-04 (last-manager rejection) and fold the ADR-0017 paragraph into the flow.

### C-5 BRD baseline edited without a version
`BRD_..._EN_v1_0.md` is dated 7 Oct but contains §13.4 (14 Oct). CHANGELOG (8 Oct) says it was checked "unchanged". AGENTS §1 forbids editing the BRD without owner approval.
**Fix:** move §13.4 to `docs/baseline/BRD_addendum_research_eval_v0.1.md` (status Proposed), restore v1.0 text, and have `BRD.md` list both.

## 3. Test-coverage gaps

| ID | Gap | Fix |
| --- | --- | --- |
| T-1 | No assertion for `partially_answered` | TC-09: split (a) invalid/revoked draft ⇒ whole withhold, (b) one supported + one missing component ⇒ partial with citations and `missing_components`, (c) none supported ⇒ `insufficient_evidence` |
| T-2 | ADR-0014 partial success | TC-07/21: allocate A (ok) + B (already allocated); A stays committed, B rejected, no leak of competing Sprint |
| T-3 | ADR-0017 last-manager rule | new UC-02 EX-04 + TEST-COVERAGE row + TC-13/14: two concurrent removals of the last two managers ⇒ exactly one rejected, state unchanged |
| T-4 | BR rows in TEST-COVERAGE | add TC-23 to BR-07, TC-25 to BR-07/BR-13, TC-24 to BR-01 |
| T-5 | VERIFY-01 FR-39 row | add capability invalidation, assignee clearing, revision bump, last-manager |
| T-6 | VERIFY-01 FR-23/24 rows | add partial-answer observation |

## 4. Open logic decisions (owner)

- **Q-1 State of tasks returned to Backlog.** ADR-0008, FR-42 and UC-04 Alt-1 allow a task that is In Progress (or To Do) to sit in the Product Backlog. Specify: reset to To Do on return, or keep state and define Backlog display.
- **Q-2 Manifest vs guard order.** ADR-0012 needs the manifest durable before handoff; ADR-0006/0011 hold the guard from final validation through handoff. Options: (a) write manifest inside the guard — remote write (candidate 8 s) blocks revocations for that project; (b) write before the guard — manifest may differ from what is finally sent after revalidation, so it must be re-written per attempt. Decide, then add an immutable per-handoff record (DATA-FIT gap) and a TC for ordering.

## 5. Version / status drift (mechanical)

| File | Fix |
| --- | --- |
| `artifact-register.md` | PRD-01 row "68 active" → 69; checklist row "UX entry is absent" → UX-06 exists; decision log: remove "unavailable-citation identity" (ADR-0013), keep retention; header ADR range → 0007–0017; reconcile test counts 21/21 vs SPEC-REVIEW 31/31 with dates |
| `test-plan.md`, `test-coverage.md`, `requirement-verification.md` | Inputs ADR range → 0007–0017 |
| `ui-ux-spec.md` | Inputs ADR range → 0007–0017 |
| `data-design.md`, `PRD_SRS.md` | header date → 14 Oct or move 14 Oct sections to a change record |
| `SAD.md`, `use-cases.md` | PLAN-01 version v0.1 vs v0.2: pick one |
| ADR statuses | one vocabulary: Proposed / Owner-confirmed / Implemented / Superseded (ADR-0001 → "Superseded in part by 0007, 0009"); store the owner-confirmation source path in every ADR from 0012 on |
| `adr/README.md` | move ADR-0015–0017 into the main table |

## 6. Suggested order

1. C-5, C-1 (baseline integrity, 1 h).
2. C-4, C-2, C-3 (single pass per file).
3. T-1…T-6.
4. Q-1, Q-2 decisions, then update ADR-0008 and ADR-0012.
5. Freeze new ADRs; fix ADR-0003 (stack) and start the SP-01/02/06 vertical slice.

## 7. Add a lint rule

In `docs:lint`, fail when an artifact header lists ADR range max < the highest ADR number cited in its body, and when a header "Inputs" version differs from the version in the artifact's own header. This would have caught every row in §5 and F-06.
