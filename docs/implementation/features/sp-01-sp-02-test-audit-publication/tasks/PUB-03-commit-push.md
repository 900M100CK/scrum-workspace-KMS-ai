# PUB-03 — Publish the current branch

**Artifact ID:** PUB-03\
**Version/date:** 0.1 Draft · 1 November 2026\
**Status:** Task brief; execution state belongs to the parent plan.\
**Inputs:** [PUB-SP01-SP02-01](../plan.md) v0.1; existing registered SP-01/SP-02 results.

Prerequisite: PUB-02 passing. Parent: PLAN-01 Month 1 / M-01–M-03 through the registered plan. Allowed paths and publication exclusions are exactly those in the parent plan.

Commit reviewed staged changes using Codex identity and Co-Authored-By. Push codex/sp-02-project-membership to the existing GitHub origin without force or merge. Compare the remote branch SHA with local HEAD; report the actual SHA and links after success. If a gate fails, retain evidence and fix only the scoped cause before retry.

Verification: preserve actual command/result evidence, no false runtime or independent-approval claim, no development database migration. Return the measured result to the parent plan/final handoff.
