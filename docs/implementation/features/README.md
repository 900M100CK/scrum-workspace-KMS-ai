# Work plan register and template

**Artifact ID:** IMPL-FEATURES-01\
**Version/date:** 0.21 Draft · 2 November 2026\
**Status:** Planning entry; no application feature accepted or implemented by this file.\
**Inputs:** [Development rules](../../development-rules.md) v1.13; [implementation roadmap](../roadmap.md) v0.14; [PLAN-01](../../planning/five-month-plan.md) v0.4; [spec index](../../../specs/README.md) v0.8; [source register](../register.md).\
**Trace:** Existing feature FR/AC/BR/SC through its canonical spec; no added scope.\
**Owner role:** Sequential development coordinator.

## Register before implementation

Follow [the planning gate](../../development-rules.md#111-work-planning-gate) for features, fixes, hotfixes and standalone testing. The folder and artifact ID retain their original names for stable links; all these work types use this one register. Use Plan mode when available and persist the plan before work. A chat-only plan is insufficient. Small/urgent work can have a short plan; existing registered tasks cover their own checks and reruns. Register parent PLAN-01/spec and [roadmap milestone](../roadmap.md) links, then select a ready task. Existing [task packs](../tasks/README.md) and [SP-01.1 brief](../briefs/SP-01.1-session-foundation.md) remain valid inputs; completed preparation is not retroactively reclassified.

| Work plan ID / kind / file | Version / status | Parent PLAN-01 section / roadmap milestone | Canonical spec / pack children | Next ready task / result |
| --- | --- | --- | --- | --- |
| [FEAT-SP01-01 / feature / session foundation](sp-01-session-foundation/plan.md) / [folder entry](sp-01-session-foundation/README.md) | Plan v0.9 Draft; entry/task briefs v0.8; application gated | PLAN-01 Month 1 / M-01 | SP-01 / SP-01.1–01.4; applicable SP-11.1 capture | P01–P04 laboratory preparation verified with limits; P05 clock evidence partial; P06 core policy direction selected; bounded P07 interfaces/HTTPS verified; P08 verified with actual role/storage regression evidence; bounded P09 verified; bounded P10 verified; P11 bounded DOM/live/browser observations verified; P12 bounded regression/handoff executed; release gates open; see authoritative plan |
| [FEAT-SP02-01 / feature / project membership](sp-02-project-membership/plan.md) / [entry](sp-02-project-membership/README.md) | Plan/entry v0.6; corrected task versions in their headers | PLAN-01 Month 1 / M-02 and M-03 | SP-02 / SP-02.1–02.4; co-delivered SP-11 capture | P03A–P08/P10 bounded implementation verified; optional P09 not selected; actual results/source identities in parent plan; future SP02-F01 and D-07 open |

| [PUB-SP01-SP02-01 / reports and publication](sp-01-sp-02-test-audit-publication/plan.md) / [entry](sp-01-sp-02-test-audit-publication/README.md) | v0.1; owner-authorised | PLAN-01 Month 1 / M-01–M-03 | Existing SP-01/SP-02 evidence; no new feature | Two testing/audit reports, source/publication checks, current-branch commit/push; actual outcome reported after execution |

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

## P11 browser continuation — 28 October 2026

The owner completed the certificate handoff. Actual keyboard login, reload/cookie reuse, navigation/back, server expiry and logout were observed; browser outcomes are retained in SP01-P11-RESULT v0.2. P12 and broader acceptance remain open. No independent approval is implied.

## P12 integrated handoff — 28 October 2026

See [P12 result](../../sdlc/reports/SP-01-P12-handoff-2026-10-28.md) for bounded integrated session/UI regression, owner local test feedback and screenshot evidence. AC-01/36/37/68 and applicable session producers/UI are mapped there; D-07, other protected features, full cross-browser/accessibility and deployment/formal ADR gates remain open. No new requirement or independent acceptance is inferred.

## SP-03 planning registration — 2 November 2026

| Work plan | Version / parent | Scope / status authority |
| --- | --- | --- |
| [FEAT-SP03-01](sp-03-create-task/plan.md) / [entry](sp-03-create-task/README.md) / [WBS](sp-03-create-task/breakdown.md) | Plan/entry/WBS v0.1; SP03-D01/D02/P01–P09 v0.1; PLAN-01 Month 1 / M-02 | Owner-authorised planning/workflow and selective branch publication only. Future runtime statuses and results live only in the parent plan. |
