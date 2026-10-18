# Documentation freshness review

**Artifact ID:** DOC-FRESH-01  
**Version/date:** 0.2 Draft · 17 October 2026  
**Status:** Author review and targeted corrections; not independent approval.  
**Snapshot inputs:** BRD English v1.0 and Proposed addenda; PRD-01 v0.9; SAD-03 v0.11; ADR index and OWNER-Q-01; current contracts, migrations, package scripts and evaluation definitions.  
**Trace:** BR-01–BR-15 and SC-01–SC-08 documentation handoff; no requirement, priority, provider or accepted ADR is changed.

## Coverage and method

The [file inventory](documentation-freshness-inventory-2026-10-17.md) records all 153 Markdown files discovered before this report was added, including external checklist templates and alternate diagram documentation. Every file was read by the inventory scan for classification, selected stale phrases and local file-link targets. Targeted semantic review concentrated on rules, the BRD entry/baseline, current PRD/SAD/ADR directions, planning, technology, service/storage instructions, specs, evaluation, register and prior reviews. Existing context/documentation checks additionally inspect contracts, trace data and nine registered diagram pairs.

This is a workspace-wide freshness scan plus targeted semantic review, not a claim of line-by-line independent validation of all prose, templates, diagrams or translated baseline requirements. Ignored temporary clones, dependencies and binary render outputs are excluded. No external upload of project documents was made. Public web lookup was limited to model/framework lifecycle facts.

The workspace already contained extensive uncommitted edits and untracked documents. These were retained. Historical test counts, migration 001, baseline editions, accepted/owner-confirmed ADR records and evaluation fixtures were not rewritten. Older dates alone are not defects; a stale statement matters when presented as current guidance.

## Findings and disposition

| ID / impact | Evidence and mismatch | Correction or next owner |
| --- | --- | --- |
| DF-01 / Important | TECH-STACK-01 listed `gemini-1.5-flash` as a pilot candidate despite its shutdown; broad Vite 6 and TypeScript 5.6 examples looked like current selections. | Corrected in TECH-STACK-01 v1.2: exact supported framework/model versions remain unselected and must be pinned/checked at scaffolding or pilot. No automatic dependency upgrade. |
| DF-02 / Important | TECH-STACK-01 described Blocked as a workflow state and implied an immediate revocation guarantee; prompt sanitation claimed to strip injection vectors. Its handoff summary omitted the complete immutable manifest before guard acquisition. | Corrected against ADR-0008, ADR-0006, ADR-0012 and OWNER-Q-01. Three board states, event-derived blocking, explicit transport boundary and pre-guard persistence are now stated. Runtime verification remains absent. |
| DF-03 / Important | Root rules and PLAN-01 still described all storage choices as Proposed. The storage runbook described promoting a Draft as current procedure even after migration 002. | Rules v1.4 and PLAN-01 v0.3 distinguish selected storage from proposed frameworks/providers. Runbook now describes immediate atomic Current revision; migration history stays intact. Knowledge README excludes unsaved editor text without implying a product Draft. |
| DF-04 / Important | PLAN-01 summary/table and backlog omitted FR-70 while a late appendix included it; main count was 68 active / 3 Should. | Main plan now includes FR-70 and 69 active / 60 Must / 4 Should / 4 Could / 1 Wont; backlog SP-08 includes optional FR-70. Core exceptions remain exactly ADR-0010's seven. |
| DF-05 / Important | TECH-STACK-01 mixed draft OpenAPI with implemented enforcement, claimed unconditional fallback, and published old 55-operation / 8-diagram counts. | Corrected specification/evidence labels, fallback dependency limits and current counts. Context structure is distinct from consumer-provider/application correctness. README distinguishes 25 research from 25 safety cases. |
| DF-06 / Important | PRD §11 still says OD-02–OD-04 materially change next stages and OD-11 needs owner input, although its own decision rows and ADR-0007–0010 confirm initial policies/exceptions. SAD §5 hardware paragraph still calls ADR-0004 Proposed. | Remaining targeted editorial reconciliation: requirements/architecture owner should update these exact passages and propagate source-version changes through dependent headers/manifest. Current register handoff is corrected; do not reopen settled decisions. These residual statements do not supersede the owner records. |
| DF-07 / Important | `diagrams-1/README.md` claimed Complete/Canonical, repeats registered IDs, and had source links resolved as though the directory lived under `docs/sdlc`. The active validator registers `docs/sdlc/diagrams`, not this alternative set. | Index links corrected and alternative inventory labelled unverified in v1.1. Diagram owner must compare all alternate diagram contents and generators before any promotion. Existing nine-pair checks do not validate this set. No diagram deletion or canonical replacement is authorised by this audit. |
| DF-08 / Minor | Many specs/evaluation/planning headers still cite PRD v0.5 and PLAN v0.2; later amendments are mixed into their bodies. Prior handoff/review documents have dated 8-pair/17-artifact evidence. | Inventory lists candidates. Preserve actual historical source versions until each document receives a semantic recheck; never bulk-relabel them as reviewed against v0.7. Use the current register and this dated audit for current counts. |
| DF-09 / Important | Current runtime implementation, permission races, provider runs and research results remain absent. Dates and successful structural tests cannot turn them into delivered features. | Implement bounded slices and planned negatives before claiming acceptance. Retain pending orphan cleanup/fencing, immutable handoff physical storage, retained citation entitlement and safety-configuration work from SPEC-REVIEW-01 / DATA-FIT-01. |
| DF-10 / Minor | Runbook claimed the database “remains running” based on a 13 October run. Some toolchain and architecture wording implied present deployed services. | Runbook now dates availability to that observation; technology tree is explicitly proposed where handlers/src folders do not exist. No container state was inferred or changed. |

## External evidence checked on 17 October 2026

Google's [Gemini API changelog, 29 September 2025](https://ai.google.dev/gemini-api/docs/changelog#september-29-2025) records shutdown of Gemini 1.5 Flash. This is sufficient to remove that old candidate; it does not select a replacement or establish price/data terms.

The [official Vite release policy](https://vite.dev/releases#supported-versions) lists supported minor lines and different maintenance levels. A generic 6.x range is not proof of support. Choose and verify a supported exact release with the future application toolchain; the current lockfile only establishes installed documentation dependencies. The selected PostgreSQL/pgvector image remains pinned to its tested baseline rather than being upgraded merely because time passed.

## Verification and limits

Initial checks on host Node 22.23.0 passed context syntax/check, 31 context tests and 15 documentation tests, with nine pairs, 21 artifacts, 172 nodes and 207 relations. This host is below the repository's Node 24 requirement, so that run alone is not supported-runtime evidence. Portable Node 24.21.0 was located for final verification.

Final verification on portable Node 24.21.0: context lint/check passed (69 active FRs, 60 Must, 56 operations, 13 specs); combined context/docs tests passed 46/46; docs lint passed nine pairs / 21 artifacts / 172 nodes / 207 relations; metadata check passed 35 outputs with no changes. `git diff --check` passed, with only Git line-ending conversion warnings. Intermediate Node 24 runs found the not-yet-created report link and a historical register paragraph under a Current heading; both were corrected before the passing final run. No incomplete intermediate run is claimed as a pass.

Not run: database migrations/integration tests, application build/UI, provider calls, runtime permissions/concurrency, new rendered diagram review, performance/retrieval experiments or fresh-clone reproduction. Existing render/readability issue RV-09 remains open. No commit, deployment, model selection or baseline approval was made.

## Handoff

Initial scan handoff (superseded by the follow-up below): complete Markdown inventory and targeted corrections; residual source reconciliation, alternative diagrams, independent review and runtime acceptance remained open. Owner input is still needed for framework/provider/identity selection, delegation/retention details, kickoff/working calendar and post-pilot thresholds, not for already confirmed access/Sprint/lifecycle policies or the seven Core exceptions.

## Follow-up implementation — 17 October 2026

The owner requested improvements, current technology guidance and fixes. DF-06 is now corrected in PRD-01 v0.8, SAD-03 v0.11 and SAD-03-ENTRY v0.10; confirmed decisions are distinguished from remaining details and OD-11 totals include optional FR-70. No FR/AC behavior or release priority changed.

DF-08 is reconciled for all 13 feature specs and SPEC-INDEX v0.3: each records the requirement-specific review, current PRD/plan input, remaining choices and unimplemented state. SP-01 no longer requires a session before sign-in. SP-06/08/10 now identify the actual owning service contracts. SP-12 names both separate 25-case suites. Older historical documents and evaluation authoring snapshots remain labelled evidence rather than being silently relabelled.

TECH-STACK-01 v1.3 adds dated official sources and concrete candidates: Node 24 LTS, TypeScript 7.0 with its compiler-API compatibility caveat, React 19.3, Vite 8.3, supported Fastify 5 and Tailwind 4 with browser requirements. PostgreSQL 17.11 is a maintenance candidate for the tested 17.10 baseline; no image, dependency, provider or data migration was changed. Exact patches, compatible plugins, application builds and storage upgrade tests remain adoption gates.

The alternate diagram inventory and generator paths are corrected to the actual root-level diagrams-1 folder; generated README wording no longer asserts approval. Its older retrieval and handoff diagrams still differ from the canonical set: service-composition labels hybrid/trgm as selected, AI flow lacks the current explicit pre-guard durable-manifest/retry branches, and checkpoints describe a stamped manifest. Treat these as historical illustrations pending redesign, not implementation instructions. The nine registered canonical pairs remain authoritative draft inputs.

Current-header reference propagation reflects editorial PRD/SAD changes only and is not a claim of fresh full semantic review of every downstream artifact. Generated source titles/tables were synchronized; graph topology was not changed. Application runtime, independent review, alternate-diagram redesign and visual acceptance remain open.

Follow-up verification: portable Node 24.21.0 passed context lint/check, docs lint, all 46 context/docs tests and metadata check (35 outputs, no drift). The initial follow-up docs lint rejected a sentence about an unselected retrieval mechanism until its status was made explicit; the final run passed. Both changed Python generators parsed successfully, and isolated metadata generation verified all 28 diagram paths and the historical/unverified status without regenerating user diagrams. `git diff --check` passed. Database upgrade/storage tests, application builds, provider runs and rendered diagram checks were not run. No dependency lockfile, storage image, applied migration, accepted ADR or BRD pointer was changed by this follow-up; no commit was made.

Current handoff: DF-06 editorial defects are closed; DF-08 is reconciled for the feature specs, with historical/evaluation snapshots preserved. DF-07 path/status defects are fixed, but the alternative diagram content still requires redesign before current use. DF-09 remains runtime implementation work. The new toolchain table is a sourced proposal with concrete compatibility/adoption checks, not a claim of installed or tested application dependencies.
