# SP-08 linked knowledge and keyword search

**Artifact ID:** WORKSPACE-DISCOVERY-01
**Version/date:** 0.1 Draft · 13 November 2026

Use the standard [document runtime setup](DOCUMENT-SAFETY.md) with disposable or explicitly designated demo data. Apply Workspace migration 017 after 015 and 016. Knowledge uses its existing link, passage, audit and idempotency storage. The integrated development runner from the earlier demo does not supply the SP-08 transport.

Provision link-create for a current project member through the private Workspace project operator. Obtain the current capability revision from operator state and provide the project/user IDs, explicit allowed flag and a synthetic demo reason. The browser never grants this capability. Membership removal invalidates it.

Start the two standard services with the document runtime configuration, then start npm run dev:web with SACW_DEV_TLS_CERT and SACW_DEV_TLS_KEY. Configure SACW_SESSION_ORIGIN to the HTTPS origin served by Vite. In the selected project open a Task, load Related resources and choose a permitted target. Open Search from project navigation. Current is the default and History is explicit.

The same-origin Workspace routes use the project path as the authoritative selector:

| Operation | Route |
| --- | --- |
| createLink | POST /projects/:project_id/links with Idempotency-Key |
| listLinks | GET /projects/:project_id/links with optional from_id and cursor |
| keywordSearch | POST /projects/:project_id/search/keyword with query, scope and optional cursor |

Workspace maps these to authenticated internal Knowledge requests. Link and search pages use a fixed size of 20 and 300-second signed cursors. Invalid/foreign cursors return 400. Changed projections or expired cursors return 409. Search uses English PostgreSQL full-text retrieval and works without provider or embedding configuration.

## Synthetic demonstration corpus

- Task: Synthetic deployment task.
- Restricted decision: Synthetic permission source. Initial content contains quartz legacy evidence. The replacement contains zircon replacement evidence.
- Shared document: Synthetic shared source. Content contains quartz public evidence.

Before a grant, the reader finds the shared quartz passages and sees no restricted relationship. After a grant, legacy finds the restricted decision. After revision, Current legacy is empty and History legacy opens the original version. After revoke, the reader loses the restricted link and its results. The isolated fixture in tests/workspace/sp08-runtime.test.mjs asserts these results on the standard service entrypoints.
