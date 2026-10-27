# Implementation inputs and technology-stack review

**Artifact ID:** IMPL-REVIEW-01\
**Version/date:** 0.2 Draft · 26 October 2026\
**Status:** Bounded review with author-rechecked documentation corrections; runtime/decision gates remain open. No independent product acceptance.\
**Snapshot inputs:** TECH-STACK-01 v1.4; IMPL-REG-01 / IMPL-DEC-01 / IMPL-SP-01 v0.2; other implementation pack artifacts v0.1; PRD-01 v0.9; SPEC-INDEX v0.4; SAD-03 v0.16; EVAL-01 v0.2; current contracts, UX and ADR-0001–ADR-0023.\
**Trace:** Existing BR-01–BR-14 / SC-01–SC-08; especially identity/access, work reconstruction, evidence and evaluation readiness.\
**Owner role:** SDLC coordinator consolidating three owner-requested read-only agent reviews.\
**Review queue:** Bounded portions of DR-05 / DR-08 / DR-09 / DR-10 / DR-12. Whole queue groups remain Not reviewed.

## Scope and method

The owner requested agent passes to find missing implementation documents, including the technology stack. Reviewers inspected local source text, linked consumers and actual configuration. They did not select technologies, change accepted decisions or edit implementation sources. The coordinator rechecked cited locations and writes this report/registration only. Earlier work by the coordinator remains author-produced; multiple reviewer agents do not establish independent academic, security or product acceptance.

| Reviewer pass | Roles/lenses | Main sources |
| --- | --- | --- |
| stack_readiness | Architecture and application setup | [technology stack](../../tech-stack.md), stack/storage/provider ADRs, package/lockfiles, [web preview](../../../apps/web/README.md), [storage configuration](../../../infra/postgres/compose.yaml) |
| trace_contract_review | PRD → data → API → consistency | [implementation register](../../implementation/register.md), task packs, PRD/specs, [contract pack](../../../contracts/README.md), [permission matrix](../../ux/permission-matrix.md), data-fit and protocol references |
| ux_eval_ops_review | UX → tests/evaluation → operations | UX inputs, [evaluation guide](../../../eval/README.md), rubric/configuration/applicability, [storage runbook](../../../infra/postgres/README.md), [CI workflow](../../../.github/workflows/context.yml) |

The review uses [SDLC workflow](../../../agents/WORKFLOW.md), relevant role profiles, [template guide](../../../agents/template-guide.md), project pre-flight and local Karpathy/Ponytail/Review guidance. This is not an exhaustive row-by-row review of every upstream workbook or all repository documentation. No standards-conformance claim follows.

## Outcome and classification

No absent top-level BRD/PRD/data/API/UX/test/spec family was identified in this bounded review. Most missing inputs already exist and need explicit registration, not duplicate documents. A task needed to make evaluation executable is missing from the new breakdown. Stack source text also has concrete drift from the working tree.

| Classification | Result |
| --- | --- |
| Existing document, missing direct registration | Contract-pack semantics/event schema; permission matrix; protocol references; data-fit review; UX wireframes/reference/skill routing; evaluation rubric/config/applicability; earlier owner-confirmation records |
| Existing document, incorrect metadata or current-state description | Stack Compose path and UI layout description; stack decision input header; evaluation guide labelled unversioned in implementation register |
| Missing explicit execution task | Build/wire the evaluation runner and result collection before pilot; complete/verify configuration applicability |
| Open decision already recorded | Stack/identity/session, capability provisioning, provider/wire mapping, retention and detailed Proposed handoff mechanics |
| Later implementation output, not a missing preparation document | Chosen-version compatibility results and actual application build/start/test/deployment instructions after the relevant choices and handlers exist |

## Findings requiring correction

The v0.1 findings below were Open when reviewed. Their source locations, hashes and descriptions are retained as the pre-correction snapshot; line numbers refer to that snapshot. See the current disposition below. Severity concerns documentation/readiness, not a proven runtime defect.

### IR-01 — Important: evaluation runs have no explicit runner implementation step

**Evidence:** [SP-12](../../implementation/tasks/12-failure-and-evaluation.md), lines 32–46, moves from inspecting definitions/configuration applicability in SP-12.1 to running pilot/final evaluation in SP-12.3. [Evaluation guide](../../../eval/README.md), line 26, explicitly says runtime adapters/result collection are unimplemented. [Safety applicability matrix](../../../eval/safety-configuration-expectations.md), line 61, retains runner and configuration-aware machine-readable expectation gaps.

**Concrete failure:** An agent can finish preparation by reading the definitions, then reach a pilot task without an executable adapter, scenario materialisation or trustworthy result capture. Existing schema/reference tests cannot supply those observations.

**Affected:** SP-12.1 / SP-12.3, D-10; BR-07/08/09/10/12/13 and evaluation commitments. **Correction owner:** test/evaluation author with application adapter owner.

**Smallest correction:** Expand SP-12.1 to own runner/adapters, declared scenario snapshot application/verification, configuration applicability/expectations and result/transport observation capture. Require configuration isolation and fixture-oracle checks before pilot. Link the existing rubric, config and safety matrix. Preserve the research/safety split, unchanged reference answers and freeze rules; no new evaluation framework is prescribed.

**Closure evidence:** Revised task/inputs with an explicit runner prerequisite; later actual runner smoke/negative results before pilot. A documentation correction alone does not mean the runner or model evaluation passed.

### IR-02 — Important: technology layout misstates the existing UI implementation

**Evidence:** [Technology stack](../../tech-stack.md), line 203, says no UI is implemented; line 208 identifies `apps/web/` as a React 19 / Vite / Tailwind SPA. [Web guide](../../../apps/web/README.md), line 3, documents the existing synthetic interactive preview and keeps React/TypeScript adoption Proposed. [Web package manifest](../../../apps/web/package.json), line 5, starts a plain Node preview. Root package dependencies alone do not establish the application's selected framework.

**Concrete failure:** SP-01.1 or later UI integration can assume an existing React application or replace working preview code to match a candidate tree. Both interpretations lose the distinction between implemented presentation work and selected production stack.

**Affected:** D-01, SP-01.1 / SP-01.3 and subsequent UI packs; BR-01/02/03/10/13. **Correction owner:** architecture/stack author.

**Smallest correction:** Show the current plain-JS preview separately from the candidate application toolchain, link its README and retain its selected visual/interaction work. Framework adoption remains a decision; preview tests remain separate from handler acceptance.

**Closure evidence:** Stack layout/status matches actual web entry points and manifests; version/input/register reconciliation; no package adoption implied.

### IR-03 — Important: storage topology names a nonexistent configuration file

**Evidence:** [Technology stack](../../tech-stack.md), line 111, names `infra/postgres/docker-compose.yml`. The actual file is [infra/postgres/compose.yaml](../../../infra/postgres/compose.yaml); [database runner](../../../scripts/database.mjs), line 9, selects it.

**Concrete failure:** An agent following the stack input can search for or create a second Compose file instead of reusing the implemented storage foundation.

**Affected:** SP-01.1 and persisted slices; BR-01/05/07/13. **Correction owner:** architecture/stack author.

**Smallest correction:** Replace the stale path with a link to the actual Compose file and storage runbook. No storage version, credential or deployment change is needed.

**Closure evidence:** Link resolves and agrees with the runner; existing runbook remains the operational authority. No live storage test is implied by the path correction.

### IR-04 — Important: required supporting semantics are not directly registered

**Evidence:** [Implementation source register](../../implementation/register.md), lines 20–29, supplies high-level architecture, model, raw OpenAPI and generic UX/evaluation sources. The sources in the matrix below exist, but direct input selection is incomplete. Canonical specs and other sources retain transitive links, so this is not lost documentation or a claim that nothing can be found.

**Concrete failure:** A task brief selected only from the new register can omit replay/event semantics, independent action permissions or executable protocol prerequisites. Those inputs are not fully replaced by reading raw OpenAPI or a generic flow.

**Smallest correction:** Add compact source rows with intended task use and snapshot/evidence limits; link sensitive protocol prerequisites from SP-11.2. Do not copy source bodies or add new infrastructure.

| Existing input to register | Used by | Required distinction / correction owner |
| --- | --- | --- |
| [Contract pack](../../../contracts/README.md), especially lines 13–23; [domain-change schema](../../../contracts/events/domain-change.schema.json) | SP-02–11 | Replay still checks current authority; event is invalidation hint, never permission authority. No broker is selected. API author/coordinator |
| [Permission/action matrix](../../ux/permission-matrix.md), especially lines 13/20/51 | SP-02/06/07/09/13 | Screen/action scope and independent read/write/manage rights; delegation remains open. UX/API author |
| [Byte-binding reference](../references/handoff-byte-reference-2026-10-18.md), line 15; [SQL projection](../references/handoff-sql-projection-2026-10-18.md), line 11; [query](../../../services/knowledge/queries/get-handoff-manifest.sql) | SP-09/11 | Existing synthetic/SQL prerequisites are not live current-authority/guard/send evidence. Canonical SP-11 already names them. Data/contract author |
| [Data-policy fit review](../data-policy-fit-review.md), line 11 and dated follow-ups | SP-02/05–08/11 | Read snapshot plus later corrections; do not relabel every historical gap as still absent. Data author |
| [UX entry](../ui-ux-spec.md), [wireframe workplan](../../ux/wireframe-workplan.md), [native frame inventory](../../ux/wireframes/README.md), [reference desk](../../../references/README.md), [UI skill routing](../../../agents/development-skills.md#ui-skill-workflow) | UI work in SP-01–09/13 | Preserve canonical skill paths, owner-selected visual direction and frame/state acceptance limits. UX author/coordinator |
| [Evaluation rubric](../../../eval/rubric.md), [configuration draft](../../../eval/config/configurations.yaml), [safety applicability](../../../eval/safety-configuration-expectations.md) | SP-09/10/12 | Definitions/configuration applicability versus measured results; separate RQ/EVAL snapshots. Evaluation author |
| [Earlier owner input](../../../owner-decisions-OD-02-03-04-11.md), [business-review record](../../analyst/business-review-2026-10-13.md) | Relevant decision preparation across packs | Already reachable through ADRs; direct provenance avoids re-asking settled choices. Coordinator; navigation improvement within this group |

**Closure evidence:** Registered paths/versions resolve and each source has its consuming task and correct evidence status. This does not close the underlying implementation gates.

### IR-05 — Minor: stack header omits later decision inputs used in its body

**Evidence:** [Technology stack](../../tech-stack.md), line 7, lists ADR inputs only through ADR-0006. Its later guard/board text relies on ADR-0008, ADR-0012 and OWNER-Q-01 (lines 137/156/178).

**Impact:** A reviewer or fresh agent can freeze incomplete policy inputs and interpret the older guard proposal as the complete current direction. **Affected:** D-01/D-07, SP-01/04/09/11; evidence provenance. **Correction owner:** architecture/stack author.

**Smallest correction and closure:** Reconcile all actually cited decision inputs in the stack header, then update its source version and dependent registers. Preserve original decision status and dated external-version observations. No new ADR or technology selection is needed.

### IR-06 — Minor: registered evaluation guide is incorrectly called unversioned

**Evidence:** [Implementation register](../../implementation/register.md), line 29, says `eval guide unversioned`. [Evaluation guide](../../../eval/README.md), lines 3–6, declares EVAL-01 v0.2 Draft with no model execution or frozen criteria.

**Impact:** SP-12/handoff snapshot identity is inaccurate. **Correction owner:** coordinator. **Smallest correction and closure:** Register EVAL-01 v0.2 and its actual status. Its older input versions remain a source snapshot; fixing the row does not claim the evaluation guide has been semantically refreshed.

## Decisions and future outputs already accounted for

| Topic | Existing record | Required next output, not a duplicate document |
| --- | --- | --- |
| Application stack | [D-01 and SP-01.1](../../implementation/decisions.md), [stack ADR](../../adr/0003-student-stack.md) | Exact selected versions and observed compatibility/build/start/test evidence. Add application DB driver/adapter, connection/transaction ownership and pooling/configuration fields to that existing choice brief; no adapter is selected by this review. |
| Identity/session | D-02 / PRD OD-09 / SP-01 | Chosen verification/provisioning/expiry/cookie-CSRF mechanics and tests |
| Capability provisioning | D-03 / OD-02/08 | Explicit grant authority; no role-derived bypass |
| Provider and transport | D-06/D-07 / provider and handoff ADRs | Permitted configuration, final-wire mapping and retained guard/evidence guarantees with live tests |
| Retention/cleanup | D-09 / OD-04/08 | Physical policy and safe cancellation/cleanup before purge; retain inaccessible orphans meanwhile |
| Application setup/deployment | Architecture/deployment views, D-01 and [execution guide](../../implementation/execution.md) | Actual application configuration/startup/health/failure/deployment instructions when implemented. Existing storage runbook already covers storage. Local TLS/proxy is still an implementation gap, not an instruction to invent a production platform now. |

No new dependency deadlock was found in this bounded pass: [roadmap](../../implementation/roadmap.md), line 28, explicitly separates co-delivered mutation audit from later AI evidence/inspection.

## Snapshot identity and checks

The reviewed working tree contains unrelated local edits and untracked implementation files. No commit was made. Exact SHA-256 values of the principal inputs below identify this review snapshot; later fixes do not rewrite these hashes.

| Reviewed source | SHA-256 |
| --- | --- |
| `agents/WORKFLOW.md` | `665b6233c5e7c3f4e350ef4caf05321d58fd51275fdc925047e8b72f4bfa105d` |
| `agents/template-guide.md` | `c9a7f8a87816f6f671054ff943c74b785dac96e23e4a08be139909f558d55df7` |
| `docs/tech-stack.md` | `767306a72aa48076da7f5d78d5e8624e0b010eb7964ddd4f7eecac9f4e5c5b5f` |
| `docs/implementation/register.md` | `0177f4788b82b5e09ebfc4c321129d7604f58cd50089277b89b8aded957abb60` |
| `docs/implementation/decisions.md` | `9cf5be24b3307b78432f244578d7bc4df439ef7011868edc6e9d75210127e290` |
| `docs/implementation/execution.md` | `5cc619fa7efef45ac83a912b0c907503bc59e89d07b19afbb46d51f49ddde433` |
| `docs/implementation/roadmap.md` | `cc0a1d192959544f9d6c5ceced62a1be593570ed40969a454fde753150dcd6bf` |
| `docs/implementation/tasks/12-failure-and-evaluation.md` | `46bfbaae5cabbbd86ce261a733630a92503e2c047ec189a1a6f2b1a00187ea92` |
| `eval/README.md` | `1ebc82d9537a43d90d3ae877bf1234b8de3e0d0acca40d717a7e7150bd2967a7` |
| `eval/safety-configuration-expectations.md` | `91385c8d3c28f2475d68e4369a7499493d2af3fa866add2e3c42df888a0bfe70` |
| `package.json` | `323257b5792cf11d64c94c4ee69e7f10e2fdd17edc209dff512249e40e8e4a50` |
| `package-lock.json` | `bed4ba1f255aa067598c4a69dbaf594eed305e7dba267165f61630d6a63e6ad2` |
| `apps/web/package.json` | `f3e4666bfc8997ca2211b060fced508ec981be0d99fa2a3c41e6143e50d837de` |
| `infra/postgres/compose.yaml` | `3af8147b018a11bcc5407f7b36f3c3f0a5c58838c51585ce66f5fa5d99addf2f` |
| `.github/workflows/context.yml` | `1bbee2c71c08cf389d2d91131745efd18a1ca535074c47e746b52579bbc62986` |

Observed with Node v24.21.0: dependency-free context check passed, reporting 69 active FRs, 60 Must, 66 declared operations, 13 specs, separate research/safety definitions and runtime evidence `not run`. These are current scaffold counts, not application completion. The old stack counts are explicitly labelled as a dated snapshot at lines 194–199; they are not counted as another unqualified current-count defect.

The review itself ran no application, DB/storage, UI interaction, model/pilot, dependency installation or external-version availability/compatibility check. Structural documentation checks for registering this report are recorded with their actual outcome in REG-00. No source correction has been closed by those checks.

## Historical original checklist and downstream handoff

Pass: three bounded reviewer passes, source-based missing-versus-existing classification, concrete cases, correction owners and closure criteria. Gap: IR-01–IR-06 source corrections, outstanding owner choices and all runtime acceptance. N/A: authoring a new stack/architecture family, installing technologies or testing production behaviour during a read-only input review.

First correction batch: fix factual stack path/layout/input provenance; register existing supporting sources and EVAL identity; assign evaluation runner preparation explicitly. Keep actual selection/compatibility evidence in the existing D-01/D-02 process. Review findings do not themselves authorise code fixes or accept Proposed choices. Whole review queue groups stay open; hand off these bounded findings to their source owners.

## Current correction disposition — 26 October 2026

The owner subsequently authorised source corrections and official-source technology/algorithm research. This follow-up is an author recheck, not a new independent reviewer pass. Original snapshot hashes above remain unchanged and are no longer expected to match revised documentation.

| Finding | Current documentation disposition | Correction evidence / remaining gate |
| --- | --- | --- |
| IR-01 | Task ownership corrected; runtime gate open | IMPL-SP-12 v0.2 explicitly owns executable runner/adapters, scenario/configuration validation and result capture in SP-12.1; SP-12.3 requires its evidence. Runner/code/model execution remains Not started. |
| IR-02 | Rechecked in source | TECH-STACK-01 v1.5 separates implemented plain-JS preview from Proposed React/Vite application and preserves UI work. No application adoption. |
| IR-03 | Rechecked in source | Stack now links infra/postgres/compose.yaml and the actual storage runbook. No container/image change. |
| IR-04 | Rechecked in source | IMPL-REG-01 v0.3 registers existing contract/event, permission, protocol/data-fit, UX/skill, evaluation and owner-provenance inputs; IMPL-SP-11 v0.2 directly links byte/SQL/query prerequisites. These inputs retain their evidence limits. |
| IR-05 | Rechecked in source | Stack header now names later board/handoff owner-decision inputs and Proposed design dependencies. Earlier confirmation statuses remain unchanged. |
| IR-06 | Rechecked in source | Implementation register now records EVAL-01 v0.2 Draft with no model execution/frozen criteria. Its old source snapshot is not relabelled as current semantic review. |

TECH-STACK-01 v1.5 also records official-source observations dated 26 October 2026 and a requirement-linked algorithm/data-structure section. Node 24.22.1, PostgreSQL 17.11 and pgvector 0.8.7 are patch-assessment inputs; runtime/image/dependencies were not upgraded. Application framework/provider/DB-driver choices remain Proposed. HNSW/IVFFlat, rank fusion, reranking, trigram and other optional retrieval changes remain unselected experiments, not additional Core work.

Structural/source checks for this follow-up are recorded in REG-00 after execution. Passing them closes no runner, application compatibility, performance, security or provider gate.
