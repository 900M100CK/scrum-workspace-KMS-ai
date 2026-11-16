# SP-09 targeted verification handoff for Antigravity

Version 0.1 Draft · 16 November 2026. [Owning plan](plan.md) · [V01 acceptance](tasks/V01-targeted-verification.md) · [SP-09 runbook](README.md).

Use the exact head SHA of draft PR `test(sp09): verify retrieved prompt injection and outage fallback` (`codex/sp09-targeted-verification` into `main`). If publication is pending, use the isolated candidate SHA supplied with this report. Record `git rev-parse HEAD` and the checkout status. Use Node 24, Docker, the pinned PostgreSQL 17/pgvector image and the locally generated TLS files at `.tmp/local-https/localhost.crt` and `.tmp/local-https/localhost.key`. Install locked dependencies and configure TLS according to the runbook. Use an isolated checkout and synthetic data.

The first candidate was exercised on Windows with Node 24.22.1, Docker 29.3.1 and the repository-pinned PostgreSQL 17/pgvector image. HTTP run: 7 passed, 0 failed, 1 Edge skip. Separate Edge run: 5 passed, 0 failed, 0 skipped, including both viewports. The commands below allow independent reproduction.

## HTTP and PostgreSQL

Set `NODE_EXTRA_CA_CERTS` to the local public certificate. Unset `SACW_PLAYWRIGHT_MODULE` for this run. Execute:

```powershell
node --test --test-concurrency=1 tests/workspace/sp09-targeted-verification.test.mjs tests/workspace/sp09-runtime.test.mjs
```

Report the GAP-01 and GAP-02 outcomes from the test logs against the [V01 acceptance criteria](tasks/V01-targeted-verification.md#v012--verify-disposable-http-and-postgresql). The Edge subtest is expected to skip in this run.

## Edge regression

Set `SACW_PLAYWRIGHT_MODULE` to the installed Playwright module URL and `SACW_TEST_EVIDENCE_DIR` to a new evidence directory. Keep the same certificate trust configuration. Run:

```powershell
node --test --test-concurrency=1 tests/workspace/sp09-runtime.test.mjs
```

At 1280 and 390 px, the live React app must return an Ask answer, open S1 to the exact passage, show the explicit outage message, and find the permitted document through keyword Search during the provider failure. Retain `ask-1280.png`, `ask-390.png` and the test log. The screenshots capture the citation panel. Test assertions record the fallback.

Return the candidate SHA, OS, Node, Docker/PG and Edge/Playwright versions, exact commands, counts and evidence paths. For a failure, include the first failed assertion and reproduction steps. For a blocked run, name the missing prerequisite and the skipped or unrun scenario. Keep credentials and local TLS private keys out of the report.
