# Scoped execution inspection and explicit missing metrics

**Artifact ID:** ADR-0021
**Version/date:** 0.1 Proposed · 18 October 2026
**Status:** Proposed projection design; capture, permission filtering and runtime verification remain unimplemented.
**Inputs:** PRD-01 v0.9 AC-27/57/58; UC-02 v0.6 UC-11/13; ADR-0012/0019/0020; Knowledge v0.2.7; SYS-03/SYS-04.
**Trace:** BR-09, BR-10, BR-12, BR-14; FR-25/26/27/32/57/58/59; SC-02, SC-03, SC-06; TC-11/18.

## Decision and access

Knowledge getTrace returns actual recorded query, retrieval mode, permitted tool-step metadata, exact ranked document/operational locators, model configuration, measured-or-missing timing/usage, safe error category and typed validation outcomes. Optional getRetrievalSummary returns the bounded retrieval/citation portion of the same recorded execution. It includes actual retrieval queries, selected permitted evidence and validation outcomes, not provider configuration or generation/handoff steps. FR-58 remains Must; FR-27 remains Should and is omitted from controls until implemented.

Workspace remains the permission authority. Trace requires current scoped trace-read; summary independently requires current permitted-answer-reader entitlement. Audit-read grants neither and does not extend its identity exception to these projections. Validate run/project entitlement first; unknown/denied uses identical generic 404. An authority or mandatory-record dependency error yields generic 503, never empty success or a stale cached projection. Use no-store and revalidate source/query disclosure through the protected response handoff. No raw manifest/receipt or provider reasoning is exposed.

## Query, steps and exact evidence

InspectionQuery is available with the actual recorded text, not_performed for a query that was never executed/applicable, or unavailable when current disclosure rules withhold text. Do not reconstruct a plausible query or label persistence failure as optional metric loss. The original question and rewritten retrieval queries may contain protected source metadata; redact the entire affected text, not only source chips, if it cannot safely be disclosed. The public unavailable state gives no source identity, cause or withheld count. Missing mandatory query/step/evidence capture fails inspection explicitly.

InspectionStep records step_id, dense display_order, stage, completed/failed/not_performed status, actual query, duration, usage and safe error category. Repeated attempts have distinct IDs. Trace stages are keyword, semantic, operational, generation, citation_validation, provider_handoff and answer_handoff. Summary restricts this list to retrieval and citation_validation. Stage labels are recorded execution metadata, not unrestricted tool invocation or provider argument/output logs. An actual skipped stage uses not_performed for query/metrics and null error; do not invent a skipped stage for an unknown or hidden step.

DocumentInspectionSource binds source_id to project/document/version/passage, originating step_id and rank. OperationalInspectionSource binds source_id to project/entity kind/entity ID, entity revision, observation revision/time, originating step_id and rank. No bare source-ID resolver is required. Operational inspection describes the historical observed evidence; current work still requires a fresh Workspace read. Source opening must use the exact locator and recheck current authority, not substitute a newer revision.

The source projection contains selected evidence, not the candidate inventory. Per step, preserve recorded relative order of currently permitted selected sources, then assign dense display ranks 1..N. Do not expose original gaps, global candidate rank, denied identities/counts, scores, skipped rows or placeholders. A source occurring in two steps has one row per step and may have a different local rank. Each source/step pair must be unique; source_id must retain one exact locator within the run. No rank comparability across retrieval modes is claimed. Query/steps may be withheld as needed for disclosure; omit dependent source rows if their originating step cannot be disclosed.

InspectionValidation records locator/current_access/version_binding/claim_support, passed/failed/not_performed status and a permitted source_id or null for a safely disclosed run-level result. Omit an entire source-specific result when its identity is inaccessible, including invented/unverified locator values. Null is not a placeholder for a denied source. Every nonnull source must resolve to a currently permitted projected locator. Locator/access success does not establish claim support; record support as not_performed when it was not evaluated. Do not expose private reasoning, raw errors, secret configuration or protected excerpts in error/check text.

## Missing telemetry is different from zero and skipped work

DurationMetric and TokenUsageMetric each have three exclusive shapes:

| State | Duration example | Meaning |
| --- | --- | --- |
| measured | {"state":"measured","value_ms":0} | A recorded nonnegative value; measured zero is valid. Usage uses nonnegative integer value_tokens. |
| unavailable | {"state":"unavailable"} | Optional measurement was absent, failed or incomplete; no value field is allowed. |
| not_performed | {"state":"not_performed"} | Activity never executed/applicable; no value field is allowed. |

Run duration/usage and each visible step carry their own states. Do not derive a complete run total from a subset of successful measurements; use unavailable for incomplete totals while preserving measured individual steps. Failed work may have measured timing; failure and timing availability are independent. A not_performed step must have not_performed query/metrics and null error. Usage measures recorded total tokens only; no guessed input/output breakdown or cost. Metric loss does not invalidate durably captured mandatory provenance and may not force answer generation to fail. Record safe metric-loss diagnostics separately from source evidence; optional metrics cannot replace missing access or evidence records.

Trace.duration_ms and source_ids are replaced by typed duration and ranked_sources; summary source_ids are replaced similarly. No application handlers or stable external clients exist yet; consumers/specs must follow the revised draft. There is no new endpoint, provider or release feature. Logical model v0.6 identifies actual query/steps, source-step ordering and availability states; additive physical capture/retention remains an implementation gap and no migration is changed.

## Alternatives, verification and handoff

Bare source IDs cannot satisfy exact locator/rank/observation inspection. Numeric zero or a validation string cannot represent missing required numeric timing truthfully. A nullable value alone cannot distinguish unexecuted work from failed measurement. Returning raw debug logs would add private reasoning and content disclosure. The typed bounded projections preserve the promised inspection while retaining operation-specific access and metric honesty.

TC-11 must compare trace inspector, answer reader, both and unrelated/revoked readers; strip denied source/query/check data and renumber visible ranks without hidden counts. Test two retrieval steps, equal source IDs with conflicting locators, document and operational sources, stale source access, unavailable authority and exact historical opening. TC-18 must cover measured zero, unavailable duration/usage, not_performed steps, incomplete totals and mandatory capture failure. Contract negatives protect declaration presence and exclusive metric branches; actual capture/projection/permission/byte-boundary tests are still required. No measured runtime or evaluation result is claimed.

**Checklist:** Pass for typed projection, query/evidence binding and missing-state design; Gap for capture/storage mapping, bounded consumer/provider and live revocation/telemetry tests. **Handoff:** NEXT-03 design may be ticked only after dependent spec/UX checks pass. SYS-01 still blocks AI relay; NEXT-04 owns citation-kind UI/retry/readiness corrections.
