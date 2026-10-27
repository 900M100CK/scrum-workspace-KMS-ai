# Design and prototype reference

The owner-selected soft-green UI is preserved in [prototype/](prototype/README.md), including its original CSS, fonts, synthetic interactions, tests and allowlisted local preview server. Run `npm run dev:prototype` and open http://127.0.0.1:4173. `npm run test:prototype` checks this synthetic design reference.

The [React application](../apps/web/README.md) and two service packages are a separate foundation. Reuse the prototype's UI/UX during feature implementation; synthetic controls, fixture identity and local permission simulations must not be presented as live behaviour. Requirements/wireframes remain canonical under docs/ux and docs/sdlc; this folder does not replace them.
