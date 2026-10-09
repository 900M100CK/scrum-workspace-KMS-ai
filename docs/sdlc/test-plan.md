# Minimum test and evidence plan

**Artifact ID:** TEST-08  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** [PRD-01](PRD_SRS.md) v0.4; [architecture](../architecture.md); DATA-04/API-05 drafts; [specs](../../specs/README.md); [evaluation](../../eval/README.md).  
**Author:** development agent acting sequentially; owner reviews business choices.

## Scope, environment and responsibilities

One student implements and verifies; the owner validates policy and criteria. This author self-check is not independent review. Current runnable checks are context reference/contract-shape validation and its negative unit cases using Node built-ins. Application/domain tests, real consumer/provider contract tests, database migrations, UI flows and retrieval/generation evaluation are **not run and not implemented**. UI/UML stages remain draft gaps rather than assumed complete inputs.

Future runtime fixture is synthetic-0.2, two owned databases, one active permission gateway, Knowledge process and a controllable provider adapter. Record actual stack/provider/hardware/corpus/load before performance results. No real protected data is sent to new external services. Do not log model reasoning, raw secrets or an unrestricted knowledge copy.

## Required gates

| Test ID | Trigger and assertion | Requirement / slice |
| --- | --- | --- |
| TC-01 | Valid login establishes session; invalid, expired and signed-out session cannot read work/source data | FR-01, FR-36, FR-37, FR-68 / SP-01 |
| TC-02 | Outside-project and unknown target reads share response; current project member still cannot read restricted document without grant | FR-03, FR-04, FR-59 / SP-02, SP-06 |
| TC-03 | Grant → permitted read/search → revoke → repeat content/question/citation; remove/rejoin does not revive old grant | FR-38, FR-39, FR-50–FR-52, FR-14, FR-55 / SP-06 |
| TC-04 | Pause inside/around guarded context and delivery handoff; commit revocation; original answer is wholly withheld. Timeout/restart/abort cannot resume the handoff | FR-28, FR-29 / SP-09; ADR-0006 |
| TC-05 | Revision creates Draft excluded from current/history/context; publish replaces Current without editing old evidence; direct citations remain exact and labelled | FR-11, FR-12, FR-19, FR-45, FR-47, FR-60 / SP-07 |
| TC-06 | Old/duplicate index job arrives after publication/deletion; obsolete content is not revived. Old citation reports unavailable without substitution | FR-15, FR-48, FR-61 / SP-07 |
| TC-07 | Stale edit cannot overwrite; duplicate key same payload resumes safely, changed payload conflicts. Concurrent starts/allocations preserve fixed Sprint invariants | FR-07, FR-08, FR-09, FR-42 / SP-04, SP-05 |
| TC-08 | Old document says blocked, operational latest event says resolved; response uses fresh operational entity/time/revision | FR-25, FR-26, FR-44 / SP-10 |
| TC-09 | Model invents citation; reference conflict or missing decision; malicious retrieved instruction requests mutation/disclosure | FR-22–FR-24, FR-30, FR-54, FR-60 / SP-09 |
| TC-10 | Force generation/embedding connection, timeout and usage budget failure; board/Sprint/document/keyword path still works; question error contains no generated answer | FR-33, FR-34, FR-69 / SP-12 |
| TC-11 | Read audit/trace as scoped/non-scoped inspector and after source revocation; no unpermitted metadata or private reasoning is shown | FR-27, FR-31, FR-32, FR-56–FR-58 / SP-11, SP-13 |
| TC-12 | Keyword and semantic runs use equivalent corpus/access; claim/passage/version scoring is separate from link existence | NFR-07–NFR-09 / SP-12 |

Tests record actor, source/corpus version, pause/commit/handoff boundary, observed result and failure. Schema validity alone does not satisfy TC-02–TC-11. Capture audit from the first mutation even if inspection UI is delivered later.

## Trace, exit and resumption

Each of the 68 original Core FRs is assigned to a feature spec with its matching PRD AC; the proposed release overlay assigns 61 Must and seven optional original Core FRs. FR-35 stays Enhanced. The [scope data](../planning/release-scope.json) is the trace source; no claim of executed complete coverage is made.

About 20–30 questions are defined in eval; the current 25-case set has separate pilot/final labels, exact locators, access/scenario and manual rubric. Apply scenario mutations and version the corpus before each run. Freeze pilot-derived numeric targets before final cases; keep failed results. Local/cloud comparison and time-savings claims require their stated baselines, not fabricated output or an LLM-only judge.

Suspend release on any known unauthorised access, version substitution, fabricated failure answer or incorrect state overwrite; resume after the relevant regression passes. Do not lower expected answers/thresholds to clear a failure. Original Core completion stays binding until the owner records exact OD-11 deferrals and altered gate. Month 5 reserves final regression/report/demo.

Checklist: Pass for source/scope/risk order/case trace/fixtures/exit/resumption/evidence needs. Gap for accepted policies, actual runtime tests, full UI/UML inputs and pilot criteria. Handoff: reviewable plan; application release unproven.
