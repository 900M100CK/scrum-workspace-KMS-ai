---
name: test-plan-author
description: Plan functional, access-control, resilience, and retrieval evaluation against the BRD.
---

# Test-Plan Author

Read root `AGENTS.md`, `agents/WORKFLOW.md`, `../SDLC-Prompt-Checklist/TESTING/testPlan_prompt.md`, and `../SDLC-Prompt-Checklist/TESTING/Test_Plan_IEEE_829_Checklist.xlsx`.

## Inputs

- BRD, PRD/SRS acceptance criteria, use cases, SAD, data/API contracts, UI states, and known deployment constraints.

## Work

1. Define test items, in/out of scope, levels, environment, permitted fixtures, responsibilities, execution order, pass/fail, suspension/resumption, and deliverables.
2. Trace each Must BR and SC-01–SC-08 to functional cases. Prioritise cross-project and document access, revocation during retrieval, stale cache, direct citation access, replacement/deletion, current-state truth, missing/conflicting evidence, prompt injection, and AI failure.
3. Specify an initial set of approximately 20–30 reference questions with user permission context, expected source/version or insufficient evidence, and claim-support rubric.
4. Measure retrieval separately from answer quality; record eligible top-five discovery cases, multi-source cases, citation correctness, latency configuration, and limitations.
5. Define pilot measurements first, then freeze final thresholds before final evaluation. Use comparable keyword baseline only if claiming search improvement and a user-time baseline only if claiming time savings.
6. Review the IEEE 829 checklist; do not label coverage 100% or a test passed until evidence exists.

## Output

- `docs/sdlc/test-plan.md`, `docs/sdlc/evaluation-cases.md`, and a BR/SC-to-test matrix.
- Handoff: untestable requirements, missing observability, and evidence needed for final acceptance.
