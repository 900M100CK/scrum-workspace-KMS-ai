# Partial answers with cited supported components

**Artifact ID:** ADR-0015
**Version/date:** 0.1 Draft - 14 October 2026
**Status:** Owner-confirmed partial-answer behavior and research question clarification; implementation and evaluation pending.
**Inputs:** PRD-01 FR-23/24/29/60; ADR-0013; research cases v0.1 semantic review.
**Trace:** BR-08, BR-09, BR-10, BR-12; FR-21-FR-26, FR-29, FR-55, FR-60; H1/H2.

## Decision

When only part of the user's request is supported, deliver the supported components with exact citations and explicitly identify the remaining requested components as lacking evidence. Use `partially_answered`; if no component can be supported, retain `insufficient_evidence`. A missing component is described in terms of the user's request, not the existence, identity or content of inaccessible evidence. The user confirmed this distinction rather than suppressing all supported content whenever an answer is incomplete.

This is not permission to salvage an unsafe draft by removing a citation or revoked source. ADR-0013 still withholds the entire original draft when its evidence is revoked or an invented citation invalidates it. Any replacement, including a partial answer, must be a new attempt with claim-support, exact binding, current access and durable provenance checks. Provider/authority/persistence failure remains explicit failure, not semantic insufficiency. An unresolved supported contradiction stays `conflict`; it must not be silently resolved to fill a missing component.

## Contract and evaluation design

Knowledge QuestionResult adds PartiallyAnswered with nonempty supported claims, nonempty citations, run ID, and nonempty missing_components. Existing Claim and Citation types retain their meanings. Every factual/synthesis claim must be supported by its bound permitted evidence; cardinality/schema checks alone do not establish that. `missing_components` never explains that a hidden source or grant exists.

Score supported components separately from complete response to the question. Correct abstention gets an abstention score, not factual-completeness credit for an unavailable fact. C0/C1/C2 have matched questions and snapshots; disabling a source also disables dependencies needed to identify the subject of a claim. Do not give document-only C0 a task identity secretly selected from an operational Backlog.

The owner agreed to clarify RQ-20 by naming t-api, and RQ-22 by asking about the first unfinished task in the Product Backlog. RQ-22 C0 cannot identify that task or assert its applicable acceptance rule. C1 may report the current first task/state but lacks its documented rule; C2 can combine both. These are pre-pilot corrections, not changes to fit observed results; no run or freeze has occurred.

## Verification and handoff

Test document-only, state-only and combined input for a two-component question; partial response requires genuine supported content and explicit missing request component without hidden-source hints. Test all missing evidence, contradictory evidence, provider failure, revoked uncited context and invented citation independently. RQ-22 must not receive answer-key-selected task/source IDs through the harness or provider prompt. Archive old reference definitions and record corrected versions before freezing.

Ready for contract/UX/evaluation drafting. Runtime claim verification, semantic scoring, academic review and actual pilot measurements remain unproven. No new mutation capability, provider or product scope expansion is implied.
