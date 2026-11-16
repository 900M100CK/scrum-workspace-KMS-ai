# SP-09 task breakdown

**Artifact ID:** SP09-WBS-01\
**Version/date:** 0.2 Draft · 16 November 2026

Parent [FEAT-SP09-01](plan.md), [SP-09](../../../../specs/009-cited-question.md) and [M-06](../../roadmap.md). This breakdown was completed during the documentation correction after implementation. Follow it for review and follow-up. The [parent plan](plan.md) owns task status.

| Task | Depends on | Reviewable output |
| --- | --- | --- |
| [SP09-P00](tasks/P00.md) | SP-08 integrated at base 723e443 and owner-selected fixture scope | Registration and source alignment |
| [SP09-P01](tasks/P01.md) | P00 and SP-08 Workspace discovery policy | Scoped fixture semantic retrieval |
| [SP09-P02](tasks/P02.md) | P01, existing Knowledge manifests and Workspace claims | Durable guarded provider handoff |
| [SP09-P03](tasks/P03.md) | P02 and the SP-07 version lifecycle | Buffered answer and exact citation |
| [SP09-P04](tasks/P04.md) | P03 response contracts and existing SP-08 Search surface | React Ask and fallback |
| [SP09-P05](tasks/P05.md) | P01–P04 and disposable PostgreSQL/TLS fixtures | Runtime verification and handoff |

Start with P00, then P01 through P04 in dependency order. P05 collects the evidence after the feature slices are available. A task can start once its brief has the prerequisites, allowed paths, steps, assertions and evidence destination. Record results in the parent plan and deliver the dated handoff before reporting completion.

## Targeted verification follow-up

[V01](tasks/V01-targeted-verification.md) orders candidate isolation, disposable runtime verification, the Edge regression or handoff, and draft publication. Use the owning plan for live results.

## Publication sequence

[SP09-PUB01](tasks/PUB01-publication.md) packages the verified fixture for review. [SP09-PUB02](tasks/PUB02-main-and-cleanup.md) updates local main and preserves SP-08 local data before cleanup. [SP09-PUB03](tasks/PUB03-handoff.md) records the verified outcome and remaining work.
