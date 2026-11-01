# SP-02 — testing and audit report

**Artifact ID:** SP02-TEST-AUDIT-01\
**Version/date:** 0.1 Draft · 1 November 2026\
**Status:** Consolidated measured evidence and reproducible testing guide; not an independent audit or whole-release approval.\
**Inputs:** [SP-02](../../../specs/002-project-membership.md) v0.7; [feature plan](../../implementation/features/sp-02-project-membership/plan.md) v0.6; [execution result](SP-02-execution-2026-10-31.md) v0.2; [project runbook](../../../services/workspace/PROJECTS.md) v0.1; Workspace v0.2.11; Proposed ADR-0019/0026.\
**Trace:** AC-02/03/38/39; BR-01/10/14; bounded TC-02/18/22/24 observations. Optional FR-64 is not selected.\
**Author:** Codex, sequential implementer/report author. Independent reviewer: not assigned.

## What exists and why

Seven Workspace operations are implemented: createProject, getProject, listProjects, addMember, listMembers, removeMember and global/project getAllowedActions. The live workspace UI uses those actual same-origin APIs. It shows only current-member projects and minimal member IDs/descriptive roles/revisions; it exposes no email or global account directory. Role labels do not grant capabilities, and allowed-actions results advise the UI without authorising a later request.

Current server identity, enabled account/session, project membership and the exact required explicit capability are checked in the owning Workspace transaction. Unknown/nonmember project reads share the exact generic 404. Create requires separately provisioned global authority; creator receives initial membership-management authority without blanket project/document rights. Add/rejoin grants no old capability, restricted read or assignment.

Removal locks the project, protects the last effective enabled membership manager, invalidates all individual capabilities/read grants, clears current assignees with task revisions/audit, and commits the removal result atomically. Task states, positions, completed allocations/history and unrelated projects remain intact. Private explicit authority tooling is separate from browser roles; it can restore global create authority for another enabled account after revocation/disable without an automatic Admin or account re-enable.

## Verification already measured

The following results were observed on 1 November 2026, Node 24.21.0 and disposable pinned PostgreSQL 17.10/pgvector 0.8.2. This documentation/publication turn consolidates them; it does not invent a new run.

| Group | Actual result and boundary | Evidence |
| --- | --- | --- |
| Current SP-02 suite | 64/64, zero skips; cursor/controller unit tests, migration/operator SQL, actual HTTP/barrier and DOM/HTTPS assertions | [Log](evidence/SP-02-2026-11-01/projects.log) |
| Actual isolated Microsoft Edge | 1/1; real TLS/cookies, create/add, lost committed response and exact-key recovery after reload, removal clearing, keyboard confirmation/cancel, 390 px overflow and logout | [Summary](evidence/SP-02-2026-11-01/browser-summary.json), [successful log](evidence/SP-02-2026-11-01/browser-attempt-3.log) |
| Session + historical storage regression | 89/89, zero skips; historical Workspace 006 fixtures are labelled explicitly | [Log](evidence/SP-02-2026-11-01/regression-attempt-1.log) |
| Foundation with HTTPS | 19/19, zero skips | [Final rerun](evidence/SP-02-2026-11-01/foundation-attempt-3.log) |
| Typecheck/build | Passed web and both services | [Typecheck](evidence/SP-02-2026-11-01/typecheck.log), [build](evidence/SP-02-2026-11-01/build.log) |
| Context/docs/contracts prerequisites | 45/20/26; separate preparation schema suite 6/6 | [Final check summary](evidence/SP-02-2026-11-01/final-checks-summary.json), [preparation log](evidence/SP-02-2026-11-01/preparation-regression.log) |

Counts include parent cases and structural/SQL checks. They are not counts of distinct permission behaviours and do not close a whole TC or SC-06. See the [AC mapping](../requirement-verification.md#sp-02-bounded-runtime-observation--1-november-2026) and [execution report](SP-02-execution-2026-10-31.md) for failure history and limits.

The [source manifest](evidence/SP-02-2026-11-01/source-manifest.json) and [verified archive](evidence/SP-02-2026-11-01/source-inputs.zip) identify 117 runnable inputs and 25 build outputs. Capture parent HEAD was 362831fbf6e342e81226195f56f9d697faa0a367 on codex/sp-02-project-membership; exact dirty-worktree hashes identify the code tested. No environment/certificate/private-key file is archived. Resolve the publication commit with git rev-parse HEAD and git log -1 -- services/workspace/src/projects/store.ts after checkout; no clean-clone/remote CI result is claimed.

## Automated reproduction

Use Node 24+, npm ci from the root lockfile, running Docker and existing local TLS material from [the HTTPS guide](../../../apps/web/LOCAL-HTTPS.md). The tests create/clean up only their own uniquely named disposable resources. The development database was not upgraded during implementation.

```powershell
npm run typecheck
npm run build
npm run test:projects
```

The separate actual-browser gate uses an installed Playwright runner and Microsoft Edge. No new runner/browser is installed by the test. If the runner is not resolvable from the project, set SACW_PLAYWRIGHT_MODULE to its existing index.mjs file URL (for example file:///C:/path/to/playwright/index.mjs). After the owner explicitly trusts the local certificate, run:

```powershell
$env:NODE_EXTRA_CA_CERTS = (Resolve-Path .tmp/local-https/localhost.crt).Path
npm run test:projects:browser
```

NODE_EXTRA_CA_CERTS trusts that public development certificate for the Node-side response-loss probe; TLS validation stays enabled. The test launches a separate Edge profile, never the personal profile. A missing runner, untrusted certificate or unavailable Docker fails explicitly rather than becoming a passing skip.

For manual local UI testing only, `node tests/workspace/project-browser-fixture.mjs` starts a disposable fixture and prints its origin and synthetic account name. The fixed synthetic password is documented in project-ui-fixture.mjs; it is never a real account. The fixture accepts state/stop on stdin and has a 15-minute cleanup deadline. Do not use its private fixture commands against the development database. General configuration/private provisioning/key setup is in [PROJECTS.md](../../../services/workspace/PROJECTS.md).

## Manual test sheet

These are repeatable cases for a tester, not newly executed checks in this report-authoring turn. Use synthetic A/B/C accounts, two projects and controlled fixture authority; record the source commit, actual status/body, relevant persisted rows/audits and screenshots without credentials or cookie values.

| Case | Action | Expected observation |
| --- | --- | --- |
| P01 | Compare A with and without explicit global create authority | Only explicit authority permits creation; missing authority 403; rejected attempt has no project/success audit |
| P02 | Create a project and reload | Stable server UUID/creator/time, revision 1, creator membership and explicit manager grant; current directory reconstructs it |
| P03 | Give equal descriptive roles different capabilities | Action controls differ by current explicit authority; role name alone cannot enable management |
| P04 | Read an unknown project and another user's project as a nonmember | Both 404 with exactly code:not_found and message:Resource unavailable; no extra fields |
| P05 | Add a known enabled account as developer/viewer | 201 minimal Member with actual revision; no email/directory, automatic capability or restricted read; unknown target generic 404 |
| P06 | Remove and rejoin the same account | Membership revision/generation advances; old grants/read/assignment stay invalid; a stale old removal revision conflicts |
| P07 | Remove the final effective manager, including two managers deleting concurrently | Conflict leaves state unchanged; serialised concurrent requests cannot leave zero effective managers |
| P08 | Remove a member assigned Backlog and completed-location tasks with historical allocations | Current assignees clear; task revisions/audits change atomically; state/order/allocations/history and other projects stay |
| P09 | Force business-audit or result-storage failure | All membership/grant/task/project effects roll back; generic failure, no success response |
| P10 | Drop a committed create/add/remove response, reload and check original operation | Same operation/key/body/precondition; no second mutation; UI never substitutes a fresh automatic key |
| P11 | Retry an original add after remove/rejoin changed the role/revision | Original minimal 201 snapshot, not current-state reconstruction; UI separately refreshes current state |
| P12 | Lose authority before replay or refresh | Current permission checks deny disclosure; old UI records/actions clear; permission denial does not prove an earlier uncertain result rolled back |
| P13 | Page projects/members, then tamper, switch actor/limit, change membership/projection or sign in again | Invalid/foreign 400; verified stale/expired 409; revoked project generic 404; same-actor relogin alone does not invalidate a cursor |
| P14 | Remove/misconfigure the cursor key or fail DB/authority | Missing key/dependency 503, malformed server configuration rejects startup; no empty/unrestricted fallback; rotation invalidates old tokens with 400 |
| P15 | Use removal with revision at/over the safe numeric limit in a controlled fixture | Controlled conflict without partial effects; no raw DB 500/error detail |
| P16 | Use only keyboard, reload, narrow layout and dependency outage | Accessible labels/feedback, explicit removal confirmation, current server reconstruction and no stale protected pane after failure/removal |

Exact wire media/body/extra-field negatives and final output corruption tests live in project-http.test.mjs. Use its real assertions instead of treating a successful schema validator as proof of permission enforcement.

## Audit map and deliberate trade-offs

| Concern | Source and invariant |
| --- | --- |
| Same-client authority and current state | projects/store.ts reuses session inspectInTransaction; shared clock/account/session before optional target/project locks; guards after relevant waits |
| Private bootstrap/recovery | projects/operator.ts and cli.ts; operator DB identity, explicit revision/reason, co-committed private audit, no public bootstrap |
| 007 safety | Immutable creator/time; private authority/audit; safe Project/Membership/Task revision bounds; legacy refusal; nonempty down refusal; SP-01 clock/session/audit untouched |
| Separate 008 safety | Existing idempotency store extended; no second receipt store or cursor table; legacy unknown project outcomes refuse; permanent consumed identity/result; nonempty down refusal |
| Minimal replay | outcomes.ts; actor/operation/key/hash/current-authority binding; original 201 Project/Member snapshot; 204 has no snapshot |
| Paging | cursor.ts/store.ts; keyed digest of the complete authorised projection/generations and actor/route/scope/limit/expiry; never session identity |
| HTTP disclosure | http.ts; exact generic denied/unknown reads, strict input and final serializer, no-store and bounded public errors |
| UI recovery | projects.ts/ProjectWorkspace.tsx; one actor-bound pending request in tab session storage before send; no password/token/fetched protected list; explicit sign-out clears it |

Paths above are under services/workspace/src/projects unless otherwise identified. Full projection hashing costs a complete eligible read per page and is unbenchmarked. A single kid/key is selected; no old-key ring is implemented. Current replay semantics intentionally retain original project name/description indefinitely; a different retention/deletion contract needs a separate decision.

Actual two-manager and private-provisioning races were measured. Assignment/read-grant writers in P07 are explicitly controlled SQL protocol doubles; actual SP-04 setAssignee and SP-06 document-grant handler races must be rerun as SP02-F01. Locks establish database decision ordering, not D-07 exclusion through socket/source handoff. No Knowledge/provider/citation handler pass, complete SC-06, independent security approval, deployment/load calibration or all-browser/accessibility certification is claimed. Optional editProject/FR-64 remains unselected.

Earlier native Edge input/cache errors, initial browser CA errors, Node-side CA forwarding failure, foundation failures and document metadata failures remain documented in the execution report and retained logs. A synthetic cookie in one failed browser diagnostic was redacted; no real credential or private key is published.

**Checklist/handoff:** Keep actual evidence separate from this manual sheet; reproduce under a recorded commit/fixture, preserve failures and update bounded findings. Next feature is SP-03 under its own plan; this publication does not implement it.

## Publication validation

The owner authorises publication of the current related branch and these reports. [Publication checks](evidence/SP-01-SP-02-publication-2026-11-01/checks.json) record the documentation/context/contract checks and unchanged frozen implementation source identity. No application tests are relabelled as new runs in this report-authoring turn. Only reviewed synthetic logs/source/media are included; unrelated local work and TLS/environment material remain excluded. Exact publication SHA and remote success are resolved from Git history and the post-push verification, not predicted here.

Console-log whitespace is normalised in the published text files; commands, failures and outcomes are unchanged. [Pre-normalisation captured log bytes](evidence/SP-01-SP-02-publication-2026-11-01/captured-logs.zip) are retained separately, including the already documented synthetic-cookie redaction. Source/archive hashes refer to runnable inputs and remain unchanged.
