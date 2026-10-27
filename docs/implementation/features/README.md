# Work plan register and template

**Artifact ID:** IMPL-FEATURES-01\
**Version/date:** 0.6 Draft · 27 October 2026\
**Status:** Planning entry; no application feature accepted or implemented by this file.\
**Inputs:** [Development rules](../../development-rules.md) v1.9; [implementation roadmap](../roadmap.md) v0.6; [PLAN-01](../../planning/five-month-plan.md) v0.4; [spec index](../../../specs/README.md) v0.4; [source register](../register.md).\
**Trace:** Existing feature FR/AC/BR/SC through its canonical spec; no added scope.\
**Owner role:** Sequential development coordinator.

## Register before implementation

Follow [the planning gate](../../development-rules.md#111-work-planning-gate) for features, fixes, hotfixes and standalone testing. The folder and artifact ID retain their original names for stable links; all these work types use this one register. Use Plan mode when available and persist the plan before work. A chat-only plan is insufficient. Small/urgent work can have a short plan; existing registered tasks cover their own checks and reruns. Register parent PLAN-01/spec and [roadmap milestone](../roadmap.md) links, then select a ready task. Existing [task packs](../tasks/README.md) and [SP-01.1 brief](../briefs/SP-01.1-session-foundation.md) remain valid inputs; completed preparation is not retroactively reclassified.

| Work plan ID / kind / file | Version / status | Parent PLAN-01 section / roadmap milestone | Canonical spec / pack children | Next ready task / result |
| --- | --- | --- | --- | --- |
| [FEAT-SP01-01 / feature / session foundation](sp-01-session-foundation/plan.md) / [folder entry](sp-01-session-foundation/README.md) | Plan v0.2 Draft; entry/task briefs v0.1; application gated | PLAN-01 Month 1 / M-01 | SP-01 / SP-01.1–01.4; applicable SP-11.1 capture | SP01-P01 next; all 12 task rows Not started, no new runtime result |

For each new plan: replace the empty row with the actual ID/link, register the artifact centrally and in the [source register](../register.md), and add the roadmap backlink. Keep one canonical task table per feature. Parent rows reference it; they do not copy every task's mutable status.

## Saved plan template

Create `<work-id>/README.md`, `<work-id>/plan.md` and `<work-id>/tasks/<task-id>-<slug>.md`. Copy the structure below into plan.md and replace placeholders before calling a task ready. State kind as feature, fix, hotfix or test. Link each task row to its individual file; each task file records source versions, parent/child IDs, dependencies, allowed paths, steps, acceptance assertions, actual-versus-planned commands and result/handoff requirements. Keep execution state only in the parent plan table. Short plans retain the same structure; missing commands are Planned, never reported as executed.

```markdown
# <Feature name>

**Artifact ID:** <unique plan ID>
**Version/date:** 0.1 Draft · <date>
**Status:** Planning / Ready for authorised tasks / In progress / Verification gaps
**Inputs:** <source versions and links, including spec/contracts/ADRs>
**Trace:** <FR/AC/BR/SC and relevant UC/TC>
**Owner role:** Sequential implementer
**Planning mode:** Plan mode used / unavailable (state the actual limitation)
**Work kind:** feature / fix / hotfix / test

## Goal, scope and parent registration

Observable outcome:
Fix/hotfix: observed failure, reproduction/incident evidence, regression assertion:
Hotfix: recovery/rollback and any deferred verification/follow-up task IDs:
Testing: environment/fixtures, expected assertions, evidence destination, triage tasks:
Non-goals:
Parent PLAN-01 section (link):
Parent roadmap milestone (link):
Canonical spec / implementation pack and child IDs (links):
Feature register / central register / source register links:
Existing authorisation and material open decisions:

## Implementation boundaries

Allowed paths copied from canonical spec:
Owning service and integration consumers:
Existing implementation/conventions to reuse:
Dependencies, migration/contract changes and coordinated scope updates:
Permission, version, citation, audit and failure/unknown-outcome constraints:

## Tasks

| Task ID | Reviewable outcome | Depends on / decision gates | Allowed paths | Acceptance assertions / verification | Status / result link |
| --- | --- | --- | --- | --- | --- |
| <feature-id>-T01 | <one concrete outcome> | <ready prerequisites> | <bounded paths> | <observable positive/negative checks> | Not started |

## Integration and feature acceptance

Must AC → task/assertion mapping:
End-to-end, negative/concurrency/failure and UI coverage as applicable:
Existing verification commands vs Planned commands:
Evidence boundary (schema/SQL/lab handlers vs application handlers):
Unrun checks and unresolved decisions:

## Handoff and change log

Next ready task and prerequisites:
Actual results/handoff links using the existing handoff template:
Source/plan revisions and downstream registration changes:
Owner acceptance or independent review only if actually obtained:
```

Use existing [execution states and evidence rules](../execution.md) and [handoff template](../handoff-template.md). A plan/task may be ready for authorised work while a separate dependency remains open; list the boundary explicitly. Do not mark the whole feature verified from preparation or a structural check.

**Checklist:** Self-checked for the planning/register/template contract; runtime verification N/A because this file adds no handler. **Handoff:** start feature/fix/hotfix/test work through a saved or updated registered plan.

## Shared foundation registration

| Work plan | Parent | Next work |
| --- | --- | --- |
| [INIT-FRAMEWORK-01 v0.2](framework-foundation/plan.md) | M-01 / PLAN-01 Month 1; SP-01 prerequisite | INIT-01 through INIT-04 verified; source 5b00fce published and synced, no protected business handler |
