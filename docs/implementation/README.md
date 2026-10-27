# SACW implementation entry

**Artifact ID:** IMPL-ENTRY-01\
**Version/date:** 0.2 Draft · 27 October 2026\
**Status:** Execution planning; no implementation or owner decision accepted by this pack.\
**Inputs:** PRD-01 v0.9; SPEC-INDEX v0.4; PLAN-01 v0.4; SAD-03 v0.16; owner request to register an agent implementation breakdown; ADR-0010 (see canonical status in decision register); Proposed ADR-0024/0025.\
**Trace:** Existing BR-01–BR-14 / SC-01–SC-08; no scope change.\
**Owner role:** Sequential development coordinator.

This folder turns existing requirements into linked, bounded execution briefs. It adds no deadline, automatic scope cut, product feature, framework selection or permission authority. The release tiers in the current PRD and ADR-0010/0016 remain binding. The existing relative calendar is retained at its original location; this pack orders work by dependencies.

## Start here

1. Read [root instructions](../../AGENTS.md), [development rules](../development-rules.md) and [pre-flight](../agent-preflight-checklist.md), including its before-report checks.
2. Follow the [source register](register.md) to canonical inputs; inspect current headers and changed files rather than trusting a historical chat summary.
3. Read [decisions](decisions.md) and the [roadmap](roadmap.md). Resolve only material choices needed for the selected step. This pack records blockers; it does not accept Proposed designs.
4. Select one child step from [the task catalogue](tasks/README.md), read its linked spec, FR/AC rows and exact contract operations, then follow [execution](execution.md).
5. Record actual evidence using [the handoff template](handoff-template.md). Keep structural checks separate from handler behaviour.

**Current preparation:** [SP-01.1 brief](briefs/SP-01.1-session-foundation.md) and [dated result](../sdlc/reports/SP-01.1-preparation-2026-10-27.md) provide concrete proposals and schema pre-evidence; HTTP/DB/session spike and owner choices remain open. SP-01 implementation still needs the relevant decisions. SP-11.1 audit capture accompanies the first producing mutation; it is not postponed until all work features exist. No agent is spawned by this pack.

## Folder map

| Document | Purpose |
| --- | --- |
| [register.md](register.md) | Sources, status authority, pack inventory and change-impact rules |
| [decisions.md](decisions.md) | Confirmed constraints, open choices, affected task packs and recording protocol |
| [roadmap.md](roadmap.md) | Dependency order and observable milestone gates |
| [execution.md](execution.md) | Bounded agent workflow, implementation patterns and verification rules |
| [tasks/README.md](tasks/README.md) | All spec packs, requirements, initial status and dependencies |
| [handoff-template.md](handoff-template.md) | Reusable task brief, result and next-agent handoff |
| [SP-01.1 brief](briefs/SP-01.1-session-foundation.md) | Exact contract assertions and bounded spike evidence gates |
| [Reconciled improvement report](improvement-report-techstack-to-sp.md) | External-review corrections, retained dependencies and concrete next work |

## Checklist and handoff

Pass: planning links and bounded task structure supplied. Gap: owner decisions, executable application commands, handler acceptance and independent review. Ready for downstream preparation with explicit gates; not blanket permission to implement every Proposed mechanism. The 27 October batch adds two Proposed session-foundation ADRs; application dependencies, new architecture diagrams and calendar changes remain outside this preparation.
