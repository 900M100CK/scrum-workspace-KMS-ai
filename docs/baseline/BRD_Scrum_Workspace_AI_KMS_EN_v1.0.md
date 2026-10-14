# BUSINESS REQUIREMENTS DOCUMENT (BRD)

## Scrum Team Workspace with AI-Assisted Project Knowledge Management

**Version:** 1.0 — Draft for business validation  
**Date:** 7 October 2026  
**Project orientation:** Software Engineering graduation project: build and verify an application that integrates existing technologies to address a business problem.  
**Translation basis:** BRD_Scrum_Workspace_AI_KMS_VI_v1.0.md. Requirement identifiers, priorities, scope and evaluation commitments are preserved. This English edition does not introduce an additional product release.

## 1. Executive Summary

The project delivers a web application for a software development team working with Scrum. It combines Project, Product Backlog, Sprint and task management with the management of documents, decisions and knowledge related to the team's work. AI helps members retrieve and synthesise information from sources they are authorised to access, with citations that can be checked.

The engineering focus is connecting work data to project knowledge; managing versions and access permissions; integrating structured data retrieval with document search; and retaining evidence for inspection. The project does not aim to invent an AI algorithm, train a new model or demonstrate superiority over every existing product.

AI meeting assistance, speech recognition and transcript-based task update suggestions are Future Work. Tools such as LM Studio and Agno are implementation options to assess during design, rather than mandatory business requirements.

## 2. Background and Target Users

The initial target is a small software development team comprising a Product Owner, Scrum Master and Developers, including development and testing activities. The team uses Scrum to manage work and maintains knowledge such as requirements, API specifications, technical guidance, design decisions and blocker resolution history.

The application may support several projects, but the MVP excludes multi-level enterprise governance, portfolio management and coordination across multiple Scrum teams. Deployment scale and concurrent load will be defined in the PRD/SRS according to project resources.

The following pain points are business hypotheses. Interview findings or baseline measurements have not yet established their frequency or impact in the target team.

## 3. Pain Points

| ID | Hypothesised difficulty | Example | Impact to validate |
| --- | --- | --- | --- |
| PP-01 | Knowledge is scattered and poorly linked to tasks | Tasks are on a board, specifications in documents, and change rationale in chat | Time spent finding and combining information |
| PP-02 | Tasks lack implementation context | An authentication change has no linked decision or constraints | Repeated questions, misunderstood requirements or rework |
| PP-03 | Current sources are difficult to identify | Several specification versions exist while a task still references an old one | Development or testing based on outdated information |
| PP-04 | Knowledge depends on individuals | Only the original developer remembers why a solution was chosen | Interruptions during absence and slower onboarding |
| PP-05 | Previous experience is difficult to reuse | A blocker recurs but its previous resolution cannot be found | Repeated investigation and discussion |
| PP-06 | Answers lack supporting evidence | An answer does not identify its source or version | Difficulty checking and applying the information |

## 4. Problem Statement

Software development teams working with Scrum need to manage both work progress and the knowledge required to perform that work. When tasks, technical documents and project decisions are stored in different places without consistent links, access control and version management, members struggle to find applicable information and understand a task's context.

This separation may increase search time and repeated questions, contribute to misunderstood requirements and repeated work, and create dependence on members who hold particular knowledge. The team needs a workspace that connects Scrum data to project knowledge and supports evidence-backed retrieval within the user's access permissions.

**Value hypothesis:** Connecting knowledge sources to work and supporting natural-language search helps members find, verify and reuse information in the target situations. This must be validated; placing everything in one interface is not sufficient evidence of value.

## 5. 5P's Analysis

This document uses **Problem – People – Process – Platform – Performance** as the project's analysis framework. It does not claim that all courses or organisations use the same definition of the 5P's.

| P | Analysis | Response direction |
| --- | --- | --- |
| Problem | Work and knowledge lack links; relevant, current sources are difficult to find | Connect tasks, Sprints, documents and decisions; retrieve with evidence |
| People | Members need information for their responsibilities; knowledgeable colleagues are not always available | Permission-aware self-service retrieval and shared content ownership |
| Process | Knowledge changes during refinement, development, testing and review | A lifecycle for creation, revision, replacement, archival and links to work |
| Platform | Task states and document content require different retrieval methods | Combine structured queries with text/semantic search and LLM synthesis |
| Performance | Usefulness must be measured rather than inferred from the presence of AI | Evaluate retrieved sources, answers, access control and task completion time |

## 6. Business Objectives

| ID | Objective | Evaluation evidence |
| --- | --- | --- |
| BO-01 | Support Scrum work management through a basic workflow | Complete Project → Backlog → Sprint → Board → Sprint completion |
| BO-02 | Help members access relevant context from tasks or documents | Locate related documents, decisions and tasks in representative scenarios |
| BO-03 | Support verifiable information retrieval | AI cites the correct passage and version; users can open the source |
| BO-04 | Reduce dependence on individual availability in target situations | Members locate sources without assistance from the person holding the knowledge |
| BO-05 | Protect knowledge according to permissions and validity | No unauthorised disclosure in tests; outdated material is not presented as current |

No advance commitment is made to a 40% time reduction or a productivity improvement without a baseline. Numerical targets will be set after a pilot and recorded in the PRD or test plan.

## 7. Stakeholders and Responsibilities

| Role | Main need | Responsibility within the product |
| --- | --- | --- |
| Product Owner | Trace requirements and prioritise work | Manage Product Backlog ordering; maintain or assign ownership of requirement sources |
| Scrum Master | Understand impediments and their context | Follow blockers and resolution history; support workspace use within the Scrum process |
| Developer | Understand tasks, constraints and technical decisions | Update work and maintain assigned technical knowledge |
| Member performing QA | Find requirements and testing evidence | Link testing information to tasks and requirement sources; QA may be part of Developers |
| Viewer/Stakeholder | Follow shared information | View permitted data, without automatic access to all project documents |
| Workspace Admin | Administer membership and access settings | Manage members, permissions and configuration; administration does not automatically grant access to all restricted content |

The Scrum Master is not automatically responsible for storing, maintaining or approving all project knowledge. Content ownership is assigned according to business responsibilities. Scrum accountabilities and software permissions are distinct; the latter will be specified in the PRD/SRS.

## 8. Product Scope

### 8.1. Core — MVP

- Projects, membership and access permissions.
- Product Backlog items of type Story/Task/Bug, with descriptions, ordering and assignees.
- Sprints with dates, Sprint Goals, Sprint Backlogs and start/completion workflows.
- A board with basic states and blocker management; changes synchronised between members.
- Creation/import of text or Markdown documents organised by project, labels and content owner.
- Version and validity management for documents/decisions, retaining necessary history.
- Manual links between Task, Document, Decision and Sprint to form a basic knowledge map.
- Knowledge search and AI question answering with citations and user-specific access limits.
- Retrieval of current work states from operational business data.
- Audit logs for significant changes and source provenance for AI output inspection.
- Fallback: work management, document reading and search remain usable when the LLM is unavailable.

More complex import formats will be selected in the PRD. OCR is not an MVP completion condition.

### 8.2. Enhanced — After Core Completion

- Import of text-based PDFs and additional document formats.
- Team-level Burndown/Velocity and basic Sprint reports.
- A visual knowledge map and suggested links for user confirmation.
- External repository/issue tracker integration and advanced hybrid search.
- Extended local LLM deployment support if the target configuration meets quality and latency needs.

### 8.3. Future Work / Outside the MVP

- AI meeting assistance: STT, summaries, action item extraction and transcript-based task update suggestions.
- Audio/video meeting rooms, live transcription and speaker identification.
- AI Story Point estimation, Sprint forecasting or automatic assignment.
- Automatic knowledge graph construction, multiple specialised agents and complex change-impact analysis.
- Fine-tuning, new model training, extensive OCR and enterprise support across multiple teams.
- Payments, building CI/CD runners or hosting code repositories.

## 9. High-Level Business Requirements

| ID | Requirement | Priority | Traceability |
| --- | --- | --- | --- |
| BR-01 | The team must manage projects, membership and access permissions | Must | BO-01, BO-05 |
| BR-02 | The PO must manage Product Backlog content and ordering; the team must manage Sprint Goals and Sprint work | Must | BO-01 |
| BR-03 | Authorised members must update states, assignees and blockers; changes must be shared with the team | Must | BO-01 |
| BR-04 | The team must store and organise documents and decisions with content ownership | Must | PP-01, PP-04 |
| BR-05 | The team must distinguish versions and current, superseded or archived content | Must | PP-03, BO-05 |
| BR-06 | Users must link and access relevant knowledge from tasks, Sprints or documents | Must | PP-02, PP-05 |
| BR-07 | Users must search sources they may access; supported languages and scope must be stated | Must | BO-02, BO-05 |
| BR-08 | AI must support answers from authorised sources with source/version citations, and report insufficient evidence or conflicts when detected | Must | PP-06, BO-03 |
| BR-09 | Questions about current state must use current operational data, rather than infer it solely from old documents | Must | BO-03, BO-05 |
| BR-10 | Permissions must apply to search, AI context, answers, citations and log access | Must | BO-05 |
| BR-11 | Significant changes to work and knowledge must retain the actor, time and affected object | Must | BO-03, BO-05 |
| BR-12 | Authorised users must inspect the sources and necessary retrieval steps behind an answer | Must | BO-03 |
| BR-13 | Scrum management and document access must remain usable when AI fails or resources are exhausted | Must | BO-01, BO-02 |
| BR-14 | The team must archive/delete content and remove content that is no longer permitted for retrieval | Must | BO-05 |
| BR-15 | The team should view basic Sprint reports derived from work data | Should | BO-01 |

## 10. Business Rules

1. MVP AI reads and answers; it does not autonomously change tasks, Backlog priorities, assignees or documents.
2. Operational application data is the source of truth for current task/Sprint state. Historical documents explain the past but do not replace current state.
3. Access must be checked before content enters AI context. Filtering the final answer is not a substitute for retrieval access control.
4. Historical versions must be labelled. Where source conflicts remain unresolved, the system must not assume the latest source is universally correct.
5. Each citation must identify the source and version used. Opening it must not silently redirect to another version.
6. Revisions, replacements, deletion and permission revocation must affect search and caches according to a specified policy. Content that a user can no longer access must not continue to support their answers.
7. Audit logs and traces may contain sensitive information; access and retention must be controlled. Internal model reasoning is not collected or treated as business evidence.
8. Story Points, if used, are team estimates, not individual productivity measures or automatic conversions to hours.
9. Completion transitions follow the team's workflow and completion rules. The Scrum Master does not automatically approve every change.
10. MVP knowledge-map relationships are created or confirmed by users. Unconfirmed relationships are not presented as established facts.

## 11. Representative Business Scenarios

| ID | Scenario | Expected outcome |
| --- | --- | --- |
| SC-01 | A member opens an authentication task | Access permitted specifications, decisions and related information |
| SC-02 | Ask “Why did the team choose JWT?” | Answer from a recorded decision with a source passage and version |
| SC-03 | Ask “Which tasks are currently blocked?” | List from current operational state with task links |
| SC-04 | Ask “How was this blocker handled previously?” | Locate history and relevant sources; do not equate a plan with confirmed resolution |
| SC-05 | A new API document version supersedes the old one | Current retrieval uses applicable content; historical viewing distinguishes versions |
| SC-06 | A user lacks source access | Do not disclose restricted content or metadata the user may not view |
| SC-07 | Ask about a decision never recorded | Report insufficient information rather than invent a rationale |
| SC-08 | The LLM is unavailable | Board operations and fallback document search/reading remain available |

## 12. Constraints, Assumptions and Technical Direction

### 12.1. Constraints

- Scope must fit graduation-project resources and time; complete a business flow before expanding integrations.
- Existing libraries, models and platforms may be used. Engineering quality is demonstrated through design, integration, failure handling and verification.
- AI cost, hardware needs and processing time must suit the target deployment.
- Use only permitted test data, preferably synthetic or explicitly authorised material.
- Do not claim absolute security, zero hallucinations or Zero Data Retention without evidence of the specific configuration/policy.

### 12.2. Assumptions to Validate

- The team has documents or is willing to record some important knowledge.
- Content owners can be assigned to maintain documents and decisions.
- Some situations benefit from direct source retrieval, either instead of or alongside asking colleagues.
- The team accepts a basic Scrum workflow instead of extensive customisation.

### 12.3. Technical Direction — Not a Final Architecture Decision

Project/Sprint/Task data is structured. Documents and relationships have identity, versions and permissions. Semantic search/vector storage supports content discovery; identifier lookups and work-state queries use operational data. An LLM synthesises controlled context.

LM Studio may be considered for local model serving; Agno may be considered for tool orchestration and tracing. They are not mutually exclusive, but using both is not mandatory. Final tools will be selected through resource-appropriate trials.

The modular monolith versus microservices decision belongs in the architecture documentation. Microservices require justified domain boundaries and explicit consistency, failure and observability handling. Service count is not a business success criterion.

## 13. Evaluation Plan and Acceptance Criteria

This project evaluates an integrated system. A research-scale ML benchmark or comparison of many models is not mandatory. Tracing diagnoses execution; evaluation assesses correctness and usefulness. A complete trace does not prove a correct answer.

### 13.1. Initial Evaluation Set

Prepare approximately 20–30 questions from a sample project covering source discovery, decisions, current state, old versions, missing information and unauthorised access. Each case specifies reference sources/versions or insufficient evidence, the questioner's permissions, and scoring criteria. This is an initial evaluation set, not a representative sample of all Scrum teams.

| Area | Measurement | Use of results |
| --- | --- | --- |
| Retrieval | Share of eligible questions with at least one reference source in the top five; identify multi-source questions | Assess discovery and analyse missed sources |
| Answer quality | Share passing content criteria; check whether important claims are supported | Manual rubric scoring; an LLM judge is supplementary if used |
| Citations | Share opening the correct source/version and supporting the associated claim | Distinguish a link from evidence supporting an answer |
| Versions and insufficient evidence | Correct handling of outdated, conflicting and absent sources | Identify limitations and defects |
| Authorisation | Unauthorised search, answer, citation and log-access cases | No accepted disclosure in the test suite; passing tests does not prove absolute security |
| Processing time | Median and p95 under declared hardware, data and load | Set realistic PRD/SRS NFRs rather than arbitrary latency promises |
| Search value | Semantic/hybrid versus keyword search on the same cases if retrieval improvement is claimed | Check the benefit of the selected technique |

### 13.2. Conditional User Baseline

If the report claims reduced information-search time, run a small comparison using equivalent tasks under the manual process and the application. Measure searcher time, helper time, correct-source discovery and completion when the knowledgeable person is unavailable. Avoid learned questions and unfair differences in interface familiarity.

Asking colleagues may be faster in some situations. Where improvement is not shown, narrow the claim or revise the product; do not interpret results as though AI is automatically better.

### 13.3. Core Completion Conditions

- Must requirements and Core scenarios are completed with appropriate functional verification.
- Sources and versions are accessed/displayed consistently; no known unauthorised-access defects remain open in the test suite.
- Work management remains usable during AI failure.
- Retrieval/answer evaluation results include runtime configuration, observed failures and explicit limitations.
- AI quality thresholds are set in the PRD/test plan after the pilot and before final evaluation, not selected after final results are known.

### 13.4. Proposed Addendum: Research Question and Comparative Evaluation

**Status/date:** Proposed addendum · 14 October 2026; pending formal owner/advisor confirmation of the research framing. This addition does not create a new accepted BRD baseline or change BR-01–BR-15, SC-01–SC-08 or product scope. The owner has separately confirmed the 8/8/9 question-set direction and the methodological clarifications below. No advisor approval or evaluation result is recorded.

**Source:** [Research question and advisor note](../../research-question-and-advisor-note.md), Part B, reconciled with the owner's pilot-freeze and citation decisions. Part A remains an unsent advisor note.

#### 13.4.1. Question and hypotheses

Does answering Scrum team questions from structured work-item state combined with permission-controlled document knowledge produce better answers, with no unauthorised disclosure, than document retrieval alone? Sprint membership, backlog order and blocker events supply the structured state source (BR-09, SC-03).

| ID | Hypothesis | Comparison |
| --- | --- | --- |
| H1 | Combined sources improve answers requiring both evidence categories. | C2 versus C0 on `both` questions |
| H2 | Combined sources do not degrade answers needing only one category. | C2 versus C0 on `doc`; C2 versus C1 on `state` |
| H3 | No configuration discloses content, metadata or existence outside the actor's access. | All configurations and permission fixtures in both suites |

Numeric improvement/non-inferiority margins remain open until pilot evidence exists; the words “improve” and “do not degrade” are not yet executable acceptance thresholds.

#### 13.4.2. Controlled configurations and questions

| ID | Enabled sources |
| --- | --- |
| C0 | Document retrieval only |
| C1 | Structured work-item and Sprint state only |
| C2 | Both source categories |

Hold the question, actor, data snapshot, provider/model version, prompt, output limit, permission pipeline and applicable evidence validation constant within each comparison. Only enabled source categories change. Record the settings in [the configuration draft](../../eval/config/configurations.yaml); placeholder values are not adopted settings.

The owner adopted 25 research questions: 8 `doc`, 8 `state`, 9 `both`, with new RQ identities and synthetic fixtures. A `both` case must require at least one document claim and one operational claim. Preserve the original 25 EVAL cases as a separate safety regression suite; do not remove revocation, injection, version or provider-failure negatives to obtain balanced group counts. The suites have different snapshots; each C0/C1/C2 comparison must use the same snapshot within its suite and scenario. See [evaluation definitions and limitations](../../eval/README.md).

Author reference claims, evidence locators, expected supported components and safe insufficient-evidence outcomes for every configuration before running it. Give C0/C1 credit for supported components on combined questions, while scoring full-answer completion separately. Do not count a safe refusal as hallucination or infer current state from historical documents.

#### 13.4.3. Metrics and freeze sequence

| Metric | Definition and denominator |
| --- | --- |
| Document discovery | Reference source in top five for eligible document-retrieval questions; report multi-source completeness separately |
| Answer correctness | Fixed claim-support rubric and separate complete-answer score; absolute counts by group/configuration |
| Document citation | Exact document/version/passage opens within current access and supports the associated claim |
| Operational citation | Exact entity, revision and observation time support the current-state claim; no invented document locator |
| Latency | Median and p95 end-to-end time with attempt counts, declared hardware/load and errors |
| Leakage defects | Unauthorised content, metadata or existence disclosures; zero known defects allowed in either suite |

Freeze questions, split, reference answers and rubric **before the pilot**. Use pilot evidence to select numeric thresholds/margins, then freeze those **before formal evaluation**, as in §13.3 and OD-07. Version the frozen artifacts and record their hashes; this document does not authorise an agent to commit them. Keep tuning and final cases separate. Record the same number of attempts per question/configuration, including failures and negative outcomes. Never adjust expected answers or thresholds to make an observed result pass.

#### 13.4.4. Interpretation, limitations and trace

If H1 is not supported, report the negative result for this question set. If H3 fails in any configuration, the safety release gate fails regardless of H1/H2. A passing finite suite is not proof of absolute security. Twenty-five synthetic questions, small group counts and one provider/model show limited evidence; repeated attempts do not increase the number of independent questions or establish general superiority/statistical significance.

Claims of retrieval improvement still require the matched keyword baseline in §13.1. Claims of reduced search time still require the manual baseline, helper time and learning-effect controls in §13.2. No such claim follows from adding this protocol.

Trace: BR-07/BR-08 for discovery and cited answers; BR-09 and SC-03 for operational state; BR-01/BR-10/BR-14 and business rules 3/6 for access and revocation; business rule 5 for exact citation identity; §13.1–§13.3 and OD-07 for evaluation and thresholds. Checklist: draft protocol and reference definitions authored; semantic review, frozen criteria, pilot, formal evaluation and academic confirmation remain open.

## 14. Risks and Responses

| Risk | Impact | Response |
| --- | --- | --- |
| Scrum + KMS + AI scope becomes too broad | Incomplete Core | Keep the workflow basic; leave meeting AI and forecasting as Future Work |
| Missing or outdated documents | Unreliable AI evidence | Content ownership, version/validity management and insufficient-evidence responses |
| Retrieval selects the wrong passage | Incorrect answers despite fluent generation | Reference-source tests, retrieval/chunking adjustments and identifier lookup |
| Hallucination or malicious instructions in documents | Unreliable or out-of-scope behaviour | Treat source content as data, restrict read tools and validate output; no MVP AI write tools |
| Index/cache retains revoked content | Disclosure or stale answers | Current permission checks, index cleanup and revocation tests |
| Local model fails quality/latency needs | Poor user experience | Pilot on target hardware, retain fallback and consider another permitted provider |
| Logs or cloud processing expose data | Privacy impact | Policies for embeddings/LLM/logs, minimisation and access control; masking is not assumed to remove every secret |
| Members do not maintain knowledge | Declining repository value | Link content from tasks, assign owners and reduce recording effort |

## 15. Initial Traceability Matrix

| Pain point | Objective | Requirements | Verification |
| --- | --- | --- | --- |
| PP-01, PP-02 | BO-02 | BR-04, BR-06, BR-07 | SC-01; relevant-source retrieval |
| PP-03 | BO-05 | BR-05, BR-09, BR-14 | SC-03, SC-05; version tests |
| PP-04 | BO-04 | BR-04, BR-07, BR-08 | SC-02; discovery without colleague assistance |
| PP-05 | BO-02 | BR-06, BR-07 | SC-04; blocker history retrieval |
| PP-06 | BO-03 | BR-08, BR-11, BR-12 | SC-02, SC-07; citation verification |
| Access protection | BO-05 | BR-01, BR-10, BR-14 | SC-06; permission-revocation tests |
| Business continuity | BO-01, BO-02 | BR-13 | SC-08; simulated AI failure |

## 16. Deliverables and Open Decisions

**Deliverables:** BRD; PRD/SRS and user stories/acceptance criteria; architecture and data design; working application; evaluation data/scenarios; test results; deployment instructions; limitations and Future Work report.

**Next decisions:** Pilot team; document formats; permission model; deployment configuration and AI provider; retention/deletion policy; post-pilot latency and quality thresholds; architecture; development schedule based on actual time available.

BRD v1.0 records the agreed scope and business hypotheses. Its creation is not evidence of validated user demand or academic approval.
