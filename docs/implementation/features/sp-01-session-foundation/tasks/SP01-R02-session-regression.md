# SP01-R02 — Verify session behavior before and after

**Version:** 0.1 Draft · 17 November 2026
**Parent:** [FEAT-SP01-01](../plan.md#readability-follow-up--17-november-2026), IMPL-SP-01.4, M-01.

Run `node --test services/workspace/test/session*.test.ts apps/web/test/session.test.ts` plus `test:session:storage`, `test:session:http`, `test:session:lifecycle` and `test:session:ui` before/after as prerequisites permit. Use Node 24, existing local TLS and only task-owned disposable PostgreSQL. Include the caller-owned session transaction test, typecheck, build, context and diff hygiene. Existing assertions cover invalid credentials, authenticated actor, cookie/Origin, logout/expiry, clock/audit atomicity and stale web requests. Record counts, skips and environment failures in the owning plan. Browser and release qualification remain separate.
