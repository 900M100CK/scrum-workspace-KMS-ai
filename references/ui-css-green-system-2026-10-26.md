# Soft green CSS system refinement

**Artifact ID:** UI-CSS-01\
**Version/date:** 0.1 Draft · 26 October 2026\
**Status:** Implemented in synthetic preview; independent and runtime acceptance remain open.\
**Inputs:** Owner's current CSS refinement request; UX-BLUEPRINT-01 v1.4; UI-REF-01 v0.5; current apps/web working sources (uncommitted). Historical UI-REFINE-01 v0.1 and the later soft-green owner clarification retain their original evidence.\
**Trace:** Existing work UI in SP-03/SP-04, BR-01/02/03/10/13 and SC-01/03/06/08; no new requirement or service behaviour.\
**Owner role:** Sequential UI author.

## Decision and changes

Current visual direction is soft green, Hedvig for the wordmark and page titles, and Geist for work text. Orange Studio and neutral Taste remain historical experiments. The web README now states this direction once and labels historical records explicitly.

Tokens are consolidated into one light root and one dark override. Unused orange/proof tokens and scaffold aliases are removed. Shared styles are organized by component with responsive geometry at the end; status markers and card states each have one canonical definition. Base styles retain visible keyboard focus and reduced-motion support. No undefined CSS variable references were found in styles/base.

Light surfaces: workspace #FBFCF9, rail #E9F0E3, columns #E6EDDF, cards #FFFFFF, card borders #D3DFCA. Dark card borders are #3F5646. Surfaces establish hierarchy; columns need no additional shadow. Cards retain subtle depth and gain a small hover lift. Selection uses primary green, separately from keyboard focus. Working headings use Geist; page headings scale from 32 to 44px. Metadata has a 12px floor. The actual project context label stays readable sentence case rather than becoming a marketing eyebrow.

Readable source counts render as blue source chips. Existing denied/failure suppression is retained. Latest open blocker reasons retain their callout and gain a 3px warning edge. The Sprint strip includes a labelled native progress element, 4px high, showing Done/Total for the entire active Sprint. Filters do not change this denominator; local task state changes update it. Backlog, absent Sprint, empty, loading and unavailable scopes do not retain this progress display.

Empty columns show static copy. An empty unfiltered Done column says “Completed tasks appear here.” A populated column receives no filler or unsupported drag invitation. Narrow Board columns remain in a horizontal scroll region without wrapping. Source counts, assignee filtering and Complete Sprint stay available. Preview toolbar controls fit on one row below its label on phones.

## Verification

Node 24.22.1: `npm --prefix apps/web test` passed 20/20, including local interactions, static-server allowlist and light/dark contrast checks. Two new interaction tests cover Sprint progress/filter/state/scope and readable source chips/empty Done copy. The first restricted run passed 19/20; its loopback fetch was blocked by the execution environment (EACCES). The same server test passed with local network access. Existing contrast thresholds were preserved; light source-chip contrast and workspace/rail text combinations were added.

A source scan confirmed exactly one light block, one dark block, no undefined CSS variable references in styles/base, and no legacy proof/primary-edge tokens. Browser observations at 1440×900 confirmed the requested surface colours and 44px page heading. Card selection computed border #2D5142 and a 28% primary ring. The progress accessibility label was “1 of 5 Sprint tasks done”. Desktop and dark screenshots were visually inspected. At 390×844 and 768×1024, all three column tops aligned; the Board overflowed horizontally inside its region while the document remained within the viewport. The viewport override was reset.

- [Desktop screenshot](green-system-desktop-2026-10-26.png)
- [Dark screenshot](green-system-dark-2026-10-26.png)
- [Phone screenshot](green-system-mobile-2026-10-26.png)

Documentation/context checks passed with Node 24.22.1: docs:lint (20 diagram pairs / 35 manifest artifacts), docs:test 20/20, context:lint, context:check and context:test 45/45. Generated metadata checked 66 outputs; only the diagram README register-version table changed. git diff --check passed. These are structural checks and synthetic UI observations, with zero live application handler behaviours verified. Full accessibility/screen-reader, touch hardware, usability, live permission, contract, storage, provider and evaluation checks were not run. No backend, dependency, accepted ADR, framework or scope change. No commit/push.

## Checklist and handoff

Pass: requested presentation cleanup, preserved local controls, explicit source/scope states, meaningful progress regression tests and current design statement. Gap: independent accessibility/usability and live integration evidence. N/A: new service/contract approval because no such change is introduced. Ready for downstream UI iteration with these gaps; this author report is not independent approval.
