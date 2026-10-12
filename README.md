# Scrum Workspace and AI Project KMS

Solo capstone, target five months. This repository currently contains draft requirements/design/contracts, bounded feature specs, a directory scaffold and a dependency-free context harness. It does not yet run the application.

Start with [agent entry](AGENTS.md), [five-month MoSCoW plan](docs/planning/five-month-plan.md), [architecture](docs/architecture.md), [contracts](contracts/README.md) and [feature specs](specs/README.md). The [artifact register](docs/sdlc/artifact-register.md) records status and owner decisions.

## First implementation order

1. SP-01 sessions → SP-02 project membership → SP-03 create task → SP-04 update/blockers. Capture business audit from the first mutation.
2. Fixed Sprint lifecycle, restricted sources/versions and links/keyword fallback.
3. One provider pipeline with exact citations/operational observations and real revocation/failure tests.
4. Pilot/evaluation, then reserve Month 5 for regressions, report and demo.

## Reproduce the context checks

Use Node 24 or later and initialize the pinned checklist submodule:

```sh
git clone --recurse-submodules https://github.com/900M100CK/scrum-workspace-KMS-ai.git
cd scrum-workspace-KMS-ai
npm run context:lint
npm run context:check
npm run context:test
```

For an existing clean checkout, run `git submodule update --init --recursive` first. No npm install is needed for these dependency-free scripts. GitHub Actions checks out submodules before running the same commands on Node 24.

The upstream checklist commit stores templates at its root. Uncommitted grouped directories in a developer's nested working tree are not CI inputs; see the [template guide](agents/template-guide.md).

The application stack/store/provider ADRs are Proposed. Acceptance criteria and MoSCoW deferrals remain explicit drafts. Context checks are not API conformance, application security or retrieval evidence. See [evaluation plan](eval/README.md) for the 25 synthetic reference cases.

## Reproduce documentation checks

Run `npm ci`, then `npm run docs:lint` and `npm run docs:test` on Node 24+. Development-only dependencies are pinned in the lockfile; the context commands above remain dependency-free. CI runs both harnesses. Sources, native Draw.io pairs and current versions are registered in [diagram manifest](docs/sdlc/diagrams/manifest.json). Update both representations and both current-version tables together. Unsupported types require an explicit adapter; historical snapshots remain intact. The docs:sync-permissions command regenerates only the two permission layouts with ELK; inspect renders after regeneration. These checks do not prove UI accessibility, permission enforcement or factual support.
