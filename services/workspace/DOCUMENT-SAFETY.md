# Document runtime and recovery

**Version/date:** 0.1 Draft · 13 November 2026
**Trace:** [FIX-DOCUMENT-SAFETY-01](../../docs/implementation/features/document-safety-fix/plan.md).

Apply Workspace migrations 015 and 016 explicitly before enabling document routes. Knowledge uses its existing owned schema. Start the standard services with these process-local settings.

- Knowledge: SACW_KNOWLEDGE_DATABASE_URL (knowledge_app on knowledge_db), SACW_KNOWLEDGE_TLS_CERT, SACW_KNOWLEDGE_TLS_KEY and SACW_DOCUMENT_SERVICE_KEY.
- Workspace: existing session database/origin and cursor configuration, SACW_KNOWLEDGE_HTTPS_URL, optional SACW_KNOWLEDGE_TLS_CA and matching SACW_DOCUMENT_SERVICE_KEY. The service key must contain at least 32 bytes. Configure a trusted certificate and rotate keys together during a controlled restart.
- Keep the Workspace gateway single-instance. Start Knowledge before enabling requests. Use existing public HTTPS ingress for browser traffic. The internal Knowledge server listens on loopback and requires TLS and a service key.

A pending lifecycle command survives restart. Reconcile from the original actor's authorised session with the same operation, key and payload. Uncertain failures leave the document blocked. Check the stored receipt and state in Knowledge before manual incident recovery. Do not clear the journal on timeout.

Inventory legacy Workspace policies marked unavailable and compare each exact project/document against the Knowledge lifecycle, original receipt and audit. Preserve confirmed deletions and unresolved records. Recover only a verified live Knowledge document with evidence of the earlier rejected operation and separately audited operator action. The migration does not rewrite legacy unavailability.

Migration 016 refuses rollback with a pending command. Migration 015 refuses rollback while scoped grants exist. Stop the application before database rollback and use a verified recovery plan for retained state.
