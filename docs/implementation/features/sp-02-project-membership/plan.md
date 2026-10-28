# SP-02 project and membership work plan

**Artifact ID:** FEAT-SP02-01\
**Version/date:** 0.1 Draft · 28 October 2026\
**Status:** P01 source review recorded; P02 schema preparation verified; material dispositions pending; application implementation awaits material dispositions.\
**Inputs:** [SP-02](../../../../specs/002-project-membership.md) v0.5; [pack](../../tasks/02-project-membership.md) v0.2; PRD-01 v0.9; UC-02 v0.8; SAD-03 v0.16; Workspace contract v0.2.10; ADR-0007/0017 owner-confirmed, ADR-0019 v0.3 Proposed; PLAN-01 v0.4.\
**Trace:** FR-02/03/38/39 and AC-02/03/38/39; optional FR/AC-64; BR-01/10/14; UC-02 and applicable TC-02/18/22/24; SC-06 relevance, not passed coverage.\
**Owner role:** Sequential implementer; material choices belong to owner.\
**Planning mode:** Unavailable; registered written plan gate used instead.\
**Work kind:** Feature with bounded preparation, implementation and verification tasks.

## Goal, parent and merge baseline

Create/read projects only with current explicit authority; add/remove/rejoin known accounts without capability revival, protect the last effective membership manager and clear current assignees atomically with audit. Connect a fresh UI to real authority and revisions. Parent: [PLAN-01 Month 1](../../../planning/five-month-plan.md#calendar-and-exit-gates), [M-02 smallest work flow and M-03 full membership safety](../../roadmap.md), [SP-02 children 02.1–02.4](../../tasks/02-project-membership.md). Registers: [work plans](../README.md), [source register](../../register.md), [REG-00](../../../sdlc/artifact-register.md).

The owner explicitly requested merge after passing SP-01 tests. All nine P12 regression groups and six documentation/context groups passed; 94 non-scratch runnable hashes matched the retained run. On 28 October main was fast-forwarded/pushed to 52a10dd0bbdf76b173c2c2f387e6615def4312e9 and verified at origin. This branch, codex/sp-02-project-membership, starts there. SP-01's formal ADR/deployment/D-07 and broader release limits are not closed by merging. Unrelated dirty submodule/prompt copies/patches/scratch inventories are preserved.

Non-goals: global user directory, invitations/registration, role editor/delegation UI, automatic restricted read, Scrum/Knowledge/AI features, optional FR-64 without inclusion, new services/providers/dependencies, development DB reset, implicit commits/pushes or Accepted ADRs.

## Decisions and ownership

| Gate | Selected constraints / remaining disposition | Safe work |
| --- | --- | --- |
| D-03 authority provisioning | Existing defaults are retained: creator's initial membership-manage, no role-name bypass, no restricted read, rejoin restores no old grant. The owner selected private audited explicit create-project/member-manager provisioning; inspector/content/lifecycle delegation beyond SP-02 stays open. | Source/contract review, explicit synthetic test fixtures, concrete private provisioning proposal; design/persistence approval remains required before application adoption. |
| D-04 discovery | Existing listMembers/getAllowedActions and required project reads are declared, detailed ADR-0019/projection mechanics remain Proposed. | Exact contract/assertion map; bounded adoption needs owner disposition and evidence. |
| Persistence/idempotency/cursor mechanics | Current project table lacks creator/time; capability_grant requires project_id and cannot represent global create-project authority; business_audit requires project_id. Exact replay/current-authority and opaque-cursor binding need a design. | Produce additive 007 proposal and negatives; no rewrite of 001–006 or unapproved development migration. |
| D-07 protected transport | Current project/document authority and source-send guard remain distinct. | Session/project transaction tests never claim Knowledge/citation/provider guarded handoff. |

Workspace owns accounts/sessions/projects/membership/grants/tasks/audit/idempotency. No cross-service DB write or copied permission rule. Unknown authority fails closed. Read denial for unknown/nonmember is identical generic 404; unauthenticated is 401; known available target with inadequate action authority follows the declared contract. Current account/session must be rechecked; UI allowed-actions is advisory. Mandatory audit accompanies every mutation in the same owning transaction.

## Tasks and acceptance

| Task / parent child | Observable outcome | Prerequisites | Execution status / evidence |
| --- | --- | --- | --- |
| [SP02-P01](tasks/SP02-P01-source-contract-gates.md) / SP-02.1 | Trace requirements, contract and storage gaps | None | Source review recorded; see P01 review |
| [SP02-P02](tasks/SP02-P02-decision-and-contract-preparation.md) / SP-02.1 | Prepare the owner decision batch and contract negatives | P01 | 6 schema/harness tests passed; [P02 report](../../../sdlc/reports/SP-02-P02-preparation-2026-10-28.md); no handler evidence |
| [SP02-P03](tasks/SP02-P03-owned-authority-foundation.md) / SP-02.2 | Implement selected owned authority and private provisioning | P02 owner dispositions; approved additive schema design | Not started; dependencies/gates apply |
| [SP02-P04](tasks/SP02-P04-project-create-and-reads.md) / SP-02.2 | Create projects and read only current memberships | P03; relevant D-04 disposition | Not started; dependencies/gates apply |
| [SP02-P05](tasks/SP02-P05-members-and-action-discovery.md) / SP-02.2 | Add/list members and discover current applicable actions | P04; D-04 bounded discovery design | Not started; dependencies/gates apply |
| [SP02-P06](tasks/SP02-P06-remove-rejoin-last-manager.md) / SP-02.3 | Remove/rejoin atomically and preserve a membership manager | P03–P05; selected lock/idempotency design | Not started; dependencies/gates apply |
| [SP02-P07](tasks/SP02-P07-concurrency-failure-regression.md) / SP-02.3 | Integrate operation replay, authority races and failure recovery | P04–P06 | Not started; dependencies/gates apply |
| [SP02-P08](tasks/SP02-P08-project-membership-ui.md) / SP-02.3 | Connect project/member UI to live current authority | P04–P07; selected discovery/tooling | Not started; dependencies/gates apply |
| [SP02-P09](tasks/SP02-P09-optional-project-edit.md) / SP-02.2 | Consider optional FR-64 without delaying Must acceptance | Explicit owner inclusion of Could FR-64 | Optional; not selected |
| [SP02-P10](tasks/SP02-P10-integrated-evidence-handoff.md) / SP-02.4 | Verify bounded SP-02 and hand off to SP-03 | P01–P08; P09 only if explicitly included | Not started; dependencies/gates apply |

## Exact contract and acceptance plan

Existing operations: POST/GET /projects, GET/PATCH /projects/{project_id}, POST/GET /projects/{project_id}/members, DELETE /projects/{project_id}/members/{user_id}, GET /access/allowed-actions. getProject is an existing FR-03 contract dependency even though the pack's short operation list omits it. FR-64 PATCH remains optional. Payload schema names are CreateProject/AddMember/EditProject, not illustrative aliases. Mutations require existing Idempotency-Key; removal requires X-Expected-Revision from Member.revision. listMembers supports limit 1–100/default 50 plus cursor; listProjects declares cursor only. Any necessary shared wire correction must be proposed and registered before editing.

| AC / boundary | Required measured result |
| --- | --- |
| AC-02 | Explicit permitted create succeeds with stable identity, server creator/time and required initial grants/audit; denied/invalid creates nothing; exact replay/current-authority and lost-ack cases. |
| AC-03 | Actor from SP-01 only; member reads own projects; unknown/foreign/nonmember same generic denial; no global privilege from Admin/role; disabled/store-unavailable denies. |
| AC-38 | Known registered account joins with fresh membership revision/generation; project-shared access only, no implicit restricted read or capabilities from descriptive role. |
| AC-39 / ADR-0017 | Removal atomically deactivates membership, invalidates all individual capabilities/read grants, unassigns current tasks with revision/audit, preserves history/other projects; rejoin restores nothing individual; last-manager and concurrent races are enforced. |
| TC-18/22/24 subset | Each producer's audit failure rolls back; UI uses actual projections and preconditions, clears denied/revoked scope; browser evidence separately captured. |

Existing actual commands: npm run typecheck, build, test:foundation, test:session:storage, test:session:http, test:session:lifecycle, test:session:ui, db:test, contracts:test, context:lint/check/test, docs:lint/test. These do not yet verify SP-02 application handlers. Planned preparation command: Node 24 --test tests/workspace/sp02-contract-preparation.test.mjs after creating it in P02. New SP-02 runtime suites and root commands are Planned until selected implementation exists. Disposable PostgreSQL only; no development mutation. Capture exact source/fixture/command identity, retain negatives and source archives, and record local/browser/structural boundaries separately.

## Handoff

Read [P01 review](p01-source-review.md) and [owner decision proposal](decision-batch.md) before P03. Continue independent P02 preparation while material policy/design choices are pending. No automatic gate acceptance from a test result, task completion, main merge or this plan.
