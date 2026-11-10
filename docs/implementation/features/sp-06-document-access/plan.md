# Document creation and independent access — SP-06

**Artifact ID:** FEAT-SP06-01\
**Version/date:** 0.5 Verified continuation · 10 November 2026
**Status:** B01 and B03 selected in bounded receipts; P01-A/P02-A/P03-A and P04 are verified in bounded slices; P02-B source alignment verified. B02 remains open; public document creation and transport implementation are not claimed.\
**Inputs:** PRD-01 v0.10.3; SP-06 v0.6.4; IMPL-SP-06 v0.2; PLAN-01 v0.4; SAD-03 v0.19.1; UC-02 v0.8.4; Workspace OpenAPI0.2.16 / Knowledge0.2.9; ADR-0007–0017 owner-confirmed directions; Proposed ADR-0006/0018/0019/0020/0022/0023 as scoped below. Initial source versions/digests in evidence/planning-20261107/sources.json are historical; current P02-A/P02-B source delta is recorded in its result/evidence.\; Proposed ADR-0032 v0.1; Proposed ADR-0033 v0.1
**Trace:** FR/AC-04/10/14/50/51/52; supporting FR/AC-31/39/59/68; BR-01/04/10/11/14; SC-06.\
**Owner role:** Sequential coordinator/implementer; no independent approval.\
**Planning mode:** Initial written gate used while Plan mode was unavailable. Subsequent actual Plan-mode discussion selected B01; the current continuation is Default mode and resumes this written gate. No mode switch is claimed by repository text.\
**Work kind:** feature; current task is bounded decision/source preparation; runtime work remains gated.

## Goal, scope and parent registration

An authorised member creates an English text/Markdown document or decision with explicit classification and an immutable initial Current version. Current project and document rights independently control explorer/detail reads. A scoped access manager can classify/grant/revoke using known identity without receiving content-read. Revocation and membership removal order with protected server handoffs. Authority failure denies output; same-key reconciliation preserves identity across partial creation.

Parents: [PLAN-01 Month 2](../../../planning/five-month-plan.md), [roadmap M-04](../../roadmap.md), [canonical SP-06](../../../../specs/006-document-access.md), [pack SP-06.1–06.4](../../tasks/06-document-access.md), and co-delivered [SP-11.1 capture](../../tasks/11-audit-and-source-inspection.md). Registration: [feature register](../README.md), [source register](../../register.md), [central register](../../../sdlc/artifact-register.md). The existing M-04 also owns SP-07; completing this plan does not complete SP-07 or M-04.

Selected scope is the six SP06 Must requirements only, plus indispensable audit/session/membership/nondisclosure integration. FR-62 import (Should) and FR-65 metadata editing (Could) are not selected. No content revision/archive/delete/history UI (SP-07), keyword search/linking (SP-08), AI/provider/vector pipeline, audit inspector, new capability-delegation UI, retention sweeper, additional service, automatic merge or release claim. Search/citation/answer surfaces required by cross-feature ACs remain explicit downstream integration gates, not a claimed SP06-only pass.

SP05 is published separately in [PR #3](https://github.com/900M100CK/scrum-workspace-KMS-ai/pull/3), head8031503 at branch creation. This local branch codex/sp-06-document-access is based on that head while PR remains open; it is stacked, not proof that main contains it. Preserve codex/sp-05-could and unrelated local captures. The later first-task instruction authorises local task execution, not SP06 commit/push/PR or merge.

## Implementation boundaries and decisions

Canonical SP-06 v0.6.4 now records only the B01 private document-authority adapter, existing project operator/CLI integration, additive014, DOCUMENTS.md and document-authority test/fixture paths. No document policy handler exists. App/server/gateway/session/guard wiring, further owned schema and contracts require later decision-specific amendments before editing. Planning support files here and four parent registers are authorised by the planning gate; preparation does not amend runtime scope.

Workspace alone owns sessions, membership, document policy/capabilities/grants and permission decisions. Knowledge alone writes immutable document/version/passage data and its creation/audit outcomes. Each service owns its transaction; no DB joins/writes across services. Reuse existing Fastify/React/session/private operator/owned transaction/replay conventions. Existing migrations Workspace001–013 and Knowledge001–003 are immutable; potential additive014+/004+ are conditional design, not files already created or applied.

Settled directions: explicit classification; creation-time author grants; read independent of authorship/write/manage/lifecycle/roles; Workspace first, no activation; Current without Draft; minimum audit in owning transaction; revoked/rejoined individual grants never revive; inaccessible orphan policies retained. No repeat approval of these business rules.

Material gates: D-03/B01 private project creation provisioning was explicitly selected; [owner receipt](evidence/p01a-20261107/owner-selection.json). Additional non-read delegation stays excluded. D-04 for document/action/policy/grant projection and per-page current authority, with no hidden metadata. D-07 for concrete single-active guard, internal service/actor authentication, nonrecursive authority checks, abort/restart and transport ordering. [Decision batch](decision-batch.md) presents the bounded proposal; Proposed ADRs are not accepted by continuation. D-05 opaque metadata command preconditions are outside selected FR-65; D-09 safe default is retaining orphans, with no deletion protocol. AI manifest/provider mechanics in ADR-0020/0023 are not adopted or implemented here. Any indispensable excess beyond ADR-0012 minimum is a separate owner decision.

All protected reads require server session, current membership and exact document authority. Unknown/denied/missing authenticated source reads use the same404 body {"code":"not_found","message":"Resource unavailable"}; failed authority returns declared generic failure without protected partial output. Final session/access/version validation stays inside the selected guard until delivery finishes or active socket destruction confirms close under the bounded revocation deadline. Already transmitted bytes cannot be recalled. Generation waiting is outside guard. Internal scoped readonly policy checks must not reacquire it. Timeout is unknown; preserve actor/operation/key/body, never auto-generate a fresh key or delete an orphan. Content-bearing creation/replay output requires renewed read entitlement; P02 must reconcile exact response shape for a now-nonreading author before handlers.

## Tasks

Only this table stores mutable execution state. Every linked brief defines bounded paths, steps, assertions, planned verification and evidence handoff. Work is sequential.

| Task | Reviewable outcome | Dependencies / decision gate | Status / result |
| --- | --- | --- | --- |
| [SP06-P00](tasks/P00-source-readiness.md) | Reconcile sources, existing implementation and Must acceptance | None | Preparation verified; [source map](source-map.md), frozen input identities; no runtime |
| [SP06-P01](tasks/P01-decision-batch.md) | Incremental decision milestones, status only in child rows below | P00; select only the decision required by the next producer | Partial; A received; B/C open |
| [SP06-P01-A](tasks/P01-A-private-provisioning.md) | Record B01 and its exact bounded authority | P00 plus explicit owner selection | Preparation verified; [P01-A result](p01a-result.md),92 structural tests; no runtime |
| [SP06-P01-B](tasks/P01-B-handoff-discussion.md) | Brainstorm B03 before guarded service/transport implementation | Inspect concrete protocol alternatives before asking; P05 depends on disposition | Owner-selected bounded direction; [receipt](evidence/p01b-20261109/owner-receipt.json); P02/P05 mapping next |
| [SP06-P01-C](tasks/P01-C-projection-discussion.md) | Brainstorm B02 before document projection/access UI implementation | Inspect current contracts and fresh-client cases; P09/P10/P11 depend on relevant disposition | Not started; B02 not selected |
| [SP06-P02](tasks/P02-source-contract.md) | Align sources in decision-specific increments | Only the relevant selected P01 clause; no blanket B01–B03 gate | Not started; A next, B03/B02 increments remain gated |
| [SP06-P02-A](tasks/P02-A-provisioning-source.md) | Align only B01 authority source/paths and verification trace | P01-A bounded handoff and passing structural checks | Source verified; [P02-A result](p02a-result.md),92 structural tests; no runtime |
| [SP06-P02-B](tasks/P02-B-transport-source.md) | Align B03 guarded transport sources, protocol and test trace | P01-B bounded handoff; B03 owner receipt | Source verified; [P02-B result](p02b-result.md); no runtime |
| [SP06-P03](tasks/P03-owned-storage.md) | Owned storage parent; later creation/policy receipt increment remains gated | Relevant P02 source increment; no blanket B02/B03 adoption | Partial preparation only; A separated below |
| [SP06-P03-A](tasks/P03-A-create-authority-storage.md) | Add only014 private document-create authority prerequisite | Verified P02-A; Proposed ADR-0032 exact bounded design | Verified storage slice; [evidence](evidence/p03a-20261109/results.json); P04 next |
| [SP06-P04](tasks/P04-private-authority.md) | Provision project create authority without role bypass | Verified P02-A and P03-A; B01 selected | Verified operator slice; [evidence](evidence/p04-20261109/results.json); P05 next |
| [SP06-P05](tasks/P05-guard-service-auth.md) | Implement and prove the selected guarded source transport boundary | Verified P02-B/P03-A/P04; B03 selected; exact protocol mapped | Verified guard/auth slice; [evidence](evidence/p05-20261110/results.json); 9/9 passed; P06 next |
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

Next action: P03-A additive private authority storage; P02-A source alignment verified. B01 remains selected; B02/B03 are not prerequisites of this authority-only increment. Discuss B03 immediately before its guarded transport source/producer increment; discuss B02 before its document projection/access-management increment. The owner authorised the first task; no DB upgrade, new dependency, commit/push or automatic feature acceptance follows from that instruction. Checklist: planning contract covered; runtime and independent review Not run. Source identities, current checks and actual preparation results are linked below after execution.

## B03 decision continuation — 9 November 2026

The owner selected the bounded B03 direction after brainstorming: fixed Workspace gateway; Workspace-only permission authority; trusted TLS; rotated server-side `X-Service-Key` with constant-time comparison; server-forwarded `X-Actor-Session`; project-scoped reader-writer guard with writer preference; revoked flag and active-socket destruction with close deadline; `unknown` on unconfirmed close or ambiguous restart; fencing generation before delivery resumes; and no automatic multi-authority failover. [P01-B owner receipt](evidence/p01b-20261109/owner-receipt.json) records the exact selection. P02/P05 must map these clauses to concrete contracts, lock order and runtime tests before implementation.

The earlier “Next action” paragraph is retained as historical planning context; the current next action is the P02/P05 B03 protocol mapping gate above.

## Planning execution — 7 November 2026

P00 inspected canonical scope/trace, contracts, actual scaffold and owned migration series; the source map and digest snapshot record current gaps. P01 presents B01–B03 without assuming owner acceptance. No SP06 application, schema, contract, dependency or runtime-test code changed. [Planning check receipt](evidence/planning-20261107/checks/results.json): Node24.22.1; context45/45, contracts27/27 and docs20/20 pass (92 structural tests, zero application behaviors). Context/docs lints, context check, metadata check and whitespace check pass. Fifty local document links, fifteen unique briefs and65 unchanged source-input digests checked. Runtime, typecheck/build, browser and independent review were not run for this documentation-only work. Feature/source/roadmap/central registers and generated inventory are updated; only the owning plan stores task state. SP05 PR #3 head8031503 GitHub checks were observed successful (two context jobs and GitGuardian), independently of this local preparation.

## Incremental first-task continuation — 7 November 2026

Before changing task outputs, register P01-A/B/C and P02-A here and in parent registers. The owner selected private internal provisioning for B01 and requested first-task execution on the existing SP06 branch. P00 is already prepared; the first open deliverable is P01-A, not the P04 runtime operator. Preserve the initial planning/source/check snapshots. P01-A may change only owning task/decision/result/receipt files and coordinated registration metadata; no application/contract/schema/dependency or accepted ADR change. Planned checks: Node24 context lint/check/test, contracts tests, docs lint/tests, metadata, local links, unchanged65 input digests, branch/index/outside-scope preservation. Runtime is not applicable to this preparation deliverable and cannot be reported passed. B02/B03 are not implied by B01 or by generic continuation. Apply Ponytail and Karpathy Guidelines throughout; no new tools/dependencies/agents.

P01-A actual: [SP06-P01A-RESULT-01](p01a-result.md) records the explicit B01 selection, preserved original drafts and incremental gates. Fresh Node24.22.1 context45/45, contracts27/27 and docs20/20 pass; lints/context/metadata/diff and current links/source/scope checks pass. All65 frozen inputs unchanged; no application/contract/schema/dependency/runtime edit or commit/push. P02-A is ready; B03/B02 await their later bounded discussion.

## P02-A written execution gate — 7 November 2026

The owner requested the next task. Execute only ready P02-A: align selected B01 in canonical SP06/pack, the decision map and planned test trace; specify a bounded Proposed ADR for reusing private authority mechanics, explicit future code/test/runbook paths, and the independent P03-A storage prerequisite. Amend only directly dependent index/input/register metadata. No current application/SQL/contract/root runner/dependency edit, accepted ADR or BRD change, B02/B03 adoption, commit/push or production migration. Freeze current source/evidence identities first. Planned checks: Node24 context lint/check/test, contracts tests, docs lint/tests, metadata/diff, selected scope/links, unchanged application/contracts/migrations/prior evidence and source-delta classification. Preserve all original runs.

P02-A check triage: first docs lint rejected the current evaluation-entry TEST-08 input alias. Preserve that exact tool-returned failure; update only EVAL-CASES-ENTRY v0.8.4 header/input metadata, not evaluation definitions or results. This is directly dependent metadata support within P02-A; register its version and rerun existing checks without weakening them.

P02-A actual: [SP06-P02A-RESULT-01](p02a-result.md) binds canonical SP06/pack/decision/test source revisions and Proposed ADR-0032. Fresh92 structural tests plus lints/context/metadata/diff pass; the initial evaluation-input alias failure is retained and corrected without changing evaluation definitions. Source delta is six intended documents of65 original frozen inputs;59 unchanged. No code/SQL/contracts/dependency edit or runtime execution. P03-A is ready; B02/B03 remain open and no publication occurred.

P03-A actual: migration014 and its reversible down guard were added with focused storage tests. The disposable PostgreSQL test passed1/1 on Node24.22.1, covering exact private issuance provenance, runtime-role restrictions, exact invalidation, audit nondisclosure and retained-evidence rollback. P03-A changes no public document handler and does not resolve B02/B03. P04 private operator integration is next; broader creation/transport/projection/browser checks remain unrun.

P04 actual: the private operator allowlist and provenance path now support only the selected B01 `knowledge-author` capability. The focused disposable PostgreSQL run passed 6/6 P04 assertions and the P03-A storage regression passed 1/1 in the same invocation. Coverage includes CAS grant/revoke, exact grant-id audit provenance, enabled/current-membership and project scope denials, removal invalidation with non-reviving rejoin, audit-trigger rollback, and the private CLI. No public handler, B02/B03 decision, commit or push was added. `npm run typecheck` passed; context lint/check/test (45 assertions), docs lint/test (20 assertions) and metadata check (66 artifacts) also passed. Evidence is linked from the P04 row above.

## P02-B written execution gate — 10 November 2026

Execute ready P02-B: align selected B03 in canonical SP06/pack and Proposed ADR-0033. Specify the bounded transport and guard design: project-scoped reader-writer guard with writer preference, active socket destruction on revocation with bounded close deadline, new delivery re-check, fencing generation across restart, and constant-time X-Service-Key comparison over trusted TLS. Reserve future P05 implementation paths (`services/workspace/src/policy/guard.ts`, `services/workspace/src/transport/service-auth.ts`, `tests/workspace/transport-guard.test.mjs`) without editing code in this step. B02 remains open.

P02-B actual: [SP06-P02B-RESULT-01](p02b-result.md) binds canonical SP06/pack and Proposed ADR-0033. Fresh structural checks pass; no application, contract, schema, or runtime test code changed. P05 runtime implementation is ready to proceed.

## P05 written execution gate — 10 November 2026

Execute ready P05: implement `ProjectRWGuard` in `services/workspace/src/policy/guard.ts` (project-scoped reader-writer lock, writer preference, active socket destruction on revocation with bounded close deadline, generation fencing across restart, delivery re-check) and `services/workspace/src/transport/service-auth.ts` (constant-time `X-Service-Key` comparison, gateway internal header stripping, forwarded actor session). Exercise real concurrency, timeout, fencing and key-comparison tests in `tests/workspace/transport-guard.test.mjs`.

P05 actual: `tests/workspace/transport-guard.test.mjs` passed 9/9 assertions with zero failures. Coverage includes concurrent shared reads, writer preference starvation prevention, socket destruction with confirmed closure (`revoked`), unclosed socket timeout (`unknown`), revoked delivery re-check, generation fencing restart isolation, constant-time key validation, and gateway header stripping. `npm run typecheck` passed cleanly across all workspaces. [Evidence](evidence/p05-20261110/results.json) is linked from the P05 row above. No public document handler or B02 projection was implemented.
