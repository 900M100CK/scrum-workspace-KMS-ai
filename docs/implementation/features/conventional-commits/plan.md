# Conventional Commits project setup

**Artifact ID:** DEV-COMMITS-01\
**Version/date:** 0.1 Draft · 14 November 2026\
**Status:** Owner-requested repository tooling; hook enabled in the current clone.\
**Inputs:** AGENTS v1.16; development rules v1.14; [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/); [PLAN-01 v0.4, calendar and exit gates](../../../planning/five-month-plan.md#calendar-and-exit-gates); [M-05 roadmap](../../roadmap.md#conventional-commits-tooling--14-november-2026).\
**Trace:** Supports upcoming [SP-08 v0.4.3](../../../../specs/008-linked-keyword-search.md) / [IMPL-SP-08 v0.1](../../tasks/08-linked-keyword-search.md) delivery hygiene. No product FR/AC/BR/SC change, new product child, data migration or application evidence.

Add an English commit convention and a dependency-free, opt-in Git hook that checks new commit subjects. Retain scopes used by the project and preserve the existing agent identity and attribution rules. Git-generated merge subjects have a tooling exception. No history rewrite, release automation, CI gate or remote action.

Repository tooling owns this work: `AGENTS.md`, `docs/development-rules.md`, `package.json`, `scripts/commit-message.mjs`, this plan folder and the required parent registers. Hook setup uses only the repository's default Git hook directory, refuses to overwrite an existing hook or override a custom hooks path, and skips older checkouts without the validator. Failed validation aborts the commit without echoing its message. No service authority, permissions, citations or evidence formats change.

| Task | Outcome | Status / result |
| --- | --- | --- |
| [CC-01](tasks/cc-01-integrate.md) | Document the convention and wire local validation | Rules and setup command added; `npm run commits:setup` succeeded and the installed hook was read back. |
| [CC-02](tasks/cc-02-verify.md) | Verify acceptance, rejection and actual hook dispatch | Disposable Git for Windows repository: valid scoped and unscoped commits, breaking marker/trailers and default merge passed; malformed commits and a comment-only message were rejected. Repeat setup, custom hooks path refusal and existing-hook preservation passed. Node 24.22.1: context lint/check/test and docs lint passed after synchronizing generated and linked register version references. |

Handoff: existing checkouts sharing this Git directory can use the installed hook when the validator is present; new clones run `npm run commits:setup`. PR/CI enforcement and application runtime suites were not run.
