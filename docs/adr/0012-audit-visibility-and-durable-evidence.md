# Scoped audit identity and mandatory durable evidence

**Artifact ID:** ADR-0012
**Version/date:** 0.3 Draft · 16 October 2026
**Status:** Owner-confirmed direction in two explicit session replies; implementation and independent review pending.
**Owner confirmation source:** [BA-D12/BA-D13](../analyst/business-review-2026-10-13.md); source records direction, not implementation evidence.
**Inputs:** PRD-01 v0.7 FR-31/32/56/57/58; UC-02 v0.5 UC-11/13; BA review clarifications.
**Trace:** BR-10, BR-11, BR-12; SC-06; FR-31, FR-32, FR-56–FR-59; NFR-03, NFR-05.

## Context: explicit SC-06 exception

[BRD v1.0 SC-06](../baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md) prohibits disclosure of restricted content or metadata a user may not view. The [proposed audit-identity addendum](../baseline/BRD_addendum_audit_identity_v0.1.md) records the owner's bounded exception for a current project member with scoped audit-read: actor/action/entity ID/time on that audit surface only. Formal BRD baseline acceptance remains pending. Until then this is an explicitly identified policy conflict; H3 must use operation-specific entitlements.

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

## Decision: immutable manifest before guard, checked again inside it

[OWNER-Q-01](../planning/owner-decisions-2026-10-16.md) selects Q-2's pre-guard persistence option for both provider input and answer delivery. Knowledge owns immutable `HandoffManifest` records, identified by a fresh `handoff_id` for each protected transport attempt, with run/attempt identity, purpose, authenticated actor/project/scope references, exact full evidence set, observed policy/lifecycle/operational revisions, payload digest, manifest digest and a complete durable commit marker. Document evidence binds document/version/passage; operational evidence also binds entity kind/ID, revision and observation time. Hashes bind bytes; they do not prove claim support or grant access.

1. Outside the guard, freeze the exact payload and evidence, persist the complete manifest in Knowledge's transaction, and wait for durable acknowledgement. A timeout or unknown write outcome authorises no handoff; reconcile the same preparation identity and immutable digest before proceeding.
2. Before the guard, Workspace durably claims the handoff identity once in its own idempotency record (`protected_handoff`, actor and handoff ID, bound to the manifest digest). Only the successful fresh claimant can proceed; an existing or unknown claim authorises no send, and unresolved/consumed claims cannot expire into replay. Then acquire the applicable Workspace guard. Revalidate session, project AND document access, full evidence including uncited context, source availability/lifecycle, recorded operational observations and exact payload/manifest binding. Current-authority reads remain scoped; no copied permission rules or cached grant suffices.
3. If any recorded revision, evidence identity, digest or completeness marker differs, send zero protected bytes and release the guard. Do not trim or repair the manifest/payload in place. Outside the guard, reconcile or prepare a fresh immutable handoff record for a bounded new attempt, then repeat every check. Revoked or invalid evidence withholds the entire original answer draft under ADR-0013; a replacement requires new generation and support validation. Budget exhaustion returns the existing generic failure.
4. Only a matching, permitted manifest may hand off the frozen bytes while the guard remains held through transport completion or abort. No remote manifest write or retry wait occurs under that guard. A per-handoff immutable record may never be reused for a second send; restart/timeout aborts cannot resume it.

Append outcomes separately from the immutable manifest; a prepared or claimed record alone is not proof of transmission or delivery. Crash/unknown transport outcomes remain explicitly unknown and cannot trigger automatic replay or automatic fresh-identity resend. Claimed attempts are fenced on abort/restart and cannot resume. Workspace retains its claim/relay outcome without writing Knowledge's database. Exactly-once external delivery is not promised. Additive manifest storage and transport adapters are still required.

Writing manifests inside the guard would add remote persistence delay to revocation blocking. The selected order moves that wait outside the guard, at the cost of stale prepared records and repeated validation. TC-26 must pause during persistence, after acknowledgement and inside final validation; race revocation/version/state changes, alter payload binding, fail persistence, crash/restart and verify zero bytes from rejected attempts, a fresh manifest per retry and guard retention through a valid handoff. This is design evidence only.
