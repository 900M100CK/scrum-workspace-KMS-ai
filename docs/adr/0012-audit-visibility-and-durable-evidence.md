# Scoped audit identity and mandatory durable evidence

**Artifact ID:** ADR-0012
**Version/date:** 0.1 Draft · 14 October 2026
**Status:** Owner-confirmed direction in two explicit session replies; implementation and independent review pending.
**Inputs:** PRD-01 v0.5 FR-31/32/56/57/58; UC-02 v0.3 UC-11/13; BA review clarifications.
**Trace:** BR-10, BR-11, BR-12; SC-06; FR-31, FR-32, FR-56–FR-59; NFR-03, NFR-05.

## Decision: audit visibility is a separate, bounded entitlement

The owner chose to let an inspector with current project membership and scoped audit-read see an in-scope event's actor, action, entity identity and time even without read access to a referenced restricted document. This intentionally reveals that identity/existence through the authorised audit surface. It does not grant access to title, passages, document content or protected before/after payloads. Redact those fields unless their separate current read checks succeed. Omit another project's events entirely.

An actor without the scoped audit entitlement must not infer the event or restricted identity from responses, counts or error differences. Knowing a document ID from audit does not make a direct document/citation read succeed, enable retrieval, or permit sending its content to a provider. Trace-read alone does not inherit this audit identity entitlement. Current project/document/operation scope remains authoritative; never copy an audit role into document-read grants.

H3 evaluates disclosure against the permission applicable to the operation. Audit identity deliberately allowed above is not an unauthorised disclosure. The same identity remains protected from unauthorised search/AI/source/trace readers. Test these contrasting operations for the same inspector, both before and after audit capability revocation.

## Decision: durable minimum records are mandatory

For a business mutation, persist its audit event or a durable pending audit record in the same owning-service transaction as the business state. If that minimum record cannot be persisted, do not commit the mutation. An audit sink outage may delay delivery of an already durable record; it does not erase or mislabel the committed business result. Retry delivery idempotently. Do not use cross-service database writes or a distributed transaction solely for audit.

For AI, persist a run identity and the minimum evidence/provenance manifest before any protected content is sent to the provider. Preserve exact source/version/passage identities or operational entity/revision/time, authenticated access context references and enforcement/attempt correlation. Persist the evidence manifest for the particular delivery attempt before its protected answer handoff. This is provenance, not private model reasoning or permission to copy raw protected content into logs.

If the mandatory record cannot be stored, fail explicitly and withhold the corresponding provider/answer handoff. Healthy Workspace/document/keyword operations remain independent of that AI failure. Optional trace metrics may be missing; mark them unavailable/incomplete and record the failure, without treating fabricated defaults as measurements. An evidence or access decision is not an optional metric. A failed mutation must never be presented as a committed audit event.

## Alternatives, consequences and verification

Hiding all restricted audit identities would provide less inspection information than the owner selected. Granting full source access to audit readers would violate the selected boundary. Best-effort audit after commit permits permanently unaudited changes; blocking on every remote telemetry metric would unnecessarily couple availability to optional diagnostics. Durable minimum records plus asynchronous sink delivery preserve the required evidence while bounding that dependency.

Required tests: authorised audit identity with protected payload redacted; same actor denied direct source/citation/AI content; out-of-scope/unknown equivalence; audit capability revocation; local audit-record failure rolls back business state; sink failure retains replayable record and committed result; failed run/evidence persistence sends no protected provider/answer bytes; optional metric failure is labelled without inventing evidence.

**Checklist/handoff:** Pass for explicit owner direction and required contrasts; Gap for schema/adapter fit, full contract fields and runtime failure/concurrency evidence. Update UC-11/13, architecture/data/API/UX, SP-11/13, H3 rubric and TC-11/14/18. This is not an implemented audit service or a new product feature.
