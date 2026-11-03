# Web application foundation

React 19.3.1, Vite 8.3.5 and TypeScript 6.0.3 are initialised under the owner's 27 October framework instruction. The React entry now implements real session sign-in/current-session/sign-out through the Workspace proxy. Bounded project/member and Task creation/read UI is now connected; document/AI and later Task mutations remain unimplemented. Vite uses its native TS/JSX transform; no React compiler/refresh plugin, styling framework or auth dependency was added for this foundation.

The existing UI/UX was preserved in [design/prototype](../../design/prototype/README.md). Its soft-green visual system, layout, interactions, fonts and tests are the design reference for subsequent product work; the new application does not silently claim those synthetic operations are live.

Use Node 24+ and run `npm ci` from the root. Then:

| Root command | Purpose |
| --- | --- |
| `npm run dev:web` | Vite on http://127.0.0.1:5173 |
| `npm run typecheck` | Check all three application packages |
| `npm run build` | Build web and both services |
| `npm run test:foundation` | React entry and service foundation tests |
| `npm run preview --workspace @sacw/web` | Serve built web on http://127.0.0.1:4174 |

P07 adds opt-in [local HTTPS and the same-origin /api proxy](LOCAL-HTTPS.md) to Workspace; P11 adds session integration while project/document permissions remain future work. Do not call Knowledge/internal endpoints directly from the browser. Never put server secrets into Vite client environment variables. Built output is ignored. Schema/health/component/proxy checks are foundation evidence, not SP-01 or permission acceptance.

## P11 session UI

Use the [HTTPS setup](LOCAL-HTTPS.md), explicit Workspace runtime configuration and privately provisioned test accounts. The UI calls only /api/session with same-origin credentials and the selected request header. Passwords/tokens are never stored in browser storage. Checking, logout, expiry and dependency failures remove session-dependent UI; stale requests cannot restore it. There is no automatic mutation retry. An uncertain sign-in/out offers explicit current-session checking; it does not claim success. A local expiry timer hides UI only, while server expiry/current authority remain authoritative. Focus, pageshow, visibility return and navigation trigger current-session checks without background idle renewal.

Run npm run test:session:ui for actual React DOM against Workspace/PostgreSQL through trusted-client HTTPS; its cookie jar is simulated and is not browser cookie acceptance. npm run test:foundation includes controller/SSR tests. Actual browser evidence is recorded separately in the [P11 result](../../docs/sdlc/reports/SP-01-P11-ui-2026-10-28.md). The prototype stays unchanged as synthetic design reference. No project capability is granted by the UI session.

## Projects and membership — 1 November 2026

The existing green workspace view now uses live same-origin project/member/action APIs. Only current membership projects and minimal member IDs/descriptive roles/revisions are shown. Explicit actions remain advisory; each request checks server authority. Removal has an explicit confirmation and uses the displayed revision. Unknown mutation results retain one actor-bound pending request in tab session storage for original-key reconciliation, including after reload; no credential/token/fetched protected list is stored. Confirmed sign-out clears it; expiry hides the UI. npm run test:projects includes controller and live DOM/HTTPS checks; the separate project-browser suite uses an installed runner and owner-trusted TLS. See the [runbook](../../services/workspace/PROJECTS.md) and [execution report](../../docs/sdlc/reports/SP-02-execution-2026-10-31.md).

## SP-03 Task creation and current reads — 2 November 2026

See [Task operations](../../services/workspace/TASKS.md) and the registered SP-03 handoff for createTask/listTasks/getTask, current project authority, exact Backlog positions, immutable server time and original-key recovery. Prior foundation/stage notes above are historical. No role/creator auto-grant, public permission editor, Task mutation/Sprint/Knowledge handler or startup migration is added. Only disposable 009 is verified; existing 006/008 suites keep their ceilings. Browser acceptance is a separate installed-runner gate; local source changes are not automatically committed/published.
