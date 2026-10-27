# Documentation reading routes

**Artifact ID:** DOC-NAV-01\
**Version/date:** 0.1 Draft · 27 October 2026\
**Status:** Navigation only; source decisions and acceptance stay in their canonical artifacts.\
**Inputs:** Development rules v1.5; AGENTS.md v1.7; existing directory indexes.\
**Trace:** Existing BR-01–BR-15 / SC-01–SC-08 navigation; no new FR/AC.\
**Owner role:** Sequential development coordinator.

## Choose a route

| Purpose | Read in order |
| --- | --- |
| Explain the capstone to an advisor | [BRD](BRD.md) → [PRD/SRS](sdlc/PRD_SRS.md) → [five-month plan](planning/five-month-plan.md) → [architecture](architecture.md) |
| Start implementation | [Development rules](development-rules.md) → [pre-flight](agent-preflight-checklist.md) → [implementation entry](implementation/README.md) → the linked canonical [feature spec](../specs/README.md) |
| Find decisions and their status | [ADR index](adr/README.md) → [implementation decision register](implementation/decisions.md) |
| Review design and evidence gaps | [SDLC index](sdlc/README.md) → [artifact register](sdlc/artifact-register.md) → the relevant review, report or handoff |
| Work on UI | [UX entry](sdlc/ui-ux-spec.md) → [reference desk](../references/README.md) → [web preview](../apps/web/README.md) |
| Run checks or local storage | [Tooling map](../scripts/README.md) → [storage runbook](../infra/postgres/README.md) when needed |

## Folder ownership

| Folder | Contains |
| --- | --- |
| `baseline/` | Full BRD editions and separately proposed addenda |
| `adr/` | Recorded design decisions with explicit status |
| `planning/` | Release scope, priorities and delivery planning |
| `sdlc/` | Canonical requirements/design/test artifacts and their register; supporting `reviews/`, `reports/`, `handoffs/`, `references/` and `diagrams/` |
| `implementation/` | Execution briefs and task breakdowns that link back to specs |
| `ux/` | UX source flows, policy presentation and wireframes |
| `analyst/` | Supporting analysis and proposals; not replacement requirements |

`architecture.md`, `BRD.md` and `tech-stack.md` keep their established entry
paths. Canonical workflow profiles live in root `agents/`; pinned templates
live in root `SDLC-Prompt-Checklist/`. Local copies inside `docs/` are not a
second source of authority. Do not add another copy when linking is sufficient.

Old reviews, version histories and rendered evidence remain available at their
existing paths. A dated report records what was checked then; consult current
source headers and the artifact register for current status. Repository
organization does not establish application behaviour or independent acceptance.

**Checklist:** Pass for bounded navigation and local link existence; no semantic acceptance claim.
**Handoff:** Ready for navigation with existing source and runtime gaps retained.
