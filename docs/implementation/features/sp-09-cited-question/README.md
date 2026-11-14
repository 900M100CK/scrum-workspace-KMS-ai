# SP-09 cited question

**Version/date:** 0.2 Draft · 13 November 2026

See the [registered plan](plan.md) for execution status, the [task breakdown](breakdown.md) for dependencies and the [dated handoff](../../../sdlc/reports/SP-09-fixture-handoff-2026-11-13.md) for review and next steps.


## Reproduce the fixture

Use Node 24, installed dependencies, Docker with the PostgreSQL image from the existing storage runbook, and the local TLS certificate/key from the [session HTTPS setup](../../../../services/workspace/SESSION-HTTP.md). Set NODE_EXTRA_CA_CERTS to the local certificate and SACW_PLAYWRIGHT_MODULE to the Playwright module URL for installed Microsoft Edge. Set SACW_TEST_EVIDENCE_DIR to an empty evidence directory to retain screenshots. Run:

```
node --test tests/workspace/sp09-runtime.test.mjs
```

The suite starts the loopback provider, both service entry points and isolated PostgreSQL containers, seeds fixture documents and embeddings, and cleans up after the run. To review the browser scenario, open Ask in the synthetic project, ask “At what hour can we arrive?”, open S1, and inspect its exact passage. The provider-outage scenario switches to Search and finds the same source through the keyword path.

The standard Workspace entry point enables fixture generation only when SACW_SP09_FIXTURE_PROVIDER_URL points to an explicit HTTP endpoint at 127.0.0.1 with path /generate. The ordinary Workspace and Knowledge configuration is still required. The fixture configuration indexes a predefined English corpus. Keep fixture questions and source data synthetic.


## Reconcile an unresolved handoff

The Workspace claim identity is the project UUID followed by the manifest UUID, separated by a colon. Match that manifest UUID to the Knowledge immutable receipt and its outcomes. Compare the Workspace claim fence with the Knowledge enforcement reference and review transport observations for the matching destination. A missing Workspace terminal outcome keeps the project's fixture handoffs blocked across restart. Preserve the original claim and records. A terminal outcome requires independently established completion or confirmed abort for that fence. Leave inconclusive records quarantined. The runtime test adds an abort observation only when its deterministic stop confirms both the original gateway exit and absence of protected output.
