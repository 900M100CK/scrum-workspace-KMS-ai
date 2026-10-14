# Specification consistency review

**Artifact ID:** SPEC-REVIEW-01
**Version/date:** 0.5 Draft - 14 October 2026
**Status:** Current author re-review; not independent approval or application acceptance.
**Inputs:** PRD-01 v0.5 plus owner amendments; UC-02 v0.3; SAD-03 v0.7; DATA-04 v0.3 and DATA-FIT-01 v0.1; Workspace API v0.2.1 / Knowledge v0.2.2; UX-06 v0.1; TEST-08 v0.3; current VERIFY-01; ADR-0007 through ADR-0017.

The [v0.4 review](spec-review-v0.4-history.md) is preserved verbatim as historical evidence. Its old source versions, open findings and environment statements are not current conclusions. This review checked present text and diagram sources; rendering and application behavior remain unverified.

## Retained findings

| ID | Current disposition | Evidence and remaining work |
| --- | --- | --- |
| F-01 | Text and targeted diagram corrections supplied | DGM-FLOW-01 v0.6 includes partial answers, invalid-citation whole-draft withholding, minimum durable evidence and unavailable identity inspection. Both formats pass structural comparison. AI render was inspected and relaid out; practical readability and runtime review remain open. |
| F-02 | Lifecycle and membership labels corrected in sources | DGM-FLOW-03 v0.6 preserves immediate immutable Current revisions and adds atomic invalidation of all individual grants, unassignment and the last-manager restriction. Rendered and transactional enforcement remain unverified. |
| F-03 | Classification and unavailable identity labels corrected | DGM-FLOW-04 v0.6 uses current membership and retained read policy for verified unavailable citation identity; otherwise generic 404. No role-wide read bypass. Both formats match; runtime enforcement remains unproven. |
| F-04 | Original endpoint drift corrected | Current AI/board/docs source paths match Knowledge questions and Workspace task-state contracts. Removed publication is intentional ADR-0009. Latest search/partial-answer contract additions need diagram metadata reconciliation. |
| F-05 | Rendered review pending | Structural graph equality cannot prove service-composition title/edge geometry is readable. Inspect an actual render and retain evidence. |
| F-06 | Header issue corrected | Canonical SAD is v0.7 and consumes UC-02 v0.3. Broader current/historical reference drift is tracked separately; one header proves no full design acceptance. |
| F-07 | Design rule clarified; implementation unproven | DATA-FIT-01 and ADR-0017 state generation/validity, atomic capability invalidation and unassignment. Schema fields do not enforce authority queries or concurrent removal by themselves. |
| F-08 | Inventory/definition mapping supplied | TEST-COVERAGE-01 covers 48 EX identities; VERIFY-01 covers FR/AC, alternate and NFR observations with named gaps. Added FR-70/UC-08 Alt-5 needs refreshed inventory count. No runtime test coverage inferred. |
| F-09 | Original duplicate-source finding remains resolved | Categorized use-case diagram retained; no new deletion claimed. |
| F-10 | Environment/render evidence still pending | Draw.io exported AI flow twice successfully. First render showed crossings; targeted ELK relayout improved them but leaves wide layout/long routes. Other renders and practical readability remain pending; the old startup failure is not current. |
| F-11 | Illustration labelling corrected | Persona header, AI layout placeholder and journey title/source explicitly disclaim measured research/satisfaction. Runtime evaluation still absent. |
| F-12 | Three-column source defect corrected | Board Mermaid/source use To Do, In Progress, Done and owner-confirmed direct transitions/reopening; no In Review state. No rendered or handler pass claimed. |

## Remaining review work

1. Reconcile latest ADR-0013/15/16/17 changes with affected diagram source pairs, regenerate only where necessary and inspect renders. Keep both formats.
2. Finish residual reference classification and current status/version cleanup; historical records now live in [CHANGELOG](CHANGELOG.md). Avoid deleting legitimate draft labels, withdrawal records and negative tests.
3. Complete safety-regression configuration expectations and check operational collection/link evidence; research rubric remains proposed, not frozen or executed.
4. Resolve or explicitly hand off orphan cancellation/fencing, immutable handoff evidence and retained identity schema design. Remaining capability delegation, identity/provider and retention inputs must be surfaced without inventing decisions.
5. Record clean-clone/pinned-submodule reproducibility separately from successful working-tree checks, then complete T0-T10 audit in the [change report](../planning/change-report.md).

## Evidence boundaries and handoff

Current context evidence reports 69 active requirements, 60 Must, 56 operations and separate 25-case research/safety suites. Last complete context unit run passed 31/31; five concurrency declarations are TODO with zero passes. Database storage tests are earlier prerequisite evidence only. No UI, provider, permission race or real application test has passed in this review.

Ready for targeted correction with the listed gaps. Source corrections may close the original textual mismatch while implementation/visual proof remains open. Do not call the overall document set complete or independently approved from this table. The [continuation handoff](../planning/review-handoff.md) records exact next steps and owner decisions.
