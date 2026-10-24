# Work UI alignment with Excalidraw

**Artifact ID:** UI-WORK-02
**Version/date:** 0.1 Draft · 24 October 2026
**Status:** Owner-authorised local preview implementation; no live application or independent acceptance.
**Inputs:** UX-WF-EX-01 v0.1 frames 03/04/10; UX-BLUEPRINT-01 v1.3; UX-PLAN-01 v0.1; UI-REF-01 v0.2; PRD-01 v0.9; SAD-03 v0.15; Workspace v0.2.8 / Knowledge v0.2.9; ADR-0008/0014; Proposed ADR-0003/0018/0019; existing ADR-0013 unavailable-source entitlement.
**Trace:** BR-01/02/03/06/10/13; SC-01/03/04/06/08; FR-03/05–09/40/41/42/43/44/55/59/61; SP-03/04/05 and source-opening presentation groundwork.

## Authorisation and implementation scope

The owner authorised implementation after the UI-to-wireframe review. This bounded change addresses all three review items in the existing synthetic HTML/CSS/JavaScript preview. It keeps the current visual direction; it neither chooses the Proposed application framework nor adds real session, permission, storage or API handlers. No package/provider, contract, accepted ADR or BRD is changed.

The existing design is retained. Supporting guidance uses `.agents/skills/karpathy-guidelines/SKILL.md`, `.agents/skills/ponytail/SKILL.md` and canonical `C:/Users/MCK/.codex/skills/web-design-guidelines/SKILL.md`. No visual generation lead, React/shadcn optimization or migration guidance applies to this plain DOM implementation.

| Review item / frame | Implemented preview behaviour | Practical boundary |
| --- | --- | --- |
| P1 unavailable metadata / 10 | Neutral unavailable/authority-error/loading/service-error shell; project identity, counts, task context and source dialogs are absent from the rendered DOM | Scenario switching is a synthetic fixture tool. Real current server authorisation is unimplemented. |
| Backlog planning / 03 | Sprint selector, goal/dates, planned Sprint creation with date validation, checkbox selection, per-task allocation outcomes and fixed lifecycle with explicit completion confirmation | No live creation, transaction, idempotency, concurrency or membership evidence. |
| Backlog order / 03, 10 | Native move-up/down buttons; explicit apply/discard; exact revision-string and full-permutation checks; partial/filtered/uncertain states block reorder, conflict discards draft and requires reconsideration | The client sample checks presentation invariants, not authoritative server rules. No new endpoint or scope policy. |
| Task context / 04 | Side panel beside work on wide layouts, stacked on narrow layouts; project-member assignee options, native state control and append-only ordered Open/Resolved sample events | Append-only SQL/audit/current membership and live assignment remain unverified. |
| Related knowledge / 04 | Exact synthetic document/version/passage dialog with ready/unavailable/denied/failure variants; no newer-version substitution; denial removes metadata from both the dialog and underlying inspector | No document explorer/editor or live citation endpoint is added. Retained unavailable identity is shown only in its explicitly entitled sample variant. |

## Outcomes and state handling

The initial fixture now has three Backlog items so Mixed allocation outcomes demonstrates one Confirmed, one Rejected and one Outcome unknown. Each sample operation retains its own identity/payload; unknown work cannot be resubmitted or edited, and affected reorder/Sprint lifecycle controls stay disabled. Earlier confirmations remain applied. The original sample operation context survives navigation between projects without disclosing it in another project's planning view. There is no invented polling endpoint or automatic retry. A browser reload resets the explicitly disposable fixture; it is not a real command reconciliation path.

Task completion/reopening and Sprint completion retain the existing owner-confirmed direction: only three Board states, one Active Sprint per project, unfinished returns as To Do, retained Done history and Completed-Sprint reopening returns to Backlog as To Do. Blocker history is not erased by Sprint completion. Project assignment selectors display only that sample project's members.

All related-source content is fictional. No external request is made; the preview server still serves only its explicit UI asset allowlist with `connect-src 'none'`. Unknown authority renders no cached protected sample view. These are presentation choices under existing rules, not permission evidence or a new ADR decision.

## Verification and handoff

Executed checks are recorded after verification. The original three defects/gaps are addressed in local code and tests; WF-01–09 and application acceptance remain open. Live sign-in, project/member management, service permission/revocation/concurrency, authoritative paging/idempotency, provider/database integration, full Documents/Search/AI/Audit screens and independent usability/accessibility review remain unimplemented or unverified. The [first preview record](ui-review-2026-10-23.md) remains historical and is not rewritten into new passes.

The browser automation URL policy denied authority to observe the current tab during this change. No alternate browser surface or policy workaround was used. Fresh desktop/mobile rendering, pointer/keyboard and contrast observations for this revision are therefore unrun; earlier screenshots are not evidence of the new layout. DOM tests separately exercise the new keyboard focus/Escape and markup interactions.

Checklist: pre-flight and reporting scope checked; existing BR/FR/AC and Proposed dependencies preserved. Handoff: local preview available for owner visual review; zero live application handler behaviours verified. No commit, branch change or independent approval.

Final author verification (24 October 2026, bundled Node 24.22.1): UI DOM/static-server tests passed 13/13; context:lint/context:check passed and context:test passed 45/45; docs:lint passed for 20 diagram pairs / 35 registered artifacts and docs:test passed 18/18. UI/fixture syntax, generated metadata (66 outputs, no drift), local reference links and changed-file whitespace checks passed. The UI suite was rerun after the narrow-layout focus adjustment. These are local presentation and structural checks; zero live application handler behaviours verified. Contracts were unchanged and contracts:test was not rerun; database, provider, evaluation, live permission/idempotency/concurrency, fresh rendering/mobile/contrast and independent review were not run. The browser URL-policy denial is retained above as the rendering limitation. No screenshot from an older revision is presented as new evidence.
