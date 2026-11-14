# SP-08 task breakdown

**Artifact ID:** SP08-WBS-01\
**Version/date:** 0.1 Draft · 13 November 2026

Parent [FEAT-SP08-01](plan.md), [SP-08](../../../../specs/008-linked-keyword-search.md) and [M-05](../../roadmap.md). This reconstruction maps the merged implementation to the original tasks for regression review. The plan owns execution status.

| Task | Prerequisite | Reviewable output |
| --- | --- | --- |
| [SP08-P00](tasks/P00.md) | SP-07 and document-safety baseline at 0ab2854 | Source and scope registration for M-05 |
| [SP08-P01](tasks/P01.md) | P00, Workspace authority and SP-07 document transport | Project-scoped link authority and guarded TLS |
| [SP08-P02](tasks/P02.md) | P01, readable endpoint selectors | Symmetric manual links with audit and exact replay |
| [SP08-P03](tasks/P03.md) | P01, SP-07 immutable version and lifecycle reads | Scoped English keyword results and signed pagination |
| [SP08-P04](tasks/P04.md) | P02 and P03 public routes | Live Search and Related resources |
| [SP08-P05](tasks/P05.md) | P01–P04 and disposable PostgreSQL/TLS | Regression and publication evidence |

See the [backtracking handoff](../../../sdlc/reports/SP-08-backtracking-handoff-2026-11-13.md) for symptom-to-test mapping and the SP-07 escalation point.
