# SP-05 published runtime execution supplement

**Artifact ID:** SP05-RUNTIME-RESULT-01\
**Version/date:** 0.1 Draft · 5 November 2026\
**Executor:** Codex, implementation author; not Antigravity or independent acceptance.\
**Parent:** [V01](../tasks/V01-runtime-verification.md), [FEAT-SP05-01](../plan.md); SP-05.1–05.4 / PLAN-01 Month2/M-03 / actual SP04-P08. FR06/07/08/41/42 plus31 and the parent's permission/replay/revision/failure trace.

## Outcome and source boundary

All requested existing runtime gates executed successfully in the authorised Codex process. No runtime, contract, migration, old test/assertion or package change was needed. The new phased [runner/guide](README.md) removes dependence on an accidental shell PATH and distinguishes pure controller from actual DB/HTTPS DOM/browser prerequisites. It does not grant another agent access or close AG01 independent execution.

Executed HEAD ff93ebe44306553da1a602a171cb9560455c58d3 on codex/sp-05. Target published merge b40a01439e9cb2f1ce51f887bf238fe3bff9dd73; both committed trees equal d21aea0e31b6afefc1ecc5a75584f200d212f00d. [source.json](../evidence/runtime-20261105T063017316Z/source.json) binds122 published Git blobs, exact working hashes and the runner SHA-256. Coordination docs/runner/results are new uncommitted V01 work; they do not change those122 runtime/test/contract/config inputs. New evidence is separate from prior author snapshots.

The returned Antigravity bounded static v0.2.1 was copied unchanged to [review input snapshots](../evidence/v01-static-review-inputs/receipt.json). [Full blob reconciliation](../evidence/v01-static-review-inputs/blob-reconciliation.json) verifies18/18, including the separate contracts group omitted from the initial17-entry receipt traversal. Neither the original reports nor that first receipt was overwritten.

## Actual execution

[Full run summary](../evidence/runtime-20261105T063017316Z/summary.json), [exact resolved commands/results](../evidence/runtime-20261105T063017316Z/results.json), [environment](../evidence/runtime-20261105T063017316Z/environment.json).

| Gate | Actual result | Boundary |
| --- | --- | --- |
| Root typecheck/build | Both exit0 | Installed workspaces and contracts |
| Foundation/prototype | Both exit0; prototype20/20 | Existing foundation checks, synthetic preserved prototype |
| Context/docs/contracts |92/92, zero skips; lints/metadata exit0 | Structural evidence, separate from handlers |
| Full current Workspace |347/347, zero skips,40 explicitly enumerated files | Session/project/Task/Sprint; disposable real PG; live HTTPS DOM; controlled authority/replay/revision/rollback/concurrency and SP04 integration assertions |
| Isolated browser |1/1 | Edge 156.0.4314.58, actual secure cookie/HTTPS backend, lifecycle, per-item allocation, unknown-result reload recovery, keyboard/date focus, revocation/removal/logout; no page errors |
| Pure controller without Docker access |7/7 | [Separate restricted run](../evidence/runtime-20261105T062859221Z/summary.json); its Docker probe was denied but the controller cases executed successfully without DB/HTTPS |

Counters are Node records including parents, not counts of independent requirements. The separate controller run overlaps the347-record run. Earlier regression2 had343 at its captured sources; the published tests include three later reorder producer races and one controller409/no-new-key assertion. A fresh347 result does not relabel the old343 run. No assertion or expected counter was edited to force a pass.

Machine/runtime: Node v24.22.1, Docker29.3.1, PostgreSQL 17.10 (Debian 17.10-1.pgdg12+1), pinned image pgvector/pgvector:0.8.2-pg17-bookworm@sha256:feb68f4f15446397d8cac7f4fe48fe4586de83160d1fc48b46283312d1a33966. Trusted local certificate (public identity only in environment.json), NODE_USE_SYSTEM_CA/NODE_EXTRA_CA_CERTS scoped to child processes; no TLS bypass/personal profile/new package/provider. [Desktop](../evidence/runtime-20261105T063017316Z/browser-1793860555446/desktop.png) and [mobile](../evidence/runtime-20261105T063017316Z/browser-1793860555446/mobile.png) captures were visually inspected; the browser also asserted390px no horizontal overflow and zero page errors. Only this newly generated capture directory was moved into the fresh run folder; original path is recorded.

## Environment finding and remaining reviewer gate

The machine has Node24, Docker, trusted TLS and installed Playwright/Edge. Default restricted Docker access returned permission denied, not software-not-installed; authorised execution accessed the daemon and ran the actual disposable suites. Explicit Node invocation ran pure-controller even in the restricted process. These observations distinguish machine capability from an agent's execution permission/PATH.

This is supplemental Codex execution. Antigravity has not invoked these runs and its platform permissions were not changed. To reproduce, Antigravity opens the intended checkout, reads [the guide](README.md), invokes the explicit Node executable with phase controller or all, and uses its own platform-authorised boundary where Docker/browser access requires it. The runner label is self-reported and is not identity proof. If that boundary is unavailable, retain the specific blocked gate and command evidence. Do not call these new logs Antigravity-independent results or treat F-ENV-01 as independently resolved.

AG01 bounded static handback is received. AG01 independent runtime remains open until actual reviewer reproduction or an explicit owner gate decision. Existing green CI and author evidence do not silently change that requirement.

## Preservation, cleanup and limits

[Cleanup comparison](../evidence/runtime-20261105T063017316Z/cleanup.json): no new containers/volumes remain. One pre-existing test-named container and its volume were present before and after and were left untouched. Source working hashes were checked again after execution. Child fixtures closed their own resources. Restricted Docker denial is preserved in the separate pure-controller log; no required full-run stage failed or was skipped.

No fixes to application code were indicated by this execution; no new bug/independent security or performance conclusion is inferred. Historical browser suites other than the Sprint Edge gate were not rerun individually; their non-browser/DOM regressions ran in the full Workspace set. No load benchmark, valuable-data migration, production deployment or wider OS/browser matrix. No new agents, commit, push, merge, shared PATH/global config change or external messaging. New V01 guide/runner/evidence remain local until separately authorised publication. Final documentation/pre-flight checks are recorded beside this supplement after report preparation.
