# Architecture 4+1 restructuring corrective review

**Artifact ID:** ANL-REPORT-01

**Version/date:** 1.2 Draft · 10 October 2026

**Status:** Draft; Ready for downstream correction. Author self-review, not independent approval or standards certification.

**Owner:** System and Requirements Analyst, with Stage 3 architecture and Stage 9 consistency-review roles.

## Scope and inputs

This report corrects the v1.1 analysis of the 4+1 restructuring. It reviews the documentation changes and their evidence limits; it does not accept the architecture, implement its controls or close existing UX/diagram findings.

| Source | Version and use |
| --- | --- |
| [Canonical architecture](../architecture.md) | SAD-03 v0.5 Draft; source for the four views, scenarios and requirement matrix |
| [SAD entry](../sdlc/SAD.md) | SAD-03-ENTRY v0.4; pointer to the canonical design |
| [Artifact register](../sdlc/artifact-register.md) | REG-00 v0.11; artifact/decision inventory |
| [Consistency review](../sdlc/spec-review.md) | SPEC-REVIEW-01 v0.3; finding status and correction owners |
| [Diagram index](../sdlc/diagrams/README.md) | UML-07 v0.4; historical mapping against SAD-03 v0.4, not evidence of semantic alignment with v0.5 |
| [Diagram review](../sdlc/diagrams/review.md) | DGM-REVIEW-01 v0.2; open semantic, layout and visual-review limitations |
| [BRD](../baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md), [PRD](../sdlc/PRD_SRS.md), [use cases](../sdlc/use-cases.md), [plan](../planning/five-month-plan.md) | BRD v1.0, PRD-01 v0.4, UC-02 v0.2, PLAN-01 v0.1 |
| [ADR directory](../adr/), [development rules](../development-rules.md) | Existing authority, scope and Proposed decision constraints remain in force |

## Corrective findings reflected in SAD-03 v0.5

The 4+1 structure gives readers separate locations for service responsibilities, concurrent behaviour, development organization, deployment candidates and representative scenarios. Organization alone does not establish completeness or correctness.

| Area | Corrected documentation intent | Remaining verification |
| --- | --- | --- |
| Protected handoffs — BR-10/BR-14; FR-14/FR-28/FR-29/FR-39/FR-55 | The same authority guard serializes permission mutation commits with final check and provider-input transport handoff, and separately with final check and buffered response handoff. Generation waiting remains outside the guard. Validate the complete evidence set, including uncited context, and withhold the entire original draft when a source is revoked. | Implement and test revocation, abort, timeout, restart and retry at both handoff boundaries. Server handoff is the boundary; already-sent data cannot be recalled. |
| Lifecycle and unknown remote writes — BR-05/BR-14 | Publication/archive/deletion use the project guard while Knowledge retains ownership of its writes. Final validity checks occur inside the guard. An unknown remote-write outcome blocks protected handoffs until reconciliation; timeout does not prove cancellation. | Demonstrate ordering, reconciliation and no stale source revival in real integration tests. [ADR-0006](../adr/0006-permission-handoff-guard.md) remains Proposed. |
| Retrieval validity — BR-05/BR-07; SC-05 | Default retrieval selects Current versions. Historical retrieval is explicit and labelled; Draft remains excluded from retrieval/context. Excluding Draft alone would still allow accidental retrieval of obsolete versions. | Verify publication, stale index/cache, historical query, archive and deletion paths against current contracts. |
| Insufficient evidence — BR-08; SC-07; FR-23 | An empty result set is only one insufficient-evidence case. Nonempty retrieved passages may still fail to support the requested decision or claim; the response must preserve that uncertainty rather than invent a rationale. | Evaluate claim support against expected passages, including relevant-looking but insufficient sources. No claim that SC-07 always skips the provider is made. |
| Candidate topology — BR-01/BR-13 | The browser uses a same-origin gateway path; a development UI server needs a same-origin API proxy arrangement. Two services and isolated data ownership remain the intended boundary. Ports, stack, provider, sizing and transport settings remain candidates. | Implement and verify session/CSRF, service authentication, deployment and outage behaviour. A proposed port diagram or proxy description is not a running deployment. |

This review adds no product policy or owner acceptance. It restores explicit constraints already present in upstream requirements and Proposed ADRs. Existing F-01–F-05, F-07–F-08 and F-10–F-12 remain open or pending revalidation in the consistency review. Updating SAD text does not repair the UX flows, endpoint labels or diagram geometry.

## Requirement traceability

The authoritative design mapping is the [SAD requirement traceability matrix](../architecture.md#71-requirement-traceability-matrix). The earlier report's grouped FR table is removed because it duplicated the architecture and contained incorrect group-to-BR associations.

The revised matrix records FR-01 through FR-69 individually with their BR associations taken from PRD-01 v0.4. Explicit rows make omissions and incorrect source associations reviewable. A count of 69 rows establishes inventory coverage only: it does not prove that each architectural section satisfies its FR/AC, that every SC/UC exception has a test assertion, or that an implemented system passes those tests. BR-15 remains Should/Enhanced; original Core requirements remain binding unless the owner records exact OD-11 deferrals.

The diagram index's v0.4 view classification is a source inventory. Its inherited diagrams require semantic and visual revalidation against SAD v0.5; no diagram-alignment conclusion follows from the classification. Stage 8 retains responsibility for explicit SC and UC-qualified EX mappings and unexecuted runtime cases.

## Verification evidence and reproducibility limits

**Current v1.2 editing-session verification:** On Node v22.23.0, `context:lint`, `context:check` and `context:test` passed (9/9 harness tests). A separate read-only check passed for 170 local links across the five corrected documents, their version headers, all 69 SAD FR rows against exact PRD requirement text and BR associations, and the 68 Core spec owners. `git diff --check` passed. These checks establish reference/inventory consistency only; they do not establish semantic completeness, runtime correctness or Node 24+ compatibility. No clean remote clone/init, renderer, application or provider evaluation was run.

| Observation | What it establishes | What it does not establish |
| --- | --- | --- |
| Local `node --version` returns v22.23.0 | Identifies the interpreter available during this correction | The project requires Node 24 or later. Passing checks under Node 22 would not verify the declared Node 24 environment. |
| Earlier session reports context lint/check and 9/9 harness unit tests passing | Historical structural/contract-shape evidence, limited to the checked snapshot | Runtime permission enforcement, immutable evidence, claim support, concurrency, application correctness or complete semantic trace |
| [`.gitmodules`](../../.gitmodules) maps SDLC-Prompt-Checklist to `https://github.com/minhtrantrong/SDLC-Prompt-Checklist.git`; the local checkout's origin matches | The URL mapping exists and agrees with the local remote configuration | Successful network fetch, complete template availability in another checkout or clean-clone reproducibility |
| `git submodule status` reports `-3c65f5cbefa7d69a75cadd89b177e3add8b400b0 SDLC-Prompt-Checklist` | The leading minus marks the submodule uninitialized from the parent repository's perspective | Successful initialization; local files alone do not prove a fresh clone can initialize and reproduce the template set |

The coordinating session's current harness and documentation results are recorded above, separately from historical observations in the table. No clean clone or submodule initialization was performed. No application build, migration, permission/concurrency test, provider evaluation, performance pilot, diagram rendering or formal standards audit was performed.

**Publication preparation finding:** The pinned upstream checklist commit contains flat root-level templates, while the local nested working tree has uncommitted moves into PRD/SAD/API-design/UC/UIUX/UML/TESTING and additional local files. Registering the upstream URL alone does not reproduce those grouped paths. This parent-repository publication preserves the gitlink and does not publish the nested edits or claim fresh-clone harness success. Template layout/reference reconciliation remains open; local passing checks used the existing grouped working tree.

## Handoff and remaining decisions

**Checklist result:** Gap. The report now separates documented intent, source mapping and execution evidence; architectural acceptance, semantic trace completion, runtime enforcement and visual verification remain unproven. The former blanket Design Pass and Final labels are withdrawn.

**Handoff:** Ready for downstream correction with explicit assumptions. Stage 3 owns the canonical architecture; Stages 4–8 revalidate affected data/API/UX/diagram/test artifacts; Stage 9 tracks findings without self-approval. Owner decisions remain in the register, and no elapsed deadline accepts a Proposed decision.

**Change summary:** v1.2 removes duplicate grouped trace and blanket approval claims; records both guarded handoffs, lifecycle reconciliation, Current/history and insufficient-evidence distinctions; qualifies candidate topology, Node-version evidence and submodule reproducibility; refreshes source versions without claiming diagram repair.
