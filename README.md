# Scrum Workspace and AI Project KMS

Solo capstone, target five months. This repository currently contains draft requirements/design/contracts, bounded feature specs, a directory scaffold and a dependency-free context harness. It does not yet run the application.

Start with [agent entry](AGENTS.md), [five-month MoSCoW plan](docs/planning/five-month-plan.md), [architecture](docs/architecture.md), [contracts](contracts/README.md) and [feature specs](specs/README.md). The [artifact register](docs/sdlc/artifact-register.md) records status and owner decisions.

## First implementation order

1. SP-01 sessions → SP-02 project membership → SP-03 create task → SP-04 update/blockers. Capture business audit from the first mutation.
2. Fixed Sprint lifecycle, restricted sources/versions and links/keyword fallback.
3. One provider pipeline with exact citations/operational observations and real revocation/failure tests.
4. Pilot/evaluation, then reserve Month 5 for regressions, report and demo.

Node 24+ context commands: npm run context:lint, npm run context:check and npm run context:test. No npm install is needed for these current scripts. The GitHub Actions workflow is an unexecuted local configuration until a repository is hosted; no remote was created or pushed.

The application stack/store/provider ADRs are Proposed. Acceptance criteria and MoSCoW deferrals remain explicit drafts. Context checks are not API conformance, application security or retrieval evidence. See [evaluation plan](eval/README.md) for the 25 synthetic reference cases.
