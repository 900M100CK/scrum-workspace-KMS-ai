# Framework foundation execution result

**Artifact ID:** INIT-FRAMEWORK-RESULT\
**Version/date:** 0.2 Draft · 27 October 2026\
**Status:** Local foundation checks passed; source published on main and synchronised to the feature branch. Protected business handlers verified: 0.\
**Inputs:** [INIT-FRAMEWORK-01](../../implementation/features/framework-foundation/plan.md) v0.2; [OWNER-FRAMEWORK-01](../../planning/framework-foundation-owner-2026-10-27.md) v0.1; package/lockfile and new workspace sources; ADR-0003 v0.2, Proposed ADR-0024/0025.\
**Trace:** M-01 / SP-01 preparation; BR-01/10; SC-06 relevance, not accepted domain coverage.\
**Owner role:** Sequential implementer; no independent acceptance.

## Change and verified scope

Root npm workspaces now contain the React/Vite/TypeScript web app, two independently owned Fastify/TypeScript service packages and the preserved design prototype. TypeScript 6.0.3 builds and typechecks the foundation; React/react-dom 19.3.1, Vite 8.3.5 and Fastify 5.12.7 are exact direct package pins. Node 24.22.1 is the verification runtime. The root React 18 Excalidraw tooling is retained; app React 19 resolves separately.

Existing apps/web synthetic UI was moved to design/prototype without redesign. Sixteen original source/test/font/license files matched HEAD at the previous paths, with only Git text line-ending conversion normalised; binary hashes matched. Prototype package name and run-guide metadata were intentionally updated. Application and design navigation/commands are now separate. No migration, database image, contract operation or provider setting changed.

The actual React component is transformed by Vite in its test. Both services build to JavaScript, have explicit localhost startup/port validation and expose infrastructure GET /healthz only; unknown routes and unimplemented protected endpoints return generic 404. Startup liveness is not auth, database, provider or guard readiness. No ORM, pg, session/cookie/CSRF/KDF, AI, Tailwind or React compiler plugin was added. The wider session/validator/transaction gates are still open.

## Actual verification

Commands below ran from the repository root. Node 24.22.1 and the installed npm CLI were invoked explicitly for the final npm ci and root verification; PATH also selected Node 24 for script children.

| Check | Result / evidence boundary |
| --- | --- |
| `npm ci --no-audit --no-fund` | Passed from committed-shape root lockfile; exact installed tuple reproducible locally |
| `npm run typecheck` | Passed for web, Workspace and Knowledge |
| `npm run build` | Passed web production bundle and both compiled services; compiled imports resolve |
| `npm run test:foundation` | 7/7: one actual React/Vite component test plus three tests per service, including real localhost HTTP, generic unknown route and port handling |
| `npm run test:prototype` | 20/20 synthetic UI/static-server/contrast regressions |
| Built executable HTTP smoke | Two compiled service server entries served expected liveness and generic /session 404; Vite preview served built HTML and JS asset, all task-owned children stopped afterwards |
| `npm run context:lint`, `context:check`, `context:test` | Passed; 45/45 tests; 69 active requirements, 60 Must, 66 declared domain operations and 13 specs unchanged |
| `npm run contracts:test` | 26/26 schema/byte checks; not protected handler enforcement |
| `npm run docs:lint`, `docs:test` | 20 diagram pairs / 35 manifest artifacts and 20/20 doc tests; metadata/links separately checked before commit |

CI now runs the typecheck/build/foundation/prototype/contract commands after existing docs/context checks on Node 24. A local CI-equivalent check is not a claim that GitHub Actions already passed remotely.

## Failed attempts and corrections

The first npm install used the system npm launcher on Node 22 and emitted the existing >=24 engine warning. Installation completed; the reproducibility check was repeated by invoking npm through Node 24.22.1 and passed. The first prototype run had 19 passes and a loopback EACCES failure; it passed 20/20 with loopback execution permission and tests were not weakened. The initial built-frontend smoke assumed Vite was hoisted to the root and exited before readiness; package-local resolution was corrected and real compiled HTTP smoke then passed with no child errors.

The first feature checkpoint push was rejected by automatic approval review because the destination had not been confirmed for project source/plans. The owner explicitly confirmed the configured GitHub repository afterwards. Publication must still be reported by actual subsequent Git command results; this local verification report does not claim an unexecuted push.

## Remaining gates and handoff

No session/authentication, permission authority, guarded transport, actual pg transactions, database integration, provider/retrieval/evaluation, product UI port or deployment acceptance was run. Framework smoke cannot close SP-01 or ADR-0024/0025. SP01-P01 should reconcile the selected installed scaffold; later tasks keep their domain decisions and real negative/concurrency/DB/UI requirements.

Checkpoint 7113a82 preserved the feature plan/task/rules before main setup. Framework source/lockfile and the initial report were committed as 5b00fce on main, pushed normally to the confirmed origin, and fast-forwarded/pushed onto the feature branch. Publish no unrelated scratch patches, copied agents/checklists, secrets, node_modules/dist or pre-existing submodule edits. Record final commit/remote facts in the plan after actual completion.

**Checklist:** Author-verified foundation only; unrun protected/domain tests explicit; source publication observed. **Handoff:** completed publication, then the SP-01 feature's next bounded task. No independent review or application acceptance claimed.

## Actual publication — 27 October 2026

Main and origin/main reached 5b00fcecbec4e23dbbccda67d182f7d6d214c615 after the successful normal push. feature/sp-01-session-foundation was then fast-forwarded from checkpoint 7113a82 to that source commit and pushed; Git confirmed matching local/remote source identities. Revision 0.2 records these executed facts. Final documentation metadata is committed/pushed through main and fast-forwarded again; it changes no tested framework source. GitHub Actions outcome is not claimed by local verification. Unrelated scratch files and the pre-existing checklist submodule modification remain local and uncommitted.
