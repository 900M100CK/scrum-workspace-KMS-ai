# Shared frontend and backend framework foundation

**Artifact ID:** INIT-FRAMEWORK-01\
**Version/date:** 0.2 Draft · 27 October 2026\
**Status:** Foundation verified and published; no session or protected business behaviour accepted.\
**Inputs:** TECH-STACK-01 v1.5 candidate inventory; ADR-0003 foundation selection; Proposed ADR-0024/0025; owner request in this chat to initialise frameworks on main, preserve UI as design/prototype, push to the confirmed GitHub remote and bring main back to the feature branch.\
**Trace:** Preparation for SP-01/BR-01/10/SC-06 and future service slices, not executed AC coverage.\
**Planning mode:** Unavailable; saved written planning gate applies.\
**Owner role:** Sequential implementer. **Work kind:** feature foundation.

## Scope and parent registration

Parent: [PLAN-01 Month 1](../../../planning/five-month-plan.md#calendar-and-exit-gates), [M-01 roadmap](../../roadmap.md), [SP-01 saved plan](../sp-01-session-foundation/plan.md). Register: [work index](../README.md), [source register](../../register.md), [central register](../../../sdlc/artifact-register.md).

The owner authorised framework initialisation following tech-stack.md, keeping the existing UI/UX under design/prototype, and confirmed https://github.com/900M100CK/scrum-workspace-KMS-ai as the destination for plans and source code. Record actual versions/tests before describing them as tested. Framework scaffolding does not accept session policy, guarded handoffs, application SQL or provider choice. No credential, database, registration or protected handler is implemented by this task.

Coordinated allowed paths for this foundation: root package.json/package-lock.json and build config, apps/web/**, services/workspace/**, services/knowledge/**, design/**, .github/workflows/context.yml, root/documentation instructions and registered planning/status sources. This owner-directed shared foundation is separate from SP-01 handler allowed paths. Preserve unrelated patch/checklist/agent copies and submodule edits. No destructive storage action, automatic secret publication, provider call or redesign.

## Task status and evidence

| Task | Outcome / acceptance | Dependency | Status / result |
| --- | --- | --- | --- |
| [INIT-01](tasks/INIT-01-preserve-and-register.md) | Commit feature documents; main uses saved shared plan; prototype move retains files/tests and actual current links | Owner authorisation | Verified; checkpoint 7113a82 and preserved 16 source/font/test files; result linked below |
| [INIT-02](tasks/INIT-02-scaffold.md) | Exact framework tuple, separate web/two-service packages, runnable dev/typecheck/build/test, no protected domain handlers | INIT-01; actual registry/compatibility | Verified; local evidence in result below |
| [INIT-03](tasks/INIT-03-verify-and-document.md) | Fresh-lock install, frontend production build/served response, real service HTTP smoke and failure/unknown-route checks, preserved prototype and context/docs/contracts checks | INIT-02 | Verified; local evidence in result below |
| [INIT-04](tasks/INIT-04-publish-and-sync.md) | Commit verified main, normal push to confirmed origin, bring main into feature without losing checkpoint; record hashes and remaining gaps | INIT-03 and confirmed remote authorisation | Verified; main and feature synced/pushed at 5b00fce; final metadata follows |

Exact candidate selection follows npm metadata and supported compatibility on the actual Node 24 runtime. Keep the root documentation tools' React dependency distinct from app React. Styling uses existing design direction; Tailwind is optional and not selected just for init. A simple React entry is the new application foundation, while the old interactive synthetic UI stays runnable in design/prototype; porting product UI into real handlers is later feature work.

## Verification and stop conditions

Use actual installed root scripts, not invented commands. New workspace commands are recorded when files exist. Typecheck/build each package and smoke real listening servers as well as in-process tests. Existing synthetic prototype tests and schema/context checks remain separate from framework smoke. Add checks to CI only when verified. No shape/health test closes SP-01, permission or storage acceptance.

Stop only affected publication on unresolved destination approval or failing checks; keep local work and report exact failure. A non-fast-forward push uses ordinary integration after inspecting remote history, never force push. Root manifests/lockfile and package-specific versions must agree. Preserve failed checks and source identities in the registered result; no private credentials or raw data are included.

## Handoff

After completion, SP01-P01 reconciles its inventory with the selected scaffold; HTTP/DB/session compatibility and identity decisions remain separate gates. Framework selection is bounded to verified scaffolding; D-02 and D-07 stay open. Record result and commit hashes under this plan and the central register before handing back the feature branch.

## Actual local result

[INIT-FRAMEWORK-RESULT v0.2](../../../sdlc/reports/framework-foundation-2026-10-27.md) records exact packages, typecheck/build, 7 foundation tests, 20 prototype tests, actual built HTTP smoke and existing context/docs/contracts checks. INIT-04 completed: source commit 5b00fce was pushed on main and fast-forwarded/pushed to feature/sp-01-session-foundation. No protected business handler is verified.

## Publication record

Feature checkpoint 7113a82 saved plan/task work. Main source commit 5b00fcecbec4e23dbbccda67d182f7d6d214c615 was pushed to the confirmed origin; the feature then fast-forwarded to it and was pushed. No force push, storage mutation or domain implementation occurred. Revision 0.2 records this actual handoff; final metadata is synchronised by the same normal main-to-feature workflow.
