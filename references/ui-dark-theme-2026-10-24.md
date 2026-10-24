# Dark theme and Board separation

**Artifact ID:** UI-THEME-01
**Version/date:** 0.1 Draft · 24 October 2026
**Status:** Owner-requested local preview implementation; author observations only.
**Inputs:** UX-WF-EX-01 v0.1 frames 03/04/10; UX-BLUEPRINT-01 v1.3; UI-REF-01 v0.4; PRD-01 v0.9; existing work-preview implementation; Proposed ADR-0003.
**Trace:** BR-01/02/03/10/13; SC-01/03/06/08; SP-01–05 presentation groundwork.

## Purpose and design record

The owner requested clearer separation of To Do, In Progress and Done, followed by a dark theme and a reusable report record. Each column now has an inset, a pale surface, a thin border, rounded corners and a soft shadow in light mode. Dark mode retains the same separation through layered surfaces, borders and a darker shadow. This is an explicit owner-requested exception to the original Taste direction's flat resting surfaces. The existing layout, Geist typography and work semantics are retained; no new visual direction, framework or provider is selected.

The earlier four-palette experiment was reverted at the owner's request. Its [trial record](palette-trial-2026-10-24.md) and screenshots are historical, not the current design. The current modes are the restored neutral light appearance and the new neutral dark appearance.

## Theme behaviour

Use **Dark theme** in the preview toolbar; the native button exposes its on/off state with `aria-pressed`. Default is light. Theme stays selected during navigation and sign-out within the loaded preview; reload resets it to light. There is no preference persistence, external request or automatic system-theme detection.

Switching updates the document theme and browser theme colour without rebuilding the view, preserving the open task, focus and unsubmitted form content. A theme control remains available in unavailable/error shells; changing appearance does not restore hidden project data. Native form controls use the matching `color-scheme`.

The same dark tokens cover the project list and entry screen, navigation, Board columns/cards, Backlog and Sprint planning, task inspector, forms, buttons, disabled/hover/selected/focus states, notices, avatars and exact-source dialogs. States retain text labels as well as colour: blue progress, green completion, amber blocker/unknown attention, and red failure. No new status or AI gradient is added.

## Dark token reference

| Purpose | Token | Colour |
| --- | --- | --- |
| Canvas | `--ground` | #11151B |
| Column / secondary panel | `--column-bg` | #19212B |
| Card, form and dialog | `--surface` | #222A35 |
| Raised / selected | `--raised` / `--active` | #293340 / #344152 |
| Main / secondary / metadata text | `--text` / `--muted` / `--faint` | #EDF1F7 / #B7C2D2 / #AAB8CC |
| Structural / control boundary | `--border` / `--control` | #465364 / #8899AD |
| Primary button fill / ink | `--primary` / `--primary-ink` | #DCE5F2 / #172131 |
| Focus and progress | `--accent` / `--progress` | #8EBAFF |
| Completion | `--done` | #93D4AE |
| Warning foreground / background | `--warning` / `--warning-bg` | #F4C477 / #352B1D |
| Failure | `--negative` / `--danger` | #FFAAA3 |
| Source foreground / background | `--source-fg` / `--source-bg` | #BBD4FA / #273447 |

Structural borders separate surfaces; required form-control boundaries use the stronger control token. Main text and metadata were checked against canvas, card, column, raised and selected surfaces. This token check does not certify every rendered text pair or full accessibility compliance.

## Evidence for future reporting

| Check | Result / evidence |
| --- | --- |
| Local UI and server suite, Node 24.22.1 | 16/16 passed: original 14 tests, dark-token contrast and theme-state/content preservation |
| Text contrast | Automated dark token pairs >=4.5:1, including primary/hover, source, warning and avatar pairs |
| Focus/control/state-marker contrast | Automated token pairs >=3:1 on relevant dark surfaces |
| Desktop 1440 × 900 | [Board](ui-dark-board-2026-10-24.png) and [Backlog/Sprint planning](ui-dark-backlog-2026-10-24.png) visually inspected |
| Phone 390 × 844 | [Task inspector](ui-dark-mobile-2026-10-24.png), dark form background confirmed; page width 375px, no horizontal overflow |
| Exact-source overlay | [Source dialog](ui-dark-source-2026-10-24.png) inspected with dark surface, excerpt, metadata and controls |
| Prior column change | [Light Board separation](ui-column-shadows-2026-10-24.png); original light design retained |

Changes: `apps/web/styles.css`, `ui.mjs`, `index.html`, preview README, UI/theme tests, this record and reference/register metadata. No contract, accepted ADR, BRD, service, database or dependency changed. No commit or parallel agent. Checklist reviewed before implementation and reporting; this is bounded presentation work, with zero live application handler behaviours verified.

Unrun: axe, assistive-technology validation, colour-vision simulation, outdoor hardware, 200% zoom, full TC-01–12 acceptance, production persistence and independent usability/accessibility review. Documents/Search/AI/Audit remain deferred screens. Contract/storage/provider/evaluation suites were not rerun. Structural documentation results are recorded in the artifact register after verification. Handoff: use the screenshots, token table and explicitly bounded results in the capstone UI/UX report; do not label this independent acceptance or server permission evidence.

Final structural verification (Node 24.22.1): context:lint and context:check passed; context:test 45/45 and docs:test 18/18 passed. docs:lint passed for 20 diagram pairs / 35 manifest artifacts. Generated metadata check: 66 outputs, no drift. Changed tracked-file whitespace check passed. These structural results do not add live handler or independent acceptance evidence.
