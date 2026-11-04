# Reference evaluation cases — SDLC entry

**Artifact ID:** EVAL-CASES-ENTRY  
**Version/date:** 0.8.2 Draft · 3 November 2026\
**Status:** Owner-confirmed research/lifecycle direction; definitions not executed.
**Inputs:** [EVAL-01](../../eval/README.md) v0.2; TEST-08 v0.24.1; PRD-01 v0.10.1; ADR-0009/0012/0015.
**Author:** development agent acting sequentially; owner reviews business choices.

Canonical research definitions are [25 RQ cases](../../eval/research-cases.json) with [research corpus](../../eval/fixtures/research-corpus.json): 8 document / 8 state / 9 combined, per-configuration references and 12 pilot / 13 final draft split. Preserve the separate [25 safety EVAL cases](../../eval/reference-cases.json) on [synthetic-0.3](../../eval/fixtures/corpus.json) plus declared mutations. Never mix suite snapshots. No execution results are recorded; see the evaluation README for freeze/scoring rules and remaining gaps.

Checklist: Pass for canonical links/count/access/source fields; Gap for ingestion/pilot/final run. Handoff: SP-12 consumes these definitions after runtime contracts exist.

**v0.3 change summary:** Adds the adopted research suite and reconciled safety lifecycle. EVAL-05/21 changes are recorded with historical snapshots; no model result or frozen criterion was changed. H3 respects the explicit scoped-audit identity entitlement while continuing to protect content.

## Input metadata reconciliation — 25 October 2026

Only input-version metadata is synchronized for the bounded architecture/UC/checklist corrections. Requirements, acceptance assertions, design body and prior observations are unchanged; no complete semantic review or runtime check is implied.

## P10 input metadata — 28 October 2026

Input versions synchronize the bounded session lifecycle update. Existing requirement, evaluation and UI assertions remain unchanged; no runtime acceptance is inferred from this metadata revision.

1 November input-only reconciliation: TEST-08 v0.23 adds the bounded SP-02 result pointer. Evaluation definitions, thresholds and unrun research status are unchanged.
