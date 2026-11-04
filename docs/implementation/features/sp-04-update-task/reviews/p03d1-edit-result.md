# SP04-P03D1 — bounded Backlog edit result

**Artifact ID:** SP04-P03D1-RESULT  
**Version/date:** 0.1 Draft · 4 November 2026  
**Status:** Bounded author verification; no independent/release acceptance.  
**Inputs:** SP04-P03D1 v0.1; FEAT-SP04-01 v0.13; SP-04 v0.7.3; Workspace0.2.13; selected owner directions / Proposed ADR0028 v0.1; Node24.22.1.

## Requirement and implementation

FR-40/AC-40 / SP-04.2 / PLAN-01 Month1 / M-02–M-03. Existing PATCH /tasks/{task_id} now edits Backlog title/description with current server session/member/read/task-edit checks. Role, creator, membership-manage and backlog-author create rights grant no edit capability. The exact current target is resolved internally; Project then Task are locked in the existing same-client wrapper. Unknown access/DB failures withhold content. No permission rules are copied to another service.

Store uses direct SQL and existing typed010 outcome adapter; HTTP validates existing EditTask/Task schemas and uses current mutation origin/cookie/header rules. Fixed canonical input hashing preserves field omission. Actual changes increment revision once and co-commit backlog-item-edit audit (actor/entity/correlation and revision refs) and immutable200. No-op produces a retained200 without fake audit/revision change. Existing creation time/location/order/state/assignee/blocker values remain unchanged; content edit does not manually advance Backlog generation.

Current authority is rechecked before historical same-key replay, which resolves before new-write revision/Backlog preconditions. Later state is read separately. Guard denial occurs before business writes; the unchanged runner may commit required authentication-fault evidence before raising denial. No runner, repository or shared capability abstraction was introduced. This preserves the selected design rather than adopting a new pattern.

## Actual verification

[Checks](../evidence/p03d1/checks.json) record all exits and full logs. New suite passes14/14; combined actual Task HTTP/read/concurrency/authority/edit regression passes61/61 (includes the new14, not additional61). Workspace typecheck, context check, context tests45/45, contracts27/27, docs lint and docs tests20/20 pass. Synthetic disposable010 and retained009 fixtures were used; no valuable database upgraded.

Coverage includes strict input and400/401/403/404/409/413/415, exact persisted text/audit/original200, omission/no-op/hash distinctions, safe revision bounds, task/audit/outcome rollback and same-key retry, duplicate/concurrent revision writes, actual edit-vs-revoke ordering, removal-before-edit and no grant restoration on rejoin, live discovery filtering and session expiry after a real SQL pause. Placement bypass/rejection uses a labelled projection double because Sprint handlers do not yet exist; it is not actual SP-05 acceptance.

The original failed attempt is retained in task-edit-attempt1.log: the test used supported text/plain as an unsupported media case, and later rollback iterations reused unchanged content and correctly took the no-op branch. Test setup was corrected to use application/x-custom and distinct changed titles for each injected database fault; requirements and application code were not weakened. The passing rerun is task-edit-attempt2.log.

## Preservation and limits

[Source identities](../evidence/p03d1/source-inputs.json), before-images and preservation evidence distinguish this producer from prior uncommitted work. Existing Task create/get/list bodies, original receipt adapter, transaction runner, Project store, contracts/spec/ADR, package pins and captured migrations remain unchanged. The existing authority suite changes one production-registry expectation because editTask is now genuinely registered; synthetic future registries remain labelled. No hotfix-main changes were merged into this checkout.

No edit UI/browser, new real socket edit-delivery gate, D-07 absolute revocation boundary, full session/project release regression, actual Sprint integration, state/assignment/blocker/history producer, provider/evaluation/load or independent review was run/claimed. Existing Task regression includes its historical HTTPS check, which is not credited as a new PATCH transport proof. There is no migration/contract/ADR adoption or Git publication.

## Handoff

P03D1 is bounded to editTask. Next task requires a separately refined/registered state-change producer brief under the existing P03 grouping; do not automatically implement it. Full SP-04 and actual SP-05 completion/allocation/reopen races remain open. Read the owning plan for status, not this report as authorisation. Recovery would revert only this producer's changes against its captured before-images, preserving other SP-04 work and010 evidence; no valuable-data rollback.
