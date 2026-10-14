# API design — contract entry

**Artifact ID:** API-05  
**Version/date:** 0.4 Draft · 14 October 2026\
**Status:** ADR-0007–ADR-0013 directions are owner-confirmed; transport implementation and independent review remain pending.
**Inputs:** PRD-01 v0.5; UC-02 v0.3; SAD-03 v0.7; DATA-04 v0.3; [contract pack](../../contracts/README.md) v0.3.\
**Author:** development agent acting sequentially; owner reviews business choices.

The canonical payload/routes are the two OpenAPI files linked by the contract pack. Public consumers are the web UI; internal consumers are Workspace/Knowledge. Every operation has x-requirements, authenticated scope, resource parameters, explicit responses and mutation concurrency semantics. Context validation checks shape/trace only.

SAD defines one public Workspace gateway; it routes accepted Knowledge facade operations and never generic-proxies /internal/**. Internal service requests use credentials plus an authoritative session reference, not client/model user IDs. Document policy and operational state remain Workspace-owned. Token/cookie/CSRF and timeout implementation require approved policy and tested framework versions.

Read current records by stable identity; keyword/semantic queries use cursor/scope; citations pin version/passage. 404 body equivalence, whole-evidence-set revocation, Workspace-first registration, no activation, and idempotency replay rules are mandatory test cases. OpenAPI format alone proves none of these behaviors.

Under [ADR-0012](../adr/0012-audit-visibility-and-durable-evidence.md), a mutation success response requires the business state and minimum audit event or durable pending audit record to commit in the same owning-service transaction. A failure to persist that record rolls back the mutation. Failure of later audit sink delivery does not change the committed result; delivery is retried idempotently. A transport timeout is an unknown outcome to reconcile using the same operation identity, not proof of rollback or permission to repeat the mutation with a new key.

Before protected provider input or answer delivery, the owning AI operation must durably persist its run ID and the exact evidence manifest for that handoff. Persistence failure withholds that handoff and returns an explicit failure, without generated content, source details or invented evidence. Optional metric loss is labelled incomplete and does not substitute for mandatory provenance. These rules require producing-handler and persistence-failure tests; OpenAPI schema checks cannot prove them. Knowledge OpenAPI v0.2.1 and ADR-0013 specify HTTP 503 AnswerWithheld and the authorised exact UnavailableCitation result. These mappings remain untested at a live handler.

Checklist: Pass for recorded consumers, ownership, interfaces and requirement trace; Gap for live consumer/provider tests and retained-policy/tombstone implementation. Handoff: Ready for downstream drafting with these explicit gaps; unresolved business choices must be clarified before dependent implementation.

**v0.2 change:** API v0.2.0 removes publish/activate and product Draft. Workspace owns allocation and initial grants; persistDocument is internal authenticated transport. Protected response guards include citations and source reads; internal evaluateAccess/observeWorkState do not reacquire the guard. Remaining unavailable-citation/terminal-withholding response details and real handler tests stay open.

**v0.3 change:** Correct source versions and owner-decision status; carry ADR-0012 atomic audit and pre-handoff provenance requirements into the API handoff. OpenAPI remains v0.2.0; no handler or new response schema is claimed.

**v0.4 change:** ADR-0013 resolves unavailable identity entitlement and nondisclosing terminal withholding, including an invalid-citation draft without a validated replacement. Knowledge OpenAPI v0.2.1 adds UnavailableCitation and AnswerWithheld; Workspace remains v0.2.0. Retained-policy identity inspection, tombstone persistence and runtime checks remain implementation gaps.

**ADR-0015 amendment:** Knowledge OpenAPI v0.2.2 adds partially_answered for supported cited components and explicit missing request components. It does not permit truncating a revoked/invalid original draft. Consumer/UI and runtime evidence remain pending.

**ADR-0016 amendment:** Workspace OpenAPI v0.2.1 adds optional searchTasks under FR-70 Should, after 60 Must. TaskList is operational output, not document passage evidence. Knowledge remains v0.2.2; 56 operations total.
