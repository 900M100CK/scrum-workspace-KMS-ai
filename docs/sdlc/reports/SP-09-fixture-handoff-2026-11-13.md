# SP-09 fixture handoff

**Artifact ID:** SP09-FIXTURE-RESULT-01\
**Version/date:** 0.1 Draft · 13 November 2026\
**Status:** Bounded fixture result ready for owner review.\
**Inputs:** [SP-09 v0.9.4](../../../specs/009-cited-question.md), [FEAT-SP09-01 v0.2](../../implementation/features/sp-09-cited-question/plan.md), [SP09-WBS-01](../../implementation/features/sp-09-cited-question/breakdown.md), [M-06](../../implementation/roadmap.md).

## Review starting point

Branch **codex/sp-09-cited-question**, base **723e443** with SP-08. The runtime evidence is from the local working tree. The change awaits commit and independent review. The first execution began before the briefs were complete. This handoff and the expanded breakdown were written in the documentation correction after implementation.

- **Workspace** derives current authority, checks immutable receipts, claims each handoff once, and guards provider and browser sends. See [handoff code](../../../services/workspace/src/questions/handoff.ts).
- **Knowledge** retrieves eligible fixture passages, persists run provenance and manifests, validates fixture claim support and resolves exact locators. See [question store](../../../services/knowledge/src/questions/store.ts).
- **Web** adds Ask and exact passage inspection alongside Search. See [Ask screen](../../../apps/web/src/AskWorkspace.tsx) and the [runbook](../../implementation/features/sp-09-cited-question/README.md).

## Evidence available

| Check | Observed result |
| --- | --- |
| [SP-09 runtime](../../../tests/workspace/sp09-runtime.test.mjs) | 5 passed on Node 24.21.0, disposable PostgreSQL, standard Workspace and Knowledge entry points, trusted TLS and loopback fixture provider. Includes scope spoofing, exact citation, mutation and revoke/version races before sending, claim rollback and restart quarantine. |
| Browser | Edge at 1280 and 390 px opened the exact passage and used keyword Search after fixture failure. |
| SP-06–SP-08 document and discovery suites | 82 passed. |
| Foundation | 29 passed and 1 skipped. |
| Structural gates | Typecheck, build, context lint/check/test, docs lint/test, contracts test and Git whitespace check passed in the implementation run. |

The original run kept local evidence in the SP-09 evidence directory. Its files include sp09-runtime-complete.log, regression/sp06-sp08.log, ask-1280.png and ask-390.png. The test and runbook reproduce the evidence with synthetic records.

## Owner review script

1. Open the fixture project in Edge and use Ask. Submit **At what hour can we arrive?**. Expect the supported opening time and citation S1. Open S1 and verify the exact passage.
2. Ask **At what hour can we arrive? And what is the ticket price?**. Expect the supported opening time and an explicit missing ticket-price component.
3. Run the revoke and version-change cases in the runtime suite. The provider receiver should observe zero protected requests for blocked provider sends. The browser should receive the fixed withholding body for blocked answers.
4. Use the provider-outage case. Verify the empty answer state and working Search and Task requests.

## Open work and handoff

For SP09-P05, the next verification slice needs deterministic backpressure while protected bytes are in flight and actual network loss of the claim commit acknowledgement. Reuse the same PostgreSQL/TLS suite. Capture receiver bytes and claim/outcome rows for both purposes. Preserve the unknown claim and require transport evidence before reconciliation. Provider/model selection and evaluation remain separate D-06 and SP-12 work. Fixture evidence does not establish model quality or deployment readiness.

For a regression shared with keyword Search or exact-version reads, start at the [SP-08 backtracking handoff](SP-08-backtracking-handoff-2026-11-13.md). It links the existing SP-07 task breakdown at the lifecycle boundary.
