# Minimum test and evidence plan

**Artifact ID:** TEST-08  
**Version/date:** 0.2 Draft · 10 October 2026\
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

## UC exception-to-test matrix (proposed)

Maps each of the 44 named EX-* flows in [use-cases.md](use-cases.md) to a gate. *Covered*: the existing TC text states the assertion. *Partial*: the TC covers the boundary but not this exact assertion; extend it. *Gap*: no current TC asserts it. Result: 17 Covered, 7 Partial, 20 Gap. This is a design-time mapping, not executed coverage, and it does not close F-08 in [spec-review.md](spec-review.md) until the Partial/Gap rows have written assertions.

Proposed new gates (not approved; owner to accept or merge into existing TCs):

| Test ID | Trigger and assertion | Requirement / slice |
| --- | --- | --- |
| TC-13 | Capability denial and input validation: actor lacks create-project/PO/author/content-write capability, or sends an invalid type, date range, classification, assignee or grantee; response is forbidden/validation/not-found-equivalent, nothing persisted, no user or resource existence leaked | FR-02, FR-05, FR-06, FR-10, FR-16, FR-17, FR-38, FR-43, FR-45, FR-51, FR-66 / SP-02–SP-08 |
| TC-14 | Dependency failure at commit or check time (storage, access-check, audit/trace write): fail closed or explicit pending/retryable state, no partial membership/Sprint/version swap, failures reported independently | FR-20, FR-28, FR-31, FR-32, FR-39, FR-44, FR-57, NFR-03 / SP-02, SP-04, SP-05, SP-07–SP-09, SP-11, SP-12 |

Extend TC-08 with duplicate-Open-blocker and partial-access task-scope cases (UC-04 EX-04, UC-10 EX-01).

| UC | EX | Condition | Status | Test | Needed assertion / note |
| --- | --- | --- | --- | --- | --- |
| UC-01 | EX-01 | Invalid credentials / locked account | Covered | TC-01 | Add: response is generic (no account enumeration). |
| UC-01 | EX-02 | Expired session on protected request | Covered | TC-01 | FR-68. |
| UC-01 | EX-03 | Sign-out with expired/invalidated token | Partial | TC-01 | TC-01 covers signed-out sessions; add idempotent sign-out with expired token. |
| UC-02 | EX-01 | Requester lacks create-project authority | Gap | TC-13 | FR-02; no write persisted. |
| UC-02 | EX-02 | Add member: target user does not exist | Partial | TC-13 | TC-02 covers reads only; add FR-38 not-found-equivalent response. |
| UC-02 | EX-03 | Dependency fails during member removal commit | Gap | TC-14 | Pending/retryable; grants never left half-revoked (FR-39). |
| UC-03 | EX-01 | Unsupported item type | Gap | TC-13 | FR-05 has no current TC. |
| UC-03 | EX-02 | Requester lacks PO/author capability | Gap | TC-13 | BR-02: Scrum Master accountability alone is insufficient. |
| UC-03 | EX-03 | Stale revision token on edit | Covered | TC-07 | Stale edit cannot overwrite. |
| UC-04 | EX-01 | Stale revision token on board move | Covered | TC-07 | FR-09. |
| UC-04 | EX-02 | Assignee is not a project member | Gap | TC-13 | FR-43 has no current TC. |
| UC-04 | EX-03 | Dependency fails during state update | Gap | TC-14 | Explicit failed/pending state. |
| UC-04 | EX-04 | Duplicate Open blocker event | Gap | TC-08 (extend) | Event appended, status stays Blocked, history kept (FR-44). |
| UC-05 | EX-01 | Start Sprint while another is Active | Covered | TC-07 | Concurrent starts preserve single-Active invariant. |
| UC-05 | EX-02 | Start date after end date / missing | Gap | TC-13 | FR-06/FR-66 validation. |
| UC-05 | EX-03 | Start a Completed Sprint | Partial | TC-07 | Add explicit Completed-is-terminal assertion. |
| UC-05 | EX-04 | Dependency fails during Sprint completion | Gap | TC-14 | No partial completion state. |
| UC-05 | EX-05 | Complete a Sprint that is not Active | Partial | TC-07 | FR-42 listed; add Planned/Completed rejection cases. |
| UC-06 | EX-01 | Create without classification | Gap | TC-13 | AC-10. |
| UC-06 | EX-02 | Requester lacks author capability | Gap | TC-13 | FR-10. |
| UC-06 | EX-03 | Grantee is not a project member | Gap | TC-13 | TC-03 covers valid grant/revoke only (FR-51). |
| UC-06 | EX-04 | Read races with revocation | Covered | TC-03, TC-04 | Denied at next access-check boundary (FR-14). |
| UC-07 | EX-01 | Requester lacks content-write authority | Gap | TC-13 | No Draft created. |
| UC-07 | EX-02 | Designate a non-Draft version as Current | Partial | TC-05 | Add rejection assertion (FR-45). |
| UC-07 | EX-03 | Dependency fails mid publish transition | Gap | TC-14 | TC-06 covers stale index jobs, not storage failure. |
| UC-07 | EX-04 | Open citation on unavailable version | Covered | TC-06 | FR-61. |
| UC-08 | EX-01 | Access-check service fails during search | Gap | TC-14 | Fail closed (FR-20). |
| UC-08 | EX-02 | Relationship endpoints inaccessible | Partial | TC-13 | TC-02 covers reads; add FR-16/FR-17 create case. |
| UC-08 | EX-03 | Stale index contains revoked/archived version | Covered | TC-03, TC-06 | Revoke then repeat search; obsolete content not revived. |
| UC-09 | EX-01 | Access-check service down before model input | Gap | TC-14 | TC-04 covers handoff pauses, not outage (FR-28). |
| UC-09 | EX-02 | Source revoked between retrieval and delivery | Covered | TC-04 | Whole draft withheld (ADR-0006). |
| UC-09 | EX-03 | Prompt injection in retrieved text | Covered | TC-09 | FR-30. |
| UC-09 | EX-04 | Embedding/semantic retrieval fails | Covered | TC-10 | FR-69; keyword path works. |
| UC-09 | EX-05 | Generation error or timeout | Covered | TC-10 | No generated answer in error. |
| UC-10 | EX-01 | Partial access failure on in-scope tasks | Gap | TC-08 (extend) | Only accessible tasks returned (FR-26). |
| UC-10 | EX-02 | AI provider fails during synthesis | Covered | TC-10 | Operational data intact. |
| UC-11 | EX-01 | Audit write fails after business commit | Gap | TC-14 | Gap alerted; result pending/partial (FR-31). |
| UC-11 | EX-02 | Trace write fails mid-attempt | Gap | TC-14 | Answer proceeds; trace marked partial (FR-32/FR-57). |
| UC-12 | EX-01 | Question submitted during AI outage | Covered | TC-10 | AC-69. |
| UC-12 | EX-02 | Partial AI degradation (embed vs generation) | Covered | TC-10 | Either failure halts Q&A; keyword works. |
| UC-12 | EX-03 | Work/document storage fails while AI down | Gap | TC-14 | Independent failure reporting (NFR-03). |
| UC-13 | EX-01 | Inspector queries out-of-scope project | Covered | TC-11 | FR-59 indistinguishable response. |
| UC-13 | EX-02 | Audit event references restricted document | Covered | TC-11 | Redacted payload, metadata preserved. |
| UC-13 | EX-03 | Document read attempted via trace IDs | Partial | TC-11 | Add: trace/source ID grants no document read. |

## Trace, exit and resumption

The optional `user-stories.md` is intentionally omitted for this draft. PRD-01 numbered FR/AC pairs and UC-02 journeys provide the requirements and flow inputs for this plan; this does not waive any BR, SC or acceptance criterion. The register records this documentation choice as N/A. The UC exception-to-test matrix above is a proposal with open Partial/Gap rows, and the SC-to-test matrix remains an explicit Stage 8 gap; FR references alone do not demonstrate that every scenario or exception has an adequate assertion.

Each of the 68 original Core FRs is assigned to a feature spec with its matching PRD AC; the proposed release overlay assigns 61 Must and seven optional original Core FRs. FR-35 stays Enhanced. The [scope data](../planning/release-scope.json) is the trace source; no claim of executed complete coverage is made.

About 20–30 questions are defined in eval; the current 25-case set has separate pilot/final labels, exact locators, access/scenario and manual rubric. Apply scenario mutations and version the corpus before each run. Freeze pilot-derived numeric targets before final cases; keep failed results. Local/cloud comparison and time-savings claims require their stated baselines, not fabricated output or an LLM-only judge.

Suspend release on any known unauthorised access, version substitution, fabricated failure answer or incorrect state overwrite; resume after the relevant regression passes. Do not lower expected answers/thresholds to clear a failure. Original Core completion stays binding until the owner records exact OD-11 deferrals and altered gate. Month 5 reserves final regression/report/demo.

Checklist: Pass for source/scope/risk order/case trace/fixtures/exit/resumption/evidence needs. Gap for accepted policies, actual runtime tests, full UI/UML inputs and pilot criteria. Handoff: reviewable plan; application release unproven.

**v0.2 change summary:** Records the intentional optional-story omission and the remaining SC/exception mapping gap. Existing test definitions and runtime execution status are unchanged. **12 October 2026 revision (version unchanged):** adds the proposed UC exception-to-test matrix and proposed gates TC-13/TC-14.
