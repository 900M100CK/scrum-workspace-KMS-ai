# API design — contract entry

**Artifact ID:** API-05  
**Version/date:** 0.1 Draft · 8 October 2026  
**Status:** Draft for owner review; proposed policies/deferrals are not approved.  
**Inputs:** PRD-01 v0.4; UC-02 v0.1; SAD-03 v0.1; DATA-04 v0.1; [contract pack](../../contracts/README.md).  
**Author:** development agent acting sequentially; owner reviews business choices.

The canonical payload/routes are the two OpenAPI files linked by the contract pack. Public consumers are the web UI; internal consumers are Workspace/Knowledge. Every operation has x-requirements, authenticated scope, resource parameters, explicit responses and mutation concurrency semantics. Context validation checks shape/trace only.

SAD defines one public Workspace gateway; it routes accepted Knowledge facade operations and never generic-proxies /internal/**. Internal service requests use credentials plus an authoritative session reference, not client/model user IDs. Document policy and operational state remain Workspace-owned. Token/cookie/CSRF and timeout implementation require approved policy and tested framework versions.

Read current records by stable identity; keyword/semantic queries use cursor/scope; citations pin version/passage. 404 body equivalence, whole-evidence-set revocation, pending registration and idempotency replay rules are mandatory test cases. OpenAPI format alone proves none of these behaviors.

Checklist: Pass for consumer/ownership/interfaces/request-response/errors/FR trace; Gap for settled policies and live contracts. Handoff: Needs owner decision; specs refer to these reviewable drafts.
