# SP-01 session foundation work plan

**Artifact ID:** FEAT-SP01-01\
**Version/date:** 0.2 Draft · 27 October 2026\
**Status:** Ready for bounded preparation tasks; application implementation gated.\
**Inputs:** [SP-01](../../../../specs/001-session.md) v0.4; [PRD](../../../sdlc/PRD_SRS.md) v0.9; [UC](../../../sdlc/use-cases.md) v0.8; [test plan](../../../sdlc/test-plan.md) v0.21; Workspace contract v0.2.8; TECH-STACK-01 v1.5; [canonical brief](../../briefs/SP-01.1-session-foundation.md) v0.2; [runtime spike brief](../../../../SP-01.1-spike-brief.md) v0.2; Proposed ADR-0024/0025 v0.1.\
**Trace:** FR-01/36/37/68; AC-01/36/37/68; UC-01 including EX-03; TC-01, applicable TC-18/22; BR-01/10; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer; owner selects material policy/stack choices.\
**Planning mode:** Unavailable in the active tool surface; written plan gate completed instead, with limitation disclosed.\
**Work kind:** feature, including its bounded spike and verification tasks.

## Goal, parents and authorisation

Authenticated users can sign in, recover their current server-derived session, sign out and lose protected access on expiry/logout. The UI uses real session responses while preserving the existing preview design. Plan preparation is authorised by the owner's request to switch to the SP-01 branch and plan; this instruction does not accept a stack or start application coding.

Parent links: [PLAN-01 Month 1 / Calendar and exit gates](../../../planning/five-month-plan.md#calendar-and-exit-gates), [M-01 authenticated foundation](../../roadmap.md), [SP-01 pack / children 01.1–01.4](../../tasks/01-session.md), [canonical SP-01](../../../../specs/001-session.md). Register links: [work plans](../README.md), [source register](../../register.md), [central register](../../../sdlc/artifact-register.md). Applicable SP-11.1 capture is co-delivered with its producer, not deferred or used as a circular whole-pack prerequisite.

Non-goals: projects/Scrum/document/AI features, provider integration, registration/reset/MFA, a frontend redesign, horizontal guard deployment, physical retention policy, unrelated dependency upgrades, commits/pushes or independent acceptance. Cross-project/document tests are later slices; a session-only result cannot close TC-02 or SC-06 as a whole.

## Branch and observed baseline

Active branch is `feature/sp-01-session-foundation`. It was fast-forwarded from `aec6bede1ae4a931134fa54d72fdb7cb24750ee3` to the current main commit `f25fd35bf07516f4e757d850a60f90d0e5d24f52`, then switched without stashing/discarding local changes. No new commit was created or pushed. Prior uncommitted planning/rules/registry changes, root external review/brief, scratch files and submodule modifications are retained. Re-inspect actual branch/status before every implementation task; this is a planning observation, not a digest of a future run.

Workspace currently has migrations 001–004 and no application session handler. `tests/workspace/` does not yet exist. The existing local schema probe/result are retained; their earlier eight schema assertions and three route assertions do not prove Fastify/DB/session behaviour. The 38 revised runtime-spike experiment IDs remain Not run. Do not infer Docker/network/compiler availability from an older report; inspect readiness in P01.

## Boundaries and gates

Canonical application paths: `services/workspace/**`, `apps/web/**`, `tests/workspace/**`. Workspace owns credentials/sessions and all associated writes; no Knowledge DB access or copied permission policies. Read exact [Workspace contract](../../../../contracts/openapi/workspace.openapi.json): POST/GET/DELETE `/session`, Login username/password, Session user_id/expires_at, logout 204 and unauthenticated GET 401. No token/password/hash in JSON bodies or logs.

Preparation experiments use `.tmp/sp01-foundation-2026-10-27/runtime/` with a separate manifest/lockfile and disposable storage as scoped by the runtime brief. Planning/registration files are in this authorised documentation batch. Root package/scripts/lockfile, shared contracts and wider tests are outside the canonical application paths: record a coordinated scope update before changing them in application work. New additive service migrations require owner-selected design, forward/reverse/repeat verification and the storage runbook; never edit applied migrations.

| Gate | Current state | Tasks affected |
| --- | --- | --- |
| D-01a backend | ADR-0024 Proposed; exact runtime/compiler/framework/driver/plugin tuple unselected | P01–P06 may compare; P07–P10 application adoption waits |
| D-02 identity/session | ADR-0025 Proposed; provisioning, cookie/CSRF, clock, renewal and production expiry unresolved | Synthetic spike is permitted; P07–P12 use only recorded selected policy |
| D-01b frontend | Proposed; preserve plain-JS preview, no framework adoption from this plan | P11 only needs a new choice if introducing frontend tooling |
| D-07 guarded invalidation | Proposed transport mechanics; session logout alone is not source revocation enforcement | P10/P12 surface affected integration and test limits; never claim guard evidence from session tests |
| Applicable audit capture | Canonical catalogue/TC-18 determines producers | P04 synthetic rollback is only laboratory evidence; P08–P10 co-deliver actual required capture |

## Tasks and acceptance

Each linked task file contains its own execution brief. The table below is the single source of mutable task status/result; task files link back here. All rows start Not started. A ready next task is identified below; no row is marked passed by writing this plan. Each task updates this table with a dated [handoff](../../handoff-template.md) under docs/sdlc/reports/ and actual command/source/configuration identity. Preserve failed results and unknown commit outcomes.

| Task ID / pack child | Reviewable outcome | Depends on / gate | Allowed write paths | Acceptance / verification | Status / result |
| --- | --- | --- | --- | --- | --- |
| [SP01-P01](tasks/SP01-P01-environment.md) / 01.1 | Inventory exact candidate versions, commands, environment and source scope | Current brief and source inspection | Task-specific runtime directory; dated report/plan registration | Record actual Node/compiler/package versions or unavailable state, installed-vs-candidate status, package isolation, DB readiness and safe disposable target; no production adoption | Not started; next ready preparation |
| [SP01-P02](tasks/SP01-P02-evidence-manifest.md) / 01.1 | Reproducible manifest and assertion ledger | P01 source/dependency layout | Runtime probe/scripts/results | Before/after manifests retain source/test/collector hashes and installed tuple, no recursive self-hash or secret output; input drift is detected; all 38 IDs start Not run with scope mapping | Not started |
| [SP01-P03](tasks/SP01-P03-http-spike.md) / 01.1 | HTTP/toolchain compatibility evidence | P01/P02; synthetic accounts only | Runtime src/test/results | Run E-HTTP-03 negative control before intended configuration; exact routes, non-mutating input validation, local refs/formats, compiler launch/typecheck, separate object/wire response checks, real HTTPS cookie/CSRF/log observations; record missing contract error mapping as finding | Not started |
| [SP01-P04](tasks/SP01-P04-database-spike.md) / 01.1 | pg/pool/transaction compatibility evidence | P01/P02; usable disposable DB | Runtime SQL/src/test/results | E-DB deterministic rollback, failed-rollback discard, cancellation vs termination, no secret persistence, exact bigint JSON and actual later pool recovery; mandatory-audit example labelled synthetic unless catalogue requires it | Not started |
| [SP01-P05](tasks/SP01-P05-session-spike.md) / 01.1 | Session lifecycle and race evidence | P03/P04 clock seam and persistence | Runtime src/test/results | E-SESSION with time sampled after row lock, no decreasing expiry/absolute extension; force both logout-renew orders and delayed-expired renewal via barriers; skew/backstep/restart failures remain visible; no tight timing or production-policy claims | Not started |
| [SP01-P06](tasks/SP01-P06-decision-batch.md) / 01.1 | Concrete owner decision batch | P03–P05 actual findings, or explicit partial gaps | Proposed decision/plan/report documentation with version registration | Present exact tuple, alternatives, evidence and open cookie/CSRF/provisioning/clock/expiry choices; owner response recorded in canonical process, no self-Accepted ADR; preparation completion does not close SP-01 | Not started; owner gate before adoption |
| [SP01-P07](tasks/SP01-P07-application-scaffold.md) / 01.2 | Selected application scaffold and runnable commands | P06 D-01a/D-02 disposition; coordinated paths recorded | Canonical application paths; shared paths only after scope update | Reuse observed working candidate; actual launch/build/typecheck/test commands exist and work, owned bounded pool config; no copied scratch secrets or synthetic policy import | Not started; gated |
| [SP01-P08](tasks/SP01-P08-owned-persistence.md) / 01.2 + applicable 11.1 | Owned credentials/session persistence and capture | P07 selected schema/provisioning policy | services/workspace/**; tests/workspace/** | Additive migration if needed with real forward/reverse/repeat tests; digest-only tokens, selected KDF, atomic required audit and rollback/discard; no physical retention invention or cross-service write | Not started; gated |
| [SP01-P09](tasks/SP01-P09-sign-in-context.md) / 01.2 | Real signIn/getSession | P08; selected adapter/security settings | Canonical application paths | Valid auth alone creates server-derived actor; forged fields cannot switch actor; generic invalid credentials, exact bodies/statuses, secure cookie, missing/invalid/expired GET denial and fail-closed store outage tested against real handlers/DB | Not started; gated |
| [SP01-P10](tasks/SP01-P10-session-end.md) / 01.3 | Real expiry/renewal/signOut | P09 selected time/policy; D-07 where affected | Canonical application paths | Strict configured expiry, renewal never revives/reverses deadline, logout old-token reuse denied and repeated invalid logout 204; actual barrier concurrency and applicable audit failures; transport integration limits stated | Not started; gated |
| [SP01-P11](tasks/SP01-P11-session-ui.md) / 01.3 | Session UI wired to real API | P09/P10; D-01b only if adopting tooling | apps/web/**; tests/workspace/** | Preserve soft-green preview design, sign-in/current-session/logout flow, protected-navigation expiry and state clearing, reload/keyboard/loading/error feedback; distinguish other synthetic screens; actual browser evidence separate from DOM | Not started; gated |
| [SP01-P12](tasks/SP01-P12-regression-handoff.md) / 01.4 | Integrated regression and evidence handoff | P07–P11 and applicable guards/capture | Canonical test/app paths; registered evidence docs | AC mapping below, real consumer/provider checks and actual browser/DB negatives, no secret/error leak; list Not run and remaining gates; parent pack Verified only with all applicable acceptance evidence | Not started; gated |

P03 and P04 may be prepared independently after prerequisites but are executed sequentially by default; no parallel-agent authority is granted. Required checks inside a task and reruns reuse this plan. If a failure needs a separate bounded fix/hotfix, add its reproduction/regression task here or register a linked child plan without losing the parent mapping.

## Requirement coverage and verification boundaries

| Requirement / case | Planned tasks | Assertion required for application acceptance | Current evidence |
| --- | --- | --- | --- |
| FR/AC-01 | P09/P11/P12 | Actor derives from actual authenticated session; forged requester cannot switch it | Application Not run; schema pre-evidence only |
| FR/AC-36 | P08/P09/P12 | Only successful auth establishes usable persisted session; invalid/unknown auth creates none | Not run |
| FR/AC-37; UC-01 EX-03 | P10/P11/P12 | Successful logout ends access; old token rejected; expired/invalid repeated logout 204 | Not run |
| FR/AC-68 | P10/P11/P12 | Configured expiry rejected, no renewal resurrection, UI requests sign-in and clears protected state | Not run |
| Applicable TC-18 | P08–P10/P12 | Required producer state + minimum audit commits atomically; failure rolls back | Not run; synthetic transaction is not application evidence |
| Applicable TC-22 | P11/P12 | Real session UI and server denial, not hidden-control simulation | Not run |

Existing commands, after inspecting actual package.json: `npm run context:lint`, `npm run context:check`, `npm run context:test`, `npm run docs:lint`, `npm run docs:test` and `npm run contracts:test`. These establish context/document/schema prerequisites only. DB commands and data-loss cautions belong to the [storage runbook](../../../../infra/postgres/README.md). New spike/app commands are Planned until implemented and executed; do not invent npm test or a production run command now. Optional disabled-account/alternate KDF/CSRF comparisons are applicability-labelled in the spike and do not become new Musts.

ApplicationHandlerBehavioursVerified remains 0 at plan creation. Laboratory HTTP assertions, schema checks, SQL checks and UI DOM checks are reported separately. Final feature acceptance requires actual handlers, persistence, negative cases, integrations and user-observable flow; it is neither schema success nor a count of complete task rows. Provider/knowledge operation fallback is not proved by a session feature.

## Handoff and change record

Next: SP01-P01, bounded environment/candidate inventory and a source-scoped report. Preserve local work; no commit/push or application dependency adoption follows merely from this plan. Record environment gaps without disabling tests. After P06, ask only for unresolved material choices against concrete evidence; existing owner-confirmed policy is not re-opened.

27 October 2026: initial plan saved on the existing SP-01 branch and registered under M-01 / PLAN-01 Month 1. Existing SP-01.1 preparation and historical schema evidence are linked rather than relabelled as a new run. **Checklist:** Self-checked for plan/trace/task/parent registration; runtime acceptance Not run; independent review and owner technology selection not claimed.

## Folder and task brief revision — 27 October 2026

Revision 0.2 relocates this plan into its feature folder and links 12 individual task briefs. Task IDs, prerequisites and acceptance scope remain unchanged. All task rows remain Not started; no spike or application work is executed by this documentation change.
