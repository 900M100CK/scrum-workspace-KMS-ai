# Optional project-scoped task keyword search

**Artifact ID:** ADR-0016
**Version/date:** 0.2 Draft - 16 October 2026
**Status:** Owner-confirmed scope and Should priority; implementation unimplemented.
**Owner confirmation source:** [BA-D20](../analyst/business-review-2026-10-13.md); source records direction, not implementation evidence.
**Trace:** FR-70; BR-01, BR-07, BR-13; UC-08; SP-08.

The owner explicitly requested keyword search of task titles/descriptions in the current project and selected Should after the existing 60 Must. This is an added requirement, not a deferral of an original Core requirement. Preserve FR-45 as Withdrawn and assign FR-70 without renumbering. Active FR count becomes 69; release priorities become 60 Must, 4 Should, 4 Could and 1 Wont.

Workspace owns task search over committed operational records and current membership. Keep it separate from Knowledge document search: task results are task identities/content/state, not document passages or embeddings. Task search must survive AI and Knowledge outages while Workspace/identity/storage remain healthy. Deny nonmember and unknown projects with the same generic response; no cross-project results, counts or hints. Paging rechecks authority; a cursor never grants continued access.

Draft interface: GET /projects/{project_id}/tasks/search with nonempty q and optional cursor; return TaskList. Initial matching is a literal case-insensitive substring of title or description after trimming the query; empty/whitespace-only input is invalid, and query operators are not interpreted. Use a deterministic ordering and opaque project/query-bound cursor. Exact page size and input bounds remain implementation parameters to document before delivery. No relevance superiority claim or all-project search is introduced.

UX keeps task and document result groups distinct and reports their failures independently. Test a phrase in title, one in description, no match, empty input, another project's matching task, membership removal between pages, committed edits reflected on renewed search, and AI/Knowledge outage. Scope shape or source lint does not prove these runtime behaviors.

Alternative: retain only Board filters; the owner selected keyword task discovery instead. A combined cross-service search API is unnecessary for the selected behavior and would add failure aggregation without changing the requirement. Physical indexes and handlers remain future implementation, with no edits to applied migrations authorised by this record.
