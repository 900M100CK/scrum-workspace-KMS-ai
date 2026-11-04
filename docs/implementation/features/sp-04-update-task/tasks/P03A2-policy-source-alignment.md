# SP04-P03A2 — selected policy and use-case source alignment

**Artifact ID:** SP04-P03A2\
**Version/date:** 0.2 Draft · 3 November 2026\
**Status:** Owner-requested source producer completed; see result and parent for actual evidence and unrun runtime gates.

## Goal and trace

Parent [FEAT-SP04-01](../plan.md), canonical SP-04.1–04.2 / FR-09/40/43/44, supporting FR-03/31/59/68; BR-01/02/03/06/10/11/14; UC-03 Alt-1 and UC-04 main/Alt-1/Alt-2/EX-01–04; TC-07/08/13/14/16/18/19/22; PLAN-01 Month 1 / M-02–M-03. P03A verified the eight transport declarations, with [explicit limitations](../reviews/p03a-codex-disposition.md). Plan mode is unavailable; this written gate is refined/registered before source changes.

One result: canonical selected policy, conflict/blocker/unknown-outcome wording and bounded Proposed mechanics align before storage/permission producers. Owner-selected separate edit, enabled new target and indefinite original outcomes are not new questions. No new FR/AC/EX/TC identity, priority or wire schema is added.

## Source identity and allowed coordinated support

Initial reading versions: PRD-01 v0.10; UC-02 v0.8.1; SAD-03 v0.16.1; DATA-04 v0.16; API-05 v0.23; TEST-08 v0.24; TEST-COVERAGE-01 v0.11; VERIFY-01 v0.12; CONTRACT-01 v0.25; logical JSON v0.12; SP-04 v0.7.2; ADR index v0.2. Owner record SP04-OWNER-01 v0.1 and design v0.4 remain immutable inputs. Hashes/before-images are captured under evidence/p03a2/. Existing dirty work is preserved.

Primary writes: docs/sdlc/PRD_SRS.md (FR/AC-09/40/43/44 and one change record); docs/sdlc/use-cases.md (UC-03 edit authority, UC-04 only); docs/sdlc/data-design.md; contracts/data-model.json (existing entity constraints/invariants and metadata only, no entity/field/relationship changes); contracts/README.md; docs/sdlc/api-design.md (semantics/provenance only, OpenAPI immutable); specs/004-update-task.md (current source support paths, backlink and selected-policy acceptance); docs/adr/0028-task-mutation-authority-and-outcomes.md (new, Proposed); docs/adr/README.md (index); docs/sdlc/test-plan.md, test-coverage.md, requirement-verification.md (existing assertions/trace, Specified not Passed).

Registration: owning feature folder, docs/implementation/features/README.md, docs/implementation/register.md, docs/implementation/roadmap.md, docs/sdlc/artifact-register.md, docs/sdlc/references/document-review-register.md and docs/sdlc/diagrams/manifest.json. Only when required, current input/version aliases plus matching patch-version/date/registry rows in docs/architecture.md, docs/sdlc/*.md, docs/sdlc/references/*.md, docs/sdlc/reports/*.md, docs/ux/**/*.md and specs/*.md. Preserve explicitly historical/snapshot review inputs; no unrelated prose/UX/diagram redesign. Generated metadata outputs only through existing synchronization; graph labels/edges remain unchanged. Record exact ancillary changes and version mapping in evidence.

No BRD/baseline or existing ADR edit; no OpenAPI, app/service, migration, tests, root commands/dependencies, provider/AI, chart/load balancing, data upgrade, commit/push or new agent. Workspace still owns permissions and all work writes; AI stays read-only. Canonical support amendment is recorded in the spec before other primary support edits. P03A historical missing raw logs are not reconstructed.

## Executable steps and assertions

1. Register this scope and parent in all owning registers; capture actual current source hashes/before-images and branch/HEAD.
2. Add canonical coordinated support/backlink; create Proposed ADR-0028 separating owner directions from proposed provisioning/locks/receipt/no-op/audit/history mechanics. Preserve known D-07/SP-05 and independent gates.
3. Edit actual PRD rows and UC flows: separate action authority, enabled same-project new assignee/null; every replay checks current read/action, returns permanent original Task200/Blocker201 including title/description, then current UI refresh. C01 generic409/fresh getTask; C02 Blocker201 then fresh Task/history; C03 known rollback versus unknown acknowledgement with same original identity.
4. Align existing logical/data/API semantics and planned tests/trace, including scope denial, stale/live replay, no-op, removal/rejoin, disabled target, atomic audit/outcome and actual future SP-05 races. Do not mark runtime assertions passed. Record deterministic design choices as Proposed.
5. Synchronize current input aliases/patch versions/registrations, retain historical snapshots, then run actual checks and preservation comparison.

Commands with portable Node24.21.0 and installed dependencies only: existing context syntax/check/test; contracts:test; docs metadata sync/check; docs:lint/test; scoped whitespace/local Markdown targets. Additional read-only semantic assertions compare FR/priority/AC/EX/TC identities and model entity/fields/relationships with before-images, ensure OpenAPI/runtime/tests/migrations/old ADRs/baseline unchanged, and check affected UC wording/current policy trace. Capture exact commands/exits, first failures and reruns under evidence/p03a2/; never weaken a checker. These are source/schema/harness checks, not application acceptance.

Result: reviews/p03a2-source-alignment.md, evidence/p03a2/checks.json and final version/changed-path map. Only after all required source gates pass can P03A2 close. P03B still needs a separate exact additive storage/test brief before execution; no automatic migration follows.

### Frozen report input-envelope clarification

Dependency inspection found four dated reports whose Inputs headers describe frozen evidence, not live source dependencies: docs/sdlc/reports/SP-03-2026-11-02-execution.md, SP-03-2026-11-02-ui.md, SP-03-publication-2026-11-03.md and load-balancing-assessment-2026-11-03.md. P03A2 may explicitly label only those headers Historical inputs and patch their envelope version/date, preserving every original input value and all result/body bytes. Full tracked-report originals are preserved in before-images. The untracked load-balancing assessment had no pre-edit full-byte snapshot; its envelope-only edit is recorded with that preservation limit. This is metadata classification, not rerunning/relabeling historical evidence; do not update their reviewed source versions to current ones. Record body preservation and exact envelope differences.

Metadata closure also permits the diagram entry docs/sdlc/diagrams/README.md header/current Source versions only (with manifest/header patch), because it is the current index for unchanged diagram graphs. Generated tables remain managed by docs:sync-metadata; no Mermaid/Draw.io source changes.

Result: [SP04-P03A2-RESULT v0.1](../reviews/p03a2-source-alignment.md) and evidence/p03a2/checks.json. No future storage migration is executed by this task.
