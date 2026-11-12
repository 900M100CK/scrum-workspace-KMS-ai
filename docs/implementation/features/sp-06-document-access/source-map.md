# SP-06 source reconciliation

**Artifact ID:** SP06-SOURCE-MAP-01\
**Version/date:** 0.1 Draft · 7 November 2026
**Inputs:** FEAT-SP06-01 v0.1; exact [source snapshot](evidence/planning-20261107/sources.json); PRD-01 v0.10.3; SP-06 v0.6.3; IMPL-SP-06 v0.1; Workspace0.2.16 / Knowledge0.2.9; Proposed ADR-0006/0018/0019/0020/0022/0023.\
**Trace:** FR/AC-04/10/14/50/51/52 and supporting31/39/59/68; UC-06; BR-01/04/10/11/14; SC-06.\
**Owner role:** Sequential source reconciliation; no independent review.

## Baseline and concrete gaps

SP05 PR #3 source base8031503 is preserved on codex/sp-05-could. SP06 planning is local on codex/sp-06-document-access; no SP06 source, contract, database or handler was changed. Workspace already has secure-session/current-membership, owned transactions, private audited operator, scoped work rights, original-outcome replay and current projection conventions. Do not reimplement them or confuse their tests with document permission evidence.

Knowledge buildApp currently serves healthz and generic not-found only. Workspace buildApp wires session/projects/tasks/sprints only. No document policy module, document HTTP producer, authenticated inter-service policy adapter or guarded source socket transport exists. Existing SQL tables are storage prerequisites, not enforcement. Workspace document_policy/read_grant/capability_grant and Knowledge document/document_version/passage are service-owned; later applied migrations correct initial draft/current constraints. Read the complete applied series rather than treating001 alone as current truth. No old migration edits.

Canonical spec still permits services/workspace/policy/**, while application modules use services/workspace/src/**. Shared app/session/project wiring, additive migrations, contracts and root test commands require P02's coordinated exact-path amendment before implementation. Existing source docs contain historical “unimplemented/commands unavailable” statements; update only current owning surfaces when the actual slice exists, preserving historical runs. P00 does not globally relabel them.

## Declared operation ownership

This table is derived from current contracts, not evidence of deployed handlers. listMembers already has its project implementation; document consumers reuse its bounded current-member projection. getAllowedActions integration spans P04/P09/P10 and only advertises implemented operations.

| Contract owner | Operation | Declared method/path | Planned owning task |
| --- | --- | --- | --- |
| workspace | `listMembers` | `GET /projects/{project_id}/members` | P09 |
| workspace | `setClassification` | `POST /documents/{document_id}/classification` | P09 |
| workspace | `grantDocumentRead` | `POST /documents/{document_id}/read-grants` | P09 |
| workspace | `listDocumentReadGrants` | `GET /documents/{document_id}/read-grants` | P09 |
| workspace | `revokeDocumentRead` | `DELETE /documents/{document_id}/read-grants/{user_id}` | P09 |
| workspace | `registerDocumentPolicy` | `POST /internal/document-registry` | P06 |
| workspace | `getDocumentPolicy` | `GET /documents/{document_id}/policy` | P09 |
| workspace | `getAllowedActions` | `GET /access/allowed-actions` | P09 |
| knowledge | `createDocument` | `POST /knowledge/documents` | P08 |
| knowledge | `getDocument` | `GET /knowledge/documents/{document_id}` | P10 |
| knowledge | `persistDocument` | `PUT /internal/documents/{document_id}` | P07 |
| knowledge | `listDocuments` | `GET /knowledge/projects/{project_id}/documents` | P10 |

## Source/contract issues to resolve before code

1. Knowledge sessionCookie still names session, while existing Workspace uses __Host-sacw-session. The gateway-facing facade and internal X-Service-Key/X-Actor-Session mapping need explicit coordinated security-contract alignment, strict upstream origin and rejection/stripping of browser-supplied internal credentials. No public arbitrary upstream URL or client actor identity.
2. createDocument returns a content-bearing201 Document. After self-read revocation a successful same-key operation cannot replay that metadata without current read rights. Preserve independent command/read rights and immutable original operation; P02 must specify the permitted failure/pending/reconciliation response before handler work. Do not copy Sprint200 replay semantics to documents without disclosure review.
3. Minimal known-ID policy/grantee reads permit manage-access without content-read. They must not leak title/content/owner/Current pointer/readiness or enter explorer through a management grant. Policy permission_revision is the sole access CAS; grant pages must agree before command submission.
4. Cross-service creation has two owned commits. Scoped identity/payload/provenance and immutable outcomes must survive crash/delay/unknown acknowledgement; retain orphan policy, no activation/age sweeper. Audit failure in a service rolls back that service's mutation, not a fictitious distributed transaction.
5. Current auth time/session transactions and project locks are concrete conventions. P02/P05 must resolve exact guard order, internal nonrecursive checks, stream abort and restart fencing. Check-then-send, a mock lock or healthcheck cannot prove the retained revocation boundary.
6. Read-filtered document pagination needs a concrete permitted-dataset/permission generation invalidation definition spanning services. Reuse cursor encoding/integrity conventions only after defining those dependencies; no hidden totals, mixed-page snapshots, session-bound cursors or owner/read bypass.

## Scope and trace result

Plan acceptance table maps all six SP06 Must ACs, UC-06 creation/grant/revoke/Alt-2/EX-01–06 and TC-02/03/04/13/14/15/18/20/22/24. SP-11.1 capture accompanies every producer. Search/citation/provider/answer cross-surface outcomes are later integration gates, not assertions already executed here. Initial Current is selected; replacing Current/history remains SP07. No provider selection is needed.

D-03/B01, D-04/B02 and D-07/B03 require the bounded owner disposition in decision-batch.md. D-05 opaque command preconditions are not needed for the unselected FR-65 metadata operation; D-09 remains safe retention, no physical cleanup. Existing owner-confirmed access/classification/creation rules are not reopened.

The project-register template and workflow were used. Named development/DevPlan_ISO_24748_5_Prompt.md and development/TaskBreakdown_ISO_21511_Prompt.md are absent from this pinned template checkout; no workbook/ISO conformity is claimed. Concrete project planning requirements are explicitly represented in the plan, WBS and task briefs.

**Checklist:** Pass for bounded source/ownership/trace reconciliation and source identity freeze; Gap for owner selection, concrete protocol/source alignment and all SP06 runtime/independent evidence. **Handoff:** P00 preparation result; P01 proposal is reviewable. Mutable status remains only in plan.md.
