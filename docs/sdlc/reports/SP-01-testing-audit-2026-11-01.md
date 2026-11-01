# SP-01 — testing and audit report

**Artifact ID:** SP01-TEST-AUDIT-01\
**Version/date:** 0.1 Draft · 1 November 2026\
**Status:** Consolidated measured evidence and reproducible testing guide; not an independent audit or release approval.\
**Inputs:** [SP-01](../../../specs/001-session.md) v0.5; [feature plan](../../implementation/features/sp-01-session-foundation/plan.md) v0.9; [original P12 result](SP-01-P12-handoff-2026-10-28.md) v0.1; [current integration result](SP-02-execution-2026-10-31.md) v0.2; Workspace v0.2.11; Proposed ADR-0024/0025/0026.\
**Trace:** AC-01/36/37/68; TC-01 and applicable TC-18/22 subsets; BR-01/10. Full SC-06 is outside the measured session subset.\
**Author:** Codex, sequential implementer/report author. Independent reviewer: not assigned.

## What exists

Workspace implements POST/GET/DELETE /session and the same-origin React sign-in/current-session/sign-out flow. The actor comes from the server cookie and current persisted account/session; request-supplied actor data grants nothing. Tokens are opaque, only token digests are persisted, and responses expose user_id/expires_at rather than credentials or tokens. Project/document authority remains a separate check on every protected operation.

The cookie is __Host-sacw-session, Secure, HttpOnly, SameSite=Strict, Path=/ and has no Domain. Mutations require the configured exact HTTPS Origin and X-SACW-Request: 1. GET renews only a still-valid session within its immutable absolute deadline; equality at expiry is expired. Logout commits revocation/audit before returning an empty 204 and clearing the cookie. Missing/invalid current authentication is 401; unavailable authority/storage/clock is 503.

Workspace owns the data and audit transaction. Audit failure rolls back the corresponding mutation. Unknown COMMIT acknowledgement is an unknown outcome, not proof of rollback or permission for an automatic retry. Account disable revokes existing sessions. An observed clock backstep latches a durable fault; independently attested private recovery invalidates old sessions. These mechanisms do not prove detection of an unobserved clock excursion or a protected-source socket handoff.

## Evidence and source identity

| Evidence | Observed result | Interpretation |
| --- | --- | --- |
| [Original P12 run, 28 October](SP-01-P12-handoff-2026-10-28.md#exact-integrated-run) | Node 24.22.1; storage 17, HTTP 15, lifecycle 18, UI 10, foundation 19, storage/handoff 26, contracts 26 | Original measured session scope; retain its own archives, versions and browser observations |
| [1 November regression log](evidence/SP-02-2026-11-01/regression-attempt-1.log) | 89/89, zero skips: session suites 60 + same-transaction session tests 3 + storage/handoff 26 | Actual rerun under Node 24.21.0 after SP-02 integration; not 89 distinct permission behaviours |
| [Foundation final rerun](evidence/SP-02-2026-11-01/foundation-attempt-3.log) | 19/19, zero skips, including configured HTTPS | Framework/transport prerequisites, not full session acceptance |
| [Original browser evidence](SP-01-P12-handoff-2026-10-28.md#visual-evidence) | Keyboard login, authenticated reload, controlled expiry, logout | Manual observations, separate from simulated-cookie DOM tests |
| [Current isolated Edge summary](evidence/SP-02-2026-11-01/browser-summary.json) | Edge 156.0.4314.50; real HTTPS cookie login/reload/logout, no TLS bypass | Current SP-02 browser integration also exercises the session consumer; not a full repeat of the original session browser matrix |

The [current source manifest](evidence/SP-02-2026-11-01/source-manifest.json) and [verified archive](evidence/SP-02-2026-11-01/source-inputs.zip) retain 117 runnable inputs and 25 build-output hashes. The source capture was made on codex/sp-02-project-membership with parent HEAD 362831fbf6e342e81226195f56f9d697faa0a367; its worktree hashes, not that parent alone, identify the implementation tested. Original P12 archives identify the earlier baseline independently. The report does not relabel older tests as new executions.

At checkout, record git rev-parse HEAD and git log -1 -- services/workspace/src/session/store.ts alongside any reproduction result. The publication commit is resolved from Git history rather than embedded as a self-referential hash. A clean-clone/remote CI result is not claimed.

## Run the automated checks

Use Node 24+, the root lockfile installation (npm ci), Docker and the [local HTTPS setup](../../../apps/web/LOCAL-HTTPS.md). The public localhost certificate and private key must already exist locally; neither is committed. Browser trust is an explicit owner setup step. Follow [private session operations](../../../services/workspace/SESSION-OPERATIONS.md) and [HTTP configuration](../../../services/workspace/SESSION-HTTP.md) for manual application testing.

From the repository root:

```powershell
npm run typecheck
npm run build
npm run test:session:storage
npm run test:session:http
npm run test:session:lifecycle
npm run test:session:ui
node --test --test-concurrency=1 tests/workspace/session-transaction.test.mjs
```

The session/storage fixtures create uniquely named disposable databases and clean up only their own resources. Historical session/storage fixtures explicitly stop at Workspace 006; current SP-02 fixtures exercise the session checks through 008. Do not apply migrations to valuable development data, reset data, or remove Docker volumes as a testing shortcut.

For the HTTPS foundation check, set SACW_DEV_TLS_CERT and SACW_DEV_TLS_KEY to the existing local certificate/key paths before npm run test:foundation; without the opt-in configuration that older transport case may skip. A skipped case is not a browser or TLS pass.

## Manual test sheet

The following is a repeatable acceptance sheet for a tester; this consolidation turn did not perform a new manual run. Use synthetic accounts and an isolated environment, record actual outcomes, and never copy cookie/password values into the report.

| Case | Action | Expected observation |
| --- | --- | --- |
| S01 | Reload before sign-in | Checking state precedes sign-in; protected navigation is absent; unauthenticated GET /session is 401 |
| S02 | Submit a wrong password, then an unknown username | Same generic 401/message; neither identity creates a session; password input is cleared |
| S03 | Sign in with a provisioned enabled account using the keyboard | Server-confirmed actor/time; correctly scoped Secure/HttpOnly/Strict host-only cookie; no token/password in JSON or browser storage |
| S04 | Reload while authenticated and open Workspace | Cookie-backed current session is rechecked; current UI reconstructs from server state, not a saved bearer grant |
| S05 | Send an extra actor field or wrong/missing Origin/request header | Invalid shape 400 or mutation protection 403; no issued session/audit success; actor cannot switch |
| S06 | Use a missing/duplicate/forged/expired/revoked cookie | Generic 401; no protected subtree restored by a late response |
| S07 | Refresh before and at configured idle/absolute boundaries in the fixture | Only strictly unexpired sessions renew; absolute cap never moves; equality denies |
| S08 | Sign out, then reload or reuse the old token | Known revocation precedes 204/cookie clearing; old token denies; independent other sessions are unaffected |
| S09 | Disable the account through the private operator fixture | All its current sessions and fresh sign-in attempts deny; no public administrator bypass |
| S10 | Fail DB/audit/clock dependencies or lose a COMMIT acknowledgement in the fixture | Generic failure, hidden authenticated UI, no false success/automatic mutation retry; audit atomicity inspected in DB |
| S11 | Observe a clock backstep, then perform stale and valid attested recovery in the fixture | Durable fault survives restart; stale recovery rejects; successful recovery audits/revokes old sessions |

Use the automated lifecycle/persistence suites for precise concurrency and microsecond-boundary assertions; screenshots cannot prove those properties. The sign-out control, feedback focus, loading/error states and keyboard navigation should also be checked by a human.

## Audit navigation and open findings

| Concern | Primary inspection point |
| --- | --- |
| Current session/account/time, fault persistence, same-client reuse | services/workspace/src/session/store.ts; tests/workspace/persistence.test.mjs and session-transaction.test.mjs |
| Bounded transactions, rollback/discard, unknown commit | services/workspace/src/session/database.ts; persistence/lifecycle suites |
| KDF admission, parameter validation, dummy unknown-user work | services/workspace/src/session/kdf.ts; services/workspace/test/kdf.test.ts |
| Cookie/Origin/input/output/error handling | services/workspace/src/session/http.ts and schemas.ts; tests/workspace/http.test.mjs |
| Renewal/logout and real lock schedules | tests/workspace/lifecycle.test.mjs |
| UI state cancellation, expiry/reload/outage | apps/web/src/session.ts and App.tsx; tests/workspace/ui.test.mjs |
| Storage ownership and no destructive rollback | Workspace migrations 005/006; SESSION-OPERATIONS.md |

Audit status is bounded author evidence, not independent approval. Outstanding: formal detailed ADR/deployment acceptance, trusted-time and KDF/capacity calibration for the target environment, unobserved clock intervals, D-07 source-send/socket exclusion, full project/document/citation/AI SC-06, broader browser/accessibility/usability coverage and remote clean-clone CI. Registration/reset/MFA and automatic lockout are not selected features.

Failure history is retained in original P08–P12 reports and the current integration report. The current foundation run initially hit loopback EACCES and an obsolete unimplemented-project scaffold assertion; later authorised reruns corrected the environment/current-route expectation and passed. Those failures are not discarded.

**Checklist/handoff:** Source/evidence/command links checked during publication; measured and specified cases separated; no new runtime run or independent audit implied. Reproduce with the recorded source identity, attach a new dated result, and preserve the stated open gates.

## Publication validation

The owner authorises publication of the current related branch and these reports. [Publication checks](evidence/SP-01-SP-02-publication-2026-11-01/checks.json) record the documentation/context/contract checks and unchanged frozen implementation source identity. No application tests are relabelled as new runs in this report-authoring turn. Only reviewed synthetic logs/source/media are included; unrelated local work and TLS/environment material remain excluded. Exact publication SHA and remote success are resolved from Git history and the post-push verification, not predicted here.

Console-log whitespace is normalised in the published text files; commands, failures and outcomes are unchanged. [Pre-normalisation captured log bytes](evidence/SP-01-SP-02-publication-2026-11-01/captured-logs.zip) are retained separately, including the already documented synthetic-cookie redaction. Source/archive hashes refer to runnable inputs and remain unchanged.
