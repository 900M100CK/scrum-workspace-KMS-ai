# SP-05 runtime verification entry

**Artifact ID:** SP05-RUNTIME-GUIDE-01\
**Version/date:** 0.2 Draft · 5 November 2026

[V01](../tasks/V01-runtime-verification.md) and the [parent plan](../plan.md) own scope/status. This runner uses existing tests and writes one fresh evidence directory per invocation. It never grants sandbox access, installs dependencies, weakens assertions or calls another agent's execution independent. No commit/push is part of V01.

## Run from the intended checkout

On this machine the verified Node executable is C:/Users/MCK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe (v24.22.1). An installed node missing from PATH is not a missing runtime. In PowerShell, invoke that executable explicitly, followed by this feature's verification/run-runtime.mjs, phase and the actual executor label. For example, from repository root:

    & 'C:/Users/MCK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' docs/implementation/features/sp-05-sprint-lifecycle/verification/run-runtime.mjs controller Antigravity

Replace controller with all for the full run. Use Antigravity as label only when Antigravity actually invokes and inspects the run; labels are self-reported, not authenticated. Another machine may use its own Node24+ executable. The runner resolves its own repository, rather than relying on the shell's current folder.

Phases: probe records actual capabilities; controller runs the seven existing pure in-memory cases without Docker/TLS; checks runs root typecheck/build/foundation/prototype/context/docs/contracts/metadata; workspace runs all current top-level non-browser Workspace tests, including real PG011 and HTTPS DOM; browser runs isolated Edge/Playwright with actual backend; all combines checks/workspace/browser (and runs controller separately if DB access is blocked). Every resolved test file argv and exit is recorded. Probe success only means the probe executed; inspect environment.json for each capability.

## Prerequisites and enforcement boundary

Use installed lockfile dependencies. DB suites require Docker permission, not just an installed client. TLS material must already exist at ignored .tmp/local-https/localhost.crt and .key; certificate validity/localhost identity are checked without printing key bytes. Browser tests additionally need installed Playwright and Edge. SACW_PLAYWRIGHT_MODULE may name an existing installed module; otherwise the runner probes the installed module next to its Node runtime. Child processes use this exact Node/PATH, NODE_USE_SYSTEM_CA=1 and NODE_EXTRA_CA_CERTS for the local certificate. No TLS bypass or personal browser profile.

A default process can be denied the Docker pipe even when Docker Desktop is running. Request the platform's authorised execution boundary for DB/browser phases; this script cannot bypass or grant it. Continue the pure-controller/checks phases where available. Report the failed command/status rather than claiming the software is absent. Never put credentials, cookie values, database URLs or key material into handback text.

## Evidence and handback

Each run records source.json (122 published blob IDs, working SHA-256s, head/target merge/tree and runner hash), environment.json, command logs/results.json, progress.json, cleanup.json and summary.json. New browser captures are moved only from their newly created feature evidence directory into this run directory; older captures are untouched. The source at ff93ebe and merged b40a014 has the same tree; a different runtime/contract/test source requires explicit drift reconciliation before conclusions.

Node counters include parent tests. Do not add overlapping phase counts as unique behaviors or force an earlier343 counter. Compare source identities and actual assertions. Keep failed logs. Inspect leftover disposable-resource differences without deleting another run's resources. Return the new run directory and assessment to Codex/owner. Codex supplemental runs remain author evidence; AG01 independent runtime is open until reviewer execution or an explicit owner gate decision.

## Later reviewer handback — 5 November 2026

[AG01 v0.4 disposition](antigravity-reconciliation.md) receives the reviewer-reported seven-suite57/57 runtime execution. F-ENV-01 is resolved for those runs. This does not relabel the Codex supplement or imply independent execution of the full40-file Workspace campaign; see the disposition for remaining scope/evidence limits.
