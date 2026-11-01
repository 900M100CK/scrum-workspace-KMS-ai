# Workspace projects and membership

**Artifact ID:** WORKSPACE-PROJECTS-01\
**Version/date:** 0.1 Draft · 1 November 2026\
**Status:** Bounded implementation/runbook; deployment and independent acceptance remain open.\
**Inputs:** SP-02 v0.7; FEAT-SP02-01 v0.6; Workspace v0.2.11; Proposed ADR-0026 v0.4.

Current operations are createProject/getProject/listProjects/addMember/listMembers/removeMember and global/project getAllowedActions. Follow [session configuration](SESSION-HTTP.md) and [local HTTPS](../../apps/web/LOCAL-HTTPS.md). Startup never migrates, provisions accounts or repairs the clock. All implementation verification uses uniquely named disposable databases; the development database has not been upgraded.

## Storage and rollback

Apply approved migrations with the [storage runbook](../../infra/postgres/README.md). Original 001–006 are unchanged. Migration 007 refuses any legacy project because creator/time cannot be inferred. It adds immutable server origin, private global create authority, append-only provisioning audit and safe-integer revision bounds. Do not invent a creator, reset a database or delete data to bypass refusal. Empty down 007 preserves SP-01 clock/session/audit state; any project, authority or provisioning audit blocks it.

Separate 008 extends existing idempotency storage before public writes. It refuses legacy project-operation records of unknown semantics and refuses down once any project-operation identity exists. Minimal original 201 Project/Member snapshots and consumed identities remain immutable indefinitely; 204 has no snapshot. No generic HTTP-body/cookie store, cursor table, permission cache or automatic cleanup exists. Project name/description retention is deliberate under the current replay contract; changing it needs a separate decision.

## Explicit private authority and recovery

Privately provision enabled accounts and initialise SP-01 time state first. The command requires SACW_OPERATOR_DATABASE_URL with the private operator database identity and SACW_OPERATOR_REF identifying the operator. Never put credentials in command arguments or logs. It assumes workspace_owner through the existing operator transaction, not an application Admin role or SP-01 browser identity. The ordinary runtime role cannot grant global create authority or read the provisioning audit. No public bootstrap endpoint exists.

Node 24+ CLI accepts one bounded JSON object on stdin:

```powershell
'{"user_id":"<known-enabled-uuid>"}' | node services/workspace/src/projects/cli.ts state
'{"user_id":"<known-enabled-uuid>","allowed":true,"expected_revision":"0","reason":"Initial project creator"}' | node services/workspace/src/projects/cli.ts global
```

Use the revision returned by state; zero means no row. Set allowed=false with the current revision to revoke. Private project provisioning additionally requires project_id, action (membership-manage or project-administrator), current membership and expected grant revision. All changes co-commit private audit. Last effective manager revocation is rejected. A descriptive member role never grants authority, and project-administrator never implies restricted document read.

If the only global creator is revoked or disabled, use this same private tool to grant another explicitly selected enabled account. Never automatically enable the disabled identity, seed an Admin or reset the database. Unknown command acknowledgement requires inspecting the same target/revision and private audit before deciding whether to retry.

## Cursor key and client recovery

Set the private server variable SACW_PROJECT_CURSOR_KEY to a JSON object with exactly kid and key: a 1–32 character identifier and a canonical base64 encoding of 32 random bytes. Keep it out of Vite/client variables and logs. There is one current key; replacing it invalidates old cursors with 400. Missing key returns 503 for list paging; malformed configuration rejects startup. A valid verified token whose projection changed/expired returns 409. Each request still checks a current session and authority; no cursor is tied to the login session identity. Default TTL is 300 seconds. Both lists hash the full eligible canonical projection each page, so no scalability claim is made.

Mutation retries must use the original operation/key/body/precondition. A timeout or lost COMMIT acknowledgement does not imply rollback. Browser tab session storage retains one actor-bound pending operation before sending; it contains no credential, token or fetched protected list. Explicit sign-out clears it. Expiry hides protected UI; same-actor sign-in can reconcile the same key. Current permission denial does not resolve an earlier unknown result. Confirmed success refreshes current state rather than displaying a historical replay snapshot as current.

## Verification

Run npm run test:projects for real disposable PG/HTTP/DOM plus cursor/controller negatives. Existing storage/session fixtures explicitly retain schema 006; new SP-02 suites exercise current 008. Run npm run test:projects:browser (project-browser.test.mjs) with an installed Playwright runner (SACW_PLAYWRIGHT_MODULE may name its file URL), installed Microsoft Edge and owner-trusted localhost certificate. Set NODE_EXTRA_CA_CERTS to the existing public localhost.crt path for the Node-side forwarding probe; this adds that specific CA and never disables TLS validation. No install or TLS bypass is performed by the test. Browser screenshots/results are separate from simulated-cookie DOM evidence. See the [execution report](../../docs/sdlc/reports/SP-02-execution-2026-10-31.md).

Future SP-04 assignment and SP-06 document-grant handlers must repeat SP02-F01 races; current SQL doubles do not prove those handlers. D-07 socket/source handoff, optional FR-64 and whole-release/independent acceptance remain open. No Knowledge database writes occur.
