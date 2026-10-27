# INIT-04 — Publish main and bring it back to SP-01

**Artifact ID:** INIT-04\
**Version/date:** 0.2 Draft · 27 October 2026\
**Inputs:** [Parent plan](../plan.md) v0.2; ADR-0003 foundation selection; Proposed ADR-0024/0025.\
**Status:** See parent status table. **Trace:** Shared source handoff for SP-01.

Prerequisites INIT-03 passing evidence and confirmed destination permission. Allowed writes: normal Git commits/branch integration and plan/register result updates. Inspect staged files for secrets/unrelated changes, commit verified main with agent identity/byline, push to the confirmed origin. Bring main into feature/sp-01-session-foundation using ordinary fast-forward/merge and preserve checkpoint 7113a82. Push the updated feature if permitted by the same source-publication instruction. No force push or deletion of unrelated files. Verify final branch/remote hashes, report actual outcomes, leave SP-01 domain implementation unstarted. **Checklist:** Publishing is conditional on actual verification and permission.
