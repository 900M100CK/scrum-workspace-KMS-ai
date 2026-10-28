# Web application foundation

React 19.3.1, Vite 8.3.5 and TypeScript 6.0.3 are initialised under the owner's 27 October framework instruction. The React entry now implements real session sign-in/current-session/sign-out through the Workspace proxy. Project, document and AI operations remain unimplemented. Vite uses its native TS/JSX transform; no React compiler/refresh plugin, styling framework or auth dependency was added for this foundation.

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
