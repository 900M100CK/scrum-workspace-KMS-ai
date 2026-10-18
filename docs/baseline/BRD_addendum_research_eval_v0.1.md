# Proposed research and comparative evaluation addendum

**Artifact ID:** BRD-ADDENDUM-RESEARCH-01  
**Version/date:** 0.1 Proposed · 16 October 2026  
**Status:** Proposed; no new accepted BRD baseline or advisor approval. This section was removed from the v1.0 baseline edition, where it had been inserted after the 7 October date.
**Input:** [BRD v1.0](BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md).

## Research Question and Comparative Evaluation

**Status/date:** Proposed addendum · 14 October 2026; pending formal owner/advisor confirmation of the research framing. This addition does not create a new accepted BRD baseline or change BR-01–BR-15, SC-01–SC-08 or product scope. The owner has separately confirmed the 8/8/9 question-set direction and the methodological clarifications below. No advisor approval or evaluation result is recorded.

**Source:** [Research question and advisor note](../../research-question-and-advisor-note.md), Part B, reconciled with the owner's pilot-freeze and citation decisions. Part A remains an unsent advisor note.

### 13.4.1. Question and hypotheses

Does answering Scrum team questions from structured work-item state combined with permission-controlled document knowledge produce better answers, with no unauthorised disclosure, than document retrieval alone? Sprint membership, backlog order and blocker events supply the structured state source (BR-09, SC-03).

| ID | Hypothesis | Comparison |
| --- | --- | --- |
| H1 | Combined sources improve answers requiring both evidence categories. | C2 versus C0 on `both` questions |
| H2 | Combined sources do not degrade answers needing only one category. | C2 versus C0 on `doc`; C2 versus C1 on `state` |
| H3 | No configuration discloses content, metadata or existence outside the actor's access. | All configurations and permission fixtures in both suites |

Numeric improvement/non-inferiority margins remain open until pilot evidence exists; the words “improve” and “do not degrade” are not yet executable acceptance thresholds.

### 13.4.2. Controlled configurations and questions

| ID | Enabled sources |
| --- | --- |
| C0 | Document retrieval only |
| C1 | Structured work-item and Sprint state only |
| C2 | Both source categories |

Hold the question, actor, data snapshot, provider/model version, prompt, output limit, permission pipeline and applicable evidence validation constant within each comparison. Only enabled source categories change. Record the settings in [the configuration draft](../../eval/config/configurations.yaml); placeholder values are not adopted settings.

The owner adopted 25 research questions: 8 `doc`, 8 `state`, 9 `both`, with new RQ identities and synthetic fixtures. A `both` case must require at least one document claim and one operational claim. Preserve the original 25 EVAL cases as a separate safety regression suite; do not remove revocation, injection, version or provider-failure negatives to obtain balanced group counts. The suites have different snapshots; each C0/C1/C2 comparison must use the same snapshot within its suite and scenario. See [evaluation definitions and limitations](../../eval/README.md).

Author reference claims, evidence locators, expected supported components and safe insufficient-evidence outcomes for every configuration before running it. Give C0/C1 credit for supported components on combined questions, while scoring full-answer completion separately. Do not count a safe refusal as hallucination or infer current state from historical documents.

### 13.4.3. Metrics and freeze sequence

| Metric | Definition and denominator |
| --- | --- |
| Document discovery | Reference source in top five for eligible document-retrieval questions; report multi-source completeness separately |
| Answer correctness | Fixed claim-support rubric and separate complete-answer score; absolute counts by group/configuration |
| Document citation | Exact document/version/passage opens within current access and supports the associated claim |
| Operational citation | Exact entity, revision and observation time support the current-state claim; no invented document locator |
| Latency | Median and p95 end-to-end time with attempt counts, declared hardware/load and errors |
| Leakage defects | Unauthorised content, metadata or existence disclosures; zero known defects allowed in either suite |

Freeze questions, split, reference answers and rubric **before the pilot**. Use pilot evidence to select numeric thresholds/margins, then freeze those **before formal evaluation**, as in §13.3 and OD-07. Version the frozen artifacts and record their hashes; this document does not authorise an agent to commit them. Keep tuning and final cases separate. Record the same number of attempts per question/configuration, including failures and negative outcomes. Never adjust expected answers or thresholds to make an observed result pass.

### 13.4.4. Interpretation, limitations and trace

If H1 is not supported, report the negative result for this question set. If H3 fails in any configuration, the safety release gate fails regardless of H1/H2. A passing finite suite is not proof of absolute security. Twenty-five synthetic questions, small group counts and one provider/model show limited evidence; repeated attempts do not increase the number of independent questions or establish general superiority/statistical significance.

Claims of retrieval improvement still require the matched keyword baseline in §13.1. Claims of reduced search time still require the manual baseline, helper time and learning-effect controls in §13.2. No such claim follows from adding this protocol.

Trace: BR-07/BR-08 for discovery and cited answers; BR-09 and SC-03 for operational state; BR-01/BR-10/BR-14 and business rules 3/6 for access and revocation; business rule 5 for exact citation identity; §13.1–§13.3 and OD-07 for evaluation and thresholds. Checklist: draft protocol and reference definitions authored; semantic review, frozen criteria, pilot, formal evaluation and academic confirmation remain open.

