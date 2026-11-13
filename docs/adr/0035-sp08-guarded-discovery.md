# Scoped relationship and keyword discovery

**Artifact ID:** ADR-0035
**Version/date:** 0.1 Proposed · 13 November 2026
**Status:** Proposed implementation mechanics for the owner-selected SP-08 scope.
**Inputs:** ADR-0004/0007/0011/0017 and Proposed ADR-0033/0034; [FEAT-SP08-01](../implementation/features/sp-08-linked-keyword-search/plan.md).
**Trace:** FR-16/17/18/19/20/31/34/47/59/63.

Use one independently provisioned project link-create capability plus current read authority on both endpoints. Workspace owns permission and supplies exact readable IDs to authenticated Knowledge operations. Knowledge filters before ranking or pagination and owns the atomic relationship, audit and replay receipt. No Workspace runtime role can self-provision link-create.

Reuse the project guard for bounded result delivery and use signed cursors over the visible projection. A changed permission or lifecycle invalidates old results. Full-text search uses committed passages and a separate explicit history selector. Failures deny disclosure rather than retrying without scope.

This design reuses the existing service boundary and keeps keyword available without semantic processing. Current limitations include a single gateway authority, complete projection work for cursor validation and no load measurements. Tests use disposable synthetic records. Deployment and wider ADR acceptance are separate.
