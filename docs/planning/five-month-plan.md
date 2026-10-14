# Five-month delivery plan and MoSCoW

**Artifact ID:** PLAN-01  
**Version/date:** 0.2 Draft · 13 October 2026\
**Status:** Draft for owner review; ADR-0007–ADR-0011 direction is owner-confirmed; application acceptance remains unproven.\
**Inputs:** BRD v1.0 via [stable entry](../BRD.md); [PRD-01 v0.5](../sdlc/PRD_SRS.md); owner direction: solo, five months, minimal microservices; [scope data](release-scope.json).\
**Author:** development agent acting sequentially; owner reviews business choices.

## Problem and prioritisation rule

The problem is finding applicable project knowledge across disconnected work and sources, with consistent access and version evidence (BRD §4). Pain points remain hypotheses. Avoid spending the short delivery window on a rich board or model research before task-to-evidence flows work.

| Pain point | Five-month response | Evidence |
| --- | --- | --- |
| PP-01 scattered knowledge | Text/Markdown knowledge, task links, permitted keyword search | SC-01 and exact-term reference source discovery |
| PP-02 missing task context | One basic task/Sprint flow plus direct source links | Task → applicable specification/decision |
| PP-03 unclear current source | Immutable versions, immediate Current revision, historical labels and operational-state observations | SC-03, SC-05, replacement/deletion tests |
| PP-04 individual dependence | English source discovery and evidence-backed question answering | Source found without the original author; no time-saving claim yet |
| PP-05 hard-to-reuse experience | Ordered blocker events, explicit outcome and linked history | SC-04 distinguishes planned and resolved work |
| PP-06 unverifiable answers | Exact version/passage citations, source inspection, insufficiency/conflict behavior and scoped provenance | SC-02, SC-07; manual claim-support scoring |

Access protection (BO-05), AI fallback and tests are release constraints, not optional features ranked by visible UI value. A feature is Must for this release if removing it breaks an authorised work-to-evidence flow, validity, citation inspection or verifiable fallback. Should improves that flow but has a documented alternative; Could adds editing convenience. Won't is outside this five-month release.

The 60 Must rows are atomic requirements, not 61 modules. Implement through the 13 vertical slices below. ADR-0010 confirms seven original Core FR/AC exceptions as Should/Could. All remaining 60 release Musts and applicable SC outcomes remain binding; FR-45 is Withdrawn. FR-35 remains BRD Should/Enhanced and is outside this release proposal. No priority is rewritten in BRD.

## Calendar and exit gates

Use five relative months, approximately 20 planned working weeks plus whatever calendar buffer remains. Set dates after kickoff is known. Available weekly hours are unknown; measure completed slices in the first two weeks instead of claiming that the deadline is proven.

| Month | Work | Exit evidence |
| --- | --- | --- |
| 1 / weeks 1–4 | Short policy/contract decisions; scaffold; sessions/project membership; create/update task; audit capture from the first mutation | Walking skeleton deployed locally; board survives provider outage; real auth and stale-edit tests |
| 2 / weeks 5–8 | Fixed Sprint lifecycle; restricted text/Markdown knowledge; grant/revoke/rejoin; immutable Current revisions/history; basic links and keyword fallback | Complete Scrum flow and SC-01/SC-05/SC-06 foundation; no known read leak |
| 3 / weeks 9–12 | One embedding/generation configuration; semantic discovery; cited answers; insufficiency/conflict; current operational questions | SC-02/SC-03/SC-07/SC-08; exact citations and paused revocation tests |
| 4 / weeks 13–16 | Scoped source/trace inspection; pilot about 20–30 questions; fix retrieval/version/access failures; only then optional Should/Could | Frozen criteria and final-case split; no known authorisation defect; matched keyword baseline if claiming improvement |
| 5 / weeks 17–20 | Final evaluation, regression, deployment rehearsal, report, limitations and demo recording | Reproducible results/configuration; clean negative-case gate; report and demo-ready application |

Reserve Month 5 for verification and submission, not new capabilities. If Month 1 has no walking skeleton, stop optional work and revisit estimates/OD-11 immediately. If the chosen provider fails the Month 3 pilot, keep keyword fallback and assess one permitted replacement; do not add an agent framework or an extra service to hide the failure.

## Proposed MoSCoW coverage

Counts: **Must 60, Should 3, Could 4, Won't 1**. Original BRD priority and P0/P1 implementation ordering remain distinct fields in scope data.

| Release tier | FRs | Reason / alternative |
| --- | --- | --- |
| Must | All other Core FRs, including permission, versions, links, keyword/semantic retrieval, citations, current state, audit and fallback | Minimum coherent response to PP-01–PP-06 with trust and verification |
| Should | FR-27, FR-49, FR-62 | Bounded retrieval summary after exact citation/full scoped trace; relationship removal after basic linking; file import after text creation/paste |
| Could | FR-64, FR-65, FR-66, FR-67 | Project/knowledge/planned-Sprint/allocation editing conveniences; create-time fields and fixed completion remain |
| Won't this release | FR-35 and BRD Enhanced/Future capabilities | Reports, complex import, rich maps/integrations, meeting AI, forecasting, automatic graphs and multi-agent runtime |

| FR | Original baseline | Five-month tier | Pain point / constraint | Slice |
| --- | --- | --- | --- | --- |
| FR-01 | Must/Core | Must | PP-01 | SP-01 |
| FR-02 | Must/Core | Must | PP-01 | SP-02 |
| FR-03 | Must/Core | Must | PP-01 | SP-02 |
| FR-04 | Must/Core | Must | PP-01 | SP-06 |
| FR-05 | Must/Core | Must | PP-02 | SP-03 |
| FR-06 | Must/Core | Must | PP-02 | SP-05 |
| FR-07 | Must/Core | Must | PP-02 | SP-05 |
| FR-08 | Must/Core | Must | PP-02 | SP-05 |
| FR-09 | Must/Core | Must | PP-02, PP-05 | SP-04 |
| FR-10 | Must/Core | Must | PP-01, PP-04 | SP-06 |
| FR-11 | Must/Core | Must | PP-03 | SP-07 |
| FR-12 | Must/Core | Must | PP-03 | SP-07 |
| FR-13 | Must/Core | Must | PP-03 | SP-07 |
| FR-14 | Must/Core | Must | PP-03 | SP-06 |
| FR-15 | Must/Core | Must | PP-03 | SP-07 |
| FR-16 | Must/Core | Must | PP-02, PP-05 | SP-08 |
| FR-17 | Must/Core | Must | PP-02, PP-05 | SP-08 |
| FR-18 | Must/Core | Must | PP-01, PP-04, PP-05 | SP-08 |
| FR-19 | Must/Core | Must | PP-03, PP-01, PP-04, PP-05 | SP-07 |
| FR-20 | Must/Core | Must | PP-01, PP-04, PP-05 | SP-08 |
| FR-21 | Must/Core | Must | PP-04, PP-06 | SP-09 |
| FR-22 | Must/Core | Must | PP-04, PP-06 | SP-09 |
| FR-23 | Must/Core | Must | PP-04, PP-06 | SP-09 |
| FR-24 | Must/Core | Must | PP-04, PP-06 | SP-09 |
| FR-25 | Must/Core | Must | PP-03, PP-06 | SP-10 |
| FR-26 | Must/Core | Must | PP-03, PP-06 | SP-10 |
| FR-27 | Must/Core | Should | PP-06 | SP-13 |
| FR-28 | Must/Core | Must | PP-04, PP-06 | SP-09 |
| FR-29 | Must/Core | Must | BO-05 / supporting constraint | SP-09 |
| FR-30 | Must/Core | Must | PP-04, PP-06 | SP-09 |
| FR-31 | Must/Core | Must | PP-05, PP-06 | SP-11 |
| FR-32 | Must/Core | Must | PP-06 | SP-11 |
| FR-33 | Must/Core | Must | PP-01, PP-04 | SP-12 |
| FR-34 | Must/Core | Must | PP-01, PP-04, PP-05 | SP-08 |
| FR-35 | Should/Enhanced | Wont | BO-01 / report convenience | Enhanced roadmap |
| FR-36 | Must/Core | Must | PP-01 | SP-01 |
| FR-37 | Must/Core | Must | PP-01 | SP-01 |
| FR-38 | Must/Core | Must | PP-01 | SP-02 |
| FR-39 | Must/Core | Must | PP-01, PP-03 | SP-02 |
| FR-40 | Must/Core | Must | PP-02 | SP-04 |
| FR-41 | Must/Core | Must | PP-02 | SP-05 |
| FR-42 | Must/Core | Must | PP-02 | SP-05 |
| FR-43 | Must/Core | Must | PP-02, PP-05 | SP-04 |
| FR-44 | Must/Core | Must | PP-02, PP-05 | SP-04 |
| FR-45 | Withdrawn; historical BR-05 | Withdrawn by ADR-0009 | Atomic replacement now FR-11 | ID retained |
| FR-46 | Must/Core | Must | PP-04, PP-06 | SP-09 |
| FR-47 | Must/Core | Must | PP-03, PP-01, PP-04, PP-05 | SP-07 |
| FR-48 | Must/Core | Must | PP-03 | SP-07 |
| FR-49 | Must/Core | Should | PP-02, PP-05 | SP-08 |
| FR-50 | Must/Core | Must | PP-01 | SP-06 |
| FR-51 | Must/Core | Must | PP-01 | SP-06 |
| FR-52 | Must/Core | Must | PP-01, PP-03 | SP-06 |
| FR-53 | Must/Core | Must | PP-01, PP-04, PP-05, PP-06 | SP-09 |
| FR-54 | Must/Core | Must | PP-04, PP-06 | SP-09 |
| FR-55 | Must/Core | Must | PP-06 | SP-09 |
| FR-56 | Must/Core | Must | PP-05, PP-06 | SP-13 |
| FR-57 | Must/Core | Must | PP-06 | SP-11 |
| FR-58 | Must/Core | Must | PP-06 | SP-13 |
| FR-59 | Must/Core | Must | PP-01 | SP-08 |
| FR-60 | Must/Core | Must | PP-04, PP-06 | SP-09 |
| FR-61 | Must/Core | Must | PP-03, PP-06 | SP-07 |
| FR-62 | Must/Core | Should | PP-01, PP-04 | SP-06 |
| FR-63 | Must/Core | Must | PP-01, PP-04, PP-05 | SP-08 |
| FR-64 | Must/Core | Could | PP-01 | SP-02 |
| FR-65 | Must/Core | Could | PP-01, PP-04 | SP-06 |
| FR-66 | Must/Core | Could | PP-02 | SP-05 |
| FR-67 | Must/Core | Could | PP-02 | SP-05 |
| FR-68 | Must/Core | Must | PP-01 | SP-01 |
| FR-69 | Must/Core | Must | PP-01, PP-04 | SP-09 |

## Resources and agent execution

One human owns product decisions, integration and review. No parallel development agents are started by this plan. When later authorised, agents consume one spec and its allowed paths; shared contracts have one editing owner at a time. Never claim independent review of the same agent's own work.

Use two business services, one web UI and one local development environment. Proposed stack is one application language (TypeScript), React UI, Fastify services and PostgreSQL with a pgvector candidate. The stack/store/provider choices stay Proposed in ADRs until chosen and exercised. Account provisioning may be manual for the demo; no enterprise identity scope is added.

The owner asked to keep budgeting proportionate to a student project. Currency, period, machine and runtime/API allowance were not confirmed; no numeric spend forecast is made. Development-assistant subscriptions and application runtime costs are separate entries. Begin with synthetic fixtures and a single provider configuration; do not send real data to a new external provider.

## Decisions, checklist and handoff

OD-11 must record any actual deferral and the exact affected Core gate/ACs. OD-02–OD-04 cover access/lifecycle/Sprint policies, OD-06 provider/environment, OD-09 identity and OD-12 stack selection. Use the architecture and contracts as drafts until these are resolved. Permission enforcement mechanics remain subject to implementation tests.

Checklist: Pass for PP/problem trace, 68 active FRs classified once plus retained Withdrawn FR-45, business-vs-delivery priority distinction, sequential milestones and protected evaluation time. Gap for empirical weekly capacity, accepted deferrals, chosen stack/provider and runtime evidence. Handoff: Needs owner decision for scope and technical baselines; independent documentation and the context harness can proceed.

## Confirmed capacity and release-gate follow-up

ADR-0010 fixes 60 Must / 3 Should / 4 Could / 1 Won't active requirements. Exact exceptions are AC-27, AC-49, AC-62, AC-64–AC-67; FR-45 is withdrawn, not delivered. Submission is April 2027 and intended effort is at least eight hours per working day. Kickoff, exact submission date and working days/week remain unknown; no measured velocity is claimed.

At Week 2 and the ends of Months 2/3, record completed Must ACs and slices, remaining work and working weeks before Month 5. In a 20-week relative plan the end-of-Week-2 feature window is about 14 weeks, not a fixed 17. Retain 60 Must if capacity falls short and revisit schedule/capacity with the owner; dropping already optional work is not another reduction of Must. Month 5 stays verification/report/demo. Storage is selected under ADR-0004; framework/provider decisions remain separate. Earlier proposed-cut/resource text above is superseded by this explicit owner-confirmed follow-up.

## Owner extension - 14 October 2026

ADR-0016 adds FR-70 task keyword search as Should after the existing 60 Must. PLAN-01 release-scope now records 69 active requirements: 60 Must, 4 Should, 4 Could, 1 Wont; FR-45 remains Withdrawn. Month 4 is a tentative placement only if Must throughput permits. This is added optional scope, not an original-Core deferral.
