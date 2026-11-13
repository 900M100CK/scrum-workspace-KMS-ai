# R02 — Test execution and triage

**Version/date:** 0.1 Draft · 13 November 2026
**Parent:** [REVIEW-SP05-SP07-01](../plan.md)

Use Node 24, lockfile dependencies, disposable Docker PostgreSQL fixtures, local trusted TLS and the installed Edge runner. Run npm typecheck, build, test:foundation, context:lint/check/test, docs:lint/test and contracts:test. Run node --test --test-concurrency=1 with enumerated existing tests: Workspace sprint-*.test.mjs (SP-05); Workspace document-* excluding version tests and transport-guard, Knowledge document-persistence, integration document-{creation,concurrency,reads} (SP-06); remaining Knowledge, integration and Workspace document version/history/revision suites (SP-07). Run browser files separately. Prepare infrastructure while reviewing sources and run independent checks if a fixture prerequisite fails. Preserve raw outcomes, triage regressions or setup failures, and record actual commands/results and missing coverage in the parent. No test expectation changes.
