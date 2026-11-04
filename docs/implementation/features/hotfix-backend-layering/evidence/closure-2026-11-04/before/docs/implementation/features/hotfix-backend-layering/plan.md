# Backend §4.2 documentation hotfix

**Artifact ID:** HOTFIX-BACKEND-42-01\
**Version/date:** 0.3 Draft · 4 November 2026\
**Work kind:** Hotfix, documentation only\
**Status:** Author verification complete for the bounded documentation hotfix; no runtime or independent acceptance.\
**Planning mode:** Plan mode used in the preceding conversation; this written registration precedes checks and architecture edits.\
**Inputs:** Base commit 6b837fd; [frozen sources](evidence/source-inputs.json); PRD-01 v0.9; SAD-03 v0.16; SAD-03-ENTRY v0.15; PLAN-01 v0.4; SP-03 v0.8; current base SP-04 header in snapshot.\
**Owner authorisation:** Explicit request to implement the supplied plan on 4 November 2026; no commit/push/merge authority.\
**Trace:** SP-03.1–03.4 / FR-05 / AC-05 / BR-02 / SC-01; SP-04.1–04.4 reading dependency only; BR-01/10/11/14 for identity, authority, audit and denial invariants. No FR/AC change or acceptance closure.

## Goal and parent registration

The observed documentation gap is that §4.2 states dependency invariants but does not describe the inspected Task/Project store structure, transaction/denial protocol or bounded read/pagination limits. Reproduction: inspect §4.2 at the base commit and compare the named source symbols. The null-without-denied type risk is an extension risk, not a reproduced runtime incident.

Deliver the owner-provided English description, preserving the original three invariants and operational behaviour. Parent [PLAN-01 Month 1](../../../planning/five-month-plan.md) / [M-02–M-03 roadmap](../../roadmap.md), [SP-03](../../../../specs/003-create-task.md) / [implementation pack](../../tasks/03-create-task.md) and [SP-04](../../../../specs/004-update-task.md) / [pack](../../tasks/04-update-task.md). Registration: [feature register](../README.md), [source register](../../register.md), [central register](../../../sdlc/artifact-register.md). This is an owner-authorised coordinated documentation scope outside canonical runtime spec paths.

## Boundaries and recovery

Branch codex/hotfix-backend-layering in a managed worktree from 6b837fd. Keep source checkout codex/sp-04, its staging and all existing edits untouched. No copied brainstorming or uncommitted SP-04 sources. No runtime, schema, API/type/contract, dependency manifest/lockfile, accepted ADR, baseline, diagram graph or historical evidence edits. No new ADR, providers, agents, commits, publication or database tests.

Architecture/entry may change only §4.2, version/date, entry self-version and a bounded change record. Metadata-only downstream scope must be enumerated in T02 before editing. Record baseline failures; do not fix unrelated failures to pass gates. Recovery is selective reversion of this hotfix in its isolated worktree, never reset/stash the source. Keep worktree for review; integration later must reconcile §4.2 and current metadata with SP-04, not overwrite whole files.

## Tasks and actual results

| Task | Reviewable result | Dependencies | Status / evidence |
| --- | --- | --- | --- |
| [HF42-T01](tasks/HF42-T01-register.md) | Registered plan and frozen sources | Owner request | Complete; registered in four parents; [source snapshot](evidence/source-inputs.json) |
| [HF42-T02](tasks/HF42-T02-layering.md) | §4.2, entry and metadata only | T01; baseline preserved | Complete within scope; §4.2/entry and enumerated metadata; source preservation verified |
| [HF42-T03](tasks/HF42-T03-verification.md) | Verification and integration handoff | T02 | Complete; original gap preserved in evidence and resolved by [HF42-F01](tasks/HF42-F01-source-link.md) |

## Verification and acceptance

Use Node 24+; install via npm ci only if needed, preserving package manifests and lockfile. Before target edits and after them run: npm run context:lint, npm run context:check, npm run context:test, npm run docs:lint, npm run docs:test. Also check local links and git diff --check. Logs and exit codes go under evidence/. No new handler behaviour is verified.

Accept only when every §4.2 factual claim has source/symbol support; Task ordering is scoped; source checkout digest/staging is unchanged; runtime/contracts/migrations/history/diagram semantics are preserved; current metadata and links agree; required structural checks pass. Pre-existing mandatory failures remain visible and prevent full closure. Baseline/final comparison is not independent review or runtime acceptance. DB/HTTP/DOM/browser/provider suites are deliberately not run because behaviour is unchanged.

## Handoff

[Integration and result report](handoff.md) will enumerate exact changes, source references, actual checks, failures, unrun runtime gates, rollback and SP-04 conflict handling. No automatic integration. Reopen this plan at continuation and keep all mutable task results here.


## Historical verification and remaining gap — 4 November 2026

[Final checks](evidence/final-checks.json) pass: context:lint, context:check, context:test 45/45, docs:lint, docs:test 20/20 on Node24.22.1. Initial setup and introduced metadata-date failures are preserved in baseline/after-edit logs; exact pinned submodule setup and preserving original diagram dates resolved them without changing test expectations, gitlinks or template sources.

[Preservation](evidence/preservation.json) proves the source checkout digest/staging/branch unchanged, diagram graph bodies/dates and historical sections unchanged, no code/contracts/schema/lockfile changes, and architecture content outside §4.2/header/change record preserved. The wide link scan retains one pre-existing UI blueprint source-link failure, [HF42-F01](tasks/HF42-T03-verification.md#hf42-f01--pre-existing-source-link). Therefore overall acceptance is not closed. This is not deferred mandatory testing or a claimed pass: the scan executed and its inherited failure remains explicit. Every new hotfix link resolves. No new runtime behaviour was tested. No commit/publication/integration.


## HF42-F01 authorised continuation — 4 November 2026

Owner explicitly requested fixing the remaining header source-link gap. Plan mode is unavailable in this execution turn; this saved amendment provides the written planning gate before the correction. Earlier Plan-mode preparation and original negative results remain unchanged.

Scope: change only the Stage 6 profile link in the UI blueprint Inputs header from `../agents/06-ui-ux.md` to `../../agents/06-ui-ux.md`; bump the blueprint to 1.7.2 and current wireframe input/own metadata to UX-WF-EX-01 0.5.2. No design body, frames, runtime, permission, contract or schema change. Current metadata/register updates: IMPL-FEATURES-01 0.32, IMPL-REG-01 0.37, IMPL-ROADMAP-01 0.25, REG-00 0.105, UML-07 0.24, DOC-REVIEW-REG-01 0.44.2. Exact paths and pre-images: evidence/f01-before-images.json; generated group READMEs already enumerated in T02 remain metadata-only. Plan/brief/result amendments are within this owning feature folder.

Task: [HF42-F01](tasks/HF42-F01-source-link.md), dependent on original T03 finding. Same PLAN-01 Month 1 / M-02–M-03 / SP-03–SP-04 support trace; this is source navigation only, not an added FR/AC. Goal: source link resolves to the existing repository Stage 6 profile; broad hotfix link scan has no missing targets; metadata checks and whitespace pass. Verify with existing five-command runner under phase f01, link scan and body-preservation checks. Retain baseline/failure logs and do not overwrite earlier evidence. Recovery: reverse the exact link/metadata amendment only. No commits or integration authorised.


## HF42-F01 actual result — 4 November 2026

The header source link now resolves to repository agents/06-ui-ux.md. Blueprint 1.7.2 and wireframe inventory 0.5.2 carry source metadata only; the UI design body and frames are unchanged. [F01 checks](evidence/f01-checks.json) pass all five commands (context tests45/45, docs tests20/20) on Node24.22.1. [F01 preservation/link evidence](evidence/f01-preservation.json) records zero missing local targets and clean whitespace; original failures remain in the previous logs/preservation files. HF42-F01 and the hotfix documentation acceptance are closed by author checks, without independent or runtime acceptance. No code, migrations, dependencies or contracts changed; no commits/publication/integration. Parent SP-04/release gates are unchanged.


## Owner-authorised publication — 4 November 2026

The owner explicitly requested committing and merging this canonical documentation directly into main. This later instruction supersedes earlier no-commit/no-integration restrictions for this bounded hotfix only, including publishing main to origin. Existing SP-04 work and all unrelated refs/content remain untouched. Plan mode is unavailable for this continuation; this written amendment precedes publication checks and Git mutations.

[HF42-P01](tasks/HF42-P01-publication.md) covers exact-diff staging, agent-identity commit with Co-Authored-By, fast-forward integration from base6b837fd into local main, ordinary non-force push to origin/main, and remote ref confirmation. Same registered parent and scope; no additional code/design change or deletion of branches/worktrees. Remote main was fetched and matches base6b837fd. Use the exact original70-path metadata allowlist plus this feature folder; explicitly include the ignored evidence logs. Retain prior negative evidence. Recheck five structural gates and whitespace before commit. Keep the branch/worktree available; final actual commit/ref results are reported in the chat, not predicted in this source snapshot. Runtime/deployment and independent acceptance remain unclaimed.

HF42-P01 status at source snapshot: remote baseline and exact scope confirmed; five publication gates pass ([checks](evidence/publication-checks.json)); source snapshot ready for authorised commit/fast-forward/push. Final Git outcomes will be reported after execution. Previously completed documentation tasks retain their original evidence.
