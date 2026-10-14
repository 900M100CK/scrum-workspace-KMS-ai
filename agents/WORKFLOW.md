# SDLC specification workflow

This workflow is for agents that author and review project documentation. The application's MVP does not include multiple runtime agents. All paths below are relative to the workspace root.

## Authority and inputs

1. Read the main `AGENTS.md`. It owns project rules, scope, architecture, permissions, versions, citations, evaluation, and reporting.
2. Follow `docs/BRD.md` to the complete current BRD. BRD v1.0 is a draft for business validation; preserve BR-01–BR-15, SC-01–SC-08, priorities, and Core/Enhanced/Future Work boundaries.
3. Read the selected profile in `agents/` and its named prompt/checklist in `SDLC-Prompt-Checklist/`. The pinned upstream commit uses flat filenames at the submodule root. Use the tracked [template guide](template-guide.md); local-only grouped folders or skills are not reproducible inputs.
4. Read the upstream artifacts listed below before starting a stage. Record their versions. Examples in templates are not project facts.

## Start and handoff contract

- Start with `00-sdlc-coordinator.md`. Create or update `docs/sdlc/artifact-register.md` with artifact ID, path, version, status, inputs, BR/SC coverage, owner role, and open decisions.
- Use English for artifact text, IDs, comments, and agent-facing instructions. Reply to the owner in their language.
- Every artifact records title/ID, version/date, `Draft` status, source versions, requirement trace, assumptions, open decisions, checklist result (`Pass`, `Gap`, `N/A` with reason), and a short downstream handoff.
- Handoff state is `Ready for downstream` when the next agent can use the draft with its stated gaps. Use `Needs owner decision` only when a missing business choice would materially change the next artifact. Neither state means approved.
- The next agent reads the artifact and its gaps, then either proceeds with explicit assumptions or returns a precise finding to the producing role. Do not silently rewrite an upstream BRD or accepted ADR.
- An entry document may link to a canonical artifact outside `docs/sdlc/`. Record both paths and their distinct IDs/versions in the register; review the canonical content, not only the entry. Historical review inputs remain labelled snapshots until the affected findings are rechecked.
- Record intentionally omitted optional outputs as `N/A` with a reason in the register. Elapsed time never accepts an assumption or an owner decision; independent drafting may continue under the existing handoff rules.

## Stage sequence

| Stage and profile | Required inputs | Output (`docs/sdlc/` unless noted) | Gate before handoff |
| --- | --- | --- | --- |
| 0 · `00-sdlc-coordinator.md` | Main rules, full BRD, existing artifacts | `artifact-register.md` | All Must BRs and SC-01–SC-08 have planned owners; missing inputs and decisions logged. |
| 1 · `01-prd-srs.md` | BRD, owner decisions/pilot evidence | `PRD_SRS.md`, optional `user-stories.md` | Each Must BR maps to a numbered, testable requirement and acceptance criterion; BR-15 stays Should; unknown NFR targets remain open. |
| 2 · `02-use-cases.md` | BRD, Stage 1 requirements/stories | `use-cases.md`, optional editable use-case diagram | Actors, boundary, triggers, success, alternate and denied/failure flows map to PRD IDs and relevant SC IDs. |
| 3 · `03-architecture.md` | BRD, Stages 1–2, constraints | `SAD.md` entry → canonical `docs/architecture.md`; proposed ADRs in `docs/adr/` | Entry identifies the canonical SAD version; current microservices decision from main rules is represented; ownership, trust boundaries, auth, consistency, retry/idempotency, citation and AI-fallback flows are explicit. |
| 4 · `04-data-design.md` | Stages 1–3, workload/retention decisions | `data-design.md` | Entity IDs, permissions, immutable versions, lifecycle, index/cache invalidation and current-state queries are consistent with SAD. |
| 5 · `05-api-design.md` | Stages 1–4 | `api-design.md`, optional OpenAPI | Each Core operation has contract, auth/resource checks, errors, version/citation identity and trace to use cases. |
| 6 · `06-ui-ux.md` | Stages 1–3 and Stage 5 contracts | `ui-ux-spec.md` entry/inventory; supporting sources in `docs/ux/`; optional wireframes | Register existing UX drafts even while the entry is missing. Role journeys, screen states, source/version inspection, denied/empty/error/AI-outage states and fallback are specified. |
| 7 · `07-uml-diagrams.md` | Stages 2–6 as relevant | Editable sources and `diagrams/README.md` | Every chosen diagram answers a design question and matches current SAD, data, API and use-case IDs; apply its matching UML checklist. |
| 8 · `08-test-plan.md` | BRD and Stages 1–7 | `test-plan.md`, `evaluation-cases.md`, trace matrix | Must BR/SC coverage, access/version/citation/AI-failure negatives, about 20–30 reference questions, pilot metrics and untestable gaps are explicit. |
| 9 · `09-consistency-review.md` | BRD and all available outputs | `spec-review.md` | Report blocking/important/minor mismatches with source locations and correction owner; do not self-approve the document set. |

Stages 4–7 can be revisited as interfaces mature. Do not call a downstream document complete merely because its upstream draft exists.

## Review loop

1. Coordinator routes each Stage 9 finding to the earliest affected stage: requirement → Stage 1; actor/flow → 2; boundary/decision → 3; data → 4; contract → 5; UX state → 6; diagram → 7; verification → 8.
2. The owning role revises its artifact with a change summary and version bump. Coordinator lists every downstream artifact affected by the change.
3. Re-run only the impacted stages and their checklist rows, then repeat Stage 9. Keep unresolved material choices in the decision log for the owner.

## Checks and invocation

- Run `npm run context:lint`, `npm run context:check`, and `npm run context:test` for the dependency-free Node context harness. These check selected references, requirement/contract structure and harness negatives; they do not establish full document consistency, checklist availability on a fresh clone, SC coverage, runtime correctness or approval. Database migration/storage-test commands now exist under [the storage runbook](../infra/postgres/README.md); no application build/run command exists yet.
- Inspect changed Markdown with `Get-Content -LiteralPath '<path>'`; search trace IDs with `rg -n 'BR-[0-9]{2}|SC-[0-9]{2}' <path>`; verify local links and named checklist files exist.
- Separately reconcile current artifact versions/statuses with the register and review inputs. Distinguish current checks from historical snapshots; mark a finding resolved only with its specific evidence. A missing literal SC ID is not proof of missing coverage when a documented FR/UC mapping exists; Stage 8 still needs an explicit scenario-to-test matrix and recorded gaps.
- For substantive changes to permissions, versions, citations, data, or service boundaries, follow the main rule's ADR and reporting requirements. Report checks run, gaps, and checks not run.

Example invocation: “Use `AGENTS.md`, `agents/WORKFLOW.md`, `agents/01-prd-srs.md`, and `docs/BRD.md` to draft `docs/sdlc/PRD_SRS.md`. Read the complete BRD and the profile's prompt/checklist. Preserve BR/SC traceability and record open decisions.”
