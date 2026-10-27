# Task brief and result template

**Artifact ID:** IMPL-HANDOFF-01\
**Version/date:** 0.1 Draft · 26 October 2026\
**Status:** Reusable template; empty fields are not evidence.\
**Inputs:** [execution](execution.md); [register](register.md); [decisions](decisions.md).\
**Trace:** Supports existing slice FR/AC and BR/SC evidence; no new requirement.\
**Owner role:** Sequential development coordinator.

Copy the relevant sections into a dated record under `docs/sdlc/reports/`, register that record and link it from the selected child row. Do not mark placeholders as measurements. The developer remains bound by the selected canonical spec's allowed paths.

## Before implementation

```text
Task / child ID:
User-observable outcome:
Canonical spec and source versions:
FR / AC / BR / SC / UC-EX / TC assertions:
Exact operation IDs, owner service, HTTP method/path:
Prerequisite evidence links:
Decision gates: confirmed sources / missing choices / independent work:
Allowed paths (copied from the canonical spec):
Coordinated cross-spec changes required, if any:
Actual branch and unrelated dirty work to preserve:
Smallest implementation steps:
Permission, revision, audit, replay and handoff boundaries:
Failure/unknown-outcome behaviour:
Verification commands and assertions (verify commands exist):
Out of scope:
```

## Result and next-agent handoff

```text
Task status and completed child IDs:
Change and purpose:
Files changed / artifact versions and register updates:
Code/contract references:
Environment and source revision or dirty-worktree identity:
Fixtures / corpus / provider configuration (no secrets):
Commands actually run and result / failed attempts retained:
Handler behaviours verified:
Structural/schema/SQL/UI checks passed (separate):
Permission/concurrency/failure assertions and observed boundary:
Checks NOT run and why:
Optional requirements delivered / deliberately omitted:
Open defects and owner decisions:
Independent review / owner acceptance: actual status only:
Next task / child ID and prerequisite evidence:
```

Checklist: Pass for required handoff fields; Gap/N/A for execution because this is a blank template. Handoff: [task catalogue](tasks/README.md).
