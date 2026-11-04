# SP04-P01 — current source and invariant map

**Artifact ID:** SP04-P01\
**Version/date:** 0.2 Draft · 3 November 2026\
**Status:** See the single current status table in the [parent plan](../plan.md).

Objective: complete canonical SP-04.1 on the current main-based codex/sp-04 branch. Parent: PLAN-01 Month 1 / M-02–M-03 / SP-04 and co-delivered SP-11.1 audit capture. Inputs/versions and FR/AC/UC/TC trace are the parent's exact source list.

Prerequisites: read pre-flight/rules, current canonical spec/pack/contracts, selected owner-confirmed directions and actual SP-03 implementation; register this plan before writing the result. The separate older SP-04 worktree is read-only and supplies no current approval or test pass.

Allowed writes: this feature folder and registration-only support paths enumerated in the parent. No runtime, schema, contract, ADR or UI edits.

Steps: (1) freeze current source/branch identities; (2) map each operation's input/output, permission, revision, history and failure invariants; (3) map storage/reuse and unresolved design/API choices; (4) inspect existing audit for future chart reconstruction without adding a feature; (5) map later producer and SP-05 integration assertions; (6) run only the parent's P01 structural commands and preserve actual results.

Acceptance: source-review.md covers FR-09/40/43/44 and FR-31 capture, all UC-04 alternatives/exceptions, replay and denied-scope boundaries, current placement versus historical allocation, blocker sequence/cursor semantics, explicit capability provisioning gaps, and chart-history limits. Existing Musts and Proposed status stay unchanged. Evidence records actual source hashes and unchanged runtime/contracts/migrations; no implementation/testing claim is imported from the old worktree.

Verification: exact commands/environment/evidence destination are in the parent's P01 verification contract. A source-inspection assertion is not a passing runtime test. Preserve failures and record every unrun application/DB/browser/load gate.

Handoff: update only the parent task table/result with links to source-review.md, source manifest and check capture. Surface concrete P02 decisions without silently selecting material policy. No automatic commits, agents or external transfers.
