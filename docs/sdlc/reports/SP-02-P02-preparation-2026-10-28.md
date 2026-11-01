# SP-02 bounded source/schema preparation

**Artifact ID:** SP02-P02-RESULT\
**Version/date:** 0.3 Draft · 1 November 2026\
**Status:** Six schema/harness preparation assertions passed; SP-02 application handlers verified: 0.\
**Inputs:** [FEAT-SP02-01](../../implementation/features/sp-02-project-membership/plan.md) (execution snapshot v0.1); [P01 review](../../implementation/features/sp-02-project-membership/p01-source-review.md) v0.1; Workspace contract v0.2.10; SP-02 (execution snapshot v0.5).\
**Trace:** SP-02.1; AC-02/03/38/39 preparation only; BR-01/10/14.

## Main merge and branch

31 October metadata-only clarification: the plan input above is the original 28 October execution snapshot, not the newer continuation. Commands, source captures, observed results and historical decision states below are unchanged; no historical test is rerun or relabelled as current evidence.

After explicit owner instruction, main was fast-forwarded/pushed from 93d2e7e to 52a10dd0bbdf76b173c2c2f387e6615def4312e9 and verified at origin. All nine retained P12 regression groups and six documentation/context groups passed; 94 non-scratch runnable input hashes were unchanged. A fresh docs:lint/context:check also passed. This does not close the existing formal ADR/deployment/D-07 release limits. New branch codex/sp-02-project-membership starts at that commit; unrelated local prompt/submodule/patch/scratch changes remain retained. No SP-02 commit/push occurred.

## Preparation result

The [recorded run](sp02-preparation-evidence/2026-10-28T05-45-58-932Z/result.json) retains Node 24.22.1, exact command, HEAD/branch/diff digest, stable before/after hashes and a source archive verified before capture. Node --test tests/workspace/sp02-contract-preparation.test.mjs passed 6/6, zero skipped/failed. An earlier console-only exploratory run also passed; only the recorded run is treated as frozen evidence.

Assertions use the existing non-mutating contract harness: exact CreateProject/AddMember inputs and forged authority extras, Project/Member output disclosure boundaries, real idempotency/removal-revision/paging declarations, unknown/internal allowed-operation names and observed schema limitations. The tests do not load new Fastify handlers or enforce current permissions and cannot demonstrate member removal, last-manager safety, account existence, audit, cursor/replay or DB races.

Two limitations are explicit: whitespace-only names satisfy minLength but must fail business validation, and integer schema shape does not ensure exact JavaScript-safe bigint transport. Other preparation findings include missing global authority storage/global audit representation and missing creator/time columns. Existing migrations remain untouched.

## Owner disposition and next step

The owner selected private audited explicit authority provisioning for D-03 in response to the concrete [decision proposal](../../implementation/features/sp-02-project-membership/decision-batch.md). Existing creator initial membership-manage/default deny/no role bypass/no restricted-read or rejoin inheritance remain binding. D-04's bounded existing discovery choice is still pending; no migration/schema or application permission mechanism is approved by these shape results.

Next is the bounded persistence/transaction/cursor/idempotency proposal and relevant owner dispositions before P03. FR-64 remains unselected optional work. No new dependency, migration, live DB write, external data, agent or Accepted ADR is added. The saved feature folder contains the parent plan and ten independently scoped task briefs registered under M-02/M-03 and PLAN-01 Month 1.

Documentation/context verification passed on Node 24.22.1: docs:lint, docs:test 20/20, context:lint, context:check, context:test 45/45 and metadata --check 66 outputs. Exact logs are retained with the preparation run; pre-flight scope, trace, pending authority/schema gates and preserved unrelated work were rechecked before reporting. These checks add no SP-02 runtime or permission pass.

1 November metadata note: original SP-02 v0.5 is explicitly an execution snapshot; all original captures and measured results remain unchanged.
