# SDLC documentation

**Artifact ID:** SDLC-INDEX-01  
**Version/date:** 0.3 Draft · 25 October 2026\
**Status:** Navigation only; artifact status and acceptance remain with each source.  
**Inputs:** [Development rules](../development-rules.md), [workflow](../../agents/WORKFLOW.md), [artifact register](artifact-register.md).  
**Trace:** Existing BR-01–BR-15 / SC-01–SC-08 artifacts; no requirement change.

Start with the [artifact register](artifact-register.md) for ownership, versions, dependencies and open decisions. Use this index to find documents by purpose.

## Directory layout

```text
docs/sdlc/
  README.md                     Navigation and placement conventions
  artifact-register.md          Current artifact register
  CHANGELOG.md                  Preserved historical register records
  *.md                          Stable specifications, existing reviews and snapshots
  diagrams/                     Existing Stage 7 sources, previews and manifests
  handoffs/                     Correction queue and downstream handoff notes
  references/                   Supporting references and document review register
  reports/                      Dated execution and progress reports
  reviews/                      New bounded checklist and consistency reviews
```

## Specifications and verification

| Stage | Documents |
| --- | --- |
| 1 · Requirements | [PRD/SRS](PRD_SRS.md) |
| 2 · Use cases | [Use cases](use-cases.md) |
| 3 · Architecture | [SAD entry](SAD.md) → [canonical architecture](../architecture.md) |
| 4 · Data | [Data design](data-design.md) |
| 5 · API | [API design](api-design.md) |
| 6 · UX | [UX specification](ui-ux-spec.md), [blueprint](ui-ux-blueprint.md), [supporting UX sources](../ux/) |
| 7 · Diagrams | [Diagram index](diagrams/README.md) |
| 8 · Tests and evaluation | [Test plan](test-plan.md), [test coverage](test-coverage.md), [requirement verification](requirement-verification.md), [evaluation entry](evaluation-cases.md) |
| 9 · Existing reviews | [Specification review](spec-review.md), [data-policy fit](data-policy-fit-review.md), [system consistency](system-consistency-review-2026-10-18.md) |

## Supporting documents

| Folder | Documents |
| --- | --- |
| `handoffs/` | [Remediation priorities](handoffs/remediation-priorities-2026-10-18.md), [UX handoff](handoffs/ui-ux-handoff-2026-10-18.md) |
| `references/` | [Document review register](references/document-review-register.md), [byte-binding reference](references/handoff-byte-reference-2026-10-18.md), [SQL projection](references/handoff-sql-projection-2026-10-18.md) |
| `reports/` | [Progress report](reports/progress-report-2026-10-18.md), [concise progress handoff](reports/progress-report-handoff-2026-10-18.md) |
| `reviews/` | [UX/blueprint checklist review](reviews/ui-ux-checklist-review-2026-10-18.md) |

## Historical records

Keep the existing [review v0.4](spec-review-v0.4-history.md), [test plan v0.2](test-plan-v0.2-history.md), [17 October freshness audit](documentation-freshness-2026-10-17.md), [freshness inventory](documentation-freshness-inventory-2026-10-17.md) and [changelog](CHANGELOG.md) at their recorded paths. Read current specifications and the register before using a historical observation.

## Placement and Git coordination

- Keep established specification and diagram paths stable. This layout moves only seven files that were untracked at the time of reorganization; their current contents and status are retained, with local links rebased.
- Put new reports, handoff notes, references and reviews in the matching folders. Use descriptive filenames; append `YYYY-MM-DD` to dated records. Link related records instead of duplicating their content.
- Preserve historical snapshots and accepted decisions. A location-only reference repair does not revise requirement or design semantics; REG-00 records the layout change separately.
- Keep future relocation changes separate from substantive edits when committing. Update incoming links, outgoing links and the register together. On a branch with work in progress, coordinate the old/new path mapping before merging; a directory layout cannot guarantee conflict-free merges.
- Stage only the intended files after reviewing the diff. Local `.obsidian/` settings and unrelated workspace edits are outside this reorganization.
- Run `npm run context:lint`, `npm run context:check`, `npm run context:test`, `npm run docs:lint` and `npm run docs:test`. The documentation verifier discovers these supporting folders recursively; diagram validation remains under its existing manifest.

## Handoff

Checklist: placement and reference checks must be recorded with their actual results; application verification is N/A for this navigation change. Assumption: stable tracked paths take priority over a full stage-by-stage relocation. Open limitation: existing diagram inconsistencies and concurrent branch edits need their own resolution. Ready for downstream navigation with those limits; no approval or runtime evidence is implied.
