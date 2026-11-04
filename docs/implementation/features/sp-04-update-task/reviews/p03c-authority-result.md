# SP-04 P03C — private Task authority and exact discovery result

**Artifact ID:** SP04-P03C-RESULT\
**Version/date:** 0.1 Draft · 4 November 2026\
**Status:** Bounded private provisioning and read discovery verified; no mutation-handler/UI, deployment or independent acceptance.\
**Author:** Codex, sequential implementer/author self-check.\
**Inputs:** [FEAT-SP04-01](../plan.md) v0.12; [SP04-P03C](../tasks/P03C-task-authority-discovery.md) v0.1; P03B result v0.1; actual owner directions v0.1; [ADR-0028 Proposed](../../../../adr/0028-task-mutation-authority-and-outcomes.md) v0.1; Workspace0.2.13/logical0.13; [source baseline](../evidence/p03c/source-inputs.json).\
**Trace:** SP-04.2 / FR-03/09/40/43/44 and supporting FR-31/38/39/59/68 / BR-01/02/03/10/11/14 / UC-02/03/04 / TC-02/03/07/13/14/18/19/22 / PLAN-01 Month1 / M-02–M-03.

## What changed and why

The existing private Project operator/CLI now provisions task-edit, task-state, task-assign and task-blocker separately. It preserves enabled current target membership, expected revision, explicit reason/operator reference, atomic audit, no-op/stale semantics and the existing last-manager safeguard for membership-manage. Creator, member, role and create-only backlog-author imply no Task mutation capability. Runtime cannot gain the private owner identity or read authority-provisioning audit;010 DB issue/revival safeguards are unchanged.

For these new selected actions, a fresh grant uses its UUID as the immutable private issue audit event_id too. Existing rows must match that issue ID plus target/project/action/original revision; valid rows match issue revision and invalidated rows match issue revision+1. Revoke/removal invalidates once; explicit regrant uses a fresh ID and next revision. Missing provenance is retained and rejected even for an apparent no-op, rather than adopted or deleted. The three old actions keep their prior audit encoding. This is bounded Proposed mechanics within the existing private schema, not a new public permission or edited migration.

The same Workspace Task-action mapping drives private allowlists and current discovery projection. Existing GET/access/allowed-actions now accepts the already-declared exact Task selector: current session/member/read scope, resolved Project and same-project Task precede the projection, with final session/time guard after waits. Missing/foreign/denied Task targets share generic404; malformed or asserted selectors use400; authority failure uses503 with no cached allow. Echoed IDs match the resolved target; output contains no grant IDs/reasons, title, revision or reusable authority token. Cache-Control remains no-store.

Production Task scopes currently advertise getAllowedActions and getTask. Even explicitly granted mutation actions stay absent until their actual handlers are registered. The shared projection prepares independent mutation/history action filtering and Backlog-only edit context; tests supplying a synthetic future registry exercise projection rules, not fake HTTP handlers. Every future write/committed replay still needs its own current read/action check. Existing global/project callers, creation/read routes and member-removal producers remain compatible.

## Actual verification

Node24.21.0 and pinned image with actual PostgreSQL17.10; random disposable fixtures only. Exact source/image/fixture IDs are in raw logs and [cleanup observations](../evidence/p03c/fixture-cleanup.json). The two diagnostic fixture container/volume pairs are absent after tests. No development migration or global Docker cleanup.

- New010 authority/discovery suite: **13/13**.
- Final combined new authority, historical009 backlog-author, project HTTP and010 storage regressions: **43/43**,0 failures/skips.
- Workspace typecheck: exit0. First typecheck found optional resolved-ID typing; its raw error is preserved and code was corrected without weakening checks.
- Context syntax/check/tests: **45/45**; contract tests: **27/27**; docs tests: **20/20**; metadata sync/check/lint exit0.

Actual assertions include private issue/revoke/no-op/stale/provenance, rejected disabled/nonmember/unknown target, runtime denial, private-audit persistence rollback, real removal/rejoin and both actual grant/removal lock orderings, private CLI state/failure/recovery information, exact live Task selector/status/schema/no-store, synthetic future filtering without handler claims, failure at the actual capability lookup, and session expiry during an observed real Project lock wait. Two lock orderings here are grant versus removal, not unimplemented Task assignment versus removal.

[Execution manifest](../evidence/p03c/executions.json) names exact commands/exits and all attempts; [final checks](../evidence/p03c/checks.json) record source preservation, hashes, local targets and whitespace. No old fixture/test expectation, migration001–010, OpenAPI/model/baseline/ADR, Task outcome/store, UI, dependency or root command changed. New source paths are the shared tasks/authority.ts and task-mutation-authority.test.mjs; existing edits are Project operator/CLI/discovery adapters, Task registered-read inventory and WORKSPACE-TASKS-01 v0.3 plus coordination/register metadata.

## Handoff and limits

P03C is complete for this bounded producer. Next P03D1 is the Backlog content-edit handler slice, with a separately refined brief for current-action checks, Backlog/revision/no-op/atomic audit/original-result/unknown-acknowledgement behaviour and meaningful HTTP tests. State/assignment/blocker/history producers, new mutation UI/browser, actual disabled-assignee validation and assignment/removal races, D-07 and actual SP-05 integration remain unimplemented/unrun. Discovery is an advisory snapshot and never permission to skip later checks. No complete SP-04/MVP, formal ADR adoption, independent acceptance, commit/push or deployment is claimed.
