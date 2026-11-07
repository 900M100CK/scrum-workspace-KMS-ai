# C01 source and contract alignment result

**Artifact ID:** SP05-C01-RESULT-01\
**Version/date:** 0.1 Draft · 6 November 2026\
**Status:** Author source/contract verification only; no handler, independent or release acceptance.\
**Parent:** [FEAT-SP05-01](../plan.md), [C01 brief](../tasks/C01-could-source-contract.md), SP-05.1–05.4 / PLAN-01 Month 2 / M-03.\
**Trace:** FR/AC-66/67/31; UC-05 Alt-2/3; TC-07/13/14/16/18/19/21/22; BR-01/02/03/10/11/14; SC-03/04/06.

## Changes and boundary

PRD current requirement/AC rows and UC-05 now explicitly require independent sprint-edit/sprint-deallocate. Editing merges partial goal/dates only in Planned; removal permits only current todo/in_progress in Planned/Active. Done and Completed reject to preserve completed-work attribution and future Sprint metrics. Both existing operations keep 200 Sprint and Could priority. No other operation, schema shape or revision header changed; Workspace0.2.15 adds only these operations' descriptions/transport responses and EditSprint documentation. Logical0.15 records corresponding invariants.

Canonical SP-05/pack/catalogue, API/data design and planned test/coverage/verification rows align Sprint revision, no-op, original-result replay, lock order, atomic audit/receipt and transport semantics. [Proposed ADR-0031](../../../../adr/0031-sprint-could-edit-and-removal.md) records bounded mechanics without accepting other Proposed ADRs. Required current input-version aliases and generated diagram titles/source headers changed only as metadata; their historical body/evidence is not relabelled or semantically reverified. Registered source versions are in the central/source/feature registers; task status remains only in the parent plan.

## Verification and evidence

Fresh [evidence directory](../evidence/could-c01-20261106/) retains actual argv/exit/log records in timestamped checks JSON, [source assertions](../evidence/could-c01-20261106/source-assertions.json), input digests, metadata-only alias list and final source digests. Node v24.22.1. Context syntax/routing/test syntax, context verification, docs lint, combined context/docs/contracts/handoff structural suites, metadata --check and git diff --check passed after correction; structural result 92/92. Context reports unchanged 69 active requirements, 60 Must / 4 Should / 4 Could / 1 Won't, two services and 66 operations. No runtime behavior was tested.

First context/combined run failed because revised AC-66 lacked mandatory Given/When/Then wording; AC-66/67 were expressed in the required format and rerun passed. Initial logs and failed checks JSON remain unchanged. During author diff inspection, a temporary shared-object description change to startSprint415 was found and restored before final source assertions; all non-Could operations now compare equal to baseline. A separate source wording inspection also required making the canonical spec rationale explicitly say completed-work attribution; its failed inspection note is retained, and the same source assertions then passed (11 structural assertions, not handler behaviors). No failing gate was waived or expected assertion relaxed.

Final preflight: owner C01 authority and written Plan-mode-unavailable gate recorded; original C00 work preserved; accepted ADRs/BRD/baseline and runtime/test/schema/package sources unchanged; evidence logs contain synthetic/source/check information only. No agents, commit, push or external provider transfer.

## Permission and failure implications

Enforcement is specified for the owning Workspace authenticated transaction: current session/member/read/action before original replay, including current Task read for removal; Project → Sprint → Task locks and guard checks after waits. Hidden/unknown access stays generic404; readable missing action403; authority/storage failure503. Original lookup precedes new-write lifecycle/revision/location restrictions, avoiding a second mutation on recovery. State/audit/receipt co-commit; missing mandatory persistence rolls back. Unknown outcome reuses the exact original request; a receipt is historical and current UI state must be fetched separately. These are source-aligned obligations, not new enforcement evidence. Runtime AI remains read-only.

## Handoff and unrun checks

C02 may add bounded012 private action/provisioning-audit/typed immutable receipt support with disposable forward/repeat/safe-down/refusal evidence; existing001–011 and historical fixture ceilings remain immutable. C03–C11 must provide new authority/producer/rollback/replay/UI/actual-handler race/browser/regression evidence. C01 did not run PostgreSQL, HTTPS/DOM/Edge, typecheck/build/foundation/prototype or full Workspace runtime regression because no runtime source changed. Existing Must results remain historical. No feature, milestone or release acceptance is inferred.
