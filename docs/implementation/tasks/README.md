# Implementation task catalogue

**Artifact ID:** IMPL-TASKS-01\
**Version/date:** 0.8 Draft · 7 November 2026
**Status:** SP-01 has bounded implemented session/UI regression evidence; wider release gates remain open; SP-02 now has bounded project/member/UI evidence; SP-03 now has a registered local implementation/evidence handoff; later packs remain unimplemented.\
**Inputs:** [SPEC-INDEX](../../../specs/README.md) v0.8.7; [machine index](../../../specs/index.json) v0.5; [release tiers](../../planning/release-scope.json) v0.4; [source register](../register.md).\
**Trace:** Existing BR-01–BR-14 / SC-01–SC-08 through the linked spec FR/ACs.\
**Owner role:** Sequential development coordinator.

Read [entry](../README.md), [decisions](../decisions.md), [roadmap](../roadmap.md) and [execution](../execution.md) before selecting one child step. Every pack has four children; IDs are local work identifiers, not new FRs or public operations. SP-01 child dispositions are recorded in its pack and P12 handoff; SP-02 source preparation has now started; other unimplemented pack children remain Not started. No calendar or new deferral is introduced. FR-45 remains withdrawn; FR-35 remains outside this release.

| Pack | Observable goal | Canonical dependencies | Requirement tiers | Pack status |
| --- | --- | --- | --- | --- |
| [SP-01](01-session.md) | Use an authenticated session whose expiry and sign-out end protected access. | None | Must: FR-01, FR-36, FR-37, FR-68 | Bounded SP-01 execution/evidence; see [P12](../../sdlc/reports/SP-01-P12-handoff-2026-10-28.md); release gates open |
| [SP-02](02-project-membership.md) | Set the authorised project scope and remove membership without grant revival. | SP-01 | Must: FR-02, FR-03, FR-38, FR-39; Could: FR-64 | Source/contract preparation under [FEAT-SP02-01](../features/sp-02-project-membership/plan.md); material gates open |
| [SP-03](03-create-task.md) | Persist one Story/Task/Bug in the correct authorised project and basic board state. | SP-02 | Must: FR-05 | See [FEAT-SP03-01](../features/sp-03-create-task/plan.md) and its actual handoff; no duplicate task status |
| [SP-04](04-update-task.md) | Update a task without stale overwrite and retain blocker resolution evidence. | SP-03 | Must: FR-09, FR-40, FR-43, FR-44 | Not started |
| [SP-05](05-sprint-lifecycle.md) | Run the fixed Scrum lifecycle without introducing a workflow configuration engine. | SP-04 | Must: FR-06, FR-07, FR-08, FR-41, FR-42; Could: FR-66, FR-67 | Not started |
| [SP-06](06-document-access.md) | Store an owned English text/Markdown source with explicit, independently enforced document access. | SP-02, SP-11 | Must: FR-04, FR-10, FR-14, FR-50, FR-51, FR-52; Should: FR-62; Could: FR-65 | B01 source preparation; runtime unimplemented; state in FEAT-SP06-01 |
| [SP-07](07-version-publication.md) | Revise immutable evidence directly to Current and preserve labelled history and exact citations. | SP-06 | Must: FR-11, FR-12, FR-13, FR-15, FR-19, FR-47, FR-48, FR-61 | Not started |
| [SP-08](08-linked-keyword-search.md) | Address scattered context with explicit links and an AI-independent keyword path. | SP-06, SP-03 | Must: FR-16, FR-17, FR-18, FR-20, FR-34, FR-59, FR-63; Should: FR-49, FR-70 | Not started |
| [SP-09](09-cited-question.md) | Answer an English question with exact citations or explicit insufficiency/conflict/failure. | SP-07, SP-08, SP-11 | Must: FR-21, FR-22, FR-23, FR-24, FR-28, FR-29, FR-30, FR-46, FR-53, FR-54, FR-55, FR-60, FR-69 | Not started |
| [SP-10](10-current-work-question.md) | Report current blockers from operational observations rather than historical text. | SP-04, SP-09 | Must: FR-25, FR-26 | Not started |
| [SP-11](11-audit-and-source-inspection.md) | Record trustworthy change/run receipts from the first operation, independently of inspection UI. | SP-01 | Must: FR-31, FR-32, FR-57 | Not started |
| [SP-12](12-failure-and-evaluation.md) | Produce measured retrieval, citation and fallback evidence. | SP-05, SP-09, SP-10 | Must: FR-33 | Not started |
| [SP-13](13-scoped-inspection.md) | Let permitted users inspect recorded changes/retrieval while enforcing current source and log scope. | SP-11, SP-09 | Should: FR-27; Must: FR-56, FR-58 | Not started |

SP-11.1 is co-delivered with the first required mutation record, rather than waiting for all of SP-11. SP-11 AI evidence steps follow work/doc foundations; inspection UI is SP-13. Optional rows do not become Must because they share a spec. The canonical contracts also declare supporting/internal operations; select and trace the necessary producer/consumer work during each child brief instead of inventing catalogue coverage from these lists.

**Checklist/handoff:** Pass for all canonical slice/FR mappings and initial child IDs; Gap for decisions and runtime acceptance. Next preparation: SP-01.1 and the corresponding SP-11.1 capture brief. Update status only with actual evidence and version/register changes.

1 November handoff: SP-02 bounded verification is recorded in its registered plan. SP-03 is next; no later feature is implemented or accepted by this index update.

SP-05 selected Could continuation is registered in [owning plan](../features/sp-05-sprint-lifecycle/plan.md): C01 source support, then C02–C11 storage/producers/UI/verification. Current status is held only by that plan; prior Must evidence is historical.

IMPL-SP-06 v0.2 aligns selected B01 with canonical SP-06 v0.6.4; current work state belongs to FEAT-SP06-01 v0.3. No runtime completion or other decision adoption.
