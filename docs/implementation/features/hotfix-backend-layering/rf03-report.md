# RF01–RF03 progress and stop report

**Artifact ID:** HF42-RF03-RESULT\
**Version/date:** 0.1 Draft · 4 November 2026\
**Status:** RF03 contract/reproduction delivered; expected null regression remains red. Owner requested report and stop before RF04. No whole-hotfix/independent/release acceptance.

## Scope and current state

HOTFIX-BACKEND-42-01 v0.6 owns this runtime follow-up on codex/hotfix-backend-layering. SP-04 e6f2337 is its committed source/regression baseline, not a second task owner. RF01 restored474 baseline paths as a guarded working-tree delta, retaining the hotfix section4.2 and all unrelated edits without changing HEAD/index/branch refs. Canonical metadata versions were reconciled with source inputs; original failures are retained. No Git merge, commit, push, applied migration edit, valuable-data upgrade or new dependency occurred.

RF02 adds services/workspace/src/projects/capabilities.ts and replaces only six identical project capability predicates: membership-manage in projectAccess and backlog-author/task-edit/task-state/task-assign/task-blocker in Task operations. Membership/read scope, action errors, client/lock/session ordering, batch discovery, private provenance and last-manager queries remain in their existing callers. Real SELECT privilege denial propagates to generic503, never false/allow. Workspace typecheck, new helper6/6 and affected existing Project/Task69/69 pass; overlapping results are not summed as unique coverage. Docker was off for the initial helper attempt; existing Desktop was started hidden and the same suite rerun. Only disposable fixtures migrated.

## RF03 contract and actual reproduction

[Proposed ADR0029](../../../adr/0029-unexpected-null-transaction-result.md) records: unexpected callback null without recorded denial must fail before COMMIT, mapping to existing generic503 access_unavailable, with attempted business/audit/original-outcome effects rolled back. A real recorded denial retains the existing normal-commit path for its actual authentication/clock fault evidence, then raises outside. Valid204 outcome objects with body:null remain valid. Lost COMMIT acknowledgement remains unknown and reconciles the original operation identity. The contract is Proposed; no formal/independent ADR acceptance is inferred.

[RF03 result and exact sources](evidence/refactor-2026-11-04/rf03-result.json) / rf03-null-red-attempt2.log record an actual disposable010 PostgreSQL17.10 run on Node24.22.1. The controlled callback reached its explicit null return with no preceding SQL failure. Current behaviour returned null without an error and committed Task revision1→2, business audit count1→2 and immutable original outcome count1→2. The new fail-closed/rollback assertion therefore fails as intended. This is a synthetic extension-risk reproduction, not an observed production handler incident.

The suite records8 test results:6 passing and2 failing (one unexpected-null child and its parent). Passing child cases cover legitimate false/zero/204-null-body success, known thrown rollback, generic protected HTTP503 without internal details, ordinary unauthenticated denial without invented fault audit, actual initial/final clock-fault latch/audit persistence and withholding of business writes, and actual lost-COMMIT acknowledgement with exact original-key replay and no second mutation. The generic HTTP error could already be produced by serializer rejection; that alone does not prove pre-COMMIT rollback. The real callback/persisted-state assertion supplies the distinguishing evidence.

The first RF03 attempt is retained and is not valid null-reproduction evidence: the test supplied a non-UUID correlation to a UUID audit field, so an earlier SQL error rolled back before reaching null. Its clock-recovery setup also reused sessions that recovery correctly revokes. Attempt2 uses a valid random UUID, asserts that the null return was actually reached, and establishes new synthetic sessions after recovery. Requirements and the rollback assertion were not weakened; unrelated setup failures are corrected rather than credited as the intended red test.

## Boundary and handoff

RF04 was not implemented. The complete authenticated transaction method is byte-for-text equal to the committed SP-04 method; only the separate helper call/import in projects/store.ts changed. session/database.ts, batch Task authority, contracts and SQL001–010 remain unchanged relative to the baseline;133 pre-existing outside files and all refs/index are preserved. P08 actual SP-05 integration, D-07 and independent acceptance stay open.

Next is RF04's small guard inside the existing transaction, then RF05 regression/handoff. Do not hide the current red test, call the whole follow-up complete, extract the runner, change cursor/discovery logic or weaken clock/idempotency assertions. Owner requested this stop/report boundary. Full post-guard/build/context/contracts/docs regression has not run; no new browser/load/provider/evaluation/independent/remote-CI campaign is claimed. Current documentation/source checks are separate from the expected failing runtime regression. No automatic publication or destructive recovery.
