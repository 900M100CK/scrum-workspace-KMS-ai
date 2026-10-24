# Palette trial — 24 October 2026

Owner request: try alternative colours using [the supplied colour-system cases](../tests/color-system-test-cases.md). This is a local presentation experiment supporting the existing work UI, with no requirement, API or permission changes. The existing layout and typography are retained; no new visual lead, dependency or framework is introduced.

The preview toolbar now offers Indigo (default), Teal, Terracotta and Neutral. It changes primary actions, hover/focus, selected navigation/task styling and canvas tint without replacing the DOM or clearing open task/form state. Selection lasts through navigation and resets to Indigo on reload. Work states remain fixed: blue information, green Done, amber warning and red Blocked, with text labels retained. Strong control borders replace low-contrast boundaries. No AI gradient is added because there is no AI screen in this bounded preview.

| Palette | Primary | Hover | Browser evidence |
| --- | --- | --- | --- |
| Indigo | #4F46E5 | #4338CA | [Board](palette-indigo.png) |
| Teal | #0F766E | #115E59 | [Board](palette-teal.png) |
| Terracotta | #9A3412 | #7C2D12 | [Board](palette-terracotta.png) |
| Neutral | #202225 | #363A40 | [Board](palette-neutral.png) |

Verification: Node 24.22.1, `npm --prefix apps/web test`, **17/17 passed**. Two colour tests read actual CSS token declarations: text pairs >=4.5:1, focus/control pairs >=3:1 and known-bad colours absent. A DOM interaction test verifies palette changes retain the open task and unsubmitted blocker note. Existing 14 UI/static-server tests still pass. Four palettes were inspected on the rendered Board; Indigo was restored for handoff. The rendered 1280px Board had no horizontal overflow. Initial browser connection was refused because the preview server had stopped; restarting the loopback server restored access. The browser-generated error page itself was unavailable under URL policy and was not inspected or bypassed.

This is partial coverage of the supplied cases. Dark mode, axe, colour-vision simulation, outdoor hardware, 200% zoom and full TC-01–12 acceptance were not run. Dashboard/AI are not implemented; no coverage of those screens is claimed. Token contrast does not certify all rendered accessibility or any live application permission behaviour. No accepted ADR/BRD, contract or owner test-case document changed; no commit. Pre-flight/reporting checklist reviewed for this bounded reversible presentation change.

Rollback: on 24 October 2026 the owner requested the previous version. The palette selector, CSS overrides and experiment-only tests were removed; the prior achromatic-ledger UI was restored. The screenshots and results above are historical experiment evidence, not the current interface.
