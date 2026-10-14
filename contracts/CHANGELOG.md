# Contract changes

## 0.2.0 — 13 October 2026

Owner-confirmed ADR-0007–ADR-0011 direction; draft interfaces, no deployed-client compatibility claim.

14 October follow-up: `setTaskState` documents direct transitions and reopening a completed-Sprint task into Backlog while retaining history (ADR-0008 v0.2). ADR-0012 permits scoped audit actor/action/entity/time without source-read, while protected before/after references remain null/redacted; knowing an ID grants no content access. Mandatory audit/run/evidence persistence is a handler requirement, not proven by these response schemas.

- Remove the product `draft` Version state and `publishVersion` operation. `reviseDocument` now atomically installs Current and supersedes the previous Current (FR-11); FR-45 remains Withdrawn in requirements history.
- Remove `activateDocumentPolicy`. Workspace allocates document identity during registration; callers no longer provide `RegisterDocument.document_id`. Registered policy is insufficient for a readable document until Knowledge content exists.
- Add authenticated internal `PUT /internal/documents/{document_id}` (`persistDocument`) for Knowledge persistence under the Workspace-allocated identity; scoped actor/key validation and duplicate reconciliation remain required.
- Explicitly create restricted-author read grants, subject to later revocation. Authorship is not a read bypass.
- Internal `evaluateAccess` and `observeWorkState` do not reacquire the guard; authentication and scope checks remain. All protected content/citation/AI response handoffs remain guarded.
- Retain operation IDs for unaffected routes and the canonical generic 404 body `{"code":"not_found","message":"Resource unavailable"}`.

These are breaking changes for clients using Draft, publication, activation or caller-allocated document registration. Consumer/provider and concurrent-handler verification remain unimplemented. No expected runtime result is fabricated by schema checks.

## 14 October 2026 - pack 0.3 / Knowledge OpenAPI 0.2.1

ADR-0013 adds typed unavailable exact citation identity under current retained-policy read authority, and nondisclosing terminal AnswerWithheld for question 503 responses. Workspace OpenAPI remains 0.2.0; 55 operations remain. Consumers must distinguish UnavailableCitation from readable Passage and never use it as generation evidence. No handler permission or failure behavior is proved by these definitions.

## 14 October 2026 - Knowledge OpenAPI 0.2.2

ADR-0015 adds PartiallyAnswered to QuestionResult: supported claims/citations plus missing requested components, all nonempty. Total lack of evidence remains Insufficient; infrastructure and withheld-draft failures remain distinct. Existing consumers must handle the new union member. No new endpoint or runtime proof.

## 14 October 2026 - Workspace OpenAPI 0.2.1

Owner-added FR-70 Should adds searchTasks GET /projects/{project_id}/tasks/search, current membership and committed title/description substring matching, independent of Knowledge/AI. 56 operations total; 60 Must unchanged. UI separates task/document results and dependency failures. Runtime and query-bound cursor evidence pending.
