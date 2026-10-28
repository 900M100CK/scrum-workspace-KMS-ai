# Private session persistence operations

P08 supplies Workspace-owned persistence, KDF and operator tooling. Public POST/GET/DELETE session handlers now exist; see SESSION-HTTP.md. This guide covers private operations only. ADR-0024/0025 remain Proposed and D-07 is unchanged.

## Migration and isolation

Additive migration 005 adds auth_account, session_token, auth_clock_state and append-only authentication_audit. Existing Session retains effective expiry. Original 001–004 files are unchanged. Upgrade refuses legacy Session rows because credential/token/original-deadline bindings cannot be inferred; down refuses retained account/token/audit or initialized clock state. Do not clear records to bypass those guards. No physical cleanup/retention policy is selected.

The general `npm run db:migrate` now discovers 005: inspect valuable data and the storage runbook first. This task applied it only to disposable fixtures. `npm run test:session:storage` creates unique labelled containers/volumes and removes only its own resources.

Runtime workspace_app can read private credentials and persist owned session/clock/audit state, but cannot provision/enable/disable accounts, reset an unhealthy clock, rewrite token metadata/audit, delete/truncate records or connect to Knowledge. A fixed-search-path SECURITY DEFINER function supplies the account row lock without credential UPDATE rights. These are trusted service privileges, not direct end-user DB access.

## Operator tool and explicit time verification

Use Node 24 and an operator login permitted to SET ROLE workspace_owner in workspace_db. Supply SACW_OPERATOR_DATABASE_URL and nonsecret SACW_OPERATOR_REF through a private environment; never give this login to the ordinary service. Run from the repository root:

```powershell
node services/workspace/src/session/operator.ts state
Get-Content -Raw .tmp/provision-private.json | node services/workspace/src/session/operator.ts provision
Get-Content -Raw .tmp/recovery-private.json | node services/workspace/src/session/operator.ts recover
Get-Content -Raw .tmp/disable-private.json | node services/workspace/src/session/operator.ts disable
```

Provisioning stdin JSON contains username/password. Input is bounded and secrets are never command-line arguments. The tool generates the UUID/salted credential and prints only success status/user ID. Disable JSON contains user_id; it atomically disables the account, invalidates every existing session and captures audit. No automatic failed-attempt lockout or re-enable command exists.

Clock initially has healthy=false, last_observed=null and generation "0". Before issuance, independently verify time, read `state` and submit this shape through private stdin:

```json
{
  "expectedGeneration": "0",
  "expectedLastObserved": null,
  "attestedTime": "<independently verified UTC instant>",
  "maxSkewMs": 1000,
  "evidenceId": "<nonsecret time-verification reference>"
}
```

Use the exact current state, not the example's initial values for an already-used clock. The sample 1000 ms bound is explicitly supplied by the operator; it is not a universal risk conclusion or hidden tolerance. Do not generate an attestation from the same DB observation being checked. Automated tests use synthetic attestations and do not validate an external time source.

Recovery locks clock state, checks fresh DB time/preconditions, revokes every old session, captures minimum audit and advances generation before restoring health in one transaction. Audit failure rolls everything back; stale/mismatched input fails. Rows and audit are retained. Missing/unreadable clock denies access, and time catching up does not clear a latched fault. Entirely unobserved forward/backward intervals remain outside this mitigation. Deployment time discipline and independent operator verification are still needed.

The tool has no HTTP endpoint. Errors confirm no success and print no raw DB error/secret. A lost COMMIT acknowledgement is an unknown outcome: inspect authorized retained state/audit before retrying; do not assume rollback or replay automatically.

## Resource and contention bounds

Scrypt uses N=131072/r=8/p=1, random 16-byte salt, 32-byte output and explicit maxmem=192 MiB. Stored format/parameters are bounded and validated before allocation. Across verifier instances, at most two jobs run in a process; there is no waiting queue. Extra work promptly rejects with KdfBusy, to be mapped to a declared unavailable response in P09. Internal password input is bounded to 8192 UTF-8 bytes; reconcile public body/error limits in HTTP work rather than silently tightening Login here.

Async scrypt shares libuv workers with filesystem/DNS/other crypto. Two KDF jobs do not reserve exclusive threads. Tests record filesystem latency during jobs and total process peak RSS, including Node overhead. Those local observations are not target-deployment calibration or a capacity SLA. Do not Accept the ADR on dev timing alone or increase UV_THREADPOOL_SIZE as an unmeasured fix.

Clock checks serialize on a persistent row. Pool acquisition is bounded to 1200 ms, lock waits to 1000 ms and statements to 3000 ms, with four pool connections. No KDF/network/provider waiting occurs inside a transaction. Tests observe lock timeout and subsequent recovery; no throughput claim or cached authorization follows. Project/document authorization remains a separate Workspace responsibility in later slices.
