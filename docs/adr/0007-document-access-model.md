# Document access and initial author grants

**Artifact ID:** ADR-0007\
**Version/date:** 0.1 · 13 October 2026\
**Status:** Owner-confirmed direction; implementation and downstream reconciliation pending. No owner commit or independent approval claimed.\
**Inputs:** PRD-01 v0.4; ADR-0001 v0.2; [owner input](../../owner-decisions-OD-02-03-04-11.md); [session clarifications](../analyst/business-review-2026-10-13.md).\
**Trace:** OD-02; BR-01, BR-10, BR-14; FR-04, FR-10, FR-38, FR-39, FR-50–FR-52, FR-56, FR-58, FR-59; SC-06.

## Decision

Project-shared documents are readable by current project members. Restricted documents additionally require an explicit current document-read grant. Creation requires explicit classification; the author chooses it. Subsequent classification changes require document-scoped manage-access. Removing membership invalidates that user's document-read grants in that project. Rejoining restores project-shared access only; old restricted grants never revive. Unknown or failed permission checks deny protected output.

Create an explicit read grant for a restricted document's author in the initial Workspace transaction. The owner confirmed this clarification in this session. It is revocable; neither authorship, maintenance ownership, write authority nor any Scrum/Admin role bypasses current read checks.

| Capability | Initial/default holder |
| --- | --- |
| membership-manage | Project creator/project administrator |
| content-write | Document author; others only through an explicit grant |
| manage-access | Document author; project administrator only with an explicit document-scoped grant |
| lifecycle-manage | Document author |
| audit-read / trace-read | Explicitly granted per project; source details still require source permission |

Defaults must be represented by scoped capabilities, not inferred anew from role names at read time. Who may delegate additional non-read capabilities remains an explicit policy/provisioning concern; no new management UI is implied.

Denied and nonexistent authenticated resource reads use identical 404 status, body and schema. The current OpenAPI representation is canonical: `{"code":"not_found","message":"Resource unavailable"}`, with no additional fields. Permission-infrastructure failure denies protected output; generic dependency errors do not identify a resource.

## Alternatives, consequences and evidence

Role-wide restricted access violates the project boundary. An irrevocable author bypass defeats explicit revocation. Requiring a later manual author grant makes restricted creation unusable without an additional actor. The explicit initial grant supports ordinary creation while retaining revocation and rejoin semantics.

Tests must cover creator grant creation, revocation with authorship unchanged, membership removal/rejoin, project versus document scope, and paired missing/denied response bodies. SQL scope filtering alone is not these application tests. Inspectors do not gain source access through trace IDs.

**Checklist:** Pass for confirmed business direction and trace; Gap for delegation details and handler/concurrency evidence. **Handoff:** reconcile PRD, UC, contracts, schema, UX and tests. This ADR supersedes ADR-0001's corresponding proposed access defaults, not its evidence-withholding safeguards.

## Membership-removal amendment - ADR-0017

The owner additionally requires all individually granted project capabilities to be invalidated on removal, not only document-read grants. Rejoining does not reconstruct grants from author/creator identity or role labels. Task unassignment and preserved historical attribution follow ADR-0017. Initial defaults remain creation-time grants only.
