# Five-month release exceptions and capacity gate

**Artifact ID:** ADR-0010\
**Version/date:** 0.1 · 13 October 2026\
**Status:** Owner-confirmed release direction; evidence-based delivery still pending. No owner commit or independent approval claimed.\
**Inputs:** PRD-01 v0.4; PLAN-01 v0.1; [owner input](../../owner-decisions-OD-02-03-04-11.md); [BA-D02](../analyst/business-review-2026-10-13.md); ADR-0009.\
**Trace:** OD-11; BR-01–BR-14; Core completion exceptions below.

## Decision and exact Core-gate effect

Retain 60 release Must requirements after FR-45 withdrawal. The owner confirms these original Core requirements as optional for this release; original BRD priorities are preserved:

| Release tier | FR / AC exceptions | Accepted absence from this release |
| --- | --- | --- |
| Should | FR/AC-27, FR/AC-49, FR/AC-62 | Bounded retrieval summary, relationship removal and file import need not pass the release gate if omitted. Keep scoped full trace/source inspection, link creation/navigation, and text/Markdown creation. |
| Could | FR/AC-64, FR/AC-65, FR/AC-66, FR/AC-67 | Project metadata editing, knowledge metadata editing, planned Sprint editing and removal from Sprint Backlog need not pass the release gate if omitted. Creation fields and fixed Sprint completion remain. |
| Won't | FR/AC-35 | Enhanced reports are outside this release; not a new Core exception. |

These seven exceptions do not remove protected access, immutable versions, exact citations, current operational state, independent fallback or evaluation. All remaining Must ACs and applicable SC-01–SC-08 outcomes must still be verified. FR-45 is withdrawn under ADR-0009, not delivered or silently counted as an optional item.

## Capacity decision

At the end of Week 2 after the actual kickoff, and Months 2 and 3, record completed Must ACs with evidence, completed vertical slices, remaining work and available hours. Compute remaining Must FRs divided by actual working weeks before the Month-5 feature freeze. FR counts are an indicator, not equal-sized effort units; use slice estimates alongside them.

For the current 20-week plan with features through Week 16, the end-of-Week-2 window has approximately 14 feature weeks left, subject to the real calendar. Do not use the input's fixed 17-week estimate as the measured denominator. Kickoff date and weekly capacity are still unknown.

If throughput is insufficient, keep 60 Must and ask the owner to revisit schedule/capacity. The owner explicitly chose this over proposing further Must cuts. Stop optional work first, but do not claim that dropping already optional FRs reduces the 60 Must obligation. Month 5 remains evaluation, regression, deployment rehearsal, report and demo; no automatic scope change follows a failed gate.

**Alternatives:** silently reclassifying further Musts would violate owner direction; treating all FRs as equal effort would overstate feasibility. **Evidence:** scope decision only, no throughput or completed-handler claim. **Checklist:** Pass for explicit exceptions and escalation; Gap for measured capacity/calendar and completed ACs. **Handoff:** reconcile PLAN-01/backlog/release-scope, PRD release gates and validation rules.
