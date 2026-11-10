# Document creation and independent access — SP-06

**Artifact ID:** FEAT-SP06-01\
**Version/date:** 0.1 Draft · 7 November 2026
**Status:** Planning only under the owner's 7 November request “lên plan”; no SP06 production code or runtime acceptance.\
**Inputs:** PRD-01 v0.10.3; SP-06 v0.6.3; IMPL-SP-06 v0.1; PLAN-01 v0.4; SAD-03 v0.19.1; UC-02 v0.8.4; Workspace OpenAPI0.2.16 / Knowledge0.2.9; ADR-0007–0017 owner-confirmed directions; Proposed ADR-0006/0018/0019/0020/0022/0023 as scoped below. Exact source versions/digests are in evidence/planning-20261107/sources.json.\
**Trace:** FR/AC-04/10/14/50/51/52; supporting FR/AC-31/39/59/68; BR-01/04/10/11/14; SC-06.\
**Owner role:** Sequential coordinator/implementer; no independent approval.\
**Planning mode:** Plan mode unavailable in the current platform mode. Written planning/registration gate used; no mode switch claimed.\
**Work kind:** feature planning; runtime work remains gated.

## Goal, scope and parent registration

An authorised member creates an English text/Markdown document or decision with explicit classification and an immutable initial Current version. Current project and document rights independently control explorer/detail reads. A scoped access manager can classify/grant/revoke using known identity without receiving content-read. Revocation and membership removal order with protected server handoffs. Authority failure denies output; same-key reconciliation preserves identity across partial creation.

Parents: [PLAN-01 Month 2](../../../planning/five-month-plan.md), [roadmap M-04](../../roadmap.md), [canonical SP-06](../../../../specs/006-document-access.md), [pack SP-06.1–06.4](../../tasks/06-document-access.md), and co-delivered [SP-11.1 capture](../../tasks/11-audit-and-source-inspection.md). Registration: [feature register](../README.md), [source register](../../register.md), [central register](../../../sdlc/artifact-register.md). The existing M-04 also owns SP-07; completing this plan does not complete SP-07 or M-04.

Selected scope is the six SP06 Must requirements only, plus indispensable audit/session/membership/nondisclosure integration. FR-62 import (Should) and FR-65 metadata editing (Could) are not selected. No content revision/archive/delete/history UI (SP-07), keyword search/linking (SP-08), AI/provider/vector pipeline, audit inspector, new capability-delegation UI, retention sweeper, additional service, automatic merge or release claim. Search/citation/answer surfaces required by cross-feature ACs remain explicit downstream integration gates, not a claimed SP06-only pass.

SP05 is published separately in [PR #3](https://github.com/900M100CK/scrum-workspace-KMS-ai/pull/3), head8031503 at branch creation. This local branch codex/sp-06-document-access is based on that head while PR remains open; it is stacked, not proof that main contains it. Preserve codex/sp-05-could and unrelated local captures. No SP06 publication is authorised by the planning-only continuation.

## Implementation boundaries and decisions

Canonical allowed paths currently say services/knowledge/**, services/workspace/policy/**, apps/web/**, tests/**. Actual Workspace modules live under services/workspace/src/**; no document policy handler exists. P02 must record the coordinated amendment for src/policy, app/server wiring, session/project/authority/guard integration, additive owned migrations, contracts and directly affected registration/tests/runbooks before those edits. Planning support files here and four parent registers are authorised by the planning gate; preparation does not amend runtime scope.

Workspace alone owns sessions, membership, document policy/capabilities/grants and permission decisions. Knowledge alone writes immutable document/version/passage data and its creation/audit outcomes. Each service owns its transaction; no DB joins/writes across services. Reuse existing Fastify/React/session/private operator/owned transaction/replay conventions. Existing migrations Workspace001–013 and Knowledge001–003 are immutable; potential additive014+/004+ are conditional design, not files already created or applied.

Settled directions: explicit classification; creation-time author grants; read independent of authorship/write/manage/lifecycle/roles; Workspace first, no activation; Current without Draft; minimum audit in owning transaction; revoked/rejoined individual grants never revive; inaccessible orphan policies retained. No repeat approval of these business rules.

Material gates: D-03 only for extending private project creation provisioning; additional non-read delegation stays excluded. D-04 for document/action/policy/grant projection and per-page current authority, with no hidden metadata. D-07 for concrete single-active guard, internal service/actor authentication, nonrecursive authority checks, abort/restart and transport ordering. [Decision batch](decision-batch.md) presents the bounded proposal; Proposed ADRs are not accepted by continuation. D-05 opaque metadata command preconditions are outside selected FR-65; D-09 safe default is retaining orphans, with no deletion protocol. AI manifest/provider mechanics in ADR-0020/0023 are not adopted or implemented here. Any indispensable excess beyond ADR-0012 minimum is a separate owner decision.

All protected reads require server session, current membership and exact document authority. Unknown/denied/missing authenticated source reads use the same404 body {"code":"not_found","message":"Resource unavailable"}; failed authority returns declared generic failure without protected partial output. Final session/access/version validation stays inside the selected guard through transport finish/abort. Already transmitted bytes cannot be recalled. Generation waiting is outside guard. Internal scoped readonly policy checks must not reacquire it. Timeout is unknown; preserve actor/operation/key/body, never auto-generate a fresh key or delete an orphan. Content-bearing creation/replay output requires renewed read entitlement; P02 must reconcile exact response shape for a now-nonreading author before handlers.

## Tasks

Only this table stores mutable execution state. Every linked brief defines bounded paths, steps, assertions, planned verification and evidence handoff. Work is sequential.

| Task | Reviewable outcome | Dependencies / decision gate | Status / result |
| --- | --- | --- | --- |
| [SP06-P00](tasks/P00-source-readiness.md) | Reconcile sources, existing implementation and Must acceptance | None | Preparation verified; [source map](source-map.md), frozen input identities; no runtime |
| [SP06-P01](tasks/P01-decision-batch.md) | Present one bounded implementation decision batch | P00; owner disposition before dependent implementation | Proposal prepared; [B01–B03](decision-batch.md) await owner disposition |
| [SP06-P02](tasks/P02-source-contract.md) | Align canonical scope, contracts and verification trace | P01 selected clauses; no runtime implementation before alignment | Not started; prerequisite gate applies |
| [SP06-P03](tasks/P03-owned-storage.md) | Add owned creation, policy and receipt persistence | P02; exact migration design reviewed within selected scope | Not started; prerequisite gate applies |
| [SP06-P04](tasks/P04-private-authority.md) | Provision project create authority without role bypass | P02/P03; D-03 selection | Not started; prerequisite gate applies |
| [SP06-P05](tasks/P05-guard-service-auth.md) | Implement and prove the selected guarded source transport boundary | P02/P03; D-07 selection; exact protocol/fence mapped before implementation | Not started; prerequisite gate applies |
| [SP06-P06](tasks/P06-policy-registration.md) | Register Workspace identity, policy, initial grants and audit atomically | P03/P04/P05 | Not started; prerequisite gate applies |
| [SP06-P07](tasks/P07-knowledge-persistence.md) | Persist one initial immutable Current in Knowledge | P03/P05/P06 | Not started; prerequisite gate applies |
| [SP06-P08](tasks/P08-creation-orchestration.md) | Deliver public Workspace-first creation and exact-key recovery | P06/P07 | Not started; prerequisite gate applies |
| [SP06-P09](tasks/P09-access-management.md) | Implement policy/grant reads and classification/grant/revoke commands | P03/P04/P05/P06 | Not started; prerequisite gate applies |
| [SP06-P10](tasks/P10-protected-reads.md) | Deliver read-filtered explorer and current document detail | P05/P07/P09; D-04 selected clauses | Not started; prerequisite gate applies |
| [SP06-P11](tasks/P11-web-ui.md) | Connect existing-design document and known-ID access flows | P08/P09/P10 | Not started; prerequisite gate applies |
| [SP06-P12](tasks/P12-concurrency-failures.md) | Verify revocation, removal, partial creation and failure boundaries | P08/P09/P10/P11 | Not started; prerequisite gate applies |
| [SP06-P13](tasks/P13-runtime-browser.md) | Exercise installed-browser document journeys on real services | P11/P12; disposable PostgreSQL and trusted TLS available | Not started; prerequisite gate applies |
| [SP06-P14](tasks/P14-handoff.md) | Consolidate source-bound SP06 handoff and review assignment | P00–P13 mandatory assertions verified or explicit unresolved result | Not started; prerequisite gate applies |

## Acceptance and verification strategy

| Requirement / scenario | Producer tasks | Required actual evidence |
| --- | --- | --- |
| AC-10 / UC-06 creation and EX-01/02/05 | P03–P08, P11–P13 | Missing classification no writes; explicit author authority; initial immutable Current and one revocable grant; audit rollback; crash/lost-response/same-key identity across both commits; unknown outcome remains unknown |
| AC-04 / UC-06 EX-06; supporting AC-59/68 | P04/P05/P10–P13 | Project AND document read; same-role different grants; revoked author with manage/write retained; paired unknown/denied output; expired session/authority outage no disclosure |
| AC-50 / UC-06 Alt-2 | P09–P13 | shared→restricted→shared under independent manage-access, revision and guard; reader without manage denied; current members only |
| AC-51 / grant flow / EX-03 | P06/P09–P13 | Only current-member target; another document denied; grantee usable read; current membership-generation binding and no role/Admin bypass |
| AC-52/14 / revoke / EX-04/06; supporting AC-39 | P05/P09/P10/P12/P13 | Revoke/self-revoke/repeat; removed/rejoined grants invalid; paused real handoff order, socket abort/restart and unknown authority; subsequent implemented source reads deny |
| Supporting AC-31 / every producer | P03/P06–P09/P12 | State + minimum audit + immutable outcome in each owning transaction; injection rollback; downstream audit delivery failure preserves original result |
| UI / TC-22 | P11/P13 | Visible success/empty/denied/conflict/pending/outage, keyboard/focus/mobile, known-ID nonreader management, fresh reload and protected state clearing |

Canonical tests: TC-02/03/04/13/14/15/18/20/22/24 in TEST-08, scoped to implemented SP06 surfaces. AC-14/51/52 references to search, provider input, citation and answer delivery require later SP07–10 integration; keep those gaps in downstream handoff. First version immutable content is here; replacement/history is SP07. No unsupported optional operation is advertised by getAllowedActions.

Current structural commands (existing): npm run context:lint, context:check, context:test, contracts:test, docs:lint, docs:test, docs:sync-metadata -- --check. Existing application checks: npm run typecheck, build, test:foundation. Preparation verification runs only relevant structural gates after registration. Planned runtime commands do not yet exist: a bounded test:documents suite and storage/service/HTTP/concurrency/HTTPS-DOM/Edge subcommands are to be wired in P02 with actual files/options before execution. Historical session/project/task/Sprint schema ceilings remain explicit; add separate document fixtures rather than silently migrating them.

Runtime requires Node24+, disposable separately owned PostgreSQL databases, isolated installed browser and existing trusted local TLS. Docker was unavailable during preceding PUB03; availability is checked anew before each runtime phase, never inferred. Retain resource inventory, private role isolation, exact source/config digest, raw command/exit/assertions and all failed attempts under fresh feature evidence. Never log cookies, service keys, passwords or protected content; synthetic fixtures only. Contract/SQL/shape checks are not permission/transport evidence. No SP06 runtime is claimed in this planning request.

## Work breakdown, risks and handoff

[Breakdown](breakdown.md) maps stable tasks to parent children and relative size. Estimates are relative complexity only, not calendar promises or measured duration. Main risks are cross-service partial commit, revocation/send race, deadlock from recursive checks, nonreading manager metadata disclosure, stale multi-page projections, source-path/receipt drift and unavailable Docker. Fail closed; reopen the owning task on failed acceptance rather than weakening assertions or labelling mandatory failures optional.

Next action: review P01 decision batch and record B01–B03 disposition; P00 source reconciliation is recorded below. The owner's request here is to prepare a plan; no product code, DB upgrade, new dependency, commit/push or automatic feature acceptance follows from this document. Checklist: planning contract covered; runtime and independent review Not run. Source identities, current checks and actual preparation results are linked below after execution.

## Planning execution — 7 November 2026

P00 inspected canonical scope/trace, contracts, actual scaffold and owned migration series; the source map and digest snapshot record current gaps. P01 presents B01–B03 without assuming owner acceptance. No SP06 application, schema, contract, dependency or runtime-test code changed. [Planning check receipt](evidence/planning-20261107/checks/results.json): Node24.22.1; context45/45, contracts27/27 and docs20/20 pass (92 structural tests, zero application behaviors). Context/docs lints, context check, metadata check and whitespace check pass. Fifty local document links, fifteen unique briefs and65 unchanged source-input digests checked. Runtime, typecheck/build, browser and independent review were not run for this documentation-only work. Feature/source/roadmap/central registers and generated inventory are updated; only the owning plan stores task state. SP05 PR #3 head8031503 GitHub checks were observed successful (two context jobs and GitGuardian), independently of this local preparation.
