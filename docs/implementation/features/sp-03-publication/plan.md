# SP-03 verification, publication and merge plan

**Artifact ID:** PUB-SP03-01\
**Version/date:** 0.1 Draft · 3 November 2026\
**Status:** Authorised; execution results belong to the task table below.\
**Inputs:** FEAT-SP03-01 v0.5; SP03-EXEC-01 v0.1; SP03-UI-01 v0.2; SP-03 v0.8; Workspace v0.2.12; Proposed ADR-0027 v0.2; PLAN-01 v0.4.\
**Trace:** FR-05/AC-05; supporting FR-03/31/59; BR-01/02/10/11/14; UC-03 main/EX-01/EX-02; implementation pack SP-03.1–03.4.\
**Planning mode:** Plan mode unavailable in this Default-mode session; equivalent written gate completed.\
**Work kind:** Bounded verification and publication; sequential author self-review.

## Goal, authority and boundaries

Owner instruction on 3 November: check SP-03 and, if done, push to GitHub, merge, delete its branch and write a report. Observable outcome: verified SP-03 source/evidence on origin/main, origin and local SP-03 branch removed only after merged ancestry is confirmed, unrelated working files preserved, and a dated report identifies actual commands and publication outcome.

Parents: [PLAN-01 Month 1](../../../planning/five-month-plan.md), [roadmap M-02](../../roadmap.md), [SP-03](../../../../specs/003-create-task.md), [owning feature plan](../sp-03-create-task/plan.md), [work register](../README.md), [source register](../../register.md), [central register](../../../sdlc/artifact-register.md). This is a publication follow-up, not a competing feature plan.

Non-goals: feature expansion, production/development migration, provider/Knowledge changes, accepted ADR/BRD edits, independent approval, deployment, force-push or unrelated publication. Workspace owns Task/session/project/audit state; no cross-service writes. Existing Proposed decisions remain Proposed.

Allowed paths: existing coordinated SP-03 source/contract/test/doc/evidence paths from the canonical spec; this folder and its task briefs/evidence; registration-only changes in the work/source/central registers, roadmap, review register and generated manifest metadata; docs/sdlc/reports/SP-03-publication-2026-11-03.md. Temporary staging/export files stay under .tmp/sp03-publication/. Preserve unrelated files and the template gitlink. Shared files require selective content staging rather than blanket git add.

## Tasks and verification

| Task | Outcome / dependencies | Acceptance and commands | Status / result |
| --- | --- | --- | --- |
| [PUB03-T01](tasks/PUB03-T01-review-and-verify.md) | Inspect source, AC evidence and exact publication tree; depends on P09 handoff | Compare recorded SHA-256 inputs; inspect Task API/store/cursor/UI and connected callers; inspect additive 009 and failures. Verify candidate context/docs/contracts, typecheck/build, complete Task suite, session/project regressions and foundation/Edge when source or environment warrants. Keep commands/logs/failures and count boundaries. | Verified; actual commands/source comparison in the publication report |
| [PUB03-T02](tasks/PUB03-T02-publish-and-merge.md) | Publish verified source and report; depends on T01 passing | Fetch origin; confirm main/head ancestry; inspect staged diff/secret paths/archives; commit with agent identity and Co-Authored-By; push feature branch; merge without force; push main; verify exact remote SHA before deleting branch. Preserve all unrelated bytes. | Ready after T01; remote receipts pending |

Synthetic disposable PostgreSQL fixtures only: historical session 006, project 007/008, Task 009. Reuse existing Node 24+, dependencies, trusted local HTTPS and isolated installed Edge/Playwright. No new package, personal browser profile or TLS bypass. Audit and replay failures must remain atomic; unknown outcome requires the original key; current access precedes disclosure. Source/version/citation/AI policy stays unchanged.

Use an exported publication candidate if necessary to prove the selected tree independently of unrelated dirty files. The pinned template can be exported at its committed revision for structural checks without changing its gitlink. Reuse existing dependencies transparently; do not claim clean installation or remote CI. Required failures block publication until resolved within scope; otherwise report them honestly. Existing D-07, SP02-F01, full SC-01/06, load/deployment and independent-review gaps do not become passes.

## Report and recovery

Report destination: [SP-03 publication report](../../../sdlc/reports/SP-03-publication-2026-11-03.md), registered before creation. Capture original branch/HEAD, selected/excluded paths and pre-operation hashes, actual check outcomes/source identity, commit/merge/remote confirmation and deletion status. No secret or private environment material in report/evidence. Review report and final diff before publication.

No destructive reset/stash/clean. If main advances, fetch/reconcile and recheck the affected candidate before merge. If push/merge is rejected, preserve branch/commits and report the actual failure. Delete the feature branch only after main contains it; never force deletion of unmerged work. Publication does not imply deployment or independent acceptance.
