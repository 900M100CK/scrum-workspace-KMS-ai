# Evidence pipeline evaluation

**Artifact ID:** EVAL-01  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** BRD §13; PRD-01 v0.4; [PLAN-01](../docs/planning/five-month-plan.md); [reference cases](reference-cases.json); [synthetic corpus](fixtures/corpus.json).  
**Author:** development agent acting sequentially; owner reviews business choices.

Use 25 English reference cases: 12 pilot and 13 final. Apply each scenario mutation before its run and record the resulting corpus revision. Sources are reference locators, not generated answers or execution evidence. Draft case definitions may be refined before criteria freeze, with reasons; never change expected sources to make a final run pass.

Record retrieval and generation separately. Top-five eligibility excludes operational-only, denied, missing-evidence and provider-failure cases; multi-source completeness is separate from single-reference discovery. Manually score important claims, exact version/passage and access. Criterion thresholds remain unselected until the pilot. A local/cloud comparison is conditional on a failure/quality question and available configuration; do not build a many-model benchmark.

Per run record case/access/scenario, corpus version, provider/model version, embedding settings, retrieval settings, hardware/load, median/p95 observations, usage/errors, claim scoring and negative outcomes. No private reasoning or unrestricted source content in logs. Never use real protected data with a new external provider without authorisation.

The context harness checks case/locator validity, not retrieval quality. Runtime adapters and result collection are not implemented; no case has passed an application run. Final thresholds/configuration are frozen before final execution, and small-sample limits remain explicit.

Checklist: Pass for source/access/scenario/reference/rubric fields; Gap for real corpus ingestion, pilot, thresholds, runtime/provider choices and execution. Handoff: use SP-12 after operational slices work.

Fixture revision synthetic-0.2 adds an explicit JWT rationale in new Current v2 and retains the earlier v1 unchanged as Superseded. This occurred before any provider run or criterion freeze; expected locators follow the Current version. No measured result exists.
