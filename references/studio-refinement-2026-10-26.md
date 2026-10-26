# Studio work-screen refinement

**Artifact ID:** UI-REFINE-01
**Version/date:** 0.1 Draft · 26 October 2026
**Status:** Owner-requested refinement of the selected Studio direction; author verification only.
**Inputs:** UX-BLUEPRINT-01 v1.4; UI-REF-01 v0.5; UI-STUDIO-01 v0.1; owner comparison of three UI variants.
**Trace:** BR-01/02/03/10/13; SC-01/03/06/08; SP-03–05 presentation groundwork.

## Decision and implementation

Keep the selected Studio identity and all work/source features. The owner's written comparison supplies the refinement brief; the green variant is not adopted as a new theme. Existing Hallmark guidance is subordinate to the owner's explicit request for card depth and state markers. No new visual-lead draw, framework, provider or API is introduced.

- Page headings and the product wordmark retain Hedvig. Column headings, Sprint labels and working-panel headings use Geist for scanning. Keep the orange action and the “Work has a backstory” copy.
- Restore grey/blue/green column markers alongside the existing state labels. Colour is redundant information, never the only state indicator.
- Add light card surfaces, a subtle shadow, restrained type badges and fewer structural rules. Dark mode uses a corresponding raised card surface. Keep the columns visibly separate.
- Show the actual latest open blocker note, escaped as text. Resolved notes and older reasons do not become a current callout; absent current note uses the existing generic open-blocker label. No new reason is invented.
- Remove the orange button's permanent inset outline. Real keyboard focus remains on controls and on the keyboard-scrollable Board region. Remove the browser's outline on the programmatically focused noninteractive main landmark.
- Darken light-mode secondary text to #394F5C and metadata to #435B69, and raise card/footnote metadata to 12px. Contrast tests include both card and column surfaces in light/dark modes.
- At 1200px and below, the Board uses three minimum-width columns in one horizontally scrollable region. At 390px, each column is 280px; they never wrap into extra rows. The region is labelled, keyboard focusable and uses proximity snapping. Task details retain their existing phone single-pane behaviour.
- Fix inherited invalid `var(--surface)-space` declarations back to `white-space`. The preceding stylesheet token conversion had accidentally changed this property name. Source identifiers, no-wrap controls and wrapping prose now use valid CSS again.

Source count, assignee filter, Complete Sprint, blocker history and exact-source opening are retained. No arbitrary navigation count, priority, hidden-source hint or unimplemented action is introduced.

## Verification

Node 24.22.1: `npm --prefix apps/web test` passed **18/18**. The added behavioural test verifies retained source/filter/Sprint controls, the latest blocker reason, escaped hostile markup, and removal of the callout on resolution. Light/dark token contrast assertions retain their thresholds (text >=4.5:1; tested focus/control pairs >=3:1) and now cover the new card/column surfaces. These are local preview results, not live handler or permission evidence.

Fresh browser observations:

| View / check | Result |
| --- | --- |
| [Desktop 1440 × 900](studio-refinement-desktop-2026-10-26.png) | Source indicators, assignee filter, Complete Sprint and actual blocker reason visible; columns use Geist; resting primary and main outlines are `none` |
| [Dark Board](studio-refinement-dark-2026-10-26.png) | Raised cards, labels and callout retain legibility and selected identity |
| [Phone initial position](studio-refinement-mobile-2026-10-26.png) | All three columns share top 542.9px; widths 280px; region width 343px, content 872px; page width 375px within viewport 390px |
| [Phone scrolled to Done](studio-refinement-mobile-done-2026-10-26.png) | Real keyboard right-arrow input moved region to scrollLeft 528.8px; Done reached left 75.2px; only the Board scrolls horizontally |

The extra black square described in an older screenshot was not reproduced in the fresh captures. No unrelated SVG/control was removed to conceal it. The main-landmark outline was reproduced from programmatic focus and explicitly corrected; control focus remains visible.

Unrun: touch-device hardware, axe, colour-vision simulation, assistive technology, 200% zoom, full independent usability/accessibility acceptance, live session/permission/concurrency, contracts/storage/provider/evaluation suites. Structural documentation results follow after verification. No commit or push is included in this request. Pre-flight/reporting checklist reviewed; no accepted ADR, BRD, contract or service rule changed. Earlier Studio/selection reports remain historical evidence.

Final structural verification: docs:lint passed for 20 diagram pairs / 35 manifest artifacts; docs:test passed 20/20; changed tracked-file whitespace check passed. UI tests remain 18/18 as recorded above. No claim of full accessibility or live application correctness is added.
