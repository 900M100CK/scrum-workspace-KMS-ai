# Web application foundation

React 19.3.1, Vite 8.3.5 and TypeScript 6.0.3 are initialised under the owner's 27 October framework instruction. The minimal React entry renders an honest pending sign-in state. No session, project, document or AI API integration is implemented. Vite uses its native TS/JSX transform; no React compiler/refresh plugin, styling framework or auth dependency was added for this foundation.

The existing UI/UX was preserved in [design/prototype](../../design/prototype/README.md). Its soft-green visual system, layout, interactions, fonts and tests are the design reference for subsequent product work; the new application does not silently claim those synthetic operations are live.

Use Node 24+ and run `npm ci` from the root. Then:

| Root command | Purpose |
| --- | --- |
| `npm run dev:web` | Vite on http://127.0.0.1:5173 |
| `npm run typecheck` | Check all three application packages |
| `npm run build` | Build web and both services |
| `npm run test:foundation` | React entry and service foundation tests |
| `npm run preview --workspace @sacw/web` | Serve built web on http://127.0.0.1:4174 |

Workspace same-origin integration and permissions are future slice work; do not call Knowledge/internal endpoints directly from the browser. Never put server secrets into Vite client environment variables. Built output is ignored. Schema/health/component checks are foundation evidence, not SP-01 or permission acceptance.
