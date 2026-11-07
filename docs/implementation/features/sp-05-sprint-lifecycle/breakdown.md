# SP-05 work breakdown

**Artifact ID:** SP05-WBS-01\
**Version/date:** 0.4 Draft · 5 November 2026

Source/task status: [owning plan](plan.md). P00–P04 prepare source, contract, storage and authority; P05–P10 produce real commands/reads with their negative tests; P11–P13 bind current UI; P14 co-delivers SP04-P08 actual races; P15 consolidates actual regression/evidence. Each numbered brief defines one deliverable; no independent mutable task list. All work is sequential, estimates relative M with medium confidence; actual duration is not yet measured.

AG01 is the owner-requested post-implementation Antigravity tracking/testing assignment. Its five sequential checkpoints freeze inputs, assess P00–P15/AC coverage, rerun real regression, inspect live UI and return evidence/findings. It creates no second mutable implementation board and does not authorise production fixes or release acceptance. See tasks/AG01-antigravity-tracking-testing.md and the owning plan.

V01 is the owner-requested runtime follow-up after AG01 static v0.2.1: environment/source → reproducible runner/controller → actual regression/HTTPS DOM/browser → cleanup and source-identified handback. It changes no original product scope or author/reviewer acceptance boundary.

## Selected Could work breakdown

[Owner decisions](could-decisions.md) bound FR-66/67 without promoting their release priority. Reuse the owning plan and its C00–C11 table: registration → sources/contracts →012 receipts → authority → edit producer → removal producer → recovery → edit UI → removal UI → actual races → live browser → regression/review handoff. Each C task has its own brief under tasks/ with prerequisite, allowed paths, trace, steps, assertions, planned checks and evidence/recovery requirements. Status remains exclusively in plan.md; prior Must and AG01 evidence is preserved. Production implementation and publication have not been performed in this planning slice.
