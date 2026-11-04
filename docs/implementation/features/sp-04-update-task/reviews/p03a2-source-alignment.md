# SP-04 P03A2 — canonical source alignment result

**Artifact ID:** SP04-P03A2-RESULT\
**Version/date:** 0.1 Draft · 3 November 2026\
**Status:** Source alignment verified with stated preservation limits; no runtime or independent acceptance.\
**Author:** Codex, sequential source producer and author self-check.\
**Inputs:** [FEAT-SP04-01](../plan.md) v0.10; [SP04-P03A2](../tasks/P03A2-policy-source-alignment.md) v0.2; owner record v0.1; decision batch v0.4; P03A disposition v0.1. Exact initial versions/hashes are in [source capture](../evidence/p03a2/source-inputs.json); actual resulting versions are in [version map](../evidence/p03a2/version-map.json).\
**Trace:** SP-04.1–04.2 / FR-09/40/43/44, supporting FR-03/31/59/68; BR-01/02/03/06/10/11/14; UC-03 edit/EX-03 and UC-04 main/Alt-1/Alt-2/EX-01–04; TC-07/08/13/14/16/18/19/22; PLAN-01 Month1 / M-02–M-03.

## Change and purpose

The existing PRD AC-09/40/43/44 rows now carry selected policy, rather than only an appended proposal: edit is separately provisioned, a new assignee must be enabled/current/same-project or null, and original Task200/Blocker201 outcomes are permanent with current read/action checks. Creator/create-only backlog-author/role grants no implicit edit; membership removal/rejoin restores no capability/assignment. Current permission lookup failure denies; a stale/currently unauthorised original result is not disclosed.

UC-03 Alt-1/EX-03 and UC-04 separate genuinely new writes from committed replay after later revision/placement/target-eligibility changes. C01 uses existing generic409 state_conflict plus a fresh authorised getTask, with no invented current_revision. C02 acknowledges only Blocker201, then fresh Task/history supplies current blocked/revision. C03 distinguishes known atomic rollback from uncertain acknowledgement, reconciling only the original actor/operation/key/body. Current UI state never comes from the historical receipt. No wire field/operation change is needed.

Existing model constraints, data/API/contract prose, canonical SP-04 support paths/backlink and planned assertion/trace rows agree. Omitted/same-value/no-op, safe typed results, private grants, lock order, audit references, paging, migration legacy/down refusal and actual SP-05 integration obligations are bounded by [ADR-0028 v0.1 Proposed](../../../../adr/0028-task-mutation-authority-and-outcomes.md). This ADR separates actual owner choices from untested mechanics. Applied migrations, services, tests, baseline and old ADRs remain unchanged. No new approval of earlier Proposed ADRs is inferred.

## Current primary versions

| Source | Resulting version / scope |
| --- | --- |
| PRD-01 / UC-02 | 0.10.1 / 0.8.2; actual existing AC/flow changes |
| DATA-04 / logical JSON | 0.16.1 / 0.13; existing constraints and invariant metadata, no entity/field/relationship additions |
| API-05 / CONTRACT-01 | 0.23.1 / 0.25.1; semantics/provenance, OpenAPI bytes unchanged |
| SP-04 | 0.7.3; current support paths/backlink and selected-policy acceptance |
| TEST-08 / TEST-COVERAGE-01 / VERIFY-01 | 0.24.1 / 0.11.1 / 0.12.1; planned assertions only |
| ADR-INDEX-01 / ADR-0028 | 0.3 / 0.1 Proposed; no existing ADR changed |

The mandatory current-input version checker required metadata propagation. Ancillary patch versions/current aliases are enumerated in the version map; their bodies are checked unchanged. Diagram regeneration updates source-version comments/native titles and index inventories only: all40 Mermaid/Draw.io graphs match the original digest after reversing only generated metadata values. Their nodes/edges/design are unchanged. Current PRD/UC aliases do not revalidate old implementation results.

Four dated report envelopes now explicitly say Historical inputs, keeping every reviewed input value unchanged. Three tracked reports have full raw before-images and verified unchanged result bodies. The untracked load-balancing assessment was inspected before the edit but was omitted from the full-byte baseline capture: its author envelope-only edit is recorded, but before/after body equality is not independently hash-proven. No new load-balancing result/adoption or historical runtime acceptance is claimed. This limitation is explicit in checks.json.

## Verification and failure record

Node v24.21.0 with existing dependencies: context syntax/check and **45/45** context tests; **27/27** contract tests; **20/20** docs tests; metadata sync/check and docs lint. Context inventories remain69 active requirements,60 Must/4 Should/4 Could/1 Wont,66 operations,13 specs. Source checks preserve FR identities/priorities/requirement text, AC IDs, UC/EX and TC identities and logical entity/key/field/relationship shape. Actual refined AC text and test assertions changed as intended.

[Execution manifest](../evidence/p03a2/executions.json) and adjacent raw logs retain failures/reruns. Initial docs lint failed when raw .md snapshots were scanned as active docs; snapshot suffixes became .txt without byte changes. Subsequent failures exposed stale current diagram index aliases; current navigation was corrected without weakening checkers. The first ad-hoc preservation assertion incorrectly treated allowed generated diagram metadata as byte-identical; its structured failure is retained. The saved source-scope checker now separately proves202 protected implementation/wire/baseline/old-ADR files byte-identical and all40 graph contents preserved. A later missing untracked assessment snapshot is retained as a limitation instead of invented evidence. All95 captured raw before-images retain their initial hashes.

Final scoped whitespace, local-link targets and source/version scope are captured in [checks](../evidence/p03a2/checks.json). These are source/schema/harness checks, not handler/DB permission acceptance. No historical log is reconstructed, no test expectation/fixture changed, no install/commit/push/upgrade performed.

## Handoff

P03A2 source gate closes when final registered checks pass. Next is P03B additive storage and typed original-result support, which still needs its own exact brief, disposable new-schema forward/reverse/repeat/refusal/old-operation assertions and current source capture before implementation. No migration or permission handler follows automatically from this report. Actual storage/private provisioning/HTTP/DOM/browser/concurrency, D-07 and actual SP-05 producer integration remain unrun/open.
