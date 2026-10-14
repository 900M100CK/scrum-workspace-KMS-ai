# Evidence pipeline evaluation

**Artifact ID:** EVAL-01  
**Version/date:** 0.2 Draft · 14 October 2026\
**Status:** Owner-confirmed research-set direction; draft definitions, no model execution or frozen criteria.\
**Inputs:** BRD §13; PRD-01 v0.5; [PLAN-01](../docs/planning/five-month-plan.md); [adopted research proposal](../docs/analyst/evaluation-25-case-proposal.md); BA-D06/BA-D07; ADR-0009.\
**Author:** development agent acting sequentially; owner reviews business choices.

Maintain two separate suites:

| Suite | Definitions and corpus | Purpose |
| --- | --- | --- |
| Research | [25 RQ cases](research-cases.json) and [research corpus](fixtures/research-corpus.json) | 8 document / 8 state / 9 combined questions for H1/H2, with included H3 negatives |
| Safety regression | [25 EVAL cases](reference-cases.json) and [synthetic-0.3 corpus](fixtures/corpus.json) | Permission, revocation, version, injection and failure coverage; EVAL-05 tests unsaved text exclusion and EVAL-21 declares two immediate revisions |

Each suite currently declares 12 pilot and 13 final cases. These are draft splits, not frozen experiments. Apply each declared scenario mutation and record the resulting snapshot. Never substitute the expanded research corpus for the regression corpus: additional tasks change aggregate state answers. Within each suite/scenario, C0/C1/C2 use the same snapshot, actor, question, prompt, provider/model, permission pipeline and output limit; change only enabled source categories.

Research references include claim-level document/version/passage or operational entity/revision/observation-time evidence, supported and unavailable components, and reference answers per configuration. On combined questions C0/C1 can receive credit for supported components and correct insufficiency; full-answer completion is separate. A safe refusal is not a hallucination. Sources and reference answers are definitions, not generated answers or execution evidence.

Freeze questions, reference claims, split and rubric before pilot use. Select numeric thresholds and H1/H2 margins after the pilot, then freeze them before formal evaluation under OD-07. Keep pilot tuning separate from final cases. Never change expected sources to make an observed run pass. Report absolute counts and denominators by group and configuration; repeated attempts do not create new independent questions.

Record retrieval and generation separately. Top-five eligibility excludes operational-only, denied, missing-evidence and provider-failure cases; multi-source completeness is separate from single-reference discovery. Manually score important claims, exact version/passage and access. Criterion thresholds remain unselected until the pilot. A local/cloud comparison is conditional on a failure/quality question and available configuration; do not build a many-model benchmark.

Per run record case/access/scenario, corpus version, provider/model version, embedding settings, retrieval settings, hardware/load, median/p95 observations, usage/errors, claim scoring and negative outcomes. No private reasoning or unrestricted source content in logs. Never use real protected data with a new external provider without authorisation.

The context harness checks definition structure, reference access, locators, blocker ordering, grouping and configuration source isolation. It does not score generated prose or prove retrieval quality/runtime permissions. Runtime adapters and result collection are not implemented; no case has passed an application run. Provider/model, snapshot hashes, token limit and repetition count remain unset in the [configuration draft](config/configurations.yaml).

Operational citation scoring uses entity identity, revision and observation time, not document passages. H3 covers both suites: any unauthorised content, metadata or existence disclosure fails the safety gate regardless of quality scores. A matched keyword comparison is required before claiming retrieval improvement. A measured manual baseline including helper time and learning effects is required before claiming time saved.

Checklist: Pass for authored synthetic fixtures, research configuration references and regression lifecycle correction; Author semantic review and proposed scoring definitions are in [EVAL-RUBRIC-01](rubric.md); Gap for independent semantic review, regression expectations under each source-disabled configuration, frozen rubric/splits, real ingestion, pilot, thresholds and runtime execution. Handoff: finish definition review before pilot; use SP-12 after operational slices work.

Fixture revision synthetic-0.2 adds an explicit JWT rationale in new Current v2 and retains the earlier v1 unchanged as Superseded. This occurred before any provider run or criterion freeze; expected locators follow the Current version. No measured result exists.

Research snapshot synthetic-research-0.1 derives from that fixture, excludes the legacy Draft and adds explicit source-task links and operational observations. Regression synthetic-0.3 retains saved evidence unchanged while removing the old product Draft. EVAL-21 declares two new immutable Current revisions as scenario inputs, with historical citations retained. The context materializer only validates definitions; real handler/retrieval tests must execute and verify the scenario independently.

Historical [synthetic-0.2](fixtures/history/synthetic-0.2.json) and [pre-correction working definitions](fixtures/history/reference-cases-pre-lifecycle-0.2.json) are retained with hashes in current files. They were never executed and must not be ingested as current fixtures. EVAL-05/21 retain IDs with an explicit change note; no expected result was changed to make a model run pass.

H3 uses operation-specific entitlement under [ADR-0012](../docs/adr/0012-audit-visibility-and-durable-evidence.md). Scoped audit identity/time is intentionally permitted without document content access; the same actor still needs a read grant for content, citations and AI evidence. TC-11/18 cover inspection and minimum durable provenance outside the 25-question quality comparison. No independent review or academic approval is claimed.

Semantic correction before any pilot: research cases v0.2 use partially_answered for supported subsets, clarify RQ-20/22, and record RQ-22 operational target-selection dependency. C0 cannot receive an answer-key task selector. Prior unexecuted v0.1 definitions are retained with hash in the current file. RQ-09 reference output no longer contains the other-project identifier from its exclusion instruction. See rubric.md for scoring denominators, held-out-question limitations and remaining input requirements.

Owner-confirmed EVAL-19 correction: safety definitions v0.3 require current API, JWT and session citations and conflict in C0/C2; C1 returns insufficient_evidence. The case now contains explicit configuration expectations and reference answers. Prior v0.2 is preserved with its hash in the current file. See [configuration applicability matrix](safety-configuration-expectations.md); other cases still need machine-readable configuration expectations and runtime wiring. No pilot/model execution or freeze occurred.
