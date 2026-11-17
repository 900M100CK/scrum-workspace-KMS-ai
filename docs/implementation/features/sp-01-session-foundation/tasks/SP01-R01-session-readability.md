# SP01-R01 — Separate session responsibilities

**Version:** 0.1 Draft · 17 November 2026
**Parent:** [FEAT-SP01-01](../plan.md#readability-follow-up--17-november-2026), IMPL-SP-01.2–01.4, M-01.

After source review and the baseline attempt in R02, split private operator persistence from runtime session storage. Share clock/audit actions and keep existing caller imports working. Give request checks, cookie responses and web request phases clear names. Keep PostgreSQL statements and order, credentials, audit fields, timeout/stale request checks, error mapping and observable responses stable. Write only under `services/workspace/src/session/` and `apps/web/src/session.ts`. Verify through R02 and record results in the parent plan.
