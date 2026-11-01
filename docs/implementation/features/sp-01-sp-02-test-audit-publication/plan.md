# SP-01/SP-02 testing reports and publication

**Artifact ID:** PUB-SP01-SP02-01\
**Version/date:** 0.1 Draft · 1 November 2026\
**Status:** Owner-authorised report consolidation and current-branch publication.\
**Inputs:** [SP-01 plan](../sp-01-session-foundation/plan.md) v0.9; [SP-02 plan](../sp-02-project-membership/plan.md) v0.6; [roadmap](../../roadmap.md) v0.13; PLAN-01 v0.4; current registered execution evidence.\
**Trace:** Existing AC-01/36/37/68 and AC-02/03/38/39; BR-01/10/14. No new scope or acceptance.\
**Work kind:** Documentation/publication with bounded verification.\
**Planning mode:** Unavailable; this registered written gate is used instead.

## Authority and scope

The owner asks to commit/push to GitHub and create two reports about SP-01/SP-02 for testing and audit. This explicitly authorises publishing the accumulated related implementation, documentation and synthetic evidence to the existing origin on codex/sp-02-project-membership. It supersedes earlier no-commit/push limits only for this publication. No merge to main, force push, unrelated files, agents, development database migration or new runtime work is included.

Parent: PLAN-01 Month 1 and roadmap M-01/M-02/M-03; the two registered feature plans remain the implementation authorities. Allowed new edits: this plan, two dated reports under docs/sdlc/reports, and necessary report/work-plan/source/review/central-register metadata and bounded publication-check evidence under docs/sdlc/reports/evidence/SP-01-SP-02-publication-2026-11-01. Existing authorised SP-02 code/contract/SQL/UI/test/documentation changes are publication inputs, not new implementation in this turn.

## Sequential tasks

| Task | Reviewable outcome | Verification | Current checkpoint |
| --- | --- | --- | --- |
| [PUB-01](tasks/PUB-01-reports.md) | Two separate self-contained testing/audit reports | Exact commands, observed results, manual-test cases, source identity and open gates; distinguish historical/current runs and author consolidation from independent audit | Reports authored and source/count/path links rechecked |
| [PUB-02](tasks/PUB-02-publication-checks.md) | Publication inventory and checks | Verify retained source/archive hashes, review staged paths/text/archive contents, preserve unrelated work; run applicable context/docs/contracts checks and diff whitespace checks | Verified frozen source/archive; publication checks recorded |
| [PUB-03](tasks/PUB-03-commit-push.md) | Commit and push current branch | Codex identity and Co-Authored-By; no force/main merge; compare local commit with origin branch after push; report actual result only after execution | Ready after passing PUB-02; exact outcome follows in command/final handoff |

Publication checkpoints belong to the command record/final response. A report contained in a commit does not pretend to know its own future commit hash: resolve the containing commit with Git history. Retained implementation captures identify exact pre-publication worktree bytes separately.

## Exclusions and handoff

Exclude dirty SDLC-Prompt-Checklist submodule, local docs/agents and docs/SDLC-Prompt-Checklist copies, patch/scratch inventories, environment/TLS material, dependencies, build folders and Docker resources. Deliberate synthetic evidence archives remain included after inspecting their entries; they contain frozen sources, not live credentials.

Passing context/schema checks is not application evidence. Reuse existing measured runtime results only after confirming unchanged source identities; no new runtime pass or independent approval is invented by creating reports. SP02-F01, D-07, formal ADR/deployment and whole-release gates remain open. No real provider data is transmitted.

Publication includes explicitly allowlisted synthetic evidence logs despite the global *.log ignore rule; this is not authority to stage arbitrary ignored logs. The checked source archive remains identical to its retained manifest.

PUB-02 caught console-log whitespace in the staged check. Preserve the pre-normalisation, already redacted log bytes in captured-logs.zip; normalise only text-log whitespace and the uncommitted owner brief formatting. No command, test outcome, original source archive or live credential is changed.
